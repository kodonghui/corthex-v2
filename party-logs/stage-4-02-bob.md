# Critic-C (Product + Delivery) Review — Step 02: Context Analysis

**Reviewer:** Bob (Scrum Master)
**File:** `_bmad-output/planning-artifacts/architecture.md` L1233–L1427
**Date:** 2026-03-21

---

## 차원별 점수

| 차원 | 점수 | 가중치 | 근거 |
|------|------|--------|------|
| D1 구체성 | 8/10 | 20% | 파일 경로, Docker 버전(n8n:2.12.3), 포트(5678), 정확한 FR-ID, RAM/CPU 값, Go/No-Go 임계값 전부 명시. Go/No-Go #9 "N ≥ 3회" 태스크 corpus 규모 미정의, "10종 adversarial payload" 목록 미제공 2건. |
| D2 완전성 | 7/10 | 20% | v2 baseline, v3 FR/NFR, FIX-3, 복잡도, 인프라, 스프린트 의존성, 리스크 레지스트리, 교차 관심사, ECC, carry-forward 전부 포함. 누락: (1) 디스크 예산에 n8n Docker 이미지(~2-3GB) 미포함, (2) Sprint 2 과부하가 R1-R9에 없음 (carry-forward에만 존재), (3) Layer 0 병행 실행 시 리소스 경합 시나리오 미기술. |
| D3 정확성 | 7/10 | 15% | **산술 오류**: "v2 97개 활성 → 총 116개 활성, 2개 삭제" — PRD 실제 v2 FR은 70개 활성 (FR1-FR72, FR37+FR39 삭제). 어떤 수치든 97+49-2=144≠116. WS 채널 16개는 `shared/types.ts:484-501` 코드와 정확히 일치 ✅ (단, project-context.yaml=14로 미갱신). 나머지 기술 정보(DB 스키마, 파일 경로, 도구명) 전부 정확. |
| D4 실행가능성 | 8/10 | 15% | FIX-3 3-테이블 모델이 컬럼명+FK까지 명시. ECC-1 `CallAgentResponse` 인터페이스 코드 스니펫 포함. Go/No-Go 매트릭스에 통과/실패 조건+대응 명시. Sprint 의존성 다이어그램이 ASCII로 명확. 일부 ECC(confidence scoring)는 "Step 4 결정"으로 적절히 위임. |
| D5 일관성 | 7/10 | 10% | **ECC 번호 불일치**: 아키텍처 ECC-1(call_agent)≠PRD 검증 보고서 ECC-1(FR-TOOLSANITIZE). 아키텍처 ECC-4(TOOLSANITIZE)=PRD 검증 ECC-1, 아키텍처 ECC-5(Capability)=PRD 검증 ECC-3. Sprint-Layer 매핑(Sprint 1=Layer 3 등)은 문서 내 일관. 용어(observations, reflections, soul-enricher) PRD와 정합. |
| D6 리스크 | 7/10 | 20% | R1-R9 전부 심각도+완화+상태 명시 ✅. Go/No-Go 9개 게이트 ✅. CPU 포화 가능성 식별 ✅. 미흡: (1) ECC-1 call_agent 응답 표준화의 하위 호환성/마이그레이션 리스크 미언급 — v2 전체에서 자유 형식 텍스트를 사용 중인 call_agent 응답을 구조화하면 기존 에이전트 Soul/로직에 breaking change 가능, (2) Sprint 2 과부하가 리스크 레지스트리에서 누락 (PRD에는 있음), (3) Layer 0 UXUI 병행 실행 시 feature sprint와의 merge conflict/리소스 경합 시나리오 미분석. |

---

## 가중 평균: 7.35/10 ✅ PASS

계산: (8×0.20) + (7×0.20) + (7×0.15) + (8×0.15) + (7×0.10) + (7×0.20) = 1.60+1.40+1.05+1.20+0.70+1.40 = **7.35**

---

## 이슈 목록 (6건: 1 Critical + 3 Major + 2 Minor)

### Critical (1)

1. **[D3 정확성] FR 총계 산술 오류 (L1255)**
   - 현재: "v2 97개 활성 → 총 116개 활성, 2개 삭제"
   - 사실: PRD v2 FRs = FR1-FR72, FR37+FR39 삭제 → **70개 활성**. v3 신규 49개. 총 = 70+49 = **119개 활성, 2개 삭제 (FR37, FR39)**
   - 97도, 116도 출처 불명. 어떤 해석이든 97+49-2=144≠116
   - **Fix**: `v2 70개 활성 → 총 119개 활성, 2개 삭제(FR37, FR39)`

