# Stage 2 Step 06 — User Journeys Fixes Applied

**Writer:** john
**Date:** 2026-03-22
**Section:** PRD lines 1070–1335 (## User Journeys)
**Pre-fix scores:** Winston 8.65, Quinn 6.30 (FAIL), Sally 7.45, Bob 7.45 — Avg 7.46

---

## Fixes Applied (10 total)

### CRITICAL (1)

**Fix 1: Journey 10 전면 재작성 — Observation poisoning + Reflection math + Planning scope**
- **Poisoning defense (Go/No-Go #9):** Observation 설정에 4-layer 보안 필터 추가 (10KB+제어문자+프롬프트 하드닝+콘텐츠 분류). 에러 시나리오 2 추가: 악의적 입력 차단 + Admin 플래그 관리 UI
- **Reflection math:** "14건 (매일 1건)" → "2건 (20개 threshold 충족 시에만 실행)". 47 obs / 20 = 최대 2.3 → 수학적 정합
- **Planning scope:** "Planning 5건 적용 + 수동 트리거" → "최근 Reflection이 Soul에 자동 주입 (read-time semantic search, Option B)". Product Scope L896 정합
- **추가:** 30일 TTL (confirmed decision #5), advisory lock, 비용 자동 차단 (ECC 2.2, Go/No-Go #7)
- **Source:** ALL 4 critics (Quinn C1, Winston H1, Bob #1/#3, Sally #5)

### MAJOR (5)

**Fix 2: Journey 2 (팀장) — 에러 시나리오 추가**
- n8n OOM 실패 → CEO 앱 ❌ 표시 + 실패 원인 + Admin 문의 안내
- **Source:** Sally #2, Quinn C2

**Fix 3: Journey 3 (투자자) — 에러 시나리오 추가**
- ARGOS 크론 실행 중 뉴스분석가 타임아웃 → /office 빨간 느낌표 + CIO 3명 결과 종합
- **Source:** Sally #2, Quinn C2

**Fix 4: Journey 8 — n8n 2G cap + 보안 3중 검증 추가**
- "6단계 파이프라인이 n8n에 자동 생성" → "n8n Docker 컨테이너(2G RAM, --memory=2g)에 자동 생성. 보안: port 5678 외부 차단 + 태그 필터 교차 접근 차단 + webhook HMAC 검증 (Go/No-Go #3)"
- **Source:** Quinn M1, Bob (implied)

**Fix 5: Journey 9 — WebSocket limits + heartbeat fallback 추가**
- 에러 시나리오 추가: 동시 접속 50+ 시 연결 제한 + heartbeat 5초→15초→30초 점진적 확대 (confirmed decision #10, R15)
- **Source:** Quinn M2, Sally #7

**Fix 6: Journey 1 — CEO 사이드바 통합 (14→6) 여정 추가**
- Sprint 1 전에 "UXUI Layer 0 (병행)" 단락 추가: 사이드바 14→6 그룹 통합 (FR-UX1)
- **Source:** Sally #1

### MINOR (2)

**Fix 7: Requirements Summary — 보안/운영/사이드바 5행 추가**
- Sprint 3: Observation 4-layer 보안 + 플래그 관리, Reflection 크론 설정 + 30일 TTL
- 병행: 사이드바 통합 FR-UX1
- Sprint 2: n8n 2G 운영 + 보안 3중 + Tool Sanitization
- Sprint 4: /office WebSocket 제한 + heartbeat
- **Source:** Quinn M4, Sally #6

**Fix 8: Journey 1 Sprint 3 — "매주 월요일 성장 리포트" 삭제**
- Product Scope에 없는 기능 → Admin 대시보드 확인으로 변경
- **Source:** Bob #2

### CROSS-TALK ADDITIONS (2)

**Fix 9: Journey 10 반복 오류율 교정**
- "40%→15%" → "40%→30%" — 2건 Reflection으로 25p 감소 비현실적, 10p로 교정
- "2건의 Reflection이 각각 1가지 행동 변화를 유도 — 아직 초기지만 방향은 명확"
- **Source:** Quinn (cross-talk consensus), Winston H1

**Fix 10: Journey 10 에러 시나리오 3 (크론 실패) + TTL 보강**
- Reflection 크론 실패 → 메모리 탭 경고 + observations reflected=false 유지 → 다음 크론 재처리. 3회 연속 실패 시 Admin 알림
- Resolution에 30일 TTL 자동 정리 + 보존 정책 설정 명시
- **Source:** Winston (cross-talk), Quinn #7

---

## NOT Fixed (deferred or out of scope)

| Item | Reason | Deferred to |
|------|--------|-------------|
| Journey 6 스케치바이브 확장 | v2 Phase 4 기능, v3 범위 외 | — |
| Journey 10 Tier별 빈도 차이 | Bob #3와 Quinn M3 간 해석 차이 → daily+threshold 결합 모델로 통일 | Product Scope 확인 후 |
| AI 도구 벤더 검증 (Winston 질문) | Tech Research Stage 1 범위 | Tech Research 참조 |
| Reflection 90% 실패 처리 (Winston L2) | Architecture carry-forward | Architecture |

---

## Confirmed Decisions Coverage (User Journeys 내)

| # | Decision | Status |
|---|----------|--------|
| 1 | Voyage AI 1024d | ⚠️ Journey 레벨 불필요 (사용자 비가시) |
| 2 | n8n Docker 2G | ✅ Journey 8 Rising Action |
| 3 | n8n 8-layer security | ✅ Journey 8 Rising Action (Go/No-Go #3) |
| 5 | 30일 TTL | ✅ Journey 10 Rising Action |
| 8 | Observation poisoning | ✅ Journey 10 에러 시나리오 2 |
| 9 | Advisory lock | ✅ Journey 10 Reflection 설정 |
| 10 | WebSocket limits | ✅ Journey 9 에러 시나리오 |
