# Step 09 Fixes Applied
Date: 2026-03-21
Writer: John (PM)

## Critic Scores (Initial)

| Critic | Score | Grade |
|--------|-------|-------|
| Winston | 8.50 | ✅ PASS |
| Quinn | 7.75 | ✅ PASS |
| Sally | 8.10 | ✅ PASS |
| Bob | 8.10 | ✅ PASS |
| **Average** | **8.11** | **✅ PASS (Grade B)** |

## Fixes Applied (12 items, consolidated from ~18 raw issues + cross-talk)

### Fix 1 — Quinn HIGH: FR-N8N6 CSRF Origin 검증 추가
- **Before**: "JWT + Admin 권한 검증"
- **After**: "JWT + Admin 권한 + CSRF Origin 검증, FR-N8N4 인프라 기반"
- Winston LOW (중복 참조) + Sally LOW (중복 참조) 동시 해결

### Fix 2 — Sally HIGH + Bob MEDIUM: FR-MKT6 저작권 워터마크 신규
- **Added**: FR-MKT6 — Admin이 AI 생성 콘텐츠에 저작권 워터마크 삽입 여부를 ON/OFF할 수 있다
- Step 05 도메인 요구사항 MKT-4 대응

### Fix 3 — Sally HIGH: FR-PERS8 슬라이더 행동 예시 툴팁 신규
- **Added**: FR-PERS8 — 각 슬라이더 위치별 행동 예시 툴팁 표시
- Step 05 도메인 요구사항 PER-6 대응

### Fix 4 — Sally HIGH (부분): NRT-2 heartbeat 적응형 간격 → NFR 영역
- **Not Applied as FR**: heartbeat 간격은 "어떻게"(구현 품질)이므로 NFR 영역
- Step 10 NFR 작성 시 반영 예정 (carry-forward)

### Fix 5 — Bob MEDIUM + Quinn LOW: FR-MKT7 fallback 엔진 전환 신규
- **Added**: FR-MKT7 — 외부 AI API 장애 시 fallback 엔진 자동 전환 + Admin 알림

### Fix 6 — Quinn MEDIUM: FR-MKT2 플랫폼별 실패 격리 추가
- **Before**: 멀티 플랫폼 동시 게시만 기술
- **After**: "일부 플랫폼 게시 실패 시 성공 플랫폼은 유지하고 실패 플랫폼만 Admin에게 알린다" 추가

### Fix 7 — Quinn MEDIUM + Winston LOW: FR-MKT4 구현 상세 제거
- **Before**: "n8n Switch 노드가 CORTHEX API GET /api/company/:id/marketing-settings 조회"
- **After**: "다음 워크플로우 실행부터 즉시 반영된다"

### Fix 8 — Sally MEDIUM: FR-MEM9 성공 정의 추가
- **Before**: "유사 태스크 성공률 추이"
- **After**: "유사 태스크 성공률 추이 — 성공 기준: observations.outcome='success'"

### Fix 9 — Sally MEDIUM: FR-MKT3 CEO앱 웹 승인 경로 추가
- **Before**: "Slack/Telegram 미리보기에서"
- **After**: "CEO앱 웹 UI 또는 Slack/Telegram 미리보기에서"

### Fix 10 — Quinn LOW: FR-UX1 범위 확정
- **Before**: "6~8개로 통합"
- **After**: "6개 그룹으로 통합"

### Fix 11 — Bob LOW: FR-MKT1 AI 모델명 카테고리화
- **Before**: 구체적 모델명 나열 (Nano Banana 2, Flux 2, ...)
- **After**: "카테고리별(이미지 3종+, 영상 4종+, 나레이션 2종, 자막 3종)로 선택"

### Fix 12 — Bob MEDIUM: v3 FR altitude 불일치 대응
- 기존 v3 FR(FR-OC7, FR-PERS2, FR-N8N4)의 구현 상세는 이전 Step에서 크리틱 검증 완료된 항목
- 신규 FR은 전부 capability 고도 준수 (Fix 7 등으로 구현 상세 제거)
- 기존 FR의 구현 상세는 개발자 참조용 컨텍스트로 유지 (§Domain 참조 패턴은 불필요한 indirection 추가)

## Not Applied (with reason)

- **Sally HIGH NRT-2 heartbeat**: FR이 아닌 NFR 영역 — Step 10 carry-forward
- **Bob LOW NFR-S7 cost-tracker 모순**: NFR 영역 — Step 10에서 처리
- **Bob MEDIUM v3 altitude 전면 리팩터**: 이전 Step 승인 FR 변경은 리스크 > 가치. 신규 FR만 altitude 준수

## FR 총수

- 활성: **116개** (v2 97 + v3 신규 19)
- 삭제: 2개 (FR37, FR39 — CLI Max 월정액)
- 총 줄 수: 118줄
