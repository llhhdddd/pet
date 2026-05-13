"""
用户接口
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db

router = APIRouter()

# TODO: 实现用户相关接口
