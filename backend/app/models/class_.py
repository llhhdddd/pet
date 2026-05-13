"""
班级模型
"""
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class Class(Base, TimestampMixin):
    """班级表"""
    __tablename__ = "classes"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    invite_code = Column(String(20), unique=True, index=True, nullable=False)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # 关系
    teacher = relationship("User", back_populates="classes")
    groups = relationship("Group", back_populates="class_")
    tasks = relationship("Task", back_populates="class_")
    notifications = relationship("ClassNotification", back_populates="class_")
