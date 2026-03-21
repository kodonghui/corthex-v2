# Critic-C (Product + Delivery) Review — Step 02: Context Analysis

**Reviewer**: John (PM)
**File**: `_bmad-output/planning-artifacts/architecture.md` L1233–L1427
**Date**: 2026-03-21
**Rubric**: Critic-C weights (D1 20%, D2 20%, D3 15%, D4 15%, D5 10%, D6 20%)

---

## Verification Method

- PRD (`prd.md`) FR-OC/N8N/MKT/PERS/MEM/TOOLSANITIZE/UX 개별 항목 대조
- `shared/types.ts:484-501` WsChannel 타입 실수 검증 (16개 확인)
- `project-context.yaml` 수치 교차 검증
- Stage 0 Step 05, Stage 1 Step 06, Stage 2 Step 11-12 스냅샷 대조
- Product Brief `product-brief-corthex-v3-2026-03-20.md` 대조

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 9/10 | FR 개별 항목 수, 테이블명, sprint 배정, 파일 경로(`shared/types.ts:484-501`), 버전(`n8n 2.12.3`, `PixiJS 8`), 번들 크기(`200KB`), RAM(`24GB/14GB`), 행 수 추정(`90,000`), 연결 제한(`20개`) 등 전부 구체적. "적절한" 표현 0건. |
| D2 완전성 | 7/10 | Step-02 요구사항(Requirements Overview, Scale Assessment, Constraints, Cross-cutting) 전부 커버. 그러나 **FR-UX 14→6 통합에 대한 전용 Go/No-Go 게이트 부재**, CEO/Admin 사용자 여정 관점의 영향 요약 부재. |
| D3 정확성 | 6/10 | **FR 수치 자기모순**: L1255 "49개 신규, v2 97개 활성 → 총 116개 활성" — 97+49-2=144≠116. PRD Stage 2 최종 스냅샷은 "v3 19개 → 총 116개". 49는 sub-item 카운트, 116은 FR-group 카운트로 단위 불일치. WS 채널 16개는 코드 검증 정확. Risk R1-R9 Stage 1과 일치. |
| D4 실행가능성 | 8/10 | `CallAgentResponse` TypeScript 인터페이스, 3-테이블 모델 스키마 명시, Sprint별 FR 매핑, Go/No-Go 기준 구체적. ECC-3 confidence scoring은 "구체적 알고리즘 Step 4 결정"으로 적절히 defer. |
| D5 일관성 | 6/10 | **FR 49 vs PRD 19 카운팅 불일치**가 핵심. Go/No-Go 8→9 추가는 명확히 설명. Sprint 순서·Layer 번호 Brief/Stage 1과 정합. project-context.yaml WS 14 vs 아키텍처 16 불일치 미언급 (아키텍처가 맞으나 주석 없으면 혼란). |
| D6 리스크 | 8/10 | R1-R9 포괄적, CPU 포화 분석, 디스크 성장 추정(270MB) 정량화. Sprint 2 과부하 인지+carry-forward. **FR-UX 14→6 통합 리스크 미식별** (기능 누락·사용자 혼란 가능성). Go/No-Go #9 "표준 태스크 corpus" 정의 주체 미명시. |

---

## 가중 평균: 7.30/10 ✅ PASS

계산: (9×0.20) + (7×0.20) + (6×0.15) + (8×0.15) + (6×0.10) + (8×0.20) = 1.80 + 1.40 + 0.90 + 1.20 + 0.60 + 1.60 = **7.50**

---

## 이슈 목록 (5건: 1 HIGH + 3 MEDIUM + 1 LOW)

### 1. **[HIGH] [D3+D5] FR 수치 자기모순 — L1255**

L1255: "v3 Functional Requirements (49개 신규, v2 97개 활성 → 총 116개 활성, 2개 삭제)"

- 97 + 49 - 2 = **144**, not 116
- PRD Stage 2 최종 스냅샷: "FR 활성 116개 (v2 97 + v3 19)"
- 49 = 개별 sub-item 카운트 (FR-OC1~11 + FR-N8N1~6 + FR-MKT1~7 + FR-PERS1~8 + FR-MEM1~11 + FR-TOOLSANITIZE1~3 + FR-UX1~3)
- 19 = PRD의 FR-group 카운트
- **수정안**: "49개 신규 요구사항 항목 (7개 도메인, PRD FR98~FR116)" 또는 PRD와 동일하게 "19개 신규 FR (49개 세부 항목)" 으로 단위 명시. 총계를 144로 수정하거나 카운팅 방식을 PRD에 맞출 것.

