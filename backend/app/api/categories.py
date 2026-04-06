"""
分类管理 API

提供分类的 CRUD 操作：
- GET /api/categories - 获取所有分类
- POST /api/categories - 创建分类
- PUT /api/categories/<id> - 更新分类
- DELETE /api/categories/<id> - 删除分类

删除分类时会检查是否有会员关联，存在关联则拒绝删除。
"""

from flask import Blueprint, request
from app.database import get_db
from app.models.models import Category, Member
from app.utils.response import api_response

bp = Blueprint("categories", __name__, url_prefix="/api/categories")


def category_to_dict(category):
    """
    将 Category 对象转换为字典

    Args:
        category: Category 实例

    Returns:
        字典格式的分类数据
    """
    return {
        "id": category.id,
        "name": category.name,
        "icon": category.icon,
        "color": category.color,
        "created_at": category.created_at.isoformat() if category.created_at else None
    }


@bp.route("", methods=["GET"])
def get_categories():
    """
    获取所有分类列表

    Returns:
        分类列表
    """
    db = get_db()
    categories = db.query(Category).order_by(Category.created_at).all()
    return api_response([category_to_dict(c) for c in categories])


@bp.route("", methods=["POST"])
def create_category():
    """
    创建新分类

    请求体:
        name: 分类名称（必填）
        icon: 图标（可选）
        color: 颜色（可选）

    Returns:
        创建成功的分类数据
    """
    db = get_db()
    data = request.get_json()

    if not data or not data.get("name"):
        return api_response(None, 400, "分类名称不能为空")

    name = data["name"].strip()
    if not name:
        return api_response(None, 400, "分类名称不能为空")

    if len(name) > 50:
        return api_response(None, 422, "分类名称长度不能超过50个字符")

    existing = db.query(Category).filter(Category.name == name).first()
    if existing:
        return api_response(None, 400, "分类名称已存在")

    category = Category(
        name=name,
        icon=data.get("icon"),
        color=data.get("color")
    )
    db.add(category)
    db.commit()
    db.refresh(category)

    return api_response(category_to_dict(category), 201)


@bp.route("/<int:category_id>", methods=["PUT"])
def update_category(category_id):
    """
    更新分类信息

    Args:
        category_id: 分类 ID

    请求体:
        name: 分类名称（可选）
        icon: 图标（可选）
        color: 颜色（可选）

    Returns:
        更新后的分类数据
    """
    db = get_db()
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        return api_response(None, 404, "分类不存在")

    data = request.get_json() or {}

    if "name" in data:
        name = data["name"].strip() if data["name"] else None
        if not name:
            return api_response(None, 400, "分类名称不能为空")
        if len(name) > 50:
            return api_response(None, 422, "分类名称长度不能超过50个字符")
        existing = db.query(Category).filter(
            Category.name == name,
            Category.id != category_id
        ).first()
        if existing:
            return api_response(None, 400, "分类名称已存在")
        category.name = name

    if "icon" in data:
        category.icon = data["icon"]
    if "color" in data:
        category.color = data["color"]

    db.commit()
    db.refresh(category)

    return api_response(category_to_dict(category))


@bp.route("/<int:category_id>", methods=["DELETE"])
def delete_category(category_id):
    """
    删除分类

    Args:
        category_id: 分类 ID

    Returns:
        删除成功信息
    """
    db = get_db()
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        return api_response(None, 404, "分类不存在")

    member_count = db.query(Member).filter(Member.category_id == category_id).count()
    if member_count > 0:
        return api_response(None, 400, "该分类下存在会员，无法删除")

    db.delete(category)
    db.commit()

    return api_response({"deleted": True})