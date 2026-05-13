"""
班级管理接口（李红蝶负责）
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, field_validator, EmailStr
from sqlalchemy.orm import Session
from typing import List, Optional
import random
import string
from io import StringIO
import csv

from app.core.database import get_db
from app.models import Class, User, Group, GroupMember, ClassNotification
from app.api.deps import get_current_teacher, get_current_active_user
from app.utils.security import get_password_hash

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
    group_count: int
    created_at: str
    
    class Config:
        from_attributes = True


class ClassListResponse(BaseModel):
    """班级列表响应"""
    id: int
    name: str
    invite_code: str
    member_count: int
    created_at: str
    
    class Config:
        from_attributes = True


class StudentImportRequest(BaseModel):
    """批量导入学生请求"""
    students: List[dict]


class ClassStatisticsResponse(BaseModel):
    """班级统计响应"""
    class_id: int
    class_name: str
    total_students: int
    total_groups: int
    avg_group_gold: float
    avg_pet_level: float
    active_tasks: int
    completed_tasks: int


class ClassMemberResponse(BaseModel):
    """班级成员响应"""
    id: int
    username: str
    email: str
    role: str
    group_name: str
    contribution: float
    joined_at: str


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
        classes = db.query(Class).filter(Class.teacher_id == current_user.id).all()
    else:
        classes = db.query(Class).join(
            Group, Class.id == Group.class_id
        ).join(
            GroupMember, Group.id == GroupMember.group_id
        ).filter(GroupMember.user_id == current_user.id).distinct().all()
    
    result = []
    for class_ in classes:
        member_count = db.query(GroupMember).join(
            Group, GroupMember.group_id == Group.id
        ).filter(Group.class_id == class_.id).count()
        result.append({
            "id": class_.id,
            "name": class_.name,
            "invite_code": class_.invite_code,
            "member_count": member_count,
            "created_at": str(class_.created_at)
        })
    
    return result


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
    
    member_count = db.query(GroupMember).join(
        Group, GroupMember.group_id == Group.id
    ).filter(Group.class_id == class_id).count()
    
    group_count = db.query(Group).filter(Group.class_id == class_id).count()
    
    teacher = db.query(User).filter(User.id == class_.teacher_id).first()
    
    return {
        "id": class_.id,
        "name": class_.name,
        "invite_code": class_.invite_code,
        "teacher_id": class_.teacher_id,
        "teacher_name": teacher.username if teacher else "",
        "member_count": member_count,
        "group_count": group_count,
        "created_at": str(class_.created_at)
    }


@router.post("/", response_model=ClassResponse, status_code=status.HTTP_201_CREATED)
def create_class(
    request: ClassCreateRequest,
    db: Session = Depends(get_db),
    current_teacher: User = Depends(get_current_teacher)
):
    """创建班级（教师权限）"""
    invite_code = generate_invite_code()
    
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
        "group_count": 0,
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
    
    group_count = db.query(Group).filter(Group.class_id == class_id).count()
    
    return {
        "id": class_.id,
        "name": class_.name,
        "invite_code": class_.invite_code,
        "teacher_id": class_.teacher_id,
        "teacher_name": current_teacher.username,
        "member_count": member_count,
        "group_count": group_count,
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
    
    group = db.query(Group).filter(Group.class_id == class_id).first()
    
    if not group:
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
    
    member = GroupMember(
        group_id=group.id,
        user_id=current_user.id,
        contribution=0.0
    )
    db.add(member)
    db.commit()
    
    return {"message": "成功加入班级", "group_id": group.id, "group_name": group.name}


@router.post("/{class_id}/students/import")
def import_students(
    class_id: int,
    students: List[dict],
    db: Session = Depends(get_db),
    current_teacher: User = Depends(get_current_teacher)
):
    """批量导入学生（教师权限）"""
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
    
    created_count = 0
    skipped_count = 0
    
    for student_data in students:
        username = student_data.get("username")
        email = student_data.get("email")
        password = student_data.get("password", "123456")
        
        if not username or not email:
            continue
        
        existing_user = db.query(User).filter(
            (User.username == username) | (User.email == email)
        ).first()
        
        if existing_user:
            skipped_count += 1
            continue
        
        hashed_password = get_password_hash(password)
        user = User(
            username=username,
            email=email,
            hashed_password=hashed_password,
            role="student",
            is_active=True,
            is_verified=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        group = db.query(Group).filter(Group.class_id == class_id).first()
        if not group:
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
        
        member = GroupMember(
            group_id=group.id,
            user_id=user.id,
            contribution=0.0
        )
        db.add(member)
        db.commit()
        
        created_count += 1
    
    return {
        "message": "导入完成",
        "created": created_count,
        "skipped": skipped_count
    }


@router.get("/{class_id}/students", response_model=List[ClassMemberResponse])
def get_class_students(
    class_id: int,
    db: Session = Depends(get_db),
    current_teacher: User = Depends(get_current_teacher)
):
    """获取班级成员列表（教师权限）"""
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
    
    members = db.query(GroupMember).join(
        Group, GroupMember.group_id == Group.id
    ).filter(Group.class_id == class_id).all()
    
    result = []
    for member in members:
        user = db.query(User).filter(User.id == member.user_id).first()
        group = db.query(Group).filter(Group.id == member.group_id).first()
        result.append({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "group_name": group.name if group else "",
            "contribution": member.contribution,
            "joined_at": str(member.created_at)
        })
    
    return result


@router.get("/{class_id}/export")
def export_students(
    class_id: int,
    db: Session = Depends(get_db),
    current_teacher: User = Depends(get_current_teacher)
):
    """导出班级成员列表为CSV（教师权限）"""
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
    
    members = db.query(GroupMember).join(
        Group, GroupMember.group_id == Group.id
    ).filter(Group.class_id == class_id).all()
    
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["用户名", "邮箱", "角色", "小组", "贡献值", "加入时间"])
    
    for member in members:
        user = db.query(User).filter(User.id == member.user_id).first()
        group = db.query(Group).filter(Group.id == member.group_id).first()
        writer.writerow([
            user.username,
            user.email,
            user.role,
            group.name if group else "",
            member.contribution,
            member.created_at.strftime("%Y-%m-%d %H:%M:%S")
        ])
    
    return {"csv_content": output.getvalue()}


@router.get("/{class_id}/statistics", response_model=ClassStatisticsResponse)
def get_class_statistics(
    class_id: int,
    db: Session = Depends(get_db),
    current_teacher: User = Depends(get_current_teacher)
):
    """获取班级统计信息（教师权限）"""
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
    
    from app.models import Task, Submission, Pet
    
    total_students = db.query(GroupMember).join(
        Group, GroupMember.group_id == Group.id
    ).filter(Group.class_id == class_id).count()
    
    total_groups = db.query(Group).filter(Group.class_id == class_id).count()
    
    groups = db.query(Group).filter(Group.class_id == class_id).all()
    total_gold = sum(g.gold_balance for g in groups) if groups else 0
    avg_group_gold = total_gold / len(groups) if groups else 0
    
    pets = db.query(Pet).join(Group, Pet.id == Group.pet_id).filter(
        Group.class_id == class_id
    ).all()
    total_level = sum(p.level for p in pets) if pets else 0
    avg_pet_level = total_level / len(pets) if pets else 0
    
    active_tasks = db.query(Task).filter(
        Task.class_id == class_id,
        Task.status == "published"
    ).count()
    
    completed_tasks = db.query(Submission).join(
        Task, Submission.task_id == Task.id
    ).filter(
        Task.class_id == class_id,
        Submission.status == "graded"
    ).count()
    
    return {
        "class_id": class_id,
        "class_name": class_.name,
        "total_students": total_students,
        "total_groups": total_groups,
        "avg_group_gold": round(avg_group_gold, 2),
        "avg_pet_level": round(avg_pet_level, 2),
        "active_tasks": active_tasks,
        "completed_tasks": completed_tasks
    }


@router.post("/{class_id}/reset-invite-code")
def reset_invite_code(
    class_id: int,
    db: Session = Depends(get_db),
    current_teacher: User = Depends(get_current_teacher)
):
    """重置邀请码（教师权限）"""
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
    
    new_code = generate_invite_code()
    while db.query(Class).filter(Class.invite_code == new_code).first():
        new_code = generate_invite_code()
    
    old_code = class_.invite_code
    class_.invite_code = new_code
    db.commit()
    
    return {
        "message": "邀请码已重置",
        "old_invite_code": old_code,
        "new_invite_code": new_code
    }


@router.get("/{class_id}/ranking")
def get_class_ranking(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取班级小组排行榜"""
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
    
    from app.models import Pet
    
    groups = db.query(Group).filter(Group.class_id == class_id).all()
    
    ranking = []
    for group in groups:
        pet = db.query(Pet).filter(Pet.id == group.pet_id).first()
        member_count = db.query(GroupMember).filter(
            GroupMember.group_id == group.id
        ).count()
        
        ranking.append({
            "group_id": group.id,
            "group_name": group.name,
            "gold_balance": group.gold_balance,
            "growth_value": group.growth_value,
            "health_value": group.health_value,
            "pet_level": pet.level if pet else 0,
            "member_count": member_count
        })
    
    ranking.sort(key=lambda x: x["gold_balance"], reverse=True)
    
    return {"ranking": ranking}
