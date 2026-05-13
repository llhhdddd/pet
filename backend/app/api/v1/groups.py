"""
小组管理接口
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, field_validator
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.models import Group, User, Class, GroupMember, Pet
from app.api.deps import get_current_teacher, get_current_active_user

router = APIRouter()


class GroupCreateRequest(BaseModel):
    """创建小组请求"""
    class_id: int
    name: str
    
    @field_validator('name')
    def validate_name(cls, v):
        if len(v) < 1 or len(v) > 50:
            raise ValueError("小组名称长度必须在1-50之间")
        return v


class GroupUpdateRequest(BaseModel):
    """更新小组请求"""
    name: Optional[str] = None


class GroupResponse(BaseModel):
    """小组响应"""
    id: int
    class_id: int
    class_name: str
    name: str
    pet_id: Optional[int]
    pet_name: Optional[str]
    gold_balance: float
    growth_value: int
    health_value: int
    member_count: int
    created_at: str
    
    class Config:
        from_attributes = True


class GroupMemberResponse(BaseModel):
    """小组成员响应"""
    id: int
    user_id: int
    username: str
    email: str
    contribution: float
    joined_at: str
    
    class Config:
        from_attributes = True


@router.get("/", response_model=List[GroupResponse])
def get_groups(
    class_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取小组列表"""
    query = db.query(Group)
    
    if class_id:
        query = query.filter(Group.class_id == class_id)
    
    if current_user.role == "teacher":
        # 教师查看自己班级的小组
        classes = db.query(Class).filter(Class.teacher_id == current_user.id).all()
        class_ids = [c.id for c in classes]
        query = query.filter(Group.class_id.in_(class_ids))
    else:
        # 学生查看自己所在的小组
        member_groups = db.query(GroupMember.group_id).filter(
            GroupMember.user_id == current_user.id
        ).subquery()
        query = query.filter(Group.id.in_(member_groups))
    
    groups = query.all()
    result = []
    
    for group in groups:
        class_ = db.query(Class).filter(Class.id == group.class_id).first()
        pet = db.query(Pet).filter(Pet.id == group.pet_id).first()
        member_count = db.query(GroupMember).filter(GroupMember.group_id == group.id).count()
        
        result.append({
            "id": group.id,
            "class_id": group.class_id,
            "class_name": class_.name if class_ else "",
            "name": group.name,
            "pet_id": group.pet_id,
            "pet_name": pet.name if pet else None,
            "gold_balance": group.gold_balance,
            "growth_value": group.growth_value,
            "health_value": group.health_value,
            "member_count": member_count,
            "created_at": str(group.created_at)
        })
    
    return result


