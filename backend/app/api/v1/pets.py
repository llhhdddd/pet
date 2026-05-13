"""
宠物养成接口（刘桂芹负责）
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, field_validator
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.models import Pet, Group, User, GroupMember, PetPrivilege, ShopItem
from app.api.deps import get_current_active_user

router = APIRouter()


class PetCreateRequest(BaseModel):
    """创建宠物请求"""
    group_id: int
    name: str
    type: str = "cat"
    
    @field_validator('name')
    def validate_name(cls, v):
        if len(v) < 1 or len(v) > 50:
            raise ValueError("宠物名称长度必须在1-50之间")
        return v
    
    @field_validator('type')
    def validate_type(cls, v):
        valid_types = ["cat", "dog", "rabbit", "panda", "penguin"]
        if v not in valid_types:
            raise ValueError(f"宠物类型必须是 {', '.join(valid_types)} 之一")
        return v


class PetResponse(BaseModel):
    """宠物响应"""
    id: int
    name: str
    type: str
    level: int
    image_url: Optional[str]
    growth_threshold: int
    current_growth: int
    health_value: int
    group_id: int
    group_name: str
    privileges: List[dict]
    
    class Config:
        from_attributes = True


@router.get("/", response_model=List[PetResponse])
def get_pets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取宠物列表"""
    if current_user.role == "teacher":
        # 教师查看自己班级的宠物
        pets = db.query(Pet).join(
            Group, Pet.id == Group.pet_id
        ).join(
            User, Group.class_id == User.id
        ).filter(User.id == current_user.id).all()
    else:
        # 学生查看自己小组的宠物
        pets = db.query(Pet).join(
            Group, Pet.id == Group.pet_id
        ).join(
            GroupMember, Group.id == GroupMember.group_id
        ).filter(GroupMember.user_id == current_user.id).all()
    
    result = []
    for pet in pets:
        group = db.query(Group).filter(Group.pet_id == pet.id).first()
        privileges = db.query(PetPrivilege).filter(
            PetPrivilege.pet_id == pet.id
        ).all()
        
        privilege_list = []
        for p in privileges:
            privilege_list.append({
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "unlock_level": p.unlock_level
            })
        
        result.append({
            "id": pet.id,
            "name": pet.name,
            "type": pet.type,
            "level": pet.level,
            "image_url": pet.image_url,
            "growth_threshold": pet.growth_threshold,
            "current_growth": group.growth_value if group else 0,
            "health_value": group.health_value if group else 100,
            "group_id": group.id if group else 0,
            "group_name": group.name if group else "",
            "privileges": privilege_list
        })
    
    return result


