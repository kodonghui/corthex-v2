# Critic-C Review — Stage 0 Init (Product Brief Frontmatter)

**Reviewer:** John (PM) — Critic-C (Product + Delivery)
**Date:** 2026-03-20
**File reviewed:** `_bmad-output/planning-artifacts/product-brief-corthex-v3-2026-03-20.md` (full file, lines 1–25)

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 7/10 | 파일 경로 8개 전부 정확히 명시. 날짜(2026-03-20), 작성자(CEO + Mary) 구체적. 단, `version` 필드 없고 총 스텝 수가 frontmatter에 없음 (comment block에만 암시됨). |
| D2 완전성 | 7/10 | comment block에 steps 1–6 전부 나열 ✓. 단, `critic-rubric.md`가 inputDocuments에 포함 — 채점 메타도구이지 기획 입력물이 아님. `stepsPlanned` frontmatter 필드 없음. |
| D3 정확성 | 7/10 | 8개 파일 전부 실제 존재 확인(Glob 검증). 날짜 오늘(2026-03-20) 일치. 단, Winston 크로스톡으로 확인: `prd.md`가 자체 리뷰에서 4.8/10 FAIL 판정. 파일 존재 ≠ 내용 신뢰. 깨진 prd.md가 inputDocument로 등록된 것 자체가 D3 감점 요인. |
| D4 실행가능성 | 7/10 | 후속 스텝 진행을 위한 파일 경로 기반 명확. comment block이 6개 스텝 로드맵 제공. 단, `stepsPlanned` 필드 없어 자동화 파싱 어려움. |
| D5 일관성 | 8/10 | "CORTHEX v3 'OpenClaw'" 명칭이 `v3-openclaw-planning-brief.md`와 일치. 날짜 형식 이전 브리프 패턴(product-brief-corthex-v2-2026-03-20.md 등)과 동일. |
| D6 리스크 | 5/10 | `critic-rubric.md`가 inputDocument로 포함됨 — LLM이 Step 2~5 컨텐츠 생성 시 D1~D6 채점 기준을 product requirement로 혼동 가능. `prd.md` 품질 자체가 4.8/10 FAIL(Winston 확인) — 신뢰 불가 문서를 authority source로 등록한 미인지 리스크. 8개 문서 간 충돌 우선순위 없음. |

---

## 가중 평균 계산

| 차원 | 점수 | 가중치 | 기여 |
|------|------|--------|------|
| D1 구체성 | 7 | 20% | 1.40 |
| D2 완전성 | 7 | 20% | 1.40 |
| D3 정확성 | 7 | 15% | 1.05 |
| D4 실행가능성 | 7 | 15% | 1.05 |
| D5 일관성 | 8 | 10% | 0.80 |
| D6 리스크 | 5 | 20% | 1.00 |

### **가중 평균: 6.7/10 ❌ FAIL**

> ⚠️ 점수 수정 (크로스톡 반영): Winston이 `prd.md` 4.8/10 FAIL 확인 → D3 9→7, D6 6→5 하향. 7.2 PASS → 6.7 FAIL 변경.

---

## 이슈 목록

### Issue #1 [D2 완전성 + D6 리스크] — `critic-rubric.md` inputDocument 부적합 ⚠️ HIGH

`critic-rubric.md`는 **이 문서를 채점하는 메타도구**다. 이를 inputDocuments에 등록하면:
- Step 2 (Vision) 생성 시 LLM이 "D1 구체성 = 구체적 수치 필요"를 vision requirement로 해석 가능
- Step 4 (Metrics) 생성 시 D6 리스크 기준을 success metric으로 혼용 가능

기획 입력물 역할을 하지 않음. `v3-openclaw-planning-brief.md`가 이미 포함되어 있으므로 제거해도 정보 손실 없음.

**수정안:** `critic-rubric.md` 라인 제거 → inputDocuments 7개로 축소.

### Issue #2 [D6 리스크] — 입력 문서 충돌 시 우선순위 없음 ⚠️ MEDIUM

8개 inputDocuments 중:
- `v3-openclaw-planning-brief.md` → v3 신규 방향 (OpenClaw 가상 사무실, n8n, Big Five 성격)
- `prd.md` → v2 기준 PRD (기존 기능 정의)

두 문서가 동일 기능에 대해 다른 방향을 제시할 경우 어느 쪽을 따르는지 명시 없음. 특히 Step 5 (Scope) 작성 시 충돌 발생 가능.

**수정안:** frontmatter에 `documentPriority` 필드 추가 또는 주석으로 "v3-openclaw-planning-brief > prd (v3 direction takes precedence)" 명시.

---

## Cross-talk 요약

- Sally(UX)의 관점: UX design spec이 inputDocuments에 없음. 단, Step 3(Users)에서 페르소나를 다루므로 Init 단계 블로커는 아님. Init 완료 후 UX 리뷰 범위는 Step 3에서 확인 권장.
- Winston/Bob의 관점: `architecture.md`와 `v1-feature-spec.md` 포함 확인됨 — 아키텍처 일관성 검토를 위한 기반은 충분.
- 핵심 권고: **Issue #1 수정(critic-rubric.md 제거)이 이후 모든 스텝의 컨텐츠 순도를 보호하는 최우선 조치.**
