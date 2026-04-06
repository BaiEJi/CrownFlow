"""
日记管理 API

提供日记的 CRUD 操作和查询功能：
- GET /api/journals - 获取日记列表（支持分页、日期范围筛选）
- GET /api/journals/<date> - 获取某天的日记详情（包含所有事件和反思）
- POST /api/journals - 创建日记
- PUT /api/journals/<id> - 更新日记
- DELETE /api/journals/<id> - 删除日记（级联删除事件和反思）
"""

from datetime import datetime, date
from flask import Blueprint, request
from sqlalchemy.orm import joinedload
from app.database import get_db
from app.models.models import Journal, JournalEvent, EventReflection
from app.utils.response import api_response
from app.config import settings

bp = Blueprint("journals", __name__, url_prefix="/api/journals")


VALID_MOODS = ["开心", "平静", "郁闷", "兴奋", "疲惫", "焦虑", "满足", "无聊"]


def reflection_to_dict(reflection: EventReflection) -> dict:
    return {
        "id": reflection.id,
        "event_id": reflection.event_id,
        "type": reflection.type,
        "custom_type_name": reflection.custom_type_name,
        "content": reflection.content,
        "created_at": reflection.created_at.isoformat() if reflection.created_at else None
    }


def event_to_dict(event: JournalEvent, include_reflections: bool = False) -> dict:
    reflections = sorted(event.reflections, key=lambda r: r.created_at) if event.reflections else []
    
    result = {
        "id": event.id,
        "journal_id": event.journal_id,
        "title": event.title,
        "start_time": event.start_time,
        "end_time": event.end_time,
        "location": event.location,
        "background": event.background,
        "process": event.process,
        "result": event.result,
        "reflection_count": len(reflections),
        "created_at": event.created_at.isoformat() if event.created_at else None,
        "updated_at": event.updated_at.isoformat() if event.updated_at else None
    }
    
    if include_reflections:
        result["reflections"] = [reflection_to_dict(r) for r in reflections]
    
    return result


def journal_to_dict(journal: Journal, include_events: bool = False) -> dict:
    """
    将 Journal 对象转换为字典
    
    Args:
        journal: Journal 实例
        include_events: 是否包含所有事件
        
    Returns:
        dict: 字典格式的日记数据
    """
    events = sorted(journal.events, key=lambda e: e.start_time or "00:00") if journal.events else []
    
    result = {
        "id": journal.id,
        "date": journal.date.isoformat() if journal.date else None,
        "mood": journal.mood,
        "weather": journal.weather,
        "summary": journal.summary,
        "event_count": len(events),
        "created_at": journal.created_at.isoformat() if journal.created_at else None,
        "updated_at": journal.updated_at.isoformat() if journal.updated_at else None
    }
    
    if include_events:
        result["events"] = [event_to_dict(e, include_reflections=True) for e in events]
    
    return result


@bp.route("", methods=["GET"])
def get_journals():
    """
    获取日记列表
    
    查询参数:
        page: 页码，默认1
        page_size: 每页数量，默认10
        start_date: 开始日期（YYYY-MM-DD）
        end_date: 结束日期（YYYY-MM-DD）
        
    Returns:
        日记列表
    """
    db = get_db()
    page = request.args.get("page", 1, type=int)
    page_size = request.args.get("page_size", 10, type=int)
    page_size = min(page_size, settings.max_page_size)

    query = db.query(Journal).options(joinedload(Journal.events))

    start_date_str = request.args.get("start_date")
    end_date_str = request.args.get("end_date")
    
    if start_date_str:
        try:
            start_date_obj = datetime.strptime(start_date_str, "%Y-%m-%d").date()
            query = query.filter(Journal.date >= start_date_obj)
        except ValueError:
            return api_response(None, 422, "start_date 格式错误，应为 YYYY-MM-DD")
    
    if end_date_str:
        try:
            end_date_obj = datetime.strptime(end_date_str, "%Y-%m-%d").date()
            query = query.filter(Journal.date <= end_date_obj)
        except ValueError:
            return api_response(None, 422, "end_date 格式错误，应为 YYYY-MM-DD")

    query = query.order_by(Journal.date.desc())

    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()

    return api_response({
        "items": [journal_to_dict(j) for j in items],
        "total": total
    })


@bp.route("/<string:journal_date>", methods=["GET"])
def get_journal_by_date(journal_date: str):
    """
    获取某天的日记详情
    
    路径参数:
        journal_date: 日期字符串（YYYY-MM-DD）
        
    Returns:
        日记详情，包含所有事件和反思
    """
    try:
        date_obj = datetime.strptime(journal_date, "%Y-%m-%d").date()
    except ValueError:
        return api_response(None, 422, "日期格式错误，应为 YYYY-MM-DD")
    
    db = get_db()
    journal = db.query(Journal).options(
        joinedload(Journal.events).joinedload(JournalEvent.reflections)
    ).filter(Journal.date == date_obj).first()
    
    if not journal:
        return api_response(None, 404, "该日期没有日记记录")
    
    return api_response(journal_to_dict(journal, include_events=True))


