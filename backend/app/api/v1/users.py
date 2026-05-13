"""
用户管理接口
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.models import User
from app.utils.security import get_password_hash
from app.api.deps import get_current_teacher

router = APIRouter()


class UserCreateRequest(BaseModel):
    """创建用户请求"""
    username: str
    password: str
    email: EmailStr
    role: str = "student"


class UserUpdateRequest(BaseModel):
    """更新用户请求"""
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class UserListResponse(BaseModel):
    """用户列表响应"""
    id: int
    username: str
    email: str
    role: str
    is_active: bool
    created_at: str
    
    class Config:
        from_attributes = True


@router.get("/", response_model=List[UserListResponse])
def get_users(
    role: Optional[str] = None,
    db: Session = Depends(get_db),
    current_teacher: User = Depends(get_current_teacher)
):
    """获取用户列表（教师权限）"""
    query = db.query(User)
    
    if role:
        query = query.filter(User.role == role)
    
    users = query.all()
    return users


@router.get("/{user_id}", response_model=UserListResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_teacher: User = Depends(get_current_teacher)
):
    """获取单个用户信息（教师权限）"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    return user


@router.post("/", response_model=UserListResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    request: UserCreateRequest,
    db: Session = Depends(get_db),
    current_teacher: User = Depends(get_current_teacher)
):
    """创建用户（教师权限）"""
    # 检查用户名是否已存在
    existing_user = db.query(User).filter(User.username == request.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户名已存在"
        )
    
    # 检查邮箱是否已存在
    existing_email = db.query(User).filter(User.email == request.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="邮箱已被注册"
        )
    
    # 创建用户
    hashed_password = get_password_hash(request.password)
    user = User(
        username=request.username,
        email=request.email,
        hashed_password=hashed_password,
        role=request.role,
        is_active=True,
        is_verified=True
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user


@router.put("/{user_id}", response_model=UserListResponse)
def update_user(
    user_id: int,
    request: UserUpdateRequest,
    db: Session = Depends(get_db),
    current_teacher: User = Depends(get_current_teacher)
):
    """更新用户信息（教师权限）"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    # 更新用户名
    if request.username and request.username != user.username:
        existing_user = db.query(User).filter(
            User.username == request.username,
            User.id != user_id
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="用户名已存在"
            )
        user.username = request.username
    
    # 更新邮箱
    if request.email and request.email != user.email:
        existing_email = db.query(User).filter(
            User.email == request.email,
            User.id != user_id
        ).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="邮箱已被使用"
            )
        user.email = request.email
    
    # 更新角色
    if request.role:
        if request.role not in ["teacher", "student"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="角色必须是 'teacher' 或 'student'"
            )
        user.role = request.role
    
    # 更新活跃状态
    if request.is_active is not None:
        user.is_active = request.is_active
    
    db.commit()
    db.refresh(user)
    
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_teacher: User = Depends(get_current_teacher)
):
    """删除用户（教师权限）"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    # 软删除
    user.is_active = False
    db.commit()
    
    return None
