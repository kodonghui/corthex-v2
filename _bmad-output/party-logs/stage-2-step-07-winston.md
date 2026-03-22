# Critic-A Review — Stage 2 Step 7: Domain-Specific Requirements (PRD L1352-1531)

**Reviewer**: Winston (Architecture + API)
**Date**: 2026-03-22
**Artifact**: `_bmad-output/planning-artifacts/prd.md` lines 1352–1536
**Grade Request**: B (reverify)
**Revision**: v1 6.30 FAIL → **v2 8.75 PASS**

---

## Review Score: 8.75/10 ✅ PASS

### 차원별 점수

| 차원 | 점수 | 가중치 | v1→v2 | 근거 |
|------|------|--------|-------|------|
| D1 구체성 | 9/10 | 15% | 8→9 | 80개 요구사항 전부 ID+상세+Phase. MEM-2 full trigger spec (AND model + Tier + ECC + lock) 전체 PRD 최상급. N8N-SEC-5 Docker 설정 4항목 구체. MEM-6 4-layer 명확 |
| D2 완전성 | 8/10 | 15% | 6→8 | 75→80개. 8-layer 7/8 커버 (Layer 3 API key header injection 1개 잔류). 확정 결정 #2/#3/#5/#8/#9/#10 전부 반영. MEM-6(obs poisoning), MEM-7(TTL), NRT-5(WS limits) 추가 |
| D3 정확성 | 9/10 | **25%** | 6→9 | N8N-SEC-5 2G 정합. VEC-1 chunk 근거 교정. SOUL-6 soul-renderer.ts. MEM-4/5 Planning→Reflection read-time. MEM-1 Option B 명확. SEC-7 summary table "유지" 분류 잔류 (미차단) |
| D4 실행가능성 | 9/10 | **20%** | 6→9 | MEM-2 즉시 구현 가능 (cron schedule + threshold + cost gate + lock 전부 명시). N8N-SEC-5 docker-compose 설정 즉시 복사 가능. MEM-5 감사 로그 필드 3개 지정 |
| D5 일관성 | 9/10 | 15% | 6→9 | N8N-SEC-5 = Brief + 확정 결정 + Exec Summary 4곳 정합. MEM-2 = Product Scope L951-954 정합. SOUL-6 = Product Scope L958 정합. Summary table 80개 수학 정확 |
| D6 리스크 | 8/10 | 10% | 6→8 | MEM-6 obs poisoning 방어 완비. N8N-SEC-7/8 암호화+rate limit. NRT-5 connection flood 방지. Layer 3 API key injection 잔류 = 인증 갭 |

**가중 평균**: (9×0.15)+(8×0.15)+(9×0.25)+(9×0.20)+(9×0.15)+(8×0.10) = 1.35+1.20+2.25+1.80+1.35+0.80 = **8.75**

---

## Fix 검증 (15건 — fixes.md 기준)

### CRITICAL (1건)

| Fix # | 이슈 | 검증 | 판정 |
|-------|------|------|------|
| Fix 1 | N8N-SEC-5 `memory: 4G` → `2G` | L1459: `memory: 2G`, `cpus: '2'`, `NODE_OPTIONS=--max-old-space-size=1536`. `restart: unless-stopped`. Brief 참조 + "4G=OOM 확정" 명시. 3단계 에스컬레이션 L549 참조 ✅ | ✅ FIXED |

### MAJOR (6건)

