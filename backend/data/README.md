# backend/data 目录说明

此目录用于存放 SQLite 数据库文件。

## 数据库位置

- **开发/生产环境**: `backend/data/crownflow.db`
- **测试环境**: 内存数据库 (不生成文件)

## 自动创建

启动服务时会自动创建此目录，无需手动操作。

## 备份

建议定期备份数据库文件：

\`\`\`bash
# 备份
cp backend/data/crownflow.db backend/data/crownflow.db.backup_$(date +%Y%m%d)

# 恢复
cp backend/data/crownflow.db.backup_20240320 backend/data/crownflow.db
\`\`\`

## 注意事项

- 此目录已添加到 .gitignore，不会被提交到代码仓库
- 数据库文件会随着使用逐渐增大，请定期清理或备份
- 如需自定义路径，可设置环境变量 \`DATABASE_URL\`