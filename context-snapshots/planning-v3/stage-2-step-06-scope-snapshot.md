# Context Snapshot — Stage 2, Step 06 Innovation & Novel Patterns
Date: 2026-03-21
Pipeline: /kdh-full-auto-pipeline planning (v9.0)
Project: CORTHEX v3 "OpenClaw"

---

## Step 06 Outcome

**Status**: ✅ PASS (avg 9.10/10, Grade A, GATE Option A)

| Critic | Initial | Verified | Note |
|--------|---------|----------|------|
| Bob | 8.35 ✅ | 9.15 ✅ | 5 issues: Go/No-Go #7/#8 gap, Brief 매핑, 6개월 근거, n8n §4 참조 |
| Quinn | 8.45 ✅ | 9.10 ✅ | 5 issues: Go/No-Go #1/#6 분리, Reflection 동시 실행, WebGL 정량, 혁신 1 예시, AutoGen WebSearch |
| Sally | 8.45 ✅ | 9.15 ✅ | 3 issues: Go/No-Go #7/#8 gap, Brief 매핑, 6개월 근거 |
| Winston | 8.15 ✅ | 9.00 ✅ | 4 issues: n8n 계층 매핑, v2 학습 "없음"→"기초", AutoGen WebSearch, activity_logs tail |

## Key Changes

### Innovation 재구성 (v2 4 + v3 4 = 8대 혁신):

**v2 기반 혁신 (유지):**
1. Soul = 오케스트레이션 (시장 유일) — v3 강화: Big Five personality_* extraVars 주입
2. call_agent N단계 핸드오프 — 도구 레벨 서브에이전트 우회
3. 비개발자 AI 조직 설계 — NEXUS 드래그&드롭
4. CLI Max 월정액 과금 모델

**v3 신규 혁신:**
5. OpenClaw 가상 사무실 — PixiJS 8, WebSocket /ws/office, activity_logs tail (LISTEN/NOTIFY + 폴링)
6. Big Five 성격 시스템 — OCEAN 0-100 정수, soul-enricher.ts → 5개 extraVars, 4-layer sanitization
7. 에이전트 메모리 3단계 — 관찰→반성→계획, Option B 확정, memory-reflection.ts 분리
8. n8n 워크플로우 자동화 — n8n Docker 2.12.3 ARM64, Hono proxy, tag 격리, Brief §4 Layer 2

### Critic 수정사항 (13건):
- **Go/No-Go 8개 게이트 전부 검증 테이블 커버**: 혁신 검증 (4건: #2,#3,#4,#5) + 품질 게이트 (4건: #1,#6,#7,#8) 분리
- **Brief 3대 문제 → v3 혁신 매핑**: 블랙박스→OpenClaw, 획일성→Big Five, 학습 단절→Memory, 자동화 부재→n8n
- **AutoGen/CrewAI Memory WebSearch 검증**: AutoGen Teachability+Mem0 (벡터+KV+그래프), CrewAI 4-type (short/long/entity/contextual). Reflection+성장 측정은 CORTHEX만 보유
- **n8n 혁신 계층**: "과금" → "자동화" 계층 이동
- **v2 학습**: "없음" → "memory-extractor 1단계 (키워드 추출·벡터 저장)"
- **Reflection 크론**: advisory lock 동시 실행 방지 + API rate limit 준수
- **6개월 선점 우위 근거**: v2 6개월 + v3 4개월 = 경쟁자 10개월, 차이 6개월
- **WebGL 2 지원률**: 97%+ (caniuse.com 2026-03 기준)

### 검증 테이블 구조:
- v2 혁신 검증: 6행 (Phase 1~2 완료)
- v3 혁신 검증: 4행 (Sprint 1~4, Go/No-Go #2,#3,#4,#5)
- v3 품질 게이트: 4행 (전 Sprint, Go/No-Go #1,#6,#7,#8)
- v2 리스크 완화: 5행
- v3 리스크 완화: 7행

## Carry-Forward

1. L1441 "스스로" 오타 — 극미, Quinn 지적 (차단 아님)
2. Step 07 재작업 필요 — Innovation 섹션 변경으로 Technical Architecture Context에 일부 영향 가능
3. Step 07 carry-forward items (이전 세션): Docker hardening, N8N-SEC-7 CSRF, n8n backup, /office RBAC label unification

## Output File

`_bmad-output/planning-artifacts/prd.md`
Innovation & Novel Patterns 전체 v3 재작성 + 8대 혁신 체계화 + 검증 테이블 품질 게이트 분리 + AutoGen/CrewAI 정확 비교
