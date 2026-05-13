"""
依赖注入模块
导出认证相关的依赖函数供其他模块使用
"""
from app.api.v1.auth import (
    get_current_user,
    get_current_active_user,
    get_current_teacher
)

__all__ = [
    "get_current_user",
    "get_current_active_user",
    "get_current_teacher"
]
