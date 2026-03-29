# Part 1-11: CLI / API 키 테스트 (2분)

## 성공 기준
프로바이더별 동적 필드 + 등록/삭제

## 테스트 단계

사이드바 → 운영 → CLI / API 키

1. **확인**: 사용자 선택 드롭다운 존재
2. CLI Token 섹션 확인
3. API 키 섹션 → 프로바이더 드롭다운 클릭:
   - `anthropic` 선택 → **확인**: "API Key" 필드 1개
   - `kis` 선택 → **확인**: "App Key" + "App Secret" + "Account No" 3개 필드
   - `telegram` 선택 → **확인**: "Bot Token" + "Chat ID" 2개 필드
4. 스크린샷: `screenshots/part1-11-providers.png`
5. `serper` 선택 → "api_key" 필드에 `sk-chrome-qa-test-0329` 입력
6. "등록" 클릭
7. **확인**: 토스트 "등록되었습니다"
8. 방금 등록한 키의 삭제 버튼 클릭
9. **확인**: 확인 다이얼로그 → "삭제" → 키 사라짐
10. 스크린샷: `screenshots/part1-11-crud.png`

## 결과 저장
results/part1-11.md에 각 단계 PASS/FAIL 기록
