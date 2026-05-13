"""
通知模型
"""
from sqlalchemy import Column, Integer, String, Text, ForeignKey, Enum as SQLAlchemyEnum
from sqlalchemy.orm import relationship
from enum import Enum
from app.core.database import Base
from app.models.base import TimestampMixin


class NotificationType(str, Enum):
    """通知类型"""
    ANNOUNCEMENT = "announcement"    # 班级公告
    COURSE_REMINDER = "course_reminder"  # 课程提醒
    TASK_REMINDER = "task_reminder"  # 任务提醒
    GRADE_NOTIFICATION = "grade_notification"  # 批改通知


class ClassNotification(Base, TimestampMixin):
    """班级通知表"""
    __tablename__ = "class_notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(Text)
    notification_type = Column(SQLAlchemyEnum(NotificationType), nullable=False)
    
    # 关系
    class_ = relationship("Class", back_populates="notifications")
    read_status = relationship("NotificationReadStatus", back_populates="notification")
