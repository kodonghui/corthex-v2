# Critic-A Review — Step 06 Innovation & Novel Patterns v3

> Reviewer: Winston (Architect + API)
> Date: 2026-03-21
> Target: `_bmad-output/planning-artifacts/prd.md` L1437–1672
> Step: `step-06-innovation.md` — Innovation Discovery

---

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 15% | 9/10 | 버전 핀(PixiJS 8, n8n 2.12.3), tree-shaking 6개 클래스(Sprite, AnimatedSprite, Container, TilingSprite, Assets, Ticker) 구체 명시, 5개 extraVars 변수명 전부 나열(L1533), Go/No-Go 번호·리스크 ID(R1/R6/R7/R8)·Sprint 배정·성공 기준(8/10 80%+, 200KB, $0.10/day) 모두 구체적. |
| D2 완전성 | 15% | 8/10 | v2 4 + v3 4 = 8 혁신 전부 문서화. CEO 체감(7건), 기술(8건), 시장 비교, 검증, 리스크 완화 모두 포함. Brief §2 3대 문제(블랙박스→OpenClaw, 획일성→BigFive, 정체→Memory) 매핑 ✅. 4번째 문제(자체 워크플로우→n8n) 매핑 ✅. Go/No-Go 8개 게이트 전부 커버. |
| D3 정확성 | 25% | 8/10 | Technical Research 일관: 4-layer sanitization ✅, Option B ✅, n8n 2.12.3 ARM64 ✅, tree-shaking 6개 클래스 ✅, Park et al. 2023 ✅. Go/No-Go 1-8 매핑 정확 ✅. 시장 비교 대체로 공정. **단, 이슈 #1 참조 (AutoGen Memory 비교).** |
| D4 실행가능성 | 20% | 8/10 | 혁신별 구현 패턴(soul-enricher.ts 파이프라인, observations→reflection 3단계, Hono proxy+tag 격리, extend() tree-shaking) + 리스크 + 폴백 + Sprint 배정. Story 생성에 충분한 수준. |
| D5 일관성 | 15% | 8/10 | Stage 1 Technical Research·Step 07(검증 완료) 결정사항 전부 일관. Step 07 수정(per-company HMAC, N8N_DISABLE_UI=false) 반영(L1574, L1577) ✅. **단, 이슈 #2 참조 (혁신 계층 매핑 불일치).** |
| D6 리스크 | 10% | 8/10 | v3 리스크 테이블 7건 — 전부 폴백+Sprint+Go/No-Go 매핑. PixiJS Canvas 2D 폴백, n8n 제거 폴백, LPC Sprite Sheet 대안, Reflection 비용 게이트. 충분. |

## 가중 평균: 8.15/10 ✅ PASS (초기)

`(0.15×9) + (0.15×8) + (0.25×8) + (0.20×8) + (0.15×8) + (0.10×8) = 1.35 + 1.20 + 2.00 + 1.60 + 1.20 + 0.80 = 8.15`

---

## 재검증 (Verified) — 13건 수정 후

| 차원 | 가중치 | 초기 | 재검증 | 변동 근거 |
|------|--------|------|--------|----------|
| D1 구체성 | 15% | 9 | 9 | activity_logs "LISTEN/NOTIFY + 폴링 하이브리드" 구체화(L1517), WebGL 2 97%+(L1522), 성실성 90 vs 20 예시(L1477) |
| D2 완전성 | 15% | 8 | 9 | Brief 3대 문제 → v3 혁신 명시적 매핑 추가(L1443-1447), Go/No-Go #1,#6 품질 게이트 분리(L1642-1649), #7,#8 추가 |
| D3 정확성 | 25% | 8 | 9 | AutoGen/CrewAI Memory WebSearch 검증 완료(L1552-1558) — Teachability+Mem0 정확 반영, v2 학습 "기초" 정정(L1457), 6개월 선점 수치 근거(L1618) |
| D4 실행가능성 | 20% | 8 | 9 | Reflection advisory lock + API rate limit 구체 패턴(L1671), LISTEN/NOTIFY 구현 방식 명시 |
| D5 일관성 | 15% | 8 | 9 | n8n "자동화" 계층 이동(L1456) — Brief §4 Layer 2 참조, 혁신 8 본문에도 참조 추가(L1571) |
| D6 리스크 | 10% | 8 | 9 | Reflection 동시 실행 advisory lock + rate limit(L1671), Go/No-Go #7,#8 품질 게이트 독립(L1648-1649) |

