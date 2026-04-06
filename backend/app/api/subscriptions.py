"""
订阅记录管理 API

提供订阅记录的 CRUD 操作：
- GET /api/members/<member_id>/subscriptions - 获取会员的所有订阅
- POST /api/members/<member_id>/subscriptions - 为会员创建订阅（续费）
- GET /api/subscriptions/<id> - 获取单个订阅详情
- PUT /api/subscriptions/<id> - 更新订阅
- DELETE /api/subscriptions/<id> - 删除订阅

支持的功能：
- 按状态筛选（active/expired）
- 按日期范围筛选
- 排序
"""

from datetime import datetime
from decimal import Decimal
from flask import Blueprint, request
from sqlalchemy.orm import joinedload
from app.database import get_db
from app.models.models import Member, Subscription
from app.utils.response import api_response
from app.config import settings

bp = Blueprint("subscriptions", __name__, url_prefix="/api")


def validate_date(date_str: str, field_name: str):
    """
    验证日期格式
    
    Args:
        date_str: 日期字符串
        field_name: 字段名称，用于错误提示
        
    Returns:
        tuple: (日期对象, 错误信息)，验证成功时错误信息为 None
    """
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").date(), None
    except (ValueError, TypeError):
        return None, f"{field_name}格式错误，应为 YYYY-MM-DD"


def validate_price(price, field_name: str = "价格"):
    """
    验证价格
    
    Args:
        price: 价格值
        field_name: 字段名称，用于错误提示
        
    Returns:
        tuple: (价格浮点数, 错误信息)，验证成功时错误信息为 None
    """
    try:
        price_float = float(price)
        if price_float < 0:
            return None, f"{field_name}不能为负数"
        return price_float, None
    except (ValueError, TypeError):
        return None, f"{field_name}必须为有效数字"


def validate_custom_days(custom_days):
    """
    验证自定义天数
    
    Args:
        custom_days: 自定义天数
        
    Returns:
        tuple: (天数整数, 错误信息)，验证成功时错误信息为 None
    """
    if custom_days is None:
        return None, "自定义天数不能为空"
    try:
        days = int(custom_days)
        if days <= 0:
            return None, "自定义天数必须大于0"
        return days, None
    except (ValueError, TypeError):
        return None, "自定义天数必须为整数"


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


@bp.route("/members/<int:member_id>/subscriptions", methods=["GET"])
def get_member_subscriptions(member_id):
    """
    获取会员的所有订阅记录
    
    路径参数:
        member_id: 会员ID
        
    查询参数:
        status: 状态筛选（active/expired）
        start_date: 开始日期筛选
        end_date: 结束日期筛选
        sort_by: 排序字段（start_date/end_date/price/created_at）
        order: 排序方向（asc/desc）
        
    Returns:
        订阅记录列表
    """
    db = get_db()
    
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        return api_response(None, 404, "会员不存在")
    
    query = db.query(Subscription).filter(Subscription.member_id == member_id)
    
    status = request.args.get("status")
    if status:
        today = datetime.now().strftime("%Y-%m-%d")
        if status == "active":
            query = query.filter(Subscription.end_date >= today)
        elif status == "expired":
            query = query.filter(Subscription.end_date < today)
        else:
            return api_response(None, 400, "status 必须是 active 或 expired")
    
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    if start_date and end_date:
        if start_date > end_date:
            return api_response(None, 400, "开始日期不能大于结束日期")
        query = query.filter(
            Subscription.start_date <= end_date,
            Subscription.end_date >= start_date
        )
    
    sort_by = request.args.get("sort_by", "created_at")
    order = request.args.get("order", "desc")
    valid_sort_fields = ["created_at", "start_date", "end_date", "price"]
    if sort_by not in valid_sort_fields:
        return api_response(None, 422, f"无效的排序字段，可选: {', '.join(valid_sort_fields)}")
    
    sort_column = getattr(Subscription, sort_by)
    if order == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())
    
    subscriptions = query.all()
    
    return api_response({
        "items": [subscription_to_dict(s) for s in subscriptions],
        "total": len(subscriptions)
    })


