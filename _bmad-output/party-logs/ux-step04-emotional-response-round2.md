## [Party Mode Round 2 -- Adversarial Review] UX Step-04 Emotional Response & Design Language

### R1 Fix Verification

| R1 Issue | Fix Applied | Genuine? | Verdict |
|----------|------------|----------|---------|
| Human 직원 감정 목표 누락 | 능숙함/안전감/소속감 3가지 감정 목표 테이블 추가 (lines 940-946) | Yes -- step-03 Human 직원 UX 패턴과 일관된 감정 설계 | PASS |
| 관리자 콘솔 에러 메시지 누락 | 5개 에러 상태 추가 (API 키 실패, 에이전트 생성 실패, 직원 초대 실패, 부서명 중복, 시스템 에이전트 삭제) | Yes -- 관리자 콘솔 핵심 에러 시나리오 커버 | PASS |
| 다크 모드 미정의 | Phase 2로 명시 + CSS Custom Properties 변수화 원칙 추가 | Yes -- Phase 배정 + 기술 전략 명시 | PASS |
| 품질 게이트 2회 실패 옵션 불명확 | "FAIL 표시와 함께 결과 열람 (품질 우회 아님)" 명확화 | Yes -- 사용자 오해 방지 | PASS |
| Trust-Building Phase 배정 누락 | 비용 비교: P1 단순 평균 + Phase 2 학습 기반. 에이전트 역량: P1 카운터 + Phase 2 만족도 | Yes -- Phase별 구분 명확 | PASS |

### Agent Discussion (Adversarial Lens)

**John (PM) -- "이 감정 설계가 PRD Aha! 순간과 정합하는가?":**
PRD에서 4개 Aha! 순간을 정의했다: (1) 병렬 작업 -> "진짜 팀이 일한다", (2) 부서 생성 -> "조직을 내가 만든다", (3) 품질 게이트 -> "AI가 품질도 관리", (4) 비용 절감 -> "기업 운영이지". 이 4개 Aha!가 감정 목표와 매핑된다: (1) 성취감, (2) 자부심, (3) 안심, (4) 안심. 하지만 **Aha! 순간과 Microinteraction의 직접적 연결이 명시되지 않았다**. "보고서 도착 Delight"가 Aha! #1에 해당하지만 문서에서 이 연결을 명시하지 않았다. 추적성을 위해 매핑을 추가해야 한다.

**Sally (UX Designer) -- "감정 언어가 과도하지 않은가?":**
감정 목표 테이블이 CEO 5개, Admin 4개, 투자자 3개, Human 직원 3개로 총 15개다. 이 15개 감정 목표가 **실제 구현에서 어떻게 측정되는가?** "권위감"을 느끼는지 어떻게 확인하나? 감정 목표는 디자인 방향이지 측정 지표가 아니라는 점을 인정하되, **각 감정 목표에 대한 "이 감정이 실패하면 어떤 UX 문제가 발생하는가?"**를 추가하면 더 실용적이다. 현재는 성공 경로만 정의되어 있다.

**Winston (Architect) -- "색상 체계가 Tailwind CSS 팔레트와 호환되는가?":**
색상 Hex 값들이 Tailwind CSS의 기본 팔레트와 **정확히 일치**한다: #22C55E = green-500, #3B82F6 = blue-500, #EF4444 = red-500, #EAB308 = yellow-500, #8B5CF6 = violet-500, #F97316 = orange-500, #64748B = slate-500, #1E293B = slate-800, #F8FAFC = slate-50, #F1F5F9 = slate-100. 이건 좋은 선택이다 -- Tailwind와 1:1 매핑되어 구현이 용이하다. **Accent 색상 #4F46E5만 indigo-600**으로, Tailwind에서는 indigo-500(#6366F1) 대신 indigo-600을 사용한 것이다. 이 차이가 의도적인지 확인 필요.

**Amelia (Dev) -- "Pretendard 폰트 선택의 라이선스/성능은?":**
Pretendard는 SIL Open Font License(무료)이고 한/영 혼용에 최적화되어 있다. 하지만 **웹 폰트 로딩 전략**이 정의되지 않았다. Pretendard 전체 용량은 ~20MB로, 서브셋이 필수다. `font-display: swap`으로 FOUT 방지, 또는 시스템 폰트 우선 + Pretendard lazy load. 또한 **JetBrains Mono**도 웹 폰트로 로딩해야 하는데, 통신로그에서만 사용되므로 해당 화면 진입 시 lazy load가 적절하다.

**Quinn (QA) -- "에러 메시지의 접근성은?":**
에러 심각도 4단계가 **색상으로만 구분**된다 (경미=무색, 보통=노랑, 심각=빨강, 치명적=빨강). 색맹 사용자를 위해 **아이콘 + 텍스트 레이블**로도 구분해야 한다. 에이전트 상태 아이콘에는 이미 "색상 + 아이콘 이중 구분"을 정의했으면서 에러에는 적용하지 않았다. 또한 에러 메시지에 **ARIA 역할**이 정의되지 않았다 (`role="alert"` 또는 `role="status"`).

**Mary (BA) -- "군사 은유가 모든 페르소나에 적합한가?":**
군사 은유(사령관실, 작전현황, 통신로그)는 김대표에게는 "권위감"을 주지만, **박과장에게는 과도**할 수 있다. 박과장의 멘탈 모델은 "IT 관리 대시보드"인데, 관리자 콘솔의 메뉴는 "조직도, 부서 관리, 에이전트 관리, 직원 관리, 도구 관리"로 군사 은유가 없다. 이건 **의도적으로 좋은 설계**다 -- CEO 앱은 군사 은유, 관리자 콘솔은 관리 도구 톤. 이 의도적 분리를 명시해야 한다.

### Issues Found

| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|------------|
| 1 | Minor | John | 감정 목표와 PRD Aha! 순간의 매핑이 명시되지 않음 | Design Language Summary에 Aha!-감정-Microinteraction 매핑 추가 |
| 2 | Minor | Quinn | 에러 심각도가 색상으로만 구분 -- 색맹 접근성 미고려 | 에러 심각도별 아이콘 추가 (경미: ○, 보통: △, 심각: ✗, 치명적: ⊘) |
| 3 | Minor | Mary | CEO 앱 군사 은유 vs 관리자 콘솔 관리 도구 톤의 의도적 분리가 명시되지 않음 | 톤 차이 테이블에 "은유 체계" 행 추가 |
| 4 | Minor | Amelia | 웹 폰트 로딩 전략 미정의 (Pretendard 서브셋, lazy load) | 폰트 전략 추가: 서브셋 + swap + 모노 폰트 lazy load |

### Consensus Status
- Major objections: 0 / Minor opinions: 4 / Cross-talk exchanges: 2
- Primary consensus: 접근성(에러 아이콘)과 Aha! 매핑이 주요 보완점

### Fixes Applied
1. Design Language Summary에 Aha!-감정-Microinteraction 매핑 행 추가
2. 에러 심각도별 아이콘 추가 (접근성 개선)
3. CEO 앱 vs 관리자 콘솔 은유 분리 명시
4. 웹 폰트 로딩 전략 추가
