"""
金币经济接口（左鸿芳负责）
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models import (
    User, Group, GroupMember, GoldTransaction, ShopItem, 
    PurchaseRecord, TransactionType, TransactionSource, Submission, Task
)
from app.api.deps import get_current_active_user

router = APIRouter()


class TransactionResponse(BaseModel):
    """交易记录响应"""
    id: int
    amount: float
    transaction_type: str
    source_type: Optional[str]
    related_id: Optional[int]
    created_at: str
    
    class Config:
        from_attributes = True


class ShopItemResponse(BaseModel):
    """商品响应"""
    id: int
    name: str
    description: str
    price: float
    category: str
    image_url: Optional[str]
    effect: str
    unlock_level: int
    
    class Config:
        from_attributes = True


@router.get("/balance")
def get_balance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取金币余额"""
    if current_user.role == "teacher":
        # 教师没有个人金币
        return {"balance": 0.0}
    
    # 学生获取自己所在小组的金币
    group_member = db.query(GroupMember).filter(
        GroupMember.user_id == current_user.id
    ).first()
    
    if not group_member:
        return {"balance": 0.0}
    
    group = db.query(Group).filter(Group.id == group_member.group_id).first()
    
    return {
        "balance": group.gold_balance if group else 0.0,
        "group_id": group.id if group else None,
        "group_name": group.name if group else None
    }


