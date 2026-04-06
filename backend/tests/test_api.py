"""
API 测试用例

使用 pytest 进行 Flask API 测试。
使用内存数据库进行隔离测试。

模型结构：
- Member: 会员主表
- Subscription: 订阅记录表
"""

import pytest
import os

# 必须在导入 app 之前设置
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from app.database import SessionLocal, Base, engine
from app.models.models import Category, Member, Subscription
from app.main import app


@pytest.fixture
def db_session():
    """创建数据库会话"""
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(db_session):
    """创建测试客户端"""
    app.config["TESTING"] = True
    app.config["RATELIMIT_STORAGE_URL"] = "memory://"
    from app.config import settings
    from app.main import limiter
    settings.auth_enabled = False
    with app.test_client() as c:
        limiter.reset()
        yield c
    settings.auth_enabled = True


class TestCategoriesAPI:
    """分类 API 测试"""

    def test_get_categories_empty(self, client, db_session):
        """测试获取空分类列表"""
        response = client.get("/api/categories")
        assert response.status_code == 200
        assert response.json["data"] == []

    def test_create_category_success(self, client, db_session):
        """测试创建分类成功"""
        response = client.post("/api/categories", json={"name": "视频流媒体"})
        assert response.status_code == 200
        assert response.json["code"] == 201
        assert response.json["data"]["name"] == "视频流媒体"

    def test_create_category_with_all_fields(self, client, db_session):
        """测试创建分类（所有字段）"""
        response = client.post("/api/categories", json={
            "name": "音乐服务",
            "icon": "🎵",
            "color": "#FF5722"
        })
        assert response.status_code == 200
        assert response.json["data"]["icon"] == "🎵"
        assert response.json["data"]["color"] == "#FF5722"

    def test_create_category_duplicate_name(self, client, db_session):
        """测试创建重复名称的分类"""
        client.post("/api/categories", json={"name": "测试分类"})
        response = client.post("/api/categories", json={"name": "测试分类"})
        assert response.status_code == 400
        assert "已存在" in response.json["message"]

    def test_create_category_empty_name(self, client, db_session):
        """测试创建空名称的分类"""
        response = client.post("/api/categories", json={})
        assert response.status_code == 400

    def test_update_category_success(self, client, db_session):
        """测试更新分类成功"""
        resp = client.post("/api/categories", json={"name": "测试分类"})
        cat_id = resp.json["data"]["id"]

        response = client.put(f"/api/categories/{cat_id}", json={"name": "更新分类"})
        assert response.status_code == 200
        assert response.json["data"]["name"] == "更新分类"

    def test_update_category_not_found(self, client, db_session):
        """测试更新不存在的分类"""
        response = client.put("/api/categories/999", json={"name": "测试"})
        assert response.status_code == 404

    def test_delete_category_success(self, client, db_session):
        """测试删除分类成功"""
        resp = client.post("/api/categories", json={"name": "测试分类"})
        cat_id = resp.json["data"]["id"]

        response = client.delete(f"/api/categories/{cat_id}")
        assert response.status_code == 200

        resp = client.get("/api/categories")
        assert len(resp.json["data"]) == 0

    def test_delete_category_not_found(self, client, db_session):
        """测试删除不存在的分类"""
        response = client.delete("/api/categories/999")
        assert response.status_code == 404

    def test_delete_category_with_members(self, client, db_session):
        """测试删除有会员的分类"""
        resp = client.post("/api/categories", json={"name": "测试分类"})
        cat_id = resp.json["data"]["id"]

        member_resp = client.post("/api/members", json={
            "name": "Netflix",
            "category_id": cat_id,
        })
        member_id = member_resp.json["data"]["id"]
        
        client.post(f"/api/members/{member_id}/subscriptions", json={
            "price": 10,
            "billing_cycle": "monthly",
            "start_date": "2024-01-01",
            "end_date": "2024-02-01"
        })

        response = client.delete(f"/api/categories/{cat_id}")
        assert response.status_code == 400


