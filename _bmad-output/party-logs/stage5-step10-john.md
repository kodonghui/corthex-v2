# Critic-C (PM) Review — Step 10: User Journey Flows

**Reviewer:** John (Product Manager)
**Date:** 2026-03-23
**File:** `_bmad-output/planning-artifacts/ux-design-specification.md` (lines 1934–2277)
**References verified:** PRD Journeys 1-10 (`prd.md:1070-1349`), architecture.md, Step 4 emotional goals, Step 7 Experience Maps

---

## Step 8 Fixes Verification

Sally의 4건 수정사항 전부 확인 완료:

| # | 이슈 (내 리뷰 기준) | 수정 확인 | 위치 |
|---|---------------------|----------|------|
| 1 | tailwind.config.ts 커스텀 스니펫 | ✅ `@theme` CSS snippet 추가 (breakpoints + radius) | L1699-1710, L1734 |
| 2 | Noto Serif KR 번들 사이즈 | ✅ dynamic import 전용, ≈4-8MB 명시, 초기 번들 금지 | L1593-1604 |
| 3 | font-display 전략 | ✅ `swap`(Inter/JBM) + `optional`(Noto Serif KR) | L1605-1606 |
| 4 | z-30 충돌 (타 비평가) | ✅ 의도적 공유 근거 상세 설명 | L1760 |
| — | border-radius TW 매핑 (타 비평가) | ✅ `--radius-md`→`rounded-md`, `@theme` override 설명 | L1728-1734 |

**결론:** Step 8 이슈 전부 해결됨. 추가 성능 예산(≤300KB woff2)까지 초과 제공. 이전 점수 유지(8.65).

---

## Step 10 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 8/10 | 6개 Mermaid 플로우에 구체적 타이밍(FCP≤1.5s, TTI≤3s, debounce 300ms, heartbeat 5s→15s→30s), 클릭 수(0클릭/2클릭), OCEAN 프리셋 값(O=30 C=80 E=40 A=60 N=20), n8n 제약(Docker 2G, timeout 30s, retry 2x) 포함. **감점:** JF-6(성장 대시보드)이 상대적으로 덜 구체적 — "40%→30% 우하향" 트렌드 언급이지만 차트 라이브러리, 갱신 주기, 데이터 윈도우(최근 7일? 30일?) 미명시. |
| D2 완전성 | 8/10 | PRD 10개 여정에서 v3 핵심 6개 선별 — 선별 기준표(우선순위/PRD 출처/복잡도) 제공. 각 여정에 목표+진입조건+Mermaid+결정포인트+오류복구 5요소 구비. Cross-journey 패턴 4카테고리 15개, 최적화 원칙 6개. **감점:** (1) JF-6 빈 상태(reflection 0건일 때) UI 미정의 — "이번 주 반성 3건" 위젯이 0건이면 무엇을 보여주는가? (2) JF-1 PixiJS 로딩 중 상태(FCP 전) 미정의 — skeleton? spinner? (3) 제외된 Journey 2/3/5/6에 대한 명시적 제외 사유 부재 (암묵적으로 "v3 핵심 신규"에 해당 안 됨을 이해 가능하나, 한 줄 언급 권장). |
| D3 정확성 | 9/10 | PRD 여정 번호 정확 매핑(Journey 9→JF-1, 4+7→JF-2, 1→JF-3, 4→JF-4, 8→JF-5, 10→JF-6). Sprint 우선순위(S1:Big Five, S2:n8n, S3:Memory, S4:/office) PRD와 일치. OCEAN 5축 명칭 정확. WebSocket은 /office, SSE는 핸드오프 — 아키텍처와 정합. `agent_memories` 테이블 참조 정확(DB 스키마 존재). n8n Docker 메모리 2G 아키텍처 정합. |
| D4 실행가능성 | 7/10 | Mermaid 다이어그램으로 UX 플로우 명확. 결정 포인트 표가 choice→outcome을 선명히 보여줌. 오류 복구가 구체적(자동 3회 재시도→수동 안내). Big Five 슬라이더 Radix+aria 속성 명시. **감점:** (1) API 엔드포인트 매핑 없음 — 각 플로우 단계에서 어떤 백엔드 API를 호출하는지 미연결 (JF-1의 "WebSocket 연결 시도"가 `/ws/office`인지 `/ws/agent-status`인지 모호). (2) 상태 관리 패턴 미명시 — Zustand store? React Query? 실시간 스트림 소비 방법? (3) JF-2 온보딩의 "나중에 계속하기" 저장 메커니즘 불분명 — localStorage? 서버 draft? |
| D5 일관성 | 9/10 | Step 4 감정 목표 "WOW 모먼트"를 JF-1에 직접 구현(3초 내 에이전트 working 목격). Step 7 Experience Map 참조 명시. Step 8 디자인 토큰(pulse dot, toast, 상태 색상) 일관 사용. PRD 용어(Hub, 핸드오프, NEXUS, ARGOS) 통일. 모바일 fallback이 Step 8 breakpoint(sm/md→리스트, lg+→PixiJS)와 정합. |
| D6 리스크 | 8/10 | 6개 리스크 명시: (1) WS 끊김→3-retry→폴링→수동 새로고침, (2) PixiJS 크래시→정적 조직도 fallback, (3) 핸드오프 부분 실패→나머지로 종합, (4) n8n OOM→자동 재시작+분할 권장, (5) heartbeat 점진적 확대 5→15→30s, (6) 50+ 에이전트→뷰포트 렌더링만. **감점:** (1) 동시 세션 리스크 미언급 — CEO가 /office 보면서 Admin이 에이전트 편집 시 상태 동기화 문제, (2) JF-6 성장 지표 데이터 신선도 미명시 — reflection cron 주기가 결과 정확도에 영향. |

