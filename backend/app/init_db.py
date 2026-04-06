"""
数据库初始化脚本

功能：
1. 创建所有数据表
2. 插入默认分类数据
3. 执行数据迁移（将旧 Member 数据迁移到新 Member + Subscription 结构）

迁移策略：
- 按 name 合并：相同名称的旧 Member 记录合并为一个新 Member
- 每条旧 Member 记录转换为一条 Subscription 记录
- 保留分类关联和提醒天数
"""

import json
from pathlib import Path
from sqlalchemy import inspect
from app.database import Base, engine, SessionLocal
from app.models.models import Category, Member, Subscription


# 旧版 Member 模型定义（用于迁移）
from sqlalchemy import Column, Integer, String, DateTime, Text, Numeric, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import declarative_base

OldBase = declarative_base()


class OldMember(OldBase):
    """
    旧版会员模型（仅用于数据迁移）
    
    包含所有原有字段，用于读取旧数据
    """
    __tablename__ = "members"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    level = Column(String(50), nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="CNY")
    billing_cycle = Column(String(20), nullable=False)
    custom_days = Column(Integer, nullable=True)
    start_date = Column(String(10), nullable=False)
    end_date = Column(String(10), nullable=False)
    notes = Column(Text, nullable=True)
    reminder_days = Column(Integer, default=7)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


def check_old_schema():
    """
    检查是否存在旧版数据库结构
    
    Returns:
        bool: 是否存在旧的 members 表且包含订阅相关字段
    """
    inspector = inspect(engine)
    if "members" not in inspector.get_table_names():
        return False
    
    columns = {col["name"] for col in inspector.get_columns("members")}
    old_fields = {"price", "billing_cycle", "start_date", "end_date"}
    return old_fields.issubset(columns)


def check_new_schema():
    """
    检查是否存在新版数据库结构
    
    Returns:
        bool: 是否存在 subscriptions 表
    """
    inspector = inspect(engine)
    return "subscriptions" in inspector.get_table_names()


def migrate_data():
    """
    执行数据迁移
    
    迁移步骤：
    1. 读取所有旧 Member 数据
    2. 按 name 分组
    3. 每个分组创建一个新 Member
    4. 每条旧记录创建一个 Subscription 关联到新 Member
    """
    db = SessionLocal()
    
    try:
        old_members = db.query(OldMember).all()
        
        if not old_members:
            print("无需迁移：没有旧数据")
            return
        
        print(f"开始迁移 {len(old_members)} 条旧会员数据...")
        
        grouped = {}
        for m in old_members:
            if m.name not in grouped:
                grouped[m.name] = []
            grouped[m.name].append(m)
        
        new_member_count = 0
        new_subscription_count = 0
        
        for name, records in grouped.items():
            first = records[0]
            
            new_member = Member(
                name=name,
                category_id=first.category_id,
                notes=first.notes,
                reminder_days=first.reminder_days
            )
            db.add(new_member)
            db.flush()
            new_member_count += 1
            
            for old in records:
                new_sub = Subscription(
                    member_id=new_member.id,
                    level=old.level,
                    price=old.price,
                    currency=old.currency,
                    billing_cycle=old.billing_cycle,
                    custom_days=old.custom_days,
                    start_date=old.start_date,
                    end_date=old.end_date,
                    channel=None,
                    notes=None
                )
                db.add(new_sub)
                new_subscription_count += 1
        
        db.execute(OldMember.__table__.delete())
        
        db.commit()
        
        print(f"迁移完成：{new_member_count} 个会员，{new_subscription_count} 条订阅记录")
        
        migration_log = {
            "migrated_at": str(func.now()),
            "old_members": len(old_members),
            "new_members": new_member_count,
            "new_subscriptions": new_subscription_count
        }
        
        data_dir = Path(__file__).resolve().parent.parent / "data"
        data_dir.mkdir(exist_ok=True)
        log_file = data_dir / "migration_log.json"
        with open(log_file, "w", encoding="utf-8") as f:
            json.dump(migration_log, f, ensure_ascii=False, indent=2)
        print(f"迁移日志已保存到: {log_file}")
        
    except Exception as e:
        db.rollback()
        print(f"迁移失败: {str(e)}")
        raise
    finally:
        db.close()


def init_db():
    """
    初始化数据库
    
    执行流程：
    1. 检查是否需要迁移
    2. 如需迁移，先备份旧数据
    3. 创建新表结构
    4. 执行迁移
    5. 插入默认分类（如不存在）
    """
    needs_migration = check_old_schema() and not check_new_schema()
    
    if needs_migration:
        print("检测到旧版数据库结构，准备迁移...")
    
    Base.metadata.create_all(bind=engine)
    
    if needs_migration:
        migrate_data()
    
    db = SessionLocal()
    try:
        if db.query(Category).count() == 0:
            default_categories = [
                Category(name="视频流媒体", icon="🎬", color="#E91E63"),
                Category(name="音乐服务", icon="🎵", color="#9C27B0"),
                Category(name="生产力工具", icon="💻", color="#2196F3"),
                Category(name="云存储", icon="☁️", color="#00BCD4"),
                Category(name="游戏服务", icon="🎮", color="#4CAF50"),
                Category(name="阅读学习", icon="📚", color="#FF9800"),
                Category(name="健康健身", icon="🏃", color="#795548"),
                Category(name="其他", icon="🛠", color="#9E9E9E"),
            ]
            db.add_all(default_categories)
            db.commit()
            print("已初始化默认分类数据")
    finally:
        db.close()


if __name__ == "__main__":
    init_db()