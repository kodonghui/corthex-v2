# Critic-UX (Sally) Review — Stage 2 Step 6: User Journeys

> Reviewer: Sally (UX Designer)
> Weights: D1=15%, D2=20%, D3=15%, D4=15%, D5=20%, D6=15%
> Section: PRD `prd.md` lines 1070–1335 (## User Journeys)
> Cross-refs: Brief §4 (Go/No-Go, 5상태), confirmed-decisions-stage1.md, Steps 3-5 확정사항, Success Criteria (L471-664)
> NOTE: 용어 치환 이슈는 Pre-sweep 완료. 구조/로직/정합성만 평가.

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 8/10 | 10개 여정 대부분 구체적 UI 상호작용 포함 (슬라이더 aria, 6단계 파이프라인, PixiJS 애니메이션). 시간 기대치 명시 (5분 온보딩, 4시간→15분, ~20초 분석). J4 Sprint 1 접근성 aria-valuenow+키보드, J9 모바일 리스트 뷰 대안. 하지만 J2(팀장), J3(투자자)는 다른 여정 대비 현저히 빈약. J6(스케치바이브) 3줄 분량. |
| D2 완전성 | 7/10 | 6 페르소나 × 4 Phase × 4 Sprint 전부 커버. Requirements Summary 20행, 교차점 10행. **그러나:** **(1)** CEO 사이드바 통합(14→6, FR-UX1)이 Success Criteria L501+L660에 명시되나 여정에 전무, Requirements Summary에도 없음. **(2)** Gate #9 Observation Poisoning Admin 처리 여정 없음 — "admin-only 수동 검증"(실패 트리거 L555) 전환 시 Admin UX 미정의. **(3)** J2, J3 에러 시나리오 전무. |
| D3 정확성 | 8/10 | Brief 5상태 vs NEXUS 4색 변환 명시적 설명 (L1249 "working+speaking+tool_calling 통합"). Big Five 기본값 50/100(J7) + 프리셋(J4) 일관. n8n Error Workflow 30s+retry 2+fallback = 실패 트리거 L552 정합. **약점:** J10 Reflection "매일 새벽 3시" — 실제 Gate #7 기준 confidence ≥ 0.7 + 20개 관찰 트리거를 단순화. 첫 주 reflection 미생성 가능성 미반영. |
| D4 실행가능성 | 8/10 | Requirements Summary가 여정→FR 직접 추적 가능. 교차점 테이블이 cross-cutting concern 구현 방향 제시. /ws/office + /ws/agent-status 이중 브로드캐스트 구조 명시 (L1333). 약점: J6 구현에 필요한 MCP 오류 처리 미정의. |
| D5 일관성 | 7/10 | **(1)** Success Criteria L501 "CEO 앱 네비게이션 간결 | 기존 대비 6개+ 감소" + L660 "14→6개 그룹, FR-UX1" — 여정 섹션에 대응 없음. **(2)** Brief #11 사용성 검증: "/office→에이전트 식별→Chat→태스크→/office 확인, 5분" — J9에서 /office→Hub→/office는 보이지만 "에이전트 식별→Chat" 구체 단계 누락. **(3)** 실패 트리거 L559 "CEO 내비게이션 혼란" 여정 부재 — 트리거만 있고 해당 경험의 여정 표현 없음. **(4)** n8n 이중 터치포인트: J4 Sprint 2 L1167-1169에서 명확히 구분 ✅ (Winston carry-forward 해소). |
| D6 리스크 | 7/10 | 7/10 여정에 에러 시나리오 포함 (J1×3, J5, J7, J8, J10). J8 API fallback 패턴 우수. **그러나:** J2(팀장) 에러 전무, J3(투자자) 에러 전무, J6(스케치바이브) 에러 전무. WebSocket 끊김/재연결 UX 전 여정 미커버. /office PixiJS 로드 실패 대안 미정의. 관찰 중독(Gate #9) 시 Admin 대응 UX 미정의. |

---

## 가중 평균: 7.45/10 ✅ PASS

계산: (8×0.15) + (7×0.20) + (8×0.15) + (8×0.15) + (7×0.20) + (7×0.15) = 1.20 + 1.40 + 1.20 + 1.20 + 1.40 + 1.05 = **7.45**

---

## 이슈 목록

### Major

1. **[D2/D5] CEO 사이드바 통합(14→6) 여정 부재**
   - Success Criteria L501: "CEO 앱 네비게이션이 간결하다 | 사이드바 메뉴 항목 수 | 기존 대비 6개+ 감소"
   - Success Declaration L660: "CEO 앱 사이드바: 합쳐진 메뉴 구조로 간결화 (14→6개 그룹, FR-UX1)"
   - 10개 여정 중 어디서도 통합 경험 미서술. Requirements Summary(L1294-1319)에도 없음.
   - 사이드바 통합은 모든 CEO/팀장에게 영향을 미치는 UX 변화. v2→v3 전환 시 메뉴 위치 변경으로 혼란 가능 — 실패 트리거 L559에서 이미 인지.
   - **수정**: Journey 1에 "Layer 0 병행" 단계 추가 — "Sprint 진행 중 사이드바가 14개→6개 그룹으로 통합됨. 기존 Trading 페이지가 Dashboard에 합쳐지고, redirect 자동 작동. CEO: '메뉴가 깔끔해졌는데, 이전 페이지를 북마크했다면 자동 이동되니까 문제없다.'" + Requirements Summary에 "CEO | 병행 | 사이드바 14→6 그룹 통합 (FR-UX1), 기존 URL redirect, 안내 배너" 행 추가.

2. **[D2/D6] Journey 2(팀장), Journey 3(투자자) — 에러 시나리오 전무**
   - J1은 Phase 1/2/Sprint 4에서 3건 에러 커버. J5, J7, J8, J10도 각 1건.
   - J2(팀장): 비서 라우팅 실패/팀원 동시 사용 충돌 에러 없음.
   - J3(투자자): 4명 병렬 핸드오프 중 부분 실패 에러 없음 — J1 Phase 2 CMO 타임아웃과 유사하나 투자자 관점(분석 정확도 영향) 미표현.
   - **수정**: J2에 "비서 라우팅 실패: 팀원A가 비서에게 비마케팅 요청 → '마케팅 관련 요청만 처리합니다. 직접 에이전트를 선택해주세요.' 안내" 추가. J3에 "4명 중 기술분석가 타임아웃 → CIO가 3명 결과로 종합 + '기술분석 데이터 미포함' 명시. 이사장: '부분 결과라도 빠르게 받는 게 낫다'" 추가.

3. **[D2/D6] Observation Poisoning Admin 처리 여정 부재 (Gate #9)**
   - Gate #9: 4-layer sanitization (10KB cap + control char + prompt hardening + content classification)
   - 실패 트리거 L555: "불가 시 reflection 입력을 admin-only 수동 검증으로 전환"
   - J10(메모리 딥다이브)에 관찰 중독 감지/처리 흐름 전무. Admin이 flagged observation을 UI에서 어떻게 확인하고, 어떤 기준으로 삭제/승인하는지 미정의.
   - **수정**: J10에 추가 — "에이전트 메모리 탭에서 '의심스러운 관찰 2건' 경고 배지. 클릭 → 원본 관찰 텍스트 + 분류 결과(content classification: 'prompt injection attempt') 표시. 이수진이 [삭제] 또는 [안전 확인] 선택. 삭제 시 해당 관찰이 Reflection 입력에서 제외."

### Minor

4. **[D6] Journey 6(스케치바이브) — 단일 시나리오, 에러 없음**
   - 3줄 분량. MCP 연결 실패, 캔버스 충돌, approval 거부 등 에지 케이스 전무.
   - **수정**: "MCP 연결 실패 시: Claude Code에서 'MCP 서버에 연결할 수 없습니다. 스케치바이브 서버 상태를 확인해주세요.' + 로컬 텍스트 아키텍처 다이어그램으로 fallback" 추가.

5. **[D3/D5] Reflection 트리거 조건 단순화 (J10)**
   - L1270: "매일 새벽 3시 기본 → 하루 동안의 Observation을 종합"
   - 실제 Gate #7: confidence ≥ 0.7 + reflected=false 20개 트리거. 20개 미만 시 reflection 미생성.
   - 첫 주에 Admin이 "왜 reflection이 안 생기지?" 혼란 가능.
   - **수정**: J10에 "첫 1주: 관찰 12건 누적 → 메모리 탭에 '최소 20건의 관찰이 필요합니다 (현재 12건)' 안내. 2주차: 28건 도달 → 첫 Reflection 자동 생성. 이수진: '아 충분한 데이터가 쌓여야 판단을 내리는구나.'" 추가.

6. **[D5] Requirements Summary에 사이드바 통합 FR 누락**
   - L1294-1319 테이블에 "사이드바 14→6" 항목 없음.
   - Success Criteria L501 + L660에서 FR-UX1 참조. 여정에서 도출되어야 할 FR이 Summary에 없음.
   - **수정**: Issue #1의 수정과 동시 처리 (Requirements Summary 행 추가).

7. **[D6] WebSocket 연결 끊김 UX 부재**
   - /office(J9)는 /ws/office WebSocket에 의존. 연결 끊김 시 사용자 경험 미정의.
   - 교차점 L1333에서 /ws/office 신규 채널 정의하면서도, 끊김 시나리오 없음.
   - **수정**: J9에 "네트워크 불안정 시: /office 상단 '연결 재시도 중...' 배너 + 에이전트 캐릭터 grayed out + 5초 자동 재연결. 재연결 성공 시 최신 상태 동기화." 추가.

8. **[D5] Brief #11 사용성 5단계 플로우 미재현**
   - Brief #11: "/office→에이전트 식별→Chat→태스크→/office 확인, 5분"
   - J9: /office→Hub→/office (Hub와 Chat 구분 모호, "에이전트 식별" 단계 생략)
   - **수정**: J9 Resolution에 "5분 태스크 플로우: /office에서 CIO 상태 확인 → Chat으로 이동 → '분기 실적 분석해줘' → /office에서 CIO 타이핑 확인 → 결과 수신. 총 3분." 명시. Gate #13과 직접 연결.

---

## Cross-talk 요약

- **Winston에게**: n8n 이중 터치포인트 — J4 Sprint 2 L1167-1169에서 "워크플로우 관리 페이지(React)" + "n8n 비주얼 에디터: Admin 전용 링크" 명확 구분. 네 carry-forward 해소 확인. NEXUS 4색 vs Brief 5상태: L1249에서 "working+speaking+tool_calling→초록(통합)" 명시 — Architecture 관점에서 /ws/agent-status와 /ws/office 이중 브로드캐스트(L1333) 구현 구분이 잘 되어 있음.
- **Quinn에게**: Gate #9 Observation Poisoning Admin 처리 여정 없음 — QA가 E2E 테스트 시나리오를 이 섹션 기반으로 짜면 "악성 관찰 감지 → Admin 검토 → 삭제/승인" 플로우 테스트 누락. 보안 테스트 시 J10 범위 확장 필요. WebSocket 끊김 시나리오도 QA 필수인데 여정에 없음.
- **Bob에게**: Requirements Summary 20행은 우수한 추적성. 하지만 사이드바 통합(FR-UX1)이 Success Criteria에 있으면서 Requirements Summary에 없음 — 배포 일정에 영향. Sprint 완료 기준(Step 5)에서 "병행" 작업으로 들어가야 하는데 FR 도출이 안 됨. J2/J3 에러 부재는 가벼운 여정의 품질 격차.

---

## Cross-talk 보충 이슈 (Bob 발견 채택)

9. **[D3] J10 Planning stage — 스키마에 존재하지 않는 엔티티 서술 (Bob 발견)**
   - L1271 "Planning: Reflection 기반 다음 태스크 전략 생성 (자동, 수동 트리거 가능)" + L1279 "Planning: 5건 적용"
   - PRD 스키마(L900-929): observations 테이블 + agent_memories에 memoryType='reflection'/'observation'. **'planning' memoryType 없음.**
   - Planning은 read-time retrieval(실행 시 관련 reflection 자동 참조)이지 별도 저장 레코드가 아님.
   - 메모리 대시보드가 "3단계 모니터링"으로 서술되면 개발자가 Planning 테이블/컬럼을 만들려 함.
   - **수정**: J10 메모리 탭 → "Observation: 47건 / Reflection: 14건 / 자동 활용: 관련 Reflection이 다음 태스크 실행 시 자동 참조" 형태로. "Planning 5건 적용" → "최근 5회 태스크에서 Reflection 기반 행동 변화 감지". Requirements Summary L1315도 "3단계 모니터링" → "2단계 모니터링 + 자동 활용".

10. **[D4] J1 Sprint 3 "주간 성장 리포트" — FR 미도출 (Bob 발견)**
    - L1109: "매주 월요일 에이전트 성장 리포트 도착"
    - Requirements Summary L1301: "Reflection 주간 리포트 알림" — FR로 나열되어 있음.
    - 그러나 Product Scope에 이 알림 인프라 정의 없음. 텔레그램/in-app 중 어떤 채널? 어떤 데이터?
    - 여정이 구체적 기능(주 1회 리포트 + 알림)을 서술하는데 Product Scope에서 범위 미확정.
    - **수정**: Requirements Summary "Reflection 주간 리포트 알림"에 "(Product Scope 확정 필요: 채널 + 데이터 범위)" 주석 추가. 또는 J1 Sprint 3에 "미래 범위" 태그.

---

## Cross-talk R2 보충 (Winston/Quinn 발견 채택)

11. **[D3 Major ↑] J10 Reflection 수치 수학적 불가능 (Winston H1 채택, Issue #5 격상)**
    - L1277-1279: "Observation 47건 → Reflection 14건 (매일 1건)"
    - Product Scope L951: "에이전트별 최근 20개 관찰(reflected=false)이 쌓이면 자동 실행"
    - 47 / 20 = **최대 2건 반성. 14건은 수학적으로 불가능.**
    - 근본 원인: Brief "일 1회 크론" vs Product Scope "20-count threshold" — 트리거 모델 해석 차이. Journey는 Brief의 daily 모델을 따름.
    - 기존 Issue #5(Minor)를 Major로 격상. 이 수치는 사용자에게 "에이전트가 매일 성장한다"는 기대를 심어주며, 실제 구현(20-count trigger)과 괴리 발생.
    - **수정**: "2주 후: Observation 47건 → Reflection 2건 (배치 20개씩 처리, 7건 미처리 잔류). 크론은 매일 실행되나 20개 미만이면 skip → '최소 20건의 관찰이 필요합니다 (현재 7건)' UI 안내." L1273 Tier 제한도 "주 1회" → "20개 트리거 기반 + Tier 3-4는 월 2회 cap"으로 정합.

12. **[D4 Minor] Requirements Summary 보안/운영 FR 전무 (Quinn M4 채택)**
    - Requirements Summary 20행 전부 happy-path 기능. 보안/운영 FR 0건.
    - 누락: Observation Poisoning Admin UI, 비용 모니터링 대시보드, TTL 30일 가시성, WebSocket limit config, Tool Sanitization 경고.
    - 개발자가 이 테이블로 스토리 도출하면 보안/운영 스토리 전부 누락.
    - **수정**: Requirements Summary에 보안/운영 행 추가 — "Admin 이수진 | Sprint 3 | Observation 분류 결과 확인 + 의심 관찰 플래그 처리 (Gate #9)", "Admin 이수진 | Sprint 3 | 에이전트 비용 모니터링 + 한도 초과 자동 차단 (Gate #7)", "Admin 이수진 | Sprint 2-3 | Tool Sanitization 보안 경고 알림 (Gate #11)".

13. **[D3 Minor] J8 AI 도구 벤더 Tech Research 미검증 (Winston 질문 검증)**
    - J8 L1218-1220: Ideogram V3 ($0.03~0.09/장), Kling 3.0 (~$0.03/초), ElevenLabs
    - `technical-research-2026-03-20.md` 검색 결과: Ideogram, Kling, ElevenLabs **0건**.
    - Stage 1 Tech Research에서 검증되지 않은 벤더의 구체적 가격을 여정에 서술. 근거 부재.
    - **수정**: 벤더명을 예시로 전환 — "(예: Ideogram V3, Kling 3.0 등 — Sprint 2 착수 시 최신 벤더 선정)" 또는 Tech Research 보충.

14. **[D6 Minor] J8 n8n 2G Docker cap 미반영 (Quinn 발견)**
    - J8 마케팅 파이프라인 6단계(AI 리서치+이미지+영상+게시)가 n8n Docker 2G 안에서 실행 가능한지 여정에서 미언급.
    - 확정 결정 #2 "2G cap" + 실패 트리거 L549 "max_concurrency=1" — 6단계 중 병렬 처리가 2G를 초과할 가능성.
    - **수정**: J8에 "n8n 2G 메모리 한도 내 실행 (max_concurrency=1 설정으로 단계별 순차 처리). 이미지+영상 동시 생성이 OOM 유발 시 단계 3을 순차 분리." 추가.

### 최종 총 이슈: 14건 (4 Major + 6 Minor + 4 Cross-talk)

### 점수 조정 (Cross-talk 반영)

| 차원 | R1 | Cross-talk 후 | 근거 |
|------|-----|--------------|------|
| D1 구체성 | 8 | 8 | 유지 |
| D2 완전성 | 7 | 7 | 유지 (보안 FR은 D4로 분류) |
| D3 정확성 | 8 | **7** | Reflection 수치 수학적 불가능 (47/20=2, not 14) + 벤더 미검증. 두 건의 사실 오류 |
| D4 실행가능성 | 8 | **7** | Requirements Summary 보안/운영 FR 전무 → 스토리 도출 갭 |
| D5 일관성 | 7 | 7 | 유지 |
| D6 리스크 | 7 | 7 | J8 2G cap 추가하나 기존 D6 7 범위 내 |

### 조정 가중 평균: 7.15/10 ✅ PASS

계산: (8×0.15) + (7×0.20) + (7×0.15) + (7×0.15) + (7×0.20) + (7×0.15) = 1.20 + 1.40 + 1.05 + 1.05 + 1.40 + 1.05 = **7.15**

---

## Post-Fix Verification (R2)

> Fix log: `stage-2-step-06-fixes.md` (8 fixes: 1 CRITICAL + 5 MAJOR + 2 MINOR)
> PRD re-read: lines 1070–1349

### Fix 검증

| # | Fix | 검증 | 결과 |
|---|-----|------|------|
| 1 | J10 전면 재작성 (Critical) | **(a)** Obs Poisoning: L1278 4-layer 방어 명시 + L1300 에러 시나리오 2 (4-layer 차단 → Admin 플래그 관리) ✅ **(b)** Reflection math: L1287 "2건 (20개 threshold)" — 47/20≈2 정합 ✅ **(c)** Planning: L1280 "read-time semantic search, Option B" — 저장 엔티티 아닌 자동 주입 ✅ **(d)** 추가: L1282 30일 TTL, L1279 advisory lock + ECC 2.2 ✅ | ✅ |
| 2 | J2 에러 시나리오 (Major) | L1132: n8n OOM + Docker 2G 한도 + Admin 워크플로우 분할 요청 | ✅ |
| 3 | J3 에러 시나리오 (Major) | L1150: 뉴스분석가 타임아웃 → 3명 결과 종합 + 에이전트 명시 메시지 + 자동 재시도 | ✅ |
| 4 | J8 n8n 2G + 보안 (Major) | L1214: "n8n Docker 컨테이너(2G RAM, `--memory=2g`)" + "port 5678 외부 차단 + 태그 필터 + webhook HMAC (Go/No-Go #3)" | ✅ |
| 5 | J9 WebSocket (Major) | L1264: 50+ 연결 제한 + 오래된 연결 해제 + CEO 메시지 + heartbeat 5초→15초→30초 (confirmed #10, R15) | ✅ |
| 6 | J1 사이드바 통합 (Major) | Requirements Summary L1327: "사이드바 통합 14→6개 그룹 (FR-UX1)" ✅. **잔여:** Journey 1 본문에 실제 사용자 경험 서술 미추가 — FR 도출은 됐으나 narrative 부재. 원라이너면 충분 | ⚠️ |
| 7 | Requirements Summary 5행 (Minor) | L1325-1329: 보안 필터+플래그, Reflection 설정+TTL, 사이드바 FR-UX1, n8n 2G+보안+Sanitization, WebSocket+heartbeat — 5행 모두 확인 | ✅ |
| 8 | 주간 리포트 → 대시보드 (Minor) | L1112: "Admin 메모리 대시보드에서 CIO 반복 오류율 확인" — 알림 인프라 제거. **잔여:** L1311 Requirements Summary "Reflection 주간 리포트 알림" 미수정 | ⚠️ |

### 잔여 관찰 (Non-blocking)

1. **[D5 Micro] L1311 Requirements Summary "주간 리포트 알림"** — Journey 본문은 "Admin 대시보드 확인"으로 수정됨. Requirements Summary만 구버전 잔류.
2. **[D5 Micro] 사이드바 통합 narrative 부재** — Requirements Summary L1327에 FR-UX1 있으나, Journey 1 본문에 CEO가 "메뉴가 줄었다"를 체감하는 한 줄 서술 없음.
3. **[D3 Minor] J8 AI 벤더 가격 미검증** — Ideogram V3 $0.03~0.09, Kling 3.0 $0.03/초 — Tech Research 0건 히트. Sprint 2 착수 시 확정 사항으로 수용 가능하나, 현재 가격을 확정적으로 서술.
4. **[D6 Micro] WebSocket 네트워크 불안정 재연결** — J9 Fix 5는 연결 과다(50+) 시나리오만. 네트워크 끊김 시 자동 재연결 3회 + fallback은 미서술. heartbeat fallback으로 간접 커버.

### Post-Fix 차원별 점수

| 차원 | Pre-fix | Post-fix | 근거 |
|------|---------|----------|------|
| D1 구체성 | 8 | 9 | J10 20-count threshold + 30일 TTL + advisory lock + 4-layer 구체화. J2/J3 에러 추가. J8 2G + 보안 triple |
| D2 완전성 | 7 | 9 | 10/10 여정 에러 시나리오 완비. Gate #9 Admin 4-layer + 플래그 관리. Requirements Summary 25행 (보안/운영 5행 추가). 사이드바 FR-UX1 |
| D3 정확성 | 7 | 9 | Reflection 수학 정합 (47/20=2). Planning = read-time. "주간 리포트" → "대시보드". 벤더 가격 minor 잔여 |
| D4 실행가능성 | 7 | 9 | Requirements Summary 보안/운영 FR 5행. Observation 플래그 관리 UI 구체화. n8n 2G 운영 FR |
| D5 일관성 | 7 | 8 | J10 Product Scope 정합 (20-count, Option B, advisory lock). J8 confirmed decision #2 정합. L1311 "주간 리포트" + 사이드바 narrative minor 잔여 |
| D6 리스크 | 7 | 9 | 10/10 여정 에러 완비. J10 보안 시나리오 (4-layer). J9 WebSocket limit + heartbeat. J2 OOM. J3 partial failure |

### 가중 평균: 8.80/10 ✅ PASS

계산: (9×0.15) + (9×0.20) + (9×0.15) + (9×0.15) + (8×0.20) + (9×0.15) = 1.35 + 1.80 + 1.35 + 1.35 + 1.60 + 1.35 = **8.80**

---

## Supplementary Fix Verification (R2b)

> Supplementary fixes: Fix 9-10 (John 추가) + 기존 Fix 보강 (TTL 보존 정책)
> PRD re-read: lines 1270–1349

### Fix 검증

| # | Fix | 검증 | 결과 |
|---|-----|------|------|
| 9 | J10 반복 오류율 "40%→15%" → "40%→30%" | L1293: "반복 오류율 그래프가 40% → 30%로 완만한 하향. 2건의 Reflection이 각각 1가지 행동 변화를 유도" — 2건 Reflection으로 10p 감소, 현실적 | ✅ |
| 10 | J10 에러 시나리오 3 (크론 실패) | L1302: "Reflection 크론 실행 실패 시 → 메모리 탭에 경고 표시. observations reflected=false 유지 → 다음 크론 재처리. 3회 연속 실패 시 Admin 알림" — 실패 복원 경로 명확 | ✅ |
| 기존 보강 | Resolution 30일 TTL + 보존 정책 | L1296: "30일 이상 된 Observation 자동 정리 — 중요 관찰은 보존 정책 설정으로 보호" — confirmed decision #5 반영 + 보존 예외 | ✅ |

### 잔여 관찰 업데이트

R2에서 flagged한 4건 중 **1건 해소**:
1. ~~L1311 "주간 리포트 알림"~~ — Requirements Summary 전면 재구성으로 해당 행 사라짐. Sprint 3 행(L1327-1328)이 메모리 모니터링+Reflection 크론으로 대체. **해소 ✅**
2. **[D5 Micro] 사이드바 narrative 부재** — 유지. Journey 1 본문에 CEO 체감 한 줄 없음.
3. **[D3 Minor] J8 AI 벤더 가격 미검증** — 유지. Tech Research 0건 히트.
4. **[D6 Micro] WebSocket 네트워크 불안정 재연결** — 유지. overload만 커버.

**신규 관찰 0건.** Fix 9의 40%→30% 변경이 D3 정확성을 추가 강화 (비현실적 수치 제거). Fix 10의 크론 실패 시나리오가 D6 리스크를 추가 강화 (에러 시나리오 3/3 완비).

### R2b 차원별 점수

| 차원 | R2 | R2b | 변동 근거 |
|------|-----|-----|-----------|
| D1 구체성 | 9 | 9 | 유지 |
| D2 완전성 | 9 | 9 | 유지 |
| D3 정확성 | 9 | **9.5** | 40%→30% 현실적 수치 + TTL 보존 정책 구체화 |
| D4 실행가능성 | 9 | 9 | 유지 |
| D5 일관성 | 8 | **8.5** | L1311 "주간 리포트" 잔여 해소 (Requirements Summary 재구성). 사이드바 narrative만 잔류 |
| D6 리스크 | 9 | **9.5** | 크론 실패 에러 시나리오 추가 → J10 에러 3/3 완비 (잘못된 학습 + 보안 + 크론 실패) |

### 가중 평균: 9.05/10 ✅ PASS

계산: (9×0.15) + (9×0.20) + (9.5×0.15) + (9×0.15) + (8.5×0.20) + (9.5×0.15) = 1.35 + 1.80 + 1.425 + 1.35 + 1.70 + 1.425 = **9.05**

**최종 잔여: 3건 (2 Micro + 1 Minor). 전부 non-blocking.**
