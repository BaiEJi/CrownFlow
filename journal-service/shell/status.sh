#!/bin/bash

# Journal Service - Status Script
# 检查服务运行状态

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICE_DIR="$(dirname "$SCRIPT_DIR")"
PID_FILE="$SERVICE_DIR/.journal.pid"
LOG_FILE="$SERVICE_DIR/logs/journal.log"

echo "📊 Journal Service Status"
echo "========================"

if [ ! -f "$PID_FILE" ]; then
    echo "Status: ❌ Not running"
    echo "PID File: Not found"
    exit 0
fi

PID=$(cat "$PID_FILE")

if ps -p "$PID" > /dev/null 2>&1; then
    echo "Status: ✅ Running"
    echo "PID: $PID"
    echo "Port: 60002"
    echo "Log: $LOG_FILE"
    
    echo ""
    echo "Recent logs (last 5 lines):"
    if [ -f "$LOG_FILE" ]; then
        tail -n 5 "$LOG_FILE"
    else
        echo "Log file not found"
    fi
else
    echo "Status: ❌ Not running"
    echo "PID File: Exists ($PID) but process not found"
    echo "Note: Cleaning up stale PID file..."
    rm -f "$PID_FILE"
fi