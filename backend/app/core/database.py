"""
数据库连接配置
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings


class Base(DeclarativeBase):
    pass


# 创建数据库引擎 (SQLite)
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """获取数据库会话"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """初始化数据库表，并创建默认账号"""
    from app.models import __all__  # noqa: F401
    Base.metadata.create_all(bind=engine)

    # 种子数据：首次运行时创建默认账号
    from app.utils.security import get_password_hash
    from app.models.user import User
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            db.add(User(username='student', email='student@test.com',
                hashed_password=get_password_hash('123456789'),
                role='student', is_active=True, is_verified=True))
            db.add(User(username='teacher', email='teacher@test.com',
                hashed_password=get_password_hash('987654321'),
                role='teacher', is_active=True, is_verified=True))
            db.commit()
    finally:
        db.close()