---

## 가중 평균: 8.10/10 ✅ PASS (Grade A)

| 차원 | 점수 | 가중치 | 기여 |
|------|------|--------|------|
| D1 구체성 | 8 | 20% | 1.60 |
| D2 완전성 | 8 | 20% | 1.60 |
| D3 정확성 | 9 | 15% | 1.35 |
| D4 실행가능성 | 7 | 15% | 1.05 |
| D5 일관성 | 9 | 10% | 0.90 |
| D6 리스크 | 8 | 20% | 1.60 |
| **합계** | — | **100%** | **8.10** |

---

## 이슈 목록

### 개선 권장 (Nice-to-have, 블로커 아님)

1. **[D4 실행가능성]** API 엔드포인트 매핑 부재 — 각 플로우 단계에서 호출하는 서버 API 경로를 최소한 참조로 연결 권장. 예: JF-1 "WebSocket 연결 시도" → `/ws/office` (아키텍처 §X.X). JF-3 "태스크 입력" → `POST /api/tasks`. 이것이 없으면 개발자가 아키텍처 문서를 별도로 크로스레퍼런스해야 함.

2. **[D2 완전성]** JF-6 빈 상태 UI — 에이전트 메모리가 아직 없는 초기 상태(Sprint 3 전)에서 Dashboard 성장 위젯이 무엇을 보여주는지 정의 필요. "아직 메모리 데이터가 없습니다. Sprint 3 활성화 후 여기서 성장을 확인하세요" 같은 빈 상태 메시지.

3. **[D1 구체성]** JF-6 차트 갱신 주기 — "반복 오류율 그래프"와 "유사 태스크 성공률"의 데이터 윈도우(7일? 30일? 전체?)와 갱신 빈도(실시간? cron 기반?) 미명시.

4. **[D4 실행가능성]** JF-2 "나중에 계속하기" 저장 메커니즘 — localStorage? 서버 draft API? IndexedDB? 브라우저 변경 시 유지되는가?

5. **[D6 리스크]** 동시 세션 — CEO /office에서 에이전트 상태를 실시간 관찰하면서 Admin이 동일 에이전트를 편집할 때의 UX 처리 미정의.

---

## 자동 불합격 조건 검토

| 조건 | 결과 |
|------|------|
| 할루시네이션 | **CLEAR** — PRD 여정 번호, DB 테이블, 아키텍처 개념 전부 실존 확인 |
| 보안 구멍 | **CLEAR** |
| 빌드 깨짐 | **CLEAR** — Mermaid 구문 유효 |
| 데이터 손실 위험 | **CLEAR** |
| 아키텍처 위반 | **CLEAR** |

---

## 종합 평가

PM 관점에서 Step 10은 **PRD 여정을 UX 인터랙션 플로우로 성공적으로 변환**했다. 핵심 강점:

- **"WOW 보장 설계"의 구체화**: JF-1에서 Admin 테스트 태스크 → CEO 첫 진입 시 working 상태 보장이라는 사전 조건 설계는 PM이 가장 높이 평가하는 부분. "첫 경험이 비어있으면 실패"라는 리스크를 선제적으로 해결.
- **부분 실패 = 부분 성공**: JF-3의 핸드오프 부분 실패 허용은 실제 운영에서 가장 중요한 UX 결정. CEO가 "1명 실패"로 전체를 잃지 않는 설계.
- **프리셋 → 미세조정 패턴의 일관성**: JF-2(온보딩), JF-4(Big Five), JF-5(n8n) 모두 동일한 진입 패턴을 사용하여 학습 곡선을 낮춤.
- **Cross-journey 패턴 추출**: 15개 재사용 패턴이 개발 시 코드 재사용과 UX 일관성을 동시에 보장.

D4(7점)가 가장 낮은 차원인데, 이는 UX 스펙의 본질적 한계(API 매핑은 아키텍처/스토리 단계에서 해결)이므로 블로커가 아님. **Grade A 통과.**
