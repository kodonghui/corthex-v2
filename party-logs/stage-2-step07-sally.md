# Critic-C Review — Step 07 Project-Type Deep Dive (SaaS B2B)

**Reviewer**: Sally (UX Designer / Critic-C)
**Date**: 2026-03-21
**File**: `_bmad-output/planning-artifacts/prd.md` L1525–1790
**Step**: step-07-project-type.md

---

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 20% | 9/10 | 파일 경로(soul-renderer.ts, soul-enricher.ts), 정확한 버전(n8n 2.12.3, pixi.js 8.17.1), Sprint 번호, 보안 코드 참조(N8N-SEC-1~6, PER-1, MEM-1~5), 테이블 구조 전부 구체적. "적절한" 류 추상 표현 극소. |
| D2 완전성 | 20% | 8/10 | CSV key_questions 5개 전부 커버 (tenant_model, rbac_matrix, subscription_tiers, integration_list, compliance_reqs). 반응형 매트릭스 + 구현 고려사항까지. 단, /office Tablet ❌ fallback UX 미정의, 회사 삭제 시 cascade 동작 미명시. |
| D3 정확성 | 15% | 8/10 | Brief 페르소나(이수진 Admin, 김도현 CEO) 일치. Layer 0 spread 역전 = Tech Research Decision 4.3.2 일치. Option B 메모리, n8n 2.12.3 ARM64, WS 16→17채널 전부 정확. PER-1 Layer 0 "충돌 시 거부+에러 로그" vs Tech Research "filter(무검증 제거)" 미세 동작 차이 1건. |
| D4 실행가능성 | 15% | 8/10 | RBAC 매트릭스 바로 구현 가능. 4-layer sanitization 코드 패턴(Zod, regex, strip) 명확. docker-compose 참조는 있으나 스니펫 미포함(Tech Research에는 있음). observations/reflections Drizzle 스키마 스니펫 없음(PRD 범위 밖일 수 있으나 아쉬움). |
| D5 일관성 | 10% | 9/10 | Step 03~05 snapshot 전체와 정합. N8N_DISABLE_UI=false(Step 04), costs 삭제(Step 03 GATE), soul-enricher.ts 명칭(Step 03 Winston), Sprint 번호 전부 일관. L1599 ~~삭제~~ 포맷 사소한 이질감. |
| D6 리스크 | 20% | 7/10 | 보안 리스크 잘 커버(HMAC, AES-256, JWT, Docker 상한, tag 격리, 4-layer sanitization). GDPR Phase 5+ 적절. 그러나: (1) n8n Docker 장애 시 복구 전략 미명시, (2) AES-256 키 자체 관리(환경변수? KMS? 로테이션?) 미언급, (3) Reflection 크론 다수 회사 동시 실행 시 DB/LLM 부하 리스크 미언급. |

## 가중 평균: 8.10/10 ✅ PASS

계산: (9×0.20) + (8×0.20) + (8×0.15) + (8×0.15) + (9×0.10) + (7×0.20) = 1.80 + 1.60 + 1.20 + 1.20 + 0.90 + 1.40 = **8.10**

---

## 이슈 목록

### 1. **[D6 리스크] n8n Docker 장애 시 CORTHEX 복구 전략 미명시** — MEDIUM
- **위치**: L1640 (n8n Docker 통합) + L1606 (비용 요소)
- **문제**: n8n이 OOM/crash 시 마케팅 워크플로우 6단계 파이프라인 전체가 중단됨. 이수진 Admin이 이를 어떻게 인지하고 복구하는지 UX 시나리오 없음.
- **제안**: Docker restart policy (`restart: unless-stopped`), health check endpoint, 장애 시 Admin 알림(activity_logs + WS 실시간) 1줄 추가. Step 03 snapshot의 "n8n Error Workflow 패턴" 참조.

### 2. **[D6 리스크] AES-256 암호화 키 관리 방법 미명시** — MEDIUM
- **위치**: L1565 (외부 API 키 AES-256), L1749 (보안 토큰 관리)
- **문제**: company.settings JSONB에 AES-256 암호화를 언급하지만, 암호화 키 자체가 어디 저장되는지(환경변수? KMS?), 로테이션 정책이 있는지 미언급.
- **제안**: "서버 환경변수 `ENCRYPTION_KEY` (256-bit), 로테이션 Phase 5+" 1줄 추가로 충분.

