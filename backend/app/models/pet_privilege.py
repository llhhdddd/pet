"""
宠物特权模型
"""
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class PetPrivilege(Base, TimestampMixin):
    """宠物特权表"""
    __tablename__ = "pet_privileges"
    
    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(Integer, ForeignKey("pets.id"), nullable=False)
    name = Column(String(50), nullable=False)
    description = Column(String(255))
    unlock_level = Column(Integer, nullable=False)  # 解锁等级
    
    # 关系
    pet = relationship("Pet", back_populates="privileges")
