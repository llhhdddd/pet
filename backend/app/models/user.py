"""
用户模型
"""
from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class User(Base, TimestampMixin):
    """用户表"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)  # teacher or student
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # 关系
    classes = relationship("Class", back_populates="teacher")
    group_members = relationship("GroupMember", back_populates="user")
    submissions = relationship("Submission", back_populates="student")
    gold_transactions = relationship("GoldTransaction", back_populates="user")
    bug_corrections = relationship("BugCorrection", back_populates="user")
    purchase_records = relationship("PurchaseRecord", back_populates="user")
