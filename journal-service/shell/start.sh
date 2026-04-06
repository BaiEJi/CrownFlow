#!/bin/bash

# Journal Service - Start Script
# 启动后端服务，支持后台运行

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICE_DIR="$(dirname "$SCRIPT_DIR")"
PID_FILE="$SERVICE_DIR/.journal.pid"
LOG_FILE="$SERVICE_DIR/logs/journal.log"

mkdir -p "$SERVICE_DIR/logs"
mkdir -p "$SERVICE_DIR/data"

if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
        echo "❌ Journal service is already running (PID: $PID)"
        exit 1
    else
        echo "⚠️  Stale PID file found, cleaning up..."
        rm -f "$PID_FILE"
    fi
fi

echo "🚀 Starting Journal service..."

source "$(conda info --base)/etc/profile.d/conda.sh"
conda activate web

cd "$SERVICE_DIR"

nohup python -m app.main > "$LOG_FILE" 2>&1 &
PID=$!
disown $PID

echo "$PID" > "$PID_FILE"

sleep 2

if ps -p "$PID" > /dev/null 2>&1; then
    echo "✅ Journal service started successfully!"
    echo "   PID: $PID"
    echo "   Port: 60002"
    echo "   Log: $LOG_FILE"
    echo ""
    echo "Useful commands:"
    echo "  - Check status: ./journal-service/shell/status.sh"
    echo "  - View logs: tail -f $LOG_FILE"
    echo "  - Stop service: ./journal-service/shell/stop.sh"
else
    echo "❌ Failed to start Journal service"
    echo "Check logs at: $LOG_FILE"
    rm -f "$PID_FILE"
    exit 1
fi