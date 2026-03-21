# Critic-C Review — Step 09 Functional Requirements Synthesis

**Reviewer**: Bob (Scrum Master / Product + Delivery)
**Date**: 2026-03-21
**File**: `_bmad-output/planning-artifacts/prd.md` L2137–2336 (FR 전체)
**Rubric**: Critic-C weights (D1=20%, D2=20%, D3=15%, D4=15%, D5=10%, D6=20%)

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 9/10 | FR-MKT1 AI 도구 엔진 모델명·용도·형식 구체적. FR-PERS2 Zod 스키마+DB CHECK 전부 명시. FR-OC7 LISTEN/NOTIFY+폴백 SQL 포함. Sprint 태그 전 FR에 부착. 매우 구체적 |
| D2 완전성 | 8/10 | Brief 4개 Layer + v2 70개 FR + v3 43개 FR = 113개 포괄적 커버. 도메인 요구사항 6개 카테고리 전부 FR 매핑. **누락 2건**: (1) MKT-4 저작권 워터마크 옵션 — domain req에 있으나 FR 없음, (2) MKT-2 fallback 엔진 자동 전환 — 사용자 경험 직접 영향 |
| D3 정확성 | 9/10 | 기존 결정사항 전부 정합: Decision 4.3.1 (0-100 정수), Option B (observations 신규+agent_memories 확장), API-only (iframe 없음), 4-layer sanitization. WS 채널 "기존 16개" (FR-OC2) vs Brief "기존 14채널" (L173) 미세 차이 — v2 개발 중 채널 추가로 16이 현재 정확값일 가능성 높음 |
| D4 실행가능성 | 8/10 | Sprint 매핑 전수 완료로 Epic 분할 기반 충분. FR-MKT1 AI 모델명(Nano Banana 2, Kling 3.0 등) 하드코딩 — 모델 교체 빈도 고려 시 "설정 가능" 형태가 적절. FR-MKT2가 7단계 파이프라인을 단일 FR로 기술 — Epic/Story 분할 시 기준 모호 |
| D5 일관성 | 7/10 | **v2↔v3 FR altitude 불일치**: v2 FRs는 "사용자가 X할 수 있다" (순수 capability), v3 FRs는 구현 상세 다수 포함 (FR-OC7 SQL, FR-PERS2 Zod+CHECK, FR-N8N4 보안 5항). PRD는 "무엇", 아키텍처는 "어떻게" — 경계 혼재. **NFR-S7** cost-tracker 정확도가 FR37/39 삭제(GATE 2026-03-20)와 모순 |
| D6 리스크 | 8/10 | FR-OC7 LISTEN/NOTIFY 폴백(500ms 폴링), FR-OC8 독립 패키지 격리, FR-MEM7 pgvector 폴백, FR-N8N5 장애 메시지. 주요 장애 시나리오 전부 폴백 FR 보유. FR-MKT2에 fallback 엔진 없는 것이 유일한 갭 |

---

## 가중 평균: 8.10/10 ✅ PASS (Grade B)

계산: (9×0.20) + (8×0.20) + (9×0.15) + (8×0.15) + (7×0.10) + (8×0.20) = 1.80 + 1.60 + 1.35 + 1.20 + 0.70 + 1.60 = **8.10**

---

## 이슈 목록

### 1. **[D5 일관성] v3 FR altitude 불일치 — "어떻게"가 과다** — MEDIUM
- v2 FR 스타일: "사용자가 X할 수 있다" (순수 capability)
  - FR1: "사용자가 허브에서 에이전트에게 자연어로 명령을 보낼 수 있다"
  - FR40: "에이전트가 비허용 도구를 호출하면 차단된다"
- v3 FR 스타일: capability + 구현 상세 혼재
  - FR-OC7: LISTEN/NOTIFY 이벤트명, 500ms 폴링 SQL 쿼리, office-channel.ts 파일명
  - FR-PERS2: Zod 스키마 전문, DB CHECK SQL 패턴, 마이그레이션 파일명
  - FR-N8N4: 5개 보안 상세 (방화벽, 환경변수, proxy 경로, Docker 메모리)
- **문제**: FR은 아키텍트·UX·Epic 분할이 참조하는 "기능 계약서" (L2139). 구현 상세가 FR에 있으면 아키텍처 문서와 중복 + 변경 시 양쪽 수정 필요
- **요청**: 구현 상세를 FR 본문에서 분리. 방법 2가지:
  - (A) FR에서 구현 상세 제거 → 아키텍처에서 상세화 (예: FR-PERS2를 "성격 설정이 DB에 저장된다 (Zod 서버 검증 + DB 범위 제약 필수)" 수준으로)
  - (B) v3 FRs에 `**구현 참조**: §Domain MEM-1 참조` 형태로 포인터만 유지, 상세는 도메인 요구사항 섹션에 위임
  - Delivery 관점 추천: **(B)** — 이미 도메인 요구사항에 상세가 있으므로 FR에서 포인터로 참조. 변경 시 단일 소스 유지

