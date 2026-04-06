#!/bin/bash

# CrownFlow Frontend Service - Restart Script
# 重启前端开发服务器

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔄 Restarting CrownFlow frontend service..."

# 停止服务
"$SCRIPT_DIR/stop.sh" 2>/dev/null || true

# 等待端口释放
sleep 2

# 启动服务
"$SCRIPT_DIR/start.sh"
