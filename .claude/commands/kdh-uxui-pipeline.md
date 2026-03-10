---
name: 'kdh-uxui-pipeline'
description: 'UXUI 리팩토링 v8 — Subframe 중심. 디자인(브라우저 프리뷰) → 확정 → 코드변환. Usage: /kdh-uxui-pipeline [status|design PAGE|develop PAGE|batch PRIORITY]'
---

# CORTHEX UXUI Refactoring Pipeline v8

**Subframe 중심 파이프라인.**
디자인을 브라우저에서 먼저 보고, 확정한 후에 코드로 변환한다.

### 왜 v8인가? (v7까지 4번 실패)

```
v6: AI가 혼자 코딩 → 색상만 바꿈 → 사용자 거부
v7 시도1: home, agents, command-center → "파란색만 바꾼거?" → 사용자 거부
v7 시도2: dashboard → gradient cards 추가 → 사용자가 뭐가 바뀌었는지 모름
v7 시도3: command-center KPI카드 → 사용자가 뭐가 바뀌었는지 모름

핵심 원인: 사용자가 코딩 전에 디자인을 못 봄.
AI가 혼자 판단해서 코딩 → 결과가 기대와 다름 → 재작업 → 실패 반복.

v8 해결책: Subframe에서 디자인을 먼저 만들어서 브라우저로 보여준다.
사용자가 "이거 좋아!" 한 다음에만 코드로 변환한다.
```

### 도구 역할 (v8 명확화)

| 도구 | 정체 | 역할 | 비유 |
|------|------|------|------|
| **Subframe** | 비주얼 디자인 도구 (Figma 같은 것) | **디자인 생성 + 코드 변환** | 건축 설계사 + 시공사 |
| **Pro Max** | 디자인 데이터베이스 | 색상/폰트/스타일 참고 데이터 | 인테리어 카탈로그 |
| **LibreUIUX** | 감사(채점) 도구 | 완성 후 품질 체크 | 감리관 |

**Subframe이 핵심이다.** Pro Max와 LibreUIUX는 보조.

---

## Mode Selection

| 명령 | 설명 |
|------|------|
| `status` 또는 인자 없음 | 진행 상황 + 다음 작업 안내 |
| `design PAGE` | Step 1: Subframe에서 디자인 생성 → 브라우저 프리뷰 URL 제공 |
| `develop PAGE` | Step 2: 확정된 디자인을 실제 코드로 변환 + 배포 |
| `batch PRIORITY` | 해당 우선순위 전체 자동 (design → develop) |

---

## 2-Step 워크플로우

```
[Step 1: DESIGN] Subframe에서 디자인 생성
  → /subframe:design 호출 → 1~4개 디자인 변형 생성
  → app.subframe.com 프리뷰 URL 제공
  → 사용자가 브라우저에서 확인
  → "이거 좋아!" → Step 2로
  → "이 부분 바꿔줘" → 수정 → 다시 확인 (반복)

[Step 2: DEVELOP] 확정 디자인을 코드로 변환
  → /subframe:develop 호출 → React+Tailwind 코드 생성
  → 비즈니스 로직(API, state, handlers) 연결
  → 타입체크 → 커밋+푸시 → 배포
  → 사용자에게 배포 완료 보고
```

### 왜 2단계만?

```
이전 (v7): diagnose → preview → redesign → verify (4단계)
  → 진단 리포트, 디자인 스펙, 파티모드 3라운드, 재감사...
  → 문서만 잔뜩 만들고 정작 디자인은 안 바뀜

지금 (v8): design → develop (2단계)
  → Subframe이 디자인하고, 사용자가 눈으로 확인하고, 코드로 변환
  → 끝. 문서 없음. 결과로 말함.
```

---

## Mode: design PAGE (Step 1 — Subframe 디자인)

### 실행 방법

오케스트레이터가 직접 실행한다 (Worker 불필요):

```
1. 현재 페이지 코드 읽기
   - packages/app/src/pages/{페이지명}/ (전체 .tsx)
   - 관련 components/ (공유 컴포넌트)
   - 관련 routes/ (API 데이터 형태)

2. Pro Max에서 참고 데이터 조회
   python3 .claude/skills/ui-ux-pro-max/scripts/search.py "{페이지 키워드}" --design-system

3. /subframe:design 스킬 호출
   - 프로젝트: CORTHEX (AI 에이전트 기반 기업 운영 플랫폼)
   - 스타일: Dark mode, Enterprise SaaS (Linear/Vercel 느낌)
   - 현재 페이지의 모든 기능 요소 포함 (버튼, 테이블, 폼 등)
   - Pro Max 추천 데이터 반영
   - 현재 레이아웃과 확실히 다르게 요청

4. 사용자에게 프리뷰 URL 전달
   "브라우저에서 이 링크를 열어보세요: [URL]"
   "마음에 드시면 '확정', 수정이 필요하면 말씀해주세요."
```

