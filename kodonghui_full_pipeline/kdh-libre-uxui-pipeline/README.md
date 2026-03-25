# kdh-uxui-full-auto-pipeline

## Overview

SaaS 프로덕트의 UXUI를 **처음부터 완전히 새로 만드는** 자동화 파이프라인.
여러 AI 도구(Claude + Gemini + Subframe)를 병렬로 돌려서 서로 다른 디자인 시안을 뽑고,
마음에 드는 걸 골라서 실제 React 코드로 구현하는 전체 워크플로우.

## 왜 만들었나

- AI에게 "자유롭게 만들어"라고 하면 다 **사이드바 + 파란색**으로 수렴함
- 하나만 만들면 비교 대상이 없어서 좋은지 나쁜지 판단이 어려움
- 여러 개를 동시에 만들고 비교해야 진짜 좋은 디자인을 고를 수 있음

## 핵심 아이디어

1. **스펙 분리**: 기능 스펙(PRD, API)과 디자인을 분리
2. **병렬 디자인**: 여러 AI 도구가 각각 독립된 워크트리에서 작업
3. **HTML 미리보기**: 빌드 없이 브라우저에서 바로 확인
4. **채택 후 구현**: 마음에 드는 디자인 골라서 React로 옮기기

## 사용 도구

| 도구 | 역할 | 강점 |
|------|------|------|
| Claude `/ui-ux-pro-max` | 디자인 시스템 + HTML 생성 | 체계적, 컴포넌트 일관성 |
| Claude `/kdh-libre-uxui-full-auto-pipeline` | 7단계 Foundation + 5단계 Per-Page | 브랜드 이론 기반 심층 디자인 |
| Claude `/subframe:design` | Subframe 비주얼 에디터 | 드래그앤드롭 디자인 |
| Google Gemini + Nano Banana 2 | 이미지 시안 → HTML 변환 | 이미지 생성 + 저렴한 토큰 |

## 이 파이프라인의 파일 구조

```
kdh-uxui-full-auto-pipeline/
├── README.md                    ← 이 파일
├── CLAUDE.md                    ← 이 파이프라인 전용 Claude 지침
├── 01-workflow.md               ← 전체 워크플로우 (단계별 상세)
├── 02-prompts-claude.md         ← Claude 세션용 프롬프트 템플릿
├── 03-prompts-gemini.md         ← Gemini 세션용 프롬프트 템플릿
└── 04-libre-pipeline-detail.md  ← /kdh-libre-uxui-full-auto-pipeline 상세 문서
```

## Quick Start

1. `01-workflow.md` 읽기
2. 스펙 폴더 준비 (`_uxui-redesign/01-spec/`)
3. 워크트리 생성
4. 각 세션에 프롬프트 붙여넣기
5. HTML 결과물 비교
6. 채택 → React 구현
