"""
小组成员模型
"""
from sqlalchemy import Column, Integer, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class GroupMember(Base, TimestampMixin):
    """小组成员表"""
    __tablename__ = "group_members"
    
    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    contribution = Column(Float, default=0.0)  # 贡献度
    
    # 关系
    group = relationship("Group", back_populates="members")
    user = relationship("User", back_populates="group_members")
