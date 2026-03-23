# Stage 5 Step 6 Design System Foundation — Fixes Applied

Date: 2026-03-23
R1 scores: dev 7.40, quinn-2 7.45 (john, winston-2 pending)

---

## Fixes Applied

### Round 1 (dev cross-talk immediate response)

1. **[CRITICAL] Radix UI 팩트 오류**: "v2에서 Radix 사용 중" → "v2 미사용 — v3 신규 도입". 8개 패키지 설치 목록 추가.
2. **Subframe 36→44개**: 전수 수정 (3곳)
3. **accent-hover WCAG**: 7.44:1 단독 → 7.02:1 (on cream) / 7.44:1 (white-on) 이중 표기
4. **content-max**: 1160→1440px 마이그레이션 주석 추가
5. **시맨틱 색상 5개**: Pre-Sprint Layer 0 변경값 전부 명시
6. **Radix 설치 전제 조건**: Pre-Sprint Layer 0에 통합

### Round 2 (dev addendum + quinn-2 피드백 반영)

7. **[CRITICAL] Recharts "v2 사용 중" → FALSE**: v2는 Subframe 내장 AreaChart/BarChart/LineChart. Recharts = v3 신규 또는 Subframe Chart 리스타일 유지 옵션 명시.
8. **[CRITICAL] @fontsource "self-hosted" → NOT installed**: v2는 CSS font-family 선언만 (시스템 fallback). v3에서 @fontsource 설치 필요 명시.
9. **Architecture Decision 필요**: Radix = architecture.md 미등록 의존성. D-number 등록 + React 19 호환성 검증 + Subframe 리스타일 대안 검토 명시.
10. **content-max 1440px = zero padding 문제**: xl=1440px 뷰포트에서 max-width 1440px = 사이드 패딩 0. 1280px 대안 제시, Pre-Sprint 확정 필요 명시.
11. **Lucide "pinned, no ^" → 정확화**: "pinned version, no ^" 명시 (v2에서 이미 사용 중 확인)

### Round 3 (winston-2 should-fix #4 반영)

12. **CSS 우선순위 정책 추가**: Subframe+Radix 공존 시 Tailwind 유틸리티 > Subframe 스타일. 충돌 시 wrapper className override 패턴. `!important` 금지.

---

## Not Applied (deferred)
- Dev nice-to-have: Radix 누적 번들 크기 (40-120KB) → Sprint 1 번들 분석 시 상세화
- Dev nice-to-have: 반응형 타이포그래피 스케일 → Step 7 이후 검토
- Dev should-fix: packages/ui 3-tier 재구성 시점 → Architecture Decision에서 확정
