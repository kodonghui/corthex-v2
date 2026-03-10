---
name: 'kdh-libre-uxui-full-auto-pipeline'
description: 'LibreUIUX Full Auto Pipeline. Foundation(brand→archetypes→principles→masters→movements) then per-page(modern→critique→responsive→a11y→review). Usage: /kdh-libre-uxui-full-auto-pipeline [foundation|page PAGE_NAME|batch PRIORITY|status]'
---

# LibreUIUX Full Auto Pipeline

## Overview

UXUI 리팩토링 전체 자동화 파이프라인.
**Phase A**(Foundation)에서 브랜드/디자인 기초를 1회 수립하고,
**Phase B**(Per-Page)에서 페이지마다 5단계 반복으로 리팩토링한다.

모든 스킬 호출은 **실제 Skill tool로 invoke**한다. 직접 구현 금지.

---

## Mode Selection

Parse `$ARGUMENTS` to determine mode:

| Input | Mode | Action |
|-------|------|--------|
| `foundation` or no args | Foundation | Phase A 전체 실행 |
| `page [PAGE_NAME]` | Single Page | Phase B를 특정 페이지 1개에 실행 |
| `batch [1\|2\|3]` | Batch | 해당 우선순위 페이지 전체에 Phase B 반복 |
| `status` | Status | 진행 상황 표시 |

---

## Output Directory

모든 산출물은 `_uxui-redesign/` 아래에 저장:

```
_uxui-redesign/
  02-design/
    brand-guide.md              ← Phase A 최종 산출물 (브랜드 가이드)
    brand-guide-raw/            ← Phase A 각 스킬 원본 출력
      01-brand-systems.md
      02-jungian-archetypes.md
      03-major-arcana.md
      04-archetypal-combinations.md
      05-design-principles.md
      06-design-masters.md
      07-design-movements.md
    page-reports/               ← Phase B 페이지별 리포트
      {page-name}/
        01-modern-output.md
        02-critique-report.md
        03-responsive-report.md
        04-a11y-report.md
        05-review-score.md
        implementation.md       ← 최종 코드 변경 요약
  03-implement/
    {page-name}.tsx             ← 실제 코드 (기존 파일 수정 or 신규)
```

---

## Phase A: Foundation (1회만 실행)

브랜드와 디자인 기초를 수립한다. 이미 `brand-guide.md`가 존재하면 사용자에게 "재생성할지" 확인 후 진행.

### Step A-1: Brand Systems

**Skill 호출**: `brand-systems`

프롬프트:
```
프로젝트 컨텍스트를 먼저 파악하라:
- CLAUDE.md 읽기
- packages/app/src/ 와 packages/admin/src/ 의 주요 페이지 구조 파악
- 현재 사용 중인 색상, 폰트, 컴포넌트 패턴 분석

그 위에서 브랜드 아이덴티티를 정의하라:
1. Brand Essence: 이 제품이 사용자에게 주는 핵심 가치 (1문장)
2. Brand Personality: 형용사 5개 (예: 전문적, 신뢰감, 혁신적, 친근한, 명확한)
3. Color Palette: Primary, Secondary, Accent, Neutral, Semantic (각각 Tailwind 클래스 + hex 코드)
4. Typography: 헤딩 폰트, 본문 폰트, 코드 폰트 (구체적 font-family + Tailwind 클래스)
5. Voice & Tone: UI 텍스트 작성 가이드 (버튼 레이블, 에러 메시지, 빈 상태 등)
6. Logo Usage: 로고 배치 규칙 (있으면)
7. Spacing System: 기본 단위 (4px? 8px?), 컴포넌트 간격 규칙

출력: 위 7개 항목을 구체적 값으로. "적절한 색상" 같은 추상 표현 금지.
모든 색상은 hex + Tailwind 클래스, 모든 크기는 px + Tailwind 클래스로 명시.
```

산출물 → `_uxui-redesign/02-design/brand-guide-raw/01-brand-systems.md`

### Step A-2: Jungian Archetypes

**Skill 호출**: `jungian-archetypes`

