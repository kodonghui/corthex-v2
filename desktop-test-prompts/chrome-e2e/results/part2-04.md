# Part 2-04: 조직 + 부서 + 티어 결과

## 테스트 환경
- 일시: 2026-03-29 20:15
- 브라우저: Chrome
- 해상도: 1440x617

## 단계별 결과
| # | 단계 | 결과 | 비고 |
|---|------|------|------|
| 1 | 조직 페이지 로딩 확인 | PASS | 사이드바 "조직" 클릭 → /organization 로딩. "CORTHEX GLOBAL ENTERPRISE" 타이틀, SYSTEM STATUS: OPERATIONAL, 4개 통계 카드 + 4개 기능 카드 + 사이드 패널 표시 |
| 2 | 직원 카드/행 클릭 → 상세 정보 | FAIL | 조직 페이지에 직원/직원 목록이 없음. 부서 상세의 에이전트 행 클릭 시 상세 페이지 이동 불가 (BUG-004) |
| 3 | 스크린샷: organization | PASS | 조직 overview 스크린샷 캡처 완료 (ss_5805uq8b7) |
| 4 | 부서 목록 표시 확인 | PASS | 사이드바 "부서" 클릭 → /departments 로딩. "2 Departments" + "+ Create Department" 버튼. 경영지원실, 보안점검팀 카드 표시 |
| 5 | 부서 클릭 → 소속 직원/에이전트 표시 | FAIL | 부서 클릭 시 우측 패널에 상세 표시되나, 두 부서 모두 동일한 에이전트 2명 표시 (BUG-002) |
| 6 | 스크린샷: departments | PASS | 부서 상세 패널 포함 스크린샷 캡처 완료 (ss_406896mpb) |
| 7 | 티어 구조 표시 확인 | PASS | 조직 overview → "MODIFY SPECS" 클릭 → Tiers Hierarchy 페이지 로딩. 빈 상태 ("계층이 없습니다") + "+ Create Tier" 버튼 + 통계 카드 3개 |
| 8 | 각 티어 클릭 → 상세 확인 | N/A | 생성된 티어가 없어 클릭 불가. 단, "+ Create Tier" 폼 정상 동작 확인 (유효성 검사 포함) |
| 9 | 스크린샷: tiers | PASS | Tiers Hierarchy 스크린샷 캡처 완료 (ss_6671ft4hp) |

## 발견된 버그

### BUG-001: 조직 Overview 통계 카드 수치 불일치
- 페이지: https://corthex-hq.com/organization
- 재현 단계:
  1. 사이드바 → 조직 클릭
  2. 상단 통계 카드 확인
- 기대 결과: DEPARTMENTS: 2, ACTIVE AGENTS: 1 (또는 2) 표시
- 실제 결과: DEPARTMENTS: 0, ACTIVE AGENTS: 0 표시. 하지만 실제로 부서 2개, 에이전트 2개(활성 1개) 존재
- 심각도: Major

### BUG-002: 부서 상세에서 모든 에이전트가 동일하게 표시 (부서 필터링 미작동)
- 페이지: https://corthex-hq.com/departments
- 재현 단계:
  1. 부서 페이지에서 경영지원실 클릭 → 소속 에이전트: 경영보좌관 + 보안감사봇 (2 ENTITIES)
  2. 보안점검팀 클릭 → 소속 에이전트: 경영보좌관 + 보안감사봇 (2 ENTITIES) — 동일
  3. Agents Ecosystem에서 확인하면 경영보좌관→경영지원실, 보안감사봇→보안점검팀으로 올바르게 배정됨
- 기대 결과: 경영지원실에는 경영보좌관만, 보안점검팀에는 보안감사봇만 표시
- 실제 결과: 두 부서 모두 전체 에이전트 2명을 동일하게 표시
- 심각도: Major

### BUG-003: 에이전트 티어("Specialist")와 티어 관리 페이지 데이터 불일치
- 페이지: https://corthex-hq.com/organization (티어 서브페이지)
- 재현 단계:
  1. 부서 상세에서 에이전트의 TIER 컬럼 → "Specialist" 표시
  2. 조직 → Configure Tiers → TOTAL TIERS: 0 ("계층이 없습니다")
- 기대 결과: "Specialist" 티어가 티어 관리 페이지에도 존재
- 실제 결과: 에이전트에는 Specialist 티어가 할당되어 있으나 티어 관리에서는 0개로 표시. 시드 티어가 관리 UI에 반영 안 됨
- 심각도: Minor

### BUG-004: 에이전트 행 클릭 시 상세 페이지 이동 불가
- 페이지: https://corthex-hq.com/departments, https://corthex-hq.com/organization (부서 서브뷰)
- 재현 단계:
  1. 부서 상세 패널에서 에이전트 이름 또는 행 클릭
- 기대 결과: 해당 에이전트 상세 페이지로 이동 (또는 상세 모달 표시)
- 실제 결과: 아무 반응 없음. 에이전트 상세 정보를 보려면 별도로 에이전트 페이지에 접근해야 함
- 심각도: Minor

## UX 탐색 발견사항
- **"INITIALIZE ACCESS" 링크** → 부서 목록 서브뷰로 정상 이동
- **"LAUNCH MONITOR" 링크** → Agents Ecosystem 페이지로 정상 이동. 1 ACTIVE / Total: 2 표시. 검색, 부서 필터, 상태 탭(활성/전체/비활성) 제공
- **"MODIFY SPECS" 링크** → Tiers Hierarchy 서브뷰로 정상 이동
- **티어 생성 모달**: 빈 이름 제출 시 "계층명을 입력하세요" 빨간색 에러 메시지 정상 표시
- **AI 모델 드롭다운**: Claude Opus 4.6 (최고 성능), Claude Sonnet 4.6 (균형), Claude Haiku 4.5 (경제적) 3개 옵션 제공
- **최대 도구 수**: 기본값 10, "0 = 무제한" 안내 표시
- **통계 카드** (TOTAL TIERS, TOTAL TOOLS, AVG MODEL): 표시 전용, 클릭 불가
- **"×" 브레드크럼 닫기 버튼**: 서브뷰에서 Overview로 정상 복귀
- **사이드바에 "티어" 메뉴 없음**: 조직 overview의 "Configure Tiers" 카드 통해서만 접근 가능. 사이드바에 직접 접근 경로가 없어 발견성(discoverability) 낮음
- **부서 카드 호버 효과**: 호버 시 테두리 강조(골드 컬러) 정상 작동
- **"+ Create Department" 버튼**: 부서 생성 기능 존재 (미테스트)
- **콘솔 에러**: 없음

## 요약
- 총 단계: 9
- PASS: 5
- FAIL: 2
- N/A: 1
- 스크린샷: 3장 (organization, departments, tiers)
- 버그: 4건 (Major 2건, Minor 2건)

### 주요 이슈
1. **조직 overview 통계 불일치** (Major): 실제 데이터와 표시 수치가 다름
2. **부서-에이전트 필터링 미작동** (Major): 부서 상세에서 해당 부서 소속이 아닌 전체 에이전트가 표시됨
