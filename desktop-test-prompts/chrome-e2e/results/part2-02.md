# Part 2-02: 대시보드 + NEXUS 결과

## 테스트 환경
- 일시: 2026-03-29 09:00
- 브라우저: Chrome
- 해상도: 1440x669
- 계정: CEO (대표님 / User)

## 단계별 결과
| # | 단계 | 결과 | 비고 |
|---|------|------|------|
| 1 | 대시보드 로딩 확인 | PASS | "Welcome, Commander" + SYSTEM: OFFLINE 표시. 로딩 스피너 없이 즉시 렌더링 |
| 2 | 위젯/카드 확인 | PASS | ACTIVE AGENTS(00), DEPARTMENTS(00), PENDING JOBS(000), TOTAL COSTS($0) 4개 카드 + ACTIVE UNITS 테이블 + LIVE EVENT STREAM + SYSTEM HEALTH MATRIX + Cost Trend + Departmental Load + Task Status + Recent Tasks + Quick Action 3개 |
| 3 | 대시보드 스크린샷 | PASS | ss_10640tf8k 캡처 완료 |
| 4 | NEXUS 페이지 로딩 확인 | PASS | "CORTHEX NEXUS" + "AGENT TOPOLOGY CANVAS V2.4.0" 표시 |
| 5 | 조직도/워크플로우 시각화 확인 | PASS | 조직 미구성 상태로 "조직이 구성되지 않았습니다" 빈 화면 표시 (정상) |
| 6 | 노드 클릭 → 상세 정보 표시 확인 | N/A | 조직 미구성으로 노드 없음. "Initialize Workspace" 버튼 클릭 시 반응 없음 |
| 7 | NEXUS 스크린샷 | PASS | ss_4779xnaq4 캡처 완료 |

## 발견된 버그
### BUG-001: Dashboard "SYSTEM: OFFLINE" vs Hub "SYSTEM: ONLINE" 불일치
- 페이지: /dashboard vs /hub
- 재현 단계: 1. Hub 페이지 접속 → "SYSTEM: ONLINE" 표시 2. Dashboard 페이지 접속 → "SYSTEM: OFFLINE" 표시
- 기대 결과: 두 페이지의 시스템 상태가 동일해야 함
- 실제 결과: Hub은 ONLINE(녹색), Dashboard는 OFFLINE(빨간색)으로 상태 불일치
- 심각도: Major

### BUG-002: Dashboard ACTIVE AGENTS 카드 "00" 표시 (에이전트 2개 존재)
- 페이지: /dashboard
- 재현 단계: 1. Dashboard 확인 → ACTIVE AGENTS: 00 2. VIEW FULL ROSTER 클릭 → Agents 페이지에서 2개 에이전트 확인 (보안감사봇, 경영보좌관)
- 기대 결과: ACTIVE AGENTS가 실제 에이전트 수를 반영해야 함
- 실제 결과: 에이전트가 2개 존재하지만 00으로 표시
- 심각도: Major

### BUG-003: NEXUS "Initialize Workspace" 버튼 클릭 시 무반응
- 페이지: /nexus
- 재현 단계: 1. NEXUS 페이지 접속 2. "Initialize Workspace" 버튼 클릭
- 기대 결과: 워크스페이스 초기화 진행 또는 안내 메시지
- 실제 결과: 클릭 후 아무 반응 없음, 콘솔 에러도 없음
- 심각도: Major

### BUG-004: "New Conversation" Quick Action이 채팅이 아닌 Hub으로 리다이렉트
- 페이지: /dashboard → /command-center → /hub
- 재현 단계: 1. Dashboard 하단 "New Conversation" 카드 클릭
- 기대 결과: 채팅/대화 페이지로 이동
- 실제 결과: /command-center → /hub으로 리다이렉트되어 Hub 메인 페이지 표시
- 심각도: Minor

## UX 탐색 발견사항
- ACTIVE AGENTS 카드 클릭 → 반응 없음 (클릭 가능한 것처럼 보이지만 네비게이션 없음)
- DEPARTMENTS 카드 클릭 → 반응 없음 (동일)
- PENDING JOBS 카드 클릭 → 반응 없음 (동일)
- TOTAL COSTS 카드 클릭 → 반응 없음 (동일)
- "VIEW FULL ROSTER" 링크 → /agents로 정상 이동 (PASS)
- "View History →" 링크 → /activity-log로 정상 이동, 로그인 기록 표시 (PASS)
- "New Conversation" Quick Action → /hub으로 리다이렉트 (위 BUG-004)
- "Create Workflow" Quick Action → /n8n-workflows 정상 이동 (PASS)
- "Weekly Report" Quick Action → /reports 정상 이동 (PASS)
- 사이드바 축소(«) 버튼 → 아이콘 모드로 정상 축소 (PASS)
- 사이드바 확장(»)  버튼 → 정상 확장 (PASS)
- 알림 벨 아이콘 → /notifications 정상 이동, 빈 상태 표시 (PASS)
- Workflows 페이지에서 워크플로우 0개인데 TOTAL THROUGHPUT 2.4M, ACTIVE INSTANCES 882, SYSTEM HEALTH 99.9% 표시 → 하드코딩된 목업 데이터로 보임 (Cosmetic)
- Dashboard 상단 4개 카드에 호버 시 시각적 피드백 없음 → 클릭 불가능하다면 커서를 pointer가 아닌 default로 설정 권장 (Cosmetic)

## 요약
- 총 단계: 7
- PASS: 5
- FAIL: 0
- N/A: 1 (조직 미구성으로 노드 없음)
- 버그: 4건 (Major 3건, Minor 1건)