프롬프트:
```
A-1에서 정의한 브랜드를 읽어라: _uxui-redesign/02-design/brand-guide-raw/01-brand-systems.md

이 브랜드에 가장 적합한 융 원형(Archetype)을 결정하라:
1. Primary Archetype: 메인 원형 + 이유 (12개 중 택 1)
   - Innocent, Explorer, Sage, Hero, Outlaw, Magician,
     Regular Guy, Lover, Jester, Caregiver, Creator, Ruler
2. Secondary Archetype: 보조 원형 + 이유 (Primary와 다른 것)
3. Shadow Archetype: 피해야 할 원형 + 이유
4. UI Behavioral Patterns:
   - Primary가 UI에서 어떻게 드러나는가? (CTA 스타일, 애니메이션, 레이아웃)
   - Secondary가 UI에서 어떻게 드러나는가?
   - 구체적 Tailwind 클래스 예시 포함
5. Color Mapping: 원형별 색상 매핑 (A-1 팔레트와 일치 확인)
6. Typography Mapping: 원형별 타이포 특성 (bold/light, serif/sans 등)

출력: 각 항목에 구체적 Tailwind 클래스와 CSS 값 포함.
```

산출물 → `_uxui-redesign/02-design/brand-guide-raw/02-jungian-archetypes.md`

### Step A-3: Major Arcana

**Skill 호출**: `major-arcana`

프롬프트:
```
A-1(브랜드)과 A-2(원형)를 읽어라:
- _uxui-redesign/02-design/brand-guide-raw/01-brand-systems.md
- _uxui-redesign/02-design/brand-guide-raw/02-jungian-archetypes.md

브랜드 원형에 맞는 Major Arcana 카드를 선택하라:
1. Primary Card: 카드 이름 + 번호 + 선택 이유
2. Secondary Card: 카드 이름 + 번호 + 선택 이유
3. Mood Board:
   - Primary Card의 무드: 감정 키워드 5개
   - Color Influence: 카드가 팔레트에 추가/조정하는 색상 (hex + Tailwind)
   - Light/Dark 분위기: 밝은 톤? 어두운 톤? 대비 강한?
4. Page-Specific Card Mapping (선택):
   - 대시보드 → [Card] (이유)
   - 설정 → [Card] (이유)
   - 에이전트 관리 → [Card] (이유)

출력: 카드 선택 근거 + 색상 영향 + 무드 키워드를 구체적으로.
```

산출물 → `_uxui-redesign/02-design/brand-guide-raw/03-major-arcana.md`

### Step A-4: Archetypal Combinations

**Skill 호출**: `archetypal-combinations`

프롬프트:
```
A-1~A-3 산출물을 모두 읽어라:
- _uxui-redesign/02-design/brand-guide-raw/01-brand-systems.md
- _uxui-redesign/02-design/brand-guide-raw/02-jungian-archetypes.md
- _uxui-redesign/02-design/brand-guide-raw/03-major-arcana.md

원형(A-2) + 카드(A-3)를 조합하라:
1. Primary Combination: [Archetype]+[Card] — 이 조합의 의미
2. 조합이 만드는 디자인 DNA:
   - 색상 토큰 최종 확정 (Primary/Secondary/Accent/Neutral/Semantic 각각 hex + Tailwind)
   - 타이포 스케일 확정 (Display/H1/H2/H3/Body/Caption 각각 size + weight + Tailwind)
   - 간격 시스템 확정 (컴포넌트 패딩, 섹션 간격, 카드 갭 등)
   - 라운드 시스템 확정 (border-radius 값들)
   - 그림자 시스템 확정 (shadow 값들)
   - 애니메이션 원칙 (transition 속도, easing, hover 효과)
3. 페이지 유형별 조합 변형:
   - Command Center(대시보드): [Archetype]+[Card] → 구체적 색상/레이아웃
   - 관리 페이지(CRUD): [Archetype]+[Card] → 구체적 색상/레이아웃
   - 설정 페이지: [Archetype]+[Card] → 구체적 색상/레이아웃
4. Do / Don't 리스트:
   - 이 조합에서 해야 할 것 5개 (구체적 CSS/Tailwind 예시)
   - 이 조합에서 하면 안 되는 것 5개 (구체적 예시)

출력: 모든 값은 복사해서 바로 쓸 수 있는 Tailwind 클래스로.
```

