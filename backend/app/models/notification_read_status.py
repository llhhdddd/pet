"""
通知阅读状态模型
"""
from sqlalchemy import Column, Integer, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class NotificationReadStatus(Base, TimestampMixin):
    """通知阅读状态表"""
    __tablename__ = "notification_read_status"
    
    id = Column(Integer, primary_key=True, index=True)
    notification_id = Column(Integer, ForeignKey("class_notifications.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_read = Column(Boolean, default=False)
    
    # 关系
    notification = relationship("ClassNotification", back_populates="read_status")
    user = relationship("User")
