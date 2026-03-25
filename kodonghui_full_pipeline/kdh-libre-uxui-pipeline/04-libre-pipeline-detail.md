# /kdh-libre-uxui-full-auto-pipeline 상세 문서

## 개요

LibreUIUX 플러그인 7개를 순차 호출하여 브랜드 기초(Foundation)를 수립하고,
페이지마다 5단계 반복(modern→critique→responsive→a11y→review)으로 리팩토링하는 파이프라인.

Claude Code의 슬래시 커맨드 `/kdh-libre-uxui-full-auto-pipeline`로 실행.

## Phase A: Foundation (7 스킬, 1회만)

| 단계 | 스킬 | 산출물 | 내용 |
|------|------|--------|------|
| A-1 | `brand-systems` | 01-brand-systems.md | 브랜드 아이덴티티, 색상, 타이포, 간격 |
| A-2 | `jungian-archetypes` | 02-jungian-archetypes.md | 융 원형 선택 (12개 중 Primary/Secondary/Shadow) |
| A-3 | `major-arcana` | 03-major-arcana.md | 타로 카드 기반 무드/컬러 영향 |
| A-4 | `archetypal-combinations` | 04-archetypal-combinations.md | 원형+카드 조합 → 디자인 DNA 확정 |
| A-5 | `design-principles` | 05-design-principles.md | 시각 위계, Gestalt, 색상 이론, 그리드 |
| A-6 | `design-masters` | 06-design-masters.md | 디자인 거장 2~3명 원칙 적용 |
| A-7 | `design-movements` | 07-design-movements.md | 디자인 무브먼트 1~2개 적용 |
| Final | 통합 | brand-guide.md | 위 7개를 하나로 통합 |

## Phase B: Per-Page (5 스킬, 페이지마다 반복)

| 단계 | 스킬 | 산출물 | 내용 |
|------|------|--------|------|
| B-1 | `libre-ui-modern` | 01-modern-output.md | brand-guide 기반 모던 컴포넌트 생성 |
| B-2 | `libre-ui-critique` | 02-critique-report.md | 8차원 디자인 비평 + 수정 |
| B-3 | `libre-ui-responsive` | 03-responsive-report.md | 5개 브레이크포인트 반응형 검사 |
| B-4 | `libre-a11y-audit` | 04-a11y-report.md | WCAG 2.1 AA 접근성 감사 |
| B-5 | `libre-ui-review` | 05-review-score.md | 7차원 종합 리뷰, 7/10+ 합격 |

## 산출물 경로

```
_uxui-redesign/02-design/
├── brand-guide.md              ← Phase A 통합본
├── brand-guide-raw/            ← Phase A 각 스킬 원본
│   ├── 01-brand-systems.md
│   ├── 02-jungian-archetypes.md
│   ├── 03-major-arcana.md
│   ├── 04-archetypal-combinations.md
│   ├── 05-design-principles.md
│   ├── 06-design-masters.md
│   └── 07-design-movements.md
└── page-reports/               ← Phase B 페이지별
    └── {page-name}/
        ├── 01-modern-output.md
        ├── 02-critique-report.md
        ├── 03-responsive-report.md
        ├── 04-a11y-report.md
        ├── 05-review-score.md
        └── implementation.md
```

## 실행 모드

```bash
/kdh-libre-uxui-full-auto-pipeline foundation      # Phase A 전체
/kdh-libre-uxui-full-auto-pipeline page home        # Phase B: home 페이지만
/kdh-libre-uxui-full-auto-pipeline batch 1          # Phase B: 1순위 전체
/kdh-libre-uxui-full-auto-pipeline status           # 진행 상황 표시
```

## 합격/불합격 기준

- B-5 종합점수 **7/10 이상** + 모든 차원 **4/10 이상**: 합격 → 커밋
- 미달: B-2부터 재실행 (최대 2회)
- 2회 재실행 후에도 미달: 사용자에게 보고

## 다른 파이프라인과의 관계

이 파이프라인은 `kdh-uxui-full-auto-pipeline`의 **Claude 세션 중 하나**로 사용됨.
단독으로도 쓸 수 있고, 병렬 디자인 비교 워크플로우의 일부로도 쓸 수 있음.

단독 사용 시: Foundation → Per-Page → 직접 React 코드에 적용
병렬 비교 시: Foundation → Per-Page → HTML 산출물 → 다른 도구 결과와 비교
