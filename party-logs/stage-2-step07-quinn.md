# Critic-B Review — Step 07 Project-Type Deep Dive (SaaS B2B)

**Reviewer**: Quinn (QA + Security)
**Date**: 2026-03-21
**Weights**: D1=10%, D2=25%, D3=15%, D4=10%, D5=15%, D6=25%

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 8/10 | 파일 경로, 버전 번호(n8n 2.12.3, PixiJS 8.17.1), Docker 리소스 상한(4G/2CPU), Zod 검증식(`z.number().int().min(0).max(100)`), 테이블/컬럼명, AES-256 명시. "적절한" 추상 표현 거의 없음. |
| D2 완전성 | 8/10 | CSV key_questions 5개(tenant_model, rbac_matrix, subscription_tiers, integration_list, compliance_reqs) 전부 커버. 반응형 매트릭스 v3 신규 기능 추가됨. 컴플라이언스 섹션 신규 추가 (5영역 격리 + 4-layer + 감사 로그 + 토큰 + GDPR). 단, n8n 백업 전략 및 프록시 rate limiting 누락. |
| D3 정확성 | 8/10 | Tech Research 교차검증: 4-layer sanitization 4개 층 일치, Option B 메모리 일치, n8n ARM64 native 일치, `getDB(ctx.companyId)` 패턴 일치. Layer 0 동작 설명에 사소한 불일치 1건 (아래 이슈 #6). |
| D4 실행가능성 | 8/10 | RBAC 매트릭스 복붙 수준. Docker compose 설정, 4-layer sanitization 코드 패턴, 감사 로그 이벤트 목록 명확. 구현자가 추가 리서치 없이 코딩 가능. |
| D5 일관성 | 9/10 | Step 04 N8N_DISABLE_UI=false 정정 반영 ✅. Step 05 도메인 요구사항(N8N-SEC 6건, PER 6건, MEM 5건, MKT 5건) 전부 참조 ✅. Tech Research 결정사항 정합 ✅. 페르소나(이수진 Admin, 김도현 CEO) Step 04와 일치 ✅. Sprint 번호 일관 ✅. |
| D6 리스크 | 6/10 | n8n 보안 6항목 커버됨. 그러나: HMAC 단일 vs per-company secret 미결정(멀티테넌트 위조 리스크), AES-256 키 관리(저장·로테이션) 미정의, n8n proxy rate limiting 없음, /ws/office DoS 방지 없음, Reflection 크론 격리 메커니즘 불명확. |

## 가중 평균: 7.65/10 ✅ PASS

계산: (8×0.10) + (8×0.25) + (8×0.15) + (8×0.10) + (9×0.15) + (6×0.25) = 0.80 + 2.00 + 1.20 + 0.80 + 1.35 + 1.50 = **7.65**

---

## 이슈 목록

### HIGH (2건)

**1. [D6 리스크] n8n webhook HMAC — 단일 shared secret 멀티테넌트 리스크**

- **위치**: L1559 (멀티테넌트 확장), L1750 (보안 토큰 관리)
- **문제**: L1750에서 HMAC을 "서버 환경변수 (shared secret)"으로 정의. 멀티테넌트에서 단일 시크릿이면 companyA가 companyB의 webhook을 위조할 수 있음. N8N-SEC-4의 `company:{companyId}` 태그 매칭만으로는 HMAC 시크릿 자체가 공유되므로 방어 불충분.
- **수정 제안**: per-company HMAC secret 또는 `HMAC(shared_secret + companyId)` 파생 키 패턴 명시. 토큰 보안 테이블에 "회사별 파생 키" 추가.

**2. [D6 리스크] AES-256 암호화 키 관리 — 저장/로테이션 미정의**

- **위치**: L1565 (외부 API 키), L1749 (토큰 보안), L1715 (CLI 토큰)
- **문제**: AES-256 암호화가 3곳(외부 API 키, CLI 토큰, n8n 자격증명)에서 언급되나, 마스터 암호화 키 자체의 저장 위치(env var? KMS? 파일?)와 로테이션 정책이 어디에도 없음. 키 유출 시 전 회사 데이터 복호화 가능.
- **수정 제안**: 컴플라이언스 섹션 "보안 토큰 관리"에 마스터 키 관리 행 추가: 저장 위치(환경변수), 로테이션 정책(Phase 5+), 유출 시 대응(키 재암호화 절차).

### MEDIUM (2건)

**3. [D6 리스크] n8n proxy rate limiting 미정의**

- **위치**: L1640 (n8n Docker 통합), L1560 (에디터 UI)
- **문제**: Hono reverse proxy `/admin/n8n/*` 및 `/admin/n8n-editor/*`에 rate limiting 언급 없음. Admin 계정 탈취 시 n8n API 남용으로 Docker 리소스 고갈(4G/2CPU 상한 도달) → 전체 서비스 영향.
- **수정 제안**: 구현 고려사항 또는 n8n Docker 통합에 "Hono proxy rate limit: 100 req/min per admin" 등 정량 제한 추가. N8N-SEC 항목 확장 또는 NFR 참조.

**4. [D6 리스크] /ws/office WebSocket 연결 제한 미정의**

- **위치**: L1564 (WS 브로드캐스트), L1642 (OpenClaw /office 통합)
- **문제**: company_id별 브로드캐스트 분리는 있으나, 회사당 최대 동시 WS 연결 수 제한이 없음. 악성 클라이언트가 /ws/office에 수천 연결 → 서버 메모리/CPU 고갈 가능. 기존 v2 WS 16채널에도 동일 리스크 있었으나, /office는 PixiJS 렌더링 페이로드(에이전트 위치·상태·애니메이션)로 데이터량이 더 큼.
- **수정 제안**: 반응형 매트릭스 또는 통합 목록에 "max connections per company: 10" 등 제한 명시. 또는 NFR Scalability에 위임하되 참조 추가.

### LOW (2건)

**5. [D2 완전성] n8n 데이터 백업 전략 누락**

- **위치**: L1640 (n8n Docker 통합)
- **문제**: n8n Docker는 자체 PostgreSQL 또는 별도 DB를 사용. n8n 워크플로우 정의·실행 이력·자격증명의 백업 전략이 없음. Docker 볼륨 손실 시 전체 자동화 파이프라인 소실.
- **수정 제안**: 구현 고려사항에 "n8n Docker 볼륨 백업: 일일 자동, 기존 DB 백업 스크립트 확장" 추가.

**6. [D3 정확성] Layer 0 동작 설명 — "거부" vs "필터"**

- **위치**: L1724 (Layer 0 Key Boundary)
- **문제**: PRD에서 "6개 built-in 키 충돌 시 **거부 + 에러 로그**"로 설명. Tech Research Decision 4.3.2에서는 "**filter** 6 built-in keys from extraVars before spread"로 설명. "거부"(요청 실패)와 "필터"(자동 제거)는 다른 동작. Admin이 실수로 `agent_list`라는 extraVar 키를 만들면: 거부 → API 400 반환, 필터 → 자동 무시.
- **수정 제안**: 둘 중 하나로 통일. 보안 관점에서는 "거부 + 에러 로그"가 더 안전 (Admin에게 명시적 피드백). Tech Research 쪽을 "거부"로 맞추거나, PRD를 "필터 + 경고 로그"로 맞추기.

---

## Cross-talk 요약

Winston(Critic-A, Architecture)과 교차 검토 필요:
- **HMAC per-company 파생 키**: 아키텍처적으로 Hono middleware에서 companyId별 HMAC 검증 구현 방식 확인 필요
- **AES-256 마스터 키 관리**: 아키텍처 문서에 키 관리 패턴이 정의되어 있는지 확인 필요
- **Layer 0 "거부" vs "필터"**: soul-renderer.ts 실제 구현 방향을 아키텍처 관점에서 결정 필요

---

---

## 재검증 (Fixes Applied)

**Date**: 2026-03-21

### 수정 확인 (내 이슈 6건 + cross-talk 2건):

| # | 이슈 | 상태 | 확인 위치 |
|---|------|------|---------|
| 1 | HMAC per-company 파생 키 | ✅ 반영 | L1756: `HMAC(master, companyId)` + "companyA secret으로 companyB webhook 위조 불가" |
| 2 | AES-256 마스터 키 관리 | ✅ 반영 | L1717-1721: 환경변수 저장, 유출 영향 "단일 장애점" 명시, Phase 5+ KMS 전환, 로테이션 계획 |
| 3 | n8n proxy rate limit | ✅ 반영 | L1640: "proxy rate limit(100 req/min/Admin)" |
| 4 | /ws/office 연결 제한 | ✅ 반영 | L1642: "per-company 연결 상한 10" |
| 5 | n8n 백업 전략 | △ 미반영 | docker-compose + healthcheck 추가(L1787)되었으나 백업 전략 자체는 미언급. LOW — carry-forward |
| 6 | Layer 0 거부→필터 | ✅ 반영 | L1730: "충돌 시 **필터링**(built-in 값 우선 적용) + 에러 로그" — Winston hybrid 합의안 정확 반영 |
| CT-1 | Docker 하드닝 | ❌ 미반영 | N8N-SEC-5 리소스 상한만 유지. read-only rootfs, --no-new-privileges 미추가. carry-forward |
| CT-2 | N8N-SEC-7 CSRF | ❌ 미반영 | n8n 에디터 CSRF 방어 미추가. carry-forward |

### 신규 발견 (재검증 중):

**[D3 정확성] LOW — Data Isolation 테이블 구조 깨짐**
- L1710-1716: Data Isolation 테이블 (DB, n8n, 메모리, CLI 토큰)
- L1717-1721: AES-256 마스터 키 관리 블록 (신규 삽입)
- L1722: WebSocket 행 — 원래 Data Isolation 테이블의 마지막 행이었으나 AES-256 블록에 의해 테이블에서 분리됨
- **수정 제안**: WebSocket 행을 L1716 아래(CLI 토큰 행 다음)로 이동 → AES-256 블록을 테이블 아래로

### 재검증 차원별 점수:

| 차원 | 초기 | 재검증 | 변화 근거 |
|------|------|--------|---------|
| D1 구체성 | 8 | 9 | rate limit "100 req/min/Admin", WS 상한 "10", HMAC `HMAC(master, companyId)` 구체적 |
| D2 완전성 | 8 | 9 | Sprint 2 과부하 대응 + Reflection 크론 동시 실행 부하 추가. n8n 백업 LOW 잔존 |
| D3 정확성 | 8 | 8 | 기술 내용 정확. Data Isolation 테이블 구조 깨짐(LOW, 포맷 수정만 필요) |
| D4 실행가능성 | 8 | 9 | AES-256 관리 블록이 구현 방향 명확. HMAC 파생 패턴 구체적 |
| D5 일관성 | 9 | 9 | Layer 0 "필터링" 통일. JSONB race 주석 2곳 일관 |
| D6 리스크 | 6 | 8 | HMAC, AES-256, rate limit, WS 제한 모두 반영. Docker 하드닝/CSRF는 carry-forward |

### 재검증 가중 평균: 8.60/10 ✅ PASS

(9×0.10) + (9×0.25) + (8×0.15) + (9×0.10) + (9×0.15) + (8×0.25) = 0.90 + 2.25 + 1.20 + 0.90 + 1.35 + 2.00 = **8.60**

### Carry-forward (Step 08+):
1. Docker 하드닝 (read-only rootfs, --no-new-privileges, --cap-drop=ALL) → 아키텍처 또는 Epic/Story에서 반영
2. N8N-SEC-7 CSRF Origin 검증 → Sprint 2 스토리에서 반영
3. n8n 데이터 백업 전략 → 운영 문서 또는 NFR에서 반영

---

## 긍정 평가

1. 컴플라이언스 섹션 신규 추가는 v3 보안 수준을 크게 높임. 특히 데이터 격리 5영역 + 검증 방법 컬럼은 QA 테스트 케이스 직접 도출 가능.
2. 4-layer sanitization 테이블이 Layer별 위치·동작까지 구체적으로 명시 — Stage 1 Tech Research와 높은 정합성.
3. 감사 로그 8개 이벤트(v2 3건 + v3 5건)가 Sprint별로 매핑되어 구현 순서 명확.
4. RBAC 결정 근거 4건 명시 — "왜 이 권한인가"가 문서화됨. QA 관점에서 테스트 우선순위 판단에 유용.
