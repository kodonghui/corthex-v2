# Step 07 Fixes Applied
Date: 2026-03-21
Writer: John (PM)

## Critic Scores (Initial)

| Critic | Score | Grade |
|--------|-------|-------|
| Bob | 7.80 | ✅ PASS |
| Quinn | 7.65 | ✅ PASS |
| Sally | 8.10 | ✅ PASS |
| Winston | 7.80 | ✅ PASS |
| **Average** | **7.84** | **✅ PASS (Grade B)** |

## Fixes Applied (12 items, deduplicated from 22 raw issues)

### Fix 1 — Winston #1 CRITICAL: "REST API-only" vs N8N_DISABLE_UI=false 모순
- **Before**: L1640 "REST API-only"
- **After**: "REST API + Editor UI (Hono reverse proxy)"
- n8n 에디터 UI를 제공하므로 "API-only" 표현 제거

### Fix 2 — Quinn #1 HIGH: HMAC per-company 파생 키
- **Before**: L1750 "서버 환경변수 (shared secret)"
- **After**: "마스터 secret(환경변수) + per-company 파생 키(`HMAC(master, companyId)`)"
- companyA→companyB webhook 위조 방지

### Fix 3 — Quinn #2 + Sally #2 HIGH: AES-256 마스터 키 관리
- **Added**: 컴플라이언스 섹션 데이터 격리 테이블 뒤에 "AES-256 마스터 키 관리" 4줄 블록
- 저장 위치(환경변수), 유출 영향(단일 장애점), 완화(.env 600 + GitHub Secrets), 로테이션(Phase 5+ KMS)

### Fix 4 — Bob #1 HIGH: Sprint 2 과부하 트랙 분리
- **Added**: 구현 고려사항에 "Sprint 2 과부하 대응" 블록
- 인프라 트랙 vs 워크플로우 트랙 분리 + Sprint 2.5 분리 가능 명시

### Fix 5 — Bob #2 + Winston #2 MEDIUM: 비용 추적 명확화
- **Before**: "비용 추적 불필요"
- **After**: "CLI 토큰 비용 추적 삭제. 서버 운영 비용은 NFR 내 모니터링. costs.ts/cost-aggregation.ts → v3 제거 대상"

### Fix 6 — Bob #3 MEDIUM: JSONB race condition 주석
- **Added**: 멀티테넌트 모델 외부 API 키 행 + 토큰 관리 테이블에 "⚠️ JSONB race" 주석

### Fix 7 — Quinn #3 MEDIUM: n8n proxy rate limiting
- **Added**: L1640 보안 격리 컬럼에 "proxy rate limit(100 req/min/Admin)"

### Fix 8 — Quinn MEDIUM: /ws/office 연결 제한
- **Added**: OpenClaw /office 프로토콜에 "per-company 연결 상한 10"

### Fix 9 — Sally #1 + Bob cross-talk #6 + Winston #3: n8n Docker restart/healthcheck
- **Added**: L1640 상세 컬럼에 "restart: unless-stopped + healthcheck"
- **Added**: docker-compose.yml 위치 명시 (루트)

### Fix 10 — Sally #3 LOW: /office Tablet fallback
- **Before**: Tablet ❌
- **After**: Tablet △ (리스트 뷰 대체 — 에이전트 이름+상태+색상 뱃지, 정렬 가능)

### Fix 11 — Bob cross-talk #7 LOW: Reflection 크론 동시 실행 부하
- **Added**: 구현 고려사항에 "Reflection 크론 동시 실행 부하" 블록
- 크론 오프셋 또는 큐잉 전략 → 아키텍처에서 확정

### Fix 12 — Quinn LOW: Layer 0 거부 vs 필터 불일치
- **Before**: "충돌 시 거부"
- **After**: "충돌 시 필터링(built-in 값 우선 적용) + 에러 로그"
- spread 순서 역전의 실제 동작은 필터링(덮어쓰기)이므로 표현 수정

## Not Applied (with reason)

- **Winston #4 LOW ($220/인 시점)**: 적용 완료 (Fix 5에 포함)
- **Bob #4 LOW (/office 관찰 전용 vs 메인 사용)**: RBAC 테이블에서 이미 구분됨 (Admin: 관찰 전용, CEO: 메인 사용). 추가 변경 불필요
- **Bob #5 LOW (docker-compose 위치)**: Fix 9에서 "docker-compose.yml 루트에 배치" 명시
- **Quinn LOW (n8n 백업 전략)**: PRD 범위 밖 — 아키텍처/운영 문서에서 다룰 사항