### 3. **[D2 완전성] /office Tablet(≥768px) ❌ 시 fallback UX 미정의** — LOW
- **위치**: L1660 (반응형 매트릭스)
- **문제**: 모바일은 "리스트 뷰 대체 (PIX-3)"가 명시되어 있으나, 태블릿은 그냥 ❌만 표기. 김도현 CEO가 iPad로 접근 시 어떤 화면을 보는지 불명.
- **제안**: "❌ (모바일과 동일 리스트 뷰 대체)" 또는 "❌ (데스크톱 전용 안내 메시지)" 택 1.

### 4. **[D6 리스크] Reflection 크론 다수 회사 동시 실행 시 부하** — LOW
- **위치**: L1563 (Reflection 크론 격리), L1607 (Reflection LLM 비용)
- **문제**: company_id 단위 독립 실행은 격리는 잘 되어 있으나, 10개 회사가 같은 시간(예: 매일 03:00)에 Reflection 크론을 동시 실행하면 DB + LLM API 호출 집중. MEM-2 "Haiku ≤ $0.10/day"는 단일 회사 기준.
- **제안**: "크론 시작 시각 회사별 랜덤 오프셋(±30분) 또는 큐잉" 1줄 추가. (아키텍처 범위일 수도 있으나 리스크 인식 차원에서)

### 5. **[D3 정확성] PER-1 Layer 0 동작 미세 차이** — LOW
- **위치**: L1724 (Layer 0 Key Boundary)
- **문제**: PRD는 "6개 built-in 키 충돌 시 **거부** + 에러 로그"라고 명시하나, Tech Research Decision 4.3.2는 "**filter** 6 built-in keys from extraVars before spread" (silent removal). 거부(reject)와 필터(silently remove)는 Admin에게 보이는 행동이 다름.
- **제안**: 둘 중 택 1로 통일. 추천: PRD의 "거부+에러 로그"가 Admin UX 관점에서 더 명확하므로 Tech Research 쪽을 정합. 또는 "filter + warning log"로 절충.

---

## UX 관점 특별 코멘트

### RBAC × Brief 페르소나 정합성 ✅
- 이수진(Admin): Big Five 편집, n8n 에디터, 메모리 삭제, Reflection 설정, 외부 API 키 → Brief의 "AI 시스템 운영 담당자" 역할과 완벽 일치
- 김도현(CEO): /office 메인 사용, n8n 결과 읽기, 메모리 읽기만 → Brief의 "에이전트 성장 체감" 사용 패턴과 일치
- RBAC 결정 근거 4건이 "왜 이 권한 분리인지"를 명확히 설명 — 구현 시 논쟁 방지에 효과적

### 멀티테넌트 격리 × v3 커버리지 ✅
- v3 신규 기능 7개(n8n, Big Five, 메모리, Reflection, /office, 외부 API, webhook) 전부 격리 행에 포함
- 특히 "agent_id → company_id 간접 격리"(메모리)와 "tag 기반 격리"(n8n)가 기존 패턴 재활용으로 일관성 좋음

### 구독 모델 UX 고려 👍
- Phase 5+ 과금 후보 4건이 v3 기능과 연결된 이유를 명시 — 향후 pricing 결정 시 유용한 근거

---

## Cross-talk 요청사항

**bob에게**: 이슈 #1(n8n Docker 장애 복구)과 #4(Reflection 크론 부하)는 delivery/인프라 관점에서 의견 요청. Sprint 2 과부하(Step 03 carry-forward)와도 연관될 수 있음.

---

## 재검증 (Verification Round)

**검증 대상**: John의 12건 수정 (stage-2-step07-fixes.md)

### 검증 결과

