# Critic-A (Developer) Review — Step 10: User Journey Flows

**Reviewer:** Amelia (Dev Agent) — Architecture + API weights
**File:** `_bmad-output/planning-artifacts/ux-design-specification.md` lines 1934–2277
**Source verification:** Cross-referenced against PRD Journeys 1/4/8/9/10, Step 2 DC-1 (WebSocket fallback), Step 7 EM-4 (Onboarding), Phase 3 Design Tokens

---

## Step 8 Fixes — 확인 완료

| 이슈 | 수정 확인 | 위치 |
|------|----------|------|
| Border radius TW class 매핑 | ✅ `rounded-md`=8px, `rounded-lg`=12px, `rounded-xl`=16px + @theme 오버라이드 스니펫 | line 1729-1734 |
| Z-index 30 collision | ✅ "z-index 30 공유 의도" 해설 블록 추가 — 동시 겹침 불가 논증 | line 1760 |
| Noto Serif KR 번들 | ✅ dynamic import 전용, font-display:optional, ≈4-8MB CJK 초기 번들 제외, ≤300KB 예산 | line 1593-1606 |
| TW4 breakpoint snippet | ✅ `@theme { --breakpoint-md: 640px; --breakpoint-xl: 1440px; }` 코드 블록 | line 1699-1710 |

**4/4 이슈 해결. Step 8 수정 완료 확인.**

---

## Step 10 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 8/10 | Mermaid flowchart 6개로 시각적 플로우 명확. 구체적 수치 다수: FCP≤1.5s, TTI≤3s, debounce 300ms, heartbeat 5s→15s→30s, OCEAN 프리셋값(O=30 C=80 E=40 A=60 N=20), Docker 2G, 타임아웃 30s. API 엔드포인트 경로(`/ws/office` 등) 미명시, DB 테이블명 1곳만 (`agent_memories`). |
| D2 완전성 | 8/10 | PRD 10개 여정 중 v3 핵심 6개 선별 + 선별 근거 테이블 제공. 각 플로우에 정상/오류/접근성 경로 포함. 횡단 패턴 4종(Navigation/Decision/Feedback/Error Recovery) 추출. 미비: (1) JF-2에서 CEO 초대 단계 누락 (EM-4의 Step 6), (2) 1인 창업자 케이스 미반영, (3) JF-6이 다른 플로우 대비 상대적으로 얇음 (오류 경로 부재). |
| D3 정확성 | 8/10 | PRD 여정 매핑 정확 (JF-1=J9, JF-2=J4+7, JF-3=J1, JF-4=J4-S1, JF-5=J8, JF-6=J10). n8n OOM/Error Workflow/fallback 엔진이 PRD §Journey 8과 일치. 5-state 에이전트 상태가 PRD와 일치. 미비: WS 재연결 횟수 불일치 (JF-1: 3회 vs DC-1: 5회), 온보딩 단계 수 불일치 (JF-2: 5단계 vs EM-4: 6단계). |
| D4 실행가능성 | 8/10 | Mermaid diagram으로 분기 로직 명확, Radix Slider aria-attribute 명시, Wizard 인터랙션 규칙 6개 명시, 핸드오프 트래커 UI 테이블 구체적. 횡단 패턴이 재사용 가이드 역할. 미비: 상태 관리 패턴(React Query/Zustand) 미언급, API 엔드포인트 경로 미명시 (UX 스펙 범위 판단에 따라 합리적). |
| D5 일관성 | **7/10** | **주요 불일치 2건:** (1) EM-4(Step 7)는 6단계 Wizard인데 JF-2(Step 10)는 5단계 — CEO 초대(Step 6) 누락, Step 2에서 직원 등록+비서 유무 탈락, 변경 근거 미설명. (2) DC-1(Step 2)은 WS 재연결 "최대 5회"인데 JF-1은 "3회" — 수치 충돌, 의도적 변경이면 주석 필요. 양호: Step 8 디자인 토큰(sage pulse dot, cream 배경) 일관 적용, 핸드오프 트래커 색상이 semantic colors와 정합, PRD 용어(Hub, NEXUS, ARGOS) 일관 사용. |
| D6 리스크 | 8/10 | PixiJS 크래시 fallback(정적 조직도), WS→폴링 graceful degradation, n8n OOM 자동 재시작+분할 권장, 핸드오프 부분 실패 허용, 50+ 에이전트 뷰포트 컬링, heartbeat 점진적 확대. 미비: Wizard 저장/재개 시 race condition 미언급, SSE/WS 장시간 세션 메모리 누수 미언급. |

