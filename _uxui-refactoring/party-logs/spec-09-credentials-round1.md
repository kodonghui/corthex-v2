# Party Mode Round 1 — Collaborative Lens
## Spec: 09-credentials (CLI Token / API Key Management)

**Date:** 2026-03-09
**Reviewers:** Sally (UX), Winston (Architect), Amelia (Dev), Quinn (QA), John (PM), Bob (SM), Mary (BA)

---

### Sally (UX)
직원 선택 -> 토큰/키 확인 -> 등록/삭제가 2~3클릭 안에 가능한 구조라 흐름은 자연스럽습니다. 다만 **가이드 박스가 항상 상단에 고정**되어 있으면, 이미 익숙한 관리자에게는 방해가 될 수 있으므로 접기(collapse) 기능을 추가하면 좋겠습니다. 또한 API 키 목록에서 **scope(개인/회사) 정보가 표시되지 않아** 어떤 범위의 키인지 파악할 수 없습니다.

### Winston (Architect)
섹션 5 컴포넌트 목록에 `CredentialsPage` 1개만 있는 건 현실적이지 않습니다. **모달(토큰 등록, API키 등록), 커스텀 확인 다이얼로그, 직원 목록 아이템** 등 최소 3~4개 하위 컴포넌트가 필요합니다. 섹션 4.3에서 "모달로 변경"이라고 했는데 컴포넌트 목록에 모달이 없으면 구현 시 혼동됩니다.

> **[Cross-talk] Sally -> Winston:** 동의합니다. 모달 컴포넌트를 명시하면 UX 관점에서도 레이아웃 밀림 문제가 명확히 해결되겠네요.

### Amelia (Dev)
data-testid 목록에 **누락이 여러 건** 있습니다: `apikey-label-input`, `apikey-key-input` (API 키 폼 입력 필드), `token-submit-btn`, `apikey-submit-btn` (등록 버튼), `token-cancel-btn`, `apikey-cancel-btn` (취소 버튼)이 빠져 있습니다. 또한 현재 구현체에는 `data-testid` 속성이 하나도 없으므로 스펙에 "신규 추가 필요"라고 명시해야 합니다. `confirm-dialog` (커스텀 확인 다이얼로그)에 대한 testid도 필요합니다.

### Quinn (QA)
**로딩 상태 정의가 완전히 빠져 있습니다.** 직원 목록 로딩, 토큰 목록 로딩, API 키 목록 로딩 각각에 대한 스켈레톤/스피너 정의가 필요합니다. 빈 상태는 섹션 3에서 문제로 지적했지만 개선 후 빈 상태 디자인이 구체적이지 않습니다. 에러 상태(API 호출 실패 시)에 대한 UI 정의도 없습니다.

> **[Cross-talk] Quinn -> Amelia:** 로딩/에러 상태에 대한 data-testid도 추가해야 합니다. `credentials-loading`, `credentials-error` 같은 것이 필요합니다.

### John (PM)
기존 기능 체크리스트(섹션 9)는 잘 정리되어 있고, 핵심 기능이 빠짐없이 커버됩니다. 다만 **API 키 목록에 scope(개인/회사) 표시가 레이아웃 다이어그램에 없습니다.** 등록 시에는 scope를 선택하지만 목록에서 보이지 않으면 관리자가 구분할 수 없습니다.

### Bob (SM)
범위는 현실적입니다. UI 변경만으로 충분히 구현 가능합니다. 컴포넌트 1개로 리스트했지만, 실제로는 기존 단일 파일 내에서의 변경이니 스코프 자체는 맞습니다. 모달을 공유 UI 컴포넌트에서 가져오면 추가 작업도 최소화됩니다.

### Mary (BA)
보안 관리 페이지의 비즈니스 가치는 명확합니다 -- AI 에이전트 운영의 필수 인프라입니다. "CLI 토큰"이라는 용어 사용도 프로젝트 규칙(API 과금 표현 금지)에 부합합니다. 다만 **토큰 만료/갱신 시기에 대한 안내**가 없어, 관리자가 토큰이 만료되었을 때 어떻게 대응해야 하는지 모를 수 있습니다.

---

### Round 1 이슈 요약

| # | 이슈 | 심각도 | 제기자 |
|---|------|--------|--------|
| 1 | 컴포넌트 목록에 모달/확인 다이얼로그 누락 | Major | Winston |
| 2 | data-testid 6개 이상 누락 (apikey-label-input, apikey-key-input, submit/cancel 버튼, confirm-dialog) | Major | Amelia |
| 3 | 로딩/에러 상태 UI 정의 없음 | Major | Quinn |
| 4 | API 키 목록에 scope(개인/회사) 표시 누락 | Medium | Sally, John |
| 5 | 가이드 박스 접기 기능 미정의 | Minor | Sally |
| 6 | 로딩/에러 상태 data-testid 누락 | Medium | Quinn, Amelia |

**판정: FAIL** — Major 이슈 3건으로 수정 후 Round 2 진행 필요.