### Major (3)

2. **[D5 일관성] ECC 번호 체계 PRD 검증 보고서와 불일치**
   - 아키텍처: ECC-1=call_agent, ECC-4=TOOLSANITIZE, ECC-5=Capability
   - PRD 검증 보고서(`prd-validation-fixes.md`): ECC-1=TOOLSANITIZE (FIX-1), ECC-3=Capability (FIX-2)
   - 개발자가 ECC-1을 참조할 때 어느 문서를 보느냐에 따라 다른 기능을 가리킴
   - **Fix**: 번호를 통일하거나, "아키텍처에서 재번호 부여됨" 명시 (PRD 검증→아키텍처 매핑 표 추가)

3. **[D6 리스크] Sprint 2 과부하가 Risk Registry R1-R9에서 누락**
   - PRD에서 "Sprint 2 과부하 (15건+ 동시)"를 명시적 리스크로 식별하고 Sprint 2.5 분할 대응을 기술
   - 아키텍처 carry-forward(L1424)에만 언급, R1-R9에는 없음
   - **Fix**: R10으로 추가 — `R10 | Sprint 2 스코프 과부하 | HIGH | 2 | 인프라/워크플로우 트랙 분리 → Sprint 2.5 분할 | READY`

4. **[D2 완전성] VPS 디스크 예산 누락**
   - RAM/CPU 예산은 상세하나 디스크 예산 없음
   - n8n Docker 이미지 ~2-3GB, observations/reflections pgvector ~270MB(명시됨), AI 스프라이트 에셋, 기존 60 마이그레이션+신규
   - Oracle ARM64 VPS 기본 디스크 = 200GB boot volume
   - **Fix**: Infrastructure Impact에 디스크 행 추가 (현재 사용량 추정 + n8n + 데이터 증가분 + 여유)

### Minor (2)

5. **[D1 구체성] Go/No-Go #9 태스크 corpus 정의 부족 (L1358)**
   - "N ≥ 3회 반복" — corpus 규모(태스크 몇 개?), "재수정"의 정의, 통계적 유의성 기준이 미정의
   - Sprint 3 종료 조건인데 기준이 모호하면 pass/fail 판단 불가
   - **Fix**: "표준 태스크 corpus 10개, 각 3회 반복. 재수정 = LLM이 자체 판단으로 output을 수정한 횟수. Wilcoxon signed-rank test p<0.05" 또는 유사한 구체 기준

6. **[D6 리스크] ECC-1 call_agent 응답 표준화 — breaking change 리스크 미언급 (L1390-1399)**
   - v2 전체에서 call_agent는 자유 형식 텍스트 응답. Sprint 1에서 구조화하면 기존 에이전트 Soul의 call_agent 결과 파싱 로직이 깨질 수 있음
   - **Fix**: "기존 v2 에이전트는 string fallback 유지. 신규 v3 에이전트만 구조화 응답 의무. 점진적 마이그레이션." 같은 하위 호환성 전략 1줄 추가

---

## Cross-talk 대상

- **john (PM)**: FR 총계 수치(이슈 #1) — PM이 PRD 기준 정확한 v2 FR 카운트를 확인해줄 수 있음
- **quinn (QA)**: Go/No-Go #9 통계 기준(이슈 #5) — QA 관점에서 테스트 corpus 규모와 유의성 기준 의견 필요
- **amelia (Architect)**: ECC-1 breaking change(이슈 #6) — call_agent 구조 변경이 engine/ E8 경계에 미치는 영향 확인

---

## 총평

Step 02 Context Analysis는 전체적으로 **우수한 구조와 깊이**를 보여준다. FIX-3 3-테이블 모델 결정은 명확하고 근거가 탄탄하며, Infrastructure Impact의 RAM/CPU 예산은 실측 기반으로 신뢰할 수 있다. 5개 ECC Architecture Ideas는 Step 4 이후에서 흡수할 아이디어를 선제적으로 식별한 좋은 판단이다.

그러나 **FR 총계 산술 오류**(Critical)는 이 섹션의 숫자 신뢰도를 훼손하므로 즉시 수정이 필요하다. 이 숫자가 후속 Step에서 Epic 분할이나 스프린트 용량 계산의 기준이 되면 연쇄 오류를 유발한다.