---

## 가중 평균: 7.85/10 ✅ PASS (Grade A 미달 — 8.0 필요)

**계산:**
- D1 (15%): 8 × 0.15 = 1.20
- D2 (15%): 8 × 0.15 = 1.20
- D3 (25%): 8 × 0.25 = 2.00
- D4 (20%): 8 × 0.20 = 1.60
- D5 (15%): 7 × 0.15 = 1.05
- D6 (10%): 8 × 0.10 = 0.80
- **Total = 7.85**

---

## 이슈 목록

### 블로커 (Grade A 달성 필수 수정)

1. **[D5 일관성] 온보딩 Wizard 단계 수 불일치 — EM-4(Step 7) 6단계 vs JF-2(Step 10) 5단계**
   - EM-4 Step 2: "Human 직원 등록 + CLI 토큰 검증 + 비서 유무 설정" → JF-2 Step 2: "CLI 토큰 검증" 만 남음
   - EM-4 Step 6: "CEO 초대 + 테스트 태스크 예약" → JF-2에서 완전 누락
   - EM-4 Completion: "CEO 초대 링크 복사 버튼" → JF-2 Completion에서 미언급
   - **수정 방안:** (A) JF-2를 6단계로 복원, 또는 (B) 5단계 통합이 의도적이면 변경 근거 명시 + EM-4 역수정

2. **[D5 일관성] WebSocket 재연결 횟수 불일치 — DC-1(Step 2) "최대 5회" vs JF-1(Step 10) "3회"**
   - DC-1 (line 137): "3초 간격 자동 재연결 (최대 5회) + 5회 실패 시 '새로고침' 버튼"
   - JF-1 (line 1986-2001): "3회 재연결 실패?" → 폴링 전환 → "새로고침"
   - **수정 방안:** 하나로 통일. 추천: DC-1의 5회 유지 (더 resilient)

### 비블로커

3. **[D2 완전성] JF-6 오류 경로 부재** — 다른 5개 플로우 모두 Error Path 포함하나 JF-6(성장 확인)에는 없음. Reflection 크론 실패 시 CEO 대시보드 반응, 데이터 0건 시 빈 상태 등 필요.

4. **[D2 완전성] 1인 창업자 케이스 JF-2 미반영** — EM-4에서 "1인 창업자: 'CEO 초대' 단계 조건부 스킵 옵션 + 앱 전환 네비게이션 안내" 명시했으나 JF-2에서 언급 없음.

5. **[D1 구체성] API 엔드포인트 미명시** — JF-1에서 "WebSocket 연결 시도"만 있고 `/ws/office` 경로 미명시. PRD에는 `/ws/office`로 명시됨 (Journey 9 cross-reference). UX 스펙 범위 판단이지만, PRD 참조 추가 권장.

---

## 특기 사항 (Strengths)

- **Mermaid flowchart 활용**: 6개 여정 모두 시각적 플로우로 분기 로직이 한눈에 파악됨. 개발자가 state machine으로 직접 변환 가능.
- **횡단 패턴 추출**: Navigation/Decision/Feedback/Error Recovery 4종 패턴이 6개 플로우의 공통 인터랙션을 체계화. 컴포넌트 재사용 설계의 기초.
- **heartbeat 점진적 확대**: 5s→15s→30s 전략이 네트워크 부하와 UX degradation 사이 균형을 잘 잡음.
- **부분 실패 허용**: JF-3 핸드오프에서 1명 실패 시 나머지로 종합 — CEO 경험 중단 방지. 실전적 설계.
- **OCEAN 프리셋 구체값**: O=30 C=80 E=40 A=60 N=20 — 개발자가 바로 seed data로 사용 가능.

---

## Cross-talk 요약

- 이슈 #1, #2는 D5 블로커로 Grade A 달성에 필수. 다른 Critic도 Step 7↔Step 10 정합성 확인 요청.
- 이슈 #3 (JF-6 Error Path)은 D2 관점에서 다른 Critic이 보완 가능.
- 이슈 #4 (1인 창업자)는 Product Critic(Critic-C)이 PRD 기준으로 재확인 필요.
