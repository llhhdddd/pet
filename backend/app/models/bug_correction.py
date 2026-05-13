"""
捉虫记录模型
"""
from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class BugCorrection(Base, TimestampMixin):
    """捉虫记录表"""
    __tablename__ = "bug_corrections"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    submission_id = Column(Integer, ForeignKey("submissions.id"), nullable=False)
    bug_type = Column(String(50), nullable=False)  # 错误类型
    fixed_content = Column(Text)  # 修改后的内容
    reward_amount = Column(Float, default=0.0)  # 奖励金币
    
    # 关系
    user = relationship("User")
    submission = relationship("Submission", back_populates="bug_corrections")