class TestMembersAPI:
    """会员 API 测试"""

    def test_get_members_empty(self, client, db_session):
        """测试获取空会员列表"""
        response = client.get("/api/members")
        assert response.status_code == 200
        assert response.json["data"]["items"] == []
        assert response.json["data"]["total"] == 0

    def test_create_member_success(self, client, db_session):
        """测试创建会员成功"""
        cat_resp = client.post("/api/categories", json={"name": "测试分类"})
        cat_id = cat_resp.json["data"]["id"]

        response = client.post("/api/members", json={
            "name": "Netflix",
            "category_id": cat_id,
            "notes": "主账号",
            "reminder_days": 7
        })
        assert response.status_code == 200
        assert response.json["code"] == 201
        assert response.json["data"]["name"] == "Netflix"
        assert response.json["data"]["subscription_count"] == 0
        assert response.json["data"]["status"] == "expired"

    def test_create_member_with_subscription(self, client, db_session):
        """测试创建会员时同时创建订阅"""
        cat_resp = client.post("/api/categories", json={"name": "测试分类"})
        cat_id = cat_resp.json["data"]["id"]

        response = client.post("/api/members", json={
            "name": "Netflix",
            "category_id": cat_id,
            "subscription": {
                "level": "高级版",
                "price": 15.99,
                "currency": "USD",
                "billing_cycle": "monthly",
                "start_date": "2024-01-01",
                "end_date": "2024-02-01",
                "channel": "官方"
            }
        })
        assert response.status_code == 200
        assert response.json["data"]["subscription_count"] == 1
        assert response.json["data"]["latest_subscription"]["level"] == "高级版"
        assert response.json["data"]["latest_subscription"]["channel"] == "官方"

    def test_create_member_empty_name(self, client, db_session):
        """测试创建空名称的会员"""
        response = client.post("/api/members", json={})
        assert response.status_code == 400

    def test_get_member_by_id(self, client, db_session):
        """测试获取单个会员详情"""
        cat_resp = client.post("/api/categories", json={"name": "测试分类"})
        cat_id = cat_resp.json["data"]["id"]

        member_resp = client.post("/api/members", json={
            "name": "Netflix",
            "category_id": cat_id,
            "subscription": {
                "price": 15.99,
                "billing_cycle": "monthly",
                "start_date": "2024-01-01",
                "end_date": "2024-02-01"
            }
        })
        member_id = member_resp.json["data"]["id"]

        response = client.get(f"/api/members/{member_id}")
        assert response.status_code == 200
        assert response.json["data"]["name"] == "Netflix"
        assert len(response.json["data"]["subscriptions"]) == 1

    def test_get_member_not_found(self, client, db_session):
        """测试获取不存在的会员"""
        response = client.get("/api/members/999")
        assert response.status_code == 404

    def test_update_member_success(self, client, db_session):
        """测试更新会员成功"""
        cat_resp = client.post("/api/categories", json={"name": "测试分类"})
        cat_id = cat_resp.json["data"]["id"]

        member_resp = client.post("/api/members", json={
            "name": "Netflix",
            "category_id": cat_id
        })
        member_id = member_resp.json["data"]["id"]

        response = client.put(f"/api/members/{member_id}", json={"name": "Netflix Premium"})
        assert response.status_code == 200
        assert response.json["data"]["name"] == "Netflix Premium"

    def test_delete_member_success(self, client, db_session):
        """测试删除会员成功"""
        cat_resp = client.post("/api/categories", json={"name": "测试分类"})
        cat_id = cat_resp.json["data"]["id"]

        member_resp = client.post("/api/members", json={
            "name": "Netflix",
            "category_id": cat_id
        })
        member_id = member_resp.json["data"]["id"]

        response = client.delete(f"/api/members/{member_id}")
        assert response.status_code == 200

        response = client.get(f"/api/members/{member_id}")
        assert response.status_code == 404

    def test_delete_member_cascade_subscriptions(self, client, db_session):
        """测试删除会员时级联删除订阅"""
        cat_resp = client.post("/api/categories", json={"name": "测试分类"})
        cat_id = cat_resp.json["data"]["id"]

        member_resp = client.post("/api/members", json={
            "name": "Netflix",
            "category_id": cat_id
        })
        member_id = member_resp.json["data"]["id"]

        client.post(f"/api/members/{member_id}/subscriptions", json={
            "price": 10,
            "billing_cycle": "monthly",
            "start_date": "2024-01-01",
            "end_date": "2024-02-01"
        })

        client.delete(f"/api/members/{member_id}")

        response = client.get(f"/api/members/{member_id}/subscriptions")
        assert response.status_code == 404

    def test_get_members_pagination(self, client, db_session):
        """测试分页"""
        cat_resp = client.post("/api/categories", json={"name": "测试分类"})
        cat_id = cat_resp.json["data"]["id"]

        for i in range(5):
            client.post("/api/members", json={
                "name": f"Member {i}",
                "category_id": cat_id
            })

        response = client.get("/api/members?page=1&page_size=3")
        assert response.status_code == 200
        assert len(response.json["data"]["items"]) == 3
        assert response.json["data"]["total"] == 5


