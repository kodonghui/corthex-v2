# Sally (UX Designer) Review — Step 05: MVP Scope (GATE)

**Reviewer:** Sally | UX Designer
**Step:** 05 — MVP Scope (GATE)
**File:** `_bmad-output/planning-artifacts/product-brief-corthex-v3-2026-03-20.md` (lines 368–450)
**Date:** 2026-03-20

---

## In Character Review

*이 섹션을 읽으면서 가장 먼저 든 생각: 이 팀은 컨텍스트를 잘 쌓았다. Layer 4 Option B, soul-renderer.ts extraVars, n8n 포트 5678 내부망 — Step 01부터 Step 04까지 결정된 것들이 Scope에 정확하게 반영됐다. Sprint 의존성 표가 특히 명쾌하다.*

*그런데 UX 설계자의 눈으로 보면 한 가지가 계속 걸린다. Layer 0가 "전 Sprint 병행"으로 시작된다. 이 말은 Sprint 1에서 Big Five 슬라이더 UI를 개발하는 동안 Layer 0의 테마가 동시에 결정된다는 뜻이다. 만약 Phase 0 테마 선택이 Sprint 1 중반에야 확정된다면? 개발자는 임시 색상으로 Big Five UI를 만들고, 나중에 전부 새 토큰으로 교체해야 한다. "병행"이 재작업 리스크를 품고 있다.*

*두 번째: 사이드바가 없다. n8n 관리 페이지 +1, Admin /office read-only 추가 — 이 두 페이지가 Admin 앱 사이드바 어디에 들어가는지 Scope에 없다. 구현자가 임의 배치하면 UX 일관성이 깨진다.*

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 9/10 | Sprint 순서 표, Layer별 기술 스택·파일명·조건값 전부 명시. Go/No-Go 7개 게이트 구체적. Gap: Layer 0 "Phase 0 아키타입 테마 선택" 완료 타임라인 없음 — Sprint 1 전인지 Sprint 4 전인지 불명확. |
| D2 완전성 | 8/10 | In Scope(Layer 0~4) + Out of Scope + Go/No-Go + Future Vision 전부 커버. Gap 1: Layer 0 병행 완료 기준 없음. Gap 2: Admin/CEO 앱 네비게이션 IA 변경(+2 페이지) 스코프 미언급. |
| D3 정확성 | 8/10 | Option B `agent_memories`+`observations` ✅, soul-renderer.ts extraVars ✅, argos-service.ts ✅, LPC Sprite Sheet ✅. Gap: "WebSocket 기존 14 → 15" — v2 audit에서 현재 14채널 확인 필요 (Winston 검증 대상). |
| D4 실행가능성 | 8/10 | 의존성 명시 ✅, 에셋 선행 ✅, Reflection 블로커 ⚠️ ✅. Gap 1: Layer 0 Phase 0 테마 결정이 Sprint 1 UI 개발 전에 완료되어야 함 — 순서 미명시로 재작업 리스크. Gap 2: n8n Docker — VPS에 Docker 가용 여부 미확인. |
| D5 일관성 | 9/10 | Step 01~04 전 결정 반영 ✅ (Option B, E8 경계, n8n 포트, 구현 순서). Future Redis 이월 ✅. |
| D6 리스크 | 7/10 | Reflection 비용 ⚠️ 블로커 ✅, 에셋 선행 ✅, 포트 보안 Out of Scope ✅. Gap 1: Layer 0 테마 결정 지연 → 전체 Sprint UI 재작업 리스크 미언급. Gap 2: AI 에셋 품질 리스크 없음 — Midjourney/DALL-E 픽셀 스프라이트 애니메이션 품질 보장 조건 미기재. Gap 3: Sprint 4 에셋 준비 실패 시 지연 블로커 조건 없음. |

### 가중 평균 (Sally 가중치: D1=15%, D2=20%, D3=15%, D4=15%, D5=15%, D6=20%)

| 차원 | 점수 | 가중치 | 기여 |
|------|------|--------|------|
| D1 | 9 | 15% | 1.35 |
| D2 | 8 | 20% | 1.60 |
| D3 | 8 | 15% | 1.20 |
| D4 | 8 | 15% | 1.20 |
| D5 | 9 | 15% | 1.35 |
| D6 | 7 | 20% | 1.40 |

