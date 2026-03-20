## Critic-C Review (Bob, SM) — Step 02: Vision

**Reviewed by:** Bob the Scrum Master
**Date:** 2026-03-20
**File:** `_bmad-output/planning-artifacts/product-brief-corthex-v3-2026-03-20.md` (lines 65–164)
**My weights:** D1=20%, D2=20%, D3=15%, D4=15%, D5=10%, D6=20%
**Grade target:** A (7.0+ required, 3 retries max)

---

### 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 8/10 | 레이어별 기술 스택 명확 (PixiJS 8 + @pixi/react, Tiled JSON, `personality_traits JSONB`, 0.0~1.0 범위, `observations`/`memories` 테이블). 5단계 에이전트 상태(`idle`/`working`/`speaking`/`tool_calling`/`error`) 명시. 숫자 근거 있음(485 API, 86 테이블). 단, n8n Docker 메모리/CPU 할당 미명시. |
| D2 완전성 | 7/10 | A(기능)+B(감성)+C(성장) 통합 요구 충족. 핵심 메시지 line 77에 정확히 반영. Problem/Impact/Why/Solution/Differentiator 구조 완성. Gap: UXUI "새 테마로 완전 재구축"이라 하면서 새 테마의 방향(색상/타이포/스타일)은 전혀 없음 — Vision이 방향을 정해야 Step 5 Scope에서 설계 범위를 잡을 수 있음. |
| D3 정확성 | 9/10 | 485 API, 86 테이블, 71 페이지, 10,154 테스트 — 전부 AUTHORITY 문서(v3-corthex-v2-audit.md) 기반. pgvector Epic 10 설치 사실 정확. agent-loop.ts 읽기 전용 접근 정확. 14 WS 채널 → +1 = 15 일관. |
| D4 실행가능성 | 7/10 | 각 레이어는 DB 컬럼명, 라우트, 패키지까지 명시돼 바로 착수 가능. 그러나 4개 레이어 간 개발 순서·의존성이 없음. Layer 3(Big Five)는 1주, Layer 4(메모리)는 4주, Layer 1(PixiJS)은 에셋 작업 선행 필요 — 이 시퀀싱 없이는 sprint 계획 불가. |
| D5 일관성 | 9/10 | Step 01 VPS 제약 블록과 완전 정합: WebSocket +1 채널(/ws/office) ✅, n8n Docker 별도 ✅, pgvector 기존 Neon ✅. Zero Regression 철학 = v1-feature-spec.md CONSTRAINT 문서 정합 ✅. |
| D6 리스크 | 6/10 | 개별 레이어 수준에서 VPS 제약 의식됨(n8n "별도 배포", WebSocket +1). 그러나 Vision 전체 범위의 실현 가능성 리스크 미언급: (1) PixiJS 픽셀 에셋(스프라이트, Tiled JSON 타일맵)은 순수 코딩이 아닌 아트 작업 → solo dev 병목 가능, (2) 4레이어 + UXUI 리셋 동시 진행 범위가 과도할 수 있음, (3) 메모리 크론(반성 단계) pgvector 임베딩 생성 시 CPU spike 위험. |

---

### 가중 평균 계산

| 차원 | 점수 | 가중치 | 기여 |
|------|------|--------|------|
| D1 구체성 | 8 | 20% | 1.60 |
| D2 완전성 | 7 | 20% | 1.40 |
| D3 정확성 | 9 | 15% | 1.35 |
| D4 실행가능성 | 7 | 15% | 1.05 |
| D5 일관성 | 9 | 10% | 0.90 |
| D6 리스크 | 6 | 20% | 1.20 |
| **합계** | | **100%** | **7.50** |

### 최종 점수: **7.5/10 ✅ PASS**

---

### 이슈 목록

**Issue 1 — [D6 리스크] PixiJS 에셋 작업 병목 미인식 (Priority: HIGH)**

Layer 1 스펙에 "PixiJS 8 + @pixi/react, Tiled JSON 타일맵, 스프라이트 애니메이션"이 나오는데, 이건 코딩 작업이 아닌 **아트/디자인 작업**이 선행되어야 한다:
- 픽셀 캐릭터 스프라이트 시트 제작 (idle/working/speaking/tool_calling/error 5단계)
- Tiled JSON 타일맵 설계 (사무실 레이아웃)

Solo dev + AI 환경에서 이 에셋을 누가 만드는가? AI가 생성하는가, 외부 소스를 쓰는가, CEO가 직접 만드는가? Vision에서 이 전제를 명확히 하지 않으면 Layer 1 구현 착수 시점에서 블로커가 된다.

**픽셀 에셋 전략을 한 줄이라도 명시 필요**: "AI 생성(Midjourney/stable diffusion)", "오픈소스 스프라이트 팩 활용", "CEO가 직접 제작" 중 하나.

**Issue 2 — [D4 실행가능성] 레이어 개발 순서/의존성 미명시 (Priority: MEDIUM)**

4개 레이어의 난이도와 의존성이 전혀 다름:
- Layer 3 (Big Five): DB 컬럼 추가 + UI 슬라이더 — 독립적, 빠름 (1~2주)
- Layer 2 (n8n): Docker 설치 + API 연동 — 독립적, 중간 (2~3주)
- Layer 4 (메모리): `observations`+`memories` 테이블 + 크론 + pgvector — 복잡, 느림 (4~6주)
- Layer 1 (PixiJS): 에셋 선행 필요 + WebSocket + 전 레이어 통합 — 가장 복잡, 마지막 (6~8주)

Vision에서 "낮은 난이도→높은 난이도 순 구현"을 명시하면 Step 5 Scope에서 realistic한 Phase 계획이 나온다. 이 순서 없이는 Step 5가 4개 레이어를 동시 개발로 가정할 위험이 있다.

---

### Bob's SM Comment

> "7.5 — technically passing, but I'm watching two things that will bite us in sprint planning. First, nobody said who makes the pixel art assets. PixiJS 코드는 짤 수 있는데 스프라이트 시트는 누가 만드냐 — 이게 없으면 Layer 1은 착수도 못 한다. Vision에서 못 박아야 한다. Second, 4개 레이어를 동시 개발하는 것처럼 쓰여 있는데, 현실적으로는 3→2→4→1 순서다. Step 5 Scope에서 이 순서를 강제하지 않으면 solo dev가 모든 레이어를 반쯤 시작하다가 아무것도 완성 못 할 수 있다."

---

### Cross-talk 예고
- Sally가 예고한 UXUI 새 테마 방향(D1 이슈) — Bob도 D2에서 동일하게 잡음. 공동 플래그 가능.
- Winston이 레이어 의존성 아키텍처 관점에서 더 깊게 잡을 것으로 예상.