class TestSubscriptionsAPI:
    """订阅 API 测试"""

    def test_create_subscription_success(self, client, db_session):
        """测试创建订阅成功"""
        cat_resp = client.post("/api/categories", json={"name": "测试分类"})
        cat_id = cat_resp.json["data"]["id"]

        member_resp = client.post("/api/members", json={
            "name": "Netflix",
            "category_id": cat_id
        })
        member_id = member_resp.json["data"]["id"]

        response = client.post(f"/api/members/{member_id}/subscriptions", json={
            "level": "高级版",
            "price": 15.99,
            "currency": "USD",
            "billing_cycle": "monthly",
            "start_date": "2024-01-01",
            "end_date": "2024-02-01",
            "channel": "官方",
            "notes": "首次订阅"
        })
        assert response.status_code == 200
        assert response.json["code"] == 201
        assert response.json["data"]["level"] == "高级版"
        assert float(response.json["data"]["price"]) == 15.99
        assert response.json["data"]["channel"] == "官方"

    def test_create_subscription_custom_cycle(self, client, db_session):
        """测试创建自定义周期订阅"""
        cat_resp = client.post("/api/categories", json={"name": "测试分类"})
        cat_id = cat_resp.json["data"]["id"]

        member_resp = client.post("/api/members", json={
            "name": "测试",
            "category_id": cat_id
        })
        member_id = member_resp.json["data"]["id"]

        response = client.post(f"/api/members/{member_id}/subscriptions", json={
            "price": 45,
            "billing_cycle": "custom",
            "custom_days": 90,
            "start_date": "2024-01-01",
            "end_date": "2024-04-01"
        })
        assert response.status_code == 200

    def test_create_subscription_missing_custom_days(self, client, db_session):
        """测试自定义周期未填写天数"""
        cat_resp = client.post("/api/categories", json={"name": "测试分类"})
        cat_id = cat_resp.json["data"]["id"]

        member_resp = client.post("/api/members", json={
            "name": "测试",
            "category_id": cat_id
        })
        member_id = member_resp.json["data"]["id"]

        response = client.post(f"/api/members/{member_id}/subscriptions", json={
            "price": 10,
            "billing_cycle": "custom",
            "start_date": "2024-01-01",
            "end_date": "2024-02-01"
        })
        assert response.status_code == 400

    def test_create_subscription_invalid_member(self, client, db_session):
        """测试为不存在的会员创建订阅"""
        response = client.post("/api/members/999/subscriptions", json={
            "price": 10,
            "billing_cycle": "monthly",
            "start_date": "2024-01-01",
            "end_date": "2024-02-01"
        })
        assert response.status_code == 404

    def test_get_subscriptions_by_member(self, client, db_session):
        """测试获取会员的所有订阅"""
        cat_resp = client.post("/api/categories", json={"name": "测试分类"})
        cat_id = cat_resp.json["data"]["id"]

        member_resp = client.post("/api/members", json={
            "name": "Netflix",
            "category_id": cat_id
        })
        member_id = member_resp.json["data"]["id"]

        for i in range(3):
            client.post(f"/api/members/{member_id}/subscriptions", json={
                "level": f"级别{i+1}",
                "price": 10 * (i + 1),
                "billing_cycle": "monthly",
                "start_date": f"2024-0{i+1}-01",
                "end_date": f"2024-0{i+2}-01"
            })

        response = client.get(f"/api/members/{member_id}/subscriptions")
        assert response.status_code == 200
        assert len(response.json["data"]["items"]) == 3

    def test_get_subscription_by_id(self, client, db_session):
        """测试获取单个订阅"""
        cat_resp = client.post("/api/categories", json={"name": "测试分类"})
        cat_id = cat_resp.json["data"]["id"]

        member_resp = client.post("/api/members", json={
            "name": "Netflix",
            "category_id": cat_id
        })
        member_id = member_resp.json["data"]["id"]

        sub_resp = client.post(f"/api/members/{member_id}/subscriptions", json={
            "price": 15.99,
            "billing_cycle": "monthly",
            "start_date": "2024-01-01",
            "end_date": "2024-02-01"
        })
        sub_id = sub_resp.json["data"]["id"]

        response = client.get(f"/api/subscriptions/{sub_id}")
        assert response.status_code == 200
        assert response.json["data"]["price"] == 15.99

    def test_update_subscription(self, client, db_session):
        """测试更新订阅"""
        cat_resp = client.post("/api/categories", json={"name": "测试分类"})
        cat_id = cat_resp.json["data"]["id"]

        member_resp = client.post("/api/members", json={
            "name": "Netflix",
            "category_id": cat_id
        })
        member_id = member_resp.json["data"]["id"]

        sub_resp = client.post(f"/api/members/{member_id}/subscriptions", json={
            "price": 15.99,
            "billing_cycle": "monthly",
            "start_date": "2024-01-01",
            "end_date": "2024-02-01"
        })
        sub_id = sub_resp.json["data"]["id"]

        response = client.put(f"/api/subscriptions/{sub_id}", json={
            "price": 19.99,
            "channel": "淘宝"
        })
        assert response.status_code == 200
        assert float(response.json["data"]["price"]) == 19.99
        assert response.json["data"]["channel"] == "淘宝"

    def test_delete_subscription(self, client, db_session):
        """测试删除订阅"""
        cat_resp = client.post("/api/categories", json={"name": "测试分类"})
        cat_id = cat_resp.json["data"]["id"]

        member_resp = client.post("/api/members", json={
            "name": "Netflix",
            "category_id": cat_id
        })
        member_id = member_resp.json["data"]["id"]

        sub_resp = client.post(f"/api/members/{member_id}/subscriptions", json={
            "price": 15.99,
            "billing_cycle": "monthly",
            "start_date": "2024-01-01",
            "end_date": "2024-02-01"
        })
        sub_id = sub_resp.json["data"]["id"]

        response = client.delete(f"/api/subscriptions/{sub_id}")
        assert response.status_code == 200

        response = client.get(f"/api/subscriptions/{sub_id}")
        assert response.status_code == 404


