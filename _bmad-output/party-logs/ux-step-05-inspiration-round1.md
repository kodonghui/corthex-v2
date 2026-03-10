# Party Mode Round 1: Collaborative Review — Inspiration

**Step:** step-05-inspiration
**Round:** 1 (Collaborative)
**Date:** 2026-03-11

## Expert Panel

- **John (PM)**: Product strategy alignment
- **Sally (UX)**: Design reference quality
- **Amelia (Dev)**: Technical feasibility
- **Quinn (QA)**: Testability

## Review Discussion

**Sally (UX):** The reference systems table (4.1) is comprehensive and well-structured. I especially like the "차이점" column — it clearly differentiates CORTHEX from each reference. The Visual Inspiration Board (4.2) gives exact hex codes and spacing, which is great for developers. However, the anti-patterns table (4.3) mentions "설정 지옥" but the v2 system actually HAS many settings across admin pages (계급, 비용, 도구, Soul, 모델...). How are we preventing settings overload in admin? A progressive disclosure pattern should be mentioned.

**Amelia (Dev):** The canvas interaction specs (4.2) are detailed — zoom range 10-400%, 8px grid snap, minimap 200×150px. These are directly implementable with React Flow. One concern: "자동 레이아웃: ELK.js 계층 정렬 버튼" — ELK.js layout computation for large org charts (50+ nodes) can take 500ms+. We need a loading indicator for the auto-layout action, not just instant rearrangement.

**John (PM):** The v1 Design Legacy table (4.4) is a great bridge but it only covers 5 patterns. v1 had more distinctive UX elements: the **프리셋 시스템** (saved command templates), the **품질 게이트 UI** (approve/rework cycle), and the **배치 API 결과 뷰어**. These should be acknowledged even if Phase 2.

## Issues Found

1. **[ISSUE-R1-1] Admin Settings Progressive Disclosure Missing** — Anti-pattern mentions "설정 지옥" but doesn't define how admin settings pages avoid this. Need progressive disclosure pattern.

2. **[ISSUE-R1-2] ELK.js Auto-Layout Loading State** — Large org charts may take 500ms+ for ELK layout. Need loading indicator spec.

## Fixes Applied

- **ISSUE-R1-1**: Added note to anti-patterns: Admin settings use tab-based grouping + default values + "고급 설정" 접기 패턴
- **ISSUE-R1-2**: Added ELK layout loading note to canvas section: "Auto-layout: 노드 50개+ 시 스피너 표시, 레이아웃 완료 후 animate-to-fit"
