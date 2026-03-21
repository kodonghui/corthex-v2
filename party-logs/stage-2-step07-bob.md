# Critic-C Review — Step 07 Project-Type Deep Dive (SaaS B2B)

**Reviewer**: Bob (Scrum Master / Product + Delivery)
**Date**: 2026-03-21
**File**: `_bmad-output/planning-artifacts/prd.md` L1525–1790
**Rubric**: Critic-C weights (D1=20%, D2=20%, D3=15%, D4=15%, D5=10%, D6=20%)

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 8/10 | Sprint 번호, Docker 리소스 상한(4G/2CPU), 보안 코드(N8N-SEC, PER, MEM, MKT), n8n 버전(2.12.3), PixiJS 버전(8.17.1) 전부 명시. 2곳 모호: (1) /office "관찰 전용" vs "메인 사용" 기능 차이 미정의 (L1581-1582), (2) docker-compose 파일 위치 미명시 (L1768) |
| D2 완전성 | 8/10 | CSV key_questions 5개 전부 커버 (tenant_model, rbac_matrix, subscription_tiers, integration_list, compliance_reqs). 반응형·API Surface·마이그레이션 가이드까지 포함. 누락: (1) Sprint 2 과부하 대응 전략 (Step 04·05 carry-forward 2회 지적됨), (2) 비용 추적 삭제(L1599)와 v3 비용 요소 모니터링(L1607-1609) 모순 |
| D3 정확성 | 9/10 | n8n 2.12.3 ARM64 native → Technical Research §2 확인 ✅. Option B 메모리 (observations/reflections 신규 + agent_memories 확장) → Step 05 Winston Major 수정 반영 ✅. 4-layer sanitization Layer 0 spread 역전 → Step 05 Quinn HIGH 반영 ✅. query()→messages.create() 전수 교체 완료 ✅ |
| D4 실행가능성 | 7/10 | PRD 수준으로 적절하나, packages/office 빌드 파이프라인(빌드 커맨드, 출력 경로, GitHub Actions 통합, Cloudflare 경로) 미명시(L1766). docker-compose 파일 위치·구조 미명시. 아키텍처 문서에서 보완 필요 |
| D5 일관성 | 8/10 | Step 02 typeComposition(40/35/25)과 L1531-1535 일치 ✅. Step 04 N8N_DISABLE_UI=false 반영 ✅. Step 05 PER-1 Layer 0, MEM-1 Option B 반영 ✅. 미반영: MKT-1 JSONB race condition atomic update 주석 (Step 05 Quinn MEDIUM carry-forward) |
| D6 리스크 | 7/10 | 컴플라이언스 섹션 충실 (데이터 격리 5영역, 프롬프트 주입 4-layer, 감사 로그 8이벤트, 토큰 보안 5종). 미식별: (1) Sprint 2 과부하 — 통합 목록에서 Sprint 2에 4건 추가(n8n Docker, 에디터, 외부 AI, SNS), Step 05 carry-forward "Sprint 2.5 분리 옵션" 미반영, (2) Phase 5+ 과금 인프라(미터링/빌링/인보이스) 구현 규모 미언급 |

---

## 가중 평균: 7.80/10 ✅ PASS

계산: (8×0.20) + (8×0.20) + (9×0.15) + (7×0.15) + (8×0.10) + (7×0.20) = 1.60 + 1.60 + 1.35 + 1.05 + 0.80 + 1.40 = **7.80**

---

## 이슈 목록

### 1. **[D6 리스크] Sprint 2 과부하 대응 미반영** — HIGH
- Step 04 carry-forward #2: "Sprint 2 과부하 — Journey 4 Sprint 2 + Journey 8 같은 타임라인, Sprint 2.5 분리 옵션 인지"
- Step 05 carry-forward #3: "Sprint 2 과부하 (11개) → Sprint Planning에서 인프라 트랙 vs 워크플로우 트랙 분리"
- 이번 Step 07 통합 목록(L1636-1646)에서 Sprint 2에 4건 추가 → 총 15건+
- **요청**: 통합 목록 또는 구현 고려사항에 Sprint 2 과부하 인지 + 대응 전략 1줄 추가 (예: "Sprint 2는 인프라 트랙(n8n Docker 설치·보안)과 워크플로우 트랙(마케팅 파이프라인·SNS)으로 병렬 분리 — Sprint Planning에서 상세화")

### 2. **[D2 완전성] 비용 추적 삭제와 v3 비용 모니터링 모순** — MEDIUM
- L1599: "비용 추적 불필요 (GATE 결정 2026-03-20)"
- L1607: Reflection LLM "Tier 3-4: 주 1회, Haiku ≤ $0.10/day"
- L1609: Gemini Embedding "월 $5 이하 NFR"
- CLI Max 토큰 비용은 추적 불필요하지만, 서버 운영 비용(n8n Docker, Reflection LLM, Embedding)은 모니터링 필요
- **요청**: L1599 문구를 "CLI Max 토큰 비용 추적 불필요. 서버 운영 비용(n8n, Reflection, Embedding)은 NFR 내 모니터링" 으로 명확화

### 3. **[D5 일관성] MKT-1 JSONB race condition 미반영** — MEDIUM
- Step 05 snapshot: "MKT-1 JSONB race: atomic update 패턴 + 별도 테이블 분리 검토 주석 (Quinn MEDIUM)"
- L1565: "company.settings JSONB 내 AES-256 암호화" — race condition 주의 사항 없음
- **요청**: L1565 또는 보안 토큰 관리 테이블(L1749)에 "(JSONB race 주의 — atomic update 또는 별도 테이블 분리 검토)" 주석 추가