class TestMemberAggregation:
    """会员聚合字段测试"""

    def test_member_status_active(self, client, db_session):
        """测试会员状态计算 - 有效"""
        cat_resp = client.post("/api/categories", json={"name": "测试分类"})
        cat_id = cat_resp.json["data"]["id"]

        from datetime import datetime, timedelta
        today = datetime.now().date()
        start_date = (today - timedelta(days=30)).strftime("%Y-%m-%d")
        end_date = (today + timedelta(days=30)).strftime("%Y-%m-%d")

        member_resp = client.post("/api/members", json={
            "name": "Netflix",
            "category_id": cat_id,
            "subscription": {
                "price": 15.99,
                "billing_cycle": "monthly",
                "start_date": start_date,
                "end_date": end_date
            }
        })

        assert member_resp.json["data"]["status"] == "active"

    def test_member_status_expired(self, client, db_session):
        """测试会员状态计算 - 过期"""
        cat_resp = client.post("/api/categories", json={"name": "测试分类"})
        cat_id = cat_resp.json["data"]["id"]

        member_resp = client.post("/api/members", json={
            "name": "Netflix",
            "category_id": cat_id,
            "subscription": {
                "price": 15.99,
                "billing_cycle": "monthly",
                "start_date": "2023-01-01",
                "end_date": "2023-02-01"
            }
        })

        assert member_resp.json["data"]["status"] == "expired"

    def test_member_total_spending(self, client, db_session):
        """测试会员累计花费计算"""
        cat_resp = client.post("/api/categories", json={"name": "测试分类"})
        cat_id = cat_resp.json["data"]["id"]

        member_resp = client.post("/api/members", json={
            "name": "Netflix",
            "category_id": cat_id
        })
        member_id = member_resp.json["data"]["id"]

        client.post(f"/api/members/{member_id}/subscriptions", json={
            "price": 15,
            "billing_cycle": "monthly",
            "start_date": "2024-01-01",
            "end_date": "2024-02-01"
        })

        client.post(f"/api/members/{member_id}/subscriptions", json={
            "price": 180,
            "billing_cycle": "yearly",
            "start_date": "2024-02-01",
            "end_date": "2025-02-01"
        })

        response = client.get(f"/api/members/{member_id}")
        assert response.json["data"]["total_spending"] == 195.0
        assert response.json["data"]["subscription_count"] == 2


