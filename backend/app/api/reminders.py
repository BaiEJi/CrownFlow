"""
到期提醒 API

提供订阅到期查询接口：
- GET /api/reminders/upcoming - 获取即将到期的订阅列表
- GET /api/reminders/all - 获取所有未过期的订阅列表（用于日历视图）

业务逻辑：
1. 查询所有 end_date >= 今天 的订阅
2. 计算每个订阅的剩余天数 (days_remaining)
3. upcoming: 筛选 days_remaining <= member.reminder_days 的订阅
4. all: 返回所有未过期订阅

数据来源：Subscription 表（而非 Member 表）
"""

from flask import Blueprint, request
from datetime import datetime
from sqlalchemy.orm import joinedload
from app.database import get_db
from app.models.models import Member, Subscription
from app.utils.response import api_response

bp = Blueprint("reminders", __name__, url_prefix="/api/reminders")


@bp.route("/upcoming", methods=["GET"])
def get_upcoming_reminders():
    """
    获取即将到期的订阅列表
    
    返回所有在设定的提醒天数内即将到期的订阅。
    提醒天数来自会员主表的 reminder_days 字段。
    
    Returns:
        - subscription_id: 订阅 ID
        - member_id: 会员 ID
        - member_name: 会员名称
        - level: 会员级别
        - category_name: 分类名称
        - category_icon: 分类图标
        - end_date: 到期日期
        - days_remaining: 剩余天数
        - price: 价格
        - currency: 币种
    """
    db = get_db()
    today = datetime.now().date()

    subscriptions = db.query(Subscription).options(
        joinedload(Subscription.member)
    ).filter(
        Subscription.end_date >= today.strftime("%Y-%m-%d")
    ).order_by(Subscription.end_date).all()

    reminders = []
    for sub in subscriptions:
        end_date = datetime.strptime(sub.end_date, "%Y-%m-%d").date()
        days_remaining = (end_date - today).days

        member = sub.member
        if not member:
            continue

        if days_remaining <= member.reminder_days:
            category_name = member.category.name if member.category else None
            category_icon = member.category.icon if member.category else None
            category_color = member.category.color if member.category else None

            reminders.append({
                "subscription_id": sub.id,
                "member_id": member.id,
                "member_name": member.name,
                "level": sub.level,
                "category_name": category_name,
                "category_icon": category_icon,
                "category_color": category_color,
                "end_date": sub.end_date,
                "days_remaining": days_remaining,
                "price": float(sub.price) if sub.price else 0,
                "currency": sub.currency
            })

    reminders.sort(key=lambda x: x["days_remaining"])

    return api_response({"reminders": reminders})


@bp.route("/all", methods=["GET"])
def get_all_active_subscriptions():
    """
    获取所有未过期的订阅列表（用于日历视图）
    
    返回所有 end_date >= 今天的订阅，不限提醒天数。
    
    Returns:
        - subscription_id: 订阅 ID
        - member_id: 会员 ID
        - member_name: 会员名称
        - level: 会员级别
        - category_name: 分类名称
        - category_icon: 分类图标
        - end_date: 到期日期
        - days_remaining: 剩余天数
        - price: 价格
        - currency: 币种
    """
    db = get_db()
    today = datetime.now().date()

    subscriptions = db.query(Subscription).options(
        joinedload(Subscription.member).joinedload(Member.category)
    ).filter(
        Subscription.end_date >= today.strftime("%Y-%m-%d")
    ).order_by(Subscription.end_date).all()

    reminders = []
    for sub in subscriptions:
        end_date = datetime.strptime(sub.end_date, "%Y-%m-%d").date()
        days_remaining = (end_date - today).days

        member = sub.member
        if not member:
            continue

        category_name = member.category.name if member.category else None
        category_icon = member.category.icon if member.category else None
        category_color = member.category.color if member.category else None

        reminders.append({
            "subscription_id": sub.id,
            "member_id": member.id,
            "member_name": member.name,
            "level": sub.level,
            "category_name": category_name,
            "category_icon": category_icon,
            "category_color": category_color,
            "end_date": sub.end_date,
            "days_remaining": days_remaining,
            "price": float(sub.price) if sub.price else 0,
            "currency": sub.currency
        })

    reminders.sort(key=lambda x: x["days_remaining"])
    return api_response({"reminders": reminders})