### 2. **[D2 완전성] MKT-4 저작권 워터마크 FR 누락** — MEDIUM
- 도메인 요구사항 MKT-4 (L1405): "AI 생성 콘텐츠 저작권 고지 필요 여부는 회사별 설정 (기본: OFF). 카드뉴스/숏폼에 'AI Generated' 워터마크 옵션"
- Step 07 통합 목록 L1798: "콘텐츠 저작권 워터마크 옵션(MKT-4)"
- FR-MKT1~5에 워터마크 관련 FR 없음
- Admin이 워터마크 설정을 ON/OFF하는 것은 사용자 기능 → FR 필요
- **요청**: FR-MKT6 추가: "[Sprint 2] Admin이 마케팅 콘텐츠에 'AI Generated' 워터마크 표시 여부를 설정할 수 있다 (회사별 설정, 기본 OFF)"

### 3. **[D6 리스크] MKT-2 fallback 엔진 전환 FR 누락** — MEDIUM
- 도메인 요구사항 MKT-2 (L1403): "n8n Error Workflow: timeout 30s → retry 2x → fallback 엔진 자동 전환 + Slack/Telegram 알림"
- FR-MKT1은 AI 도구 엔진 **선택**만 기술, 장애 시 **자동 전환**은 FR 없음
- FR-N8N5 (n8n 장애 메시지)는 n8n 자체 장애. MKT-2는 외부 AI API 장애 — 다른 시나리오
- **요청**: FR-MKT7 추가: "[Sprint 2] 마케팅 AI 도구 API 호출 실패 시 fallback 엔진으로 자동 전환하고, Admin에게 Slack/Telegram 알림을 보낸다"

### 4. **[D5 일관성] NFR-S7 cost-tracker ↔ FR37/39 삭제 모순** — LOW
- FR37, FR39 삭제 (CLI Max 월정액, GATE 2026-03-20)
- NFR-S7 (L2369): "cost-tracker 정확도: 세션당 토큰/비용 오차 ≤ 1%" — 삭제된 기능의 NFR이 잔존
- Step 07에서 "CLI 토큰 비용 추적 삭제 + 서버 운영 비용 NFR 모니터링" 으로 명확화했으나, NFR 테이블은 미수정
- **요청**: NFR-S7을 삭제하거나 "서버 운영 비용(n8n, Reflection, Embedding) 모니터링: 월 NFR 한도 내 확인" 으로 교체

### 5. **[D4 실행가능성] FR-MKT1 AI 모델명 하드코딩** — LOW
- "Nano Banana 2/Flux 2/Ideogram V3, Kling 3.0/Veo 3.1/Sora 2/Runway Gen-4.5" — 2026-03 시점 모델명
- AI 모델은 6개월 내 교체/신규 출시가 일반적. FR에 모델명 고정 시 PRD 수정 빈도 증가
- **요청**: FR-MKT1을 "Admin이 이미지/영상/나레이션/자막 생성 AI 도구를 카테고리별로 선택할 수 있다 (초기 지원: 이미지 3종, 영상 4종, 나레이션 2종, 자막 3종)" 형태로. 구체적 모델명은 도메인 요구사항 또는 아키텍처에서 관리

---

## Cross-talk 요청

- **Sally (UX)**: FR-MKT2가 7단계 파이프라인(주제→리서치→생성→승인→게시)을 단일 FR로 기술. UX 관점에서 각 단계가 별도 화면/모달인지, 단일 대시보드에서 진행 상태를 추적하는 형태인지? Epic/Story 분할과 UX 와이어프레임에 영향.
- **Sally (UX)**: FR-OC11 Admin 읽기 전용 — Step 07에서 "관찰 전용" vs "메인 사용" 구분이 LOW로 잔존. FR 수준에서는 "읽기 전용"이 명확하지만, UX에서 Admin 관찰 뷰와 CEO 메인 뷰의 차이(기능 차이 vs 레이아웃 차이)가 명시되어야 하는지?

---

## 총평

v2 70개 + v3 43개 = 113개 FR로 Brief 4개 Layer + v2 기능 전부 커버. 신규 16개 FR이 Step 05 도메인 요구사항 → Step 07 SaaS 컨텍스트를 잘 반영. 특히 FR-MKT (마케팅 자동화 5건), FR-UX (페이지 통합 3건), FR-MEM9~11 (CEO/Admin 가시성) 추가가 사용자 여정 완성도를 높임.

주요 이슈: **(1) v3 FR altitude 통일** (MEDIUM — 구현 상세를 도메인 요구사항으로 위임), **(2) MKT-4 워터마크 + MKT-2 fallback FR 추가** (MEDIUM × 2). 나머지 2건은 주석/교체 수준.

---

## Re-Verification (Fixes Applied)

### 검증 결과 (5건 내 이슈 + 7건 타 Critic = 12건)

