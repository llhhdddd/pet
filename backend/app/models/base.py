"""
数据库模型
"""
from datetime import datetime
from sqlalchemy import Column, Integer, DateTime


class TimestampMixin:
    """时间戳混合类"""
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
