# Party Log — code-42-onboarding Round 1 (Collaborative)

## 리뷰 대상
- `packages/admin/src/pages/onboarding.tsx`
- Design spec: `_uxui-refactoring/claude-prompts/42-onboarding.md`

## 7-Expert Review

**1. UI/UX Expert**: 5단계 온보딩 위저드가 디자인 스펙과 일치합니다. StepIndicator(원형+연결선+라벨), 프로그레스 바, FooterNav(이전/건너뛰기/다음), 5개 스텝 콘텐츠 모두 올바릅니다. 템플릿 카드의 hover 효과와 빈 조직 dashed border도 스펙대로입니다.

**2. Accessibility Expert**: 모든 입력 필드에 label이 있습니다. 버튼에 disabled 상태가 시각적으로 표시됩니다(opacity-50). StepIndicator의 체크마크 SVG가 screen reader에서는 대체 텍스트가 없으나, 라벨 텍스트가 있어 충분합니다.

**3. Performance Expert**: 템플릿 목록은 companyId별로 캐싱됩니다. API 키 프로바이더 스키마는 한 번만 로드됩니다. 부서 목록도 캐싱됩니다. 스텝 전환은 로컬 상태로 즉각적입니다.

**4. Data Expert**: 템플릿 프리뷰에서 부서별 에이전트 수를 동적으로 계산합니다. ApplyResult 타입이 생성/건너뛴 부서+에이전트를 구분합니다. InvitedEmployee에 initialPassword가 포함됩니다.

**5. State Management Expert**: currentStep, completedSteps(Set), companyName, templateResult, apiKeysCount, invitedEmployees가 위저드 데이터를 관리합니다. markComplete과 goToStep 콜백이 useCallback으로 최적화되었습니다.

**6. Dark Mode Expert**: 모든 5개 스텝, StepIndicator, FooterNav에 dark 모드 클래스가 완전합니다. 초록/파란/인디고/앰버 색상 모두 dark 변형이 있습니다.

**7. Security Expert**: 초기 비밀번호가 평문으로 표시되나 이는 스펙에 명시된 의도입니다. 클립보드 복사에 try-catch가 적용되어 실패 시 toast를 표시합니다. API 키 credential은 type="password"입니다.

## Crosstalk
- UX → State: "스텝 전환이 로컬 상태라 페이지 새로고침 시 리셋되지만, 스펙에서 이를 의도한 것입니다."
- Security → UX: "비밀번호 표시+복사가 온보딩에서만 이루어지는 1회성 UX로 적절합니다."

## Issues Found
1. [사소] focus:ring-2 focus:ring-indigo-500 focus:outline-none이 온보딩 폼 입력에 적용되어 포커스 가시성 좋음
2. [사소] TIER_LABELS에 기본 fallback(`TIER_LABELS.specialist`)이 있어 미정의 tier에 대한 방어 처리 완료

## Score: 9/10
## Verdict: PASS
