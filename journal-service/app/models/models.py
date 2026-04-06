"""
数据模型定义

定义了三个核心数据模型：
- Journal: 日记（按日期记录）
- JournalEvent: 事件（日记下的具体事件）
- EventReflection: 反思条目（事件的反思内容）
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Journal(Base):
    """
    日记模型
    
    每天一条日记记录，包含当日的心情、天气、总结等信息。
    
    Attributes:
        id: 主键
        date: 日期，唯一，YYYY-MM-DD 格式
        mood: 心情/状态（可选）
        weather: 天气（可选）
        summary: 当日总结（可选）
        created_at: 创建时间
        updated_at: 更新时间
        events: 关联的事件列表（反向关系）
    """
    __tablename__ = "journals"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, unique=True, nullable=False, index=True)
    mood = Column(String(20), nullable=True)
    weather = Column(String(20), nullable=True)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    events = relationship("JournalEvent", back_populates="journal", cascade="all, delete-orphan")


class JournalEvent(Base):
    """
    事件模型
    
    日记下的具体事件，包含时间、地点、背景、过程、结果等信息。
    
    Attributes:
        id: 主键
        journal_id: 外键，关联日记
        title: 事件标题（必填）
        start_time: 开始时间，HH:MM 格式
        end_time: 结束时间，HH:MM 格式
        location: 地点（可选）
        background: 背景/起因（可选）
        process: 过程描述（可选）
        result: 结果（可选）
        created_at: 创建时间
        updated_at: 更新时间
        reflections: 关联的反思列表（反向关系）
    """
    __tablename__ = "journal_events"

    id = Column(Integer, primary_key=True, index=True)
    journal_id = Column(Integer, ForeignKey("journals.id"), nullable=False, index=True)
    title = Column(String(100), nullable=False)
    start_time = Column(String(5), nullable=True)
    end_time = Column(String(5), nullable=True)
    location = Column(String(100), nullable=True)
    background = Column(Text, nullable=True)
    process = Column(Text, nullable=True)
    result = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    journal = relationship("Journal", back_populates="events")
    reflections = relationship("EventReflection", back_populates="event", cascade="all, delete-orphan")


class EventReflection(Base):
    """
    反思条目模型
    
    事件的反思内容，支持固定类型和自定义类型。
    
    预设类型：
    - good: 做得好的地方
    - bad: 做得不好的地方
    - improve: 改进建议
    
    Attributes:
        id: 主键
        event_id: 外键，关联事件
        type: 反思类型（good/bad/improve/custom）
        custom_type_name: 自定义类型名称（仅当 type=custom 时有效）
        content: 反思内容
        created_at: 创建时间
    """
    __tablename__ = "event_reflections"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("journal_events.id"), nullable=False, index=True)
    type = Column(String(20), nullable=False)
    custom_type_name = Column(String(50), nullable=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    event = relationship("JournalEvent", back_populates="reflections")