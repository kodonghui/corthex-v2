# 3명의 QA 에이전트 실행 방법

## Agent 1: Claude Code (VS Code) — Playwright MCP

### 이게 뭐냐
지금 대표님이 쓰고 있는 VS Code 안의 Claude Code에서, **Playwright MCP**라는 도구로 브라우저를 자동 조작하는 방식.
코드로 "이 URL 가서 스크린샷 찍어" 하면 자동으로 함.

### 이미 설치됨
이전 세션에서 아래 명령어로 설치 완료:
```bash
claude mcp add playwright -- npx @playwright/mcp@latest
```

### 실행 방법
1. VS Code에서 **새 Claude Code 세션** 시작 (Ctrl+L 또는 새 터미널)
2. 아래 프롬프트를 통째로 복사해서 붙여넣기:
   → 📄 `PROMPT-1-PLAYWRIGHT-CLAUDE-CODE.md` 파일 내용 전체
3. Claude Code가 알아서 브라우저 열고, 페이지 돌아다니고, 스크린샷 찍고, 버그 기록함
4. 중간중간 "이 도구 실행해도 되냐"고 물어보면 → **허용**

### 주의
- Playwright는 **새 브라우저 창**을 엶 (대표님 Chrome이랑 별개)
- 로그인은 프롬프트에 있는 계정으로 자동으로 함
- 결과: `_qa-e2e/playwright-claude-code/BUGS.md`에 저장됨

### 트러블슈팅
| 문제 | 해결 |
|------|------|
| "playwright not found" | `npx @playwright/mcp@latest install` 실행 |
| 브라우저가 안 열림 | Claude Code 재시작 |
| 스크린샷이 안 보임 | `_qa-e2e/playwright-claude-code/screenshots/` 확인 |

---

## Agent 2: Gemini (Antigravity IDE)

### 이게 뭐냐
Google의 AI 개발 도구. VS Code랑 비슷한 에디터인데 Gemini 3 Pro가 내장되어 있고,
**브라우저를 직접 열어서 사이트를 볼 수 있음.**

### Antigravity란?
- Google이 만든 **AI 네이티브 IDE** (VS Code 포크)
- 무료
- Gemini가 에디터 + 터미널 + **브라우저**에 직접 접근 가능
- 브라우저 서브에이전트가 스크린샷 자동 캡처 가능

### 실행 방법

**방법 A — Antigravity IDE에서 (브라우저 자동 조작)**
1. Antigravity IDE 실행
2. 이 프로젝트 폴더 열기
3. Gemini 채팅에 아래 프롬프트 붙여넣기:
   → 📄 `PROMPT-2-BROWSER-GEMINI.md` 파일 내용 전체
4. Gemini가 내장 브라우저로 사이트 접속 → 검수 → 버그 기록

**방법 B — Gemini 앱(gemini.google.com)에서 (스크린샷 분석)**
1. 대표님이 직접 Chrome에서 corthex-hq.com 각 페이지 스크린샷을 찍음
2. gemini.google.com 접속
3. 스크린샷 파일 업로드 (최대 10개 동시)
4. 프롬프트: "이 UI 스크린샷들에서 레이아웃 문제, 깨진 요소, 디자인 불일치를 찾아줘"
5. (이건 수동이라 좀 귀찮음)

**방법 C — Chrome Auto Browse (AI Pro/Ultra 구독 필요, 미국 전용)**
- Chrome 사이드 패널에서 Gemini에게 "corthex-hq.com 가서 QA 해줘" 지시
- 현재 미국 전용이라 한국에서는 안 될 수 있음

### 추천
**방법 A (Antigravity IDE)가 가장 좋음.** 브라우저를 직접 열어서 볼 수 있고,
프로젝트 코드도 접근 가능해서 원인 코드까지 추적 가능.

### 주의
- Antigravity는 아직 프리뷰 단계라 가끔 크래시 날 수 있음
- Gemini가 없는 버그를 만들어내는(hallucination) 경향이 있어서 → 사람 검증 필요
- 결과: `_qa-e2e/browser-gemini/BUGS.md`에 저장해달라고 지시

