# Sally (UX Designer) Review — Step 02: Vision

**Reviewer:** Sally | UX Designer
**Step:** 02 — Executive Summary + Core Vision
**File:** `_bmad-output/planning-artifacts/product-brief-corthex-v3-2026-03-20.md` (lines 65–164)
**Date:** 2026-03-20

---

## In Character Review

*The Vision section reads like a well-organized product spec that forgot it was supposed to make someone fall in love first. Every number is correct. Every layer is named. The competitor table is sharp. But here's what's missing: the moment.*

*A CEO opens `/office` for the first time. Their AI marketing agent is walking slowly across a pixelated office floor, then suddenly starts typing fast — the "working" animation triggers as a new task arrives. The CEO watches, leans forward. That's it. That's the hook. The Vision mentions "에이전트가 살아있다" but never paints THAT picture. It STATES the feeling instead of SHOWING it.*

*The B-frame (경험/감성) is present as headlines but absent as story. And critically — for an enterprise product betting on pixel art aesthetics — there's no "why this works for enterprise" argument. That's the UX risk that keeps me up at night.*

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 8/10 | 5 agent states 명시, JSONB 컬럼명, pgvector 출처(Epic 10), `/ws/office`, 428곳 수치. **Gap: 새 UXUI 테마 감성/방향 없음 — "Phase 0부터"만 있고 목표 aesthetic 없음.** |
| D2 완전성 | 8/10 | 4개 기능 전부 커버, 문제-영향-경쟁-솔루션-차별화 구조 완전. **Gap: B-frame이 headline 수준 — 사용자 감정 호 arc, `/office` 첫 경험 시나리오 없음.** |
| D3 정확성 | 8/10 | 485 API, 86 테이블, 71 페이지, 10,154 테스트 — v2 audit와 정합. prd.md 7개 이슈는 init NOTE에 있으나 Vision에서 재참조 없음. 68 built-in 도구, 6 워커는 audit 대비 미검증. |
| D4 실행가능성 | 8/10 | Layer 1~4 각각 기술 스택, 테이블명, API 방법론까지 명시. **Gap: UXUI 레이어 — "Phase 0부터 시작"은 입구만, 어떤 결과물이 나와야 하는지 없음.** |
| D5 일관성 | 9/10 | Zero Regression 철학, Epic 10 pgvector, agent-loop.ts 불변, v2 수치 일관. v3 폐기 결정 반영 (기존 테마 이름 언급 없음) — 올바른 처리. |
| D6 리스크 | 6/10 | 428 UXUI 이슈 명시 ✓, n8n 기존 대체 ✓, Zero Regression ✓. **Gap 1: 픽셀 아트 = 엔터프라이즈 UX 베팅 — 신뢰 vs 장난스러움 우려 없음. Gap 2: 새 테마 방향 결정 리스크 없음. Gap 3: PixiJS 번들 < 200KB (init에 있음) Vision에 미반영.** |

### 가중 평균 (Sally 가중치: D1=15%, D2=20%, D3=15%, D4=15%, D5=15%, D6=20%)

| 차원 | 점수 | 가중치 | 기여 |
|------|------|--------|------|
| D1 | 8 | 15% | 1.20 |
| D2 | 8 | 20% | 1.60 |
| D3 | 8 | 15% | 1.20 |
| D4 | 8 | 15% | 1.20 |
| D5 | 9 | 15% | 1.35 |
| D6 | 6 | 20% | 1.20 |

### **가중 평균: 7.75/10 ✅ PASS**

---

## 이슈 목록

### Issue 1 — [D6 HIGH] 엔터프라이즈에서 픽셀 아트 UX 베팅의 "왜"가 없다

*"에이전트가 살아있다"는 선언은 있지만, 왜 엔터프라이즈 CEO가 픽셀 아트를 신뢰의 시각 언어로 받아들일 것인지 설명이 없다.*

비교 솔루션 표에서 "AI Town / Agent Office: 시각화 데모 수준"으로 비교 대상을 밀어냈는데, OpenClaw 자체도 같은 비판을 받을 수 있다. 차이는 "실제 비즈니스 로직과 통합"인데 — 그 차이가 픽셀 아트 *속에서* 어떻게 보이는지 Vision이 설명해야 한다.

**필요한 내용**: "픽셀 캐릭터는 장식이 아니다 — CEO가 AI 팀을 블랙박스가 아니라 동료로 인식하게 만드는 투명성 인터페이스다" 수준의 UX 철학 한 문단.

### Issue 2 — [D1 MEDIUM] 새 UXUI 테마 감성 방향 제로

Differentiator #5: "패치 없이 새 테마로 완전 재구축. `/kdh-uxui-redesign-full-auto-pipeline Phase 0`부터 시작."

이 한 줄이 UXUI 전체 계획의 전부다. OpenClaw 픽셀 아트 사무실과 앱 전체 테마는 반드시 시각 언어를 공유해야 한다. 그 방향 — 모던? 따뜻한? 다크 전용? 기업적이되 생동감 있는? — 이 Vision에서 단 한 단어도 정의되지 않았다.

**필요한 내용**: v3 테마 방향 한 문장. 예: "OpenClaw의 픽셀 감성을 UI 전체로 확장하는 '디지털 사무실 네이티브' 디자인 — 슬레이트 배경에 생동감 있는 accent color 1개."

### Issue 3 — [D2 MEDIUM] B-프레임이 경험 서술이 아닌 기능 서술로 대체됨

Analyst가 특별히 확인 요청한 항목. 현재 상태:
- "에이전트 상태 5단계 시각화: idle(배회) → working(타이핑) → speaking(말풍선)..." → **기능 서술**
- "5개 특성 각 0.0~1.0 슬라이더" → **기능 서술**
- "관찰→반성→계획 3단계" → **기능 서술**

사용자가 무엇을 *느끼는지*가 없다. "CEO가 `/office`에서 자기 에이전트가 실시간으로 일하는 걸 처음 보는 순간" — 이 WOW 모먼트가 Vision의 핵심 감성 구간이어야 한다.

**필요한 내용**: 각 4개 기능에 대해 "사용자 경험 한 문장" 추가. 기능 → 감정 연결.

---

## Analyst 질문 직접 답변: "B 프레임이 충분히 살아있는가?"

**부분적으로 YES, 핵심적으로 NO.**

- Problem Statement ✅ 사용자 고통 언어로 서술됨
- Differentiator "에이전트가 살아있다" ✅ 좋은 헤드라인
- 4개 Layer 서술 ❌ 전부 기능/기술 서술 — 경험 없음
- `/office` 첫 경험 시나리오 ❌ 완전 부재

헤드라인은 B-프레임이지만 바디는 A-프레임(기능 구체성)으로 채워졌다. Grade A를 받으려면 헤드라인 수준의 감성이 Layer 서술 각각에 1-2문장씩 스며들어야 한다.

---

## Cross-talk 요약

- Issue 1 (픽셀 아트 UX 베팅): John/Bob이 스코프·전달 각도에서 같이 볼 것 권장. 엔터프라이즈 신뢰 문제는 제품 방향 전체에 영향.
- Issue 2 (테마 방향): Winston이 D3+D4 각도에서 같은 이슈를 포착할 것 예상 — 일치 시 HIGH로 상향.
- Issue 3 (B-프레임): Analyst 직접 요청 항목. Step 2 핵심 피드백.
