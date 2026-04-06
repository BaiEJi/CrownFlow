"""
会员管理 API

提供会员的 CRUD 操作和查询功能：
- GET /api/members - 获取会员列表（支持分页、筛选、排序）
- GET /api/members/<id> - 获取单个会员详情（包含所有订阅记录）
- POST /api/members - 创建会员（可选同时创建第一条订阅）
- PUT /api/members/<id> - 更新会员主表信息
- DELETE /api/members/<id> - 删除会员（级联删除所有订阅）

会员状态逻辑：
- 任意一条订阅有效则会员状态为 active
- 所有订阅都过期则会员状态为 expired

聚合字段：
- latest_subscription: 最新有效订阅信息
- subscription_count: 订阅记录数
- total_spending: 累计花费
"""

from datetime import datetime
from decimal import Decimal
from flask import Blueprint, request
from sqlalchemy.orm import joinedload
from sqlalchemy import func as sql_func
from app.database import get_db
from app.models.models import Member, Subscription, Category
from app.api.categories import category_to_dict
from app.utils.response import api_response
from app.utils.currency import convert_to_base, calculate_daily_rate, get_billing_cycle_days
from app.config import settings

bp = Blueprint("members", __name__, url_prefix="/api/members")


def validate_member_name(name: str):
    """
    验证会员名称
    
    Args:
        name: 会员名称
        
    Returns:
        tuple: (处理后的名称, 错误信息)，验证成功时错误信息为 None
    """
    if not name:
        return None, "会员名称不能为空"
    name = name.strip()
    if not name:
        return None, "会员名称不能为空"
    if len(name) > 100:
        return None, "会员名称长度不能超过100个字符"
    return name, None


def subscription_to_dict(subscription):
    """
    将 Subscription 对象转换为字典
    
    Args:
        subscription: Subscription 实例
        
    Returns:
        dict: 字典格式的订阅数据
    """
    return {
        "id": subscription.id,
        "member_id": subscription.member_id,
        "level": subscription.level,
        "price": float(subscription.price) if subscription.price else 0,
        "currency": subscription.currency,
        "billing_cycle": subscription.billing_cycle,
        "custom_days": subscription.custom_days,
        "start_date": subscription.start_date,
        "end_date": subscription.end_date,
        "channel": subscription.channel,
        "notes": subscription.notes,
        "created_at": subscription.created_at.isoformat() if subscription.created_at else None,
        "updated_at": subscription.updated_at.isoformat() if subscription.updated_at else None
    }


def member_to_dict(member, include_subscriptions=False):
    """
    将 Member 对象转换为字典
    
    Args:
        member: Member 实例
        include_subscriptions: 是否包含所有订阅记录
        
    Returns:
        dict: 字典格式的会员数据，包含聚合字段
    """
    today = datetime.now().strftime("%Y-%m-%d")
    
    subscriptions = sorted(member.subscriptions, key=lambda s: s.created_at, reverse=True) if member.subscriptions else []
    
    active_subscriptions = [s for s in subscriptions if s.end_date >= today]
    
    latest_subscription = None
    if active_subscriptions:
        latest_subscription = subscription_to_dict(active_subscriptions[0])
    elif subscriptions:
        latest_subscription = subscription_to_dict(subscriptions[0])
    
    status = "active" if active_subscriptions else "expired"
    
    total_spending = Decimal("0")
    total_duration_days = 0
    for s in subscriptions:
        price_cny = convert_to_base(s.price, s.currency) if s.price else Decimal("0")
        total_spending += price_cny
        start = datetime.strptime(s.start_date, "%Y-%m-%d")
        end = datetime.strptime(s.end_date, "%Y-%m-%d")
        total_duration_days += (end - start).days
    
    result = {
        "id": member.id,
        "name": member.name,
        "category_id": member.category_id,
        "category": category_to_dict(member.category) if member.category else None,
        "notes": member.notes,
        "reminder_days": member.reminder_days,
        "latest_subscription": latest_subscription,
        "status": status,
        "subscription_count": len(subscriptions),
        "total_spending": float(total_spending.quantize(Decimal("0.01"))),
        "total_duration_days": total_duration_days,
        "created_at": member.created_at.isoformat() if member.created_at else None,
        "updated_at": member.updated_at.isoformat() if member.updated_at else None
    }
    
    if include_subscriptions:
        result["subscriptions"] = [subscription_to_dict(s) for s in subscriptions]
    
    return result


