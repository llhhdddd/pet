"""
小组模型
"""
from sqlalchemy import Column, Integer, String, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class Group(Base, TimestampMixin):
    """小组表"""
    __tablename__ = "groups"
    
    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    name = Column(String(50), nullable=False)
    pet_id = Column(Integer, ForeignKey("pets.id"))
    gold_balance = Column(Float, default=0.0)
    growth_value = Column(Integer, default=0)
    health_value = Column(Integer, default=100)
    
    # 关系
    class_ = relationship("Class", back_populates="groups")
    pet = relationship("Pet", back_populates="group")
    members = relationship("GroupMember", back_populates="group")
    gold_transactions = relationship("GoldTransaction", back_populates="group")
