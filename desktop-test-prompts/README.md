# CORTHEX v2 -- Gemini Browser E2E Test Prompts

Antigravity/Gemini 브라우저 자동화 테스트용 프롬프트입니다.
각 파트는 독립적인 테스트 스크립트로, Gemini가 Chrome 브라우저를 직접 제어하며 실행합니다.

**DB 상태**: 기본 시드 적용됨 (1회사 "CORTHEX HQ" + admin/ceo 유저 + 4부서 + 4에이전트). 온보딩에서 회사명/부서/에이전트를 수정하는 것부터 시작.

| 파트 | 파일 | 소요 시간 | 내용 |
|------|------|-----------|------|
| 0 | part0-setup.md | ~3분 | 환경 준비, 로그인 확인, 버그 보고 양식 |
| 1 | part1-admin.md | ~25분 | Admin 패널 전체 (로그인, 온보딩, CRUD, 에이전트, 권한 등) |
| 2 | part2-app.md | ~30분 | CEO App 전체 (Hub, 채팅, 슬래시 명령어, 협업, Big Five 등) |
| 3 | part3-mobile.md | ~10분 | 모바일 반응형 테스트 (iPhone + iPad) |
| 4 | part4-evaluation.md | ~5분 | 종합 평가표 + 버그 리스트 |

## 실행 방법

1. Antigravity에서 Chrome 브라우저를 엽니다
2. 각 파트 파일의 내용을 Gemini에게 전달합니다
3. Gemini가 브라우저를 직접 제어하며 각 단계를 수행합니다
4. 각 파트 완료 후 결과를 보고합니다

## 기본 정보

- Admin 패널: https://corthex-hq.com/admin (admin / admin1234)
- CEO App: https://corthex-hq.com (admin / admin1234)

## 핵심 규칙

1. 페이지를 "보기만" 하지 말 것. 버튼은 클릭, 폼은 입력, 드롭다운은 열어볼 것.
2. 각 단계마다 "성공 기준"을 확인할 것.
3. 에이전트 채팅 응답은 30초~2분 소요. 반드시 끝까지 대기.
4. 에러/버그 발견 시 Part 0의 버그 보고 양식으로 상세 보고할 것.
5. 에러 때문에 뒤 단계가 불가능한 경우에만 건너뛰기. 그 외 모든 항목을 빠짐없이 테스트.

## 파트 간 의존성

- **Part 0** (환경 준비)가 먼저. 로그인이 안 되면 나머지 전부 불가.
- **Part 1** (Admin)이 기반. 여기서 회사/부서/에이전트를 만들어야 Part 2 (App)에서 쓸 수 있음.
- Part 1에서 막히면 → Part 2로 넘어가지 말고 → 막힌 지점을 버그 리스트에 기록.
- **Part 3** (모바일)은 독립적. Part 1-2가 막혀도 진행 가능.

## API 키

서버 .env에 이미 등록되어 있어서 Credentials 페이지에서 등록 안 해도 됩니다.
