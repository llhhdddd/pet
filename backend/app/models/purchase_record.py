"""
购买记录模型
"""
from sqlalchemy import Column, Integer, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class PurchaseRecord(Base, TimestampMixin):
    """购买记录表"""
    __tablename__ = "purchase_records"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("shop_items.id"), nullable=False)
    quantity = Column(Integer, default=1)
    total_price = Column(Float, nullable=False)
    
    # 关系
    user = relationship("User")
    item = relationship("ShopItem", back_populates="purchase_records")
