# Stage 0: PRD v3 Spec Fix — Context Snapshot

**Date:** 2026-03-20
**Stage:** 0 — PRD Spec Fix (additive update to existing PRD)
**Output file:** `_bmad-output/planning-artifacts/prd.md`

---

## What Was Changed

### 1. Frontmatter — inputDocuments (2개 추가)
```yaml
- _bmad-output/planning-artifacts/v3-openclaw-planning-brief.md  # NEW
- _bmad-output/planning-artifacts/v3-corthex-v2-audit.md          # NEW
```

### 2. Frontmatter — terminology (4개 추가)
- `OpenClaw`: PixiJS 8 가상 사무실 시각화
- `BigFive성격`: OCEAN 모델 5축 성격 시스템
- `에이전트메모리`: 3단계 아키텍처 (관찰→반성→계획)
- `n8n`: 워크플로우 자동화 대체 도구

### 3. Executive Summary — v2 현재 규모 박스 추가
코드 기반 검증된 정확한 수치 표:
- API 엔드포인트: **485개** (기존 PRD에 없던 수치)
- 프론트엔드 페이지: **71개** (Admin 27 + CEO앱 42 + Login 2)
- DB 테이블: **86개** + Enum **29개**
- Built-in 도구: **68개**
- WebSocket 채널: **14개**
- 백그라운드 워커: **6개**
- 마이그레이션: **60개**
- 테스트 파일: **393개**
- 테스트 케이스: **10,154개**

### 4. Product Scope — Phase 5 v3 OpenClaw 신규 섹션 (4개 Feature)
기존 "Vision (Phase 5+)" 표를 대체/확장하여 4개 Feature 상세 스펙 추가:

**Feature 5-1: OpenClaw 가상 사무실 (PixiJS 8)**
- PixiJS 8 + @pixi/react 픽셀아트 렌더링
- 에이전트 상태 5종 매핑 (idle/working/speaking/tool_calling/error)
- WebSocket `/ws/office` (15번째 채널)
- 독립 패키지 `packages/office/`
- `engine/agent-loop.ts` 수정 없음 — `activity_logs` tail만

**Feature 5-2: n8n 워크플로우 연동**
- n8n Docker, Oracle VPS 포트 5678
- iframe 임베드 or REST API 폴백
- 기존 워크플로우 자체 구현 코드 삭제
- Admin: n8n 관리 페이지, CEO: 실행결과 읽기 전용

**Feature 5-3: 에이전트 성격 시스템 (Big Five)**
- `agents.personality_traits JSONB` 컬럼 (마이그레이션 #61)
- OCEAN 5축 슬라이더 (0~1)
- Soul `{personality_traits}` 변수 치환
- 코드 분기 없음, 프롬프트 주입 전용

**Feature 5-4: 에이전트 메모리 아키텍처**
- `observations` 테이블 (마이그레이션 #62) — 모든 실행 저장
- `reflections` 테이블 (마이그레이션 #63) — 크론 요약
- HNSW 인덱스 (vector_cosine_ops)
- 반성 워커 (백그라운드 워커 #7, memory-reflection.ts)
- 태스크 시작 시 cosine ≥ 0.75 상위 3개 Soul 주입

### 5. Out of Scope — 워크플로우 빌더 행 업데이트
- 기존: "Phase 6으로 연기"
- 변경: "n8n Docker로 대체, 자체 구현 불필요"

### 6. 코드 경계 — Phase 5 추가
신규 파일/패키지 경로 명시

### 7. UXUI 완전 리디자인 노트 추가
- 기존 2개 테마 (Sovereign Sage, Natural Organic) 전부 폐기
- `/kdh-uxui-redesign-full-auto-pipeline` Phase 0부터 재실행
- 메뉴 구조 확정 (Admin/CEO 사이드바)

### 8. Integrations 테이블 — 3개 항목 추가
- n8n (Phase 5)
- OpenClaw /ws/office (Phase 5)
- Memory Reflection Gemini Embedding (Phase 5)

### 9. Functional Requirements — v3 섹션 추가 (FR-OC1~8, FR-N8N1~5, FR-PERS1~5, FR-MEM1~8)
총 26개 신규 FR

---

## Key Numbers (검증 완료)

| 수치 | 값 | 출처 |
|------|-----|------|
| API 엔드포인트 | 485개 | v3-corthex-v2-audit.md |
| 프론트엔드 페이지 | 71개 | v3-corthex-v2-audit.md |
| DB 테이블 | 86개 | v3-corthex-v2-audit.md |
| WebSocket 채널 | 14개 (Phase 5에서 15개로 증가) | v3-corthex-v2-audit.md |
| 백그라운드 워커 | 6개 (Phase 5에서 7개로 증가) | v3-corthex-v2-audit.md |
| Built-in 도구 | 68개 | v3-corthex-v2-audit.md |
| 테스트 케이스 | 10,154개 | v3-corthex-v2-audit.md |

---

## Critic Review Request Context

- **파일:** `_bmad-output/planning-artifacts/prd.md`
- **변경 유형:** Additive update (기존 내용 보존 + 추가)
- **핵심 변경:** v3 OpenClaw 4개 Feature Phase 5 섹션 신규 + 정확한 수치 + FR 26개 신규
- **참고 문서:** `v3-openclaw-planning-brief.md`, `v3-corthex-v2-audit.md`
