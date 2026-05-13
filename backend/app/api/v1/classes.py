"""
班级管理接口
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, field_validator
from sqlalchemy.orm import Session
from typing import List, Optional
import random
import string

from app.core.database import get_db
from app.models import Class, User, Group, GroupMember, ClassNotification
from app.api.deps import get_current_teacher, get_current_active_user

router = APIRouter()


class ClassCreateRequest(BaseModel):
    """创建班级请求"""
    name: str
    
    @field_validator('name')
    def validate_name(cls, v):
        if len(v) < 1 or len(v) > 100:
            raise ValueError("班级名称长度必须在1-100之间")
        return v


class ClassUpdateRequest(BaseModel):
    """更新班级请求"""
    name: Optional[str] = None


class ClassResponse(BaseModel):
    """班级响应"""
    id: int
    name: str
    invite_code: str
    teacher_id: int
    teacher_name: str
    member_count: int
    created_at: str
    
    class Config:
        from_attributes = True


class ClassListResponse(BaseModel):
    """班级列表响应"""
    id: int
    name: str
    invite_code: str
    created_at: str
    
    class Config:
        from_attributes = True


def generate_invite_code(length: int = 8) -> str:
    """生成邀请码"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))


@router.get("/", response_model=List[ClassListResponse])
def get_classes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取班级列表"""
    if current_user.role == "teacher":
        # 教师查看自己创建的班级
        classes = db.query(Class).filter(Class.teacher_id == current_user.id).all()
    else:
        # 学生查看自己加入的班级
        classes = db.query(Class).join(
            Group, Class.id == Group.class_id
        ).join(
            GroupMember, Group.id == GroupMember.group_id
        ).filter(GroupMember.user_id == current_user.id).distinct().all()
    
    return classes


@router.get("/{class_id}", response_model=ClassResponse)
def get_class(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取班级详情"""
    class_ = db.query(Class).filter(Class.id == class_id).first()
    
    if not class_:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="班级不存在"
        )
    
    # 验证权限
    if current_user.role == "teacher":
        if class_.teacher_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="无权访问该班级"
            )
    else:
        is_member = db.query(GroupMember).join(
            Group, GroupMember.group_id == Group.id
        ).filter(
            Group.class_id == class_id,
            GroupMember.user_id == current_user.id
        ).first()
        if not is_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="您不是该班级成员"
            )
    
    # 获取成员数量
    member_count = db.query(GroupMember).join(
        Group, GroupMember.group_id == Group.id
    ).filter(Group.class_id == class_id).count()
    
    teacher = db.query(User).filter(User.id == class_.teacher_id).first()
    
    return {
        "id": class_.id,
        "name": class_.name,
        "invite_code": class_.invite_code,
        "teacher_id": class_.teacher_id,
        "teacher_name": teacher.username if teacher else "",
        "member_count": member_count,
        "created_at": str(class_.created_at)
    }


@router.post("/", response_model=ClassResponse, status_code=status.HTTP_201_CREATED)
def create_class(
    request: ClassCreateRequest,
    db: Session = Depends(get_db),
    current_teacher: User = Depends(get_current_teacher)
):
    """创建班级（教师权限）"""
    # 生成邀请码
    invite_code = generate_invite_code()
    
    # 确保邀请码唯一
    while db.query(Class).filter(Class.invite_code == invite_code).first():
        invite_code = generate_invite_code()
    
    class_ = Class(
        name=request.name,
        invite_code=invite_code,
        teacher_id=current_teacher.id
    )
    
    db.add(class_)
    db.commit()
    db.refresh(class_)
    
    return {
        "id": class_.id,
        "name": class_.name,
        "invite_code": class_.invite_code,
        "teacher_id": class_.teacher_id,
        "teacher_name": current_teacher.username,
        "member_count": 0,
        "created_at": str(class_.created_at)
    }


@router.put("/{class_id}", response_model=ClassResponse)
def update_class(
    class_id: int,
    request: ClassUpdateRequest,
    db: Session = Depends(get_db),
    current_teacher: User = Depends(get_current_teacher)
):
    """更新班级信息（教师权限）"""
    class_ = db.query(Class).filter(Class.id == class_id).first()
    
    if not class_:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="班级不存在"
        )
    
    if class_.teacher_id != current_teacher.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="您不是该班级的创建者"
        )
    
    if request.name:
        class_.name = request.name
    
    db.commit()
    db.refresh(class_)
    
    member_count = db.query(GroupMember).join(
        Group, GroupMember.group_id == Group.id
    ).filter(Group.class_id == class_id).count()
    
    return {
        "id": class_.id,
        "name": class_.name,
        "invite_code": class_.invite_code,
        "teacher_id": class_.teacher_id,
        "teacher_name": current_teacher.username,
        "member_count": member_count,
        "created_at": str(class_.created_at)
    }


@router.delete("/{class_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_class(
    class_id: int,
    db: Session = Depends(get_db),
    current_teacher: User = Depends(get_current_teacher)
):
    """删除班级（教师权限）"""
    class_ = db.query(Class).filter(Class.id == class_id).first()
    
    if not class_:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="班级不存在"
        )
    
    if class_.teacher_id != current_teacher.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="您不是该班级的创建者"
        )
    
    db.delete(class_)
    db.commit()
    
    return None


@router.post("/{class_id}/join")
def join_class(
    class_id: int,
    invite_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """加入班级"""
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只有学生可以加入班级"
        )
    
    class_ = db.query(Class).filter(Class.id == class_id).first()
    
    if not class_:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="班级不存在"
        )
    
    if class_.invite_code != invite_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="邀请码错误"
        )
    
    # 检查是否已加入
    is_member = db.query(GroupMember).join(
        Group, GroupMember.group_id == Group.id
    ).filter(
        Group.class_id == class_id,
        GroupMember.user_id == current_user.id
    ).first()
    
    if is_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="您已加入该班级"
        )
    
    # 如果没有小组，创建一个默认小组
    group = db.query(Group).filter(Group.class_id == class_id).first()
    
    if not group:
        # 创建一个名为"默认小组"的小组
        group = Group(
            class_id=class_id,
            name="默认小组",
            gold_balance=0.0,
            growth_value=0,
            health_value=100
        )
        db.add(group)
        db.commit()
        db.refresh(group)
    
    # 添加到小组
    member = GroupMember(
        group_id=group.id,
        user_id=current_user.id,
        contribution=0.0
    )
    db.add(member)
    db.commit()
    
    return {"message": "成功加入班级"}