산출물 → `_uxui-redesign/02-design/brand-guide-raw/04-archetypal-combinations.md`

### Step A-5: Design Principles

**Skill 호출**: `design-principles`

프롬프트:
```
A-1~A-4 산출물을 모두 읽어라.

이 브랜드에 적용할 핵심 디자인 원칙을 수립하라:
1. Visual Hierarchy Rules:
   - F-pattern vs Z-pattern: 어디에 어떤 것을 쓸지
   - 크기 대비: 헤딩과 본문의 최소 비율 (예: 2:1)
   - 색상 대비: 배경과 텍스트의 최소 대비율 (WCAG AA: 4.5:1)
   - 위치 우선순위: 좌상단 > 우상단 > 좌하단 > 우하단

2. Gestalt Principles Application:
   - Proximity: 관련 요소 간격 vs 비관련 요소 간격 (구체적 px/Tailwind)
   - Similarity: 같은 유형 요소의 시각적 일관성 규칙
   - Continuity: 시선 흐름 가이드 (그리드, 정렬)
   - Closure: 카드, 그룹핑 패턴
   - Figure/Ground: 배경과 콘텐츠 분리 방법

3. Color Theory Rules:
   - 60-30-10 법칙: 60% 배경색, 30% 보조색, 10% 강조색 (A-4에서 확정한 값)
   - Semantic Colors: success/error/warning/info 각각 용도와 사용처
   - Dark Mode 대응 (있으면)

4. Typography Rules:
   - Scale Ratio: Golden Ratio(1.618) or Major Third(1.25) or 기타
   - Line Height: 헤딩 leading-tight, 본문 leading-relaxed 등
   - Letter Spacing: 대문자 tracking-wider, 본문 tracking-normal 등
   - Max Line Width: 본문 최대 너비 (예: max-w-prose = 65ch)

5. Spacing Rules:
   - Base Unit: 4px or 8px
   - Component Internal Padding: 값 + Tailwind
   - Component External Margin: 값 + Tailwind
   - Section Spacing: 값 + Tailwind

6. Grid System:
   - 컬럼 수: 12-column? 기타?
   - Gutter: 값
   - Container Max Width: 값 + Tailwind
   - Breakpoints: sm/md/lg/xl/2xl 별 레이아웃 규칙

출력: 모든 원칙에 구체적 값 + Tailwind 클래스. "적절한 간격" 같은 표현 금지.
```

산출물 → `_uxui-redesign/02-design/brand-guide-raw/05-design-principles.md`

### Step A-6: Design Masters

**Skill 호출**: `design-masters`

프롬프트:
```
A-1~A-5 산출물을 모두 읽어라.

이 브랜드/원형/원칙에 가장 적합한 디자인 거장 2~3명을 선택하고 적용 방법을 정의하라:

후보: Saul Bass, Massimo Vignelli, Dieter Rams, Paula Scher, Josef Müller-Brockmann,
      Jan Tschichold, Paul Rand, Milton Glaser, Herb Lubalin, Neville Brody

각 선택한 거장마다:
1. 거장 이름 + 대표 원칙 (1문장)
2. 대표 명언 인용
3. 이 프로젝트에 적용할 구체적 규칙 3개:
   - 규칙 설명
   - 적용 예시 (Before Tailwind → After Tailwind)
   - 적용 대상 컴포넌트/페이지
4. 이 거장이 절대 하지 않을 것 2개:
   - Anti-pattern 설명
   - 구체적 Tailwind 예시 (이런 건 쓰지 말 것)

최종 출력: Design Masters Cheat Sheet
| 상황 | 거장 | 원칙 | Tailwind 예시 |
|------|------|------|---------------|
| 레이아웃 정리 | Vignelli | 그리드 엄수 | grid grid-cols-12 gap-6 |
| 불필요한 장식 제거 | Rams | Less but better | 그림자/그라디언트 최소화 |
| ... | ... | ... | ... |
```

산출물 → `_uxui-redesign/02-design/brand-guide-raw/06-design-masters.md`

### Step A-7: Design Movements

