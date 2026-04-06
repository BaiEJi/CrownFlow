"""
初始化数据库脚本

用于首次运行时创建数据库表。
"""

from app.database import init_db, engine
from app.models.models import Base

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    print("Database initialized successfully!")