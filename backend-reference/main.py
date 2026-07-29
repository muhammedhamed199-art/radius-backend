from fastapi import FastAPI, Depends, HTTPException, status, Security
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from passlib.context import CryptContext
from pydantic import BaseModel
from datetime import datetime, timedelta
import jwt

from database import get_db, engine, Base
from models import Reseller, Nas, RadCheck, RadAcct, RadReply

# --- الإعدادات الثابتة للأمان ---
SECRET_KEY = "SUPER_SECRET_JWT_KEY_CHANGE_ME"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440 # Token صالح لمدة يوم

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login")

app = FastAPI(title="Radius Controller Backend - Strict Data Isolation Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Schemas ---
class NasCreate(BaseModel):
    nasname: str
    shortname: str
    type: str = 'mikrotik'
    secret: str
    description: str = ''

class NasResponse(NasCreate):
    id: int
    reseller_id: int

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    attribute: str
    op: str
    value: str
    reseller_id: int

    class Config:
        from_attributes = True

# --- وظائف الأمان وإصدار التوكن (Security & Auth Utils) ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> Reseller:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="تعذر التحقق من بيانات الدخول (Token غير صالح أو منتهي الصلاحية)",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
        
    result = await db.execute(select(Reseller).where(Reseller.username == username))
    user = result.scalars().first()
    if user is None:
        raise credentials_exception
    return user

# --- 🔒 محرك العزل الصارم ومراقبة الصلاحيات (Strict Isolation & Security Scope) ---
class SecurityScope:
    def __init__(self, current_user: Reseller, db: AsyncSession):
        self.user = current_user
        self.db = db
        self.is_super_admin = (current_user.role in ['admin', 'super_admin'])

    def apply_reseller_filter(self, query, model_class):
        """
        قاعدة التخطي الأمني الإجبارية:
        إذا كان المستخدم Super Admin -> يتم إرجاع الاستعلام دون تصفية.
        إذا كان موزع / مدير -> يتم إضافة شرط WHERE reseller_id = current_user.id إجبارياً على مستوى DB Query.
        """
        if self.is_super_admin:
            return query
        
        # إجبار التصفية بـ reseller_id للموزعين والمديرين
        return query.where(model_class.reseller_id == self.user.id)

    async def verify_resource_ownership(self, model_class, resource_id: int, id_field_name: str = "id"):
        """
        حماية المسارات (Route & API Security):
        التحقق التام من ملكية السجل قبل العرض/التعديل/الحذف.
        إذا حاول موزع الوصول لـ ID لا يخصه، يعود السيرفر فوراً بـ 403 Forbidden.
        """
        stmt = select(model_class).where(getattr(model_class, id_field_name) == resource_id)
        if not self.is_super_admin:
            stmt = stmt.where(model_class.reseller_id == self.user.id)
            
        result = await self.db.execute(stmt)
        item = result.scalars().first()
        
        if not item:
            # إذا كان العنصر موجوداً بالأساس بالسيستم لكن يخص موزع آخر -> 403 Forbidden
            check_exist = await self.db.execute(select(model_class).where(getattr(model_class, id_field_name) == resource_id))
            if check_exist.scalars().first():
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="🛑 حظر أمني: غير مصرح لك بالوصول أو تعديل بيانات موزع آخر."
                )
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="العنصر المطلوب غير موجود."
            )
        return item

