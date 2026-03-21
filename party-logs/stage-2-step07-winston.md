# Critic-A Review — Step 07 Project-Type Deep Dive (SaaS B2B)

> Reviewer: Winston (Architect + API)
> Date: 2026-03-21
> Target: `_bmad-output/planning-artifacts/prd.md` L1525–1790
> Step: `step-07-project-type.md` — CSV key_questions 5개 기반 SaaS B2B 심층 분석

---

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 15% | 8/10 | 버전 핀(n8n 2.12.3, pixi.js 8.17.1), DB 컬럼명(personality_traits JSONB), API 경로(/admin/n8n-editor/*), 보안 ID(N8N-SEC-1~6, PER-1, MEM-1~5) 전부 구체적. Zod 스키마(`z.number().int().min(0).max(100)`) 포함. "적절한" 류 모호 표현 거의 없음. |
| D2 완전성 | 15% | 8/10 | CSV key_questions 5개(tenant_model, rbac_matrix, subscription_tiers, integration_list, compliance_reqs) 전부 커버. 반응형 매트릭스, 컴플라이언스(신규 섹션) 포함. 성능/접근성은 NFR 참조로 적절히 위임. GDPR은 Phase 5+로 범위 한정 — 적절. |
| D3 정확성 | 25% | 7/10 | `getDB(ctx.companyId)` 패턴 코드 검증 ✅. soul-renderer.ts extraVars spread 순서 현행(built-in 먼저 → extraVars 덮어쓰기) 정확히 파악, v3 역전 변경 명시 ✅. 4-layer sanitization Stage 1 Research 일치 ✅. **단, L1640 "REST API-only" vs L1641 `N8N_DISABLE_UI=false` 모순 — 이슈 #1 참조.** |
| D4 실행가능성 | 20% | 8/10 | Docker compose 구성, Sprint별 격리 방식, Zod 스키마 예시, AES-256 저장 패턴 등 구현 지침 충분. Technical Research가 코드 스니펫 보완하므로 PRD 수준에서 적절. |
| D5 일관성 | 15% | 9/10 | Stage 1 Technical Research 결정사항(4-layer sanitization, Option B 메모리, n8n 2.12.3 ARM64) 전부 일관. Step 05 carry-forward "N8N-SEC-4 HMAC → Step 07 반영" ✅ (L1559). Sprint 배정 일관. 용어 통일(messages.create(), extraVars, company_id). |
| D6 리스크 | 10% | 7/10 | 컴플라이언스 섹션 잘 구축됨(격리 5영역 + 검증 방법). 4-layer defense in depth 강점. **단, n8n Docker OOM/컨테이너 이스케이프 리스크 미언급 — 이슈 #3 참조.** |

## 가중 평균: 7.85/10 ✅ PASS (초기)

`(0.15×8) + (0.15×8) + (0.25×7) + (0.20×8) + (0.15×9) + (0.10×7) = 1.2 + 1.2 + 1.75 + 1.6 + 1.35 + 0.7 = 7.80`

---

## 재검증 (Verified) — 12건 수정 후

| 차원 | 가중치 | 초기 | 재검증 | 변동 근거 |
|------|--------|------|--------|----------|
| D1 구체성 | 15% | 8 | 9 | rate limit 100 req/min, 연결 상한 10, $220 시점 명시, Sprint 2.5 분리 옵션 |
| D2 완전성 | 15% | 8 | 9 | AES-256 관리 블록 신설, Sprint 2 과부하 대응, Reflection 크론 스케줄링 전략 |
| D3 정확성 | 25% | 7 | 9 | "REST API-only" 모순 해결, HMAC per-company 정확, Layer 0 "필터링" Tech Research 일치, 비용 추적 마이그레이션 경로 명확 |
| D4 실행가능성 | 20% | 8 | 9 | docker-compose.yml 루트 배치, restart: unless-stopped, healthcheck, proxy rate limit 구체화 |
| D5 일관성 | 15% | 9 | 9 | Layer 0 "필터링+로그" 통일, JSONB race 주석 2곳 일관 |
| D6 리스크 | 10% | 7 | 8 | AES-256 단일 장애점 + KMS 전환 계획, Reflection 부하 인식, Sprint 2 과부하 대응. Docker 하드닝(read-only rootfs, cap-drop)은 Quinn 이슈로 별도 추적 |

## 재검증 가중 평균: 8.90/10 ✅ PASS

`(0.15×9) + (0.15×9) + (0.25×9) + (0.20×9) + (0.15×9) + (0.10×8) = 1.35 + 1.35 + 2.25 + 1.80 + 1.35 + 0.80 = 8.90`

### 수정 검증 상세:

| # | 이슈 | 수정 내용 | 검증 위치 | 결과 |
|---|------|---------|---------|------|
| 1 | "REST API-only" 모순 | → "REST API + Editor UI (Hono reverse proxy)" | L1640 | ✅ |
| 2 | 비용 추적 "삭제" 불명확 | → costs.ts v3 제거 대상 + 서버 운영 비용 NFR 모니터링 | L1599 | ✅ |
| 3 | n8n Docker OOM | → restart: unless-stopped + healthcheck + docker-compose.yml 루트 | L1640, L1787 | ✅ |
| 4 | $220 시점 미명시 | → "$220/인, 2026-03 기준" | L1597 | ✅ |
| 5 | HMAC per-company | → `HMAC(master, companyId)` + 마스터 키 로테이션 시 자동 갱신 | L1756 | ✅ |
| 6 | Layer 0 "거부" vs "필터" | → "필터링(built-in 값 우선 적용) + 에러 로그" | L1730 | ✅ |
| — | AES-256 관리 블록 (Quinn) | → 환경변수 저장, 유출 영향, Phase 5+ KMS | L1717-1721 | ✅ |
| — | JSONB race 주석 2곳 (Bob) | → L1565 + L1755 | L1565, L1755 | ✅ |
| — | n8n proxy rate limit (Quinn) | → 100 req/min/Admin | L1640 | ✅ |
| — | /ws/office 연결 상한 (Quinn) | → per-company 10 | L1642 | ✅ |
| — | /office Tablet △ (Sally) | → 리스트 뷰 대체 상세 | L1660 | ✅ |
| — | Sprint 2 과부하 (Bob) | → 인프라/워크플로우 트랙 분리 + Sprint 2.5 | L1789-1791 | ✅ |
| — | Reflection 크론 동시 실행 (Bob) | → 크론 오프셋/큐잉 전략 언급 | L1793-1795 | ✅ |

---

## 이슈 목록

### 1. **[D3 정확성] CRITICAL — L1640 "REST API-only" vs L1641 `N8N_DISABLE_UI=false` 모순**

- **L1640**: n8n Docker 통합을 "REST API-only (Hono reverse proxy)" 로 기술
- **L1641**: n8n 에디터 UI를 `N8N_DISABLE_UI=false`로 제공
- **모순**: Technical Research docker-compose 예시(L599)도 `N8N_DISABLE_UI=true` 권장. 그러나 Admin이 n8n 에디터를 사용하려면 UI가 활성화되어야 함
- **수정 제안**: L1640 프로토콜을 "REST API + Editor UI (Hono reverse proxy)" 로 변경. 또는 n8n Docker를 두 가지 모드(API-only worker + Editor container)로 분리하는 아키텍처 결정 필요. 현재 단일 컨테이너라면 `N8N_DISABLE_UI=false`가 맞고, "API-only" 표현 삭제 필요

### 2. **[D3 정확성] MEDIUM — L1599 비용 추적 "삭제" vs v2 기존 코드 관계 불명확**

- PRD에 "~~삭제~~ — CLI Max 월정액이므로 비용 추적 불필요 (GATE 결정 2026-03-20)" 라고 기술
- v2 코드에 costs.ts, cost-aggregation.ts, 비용 대시보드 페이지가 현존 (Epic 15 결과물)
- **수정 제안**: "v3에서 비용 대시보드 UI 제거 (v2 costs 라우트 deprecate)" 등 구체적 마이그레이션 방향 1줄 추가. 또는 v3에서도 비용 추적 유지하되 CLI Max 월정액에서 per-token 추적이 불필요한 이유만 명시

### 3. **[D6 리스크] MEDIUM — n8n Docker 컨테이너 격리 리스크 미언급**

- N8N-SEC-5 (memory: 4G, cpus: 2) Docker 리소스 상한은 명시되어 있으나:
  - **OOM 시나리오**: n8n 4G OOM → 자동 재시작 → 실행 중 워크플로우 데이터 손실 가능성
  - **컨테이너 이스케이프**: Docker socket mount 여부, read-only rootfs 등 하드닝 미언급
  - **공존 리스크**: Bun서버 + PostgreSQL + GitHub Actions + n8n = 24GB 서버에서 총 RAM 분배 계획 없음
- **수정 제안**: Technical Research Step 2에서 다룬 VPS RAM 분배 (기존 ~8.5GB + n8n 4G = 12.5GB, 여유 11.5GB)를 1줄 요약으로 참조. OOM restart-policy `unless-stopped` 명시

### 4. **[D1 구체성] LOW — L1597 CLI Max 월정액 $220/인 — 가격 변동 리스크**

- CLI Max 가격은 Anthropic이 언제든 변경 가능. PRD에 특정 금액 하드코딩은 리스크
- **수정 제안**: "$220/인 (2026-03 기준)" 또는 "CLI Max 월정액 기반 (현재 $100~$200/인)" 등 시점 명시

---

## Cross-talk 요약 (Quinn ↔ Winston 완료)

### Quinn → Winston 질의 3건 + Winston 답변:

1. **HMAC per-company 파생 키 — 동의 ✅ (추가 이슈 #5)**
   - L1750 단일 shared secret → 멀티테넌트에서 cross-company webhook 위조 가능
   - 아키텍처 권장: `HMAC(shared_secret, companyId + payload)` 패턴
   - crypto.ts 확인: `process.env.ENCRYPTION_KEY` 단일 환경변수, 로테이션 미구현

2. **AES-256 마스터 키 관리 — 현행 acceptable (LOW)**
   - `crypto.ts`: 32자+ 검증 있음, 키 버저닝/로테이션 없음
   - 현재 스케일에서 문제 없으나 v3에서 사용처 3곳으로 증가 → Phase 5+ 로테이션 언급 권장

3. **Layer 0 "거부" vs "필터" — 동작 불일치 확인 ✅ (추가 이슈 #6)**
   - PRD "충돌 시 거부" ≠ Tech Research "spread reversal" (silent override) ≠ "filter before spread"
   - 아키텍처 권장: **filter + log hybrid** — 해당 키만 제거 + 에러 로그, 에이전트 실행은 중단 안 함

### Winston → Quinn 질의 4건:
- **이슈 #1** (N8N_DISABLE_UI 모순): UI 활성화 시 공격 표면 — Quinn 리뷰에서 별도 평가
- **이슈 #3** (Docker 하드닝): read-only rootfs, seccomp 등 — Quinn D6 반영
- **PER-1 Layer 0 spread 역전**: PRD 반영 확인 ✅ (L1724)
- **MKT-1 JSONB race**: 컴플라이언스에 atomic update 미언급 — Quinn 이슈에서 유지

---

## 검증 방법

| 확인 항목 | 방법 | 결과 |
|---------|------|------|
| `getDB(ctx.companyId)` 패턴 존재 | `Grep "getDB" packages/server/src/` | ✅ scoped-query.ts + 10곳+ 사용 |
| soul-renderer.ts extraVars spread 현행 | `Read soul-renderer.ts:34-41` | ✅ `...extraVars` 마지막 = 덮어쓰기 가능 (v3에서 역전 필요) |
| soul-renderer.ts built-in 키 6개 | `Read soul-renderer.ts:34-41` | ✅ 6개 (agent_list, subordinate_list, tool_list, department_name, owner_name, specialty) |
| n8n 2.12.3 ARM64 검증 | Technical Research L124 | ✅ "native ARM64 manifest" HIGH confidence |
| 4-layer sanitization 일관성 | Technical Research L1969 vs PRD L1722-1727 | ✅ Layer 0/A/B/C 동일 |
| Option B 메모리 확정 | Context Snapshot Step 05 L35 | ✅ "MEM-1 Option B 확정" |