| # | 이슈 | 상태 | 검증 위치 |
|---|------|------|---------|
| 1 | v3 FR altitude 불일치 (MEDIUM) | △ 부분 해결 | 신규 FR(MKT1,4,6,7, PERS8, N8N6)은 capability 스타일 준수 ✅. 기존 FR(OC7, PERS2, N8N4)은 변경 리스크로 유지 — 합리적 사유. Step 10 carry-forward 불필요 |
| 2 | MKT-4 저작권 워터마크 (MEDIUM) | ✅ 해결 | L2305: FR-MKT6 "Admin이 회사 설정에서 AI 생성 콘텐츠에 저작권 워터마크 삽입 여부를 ON/OFF" |
| 3 | MKT-2 fallback 엔진 (MEDIUM) | ✅ 해결 | L2306: FR-MKT7 "외부 AI API 장애 시 fallback 엔진으로 자동 전환 + Admin 알림" |
| 4 | NFR-S7 cost-tracker 모순 (LOW) | → carry-forward | NFR 영역 → Step 10 처리. 합리적 |
| 5 | FR-MKT1 모델명 하드코딩 (LOW) | ✅ 해결 | L2300: "카테고리별(이미지 3종+, 영상 4종+, 나레이션 2종, 자막 3종)" — 모델명 제거, 카테고리+개수 형태 |

### 타 Critic 수정사항 교차 확인

| 수정 | 상태 | 검증 |
|------|------|------|
| FR-N8N6 CSRF Origin 검증 (Quinn HIGH) | ✅ | L2294: "CSRF Origin 검증" 추가 |
| FR-PERS8 슬라이더 행동 예시 툴팁 (Sally HIGH) | ✅ | L2317: "각 슬라이더 위치별 행동 예시 툴팁" 신규 FR |
| FR-MKT2 플랫폼별 실패 격리 (Quinn MEDIUM) | ✅ | L2301: "일부 플랫폼 게시 실패 시 성공 플랫폼 유지 + 실패만 알림" |
| FR-MKT4 구현 상세 제거 (Quinn+Winston) | ✅ | L2303: n8n Switch node 상세 제거 → "다음 워크플로우 실행부터 즉시 반영" |
| FR-MEM9 성공 정의 (Sally MEDIUM) | ✅ | L2329: "성공 기준: observations.outcome='success'" 추가 |
| FR-MKT3 CEO앱 웹 승인 경로 (Sally MEDIUM) | ✅ | L2302: "CEO앱 웹 UI 또는 Slack/Telegram" |
| FR-UX1 6개 그룹 확정 (Quinn LOW) | ✅ | L2337: "6개 그룹으로 통합" + 구체적 그룹 목록 명시 |

### 미적용 항목 (3건 — 사유 합리적)

| 항목 | 사유 | 평가 |
|------|------|------|
| NRT-2 heartbeat → NFR | NFR 영역 → Step 10 carry-forward | ✅ 합리적 (Sally+Bob cross-talk 합의) |
| NFR-S7 cost-tracker 모순 | NFR 영역 → Step 10 처리 | ✅ 합리적 |
| v3 altitude 전면 리팩터 | 이전 Step 승인 FR 변경 리스크 | ✅ 합리적 — 신규 FR만 준수로 충분 |

### Re-Score

| 차원 | 초기 | 수정 후 | 변화 근거 |
|------|------|--------|---------|
| D1 구체성 | 9 | 9 | 유지. FR-MKT1 카테고리화, FR-UX1 6그룹 확정으로 강화 |
| D2 완전성 | 8 | 9 | MKT-6 워터마크 + MKT-7 fallback + PERS-8 툴팁 + MEM-9 성공 정의 추가 |
| D3 정확성 | 9 | 9 | 유지 |
| D4 실행가능성 | 8 | 9 | MKT1 카테고리화, MKT2 실패 격리, FR-UX1 6그룹 확정, N8N6 CSRF |
| D5 일관성 | 7 | 8 | 신규 FR altitude 준수. 기존 FR 유지 합리적. NFR-S7은 carry-forward |
| D6 리스크 | 8 | 9 | MKT7 fallback + MKT2 실패 격리 + N8N6 CSRF 추가. 장애 시나리오 전부 커버 |

### 가중 평균: 8.90/10 ✅ PASS (Grade A)

계산: (9×0.20) + (9×0.20) + (9×0.15) + (9×0.15) + (8×0.10) + (9×0.20) = 1.80 + 1.80 + 1.35 + 1.35 + 0.80 + 1.80 = **8.90**

---

## Carry-Forward (Step 10)

1. NFR-S7 cost-tracker ↔ FR37/39 삭제 모순 → NFR 수정 필요
2. NRT-2 heartbeat → NFR-P9에 적응형 heartbeat 주석 추가

---

## 총평 (수정 후)

12건 수정 전부 정확 반영. 특히 FR-MKT 카테고리가 MKT1(엔진 선택) → MKT2(파이프라인) → MKT3(승인) → MKT4(즉시 반영) → MKT5(온보딩) → MKT6(워터마크) → MKT7(fallback)로 마케팅 자동화 전 여정을 커버. FR-N8N6 CSRF 추가와 FR-MKT2 실패 격리로 보안+복원력 강화. 기존 FR altitude 리팩터를 보류한 판단은 "승인된 산출물 안정성"과 "신규 FR 품질"을 모두 확보하는 합리적 트레이드오프.
