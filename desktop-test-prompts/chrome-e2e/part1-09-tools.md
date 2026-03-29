# Part 1-9: 도구 관리 테스트 (2분)

## 성공 기준
도구 목록 표시 + 검색 + 등록 폼 + 퍼미션 매트릭스

## 테스트 단계

사이드바 → AI 관리 → 도구 관리

1. **확인**: 도구 목록이 카테고리별로 표시됨
2. 검색창에 `search` 입력 → **확인**: 웹 검색 관련 도구만 필터
3. "Register Tool" 클릭 → **확인**: 새 도구 등록 폼 열림
4. 폼 필드 확인 (이름, 카테고리, 설명 등) → 닫기/취소
5. 스크린샷: `screenshots/part1-09-tools-list.png`
6. Agent Permission Matrix 섹션 찾기
7. 에이전트별 도구 체크박스 확인
8. 체크박스 1개 변경 → "저장" 클릭
9. **확인**: 토스트 "권한이 수정되었습니다"
10. 스크린샷: `screenshots/part1-09-permissions.png`

## 결과 저장
results/part1-09.md에 각 단계 PASS/FAIL 기록
