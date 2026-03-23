# Critic-B (QA) Review — Step 10: User Journey Flows

**Reviewer:** Quinn (QA Engineer)
**Date:** 2026-03-23
**File:** `_bmad-output/planning-artifacts/ux-design-specification.md` (Lines 1934–2277)
**Grade Submitted:** A

---

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 10% | 9/10 | 6개 여정 각각에 Mermaid 플로우차트, 구체적 타이밍(FCP ≤1.5s, TTI ≤3s, debounce 300ms, heartbeat 5s→15s→30s), OCEAN 프리셋 수치(O=30 C=80 E=40 A=60 N=20), 에러 메시지 원문, 클릭 수(0클릭/2클릭), 온보딩 단계별 예상 시간(~1분/~2분/~3min) 명시. 횡단 패턴 4개도 적용 여정까지 구체 매핑. |
| D2 완전성 | 25% | 7/10 | PRD 10개 여정 중 6개 선별 + 우선순위 근거 제공. 각 여정에 목표/진입조건/플로우/에러 복구 포함. 횡단 패턴(Navigation/Decision/Feedback/Error Recovery) + 최적화 원칙 추출. **누락:** (1) JF-2~JF-6 모바일 적응 경로 미정의 (JF-1만 모바일 fallback 있음), (2) JF-1/JF-3/JF-5/JF-6에 접근성 어노테이션 부재 (JF-2 키보드/JF-4 ARIA만 있음), (3) JF-1 에이전트 0명 시 빈 상태 UI, JF-6 Reflection 0건 시 빈 상태 미정의, (4) 미선별 4개 여정(Journey 2 Chat, 3 Dashboard, 5 Trading, 6 Notifications)의 탈락 근거 불충분 — "v3 핵심 신규 기능"만으론 기존 기능의 v3 UX 변경 범위 불명확. |
| D3 정확성 | 15% | 8/10 | PRD Journey 번호 전수 확인: Journey 1(CEO Hub), 4(Admin 온보딩), 7(CEO 셀프서비스), 8(n8n 관리), 9(/office), 10(메모리 성장) — 모두 PRD와 일치. `agent_memories` 테이블 참조 — architecture.md에서 `agent_memories` 확장(memoryType='reflection' + VECTOR(1024)) 확인 → 정확. "confirmed decision #10" heartbeat 참조 — 추적 가능. 사소한 정확성 우려: JF-6의 "유사 태스크 성공률" 데이터 소스가 "task completion + quality score"로 기술되었으나 구체적 테이블/쿼리 미명시 — 구현 시 해석 여지. |
| D4 실행가능성 | 10% | 8/10 | Mermaid 플로우차트가 상태 머신으로 직접 변환 가능. 에러 복구 경로가 구체적("자동 3회 → 폴링 → 수동 새로고침"). 컴포넌트 선택(Radix Slider) 명시. 데이터 소스 테이블 참조. JF-6이 상대적으로 간략하여 구현 세부 사항 부족. |
| D5 일관성 | 15% | 9/10 | Step 2 성공 기준(WOW 달성률 90%) → JF-1 WOW 설계에 직접 반영. Step 4 감정 목표 → JF-1 "내 AI 팀이 살아있다" WOW. Step 7 EM-1~5 → "Step 7의 Experience Map" 명시적 참조. Step 8 Visual Foundation 토큰(세이지 dot, 크림, 올리브) 사용. PRD 용어(Hub, NEXUS, Handoff, ARGOS) 일관. 온보딩 ≤15분 — Step 7 EM-4 + PRD Journey 4와 정합. |
| D6 리스크 | 25% | 7/10 | **식별된 리스크 (8건):** (1) WS 끊김 → 폴링 fallback + 3회 재연결, (2) PixiJS 크래시 → 정적 조직도 fallback, (3) heartbeat 점진적 확대 5s→15s→30s, (4) 핸드오프 부분 실패 허용, (5) n8n OOM → 자동 재시작 + 분할 권장, (6) 외부 API 장애 → 노드별 일시정지, (7) 범위 밖 요청 → 안내형 거절, (8) 온보딩 중단 → 저장&재개. **누락 리스크 (5건):** (1) /office 50+ 에이전트 성능 — "뷰포트 내만 렌더링" 언급되나 FPS 목표/메모리 예산 미정의, (2) WebSocket 동시 연결 제한 (브라우저 탭 6개 제한, 서버 용량), (3) Big Five 동시 편집 경합 — 복수 Admin이 동일 에이전트 편집 시 race condition, (4) JF-6 성장 지표 데이터 신선도 — 반성 집계 주기 미정의 (실시간? 일배치?), (5) 온보딩 이탈률 분석 — Step 3(조직구조) 이탈 시 복구 전략 미상세. |

---

## 가중 평균: 7.75/10 ✅ PASS (Grade A)

계산: (9×0.10) + (7×0.25) + (8×0.15) + (8×0.10) + (9×0.15) + (7×0.25) = 0.90 + 1.75 + 1.20 + 0.80 + 1.35 + 1.75 = **7.75**

---

## 이슈 목록

### 중요도 순 (높음→낮음)

