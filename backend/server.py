from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from sqlalchemy import select
from auth import hash_password
from config import settings
from database import AsyncSessionLocal, init_db
from models import AdminUser
from rate_limit import limiter
from routers import admin, chat, leads

async def ensure_default_admin():
    async with AsyncSessionLocal() as session:
        existing = (await session.execute(select(AdminUser).where(AdminUser.username == settings.ADMIN_USERNAME))).scalar_one_or_none()
        if not existing:
            session.add(AdminUser(username=settings.ADMIN_USERNAME, password_hash=hash_password(settings.ADMIN_PASSWORD)))
            await session.commit()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    await ensure_default_admin()
    yield

app = FastAPI(title="Nexus AI Lead System", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(chat.router)
app.include_router(leads.router)
app.include_router(admin.router)

@app.get("/")
def read_root():
    return {"Status": "API Gateway is Live!"}
