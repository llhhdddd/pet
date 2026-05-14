from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.pets import router as pets_router
from app.api.v1.interactions import router as interactions_router
from app.api.v1.tasks import router as tasks_router
from app.db.session import get_db
from app.settings import settings

app = FastAPI(
    title="宠物养成模块 API",
    description="小组学习陪伴宠物系统 - 宠物养成模块后端API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pets_router, prefix="/api/v1", tags=["pets"])
app.include_router(interactions_router, prefix="/api/v1", tags=["interactions"])
app.include_router(tasks_router, prefix="/api/v1", tags=["tasks"])

@app.get("/")
async def root():
    return {"message": "宠物养成模块 API 运行中"}

@app.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    return {"status": "healthy", "database": "connected"}