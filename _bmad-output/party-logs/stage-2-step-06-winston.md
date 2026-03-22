# Critic-A Review — Stage 2 Step 6: User Journeys (PRD L1070-1335)

**Reviewer**: Winston (Architecture + API)
**Date**: 2026-03-22
**Artifact**: `_bmad-output/planning-artifacts/prd.md` lines 1070–1335
**Grade Request**: B (reverify)
**Revision**: v2 (post-fix verified) ← v1 8.65 PASS → **v2 9.00 PASS**

---

## Review Score: 9.00/10 ✅ PASS

### 차원별 점수

| 차원 | 점수 | 가중치 | v1→v2 | 근거 |
|------|------|--------|-------|------|
| D1 구체성 | 9/10 | 15% | 9→9 | Journey 10 메모리 설정에 4-layer 보안 필터, 20개 threshold, advisory lock, ECC 2.2 등 구체적 메커니즘 추가. 사이드바 통합 14→6 체감 추가 |
| D2 완전성 | 9/10 | 15% | 9→9 | Journey 2/3 에러 시나리오 추가. Requirements Summary 5행 추가 (보안/운영/사이드바). 감점: L1311 "주간 리포트 알림" stale (Fix 8에서 Journey 텍스트 수정했으나 Req Summary 미동기화) |
| D3 정확성 | 9/10 | **25%** | 8→9 | H1 해소: 47→2 반성 (20-count 정합). H2 해소: Planning = read-time lookup. Fix 4: n8n 2G + 보안 3중. Fix 1: Obs Poisoning 4-layer + 30일 TTL. **잔류**: L1293 오류율 40%→15% 미재보정 (bob: 2건 Reflection → ~10p 현실적). AI 벤더 미검증(deferred) |
| D4 실행가능성 | 9/10 | **20%** | 9→9 | Requirements Summary 확장으로 보안/운영 FR 매핑 완비 |
| D5 일관성 | 9/10 | 15% | 9→9 | Product Scope 정합: 20-count trigger, read-time Planning, Option B. Confirmed decisions #3/#5/#7/#8/#9/#10 반영. **잔류**: L1311 "주간 리포트" stale |
| D6 리스크 | 9/10 | 10% | 8→9 | 10/10 여정 에러 시나리오 완비 (Journey 2 OOM, 3 크론 타임아웃, 9 WS limits, 10 보안 차단 추가). Journey 6만 에러 없으나 v2 Phase 4 범위 |

**가중 평균**: (9×0.15)+(9×0.15)+(9×0.25)+(9×0.20)+(9×0.15)+(9×0.10) = 1.35+1.35+2.25+1.80+1.35+0.90 = **9.00**

---

## 이슈 목록 (5건)

### HIGH (1건)

| # | 이슈 | 위치 | 근거 |
|---|------|------|------|
| H1 | **Journey 10 Reflection 수치 — Product Scope 트리거 모델과 수학적 불일치** | L1277-1279 | Journey 10: "Observation: 47건 누적, Reflection: 14건 생성 (매일 1건)". Product Scope L951: "에이전트별 최근 20개 관찰(reflected=false)이 쌓이면 자동 실행". 47 관찰 / 20개 트리거 = 최대 2.3건 반성. **14건은 수학적 불가.** Brief L163은 "기본 일 1회" 크론 → Journey는 Brief의 daily 모델을 따르지만, Product Scope/Success Criteria는 20-count threshold 모델. 근본적으로 Brief↔Product Scope 간 Reflection 트리거 메커니즘 해석 차이. **Fix**: (A) 수치 수정: 47 관찰 → 2건 반성 (20-count 모델 기준), 또는 (B) 트리거 모델 통일: daily cron + 최소 threshold 결합 (e.g., "최소 3개 unreflected 관찰 시 실행, 20개 초과 시 우선 배치") + 수치 재계산 |

### MEDIUM (2건)

