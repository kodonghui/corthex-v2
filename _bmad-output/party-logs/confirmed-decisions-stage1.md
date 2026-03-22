# Stage 1 Tech Research — Confirmed Decisions (v9.2 Reverify)

Date: 2026-03-22
Source: Stage 1 reverify 102 fixes across Steps 2-6

---

## Mandatory Changes (PRD/Architecture must reflect these)

### 1. Embedding Provider
- **OLD**: Gemini `text-embedding-004` (768d)
- **NEW**: Voyage AI `voyage-3` (1024d)
- **Reason**: Gemini API 전면 금지 (CLAUDE.md, feedback_no_gemini.md)
- **Impact**: `vector(768)` → `vector(1024)`, re-embed 필수, HNSW rebuild

### 2. n8n Docker Memory
- **OLD**: `--memory=4g`, `NODE_OPTIONS=--max-old-space-size=4096`
- **NEW**: `--memory=2g`, `NODE_OPTIONS=--max-old-space-size=1536`
- **Reason**: Brief mandate. 4G + max-old-space-size=4096 = OOM 확정

### 3. n8n Security Layers
- **OLD**: 6-layer
- **NEW**: 8-layer (added: N8N_ENCRYPTION_KEY AES-256-GCM, NODE_OPTIONS V8 heap cap)

### 4. UXUI Tool
- **OLD**: Subframe (primary)
- **NEW**: Stitch 2 (primary), Subframe deprecated
- **Reason**: 2026-03-21 사장님 결정

### 5. Observation TTL
- **OLD**: 90일
- **NEW**: 30일 (processed observations)
- **Reason**: Neon storage 절약, 90일이면 Free tier 4개월 만에 초과

### 6. LLM Cost
- **OLD**: ~$5/month
- **NEW**: ~$17/month (reflection $1.80 + importance scoring $9 + operational $6.20)

### 7. Observation Schema
- `is_processed` → `reflected` (field rename)
- `processed_at` → `reflected_at`

### 8. Observation Poisoning Defense
- Decision 4.4.5: 4-layer sanitization (max 10KB, control char strip, prompt hardening, content classification)

### 9. Advisory Lock
- `pg_advisory_xact_lock(hashtext(companyId))` in reflection cron
- Prevents concurrent runs → duplicate reflections

### 10. WebSocket Limits
- 50 connections/company, 500/server total
- Rate: 10 msg/s per userId (token bucket)

### 11. Go/No-Go Gates
- 8 → 11 gates (added: #9 observation poisoning, #10 Voyage migration, #11 cost ceiling)

### 12. Docker host.docker.internal
- Linux Docker Engine에서 미작동 → `172.17.0.1` 또는 `host-gateway` 사용