### **가중 평균: 8.10/10 ✅ PASS (Grade A)**

---

## 이슈 목록

### Issue 1 — [D6 HIGH] Layer 0 Phase 0 테마 결정 타이밍 리스크

Sprint 구조:
```
Layer 0 병행 (전 Sprint) ← Phase 0 테마 선택 포함
Sprint 1: Big Five 슬라이더 UI
Sprint 2: n8n 관리 페이지
...
```

문제: Phase 0 테마(색상 토큰, 타이포그래피, accent color)가 확정되기 전에 Sprint 1~3에서 UI 컴포넌트를 개발하면, 테마 확정 후 전체 재작업이 발생한다. Layer 0 "병행"은 "동시에" 한다는 뜻이지 "먼저" 한다는 뜻이 아니다.

UX 원칙상 디자인 토큰은 개발 착수 전에 확정되어야 한다.

**필요한 수정:**
```
Layer 0 병행 구조에 단서 추가:
"Phase 0 테마 결정은 Sprint 1 착수 전 완료 필수
(Subframe 아키타입 선택 → 토큰 확정 → Sprint 1 시작)"
```

또는 Sprint 표에 "Layer 0 Phase 0" 단계를 Sprint 1 앞에 별도 행으로 추가.

### Issue 2 — [D2/D4 MEDIUM] Admin/CEO 앱 네비게이션 IA 변경 미언급

v3에서 추가되는 페이지:
- Admin 앱: n8n 관리 페이지 (+1), `/office` read-only 뷰 (+1)
- CEO 앱: `/office` 가상 사무실 (+1)

이 3개 페이지가 각 앱의 사이드바 어디에 배치되는가가 Scope에 없다.

Admin 앱 사이드바는 현재 27개 항목 기반으로 설계됐다. n8n과 /office가 어느 섹션(설정? 모니터링? 워크플로우?)에 들어가는지 결정되지 않으면:
- 구현자가 임의 배치 → 나중에 UX 리뷰에서 재배치 = 재작업
- Layer 0 UXUI 리셋 범위에 포함해야 하는지 불명확

**필요한 수정:** In Scope에 "사이드바 IA: Admin 앱 n8n + /office 배치 위치 결정 (Layer 0 Phase 0 포함)" 한 줄.

### Issue 3 — [D6 LOW] AI 에셋 생성 품질 리스크 미언급

L414: "에셋: LPC Sprite Sheet(오픈소스) + AI 직접 생성 (Midjourney/DALL-E 또는 최신 AI 스프라이트 도구 — Stage 1 Technical Research에서 조사)"

"Stage 1 Technical Research에서 조사"는 적절하다. 하지만 연구 결과 품질 기준 불충족 시 리스크가 없다:
- AI 생성 픽셀 스프라이트가 5-state 애니메이션(idle/working/speaking/tool_calling/error)을 충족하지 못하면 Sprint 4 지연
- 리스크 표현 없음 → 구현자가 에셋 문제를 늦게 발견할 수 있음

**필요한 수정(가볍게):** Out of Scope 표 또는 Layer 1에 "⚠️ 에셋 품질 리스크: Stage 1 Research 결과 AI 생성 불충분 시 LPC 확장 또는 전문 픽셀 아티스트 의뢰 — Sprint 4 착수 전 확정 필수" 한 줄.

---

## Analyst 사전 요청 항목 확인

**Grade A 단계 엄격 검토:**

이 섹션은 모든 이전 Step의 결정을 정확하게 통합했다. Option B, E8 경계, soul-renderer 패턴, n8n 보안, Go/No-Go 7개 게이트 — Brief 수준에서 기대되는 구체성을 충족한다.

8.10/10 Grade A PASS. 주요 이슈는 UX 실행 타이밍(Layer 0 테마 선행)과 IA 변경 누락 2개다. 수치적으로 Grade A 기준(8.0+)을 통과하지만, Issue 1(테마 타이밍)은 HIGH — 실제 Sprint에서 재작업으로 이어질 수 있는 리스크다.

---

## Cross-talk 요약

