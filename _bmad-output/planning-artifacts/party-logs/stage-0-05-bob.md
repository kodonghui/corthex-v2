## Critic-C Review (Bob, SM) — Step 05: MVP Scope

**Reviewed by:** Bob the Scrum Master
**Date:** 2026-03-20
**File:** `_bmad-output/planning-artifacts/product-brief-corthex-v3-2026-03-20.md` (lines 368–450)
**My weights:** D1=20%, D2=20%, D3=15%, D4=15%, D5=10%, D6=20%
**Grade target:** A (7.0+ required, 3 retries max)

---

### 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 8/10 | Sprint 순서 표 (Layer 0 병행 + 3→2→4→1) 명확. Layer 2 Hono 프록시 `/admin/n8n/*` → localhost:5678, Layer 3 `soul-renderer.ts extraVars`, Layer 4 Option B `memoryTypeEnum` 확장 전부 파일명/경로 수준 명시. Go/No-Go 7개 게이트 측정 가능. Gap: "E8 경계"라는 용어가 Brief 내 최초 등장 — 정의 없음. |
| D2 완전성 | 7/10 | Layer 0~4 In Scope + Out of Scope 9개 + Go/No-Go 7개 + Future Vision 구조 완비. Option B 이월 해소 ✅. Gap: Layer 0가 "전 Sprint 병행"인데 Sprint별 UXUI 작업 분류 없음 — Sprint 1에서 Layer 0 작업이 어느 페이지인지 불명확. Reflection 크론 트리거 조건("일 1회" vs "20개 누적")이 Brief 내에서 "기본 일 1회"로 정리됐지만 두 방식 병용 가능성 미언급. |
| D3 정확성 | 8/10 | soul-renderer.ts ✅ (analyst 확인), Option B agent_memories 확장 ✅ (Step 02 Winston 검증), ARGOS(argos-service.ts) 유지 ✅, 485 API / 86 테이블 ✅, Hono 프록시 ✅. Gap: soul-renderer.ts의 `extraVars` 파라미터 실존 여부 미확인 — Winston 코드 확인 필요. |
| D4 실행가능성 | 7/10 | Sprint 순서 의존성 명확. Layer 3(낮음)→2(중간)→4(높음)→1(최고) 난이도 순 배치 ✅. Go/No-Go 게이트 #7 "PRD 확정 후 구현"이 Sprint 3 블로커임을 명시 ✅. Gap: Layer 0 병행이 Solo Dev에게 실제로 어느 Sprint에서 얼마나 부하를 주는지 정량화 없음 — 4개 Sprint 각각에 UXUI 리셋 작업이 더해지면 Sprint 용량 초과 가능. |
| D5 일관성 | 9/10 | Layer 구현 순서(3→2→4→1) Step 02 Bob Issue 2 해소 ✅. Option B Step 02 이월 해소 ✅. n8n 내부망 전용 Step 01 VPS 제약 ✅. soul-renderer.ts Step 04 검증 ✅. UXUI Layer 0 KPI Step 04 Verified ✅. Go/No-Go 게이트 #3 n8n 보안 Step 04 수정 사항 일치 ✅. ARGOS 유지 Zero Regression ✅. |
| D6 리스크 | 7/10 | Layer 1 에셋 선행 필수 명시 ✅ (Step 02 Issue 1 해소). n8n 포트 5678 Out of Scope + 게이트 #3 ✅. Zero Regression 경계 Out of Scope에 명시 ✅. Reflection 비용 블로커 명시 ✅. Gap: (1) Layer 0 병행이 Solo Dev 총 작업량을 약 1.5배로 증가시키는 리스크 미언급. (2) memory-extractor.ts 이중 모드(즉시 추출 + 크론 모드) 동시 지원 시 race condition 리스크 미언급. |

---

### 가중 평균 계산

