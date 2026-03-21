# Context Snapshot — Stage 2, Step 05 Domain-Specific Requirements
Date: 2026-03-20
Pipeline: /kdh-full-auto-pipeline planning (v9.0)
Project: CORTHEX v3 "OpenClaw"

---

## Step 05 Outcome

**Status**: ✅ PASS (avg 8.94/10, Grade A, AUTO)

| Critic | Initial | Verified | Note |
|--------|---------|----------|------|
| Bob | 8.40 ✅ | 9.00 ✅ | 1 HIGH: query() 14곳 잔존 → 전수 교체 |
| Quinn | 7.50 ✅ | 8.65 ✅ | 1 HIGH(PER-1 Layer 0) + 2 MED(query(), JSONB race) + 1 LOW(PER-2 주석) + cross-talk(FR-PERS) |
| Sally | 8.93 ✅ | 9.10 ✅ | 1 MED(PIX-4 모바일 aria-live) + 2 LOW(PER-6 툴팁, MKT-3 비용 가시성) |
| Winston | 8.60 ✅ | 9.00 ✅ | 1 Major(MEM-1 Option B) + 범위밖 HIGH(FR-PERS 0~1 회귀) + 2 Minor(query(), HMAC) |

## Key Changes

### v2 수정 (5건 → 18건):
- query() → messages.create() 전수 교체 (도메인 5곳 + 나머지 13곳 = 18곳)
- L1565 SDK 인터페이스명만 query() 유지 (SDK API명 자체)

### v3 신규 도메인 요구사항 (6개 카테고리, 32개 항목):
1. **N8N-SEC** (6개, Sprint 2): 포트 차단, Admin 전용 에디터, tag 격리, HMAC, Docker 상한, DB 직접 접근 금지
2. **PER** (6개, Sprint 1): 4-layer sanitization (Layer 0 spread 역전), 5개 개별 extraVars, 기본값 50, fallback, 접근성, 슬라이더 행동 예시 툴팁
3. **MEM** (5개, Sprint 3): Zero Regression (Option B 확정), Tier 한도, 크론 격리, 삭제 권한, Planning 감사 로그
4. **PIX** (6개, Sprint 4): 200KB 번들, WebGL→Canvas fallback, desktop-only, aria-live (NEXUS + 모바일 리스트 뷰), 실패 격리, activity_logs 읽기 전용
5. **MKT** (5개, Sprint 2): API 키 AES-256 (JSONB race 주의), fallback 엔진, 비용 귀속, 저작권 워터마크, 플랫폼 API 변경 대응
6. **NRT** (4개, Sprint 4): 6상태→4색 매핑, heartbeat 5s/15s/30s, WS 브로드캐스트, 지연 ≤2s

### Critic 수정사항:
- **PER-1 Layer 0**: "Admin UI Zod" → "soul-renderer.ts spread 순서 역전 + 6개 built-in 키 충돌 거부" (Quinn HIGH, Stage 1 Research §2.3 R7)
- **MEM-1 Option B 확정**: "또는" → "observations/reflections 신규 테이블 + agent_memories 확장" (Winston Major)
- **PIX-4 모바일 aria-live**: /office PixiJS 불필요, 모바일 리스트 뷰에는 적용 (Sally MEDIUM)
- **PER-6 슬라이더 행동 예시 툴팁**: 신규 추가 (Sally LOW)
- **PER-2**: "(Tech Research personality-injector.ts 역할 통합)" 주석 (Quinn LOW)
- **MKT-1 JSONB race**: atomic update 패턴 + 별도 테이블 분리 검토 주석 (Quinn MEDIUM)
- **FR-PERS1/2/3 BigFive 0~1 회귀**: 0-100 정수 + 5개 개별 extraVars + Phase 5→Sprint 1 (Winston+Quinn cross-talk)

### 요약 테이블:
- v2 43 + v3 32 = 75 (PER-6 추가로 +1)
- Sprint 1: 6, Sprint 2: 11, Sprint 3: 5, Sprint 4: 10

## Carry-Forward

1. N8N-SEC-4 HMAC → FR-N8N4에 미포함, Step 07 Feature Requirements에서 반영 (Winston)
2. MKT-3 비용 가시성 UX → 향후 비용 대시보드에 "외부 API 비용은 각 서비스 콘솔에서 확인" 안내 (Sally, 점수 무영향)
3. Sprint 2 과부하 (11개) → Sprint Planning에서 인프라 트랙 vs 워크플로우 트랙 분리 (Bob)

## Output File

`_bmad-output/planning-artifacts/prd.md`
Domain-Specific Requirements v3 업데이트 + query()→messages.create() 전수 교체 + FR-PERS BigFive 0-100 동기화