**Skill 호출**: `design-movements`

프롬프트:
```
A-1~A-6 산출물을 모두 읽어라.

이 브랜드에 적합한 디자인 무브먼트 1~2개를 선택하라:

후보: Bauhaus, Swiss International Style, Art Deco, Memphis, Minimalism,
      Brutalism, Constructivism, De Stijl, Art Nouveau, Flat Design,
      Material Design, Neumorphism, Glassmorphism

각 선택한 무브먼트마다:
1. 무브먼트 이름 + 시대 + 핵심 특징 (1문장)
2. 이 프로젝트에서 차용할 요소 3개:
   - 요소 설명 + 구체적 Tailwind 구현
3. 차용하지 않을 요소 2개:
   - 왜 안 맞는지 + 대안
4. 무브먼트 × 원형 조합 효과:
   - [Movement] + [Archetype] = 어떤 느낌의 UI?
   - 구체적 컴포넌트 예시 (카드, 버튼, 네비게이션)

최종 출력: Movement Application Guide
```

산출물 → `_uxui-redesign/02-design/brand-guide-raw/07-design-movements.md`

### Step A-Final: Brand Guide 통합

A-1 ~ A-7 완료 후, 모든 raw 파일을 읽고 **하나의 통합 브랜드 가이드**로 합친다.

`_uxui-redesign/02-design/brand-guide.md` 에 아래 구조로 작성:

```markdown
# [프로젝트명] Brand & Design Guide

## 1. Brand Identity
[A-1 핵심 요약]

## 2. Archetype & Mood
- Primary: [Archetype]+[Card]
- Personality Keywords: ...
[A-2, A-3, A-4 핵심 요약]

## 3. Design Tokens (복사해서 바로 쓸 수 있는 값)
### Colors
| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| primary | #XXXXXX | bg-[xxx] text-[xxx] | ... |
| ... | ... | ... | ... |

### Typography Scale
| Level | Size | Weight | Tailwind | Usage |
|-------|------|--------|----------|-------|
| Display | XXpx | 800 | text-Xpx font-extrabold | ... |
| ... | ... | ... | ... | ... |

### Spacing
| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| ... | ... | ... | ... |

### Shadows
| Token | Value | Tailwind |
|-------|-------|----------|

### Border Radius
| Token | Value | Tailwind |
|-------|-------|----------|

### Transitions
| Token | Value | Tailwind |
|-------|-------|----------|

## 4. Design Principles
[A-5 핵심 — 60-30-10, Gestalt, Grid 등]

## 5. Design Masters
[A-6 핵심 — Cheat Sheet 테이블]

## 6. Design Movement
[A-7 핵심 — 적용 가이드]

## 7. Do / Don't
| Do (Tailwind) | Don't (Tailwind) | 이유 |
|---------------|------------------|------|
| ... | ... | ... |

## 8. Page-Type Templates
### Dashboard Type
- Layout: ...
- Key Colors: ...
- Card Style: ...

### CRUD/Management Type
- Layout: ...
- Key Colors: ...
- Table Style: ...

### Settings Type
- Layout: ...
- Key Colors: ...
- Form Style: ...
```

통합 완료 후 git commit:
`docs(uxui): brand guide foundation complete -- 7 LibreUIUX skills`

---

## Phase B: Per-Page Execution (페이지마다 반복)

`brand-guide.md`가 존재해야 Phase B 실행 가능. 없으면 "먼저 /kdh-libre-uxui-full-auto foundation 실행" 안내.

### Page Discovery

페이지 목록 소스 (우선순위):
1. `_uxui-redesign/01-spec/prd.md` 에 정의된 페이지 목록
2. `packages/app/src/pages/` + `packages/admin/src/pages/` 의 실제 파일

### Step B-1: Modern Component Generation

**Skill 호출**: `libre-ui-modern`

