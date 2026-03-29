# Part 1-14: 시스템 모니터링 + NEXUS 조직도 테스트 (2분)

## 성공 기준
모니터링: 서버 상태 + 메모리 게이지 + 로그 + Refresh
NEXUS: ReactFlow 캔버스 + 노드 + 줌

## 테스트 단계

### 시스템 모니터링
사이드바 → 운영 → 시스템 모니터링

1. **확인**: Server Status "ONLINE" 표시
2. **확인**: Uptime 숫자
3. **확인**: Memory 사용량 게이지 바
4. **확인**: DB Latency (ms 단위)
5. **확인**: SYS-LOG 목록
6. "Refresh" 클릭 → **확인**: 데이터 갱신
7. 스크린샷: `screenshots/part1-14-monitoring.png`

### NEXUS 조직도
사이드바 → 조직 관리 → NEXUS 조직도

8. **확인**: ReactFlow 캔버스 로딩 (노드가 보임)
9. **확인**: 에이전트/부서 노드가 연결선과 함께 표시
10. 마우스 휠로 줌 인/아웃 → **확인**: 작동
11. "Fit View" 클릭 → **확인**: 전체 노드 화면에 맞춤
12. 노드 1개 클릭 → **확인**: 속성 패널 열림
13. "Export" 클릭 → **확인**: JSON 파일 다운로드
14. 스크린샷: `screenshots/part1-14-nexus.png`

## 결과 저장
results/part1-14.md에 각 단계 PASS/FAIL 기록
