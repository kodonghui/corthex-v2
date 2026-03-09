# Party Log — code-41-settings-admin Round 1 (Collaborative)

## 리뷰 대상
- `packages/admin/src/pages/settings.tsx`
- Design spec: `_uxui-refactoring/claude-prompts/41-settings-admin.md`

## 7-Expert Review

**1. UI/UX Expert**: 3개 섹션(회사 정보, API 키, 기본 설정)이 디자인 스펙과 일치합니다. 각 섹션이 독립적인 카드(`bg-white dark:bg-zinc-900 rounded-xl border`)로 구성됩니다. dirty state에 따라 저장/취소 버튼이 조건부 표시됩니다.

**2. Accessibility Expert**: label 요소가 모든 입력 필드에 연결되어 있습니다. disabled 입력(Slug)에 `cursor-not-allowed`가 적용됩니다. password 타입의 credential 필드가 적절합니다.

**3. Performance Expert**: 회사 정보, API 키, 기본 설정이 각각 독립적으로 로드됩니다. provider schema는 한 번만 로드됩니다. 캐시 무효화가 적절합니다.

**4. Data Expert**: PROVIDER_LABELS 맵이 12개 프로바이더를 지원합니다. 날짜 포맷이 한국어 로케일(`year: 'numeric', month: 'long', day: 'numeric'`)로 정확합니다. 동적 credential 필드가 프로바이더별로 올바르게 렌더링됩니다.

**5. State Management Expert**: dirty tracking이 CompanyInfoSection과 DefaultSettingsSection에서 독립적으로 동작합니다. API 키 섹션은 showAdd/rotateTarget/deleteTarget 상태가 적절히 관리됩니다. useEffect로 서버 데이터와 폼 동기화가 정상입니다.

**6. Dark Mode Expert**: 3개 섹션 모두 dark 모드 클래스가 완전합니다. amber(갱신 폼), green(상태 뱃지), blue(프로바이더 뱃지), red(삭제) 색상 모두 dark 변형이 있습니다.

**7. Security Expert**: API 키는 type="password"로 마스킹됩니다. AES-256-GCM 암호화 언급이 UI에 표시됩니다. 삭제 전 ConfirmDialog로 확인합니다. scope가 항상 'company'로 고정됩니다.

## Crosstalk
- Security → UX: "API 키가 절대 평문 표시되지 않는 것이 보안 스펙에 부합합니다."
- State → Performance: "dirty tracking으로 불필요한 API 호출을 방지합니다."

## Issues Found
1. [사소] 갱신 폼의 `type="button"` 취소 버튼이 form submit을 방지하여 적절
2. [사소] data-testid가 주요 섹션에 추가되어 테스트 커버리지 향상

## Score: 9/10
## Verdict: PASS