@bp.route("/members/<int:member_id>/subscriptions", methods=["POST"])
def create_subscription(member_id):
    """
    为会员创建订阅记录（续费）
    
    路径参数:
        member_id: 会员ID
        
    请求体:
        level: 会员级别（可选）
        price: 价格（必填）
        currency: 币种（可选，默认CNY）
        billing_cycle: 计费周期（必填）
        custom_days: 自定义天数（billing_cycle=custom 时必填）
        start_date: 开始日期（必填）
        end_date: 结束日期（必填）
        channel: 订阅渠道（可选）
        notes: 备注（可选）
        
    Returns:
        创建的订阅记录
    """
    db = get_db()
    
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        return api_response(None, 404, "会员不存在")
    
    data = request.get_json()
    if not data:
        return api_response(None, 400, "请求体不能为空")
    
    if data.get("price") is None:
        return api_response(None, 400, "价格不能为空")
    price, error = validate_price(data["price"])
    if error:
        return api_response(None, 422, error)
    
    if not data.get("billing_cycle"):
        return api_response(None, 400, "计费周期不能为空")
    
    if not data.get("start_date") or not data.get("end_date"):
        return api_response(None, 400, "开始日期和结束日期不能为空")
    
    _, error = validate_date(data["start_date"], "开始日期")
    if error:
        return api_response(None, 422, error)
    
    _, error = validate_date(data["end_date"], "结束日期")
    if error:
        return api_response(None, 422, error)
    
    if data["start_date"] > data["end_date"]:
        return api_response(None, 400, "开始日期不能大于结束日期")
    
    valid_cycles = ["monthly", "quarterly", "yearly", "custom"]
    if data["billing_cycle"] not in valid_cycles:
        return api_response(None, 400, f"计费周期必须是: {', '.join(valid_cycles)}")
    
    custom_days = None
    if data["billing_cycle"] == "custom":
        custom_days, error = validate_custom_days(data.get("custom_days"))
        if error:
            return api_response(None, 400, error)
    
    subscription = Subscription(
        member_id=member_id,
        level=data.get("level"),
        price=price,
        currency=data.get("currency", "CNY"),
        billing_cycle=data["billing_cycle"],
        custom_days=custom_days,
        start_date=data["start_date"],
        end_date=data["end_date"],
        channel=data.get("channel"),
        notes=data.get("notes")
    )
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    
    return api_response(subscription_to_dict(subscription), 201)


@bp.route("/subscriptions/<int:subscription_id>", methods=["GET"])
def get_subscription(subscription_id):
    """
    获取单个订阅详情
    
    路径参数:
        subscription_id: 订阅ID
        
    Returns:
        订阅详情
    """
    db = get_db()
    subscription = db.query(Subscription).options(
        joinedload(Subscription.member)
    ).filter(Subscription.id == subscription_id).first()
    
    if not subscription:
        return api_response(None, 404, "订阅记录不存在")
    
    result = subscription_to_dict(subscription)
    if subscription.member:
        result["member_name"] = subscription.member.name
    
    return api_response(result)


@bp.route("/subscriptions/<int:subscription_id>", methods=["PUT"])
def update_subscription(subscription_id):
    """
    更新订阅记录
    
    路径参数:
        subscription_id: 订阅ID
        
    请求体:
        可更新的字段：level, price, currency, billing_cycle, custom_days,
                    start_date, end_date, channel, notes
                    
    Returns:
        更新后的订阅记录
    """
    db = get_db()
    subscription = db.query(Subscription).filter(Subscription.id == subscription_id).first()
    if not subscription:
        return api_response(None, 404, "订阅记录不存在")
    
    data = request.get_json() or {}
    
    if "price" in data and data.get("price") is not None:
        price, error = validate_price(data["price"])
        if error:
            return api_response(None, 422, error)
    
    start = data.get("start_date", subscription.start_date)
    end = data.get("end_date", subscription.end_date)
    if start > end:
        return api_response(None, 400, "开始日期不能大于结束日期")
    
    if "billing_cycle" in data:
        valid_cycles = ["monthly", "quarterly", "yearly", "custom"]
        if data["billing_cycle"] not in valid_cycles:
            return api_response(None, 400, f"计费周期必须是: {', '.join(valid_cycles)}")
    
    for field in ["level", "price", "currency", "billing_cycle", "custom_days",
                   "start_date", "end_date", "channel", "notes"]:
        if field in data:
            setattr(subscription, field, data[field])
    
    db.commit()
    db.refresh(subscription)
    
    return api_response(subscription_to_dict(subscription))


@bp.route("/subscriptions/<int:subscription_id>", methods=["DELETE"])
def delete_subscription(subscription_id):
    """
    删除订阅记录
    
    路径参数:
        subscription_id: 订阅ID
        
    Returns:
        删除结果
    """
    db = get_db()
    subscription = db.query(Subscription).filter(Subscription.id == subscription_id).first()
    if not subscription:
        return api_response(None, 404, "订阅记录不存在")
    
    db.delete(subscription)
    db.commit()
    
    return api_response({"deleted": True})