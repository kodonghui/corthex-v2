# PRD Step 03+04 — Context Snapshot

**Saved:** 2026-03-14
**Steps:** step-03-success + step-04-journeys
**Score:** critic-a 9.0/10 + critic-b 9.1/10 — PASS
**PRD File:** /home/ubuntu/corthex-v2/_bmad-output/planning-artifacts/tools-integration/prd.md (lines 179–420)

---

## Key Decisions Locked

| Decision | Value | Source |
|----------|-------|--------|
| Phase 1 Go/No-Go Gates | 6개 (Activation, Pipeline, Reliability, Time-to-value, Persona value delivery, Security) | Brief MVP Gates |
| Activation Gate SQL | `SELECT COUNT(DISTINCT company_id) FROM agents WHERE jsonb_array_length(allowed_tools) > 0` | Brief L492 |
| CEO automation rate measurement | ARGOS completion log + 동일 run_id 내 save_report(pdf_email) success 이벤트 둘 다 필수 | Brief L525 |
| Publishing adoption timing | Phase 1: N/A / Phase 2: ≥30% (출시 후 60일) | Brief L496 |
| Tool diversity index | Week 1: ≥3/company, Week 4: ≥6/company (Phase 1); Week 8: ≥8/company (Phase 2) | Brief metrics |
| save_report API signature | `save_report(distribute_to: [...])` — `style` param belongs to md_to_pdf, not save_report | Brief L110, L467 |
| call_agent latency | <60초 (call_agent 체인만 — 단일 에이전트 다중 도구 실행 미포함, 외부 API 제외) | Brief L509-510 |
| Journey phase separation | Phase 1: journeys 1,2,3,6 / Phase 2: journeys 4,5 | Classification |
| Security Gate | raw API key 1건이라도 → 즉시 전체 도구 실행 중단, Phase 1 롤백 | Brief L665-667 |

## Personas Covered in Journeys

| Journey | Persona | Phase | Core Requirement Revealed |
|---------|---------|-------|--------------------------|
| 1 | 김지은 (AI Org Operator) | Phase 1 | Credentials UI + tool toggle + publish_tistory |
| 2 | CEO 김대표 (Solo Operator) | Phase 1 | save_report(pdf_email) + md_to_pdf + ARGOS |
| 3 | 박현우 (Technical Admin) | Phase 1 | MCP server config UI + SPAWN→TEARDOWN |
| 4 | 이수진 (Marketing Team Lead) | Phase 2 | call_agent chain + content_calendar |
| 5 | 팀장 박과장 (Team Manager) | Phase 2 | audit log UI + publish_x approval workflow |
| 6 | 최민준 (Intelligence Consumer) | Phase 1 | save_report partial failure contract + get_report |

## Next Steps

- step-05: Domain requirements (tool inventory detail per pillar)
- step-06: Innovation (MCP architecture pattern detail)
- step-07: Project type
- step-08: Scoping (out-of-scope, deferred items)
- step-09: Functional requirements
- step-10: Non-functional requirements
- step-11: Polish
- step-12: Complete
