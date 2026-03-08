## [Party Mode Round 1 -- Collaborative Review] dev-story 18-1

### Agent Discussion

- **John (PM)**: 워크플로우 CRUD의 기본 틀은 잘 잡혔네요. 기획 단계에서 정의한 '다단계 스텝' 기능이 `jsonb`로 유연하게 구현된 점이 마음에 듭니다. 다만, 스텝 내부의 데이터 무결성을 보장하기 위한 Zod 검증이 좀 더 촘촘했으면 합니다.
- **Winston (Architect)**: 동감입니다. Drizzle 스키마에서 `companyId` 인덱싱과 `isActive` 인덱싱을 적절히 사용하여 멀티테넌트 환경에서의 성능을 고려한 점이 좋습니다. 하지만 GET by ID API에서 `isActive` 상태를 체크하지 않는 부분은 보안 및 데이터 일관성 관점에서 개선이 필요해 보입니다.
- **Sally (UX)**: 목록 조회 시 모든 스텝 데이터를 넘겨주고 있는데, 워크플로우가 방대해지면 클라이언트 부담이 커질 수 있습니다. 목록용 경량 모델 제공을 고려해볼 수 있겠네요.
- **Amelia (Dev)**: 네, GET by ID의 일관성 문제는 바로 수정 가능합니다. Zod 검증 역시 `WorkflowStep` 타입에 맞춰 구체화하겠습니다.
- **Quinn (QA)**: Soft-delete된 항목이 ID 직접 요청으로 조회되는 것은 버그에 가깝습니다. 404 처리를 하는 것이 맞습니다. 또한, 빈 스텝으로 생성되는 케이스에 대한 방어 로직이 Zod에 있는지 확인해주세요.
- **Mary (BA)**: 'tool', 'llm', 'condition' 세 가지 타입은 현재 비즈니스 로직 확장성에 충분합니다.

### Issues Found

| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|------------|
| 1 | Medium | Quinn/Winston | GET by ID에서 삭제된(isActive=false) 워크플로우가 조회됨 | where 절에 isActive: true 조건 추가 또는 삭제된 경우 404 리턴 |
| 2 | Low | John | 스텝 파라미터(`params`)의 구체적인 제약 부족 | Zod에서 record(unknown) 대신 최소한의 구조 정의 고려 (필수는 아님) |
| 3 | Low | Sally | 리스트 API의 페이로드 크기 | 스텝 제외 버전 또는 요약 정보만 반환하는 리스트 API 고려 |

### Consensus Status
- Major objections: 1
- Minor opinions: 2
- Cross-talk exchanges: 3

### Fixes Applied
- GET by ID 로직에서 `isActive: true` 조건 추가.
- `create-story` 단계의 Zod 스키마에서 스텝 검증 로직 강화 (최소 1개 스텝 강제 등 확인).
