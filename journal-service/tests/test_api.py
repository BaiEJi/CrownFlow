"""
Journal Service API 测试用例

使用 pytest 进行 Flask API 测试。
使用内存数据库进行隔离测试。

模型结构：
- Journal: 日记
- JournalEvent: 事件
- EventReflection: 反思
"""

import pytest
import os

os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from app.database import SessionLocal, Base, engine
from app.models.models import Journal, JournalEvent, EventReflection
from app.main import app


@pytest.fixture
def db_session():
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(db_session):
    app.config["TESTING"] = True
    from app.config import settings
    settings.auth_enabled = False
    with app.test_client() as c:
        yield c
    settings.auth_enabled = True


class TestJournalsAPI:
    """日记 API 测试"""

    def test_get_journals_empty(self, client, db_session):
        """测试获取空日记列表"""
        response = client.get("/api/journals")
        assert response.status_code == 200
        assert response.json["data"]["items"] == []
        assert response.json["data"]["total"] == 0

    def test_create_journal_success(self, client, db_session):
        """测试创建日记成功"""
        response = client.post("/api/journals", json={
            "date": "2024-03-30",
            "mood": "开心",
            "weather": "晴",
            "summary": "今天很开心"
        })
        assert response.status_code == 200
        assert response.json["code"] == 201
        assert response.json["data"]["date"] == "2024-03-30"
        assert response.json["data"]["mood"] == "开心"
        assert response.json["data"]["weather"] == "晴"
        assert response.json["data"]["summary"] == "今天很开心"

    def test_create_journal_without_date(self, client, db_session):
        """测试创建日记缺少日期"""
        response = client.post("/api/journals", json={
            "mood": "开心"
        })
        assert response.status_code == 400
        assert "日期" in response.json["message"]

    def test_create_journal_invalid_date_format(self, client, db_session):
        """测试创建日记日期格式错误"""
        response = client.post("/api/journals", json={
            "date": "2024/03/30"
        })
        assert response.status_code == 422

    def test_create_journal_duplicate_date(self, client, db_session):
        """测试创建重复日期的日记"""
        client.post("/api/journals", json={"date": "2024-03-30"})
        response = client.post("/api/journals", json={"date": "2024-03-30"})
        assert response.status_code == 400
        assert "已存在" in response.json["message"]

    def test_create_journal_invalid_mood(self, client, db_session):
        """测试创建日记心情不在预设列表"""
        response = client.post("/api/journals", json={
            "date": "2024-03-30",
            "mood": "未知心情"
        })
        assert response.status_code == 422

    def test_get_journal_by_date_success(self, client, db_session):
        """测试按日期获取日记"""
        client.post("/api/journals", json={
            "date": "2024-03-30",
            "mood": "开心"
        })
        response = client.get("/api/journals/2024-03-30")
        assert response.status_code == 200
        assert response.json["data"]["mood"] == "开心"

    def test_get_journal_by_date_not_found(self, client, db_session):
        """测试获取不存在的日记"""
        response = client.get("/api/journals/2024-03-30")
        assert response.status_code == 404

    def test_get_journal_by_date_invalid_format(self, client, db_session):
        """测试日期格式错误"""
        response = client.get("/api/journals/20240330")
        assert response.status_code == 422

    def test_update_journal_success(self, client, db_session):
        """测试更新日记"""
        resp = client.post("/api/journals", json={"date": "2024-03-30"})
        journal_id = resp.json["data"]["id"]

        response = client.put(f"/api/journals/{journal_id}", json={
            "mood": "平静",
            "weather": "多云",
            "summary": "更新后的总结"
        })
        assert response.status_code == 200
        assert response.json["data"]["mood"] == "平静"
        assert response.json["data"]["weather"] == "多云"
        assert response.json["data"]["summary"] == "更新后的总结"

    def test_update_journal_not_found(self, client, db_session):
        """测试更新不存在的日记"""
        response = client.put("/api/journals/999", json={"mood": "开心"})
        assert response.status_code == 404

    def test_delete_journal_success(self, client, db_session):
        """测试删除日记"""
        resp = client.post("/api/journals", json={"date": "2024-03-30"})
        journal_id = resp.json["data"]["id"]

        response = client.delete(f"/api/journals/{journal_id}")
        assert response.status_code == 200

        response = client.get("/api/journals/2024-03-30")
        assert response.status_code == 404

    def test_delete_journal_not_found(self, client, db_session):
        """测试删除不存在的日记"""
        response = client.delete("/api/journals/999")
        assert response.status_code == 404

    def test_get_journals_pagination(self, client, db_session):
        """测试分页"""
        for i in range(15):
            client.post("/api/journals", json={"date": f"2024-03-{i+1:02d}"})

        response = client.get("/api/journals?page=1&page_size=10")
        assert response.status_code == 200
        assert len(response.json["data"]["items"]) == 10
        assert response.json["data"]["total"] == 15

    def test_get_journals_date_range(self, client, db_session):
        """测试日期范围筛选"""
        client.post("/api/journals", json={"date": "2024-03-01"})
        client.post("/api/journals", json={"date": "2024-03-15"})
        client.post("/api/journals", json={"date": "2024-03-30"})

        response = client.get("/api/journals?start_date=2024-03-10&end_date=2024-03-20")
        assert response.status_code == 200
        assert response.json["data"]["total"] == 1


