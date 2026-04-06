"""
配置模块

管理应用配置信息。
"""


class Settings:
    app_name: str = "JournalService"
    app_version: str = "1.0.0"
    secret_key: str = "dev-secret-key-change-in-production"
    
    debug: bool = False
    host: str = "0.0.0.0"
    port: int = 60002
    
    cors_origins: str = "*"
    
    max_page_size: int = 100
    
    auth_enabled: bool = True
    auth_username: str = "admin"
    auth_password: str = "lizy111A"


settings = Settings()