async def get_security_scope(
    current_user: Reseller = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> SecurityScope:
    return SecurityScope(current_user, db)

# --- API Endpoints مع العزل الصارم التام ---

@app.post("/api/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    import re
    raw_username = form_data.username or ""
    raw_password = form_data.password or ""
    
    # Clean username: remove zero-width spaces, non-breaking spaces, trailing/leading whitespace
    clean_username = re.sub(r'[\s\u200b\u200c\u200d\ufeff\xa0]+', '', raw_username).lower()
    clean_password = raw_password.strip()

    # Detailed debugging for Mobile / Console diagnostics
    print("\n" + "="*70)
    print("[LOGIN CONTROLLER DEBUG - MOBILE / BACKEND]")
    print(f"1. req.body / form_data username: '{raw_username}'")
    print(f"2. username.length (Raw): {len(raw_username)} | (Cleaned): {len(clean_username)}")
    print(f"3. Character Unicode Codes: {[ord(c) for c in raw_username]}")
    print(f"4. password.length (Raw): {len(raw_password)}")
    print("="*70)

    # 1. Search Distributors and Admins (Reseller table)
    result = await db.execute(select(Reseller).where(Reseller.username.ilike(clean_username)))
    user = result.scalars().first()
    
    if user:
        pass_matches = verify_password(clean_password, user.password_hash) or user.password_hash == clean_password
        print(f"[DEBUG LOG] Reseller user found in DB: id={user.id}, username='{user.username}', role='{user.role}', pass_matches={pass_matches}")
        if pass_matches:
            access_token = create_access_token(data={
                "sub": user.username,
                "reseller_id": user.id,
                "role": user.role
            })
            print(f"[DEBUG LOG SUCCESS] Login approved for Role='{user.role}'")
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "name": user.name,
                    "role": user.role
                }
            }
    else:
        print(f"[DEBUG LOG] No Reseller record found for clean_username='{clean_username}'")

    # 2. Search Subscribers (RadCheck table)
    rad_result = await db.execute(select(RadCheck).where(RadCheck.username.ilike(clean_username)))
    subscriber = rad_result.scalars().first()
    if subscriber:
        sub_pass_matches = (subscriber.value == clean_password or subscriber.value.lower() == clean_password.lower())
        print(f"[DEBUG LOG] Subscriber user found in DB: id={subscriber.id}, username='{subscriber.username}', pass_matches={sub_pass_matches}")
        if sub_pass_matches:
            access_token = create_access_token(data={
                "sub": subscriber.username,
                "reseller_id": subscriber.reseller_id,
                "role": "subscriber"
            })
            print(f"[DEBUG LOG SUCCESS] Login approved for Subscriber")
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "user": {
                    "id": subscriber.id,
                    "username": subscriber.username,
                    "name": subscriber.username,
                    "role": "subscriber"
                }
            }
    else:
        print(f"[DEBUG LOG] No Subscriber record found for clean_username='{clean_username}'")

    print(f"[DEBUG LOG FAIL] Authentication failed for username='{clean_username}'")
    print("="*70 + "\n")

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="اسم المستخدم أو كلمة المرور غير صحيحة",
        headers={"WWW-Authenticate": "Bearer"},
    )

# --- 1. إدارة أجهزة السيرفرات (NAS Devices) ---

@app.get("/api/nas", response_model=List[NasResponse])
async def get_nas_list(
    scope: SecurityScope = Depends(get_security_scope),
    db: AsyncSession = Depends(get_db)
):
    """
    جلب السيرفرات - مفلترة إجبارياً على مستوى الاستعلام برقم الموزع
    """
    stmt = select(Nas)
    stmt = scope.apply_reseller_filter(stmt, Nas)
    result = await db.execute(stmt)
    return result.scalars().all()

@app.get("/api/nas/{nas_id}", response_model=NasResponse)
async def get_nas_by_id(
    nas_id: int,
    scope: SecurityScope = Depends(get_security_scope)
):
    """
    عرض سيرفر محدد مع تحقق الملكية (403 Forbidden إذا كان يتبع موزع آخر)
    """
    nas = await scope.verify_resource_ownership(Nas, nas_id)
    return nas

@app.post("/api/nas", response_model=NasResponse)
async def create_nas(
    nas: NasCreate,
    scope: SecurityScope = Depends(get_security_scope),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Nas).where(Nas.nasname == nas.nasname))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="عنوان IP السيرفر مسجل مسبقاً")
        
    db_nas = Nas(
        nasname=nas.nasname,
        shortname=nas.shortname,
        type=nas.type,
        secret=nas.secret,
        description=nas.description,
        reseller_id=scope.user.id # 🟢 ربط أوتوماتيكي بالموزع الحالي
    )
    db.add(db_nas)
    await db.commit()
    await db.refresh(db_nas)
    return db_nas

@app.delete("/api/nas/{nas_id}")
async def delete_nas(
    nas_id: int,
    scope: SecurityScope = Depends(get_security_scope),
    db: AsyncSession = Depends(get_db)
):
    nas = await scope.verify_resource_ownership(Nas, nas_id)
    await db.delete(nas)
    await db.commit()
    return {"message": "تم حذف السيرفر بنجاح"}

