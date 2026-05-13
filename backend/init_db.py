"""
数据库初始化脚本
运行此脚本创建所有数据库表
"""
import os
import sys

# 添加项目路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import engine, Base
from app.models import *  # 导入所有模型


def init_database():
    """初始化数据库，创建所有表"""
    print("正在创建数据库表...")
    
    # 创建所有表
    Base.metadata.create_all(bind=engine)
    
    print("数据库表创建完成！")
    print("创建的表列表：")
    for table in Base.metadata.tables.keys():
        print(f"  - {table}")


if __name__ == "__main__":
    init_database()
