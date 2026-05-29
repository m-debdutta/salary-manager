#!/usr/bin/env bash
# start.sh — Launch the full salary-manager stack
#
# Usage:
#   ./start.sh              # start backend and frontend
#   ./start.sh seed=true    # seed employees first, then start everything
#   ./start.sh prisma=true  # also start Prisma Studio

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

# ── Colour helpers ────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

log()  { echo -e "${BOLD}[start.sh]${RESET} $*"; }
ok()   { echo -e "${GREEN}[start.sh]${RESET} $*"; }
warn() { echo -e "${YELLOW}[start.sh]${RESET} $*"; }
err()  { echo -e "${RED}[start.sh]${RESET} $*" >&2; }

# ── Argument parsing ──────────────────────────────────────────────────────────
SEED=false
PRISMA=false

for arg in "$@"; do
  case "$arg" in
    seed=true)    SEED=true ;;
    seed=false)   SEED=false ;;
    prisma=true)  PRISMA=true ;;
    prisma=false) PRISMA=false ;;
    *)
      err "Unknown option: $arg"
      echo "Usage: $0 [seed=true|seed=false] [prisma=true|prisma=false]"
      exit 1
      ;;
  esac
done

# ── Dependency check ──────────────────────────────────────────────────────────
for cmd in node npm; do
  if ! command -v "$cmd" &>/dev/null; then
    err "'$cmd' is not installed or not on PATH. Aborting."
    exit 1
  fi
done

# ── PID tracking for cleanup ──────────────────────────────────────────────────
PIDS=()

cleanup() {
  echo ""
  warn "Shutting down all processes…"
  for pid in "${PIDS[@]}"; do
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
    fi
  done
  ok "All processes stopped. Goodbye."
}

trap cleanup SIGINT SIGTERM EXIT

# ── Install dependencies ──────────────────────────────────────────────────────
log "Installing ${CYAN}Backend${RESET} dependencies…"
(cd "$BACKEND_DIR" && npm install)
ok "Backend dependencies installed."

log "Installing ${CYAN}Frontend${RESET} dependencies…"
(cd "$FRONTEND_DIR" && npm install)
ok "Frontend dependencies installed."

# ── Optional seeding ──────────────────────────────────────────────────────────
if [[ "$SEED" == "true" ]]; then
  log "Running database seed…"
  (cd "$BACKEND_DIR" && npm run seed)
  ok "Seeding complete."
fi

# ── Start services ────────────────────────────────────────────────────────────
if [[ "$PRISMA" == "true" ]]; then
  log "Starting ${CYAN}Prisma Studio${RESET} (db:studio)…"
  (cd "$BACKEND_DIR" && npm run db:studio) &
  PIDS+=($!)
fi

log "Starting ${CYAN}Backend${RESET} dev server (port 3000)…"
(cd "$BACKEND_DIR" && npm run dev) &
PIDS+=($!)

log "Starting ${CYAN}Frontend${RESET} dev server (port 5173)…"
(cd "$FRONTEND_DIR" && npm run dev) &
PIDS+=($!)

ok "All services started. PIDs: ${PIDS[*]}"
echo -e ""
echo -e "  ${BOLD}Backend   ${RESET}→ ${GREEN}http://localhost:3000${RESET}"
echo -e "  ${BOLD}Frontend  ${RESET}→ ${GREEN}http://localhost:5173${RESET}"
if [[ "$PRISMA" == "true" ]]; then
  echo -e "  ${BOLD}DB Studio ${RESET}→ ${GREEN}http://localhost:5555${RESET}"
fi
echo -e ""
echo -e "  Press ${BOLD}Ctrl+C${RESET} to stop all services."
echo ""

# Wait for any child to exit (e.g. a crash); if one dies, cleanup triggers.
wait "${PIDS[@]}"
