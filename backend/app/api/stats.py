"""
统计分析 API

提供四个统计接口：
1. /overview - 概览数据（会员总数、活跃数、月度/年度支出）
2. /spending - 按日期范围统计支出
3. /by-category - 按分类统计支出
4. /trend - 支出趋势数据

核心计算逻辑：
- 日均支出 = 价格 / 计费周期天数
- 实际支出 = 日均支出 * 实际使用天数
- 数据来源：Subscription 表（而非 Member 表）
"""

from flask import Blueprint, request
from datetime import datetime, timedelta
from decimal import Decimal
from collections import defaultdict
from sqlalchemy.orm import joinedload
from app.database import get_db
from app.models.models import Member, Subscription, Category
from app.utils.response import api_response
from app.utils.currency import convert_to_base, get_base_currency, calculate_daily_rate, get_billing_cycle_days

bp = Blueprint("stats", __name__, url_prefix="/api/stats")


def calculate_overlap_days(sub_start, sub_end, query_start, query_end):
    """
    计算订阅与查询时间范围的重叠天数
    
    Args:
        sub_start: 订阅开始日期
        sub_end: 订阅结束日期
        query_start: 查询开始日期
        query_end: 查询结束日期
        
    Returns:
        int: 重叠天数
    """
    start = max(sub_start, query_start)
    end = min(sub_end, query_end)
    if start > end:
        return 0
    start_dt = datetime.strptime(start, "%Y-%m-%d")
    end_dt = datetime.strptime(end, "%Y-%m-%d")
    return (end_dt - start_dt).days + 1


@bp.route("/overview", methods=["GET"])
def get_overview():
    """
    获取概览数据
    
    Returns:
        - total_members: 会员总数
        - active_members: 当前活跃的会员数（有任意订阅有效）
        - monthly_spending: 本月支出
        - yearly_spending: 本年支出
    """
    db = get_db()
    today = datetime.now().strftime("%Y-%m-%d")
    month_start = datetime.now().replace(day=1).strftime("%Y-%m-%d")
    month_end = (datetime.now().replace(day=1) + timedelta(days=32)).replace(day=1) - timedelta(days=1)
    month_end_str = month_end.strftime("%Y-%m-%d")
    year_start = datetime.now().replace(month=1, day=1).strftime("%Y-%m-%d")
    year_end = datetime.now().replace(month=12, day=31).strftime("%Y-%m-%d")

    total_members = db.query(Member).count()
    
    active_member_ids = db.query(Subscription.member_id).filter(
        Subscription.end_date >= today
    ).distinct().count()

    subscriptions = db.query(Subscription).options(
        joinedload(Subscription.member).joinedload(Member.category)
    ).filter(
        Subscription.end_date >= year_start,
        Subscription.start_date <= year_end
    ).all()

    monthly_spending = Decimal("0")
    yearly_spending = Decimal("0")

    for sub in subscriptions:
        daily_rate = calculate_daily_rate(
            sub.price, sub.billing_cycle, sub.custom_days, sub.start_date
        )
        daily_rate_cny = convert_to_base(daily_rate, sub.currency)

        month_overlap = calculate_overlap_days(
            sub.start_date, sub.end_date, month_start, month_end_str
        )
        monthly_spending += daily_rate_cny * Decimal(month_overlap)

        year_overlap = calculate_overlap_days(
            sub.start_date, sub.end_date, year_start, year_end
        )
        yearly_spending += daily_rate_cny * Decimal(year_overlap)

    return api_response({
        "total_members": total_members,
        "active_members": active_member_ids,
        "monthly_spending": float(monthly_spending.quantize(Decimal("0.01"))),
        "yearly_spending": float(yearly_spending.quantize(Decimal("0.01")))
    })


