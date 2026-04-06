"""
API 响应工具

提供统一的API响应格式。
"""

from flask import jsonify
from typing import Any, Tuple


def api_response(data: Any = None, code: int = 200, message: str = "success") -> Tuple[Any, int]:
    """
    统一 API 响应格式

    Args:
        data: 响应数据
        code: 业务状态码
        message: 响应消息

    Returns:
        JSON 响应和 HTTP 状态码
    """
    response = jsonify({"code": code, "message": message, "data": data})
    return response, 200 if code < 400 else code