# --- 2. إدارة المشتركين (Subscribers / RadCheck) ---

def get_isolated_subscribers_query(current_user: Reseller):
    """
    Middleware / Helper Function لضمان العزل الصارم للمشتركين.
    يعيد الاستعلام المفلتر بناءً على رتبة المستخدم.
    """
    if current_user.role in ['admin', 'super_admin']:
        # المسئول الأول يرى الجميع
        return select(RadCheck)
    elif current_user.role in ['distributor', 'manager']:
        # عزل صارم: الموزع يرى فقط مشتركيه (WHERE reseller_id = current_user.id)
        return select(RadCheck).where(RadCheck.reseller_id == current_user.id)
    else:
        # حظر أي رتبة أخرى
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="🛑 حظر أمني: ليس لديك صلاحية لعرض هذه البيانات."
        )

@app.get("/api/users", response_model=List[UserResponse])
async def get_users(
    current_user: Reseller = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    جلب قائمة المشتركين - مع تطبيق العزل الإجباري التام (Strict Data Isolation)
    """
    # استخدام الدالة المساعدة للحصول على الاستعلام المفلتر إجبارياً
    stmt = get_isolated_subscribers_query(current_user)
    
    result = await db.execute(stmt)
    return result.scalars().all()

@app.get("/api/users/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: int,
    current_user: Reseller = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    جلب بيانات مشترك محدد مع التحقق الصارم من الملكية
    """
    stmt = select(RadCheck).where(RadCheck.id == user_id)
    
    # تطبيق العزل للموزعين
    if current_user.role not in ['admin', 'super_admin']:
        stmt = stmt.where(RadCheck.reseller_id == current_user.id)
        
    result = await db.execute(stmt)
    user = result.scalars().first()
    
    if not user:
        # إذا كان المشترك موجوداً بالأساس لكنه يتبع موزعاً آخر، نرجع خطأ 403 بدلاً من 404
        check_exist = await db.execute(select(RadCheck).where(RadCheck.id == user_id))
        if check_exist.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="🛑 حظر أمني: هذا المشترك يتبع موزعاً آخر، لا يمكنك الوصول إليه."
            )
        raise HTTPException(status_code=404, detail="المشترك غير موجود.")
        
    return user

@app.post("/api/users", response_model=UserResponse)
async def create_user(
    user: UserCreate,
    scope: SecurityScope = Depends(get_security_scope),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(RadCheck).where(RadCheck.username == user.username))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="اسم المستخدم موجود مسبقاً")
        
    db_user = RadCheck(
        username=user.username,
        attribute='Cleartext-Password',
        op='==',
        value=user.password,
        reseller_id=scope.user.id # 🟢 إجباري: المشترك يتبع الموزع صاحب الطلب
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

@app.put("/api/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UserCreate,
    scope: SecurityScope = Depends(get_security_scope),
    db: AsyncSession = Depends(get_db)
):
    # تحقق من الملكية قبل التعديل
    db_user = await scope.verify_resource_ownership(RadCheck, user_id)
    db_user.username = user_data.username
    db_user.value = user_data.password
    await db.commit()
    await db.refresh(db_user)
    return db_user

@app.delete("/api/users/{user_id}")
async def delete_user(
    user_id: int,
    scope: SecurityScope = Depends(get_security_scope),
    db: AsyncSession = Depends(get_db)
):
    # تحقق من الملكية قبل الحذف
    db_user = await scope.verify_resource_ownership(RadCheck, user_id)
    await db.delete(db_user)
    await db.commit()
    return {"message": "تم حذف المشترك بنجاح"}

# --- 3. سجلات الجلسات والاستهلاك (RadAcct) ---

@app.get("/api/sessions")
async def get_active_sessions(
    scope: SecurityScope = Depends(get_security_scope),
    db: AsyncSession = Depends(get_db)
):
    """
    جلب الجلسات المفترضة بفلترة إجبارية للموزع
    """
    stmt = select(RadAcct)
    stmt = scope.apply_reseller_filter(stmt, RadAcct)
    result = await db.execute(stmt)
    return result.scalars().all()


