"""
数据库备份模块

提供自动化的数据库备份功能，支持定时备份和旧备份清理。
"""

import os
import shutil
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Tuple
import logging

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent.parent
BACKUP_DIR = BASE_DIR / "backups"
BACKUP_DIR.mkdir(exist_ok=True)

BACKUP_RETENTION_DAYS = 90

MAIN_DB_PATH = BASE_DIR / "backend" / "data" / "crownflow.db"
JOURNAL_DB_PATH = BASE_DIR / "journal-service" / "data" / "journal.db"


def backup_databases() -> Dict[str, str]:
    """
    备份所有数据库
    
    Returns:
        Dict[str, str]: 备份结果，包含每个数据库的备份路径或错误信息
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    results = {}
    
    databases = [
        ("crownflow", MAIN_DB_PATH),
        ("journal", JOURNAL_DB_PATH),
    ]
    
    for db_name, db_path in databases:
        try:
            if not db_path.exists():
                logger.warning(f"数据库文件不存在: {db_path}")
                results[db_name] = f"数据库文件不存在: {db_path}"
                continue
            
            backup_filename = f"{db_name}_{timestamp}.db"
            backup_path = BACKUP_DIR / backup_filename
            
            shutil.copy2(db_path, backup_path)
            
            file_size = backup_path.stat().st_size
            logger.info(f"备份成功: {backup_filename} (大小: {file_size} 字节)")
            results[db_name] = f"成功: {backup_path}"
            
        except Exception as e:
            error_msg = f"备份失败: {str(e)}"
            logger.error(f"{db_name} 数据库备份失败: {e}", exc_info=True)
            results[db_name] = error_msg
    
    cleanup_old_backups()
    
    return results


def cleanup_old_backups() -> int:
    """
    清理过期的备份文件
    
    Returns:
        int: 删除的备份文件数量
    """
    deleted_count = 0
    cutoff_date = datetime.now() - timedelta(days=BACKUP_RETENTION_DAYS)
    
    try:
        backup_files = list(BACKUP_DIR.glob("*.db"))
        
        for backup_file in backup_files:
            try:
                file_mtime = datetime.fromtimestamp(backup_file.stat().st_mtime)
                
                if file_mtime < cutoff_date:
                    backup_file.unlink()
                    deleted_count += 1
                    logger.info(f"删除过期备份: {backup_file.name}")
                    
            except Exception as e:
                logger.error(f"删除备份文件失败 {backup_file.name}: {e}", exc_info=True)
                
        if deleted_count > 0:
            logger.info(f"清理完成，共删除 {deleted_count} 个过期备份文件")
            
    except Exception as e:
        logger.error(f"清理备份文件失败: {e}", exc_info=True)
    
    return deleted_count


def get_backup_stats() -> Dict:
    """
    获取备份统计信息
    
    Returns:
        Dict: 包含备份总数、总大小、最旧和最新备份等信息
    """
    stats = {
        "total_count": 0,
        "total_size": 0,
        "crownflow_count": 0,
        "journal_count": 0,
        "oldest_backup": None,
        "newest_backup": None,
        "backups": []
    }
    
    try:
        backup_files = sorted(
            BACKUP_DIR.glob("*.db"),
            key=lambda x: x.stat().st_mtime,
            reverse=True
        )
        
        stats["total_count"] = len(backup_files)
        
        for backup_file in backup_files:
            file_stat = backup_file.stat()
            file_mtime = datetime.fromtimestamp(file_stat.st_mtime)
            
            stats["total_size"] += file_stat.st_size
            
            if backup_file.name.startswith("crownflow"):
                stats["crownflow_count"] += 1
            elif backup_file.name.startswith("journal"):
                stats["journal_count"] += 1
            
            if stats["oldest_backup"] is None:
                stats["oldest_backup"] = file_mtime.strftime("%Y-%m-%d %H:%M:%S")
            stats["newest_backup"] = file_mtime.strftime("%Y-%m-%d %H:%M:%S")
            
            stats["backups"].append({
                "name": backup_file.name,
                "size": file_stat.st_size,
                "created_at": file_mtime.strftime("%Y-%m-%d %H:%M:%S")
            })
        
        stats["total_size_mb"] = round(stats["total_size"] / (1024 * 1024), 2)
        
    except Exception as e:
        logger.error(f"获取备份统计信息失败: {e}", exc_info=True)
    
    return stats


def get_backups_by_database(db_name: str) -> List[Dict]:
    """
    获取指定数据库的备份列表
    
    Args:
        db_name: 数据库名称 (crownflow 或 journal)
        
    Returns:
        List[Dict]: 备份文件列表
    """
    backups = []
    
    try:
        backup_files = sorted(
            BACKUP_DIR.glob(f"{db_name}_*.db"),
            key=lambda x: x.stat().st_mtime,
            reverse=True
        )
        
        for backup_file in backup_files:
            file_stat = backup_file.stat()
            file_mtime = datetime.fromtimestamp(file_stat.st_mtime)
            
            backups.append({
                "name": backup_file.name,
                "path": str(backup_file),
                "size": file_stat.st_size,
                "size_mb": round(file_stat.st_size / (1024 * 1024), 2),
                "created_at": file_mtime.strftime("%Y-%m-%d %H:%M:%S")
            })
            
    except Exception as e:
        logger.error(f"获取 {db_name} 备份列表失败: {e}", exc_info=True)
    
    return backups


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    print("\n执行数据库备份...")
    results = backup_databases()
    
    print("\n备份结果:")
    for db_name, result in results.items():
        print(f"  {db_name}: {result}")
    
    print("\n备份统计:")
    stats = get_backup_stats()
    print(f"  总备份数: {stats['total_count']}")
    print(f"  总大小: {stats['total_size_mb']} MB")
    print(f"  crownflow 备份: {stats['crownflow_count']}")
    print(f"  journal 备份: {stats['journal_count']}")
    if stats['newest_backup']:
        print(f"  最新备份: {stats['newest_backup']}")
    if stats['oldest_backup']:
        print(f"  最旧备份: {stats['oldest_backup']}")