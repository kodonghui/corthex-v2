# HTML → React TSX 일괄 변환 프롬프트

아래 프롬프트를 Gemini Antigravity에 **그대로** 붙여넣으세요.
경로의 `{폴더명}` 부분만 대상에 맞게 교체하면 됩니다.

## 경로 교체표

| 대상 | `{폴더명}` 값 | HTML 위치 | TSX 출력 위치 |
|---|---|---|---|
| gemini5 | `gemini5` | `gemini5/html/` + `gemini5/html/admin/` | `gemini5/react/` + `gemini5/react/admin/` |
| claude_libre-ui-synth | `claude_libre-ui-synth` | 루트 `.html` | `react/` |
| claude_ui-ux-pro-max | `claude_ui-ux-pro-max` | 루트 `.html` | `react/` |
| gemini | `gemini` | `html/` | `react/` |
| gemini2 | `gemini2` | `html/` | `react/` |
| gemini3 | `gemini3` | `html/` | `react/` |
| gemini4 | `gemini4` | `html/` | `react/` |

---

## 프롬프트 (복사해서 붙여넣기)

````
기존 react/ 폴더가 있으면 삭제하고, 아래 규칙대로 처음부터 다시 변환해라.

━━━━━━━━━━━━━━━━━━━━━━━
대상
━━━━━━━━━━━━━━━━━━━━━━━

경로: C:\Users\elddl\Desktop\PJ0_CORTHEX\corthex-v2\_uxui-redesign\02-design\{폴더명}

이 경로 하위의 모든 .html 파일을 찾아서 React TSX 컴포넌트로 변환해라.
서브폴더(예: html/admin/)가 있으면 출력에서도 같은 구조를 유지해라.

입력: {폴더명}/html/*.html + {폴더명}/html/admin/*.html
출력: {폴더명}/react/*.tsx + {폴더명}/react/admin/*.tsx

(html/ 하위 폴더가 없는 경우: 루트의 .html → react/*.tsx)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
변환 규칙 (하나라도 빠지면 실패)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【1】 파일명 변환: kebab-case.html → PascalCase.tsx
예시:
  home.html → Home.tsx
  command-center.html → CommandCenter.tsx
  admin-dashboard.html → AdminDashboard.tsx
  design-system.html → DesignSystem.tsx
  ops-log.html → OpsLog.tsx
  admin/soul-templates.html → admin/SoulTemplates.tsx
  admin/org-chart.html → admin/OrgChart.tsx

규칙: 하이픈(-)으로 분리 → 각 단어 첫 글자 대문자 → 합치기

【2】 파일 구조 (모든 파일 동일)

맨 위 2줄:
  "use client";
  import React from "react";

함수 선언:
  function ComponentName() {
    return (
      <div>...</div>
    );
  }

맨 아래:
  export default ComponentName;

ComponentName은 파일명과 동일 (Home.tsx → function Home)

【3】 HTML 보일러플레이트 완전 제거

다음을 전부 삭제:
  - <!DOCTYPE html>
  - <html lang="..."> ... </html> (여는 태그, 닫는 태그 모두)
  - <head> ... </head> 전체 블록 (단, <style> 내용은 【4】에서 별도 처리)
  - <body> ... </body> (여는 태그, 닫는 태그만 제거. 내부 콘텐츠는 유지)
  - <meta ...> 태그 전부
  - <title>...</title>
  - <link ...> 태그 전부
  - <script src="https://cdn.tailwindcss.com"></script>
  - <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
  - <script>tailwind.config = { ... }</script> 블록 전체
  - <script>lucide.createIcons()</script>
  - 기타 모든 <script> 태그

<body> 안의 HTML 콘텐츠만 남긴다.

【4】 <style> 블록 처리

<head> 안의 <style> 블록에 있는 CSS를 추출해서:

4-1. theme() 함수 치환
  HTML에서 tailwind.config에 정의된 값을 참조하는 theme() 함수가 있다.
  이것은 React에서 작동하지 않으므로 실제 값으로 치환해라.

  치환표 (이 프로젝트의 tailwind.config 기준):
    theme('colors.white')       → #FFFFFF
    theme('colors.black')       → #000000
    theme('colors.gray.900')    → #111111
    theme('colors.gray.500')    → #666666
    theme('colors.gray.300')    → #999999
    theme('colors.gray.100')    → #EEEEEE
    theme('colors.status.green') → #22c55e
    theme('colors.status.red')  → #ef4444
    theme('letterSpacing.tighter') → -0.04em
    theme('letterSpacing.tight')   → -0.02em
    theme('letterSpacing.normal')  → 0
    theme('letterSpacing.wide')    → 0.02em
    theme('letterSpacing.wider')   → 0.04em
    theme('letterSpacing.widest')  → 0.1em

  예시:
    변환 전: background-color: theme('colors.white');
    변환 후: background-color: #FFFFFF;

    변환 전: letter-spacing: theme('letterSpacing.tighter');
    변환 후: letter-spacing: -0.04em;

    변환 전: color: theme('colors.gray.500');
    변환 후: color: #666666;

  만약 치환표에 없는 theme() 값이 나오면, tailwind.config 블록에서 해당 값을 찾아서 치환해라.

4-2. 컴포넌트 상단에 const styles 선언
  const styles = `
    .title-display { font-size: 4rem; line-height: 1; ... }
    .body-base { font-size: 0.9375rem; ... }
    @keyframes fadeIn { ... }
    ...전체 CSS...
  `;

4-3. return 안에서 삽입
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: styles}} />
      <div className="...">
        ...본문...
      </div>
    </>
  );

핵심: theme() 함수를 하나도 남기지 마라. 전부 실제 값으로 치환해야 한다.

【5】 HTML 주석 → JSX 주석
  변환 전: <!-- 사이드바 -->
  변환 후: {/* 사이드바 */}

  변환 전: <!-- GET /api/workspace/dashboard/summary -->
  변환 후: {/* GET /api/workspace/dashboard/summary */}

  절대로 <!-- --> 를 JSX 안에 남기지 마라. 컴파일 에러 난다.

