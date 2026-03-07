# Party Mode Round 2 - Adversarial Lens
## UX Design Step 05: Inspiration / Design References

**Date:** 2026-03-07
**Reviewer:** Worker (self-review)
**Section reviewed:** Inspiration / Design References (lines 1207-1394, post-R1 fixes)

---

### Expert Panel Discussion (Adversarial)

**Mary (BA):** 패턴을 분석해보니 흥미로운 누락이 보입니다. v1-feature-spec에서 **SNS 통신국(8번)**은 Selenium 기반 자동 발행, 카드뉴스 시리즈, 승인/반려 플로우가 핵심인데, Competitive UX 분석에서 **SNS 관리 도구 영감**(Hootsuite, Buffer, Later 등)이 전혀 언급되지 않았어요. SNS 발행 워크플로우의 UX 영감이 빠져 있습니다.

**John (PM):** Mary가 발견한 건 실제로 중요합니다. SNS 통신국은 v1의 핵심 기능 중 하나인데, 어디서 디자인 영감을 가져올지에 대한 가이드가 없으면 구현자가 방향을 잡기 어렵습니다. 이건 추가해야 합니다.

**Sally (UX Designer):** 저는 다른 관점에서 보겠어요. "Visual Style" 섹션의 무드보드가 텍스트 설명으로만 되어 있는데, 이건 의도적인 건가요? 무드보드라는 이름이지만 실제로는 색상 hex 코드 + 텍스트 설명이에요. 하지만 이건 step-04 Visual Design Language에서 이미 정의한 색상 체계를 다시 설명하는 건 아닌가요?

**Winston (Architect):** Sally 말이 맞아요. step-04의 Visual Design Language와 step-05의 Visual Style 무드보드 사이에 **중복**이 있습니다. 하지만 step-05의 관점은 "영감 소스로서의 시각 스타일"이므로, 중복이라기보다 다른 앵글에서의 보강이라고 볼 수 있어요. 다만 step-04와의 관계를 명시하는 것이 좋겠습니다.

**Amelia (Dev):** 기술적으로 하나 지적하면, UI Pattern Libraries에서 **상태 관리 라이브러리**(Zustand, TanStack Query 등)는 언급이 없네요. 하지만 이건 UX 설계 문서의 범위를 벗어나므로 architecture 문서에서 다루면 됩니다. step-05 범위 내에서는 문제없어요.

**Quinn (QA):** v1-feature-spec 체크리스트 재검증: 사령관실(O), 에이전트 조직(O), 도구 시스템(O), LLM(O), AGORA(간접-토론 엔진 별도 UI 영감 없음), 전략실(Bloomberg-O), SketchVibe(Figma/Cytoscape-O), SNS(누락!), 품질 게이트(CI/CD-O), 메모리(간접), 비용(AWS-O), 텔레그램(R1에서 추가-O), 크론(Zapier-O), ARGOS(간접). AGORA 토론 엔진 UI의 영감 소스도 약하지만, 이건 사소한 수준이에요.

### Issues Found

| # | 심각도 | 이슈 | 발견자 |
|---|--------|------|--------|
| 1 | 보통 | SNS 관리 도구(Hootsuite, Buffer 등) 디자인 영감 누락 -- v1-feature-spec 8번(SNS 통신국) 커버 부족 | Mary, John |

### Fixes Applied

1. **SNS 관리 도구 영감 추가**: Competitive Product UX Patterns의 인접 경쟁 제품 테이블에 SNS 관리 도구(Hootsuite/Buffer) 행 추가

### Round 2 Score: 8/10 -- PASS
