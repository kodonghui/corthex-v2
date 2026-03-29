# Part 1-7: AI 에이전트 관리 테스트 (5분)

## 성공 기준
에이전트 생성 + Go Online + 필터 3종 + 상세 패널 3탭 + 수정 + 비활성화 + 재활성화 + 영구 삭제

## 테스트 단계

사이드바 → AI 관리 → AI 에이전트

### 에이전트 생성
1. "NEW AGENT" 클릭
2. 이름: `보안감사봇`
3. 역할: `보안 취약점 감사 전문가`
4. 티어: `Specialist` 선택
5. 모델: `Claude Haiku 4.5` 선택
6. 부서: 아무 부서 선택
7. 소울: `당신은 보안 감사 전문가입니다. 취약점을 찾아 리포트합니다.`
8. "생성" 클릭
9. **확인**: 목록에 "보안감사봇" 추가 (상태: offline)
10. 스크린샷: `screenshots/part1-07-create.png`

### Go Online
11. "보안감사봇" 행 클릭 → 상세 패널
12. Config 탭에서 "Go Online" 초록색 버튼 확인
13. "Go Online" 클릭
14. **확인**: 상태가 "online" (초록색 점)
15. **확인**: "Go Online" 사라지고 "Deactivate Agent" 표시
16. 스크린샷: `screenshots/part1-07-online.png`

### 티어 필터
17. "Filter_Tier" → "MANAGER" 선택
18. **확인**: Manager 에이전트만 표시
19. 필터 해제

### 상태 필터
20. "Filter_Status" → "ONLINE" 선택
21. **확인**: 온라인 에이전트만 표시
22. 필터 해제

### 검색
23. 검색창에 `보안` 입력
24. **확인**: "보안감사봇"만 필터됨

### 상세 패널 탭
25. "보안감사봇" 클릭
26. **Soul 탭** → 소울 텍스트 확인
27. **Config 탭** → 설정 항목 확인
28. **Memory 탭** → 메모리 현황 확인
29. 스크린샷: `screenshots/part1-07-detail.png`

### 수정
30. 이름을 `보안감사봇수정`으로 변경
31. "저장" 클릭
32. **확인**: 이름 변경됨

### Semantic Cache 토글
33. Config 탭에서 Semantic Cache 토글 클릭
34. **확인**: 즉시 반영

### 비활성화
35. "Deactivate Agent" 클릭
36. 확인 다이얼로그 → "비활성화" 클릭
37. **확인**: 상태 변경됨

### 재활성화 (Reactivate)
38. "Reactivate Agent" 초록색 버튼 확인
39. "Reactivate Agent" 클릭
40. **확인**: 상태 "online" 복원
41. **확인**: "Deactivate Agent" 다시 표시
42. 스크린샷: `screenshots/part1-07-reactivate.png`

### 영구 삭제
43. "Deactivate Agent" 클릭 → 비활성화
44. "Permanently Delete" 빨간 버튼 클릭
45. 확인 다이얼로그 → 확인
46. **확인**: 에이전트가 목록에서 완전히 사라짐
47. 스크린샷: `screenshots/part1-07-deleted.png`

## 결과 저장
results/part1-07.md에 각 단계 PASS/FAIL 기록