### 4. **[D1 구체성] /office "관찰 전용" vs "메인 사용" 구분 모호** — LOW
- L1581 Admin: "✅ (관찰 전용)", L1582 CEO: "✅ (메인 사용)"
- 동일 PixiJS 캔버스를 보는데 기능 차이가 뭔지 불명확
- **요청**: Admin은 관리자 콘솔 중심이므로 /office는 부가 뷰, CEO는 /office가 주 화면이라는 맥락이면 그렇게 명시. 기능 차이 없으면 둘 다 "✅" 통일

### 5. **[D4 실행가능성] docker-compose 파일 위치 미명시** — LOW
- L1768: "docker-compose 관리" — 어디에 위치? root? infrastructure/?
- **요청**: 아키텍처 문서에서 상세화 예정이면 "(아키텍처 문서에서 확정)" 주석. 아니면 위치 명시

---

## Cross-talk 요청

- **Sally (UX)**: /office "관찰 전용" vs "메인 사용" 구분이 UX 관점에서 의미 있는 차이인지 확인 요청. Admin과 CEO가 동일 캔버스를 보는데 뷰 모드 차이가 있어야 하는지, 아니면 접근 빈도 차이일 뿐인지.
- **Sally (UX)**: Sprint 2 과부하 시 마케팅 워크플로우(Journey 8) UX가 Sprint 2.5로 밀릴 수 있음 — UX 일정 영향 확인.

---

---

## Re-Verification (Fixes Applied)

### 검증 결과 (7건)

| # | 이슈 | 상태 | 검증 위치 |
|---|------|------|---------|
| 1 | Sprint 2 과부하 대응 | ✅ 해결 | L1789-1791: 인프라/워크플로우 트랙 분리 + Sprint 2.5 가능 명시 |
| 2 | 비용 추적 모순 | ✅ 해결 | L1599: "CLI 토큰 비용 추적 삭제 + 서버 운영 비용 NFR 모니터링 + costs.ts v3 제거 대상" |
| 3 | JSONB race condition | ✅ 해결 | L1565 + L1755 두 곳 모두 "⚠️ JSONB race" 주석 추가 |
| 4 | /office 관찰/메인 구분 | △ 미수정 | L1581-1582 "관찰 전용"/"메인 사용" 유지. LOW — 기능 차이 없음은 L1589 결정 근거에서 확인 가능. 점수 영향 미미 |
| 5 | docker-compose 위치 | ✅ 해결 | L1787: "docker-compose.yml 루트에 배치" |
| 6 | n8n Docker restart/healthcheck | ✅ 해결 | L1640 + L1787: "restart: unless-stopped + healthcheck" 명시 |
| 7 | Reflection 크론 부하 | ✅ 해결 | L1793-1795: 아키텍처 확정 필요 + 크론 오프셋/큐잉 옵션 명시 |

### 타 Critic 수정사항 교차 확인

| 수정 | 상태 | 검증 |
|------|------|------|
| "REST API-only" → "REST API + Editor UI" (Winston) | ✅ | L1640 프로토콜 컬럼 |
| HMAC per-company 파생 키 (Quinn) | ✅ | L1756 `HMAC(master, companyId)` |
| AES-256 마스터 키 관리 블록 (Quinn+Sally) | ✅ | L1717-1721 신규 블록 (환경변수, 유출 영향, Phase 5+ KMS) |
| proxy rate limit (Quinn) | ✅ | L1640 "100 req/min/Admin" |
| /ws/office per-company 연결 상한 (Quinn) | ✅ | L1642 "per-company 연결 상한 10" |
| /office Tablet △ 리스트 뷰 (Sally) | ✅ | L1660 "△ (리스트 뷰 대체)" |
| Layer 0 "거부" → "필터링" (Quinn) | ✅ | L1730 "필터링(built-in 값 우선 적용)" |

### Re-Score

| 차원 | 초기 | 수정 후 | 변화 근거 |
|------|------|--------|---------|
| D1 구체성 | 8 | 9 | docker-compose 위치·rate limit·연결 상한 수치 추가. /office 괄호만 잔존 |
| D2 완전성 | 8 | 9 | 비용 추적 모순 해소, Sprint 2 대응 추가, AES-256 관리 블록 신설 |
| D3 정확성 | 9 | 9 | 유지 |
| D4 실행가능성 | 7 | 8 | docker-compose 위치+restart/healthcheck 명시로 개선 |
| D5 일관성 | 8 | 9 | JSONB race 2곳 반영, carry-forward 전부 소화 |
| D6 리스크 | 7 | 9 | Sprint 2 과부하 + Reflection 크론 + AES-256 단일 장애점 + n8n restart 전부 식별 |

### 가중 평균: 8.85/10 ✅ PASS (Grade A)

계산: (9×0.20) + (9×0.20) + (9×0.15) + (8×0.15) + (9×0.10) + (9×0.20) = 1.80 + 1.80 + 1.35 + 1.20 + 0.90 + 1.80 = **8.85**

---

## 총평

v2 → v3 SaaS B2B 확장이 체계적으로 문서화됨. 특히 컴플라이언스 섹션(데이터 격리 5영역 + 4-layer sanitization + 감사 로그 8이벤트)은 이전 Step의 도메인 요구사항을 충실히 반영. Stage 1 Technical Research 결정사항(Option B, 4-layer, n8n ARM64)과의 정합성 우수.

주요 개선 포인트는 **Sprint 2 과부하 대응**(2회 carry-forward 미반영)과 **비용 추적 모순 해소**. 둘 다 1~2줄 추가로 해결 가능.
