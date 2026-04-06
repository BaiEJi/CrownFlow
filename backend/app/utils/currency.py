"""
货币汇率工具模块

提供货币换算功能，将不同货币统一换算为基准货币（CNY）。
提供计费周期和日均支出计算功能。
"""

from decimal import Decimal
from calendar import monthrange
from app.config import settings


def get_billing_cycle_days(billing_cycle, custom_days, start_date):
    if billing_cycle == "monthly":
        year, month = map(int, start_date.split("-")[:2])
        return monthrange(year, month)[1]
    elif billing_cycle == "quarterly":
        return 90
    elif billing_cycle == "yearly":
        year = int(start_date[:4])
        return 366 if (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0) else 365
    elif billing_cycle == "custom":
        return custom_days or 30
    return 30


def calculate_daily_rate(price, billing_cycle, custom_days, start_date):
    days = get_billing_cycle_days(billing_cycle, custom_days, start_date)
    return Decimal(str(price)) / Decimal(days)


def get_exchange_rates() -> dict:
    """
    获取汇率配置
    
    Returns:
        汇率字典，键为货币代码，值为相对于基准货币的汇率
    """
    return settings.exchange_rates


def get_base_currency() -> str:
    """
    获取基准货币
    
    Returns:
        基准货币代码
    """
    return settings.base_currency


def convert_to_base(amount, from_currency: str) -> Decimal:
    """
    将金额转换为基准货币（CNY）
    
    Args:
        amount: 金额（支持 Decimal, float, int, str）
        from_currency: 原始货币代码
        
    Returns:
        转换后的金额（Decimal 类型）
    """
    if from_currency == settings.base_currency:
        return Decimal(str(amount))
    
    rates = settings.exchange_rates
    if from_currency not in rates:
        return Decimal(str(amount))
    
    rate = rates[from_currency]
    return Decimal(str(amount)) * Decimal(str(rate))


def format_currency_symbol(currency: str) -> str:
    """
    获取货币符号
    
    Args:
        currency: 货币代码
        
    Returns:
        货币符号
    """
    symbols = {
        "CNY": "¥",
        "USD": "$",
        "EUR": "€",
        "GBP": "£",
        "JPY": "¥",
    }
    return symbols.get(currency, currency)