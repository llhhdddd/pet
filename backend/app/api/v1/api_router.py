"""
API 路由汇总
"""
from fastapi import APIRouter

from app.api.v1 import auth, users, classes, groups, tasks, pets, gold

api_router = APIRouter()

# 认证模块
api_router.include_router(auth.router, prefix="/auth", tags=["认证"])

# 用户模块
api_router.include_router(users.router, prefix="/users", tags=["用户"])

# 班级管理
api_router.include_router(classes.router, prefix="/classes", tags=["班级"])

# 小组管理
api_router.include_router(groups.router, prefix="/groups", tags=["小组"])

# 任务管理
api_router.include_router(tasks.router, prefix="/tasks", tags=["任务"])

# 宠物养成
api_router.include_router(pets.router, prefix="/pets", tags=["宠物"])

# 金币经济
api_router.include_router(gold.router, prefix="/gold", tags=["金币"])
