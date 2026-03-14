# PRD Step 07+08 — Context Snapshot

**Saved:** 2026-03-14
**Steps:** step-07-project-type + step-08-scoping
**Score:** critic-a 9.0/10 + critic-b 9.0/10 — PASS
**PRD File:** /home/ubuntu/corthex-v2/_bmad-output/planning-artifacts/tools-integration/prd.md (lines 631–912)

---

## Key Decisions Locked

| Decision | Value | Source |
|----------|-------|--------|
| Project Type CSV match | `saas_b2b` — required_sections: tenant_model; rbac_matrix; subscription_tiers; integration_list; compliance_reqs | project-types.csv |
| Tenant Model | 5개 신규 테이블 모두 company_id 격리. `(company_id, key_name)` 복합 유니크 인덱스 on credentials | Architecture constraint |
| RBAC — Workers MCP 접근 | "MCP 없음 (기본값)" — hard block vs. configurable default는 Architecture phase 결정 필요 | Brief line 185 "by default" |
| RBAC — Tier별 MCP | Workers: MCP 없음(기본값) / Specialists: 부서 MCP / Managers: 전체 MCP + call_agent | Brief |
| Subscription Model | Phase 1: BYOK $0 추가 비용. Phase 2+: Firecrawl $99/월, Replicate 실행당 과금 → 미결 결정 | Brief |
| MCP Integration Registry | Phase 1: 4개 서비스 (Tistory, Jina, R2, Puppeteer). Phase 2: 5개 추가. Notion/Playwright MCP = Phase 2 (Phase 1 엔지니어링 PoC만) | Brief line 617 |
| MCP 엔진 인프라 vs 서버 템플릿 | 엔진 8단계 패턴 + Admin UI = Phase 1. 개별 MCP 서버 설정 템플릿(Notion, Playwright) = Phase 2 사용자 배포 | Brief line 617 |
| MVP 유형 | Platform MVP — credential+tool toggle+MCP 인프라 한 번 구축 → Phase 2+ 적층 | Brief |
| Phase 1 Minimum Viable Set | Admin UI 3개 + 도구 4개 (md_to_pdf + save_report + get_report + read_web_page) — Journey 2 + Journey 6 에러 복구 경로 가능 | step-08 scoping |
| Phase 4 parallelization | Redis 전환 (D21): Phase 1 안정 후 Phase 2/3와 병행 가능. Naver/Kakao/Google MCPs: Phase 2 에코시스템 완료 후 | Brief line 633-634 |

## Phase Roadmap Summary

| Phase | 주요 내용 | 기간 |
|-------|---------|------|
| Phase 1 (MVP) | 7개 신규 빌트인 도구 + credential + MCP 인프라 + Admin UI 5개 라우트 | 3–4주 |
| Phase 2 (Growth) | 소셜 게시 3개 + 미디어 생성 2개 + web_crawl + MCP 3종 + Audit Log + content_calendar | 3–4주 |
| Phase 3 (Expansion) | compose_video + async job queue + crawl_site(조건부) + ocr_document | 3–4주 |
| Phase 4 (Platform) | [A] Redis (Phase 1+ 병행) / [B] Naver/Kakao/Google MCPs (Phase 2+ 순차) | 별도 |

## Phase 1 Out-of-Scope (명시적 제외 7개)

| 항목 | 제외 이유 |
|-----|---------|
| `publish_x` | X API Basic $200/월 비용 게이트 |
| Audit Log UI | Go/No-Go Gate 통과 후 Phase 2 |
| `content_calendar` | 마케팅팀 규모 확대 후 Phase 2 |
| Firecrawl `web_crawl` | Jina Reader로 Phase 1 커버 |
| 3–4단계 `call_agent` PoC | 컨텍스트 측정 선행 필요 |
| `generate_video` | Phase 2 |
| `generate_card_news` | Phase 2 |

## Next Steps

- step-09: Functional Requirements
- step-10: Non-functional Requirements
- step-11: Polish
- step-12: Complete
