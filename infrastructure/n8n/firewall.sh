#!/usr/bin/env bash
# N8N-SEC-1: VPS Firewall — Block external access to n8n port 5678
# Only localhost (127.0.0.1) can reach n8n. All external traffic is dropped.
#
# Usage:
#   sudo ./infrastructure/n8n/firewall.sh apply    — Apply firewall rules
#   sudo ./infrastructure/n8n/firewall.sh remove   — Remove firewall rules
#   sudo ./infrastructure/n8n/firewall.sh status   — Check current rules
set -euo pipefail

N8N_PORT=5678
RULE_COMMENT="n8n-sec-1-block-external"

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

log() { echo -e "${GREEN}[N8N-SEC-1]${NC} $*"; }
err() { echo -e "${RED}[N8N-SEC-1]${NC} $*" >&2; }

check_root() {
  if [ "$(id -u)" -ne 0 ]; then
    err "This script must be run as root (sudo)"
    exit 1
  fi
}

cmd_apply() {
  check_root

  # Allow localhost
  if ! iptables -C INPUT -p tcp --dport "$N8N_PORT" -s 127.0.0.1 -j ACCEPT -m comment --comment "$RULE_COMMENT" 2>/dev/null; then
    iptables -A INPUT -p tcp --dport "$N8N_PORT" -s 127.0.0.1 -j ACCEPT -m comment --comment "$RULE_COMMENT"
    log "Allow localhost → :$N8N_PORT"
  fi

  # Allow Docker internal (172.16.0.0/12)
  if ! iptables -C INPUT -p tcp --dport "$N8N_PORT" -s 172.16.0.0/12 -j ACCEPT -m comment --comment "$RULE_COMMENT" 2>/dev/null; then
    iptables -A INPUT -p tcp --dport "$N8N_PORT" -s 172.16.0.0/12 -j ACCEPT -m comment --comment "$RULE_COMMENT"
    log "Allow Docker internal → :$N8N_PORT"
  fi

  # Drop everything else
  if ! iptables -C INPUT -p tcp --dport "$N8N_PORT" -j DROP -m comment --comment "$RULE_COMMENT" 2>/dev/null; then
    iptables -A INPUT -p tcp --dport "$N8N_PORT" -j DROP -m comment --comment "$RULE_COMMENT"
    log "Drop external → :$N8N_PORT"
  fi

  # Persist rules across reboots
  if command -v iptables-save &>/dev/null; then
    iptables-save > /etc/iptables/rules.v4 2>/dev/null || \
    iptables-save > /etc/iptables.rules 2>/dev/null || \
    log "Warning: could not persist rules (install iptables-persistent)"
  fi

  log "Firewall rules applied and persisted. Port $N8N_PORT blocked externally."
}

cmd_remove() {
  check_root

  # Remove all rules with our comment
  while iptables -D INPUT -p tcp --dport "$N8N_PORT" -s 127.0.0.1 -j ACCEPT -m comment --comment "$RULE_COMMENT" 2>/dev/null; do true; done
  while iptables -D INPUT -p tcp --dport "$N8N_PORT" -s 172.16.0.0/12 -j ACCEPT -m comment --comment "$RULE_COMMENT" 2>/dev/null; do true; done
  while iptables -D INPUT -p tcp --dport "$N8N_PORT" -j DROP -m comment --comment "$RULE_COMMENT" 2>/dev/null; do true; done

  log "Firewall rules removed."
}

cmd_status() {
  log "Current iptables rules for port $N8N_PORT:"
  iptables -L INPUT -n --line-numbers 2>/dev/null | grep -E "$N8N_PORT|$RULE_COMMENT" || log "No rules found for port $N8N_PORT"
}

case "${1:-help}" in
  apply)  cmd_apply ;;
  remove) cmd_remove ;;
  status) cmd_status ;;
  *)
    echo "Usage: sudo $0 {apply|remove|status}"
    exit 1
    ;;
esac