class TestStatsAPI:
    """统计 API 测试"""

    def test_get_overview_empty(self, client, db_session):
        """测试获取空概览"""
        response = client.get("/api/stats/overview")
        assert response.status_code == 200
        assert response.json["data"]["total_members"] == 0

    def test_get_overview_with_data(self, client, db_session):
        """测试获取概览"""
        cat_resp = client.post("/api/categories", json={"name": "测试分类"})
        cat_id = cat_resp.json["data"]["id"]

        member_resp = client.post("/api/members", json={
            "name": "Netflix",
            "category_id": cat_id,
            "subscription": {
                "price": 15.99,
                "billing_cycle": "monthly",
                "start_date": "2024-01-01",
                "end_date": "2024-02-01"
            }
        })

        response = client.get("/api/stats/overview")
        assert response.status_code == 200
        assert response.json["data"]["total_members"] == 1

    def test_get_spending_success(self, client, db_session):
        """测试获取支出统计"""
        cat_resp = client.post("/api/categories", json={"name": "测试分类"})
        cat_id = cat_resp.json["data"]["id"]

        member_resp = client.post("/api/members", json={
            "name": "Netflix",
            "category_id": cat_id
        })
        member_id = member_resp.json["data"]["id"]

        client.post(f"/api/members/{member_id}/subscriptions", json={
            "price": 15.99,
            "billing_cycle": "monthly",
            "start_date": "2024-01-01",
            "end_date": "2024-02-01"
        })

        response = client.get("/api/stats/spending?start_date=2024-01-01&end_date=2024-01-31")
        assert response.status_code == 200
        assert "total" in response.json["data"]

    def test_get_spending_missing_params(self, client, db_session):
        """测试缺少参数"""
        response = client.get("/api/stats/spending")
        assert response.status_code == 400


class TestRemindersAPI:
    """提醒 API 测试"""

    def test_get_upcoming_empty(self, client, db_session):
        """测试获取空提醒列表"""
        response = client.get("/api/reminders/upcoming")
        assert response.status_code == 200
        assert response.json["data"]["reminders"] == []

    def test_get_upcoming_with_subscription(self, client, db_session):
        """测试获取即将到期订阅"""
        from datetime import datetime, timedelta

        cat_resp = client.post("/api/categories", json={"name": "测试分类"})
        cat_id = cat_resp.json["data"]["id"]

        member_resp = client.post("/api/members", json={
            "name": "即将到期",
            "category_id": cat_id,
            "reminder_days": 7
        })
        member_id = member_resp.json["data"]["id"]

        today = datetime.now().date()
        end_date = (today + timedelta(days=3)).strftime("%Y-%m-%d")
        start_date = (today - timedelta(days=30)).strftime("%Y-%m-%d")

        client.post(f"/api/members/{member_id}/subscriptions", json={
            "level": "高级版",
            "price": 10,
            "billing_cycle": "monthly",
            "start_date": start_date,
            "end_date": end_date
        })

        response = client.get("/api/reminders/upcoming")
        assert response.status_code == 200
        assert len(response.json["data"]["reminders"]) == 1
        assert response.json["data"]["reminders"][0]["level"] == "高级版"


class TestEdgeCases:
    """边缘情况测试"""

    def test_leap_year_date(self, client, db_session):
        """测试闰年日期"""
        cat_resp = client.post("/api/categories", json={"name": "测试分类"})
        cat_id = cat_resp.json["data"]["id"]

        member_resp = client.post("/api/members", json={
            "name": "闰年测试",
            "category_id": cat_id
        })
        member_id = member_resp.json["data"]["id"]

        response = client.post(f"/api/members/{member_id}/subscriptions", json={
            "price": 10,
            "billing_cycle": "monthly",
            "start_date": "2024-02-29",
            "end_date": "2024-03-29"
        })
        assert response.status_code == 200

    def test_zero_price(self, client, db_session):
        """测试零价格"""
        cat_resp = client.post("/api/categories", json={"name": "测试分类"})
        cat_id = cat_resp.json["data"]["id"]

        member_resp = client.post("/api/members", json={
            "name": "免费会员",
            "category_id": cat_id
        })
        member_id = member_resp.json["data"]["id"]

        response = client.post(f"/api/members/{member_id}/subscriptions", json={
            "price": 0,
            "billing_cycle": "monthly",
            "start_date": "2024-01-01",
            "end_date": "2024-02-01"
        })
        assert response.status_code == 200

    def test_sql_injection_attempt(self, client, db_session):
        """测试 SQL 注入"""
        cat_resp = client.post("/api/categories", json={"name": "测试分类"})
        cat_id = cat_resp.json["data"]["id"]

        response = client.post("/api/members", json={
            "name": "'; DROP TABLE members; --",
            "category_id": cat_id
        })
        assert response.status_code == 200

        response = client.get("/api/members")
        assert response.status_code == 200