## 재검증 가중 평균: 9.00/10 ✅ PASS

`(0.15×9) + (0.15×9) + (0.25×9) + (0.20×9) + (0.15×9) + (0.10×9) = 1.35 + 1.35 + 2.25 + 1.80 + 1.35 + 0.90 = 9.00`

### 수정 검증 상세:

| # | 이슈 | 수정 내용 | 검증 위치 | 결과 |
|---|------|---------|---------|------|
| 1 | n8n 혁신 계층 "과금" | → "자동화" 계층 신설, n8n 이동 | L1455-1456 | ✅ |
| 2 | AutoGen Memory "1단계" | → Teachability + Mem0 통합 (WebSearch 검증) | L1552-1558 | ✅ |
| 3 | activity_logs tail 구현 | → "PostgreSQL LISTEN/NOTIFY + 폴링 하이브리드" | L1517 | ✅ |
| 4 | v2 학습 "없음" | → "memory-extractor 1단계 (키워드 추출·벡터 저장)" | L1457 | ✅ |
| — | Brief 3대 문제 매핑 | → 도입부에 4건 명시적 매핑 | L1443-1447 | ✅ |
| — | Go/No-Go #1,#6 분리 | → "v3 품질 게이트" 별도 테이블 | L1642-1649 | ✅ |
| — | Go/No-Go #7,#8 추가 | → 품질 게이트 테이블에 포함 | L1648-1649 | ✅ |
| — | 혁신 1 v3 강화 예시 | → 성실성 90 vs 20 행동 차이 | L1477 | ✅ |
| — | WebGL 2 97%+ | → caniuse.com 2026-03 기준 | L1522 | ✅ |
| — | 6개월 선점 근거 | → v2 6개월 + v3 4개월 수치 산출 | L1618 | ✅ |
| — | 혁신 8 Brief 참조 | → "Brief §4 Layer 2" 추가 | L1571 | ✅ |
| — | Reflection 동시 실행 | → advisory lock + API rate limit | L1671 | ✅ |
| — | 485 API smoke-test | → Go/No-Go #1 품질 게이트 | L1646 | ✅ |

---

## 이슈 목록

### 1. **[D3 정확성] LOW — L1547 AutoGen Memory "1단계 (벡터 검색만)" 과소 평가 가능성**

- PRD: "AutoGen Memory: 1단계 (벡터 검색만)"
- 현실: 2026년 AutoGen (ag2 프로젝트)는 `MemoryStore` + `MemGPT` 통합 등 메모리 기능이 진화 중. "벡터 검색만"은 2024년 기준 설명일 수 있음
- **영향**: 시장 비교 테이블의 신뢰도. 과소 평가하면 향후 투자자/파트너에게 부정확 인상
- **수정 제안**: WebSearch로 2026-03 기준 AutoGen ag2 메모리 기능 확인. "1단계 (벡터 검색 중심)" 또는 구체적 기능 차이 명시. 3단계 Reflection이 없다는 사실은 CORTHEX의 진정한 차별점이므로 그 부분을 강조
- **판단**: LOW — 3단계(관찰→반성→계획) 구조 자체가 genuinely unique (Park et al. 2023 기반). AutoGen이 벡터 검색 이상으로 진화했더라도 Reflection 크론은 없음