프롬프트:
```
브랜드 가이드를 먼저 읽어라: _uxui-redesign/02-design/brand-guide.md

대상 페이지: {PAGE_NAME}
현재 코드: {PAGE_FILE_PATH} (파일 전체 읽기)

브랜드 가이드의 Design Tokens, Principles, Masters, Movement를 **모두 반영**하여
이 페이지를 모던 컴포넌트로 재설계하라.

필수 반영 사항:
1. brand-guide.md의 Color Tokens 사용 (임의 색상 금지)
2. brand-guide.md의 Typography Scale 사용 (임의 크기 금지)
3. brand-guide.md의 Spacing System 사용 (임의 간격 금지)
4. brand-guide.md의 Design Masters 원칙 적용
5. brand-guide.md의 Movement 스타일 반영
6. 기존 기능 100% 유지 (기능 삭제/변경 금지)

출력:
- 완성된 컴포넌트 코드 (React + Tailwind)
- 변경 사항 요약 (Before → After 테이블)
- 적용된 브랜드 가이드 항목 체크리스트
```

산출물 → `_uxui-redesign/02-design/page-reports/{page-name}/01-modern-output.md`
코드 → 실제 파일에 적용 (Edit tool)

### Step B-2: Design Critique

**Skill 호출**: `libre-ui-critique`

프롬프트:
```
브랜드 가이드를 읽어라: _uxui-redesign/02-design/brand-guide.md
B-1에서 수정한 코드를 읽어라: {PAGE_FILE_PATH}

브랜드 가이드 기준으로 8차원 비평하라:
1. Design System Compliance — brand-guide.md 토큰과 일치하는가?
2. Visual Hierarchy — 시각적 위계가 명확한가?
3. Spacing & Rhythm — 간격이 일관적인가?
4. Color & Contrast — 대비율 WCAG AA 충족?
5. Typography — 스케일이 brand-guide와 일치?
6. Responsive — 모바일 대응?
7. Interactions — hover/focus/active 상태?
8. Accessibility — 시맨틱 HTML, ARIA?

각 차원 점수 (1~10) + 구체적 수정 사항 (줄 번호 + Tailwind 클래스).
총점 7/10 미만이면 수정 후 재비평.
```

산출물 → `_uxui-redesign/02-design/page-reports/{page-name}/02-critique-report.md`
수정 → 실제 파일에 적용

### Step B-3: Responsive Check

**Skill 호출**: `libre-ui-responsive`

프롬프트:
```
B-2까지 수정된 코드를 읽어라: {PAGE_FILE_PATH}

5개 브레이크포인트에서 반응형 검사:
- 320px (iPhone SE)
- 375px (iPhone 12/13)
- 768px (iPad)
- 1024px (iPad Pro / Laptop)
- 1440px (Desktop)

검사 항목: 레이아웃, 타이포, 간격, 네비게이션, 폼, 카드, 버튼, 이미지, 터치 타겟(44x44px).
각 문제마다 Before → After Tailwind 코드 제공.
```

산출물 → `_uxui-redesign/02-design/page-reports/{page-name}/03-responsive-report.md`
수정 → 실제 파일에 적용

### Step B-4: Accessibility Audit

**Skill 호출**: `libre-a11y-audit`

프롬프트:
```
B-3까지 수정된 코드를 읽어라: {PAGE_FILE_PATH}

WCAG 2.1 AA 기준 접근성 감사:
1. 색상 대비율 (4.5:1 텍스트, 3:1 UI)
2. 키보드 네비게이션 (Tab 순서, Escape 동작)
3. 스크린 리더 (ARIA labels, 헤딩 구조, 폼 라벨)
4. 포커스 인디케이터 (ring-2 이상)
5. 터치 타겟 (44x44px 최소)
6. 시맨틱 HTML (button vs div, nav vs div 등)

각 위반사항: 파일명:줄번호 + 수정 코드.
```

산출물 → `_uxui-redesign/02-design/page-reports/{page-name}/04-a11y-report.md`
수정 → 실제 파일에 적용

### Step B-5: Final Review (합격 판정)

**Skill 호출**: `libre-ui-review`

