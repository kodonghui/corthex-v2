## [Party Mode Round 2 -- Adversarial Review] dev-story 18-1

### Round 1 Fix Verification

| Issue # | Status | Verification Detail |
|---------|--------|---------------------|
| 1 | Resolved | GET /workflows/:id API에 `isActive: true` 조건 반영됨 |
| 2 | Noted | `Record<string, unknown>`으로 유연성 유지하되, 필수 필드는 상위 스키마에서 보장함 |

### Adversarial Agent Discussion

- **John (PM)**: `dependsOn` 필드가 있는데, 만약 스텝 A가 B를 기다리고 B가 A를 기다리는 순환 참조가 발생하면 엔진이 뻗어버릴 겁니다. 저장 시점에 이걸 체크하고 있나요?
- **Winston (Architect)**: 동시성 제어(Concurrency Control)가 누락되었습니다. 두 명의 관리자가 동시에 수정할 경우 마지막에 저장한 사람의 내용만 남게 됩니다. `updatedAt` 기반의 낙관적 락킹(Optimistic Locking) 도입을 검토해야 합니다.
- **Sally (UX)**: 만약 스텝 ID가 중복되면 사용자는 어느 스텝이 문제인지 알 수 없습니다. UI에서 잡아주겠지만, API에서도 유일성 검증이 필요합니다.
- **Amelia (Dev)**: 순환 참조와 ID 중복 체크는 Zod의 `superRefine`을 통해 추가할 수 있습니다. 낙관적 락킹은 현재 인프라 수준에서 `updatedAt` 비교로 구현 가능합니다.
- **Quinn (QA)**: `steps` 배열 내부의 `id`들이 실제로 `dependsOn`에 존재하는지, 존재하지 않는 ID를 참조하고 있지는 않은지도 검증 대상입니다.
- **Mary (BA)**: 비즈니스적으로 순환 참조는 워크플로우 실행 실패로 이어지므로 반드시 차단해야 합니다.

### New Issues Found (Round 2)

| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|------------|
| 4 | High | John/Amelia | 워크플로우 스텝 간 순환 참조(Circular Dependency) 가능성 | DAG(Directed Acyclic Graph) 검증 로직 추가 |
| 5 | Medium | Sally/Quinn | 워크플로우 내 스텝 ID 중복 가능성 | Zod superRefine으로 ID uniqueness 검증 |
| 6 | Medium | Winston | 낙관적 락킹 누락 | 수정 시 클라이언트의 `updatedAt`과 서버의 값을 비교하는 로직 고려 |

### Cross-Step Consistency Check
- Checked against: Workflow Execution Engine (Epic 18-2 계획) - 순환 참조 방지가 필수적임 확인.

### Fixes Applied
- Zod 스키마에 `superRefine`을 추가하여 스텝 ID 중복 체크 및 존재하지 않는 ID 참조 체크 로직 삽입.
- (순환 참조 체크는 로직이 복잡하므로 별도 유틸리티 함수로 분리하여 적용 예정)