@bp.route("/spending", methods=["GET"])
def get_spending():
    """
    按日期范围统计支出
    
    查询参数:
        start_date: 开始日期（必填）
        end_date: 结束日期（必填）
        
    Returns:
        - total: 总支出
        - daily_average: 日均支出
        - by_currency: 按币种分组的支出
        - categories: 按分类统计的支出
    """
    db = get_db()
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")

    if not start_date or not end_date:
        return api_response(None, 400, "开始日期和结束日期不能为空")

    if start_date > end_date:
        return api_response(None, 400, "开始日期不能大于结束日期")

    subscriptions = db.query(Subscription).options(
        joinedload(Subscription.member).joinedload(Member.category)
    ).filter(
        Subscription.end_date >= start_date,
        Subscription.start_date <= end_date
    ).all()

    total = Decimal("0")
    by_currency = defaultdict(Decimal)
    category_stats = defaultdict(lambda: {"total": Decimal("0"), "count": 0})

    for sub in subscriptions:
        daily_rate = calculate_daily_rate(
            sub.price, sub.billing_cycle, sub.custom_days, sub.start_date
        )
        daily_rate_cny = convert_to_base(daily_rate, sub.currency)
        overlap_days = calculate_overlap_days(
            sub.start_date, sub.end_date, start_date, end_date
        )

        spending = daily_rate_cny * Decimal(overlap_days)
        total += spending
        by_currency[sub.currency] += daily_rate * Decimal(overlap_days)

        member = sub.member
        cat_name = member.category.name if member and member.category else "未分类"
        cat_key = (member.category_id, cat_name, member.category.icon if member and member.category else None, member.category.color if member and member.category else None)
        if member and member.category_id:
            category_stats[cat_key]["total"] += spending
            category_stats[cat_key]["count"] += 1

    start_dt = datetime.strptime(start_date, "%Y-%m-%d")
    end_dt = datetime.strptime(end_date, "%Y-%m-%d")
    total_days = (end_dt - start_dt).days + 1
    daily_average = total / Decimal(total_days) if total_days > 0 else Decimal("0")

    categories_data = []
    for (cat_id, cat_name, cat_icon, cat_color), stats in category_stats.items():
        percentage = float(stats["total"] / total * 100) if total > 0 else 0
        categories_data.append({
            "category_id": cat_id,
            "category_name": cat_name,
            "category_icon": cat_icon,
            "category_color": cat_color,
            "total": float(stats["total"].quantize(Decimal("0.01"))),
            "count": int(stats["count"]),
            "percentage": round(percentage, 2)
        })

    categories_data.sort(key=lambda x: x["total"], reverse=True)

    return api_response({
        "total": float(total.quantize(Decimal("0.01"))),
        "daily_average": float(daily_average.quantize(Decimal("0.01"))),
        "by_currency": {k: float(v.quantize(Decimal("0.01"))) for k, v in by_currency.items()},
        "categories": categories_data
    })


@bp.route("/by-category", methods=["GET"])
def get_by_category():
    """
    按分类统计支出
    
    查询参数:
        start_date: 开始日期（必填）
        end_date: 结束日期（必填）
        
    Returns:
        各分类的支出统计，包含订阅明细
    """
    db = get_db()
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")

    if not start_date or not end_date:
        return api_response(None, 400, "开始日期和结束日期不能为空")

    if start_date > end_date:
        return api_response(None, 400, "开始日期不能大于结束日期")

    subscriptions = db.query(Subscription).options(
        joinedload(Subscription.member).joinedload(Member.category)
    ).filter(
        Subscription.end_date >= start_date,
        Subscription.start_date <= end_date
    ).all()

    category_totals = defaultdict(Decimal)
    category_details = defaultdict(list)
    category_meta = {}
    total = Decimal("0")

    for sub in subscriptions:
        daily_rate = calculate_daily_rate(
            sub.price, sub.billing_cycle, sub.custom_days, sub.start_date
        )
        daily_rate_cny = convert_to_base(daily_rate, sub.currency)
        overlap_days = calculate_overlap_days(
            sub.start_date, sub.end_date, start_date, end_date
        )

        spending = daily_rate_cny * Decimal(overlap_days)
        total += spending

        member = sub.member
        if member and member.category_id:
            category_totals[member.category_id] += spending
            category_details[member.category_id].append({
                "subscription_id": sub.id,
                "member_name": member.name,
                "level": sub.level,
                "amount": float(spending.quantize(Decimal("0.01")))
            })
            if member.category and member.category_id not in category_meta:
                category_meta[member.category_id] = member.category

    result = []
    for cat_id, cat_total in category_totals.items():
        category = category_meta.get(cat_id)
        if category:
            percentage = float(cat_total / total * 100) if total > 0 else 0
            result.append({
                "category_id": cat_id,
                "category_name": category.name,
                "category_icon": category.icon,
                "category_color": category.color,
                "total": float(cat_total.quantize(Decimal("0.01"))),
                "percentage": round(percentage, 2),
                "details": sorted(category_details[cat_id], key=lambda x: x["amount"], reverse=True)
            })

    result.sort(key=lambda x: x["total"], reverse=True)

    return api_response({
        "categories": result,
        "total": float(total.quantize(Decimal("0.01")))
    })