| # | 이슈 | 위치 | 근거 |
|---|------|------|------|
| M1 | **Journey 10 Reflection 설명 — "하루 동안의 Observation을 종합" 표현** | L1270 | "크론 주기 설정 (매일 새벽 3시 기본) → 하루 동안의 Observation을 종합해 패턴·교훈 추출". Product Scope L951: 20개 threshold trigger. "하루 동안의" 표현은 시간 기반(daily) 처리를 암시하지만, 실제는 count 기반(20개 축적). 구현자가 "당일 관찰만 처리"로 오해 가능. **Fix**: "unreflected 관찰 20개 이상 축적 시 크론이 자동 실행 → 관찰 요약 → 반성 생성" |
| M2 | **Requirements Summary — Reflection 삭제/재생성 FR 누락** | L1315 vs L1288-1290 | Journey 10 L1288: "비정상 Reflection 삭제 + Planning 재생성 트리거". L1290: "Zero Regression: 기존 agent_memories 데이터 단절 0건 보장". Requirements Summary L1315: "메모리 3단계 모니터링 (Observation/Reflection/Planning), Tier별 한도, 반복 오류율 그래프" — 삭제/재생성 액션과 Zero Regression 보장이 누락. **Fix**: L1315에 "+ Reflection 수동 삭제 + Planning 재생성 트리거 + agent_memories 데이터 단절 0건 (Go/No-Go #1/#4)" 추가 |

### M4 (sally 발견): Journey 8 AI 도구 벤더 — Tech Research 미검증

| 항목 | 내용 |
|------|------|
| **위치** | L1218-1221, L1195, L1228 |
| **Journey 8** | Ideogram V3 ($0.03~0.09/장), Kling 3.0 (~$0.03/초), ElevenLabs, Flux 2 (fallback) — 구체적 벤더+가격 |
| **Tech Research** | `technical-research-2026-03-20.md`에서 해당 벤더 검색 결과 0건 (sally 확인) |
| **문제** | Stage 1 Tech Research에서 검증되지 않은 벤더를 구체적 가격과 함께 서술. 가격 변동/API 폐기/호환성 미검증 |
| **Fix** | (A) 벤더명을 placeholder로 교체 ("이미지 엔진: [Tech Research 결과]"), 또는 (B) Tech Research에 해당 벤더 검증 추가 후 반영 |

### LOW (2건)

