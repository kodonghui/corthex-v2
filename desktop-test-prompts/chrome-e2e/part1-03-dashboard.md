# Part 1-3: 대시보드 테스트 (2분)

## 성공 기준
3개 카드에 숫자 표시, 버튼 2개 클릭 반응

## 테스트 단계

사이드바 → 대시보드 (또는 /admin)

### UI 요소 확인
1. **확인**: 상단 3개 카드:
   - "부서 수" 또는 "DEPARTMENTS" — 숫자 표시
   - "활성 사용자" 또는 "ACTIVE USERS" — 숫자 표시
   - "온라인 에이전트" 또는 "AUTONOMOUS AGENTS" — 숫자 표시
2. **확인**: Health Status 섹션 (게이지 또는 퍼센트)
3. **확인**: Recent Activity 테이블 (USER/AGENT 목록)
4. **확인**: Department Overview 섹션
5. 스크린샷: `screenshots/part1-03-dashboard.png`

### 버튼 테스트
6. "로그 내보내기" 클릭 → **확인**: CSV 파일 다운로드
7. "전체 기록 보기" 클릭 → **확인**: 토스트 메시지
8. 스크린샷: `screenshots/part1-03-buttons.png`

## 결과 저장
results/part1-03.md에 각 단계 PASS/FAIL 기록
