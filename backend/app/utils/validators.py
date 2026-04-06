"""
数据验证工具

提供常用的数据验证函数。
"""

import re
from typing import Optional, Tuple


def validate_color(color: Optional[str]) -> Tuple[bool, Optional[str]]:
    """
    验证颜色格式

    Args:
        color: 颜色字符串，应为 #RRGGBB 格式

    Returns:
        (是否有效, 错误消息)

    Example:
        >>> validate_color("#FF5722")
        (True, None)
        >>> validate_color("red")
        (False, "颜色格式错误，必须为 #RRGGBB 格式")
    """
    if color is None:
        return True, None

    if not re.match(r'^#[0-9A-Fa-f]{6}$', color):
        return False, "颜色格式错误，必须为 #RRGGBB 格式"

    return True, None


def validate_string_length(value: Optional[str], field_name: str, min_len: int = 1, max_len: int = 255) -> Tuple[bool, Optional[str]]:
    """
    验证字符串长度

    Args:
        value: 字符串值
        field_name: 字段名称（用于错误消息）
        min_len: 最小长度
        max_len: 最大长度

    Returns:
        (是否有效, 错误消息)

    Example:
        >>> validate_string_length("test", "name", 1, 100)
        (True, None)
        >>> validate_string_length("", "name", 1, 100)
        (False, "name长度必须在1-100之间")
    """
    if value is None:
        return True, None

    if not isinstance(value, str):
        return False, f"{field_name}必须为字符串"

    length = len(value.strip())
    if length < min_len or length > max_len:
        return False, f"{field_name}长度必须在{min_len}-{max_len}之间"

    return True, None


def validate_positive_number(value: Optional[float], field_name: str, allow_zero: bool = True) -> Tuple[bool, Optional[str]]:
    """
    验证正数

    Args:
        value: 数值
        field_name: 字段名称
        allow_zero: 是否允许为零

    Returns:
        (是否有效, 错误消息)
    """
    if value is None:
        return True, None

    try:
        num = float(value)
        if allow_zero:
            if num < 0:
                return False, f"{field_name}不能为负数"
        else:
            if num <= 0:
                return False, f"{field_name}必须大于0"
        return True, None
    except (TypeError, ValueError):
        return False, f"{field_name}必须为有效数字"