| 차원 | 점수 | 가중치 | 기여 |
|------|------|--------|------|
| D1 구체성 | 8 | 20% | 1.60 |
| D2 완전성 | 7 | 20% | 1.40 |
| D3 정확성 | 8 | 15% | 1.20 |
| D4 실행가능성 | 7 | 15% | 1.05 |
| D5 일관성 | 9 | 10% | 0.90 |
| D6 리스크 | 7 | 20% | 1.40 |
| **합계** | | **100%** | **7.55** |

### 최종 점수: **7.55/10 ✅ PASS**

---

### 이슈 목록

**Issue 1 — [D6 리스크 + D4 실행가능성] Layer 0 병행의 Solo Dev 작업 부하 미정량화 (Priority: MEDIUM)**

"Layer 0 UXUI 완전 리셋 — 전 Sprint 병행"이라고 했는데, 428곳 하드코딩 색상 전환 + Dead button 0 + 95% 게이팅을 4개 Sprint 전체에 걸쳐 병행하면 실질 작업량이 1.5배가 된다. SM 관점에서 이 병행이 Sprint Planning에서 어떻게 스토리로 분해되는지 기준이 없다.

최소 명시 필요:
- Sprint 1: Admin 에이전트/성격 관련 페이지 UXUI 우선
- Sprint 2: Admin n8n 관리 페이지 UXUI
- Sprint 3: Admin 메모리 설정 관련 페이지
- Sprint 4: CEO /office 페이지 + 전체 UXUI 완료 게이팅

또는: "Layer 0는 별도 Layer 0 Sprint로 분리 — 4개 Layer Sprint와 인터리브"

현재처럼 "병행"만 선언하면 Sprint 1에서 Layer 3 구현 + 전체 UXUI 리셋이 동시에 들어가 Sprint가 터진다.

**Issue 2 — [D6 리스크] memory-extractor.ts 이중 모드 race condition 미언급 (Priority: MEDIUM)**

L405: "기존 `memory-extractor.ts` 크론 모드 확장 (즉시 추출 모드 유지)"

`memory-extractor.ts`가 두 가지 모드를 동시에 지원한다:
- **즉시 추출 모드**: 기존 v2 코드 (실시간 호출)
- **크론 모드**: v3 신규 (관찰 → 반성 주기 생성)

두 모드가 같은 파일에서 동시에 실행될 경우:
- 동일 `agent_memories` 레코드에 동시 write 가능성
- 즉시 추출과 크론 반성이 같은 관찰 데이터를 중복 처리할 가능성

"확장"의 구현 방식(별도 entry point? 모드 파라미터? 별도 파일 분리?)을 Scope에 명시해야 Sprint 3 착수 시 개발자가 안전하게 설계할 수 있다.

제안: "memory-extractor.ts는 기존 즉시 추출 모드 유지. 크론 모드는 별도 파일(`memory-reflection.ts` 신규)로 분리 — 같은 파일 수정 없이 '위에 얹는' 방식"

---

### Bob's SM Comment

> "7.55 — Scope 섹션으로서는 탄탄하다. Layer 구현 순서가 잡혔고, Option B 이월이 해소됐고, Go/No-Go 게이트 7개가 출시 기준을 명확히 한다. n8n 보안 경계까지 Out of Scope에 못 박은 건 좋은 결정이다. 두 가지만: '전 Sprint 병행'이라는 Layer 0 전략이 Solo Dev에게 실제로 어떤 의미인지 — 4개 Sprint마다 UXUI 리셋 작업이 추가되면 Sprint 용량 계산이 달라진다. Sprint Planning에서 Layer 0 스토리가 어느 Sprint에 얼마나 들어가는지 기준 한 줄이 있어야 한다. memory-extractor.ts 이중 모드도 '확장'의 구체적 방향을 지금 결정해야 Sprint 3에서 개발자가 Zero Regression을 지키면서 구현할 수 있다."

---

### Cross-talk 예고
- Winston(Architect): soul-renderer.ts `extraVars` 파라미터 실존 여부 확인 요청. memory-extractor.ts 이중 모드 구현 패턴 의견 요청.
- John(PM): Layer 0 병행 Sprint 분류에 PM 관점 의견 요청.