---

## Agent 3: Claude Desktop (Cowork)

### 이게 뭐냐
대표님 컴퓨터에 설치된 Claude Desktop 앱. "Cowork" 모드를 쓰면 **자율적으로 여러 단계를 실행**할 수 있음.
Playwright MCP를 추가하면 브라우저도 자동 조작 가능.

### Cowork란?
- Claude Desktop 안의 **에이전트 모드**
- 일반 Chat과 다름: Chat은 1문1답, Cowork는 알아서 여러 단계를 실행
- 파일 읽기/쓰기 가능
- Pro / Max / Team / Enterprise 구독 필요

### 설정 방법 (Playwright MCP 추가)

1. Claude Desktop 완전 종료 (작업 관리자에서 프로세스까지 죽이기)

2. 아래 파일을 메모장으로 열기:
   ```
   C:\Users\elddl\AppData\Roaming\Claude\claude_desktop_config.json
   ```
   (파일이 없으면 새로 만들기)

3. 아래 내용 붙여넣기:
   ```json
   {
     "mcpServers": {
       "playwright": {
         "command": "npx",
         "args": [
           "@playwright/mcp@latest",
           "--viewport-size", "1280x720"
         ]
       }
     }
   }
   ```

4. 저장 후 Claude Desktop 재시작

5. Claude Desktop 열면 좌측 하단에 MCP 도구 아이콘 (망치 모양) 보임 → 클릭해서 playwright 도구들이 있는지 확인

### 실행 방법

1. Claude Desktop 열기
2. **Cowork 모드** 선택 (Chat 말고)
3. 아래 프롬프트 붙여넣기:
   → 📄 `PROMPT-3-CLAUDE-DESKTOP.md` 파일 내용 전체
4. Claude가 Playwright로 브라우저 열고, 페이지 돌아다니면서 검수
5. 도구 실행 허락 물어보면 → **허용**

### Chat vs Cowork 차이

| | Chat | Cowork |
|---|---|---|
| 대화 방식 | 1문1답 | 알아서 여러 단계 |
| 파일 접근 | 제한적 | 가능 |
| 브라우저 | 불가 | MCP로 가능 |
| 토큰 소비 | 적음 | 많음 (스크린샷 분석) |

### 주의
- Cowork는 **토큰을 빠르게 소비**함 (스크린샷마다 토큰 사용)
- 41페이지 × 2계정 = 82번 방문이라 시간이 꽤 걸림
- Node.js 18 이상 설치 필요 (`node -v`로 확인)
- 결과: `_qa-e2e/browser-claude-desktop/BUGS.md`에 저장해달라고 지시

### 트러블슈팅
| 문제 | 해결 |
|------|------|
| MCP 도구가 안 보임 | Claude Desktop 완전 종료 후 재시작 |
| "npx not found" | Node.js 설치 필요 (nodejs.org) |
| Cowork 모드가 없음 | Pro/Max 구독 필요 |
| 브라우저가 안 열림 | `--headed` 옵션 추가해보기 |

---

## 3명 동시 실행 순서

```
1. Claude Desktop 설정 (위의 claude_desktop_config.json 수정)
   → Claude Desktop 재시작
   → Cowork 모드에서 PROMPT-3 붙여넣기
   → 실행 시작

2. Antigravity IDE 실행
   → 프로젝트 열기
   → PROMPT-2 붙여넣기
   → 실행 시작

3. VS Code의 Claude Code 새 세션
   → PROMPT-1 붙여넣기
   → 실행 시작

(3명 동시에 돌아감 → 각자 결과를 _qa-e2e/ 아래에 저장)
```

## 결과 확인
```
_qa-e2e/
├── playwright-claude-code/BUGS.md    ← Claude Code 결과
├── browser-gemini/BUGS.md            ← Gemini 결과
└── browser-claude-desktop/BUGS.md    ← Claude Desktop 결과
```

3명 다 끝나면 → 결과 합산해서 수정 시작