@bp.route("", methods=["GET"])
def get_members():
    """
    获取会员列表
    
    查询参数:
        page: 页码，默认1
        page_size: 每页数量，默认10
        category_id: 按分类筛选
        status: 按状态筛选（active/expired）
        sort_by: 排序字段（created_at/name/total_spending/subscription_count）
        order: 排序方向（asc/desc）
        
    Returns:
        会员列表，包含聚合字段
    """
    db = get_db()
    page = request.args.get("page", 1, type=int)
    page_size = request.args.get("page_size", 10, type=int)
    page_size = min(page_size, settings.max_page_size)

    query = db.query(Member).options(
        joinedload(Member.category),
        joinedload(Member.subscriptions)
    )

    keyword = request.args.get("keyword", "").strip()
    if keyword:
        query = query.filter(Member.name.ilike(f"%{keyword}%"))

    sort_by = request.args.get("sort_by", "created_at")
    order = request.args.get("order", "desc")
    valid_sort_fields = ["created_at", "name"]
    if sort_by not in valid_sort_fields:
        return api_response(None, 422, f"无效的排序字段，可选: {', '.join(valid_sort_fields)}")

    category_id = request.args.get("category_id", type=int)
    if category_id:
        query = query.filter(Member.category_id == category_id)

    status = request.args.get("status")
    if status:
        today = datetime.now().strftime("%Y-%m-%d")
        if status == "active":
            active_member_ids = db.query(Subscription.member_id).filter(
                Subscription.end_date >= today
            ).distinct().subquery()
            query = query.filter(Member.id.in_(active_member_ids))
        elif status == "expired":
            active_member_ids = db.query(Subscription.member_id).filter(
                Subscription.end_date >= today
            ).distinct().subquery()
            query = query.filter(Member.id.notin_(active_member_ids))
        else:
            return api_response(None, 400, "status 必须是 active 或 expired")

    sort_by = request.args.get("sort_by", "created_at")
    order = request.args.get("order", "desc")
    valid_sort_fields = ["created_at", "name"]
    if sort_by not in valid_sort_fields:
        return api_response(None, 422, f"无效的排序字段，可选: {', '.join(valid_sort_fields)}")

    sort_column = getattr(Member, sort_by)
    if order == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()

    return api_response({
        "items": [member_to_dict(m) for m in items],
        "total": total
    })


@bp.route("/<int:member_id>", methods=["GET"])
def get_member(member_id):
    """
    获取单个会员详情
    
    路径参数:
        member_id: 会员ID
        
    Returns:
        会员详情，包含所有订阅记录
    """
    db = get_db()
    member = db.query(Member).options(
        joinedload(Member.category),
        joinedload(Member.subscriptions)
    ).filter(Member.id == member_id).first()
    
    if not member:
        return api_response(None, 404, "会员不存在")
    
    return api_response(member_to_dict(member, include_subscriptions=True))


