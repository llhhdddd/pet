"""
认证接口
"""
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.utils.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings

router = APIRouter()


class RegisterRequest(BaseModel):
    """注册请求"""
    username: str
    password: str
    email: str
    role: str = "student"  # teacher or student


class LoginRequest(BaseModel):
    """登录请求"""
    username: str
    password: str


class TokenResponse(BaseModel):
    """令牌响应"""
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    """用户响应"""
    id: int
    username: str
    email: str
    role: str
    
    class Config:
        from_attributes = True


@router.post("/register", response_model=UserResponse)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """用户注册"""
    # TODO: 实现用户注册逻辑
    pass


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """用户登录"""
    # TODO: 实现用户登录逻辑
    pass
