"""
商城商品模型
"""
from sqlalchemy import Column, Integer, String, Text, Float, Enum as SQLAlchemyEnum
from sqlalchemy.orm import relationship
from enum import Enum
from app.core.database import Base
from app.models.base import TimestampMixin


class ItemCategory(str, Enum):
    """商品分类"""
    FOOD = "food"              # 食物
    PROP = "prop"              # 道具
    COSTUME = "costume"        # 装扮


class ShopItem(Base, TimestampMixin):
    """商城商品表"""
    __tablename__ = "shop_items"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    category = Column(SQLAlchemyEnum(ItemCategory), nullable=False)
    image_url = Column(String(255))
    effect = Column(String(255))  # 效果描述
    unlock_level = Column(Integer, default=1)  # 解锁等级
    
    # 关系
    purchase_records = relationship("PurchaseRecord", back_populates="item")
