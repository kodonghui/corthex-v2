# Party Mode Log: spec-08-departments -- Round 1 (Collaborative)
> 날짜: 2026-03-09
> 문서: _uxui-refactoring/specs/08-departments.md
> 리뷰어: 7-expert panel

---

## Expert Debate

### Sally (UX)
부서 관리 흐름은 간결합니다. "목록 확인 -> 생성/편집/삭제" 모두 2~3클릭 이내로 완료 가능하고, 삭제 시 영향 분석 모달을 거치는 것도 실수 방지에 좋아요. 다만 **로딩 상태와 에러 상태에 대한 비주얼 정의가 없습니다.** 섹션 3에서 "빈 상태: 기본 텍스트 + 버튼"은 문제로 지적했지만, 로딩 skeleton이나 API 에러 시 UI가 어떻게 보여야 하는지 정의가 빠져 있어요. 또한 생성 폼이 테이블 위에 인라인으로 나타나는 방식은 문제점으로 지적했는데, 개선 방향에서 이걸 모달로 바꿀지 인라인을 유지할지 구체적 결정이 없습니다.

### Winston (Architect)
컴포넌트 목록이 **DepartmentsPage 1개만** 기재되어 있는데, Cascade 분석 모달은 별도 컴포넌트로 분리할 만큼 복잡합니다. 영향 분석 카드 4개 + 에이전트 목록 + 삭제 방식 선택기까지 포함하면 200줄 이상의 모달인데, 이걸 DepartmentsPage 안에 전부 넣으면 유지보수가 어렵습니다. 최소한 CascadeAnalysisModal을 별도 행으로 분리하는 게 바람직해요. 데이터 바인딩 섹션은 깔끔하게 정리되어 있고, API 엔드포인트 5개가 명확합니다.

### Amelia (Dev)
data-testid 17개 -- 기본 인터랙션은 커버됩니다. 하지만 **누락이 있습니다:** (1) `departments-cascade-knowledge` -- 학습 기록 카드용 testid가 없어요. agents, tasks는 있는데 knowledge와 cost 카드는 빠짐. (2) `departments-cascade-cost` -- 비용 카드도 마찬가지. (3) `departments-loading` -- 로딩 상태 testid. (4) `departments-error` -- 에러 상태 testid. (5) 생성 폼의 **개별 입력 필드** testid가 없어요: `departments-create-name`, `departments-create-desc`, `departments-create-submit` 등이 필요합니다.

### Quinn (QA)
Playwright 테스트 8개 -- happy path는 커버되지만 **edge case가 부족합니다.** 추가 필요: (1) 빈 이름으로 생성 시도 시 validation 에러 확인, (2) 중복 부서명 생성 시도 시 에러 처리, (3) 에이전트가 0명인 부서 삭제 시 cascade 모달이 "영향 없음" 표시, (4) 네트워크 에러 시 에러 메시지 표시, (5) 인라인 편집 중 취소 시 원래 값 복원. 현재 테스트만으로는 QA 검증이 불완전합니다.

### John (PM)
v2의 핵심 방향인 "관리자가 부서를 자유롭게 CRUD"가 잘 반영되어 있고, 섹션 9의 기능 체크리스트 6개 항목이 빠짐없이 커버됩니다. 다만 **부서 색상/아이콘 기능**이 섹션 3에서 문제로 지적되고 4.2에서 개선 방향으로 언급되지만, 실제 데이터 바인딩이나 API에 색상/아이콘 필드가 없어요. 이게 Banana2 디자인에만 맡기는 시각적 장식인지, 실제 데이터를 저장하는 기능인지 명확히 해야 합니다.

### Bob (SM)
범위: 1개 컴포넌트 파일 수정, API 변경 없음 -- 가볍고 적절합니다. "절대 건드리면 안 되는 것" 리스트 4개 항목이 명확해서 좋아요. 다만 Winston 지적처럼 **cascade 모달을 별도 컴포넌트로 분리하면 "새 파일 생성"이 되어 범위가 확장됩니다.** 이 경우 기존 파일에서 JSX를 추출하는 것이므로 기능 변경 없이 구조만 바뀌는 것이라 수용 가능하다고 봅니다. 스코프 표에 반영만 해주면 됩니다.

### Mary (BA)
부서 관리는 v2에서 "동적 조직 관리"의 기반이 되는 페이지입니다. 비즈니스 가치가 명확하고, 특히 cascade 삭제 분석은 관리자의 실수를 방지하는 핵심 안전장치예요. 영향 분석 모달에서 비용, 학습 기록 보존 안내를 보여주는 것은 관리자 신뢰도를 높이는 좋은 UX입니다. 전체적으로 비즈니스 요구사항 커버리지가 충분합니다.

---

## Cross-talk

**Winston -> Bob:** Cascade 모달 분리 건, 동의합니다. 기존 departments.tsx에서 모달 부분만 추출하면 기능 변경 없이 구조 개선이 가능하고, 컴포넌트 목록에 행 하나 추가하면 됩니다. 범위 확장이라기보다 리팩토링의 일부로 볼 수 있어요.

**Amelia -> Quinn:** testid 누락 건과 테스트 항목 추가 건이 연동됩니다. cascade-knowledge, cascade-cost testid를 추가해야 Quinn이 제안한 "에이전트 0명 부서" 테스트에서 각 카드 값을 검증할 수 있어요.

**Sally -> John:** 부서 색상/아이콘 건, UI-only 변경이면 하드코딩된 색상 팔레트에서 부서 순서대로 색을 할당하는 방식이 현실적입니다. 새 API 필드를 추가하면 범위를 넘으니까요.

---

## Issues Found (Round 1)

| # | 심각도 | 내용 | 제기자 |
|---|--------|------|--------|
| 1 | Major | data-testid 누락: cascade-knowledge, cascade-cost, loading, error, 생성 폼 필드별 testid | Amelia |
| 2 | Major | 로딩/에러 상태 UI 정의 누락 | Sally, Quinn |
| 3 | Minor | 컴포넌트 목록이 1개만 -- cascade 모달 분리 필요 | Winston, Bob |
| 4 | Minor | Playwright 테스트 edge case 부족 (validation, 중복명, 0명 삭제, 에러) | Quinn |
| 5 | Minor | 부서 색상/아이콘이 시각 장식인지 데이터 저장인지 불명확 | John |
| 6 | Minor | 생성 폼을 모달로 변경할지 인라인 유지할지 미결정 | Sally |

**판정: 수정 필요 (Major 2건)**
