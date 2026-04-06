#!/bin/bash

# CrownFlow Backend Service - Restart Script
# 重启后端服务

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔄 Restarting CrownFlow service..."

# 停止服务
"$SCRIPT_DIR/stop.sh" 2>/dev/null || true

# 等待端口释放
sleep 2

# 启动服务
"$SCRIPT_DIR/start.sh"