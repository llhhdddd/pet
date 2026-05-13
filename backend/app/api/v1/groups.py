"""
小组管理接口（李红蝶负责）
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, field_validator
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models import Group, User, Class, GroupMember, Pet, GoldTransaction
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
    pet_level: Optional[int]
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


class ContributionRecord(BaseModel):
    """贡献记录"""
    id: int
    user_id: int
    username: str
    amount: float
    source_type: str
    description: str
    created_at: str


class GroupStatsResponse(BaseModel):
    """小组统计响应"""
    group_id: int
    group_name: str
    total_gold_earned: float
    total_gold_spent: float
    avg_contribution: float
    top_contributor: str
    task_completion_rate: float


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
        classes = db.query(Class).filter(Class.teacher_id == current_user.id).all()
        class_ids = [c.id for c in classes]
        query = query.filter(Group.class_id.in_(class_ids))
    else:
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
            "pet_level": pet.level if pet else None,
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
        "pet_level": pet.level if pet else None,
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
        "pet_level": None,
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
        "pet_level": pet.level if pet else None,
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
    
    return {"message": "成功添加成员", "user_id": user_id, "username": user.username}


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


@router.post("/{group_id}/members/batch")
def add_members_batch(
    group_id: int,
    user_ids: List[int],
    db: Session = Depends(get_db),
    current_teacher: User = Depends(get_current_teacher)
):
    """批量添加成员到小组（教师权限）"""
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
    
    added_count = 0
    skipped_count = 0
    
    for user_id in user_ids:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            skipped_count += 1
            continue
        
        if user.role != "student":
            skipped_count += 1
            continue
        
        existing_member = db.query(GroupMember).filter(
            GroupMember.group_id == group_id,
            GroupMember.user_id == user_id
        ).first()
        
        if existing_member:
            skipped_count += 1
            continue
        
        member = GroupMember(
            group_id=group_id,
            user_id=user_id,
            contribution=0.0
        )
        db.add(member)
        added_count += 1
    
    db.commit()
    
    return {
        "message": "批量添加完成",
        "added": added_count,
        "skipped": skipped_count
    }


@router.get("/{group_id}/contributions", response_model=List[ContributionRecord])
def get_contribution_records(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取小组成员贡献记录"""
    group = db.query(Group).filter(Group.id == group_id).first()
    
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="小组不存在"
        )
    
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
    
    transactions = db.query(GoldTransaction).filter(
        GoldTransaction.group_id == group_id,
        GoldTransaction.transaction_type == "earn"
    ).order_by(GoldTransaction.created_at.desc()).all()
    
    result = []
    for transaction in transactions:
        user = db.query(User).filter(User.id == transaction.user_id).first()
        result.append({
            "id": transaction.id,
            "user_id": transaction.user_id,
            "username": user.username if user else "",
            "amount": transaction.amount,
            "source_type": transaction.source_type,
            "description": transaction.description,
            "created_at": str(transaction.created_at)
        })
    
    return result


@router.get("/{group_id}/statistics", response_model=GroupStatsResponse)
def get_group_statistics(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取小组统计信息"""
    group = db.query(Group).filter(Group.id == group_id).first()
    
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="小组不存在"
        )
    
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
    
    total_gold_earned = db.query(GoldTransaction).filter(
        GoldTransaction.group_id == group_id,
        GoldTransaction.transaction_type == "earn"
    ).with_entities(GoldTransaction.amount.sum()).scalar() or 0.0
    
    total_gold_spent = db.query(GoldTransaction).filter(
        GoldTransaction.group_id == group_id,
        GoldTransaction.transaction_type == "spend"
    ).with_entities(GoldTransaction.amount.sum()).scalar() or 0.0
    
    members = db.query(GroupMember).filter(GroupMember.group_id == group_id).all()
    total_contribution = sum(m.contribution for m in members) if members else 0.0
    avg_contribution = total_contribution / len(members) if members else 0.0
    
    top_contributor = ""
    if members:
        top_member = max(members, key=lambda x: x.contribution)
        user = db.query(User).filter(User.id == top_member.user_id).first()
        top_contributor = user.username if user else ""
    
    from app.models import Task, Submission
    
    tasks = db.query(Task).filter(Task.class_id == group.class_id).all()
    if tasks:
        completed_tasks = db.query(Submission).join(
            Task, Submission.task_id == Task.id
        ).filter(
            Task.class_id == group.class_id,
            Submission.status == "graded"
        ).count()
        task_completion_rate = (completed_tasks / len(tasks)) * 100
    else:
        task_completion_rate = 0.0
    
    return {
        "group_id": group.id,
        "group_name": group.name,
        "total_gold_earned": round(total_gold_earned, 2),
        "total_gold_spent": round(total_gold_spent, 2),
        "avg_contribution": round(avg_contribution, 2),
        "top_contributor": top_contributor,
        "task_completion_rate": round(task_completion_rate, 2)
    }


@router.get("/ranking")
def get_group_ranking(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取小组排行榜"""
    class_ = db.query(Class).filter(Class.id == class_id).first()
    
    if not class_:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="班级不存在"
        )
    
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
    
    groups = db.query(Group).filter(Group.class_id == class_id).all()
    
    ranking = []
    for group in groups:
        pet = db.query(Pet).filter(Pet.id == group.pet_id).first()
        member_count = db.query(GroupMember).filter(
            GroupMember.group_id == group.id
        ).count()
        
        total_contribution = db.query(GroupMember).filter(
            GroupMember.group_id == group.id
        ).with_entities(GroupMember.contribution.sum()).scalar() or 0.0
        
        ranking.append({
            "group_id": group.id,
            "group_name": group.name,
            "gold_balance": group.gold_balance,
            "growth_value": group.growth_value,
            "health_value": group.health_value,
            "pet_level": pet.level if pet else 0,
            "member_count": member_count,
            "total_contribution": round(total_contribution, 2)
        })
    
    ranking.sort(key=lambda x: x["gold_balance"], reverse=True)
    
    return {"class_id": class_id, "class_name": class_.name, "ranking": ranking}


@router.post("/{group_id}/transfer-members/{target_group_id}")
def transfer_members(
    group_id: int,
    target_group_id: int,
    user_ids: List[int],
    db: Session = Depends(get_db),
    current_teacher: User = Depends(get_current_teacher)
):
    """批量转移成员到其他小组（教师权限）"""
    source_group = db.query(Group).filter(Group.id == group_id).first()
    target_group = db.query(Group).filter(Group.id == target_group_id).first()
    
    if not source_group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="源小组不存在"
        )
    
    if not target_group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="目标小组不存在"
        )
    
    if source_group.class_id != target_group.class_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="两个小组必须属于同一个班级"
        )
    
    class_ = db.query(Class).filter(Class.id == source_group.class_id).first()
    if not class_ or class_.teacher_id != current_teacher.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="您不是该班级的创建者"
        )
    
    transferred_count = 0
    skipped_count = 0
    
    for user_id in user_ids:
        member = db.query(GroupMember).filter(
            GroupMember.group_id == group_id,
            GroupMember.user_id == user_id
        ).first()
        
        if not member:
            skipped_count += 1
            continue
        
        existing_in_target = db.query(GroupMember).filter(
            GroupMember.group_id == target_group_id,
            GroupMember.user_id == user_id
        ).first()
        
        if existing_in_target:
            skipped_count += 1
            continue
        
        member.group_id = target_group_id
        db.commit()
        transferred_count += 1
    
    return {
        "message": "成员转移完成",
        "transferred": transferred_count,
        "skipped": skipped_count
    }
