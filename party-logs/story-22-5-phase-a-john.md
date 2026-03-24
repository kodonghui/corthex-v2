# Critic-C Review — Story 22.5: CI Dependency Scanning & Quality Baselines

**Reviewer:** John (Product Manager)
**Date:** 2026-03-24
**Spec:** `_bmad-output/implementation-artifacts/stories/22-5-ci-dependency-scanning-quality-baselines.md`
**Round:** Re-review (Round 2) — 3 fixes verified

---

## NFR Coverage Verification

| NFR | 요구사항 | 스펙 커버리지 | 상태 |
|-----|---------|-------------|------|
| NFR-S14 | bun audit in CI, Critical/High = build failure, Dependabot PR alerts | AC-1 (bun audit + allowlist + annotations) + AC-2 (Dependabot weekly) | ✅ |
| NFR-O4 | 10 prompts A/B blind, quality-baseline.md | AC-3 (10 prompts, 10 domains, A/B methodology, API endpoints) | ✅ |
| NFR-O5 | 10 routing scenarios, routing-scenarios.md, 8/10+ pass | AC-4 (10 scenarios, all NFR-O5 categories covered, scoring rubric) | ✅ |

## Fix Verification

| 이슈 | 원래 | 수정 | 상태 |
|------|------|------|------|
| HIGH: concurrent 시나리오 누락 | Korean/English 2개 분리, concurrent 제외 | #7 Bilingual 합침, #10 Concurrent 추가 | ✅ |
| MEDIUM: API 엔드포인트 미명시 | 도메인 설명만 있음 | 10개 프롬프트 모두 구체적 API 경로 포함 | ✅ |
| MEDIUM: Hono 취약점 대응 시점 | Dev Notes에만 언급 | Task 1.5 hono update + Dev Notes remediation path 명시 | ✅ |

## 차원별 점수 (Round 2)

| 차원 | R1 점수 | R2 점수 | 근거 |
|------|---------|---------|------|
| D1 구체성 | 8/10 | 9/10 | 10개 프롬프트 전부 API 엔드포인트 명시. Audit 스크립트 grep 패턴 + allowlist 구체적. GHSA ID 5개 나열. |
| D2 완전성 | 7/10 | 9/10 | NFR-O5 10/10 카테고리 100% 커버. Concurrent 추가로 완전. Allowlist + hono update + annotations 모두 포함. |
| D3 정확성 | 8/10 | 8/10 | bun audit 동작(exit 1 on any), grep 패턴 정확. Allowlist의 grep -vFf 접근 올바름. |
| D4 실행가능성 | 8/10 | 8/10 | Task 구조 명확. Audit 스크립트 복붙 수준. Dependabot YAML 파일 하나. Baseline 문서 구조 제시됨. |
| D5 일관성 | 9/10 | 9/10 | 파일 경로 `_bmad-output/test-artifacts/` NFR 명세와 일치. CI 워크플로 삽입 위치 명확. |
| D6 리스크 | 8/10 | 9/10 | Allowlist로 transitive 취약점 대응. Hono update 순서(before CI enable) 명시. Quarterly review 주기 설정. |

## 가중 평균: 8.70/10 ✅ PASS

> D1(9×0.20) + D2(9×0.20) + D3(8×0.15) + D4(8×0.15) + D5(9×0.10) + D6(9×0.20) = 1.80 + 1.80 + 1.20 + 1.20 + 0.90 + 1.80 = **8.70**

---

## 이슈 목록

### RESOLVED (Round 1 → Round 2)

1. ~~**[D2 완전성] NFR-O5 "concurrent" 시나리오 누락**~~ → ✅ #10 Concurrent 추가, #7 Bilingual 합침
2. ~~**[D1 구체성] Quality baseline 프롬프트에 API 엔드포인트 미명시**~~ → ✅ 10개 전부 API 경로 포함
3. ~~**[D6 리스크] Hono 취약점 대응 시점**~~ → ✅ Task 1.5 명시 + Dev Notes remediation path

### REMAINING (LOW — non-blocking)

4. **[D1 구체성] Concurrent scenario #10 구체성 부족**
   - "Two simultaneous requests to different depts → Both routed correctly without interference"
   - 다른 9개 시나리오는 구체적 한국어 입력이 있지만 #10은 설명만 존재
   - 구현 시 dev가 구체적 입력 예시를 만들어야 함 (예: "개발팀 코드 리뷰 + 마케팅팀 주간 보고서")
   - 영향: 낮음 — dev가 자연스럽게 구체화할 수 있는 수준

---

## Cross-talk 대응

### Quinn (6.20 FAIL) — 버전 불일치 확인

Quinn의 3대 이슈(allowlist 없음, hono update 없음, annotations 없음)는 **현재 스펙에 이미 존재**:
- Task 1.3: `.github/audit-allowlist.txt` + 5개 GHSA ID
- Task 1.4: `grep -vFf .github/audit-allowlist.txt` + `::error::` annotations
- Task 1.5: hono >=4.12.4 update

Quinn은 수정 전 버전을 리뷰한 것으로 판단. 현재 스펙 재확인 요청함.

### Winston (7.45 PASS with fixes) — 동일 버전 불일치

Winston의 "CI permanently red" + "Task 1.3 claims --level high" 이슈도 현재 스펙에 해당 없음:
- Task 1.3은 allowlist 생성이지 `--level high` 주장이 아님
- Allowlist + grep 필터로 CI red 방지됨

### Quinn의 edge case 질문에 대한 답변:
1. **allowlist 파일 없으면?**: Task 1.4 스크립트에 `grep -vFf .github/audit-allowlist.txt || true` — 파일이 반드시 있음 (Task 1.3에서 생성). 하지만 `[ -f ]` 가드 추가하면 더 안전. LOW 수준 개선 제안.
2. **Advisory URL vs package name**: 현재 스펙은 GHSA advisory ID 사용 — 안정적이고 고유. 올바른 선택.
3. **Quarterly review 누가 강제?**: Task 1.3 코멘트 헤더에 `# Reviewed: 2026-03-24. Next review: 2026-06-24` 포함. 프로세스 강제는 별도 운영 이슈 — 스펙 범위 밖.

---

## 제품 관점 평가

### CI Integration (NFR-S14): 완성도 높음
- Allowlist 접근법이 pragmatic — fast-xml-parser transitive 취약점을 수용하면서도 새로운 critical/high는 차단
- hono update를 Phase B 전에 실행하도록 순서 명시 — 첫 CI 실행에서 불필요한 실패 방지
- Dependabot weekly Monday — 운영 부담 적절

### Quality Baseline (NFR-O4): 우수
- 10개 프롬프트가 핵심 사용자 상호작용 전부 커버
- API 엔드포인트 명시로 재현성 확보
- A/B 블라인드 비교 방법론 Sprint 1+ 연동 구조

### Routing Scenarios (NFR-O5): 100% 충족
- 10/10 NFR-O5 카테고리 전부 커버 (concurrent 포함)
- 스코링 루브릭 명확 (binary + 0.5 for clarification)
- 8/10+ pass threshold 명시

---

## 판정

**✅ PASS (8.70/10)** — Round 1 HIGH 1건 + MEDIUM 2건 전부 해결. NFR-S14/O4/O5 완전 충족. Concurrent scenario 구체성만 LOW 잔여. 구현 진행 가능.
