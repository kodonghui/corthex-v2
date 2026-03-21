# Context Snapshot — Stage 2, Step 10 Non-Functional Requirements (GATE)
Date: 2026-03-21
Pipeline: /kdh-full-auto-pipeline planning (v9.0)
Project: CORTHEX v3 "OpenClaw"

---

## Step 10 Outcome

**Status**: ✅ PASS (avg 8.96/10, Grade A, GATE Option A)

| Critic | Initial | Verified |
|--------|---------|----------|
| Winston | 8.65 ✅ | 9.00 ✅ |
| Quinn | 7.85 ✅ | 8.85 ✅ |
| Sally | 8.45 ✅ | 9.00 ✅ |
| Bob | 8.70 ✅ | 9.00 ✅ |

## Key Content

### CLI Max 월정액 대응:
- NFR-S7 (cost-tracker 정확도) 삭제 — 취소선 + GATE 2026-03-20 사유
- NFR-D7 (비용 기록 보관) 삭제 — 동일 사유

### v3 신규 NFR (16개):
1. **NFR-P13~P17**: /office FCP≤3s+bundle≤200KB, 상태 동기화≤2s, heartbeat adaptive 2-tier, Reflection≤30s, MKT E2E(이미지≤2분/영상≤10분/게시≤30초)
2. **NFR-S8~S9**: personality 4-layer sanitization P0, n8n N8N-SEC-1~6+rate limiting 100% P0
3. **NFR-SC8~SC9**: /ws/office 20연결 부하테스트(FR-OC2 품질기준), n8n Docker 4GB/2CPU
4. **NFR-A5~A7**: Big Five 슬라이더 a11y, /office aria-live(FR-OC10 품질기준), /office 모바일 리스트뷰(FR-OC9 품질기준)
5. **NFR-COST3**: Reflection Haiku ≤$0.10/day (Go/No-Go #7)
6. **NFR-O9~O10**: n8n Docker health check, Reflection advisory lock
7. **NFR-D8**: observations 90일 보존 + 자동 아카이브, reflections 무기한

### 수정사항 (12건, cross-talk 포함):
1. NFR-SC7 VPS 4GB→"PG 4GB, VPS 24GB" (Quinn HIGH + Bob MEDIUM)
2. NFR-P15 ↔ NRT-2 별개 메커니즘 스코프 주석 (Cross-talk 합의: transport vs application layer)
3. NFR-D8 observations/reflections 보존 정책 신규 (Quinn MEDIUM)
4. NFR-SC8↔FR-OC2 역할 분리 (Sally MEDIUM)
5. NFR-S9 "100% 통과" (Bob LOW)
6. NFR-S9 ↔ N8N-SEC-1~6 매핑 정렬 (Winston+Quinn cross-talk MEDIUM)
7. NFR-EXT3 MKT 영상 5분 타임아웃 예외 (Quinn LOW)
8. NFR↔FR 교차 참조 A6←OC10, A7←OC9, SC8←OC2 (Bob LOW)
9. NFR-P17 MKT E2E 시간 신규 (Sally LOW)
10. NFR 총수 정정 73→74 (Sally+Winston LOW)
11. NRT-2 스코프 주석 추가 (Cross-talk)
12. NFR-S9 이름 변경 "6-layer security" → "보안 계층" (Cross-talk)

### NFR 총수:
- 활성: **74개** (v2 58 + v3 16)
- 삭제: 2개 (NFR-S7, NFR-D7)
- 우선순위: P0 21 / P1 42 / P2 10 / CQ 1

## Carry-Forward

1. /office RBAC "관찰 전용"/"메인 사용" 라벨 통일 — Sally 이월
2. n8n 백업 전략 — PRD 범위 밖
3. N8N-SEC API key 인증 + rate limiting 항목 추가 — Step 07 도메인 범위, 아키텍처 검토 시 추가 권고 (Winston+Quinn)

## Output File

`_bmad-output/planning-artifacts/prd.md`
Non-Functional Requirements v3 완료 + 16개 v3 신규 NFR + 2개 삭제 + 12건 수정
