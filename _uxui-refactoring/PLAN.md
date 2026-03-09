# CORTHEX v2 UX/UI 총 리팩토링 플랜

> 작성일: 2026-03-08
> 상태: 진행 가능 (기능 개발 완료)

## 배경 및 맥락

### 왜 이 플랜이 나왔는가
- 사용자가 Gemini Ultra 플랜($249.99/월)을 구독 중
- Antigravity에서 바나나2(Gemini 3.1 Flash Image)로 이미지 생성 품질이 좋음
- Claude(서버)가 UI 설명서 작성 → Antigravity가 이미지 생성 → Claude가 이미지 보고 코딩하는 파이프라인 구상
- 자동화를 시도했으나, 바나나2 확장의 이미지 생성은 별도 API 키 + 빌링 계정이 필요해서 서버에서 직접 호출은 불가
- 결론: **수동 3단계 파이프라인**으로 결정

### 기술 환경
- 서버: Ubuntu (Oracle Cloud) - Claude Code 동작 중
- PC: Windows - VS Code + Claude Code
- Gemini CLI: 서버에 설치 완료, OAuth 인증 완료 (Ultra 한도 텍스트 가능)
- Antigravity: PC 브라우저에서 Ultra 한도로 이미지 생성 가능
- Git: 서버 ↔ PC 간 코드/이미지 공유 수단

### 서버 Gemini CLI 인증 정보
- OAuth 인증 완료 (elddlwkd@gmail.com)
- 설정 파일: `/home/ubuntu/.gemini/oauth_creds.json`, `settings.json`, `google_accounts.json`
- 텍스트 생성: ✅ 작동 (gemini-3-flash, gemini-3.1-pro 모두 가능)
- 이미지 생성: ❌ (바나나2 확장은 API 키 빌링 필요)
- 바나나2 확장: `/home/ubuntu/.gemini/extensions/nanobanana/` 에 설치됨 (빌링 미연결로 미사용)

---

## 리팩토링 파이프라인 (3단계)

### 1단계: Claude(서버) → 페이지별 UX/UI 상세 설명서 작성

**담당**: 서버 Claude Code (이 서버)
**출력 위치**: `_uxui-refactoring/specs/`
**출력 형식**: 페이지별 마크다운 파일

각 페이지 설명서에 포함할 내용:
- **페이지 목적**: 이 화면이 왜 필요한지, 누가 쓰는지
- **레이아웃 구조**: 상단/좌측/메인/우측 영역 배치, 비율
- **컴포넌트 목록**: 각 영역에 들어가는 UI 요소들
- **데이터 바인딩**: 어떤 API에서 어떤 데이터를 가져와서 어디에 표시하는지
- **인터랙션**: 클릭, 호버, 드래그, 실시간 업데이트 등
- **상태 관리**: 로딩, 에러, 빈 상태 등
- **색상/톤앤매너**: 다크테마, 강조색, 폰트 사이즈 등
- **반응형**: 데스크톱/태블릿/모바일 대응
- **v1 참고**: v1에서 해당 화면이 어떻게 생겼었는지
- **이미지 생성 프롬프트**: Antigravity에서 바로 복붙할 수 있는 영문 프롬프트

페이지 목록 (예상):
```
specs/
├── 01-login.md
├── 02-dashboard.md
├── 03-command-center.md
├── 04-agent-management.md
├── 05-department-management.md
├── 06-conversation-detail.md
├── 07-strategy-room.md
├── 08-sketchvibe.md
├── 09-agora-debate.md
├── 10-sns-publishing.md
├── 11-tool-management.md
├── 12-cost-management.md
├── 13-settings.md
└── ... (필요에 따라 추가)
```

### 2단계: 사용자 → Antigravity에서 이미지 생성

**담당**: 사용자 (Antigravity 웹, Ultra 한도)
**입력**: 1단계에서 만든 설명서의 이미지 생성 프롬프트
**출력 위치**: `_uxui-refactoring/designs/`
**출력 형식**: PNG 이미지

작업 순서:
1. `git pull` (1단계 설명서 가져오기)
2. Antigravity 접속
3. 각 설명서의 "이미지 생성 프롬프트" 섹션을 복사
4. 바나나2로 이미지 생성
5. `_uxui-refactoring/designs/` 폴더에 저장
6. `git add . && git commit && git push`

파일 명명 규칙:
```
designs/
├── 01-login-desktop.png
├── 01-login-mobile.png
├── 02-dashboard-desktop.png
├── 02-dashboard-sidebar.png
├── 03-command-center-main.png
├── 03-command-center-chat.png
└── ...
```

### 3단계: Claude(서버) → 이미지 보고 코딩

**담당**: 서버 Claude Code (이 서버)
**입력**: 2단계에서 생성된 디자인 이미지
**출력**: 실제 React 컴포넌트 코드

작업 순서:
1. `git pull` (이미지 가져오기)
2. 각 이미지를 Read 도구로 확인
3. 이미지 + 1단계 설명서를 함께 참고하여 React 컴포넌트 구현
4. 기존 코드와 통합
5. 커밋 + 푸시

---

## 진행 시점

**선행 조건**: Epic 18, 19, 20 구현 완료 후
**이유**: 기능이 다 만들어진 다음에 UI를 입히는 게 효율적. 기능 없는 UI는 의미 없음.

---

## 추후 자동화 가능성

현재는 수동 3단계이지만, 나중에 자동화 가능한 경로:

1. **Google AI Studio 빌링 연결 시**: 바나나2 확장이 서버에서 직접 동작 → 2단계 자동화
2. **Gemini CLI OAuth로 이미지 생성 지원 시**: Google이 업데이트하면 바로 전환
3. **MCP 서버 커스텀 구축**: Gemini API 직접 호출하는 MCP 만들면 완전 자동화

---

## 관련 파일 위치

| 항목 | 경로 |
|------|------|
| 이 플랜 | `_uxui-refactoring/PLAN.md` |
| 페이지 설명서 | `_uxui-refactoring/specs/*.md` |
| 디자인 이미지 | `_uxui-refactoring/designs/*.png` |
| Gemini CLI 설정 | `~/.gemini/` |
| 바나나2 확장 | `~/.gemini/extensions/nanobanana/` |
| v1 기능 스펙 | `_bmad-output/planning-artifacts/v1-feature-spec.md` |
| v1 소스코드 | `/home/ubuntu/CORTHEX_HQ/` |