@router.get("/{pet_id}", response_model=PetResponse)
def get_pet(
    pet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取宠物详情"""
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    
    if not pet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="宠物不存在"
        )
    
    group = db.query(Group).filter(Group.pet_id == pet.id).first()
    
    # 权限验证
    if current_user.role == "teacher":
        from app.models import Class
        class_ = db.query(Class).filter(Class.id == group.class_id).first()
        if not class_ or class_.teacher_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="无权访问该宠物"
            )
    else:
        is_member = db.query(GroupMember).filter(
            GroupMember.group_id == group.id,
            GroupMember.user_id == current_user.id
        ).first()
        if not is_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="您不是该小组的成员"
            )
    
    privileges = db.query(PetPrivilege).filter(
        PetPrivilege.pet_id == pet.id
    ).all()
    
    privilege_list = []
    for p in privileges:
        privilege_list.append({
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "unlock_level": p.unlock_level
        })
    
    return {
        "id": pet.id,
        "name": pet.name,
        "type": pet.type,
        "level": pet.level,
        "image_url": pet.image_url,
        "growth_threshold": pet.growth_threshold,
        "current_growth": group.growth_value,
        "health_value": group.health_value,
        "group_id": group.id,
        "group_name": group.name,
        "privileges": privilege_list
    }


@router.post("/", response_model=PetResponse, status_code=status.HTTP_201_CREATED)
def create_pet(
    request: PetCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """创建宠物"""
    group = db.query(Group).filter(Group.id == request.group_id).first()
    
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="小组不存在"
        )
    
    # 权限验证
    if current_user.role == "teacher":
        from app.models import Class
        class_ = db.query(Class).filter(Class.id == group.class_id).first()
        if not class_ or class_.teacher_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="您不是该班级的创建者"
            )
    else:
        is_member = db.query(GroupMember).filter(
            GroupMember.group_id == group.id,
            GroupMember.user_id == current_user.id
        ).first()
        if not is_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="您不是该小组的成员"
            )
    
    # 检查小组是否已有宠物
    if group.pet_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该小组已有宠物"
        )
    
    # 创建宠物
    pet = Pet(
        name=request.name,
        type=request.type,
        level=1,
        growth_threshold=100,
        unlock_privileges={"privileges": []}
    )
    
    db.add(pet)
    db.commit()
    db.refresh(pet)
    
    # 关联到小组
    group.pet_id = pet.id
    db.commit()
    
    # 添加默认特权
    default_privileges = [
        {"name": "作业提醒", "description": "宠物会提醒你完成作业", "unlock_level": 2},
        {"name": "双倍金币", "description": "完成任务获得双倍金币", "unlock_level": 4},
        {"name": "健康恢复", "description": "宠物每天自动恢复健康", "unlock_level": 6},
        {"name": "任务预览", "description": "可以提前查看任务", "unlock_level": 8},
        {"name": "小组加速", "description": "小组任务获得额外成长值", "unlock_level": 10}
    ]
    
    for priv in default_privileges:
        privilege = PetPrivilege(
            pet_id=pet.id,
            name=priv["name"],
            description=priv["description"],
            unlock_level=priv["unlock_level"]
        )
        db.add(privilege)
    
    db.commit()
    
    privilege_list = []
    for priv in default_privileges:
        privilege_list.append({
            "id": 0,
            "name": priv["name"],
            "description": priv["description"],
            "unlock_level": priv["unlock_level"]
        })
    
    return {
        "id": pet.id,
        "name": pet.name,
        "type": pet.type,
        "level": pet.level,
        "image_url": pet.image_url,
        "growth_threshold": pet.growth_threshold,
        "current_growth": group.growth_value,
        "health_value": group.health_value,
        "group_id": group.id,
        "group_name": group.name,
        "privileges": privilege_list
    }


@router.put("/{pet_id}/feed")
def feed_pet(
    pet_id: int,
    item_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """喂养宠物"""
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    
    if not pet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="宠物不存在"
        )
    
    group = db.query(Group).filter(Group.pet_id == pet_id).first()
    
    # 权限验证
    if current_user.role == "teacher":
        from app.models import Class
        class_ = db.query(Class).filter(Class.id == group.class_id).first()
        if not class_ or class_.teacher_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="无权操作该宠物"
            )
    else:
        is_member = db.query(GroupMember).filter(
            GroupMember.group_id == group.id,
            GroupMember.user_id == current_user.id
        ).first()
        if not is_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="您不是该小组的成员"
            )
    
    health_restore = 10
    
    if item_id:
        item = db.query(ShopItem).filter(ShopItem.id == item_id).first()
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="物品不存在"
            )
        
        # 检查金币
        if group.gold_balance < item.price:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="金币不足"
            )
        
        # 扣除金币
        group.gold_balance -= item.price
        
        # 根据物品效果恢复健康
        if item.category == "food":
            if "恢复10点" in item.effect:
                health_restore = 10
            elif "恢复30点" in item.effect:
                health_restore = 30
            elif "恢复50点" in item.effect:
                health_restore = 50
            elif "恢复全部" in item.effect:
                health_restore = 100
    
    # 恢复健康
    group.health_value = min(100, group.health_value + health_restore)
    db.commit()
    
    return {
        "message": "喂养成功",
        "health_value": group.health_value,
        "gold_balance": group.gold_balance
    }


@router.put("/{pet_id}/play")
def play_with_pet(
    pet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """与宠物玩耍"""
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    
    if not pet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="宠物不存在"
        )
    
    group = db.query(Group).filter(Group.pet_id == pet_id).first()
    
    # 权限验证
    if current_user.role == "teacher":
        from app.models import Class
        class_ = db.query(Class).filter(Class.id == group.class_id).first()
        if not class_ or class_.teacher_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="无权操作该宠物"
            )
    else:
        is_member = db.query(GroupMember).filter(
            GroupMember.group_id == group.id,
            GroupMember.user_id == current_user.id
        ).first()
        if not is_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="您不是该小组的成员"
            )
    
    # 增加成长值
    growth_increase = 5
    group.growth_value += growth_increase
    
    # 检查升级
    while group.growth_value >= pet.growth_threshold:
        group.growth_value -= pet.growth_threshold
        pet.level += 1
        # 升级后成长阈值增加
        pet.growth_threshold = int(pet.growth_threshold * 1.5)
    
    db.commit()
    
    return {
        "message": "玩耍愉快！",
        "level": pet.level,
        "growth_value": group.growth_value,
        "growth_threshold": pet.growth_threshold
    }


@router.get("/{pet_id}/privileges")
def get_pet_privileges(
    pet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取宠物特权"""
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    
    if not pet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="宠物不存在"
        )
    
    group = db.query(Group).filter(Group.pet_id == pet_id).first()
    
    # 权限验证
    if current_user.role == "teacher":
        from app.models import Class
        class_ = db.query(Class).filter(Class.id == group.class_id).first()
        if not class_ or class_.teacher_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="无权访问"
            )
    else:
        is_member = db.query(GroupMember).filter(
            GroupMember.group_id == group.id,
            GroupMember.user_id == current_user.id
        ).first()
        if not is_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="您不是该小组的成员"
            )
    
    privileges = db.query(PetPrivilege).filter(
        PetPrivilege.pet_id == pet_id
    ).all()
    
    result = []
    for p in privileges:
        result.append({
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "unlock_level": p.unlock_level,
            "unlocked": pet.level >= p.unlock_level
        })
    
    return {"privileges": result}
