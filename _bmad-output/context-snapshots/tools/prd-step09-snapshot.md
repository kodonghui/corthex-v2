# PRD Step 09+10 — Context Snapshot

**Saved:** 2026-03-14
**Steps:** step-09-functional + step-10-nonfunctional
**Score:** critic-a 9/10 + critic-b 9.5/10 — PASS
**PRD File:** /home/ubuntu/corthex-v2/_bmad-output/planning-artifacts/tools-integration/prd.md (lines 916–1160)

---

## Key Decisions Locked

| Decision | Value | Source |
|----------|-------|--------|
| FR 총 개수 | 41개 (8개 영역) | lines 916–1009 |
| Capability Contract 원칙 | "여기에 없는 기능은 최종 제품에 존재하지 않습니다" | line 919 |
| FR-SO2 run_id 필수 | `tool_call_events` 스키마: `{ company_id, agent_id, run_id, tool_name, started_at, completed_at, success: bool, error_code? }` | Brief line 658; NFR-P4; Pipeline Gate |
| save_report 채널 Phase | web_dashboard: P1 / pdf_email: P1 / notion: P2 / google_drive: P4 / notebooklm: P2 | FR-RM1 |
| google_drive Phase 불일치 | Integration Registry(line 735)=Phase 3 vs Roadmap(line 885)=Phase 4. PRD FR-RM1=Phase 4. Architecture phase에서 Integration Registry 교정 권고 | LOW — deferred |
| FR-TA4 Workers MCP 범위 | Specialists/Managers만 Admin 구성 가능. Workers hard block vs configurable = Architecture phase 결정 | Brief line 185 |
| MCP INIT 3-way handshake | initialize 요청→응답 → initialized 알림 → tools/list — 3단계 전부 완료 = '연결 성공' | NFR-I2; FR-MCP4 |
| NFR 5개 영역 | Performance / Security / Reliability / Scalability / Integration | lines 1011–1160 |
| Puppeteer 한도 | ≤10 동시 인스턴스 (ARM64 24GB, ~200MB/개). 초과 → TOOL_RESOURCE_UNAVAILABLE:puppeteer | NFR-SC1 |
| compose_video async 필수 | 동기 블로킹 금지. job_id 즉시 반환 + 폴링. 15분 초과 → TOOL_TIMEOUT:compose_video | NFR-SC2; FR-CP8 |
| Typed error 8종 전체 | TOOL_NOT_ALLOWED, TOOL_EXTERNAL_SERVICE_ERROR, TOOL_QUOTA_EXHAUSTED, TOOL_RATE_LIMITED, TOOL_RESOURCE_UNAVAILABLE:puppeteer, TOOL_TIMEOUT:compose_video, AGENT_MCP_CREDENTIAL_MISSING, CREDENTIAL_TEMPLATE_UNRESOLVED | NFR-R1 |
| CREDENTIAL_TEMPLATE_UNRESOLVED vs P0 | {{credential:key}} 리터럴 출력 = HIGH 버그(설정 오류), 실제 credential값 미노출 = P0 아님 | NFR-S2; Brief line 538 |
| NFR-P4 web_crawl 벤치마크 | Phase 2 측정 가능 — web_crawl Phase 2 도구 (Phase 1 QA 오판 방지) | NFR-P4 |
| send_email 첨부파일 전제 | save_report(pdf_email) 구현 전 attachments 지원 검증 필수. Phase 1 Gate 5 직접 영향 | NFR-I4 |
| save_report 부분 실패 계약 | DB 저장 → 배포 순서. 배포 실패 시 DB 롤백 금지. 부분 성공 응답 반환 | NFR-R2; FR-RM2 |

## NFR Summary

| 영역 | 주요 수치 |
|------|---------|
| md_to_pdf SLA | <10s/1p, <20s/10p |
| read_web_page SLA | <8s |
| web_crawl(scrape) SLA | <12s |
| ocr_document SLA | <8s/1p, <20s/10p |
| call_agent E2E | <60s (핸드오프 체인만) |
| 도구 성공률 | ≥95% (7일 롤링) |
| credential 노출율 | 0% (P0) |
| AGENT_MCP_CREDENTIAL_MISSING 비율 | <2% (초기 설정 후) |
| MCP SIGTERM→SIGKILL | 5초 대기 |
| Zombie process 감지 | 30초 초과 생존 → Admin 알림 |

## Known Deferred Items (Architecture Phase)

| 항목 | 이유 |
|------|------|
| google_drive Phase (P3 vs P4) | Integration Registry vs Roadmap 내부 불일치 |
| Workers MCP engine hard block vs configurable | Brief "by default" 모호성 |
| Puppeteer 인스턴스 풀 최종값 | 부하 테스트 결과 필요 |
| Job queue 최대 동시 렌더 수 (2–3개) | RAM 실측 필요 |
| AES-256 키 관리 방식 (env var vs KMS) | Architecture 결정 |

## Next Steps

- step-11: Polish
- step-12: Complete
