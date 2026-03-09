# Party Mode Round 2 (Adversarial) -- Credentials (CLI 토큰 / API 키 관리)

> 날짜: 2026-03-09
> 문서: _uxui-refactoring/specs/09-credentials.md
> 리뷰어: 7-expert panel (Adversarial Lens)

---

## Round 1 이슈 반영 확인

| # | Round 1 이슈 | 반영 여부 |
|---|-------------|----------|
| 1 | 컴포넌트 목록에 모달/확인 다이얼로그 누락 (Major) | [x] 반영됨 -- AddTokenModal, AddApiKeyModal, ConfirmDialog 추가 (총 4개) |
| 2 | data-testid 6개+ 누락 (Major) | [x] 반영됨 -- submit/cancel/label/key 버튼, confirm-dialog, loading/error/empty 추가 (총 36개) |
| 3 | 로딩/에러 상태 UI 정의 없음 (Major) | [x] 반영됨 -- 섹션 4.4 신설, 스켈레톤/에러/빈 상태 구체화 |
| 4 | API 키 목록에 scope 표시 누락 (Medium) | [x] 반영됨 -- apikey-scope-badge testid + Banana2 프롬프트에 scope badge 추가 |
| 5 | 가이드 박스 접기 기능 미정의 (Minor) | [x] 반영됨 -- 섹션 4.3에 추가, guide-collapse-btn testid 추가 |
| 6 | 로딩/에러 상태 data-testid 누락 (Medium) | [x] 반영됨 -- credentials-loading, credentials-error, credentials-empty 추가 |

**Round 1 이슈 전부 정상 반영 확인.**

---

## 전문가 리뷰

### Sally (UX)
모바일 뒤로 가기(직원 목록 복귀) 동선이 섹션 8에 반영되고 `mobile-back-btn` testid도 추가되어 이전 Round 2 이슈가 해결되었습니다. **새 발견: 직원 목록이 많을 때(10명 이상) 스크롤이 필요한데, 현재 직원 목록에 검색/필터 기능이 없습니다.** `employee-search` testid가 이번에 추가되었는데, 섹션 4.2나 Banana2 프롬프트에는 직원 검색 기능이 명시되어 있지 않아요. testid만 있고 기능 정의가 없으면 구현 시 혼란스럽습니다. Banana2 프롬프트에 "Employee list with optional search/filter input"을 추가하거나, testid를 제거해야 합니다.

### Winston (Architect)
컴포넌트 4개 구조가 합리적입니다. ConfirmDialog를 "공유 UI 컴포넌트 활용"이라고 한 것은 올바른 판단입니다 -- 다른 페이지(departments cascade 삭제 등)에서도 필요하므로. **AddTokenModal과 AddApiKeyModal의 파일 위치가 "pages/credentials.tsx 내부 또는 별도"로 미결정**인데, 이건 구현 시 판단해도 되므로 Minor입니다. 모달 크기가 작으면 같은 파일에, 복잡하면 분리하면 됩니다.

### Amelia (Dev)
data-testid 36개 -- 매우 충분합니다. 토큰 마스킹 프리뷰(`token-masked-preview`)가 추가된 것이 좋아요. 다만 **이 마스킹 프리뷰가 서버에서 내려오는 건지 프론트에서 처리하는 건지** 데이터 바인딩 섹션에서 명확하지 않습니다. 현재 `creds` 쿼리 응답에 마스킹된 토큰 프리뷰가 포함되는지, 아니면 등록 시 프론트에서 앞 몇 글자만 저장하는지 결정이 필요해요. 이건 "UI 변경 시 절대 건드리면 안 되는 것"에 해당할 수 있으므로 주의가 필요합니다. 기존 API 응답 구조에 마스킹 필드가 있다면 그대로 사용하면 되고, 없다면 프론트에서 표시만 생략하는 것이 안전합니다.