| # | 수정 항목 | Sally 이슈 | 검증 | 위치 |
|---|---------|-----------|------|------|
| 1 | "REST API-only" → "REST API + Editor UI" | — (Winston) | ✅ L1640 확인 | n8n Docker 통합 |
| 2 | HMAC per-company `HMAC(master, companyId)` | — (Quinn) | ✅ L1756 확인 | 보안 토큰 관리 |
| 3 | AES-256 마스터 키 관리 블록 | **이슈 #2** ✅ | ✅ L1717-1721 신규 블록. 환경변수 `ENCRYPTION_KEY`, 유출 영향, Phase 5+ KMS, 로테이션 계획 전부 명시. 요청 이상으로 충실. | 컴플라이언스 |
| 4 | Sprint 2 인프라/워크플로우 트랙 분리 | — (Bob) | ✅ L1789-1791 확인 | 구현 고려사항 |
| 5 | 비용 추적 costs.ts v3 제거 대상 | — (Bob+Winston) | ✅ L1599 확인 | 과금 모델 |
| 6 | JSONB race condition 주석 2곳 | — (Bob) | ✅ L1565 + L1755 확인 | 멀티테넌트 + 토큰 |
| 7 | n8n proxy rate limit 100 req/min/Admin | — (Quinn) | ✅ L1640 확인 | n8n Docker 통합 |
| 8 | /ws/office per-company 연결 상한 10 | — (Quinn) | ✅ L1642 확인 | OpenClaw /office |
| 9 | n8n Docker restart + healthcheck + docker-compose.yml 루트 | **이슈 #1** ✅ | ✅ L1640 + L1787 양쪽 확인. restart: unless-stopped + healthcheck 명시. | 통합 + 의존성 |
| 10 | /office Tablet △ 리스트 뷰 대체 | **이슈 #3** ✅ | ✅ L1660 "△ (리스트 뷰 대체 — 에이전트 이름+상태+색상 뱃지, 정렬 가능)". ❌→△로 격상 + 구체적 설명 추가. 원안보다 나음. | 반응형 매트릭스 |
| 11 | Reflection 크론 부하 리스크 주석 | **이슈 #4** ✅ | ✅ L1793-1795 "크론 오프셋 또는 큐잉(BullMQ/pg-boss)" 아키텍처 확정 필요 명시. | 구현 고려사항 |
| 12 | Layer 0 "거부" → "필터링(built-in 우선)" | **이슈 #5** ✅ | ✅ L1730 "필터링(built-in 값 우선 적용) + 에러 로그". Tech Research와 통일됨. | PER-1 |

### 잔여 사항 (Residual)

- **/office RBAC 표기 통일** (Bob cross-talk): L1581 "관찰 전용", L1582 "메인 사용" → Bob+Sally 합의 "✅ (읽기 전용)" 통일 미적용. 기능 차이 없는 label 차이이므로 **점수 영향 없음**, 향후 정리 시 반영 권장.

### 재검증 점수

| 차원 | 가중치 | 초기 | 재검증 | 변동 근거 |
|------|--------|------|--------|---------|
| D1 구체성 | 20% | 9 | 9 | 유지. rate limit 수치(100 req/min), 연결 상한(10), docker-compose.yml 루트 배치 등 추가 구체성. |
| D2 완전성 | 20% | 8 | 9 | Tablet fallback △ 리스트 뷰 추가(#10). Sprint 2 트랙 분리(#4). 비용 추적 costs.ts 제거 로드맵(#5). |
| D3 정확성 | 15% | 8 | 9 | Layer 0 "필터링" 통일(#12). HMAC per-company 파생 키 명시(#2). JSONB race 주의(#6). |
| D4 실행가능성 | 15% | 8 | 9 | docker-compose.yml 루트 배치 명시(#9). restart/healthcheck 구체적(#9). 크론 큐잉 옵션(BullMQ/pg-boss) 제시(#11). |
| D5 일관성 | 10% | 9 | 9 | 유지. /office RBAC 표기 미통일은 잔여 사항이나 점수 무영향. |
| D6 리스크 | 20% | 7 | 9 | AES-256 키 관리 전체 블록(#3). n8n restart/healthcheck(#9). Reflection 크론 부하(#11). 3대 미비점 전부 해소. |

### 재검증 가중 평균: 9.00/10 ✅ PASS

계산: (9×0.20) + (9×0.20) + (9×0.15) + (9×0.15) + (9×0.10) + (9×0.20) = 1.80 + 1.80 + 1.35 + 1.35 + 0.90 + 1.80 = **9.00**