### 사용자 확인 흐름

```
경우 1: "좋아!" → /kdh-uxui-pipeline develop PAGE 실행
경우 2: "이 부분 바꿔줘" → /subframe:design 다시 호출 (수정 반영) → URL 다시 전달
경우 3: "전체적으로 별로" → 다른 방향으로 다시 디자인
```

---

## Mode: develop PAGE (Step 2 — 코드 변환 + 배포)

### 전제 조건
- `design PAGE` 완료 (사용자가 Subframe 디자인 확정)

### 실행 방법

```
1. /subframe:develop 스킬 호출
   → 확정된 Subframe 디자인을 React+Tailwind 코드로 변환

2. 비즈니스 로직 연결
   - 기존 페이지의 API 호출, state, handlers를 새 컴포넌트에 연결
   - 기능은 100% 유지 — UI만 바뀜

3. 검증
   - npx tsc --noEmit (타입체크)
   - 기능 로직이 정상 연결됐는지 코드 리뷰

4. 배포
   - git add + commit + push
   - 배포 완료 대기
   - 사용자에게 보고: 빌드 번호 + 확인 URL
```

---

## Mode: batch PRIORITY (일괄 실행)

### 흐름

```
해당 우선순위의 페이지를 순서대로:

1. design PAGE → 프리뷰 URL 제공
2. 사용자 확인 대기 (batch라도 디자인 확인은 필수)
3. develop PAGE → 코드 변환 + 배포
4. 다음 페이지로

※ batch에서도 디자인 확인을 건너뛰지 않는다.
   건너뛰면 또 "뭐가 바뀌었지?" 될 수 있다.
```

---

## Mode: status (진행 상황)

```
1. 페이지별 진행 상태 테이블:
   | # | 페이지 | design | develop | 비고 |
   |---|--------|--------|---------|------|

2. 다음 할 일 안내
```

---

## 페이지 우선순위

| # | 패키지 | 페이지명 | 우선순위 |
|---|--------|---------|---------|
| 01 | app | command-center | 1순위 |
| 02 | app | chat | 1순위 |
| 03 | app | dashboard | 1순위 |
| 04 | app | trading | 1순위 |
| 05 | app | agora | 1순위 |
| 06 | app | nexus | 1순위 |
| 07 | admin | agents | 1순위 |
| 08 | admin | departments | 1순위 |
| 09 | admin | credentials | 1순위 |
| 10~23 | 혼합 | sns, messenger 등 | 2순위 |
| 24~42 | 혼합 | home, argos 등 | 3순위 |

---

## Subframe 디자인 요청 시 포함할 컨텍스트

```
프로젝트: CORTHEX — AI 에이전트 기반 기업 운영 플랫폼
사용자: CEO가 AI 에이전트 팀에 명령을 내리고, 결과를 확인하는 대시보드
스타일: Dark mode, Enterprise-grade, Premium SaaS
참고: Linear, Vercel Dashboard, Raycast
톤: 권위적이면서 혁신적 (Ruler + Magician archetype)
색상: 다크 배경 (slate-900~950) + 도메인별 악센트 컬러
폰트: Work Sans (Subframe 테마에 설정됨)
```

### 페이지별 디자인 요청 시 추가할 것

```
1. 이 페이지가 하는 일 (1~2문장)
2. 현재 페이지에 있는 모든 기능 요소 (버튼, 테이블, 폼, 차트 등)
3. 데이터 예시 (API가 반환하는 데이터 형태)
4. "현재 레이아웃과 확실히 다르게" 명시
```

---

## 규칙

1. **디자인 확인 없이 코딩하지 않는다** — 사용자가 브라우저에서 보고 "좋아!" 해야 함
2. **기능 로직 건드리지 않는다** — API/state/handlers 100% 유지
3. **커밋 전 타입체크 필수** — `npx tsc --noEmit -p packages/server/tsconfig.json`
4. **배포 완료까지 확인** — GitHub Actions 성공 확인 후 보고
5. **문서보다 결과** — 진단 리포트, 파티모드 로그 등 불필요한 문서 생성 금지