### Quinn (QA)
테스트 17개 -- 빈 라벨 토큰 등록(#16)과 토큰 마스킹 표시(#17)가 추가되어 edge case 커버리지가 우수합니다. **새 발견: 동일 직원에게 동일 라벨로 토큰을 중복 등록할 때의 동작이 정의되지 않았습니다.** 서버가 막아주는지, 프론트에서 validation을 해야 하는지 명시가 없어요. 다만 이는 서버 로직 관련이므로 "절대 건드리면 안 되는" 영역일 수 있고, UI-only 리팩토링 범위에서는 기존 동작을 유지하면 됩니다. Minor입니다.

### John (PM)
기능 커버리지가 완전합니다. CLI OAuth 토큰 CRUD, API 키 CRUD, scope 관리, 가이드 박스, 토큰 활성/비활성 상태 전부 포함되어 있습니다. "API 과금 표현 금지" 규칙도 준수하고 있고, "CLI 토큰"이라는 용어를 일관되게 사용하고 있어요. PM 관점에서 추가 이슈 없습니다.

### Bob (SM)
범위: 4개 컴포넌트 (1개 수정 + 2개 모달 신규 + 1개 공유 컴포넌트). 모달 2개는 기존 인라인 폼을 감싸는 수준이라 작업량이 크지 않습니다. `employee-search` testid가 추가되었는데 기능 정의 없이 testid만 있으면 스코프 모호성이 생깁니다. 검색 기능을 넣을 거면 명시하고, 아니면 testid를 제거해야 합니다.

### Mary (BA)
보안 관리 페이지의 비즈니스 가치는 명확합니다. 토큰 마스킹 프리뷰 추가는 보안 인식을 높이면서도 관리자가 어떤 토큰인지 구분할 수 있게 해주는 좋은 개선입니다. ConfirmDialog로 native confirm()을 대체하는 것도 전문적인 인상을 줍니다.

---

## 크로스톡

**Sally -> Bob:** `employee-search` testid 건에 동의합니다. 검색 기능은 직원이 10명 이상일 때 유용하지만, 구현 범위를 고려하면 "직원 수가 많을 경우를 위한 선택적 기능"으로 Banana2 프롬프트에만 힌트를 주고, 없어도 동작하는 구조가 맞습니다. testid는 유지하되 "optional" 표기를 추가하면 됩니다.

**Amelia -> Quinn:** 토큰 마스킹 프리뷰와 중복 라벨 validation 둘 다 기존 서버 API 동작에 의존하는 부분입니다. UI-only 리팩토링에서는 서버 응답을 그대로 표시하면 되므로, 새 API 호출이나 프론트 로직 추가 없이 기존 데이터만 활용하는 것이 안전합니다. 마스킹 프리뷰는 서버 응답에 마스킹 필드가 있으면 표시하고, 없으면 라벨만 표시하는 방식이 현실적입니다.

**Winston -> Sally:** ConfirmDialog를 공유 컴포넌트로 만들면 departments의 cascade 삭제에서도 활용 가능합니다. 두 스펙 간 일관성 측면에서도 공유 컴포넌트 접근이 맞습니다.

---

## 신규 발견 이슈

| # | 심각도 | 내용 | 제기자 |
|---|--------|------|--------|
| 1 | Minor | `employee-search` testid가 있지만 기능 정의(섹션 4.2, Banana2 프롬프트)에 검색 기능 미명시 | Sally, Bob |
| 2 | Minor | 토큰 마스킹 프리뷰가 서버 응답 기반인지 프론트 처리인지 데이터 바인딩에 미정의 | Amelia |
| 3 | Minor | 동일 라벨 토큰 중복 등록 시 동작 미정의 (서버 영역이라 UI-only 범위 밖) | Quinn |

---

## UXUI 체크포인트

- [x] 핵심 동작 3클릭 이내 (직원 선택 1클릭 + 등록 버튼 1클릭 + 폼 제출 1클릭 = 3클릭)
- [x] 빈 상태/에러 상태/로딩 상태 정의됨 (섹션 4.4 + Banana2 프롬프트 항목 6~10)
- [x] data-testid가 모든 인터랙션 요소에 할당됨 (36개)
- [x] 기존 기능 전부 커버 (섹션 9 체크리스트 5항목 전체 체크)
- [x] Banana2 프롬프트가 영문으로 구체적으로 작성됨 (데스크톱 + 모바일)
- [x] 반응형 breakpoint (375px, 768px, 1440px) 명시 (섹션 8)
- [x] 기능 로직은 안 건드리고 UI만 변경하는 범위 (섹션 9 "절대 건드리면 안 되는 것" 4항목)

---

## 품질 점수: 9/10

감점 사유:
- -1: `employee-search` testid와 기능 정의 불일치 (Minor, 구현 시 해결 가능)

## 판정: PASS
