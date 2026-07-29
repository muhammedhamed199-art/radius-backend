import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from main import app, get_db, pwd_context
from database import Base
from models import Reseller, RadCheck

# 1. Setup In-Memory SQLite for Testing
SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///:memory:"
engine = create_async_engine(SQLALCHEMY_DATABASE_URL, echo=False)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=AsyncSession)

async def override_get_db():
    async with TestingSessionLocal() as session:
        yield session

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

async def setup_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with TestingSessionLocal() as db:
        # Create distributors
        distributor_1 = Reseller(id=1, username="suleiman", password_hash=pwd_context.hash("123"), role="distributor")
        distributor_2 = Reseller(id=2, username="raed", password_hash=pwd_context.hash("123"), role="distributor")
        
        # Create super admin
        admin = Reseller(id=3, username="admin", password_hash=pwd_context.hash("123"), role="super_admin")
        
        db.add_all([distributor_1, distributor_2, admin])
        await db.commit()
        
        # Create Subscribers (RadCheck)
        sub_suleiman = RadCheck(id=1, username="sub_suleiman", value="pass", reseller_id=1)
        sub_raed = RadCheck(id=2, username="sub_raed", value="pass", reseller_id=2)
        db.add_all([sub_suleiman, sub_raed])
        await db.commit()

async def run_tests():
    await setup_db()
    
    print("🧪 Running Data Isolation Tests...\n")
    
    # Test 1: Distributor 1 (suleiman) should only see their own subscribers
    print("--- Test 1: Distributor Data Isolation (List) ---")
    res1 = client.post("/api/login", data={"username": "suleiman", "password": "123"})
    token1 = res1.json()["access_token"]
    
    response = client.get("/api/users", headers={"Authorization": f"Bearer {token1}"})
    users = response.json()
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    assert len(users) == 1, f"Expected 1 user, got {len(users)}"
    assert users[0]["username"] == "sub_suleiman", "Data leak detected!"
    print("✅ Passed: 'suleiman' only sees his own subscribers.\n")

    # Test 2: Distributor 1 tries to fetch Distributor 2's subscriber by ID
    print("--- Test 2: Unauthorized Resource Access (Single ID) ---")
    response_unauth = client.get("/api/users/2", headers={"Authorization": f"Bearer {token1}"})
    
    assert response_unauth.status_code == 403, f"Expected 403 Forbidden, got {response_unauth.status_code}"
    assert "حظر أمني" in response_unauth.json()["detail"], "Expected security block message"
    print("✅ Passed: 'suleiman' is blocked (403 Forbidden) from accessing 'raed's subscriber.\n")

    # Test 3: Super Admin should see all subscribers
    print("--- Test 3: Super Admin Full Access ---")
    res_admin = client.post("/api/login", data={"username": "admin", "password": "123"})
    token_admin = res_admin.json()["access_token"]
    
    response_admin = client.get("/api/users", headers={"Authorization": f"Bearer {token_admin}"})
    all_users = response_admin.json()
    
    assert response_admin.status_code == 200
    assert len(all_users) == 2, f"Expected 2 users, got {len(all_users)}"
    print("✅ Passed: 'admin' can see all subscribers without restrictions.\n")

    print("🎉 All isolation tests passed successfully!")

if __name__ == "__main__":
    asyncio.run(run_tests())