【6】 인라인 style 속성 변환
  HTML의 style="..." 문자열을 JSX의 style={{...}} 객체로 변환.

  변환 전: style="font-family: 'Inter', sans-serif;"
  변환 후: style={{fontFamily: "'Inter', sans-serif"}}

  변환 전: style="width: 62%"
  변환 후: style={{width: "62%"}}

  변환 전: style="background: linear-gradient(135deg, #7c3aed, #4f46e5)"
  변환 후: style={{background: "linear-gradient(135deg, #7c3aed, #4f46e5)"}}

  변환 전: style="margin-top: 8px; padding-left: 12px;"
  변환 후: style={{marginTop: "8px", paddingLeft: "12px"}}

  규칙:
  - CSS 속성명: kebab-case → camelCase (font-family → fontFamily, background-color → backgroundColor, -webkit-font-smoothing → WebkitFontSmoothing)
  - 값: 항상 문자열로 감싸기 ("62%", "8px", "none")
  - 여러 속성: 쉼표로 구분
  - style="" 문자열 형태를 절대 남기지 마라

【7】 SVG 아이콘 처리
  이 프로젝트는 lucide CDN이 아닌 인라인 <svg>를 사용하는 파일이 있다.
  인라인 SVG는 그대로 유지하되, JSX 호환 속성으로 변환해라:
    stroke-width → strokeWidth
    stroke-linecap → strokeLinecap
    stroke-linejoin → strokeLinejoin
    fill-rule → fillRule
    clip-rule → clipRule
    clip-path → clipPath
    xmlns:xlink → xmlnsXlink
    xlink:href → xlinkHref
    view-box → viewBox (이건 이미 camelCase일 수 있음)

  만약 <i data-lucide="..."> 패턴이 있는 파일이라면:
    변환 전: <i data-lucide="home" class="w-4 h-4"></i>
    변환 후: <Home className="w-4 h-4" />
    파일 상단에: import { Home, ... } from "lucide-react";
    아이콘 이름: kebab-case → PascalCase (user-plus → UserPlus)

【8】 Self-closing 태그
  HTML에서 닫는 태그가 없는 요소는 반드시 self-close:
    <img src="..."> → <img src="..." />
    <input type="text"> → <input type="text" />
    <br> → <br />
    <hr> → <hr />
    <source ...> → <source ... />
    <col ...> → <col ... />

【9】 HTML 속성 → JSX 속성
  class → className
  for → htmlFor
  tabindex → tabIndex
  colspan → colSpan
  rowspan → rowSpan
  readonly → readOnly
  maxlength → maxLength
  minlength → minLength
  autocomplete → autoComplete
  autofocus → autoFocus
  enctype → encType
  crossorigin → crossOrigin
  onclick → onClick
  onchange → onChange
  onsubmit → onSubmit
  onkeydown → onKeyDown
  onfocus → onFocus
  onblur → onBlur

【10】 a 태그 href 변환
  .html 파일 참조를 라우트 경로로 변환.

  규칙:
  - .html 확장자 제거
  - 앞에 / 붙이기
  - admin- 프리픽스가 있으면 /admin/ 경로로
  - admin/ 폴더 안의 파일이면 /admin/ 경로로
  - 그 외에는 /app/ 경로로

  예시:
    href="home.html"              → href="/app/home"
    href="dashboard.html"         → href="/app/dashboard"
    href="command-center.html"    → href="/app/command-center"
    href="admin-dashboard.html"   → href="/admin/dashboard"
    href="admin-agents.html"      → href="/admin/agents"
    href="admin/dashboard.html"   → href="/admin/dashboard"
    href="admin/soul-templates.html" → href="/admin/soul-templates"
    href="#"                      → href="#" (그대로 유지)
    href="https://..."            → href="https://..." (외부 링크 유지)

【11】 유지할 것 (수정 금지)
  - Tailwind CSS 클래스: 한 글자도 바꾸지 마라
  - 더미 데이터: 한국어 텍스트, 영어 텍스트, 숫자, 날짜 전부 유지
  - 레이아웃 구조: flex, grid, 사이드바, 헤더 등 구조 변경 금지
  - 한국어 주석/텍스트 전부 유지
  - API 주석 (<!-- GET /api/... -->) 은 JSX 주석으로 변환 후 유지

【12】 금지 사항
  - 외부 라이브러리 import 금지 (React만 허용, lucide 아이콘 있는 경우만 lucide-react 추가 허용)
  - 파일 내용 생략 금지: "// ... 나머지 동일", "/* 중략 */", "// rest of component" 같은 축약 절대 금지. 전체 코드를 빠짐없이 작성
  - 기존 디자인이나 레이아웃 변경 금지
  - TypeScript 타입/인터페이스 추가 금지 (순수 TSX만)
  - 새로운 className이나 스타일 추가 금지
  - 컴포넌트 분리 금지 (하나의 HTML = 하나의 TSX, 서브 컴포넌트로 쪼개지 마라)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

확인 묻지 말고 바로 전체 파일 변환 시작해라.
.html 파일만 변환 대상이다. .md, .json, 이미지 파일 등은 무시해라.
design-system.html도 변환 대상에 포함해라.
서브폴더(admin/ 등)가 있으면 출력에서도 같은 폴더 구조를 유지해라.
````
