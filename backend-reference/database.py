import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# قم بتغيير هذه الإعدادات حسب قاعدة البيانات الخاصة بك (مثلاً MySQL)
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+aiomysql://root:password@localhost/radius")

# إنشاء محرك قاعدة البيانات بصلاحية غير متزامنة (Async) لضمان أداء عالي مع FastAPI
engine = create_async_engine(DATABASE_URL, echo=True)

# إنشاء جلسة قاعدة البيانات
SessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()

# دالة لفتح وإغلاق الاتصال بقاعدة البيانات لكل طلب API (Dependency Injection)
async def get_db():
    async with SessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
