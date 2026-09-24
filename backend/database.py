import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from config import settings
from models import Base

engine = create_async_engine(settings.DATABASE_URL, pool_size=5, max_overflow=5, pool_pre_ping=True)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_session():
    async with AsyncSessionLocal() as session:
        yield session

async def init_db():
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        await conn.run_sync(Base.metadata.create_all)

def run_db_job(func, *args):
    async def _runner():
        job_engine = create_async_engine(settings.DATABASE_URL, pool_pre_ping=True)
        try:
            factory = async_sessionmaker(job_engine, expire_on_commit=False)
            async with factory() as session:
                return await func(session, *args)
        finally:
            await job_engine.dispose()
    return asyncio.run(_runner())
