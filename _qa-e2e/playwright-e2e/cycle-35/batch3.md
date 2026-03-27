# QA Cycle 35 — Batch 3
**Pages:** /admin/agents (TC-AGENT-*), /admin/tools (TC-TOOL-*)
**Date:** 2026-03-27
**Prefix:** QA-C35-
**Session:** 4ca5e359-08b1-42c6-8070-7a3bf7a1c48b

---

## Summary

| | Count |
|---|---|
| PASS | 26 |
| FAIL | 3 |
| SKIP | 3 |
| **Total** | **32** |

---

## /admin/agents — TC-AGENT-*

| TC-ID | Status | Notes |
|-------|--------|-------|
| TC-AGENT-001 | PASS | NEW_AGENT 버튼 클릭 → 모달 열림. name/role/tier/model/department/soul 필드 모두 존재 |
| TC-AGENT-002 | PASS | QA-C35-Agent 생성 성공. POST 후 토스트("에이전트가 생성되었습니다") + 리스트 반영 |
| TC-AGENT-003 | PASS | 이름 빈 상태로 제출 → 브라우저 네이티브 유효성 검사로 name 필드 포커스, 제출 차단 |
| TC-AGENT-004 | PASS | tier=manager 선택 가능. 값: "manager" |
| TC-AGENT-005 | PASS | tier=specialist 선택 가능. 값: "specialist" |
| TC-AGENT-006 | PASS | tier=worker 선택 가능. 값: "worker" |
| TC-AGENT-007 | SKIP | Soul template 드롭다운 없음 — 폼에 soul 텍스트에어리어만 존재. 기능 미구현으로 SKIP |
| TC-AGENT-008 | PASS | MODEL_OPTIONS: Claude Sonnet 4.6 / Claude Opus 4.6 / Claude Haiku 4.5 모두 확인 |
| TC-AGENT-009 | PASS | Department 드롭다운에 "미배정" + 34개 부서 모두 포함 |
| TC-AGENT-010 | PASS | "QA-C35" 검색 → 1개 결과 (SHOWING 1 OF 21 AGENTS) 정상 필터 |
| TC-AGENT-011 | FAIL | MANAGER 필터 선택 시 전체 21개 표시됨 — 필터 미동작. (MANAGER 에이전트 1개 있음에도 21개 노출) |
| TC-AGENT-012 | FAIL | OFFLINE 필터 선택 시 전체 21개 표시됨 — status 필터 미동작 |
| TC-AGENT-013 | PASS | 에이전트 행 클릭 → 상세 패널 열림. Soul/Config/Memory 탭 확인 |
| TC-AGENT-014 | PASS | Soul 탭: soul 텍스트 내용 표시 ("QA Testing soul for Cycle 35 Batch 3"), 수정 가능 |
| TC-AGENT-015 | PASS | Config 탭: model/tier/department/semantic cache(permissions) 표시 |
| TC-AGENT-016 | PASS | Memory 탭: "Memory snapshots will appear here" 빈 상태 메시지 표시 |
| TC-AGENT-017 | PASS | Semantic Cache 토글 클릭 → PATCH 성공 ("에이전트가 수정되었습니다" 토스트). 체크박스 상태 반전 |
| TC-AGENT-018 | PASS | Config 탭에서 이름 "QA-C35-Agent-Edited"로 변경 → Save Changes 클릭 → PATCH 성공, 리스트 반영 |
| TC-AGENT-019 | PASS | Deactivate Agent 버튼 → 확인 다이얼로그("에이전트 비활성화" 제목, 취소/비활성화 버튼) 표시 |
| TC-AGENT-020 | SKIP | 활성 세션 있는 에이전트 없음 — 모든 에이전트 OFFLINE 상태로 테스트 불가 |
| TC-AGENT-021 | PASS | 오프라인 상태 레이블 한국어로 표시("오프라인"). 상태 배지 색상 구분 확인 |
| TC-AGENT-022 | PASS | TIER_BADGE: SPECIALIST/MANAGER/WORKER 구별 표시 확인 |

---

## /admin/tools — TC-TOOL-*

| TC-ID | Status | Notes |
|-------|--------|-------|
| TC-TOOL-001 | PASS | Tool Registry 로드. 도구 카탈로그(3개) + Agent Permission Matrix 표시. 카테고리(Common/Finance/Legal/Marketing/Tech) |
| TC-TOOL-002 | PASS | Common 카테고리 필터 → 3개 공통 도구만 표시. 카테고리 드롭다운 동작 |
| TC-TOOL-003 | PASS | "qa-24" 검색 → "qa-24-tool" 1개 결과 |
| TC-TOOL-004 | PASS | Agent Permission Matrix 테이블에 에이전트별 도구 체크박스 표시 (role="checkbox" 버튼 커스텀 구현) |
| TC-TOOL-005 | PASS | 체크박스 클릭 → checked 상태, "변경사항 1건" 카운터 + 저장 버튼 출현 |
| TC-TOOL-006 | PASS | 체크 해제 → unchecked 상태, pending 카운터 사라짐 |
| TC-TOOL-007 | FAIL | 카테고리별 전체 선택(column header checkbox) 없음 — th에 체크박스 없음 |
| TC-TOOL-008 | FAIL | 카테고리별 전체 해제(column header checkbox) 없음 — TC-TOOL-007과 동일 원인 |
| TC-TOOL-009 | PASS | 변경사항 1건 → 저장 클릭 → PATCH 성공. QA-C35-Agent-Edited에 e2e-tool 권한 부여됨 |
| TC-TOOL-010 | PASS | 변경사항 0건일 때 저장 버튼 미표시(hidden) — 비활성화가 아니라 아예 숨김 처리 |
| TC-TOOL-011 | PASS | "변경사항 1건" 정확한 카운터 표시 확인 |
| TC-TOOL-012 | PASS | Register Tool 버튼 → "새 도구 추가" 폼 열림 (도구명/설명/카테고리 필드) |

---

## Bugs Found

### BUG-C35-B3-001 — /admin/agents 티어/상태 필터 미동작
- **TC:** TC-AGENT-011, TC-AGENT-012
- **재현:** Filter_Tier = MANAGER 선택 → 21개 전체 표시 (1개만 표시되어야 함). Filter_Status = OFFLINE 선택 → 21개 전체 표시
- **예상:** 해당 tier/status만 필터링
- **실제:** 필터 선택 후에도 전체 에이전트 표시 (필터 UI는 있으나 동작 안 함)
- **심각도:** HIGH

### BUG-C35-B3-002 — /admin/tools 카테고리 header 체크박스(전체 선택/해제) 미구현
- **TC:** TC-TOOL-007, TC-TOOL-008
- **재현:** Agent Permission Matrix의 컬럼 헤더(e2e-tool, qa-24-tool, qa-27-tool)에 전체 선택/해제 체크박스 없음
- **예상:** 도구 컬럼 헤더 클릭 시 해당 도구 전 에이전트 일괄 선택/해제
- **실제:** 텍스트만 있고 체크박스 없음
- **심각도:** MEDIUM

---

## Screenshots
- `agents-page-loaded.png` — /admin/agents 로드 확인
- `tools-page-loaded.png` — /admin/tools 로드 확인
- `tools-register-form.png` — Register Tool 폼 오픈 확인
