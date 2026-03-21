# Context Snapshot — Stage 2, Step 04 User Journey Mapping
Date: 2026-03-20
Pipeline: /kdh-full-auto-pipeline planning (v9.0)
Project: CORTHEX v3 "OpenClaw"

---

## Step 04 Outcome

**Status**: ✅ PASS (avg 8.52/10, Grade B, GATE Option B)

| Critic | Initial | Verified | Note |
|--------|---------|----------|------|
| Bob | 9.00 ✅ | 9.00 ✅ | 0 issues |
| Quinn | 7.75 ✅ | 8.50 ✅ | 3 issues: N8N_DISABLE_UI 모순(HIGH), /ws 데이터 소스, Big Five 기본값 주석 |
| Sally | 8.28 ✅ | 8.28 ✅ | 4 issues: N8N_DISABLE_UI(Quinn 중복), degraded Brief 관계, Summary 상태 목록, Journey 3 Sprint |
| Winston | 7.85 ✅ | 8.30 ✅ | 1 Major(Quinn 중복) + 2 Minor: degraded(Sally 중복), query()→messages.create() |

## GATE Decision

**Option B: 통합 재구성** (사장님 결정) — v2 여정 업데이트 + v3 신규

## Key Changes

### User Journeys 재구성 (Option B):
1. **Journey 1**: CEO 김대표 → **CEO 김도현** 페르소나 전환 + Sprint 1(Big Five 체감) + Sprint 3(메모리 성장) + Sprint 4(/office + NEXUS 상태)
2. **Journey 2**: 팀장 박과장 — costs 제거 + Sprint 2(n8n 결과 읽기)
3. **Journey 3**: 투자자 이사장 — Sprint 3(메모리 성장) + Sprint 4(/office) 추가
4. **Journey 4**: Admin → **Admin 이수진** 페르소나 전환 + Sprint 1(Big Five) + Sprint 2(n8n) + Sprint 3(메모리)
5. **Journey 7**: CEO 온보딩 — Big Five 기본값 + n8n 프리셋 + 15분 fallback
6. **Journey 8 (신규)**: Admin 이수진 — 마케팅 워크플로우 6단계 + AI 도구 엔진 (Sprint 2 딥 다이브)
7. **Journey 9 (신규)**: CEO 김도현 — /office + NEXUS 실시간 상태 4색 (Sprint 4 딥 다이브)
8. **Journey 10 (신규)**: Admin 이수진 — 메모리 3단계 + Reflection 모니터링 (Sprint 3 딥 다이브)

### Critic 수정사항:
- **N8N_DISABLE_UI**: `true` → `false` (Quinn/Winston/Sally 공통). n8n 에디터 UI 활성, Admin 전용 Hono proxy 경유. CORTHEX 통합은 REST API-only (iframe 없음).
- **Hono proxy 라우트 분리**: `/admin/n8n/*`(관리 API) + `/admin/n8n-editor/*`(에디터 UI)
- **FR-N8N4**: 동일 수정 반영
- **/ws/office 데이터 소스**: "동일 데이터 소스" → 공통(activity_logs) + /ws/office 전용(PixiJS 렌더링 페이로드)
- **Big Five 기본값**: "50/100, 중립 선택 — 연구 추천 최적값은 역할별 프리셋으로 제공"
- **degraded 상태**: Brief 5상태와의 관계 명시 (PRD 추가 상태, 사장님 결정)
- **Requirements Summary**: 4개 상태 → 6개 상태(Brief 5 + degraded)
- **query() → messages.create()**: Journey 1 Phase 1 에러 시나리오

### Journey Requirements Summary:
- v2 14행 → v2+v3 22행
- 교차점: v2 5행 → v2+v3 10행

## Carry-Forward

1. degraded 상태 — Architecture에서 5+1 상태 모델 최종 결정 (Winston)
2. Sprint 2 과부하 — Journey 4 Sprint 2 + Journey 8 같은 타임라인, Sprint 2.5 분리 옵션 인지 (Sally)
3. N8N_DISABLE_UI=false 보안 QA — Quinn 제안 5건 테스트 케이스 Sprint 2에서 실행

## Output File

`_bmad-output/planning-artifacts/prd.md`
User Journeys 전체 v3 업데이트 + N8N_DISABLE_UI 정정 + degraded Brief 매핑 + Requirements Summary 확장
