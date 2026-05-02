#!/bin/bash

# ─────────────────────────────────────────────
#  GHG-FuseNet — Local Development Startup
# ─────────────────────────────────────────────
# Starts:
#   - Backend  → http://localhost:8000
#   - Frontend → http://localhost:3000
# Stop both with Ctrl+C

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"

# Colours
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "\n${CYAN}╔══════════════════════════════════════╗${NC}"
echo -e "${CYAN}║        GHG-FuseNet  Launcher         ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════╝${NC}\n"

# ── Backend ──────────────────────────────────
if [ ! -d "$BACKEND/venv" ]; then
  echo -e "${YELLOW}⚙  Creating Python virtual environment...${NC}"
  python3 -m venv "$BACKEND/venv"
  "$BACKEND/venv/bin/pip" install -r "$BACKEND/requirements.txt" --quiet
fi

echo -e "${GREEN}🚀 Starting backend  → http://localhost:8000${NC}"
"$BACKEND/venv/bin/uvicorn" ghg_api:app --host 0.0.0.0 --port 8000 --app-dir "$BACKEND" &
BACKEND_PID=$!

# ── Frontend ─────────────────────────────────
echo -e "${GREEN}🌐 Starting frontend → http://localhost:3000${NC}"
cd "$FRONTEND" && npm start &
FRONTEND_PID=$!

echo -e "\n${CYAN}Both servers are starting up...${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop everything.\n${NC}"

# ── Cleanup on exit ───────────────────────────
cleanup() {
  echo -e "\n${YELLOW}Shutting down...${NC}"
  kill "$BACKEND_PID"  2>/dev/null
  kill "$FRONTEND_PID" 2>/dev/null
  wait "$BACKEND_PID"  2>/dev/null
  wait "$FRONTEND_PID" 2>/dev/null
  echo -e "${GREEN}✅ All servers stopped.${NC}"
}

trap cleanup INT TERM
wait