@router.get("/transactions", response_model=List[TransactionResponse])
def get_transactions(
    limit: int = 20,
    offset: int = 0,
    transaction_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取交易记录"""
    query = db.query(GoldTransaction)
    
    if current_user.role == "student":
        # 学生查看自己的交易记录
        query = query.filter(GoldTransaction.user_id == current_user.id)
    else:
        # 教师查看所有交易记录
        pass
    
    if transaction_type:
        query = query.filter(GoldTransaction.transaction_type == transaction_type)
    
    transactions = query.order_by(
        GoldTransaction.created_at.desc()
    ).offset(offset).limit(limit).all()
    
    return transactions


@router.post("/earn")
def earn_gold(
    amount: float,
    source_type: str,
    related_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """赚取金币"""
    if amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="金额必须大于0"
        )
    
    # 验证来源类型
    valid_sources = ["task_complete", "excellent_work", "attendance", "answer_help", "bug_fix"]
    if source_type not in valid_sources:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"来源类型必须是 {', '.join(valid_sources)} 之一"
        )
    
    if current_user.role == "student":
        # 获取学生所在小组
        group_member = db.query(GroupMember).filter(
            GroupMember.user_id == current_user.id
        ).first()
        
        if not group_member:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="您还没有加入任何小组"
            )
        
        group = db.query(Group).filter(Group.id == group_member.group_id).first()
        
        # 增加小组金币
        group.gold_balance += amount
        
        # 增加贡献值
        group_member.contribution += amount
        
        # 创建交易记录
        transaction = GoldTransaction(
            user_id=current_user.id,
            group_id=group.id,
            amount=amount,
            transaction_type=TransactionType.EARN,
            source_type=source_type,
            related_id=related_id
        )
        
        db.add(transaction)
        db.commit()
        
        return {
            "message": f"成功获得 {amount} 金币",
            "balance": group.gold_balance
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="教师不能赚取金币"
        )


@router.post("/spend")
def spend_gold(
    amount: float,
    source_type: str,
    related_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """消费金币"""
    if amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="金额必须大于0"
        )
    
    # 验证来源类型
    valid_sources = ["food_purchase", "item_purchase"]
    if source_type not in valid_sources:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"来源类型必须是 {', '.join(valid_sources)} 之一"
        )
    
    if current_user.role == "student":
        # 获取学生所在小组
        group_member = db.query(GroupMember).filter(
            GroupMember.user_id == current_user.id
        ).first()
        
        if not group_member:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="您还没有加入任何小组"
            )
        
        group = db.query(Group).filter(Group.id == group_member.group_id).first()
        
        # 检查金币是否足够
        if group.gold_balance < amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="金币不足"
            )
        
        # 扣除金币
        group.gold_balance -= amount
        
        # 创建交易记录
        transaction = GoldTransaction(
            user_id=current_user.id,
            group_id=group.id,
            amount=amount,
            transaction_type=TransactionType.SPEND,
            source_type=source_type,
            related_id=related_id
        )
        
        db.add(transaction)
        db.commit()
        
        return {
            "message": f"成功消费 {amount} 金币",
            "balance": group.gold_balance
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="教师不能消费金币"
        )


@router.get("/shop", response_model=List[ShopItemResponse])
def get_shop_items(
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取商城商品列表"""
    query = db.query(ShopItem)
    
    if category:
        query = query.filter(ShopItem.category == category)
    
    items = query.all()
    return items


@router.get("/shop/{item_id}", response_model=ShopItemResponse)
def get_shop_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取商品详情"""
    item = db.query(ShopItem).filter(ShopItem.id == item_id).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="商品不存在"
        )
    
    return item


@router.post("/shop/{item_id}/purchase")
def purchase_item(
    item_id: int,
    quantity: int = 1,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """购买商品"""
    if quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="购买数量必须大于0"
        )
    
    item = db.query(ShopItem).filter(ShopItem.id == item_id).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="商品不存在"
        )
    
    if current_user.role == "student":
        # 获取学生所在小组
        group_member = db.query(GroupMember).filter(
            GroupMember.user_id == current_user.id
        ).first()
        
        if not group_member:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="您还没有加入任何小组"
            )
        
        group = db.query(Group).filter(Group.id == group_member.group_id).first()
        
        # 检查金币是否足够
        total_price = item.price * quantity
        if group.gold_balance < total_price:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="金币不足"
            )
        
        # 扣除金币
        group.gold_balance -= total_price
        
        # 创建购买记录
        purchase = PurchaseRecord(
            user_id=current_user.id,
            item_id=item.id,
            quantity=quantity,
            total_price=total_price
        )
        
        # 创建交易记录
        transaction = GoldTransaction(
            user_id=current_user.id,
            group_id=group.id,
            amount=total_price,
            transaction_type=TransactionType.SPEND,
            source_type=TransactionSource.ITEM_PURCHASE,
            related_id=item.id
        )
        
        db.add(purchase)
        db.add(transaction)
        db.commit()
        
        return {
            "message": f"成功购买 {quantity} 个 {item.name}",
            "balance": group.gold_balance,
            "total_spent": total_price
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="教师不能购买商品"
        )


@router.post("/award/excellent")
def award_excellent_work(
    submission_id: int,
    bonus_gold: float = 20.0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """奖励优秀作业（教师权限）"""
    if current_user.role != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只有教师可以奖励优秀作业"
        )
    
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="提交不存在"
        )
    
    task = db.query(Task).filter(Task.id == submission.task_id).first()
    from app.models import Class
    class_ = db.query(Class).filter(Class.id == task.class_id).first()
    
    if not class_ or class_.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="您不是该班级的创建者"
        )
    
    # 获取学生所在小组
    group_member = db.query(GroupMember).filter(
        GroupMember.user_id == submission.student_id
    ).first()
    
    if not group_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="学生没有加入任何小组"
        )
    
    group = db.query(Group).filter(Group.id == group_member.group_id).first()
    
    # 增加金币
    group.gold_balance += bonus_gold
    
    # 创建交易记录
    transaction = GoldTransaction(
        user_id=submission.student_id,
        group_id=group.id,
        amount=bonus_gold,
        transaction_type=TransactionType.EARN,
        source_type=TransactionSource.EXCELLENT_WORK,
        related_id=submission_id
    )
    
    db.add(transaction)
    db.commit()
    
    student = db.query(User).filter(User.id == submission.student_id).first()
    
    return {
        "message": f"奖励 {student.username} {bonus_gold} 金币",
        "balance": group.gold_balance
    }