@bp.route("/trend", methods=["GET"])
def get_trend():
    """
    获取支出趋势数据
    
    查询参数:
        start_date: 开始日期（必填）
        end_date: 结束日期（必填）
        granularity: 统计粒度，默认 month
        
    Returns:
        趋势数据列表，包含按分类分组的订阅明细
    """
    db = get_db()
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    granularity = request.args.get("granularity", "month")

    if not start_date or not end_date:
        return api_response(None, 400, "开始日期和结束日期不能为空")

    if granularity not in ["day", "month", "week", "quarter"]:
        return api_response(None, 422, "granularity必须是 day/month/week/quarter")

    if start_date > end_date:
        return api_response(None, 400, "开始日期不能大于结束日期")

    start_dt = datetime.strptime(start_date, "%Y-%m-%d")
    end_dt = datetime.strptime(end_date, "%Y-%m-%d")

    periods = []
    current = start_dt

    if granularity == "day":
        while current <= end_dt:
            periods.append((current.strftime("%Y-%m-%d"), current.strftime("%Y-%m-%d")))
            current += timedelta(days=1)

    elif granularity == "month":
        first_month_start = start_dt.replace(day=1)
        last_month_start = end_dt.replace(day=1)
        
        current = first_month_start
        while current <= last_month_start:
            period_start = current
            next_month = current.replace(day=28) + timedelta(days=4)
            period_end = next_month.replace(day=1) - timedelta(days=1)
            periods.append((period_start.strftime("%Y-%m-%d"), period_end.strftime("%Y-%m-%d"), period_start.strftime("%Y-%m")))
            current = next_month.replace(day=1)

    elif granularity == "week":
        first_monday = start_dt
        days_since_monday = first_monday.weekday()
        if days_since_monday != 0:
            first_monday = first_monday + timedelta(days=(7 - days_since_monday))
        
        last_monday = end_dt
        days_since_monday = last_monday.weekday()
        if days_since_monday != 0:
            last_monday = last_monday - timedelta(days=days_since_monday)
        
        current = first_monday
        while current <= last_monday:
            period_start = current
            period_end = current + timedelta(days=6)
            label = f"{period_start.strftime('%m/%d')}-{period_end.strftime('%m/%d')}"
            periods.append((period_start.strftime("%Y-%m-%d"), period_end.strftime("%Y-%m-%d"), label))
            current = current + timedelta(days=7)

    elif granularity == "quarter":
        def get_quarter_start(dt):
            quarter = (dt.month - 1) // 3
            return dt.replace(month=quarter * 3 + 1, day=1)
        
        def get_quarter_end(dt):
            quarter = (dt.month - 1) // 3
            quarter_end_month = quarter * 3 + 3
            if quarter_end_month >= 12:
                return dt.replace(year=dt.year + 1, month=1, day=1) - timedelta(days=1)
            else:
                return dt.replace(month=quarter_end_month + 1, day=1) - timedelta(days=1)
        
        first_quarter_start = get_quarter_start(start_dt)
        last_quarter_start = get_quarter_start(end_dt)
        
        current = first_quarter_start
        while current <= last_quarter_start:
            period_start = current
            period_end = get_quarter_end(current)
            quarter_num = (current.month - 1) // 3 + 1
            label = f"{current.year}-Q{quarter_num}"
            periods.append((period_start.strftime("%Y-%m-%d"), period_end.strftime("%Y-%m-%d"), label))
            quarter_end_month = current.month + 2
            if quarter_end_month == 12:
                current = current.replace(year=current.year + 1, month=1, day=1)
            else:
                current = current.replace(month=quarter_end_month + 1, day=1)

    subscriptions = db.query(Subscription).options(
        joinedload(Subscription.member).joinedload(Member.category)
    ).filter(
        Subscription.end_date >= start_date,
        Subscription.start_date <= end_date
    ).all()

    trend_data = []
    for period in periods:
        if len(period) == 3:
            period_start, period_end, label = period
        else:
            period_start, period_end = period
            label = period_start

        category_details = {}

        for sub in subscriptions:
            daily_rate = calculate_daily_rate(
                sub.price, sub.billing_cycle, sub.custom_days, sub.start_date
            )
            daily_rate_cny = convert_to_base(daily_rate, sub.currency)
            overlap_days = calculate_overlap_days(
                sub.start_date, sub.end_date, period_start, period_end
            )

            if overlap_days > 0:
                sub_spending = daily_rate_cny * Decimal(overlap_days)
                member = sub.member
                cat_name = member.category.name if member and member.category else "未分类"
                cat_color = member.category.color if member and member.category else "#999999"
                cat_id = member.category_id if member else 0
                
                if cat_id not in category_details:
                    category_details[cat_id] = {
                        "category_name": cat_name,
                        "category_color": cat_color,
                        "total": Decimal("0"),
                        "subscriptions": []
                    }
                
                category_details[cat_id]["total"] += sub_spending
                category_details[cat_id]["subscriptions"].append({
                    "subscription_id": sub.id,
                    "member_name": member.name if member else "未知",
                    "level": sub.level,
                    "amount": float(sub_spending.quantize(Decimal("0.01")))
                })

        details_list = []
        period_total = Decimal("0")
        for cat_id in sorted(category_details.keys(), key=lambda x: category_details[x]["total"], reverse=True):
            cat_data = category_details[cat_id]
            if cat_data["total"] > 0:
                details_list.append({
                    "category_id": cat_id,
                    "category_name": cat_data["category_name"],
                    "category_color": cat_data["category_color"],
                    "total": float(cat_data["total"].quantize(Decimal("0.01"))),
                    "subscriptions": sorted(cat_data["subscriptions"], key=lambda x: x["amount"], reverse=True)
                })
                period_total += cat_data["total"]

        trend_data.append({
            "date": label,
            "amount": float(period_total.quantize(Decimal("0.01"))),
            "details": details_list
        })

    return api_response({"trend": trend_data})