class TestEventsAPI:
    """事件 API 测试"""

    def test_create_event_success(self, client, db_session):
        """测试创建事件成功"""
        client.post("/api/journals", json={"date": "2024-03-30"})

        response = client.post("/api/journals/2024-03-30/events", json={
            "title": "上午开会",
            "start_time": "09:00",
            "end_time": "12:00",
            "location": "会议室",
            "background": "季度总结会议",
            "process": "各部门汇报",
            "result": "确定下季度目标"
        })
        assert response.status_code == 200
        assert response.json["code"] == 201
        assert response.json["data"]["title"] == "上午开会"
        assert response.json["data"]["start_time"] == "09:00"
        assert response.json["data"]["end_time"] == "12:00"

    def test_create_event_without_title(self, client, db_session):
        """测试创建事件缺少标题"""
        client.post("/api/journals", json={"date": "2024-03-30"})

        response = client.post("/api/journals/2024-03-30/events", json={
            "start_time": "09:00"
        })
        assert response.status_code == 400

    def test_create_event_empty_title(self, client, db_session):
        """测试创建事件空标题"""
        client.post("/api/journals", json={"date": "2024-03-30"})

        response = client.post("/api/journals/2024-03-30/events", json={
            "title": "   "
        })
        assert response.status_code == 400

    def test_create_event_title_too_long(self, client, db_session):
        """测试标题超长"""
        client.post("/api/journals", json={"date": "2024-03-30"})

        response = client.post("/api/journals/2024-03-30/events", json={
            "title": "a" * 101
        })
        assert response.status_code == 422

    def test_create_event_invalid_time_format(self, client, db_session):
        """测试时间格式错误"""
        client.post("/api/journals", json={"date": "2024-03-30"})

        response = client.post("/api/journals/2024-03-30/events", json={
            "title": "测试",
            "start_time": "9-00"
        })
        assert response.status_code == 422

    def test_create_event_journal_not_found(self, client, db_session):
        """测试日记不存在"""
        response = client.post("/api/journals/2024-03-30/events", json={
            "title": "测试"
        })
        assert response.status_code == 404

    def test_get_event_success(self, client, db_session):
        """测试获取事件详情"""
        client.post("/api/journals", json={"date": "2024-03-30"})
        resp = client.post("/api/journals/2024-03-30/events", json={
            "title": "测试事件"
        })
        event_id = resp.json["data"]["id"]

        response = client.get(f"/api/events/{event_id}")
        assert response.status_code == 200
        assert response.json["data"]["title"] == "测试事件"

    def test_get_event_not_found(self, client, db_session):
        """测试获取不存在的事件"""
        response = client.get("/api/events/999")
        assert response.status_code == 404

    def test_update_event_success(self, client, db_session):
        """测试更新事件"""
        client.post("/api/journals", json={"date": "2024-03-30"})
        resp = client.post("/api/journals/2024-03-30/events", json={
            "title": "原标题"
        })
        event_id = resp.json["data"]["id"]

        response = client.put(f"/api/events/{event_id}", json={
            "title": "新标题",
            "location": "新地点"
        })
        assert response.status_code == 200
        assert response.json["data"]["title"] == "新标题"
        assert response.json["data"]["location"] == "新地点"

    def test_update_event_not_found(self, client, db_session):
        """测试更新不存在的事件"""
        response = client.put("/api/events/999", json={"title": "测试"})
        assert response.status_code == 404

    def test_delete_event_success(self, client, db_session):
        """测试删除事件"""
        client.post("/api/journals", json={"date": "2024-03-30"})
        resp = client.post("/api/journals/2024-03-30/events", json={
            "title": "测试"
        })
        event_id = resp.json["data"]["id"]

        response = client.delete(f"/api/events/{event_id}")
        assert response.status_code == 200

        response = client.get(f"/api/events/{event_id}")
        assert response.status_code == 404

    def test_delete_event_not_found(self, client, db_session):
        """测试删除不存在的事件"""
        response = client.delete("/api/events/999")
        assert response.status_code == 404

    def test_event_with_reflections_in_journal(self, client, db_session):
        """测试日记包含事件的反思"""
        client.post("/api/journals", json={"date": "2024-03-30"})
        resp = client.post("/api/journals/2024-03-30/events", json={
            "title": "测试事件"
        })
        event_id = resp.json["data"]["id"]

        client.post(f"/api/events/{event_id}/reflections", json={
            "type": "good",
            "content": "做得好"
        })

        response = client.get("/api/journals/2024-03-30")
        assert response.status_code == 200
        assert len(response.json["data"]["events"]) == 1
        assert len(response.json["data"]["events"][0]["reflections"]) == 1


