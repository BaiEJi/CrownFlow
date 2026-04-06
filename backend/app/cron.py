"""
定时任务模块

使用 Flask-APScheduler 实现定时任务。
任务每天上午10点执行，打印当天所有活跃订阅的花费统计。

数据来源：Subscription 表（而非 Member 表）
"""

from datetime import datetime, timedelta
from decimal import Decimal
from flask_apscheduler import APScheduler
from app.database import SessionLocal
from app.models.models import Subscription
from app.utils.currency import convert_to_base, calculate_daily_rate, get_billing_cycle_days
from app.backup import backup_databases

scheduler = APScheduler()


@scheduler.task('cron', id='daily_spending', hour=10, minute=0)
def print_daily_spending():
    """
    每天上午10点打印当天所有活跃订阅的花费
    
    计算当天所有活跃订阅的日均支出，并按分类汇总打印。
    活跃订阅定义：start_date <= 今天 <= end_date
    """
    db = SessionLocal()
    today = datetime.now().strftime("%Y-%m-%d")
    
    try:
        subscriptions = db.query(Subscription).filter(
            Subscription.start_date <= today,
            Subscription.end_date >= today
        ).all()
        
        if not subscriptions:
            print(f"[{today}] 今日无活跃订阅")
            return
        
        total_spending = Decimal("0")
        category_spending = {}
        
        for sub in subscriptions:
            daily_rate = calculate_daily_rate(
                sub.price, sub.billing_cycle, sub.custom_days, sub.start_date
            )
            daily_rate_cny = convert_to_base(daily_rate, sub.currency)
            total_spending += daily_rate_cny
            
            member = sub.member
            cat_name = member.category.name if member and member.category else "未分类"
            if cat_name not in category_spending:
                category_spending[cat_name] = Decimal("0")
            category_spending[cat_name] += daily_rate_cny
        
        print(f"\n{'='*50}")
        print(f"[{today}] 今日订阅花费统计")
        print(f"{'='*50}")
        print(f"活跃订阅数: {len(subscriptions)}")
        print(f"\n按分类统计:")
        for cat_name, spending in sorted(category_spending.items(), key=lambda x: x[1], reverse=True):
            print(f"  {cat_name}: ¥{float(spending.quantize(Decimal('0.01'))):.2f}")
        print(f"\n今日总支出: ¥{float(total_spending.quantize(Decimal('0.01'))):.2f}")
        print(f"{'='*50}\n")
        
    finally:
        db.close()


@scheduler.task('cron', id='daily_backup', hour=2, minute=0)
def daily_database_backup():
    """
    每天凌晨2点自动备份数据库
    
    备份两个数据库:
    1. crownflow.db (主后端数据库)
    2. journal.db (日记服务数据库)
    
    备份文件保存在 {项目根目录}/backups/ 目录
    文件命名格式: {db_name}_YYYYMMDD_HHMMSS.db
    自动清理90天前的旧备份
    """
    print(f"\n{'='*50}")
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 执行数据库备份")
    print(f"{'='*50}")
    
    try:
        results = backup_databases()
        
        print("\n备份结果:")
        for db_name, result in results.items():
            print(f"  {db_name}: {result}")
        
        print(f"\n{'='*50}\n")
        
    except Exception as e:
        print(f"数据库备份失败: {e}")