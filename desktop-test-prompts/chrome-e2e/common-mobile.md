# CORTHEX 모바일 반응형 E2E 테스트 — 공통 컨텍스트

## 접속 정보
- Admin URL: https://corthex-hq.com/admin
- App URL: https://corthex-hq.com
- Admin 계정: admin / admin1234
- CEO 계정: ceo / ceo1234

## 브라우저 설정
- **반드시 뷰포트를 390x844 (iPhone 14)로 설정한 후 테스트**
- Chrome DevTools → Toggle Device Toolbar → iPhone 14 선택
- 또는 브라우저 창 크기를 390px 너비로 조절

## 규칙
- 각 단계 실행 후 결과를 PASS/FAIL로 보고
- 스크린샷을 반드시 찍어서 screenshots/ 폴더에 저장
- **모바일에서 특히 확인할 것**: 가로 스크롤 없음, 터치 타겟 44px 이상, 텍스트 잘림 없음, 사이드바 햄버거 메뉴 작동
- 결과를 results/part3-NN.md 파일에 저장

## 보고서 양식 — 최대한 상세하게!
```markdown
# Part 3-NN: [테스트 이름] 모바일 결과

## 테스트 환경
- 일시: YYYY-MM-DD HH:MM
- 브라우저: Chrome (390x844)
- OS: (자동 감지)

## 단계별 결과
| # | 단계 | 결과 | URL | 비고 |
|---|------|------|-----|------|

## 모바일 이슈
### MOBILE-001: [제목]
- 페이지 URL: [정확한 URL]
- 기대: 모바일 레이아웃 정상
- 실제: [문제 상세 설명]
- 가로 스크롤 발생 여부: Y/N
- 터치 타겟 크기: (44px 미만이면 보고)
- 텍스트 잘림/넘침: (있으면 어떤 요소)
- 스크린샷: screenshots/part3-NN-mobile001.png

## UX 탐색 발견사항 — 최소 5개 이상 시도할 것!
- [눌러본 요소] → [URL] → [모바일에서의 결과]

## 요약
- 총 단계: N
- PASS: N
- FAIL: N
- 모바일 이슈: N건
```