class TestReflectionsAPI:
    """反思 API 测试"""

    def test_create_reflection_good(self, client, db_session):
        """测试创建做得好的反思"""
        client.post("/api/journals", json={"date": "2024-03-30"})
        resp = client.post("/api/journals/2024-03-30/events", json={
            "title": "测试事件"
        })
        event_id = resp.json["data"]["id"]

        response = client.post(f"/api/events/{event_id}/reflections", json={
            "type": "good",
            "content": "提前准备好材料，汇报清晰"
        })
        assert response.status_code == 200
        assert response.json["code"] == 201
        assert response.json["data"]["type"] == "good"
        assert response.json["data"]["content"] == "提前准备好材料，汇报清晰"

    def test_create_reflection_bad(self, client, db_session):
        """测试创建做得不好的反思"""
        client.post("/api/journals", json={"date": "2024-03-30"})
        resp = client.post("/api/journals/2024-03-30/events", json={
            "title": "测试"
        })
        event_id = resp.json["data"]["id"]

        response = client.post(f"/api/events/{event_id}/reflections", json={
            "type": "bad",
            "content": "发言时紧张，语速太快"
        })
        assert response.status_code == 200
        assert response.json["data"]["type"] == "bad"

    def test_create_reflection_improve(self, client, db_session):
        """测试创建改进建议"""
        client.post("/api/journals", json={"date": "2024-03-30"})
        resp = client.post("/api/journals/2024-03-30/events", json={
            "title": "测试"
        })
        event_id = resp.json["data"]["id"]

        response = client.post(f"/api/events/{event_id}/reflections", json={
            "type": "improve",
            "content": "下次提前练习发言"
        })
        assert response.status_code == 200
        assert response.json["data"]["type"] == "improve"

    def test_create_reflection_custom(self, client, db_session):
        """测试创建自定义反思"""
        client.post("/api/journals", json={"date": "2024-03-30"})
        resp = client.post("/api/journals/2024-03-30/events", json={
            "title": "测试"
        })
        event_id = resp.json["data"]["id"]

        response = client.post(f"/api/events/{event_id}/reflections", json={
            "type": "custom",
            "custom_type_name": "灵感",
            "content": "突然想到一个好主意"
        })
        assert response.status_code == 200
        assert response.json["data"]["type"] == "custom"
        assert response.json["data"]["custom_type_name"] == "灵感"

    def test_create_reflection_custom_without_name(self, client, db_session):
        """测试自定义反思缺少名称"""
        client.post("/api/journals", json={"date": "2024-03-30"})
        resp = client.post("/api/journals/2024-03-30/events", json={
            "title": "测试"
        })
        event_id = resp.json["data"]["id"]

        response = client.post(f"/api/events/{event_id}/reflections", json={
            "type": "custom",
            "content": "内容"
        })
        assert response.status_code == 400

    def test_create_reflection_invalid_type(self, client, db_session):
        """测试无效的反思类型"""
        client.post("/api/journals", json={"date": "2024-03-30"})
        resp = client.post("/api/journals/2024-03-30/events", json={
            "title": "测试"
        })
        event_id = resp.json["data"]["id"]

        response = client.post(f"/api/events/{event_id}/reflections", json={
            "type": "invalid",
            "content": "内容"
        })
        assert response.status_code == 422

    def test_create_reflection_without_content(self, client, db_session):
        """测试缺少内容"""
        client.post("/api/journals", json={"date": "2024-03-30"})
        resp = client.post("/api/journals/2024-03-30/events", json={
            "title": "测试"
        })
        event_id = resp.json["data"]["id"]

        response = client.post(f"/api/events/{event_id}/reflections", json={
            "type": "good"
        })
        assert response.status_code == 400

    def test_create_reflection_empty_content(self, client, db_session):
        """测试空内容"""
        client.post("/api/journals", json={"date": "2024-03-30"})
        resp = client.post("/api/journals/2024-03-30/events", json={
            "title": "测试"
        })
        event_id = resp.json["data"]["id"]

        response = client.post(f"/api/events/{event_id}/reflections", json={
            "type": "good",
            "content": "   "
        })
        assert response.status_code == 400

    def test_create_reflection_event_not_found(self, client, db_session):
        """测试事件不存在"""
        response = client.post("/api/events/999/reflections", json={
            "type": "good",
            "content": "内容"
        })
        assert response.status_code == 404

    def test_get_reflection_success(self, client, db_session):
        """测试获取反思详情"""
        client.post("/api/journals", json={"date": "2024-03-30"})
        resp = client.post("/api/journals/2024-03-30/events", json={
            "title": "测试"
        })
        event_id = resp.json["data"]["id"]

        resp = client.post(f"/api/events/{event_id}/reflections", json={
            "type": "good",
            "content": "内容"
        })
        reflection_id = resp.json["data"]["id"]

        response = client.get(f"/api/reflections/{reflection_id}")
        assert response.status_code == 200
        assert response.json["data"]["content"] == "内容"

    def test_get_reflection_not_found(self, client, db_session):
        """测试获取不存在的反思"""
        response = client.get("/api/reflections/999")
        assert response.status_code == 404

    def test_update_reflection_success(self, client, db_session):
        """测试更新反思"""
        client.post("/api/journals", json={"date": "2024-03-30"})
        resp = client.post("/api/journals/2024-03-30/events", json={
            "title": "测试"
        })
        event_id = resp.json["data"]["id"]

        resp = client.post(f"/api/events/{event_id}/reflections", json={
            "type": "good",
            "content": "原内容"
        })
        reflection_id = resp.json["data"]["id"]

        response = client.put(f"/api/reflections/{reflection_id}", json={
            "content": "新内容"
        })
        assert response.status_code == 200
        assert response.json["data"]["content"] == "新内容"

    def test_update_reflection_change_type(self, client, db_session):
        """测试更新反思类型"""
        client.post("/api/journals", json={"date": "2024-03-30"})
        resp = client.post("/api/journals/2024-03-30/events", json={
            "title": "测试"
        })
        event_id = resp.json["data"]["id"]

        resp = client.post(f"/api/events/{event_id}/reflections", json={
            "type": "good",
            "content": "内容"
        })
        reflection_id = resp.json["data"]["id"]

        response = client.put(f"/api/reflections/{reflection_id}", json={
            "type": "bad"
        })
        assert response.status_code == 200
        assert response.json["data"]["type"] == "bad"
        assert response.json["data"]["custom_type_name"] is None

    def test_update_reflection_to_custom(self, client, db_session):
        """测试更新为自定义类型"""
        client.post("/api/journals", json={"date": "2024-03-30"})
        resp = client.post("/api/journals/2024-03-30/events", json={
            "title": "测试"
        })
        event_id = resp.json["data"]["id"]

        resp = client.post(f"/api/events/{event_id}/reflections", json={
            "type": "good",
            "content": "内容"
        })
        reflection_id = resp.json["data"]["id"]

        response = client.put(f"/api/reflections/{reflection_id}", json={
            "type": "custom",
            "custom_type_name": "感悟"
        })
        assert response.status_code == 200
        assert response.json["data"]["type"] == "custom"
        assert response.json["data"]["custom_type_name"] == "感悟"

    def test_update_reflection_not_found(self, client, db_session):
        """测试更新不存在的反思"""
        response = client.put("/api/reflections/999", json={"content": "测试"})
        assert response.status_code == 404

    def test_delete_reflection_success(self, client, db_session):
        """测试删除反思"""
        client.post("/api/journals", json={"date": "2024-03-30"})
        resp = client.post("/api/journals/2024-03-30/events", json={
            "title": "测试"
        })
        event_id = resp.json["data"]["id"]

        resp = client.post(f"/api/events/{event_id}/reflections", json={
            "type": "good",
            "content": "内容"
        })
        reflection_id = resp.json["data"]["id"]

        response = client.delete(f"/api/reflections/{reflection_id}")
        assert response.status_code == 200

        response = client.get(f"/api/reflections/{reflection_id}")
        assert response.status_code == 404

    def test_delete_reflection_not_found(self, client, db_session):
        """测试删除不存在的反思"""
        response = client.delete("/api/reflections/999")
        assert response.status_code == 404


