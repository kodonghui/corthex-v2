# Critic-C Review — Step 01: Init (Product Brief Frontmatter)

**Reviewer:** John (PM) — Critic-C (Product + Delivery)
**Date:** 2026-03-20
**File reviewed:** `_bmad-output/planning-artifacts/product-brief-corthex-v3-2026-03-20.md` (lines 1–22)

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 7/10 | 파일 경로 전부 정확히 명시, 날짜·작성자 구체적. 단, version 필드 없음. comment block이 steps 2–4만 나열 (전체 파이프라인 스텝 수 미기재). |
| D2 완전성 | 6/10 | 8개 inputDocuments 나열됨. 그러나 `critic-rubric.md`는 채점 메타도구이지 기획 입력물이 아님 — 기획 컨텐츠 생성에 불필요한 노이즈. comment block에 전체 planned steps 수 미기재 (2–4만 보임). |
| D3 정확성 | 9/10 | 8개 파일 전부 실제 존재 확인 완료. 날짜 오늘(2026-03-20) 일치. 작성자 형식 정확. |
| D4 실행가능성 | 7/10 | 후속 스텝 진행을 위한 파일 경로 기반은 명확. 단, 총 스텝 수(stepsPlanned)가 없어 Analyst가 진행 상황을 추적하기 어려움. |
| D5 일관성 | 8/10 | "CORTHEX v3 'OpenClaw'" 명칭이 v3-openclaw-planning-brief.md와 일치. 날짜 형식 이전 브리프와 동일. 컨벤션 준수. |
| D6 리스크 | 5/10 | **[주요 리스크]** `critic-rubric.md`를 inputDocument로 포함 시, LLM이 채점 기준(구체성, 실행가능성 등)을 product requirement로 혼동할 위험. 또한 8개 문서 중 충돌 발생 시 우선순위 명시 없음 (prd.md vs v3-openclaw-planning-brief.md 범위 불일치 가능). |

---

## 가중 평균 계산

| 차원 | 점수 | 가중치 | 기여 |
|------|------|--------|------|
| D1 구체성 | 7 | 20% | 1.40 |
| D2 완전성 | 6 | 20% | 1.20 |
| D3 정확성 | 9 | 15% | 1.35 |
| D4 실행가능성 | 7 | 15% | 1.05 |
| D5 일관성 | 8 | 10% | 0.80 |
| D6 리스크 | 5 | 20% | 1.00 |

### **가중 평균: 6.8/10 ❌ FAIL (7.0 미달)**

---

## 이슈 목록

### Issue #1 [D2 완전성 + D6 리스크] — `critic-rubric.md` inputDocument 부적합 ⚠️ HIGH
`critic-rubric.md`는 **이 문서를 채점하는 메타도구**다. 이걸 inputDocument로 등록하면 Step 2~6에서 컨텐츠를 생성할 때 LLM이 "D1 구체성 = 구체적 수치 필요"를 product requirement로 해석할 수 있음. 기획 입력물이 아니므로 제거해야 함. 대신 `v3-openclaw-planning-brief.md`가 이미 있으므로 커버리지 손실 없음.

**수정안:** `critic-rubric.md` 라인 삭제 → inputDocuments 7개로 축소.

### Issue #2 [D2 완전성 + D4 실행가능성] — 전체 stepsPlanned 미기재 ⚠️ MEDIUM
comment block이 steps 2–4만 나열. 파이프라인이 몇 스텝인지 frontmatter에 없음. Analyst/다른 Critic이 진행률을 알 수 없음. 예: `stepsPlanned: [1,2,3,4,5,6]` 또는 유사 필드.

**수정안:** frontmatter에 `stepsPlanned: [1, 2, 3, 4, 5, 6]` (또는 실제 총 스텝 수) 추가. comment block에 모든 pending steps 나열.

### Issue #3 [D6 리스크] — 입력 문서 충돌 시 우선순위 없음 ⚠️ MEDIUM
8개 문서 중 v3-openclaw-planning-brief.md(신규 방향)와 prd.md(v2 기준)는 범위가 다를 수 있음. 어느 문서가 우선인지 명시 없으면 후속 스텝에서 분기 발생 리스크.

**수정안:** frontmatter에 `documentPriority: [v3-openclaw-planning-brief, v3-corthex-v2-audit, prd, ...]` 순서 명시, 또는 주석으로 우선순위 기재.

---

## Cross-talk 요약

- Sally(UX)가 지적할 수 있는 사용자 페르소나 미비는 Step 3(Users)에서 다룰 예정이므로 Init 단계에서는 해당 없음.
- Winston/Bob이 아키텍처 일관성 지적 시, `architecture.md`가 inputDocuments에 포함되어 있으므로 D3 정확성은 충분히 방어 가능.
- 핵심 블로커는 Issue #1 (critic-rubric.md 제거) — 이게 수정되지 않으면 이후 모든 스텝의 컨텐츠 품질에 영향.