### 2. **[MEDIUM] [D2+D6] FR-UX 14→6 페이지 통합 전용 Go/No-Go 부재**

Go/No-Go #1(Zero Regression)은 "485 API smoke-test + 10,154 테스트 전통과"로 API 레벨. 14→6 페이지 통합은 **UX 레벨 회귀** 위험:
- 탭/필터로 분리된 하위 기능 누락 가능
- 사용자(CEO) 기존 워크플로우 단절
- 북마크 redirect 실패

**수정안**: Go/No-Go 매트릭스에 "#10 FR-UX 통합 검증: 합쳐진 6개 그룹에서 기존 14페이지 기능 100% 접근 가능 + Playwright E2E 통과" 추가 고려. 또는 #1을 확장하여 "UX 기능 접근성 포함" 명시.

### 3. **[MEDIUM] [D5] project-context.yaml WS 14 vs 아키텍처 WS 16 불일치 미주석**

아키텍처 L1247은 "16개 (shared/types.ts:484-501)"로 정확 (코드 검증: 16개 채널). 그러나 project-context.yaml L69는 "websocket_channels: 14"로 구식 값. 아키텍처가 맞지만, **두 문서 간 불일치를 주석으로 명시하지 않으면** 다운스트림 작업자가 project-context.yaml 값을 인용할 위험.

**수정안**: L1247에 "(project-context.yaml의 14는 구식; 코드 기준 16)" 주석 추가, 또는 project-context.yaml 업데이트를 carry-forward에 추가.

### 4. **[MEDIUM] [D6] Go/No-Go #9 "표준 태스크 corpus" 정의 주체·시점 미명시**

L1358: "동일 태스크 N ≥ 3회 반복, 3회차 재수정 횟수 ≤ 1회차 50%"
- **누가** corpus를 정의하는가? (PM? QA? Admin?)
- **언제** corpus가 확정되어야 하는가? (Sprint 3 시작 전? 도중?)
- corpus 품질이 #9 결과를 좌우하므로 정의 프로세스 자체가 리스크

**수정안**: "#9 선행 조건: Sprint 3 시작 전 PM이 5개+ 표준 태스크 승인" 등 구체화, 또는 Step 4에서 결정할 항목으로 carry-forward에 명시.

### 5. **[LOW] [D2] CEO/Admin 사용자 여정 관점 요약 부재**

Context Analysis는 기술 매핑(FR→테이블, FR→Sprint) 중심. Step-02 template에서 요구하는 "Key architectural aspects I notice" 중 사용자 경험 영향 요약이 부재. CEO가 v3에서 **어떤 새로운 경험**을 하는지, Admin은 **어떤 관리 부담이 추가**되는지 1-2문장 요약이 있으면 이후 UX 아키텍처 결정의 앵커 역할.

**수정안**: v3 Requirements Overview 앞이나 뒤에 "사용자 영향 요약" 2-3줄 추가. 예: "CEO: /office 시각화 + 메모리 성장 대시보드 + 성격 차별화된 응답 경험. Admin: Big Five 슬라이더 + n8n 관리 + 마케팅 엔진 선택 + 메모리 데이터 관리."

---

## 긍정적 평가

1. **FIX-3 해소 탁월**: 3-테이블 모델(agent_memories/observations/reflections 독립) 결정의 근거가 명확하고, Zero Regression + race condition 방지를 동시에 달성. 이전 PRD 모순을 깔끔하게 해결.

2. **VPS 리소스 예산 정량화**: idle/peak RAM 분리, CPU 포화 시나리오, 디스크 성장 추정(270MB)까지 포함. 인프라 결정에 바로 활용 가능.

3. **ECC 아이디어 5개**: 아키텍처 반영 위치·Sprint·우선순위까지 매핑. 특히 ECC-4(FR-TOOLSANITIZE) CRITICAL 지정이 보안 관점에서 적절.

4. **Carry-Forward 9개 항목**: 모두 적절한 후속 Step에 배정. 스코프 관리 우수.

---

## Cross-talk 요청

- **Amelia (Architect)**: FR 수치 카운팅 방식에 대한 의견 요청 — sub-item 49 vs FR-group 19 중 아키텍처 표준은?
- **Quinn (QA)**: Go/No-Go #9 corpus 정의 프로세스에 대한 QA 관점 의견 요청