### 2. **[D5 일관성] MEDIUM — L1449 혁신 계층 테이블 n8n 매핑 불일치**

- PRD 혁신 계층 테이블(L1449): n8n → **"과금"** 계층 ("월정액 가치 극대화")
- Brief §2 Problem Impact(L113): 자체 워크플로우 코드 → **"유지보수 비용 누적, 버그 반복 (v2에서 500 에러 확인)"**
- 혁신 8 본문(L1565): "기존 자체 워크플로우 엔진(v2에서 500 에러 반복, 유지보수 비용 누적)을 n8n Docker로 대체"
- **불일치**: 혁신 8 본문은 Brief의 "운영 안정성" 동기를 정확히 인용. 그러나 계층 테이블은 "과금" 계층으로 분류 — Brief 원문의 핵심 동기(500 에러/유지보수)와 매핑 계층이 다름
- **수정 제안**: 계층 테이블에 "자동화/운영" 계층 추가 또는 n8n을 "과금"이 아닌 "자동화" 계층으로 이동. 예: `| 자동화 | — (자체 코드, v2 500에러) | n8n Docker 워크플로우 (코드→드래그앤드롭 대체) |`

### 3. **[D1 구체성] LOW — L1510 "activity_logs 실시간 tail" 이지만 데이터 흐름 미명시**

- OpenClaw의 핵심 혁신은 activity_logs → WebSocket → PixiJS 렌더링 파이프라인
- L1510: "데이터 소스: activity_logs 실시간 tail" — 어디서 tail? 서버? DB watch?
- **수정 제안**: "(서버 memory 큐에서 tail, DB polling 아님 — NRT-4 ≤2초 보장)" 또는 구현 기술 1줄 추가. Step 07 L1642에서 "activity_logs tail 읽기 전용(PIX-6)"이 있으므로 참조 추가 가능

---

## 검증 방법

| 확인 항목 | 방법 | 결과 |
|---------|------|------|
| Brief §2 3대 문제 → v3 혁신 매핑 | Brief L98-104 vs PRD L1501-1582 | ✅ 블랙박스→OpenClaw, 획일성→BigFive, 정체→Memory |
| Brief 4th problem → n8n | Brief L113 vs PRD L1565 | ✅ "v2에서 500 에러 반복" 인용 일치 |
| Go/No-Go 8개 게이트 매핑 | Brief L443-450 vs PRD L1627-1633, L1649-1657 | ✅ 전부 정확 매핑 |
| tree-shaking 6개 클래스 | Tech Research L144 vs PRD L1515 | ✅ Sprite, AnimatedSprite, Container, TilingSprite, Assets, Ticker |
| 4-layer sanitization | Tech Research L297-301 vs PRD L1535 | ✅ Layer 0/A/B/C 순서 동일 |
| Option B 메모리 | Tech Research L339 vs PRD L1553-1556 | ✅ observations + agent_memories 확장 |
| Park et al. 2023 참조 | Tech Research L310, L829 vs PRD L1541 | ✅ 관찰→반성→계획 3단계 |
| v2 혁신 왜곡 여부 | L1454-1495 (v2 혁신 원문) | ✅ v3 강화 1단락 추가만(L1470), 원문 비왜곡 |
| Step 07 수정사항 반영 | L1574 "per-company HMAC", L1577 "N8N_DISABLE_UI=false" | ✅ Step 07 fixes 일관 반영 |

---

## Cross-talk 예정

Quinn (QA + Security)과의 교차 검토 예정:
- **혁신 리스크 테이블 L1656 "n8n 에디터 보안 공격 표면"**: Step 07에서 합의한 N8N-SEC-7 (CSRF Origin + 보안 월간 리뷰) 반영 여부
- **4-layer sanitization Layer 0**: Step 07 cross-talk에서 합의한 "필터링+로그" 표현이 혁신 섹션(L1535)에서도 일관된지 — L1535는 "Layer 0(Key Boundary)"로만 표기
