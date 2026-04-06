"""
Flask 应用入口

初始化 Flask 应用，配置 CORS 和注册蓝图。
"""

import logging
from flask import Flask, jsonify, request
from flask.json.provider import DefaultJSONProvider
from flask_cors import CORS
from flask_httpauth import HTTPBasicAuth
from flask_redis import FlaskRedis
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.exceptions import HTTPException
from app.config import settings
from app.database import init_db, close_db
from app.api import categories, members, stats, reminders, subscriptions
from app.utils.response import api_response
from app.cron import scheduler as cron_scheduler


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
redis_client = FlaskRedis()
limiter = Limiter(key_func=get_remote_address, default_limits=["5 per second"])


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
            "origins": settings.cors_origins,
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "X-Request-ID", "Authorization"]
        }
    })

    app.config['REDIS_URL'] = settings.redis_url
    redis_client.init_app(app)
    limiter.init_app(app)
    cron_scheduler.init_app(app)
    cron_scheduler.start()

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

    @app.errorhandler(429)
    def handle_rate_limit(e):
        return api_response(None, 429, "请求过于频繁，请稍后再试")

    @app.errorhandler(422)
    def handle_unprocessable_entity(e):
        return api_response(None, 422, str(e.description))

    @app.before_request
    def log_request():
        logger.info(f"{request.method} {request.path}")

    @app.before_request
    @auth.login_required
    def require_auth():
        if request.path in ['/', '/health']:
            return

    app.register_blueprint(categories.bp)
    app.register_blueprint(members.bp)
    app.register_blueprint(stats.bp)
    app.register_blueprint(reminders.bp)
    app.register_blueprint(subscriptions.bp)

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