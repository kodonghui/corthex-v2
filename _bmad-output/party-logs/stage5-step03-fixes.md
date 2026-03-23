# Stage 5 Step 3 Core Experience — Fixes Applied

Date: 2026-03-23
R1 avg: 7.975/10 (dev 7.60, john 8.05, winston-2 8.65, quinn-2 7.60)

---

## Fixes Applied (by critic)

### Dev (must-fix)
1. **React Router v6 → v7**: Line 309 "React Router v6" → "React Router v7 (`react-router-dom ^7.13.1`)"
2. **EP-5 error format PRD citation 삭제**: "(PRD 패턴)" → "(v3 UX 신규 형식 — XXX=모듈 코드, NNN=에러 번호)"

### Dev (should-fix)
3. **State management 추가**: Platform Strategy 테이블에 "Zustand 5 (클라이언트) + React Query 5 (서버)" 행 추가
4. **Tailwind breakpoint customization note**: md=640(기본768), xl=1440(기본1280) → `theme.screens` 설정 필수 명시
5. **fps transition on resize**: lg↔xl 경계에서 500ms debounce 후 전환, matchMedia 리스너로 PixiJS Ticker maxFPS 제어

### John (must-fix)
6. **`soul-enricher.ts` 출처 명확화**: "(PRD §soul-enricher, Sprint 1 신규 — soul-renderer.ts renderSoul()에 extraVars 전달)" 추가. 코드베이스에 아직 미존재하나 PRD lines 873, 958, 979에 정의된 계획 파일임을 명시.
7. **비서 라우팅 실패 시 CEO 복구 UX**: CEO Core Loop 섹션에 추가 — 에이전트 태그 표시, 재라우팅 버튼, misroute 신고 1-click, 3회+ 패턴 시 Admin 알림

### John (high)
8. **비서 라우팅 실패 복구 = #7에 통합 적용**

### Winston-2 (must-fix)
9. **Secretary 라우팅 실패 CEO UX = #7에 통합 적용** (john과 동일 이슈)

### Winston-2 (should-fix)
10. **NEXUS undo/redo 안전망**: EP-2에 추가 — 삭제 확인 모달, Ctrl+Z undo (10회 스택), Soul diff 미리보기
11. **FR-MKT 마케팅 파이프라인 분리**: EI-3에 일반(≤10분) vs 마케팅(≤30분, 6단계) 구분 추가, CSM-5에 마케팅 파이프라인 행 추가

### Quinn-2 (high)
12. **a11y rows in 5 CSM tables**: 모든 CSM에 접근성 기준 행 추가:
    - CSM-1: aria-live + WebGL fallback
    - CSM-2: 키보드 Arrow keys 슬라이더 조작 + role="slider"
    - CSM-3: 알림 스크린리더 + 벨 배지 aria-label
    - CSM-4: Wizard 키보드 완료 + focus 이동 + 프로그레스 aria-valuenow
    - CSM-5: 워크플로우 목록 키보드 탐색 (n8n 에디터 제외)

### Quinn-2 (medium)
13. **EP-5 PRD citation = #2에 통합 적용** (dev와 동일 이슈)
14. **Memory data visibility**: EI-5에 추가 — Admin=전체, CEO=자사만, 직원=접근불가

---

## Not Applied (deferred)
- Quinn-2 (low): i18n language row in Platform table → Step 5 이후 검토
- Quinn-2 (low): concurrent editing note in EI-1 → Step 5 이후 검토
- Quinn-2 (low): rate limit UX in EP-5 → Step 5 이후 검토
- Dev (nice-to-have): CSM-1 cross-reference DC-1 list view → CSM-1 a11y 행에 DC-1 fallback 포함시킴
- Dev (nice-to-have): keyboard a11y in EP → CSM a11y 행들에 개별 적용 완료