@bp.route("", methods=["POST"])
def create_journal():
    """
    创建日记
    
    请求体:
        date: 日期（必填，YYYY-MM-DD）
        mood: 心情（可选）
        weather: 天气（可选）
        summary: 总结（可选）
        
    Returns:
        创建的日记信息
    """
    db = get_db()
    data = request.get_json()

    if not data:
        return api_response(None, 400, "请求体不能为空")

    if not data.get("date"):
        return api_response(None, 400, "日期不能为空")

    try:
        date_obj = datetime.strptime(data["date"], "%Y-%m-%d").date()
    except ValueError:
        return api_response(None, 422, "日期格式错误，应为 YYYY-MM-DD")

    existing = db.query(Journal).filter(Journal.date == date_obj).first()
    if existing:
        return api_response(None, 400, "该日期已存在日记记录")

    mood = data.get("mood")
    if mood and mood not in VALID_MOODS:
        return api_response(None, 422, f"心情必须是: {', '.join(VALID_MOODS)}")

    journal = Journal(
        date=date_obj,
        mood=mood,
        weather=data.get("weather"),
        summary=data.get("summary")
    )
    db.add(journal)
    db.commit()
    db.refresh(journal)

    return api_response(journal_to_dict(journal), 201)


@bp.route("/<int:journal_id>", methods=["PUT"])
def update_journal(journal_id: int):
    """
    更新日记
    
    路径参数:
        journal_id: 日记ID
        
    请求体:
        mood: 心情
        weather: 天气
        summary: 总结
        
    Returns:
        更新后的日记信息
    """
    db = get_db()
    journal = db.query(Journal).options(joinedload(Journal.events)).filter(Journal.id == journal_id).first()
    
    if not journal:
        return api_response(None, 404, "日记不存在")

    data = request.get_json() or {}

    mood = data.get("mood")
    if mood and mood not in VALID_MOODS:
        return api_response(None, 422, f"心情必须是: {', '.join(VALID_MOODS)}")

    for field in ["mood", "weather", "summary"]:
        if field in data:
            setattr(journal, field, data[field])

    db.commit()
    db.refresh(journal)

    return api_response(journal_to_dict(journal))


@bp.route("/<int:journal_id>", methods=["DELETE"])
def delete_journal(journal_id: int):
    """
    删除日记
    
    路径参数:
        journal_id: 日记ID
        
    说明:
        级联删除所有关联的事件和反思
        
    Returns:
        删除结果
    """
    db = get_db()
    journal = db.query(Journal).filter(Journal.id == journal_id).first()
    
    if not journal:
        return api_response(None, 404, "日记不存在")

    db.delete(journal)
    db.commit()

    return api_response({"deleted": True})


@bp.route("/<string:journal_date>/events", methods=["POST"])
def create_event_for_journal(journal_date: str):
    """
    为日记添加事件
    
    路径参数:
        journal_date: 日期字符串（YYYY-MM-DD）
        
    请求体:
        title: 事件标题（必填）
        start_time: 开始时间（HH:MM）
        end_time: 结束时间（HH:MM）
        location: 地点
        background: 背景
        process: 过程
        result: 结果
        
    Returns:
        创建的事件信息
    """
    try:
        date_obj = datetime.strptime(journal_date, "%Y-%m-%d").date()
    except ValueError:
        return api_response(None, 422, "日期格式错误，应为 YYYY-MM-DD")
    
    db = get_db()
    journal = db.query(Journal).filter(Journal.date == date_obj).first()
    
    if not journal:
        return api_response(None, 404, "该日期没有日记记录")

    data = request.get_json()

    if not data:
        return api_response(None, 400, "请求体不能为空")

    if not data.get("title"):
        return api_response(None, 400, "事件标题不能为空")

    title = data["title"].strip()
    if not title:
        return api_response(None, 400, "事件标题不能为空")
    if len(title) > 100:
        return api_response(None, 422, "事件标题长度不能超过100个字符")

    for time_field in ["start_time", "end_time"]:
        if data.get(time_field):
            try:
                datetime.strptime(data[time_field], "%H:%M")
            except ValueError:
                return api_response(None, 422, f"{time_field} 格式错误，应为 HH:MM")

    event = JournalEvent(
        journal_id=journal.id,
        title=title,
        start_time=data.get("start_time"),
        end_time=data.get("end_time"),
        location=data.get("location"),
        background=data.get("background"),
        process=data.get("process"),
        result=data.get("result")
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    return api_response(event_to_dict(event), 201)