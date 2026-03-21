# Critic-A Review — Step 09 Functional Requirements Synthesis

> Reviewer: Winston (Architect + API)
> Date: 2026-03-21
> Target: `_bmad-output/planning-artifacts/prd.md` L2137–2336 (FR 섹션 전체)
> Step: `step-09-fr-synthesis.md` — Functional Requirements Synthesis

---

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 15% | 9/10 | FR-MKT1 AI 도구 엔진 옵션 6+종 나열, FR-MKT2 파이프라인 6단계 구체적, FR-UX1 페이지 그룹핑 명시, FR-MEM9 성장 지표 3종(관찰 수/반성 수/성공률 추이). Sprint 태그 전부 정확. |
| D2 완전성 | 15% | 9/10 | v3 6개 도메인(OC/N8N/MKT/PERS/MEM/UX) 전부 커버. Journey 1,4,7~10 전부 FR에 매핑. 마케팅(신규)·프리셋(편의)·성장 지표(가시성)·페이지 통합(UXUI) 빠짐없이 반영. Admin /office 읽기 전용(FR-OC11) 추가. |
| D3 정확성 | 25% | 8/10 | Sprint 매핑 정확. FR-OC9 모바일 리스트 뷰 = Step 07 Sally cross-talk 일치 ✅. FR-OC10 aria-live = PIX-4 일치 ✅. FR-PERS6~7 프리셋 = Brief §4 Layer 3 일치 ✅. **단, 이슈 #1 (FR-MKT4 구현 누출), 이슈 #3 (FR 총수 불일치).** |
| D4 실행가능성 | 20% | 9/10 | 모든 FR이 검증 가능한 형태 (binary pass/fail). FR-MKT2 파이프라인은 복잡하지만 단계별 검증 가능. FR-MEM9 성장 지표는 수치 기반 측정 가능. FR-UX1 통합은 "기능 100% 유지" 제약으로 회귀 테스트 가능. |
| D5 일관성 | 15% | 8/10 | 기존 FR과 충돌 없음. Sprint 태그 일관. FR-OC2 연결 상한 20 = Step 07 L1794 일치 ✅. **단, 이슈 #2 (FR-N8N6 vs FR-N8N4 부분 중복).** |
| D6 리스크 | 10% | 8/10 | FR-MKT2 외부 API 다수 의존(이미지/영상/나레이션/SNS 플랫폼) = 실패 지점 다수. FR-UX1 14→6~8 통합 시 기능 누락 리스크. FR-MEM10 알림 추가 시 기존 WS 채널 간섭 가능. 각각 폴백 전략이 FR 수준에서는 미명시 (NFR/리스크에서 다루는 범위). |

## 가중 평균: 8.50/10 ✅ PASS (초기)

`(0.15×9) + (0.15×9) + (0.25×8) + (0.20×9) + (0.15×8) + (0.10×8) = 1.35 + 1.35 + 2.00 + 1.80 + 1.20 + 0.80 = 8.50`

---

## 재검증 (Verified) — 12건 수정 후

| 차원 | 가중치 | 초기 | 재검증 | 변동 근거 |
|------|--------|------|--------|----------|
| D1 구체성 | 15% | 9 | 9 | FR-MKT1 모델명→카테고리(3종+/4종+), FR-UX1 "6개 그룹" 확정, FR-MEM9 성공 기준(outcome='success') |
| D2 완전성 | 15% | 9 | 9 | FR-MKT6 워터마크, FR-MKT7 fallback, FR-PERS8 슬라이더 툴팁 — 3개 신규 FR 추가로 더 완전 |
| D3 정확성 | 25% | 8 | 9 | FR-MKT4 구현 누출 제거, FR-MKT1 모델명→카테고리, FR-N8N6 CSRF+FR-N8N4 참조 |
| D4 실행가능성 | 20% | 9 | 9 | FR-MEM9 성공 기준 명확화, FR-MKT3 웹 승인 경로 추가 |
| D5 일관성 | 15% | 8 | 9 | FR-N8N6→FR-N8N4 참조 추가, CSRF N8N-SEC-7 일관, FR-MKT2 실패 격리 일관 |
| D6 리스크 | 10% | 8 | 9 | FR-MKT7 fallback 엔진, FR-MKT2 개별 플랫폼 실패 격리, FR-MKT6 워터마크 리스크 완화 |

## 재검증 가중 평균: 9.00/10 ✅ PASS

`(0.15×9) + (0.15×9) + (0.25×9) + (0.20×9) + (0.15×9) + (0.10×9) = 1.35 + 1.35 + 2.25 + 1.80 + 1.35 + 0.90 = 9.00`

### 수정 검증 상세:

