# Claude 세션용 프롬프트 템플릿

## 공통 사전 작업 (각 세션에서)

```
/model claude-sonnet-4-6
```

---

## 프롬프트 1: `/ui-ux-pro-max`

```
나는 {프로젝트이름}이라는 SaaS 프로덕트의 UXUI를 완전히 새로 만들고 싶어.
기존 디자인은 무시해. 색상, 테마, 레이아웃 전부 네가 자유롭게 정해.

## 디자인 방향
{레퍼런스 서비스}를 참고해. {핵심 키워드 설명}.
다른 팀이 동시에 완전히 다른 스타일로 만들고 있으니까 네 개성을 확실히 보여줘.

## 작업 환경
이 프로젝트는 워크트리야. 여기서만 작업해. 메인 경로에 절대 쓰지 마.
결과물 경로: _uxui-redesign/02-design/ui-ux-pro-max/

## 참고 자료 (이것만 봐)
- _uxui-redesign/01-spec/prd.md — 제품 요구사항 (기능만 참고, 디자인 관련 내용 무시)
- _uxui-redesign/01-spec/api-endpoints.md — 백엔드 API 엔드포인트
- _uxui-redesign/01-spec/shared-types.ts — TypeScript 데이터 타입 정의

## 만들어야 할 페이지
{페이지 목록}

## 작업 방법
1. /ui-ux-pro-max 스킬을 사용해서 디자인 시스템 + 페이지 디자인을 만들어.
2. 결과물은 standalone HTML 파일 (Tailwind CDN 사용)로 만들어.
   - 브라우저에서 더블클릭으로 바로 볼 수 있어야 해.
   - React/빌드 필요 없는 순수 HTML+CSS+JS.
3. 파일 구조:
   - design-system.html (색상, 타이포, 컴포넌트 가이드)
   - app-{페이지이름}.html, admin-{페이지이름}.html
4. 각 페이지에 실제 API 엔드포인트 경로를 주석으로 표시해줘.

## 주의사항
- 기존 packages/ 코드는 보지 마. 새로 만드는 거야.
- 한국어 UI (메뉴, 라벨 등).
- 모든 페이지가 일관된 디자인 시스템을 따라야 해.
```

---

## 프롬프트 2: `/kdh-libre-uxui-full-auto-pipeline`

```
나는 {프로젝트이름}이라는 SaaS 프로덕트의 UXUI를 완전히 새로 만들고 싶어.
기존 디자인은 무시해. 색상, 테마, 레이아웃 전부 네가 자유롭게 정해.

## 디자인 방향
{레퍼런스 서비스}를 참고해. {핵심 키워드 설명}.
다른 팀이 동시에 완전히 다른 스타일로 만들고 있으니까 네 개성을 확실히 보여줘.

## 작업 환경
이 프로젝트는 워크트리야. 여기서만 작업해. 메인 경로에 절대 쓰지 마.
결과물 경로: _uxui-redesign/02-design/libre-ui-synth/

## 참고 자료 (이것만 봐)
- _uxui-redesign/01-spec/prd.md — 제품 요구사항 (기능만 참고, 디자인 관련 내용 무시)
- _uxui-redesign/01-spec/api-endpoints.md — 백엔드 API 엔드포인트
- _uxui-redesign/01-spec/shared-types.ts — TypeScript 데이터 타입 정의

## 만들어야 할 페이지
{페이지 목록}

## 작업 방법
1. /kdh-libre-uxui-full-auto-pipeline 스킬을 사용해서 디자인을 만들어.
2. 결과물은 standalone HTML 파일 (Tailwind CDN 사용)로 만들어.
   - 브라우저에서 더블클릭으로 바로 볼 수 있어야 해.
   - React/빌드 필요 없는 순수 HTML+CSS+JS.
3. 파일 구조:
   - design-system.html (색상, 타이포, 컴포넌트 가이드)
   - app-{페이지이름}.html, admin-{페이지이름}.html
4. 각 페이지에 실제 API 엔드포인트 경로를 주석으로 표시해줘.

## 주의사항
- 기존 packages/ 코드는 보지 마. 새로 만드는 거야.
- 한국어 UI (메뉴, 라벨 등).
- 모든 페이지가 일관된 디자인 시스템을 따라야 해.
```

---

## 프롬프트 3: Subframe

```
나는 {프로젝트이름}이라는 SaaS 프로덕트의 UXUI를 완전히 새로 만들고 싶어.
기존 디자인은 무시해. 색상, 테마, 레이아웃 전부 네가 자유롭게 정해.

## 디자인 방향
{레퍼런스 서비스}를 참고해. {핵심 키워드 설명}.
다른 팀이 동시에 완전히 다른 스타일로 만들고 있으니까 네 개성을 확실히 보여줘.

## 작업 환경
이 프로젝트는 워크트리야. 여기서만 작업해. 메인 경로에 절대 쓰지 마.
결과물 경로: _uxui-redesign/02-design/subframe/

## 참고 자료 (이것만 봐)
- _uxui-redesign/01-spec/prd.md — 제품 요구사항 (기능만 참고, 디자인 관련 내용 무시)
- _uxui-redesign/01-spec/api-endpoints.md — 백엔드 API 엔드포인트
- _uxui-redesign/01-spec/shared-types.ts — TypeScript 데이터 타입 정의

## 만들어야 할 페이지
{페이지 목록}

## 작업 방법
1. /subframe:design 스킬을 사용해서 Subframe 프로젝트에 페이지를 디자인해.
   - Subframe 프로젝트 ID: {프로젝트ID}
   - 먼저 테마(색상, 타이포 설정)를 잡고 페이지별로 디자인.
2. 디자인 완료 후 /subframe:develop로 코드를 생성해서 저장.
3. 각 페이지의 Subframe URL도 page-links.md에 기록.

## 주의사항
- 기존 packages/ 코드는 보지 마. 새로 만드는 거야.
- 한국어 UI (메뉴, 라벨 등).
- 모든 페이지가 일관된 디자인 시스템을 따라야 해.
```

---

## 사용법

1. `{프로젝트이름}` → 실제 프로젝트명으로 교체
2. `{레퍼런스 서비스}` → 참고할 서비스 이름 (예: "Linear, Vercel")
3. `{핵심 키워드 설명}` → 디자인 방향 한 줄 설명
4. `{페이지 목록}` → 실제 페이지 목록
5. `{프로젝트ID}` → Subframe 프로젝트 ID
