"""
宠物模型
"""
from sqlalchemy import Column, Integer, String, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class Pet(Base, TimestampMixin):
    """宠物表"""
    __tablename__ = "pets"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    type = Column(String(30), nullable=False)  # 宠物类型
    level = Column(Integer, default=1)
    image_url = Column(String(255))
    growth_threshold = Column(Integer, default=100)  # 升级所需成长值
    unlock_privileges = Column(JSON)  # 解锁的特权列表
    
    # 关系
    group = relationship("Group", back_populates="pet")
    privileges = relationship("PetPrivilege", back_populates="pet")