@bp.route("", methods=["POST"])
def create_member():
    """
    创建新会员
    
    请求体:
        name: 会员名称（必填）
        category_id: 分类ID（可选）
        notes: 备注（可选）
        reminder_days: 提醒天数（可选，默认7）
        subscription: 首条订阅信息（可选）
            - level: 会员级别
            - price: 价格（必填）
            - currency: 币种
            - billing_cycle: 计费周期（必填）
            - custom_days: 自定义天数
            - start_date: 开始日期（必填）
            - end_date: 结束日期（必填）
            - channel: 订阅渠道
            - notes: 备注
            
    Returns:
        创建的会员信息
    """
    db = get_db()
    data = request.get_json()

    if not data:
        return api_response(None, 400, "请求体不能为空")

    name, error = validate_member_name(data.get("name", ""))
    if error:
        return api_response(None, 400, error) if "不能为空" in error else api_response(None, 422, error)

    if data.get("category_id"):
        category = db.query(Category).filter(Category.id == data["category_id"]).first()
        if not category:
            return api_response(None, 400, "分类不存在")

    member = Member(
        name=name,
        category_id=data.get("category_id"),
        notes=data.get("notes"),
        reminder_days=data.get("reminder_days", settings.default_reminder_days)
    )
    db.add(member)
    db.flush()

    subscription_data = data.get("subscription")
    if subscription_data:
        if subscription_data.get("price") is None:
            return api_response(None, 400, "订阅价格不能为空")
        if not subscription_data.get("billing_cycle"):
            return api_response(None, 400, "订阅计费周期不能为空")
        if not subscription_data.get("start_date") or not subscription_data.get("end_date"):
            return api_response(None, 400, "订阅开始日期和结束日期不能为空")
        
        try:
            datetime.strptime(subscription_data["start_date"], "%Y-%m-%d")
        except ValueError:
            return api_response(None, 422, "订阅开始日期格式错误，应为 YYYY-MM-DD")
        
        try:
            datetime.strptime(subscription_data["end_date"], "%Y-%m-%d")
        except ValueError:
            return api_response(None, 422, "订阅结束日期格式错误，应为 YYYY-MM-DD")
        
        if subscription_data["start_date"] > subscription_data["end_date"]:
            return api_response(None, 400, "订阅开始日期不能大于结束日期")
        
        valid_cycles = ["monthly", "quarterly", "yearly", "custom"]
        if subscription_data["billing_cycle"] not in valid_cycles:
            return api_response(None, 400, f"订阅计费周期必须是: {', '.join(valid_cycles)}")
        
        subscription = Subscription(
            member_id=member.id,
            level=subscription_data.get("level"),
            price=subscription_data["price"],
            currency=subscription_data.get("currency", "CNY"),
            billing_cycle=subscription_data["billing_cycle"],
            custom_days=subscription_data.get("custom_days"),
            start_date=subscription_data["start_date"],
            end_date=subscription_data["end_date"],
            channel=subscription_data.get("channel"),
            notes=subscription_data.get("notes")
        )
        db.add(subscription)

    db.commit()
    db.refresh(member)

    return api_response(member_to_dict(member, include_subscriptions=True), 201)


@bp.route("/<int:member_id>", methods=["PUT"])
def update_member(member_id):
    """
    更新会员主表信息
    
    路径参数:
        member_id: 会员ID
        
    请求体:
        name: 会员名称
        category_id: 分类ID
        notes: 备注
        reminder_days: 提醒天数
        
    Returns:
        更新后的会员信息
    """
    db = get_db()
    member = db.query(Member).options(
        joinedload(Member.category),
        joinedload(Member.subscriptions)
    ).filter(Member.id == member_id).first()
    
    if not member:
        return api_response(None, 404, "会员不存在")

    data = request.get_json() or {}

    if "name" in data:
        name, error = validate_member_name(data["name"])
        if error:
            return api_response(None, 400, error) if "不能为空" in error else api_response(None, 422, error)
        member.name = name

    if "category_id" in data and data["category_id"]:
        category = db.query(Category).filter(Category.id == data["category_id"]).first()
        if not category:
            return api_response(None, 400, "分类不存在")

    for field in ["category_id", "notes", "reminder_days"]:
        if field in data:
            setattr(member, field, data[field])

    db.commit()
    db.refresh(member)

    return api_response(member_to_dict(member, include_subscriptions=True))


@bp.route("/<int:member_id>", methods=["DELETE"])
def delete_member(member_id):
    """
    删除会员
    
    路径参数:
        member_id: 会员ID
        
    说明:
        级联删除所有关联的订阅记录
        
    Returns:
        删除结果
    """
    db = get_db()
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        return api_response(None, 404, "会员不存在")

    db.delete(member)
    db.commit()

    return api_response({"deleted": True})