"""
配置模块

管理应用配置信息。
"""


class Settings:
    app_name: str = "CrownFlow"
    app_version: str = "1.0.0"
    secret_key: str = "dev-secret-key-change-in-production"
    
    debug: bool = False
    host: str = "0.0.0.0"
    port: int = 60000
    
    cors_origins: str = "*"
    
    max_page_size: int = 100
    default_reminder_days: int = 7
    
    auth_enabled: bool = True
    auth_username: str = "admin"
    auth_password: str = "lizy111A"
    
    base_currency: str = "CNY"
    exchange_rates: dict = {
        "CNY": 1.0,
        "USD": 7.0,
        "EUR": 10.0,
        "GBP": 9.0,
        "JPY": 0.05,
    }

    redis_url: str = "redis://:lizy111redis@localhost:50001/0"


settings = Settings()