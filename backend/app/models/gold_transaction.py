"""
金币交易模型
"""
from sqlalchemy import Column, Integer, Float, String, ForeignKey, Enum as SQLAlchemyEnum
from sqlalchemy.orm import relationship
from enum import Enum
from app.core.database import Base
from app.models.base import TimestampMixin


class TransactionType(str, Enum):
    """交易类型"""
    EARN = "earn"              # 赚取
    SPEND = "spend"            # 消费
    DEDUCT = "deduct"          # 扣除
    TRANSFER = "transfer"      # 转账


class TransactionSource(str, Enum):
    """交易来源"""
    TASK_COMPLETE = "task_complete"    # 完成任务
    EXCELLENT_WORK = "excellent_work"  # 优秀作业
    ATTENDANCE = "attendance"          # 课堂签到
    ANSWER_HELP = "answer_help"        # 帮助同学
    BUG_FIX = "bug_fix"                # 捉虫成功
    FOOD_PURCHASE = "food_purchase"    # 购买食物
    ITEM_PURCHASE = "item_purchase"    # 购买道具


class GoldTransaction(Base, TimestampMixin):
    """金币交易表"""
    __tablename__ = "gold_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    group_id = Column(Integer, ForeignKey("groups.id"))
    amount = Column(Float, nullable=False)
    transaction_type = Column(SQLAlchemyEnum(TransactionType), nullable=False)
    source_type = Column(SQLAlchemyEnum(TransactionSource))
    related_id = Column(Integer)  # 关联的任务/提交ID
    
    # 关系
    user = relationship("User", back_populates="gold_transactions")
    group = relationship("Group", back_populates="gold_transactions")