- **Winston**: D3 — WebSocket 14→15 카운트 검증. Docker on VPS 가용 여부 확인.
- **John**: D4/D6 — Phase 0 테마 타이밍이 Sprint 1 착수 조건인지 PM 관점 확인.
- **Bob**: D2 — Admin 앱 사이드바 IA 변경이 Sprint story에 포함되어야 하는지 SM 관점.

### Winston Cross-talk 결과 (2026-03-20)

**D3 이슈 양쪽 해소:**
- ① WebSocket 카운트: `ws/channels.ts` switch문 직접 확인 — 14개 ✅ (chat-stream, agent-status, notifications, messenger, conversation, activity-log, strategy-notes, night-job, nexus, debate, cost, command, delegation, tool). v3 +1 → 15 정확.
- ② Docker on VPS: `docker --version` 확인 — Docker 28.2.2 설치됨 ✅. n8n Docker 배포 유효.
- D3 점수 8 유지 (두 이슈 모두 Brief 내용이 정확했음으로 확인됨)

### Bob Cross-talk 결과 (2026-03-20)

**Issue 2 IA 타이밍 분리 확정:**
- Layer 0 병행 중 IA 결정(설계): n8n 배치 → Sprint 2 전, /office 배치 → Sprint 4 전
- 구현(사이드바 컴포넌트 수정)은 각 해당 기능 Sprint에서
- Layer 0 스코프에 "IA 결정 작업 포함" 명시가 Brief Fix에 필요 — analyst에게 보완 전달 완료.

---

## [Verified] Round 1 — 2026-03-20

**파일 직접 확인:**
- ✅ Issue 1: L376 Pre-Sprint 행 + L378 Sprint 1 의존성 "Phase 0 테마 확정 선행 필수"
- ✅ Bonus: L377 Layer 0 중간 게이팅 "Sprint 2 종료까지 ≥60% 미달 시 레드라인 검토"
- ✅ Issue 2: L390 신규 페이지 사이드바 IA 3개 + 해당 Sprint 착수 전 완료
- ✅ Issue 3: L419 에셋 품질 리스크 ⚠️ + L447 Go/No-Go #8
- ✅ Bonus: L407 `memory-reflection.ts` 신규 분리 (race condition 방지) — D4 개선

**Round 1 점수 재산정:**

| 차원 | 초기 | Verified | 근거 |
|------|------|---------|------|
| D1 | 9 | 9 | 유지 — Pre-Sprint 행으로 타임라인 구체성 ↑ |
| D2 | 8 | 9 | 사이드바 IA 3개 페이지 명시 — Layer 0 스코프 완성 |
| D3 | 8 | 9 | Winston 코드 검증: WS 14채널 ✅, Docker 28.2.2 ✅ — Brief 내용 정확 확인 |
| D4 | 8 | 9 | Pre-Sprint 선행 조건 + memory-reflection.ts 분리 + 에셋 Go/No-Go 선행 |
| D5 | 9 | 9 | 유지 |
| D6 | 7 | 9 | Pre-Sprint 재작업 리스크 명시 + Layer 0 60% 중간 게이팅 + Go/No-Go #8 |

| 차원 | 점수 | 가중치 | 기여 |
|------|------|--------|------|
| D1 | 9 | 15% | 1.35 |
| D2 | 9 | 20% | 1.80 |
| D3 | 9 | 15% | 1.35 |
| D4 | 9 | 15% | 1.35 |
| D5 | 9 | 15% | 1.35 |
| D6 | 9 | 20% | 1.80 |

### **최종: 9.00/10 ✅ PASS (Grade A)**

(초기 8.10 → 9.00 — 3개 이슈 + bonus 2개 수정으로 전면 상향)

---

## [Verified] Round 2 — Cross-talk fix (2026-03-20)

**Go/No-Go #2 추가 수정 확인:**
- L441: "extraVars 키 존재 여부 + 빈 문자열 여부 검증 포함 (빈 문자열 주입 = FAIL)" ✅
- 이전 "성공률 100%"에서 "실제 주입 값 검증"으로 강화 — false positive 방지

**점수 영향:** D1 구체성 9 유지 (이미 최상). 최종 9.00/10 유지.

### **최종 확정: 9.00/10 ✅ PASS (Grade A)** (Round 2 포함)