| Fix # | 이슈 | 검증 | 판정 |
|-------|------|------|------|
| Fix 2 | N8N-SEC-7/8 추가 (8-layer 완성) | L1461: N8N-SEC-7 AES-256-GCM 암호화 ✅. L1462: N8N-SEC-8 rate limiting 분당 60회 ✅. **잔류**: Layer 3 "API key header injection" 전용 domain req 없음 (7/8 커버) | ⚠️ FIXED (잔류 1건) |
| Fix 3 | MEM-6 Obs Poisoning | L1484: 4-layer 상세 (10KB + 제어문자 + 하드닝 + 분류). PER-1 별개 체인 명시. Go/No-Go #9, R10 참조 ✅ | ✅ FIXED |
| Fix 4 | MEM-7 30일 TTL | L1485: reflected=true 30일 자동 삭제. Admin 보존 정책. Confirmed #5 ✅ | ✅ FIXED |
| Fix 5 | MEM-2 trigger full spec | L1480: 일 1회 (새벽 3시) + ≥20 AND + confidence 0.7 + Tier cap + ECC 2.2 + $0.10/day + advisory lock (confirmed #9). Go/No-Go #7 ✅ | ✅ FIXED |
| Fix 6 | MEM-4/5 Planning entity | L1482: "Reflection/Observation 삭제" (Planning 제거) ✅. L1483: "Reflection이 soul-enricher.ts에서 Soul에 주입될 때" + 필드 3개 (memory_id, agent_id, relevance score) ✅ | ✅ FIXED |
| Fix 7 | NRT-5 WS limits | L1516: 50/company, 500/server, 10msg/s token bucket. Confirmed #10, R15 ✅ | ✅ FIXED |

### MINOR (8건)

| Fix # | 이슈 | 검증 | 판정 |
|-------|------|------|------|
| Fix 8 | VEC-1 chunk 근거 | L1444: "(검색 정밀도 최적화 — Voyage AI 실제 상한 32K, 2048은 retrieval 정확도 최적)" ✅ | ✅ FIXED |
| Fix 9 | DB-3 Pre-Sprint 참조 | L1393: "Pre-Sprint Voyage AI 마이그레이션 후 NULL 잔여분만 대상 (Go/No-Go #10 통과 시 범위 축소)" ✅ | ✅ FIXED |
| Fix 10 | MKT-1 Deferred 제거 | L1502: Sprint 2 필수, 테이블 분리 Phase 5+ ✅ | ✅ FIXED |
| Fix 11 | PIX-1 ≤200KB | L1491: "≤ 200KB gzipped" ✅ | ✅ FIXED |
| Fix 12 | MEM-1 Option B | L1479: "observations 신규 + agent_memories memoryType='reflection' 확장. 별도 reflections 테이블 생성 안 함" ✅ | ✅ FIXED |
| Fix 13 | SOUL-6 file attribution | L1418: "soul-renderer.ts에서 Soul 템플릿 변수를 DB 데이터로 치환" ✅ | ✅ FIXED |
| Fix 14 | Summary table 80개 | L1536: 총 80. N8N-SEC 8, MEM 7, NRT 5. Sprint 2: 13, Sprint 3: 7, Sprint 4: 11 — 수학 정합 ✅ | ✅ FIXED |
| Fix 15 | ORC-6 ↔ SOUL-5 유지 | 의도적 이중 관점 (오케스트레이션 vs Soul). 유지 적절 ✅ | ✅ N/A (유지) |

---

## 잔류 이슈 (2건 — 비차단)

### R1: N8N-SEC 8-layer Layer 3 "API key header injection" 전용 domain req 부재
- **Exec Summary L158**: 8-layer 3번째 = "API key header injection"
- **N8N-SEC 매핑**: 8개 항목으로 7/8 layer 커버. Layer 3만 전용 req 없음
- N8N-SEC-2 (Hono proxy)는 에디터 UI 접근 — API key injection은 CORTHEX→n8n REST API 호출 시 인증 메커니즘
- **심각도**: LOW — 7/8 달성, Architecture에서 API 호출 패턴 정의 시 자연 포함
- **판정**: Architecture carry-forward

### R2: SEC-7 summary table "유지" 분류
- SEC-7 "Phase 5+"가 summary table에서 "유지"로 집계 (L1522)
- **심각도**: 미미 — 각주 없이도 본문에서 Phase 5+ 명시
- **판정**: 비차단

---

## 자동 불합격 검토 (v2)

| 조건 | 판정 |
|------|------|
| 할루시네이션 | ❌ 없음 |
| 보안 구멍 | ❌ 없음 — MEM-6 obs poisoning + N8N-SEC-7/8 + NRT-5 모두 포함 |
| 빌드 깨짐 | ❌ N/A |
| 데이터 손실 위험 | ❌ 없음 |
| 아키텍처 위반 | ❌ 없음 — N8N-SEC-5 2G 정합, SOUL-6 soul-renderer.ts 정합 |

---

## Confirmed Decisions Coverage (v2)

| # | Decision | v1 Status | v2 Status |
|---|----------|-----------|-----------|
| 2 | n8n Docker 2G | ❌ 4G 오류 | ✅ N8N-SEC-5 `memory: 2G` |
| 3 | n8n 8-layer | ❌ 4/8 layer | ✅ N8N-SEC-1~8 (7/8 layer + R1 잔류) |
| 5 | 30일 TTL | ❌ 미포함 | ✅ MEM-7 |
| 8 | Obs Poisoning | ❌ 미포함 | ✅ MEM-6 |
| 9 | Advisory lock | ❌ 미포함 | ✅ MEM-2 확장 |
| 10 | WS limits | ⚠️ NFR 범위 | ✅ NRT-5 |

---

## Cross-talk 점수 변화

| Critic | v1 | v2 |
|--------|----|----|
| Quinn | 6.00 | (awaiting) |
| Sally | 6.25 | (awaiting) |
| Winston | 6.30 | **8.75** |
| Bob | 6.45 | (awaiting) |

---

## Carry-Forward to Architecture Stage

1. **N8N-SEC Layer 3 API key header injection**: CORTHEX→n8n REST API 호출 시 API key 인증 패턴 상세 (R1)
2. **MEM-2 trigger cron 구현**: 새벽 3시 cron expression + 에이전트별 vs 회사별 실행 단위 Architecture 확정
3. **MKT-1 company_api_keys 테이블 분리**: Phase 5+ 검토 항목
4. **PIX-4 접근성 세부**: NEXUS aria-label 텍스트 패턴 (에이전트명 + 상태)
5. **NRT-5 oldest 연결 해제 전략**: LIFO vs FIFO vs idle-first 정책