| # | 이슈 | 수정 내용 | 검증 위치 | 결과 |
|---|------|---------|---------|------|
| 1 | FR-N8N6 CSRF (Quinn) | "CSRF Origin 검증, FR-N8N4 인프라 기반" 추가 | L2294 | ✅ |
| 2 | FR-MKT6 워터마크 (Sally+Bob) | 신규 FR: 저작권 워터마크 ON/OFF | L2305 | ✅ |
| 3 | FR-PERS8 툴팁 (Sally) | 신규 FR: 슬라이더 행동 예시 툴팁 | L2317 | ✅ |
| 5 | FR-MKT7 fallback (Bob+Quinn) | 신규 FR: AI API 장애 시 fallback 자동 전환 | L2306 | ✅ |
| 6 | FR-MKT2 실패 격리 (Quinn) | "실패 플랫폼만 Admin에게 알린다" 추가 | L2301 | ✅ |
| 7 | FR-MKT4 구현 제거 (Quinn+Winston) | Switch 노드·API 경로 삭제 → "즉시 반영된다" | L2303 | ✅ |
| 8 | FR-MEM9 성공 정의 (Sally) | "outcome='success'" 성공 기준 추가 | L2329 | ✅ |
| 9 | FR-MKT3 웹 승인 (Sally) | "CEO앱 웹 UI 또는" 승인 경로 추가 | L2302 | ✅ |
| 10 | FR-UX1 "6개" 확정 (Quinn) | "6~8개" → "6개 그룹" 확정 | L2337 | ✅ |
| 11 | FR-MKT1 카테고리 (Bob) | 모델명 → "이미지 3종+, 영상 4종+, 나레이션 2종, 자막 3종" | L2300 | ✅ |
| 12 | v3 altitude (Bob) | 신규 FR만 "what" 수준 준수, 기존 FR 유지 | 전체 | ✅ |

---

## 이슈 목록

### 1. **[D3 정확성] LOW — FR-MKT4 구현 세부 누출 ("n8n Switch 노드", API 경로)**

- FR-MKT4: "n8n Switch 노드가 CORTHEX API `GET /api/company/:id/marketing-settings` 조회"
- FR은 "무엇"(capability)을 기술해야 하며, "어떻게"(implementation)는 아키텍처/스토리에서 다룸
- n8n Switch 노드, 구체적 API 경로는 구현 세부
- **수정 제안**: "AI 도구 엔진 설정 변경이 다음 n8n 워크플로우 실행부터 즉시 반영된다" — 구현 세부(Switch 노드, API 경로)는 괄호 주석으로 이동 또는 삭제

### 2. **[D5 일관성] LOW — FR-N8N6 vs FR-N8N4 부분 중복**

- FR-N8N4 (기존): "Hono `proxy()` reverse proxy: `/admin/n8n/*`(관리 API) + `/admin/n8n-editor/*`(에디터 UI)" — 에디터 UI 접근을 이미 기술
- FR-N8N6 (신규): "Admin이 Hono proxy 경유(`/admin/n8n-editor/*`)로 n8n 비주얼 에디터에 접근하여 워크플로우를 편집할 수 있다"
- FR-N8N4는 인프라 설정(Docker+보안), FR-N8N6은 사용자 행위(에디터에서 편집) — 관점은 다르나 경로 중복
- **수정 제안**: FR-N8N4에서 에디터 UI 세부를 제거하고 FR-N8N6에 집중. 또는 FR-N8N6에 "(FR-N8N4 인프라 위에서)" 참조 추가

### 3. **[D1 구체성] LOW — FR 총수 불일치: "v2 70 + v3 34 = 104" vs 실제 113**

- john 서술: "총 104개 FR (v2 70개 + v3 34개)"
- 실제 grep 결과: 115줄 - 2 삭제(FR37, FR39) = **113개** active FR
- v3 FR: OC(11) + N8N(6) + MKT(5) + PERS(7) + MEM(11) + UX(3) = **43개** (34가 아님)
- **수정 제안**: FR 총수 메타데이터를 113(v2 70 + v3 43)으로 정정

---

## 검증 방법

| 확인 항목 | 방법 | 결과 |
|---------|------|------|
| Journey 1→FR 매핑 | Journey 1 Big Five 체감 → FR-PERS1-7 + FR-MEM9-10 | ✅ |
| Journey 4→FR 매핑 | Journey 4 Admin 설정 → FR-PERS1-7 + FR-N8N6 + FR-MEM11 | ✅ |
| Journey 7→FR 매핑 | Journey 7 온보딩 Big Five → FR-PERS6-7 | ✅ |
| Journey 8→FR 매핑 | Journey 8 마케팅 워크플로우 → FR-MKT1-5 | ✅ |
| Journey 9→FR 매핑 | Journey 9 CEO /office → FR-OC1-11 | ✅ |
| Journey 10→FR 매핑 | Journey 10 메모리 모니터링 → FR-MEM9-11 | ✅ |
| FR-OC9 모바일 리스트 뷰 | Step 07 Sally cross-talk + PIX-4 | ✅ |
| FR-OC10 aria-live | Step 05 PIX-4 도메인 요구사항 | ✅ |
| FR-OC2 연결 상한 20 | Step 08 수정 후 L1794 일치 | ✅ |
| Sprint 태그 정확성 | 전 v3 FR Sprint 1~4 + 병행 태그 | ✅ |
| FR "고도" (what vs how) | 16개 신규 FR 검토 | ⚠️ FR-MKT4만 구현 누출 |
| FR 기존 충돌 | 16개 신규 vs 기존 70개 | ✅ 충돌 없음 (FR-N8N6 부분 중복만) |

---

## Cross-talk 예정

Quinn (QA + Security)과의 교차 검토 예정:
- **FR-MKT1~5 보안 관점**: 외부 AI 도구 API 키 관리, 콘텐츠 승인 전 노출 방지
- **FR-MEM10 알림 보안**: 기존 Notifications WS 채널에 Reflection 이벤트 추가 시 권한 검증