class TestCascadeDelete:
    """级联删除测试"""

    def test_delete_journal_cascades_events(self, client, db_session):
        """测试删除日记级联删除事件"""
        resp = client.post("/api/journals", json={"date": "2024-03-30"})
        journal_id = resp.json["data"]["id"]

        resp = client.post("/api/journals/2024-03-30/events", json={
            "title": "事件1"
        })
        event_id = resp.json["data"]["id"]

        client.delete(f"/api/journals/{journal_id}")

        response = client.get(f"/api/events/{event_id}")
        assert response.status_code == 404

    def test_delete_event_cascades_reflections(self, client, db_session):
        """测试删除事件级联删除反思"""
        client.post("/api/journals", json={"date": "2024-03-30"})
        resp = client.post("/api/journals/2024-03-30/events", json={
            "title": "事件"
        })
        event_id = resp.json["data"]["id"]

        resp = client.post(f"/api/events/{event_id}/reflections", json={
            "type": "good",
            "content": "反思"
        })
        reflection_id = resp.json["data"]["id"]

        client.delete(f"/api/events/{event_id}")

        response = client.get(f"/api/reflections/{reflection_id}")
        assert response.status_code == 404

    def test_delete_journal_cascades_all(self, client, db_session):
        """测试删除日记级联删除事件和反思"""
        resp = client.post("/api/journals", json={"date": "2024-03-30"})
        journal_id = resp.json["data"]["id"]

        resp = client.post("/api/journals/2024-03-30/events", json={
            "title": "事件1"
        })
        event_id = resp.json["data"]["id"]

        resp = client.post(f"/api/events/{event_id}/reflections", json={
            "type": "good",
            "content": "反思1"
        })
        reflection_id = resp.json["data"]["id"]

        client.delete(f"/api/journals/{journal_id}")

        assert client.get(f"/api/events/{event_id}").status_code == 404
        assert client.get(f"/api/reflections/{reflection_id}").status_code == 404


