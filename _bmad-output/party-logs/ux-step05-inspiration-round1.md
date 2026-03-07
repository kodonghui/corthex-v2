# Party Mode Round 1 - Collaborative Lens
## UX Design Step 05: Inspiration / Design References

**Date:** 2026-03-07
**Reviewer:** Worker (self-review)
**Section reviewed:** Inspiration / Design References (lines 1207-1384)

---

### Expert Panel Discussion

**Sally (UX Designer):** 이 섹션은 전반적으로 잘 구성되어 있어요. 특히 "차용하지 않는 것" 열이 있는 핵심 참조 제품 매트릭스가 훌륭합니다 -- 무엇을 가져오고 무엇을 배제하는지 명확하게 보여줘요. 하지만 한 가지 놓친 것이 있습니다: **텔레그램 봇 UX 영감**이 빠져 있어요. v1-feature-spec 18번(텔레그램 지휘)에서 모바일 명령, @멘션, 부서별 보고서 수신이 있는데, 텔레그램 봇 인터페이스의 디자인 영감 소스가 전혀 언급되지 않았어요.

**John (PM):** Sally 말이 맞아요. 그리고 WHY를 따지면, 이사장 페르소나(이사장)가 매일 아침 5시에 텔레그램으로 결과를 받는 시나리오가 있잖아요. 텔레그램 봇 UX는 CORTHEX의 중요한 채널인데, 디자인 레퍼런스에서 완전히 빠져 있어요. 이건 수정해야 합니다.

**Winston (Architect):** 기술 관점에서 UI Pattern Libraries 섹션을 보면, `react-beautiful-dnd`가 언급되었는데, 이 라이브러리는 2024년에 deprecated되었습니다. 이미 `dnd-kit`도 함께 언급하고 있으니 `react-beautiful-dnd`를 제거하거나 `dnd-kit`만 권장하는 것이 맞습니다.

**Sally:** Winston, 좋은 지적이에요. deprecated 라이브러리를 레퍼런스로 넣으면 구현 시 혼란을 줄 수 있어요.

**Amelia (Dev):** 동의합니다. `dnd-kit`만 남기는 게 맞아요. 그리고 Anti-Patterns 섹션에서 step-03, step-04를 참조하는 부분이 좋습니다 -- 이전 스텝과의 교차 참조가 명확해요.

**Quinn (QA):** 전체적으로 커버리지가 좋습니다. v1-feature-spec 체크리스트와 대조하면: 사령관실(1번), 에이전트 조직(2번), 도구 시스템(3번), LLM(4번), AGORA(간접), 전략실(Bloomberg 영감), SketchVibe(Figma/Cytoscape), 품질 게이트(CI/CD), 비용 관리(AWS), 텔레그램(누락!) -- 텔레그램만 빼고 다 커버되었네요.

### Issues Found

| # | 심각도 | 이슈 | 발견자 |
|---|--------|------|--------|
| 1 | 중요 | 텔레그램 봇 UX 디자인 영감 소스 누락 -- v1-feature-spec 18번(텔레그램 지휘) 커버 안 됨 | Sally, John |
| 2 | 보통 | `react-beautiful-dnd` deprecated 라이브러리 참조 -- `dnd-kit`만 남겨야 함 | Winston |

### Fixes Applied

1. **텔레그램 봇 UX 영감 추가**: 핵심 참조 제품 매트릭스에 Telegram Bot API 행 추가 + Industry Best Practices에 모바일/메시징 봇 패턴 추가
2. **deprecated 라이브러리 제거**: `react-beautiful-dnd / dnd-kit` -> `dnd-kit` 단독으로 변경

### Round 1 Score: 8/10 -- PASS
