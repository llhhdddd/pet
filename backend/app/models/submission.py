"""
提交模型
"""
from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, Float, Enum as SQLAlchemyEnum
from sqlalchemy.orm import relationship
from enum import Enum
from app.core.database import Base
from app.models.base import TimestampMixin


class SubmissionStatus(str, Enum):
    """提交状态"""
    PENDING = "pending"        # 待批改
    GRADED = "graded"          # 已批改
    RESUBMIT = "resubmit"      # 需要重做


class Submission(Base, TimestampMixin):
    """提交表"""
    __tablename__ = "submissions"
    
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text)
    score = Column(Float)
    feedback = Column(Text)
    status = Column(SQLAlchemyEnum(SubmissionStatus), default=SubmissionStatus.PENDING)
    submitted_at = Column(DateTime)
    graded_at = Column(DateTime)
    
    # 关系
    task = relationship("Task", back_populates="submissions")
    student = relationship("User")
    bug_corrections = relationship("BugCorrection", back_populates="submission")
