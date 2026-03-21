# Critic-B Review — Step 09 Functional Requirements Synthesis

**Reviewer**: Quinn (QA + Security)
**Date**: 2026-03-21
**Weights**: D1=10%, D2=25%, D3=15%, D4=10%, D5=15%, D6=25%

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 8/10 | FR-MKT1: AI 도구 엔진 7개 구체적 제품명 + 카테고리별 분류 ✅. FR-MKT2: "5장 캐러셀+캡션 + 15~60초 숏폼 + 5개 플랫폼" 정량적 ✅. FR-MEM9: "관찰 수, 반성 수, 유사 태스크 성공률 추이" 지표 명시 ✅. 단, FR-UX1 "14→6~8개 통합"이 범위 불확정 — "6~8"은 구체적이지 않음. FR-OC9 "간소화 리스트 뷰"의 표시 항목 미명시. |
| D2 완전성 | 8/10 | Step 04 여정 매핑: Journey 8(마케팅)→FR-MKT1~5 ✅, Journey 10(메모리 모니터링)→FR-MEM9~11 ✅, Journey 4(n8n 에디터)→FR-N8N6 ✅, Journey 7(Big Five 기본값)→FR-PERS6~7 ✅. Step 05 도메인 PIX-4(모바일 aria-live)→FR-OC9~10 ✅. 단, MKT-5(플랫폼 API 변경 대응)에 대응하는 FR 없음 — n8n 노드 업데이트는 기술 대응이지 사용자 기능이 아니므로 FR 불필요할 수 있으나, Admin에게 "API 변경 알림"이나 "워크플로우 상태 확인" FR이 빠져있음. FR-MKT에 플랫폼별 개별 실패 격리 FR 없음 (아래 이슈 #2). |
| D3 정확성 | 8/10 | FR Sprint 매핑 정확: FR-OC9~11→Sprint 4 ✅, FR-N8N6→Sprint 2 ✅, FR-MKT1~5→Sprint 2 ✅, FR-PERS6~7→Sprint 1 ✅, FR-MEM9~11→Sprint 3 ✅, FR-UX1~3→병행 ✅. FR-MKT4에 구현 상세 혼입: "n8n Switch 노드가 CORTHEX API `GET /api/company/:id/marketing-settings` 조회" — 이는 "어떻게"이지 "무엇"이 아님 (john 검토 관점 #2 위반). FR-N8N6 "Hono proxy 경유(`/admin/n8n-editor/*`)" — 접근 경로 명시이므로 경미. |
| D4 실행가능성 | 8/10 | FR-MKT2가 Sprint 2 내 매우 야심적: 주제→리서치→카드뉴스+숏폼→승인→5플랫폼 동시 게시 전체를 n8n 프리셋으로 구현. Sprint 2는 이미 n8n 인프라(FR-N8N1~6) + 보안(N8N-SEC 6건) + FR-MKT 5건 = 16건+. Sprint 2 과부하 리스크(Step 08)와 직결. FR-UX1 "6~8" 범위가 구현자에게 모호 — 정확한 통합 대상 확정 필요. |
| D5 일관성 | 8/10 | FR-OC10 aria-live ↔ Step 05 PIX-4 ✅. FR-PERS6~7 ↔ Step 04 Journey 7 기본값 ✅. FR-N8N6 ↔ Step 04 Journey 4 n8n 에디터 ✅. FR-MEM10 알림 ↔ 기존 Notifications WS 채널 재활용 명시 ✅. 단, FR-N8N6에 CSRF Origin 검증 미언급 — Step 06 혁신 리스크(L1672)에서 "CSRF Origin" 명시, Step 07 carry-forward CT-2(N8N-SEC-7)에서도 언급되었으나 FR에 미반영 (아래 이슈 #1). |
| D6 리스크 | 7/10 | FR-MKT2 멀티 플랫폼 동시 게시: 5개 플랫폼 중 1개 API 장애 시 전체 파이프라인 실패? 개별 플랫폼 격리 FR 없음 (이슈 #2). FR-MKT3: "Slack/Telegram 미리보기" — 양쪽 불가 시 폴백 없음. FR-N8N6: n8n 에디터 CSRF 보호 미명시 (이슈 #1). FR-MKT1 AI 도구 엔진 7개 — 특정 도구 사용 불가 시 폴백 FR 없음 (MKT-2 "fallback 엔진"이 도메인 요구사항에 있으나 FR에 미반영). |

## 가중 평균: 7.75/10 ✅ PASS

(8×0.10) + (8×0.25) + (8×0.15) + (8×0.10) + (8×0.15) + (7×0.25) = 0.80 + 2.00 + 1.20 + 0.80 + 1.20 + 1.75 = **7.75**

---

## 이슈 목록

### HIGH (1건)

**1. [D5/D6 일관성·리스크] FR-N8N6 — CSRF Origin 검증 누락**

- **위치**: L2294 (FR-N8N6)
- **문제**: FR-N8N6은 "JWT + Admin 권한 검증"만 명시. 그러나 Step 06 혁신 리스크(L1672)에서 "n8n 에디터 보안 공격 표면 → HMAC per-company + **CSRF Origin** + Hono proxy rate limit 100 req/min"으로 CSRF 방어를 명시. Step 07 carry-forward CT-2에서도 "N8N-SEC-7 CSRF Origin 검증 → Sprint 2 스토리에서 반영" 예정이었으나, FR-N8N6에는 CSRF 보호가 누락됨. n8n 에디터는 워크플로우 생성·수정·삭제 권한을 가지므로 CSRF 취약점 시 Admin 세션 하이재킹으로 악의적 워크플로우 실행 가능.
- **수정 제안**: FR-N8N6에 CSRF 보호 추가: "JWT + Admin 권한 검증 + CSRF Origin 헤더 검증" 또는 별도 FR-N8N7으로 "n8n 에디터 접근 시 Origin 헤더가 CORTHEX 도메인인지 검증한다" 추가.

### MEDIUM (2건)

**2. [D6 리스크] FR-MKT — 플랫폼별 개별 실패 격리 FR 없음**

- **위치**: L2301 (FR-MKT2)
- **문제**: FR-MKT2는 "멀티 플랫폼(인스타/틱톡/유튜브 Shorts/링크드인/X) 동시 게시"를 정의. 5개 플랫폼 중 1~2개 API 장애 시 동작이 정의되지 않음. 전체 실패? 성공한 플랫폼만 게시? Step 05 MKT-2 도메인 요구사항에 "fallback 엔진"이 있으나, 이는 AI 도구 엔진 fallback이지 플랫폼 게시 fallback이 아님. NFR-EXT2 "부분 장애 격리"는 NFR이지 FR이 아님.
- **수정 제안**: FR-MKT2에 1문장 추가: "일부 플랫폼 게시 실패 시 성공한 플랫폼은 유지하고, 실패 플랫폼은 Admin에게 알림" 또는 별도 FR-MKT6으로 분리.

**3. [D3 정확성] FR-MKT4 — "무엇" 대신 "어떻게" 기술**

- **위치**: L2303 (FR-MKT4)
- **문제**: "n8n Switch 노드가 CORTHEX API `GET /api/company/:id/marketing-settings` 조회"는 구현 상세(how). FR은 사용자 관점의 기능(what)만 기술해야 함.
- **수정 제안**: "AI 도구 엔진 설정 변경이 다음 워크플로우 실행부터 즉시 반영된다"로 간소화. 구현 상세(n8n Switch 노드, API 엔드포인트)는 아키텍처 또는 스토리에서 정의.

### LOW (2건)

**4. [D1 구체성] FR-UX1 — "6~8개" 범위 불확정**

- **위치**: L2334 (FR-UX1)
- **문제**: "CEO앱 14개 페이지를 6~8개로 통합"의 "6~8"이 모호. GATE 테이블 기준으로 6개 그룹이 이미 명시됨(hub+command-center, classified+reports+files→문서함, argos+cron-base, home+dashboard, activity-log+ops-log, agents+departments+org). 그럼 6개가 확정이지 "6~8"이 아님.
- **수정 제안**: "6~8개"를 "6개"로 확정. 또는 추가 2개가 있다면 명시.

**5. [D2 완전성] FR-MKT — AI 도구 엔진 fallback FR 없음**

- **위치**: L2300 (FR-MKT1)
- **문제**: Step 05 MKT-2 도메인 요구사항에 "fallback 엔진"이 있으나, FR-MKT에 "특정 AI 도구 엔진 사용 불가 시 대체 엔진 자동 전환" FR이 없음. FR-MKT1에서 7개 도구를 나열하지만, 특정 도구 API 장애/종료 시 사용자 경험 정의 없음.
- **수정 제안**: FR-MKT에 1건 추가: "선택된 AI 도구 엔진이 응답하지 않으면 같은 카테고리 내 대체 엔진으로 자동 전환된다 (Admin 설정에서 우선순위 지정)" 또는 "에러 메시지 + 수동 전환 안내".

---

## Cross-talk 요약

Winston(Critic-A, Architecture)과 교차 검토 필요:

1. **FR-N8N6 CSRF**: Hono proxy 레벨에서 Origin 헤더 검증 구현이 아키텍처적으로 어디에 위치하는지 — tenantMiddleware 내부? 별도 미들웨어?
2. **FR-MKT2 5개 플랫폼 동시 게시**: n8n 워크플로우에서 각 플랫폼 노드 개별 에러 핸들링이 가능한지 — n8n Error Trigger 패턴으로 구현 가능 여부

---

## 긍정 평가

1. **FR-MKT 카테고리 신설**이 Journey 8(Admin 마케팅 워크플로우)을 완전히 커버. 주제 입력부터 멀티 플랫폼 게시까지 E2E 파이프라인이 명확.
2. **FR-PERS6~7 역할 프리셋**이 비개발자 UX를 크게 개선. 슬라이더 5개를 직접 조정하지 않아도 "전략 분석가" 선택 한 번으로 성격 설정 완료.
3. **FR-MEM9~11 성장 지표**가 Memory 3단계의 사용자 가치를 CEO/Admin 양쪽에서 확인 가능하게 함. 특히 FR-MEM10 Reflection 알림이 "에이전트가 성장하고 있다"는 체감을 제공.
4. **FR-OC9~11**이 모바일/접근성/Admin 관점을 빠짐없이 커버. 특히 FR-OC10 aria-live가 Step 05 PIX-4와 정확히 정합.
5. **FR-UX1~3 페이지 통합**이 GATE 결정을 FR로 공식화. redirect + 100% 기능 유지 조건이 회귀 방지에 효과적.

---

## 재검증 (Fixes Applied)

**Date**: 2026-03-21

### 수정 확인 (내 이슈 5건 + 타 Critic 7건):

| # | 이슈 | 상태 | 확인 위치 |
|---|------|------|---------|
| 1 | FR-N8N6 CSRF Origin 검증 | ✅ 반영 | L2294: "JWT + Admin 권한 + CSRF Origin 검증, FR-N8N4 인프라 기반". Winston cross-talk 후 HIGH→MEDIUM 하향 합의 — N8N-SEC-7에서 이미 커버. FR에 주석 추가로 충분 |
| 2 | FR-MKT2 플랫폼별 실패 격리 | ✅ 반영 | L2301: "일부 플랫폼 게시 실패 시 성공 플랫폼은 유지하고 실패 플랫폼만 Admin에게 알린다" |
| 3 | FR-MKT4 구현 상세 제거 | ✅ 반영 | L2303: "AI 도구 엔진 설정 변경이 다음 워크플로우 실행부터 즉시 반영된다" — n8n Switch 노드 + API 엔드포인트 상세 제거 |
| 4 | FR-UX1 "6~8"→"6개" 확정 | ✅ 반영 | L2337: "6개 그룹으로 통합된다 (GATE 테이블 기준)" — 단, L2335 섹션 설명에 "6~8개" 잔존 (경미, FR 자체가 권위적) |
| 5 | FR-MKT fallback 엔진 FR | ✅ 반영 | L2306: FR-MKT7 "외부 AI API 장애 시 fallback 엔진으로 자동 전환 + Admin 전환 알림" |
| 6 | FR-MKT6 저작권 워터마크 (Sally) | ✅ 반영 | L2305: "AI 생성 콘텐츠에 저작권 워터마크 삽입 여부를 ON/OFF" |
| 7 | FR-PERS8 슬라이더 툴팁 (Sally) | ✅ 반영 | L2317: "각 슬라이더 위치별 행동 예시 툴팁" |
| 8 | FR-MKT1 모델명→카테고리 (Bob) | ✅ 반영 | L2300: "카테고리별(이미지 3종+, 영상 4종+, 나레이션 2종, 자막 3종)" — 구체적 제품명 제거로 API 변경 내성 향상 |
| 9 | FR-MEM9 성공 정의 (Sally) | ✅ 반영 | L2329: "성공 기준: observations.outcome='success'" |
| 10 | FR-MKT3 CEO앱 웹 승인 (Sally) | ✅ 반영 | L2302: "CEO앱 웹 UI 또는 Slack/Telegram 미리보기에서" |
| 11 | NRT-2 heartbeat | △ carry-forward | Step 10 NFR 영역으로 이관. 적절한 판단 |
| 12 | v3 altitude (Bob) | ✅ 반영 | 신규 FR만 "what" 준수, 기존 FR 변경 없음 — 이전 Step 승인 유지 |

### 추가 확인:

- **FR-UX 섹션 설명 "6~8개" 잔존** (L2335): FR-UX1 자체는 "6개 그룹"으로 확정(L2337). 섹션 설명은 컨텍스트이므로 FR이 권위적. LOW — carry-forward
- **FR-MKT1 카테고리 변환**: 구체적 제품명(Nano Banana 2, Flux 2 등) 제거로 2026년 이후 API 변경 시 PRD 수정 불필요. 보안 관점에서도 제품명 고정 해제가 유연

### 재검증 차원별 점수:

| 차원 | 초기 | 재검증 | 변화 근거 |
|------|------|--------|---------|
| D1 구체성 | 8 | 9 | FR-UX1 "6개 그룹" 확정. FR-MEM9 성공 기준 추가. FR-PERS8 툴팁 예시 추가. FR-MKT1 카테고리 N종+ 구체적 |
| D2 완전성 | 8 | 9 | FR-MKT6 워터마크 + FR-MKT7 fallback + FR-PERS8 툴팁 + FR-MKT3 CEO앱 웹 경로 — 누락 기능 4건 보완 |
| D3 정확성 | 8 | 9 | FR-MKT4 구현 상세 제거 (what only). FR-N8N6 CSRF 추가. FR-MKT1 카테고리 변환으로 기술 정확성 향상 |
| D4 실행가능성 | 8 | 9 | FR 간소화(MKT4)로 구현자 판단 여지 적절. FR-MKT7 fallback이 구현 경로 명확 |
| D5 일관성 | 8 | 9 | FR-N8N6 CSRF ↔ Step 06 L1672 ↔ Step 07 CT-2 정합. FR-UX1 6개 확정. L2335 "6~8" 잔존은 경미 |
| D6 리스크 | 7 | 9 | FR-MKT7 fallback + FR-MKT2 플랫폼 격리 + FR-MKT6 워터마크(법적 리스크 방어) + FR-N8N6 CSRF. 주요 보안·운영 리스크 전부 커버 |

### 재검증 가중 평균: 9.00/10 ✅ PASS

(9×0.10) + (9×0.25) + (9×0.15) + (9×0.10) + (9×0.15) + (9×0.25) = 0.90 + 2.25 + 1.35 + 0.90 + 1.35 + 2.25 = **9.00**

### 잔존 이슈: 0건 (L2335 "6~8" 경미 잔존 — carry-forward)

### Carry-forward (Step 10+):
1. NRT-2 heartbeat → NFR 영역에서 처리
2. NFR-S7 cost-tracker 모순 → NFR 영역에서 처리
3. FR-UX 섹션 설명 "6~8개" → "6개"로 경미 수정

---
