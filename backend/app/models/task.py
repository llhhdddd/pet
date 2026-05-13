"""
任务模型
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Float, Enum as SQLAlchemyEnum
from sqlalchemy.orm import relationship
from enum import Enum
from app.core.database import Base
from app.models.base import TimestampMixin


class TaskType(str, Enum):
    """任务类型"""
    HOMEWORK = "homework"      # 课后作业
    PREVIEW = "preview"        # 课前预习
    PROJECT = "project"        # 小组项目
    QUIZ = "quiz"              # 课堂小测


class TaskStatus(str, Enum):
    """任务状态"""
    DRAFT = "draft"            # 草稿
    PUBLISHED = "published"    # 已发布
    CLOSED = "closed"          # 已关闭


class Task(Base, TimestampMixin):
    """任务表"""
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey("classes.id"))
    group_id = Column(Integer, ForeignKey("groups.id"))  # 可为空表示全班任务
    title = Column(String(200), nullable=False)
    content = Column(Text)
    deadline = Column(DateTime, nullable=False)
    max_score = Column(Float, default=100.0)
    late_penalty_rule = Column(JSON)  # 迟交扣分规则
    task_type = Column(SQLAlchemyEnum(TaskType), nullable=False)
    status = Column(SQLAlchemyEnum(TaskStatus), default=TaskStatus.DRAFT)
    
    # 关系
    class_ = relationship("Class", back_populates="tasks")
    group = relationship("Group")
    submissions = relationship("Submission", back_populates="task")