class TestEventCount:
    """事件计数测试"""

    def test_journal_event_count(self, client, db_session):
        """测试日记事件计数"""
        client.post("/api/journals", json={"date": "2024-03-30"})

        client.post("/api/journals/2024-03-30/events", json={"title": "事件1"})
        client.post("/api/journals/2024-03-30/events", json={"title": "事件2"})
        client.post("/api/journals/2024-03-30/events", json={"title": "事件3"})

        response = client.get("/api/journals/2024-03-30")
        assert response.json["data"]["event_count"] == 3

    def test_event_reflection_count(self, client, db_session):
        """测试事件反思计数"""
        client.post("/api/journals", json={"date": "2024-03-30"})
        resp = client.post("/api/journals/2024-03-30/events", json={
            "title": "事件"
        })
        event_id = resp.json["data"]["id"]

        client.post(f"/api/events/{event_id}/reflections", json={
            "type": "good",
            "content": "好"
        })
        client.post(f"/api/events/{event_id}/reflections", json={
            "type": "bad",
            "content": "不好"
        })

        response = client.get(f"/api/events/{event_id}")
        assert response.json["data"]["reflection_count"] == 2


class TestEdgeCases:
    """边缘情况测试"""

    def test_event_without_time(self, client, db_session):
        """测试事件没有时间"""
        client.post("/api/journals", json={"date": "2024-03-30"})

        response = client.post("/api/journals/2024-03-30/events", json={
            "title": "无时间事件"
        })
        assert response.status_code == 200
        assert response.json["data"]["start_time"] is None
        assert response.json["data"]["end_time"] is None

    def test_event_without_location(self, client, db_session):
        """测试事件没有地点"""
        client.post("/api/journals", json={"date": "2024-03-30"})

        response = client.post("/api/journals/2024-03-30/events", json={
            "title": "无地点事件",
            "start_time": "09:00"
        })
        assert response.status_code == 200
        assert response.json["data"]["location"] is None

    def test_journal_without_mood(self, client, db_session):
        """测试日记没有心情"""
        response = client.post("/api/journals", json={
            "date": "2024-03-30"
        })
        assert response.status_code == 200
        assert response.json["data"]["mood"] is None

    def test_multiple_journals_different_dates(self, client, db_session):
        """测试多个不同日期的日记"""
        for i in range(5):
            client.post("/api/journals", json={"date": f"2024-03-{i+1:02d}"})

        response = client.get("/api/journals")
        assert response.json["data"]["total"] == 5

    def test_multiple_events_in_journal(self, client, db_session):
        """测试一个日记多个事件"""
        client.post("/api/journals", json={"date": "2024-03-30"})

        for i in range(3):
            client.post("/api/journals/2024-03-30/events", json={
                "title": f"事件{i+1}",
                "start_time": f"{9+i*2:02d}:00",
                "end_time": f"{11+i*2:02d}:00"
            })

        response = client.get("/api/journals/2024-03-30")
        assert len(response.json["data"]["events"]) == 3

    def test_multiple_reflections_in_event(self, client, db_session):
        """测试一个事件多个反思"""
        client.post("/api/journals", json={"date": "2024-03-30"})
        resp = client.post("/api/journals/2024-03-30/events", json={
            "title": "事件"
        })
        event_id = resp.json["data"]["id"]

        client.post(f"/api/events/{event_id}/reflections", json={
            "type": "good",
            "content": "好1"
        })
        client.post(f"/api/events/{event_id}/reflections", json={
            "type": "good",
            "content": "好2"
        })
        client.post(f"/api/events/{event_id}/reflections", json={
            "type": "bad",
            "content": "不好"
        })

        response = client.get(f"/api/events/{event_id}")
        assert len(response.json["data"]["reflections"]) == 3

    def test_long_content(self, client, db_session):
        """测试长内容"""
        client.post("/api/journals", json={"date": "2024-03-30"})
        resp = client.post("/api/journals/2024-03-30/events", json={
            "title": "事件"
        })
        event_id = resp.json["data"]["id"]

        long_content = "a" * 1000
        response = client.post(f"/api/events/{event_id}/reflections", json={
            "type": "good",
            "content": long_content
        })
        assert response.status_code == 200
        assert response.json["data"]["content"] == long_content