| # | 이슈 | 위치 | 근거 |
|---|------|------|------|
| L1 | **Journey 2/3/6 에러 시나리오 부재** | L1116-1128, L1129-1143, L1183-1188 | Journey 2(팀장 박과장): 워크플로우 실행 실패 시 팀장 경험 미기술. Journey 3(투자자 이사장): 4명 병렬 분석 중 1명 실패 시 시나리오 없음 (Journey 1 Phase 2에서 유사 시나리오 있으나, 투자자 관점 부재). Journey 6(Admin 개발): MCP 연결 실패/캔버스 동기화 에러 미기술. **Fix**: 각 여정에 1건씩 에러 시나리오 추가 |
| L2 | **보안 관련 에러 시나리오 부재** | 전체 | Observation Poisoning 4-layer 방어(Go/No-Go #9)가 실제 차단 시 사용자 경험 미기술. Tool Sanitization(Go/No-Go #11) 위반 시 Admin 알림 경험 미기술. 보안 기능이 투명하게 동작해도, Admin이 차단 이벤트를 어떻게 인지하는지 여정에 포함 필요. **Fix**: Journey 10 또는 4에 보안 차단 시나리오 1건 추가 (e.g., "Observation Poisoning 탐지 → flagged=true 마킹 → Admin 메모리 탭에서 '차단된 관찰 2건' 확인") |

---

## 자동 불합격 검토

| 조건 | 판정 |
|------|------|
| 할루시네이션 | ❌ 없음 — 모든 기능이 Brief/Product Scope에 근거 |
| 보안 구멍 | ❌ 없음 |
| 빌드 깨짐 | ❌ N/A |
| 데이터 손실 위험 | ❌ 없음 |
| 아키텍처 위반 | ❌ 없음 — E8 경계 언급 없음 (User Journeys는 사용자 경험 레벨) |

---

## 검증 상세

### Journey 1: CEO 김도현 (L1074-1114) ✅
- Phase 1-4 + Sprint 1/3/4 커버
- Phase 1: processing 이벤트 즉시 전송, SDK 재시도 1회 → 에러 메시지 ✅
- Phase 2: 핸드오프 추적 시각화, CMO 타임아웃 → 나머지 종합 ✅
- Sprint 1: Big Five 성실성 85 → 체크리스트 자동 생성 — 구체적 행동 변화 ✅
- Sprint 3: Reflection 알림 "주간 성장 리포트", 반복 오류 40%→15% — 정량 지표 ✅
- Sprint 4: /office PixiJS, 에러 시 빨간 느낌표 + 캐릭터 정지 + NEXUS 빨간 노드 ✅
- Sprint 순서 검증: 1→3→4 (2 스킵 = CEO는 n8n 미사용) ✅

### Journey 2: 팀장 박과장 (L1116-1128) ⚠️ (L1)
- Phase 2-3 + Sprint 2 커버
- 비서 유무 설정 분기 명확 (팀장=없음, 신입=있음, 경력=없음) ✅
- Sprint 2: 워크플로우 실행 결과 "읽기 전용" 명확 ✅
- **L1**: 에러 시나리오 없음

### Journey 3: 투자자 이사장 (L1129-1143) ⚠️ (L1)
- Phase 2/4 + Sprint 3/4 커버
- call_agent 병렬 4명 + 의견 충돌 → Soul 검증 → 병기: 구체적 ✅
- ARGOS 크론 → 음성 브리핑 → 텔레그램: Product Scope 정합 ✅
- Sprint 3: 선호 종목 비중 자동 기억 — 메모리 실용 시나리오 ✅
- Sprint 4: 4명 동시 움직임 — /office 시각화 ✅
- **L1**: 4명 병렬 중 1명 실패 에러 시나리오 없음

### Journey 4: Admin 이수진 (L1145-1174) ✅
- Phase 2-3 + Sprint 1/2/3 커버
- Phase 2 초기 설정 ~10분: 5단계 세부 (회사→직원→부서→도구→Soul) ✅
- Phase 3 NEXUS: 드래그&드롭, [+ 부서], 연결, 저장 → 즉시 반영 ✅
- Sprint 1: Big Five 슬라이더 + 프리셋 + 실시간 미리보기 + 접근성 ✅
- Sprint 2: n8n React UI + native editor 링크 이중 접근 ✅
- Sprint 3: 메모리 3단계 모니터링 + Reflection 성장 확인 ✅

### Journey 5: Human 직원 이과장 (L1176-1181) ✅
- Phase 2 집중 (짧지만 적절 — Human 직원 역할 한정)
- 2클릭 ~5초: 구체적 ✅
- 범위 밖 요청 거절 + 안내: 에러 시나리오 ✅

### Journey 6: Admin 개발 (L1183-1188) ⚠️ (L1)
- Phase 4 스케치바이브 집중
- Claude Code ↔ MCP ↔ 캔버스 양방향: 구체적 ✅
- **L1**: MCP 연결 실패 에러 시나리오 없음

### Journey 7: CEO 첫 사용자 온보딩 (L1190-1197) ✅
- Phase 2 + v3 추가 단계
- ~5분 셀프서비스: 기본 조직 자동 생성 ✅
- Big Five 기본값 50/100: 중립 설정 합리적 ✅
- v3 추가: n8n 마케팅 프리셋 + AI 도구 엔진 기본값 ✅
- 15분 초과 시 "나중에 계속하기": Go/No-Go #13 사용성 검증 연결 ✅

### Journey 8: Admin 마케팅 딥다이브 (L1199-1228) ✅
- Sprint 2 집중 — 내러티브 구조 (Opening→Rising→Climax→Resolution) ✅
- 6단계 파이프라인: 구체적 (주제→리서치→생성→승인→게시→성과) ✅
- AI 도구 엔진: Ideogram V3, Kling 3.0, ElevenLabs — Tech Research 정합 필요 (carry-forward)
- "4시간→15분" 정량 개선: 설득력 ✅
- 에러: API 타임아웃 30초 → 재시도 2회 → fallback 엔진 + Slack 알림 ✅

### Journey 9: CEO /office 딥다이브 (L1230-1258) ✅
- Sprint 4 집중 — 내러티브 구조 ✅
- Brief 5상태 + PRD degraded 6번째: L1248-1251 정확 매핑 ✅
- NEXUS 4색 (idle파란/active초록/error빨간/degraded주황): NFR NRT-1(L1492) 정합 ✅
- heartbeat 설명 (15초→degraded): NFR NRT-2(L1493) 정합 ✅
- 접근성: desktop-only + 모바일 리스트 뷰 + aria-live: Brief 정합 ✅

### Journey 10: Admin 메모리 딥다이브 (L1260-1290) ⚠️ (H1, M1)
- Sprint 3 집중 — 내러티브 구조 ✅
- 3단계 파이프라인 (Observation→Reflection→Planning): Brief L161-165 정합 ✅
- **H1**: 47 관찰 → 14 반성 수치 불일치 (20-count 트리거 기준 최대 ~2건)
- **M1**: "하루 동안의 Observation을 종합" — count 기반이 아닌 time 기반 표현
- Tier별 한도 (Tier 1-2 무제한, 3-4 주1회): MEM-2(L1462) 정합 ✅
- 에러: 잘못된 패턴 학습 → Reflection 삭제 + Planning 재생성 ✅
- Zero Regression: agent_memories 데이터 단절 0건 ✅

### Requirements Summary (L1292-1319) ⚠️ (M2)
- 20행: 여정별 FR 매핑 충실
- Sprint 할당 정확 ✅
- L1302 /office 상태: Brief 5+PRD 1 명시 ✅
- L1312 접근성: aria-valuenow, 키보드 ✅
- **M2**: Journey 10 Reflection 삭제/재생성 FR 누락

### 교차점 테이블 (L1321-1334) ✅
- 11 교차점: 권한 분리, 채널 분기, WebSocket 이중 브로드캐스트 등
- L1333 /ws/office vs /ws/agent-status: 공통 데이터 + PixiJS 전용 페이로드 구분 — 아키텍처적으로 중요한 정보 ✅
- L1334 n8n Error Workflow: timeout 30s + retry 2x + fallback + Slack: 구체적 ✅

---

## Fix 검증 (8건 — fixes.md 기준)

### CRITICAL (1건)

| Fix # | 이슈 | 검증 | 판정 |
|-------|------|------|------|
| Fix 1 | Journey 10 전면 재작성 | L1278: 4-layer 보안 (Go/No-Go #9) ✅. L1279: "20개 이상 누적 시에만 실행" + advisory lock + ECC 2.2 ✅. L1280: "read-time semantic search, Option B" ✅. L1282: 30일 TTL ✅. L1287: "Reflection 2건" ✅. L1300: 보안 에러 시나리오 ✅. **잔류**: L1286 reflected 24/unreflected 23 → 2×20=40 reflected 기대치와 불일치 (minor). L1293 오류율 40%→15% 미재보정 | ⚠️ FIXED (잔류 minor 2건) |

### MAJOR (5건)

| Fix # | 이슈 | 검증 | 판정 |
|-------|------|------|------|
| Fix 2 | Journey 2 에러 시나리오 | L1132: n8n OOM → ❌ 표시 + 실패 원인 + Admin 문의 안내 ✅ | ✅ FIXED |
| Fix 3 | Journey 3 에러 시나리오 | L1150: 뉴스분석가 타임아웃 → /office 빨간 느낌표 + 3명 종합 ✅ | ✅ FIXED |
| Fix 4 | Journey 8 n8n 2G + 보안 | L1214: "2G RAM, --memory=2g" + "port 5678 차단 + 태그 필터 + HMAC (Go/No-Go #3)" ✅ | ✅ FIXED |
| Fix 5 | Journey 9 WS limits + heartbeat | L1264: 동시 접속 50+ 제한 + heartbeat 5초→15초→30초 (confirmed #10, R15) ✅ | ✅ FIXED |
| Fix 6 | Journey 1 사이드바 통합 | L1101-1102: "14개→6개 그룹 통합 (FR-UX1)" ✅ | ✅ FIXED |

### MINOR (2건)

| Fix # | 이슈 | 검증 | 판정 |
|-------|------|------|------|
| Fix 7 | Requirements Summary 5행 추가 | L1325-1329: Obs 보안, Reflection 크론+TTL, 사이드바, n8n 운영+보안, WS 제한 ✅ | ✅ FIXED |
| Fix 8 | "매주 성장 리포트" 삭제 | L1112: "Admin 메모리 대시보드에서 확인" ✅. **잔류**: L1311 Req Summary 아직 "주간 리포트 알림" 표현 | ⚠️ FIXED (잔류 minor) |

---

## 잔류 이슈 (3건 minor)

1. **L1286 reflected count 24/23**: 2 reflections × 20 obs = 40 reflected 기대. 24 reflected + 23 unreflected는 정확한 모델 시뮬레이션과 다소 불일치. 내러티브에 영향 없음
2. **L1293 오류율 40%→15%**: 2건 Reflection으로 25p 감소는 과대 (bob: ~10p 현실적). 내러티브 설득력에는 영향
3. **L1311 "주간 리포트 알림"**: Fix 8에서 Journey 1 텍스트 수정했으나 Requirements Summary L1311 미동기화

## 미수정 (deferred)

| Item | Reason | Deferred to |
|------|--------|-------------|
| Journey 6 스케치바이브 확장 | v2 Phase 4, v3 범위 외 | — |
| AI 도구 벤더 검증 | Tech Research Stage 1 범위 | Tech Research |
| Reflection 90% 실패 처리 | Architecture carry-forward | Architecture |

---

## Cross-talk 결과

### bob (Critic-C) — 7.45/10 ✅ PASS
1. **Planning stage misalignment (내가 놓친 HIGH)**: Product Scope L957-960 Planning = read-time semantic search (soul-enricher.ts). Journey 10은 "5건 적용", "수동 트리거", "재생성" → 생성 단계로 묘사. 구현자가 Planning storage + trigger API를 만들 위험. **동의 — H2로 추가**
2. **"3-stage" 프레이밍**: Planning은 Obs/Ref과 동질의 "단계"가 아님 — 2-stage pipeline + automatic retrieval이 아키텍처적으로 정확. **L957-960 citation으로 확정 합의**
3. **Tier 3-4 "주 1회"**: MEM-2(L1462)에서 PRD 확정 → 이슈 아님 (bob도 observation으로 downgrade)
4. **Fix (A) 우선 합의**: Journey 수치 교정 먼저, 트리거 모델 변경은 별도 Product 결정. "숫자가 스펙을 거꾸로 바꾸면 안 됨"
5. **L1285 오류율 40%→15% 재보정 필요**: 2건 Reflection으로 25p 감소는 과대 → ~10p 감소가 현실적

### sally (Critic-B) — 7.45/10 ✅ PASS
1. **사이드바 통합 여정 부재**: Success Criteria L501 "6개+ 감소" 있으나 여정 없음 — **동의, M3로 추가**
2. **n8n 이중 터치포인트**: J4 L1167-1169에서 React UI + native editor 명확 구분 ✅
3. **Gate #9 Admin 처리 여정 부재**: 내 L2와 동일
4. **AI 도구 벤더 미검증 (신규 발견)**: Tech Research (`technical-research-2026-03-20.md`)에서 Ideogram V3, Kling 3.0, ElevenLabs **검색 결과 0건**. Journey 8에 구체적 벤더명+가격 서술하지만 Stage 1 Tech Research 근거 부재. **M4로 추가**

### quinn (Critic-D) — 6.30/10 ❌ FAIL
1. **C2 Confirmed decisions 7/12 미반영**: 부분 동의 — 12개 중 3개(Voyage, Poisoning, TTL)은 여정 반영 필요. 나머지 9개는 infra-level로 user journey 범위 밖
2. **C1 Observation poisoning 여정 부재**: 내 L2와 동일
3. **Reflection 90% failure handling**: Journey 10 순수 happy path — infra error 시나리오 없음 확인. Cron 실패 시 알림/retry/fallback 여정 없음
4. **"매주 월요일 성장 리포트" (L1109)**: Journey에서 도출된 신규 FR — Success Criteria 미대응. Carry-forward
5. **H1 Reflection math 채택**: 47/20 = 2건 정확 확인. AND model (daily cron + ≥20 threshold) 정식 합의. "Day 6 첫 reflection, Day 12 두 번째" 시나리오 제시

## 팀 점수 요약

| Critic | v1 Score | v2 Score | Pass/Fail |
|--------|----------|----------|-----------|
| Winston (A) | 8.65 | **9.00** | ✅ PASS |
| Bob (C) | 7.45 | (awaiting) | — |
| Sally (B) | 7.45 | (awaiting) | — |
| Quinn (D) | 6.30 | (awaiting) | — |
| **v1 Average** | **7.46** | — | **3/4 PASS** |

---

## 추가 이슈 (Cross-talk 반영)

### H2 (bob 발견): Journey 10 Planning stage — Product Scope 범위 불일치

| 항목 | 내용 |
|------|------|
| **위치** | L1271, L1279, L1288, L1290 |
| **Journey 10** | "Planning: 5건 적용" (카운터블), "수동 트리거 가능", "Planning 재생성 트리거" |
| **Product Scope L957-960** | `soul-enricher.ts`에서 Soul 주입 직전 실행, `agent_memories`(reflection) cosine ≥ 0.75 상위 3개 검색, `{relevant_memories}` 변수로 주입 = **read-time lookup** |
| **문제** | Journey가 Planning을 생성 단계(stored artifacts + manual trigger + regeneration)로 묘사. Product Scope는 자동 검색(no storage, no trigger). 구현자가 Planning storage table + manual trigger API + count dashboard를 over-engineer할 위험 |
| **Fix** | Journey 10 Planning 묘사 수정: "Planning: 태스크 시작 시 자동으로 관련 Reflection 3건을 Soul에 주입 (시맨틱 검색, 수동 개입 불필요)" + "Planning 재생성 트리거" 삭제 |

### M3 (sally 발견): 사이드바 통합(14→6) 여정 부재

| 항목 | 내용 |
|------|------|
| **위치** | 전체 (Journey 1/7에 해당) |
| **문제** | Success Criteria L501 "사이드바 6개+ 감소", FR-UX1 존재. 하지만 어떤 여정에서도 사이드바 통합 경험 미기술. CEO/Admin이 "메뉴가 줄어서 찾기 쉬워졌다"는 체감 부재 |
| **Fix** | Journey 1 또는 7에 1줄 추가: "사이드바에서 Hub/Chat/Office/Library 4개 메뉴로 즉시 접근 (v2 대비 6개 감소)" |

---

## Carry-Forward to Architecture Stage (final — cross-talk 완료)

1. **Reflection 트리거 모델 통일**: Brief L163 "일 1회 크론" vs Product Scope L951 "20개 관찰 threshold" — Architecture에서 AND model (daily cron + ≥20 threshold) 최종 확정. 전 critic 합의: AND model이 정식
2. **Planning 단계 프레이밍 확정**: "3단계 파이프라인" vs "2단계 + 자동 검색" — Architecture에서 공식 용어 확정 (bob/winston 합의: Product Scope L957-960 = read-time lookup)
3. **AI 도구 엔진 벤더 검증**: Ideogram V3, Kling 3.0, ElevenLabs — Tech Research에서 미검증 (sally 확인). Architecture/Tech Research에서 벤더 선정 + 가격 검증 필요
4. **보안 이벤트 사용자 경험**: Observation Poisoning 차단 / Tool Sanitization 위반 시 Admin 알림 UX → Feature Requirements(Step 8+)
5. **NEXUS /ws fan-out 구조**: /ws/agent-status + /ws/office 공통 소스 fan-out service 위치 확정 (Architecture)
6. **"주간 성장 리포트" FR**: Journey 1 L1109에서 도출된 신규 FR — Success Criteria 대응 metric 필요 (quinn)
7. **Confirmed decisions 여정 반영**: Voyage migration Admin 여정, Obs Poisoning Admin 처리 여정, 30일 TTL Admin 인지 여정 (quinn: 3/12 user-facing)
8. **Journey 10 오류율 40%→15% 재보정**: 2건 Reflection으로 25p 감소는 과대 (bob/quinn 합의)
