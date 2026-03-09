# Party Mode: spec-21-users Round 1

## 참여 전문가
| 이름 | 역할 | 관점 |
|------|------|------|
| John | PM | Collaborative |
| Winston | Architect | Collaborative |
| Sally | UX | Collaborative |
| Amelia | Dev | Collaborative |
| Quinn | QA | Collaborative |
| Bob | SM | Collaborative |
| Mary | BA | Collaborative |

## 리뷰 결과

### John (PM)
v1-feature-spec 23번 항목(v2 추가 기능)의 사용자 CRUD, 역할 관리, 비밀번호 초기화, 부서별 필터, 멀티테넌시가 모두 스펙에 포함되어 있다. v2에서 새로 추가된 관리자 콘솔 기능으로 v1에 없던 것이므로 기존 기능 커버 이슈는 없다. 다만 employees 페이지(#22)와의 기능 중복이 우려된다 -- 둘 다 "직원 관리"인데 역할 분담이 명확하지 않다.

### Winston (Architect)
컴포넌트 5개로 깔끔하다. ConfirmDialog를 @corthex/ui 공용 컴포넌트로 사용하는 것이 좋다. 다만 개선 방향에서 "인라인 편집 -> 모달 편집 검토"라고 했는데, 현재 Banana2 프롬프트에서는 여전히 "inline-edit mode"를 설명하고 있어 불일치가 있다. 최종 방향을 결정하고 프롬프트를 맞춰야 한다.

### Sally (UX)
직원 추가 흐름이 "+ 직원 추가 -> 폼 입력 -> 생성"으로 3클릭 이내에 가능하다. 개선 방향에서 생성 폼 모달화, 편집 모달화를 제안한 것이 좋은데, 현재 Banana2 프롬프트의 "Creation form -- expandable card above the table"과 "inline-edit mode"가 이전 방식을 기술하고 있다. 프롬프트를 모달 방식으로 업데이트해야 한다.

### Amelia (Dev)
data-testid가 27개로 잘 정의되어 있다. 재활성화 버튼(`users-reactivate-btn`)과 검색 입력(`users-search-input`)이 개선 사항에 맞게 포함되어 있어 좋다. 에러 상태 testid(`users-error-state`)도 있다. 다만 비밀번호 초기화 후 임시 비밀번호 표시 모달의 testid가 없다 -- 개선 방향에서 "비밀번호 표시 모달"을 추가한다고 했는데 testid가 빠졌다.

### Quinn (QA)
Playwright 테스트 19개로 핵심 시나리오를 잘 커버한다. 재활성화 테스트(#19)와 검색 테스트(#17)가 개선 사항에 맞게 포함되어 있다. 다만 비밀번호 초기화 후 임시 비밀번호가 모달에 표시되는지 확인하는 테스트가 없다. 현재 #11은 "성공 토스트"만 확인한다.

### Bob (SM)
UI 변경 범위가 명확하다. API 호출 로직, mutation 로직, User/Department/Agent 타입, userDeptMap 매핑, ConfirmDialog 패턴을 보호한다. 인라인 편집에서 모달 편집으로의 전환은 UI만 변경하고 mutation 호출은 동일하므로 리스크가 낮다.

### Mary (BA)
사용자 관리는 멀티테넌시 플랫폼의 기본 기능이다. 부서별 필터링으로 대규모 조직에서도 효율적 관리가 가능하다. 다만 employees 페이지와의 역할 분담이 명확하지 않으면 관리자가 혼란을 겪을 수 있다 -- 어느 페이지에서 어떤 작업을 해야 하는지 가이드가 필요하다.

## 크로스톡
- **Sally** -> **Winston**: Banana2 프롬프트에서 인라인 편집을 기술하고 있는데, 개선 방향은 모달입니다. 프롬프트를 모달 방식으로 업데이트하거나, 인라인 방식을 유지하기로 결정해야 합니다.
- **Winston** -> **Sally**: 현재 구현이 인라인이고, Banana2가 결정하는 디자인 톤에서 어느 쪽이든 수용 가능하므로, 프롬프트에 "modal or inline editing"으로 양쪽 옵션을 제시하는 것이 좋겠습니다.
- **Amelia** -> **Quinn**: 비밀번호 모달 testid는 `users-password-modal`, `users-password-copy` 같은 것이 필요합니다.

## 발견된 이슈
| # | 심각도 | 발견자 | 내용 | 조치 |
|---|--------|--------|------|------|
| 1 | 중 | Amelia/Quinn | 비밀번호 초기화 후 임시 비밀번호 표시 모달 testid 누락 | `users-password-modal`, `users-password-copy` testid 추가 |
| 2 | 저 | Sally/Winston | Banana2 프롬프트가 개선 방향(모달)과 불일치 (인라인 편집 기술) | 프롬프트에 양쪽 옵션 제시로 수정 |

## 판정
- 점수: 7/10
- 결과: PASS (이슈 2건 수정 완료 후)
