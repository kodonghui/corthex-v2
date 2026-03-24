#!/usr/bin/env bash
# n8n Docker Deployment Script — Story 25.1
# Usage: ./infrastructure/n8n/deploy.sh [up|down|restart|status|logs]
set -euo pipefail

COMPOSE_FILE="docker-compose.n8n.yml"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="${PROJECT_DIR}/infrastructure/n8n/.env"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[n8n]${NC} $*"; }
warn() { echo -e "${YELLOW}[n8n]${NC} $*"; }
err() { echo -e "${RED}[n8n]${NC} $*" >&2; }

# Pre-flight checks
preflight() {
  if ! command -v docker &>/dev/null; then
    err "Docker not installed"
    exit 1
  fi

  if ! docker compose version &>/dev/null; then
    err "Docker Compose plugin not installed. Run: sudo apt-get install docker-compose-v2"
    exit 1
  fi

  if [ ! -f "$ENV_FILE" ]; then
    warn ".env file not found at $ENV_FILE"
    warn "Creating from template..."
    cp "${PROJECT_DIR}/infrastructure/n8n/.env.example" "$ENV_FILE"

    # Auto-generate encryption key if empty
    if ! grep -q 'N8N_ENCRYPTION_KEY=.' "$ENV_FILE"; then
      local key
      key=$(openssl rand -hex 32)
      sed -i "s/^N8N_ENCRYPTION_KEY=$/N8N_ENCRYPTION_KEY=${key}/" "$ENV_FILE"
      log "Generated N8N_ENCRYPTION_KEY (save this — losing it means losing encrypted credentials)"
    fi
  fi

  # Source env
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a

  if [ -z "${N8N_ENCRYPTION_KEY:-}" ]; then
    err "N8N_ENCRYPTION_KEY is not set in $ENV_FILE"
    exit 1
  fi
}

cmd_up() {
  preflight
  log "Starting n8n container..."
  cd "$PROJECT_DIR"
  docker compose -f "$COMPOSE_FILE" up -d
  log "Waiting for healthcheck..."

  local attempts=0
  local max_attempts=10
  while [ $attempts -lt $max_attempts ]; do
    if docker compose -f "$COMPOSE_FILE" ps --format json 2>/dev/null | grep -q '"healthy"'; then
      log "n8n is healthy and running at http://127.0.0.1:5678"
      return 0
    fi
    sleep 5
    attempts=$((attempts + 1))
    log "Waiting... ($attempts/$max_attempts)"
  done

  warn "n8n started but healthcheck not yet passing (may still be initializing)"
  docker compose -f "$COMPOSE_FILE" ps
}

cmd_down() {
  log "Stopping n8n container..."
  cd "$PROJECT_DIR"
  docker compose -f "$COMPOSE_FILE" down
  log "n8n stopped"
}

cmd_restart() {
  cmd_down
  cmd_up
}

cmd_status() {
  cd "$PROJECT_DIR"
  if docker compose -f "$COMPOSE_FILE" ps --format json 2>/dev/null | grep -q 'corthex-n8n'; then
    docker compose -f "$COMPOSE_FILE" ps
    echo ""
    # Health check
    if curl -sf http://127.0.0.1:5678/healthz >/dev/null 2>&1; then
      log "Health: OK"
    else
      warn "Health: UNREACHABLE (may be starting)"
    fi
  else
    warn "n8n container is not running"
  fi
}

cmd_logs() {
  cd "$PROJECT_DIR"
  docker compose -f "$COMPOSE_FILE" logs -f --tail=100
}

# Main
case "${1:-help}" in
  up)      cmd_up ;;
  down)    cmd_down ;;
  restart) cmd_restart ;;
  status)  cmd_status ;;
  logs)    cmd_logs ;;
  *)
    echo "Usage: $0 {up|down|restart|status|logs}"
    echo ""
    echo "  up       Start n8n container"
    echo "  down     Stop n8n container"
    echo "  restart  Restart n8n container"
    echo "  status   Show container status"
    echo "  logs     Follow container logs"
    exit 1
    ;;
esac