1. **[D2 완전성] JF-2~JF-6 모바일 적응 경로 부재** ⚠️
   - JF-1만 "모바일 sm/md → 리스트 뷰" fallback이 정의됨
   - JF-2 온보딩 Wizard는 모바일에서 어떻게 표시? (5단계 프로그레스 바 + NEXUS 드래그&드롭은 터치 최적화?)
   - JF-4 Big Five 슬라이더의 모바일 레이아웃? (5개 슬라이더 + 미리보기 패널 = master-detail이 불가능한 좁은 화면)
   - 권장: 각 JF에 "모바일 변형" 1-2줄 노트 추가

2. **[D2 완전성] 접근성 어노테이션 불균등** ⚠️
   - JF-2: 키보드 네비게이션 ✅, JF-4: Radix Slider ARIA ✅
   - JF-1: /office PixiJS 캔버스 접근성 미정의 — 스크린리더 사용자는 캔버스 콘텐츠 어떻게 인지?
   - JF-3: 핸드오프 트래커 실시간 업데이트의 `aria-live` 설정?
   - JF-5: n8n 에디터가 외부 의존이라 접근성 제외는 맞으나, CORTHEX 내 워크플로우 목록의 접근성은?
   - 권장: 각 JF에 최소 1건 접근성 어노테이션 추가

3. **[D6 리스크] /office 50+ 에이전트 성능 예산 미정의**
   - "뷰포트 영역 내만 렌더링 + 팬/줌" 언급되나 정량 목표 없음
   - 권장: "50 에이전트 기준 Desktop 30fps 유지, 메모리 ≤200MB" 같은 구체 예산

4. **[D6 리스크] WebSocket 동시 연결 제한**
   - CEO가 /office + Hub + Chat을 동시 탭으로 열면 WS 연결 3개 이상
   - 브라우저 per-domain 6 연결 제한 + 서버 동시 연결 용량 고려 필요
   - 권장: "단일 WS 연결 + 채널 멀티플렉싱" 또는 "SSE for read-only streams" 전략 명시

5. **[D6 리스크] Big Five 동시 편집 경합 (Race Condition)**
   - 복수 Admin이 동일 에이전트의 성격을 동시 편집 시 마지막 저장이 승리 (Last Write Wins)?
   - 권장: optimistic locking 또는 "현재 다른 Admin이 편집 중" 경고 UI

6. **[D2 완전성] 빈 상태 UI 정의 불균등**
   - JF-5 n8n: 빈 상태 UI 명시 ✅ ("첫 번째 워크플로우를 만들어보세요")
   - JF-1 /office: 에이전트 0명 시? → "Admin에게 에이전트 생성을 요청하세요" 같은 안내 필요
   - JF-6 성장: Reflection 0건 시? → "아직 반성 기록이 없습니다. 태스크를 실행하면 자동 생성됩니다"

7. **[D3 정확성] JF-6 "유사 태스크 성공률" 데이터 소스 불명확**
   - "task completion + quality score"로만 기술 — 어떤 테이블? 어떤 기준의 "유사"?
   - `agent_memories` cosine similarity? `tasks` 테이블의 status 집계?
   - 권장: 구체 테이블명 + 쿼리 로직 1줄 추가

---

## 자동 불합격 조건 점검

| 조건 | 결과 |
|------|------|
| 할루시네이션 | **해당 없음** — PRD Journey 1/4/7/8/9/10 번호 전수 확인, `agent_memories` 테이블 architecture.md에서 확인 |
| 보안 구멍 | **해당 없음** — n8n Docker 보안은 아키텍처 레벨 이슈 (UX 스펙 범위 밖) |
| 빌드 깨짐 | **해당 없음** — Mermaid 문법 정상 |
| 데이터 손실 위험 | **해당 없음** |
| 아키텍처 위반 | **해당 없음** |

---

## Cross-talk 요약

- Step 8 리뷰에서 지적한 "Safari focus-visible 동작 차이" 리스크가 Step 10 JF-1~JF-6 접근성 어노테이션 불균등 이슈와 연결됨 — 포커스 관리가 foundation에서 정의되었더라도 각 여정에서 구체 적용이 필요
- Step 9 리뷰에서 지적한 "dense table 가독성" 리스크는 미선별 Journey 5(Trading)의 v3 UX 변경 필요성을 뒷받침

---

## 총평

Step 10은 PRD 10개 여정에서 v3 핵심 6개를 선별하여 Mermaid 플로우차트 + 상세 인터랙션 테이블 + 에러 복구 시나리오로 구체화한 우수한 결과물이다. 특히:

- **JF-1 /office**: WS fallback → 폴링 → 수동 새로고침의 3단계 점진적 복구가 잘 설계됨
- **JF-2 온보딩**: 5단계 Wizard의 건너뛰기/되돌아가기/저장&재개가 UX 완성도 높음
- **횡단 패턴**: 4개 카테고리(Navigation/Decision/Feedback/Error Recovery)로 재사용 패턴 추출이 효과적

주요 개선 필요 영역은 모바일 적응(#1)과 접근성 균등화(#2)이며, 이 두 가지가 보강되면 9점대 진입 가능. 현재 점수로도 블로커 없이 **Grade A 통과.**
