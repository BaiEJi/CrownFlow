"""
反思管理 API

提供反思的 CRUD 操作：
- GET /api/reflections/<id> - 获取反思详情
- PUT /api/reflections/<id> - 更新反思
- DELETE /api/reflections/<id> - 删除反思

注意：创建反思的路由在 events.py 中（POST /api/events/<id>/reflections）
"""

from flask import Blueprint, request
from app.database import get_db
from app.models.models import EventReflection
from app.utils.response import api_response

bp = Blueprint("reflections", __name__, url_prefix="/api/reflections")


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


@bp.route("/<int:reflection_id>", methods=["GET"])
def get_reflection(reflection_id: int):
    """
    获取反思详情
    
    路径参数:
        reflection_id: 反思ID
        
    Returns:
        反思详情
    """
    db = get_db()
    reflection = db.query(EventReflection).filter(EventReflection.id == reflection_id).first()
    
    if not reflection:
        return api_response(None, 404, "反思不存在")
    
    return api_response(reflection_to_dict(reflection))


@bp.route("/<int:reflection_id>", methods=["PUT"])
def update_reflection(reflection_id: int):
    """
    更新反思
    
    路径参数:
        reflection_id: 反思ID
        
    请求体:
        type: 反思类型
        custom_type_name: 自定义类型名称
        content: 反思内容
        
    Returns:
        更新后的反思信息
    """
    db = get_db()
    reflection = db.query(EventReflection).filter(EventReflection.id == reflection_id).first()
    
    if not reflection:
        return api_response(None, 404, "反思不存在")

    data = request.get_json() or {}

    reflection_type = data.get("type")
    if reflection_type:
        if reflection_type not in VALID_REFLECTION_TYPES:
            return api_response(None, 422, f"反思类型必须是: {', '.join(VALID_REFLECTION_TYPES)}")
        reflection.type = reflection_type
        
        if reflection_type == "custom":
            if not data.get("custom_type_name"):
                return api_response(None, 400, "自定义类型名称不能为空")
            reflection.custom_type_name = data["custom_type_name"]
        else:
            reflection.custom_type_name = None

    if "content" in data:
        content = data["content"].strip()
        if not content:
            return api_response(None, 400, "反思内容不能为空")
        reflection.content = content

    db.commit()
    db.refresh(reflection)

    return api_response(reflection_to_dict(reflection))


@bp.route("/<int:reflection_id>", methods=["DELETE"])
def delete_reflection(reflection_id: int):
    """
    删除反思
    
    路径参数:
        reflection_id: 反思ID
        
    Returns:
        删除结果
    """
    db = get_db()
    reflection = db.query(EventReflection).filter(EventReflection.id == reflection_id).first()
    
    if not reflection:
        return api_response(None, 404, "反思不存在")

    db.delete(reflection)
    db.commit()

    return api_response({"deleted": True})