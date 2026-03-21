# Step 10 Fixes Applied
Date: 2026-03-21
Writer: John (PM)

## Critic Scores (Initial)

| Critic | Score | Grade |
|--------|-------|-------|
| Winston | 8.65 | ✅ PASS |
| Quinn | 7.85 | ✅ PASS |
| Sally | 8.45 | ✅ PASS |
| Bob | 8.70 | ✅ PASS |
| **Average** | **8.41** | **✅ PASS (Grade B)** |

## Fixes Applied (12 items, consolidated from ~16 raw issues + cross-talk)

### Fix 1 — Quinn HIGH + Bob MEDIUM: NFR-SC7 VPS 메모리 표기 정정
- **Before**: "(Oracle VPS 4GB 기준)"
- **After**: "(PostgreSQL 할당 메모리 4GB 기준, VPS 총 24GB)"
- VPS 전체 24GB 중 PG 할당 ~4GB이므로 양쪽 모두 표기

### Fix 2 — Cross-talk 합의: NFR-P15 ↔ NRT-2 별개 메커니즘 스코프 명시
- **초기 수정**: 3-tier 통합 (잘못된 방향)
- **Cross-talk 결론**: NFR-P15 = WS transport keep-alive, NRT-2 = Application layer 에이전트 상태
- **최종 NFR-P15**: "적응형 간격: idle 30초 / active 5초. 3회 미수신 시 재연결 (WS transport keep-alive — NRT-2 에이전트 상태 전환과 별개. WS 끊김 시 NRT-2도 error 전환)"
- **NRT-2 추가**: "(Application layer 에이전트 상태 전환 — NFR-P15 WS keep-alive와 별개)"
- Winston 이슈#1 철회 + Quinn 이슈#2 LOW 격하 반영

### Fix 3 — Quinn MEDIUM: NFR-D8 observations/reflections 보존 정책 추가
- **Added**: NFR-D8 — observations 90일 보관 + 90일 초과 자동 아카이브, reflections 무기한
- Sprint 3 Memory 3단계와 데이터 lifecycle 정의

### Fix 4 — Sally MEDIUM: NFR-SC8↔FR-OC2 중복 차별화
- **Before**: "회사별 최대 20 동시 연결 + idle graceful eviction"
- **After**: "회사별 20 동시 연결 부하 테스트 통과 + idle graceful eviction (FR-OC2 기능 기준, NFR은 성능 검증)"
- FR은 기능 상한, NFR은 부하 테스트 통과 기준으로 역할 분리

### Fix 5 — Bob LOW: NFR-S9 wording "전부" → "100%"
- 측정 가능한 수치 표현으로 변경

### Fix 6 — Cross-talk MEDIUM (Winston+Quinn): NFR-S9 ↔ N8N-SEC 매핑 정렬
- **Before**: "Docker network → Hono proxy → API key → webhook HMAC → tag isolation → rate limiting"
- **After**: "N8N-SEC-1~6 100% 통과: 포트 차단(SEC-1) → Admin JWT proxy(SEC-2) → tag 격리(SEC-3) → webhook HMAC(SEC-4) → Docker 리소스 상한(SEC-5) → DB 직접 접근 차단(SEC-6) + proxy rate limiting(100 req/min/Admin, §Integration)"
- 6-layer 명칭을 N8N-SEC-1~6과 정확히 정렬 + rate limiting 출처 명시

### Fix 7 — Quinn LOW: NFR-EXT3 영상 생성 타임아웃 예외
- **Before**: "외부 API 호출 기본 30초. 초과 시 에러 반환"
- **After**: "외부 API 호출 기본 30초 (MKT 영상 생성은 최대 5분 허용). 초과 시 에러 반환"

### Fix 8 — Bob LOW: NFR↔FR 교차 참조 추가
- NFR-A6: "— FR-OC10 품질 기준" 추가
- NFR-A7: "— FR-OC9 품질 기준" 추가
- NFR-SC8: "(FR-OC2 기능 기준, NFR은 성능 검증)" 추가 (Fix 4와 동시 적용)

### Fix 9 — Sally LOW: NFR-P17 MKT 워크플로우 E2E 시간 추가
- **Added**: NFR-P17 — 이미지 생성 ≤ 2분, 영상 생성 ≤ 10분, 게시 ≤ 30초
- Sprint 2 마케팅 자동화 품질 기준

### Fix 10 — Sally LOW + Winston LOW + 전체: NFR 총수 정정
- **Before**: 73개 (P0 22 / P1 37 / P2 14)
- **After**: 74개 (P0 21 / P1 42 / P2 10 / CQ 1)
- 기존 off-by-one 오류 수정 + NFR-D8, NFR-P17 추가 반영
- v2 58 + v3 16 = 74 활성

## Not Applied (with reason)

- **Winston+Quinn cross-talk N8N-SEC 항목 추가(SEC-8, SEC-9)**: NFR-S9를 N8N-SEC-1~6에 정렬하는 방향으로 해결. Step 07 N8N-SEC 변경은 범위 밖.
