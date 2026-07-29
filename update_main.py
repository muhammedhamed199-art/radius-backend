import re

with open('backend-reference/main.py', 'r') as f:
    content = f.read()

# Import RadCheck
content = content.replace('from models import Reseller, Nas', 'from models import Reseller, Nas, RadCheck')

schemas = """
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
"""
content = content.replace('# --- وظائف الأمان (Security Utils) ---', schemas + '\n# --- وظائف الأمان (Security Utils) ---')


api_endpoints = """

@app.post("/api/users", response_model=UserResponse)
async def create_user(user: UserCreate, current_user: Reseller = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    \"\"\"
    إضافة مشترك شبكة جديد (PPPoE / Hotspot)
    \"\"\"
    # التحقق من عدم تكرار اسم المستخدم
    result = await db.execute(select(RadCheck).where(RadCheck.username == user.username))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="اسم المستخدم موجود مسبقاً")
        
    db_user = RadCheck(
        username=user.username,
        attribute='Cleartext-Password',
        op='==',
        value=user.password,
        reseller_id=current_user.id # 🟢 عزل: المشترك يتبع هذا الموزع فقط
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

@app.get("/api/users", response_model=List[UserResponse])
async def get_users(current_user: Reseller = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    \"\"\"
    جلب جميع المشتركين التابعين للموزع الحالي فقط
    \"\"\"
    # 🟢 عزل: إرجاع المشتركين المرتبطين بـ reseller_id للموزع الذي طلب الـ API
    result = await db.execute(select(RadCheck).where(RadCheck.reseller_id == current_user.id))
    return result.scalars().all()

"""

content += api_endpoints

with open('backend-reference/main.py', 'w') as f:
    f.write(content)
