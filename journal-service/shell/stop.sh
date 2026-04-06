#!/bin/bash

# Journal Service - Stop Script
# 停止后端服务

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICE_DIR="$(dirname "$SCRIPT_DIR")"
PID_FILE="$SERVICE_DIR/.journal.pid"

if [ ! -f "$PID_FILE" ]; then
    echo "❌ Journal service is not running (no PID file found)"
    exit 1
fi

PID=$(cat "$PID_FILE")

if ! ps -p "$PID" > /dev/null 2>&1; then
    echo "⚠️  Process $PID is not running, cleaning up PID file..."
    rm -f "$PID_FILE"
    exit 1
fi

echo "🛑 Stopping Journal service (PID: $PID)..."
kill "$PID"

sleep 2

if ps -p "$PID" > /dev/null 2>&1; then
    echo "⚠️  Process still running, sending SIGKILL..."
    kill -9 "$PID"
    sleep 1
fi

rm -f "$PID_FILE"
echo "✅ Journal service stopped successfully!"