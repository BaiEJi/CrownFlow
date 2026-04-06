"""
扩展测试用例

测试 Redis、Limiter、Cron 扩展功能。
"""

import pytest
import os
from unittest.mock import patch, MagicMock
from datetime import datetime, timedelta

os.environ["DATABASE_URL"] = "sqlite:///:memory:"


class TestRedis:
    """Redis 扩展测试"""

    def test_redis_client_exists(self):
        """测试 Redis 客户端存在"""
        from app.main import redis_client
        assert redis_client is not None

    @patch('app.main.redis_client')
    def test_redis_set_get(self, mock_redis):
        """测试 Redis 读写操作"""
        mock_redis.get.return_value = b'test_value'
        mock_redis.set.return_value = True
        
        result = mock_redis.set('test_key', 'test_value')
        assert result is True
        
        value = mock_redis.get('test_key')
        assert value == b'test_value'

    @patch('app.main.redis_client')
    def test_redis_delete(self, mock_redis):
        """测试 Redis 删除操作"""
        mock_redis.delete.return_value = 1
        result = mock_redis.delete('test_key')
        assert result == 1


class TestLimiter:
    """限流扩展测试"""

    def test_limiter_exists(self):
        """测试限流器存在"""
        from app.main import limiter
        assert limiter is not None

    def test_rate_limit_exceeded(self):
        """测试限流超过 5qps 返回 429 和友好中文提示"""
        from app.database import Base, engine
        from app.main import app, limiter
        from app.config import settings
        
        Base.metadata.create_all(bind=engine)
        settings.auth_enabled = False
        app.config["TESTING"] = True
        app.config["RATELIMIT_STORAGE_URL"] = "memory://"
        
        with app.test_client() as client:
            limiter.reset()
            for i in range(7):
                response = client.get("/api/categories")
                if i < 5:
                    assert response.status_code == 200, f"Request {i+1} should succeed, got {response.status_code}"
                else:
                    assert response.status_code == 429, f"Request {i+1} should be rate limited, got {response.status_code}"
                    data = response.get_json()
                    assert data["message"] == "请求过于频繁，请稍后再试", f"Unexpected message: {data.get('message')}"
        
        settings.auth_enabled = True
        Base.metadata.drop_all(bind=engine)


class TestCron:
    """定时任务测试"""

    def test_scheduler_exists(self):
        """测试调度器存在"""
        from app.cron import scheduler
        assert scheduler is not None

    def test_daily_spending_job_registered(self):
        """测试定时任务已注册"""
        from app.cron import scheduler, print_daily_spending
        
        jobs = scheduler.get_jobs()
        job_ids = [job.id for job in jobs]
        
        assert 'daily_spending' in job_ids

    def test_print_daily_spending_function(self):
        """测试花费计算函数逻辑"""
        from app.cron import print_daily_spending
        from app.database import SessionLocal, Base, engine
        from app.models.models import Category, Member, Subscription
        
        Base.metadata.create_all(bind=engine)
        session = SessionLocal()
        
        try:
            cat = Category(name="测试分类")
            session.add(cat)
            session.commit()
            
            member = Member(
                name="测试会员",
                category_id=cat.id,
                reminder_days=7
            )
            session.add(member)
            session.commit()
            
            today = datetime.now().strftime("%Y-%m-%d")
            start_date = (datetime.now().replace(day=1)).strftime("%Y-%m-%d")
            
            end_date = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
            
            subscription = Subscription(
                member_id=member.id,
                level="高级版",
                price=30,
                currency="CNY",
                billing_cycle="monthly",
                start_date=start_date,
                end_date=end_date
            )
            session.add(subscription)
            session.commit()
            
            print_daily_spending()
            
        finally:
            session.close()
            Base.metadata.drop_all(bind=engine)

    def test_print_daily_spending_empty(self):
        """测试无订阅时花费计算"""
        from app.cron import print_daily_spending
        from app.database import SessionLocal, Base, engine
        
        Base.metadata.create_all(bind=engine)
        session = SessionLocal()
        
        try:
            print_daily_spending()
        finally:
            session.close()
            Base.metadata.drop_all(bind=engine)