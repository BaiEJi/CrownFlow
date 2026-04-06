"""
Flask 应用入口

初始化 Flask 应用，配置 CORS 和注册蓝图。
"""

import logging
from flask import Flask, jsonify, request
from flask.json.provider import DefaultJSONProvider
from flask_cors import CORS
from flask_httpauth import HTTPBasicAuth
from werkzeug.exceptions import HTTPException
from app.config import settings
from app.database import init_db, close_db
from app.api import journals_bp, events_bp, reflections_bp
from app.utils.response import api_response


class CustomJSONProvider(DefaultJSONProvider):
    def __init__(self, app):
        super().__init__(app)
        self.ensure_ascii = False


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

auth = HTTPBasicAuth()


@auth.verify_password
def verify_password(username, password):
    if not settings.auth_enabled:
        return True
    return username == settings.auth_username and password == settings.auth_password


@auth.error_handler
def auth_error(status=401):
    return api_response(None, status, "认证失败")


def create_app():
    """
    创建 Flask 应用实例

    Returns:
        Flask 应用实例
    """
    app = Flask(__name__)
    app.config['SECRET_KEY'] = settings.secret_key
    app.json = CustomJSONProvider(app)

    CORS(app, resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "X-Request-ID", "Authorization"]
        }
    })

    init_db()

    app.teardown_appcontext(close_db)

    @app.errorhandler(Exception)
    def handle_exception(e):
        logger.error(f"Unhandled exception: {str(e)}", exc_info=True)
        if isinstance(e, HTTPException):
            return api_response(None, e.code, e.description)
        return api_response(None, 500, "服务器内部错误")

    @app.errorhandler(400)
    def handle_bad_request(e):
        return api_response(None, 400, str(e.description))

    @app.errorhandler(404)
    def handle_not_found(e):
        return api_response(None, 404, "资源不存在")

    @app.errorhandler(422)
    def handle_unprocessable_entity(e):
        return api_response(None, 422, str(e.description))

    @app.before_request
    def log_request():
        logger.info(f"{request.method} {request.path}")

    @app.before_request
    def require_auth():
        if request.path in ['/', '/health'] or request.method == 'OPTIONS':
            return
        return auth.login_required(lambda: None)()

    app.register_blueprint(journals_bp)
    app.register_blueprint(events_bp)
    app.register_blueprint(reflections_bp)

    @app.route("/")
    def root():
        """根路径，返回欢迎信息"""
        return jsonify({
            "message": f"Welcome to {settings.app_name}",
            "version": settings.app_version
        })

    @app.route("/health")
    def health_check():
        """健康检查接口"""
        return jsonify({"status": "healthy"})

    logger.info(f"{settings.app_name} v{settings.app_version} initialized")
    return app


app = create_app()


if __name__ == "__main__":
    app.run(
        host=settings.host,
        port=settings.port,
        debug=settings.debug
    )