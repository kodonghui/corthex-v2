# UX Step 07 - Defining Experience: Round 1 (Collaborative)

**Date:** 2026-03-07
**Lens:** Collaborative -- 전문가들이 협력적으로 이슈를 발견
**File Reviewed:** `_bmad-output/planning-artifacts/ux-design-specification.md` (step-07 section, lines 1991-2283)

## Expert Panel Review

### John (PM): "WHY를 끝까지 추적한다"

**강점:**
- 5개 SM(Signature Moments)이 제품 정체성을 잘 압축한다. 특히 SM1(위임 체인)이 핵심 가치를 명확히 전달.
- Aha! Moments가 시간순(첫 사용 5분 -> 첫 주 -> 첫 달 -> 숙련)으로 잘 구성됨.

**Issue #1 (Medium):** SM5 "시스템이 나 대신 깨어 있다"는 Phase 2 기능(크론+텔레그램)에 의존한다. Phase 1에서는 이 시그니처 순간을 경험할 수 없다. Phase별 시그니처 순간 가용성 매트릭스가 필요하다.

### Winston (Architect): 차분하고 실용적

**강점:**
- v1->v2 진화 표가 매우 명확하다. 보존/진화를 구분하여 구현 시 혼란이 없을 것.

**Issue #2 (Medium):** Experience Pillars에서 DP3과 DP4가 뒤바뀌어 있다. step-04에서 DP3은 "안전한 변경(Safe Mutation)"이고, DP4는 "점진적 복잡성(Progressive Complexity)"이다. 그런데 Pillar 3에서 "DP3(점진적 복잡도), DP4(감정적 안전망)"으로 표기되어 있다 -- 이는 번호 참조 오류다.

### Sally (UX): 감정에 집중

**강점:**
- 감정 변화를 7단계로 세밀하게 설계한 SM1 테이블이 훌륭하다.
- "대화 체계 vs 명령-보고 체계" 비교표가 차별화를 직관적으로 전달한다.

동의: Issue #1, #2 모두 수정 필요.

### Amelia (Dev): 파일 경로 중심으로 간결히

코드 구현 관점에서 누락은 없음. step-04 감정 목표와 step-06 디자인 시스템이 잘 참조됨.

### Quinn (QA): 커버리지 확인

v1-feature-spec 22개 기능 영역 중 step-07에서 명시적으로 언급되지 않는 기능: SNS 통신국, 정보국(RAG), 에이전트 메모리. 하지만 이들은 Phase 2이고 "경험 기둥"에서 간접 커버되므로 사소한 이슈.

## Issues Found: 2

| # | Severity | Issue | Resolution |
|---|----------|-------|------------|
| 1 | Medium | SM5가 Phase 2 전용인데 Phase 1 시그니처 순간 가용성 미명시 | Phase별 SM 가용성 매트릭스 추가 |
| 2 | Medium | Pillar 3의 DP 번호 참조 오류 (DP3/DP4 뒤바뀜) | step-04 정의 기준으로 번호 수정 |

## Resolution Applied

**Issue #1:** Signature Moments 섹션 후에 "Phase별 SM 가용성" 표 추가
**Issue #2:** Pillar 3의 DP 참조를 "DP3(안전한 변경), DP4(점진적 복잡성)"으로 수정

---
Score: 8/10
Status: Issues found, fixing and proceeding to Round 2
