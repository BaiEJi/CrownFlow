#!/bin/bash

# CrownFlow Frontend Service - Start Script
# 启动前端开发服务器

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$(dirname "$SCRIPT_DIR")"
PID_FILE="$FRONTEND_DIR/.vite.pid"
LOG_FILE="$FRONTEND_DIR/logs/vite.log"

# 创建必要目录
mkdir -p "$FRONTEND_DIR/logs"

# 检查服务是否已运行
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
        echo "❌ CrownFlow frontend is already running (PID: $PID)"
        exit 1
    else
        echo "⚠️  Stale PID file found, cleaning up..."
        rm -f "$PID_FILE"
    fi
fi

echo "🚀 Starting CrownFlow frontend service..."

# 检查node_modules是否存在
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo "📦 Installing dependencies..."
    cd "$FRONTEND_DIR"
    npm install
fi

# 切换到前端目录
cd "$FRONTEND_DIR"

# 启动服务
nohup npm run dev > "$LOG_FILE" 2>&1 &
PID=$!
disown $PID

# 保存PID
echo "$PID" > "$PID_FILE"

# 等待服务启动
sleep 3

# 检查服务是否成功启动
if ps -p "$PID" > /dev/null 2>&1; then
    echo "✅ CrownFlow frontend service started successfully!"
    echo "   PID: $PID"
    echo "   Port: 60001"
    echo "   Log: $LOG_FILE"
    echo "   URL: http://localhost:60001"
    echo ""
    echo "Useful commands:"
    echo "  - Check status: ./frontend/shell/status.sh"
    echo "  - View logs: tail -f $LOG_FILE"
    echo "  - Stop service: ./frontend/shell/stop.sh"
else
    echo "❌ Failed to start CrownFlow frontend service"
    echo "Check logs at: $LOG_FILE"
    rm -f "$PID_FILE"
    exit 1
fi
