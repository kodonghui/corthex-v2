# UX Step 08 - Visual Foundation: Round 1 (Collaborative)

**Date:** 2026-03-07
**Lens:** Collaborative -- 전문가들이 협력적으로 이슈를 발견
**File Reviewed:** `_bmad-output/planning-artifacts/ux-design-specification.md` (step-08 section, lines 2312-2930)

## Expert Panel Review

### John (PM): "WHY를 끝까지 추적한다"

**강점:**
- 11개 서브섹션이 체계적으로 그리드 → 레이아웃 → 앱 구조 → 간격 → 카드 → 데이터 시각화 → 빈 상태 → 로딩 → 밀도까지 커버한다.
- 5가지 레이아웃 템플릿이 ASCII 다이어그램으로 명확히 시각화됨.
- Summary 표(8.11)가 전체 결정을 한눈에 요약.

**Issue #1 (Medium):** 사이드바 네비게이션에 "전략 포트폴리오" (v1 전략실/주식거래)에 해당하는 메뉴가 없다. v1-feature-spec #6 "전략실"이 CEO App 네비게이션에서 누락되었다. Phase 2라 해도 네비게이션 구조에는 포함해야 한다.

### Winston (Architect): 차분하고 실용적

**강점:**
- 12컬럼 그리드 + Tailwind CSS v4 매핑이 깔끔하다. 반응형 브레이크포인트가 6단계로 잘 정의됨.
- CEO App과 Admin Console의 구조적 차이(사이드바 vs 탭 바)가 명확.

**Issue #2 (Medium):** step-06에서 정의한 사이드바 폭은 240px(펼침)/64px(접힘)이다. step-08에서도 동일하게 정의했으나, 그리드 시스템에서 사이드바가 "고정"인지 "반응형"인지 명시되지 않았다. 사이드바는 12컬럼 외부에 위치하는 것인지, 12컬럼에 포함되는 것인지 명확히 해야 한다. (컬럼 배분 패턴에서 "[Sidebar 240px]"이 별도로 표시되어 있어 외부로 보이지만, 명시적 문장이 필요)

### Sally (UX): 감정에 집중

**강점:**
- 빈 상태 디자인이 8개 화면에 대해 일러스트+제목+설명+CTA를 정의하여 첫 인상을 관리.
- 카드 4가지 변형이 에이전트/보고서/통계/범용을 명확히 구분.

동의: Issue #1, #2 모두 수정 필요.

### Amelia (Dev): 파일 경로 중심으로 간결히

- Recharts 라이브러리 선택이 명시되어 있어 구현 시 혼란 없음.
- `animate-pulse`, `grid-cols-12`, `gap-6` 등 Tailwind 클래스가 직접 매핑되어 있어 개발 편의성 높음.
- Dense 모드의 13px 폰트 크기는 디자인 토큰에 정의되지 않은 값이다. step-06 토큰 시스템에 추가하거나 기존 토큰으로 대체해야 한다. (사소한 이슈)

### Quinn (QA): 커버리지 확인

v1-feature-spec의 시각 관련 기능 커버리지:
- #1 사령관실 레이아웃: Dashboard 템플릿 + CEO App 구조로 커버 ✓
- #2 조직도: Tree-View 템플릿 + Agent Card로 커버 ✓
- #9 작전현황: List-Detail 템플릿으로 커버 ✓
- #11 작전일지: Split-Pane 템플릿 + Report Card로 커버 ✓
- #21 비용 관리: Progress Bar + Metrics Inline으로 커버 ✓
- #6 전략실: 누락 (Issue #1과 동일)

### Mary (BA): 비즈니스 관점

Admin Console의 탭 구조 "[대시보드] [회사설정] [사용자관리] [결제/플랜] [API키] [로그]"에서 "결제/플랜"은 v1에 없던 SaaS B2B 신규 기능이다. PRD에서 이 기능을 Phase별로 어떻게 분류했는지 확인하면 좋겠지만, 사소한 사항이다.

### Bob (SM): 종합

Issue #1(전략실 메뉴 누락)과 #2(사이드바-그리드 관계 명시)는 수정 필요. 나머지는 사소한 사항.

## Issues Found: 2

| # | Severity | Issue | Resolution |
|---|----------|-------|------------|
| 1 | Medium | CEO App 사이드바에 전략실(v1 #6) 메뉴 누락 | 사이드바 네비게이션에 "📈 전략실 (Strategy)" 추가 (Phase 2 표시) |
| 2 | Medium | 사이드바와 12컬럼 그리드의 관계 미명시 | 8.1에 "사이드바는 고정 레이아웃이며, 12컬럼 그리드는 사이드바 오른쪽 콘텐츠 영역 내에서만 적용된다"는 문장 추가 |

## Resolution Applied

**Issue #1:** 사이드바 네비게이션에 전략실 메뉴 추가
**Issue #2:** 8.1에 사이드바-그리드 관계 명시 문장 추가

---
Score: 8/10
Status: Issues found, fixing and proceeding to Round 2