@router.get("/{group_id}", response_model=GroupResponse)
def get_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取小组详情"""
    group = db.query(Group).filter(Group.id == group_id).first()
    
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="小组不存在"
        )
    
    # 验证权限
    if current_user.role == "teacher":
        class_ = db.query(Class).filter(Class.id == group.class_id).first()
        if not class_ or class_.teacher_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="无权访问该小组"
            )
    else:
        is_member = db.query(GroupMember).filter(
            GroupMember.group_id == group_id,
            GroupMember.user_id == current_user.id
        ).first()
        if not is_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="您不是该小组成员"
            )
    
    class_ = db.query(Class).filter(Class.id == group.class_id).first()
    pet = db.query(Pet).filter(Pet.id == group.pet_id).first()
    member_count = db.query(GroupMember).filter(GroupMember.group_id == group.id).count()
    
    return {
        "id": group.id,
        "class_id": group.class_id,
        "class_name": class_.name if class_ else "",
        "name": group.name,
        "pet_id": group.pet_id,
        "pet_name": pet.name if pet else None,
        "gold_balance": group.gold_balance,
        "growth_value": group.growth_value,
        "health_value": group.health_value,
        "member_count": member_count,
        "created_at": str(group.created_at)
    }


@router.post("/", response_model=GroupResponse, status_code=status.HTTP_201_CREATED)
def create_group(
    request: GroupCreateRequest,
    db: Session = Depends(get_db),
    current_teacher: User = Depends(get_current_teacher)
):
    """创建小组（教师权限）"""
    # 验证班级是否存在且属于当前教师
    class_ = db.query(Class).filter(Class.id == request.class_id).first()
    
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
    
    # 创建小组
    group = Group(
        class_id=request.class_id,
        name=request.name,
        gold_balance=0.0,
        growth_value=0,
        health_value=100
    )
    
    db.add(group)
    db.commit()
    db.refresh(group)
    
    return {
        "id": group.id,
        "class_id": group.class_id,
        "class_name": class_.name,
        "name": group.name,
        "pet_id": group.pet_id,
        "pet_name": None,
        "gold_balance": group.gold_balance,
        "growth_value": group.growth_value,
        "health_value": group.health_value,
        "member_count": 0,
        "created_at": str(group.created_at)
    }


@router.put("/{group_id}", response_model=GroupResponse)
def update_group(
    group_id: int,
    request: GroupUpdateRequest,
    db: Session = Depends(get_db),
    current_teacher: User = Depends(get_current_teacher)
):
    """更新小组信息（教师权限）"""
    group = db.query(Group).filter(Group.id == group_id).first()
    
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="小组不存在"
        )
    
    class_ = db.query(Class).filter(Class.id == group.class_id).first()
    if not class_ or class_.teacher_id != current_teacher.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="您不是该班级的创建者"
        )
    
    if request.name:
        group.name = request.name
    
    db.commit()
    db.refresh(group)
    
    pet = db.query(Pet).filter(Pet.id == group.pet_id).first()
    member_count = db.query(GroupMember).filter(GroupMember.group_id == group.id).count()
    
    return {
        "id": group.id,
        "class_id": group.class_id,
        "class_name": class_.name,
        "name": group.name,
        "pet_id": group.pet_id,
        "pet_name": pet.name if pet else None,
        "gold_balance": group.gold_balance,
        "growth_value": group.growth_value,
        "health_value": group.health_value,
        "member_count": member_count,
        "created_at": str(group.created_at)
    }


@router.delete("/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_teacher: User = Depends(get_current_teacher)
):
    """删除小组（教师权限）"""
    group = db.query(Group).filter(Group.id == group_id).first()
    
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="小组不存在"
        )
    
    class_ = db.query(Class).filter(Class.id == group.class_id).first()
    if not class_ or class_.teacher_id != current_teacher.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="您不是该班级的创建者"
        )
    
    db.delete(group)
    db.commit()
    
    return None


@router.get("/{group_id}/members", response_model=List[GroupMemberResponse])
def get_group_members(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取小组成员列表"""
    group = db.query(Group).filter(Group.id == group_id).first()
    
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="小组不存在"
        )
    
    # 验证权限
    if current_user.role == "teacher":
        class_ = db.query(Class).filter(Class.id == group.class_id).first()
        if not class_ or class_.teacher_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="无权访问该小组"
            )
    else:
        is_member = db.query(GroupMember).filter(
            GroupMember.group_id == group_id,
            GroupMember.user_id == current_user.id
        ).first()
        if not is_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="您不是该小组成员"
            )
    
    members = db.query(GroupMember).filter(GroupMember.group_id == group_id).all()
    result = []
    
    for member in members:
        user = db.query(User).filter(User.id == member.user_id).first()
        result.append({
            "id": member.id,
            "user_id": member.user_id,
            "username": user.username if user else "",
            "email": user.email if user else "",
            "contribution": member.contribution,
            "joined_at": str(member.created_at)
        })
    
    return result


@router.post("/{group_id}/members/{user_id}")
def add_member(
    group_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_teacher: User = Depends(get_current_teacher)
):
    """添加成员到小组（教师权限）"""
    group = db.query(Group).filter(Group.id == group_id).first()
    
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="小组不存在"
        )
    
    class_ = db.query(Class).filter(Class.id == group.class_id).first()
    if not class_ or class_.teacher_id != current_teacher.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="您不是该班级的创建者"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    if user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="只有学生可以加入小组"
        )
    
    # 检查是否已在该小组
    existing_member = db.query(GroupMember).filter(
        GroupMember.group_id == group_id,
        GroupMember.user_id == user_id
    ).first()
    
    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该用户已在小组中"
        )
    
    member = GroupMember(
        group_id=group_id,
        user_id=user_id,
        contribution=0.0
    )
    
    db.add(member)
    db.commit()
    
    return {"message": "成功添加成员"}


@router.delete("/{group_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_member(
    group_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_teacher: User = Depends(get_current_teacher)
):
    """从小组移除成员（教师权限）"""
    member = db.query(GroupMember).filter(
        GroupMember.group_id == group_id,
        GroupMember.user_id == user_id
    ).first()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="成员不存在"
        )
    
    group = db.query(Group).filter(Group.id == group_id).first()
    class_ = db.query(Class).filter(Class.id == group.class_id).first()
    
    if not class_ or class_.teacher_id != current_teacher.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="您不是该班级的创建者"
        )
    
    db.delete(member)
    db.commit()
    
    return None
