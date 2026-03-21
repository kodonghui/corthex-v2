# Step 06 Fixes Applied
Date: 2026-03-21
Writer: John (PM)

## Critic Scores (Initial)

| Critic | Score | Grade |
|--------|-------|-------|
| Bob | 8.35 | ✅ PASS |
| Quinn | 8.45 | ✅ PASS |
| Sally | 8.45 | ✅ PASS |
| Winston | 8.15 | ✅ PASS |
| **Average** | **8.35** | **✅ PASS (Grade B)** |

## Fixes Applied (13 items, consolidated from ~20 raw issues + cross-talk)

### Fix 1 — Quinn+Bob+Sally MEDIUM: Go/No-Go #7, #8 검증 테이블 추가
- **Added**: v3 검증 접근법에 "v3 품질 게이트 (전 Sprint 공통)" 별도 테이블
- #7 Reflection 비용: Tier별 비용 한도 초과 시 크론 일시 중지
- #8 에셋 품질: PM 최종 승인, 미승인 시 Sprint 4 미착수

### Fix 2 — Quinn MEDIUM: Go/No-Go #1, #6 분리
- **Before**: #1, #6이 v3 혁신 검증 테이블에 혼재
- **After**: "v3 품질 게이트" 별도 테이블로 분리 (#1 v2 회귀 방지 + #6 UXUI Layer 0)

### Fix 3 — Winston MEDIUM: n8n 혁신 계층 매핑
- **Before**: "과금 | CLI Max 월정액 | n8n 워크플로우로 자동화 확장"
- **After**: "자동화" 계층 신설 + "과금" 행은 v3 "(유지)"로 정리

### Fix 4 — Quinn MEDIUM: Reflection 크론 동시 실행 리스크
- **Added**: v3 혁신 리스크 테이블 Reflection 행에 "DB: advisory lock으로 동시 실행 방지, API: rate limit 준수" 추가

### Fix 5 — Bob+Sally: Brief 3대 문제 → v3 혁신 1:1 매핑
- **Added**: 감지된 혁신 영역 도입부에 4줄 매핑 블록
- 블랙박스→OpenClaw, 획일성→Big Five, 학습 단절→Memory, 자동화 부재→n8n

### Fix 6 — Quinn+Winston: v2 학습 계층 "없음" → "기초"
- **Before**: "학습 | — (없음)"
- **After**: "학습 | memory-extractor 1단계 (키워드 추출·벡터 저장)"

### Fix 7 — Quinn+Winston: AutoGen/CrewAI Memory 비교 테이블 WebSearch 검증 및 수정
- **WebSearch 실행**: AutoGen ag2 Teachability + Mem0 통합, CrewAI 4-type memory 확인
- **Before**: "AutoGen 1단계 (벡터 검색만)", "CrewAI 1단계 (벡터 검색만)"
- **After**: AutoGen "Teachability + Mem0 통합 (벡터+KV+그래프 하이브리드)", CrewAI "4-type (short/long/entity/contextual)"
- 세션 간 지속 행 추가, 비즈니스 조직 통합 행 추가
- **차별화 유지**: 반성(Reflection) + 성장 측정은 여전히 CORTHEX만 보유

### Fix 8 — Bob LOW: 485 API smoke-test Go/No-Go #1
- **Added**: 품질 게이트 테이블에 "#1: 기존 테스트 전통과" 행 (485 API smoke-test + 10,154 테스트)

### Fix 9 — Sally LOW: 6개월 선점 우위 수치 근거
- **Added**: "(근거: v2 개발 6개월 + v3 4 Sprint = 경쟁자 10개월, CORTHEX v2 위 v3 4개월 = 6개월 차이)"

### Fix 10 — Quinn LOW: WebGL 2 지원률 정량 데이터
- **Added**: "WebGL 2 데스크탑 지원률 97%+ (caniuse.com 2026-03 기준)"

### Fix 11 — Quinn LOW: 혁신 1 v3 강화 예시
- **Added**: "예: 성실성 90 에이전트는 체크리스트 자동 생성 + 리뷰 요청, 성실성 20 에이전트는 요약 위주 빠른 응답"

### Fix 12 — Winston LOW: activity_logs tail 구현 방식
- **Before**: "`activity_logs` 실시간 tail (실제 실행 로그)"
- **After**: "`activity_logs` 실시간 tail (PostgreSQL LISTEN/NOTIFY + 폴링 하이브리드, 실제 실행 로그)"

### Fix 13 — Bob LOW: 혁신 8 n8n Brief §4 Layer 2 참조
- **Added**: 혁신 8 제목에 "(Sprint 2, Brief §4 Layer 2)" 추가

## Not Applied (with reason)

- **Bob cross-talk "Go/No-Go #8 없다"**: Fix 1에서 #8 검증 테이블 추가 완료
- **Sally cross-talk "Go/No-Go #7 gap"**: Fix 1에서 #7 검증 테이블 추가 완료
- **Quinn "WebGL 최신 검색 필요"**: Fix 10에서 97%+ 정량 데이터 추가 (caniuse 기준)
