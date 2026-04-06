#!/bin/bash

# Journal Service - Restart Script
# 重启后端服务

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔄 Restarting Journal service..."

"$SCRIPT_DIR/stop.sh" || true
sleep 2
"$SCRIPT_DIR/start.sh"