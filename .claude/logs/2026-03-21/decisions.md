# Decisions Log — 2026-03-21

## Stage 2 PRD GATE Decisions

### GATE Step 06 — Innovation (Option A)
- v2 4대 혁신 유지 + v3 4대 혁신 추가 (OpenClaw, Big Five, Memory, n8n)
- 이대로 진행

### GATE Step 08 — Scoping (Option A)
- Sprint 순서 Brief §4 그대로: Sprint 1(BigFive) → 2(n8n) → 3(Memory) → 4(OpenClaw)
- 추가 조정 없이 진행

### GATE Step 09 — Functional Requirements (Option A)
- 16개 신규 FR 전부 추가 → 총 116개 FR
- 6개 갭 영역 (MKT, MEM 가시성, PERS 프리셋, UX 페이지 통합, OC 접근성, N8N 에디터)

### GATE Step 10 — Non-Functional Requirements (Option A)
- 14개 신규 NFR 추가 + 2개 삭제 (CLI Max 모순) → 총 74개 NFR

## Pipeline Improvements (v9.0 → v9.1)

### 승인
1. A-4: 점수 분산 경고 (stdev < 0.3 시 재채점)
2. B-1+B-3: Party-log 파일 존재 검증 강화
3. D-1: Writer 중복 체크 (이전 스텝 참조)
4. Grade C 단독 처리 (init/complete 파티 모드 생략)

### 거부
- GATE 타임아웃 자동 승인 — 사장님이 직접 검토

## UXUI Tool Decision
- **Subframe 폐기 → Stitch 2 메인**
- kdh-uxui-redesign v5.0 → v5.1 (Stitch 2 네이티브)
- MCP 설정에서 Subframe 자동승인 제거
- Phase 5: DESIGN.md 생성 스텝 추가
- Phase 6: React/JSX 직접 생성
- Anti-Pattern #12: 구 UI 라이브러리 import 검사 게이트

## Subframe 컴포넌트 처리
- 현재 packages/app/src/ui/ 40개 컴포넌트 — v3 리디자인 때 Stitch 2로 통째로 교체
- 지금 삭제하면 tsc 에러 수백 개 (앱 안 쓰지만 빌드 깨짐)
- v3 Phase 7 완료 후 grep 전수 검사로 잔존 확인