프롬프트:
```
브랜드 가이드를 읽어라: _uxui-redesign/02-design/brand-guide.md
B-4까지 수정된 최종 코드를 읽어라: {PAGE_FILE_PATH}

7차원 종합 리뷰 실행:
1. Archetypal Coherence — brand-guide의 원형과 일치하는가?
2. Design Mastery — brand-guide의 거장 원칙이 적용되었는가?
3. Accessibility — WCAG AA 통과?
4. Security — XSS/입력 검증?
5. Performance — 불필요한 리렌더, 큰 번들?
6. Code Quality — 컴포넌트 구조, 타입?
7. User Experience — 로딩/에러 상태, 피드백?

각 차원 점수 (1~10).
종합 점수 + 판정: ELEVATE(8+) / REFINE(5~7) / REBUILD(1~4)

합격 기준: 종합 7/10 이상 + 어떤 차원도 4/10 미만 없을 것.
미달 시: 가장 낮은 차원 수정 → B-2(critique)부터 재실행.
```

산출물 → `_uxui-redesign/02-design/page-reports/{page-name}/05-review-score.md`

### Step B-Final: Commit

B-5에서 합격(7/10+)하면:

1. `_uxui-redesign/02-design/page-reports/{page-name}/implementation.md` 에 변경 요약 저장
2. git commit: `feat(uxui): {page-name} redesign -- score {X}/10`
3. git push

---

## Batch Mode

`/kdh-libre-uxui-full-auto batch 1` → 1순위 페이지 전체에 Phase B 순차 실행.

페이지 우선순위는 `_uxui-redesign/01-spec/prd.md` 에서 읽거나,
없으면 사용자에게 물어본다.

각 페이지 완료마다 개별 커밋 + 푸시.
전체 배치 완료 후 요약 테이블 출력:

```
| Page | Score | Verdict | Commit |
|------|-------|---------|--------|
| command-center | 8.2/10 | ELEVATE | abc1234 |
| departments | 7.5/10 | REFINE → ELEVATE | def5678 |
| ... | ... | ... | ... |
```

---

## Status Mode

`/kdh-libre-uxui-full-auto status`

1. `brand-guide.md` 존재 여부 → Foundation 완료/미완료
2. `page-reports/` 폴더 스캔 → 각 페이지 진행 상태
3. 테이블 출력:

```
## Foundation: ✅ Complete (brand-guide.md exists)

## Pages:
| Page | B-1 | B-2 | B-3 | B-4 | B-5 | Score | Status |
|------|-----|-----|-----|-----|-----|-------|--------|
| command-center | ✅ | ✅ | ✅ | ✅ | ✅ | 8.2 | Done |
| departments | ✅ | ✅ | ❌ | ❌ | ❌ | - | In Progress |
| agents | ❌ | ❌ | ❌ | ❌ | ❌ | - | Not Started |
```

---

## Error Handling

- Skill 호출 실패 → 1회 재시도, 재실패 시 사용자에게 보고 후 중단
- B-5 점수 미달(< 7/10) → B-2부터 재실행 (최대 2회 반복, 그래도 미달 시 사용자에게 보고)
- brand-guide.md 없이 Phase B 시도 → "먼저 foundation 실행" 안내
- tsc 에러 → 코드 수정 후 재시도 (CLAUDE.md 규칙)

---

## Pre-Commit Checklist (매 페이지 커밋 전)

```
[LibreUIUX 체크리스트 -- {PAGE_NAME}]
[ ] 1. brand-guide.md 토큰과 일치 (임의 색상/크기 없음)
[ ] 2. libre-ui-modern 실행 완료
[ ] 3. libre-ui-critique 점수 7/10 이상
[ ] 4. libre-ui-responsive 5개 브레이크포인트 통과
[ ] 5. libre-a11y-audit WCAG AA 통과
[ ] 6. libre-ui-review 종합 7/10 이상
[ ] 7. npx tsc --noEmit 통과
[ ] 8. 기존 기능 유지 (삭제/변경 없음)
```

---

## Prohibited

- brand-guide.md 없이 Phase B 실행하는 것
- brand-guide.md에 없는 임의 색상/폰트/크기 사용하는 것
- Skill 호출 없이 직접 디자인 판단하는 것
- B-5 점수 미달인데 커밋하는 것
- 기존 기능을 삭제하거나 변경하는 것
- "적절한", "깔끔한", "전문적인" 같은 추상 표현 사용하는 것
- tsc 체크 없이 커밋하는 것
