"""
事件管理 API

提供事件的 CRUD 操作：
- GET /api/events/<id> - 获取事件详情
- PUT /api/events/<id> - 更新事件
- DELETE /api/events/<id> - 删除事件
- POST /api/events/<id>/reflections - 为事件添加反思

注意：创建事件的路由在 journals.py 中（POST /api/journals/<date>/events）
"""

from datetime import datetime
from flask import Blueprint, request
from sqlalchemy.orm import joinedload
from app.database import get_db
from app.models.models import JournalEvent, EventReflection
from app.utils.response import api_response

bp = Blueprint("events", __name__, url_prefix="/api/events")


VALID_REFLECTION_TYPES = ["good", "bad", "improve", "custom"]


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


@bp.route("/<int:event_id>", methods=["GET"])
def get_event(event_id: int):
    """
    获取事件详情
    
    路径参数:
        event_id: 事件ID
        
    Returns:
        事件详情，包含反思
    """
    db = get_db()
    event = db.query(JournalEvent).options(
        joinedload(JournalEvent.reflections)
    ).filter(JournalEvent.id == event_id).first()
    
    if not event:
        return api_response(None, 404, "事件不存在")
    
    return api_response(event_to_dict(event, include_reflections=True))


@bp.route("/<int:event_id>", methods=["PUT"])
def update_event(event_id: int):
    """
    更新事件
    
    路径参数:
        event_id: 事件ID
        
    请求体:
        title: 事件标题
        start_time: 开始时间
        end_time: 结束时间
        location: 地点
        background: 背景
        process: 过程
        result: 结果
        
    Returns:
        更新后的事件信息
    """
    db = get_db()
    event = db.query(JournalEvent).options(joinedload(JournalEvent.reflections)).filter(JournalEvent.id == event_id).first()
    
    if not event:
        return api_response(None, 404, "事件不存在")

    data = request.get_json() or {}

    if "title" in data:
        title = data["title"].strip()
        if not title:
            return api_response(None, 400, "事件标题不能为空")
        if len(title) > 100:
            return api_response(None, 422, "事件标题长度不能超过100个字符")
        event.title = title

    for time_field in ["start_time", "end_time"]:
        if time_field in data and data[time_field]:
            try:
                datetime.strptime(data[time_field], "%H:%M")
            except ValueError:
                return api_response(None, 422, f"{time_field} 格式错误，应为 HH:MM")

    for field in ["start_time", "end_time", "location", "background", "process", "result"]:
        if field in data:
            setattr(event, field, data[field])

    db.commit()
    db.refresh(event)

    return api_response(event_to_dict(event))


@bp.route("/<int:event_id>", methods=["DELETE"])
def delete_event(event_id: int):
    """
    删除事件
    
    路径参数:
        event_id: 事件ID
        
    说明:
        级联删除所有关联的反思
        
    Returns:
        删除结果
    """
    db = get_db()
    event = db.query(JournalEvent).filter(JournalEvent.id == event_id).first()
    
    if not event:
        return api_response(None, 404, "事件不存在")

    db.delete(event)
    db.commit()

    return api_response({"deleted": True})


@bp.route("/<int:event_id>/reflections", methods=["POST"])
def create_reflection(event_id: int):
    """
    为事件添加反思
    
    路径参数:
        event_id: 事件ID
        
    请求体:
        type: 反思类型（good/bad/improve/custom）
        custom_type_name: 自定义类型名称（仅当 type=custom 时有效）
        content: 反思内容（必填）
        
    Returns:
        创建的反思信息
    """
    db = get_db()
    event = db.query(JournalEvent).filter(JournalEvent.id == event_id).first()
    
    if not event:
        return api_response(None, 404, "事件不存在")

    data = request.get_json()

    if not data:
        return api_response(None, 400, "请求体不能为空")

    reflection_type = data.get("type")
    if not reflection_type:
        return api_response(None, 400, "反思类型不能为空")
    if reflection_type not in VALID_REFLECTION_TYPES:
        return api_response(None, 422, f"反思类型必须是: {', '.join(VALID_REFLECTION_TYPES)}")

    if reflection_type == "custom" and not data.get("custom_type_name"):
        return api_response(None, 400, "自定义类型名称不能为空")

    if not data.get("content"):
        return api_response(None, 400, "反思内容不能为空")

    content = data["content"].strip()
    if not content:
        return api_response(None, 400, "反思内容不能为空")

    reflection = EventReflection(
        event_id=event_id,
        type=reflection_type,
        custom_type_name=data.get("custom_type_name") if reflection_type == "custom" else None,
        content=content
    )
    db.add(reflection)
    db.commit()
    db.refresh(reflection)

    return api_response(reflection_to_dict(reflection), 201)