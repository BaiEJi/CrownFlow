"""
数据库配置模块

配置 SQLAlchemy 数据库连接和会话管理。
使用 SQLite 作为数据库。
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from pathlib import Path
from flask import g

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DATA_DIR}/journal.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """
    获取数据库会话

    用于 Flask 路由中获取数据库会话。
    每个请求获取一个会话，请求结束后自动关闭。

    Yields:
        Session: SQLAlchemy 数据库会话
    """
    if "db" not in g:
        g.db = SessionLocal()
    return g.db


def close_db(e=None):
    """
    关闭数据库会话

    在请求结束时自动调用。
    """
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    """
    初始化数据库

    创建所有数据表。
    """
    Base.metadata.create_all(bind=engine)