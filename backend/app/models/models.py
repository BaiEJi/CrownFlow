"""
数据库模型定义

定义了三个核心数据模型：
- Category: 会员分类（如视频流媒体、音乐服务等）
- Member: 会员主表（存储会员基础信息，支持多次续费）
- Subscription: 订阅记录表（每次续费产生一条记录）

设计说明：
- Member 与 Subscription 是一对多关系
- 同一会员可以有多个订阅记录（如先买1个月，后续费1年）
- Subscription 继承了原 Member 的订阅周期相关字段
- 新增 channel 字段记录订阅渠道
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class BillingCycle(str, enum.Enum):
    """
    计费周期枚举
    
    支持四种计费方式：
    - MONTHLY: 月付，天数根据实际月份计算（28-31天）
    - QUARTERLY: 季付，固定90天
    - YEARLY: 年付，根据闰年判断365或366天
    - CUSTOM: 自定义天数，需配合 custom_days 字段使用
    """
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"
    CUSTOM = "custom"


class Category(Base):
    """
    会员分类模型
    
    用于对会员进行分类管理，如视频流媒体、音乐服务等。
    每个分类可以设置图标和颜色，便于前端展示。
    
    Attributes:
        id: 主键
        name: 分类名称，唯一，最大50字符
        icon: 分类图标（emoji），最大10字符
        color: 分类颜色，HEX格式如 #FF5722
        created_at: 创建时间，自动生成
        members: 关联的会员列表（反向关系）
    """
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    icon = Column(String(10), nullable=True)
    color = Column(String(7), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    members = relationship("Member", back_populates="category")


class Member(Base):
    """
    会员主表模型
    
    记录会员的基础信息，支持同一会员的多次续费。
    每次续费会在 Subscription 表中创建新记录。
    
    会员状态判断：任意一条订阅有效则会员有效
    
    Attributes:
        id: 主键
        name: 会员名称（如 QQ音乐、Netflix）
        category_id: 所属分类ID，外键关联 categories 表
        notes: 备注信息
        reminder_days: 提前N天提醒续费，默认7天
        created_at: 创建时间
        updated_at: 更新时间
        category: 关联的分类对象
        subscriptions: 关联的订阅记录列表（反向关系）
    """
    __tablename__ = "members"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    notes = Column(Text, nullable=True)
    reminder_days = Column(Integer, default=7)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    category = relationship("Category", back_populates="members")
    subscriptions = relationship("Subscription", back_populates="member", cascade="all, delete-orphan")


class Subscription(Base):
    """
    订阅记录模型
    
    记录每次会员订阅的详细信息，包括价格、计费周期、日期等。
    一个会员可以有多条订阅记录，实现续费管理。
    
    支出计算公式：实际支出 = 价格 / 计费周期天数 * 实际使用天数
    
    Attributes:
        id: 主键
        member_id: 关联的会员ID，外键关联 members 表
        level: 会员级别（如高级版、家庭版）
        price: 价格，使用 Decimal 避免浮点精度问题
        currency: 币种，默认 CNY
        billing_cycle: 计费周期（monthly/quarterly/yearly/custom）
        custom_days: 自定义周期天数，仅当 billing_cycle=custom 时有效
        start_date: 订阅开始日期
        end_date: 订阅结束日期
        channel: 订阅渠道（如官方、淘宝、代充等）
        notes: 备注信息
        created_at: 创建时间
        updated_at: 更新时间
        member: 关联的会员对象
    """
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("members.id"), nullable=False, index=True)
    level = Column(String(50), nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="CNY")
    billing_cycle = Column(String(20), nullable=False)
    custom_days = Column(Integer, nullable=True)
    start_date = Column(String(10), nullable=False, index=True)
    end_date = Column(String(10), nullable=False, index=True)
    channel = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    member = relationship("Member", back_populates="subscriptions")