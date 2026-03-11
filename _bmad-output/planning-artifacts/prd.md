---
stepsCompleted: [step-01-init, step-02-discovery, step-02b-vision, step-02c-executive-summary, step-03-success, step-04-journeys, step-05-domain, step-06-innovation, step-07-project-type, step-08-scoping, step-09-functional, step-10-nonfunctional, step-11-polish]
inputDocuments:
  - _bmad-output/planning-artifacts/product-brief-corthex-v2-engine-refactor-2026-03-10.md
  - _poc/agent-engine-v3/POC-RESULT.md
workflowType: 'prd'
documentCounts:
  briefCount: 1
  researchCount: 0
  brainstormingCount: 0
  projectDocsCount: 1
classification:
  projectType: saas_b2b
  typeComposition:
    developer_tool: 40%
    web_app: 30%
    saas_b2b: 30%
  domain:
    primary: ai-agent-orchestration
    secondary: fintech
    tertiary: knowledge-management
    differentiator: dynamic-org-management
  complexity: high
  complexityScore: 29/40
  complexityBreakdown:
    architecture_change: 5
    external_dependency: 4
    db_schema_change: 3
    realtime_impact: 4
    auth_security: 3
    regression_scope: 5
    ux_change: 3
    team_capability: 2
  projectContext: brownfield
  changeType: core-engine-replacement
  requirementTypes:
    phase1: engineering
    phase2: product
    phase3: product
    phase4: product
  phaseDependencies:
    phase2: [phase1]
    phase3: [phase1, phase2]
    phase4: [phase1]
  criticalPath: "phase1 → phase2 → phase3 (7주)"
  parallelizable: "phase4 with phase2~3"
  topRisks:
    - "R1-3: call_agent 다단계 토큰 전파 미검증"
    - "R2-3: 5개 서비스 삭제 후 메타데이터 주입 경로"
  scope: "Phase 1~4 전체, Phase별 독립 섹션"
  totalEstimate: "9주"
partyModeRounds: 3
decisions: 10
terminology:
  허브(Hub): "메인 채팅 UI (구: 사령관실)"
  트래커(Tracker): "핸드오프 실시간 추적 UI (구: 사이드바 위임 추적)"
  라이브러리(Library): "벡터 검색 + 음성 브리핑 (구: 정보국)"
  티어(Tier): "에이전트 N단계 등급 (정수). 모델/비용/권한 결정 (구: 계급)"
  핸드오프(Handoff): "에이전트 간 작업 전달 (구: 위임)"
  Soul: "에이전트 시스템 프롬프트 (성격+능력+오케스트레이션 규칙)"
  call_agent: "MCP 도구 기반 에이전트 간 핸드오프 메커니즘"
  CLI토큰: "Human의 Claude CLI Max 구독 인증 토큰"
  NEXUS: "AI 조직 관리 UI (노드 기반 시각적 편집)"
  스케치바이브: "Claude Code 개발 협업 캔버스 (관리자 전용)"
  비서: "Human 전용 에이전트. 자연어 명령 라우팅"
  비서실장: "루트 라우팅 에이전트. 사용자 의도 → 적절한 에이전트 배정"
  Hook: "SDK 이벤트 콜백. PreToolUse/PostToolUse/Stop"
  ARGOS: "크론잡 스케줄러"
  얇은래퍼: "SDK-비즈니스 로직 최소 추상화 (agent-loop.ts)"
  query: "Claude Agent SDK 핵심 함수. 에이전트 실행 세션 생성"
---

# Product Requirements Document - corthex-v2

**Author:** CORTHEX Team
**Date:** 2026-03-10

## Project Discovery

### Project Classification

- **Project Type:** SaaS B2B Platform (가중치: developer_tool 40% / web_app 30% / saas_b2b 30%)
- **Domain:** AI Agent Orchestration (1차) + Fintech (2차) + Knowledge Management (3차)
- **Differentiator:** Dynamic Org Management (시장 유일 — Soul = 오케스트레이션 로직)
- **Complexity:** High (29/40점 — 8축 정량 평가)
- **Project Context:** Brownfield (Core Engine Replacement — 동작 중 시스템 심장 교체)

### Detection Signals

**SaaS B2B 분류 근거:**
- Multi-tenant: companyId 기반 데이터 격리. tier_configs 테이블 추가 (회사별)
- Permission model: 비서 소유권(owner_user_id), 도구 권한 Hook화
- Integrations: Claude Agent SDK (신규) + NotebookLM MCP (신규) + pgvector (신규)

**AI Agent Orchestration 도메인 근거:**
- call_agent MCP 도구 패턴: 에이전트를 다른 에이전트의 "도구"로 호출 (N단계 핸드오프)
- Soul 기반 오케스트레이션: 프롬프트가 곧 라우팅 규칙 (코드 수정 0)
- N단계 티어 시스템: 정수 기반 tier + 회사별 tier_configs
- 비서 선택제: Human별 비서 유무 선택
- 경쟁 차별점: CrewAI(정적 코드) / LangGraph(그래프 노드) / CORTHEX(동적 Soul)

**High Complexity 근거 (8축):**

| 축 | 점수 | 근거 |
|---|------|------|
| 아키텍처 변경 범위 | 5/5 | 5개 서비스 ~1,200줄 삭제 → 7개 파일 ~195줄 신규 (87.5% 삭제) |
| 외부 의존성 리스크 | 4/5 | SDK 0.2.72 (0.x 메이저), Zod v4 (v3→v4) |
| DB 스키마 변경 | 3/5 | tier enum→integer, tier_configs 신규, pgvector 확장 |
| 실시간 시스템 영향 | 4/5 | WebSocket 핸드오프 추적 Hook 전환 |
| 인증/보안 변경 | 3/5 | CLI 토큰 주입 방식 변경, Hook 기반 도구 권한 |
| 회귀 테스트 범위 | 5/5 | Epic 1~20 전체 기능 회귀 검증 |
| UX 변경 범위 | 3/5 | Phase 1=0, Phase 2~4=허브+NEXUS+검색 |
| 팀 역량 요구 | 2/5 | 1인 개발, PoC로 SDK 학습 완료 |

### Phase 의존성

```
Phase 1 (엔진, 2주) ──┬──→ Phase 2 (오케스트레이션, 3주) ──→ Phase 3 (티어, 2주)
                      └──→ Phase 4 (라이브러리, 2주) [병렬 가능]
크리티컬 패스: Phase 1→2→3 = 7주
총 기간: 9주 (Phase 4 병렬 시)
```

### 요구사항 유형 분리

| Phase | 유형 | 설명 |
|-------|------|------|
| Phase 1 | Engineering Requirement | 사용자 invisible 내부 엔진 교체 |
| Phase 2 | Product Requirement | 허브 UX 2종, Soul/비서 시스템 |
| Phase 3 | Product Requirement | NEXUS 조직도, 티어 관리 UI |
| Phase 4 | Product Requirement | 의미 검색 개선, 음성 브리핑 |

### 핵심 사용자 여정 (Phase별)

**Phase 1:** 변화 없음 (기존 여정 동일하게 동작해야 함)

**Phase 2 — 여정 A (비서 있는 CEO):**
CEO → 허브 "삼성전자 분석해줘" → 비서실장 Soul 해석 → call_agent(CIO) → CIO가 전문가 병렬 핸드오프 → 종합 보고서 → CEO

**Phase 2 — 여정 B (비서 없는 직원):**
이과장 → 에이전트 목록에서 직접 선택 → 텍스트 입력 → 해당 에이전트 직접 실행 → 결과

**Phase 3 — 여정 C (관리자 조직 설계):**
Admin → NEXUS → 부서 생성 → 에이전트 드래그&드롭 배치 → Tier 설정 → Soul 편집 → 저장 (배포 불필요)

**Phase 4 — 여정 D (음성 브리핑):**
CEO → "시황 브리핑 만들어줘" → 라이브러리 의미 검색 → NotebookLM 음성 생성 → 텔레그램 전송 → 출퇴근길 청취

### 코드 영향도 요약

- 삭제: ~1,200줄 (5개 서비스)
- 신규: ~195줄 (7개 파일)
- 수정: ~200줄 (라우트 import 변경, knowledge-injector, schema)
- **순 변화: 약 1,000줄 순 삭제 (코드 베이스 축소)**

## Executive Summary

CORTHEX v2는 AI 에이전트를 코드가 아닌 조직도로 설계하는 SaaS B2B 플랫폼이다. **비전: '조직도를 그리면 AI 팀이 움직인다.'**

현재 에이전트 엔진은 "AI가 도구를 사용하고, 다른 AI에게 일을 넘기고, 보안을 체크하는" 핵심 동작을 5개 파일(약 1,200줄)로 직접 만들어 쓰고 있다. 하지만 이 중 약 57%는 Claude Agent SDK가 이미 제공하는 기능의 재발명이다. 본 PRD는 이 엔진을 SDK 기반으로 교체하고(Phase 1), 비서 선택제와 Soul 기반 오케스트레이션(Phase 2), 시각적 조직 설계 NEXUS와 N단계 티어(Phase 3), 문서 지능 검색과 음성 브리핑(Phase 4)을 구현한다.

**왜 지금인가:** 2026년 3월, Claude·Google·OpenAI가 동시에 에이전트 SDK를 공식 출시했다. 6개월 전에는 직접 만들어야 했던 에이전트 실행 엔진을 이제 검증된 SDK로 대체할 수 있다(PoC 8/8 전부 통과). CLI Max 구독으로 월정액 안에서 에이전트를 자유롭게 실행할 수 있으며, 경쟁자(CrewAI, LangGraph)는 전부 개발자 전용이다. "비개발자가 조직도로 AI를 설계한다"는 시장이 아직 비어있다.

**핵심 전략 3원칙:**
1. **위임**: SDK가 해결한 문제(도구 루프, 세션, Hook)는 SDK에 맡긴다
2. **집중**: CORTHEX 고유 가치(call_agent 핸드오프, Soul 오케스트레이션, NEXUS, 티어)에만 코드를 쓴다
3. **격리**: SDK 접점을 `agent-loop.ts` 1개 파일(약 50줄)로 한정한다. SDK 버전은 0.2.x로 고정하고, 메이저 업데이트는 이 파일에서 격리 대응한다. 벤더 교체 시 1파일만 수정

**안전망:** Phase 1~2는 기존 엔진(5개 서비스)을 삭제하지 않고 병행 유지한다. Soul 기반 대체가 완전 검증된 후에만 삭제한다.

### What Makes This Special

**1. Soul = 오케스트레이션 (시장 유일)**
에이전트의 Soul(시스템 프롬프트)이 곧 라우팅 규칙이다. 관리자가 Soul을 편집하면 워크플로우가 즉시 바뀐다. 코드 수정 0줄, 배포 0회. 경쟁자(CrewAI, LangGraph)는 오케스트레이션 변경에 30~50줄 코드 수정 + 배포가 필요하다.

**2. call_agent 도구 패턴 (N단계 핸드오프)**
SDK 서브에이전트는 1단계만 지원(PoC Test 7 확인). call_agent MCP 도구는 핸들러에서 query()를 재귀 spawn하여 비서→팀장→전문가 N단계 핸드오프를 구현한다. NEXUS 조직도와 실제 핸드오프 구조가 1:1 매핑된다.

**3. NEXUS 시각적 조직 설계 (비개발자 대상)**
CEO가 드래그&드롭으로 부서 생성, 에이전트 배치, 티어 설정, 핸드오프 관계를 시각적으로 설계한다. 저장 즉시 반영, 배포 불필요. "비개발자 + 시각적 오케스트레이션" 시장의 유일한 플레이어.

### 대상 사용자

| 사용자 | 현재 문제 | CORTHEX 해결 | 감정적 페이오프 |
|--------|---------|-------------|----------------|
| **CEO 김대표** (1인 사업가, 비개발자) | 혼자서 투자분석·마케팅·시스템관리를 해야 함. 코드 못해서 AI 조율 불가 | NEXUS 조직도 + 자연어 한 줄 지휘 + 음성 브리핑 | *'혼자가 아니다. 내 팀이 있다.'* |
| **팀장 박과장** (중소기업 관리자) | 팀원 10명에게 AI 제공하고 싶지만 비용 통제·표준화 안 됨 | 비서 유무 선택 + N단계 티어 + 관리자 콘솔 권한 관리 | *'AI를 팀 인프라로 만들었다.'* |
| **투자자 이사장** (개인 투자자) | 혼자 4명분의 분석(뉴스·재무·기술·매크로)을 동시에 못 함 | CIO 산하 전문가 4명 병렬 분석 + 종합 보고서 + 음성 시황 브리핑 | *'4명의 애널리스트를 고용한 효과.'* |
| **Admin** (시스템 관리자) | 부서/에이전트 CRUD만 가능. AI 조직 전체를 시각적으로 설계·관리 못 함 | NEXUS 시각적 편집 + 티어 설정 + Soul 편집 + 비서 할당 | *'AI 조직을 내 손으로 설계했다.'* |

### 기대 효과

**기술 지표:**

| 지표 | 목표 |
|------|------|
| 오케스트레이션 코드 | 기존 5개 파일(약 1,200줄) → 신규 7개 파일(약 195줄)로 대체 |
| 새 워크플로우 추가 시 코드 수정 | 0줄 (Soul 편집만으로 해결) |
| SDK 업데이트 시 수정 범위 | `agent-loop.ts` 1개 파일 |
| N단계 티어 비용 절감 | 목표: 기존 3티어 대비 60%+ 추가 절감 |

**사용자 경험 지표:**

| 지표 | 목표 |
|------|------|
| NEXUS 첫 조직 설계 완료 시간 | 5분 이내 |
| 비서 라우팅 정확도 | 첫 시도 80%+ (Soul 튜닝 후 95%+) |
| 의미 검색 히트율 | 키워드 대비 관련 문서 30%+ 추가 발견 |
| 음성 브리핑 생성 성공률 | 90%+ |

### 핵심 리스크

| 리스크 | 영향 | 완화 전략 |
|--------|------|----------|
| call_agent 다단계 토큰 전파 미검증 (PoC에서 1단계만 확인) | 🔴 극히높음 | Phase 1 첫 주에 비서→CIO→전문가 3단계 핸드오프 통합 테스트 우선 실행 |
| 5개 서비스 삭제 시 기존 Epic 1~20 기능 회귀 | 🔴 극히높음 | Phase 2에서 삭제 전 Soul 기반 대체 완전 검증. 기존 서비스 안전망 병행 유지 |
| 에이전트 메타데이터 자동 주입 경로 변경 | 🟠 높음 | agent-loop.ts에서 query() 호출 전 DB 조회 → Soul 동적 주입 구현 |

### Phase 로드맵

*상세 Phase별 기능셋, 리스크 완화, 오픈소스 전략은 → Product Scope 섹션 참조.*

**일정 추정 (3-point):** 낙관 7주 / 목표 9주 / 비관 12주
**크리티컬 패스:** Phase 1(2주) → Phase 2(3주) → Phase 3(2주) = 7주

## Success Criteria

### User Success

| 성공 기준 | 측정 지표 | 목표 | 딜라이트 모먼트 |
|----------|----------|------|----------------|
| CEO가 AI 조직을 설계할 수 있다 | NEXUS에서 '부서 2개 + 에이전트 5명 + 티어 3단계' 설계 완료 시간 (첫 사용, 튜토리얼 없이) | ≤ 10분 | *'내가 만든 조직이 움직인다'* |
| 자연어로 복잡한 작업이 완료된다 | 비서 라우팅 정확도: 의도한 에이전트에 2홉 이내 도달 | 첫 시도 80%+, Soul 튜닝 후 95%+ | *'한 마디에 보고서가 나왔다'* |
| Soul 편집으로 워크플로우가 바뀐다 | Soul에 명시적 규칙 추가 후 다음 10회 요청 중 해당 행동 수행 횟수 | 8/10회+ (80%+) | *'코드 없이 바꿨다'* |
| 비서 없이 직접 사용 가능 | 에이전트 선택 → 결과까지 클릭 수 + 적합 에이전트 식별 시간 | ≤ 3클릭, ≤ 10초 | *'바로 시킨다'* |
| 음성 브리핑 수신 | E2E: NotebookLM 생성 + 텔레그램 전송 | 생성 ≤ 3분, 전송 ≤ 30초, 총 ≤ 4분. 성공률 90%+ | *'지하철에서 듣는다'* |
| 관련 문서를 빠짐없이 찾는다 | 10개 쿼리 테스트셋으로 키워드 vs 의미 검색 A/B | 의미 검색이 키워드 대비 관련 문서 3건 중 1건+ 추가 발견 | *'반도체 문서가 나온다'* |
| 엔진 교체 후 응답 품질 유지 | 동일 10개 프롬프트 기존/신규 엔진 A/B 블라인드 평가 | 신규 ≥ 기존 (품질 동등 이상) | — |
| 핸드오프 과정이 투명하다 | 허브 사이드바 실시간 핸드오프 추적 | 모든 핸드오프 단계 + 현재 에이전트 + 경과 시간 표시 | *'누가 뭘 하는지 보인다'* |
| 에러 시 명확한 피드백 | 에이전트 실패 시 사용자 메시지 | '○○가 응답 못 함 → △△가 나머지로 종합' 형식. 블랙박스 에러 0건 | — |
| 초기 설정이 쉽다 | Admin 첫 회사 설정 완료 시간 (부서+에이전트+Human+CLI 토큰) | ≤ 15분 (기본 Soul 템플릿 제공) | — |

### Business Success

| 기간 | 성공 지표 | 구체적 목표 |
|------|----------|-----------|
| MVP-A 직후 (2주) | 기존 기능이 SDK 위에서 동작 | Epic 1~20 회귀 PASS + 응답 품질 A/B 동등 |
| MVP-B 직후 (5주) | Soul 기반 오케스트레이션 실현 | 비서/비서없음 양쪽 동작 + 5개 서비스 삭제 완료 |
| 1개월 후 | 개발 속도 개선 | 새 에이전트 추가 시 코드 0줄 수정 (3건으로 검증) |
| 1개월 후 | 유지보수 비용 감소 | SDK 관련 수정이 agent-loop.ts 1파일에서만 발생 |
| 3개월 후 | 비용 최적화 | N단계 티어로 CLI 토큰 사용량 기존 대비 40%+ 절감 |
| 3개월 후 | 사용자 만족 | CEO 김대표 직접 피드백: '이전보다 낫다' |
| 6개월 후 | 확장성 | 에이전트 50명+ 조직에서 성능 저하 없음 |

**실패 기준 (트리거 → 대응):**

| 실패 조건 | 판단 시점 | 대응 전략 |
|----------|----------|----------|
| Phase 1 DoD 2/4 이하 | 2주차 끝 중간 점검 | 하이브리드 전략 (agent-loop 유지 + 기존 서비스 병행) |
| Phase 1 > 4주 | 4주차 | 하이브리드 확정. Soul 전환은 Phase 2에서 점진적 |
| 비서 라우팅 < 50% | Phase 2 2주차 | 1) Soul에 명시적 라우팅 규칙 → 2) 에이전트 태그 차별화 → 3) 룰 기반 프리라우팅 (~20줄) |
| call_agent 3단계 실패 | Phase 1 1주차 | 1) env 명시 전달 → 2) 환경변수 클리닝 → 3) 2단계 핸드오프로 축소 |
| Soul 품질 < 기존 | Phase 2 3주차 | 1) 구조화된 Soul 템플릿 (3-Phase 절차 명시) → 2) 특정 에이전트 하이브리드 |
| 비용 절감 미달 | Phase 3 후 1개월 | 티어별 사용 비율 대시보드 + '이 작업은 Tier 4로 충분' 자동 추천 (Phase 6) |

### Technical Success

| 기준 | 목표 | 측정 |
|------|------|------|
| 코드 축소 | 5파일(약 1,200줄) → 7파일(약 195줄) | `wc -l` |
| SDK 격리 | SDK import가 agent-loop.ts에서만 | `grep -r "claude-agent-sdk"` |
| call_agent 3단계 핸드오프 | 비서→CIO→전문가 E2E ≤ 60초 (각 단계 ≤ 15초) | 통합 테스트 타이머 |
| Hook: tool-permission-guard | 비허용 도구 호출 100% 차단 | 차단 테스트 10건 PASS |
| Hook: credential-scrubber | API 키 패턴 100% 필터 | 10개 패턴 주입 → 전부 마스킹 |
| Hook: delegation-tracker | WebSocket 이벤트 지연 ≤ 100ms | 타임스탬프 측정 |
| Hook: cost-tracker | 세션당 토큰/비용 오차 ≤ 1% | SDK 보고 vs DB 기록 비교 |
| Hook: output-redactor | 민감 패턴 100% 마스킹 | 패턴 주입 테스트 |
| DB 마이그레이션 | enum→integer 전후 데이터 100% 보존 + 롤백 무손실 | 카운트 비교 |
| 실시간 핸드오프 추적 | Hook 기반 WebSocket이 기존 허브 UI와 호환 | 사이드바 핸드오프 표시 |
| API 응답 시간 | 기존 P95 ±10% 이내 (베이스라인 Phase 1 전 측정) | 서버 메트릭 |
| CLI 토큰 전파 | 핸드오프 체인 전체에서 최초 명령자 토큰 사용 | 비용 로그 검증 |
| 메모리 | query() 세션당 ≤ 50MB (Oracle VPS 4GB 기준) | 프로파일링 |
| 동시 세션 | 최소 10개 동시 query() 처리 | 부하 테스트 |
| SDK 호환 | 0.2.72 ~ 0.2.x 패치 자동 호환 | 버전 테스트 |
| graceful degradation | SDK 프로세스 비정상 종료 시 에러 메시지 + 자동 재시도 1회 | crash 시뮬레이션 |

### 지표 우선순위

**🔴 P0 (Phase 1부터 추적, 실패 시 프로젝트 중단):** 8개
1. call_agent 3단계 핸드오프 E2E ≤ 60초
2. Epic 1~20 회귀 PASS
3. 응답 품질 A/B 동등
4. Hook 5개 정량 기준 통과
5. 비서 라우팅 정확도 80%+ (Phase 2)
6. 기존 5개 서비스 삭제 후 전 기능 동작 (Phase 2)
7. SDK import 격리 (agent-loop.ts 1파일)
8. CLI 토큰 핸드오프 체인 전파

**🟡 P1 (Phase 2부터 추적):** NEXUS 설계 ≤ 10분, Soul 반영 80%+, 음성 E2E ≤ 4분, 의미검색 A/B, 핸드오프 투명성, 에러 메시지, API P95, 메모리, 동시 세션, 비용 절감, 초기 설정, DB 무결성

**🟢 P2 (데이터 수집만):** 나머지 세부 지표

### Measurable Outcomes

**MVP-A (Phase 1) 완료 시 반드시 달성:**
1. ✅ agent-loop.ts query() → 허브 에이전트 응답 수신
2. ✅ Hook 5개 전부 정량 기준 통과
3. ✅ call_agent 3단계 핸드오프 E2E ≤ 60초
4. ✅ Epic 1~20 회귀 PASS + 응답 품질 A/B 동등

**전체 "성공" 선언 기준:**
- 기존 5개 서비스 코드에서 완전 삭제됨
- NEXUS에서 조직 생성 → call_agent로 동작 (E2E)
- '삼성전자 투자' → '반도체 시장 전망' 반환
- 음성 브리핑 → 텔레그램 전송
- 스케치바이브 CLI MCP → Claude Code에서 캔버스 읽기/쓰기 동작

## Product Scope

### MVP-A: 엔진 검증 (Phase 1, 2주)

**가치 증명:** '기존 기능이 SDK 위에서 동작한다'

**신규 파일:**
- `engine/agent-loop.ts` — query() 래퍼 + CLI 토큰 주입
- `engine/hooks/tool-permission-guard.ts` — 도구 권한 차단
- `engine/hooks/credential-scrubber.ts` — 크레덴셜 필터
- `engine/hooks/delegation-tracker.ts` — 핸드오프 WebSocket
- `engine/hooks/cost-tracker.ts` — 비용 기록
- `engine/hooks/output-redactor.ts` — 출력 검열
- `tool-handlers/builtins/call-agent.ts` — 에이전트 간 핸드오프

**수정 파일:**
- `routes/agent-*.ts` — import 경로 변경
- `services/llm-router.ts` — 모델 배정 간소화

**안 건드림:** 기존 5개 서비스 (안전망 유지), DB 스키마, UI 코드 전체

**테스트:** 단위(7파일) + 통합(3단계 핸드오프) + 회귀(Epic 1~20)

### MVP-B: 비전 검증 (Phase 2, 3주)

**가치 증명:** 'Soul = 오케스트레이션이 동작한다'

**포함:**
- 비서/매니저 Soul 기본 템플릿
- 허브 UX 2종 (비서 있음/없음)
- DB: agents에 `is_secretary`, `owner_user_id` 추가
- 관리자 콘솔 비서 할당 UI
- 기존 5개 서비스 삭제 (검증 후)

**테스트:** 기능(비서 양쪽) + 삭제 검증(전 기능 회귀)

### Growth-A: 시각화 (Phase 3, 2주)

**가치 증명:** '비개발자가 조직도로 AI를 설계한다'

**포함:**
- `tier_configs` 테이블 + 마이그레이션 (enum→integer)
- NEXUS 조직도 UI (드래그&드롭)
- 티어 관리 UI (N단계 생성/편집)

**테스트:** 성능(50+ 노드) + 마이그레이션(데이터 무결성)

### Growth-B: 지능화 + 개발 협업 (Phase 4, 2주, Phase 2~3과 병렬 가능)

**가치 증명:** '문서를 이해하고 음성으로 브리핑한다' + 'Claude Code로 캔버스와 코드를 동시 조작한다'

**포함:**
- pgvector 확장 + embedding 컬럼
- Gemini Embedding API 연동
- knowledge-injector.ts 수정 (Jaccard → cosine)
- NotebookLM MCP 연동
- **스케치바이브 CLI MCP 서버** (`sketchvibe-mcp.ts`, 약 80줄) — Claude Code CLI ↔ 브라우저 캔버스 양방향 연동 복원
  - `@modelcontextprotocol/sdk` 기반 TypeScript Stdio MCP 서버
  - 4개 도구: `read_canvas`, `update_canvas`, `request_approval`, `list_sketches`
  - 기존 Hono API(sketches.ts) 위에 얇은 래퍼 — 신규 코드 약 130줄
  - 서버: `POST /workspace/sketches/approve` 엔드포인트 추가 (약 20줄)
  - Claude Code 등록: `claude mcp add sketchvibe -- bun run sketchvibe-mcp.ts`
  - v1의 핵심 가치 복원: Admin이 Claude Code에서 코드 분석 → 캔버스에 아키텍처 시각화 → 캔버스 수정 → 코드 반영 (양방향)

**테스트:** A/B(10개 쿼리) + E2E(음성→텔레그램) + MCP 연결(CLI→캔버스 읽기/쓰기/승인)

### Vision (Phase 5+, 미래)

| 비전 | 우선순위 | 시기 |
|------|---------|------|
| 에이전트 성과 대시보드 | 높음 | Phase 5 |
| Soul 버전 관리 (이력 추적 + 복원) | 높음 | Phase 5 |
| 멀티 LLM 동적 라우팅 (Gemini ADK 추가) | 높음 | Phase 5 |
| 워크플로우 빌더 (조건부 분기) | 중간 | Phase 6 |
| 자동 티어 최적화 (사용 패턴 → 추천) | 중간 | Phase 6 |
| 에이전트 마켓플레이스 (Soul 공유) | 낮음 | Phase 7+ |
| 크로스 테넌트 협업 | 낮음 | Phase 8+ |

### Out of Scope (Phase 1~4 전체)

| 제외 항목 | 이유 | 가능 시기 |
|----------|------|----------|
| 멀티 LLM (Gemini ADK 통합) | Claude SDK만. 기존 Gemini 호출은 유지 | Phase 5 |
| 에이전트 메모리 시스템 개편 | autoLearn 유지. 세션 연속성은 나중에 | Phase 5+ |
| 관리자 콘솔 전면 재설계 | 비서/티어 UI만 추가 | UXUI 재설계 |
| 모바일 네이티브 앱 | 웹 반응형만 | 별도 프로젝트 |
| 허브 UI 전면 재설계 | 비서 분기만 추가 | UXUI 재설계 |
| KIS 증권 API 코드 수정 | 투자 코드 불가침 | — |
| 텔레그램 봇 로직 수정 | 음성 전송 연동만 | — |
| 워크플로우 빌더 (조건부 분기) | NEXUS = 조직도 편집만 | Phase 6 |
| 퍼포먼스 적극 최적화 | P95 동등만 목표 | Phase 5+ |
| 다국어 (i18n) | 한국어 단일 | 별도 |

**코드 경계:**
- ✅ 건드림: `engine/`, `tool-handlers/`, `services/` (llm-router + 삭제), `routes/`, `db/`, `app/src/` (허브), `admin/src/` (관리자), `mcp/` (스케치바이브 MCP 신규)
- ❌ 안 건드림: `shared/` (타입 추가만), `ui/`, `services/trading/`, `services/telegram/` (전송만), `services/selenium/`

## User Journeys

### Journey 1: CEO 김대표 — "혼자가 아니다. 내 팀이 있다."

**페르소나:** 법학 전공 1인 사업가. AI를 적극 활용하지만 코드를 모름. 혼자서 투자, 마케팅, 시스템 관리를 모두 해야 함.

**Phase 1 (엔진 교체) — 투명한 변화:**
CEO는 아무 변화를 느끼지 못한다. 허브에 "삼성전자 분석해줘"라고 입력하면 기존과 동일하게 비서실장이 받아 CIO에게 핸드오프하고 보고서가 온다. 내부적으로 agent-runner.ts 대신 agent-loop.ts가 돌지만, processing 이벤트를 즉시 전송하여 SDK 서브프로세스 spawn 지연(~2초)을 체감 지연 없이 흡수한다.

*에러 시나리오:* SDK query() spawn 실패 시 자동 재시도 1회. 재시도도 실패하면 "에이전트 실행에 실패했습니다. 잠시 후 다시 시도해주세요." 메시지 표시.

**Phase 2 (오케스트레이션) — 핸드오프가 보인다:**
허브 사이드바에 실시간 핸드오프 추적이 표시된다:
- 🤖 비서실장 분석 중... (0.5초) → 📨 CIO에게 핸드오프 → 📨 종목분석가 + 기술분석가 병렬 핸드오프 → 🔧 작업 중... → 📊 CIO 종합 → ✍️ 비서실장 정리 → ✅ 완료

CEO가 느끼는 변화: "아 비서실장이 CIO한테 넘기고, CIO가 두 명한테 동시에 시켰구나." 핸드오프 체인이 시각적으로 흘러가는 걸 처음으로 봄.

Soul 편집: Admin이 CIO Soul에 "뉴스 반드시 참고" 한 줄 추가 → 다음 분석에서 CIO가 뉴스 검색 도구 자동 사용. CEO: "프롬프트만 바꿨다고?"

*에러 시나리오:* 6명 팀장 동시 지시 중 CMO 타임아웃 → "마케팅부 CMO가 응답하지 못했습니다. 나머지 5개 부서 결과로 종합합니다." 블랙박스 에러 없이 어떤 에이전트가 실패했는지 명확히 표시.

**Phase 3 (티어 유연화) — 비용 최적화:**
NEXUS에서 조직도를 확인. 뉴스분석가를 Tier 4(Haiku)로 변경 → 다음 달 해당 에이전트 비용 80% 절감. "이거 하나 바꿨는데 돈이 이렇게 줄었어?"

**Phase 4 (라이브러리 강화) — 감정적 클라이맥스:**
"오늘 시황 브리핑 만들어줘" → CIO가 의미 검색으로 관련 문서 자동 발견 → NotebookLM 음성 브리핑 생성(2분) → 텔레그램 전송 → 퇴근길 지하철에서 이어폰으로 청취. *'진짜 비서가 있는 느낌이다.'*

### Journey 2: 팀장 박과장 — "AI를 팀 인프라로 만들었다."

**페르소나:** 중소기업 마케팅팀 팀장. 팀원 8명이 각자 ChatGPT를 쓰는데 비용 통제와 표준화가 안 됨.

**Phase 2 — 비서 선택제:**
Admin이 박과장은 비서 없음(직접 선택 선호), 신입 팀원A는 비서 있음("마케팅 어시스턴트", Soul: 마케팅 관련만 처리), 경력 팀원B는 비서 없음으로 설정. 같은 마케팅부 에이전트를 다른 경로로 사용 — 박과장은 SEO분석가를 직접 선택하고, 팀원A는 비서에게 자연어로 말하면 자동 라우팅.

**Phase 3 — 비용 통제:**
관리자 콘솔에서 팀별 비용 현황 확인. 콘텐츠작성가(128회/월)를 Tier 4로 변경 → 다음 달 50% 절감. 에이전트 사용량과 비용을 팀 단위로 시각적으로 관리.

### Journey 3: 투자자 이사장 — "4명의 애널리스트를 고용한 효과."

**페르소나:** 개인 투자자. 포트폴리오 10종목. 매일 뉴스·재무·기술·매크로를 동시에 분석해야 하는데 혼자서 불가능.

**Phase 2 — call_agent 병렬 핸드오프의 진가:**
"포트폴리오 리밸런싱 분석해줘" → 비서실장→CIO→전문가 4명(종목·기술·뉴스·매크로)에게 동시 call_agent → 4명이 각각 KIS API, 차트, 뉴스, 금리 데이터를 병렬 수집(~6초) → CIO가 종합 시 의견 충돌 발견("종목분석가: 매수 vs 기술분석가: 보류") → Soul 검증 지침에 따라 양쪽 의견 병기 → 비서실장이 이사장 눈높이로 정리 → 총 ~20초.

**Phase 4 — 아침 음성 브리핑:**
ARGOS 크론잡(매일 오전 7시) → CIO에게 자동 명령 → 4명 병렬 분석 → NotebookLM 음성 5분 브리핑 → 텔레그램 전송 → 출근길 7:15 이어폰으로 청취.

### Journey 4: Admin — "AI 조직을 내 손으로 설계했다."

**Phase 2 — 초기 설정 (~10분):**
회사 정보 입력(1분) → Human 직원 등록 + CLI 토큰 검증 + 비서 유무 설정(3분) → 부서 생성 + 에이전트 배치 + Tier 설정(3분) → 도구 할당(2분) → 기본 Soul 템플릿 자동 적용. 추가 Soul 편집 불필요.

**Phase 3 — NEXUS 조직도:**
노드 기반 시각적 조직도. [+ 부서] → "마케팅부" → CMO 생성(Tier 2) → 비서실장에서 드래그&드롭으로 연결 → 하위에 콘텐츠작성가, SEO분석가 추가(Tier 4) → [저장] → 즉시 반영. 김대표가 허브에서 "마케팅 전략 수립해줘" → 비서실장이 CMO를 인식 → call_agent 자동 핸드오프. 배포 0, 코드 수정 0.

### Journey 5: Human 직원 이과장 — "바로 시킨다."

**Phase 2 — 비서 없는 허브:**
에이전트 목록에서 종목분석가 선택(1클릭, 2초) → "현대차 재무 분석해줘" 입력(2클릭 = 선택 + 전송) → 종목분석가 직접 실행(비서 경유 없음) → 3초 후 결과. 총 2클릭, ~5초.

*에러 시나리오:* CTO를 선택해서 "삼성전자 분석해줘" → CTO Soul: "투자 분석은 내 업무가 아닙니다. CIO를 선택해주세요." 범위 밖 요청을 거절하되 누구에게 가야 하는지 안내.

### Journey 6: Admin (개발) — 스케치바이브 CLI 협업

**Phase 4 — Claude Code ↔ 캔버스:**
터미널에서 Claude Code 실행 → "현재 engine/ 구조를 캔버스에 그려줘" → Claude Code가 Read/Grep으로 코드 분석 → MCP update_canvas()로 아키텍처 다이어그램 실시간 표시 → 브라우저에서 확인 → "여기에 llm-router 연결 추가해줘" → Claude Code가 캔버스 수정 + request_approval() → 브라우저에서 [적용] 클릭 → Claude Code: "이 구조를 README에도 반영할까요?"

코드를 이해하는 AI가 캔버스와 코드를 동시 조작하는 양방향 개발 협업.

### Journey 7: CEO 첫 사용자 — 셀프서비스 온보딩

**Phase 2 — 5분 온보딩:**
회원가입 → CLI 토큰 입력 + [검증] → ✅ 유효 → "기본 AI 조직을 만들어드릴까요?" → [예] → 비서실장 + 투자분석부(CIO+전문가3명) + 기술부(CTO+개발자) 자동 생성 → 기본 Soul 템플릿 적용 → 허브에서 "안녕하세요!" → 비서실장 응답. 총 ~5분.

### Journey Requirements Summary

| 여정 | Phase | 도출된 기능 요구사항 |
|------|-------|-------------------|
| CEO 김대표 | 1 | processing 이벤트 즉시 전송 (체감 지연 최소화), graceful degradation + 재시도 |
| CEO 김대표 | 2 | 비서 있는 허브, 실시간 핸드오프 추적 사이드바, 에러 메시지 (실패 에이전트 명시 + 나머지 종합) |
| CEO 김대표 | 3 | NEXUS 조직도 읽기 뷰, Tier 변경 UI |
| CEO 김대표 | 4 | 음성 브리핑 생성 + 텔레그램 전송 |
| 팀장 박과장 | 2 | 비서 없는 허브, 에이전트 접근 권한 관리 |
| 팀장 박과장 | 3 | 팀별 비용 현황 대시보드, Tier 변경 |
| 투자자 이사장 | 2 | call_agent 병렬 핸드오프 (4명 동시), CIO Soul 검증 (의견 충돌 → 병기) |
| 투자자 이사장 | 4 | ARGOS 크론잡 → 자동 분석 → 음성 → 텔레그램 |
| Admin | 2 | 초기 설정 플로우 ≤ 15분, 기본 Soul 템플릿, CLI 토큰 검증 UI |
| Admin | 3 | NEXUS 드래그&드롭 편집, 부서/에이전트/비서 CRUD, 티어 설정 |
| Human 직원 | 2 | 비서 없는 허브 (에이전트 직접 선택), 범위 밖 요청 거절 + 안내 |
| Admin (개발) | 4 | 스케치바이브 MCP (read/update/approve/list), CLI 연결 |
| CEO (온보딩) | 2 | 기본 조직 자동 생성 원클릭, 셀프서비스 온보딩 ~5분 |

### 여정 간 교차점

| 교차점 | 영향 | 기능 요구사항 |
|--------|------|-------------|
| CEO ↔ Admin | Soul 편집 권한 | Phase 1~4: Admin만 Soul 편집 가능. CEO는 읽기만 |
| CEO ↔ 투자자 | 동일 인물 가능 | 비서 Soul 기본 템플릿에 전 부서 라우팅 지침 포함 |
| 팀장 ↔ Human 직원 | 같은 에이전트, 다른 경로 | 비서 경유 vs 직접 선택 양쪽 지원. CLI 토큰 비용 귀속 분리 |
| 텔레그램 ↔ 허브 | 같은 비서, 다른 반환 채널 | 텔레그램 경유 명령도 agent-loop.ts 통과. 회귀 테스트 포함 |
| Admin NEXUS ↔ Admin 스케치바이브 | 같은 사람, 독립 맥락 | NEXUS(조직 관리) ≠ 스케치바이브(개발 협업). 탭 간 독립 |

## Domain-Specific Requirements

*도메인 요구사항은 "무엇을 지켜야 하는가"(규제·도메인 근거)를 정의한다. "얼마나 잘"(정량 목표)은 NFR 섹션 참조.*

### 보안 (SEC) → 정량 목표: NFR-S1~S7

| ID | 요구사항 | 상세 | Phase |
|----|---------|------|-------|
| SEC-1 | CLI 토큰 DB 암호화 | AES-256, 복호화 키 환경변수 분리 | 유지 (확인) |
| SEC-2 | 토큰 메모리 노출 최소화 | query() 호출 후 토큰 변수 즉시 null 처리 | 1 |
| SEC-3 | 프로세스 환경변수 격리 | Docker 프로세스 네임스페이스 분리 | 유지 |
| SEC-4 | output-redactor 패턴 | `sk-ant-cli-*`, `sk-ant-api-*`, OAuth Bearer 토큰 전부 마스킹 | 1 |
| SEC-5 | 감사 로그 토큰 필터 | credential-scrubber가 audit_logs 기록 전에 필터 적용 | 1 |
| SEC-6 | Soul에서 토큰 접근 불가 | 에이전트 Soul/시스템 프롬프트에 CLI 토큰 절대 주입 안 함 | 2 |
| SEC-7 | 토큰 로테이션 | 토큰 만료/갱신 시 세션 중인 에이전트 graceful 종료 | Phase 5+ |

### CLI 토큰 핸드오프 정책

| 시나리오 | 사용 토큰 | 근거 |
|----------|---------|------|
| CEO → 비서실장 | CEO 토큰 | 직접 명령 |
| 비서실장 → CIO (call_agent) | CEO 토큰 유지 | 핸드오프 체인 내 전파 |
| CIO → 전문가 (call_agent) | CEO 토큰 유지 | 핸드오프 체인 내 전파 |
| ARGOS 크론잡 → CIO | 크론잡 등록한 Human의 토큰 | executorUserId 바인딩 |
| 텔레그램 → 비서실장 | 텔레그램 연동된 사용자 토큰 | 채널 무관, 사용자 기준 |

### SDK 의존성 (SDK)

| ID | 요구사항 | 상세 |
|----|---------|------|
| SDK-1 | 사용 API 8개로 고정 | query(), tool(), createSdkMcpServer(), hooks, env, maxTurns, permissionMode, allowedTools |
| SDK-2 | unstable API 사용 금지 | `unstable_*` 접두사 API는 Phase 1~4에서 절대 사용 안 함 |
| SDK-3 | SDK 업데이트 프로토콜 | 0.2.x 패치: 자동. 0.3.x: agent-loop.ts 수동 대응 + 테스트 |
| SDK-4 | SDK 제거 대비 | agent-loop.ts 인터페이스를 SDK 독립적으로 설계 |

### DB 제약 (DB)

| ID | 요구사항 | Phase |
|----|---------|-------|
| DB-1 | tier_level 상한 10 (CHECK 제약) | 3 |
| DB-2 | 비서 = 반드시 소유자 있음 (CHECK: is_secretary=true → owner_user_id NOT NULL) | 2 |
| DB-3 | 기존 문서 벡터화 배치 마이그레이션 (embedding NULL → 채우기) | 4 |
| DB-4 | 마이그레이션 무중단 (온라인, 서비스 중단 0) | 3 |
| DB-5 | 마이그레이션 롤백 스크립트 준비 (integer → enum 복원) | 3 |

### 오케스트레이션 (ORC)

| ID | 요구사항 | Phase |
|----|---------|-------|
| ORC-1 | 핸드오프 깊이 최대 5단계 (회사별 configurable) | 1 |
| ORC-2 | 병렬 핸드오프 최대 10개 (configurable) | 1 |
| ORC-3 | 에이전트 메타데이터 Soul 자동 주입 (DB → Soul 템플릿 변수 치환) | 1 |
| ORC-4 | tier → model 자동 매핑 (tier_configs 조회) | 1+3 |
| ORC-5 | Soul 템플릿 3종 기본 제공 (비서/매니저/전문가) | 2 |
| ORC-6 | 매니저 Soul에 교차 검증 + 충돌 처리 + 에러 처리 지침 필수 | 2 |
| ORC-7 | call_agent는 모든 에이전트에 기본 포함 (제거 불가) | 1 |

### Soul 템플릿 (SOUL)

| ID | 요구사항 |
|----|---------|
| SOUL-1 | 비서 Soul 자동 주입 변수: `{agent_list}`, `{owner_name}` |
| SOUL-2 | 매니저 Soul 자동 주입 변수: `{subordinate_list}`, `{department_name}` |
| SOUL-3 | 전문가 Soul 자동 주입 변수: `{tool_list}`, `{specialty}` |
| SOUL-4 | 모든 Soul에 금지 섹션 포함 (토큰 노출 방지, 범위 밖 행동 금지) |
| SOUL-5 | 매니저 Soul에 교차 검증(수치 대조) + 충돌 시 병기 + 에러 시 나머지 종합 지침 |
| SOUL-6 | agent-loop.ts에서 Soul 템플릿 변수를 DB 데이터로 치환 후 query()에 전달 |

### 운영 (OPS) → 정량 목표: NFR-O1~O8, NFR-SC1~SC7

| ID | 요구사항 | 상세 |
|----|---------|------|
| OPS-1 | 동시 query() 세션 제한 | 기본 10개. 초과 시 429 반환 |
| OPS-2 | 세션 타임아웃 | query() 최대 120초. 초과 시 강제 종료 + 에러 반환 |
| OPS-3 | 메모리 모니터링 | 서버 메모리 80%+ 경고, 90%+ 신규 세션 거부 |
| OPS-4 | 서브프로세스 좀비 방지 | SDK 종료 후 cleanup 확인. 좀비 크론잡 정리 |
| OPS-5 | pgvector ARM64 호환 | Phase 4 시작 전 Docker 내 빌드 검증 |
| OPS-6 | 배포 무중단 | Docker graceful shutdown → 신규 컨테이너 시작 |

### NotebookLM (NLM)

| ID | 요구사항 | 상세 |
|----|---------|------|
| NLM-1 | 폴백 | MCP 실패 시 텍스트 브리핑으로 대체 (음성 없이 텍스트 텔레그램 전송) |
| NLM-2 | Google OAuth 크레덴셜 | 회사별 1개 Google 계정. 관리자 콘솔에서 OAuth 인증 플로우 |
| NLM-3 | 비동기 생성 | 음성 생성 비동기. CEO에게 '생성 요청됨' 즉시 알림 → 완료 시 텔레그램 전송 |
| NLM-4 | Phase 4 도구 범위 | `audio_briefing` + `notebook`만. mindmap/slides/flashcards/infographic는 Phase 5+ |

### 벡터 검색 (VEC)

| ID | 요구사항 | 상세 |
|----|---------|------|
| VEC-1 | 문서 chunk 분할 | 2,048 토큰 이상 시 자동 분할 (Gemini Embedding 제한) |
| VEC-2 | 벡터 생성 실패 시 문서 저장 진행 | embedding = NULL 허용 |
| VEC-3 | 기존 문서 배치 벡터화 | 마이그레이션 스크립트로 knowledge_docs 전체 벡터화 |
| VEC-4 | 유사도 임계값 + 반환 상한 | 기본: cosine ≥ 0.7, 상위 5건. 회사별 configurable |

### 도메인 요구사항 요약

| 카테고리 | 개수 | Phase 1 | Phase 2 | Phase 3 | Phase 4 | 유지 |
|---------|------|---------|---------|---------|---------|------|
| 보안 (SEC) | 7 | 3 | 1 | — | — | 3 |
| SDK | 4 | 4 | — | — | — | — |
| DB | 5 | — | 1 | 3 | 1 | — |
| 오케스트레이션 (ORC) | 7 | 4 | 2 | 1 | — | — |
| Soul (SOUL) | 6 | 1 | 5 | — | — | — |
| 운영 (OPS) | 6 | 2 | — | — | 1 | 3 |
| NotebookLM (NLM) | 4 | — | — | — | 4 | — |
| 벡터 (VEC) | 4 | — | — | — | 4 | — |
| **총** | **43** | **14** | **9** | **4** | **10** | **6** |

## Innovation & Novel Patterns

### 감지된 혁신 영역

CORTHEX v2의 혁신은 개별 기능이 아니라 **4개 혁신의 조합**에 있다. Soul 오케스트레이션만 있으면 프롬프트 관리 도구, call_agent만 있으면 에이전트 체이닝, NEXUS만 있으면 시각화 도구에 불과하다. 4개가 합쳐져야 비로소 **"조직도를 그리면 AI 팀이 움직인다"**가 실현된다.

**혁신 1: Soul = 오케스트레이션 (시장 유일)**

에이전트의 시스템 프롬프트(Soul)가 곧 라우팅 규칙이라는 접근. 2026년 3월 기준 시장에서 유일하다.

| 비교 | CORTHEX v2 | CrewAI | LangGraph | AutoGen |
|------|-----------|--------|-----------|---------|
| 워크플로우 변경 | Soul 텍스트 편집 (코드 0줄) | Python 코드 30~50줄 | 그래프 재정의 20~40줄 | Agent 클래스 수정 30줄+ |
| 배포 필요 | 불필요 (즉시 반영) | 필요 | 필요 | 필요 |
| 변경 주체 | 비개발자 (Admin) | 개발자만 | 개발자만 | 개발자만 |

**뒤집는 가정:** "오케스트레이션은 코드로 정의해야 한다" → "시스템 프롬프트가 곧 라우팅이다"

**핵심 리스크:** LLM 지시 준수율(instruction following)에 100% 의존. PoC에서 80%, Soul 튜닝 후 95% 목표. 폴백: 1) 명시적 규칙 → 2) 에이전트 태그 → 3) 룰 기반 프리라우팅 (~20줄)

**혁신 2: call_agent 도구 패턴 (N단계 핸드오프, 기술적 무제한 / 운영 상한 기본 5)**

SDK 서브에이전트의 1단계 한계를 도구 레벨에서 우회하는 독창적 해법. 다른 SDK에서도 기술적으로 유사 구현이 가능하지만, **공식 패턴으로 설계하고 제품화한 사례는 없다.**

| SDK | 공식 서브에이전트 깊이 | call_agent 유사 패턴 |
|-----|---------------------|-------------------|
| Claude Agent SDK | 1단계 (PoC Test 7 확인) | CORTHEX call_agent MCP 도구 |
| OpenAI Agents SDK | 1단계 (handoff) | 비공식적으로 가능하나 토큰 전파 미보장 |
| Google ADK | 1단계 (sub_agents) | 미지원 |
| CrewAI | 2단계 (hierarchical) | 커스텀 태스크 체인 |

**혁신 3: 비개발자 AI 조직 설계 (시장 공백)**

"코드 모르는 CEO가 조직도를 그리면 AI 팀이 움직인다" — 비개발자가 **다중 에이전트 조직**을 시각적으로 설계하는 제품은 없다.

| 제품 | 타겟 | 비개발자 사용 | 다중 에이전트 깊이 |
|------|------|-------------|-----------------|
| CORTHEX v2 | CEO, 1인 사업가 | ✅ NEXUS 드래그&드롭 | N단계 (기본 5, configurable) |
| CrewAI Studio | 개발자 | ❌ Python 필수 | 2단계 |
| LangGraph Studio | 개발자 | ❌ 코드 필수 | 그래프 정의만큼 |
| Dify.ai | 기획자~개발자 | △ 워크플로우 개념 필요 | 1~2단계 |
| Coze | 일반 사용자 | △ 봇 빌더 | 단일 에이전트 |

**혁신 4: CLI Max 월정액 과금 모델 혁신**

경쟁자들은 API 콜당 과금(에이전트 10명 = 월 $500+). CORTHEX는 CLI Max 월정액($200)으로 에이전트를 무제한 실행한다. 핸드오프 체인 전체에서 최초 명령자의 CLI 토큰이 전파되어 비용 귀속이 투명하다. "누가 얼마나 썼는지" 정확히 추적 가능.

### 사용자 체감 혁신 vs 기술 혁신

**사용자가 느끼는 혁신 (CEO 관점):**
1. "그림 그렸더니 진짜 움직인다" — NEXUS + Soul + call_agent 조합의 표면
2. "코드 안 바꿨는데 행동이 달라졌다" — Soul 편집의 즉시 반영
3. "출퇴근길에 듣는다" — 음성 브리핑의 접근성
4. "얼마 쓰는지 보인다" — CLI Max 기반 투명한 비용 추적

**기술 혁신 (개발팀 관점):**
1. Soul = 오케스트레이션 — 시스템 프롬프트가 라우팅 규칙
2. call_agent N단계 — 도구 핸들러에서 query() 재귀 spawn
3. SDK 1파일 격리 — agent-loop.ts 50줄로 벤더 종속 최소화
4. CLI 토큰 핸드오프 체인 — 핸드오프 전체에 명령자 토큰 전파

### 시장 타이밍: 왜 지금인가

2026년 3월, Claude·OpenAI·Google이 동시에 에이전트 SDK를 공식 출시했다. 이는 **인프라 레이어가 commodity화**된 시점이다. AWS가 나왔을 때 SaaS가 폭발한 것처럼, 에이전트 SDK가 commodity화된 지금이 **application 레이어 혁신**을 잡을 적기다. 6개월 전에는 에이전트 실행 엔진을 직접 만들어야 했고, 6개월 후에는 경쟁자가 따라온다.

### 검증 접근법

| 혁신 | 검증 방법 | 시점 | 성공 기준 |
|------|---------|------|---------|
| Soul 오케스트레이션 | Soul 규칙 추가 → 행동 변화 A/B 10회 | Phase 2 | 8/10회+ 반영 (80%+) |
| call_agent N단계 | 3단계 핸드오프 통합 테스트 | Phase 1 1주차 | E2E ≤ 60초 |
| call_agent 깊이 vs 성능 | 1~5단계 핸드오프 latency 벤치마크 | Phase 1 | 5단계 ≤ 90초, 메모리 ≤ 50MB |
| 비개발자 조직 설계 | CEO 김대표 첫 사용 테스트 (튜토리얼 없이) | Phase 3 | ≤ 10분 완료 |
| CLI 토큰 전파 | 3단계 핸드오프 후 비용 로그 검증 | Phase 1 | 전 단계 동일 토큰 |
| CLI Max 비용 우위 | 월간 사용 비용 vs API 과금 비교 | Phase 2 후 1개월 | 경쟁자 대비 60%+ 절감 |

### 혁신 리스크 완화

| 혁신 리스크 | 폴백 전략 |
|-----------|---------|
| Soul 라우팅 정확도 부족 (<50%) | 1) 명시적 규칙 → 2) 에이전트 태그 → 3) 룰 기반 프리라우팅 (~20줄) |
| call_agent 3단계 핸드오프 실패 | 1) env 전달 → 2) 환경변수 클리닝 → 3) 2단계로 축소 |
| call_agent 5단계 latency 초과 | ORC-1 핸드오프 깊이 상한 조정 (기본 5 → 3으로 축소) |
| NEXUS UX 비개발자에게 복잡 | 기본 조직 자동 생성 원클릭 + 간단 튜토리얼 |
| CLI Max 정책 변경 | API 과금 대비용 agent-loop.ts에 API 키 모드 추가 (~10줄) |

## Technical Architecture Context

### Project-Type Overview

CORTHEX v2는 3가지 타입의 복합 제품이다:
- **developer_tool (40%)**: Claude Agent SDK 기반 에이전트 엔진, MCP 서버(스케치바이브, NotebookLM), Hook 시스템. 개발자가 확장하는 플랫폼.
- **saas_b2b (30%)**: 회사별 멀티테넌트, N단계 티어, Admin/Human 역할 관리. 팀 단위 AI 인프라.
- **web_app (30%)**: React 19 SPA, 실시간 WebSocket, 허브/관리자 콘솔/NEXUS 3개 프론트엔드.

### 멀티테넌트 모델 (SaaS B2B)

| 항목 | 설계 |
|------|------|
| 격리 수준 | Row-level (company_id FK). 별도 DB 아님 |
| 데이터 격리 | 모든 쿼리에 company_id WHERE 조건 (Drizzle ORM 쿼리 래퍼로 자동 주입 — Phase 1에서 미들웨어 vs 수동 방식 최종 결정) |
| 스키마 격리 | 공유 스키마. 회사별 커스텀 없음 |
| 에이전트 격리 | 회사별 독립 에이전트·부서·도구 |
| CLI 토큰 격리 | 회사별 Human이 각자 토큰 등록. 교차 사용 불가 |
| 세션 격리 | query() 프로세스 단위. env 독립 주입 + 임시 파일 경로 `/tmp/{sessionId}/` 분리로 프로세스 간 충돌 방지 |

### 권한 매트릭스 (RBAC)

| 역할 | 허브 | 관리자 콘솔 | NEXUS | Soul 편집 | 에이전트 CRUD | Human CRUD | 비서 할당 |
|------|---------|-----------|-------|----------|------------|-----------|---------|
| Admin | ✅ | ✅ | ✅ 편집 | ✅ | ✅ | ✅ | ✅ |
| CEO/Human (비서 있음) | ✅ 비서 경유 | ❌ | ✅ 읽기 | ❌ | ❌ | ❌ | ❌ |
| Human (비서 없음) | ✅ 직접 선택 | ❌ | ✅ 읽기 | ❌ | ❌ | ❌ | ❌ |

### 구독 및 과금 (Subscription)

| 항목 | 설계 |
|------|------|
| 과금 모델 | CLI Max 월정액 기반. CORTHEX 자체 추가 과금 없음 (Phase 1~4) |
| 토큰 비용 | Human 개인 CLI Max 구독으로 충당 |
| 비용 추적 | cost-tracker Hook으로 세션·에이전트·Human별 사용량 기록 |
| 비용 최적화 | N단계 티어로 저비용 모델 자동 배정 (Tier 4 = Haiku) |
| Phase 5+ 과금 검토 후보 | 회사 월정액 (에이전트 수 기반) / Human 좌석 단위 / 하이브리드 |

### 통합 목록 (Integrations)

| 통합 | 프로토콜 | 방향 | Phase |
|------|---------|------|-------|
| Claude Agent SDK | npm 패키지 (query()) | 서버→SDK CLI | 1 |
| 텔레그램 봇 | HTTP API | 양방향 (메시지 수신/전송) | 유지 |
| KIS 증권 API | REST | 서버→KIS (읽기 전용) | 유지 |
| NotebookLM | MCP (29개 도구) | 서버→Google | 4 |
| 스케치바이브 CLI | MCP Stdio | Claude Code→서버 | 4 |
| Gemini Embedding | REST API | 서버→Google | 4 |
| ARGOS 크론잡 | 내부 스케줄러 | 서버 내부 | 유지 |
| PostgreSQL | Drizzle ORM | 서버→DB | 유지 |
| WebSocket | ws | 서버↔브라우저 (실시간) | 유지+확장 |

### 브라우저 & 반응형 (Web App)

**브라우저:** Chrome/Safari/Firefox/Edge 최신 2버전. IE 미지원. 정량 테스트 기준 → NFR-B1~B3 참조.

**반응형 지원 매트릭스:**

| 기능 | Desktop (≥1280px) | Tablet (≥768px) | Mobile (≥375px) |
|------|-------------------|-----------------|-----------------|
| 허브 | ✅ 전체 | ✅ 전체 | ✅ 메시지만 |
| 관리자 콘솔 | ✅ 전체 | △ 읽기 위주 | ❌ |
| NEXUS 편집 | ✅ | ❌ | ❌ |
| NEXUS 읽기 | ✅ | ✅ | ❌ |

NEXUS 편집은 데스크톱 전용 (드래그&드롭 터치 조작 한계).

### 성능 & 접근성 목표

정량 성능 목표 → NFR Performance (NFR-P1~P12) 참조.
접근성 기준 → NFR Accessibility (NFR-A1~A4) 참조.

**베이스라인:** Phase 1 시작 전 v1 프론트엔드 FCP/LCP/번들 크기 + 백엔드 API P95 측정 필수.

### API Surface (Developer Tool)

| API | 설명 | 사용자 |
|-----|------|--------|
| `POST /api/agents/:id/chat` | 에이전트 대화 (SSE 스트리밍) | 허브 프론트엔드 |
| `GET /api/agents` | 에이전트 목록 | 허브, 관리자 콘솔 |
| `CRUD /api/admin/*` | 부서·에이전트·Human·도구 관리 | 관리자 콘솔 |
| `GET /api/nexus/org-tree` | 조직도 트리 구조 | NEXUS |
| `PUT /api/nexus/org-tree` | 조직도 저장 | NEXUS |
| `WS /ws/delegation` | 핸드오프 추적 실시간 | 허브 사이드바 |
| 스케치바이브 MCP (Stdio) | read/update/approve/list | Claude Code CLI |

*참고: 실제 라우트 경로는 아키텍처 문서에서 v1 코드 기반으로 확정. 위는 논리적 구조.*

### 마이그레이션 가이드 (Migration)

Phase별 기존 → 신규 전환 순서:

**Phase 1 (엔진 교체):**
1. `agent-runner.ts` → `agent-loop.ts` (라우트 import 변경)
2. `delegation-tracker.ts` (서비스) → Hook: `delegation-tracker.ts`

**Phase 2 (오케스트레이션):**
3. `chief-of-staff.ts` → 비서 Soul 템플릿
4. `manager-delegate.ts` → 매니저 Soul + call_agent
5. `cio-orchestrator.ts` → CIO Soul + call_agent
6. 위 3~5 검증 후 → 기존 5개 서비스 삭제

**Phase 3 (티어 유연화):**
7. tier enum (3단계) → `tier_configs` 테이블 (N단계, 온라인 마이그레이션)

### 구현 고려사항

**빌드 및 배포:**
- Turborepo 모노레포: `packages/admin`, `packages/app`, `packages/ui`, `packages/shared`, `packages/server`
- Docker 기반 배포 (Oracle VPS ARM64)
- GitHub Actions self-hosted runner
- Cloudflare CDN 캐시 퍼지

**SDK 의존성 관리:**
- `@anthropic-ai/claude-agent-sdk@0.2.x` — agent-loop.ts에서만 import
- `@modelcontextprotocol/sdk` — 스케치바이브 MCP 서버 (Phase 4)
- Zod v4 — MCP 도구 스키마 정의

## Project Scoping & Phased Development

### MVP 전략 & 철학

**MVP 접근법:** 2단계 검증 MVP (MVP-A → MVP-B)

| 단계 | 검증 대상 | 접근 | 실패 시 |
|------|---------|------|---------|
| **MVP-A** (Phase 1) | "SDK가 기존 엔진을 대체할 수 있는가?" | Engineering MVP — 기존 기능 동등성 증명 | 하이브리드 전략으로 전환 |
| **MVP-B** (Phase 2) | "Soul = 오케스트레이션이 동작하는가?" | Problem-Solving MVP — 핵심 가치 증명 | Soul 부분 적용 + 코드 오케스트레이션 병행 |

**왜 2단계인가:** Phase 1(엔진 교체)이 실패하면 Phase 2(Soul 오케스트레이션)는 불가능하다. fail-fast를 위해 기술 리스크를 먼저 제거한다.

**리소스 요구사항:**
- Phase 1~4: 1인 개발자 (Claude Code AI 페어 프로그래밍)
- 도메인 전문가: CEO 김대표 (사용자 검증)
- 총 예상 일정: 목표 9주 (낙관 7주 / 비관 12주)

### MVP 기능셋 (Phase 1~2)

**지원 여정:**

| 여정 | Phase 1 | Phase 2 | 비고 |
|------|---------|---------|------|
| CEO 김대표 (허브) | ✅ 기존과 동일 | ✅ 비서 경유 + 핸드오프 추적 | 핵심 |
| 투자자 이사장 (병렬 분석) | ✅ 기존과 동일 | ✅ call_agent 병렬 | 핵심 |
| Admin (설정) | — | ✅ 비서 할당 + Soul 편집 | Phase 2 |
| Human 직원 (직접 선택) | — | ✅ 비서 없는 허브 | Phase 2 |
| CEO (온보딩) | — | ✅ 기본 조직 자동 생성 | Phase 2 |
| 팀장 박과장 (비용 관리) | — | — | Phase 3 |
| Admin (NEXUS) | — | — | Phase 3 |
| Admin (스케치바이브) | — | — | Phase 4 |

**Must-Have (없으면 제품 실패):**
1. agent-loop.ts query() 동작 (Phase 1)
2. Hook 5개 보안 체계 (Phase 1)
3. call_agent 3단계 핸드오프 (Phase 1)
4. Epic 1~20 회귀 통과 (Phase 1)
5. 비서/비서없음 허브 양쪽 동작 (Phase 2)
6. Soul 편집 → 행동 변화 반영 (Phase 2)

**Nice-to-Have (나중에 추가 가능):**
- NEXUS 드래그&드롭 (Phase 3 — 관리자 콘솔 CRUD로 대체 가능)
- N단계 티어 (Phase 3 — 기존 3단계로 운영 가능)
- 의미 검색 (Phase 4 — 키워드 검색으로 대체 가능)
- 음성 브리핑 (Phase 4 — 텍스트 브리핑으로 대체 가능)
- 스케치바이브 MCP (Phase 4 — 기존 브라우저 AI 커맨드로 대체 가능)

### 리스크 완화 전략

**기술 리스크:**

| 리스크 | 확률 | 영향 | 완화 |
|--------|------|------|------|
| call_agent 3단계 토큰 전파 실패 | 중 | 🔴 극히높음 | Phase 1 1주차 우선 테스트. 실패 시 2단계로 축소 |
| Soul 라우팅 정확도 부족 (<50%) | 중 | 🔴 높음 | 3단계 폴백 (규칙→태그→프리라우팅). Phase 2 2주차 판단 |
| SDK 0.3.x 호환성 깨짐 | 낮 | 🟠 중간 | agent-loop.ts 1파일 격리. 0.2.x 고정 |
| pgvector ARM64 빌드 실패 | 낮 | 🟡 낮음 | Phase 4 시작 전 Docker 검증. 실패 시 키워드 검색 유지 |

**시장 리스크:**

| 리스크 | 완화 |
|--------|------|
| "비개발자 AI 조직 설계" 수요 미확인 | MVP-B 후 CEO 김대표 직접 사용 피드백으로 검증 |
| 경쟁자가 유사 제품 출시 | 6개월 선점 + Soul 오케스트레이션 독자 패턴으로 차별화 유지 |
| CLI Max 정책 변경 | agent-loop.ts에 API 키 모드 추가 대비 (~10줄) |

**리소스 리스크:**

| 리스크 | 완화 |
|--------|------|
| 1인 개발로 9주 초과 | Phase 4를 Phase 2~3과 병렬 실행 → 7주로 단축 가능 |
| Phase 1 실패로 전체 지연 | 하이브리드 전략: 기존 서비스 유지하며 점진적 전환 |

### 오픈소스 활용 전략

**원칙:** CORTHEX 고유 가치(call_agent, Soul, 스케치바이브)만 직접 구현. 나머지는 검증된 오픈소스 활용.

**Phase 1 적용:**

| 패키지 | 용도 | 대체 대상 |
|--------|------|---------|
| [@zapier/secret-scrubber](https://www.npmjs.com/package/@zapier/secret-scrubber) | credential-scrubber + output-redactor Hook 핵심 로직 | 패턴 매칭 직접 구현 |
| [hono-rate-limiter](https://github.com/rhinobase/hono-rate-limiter) | OPS-1 동시 세션 제한 (429 반환) | Rate limiting 직접 구현 |
| [Hono WebSocket Helper](https://hono.dev/docs/helpers/websocket) (`createBunWebSocket`) | 핸드오프 추적 실시간 WS | 별도 ws 패키지 |
| [Hono RPC](https://hono.dev/docs/guides/rpc) + [hono-rpc-query](https://github.com/kedom1337/hono-rpc-query) | 프론트↔백엔드 API 타입 자동 전파 | 수동 타입 정의 |
| [drizzle-zod](https://orm.drizzle.team/docs/zod) (Drizzle 내장) | DB 스키마 → Zod 검증 → TypeScript 타입 자동 생성 | 3중 스키마 정의 |
| [llm-cost-tracker](https://www.npmjs.com/package/llm-cost-tracker) | cost-tracker Hook 가격 계산 | 모델별 가격표 직접 관리 |
| [croner](https://github.com/Hexagon/croner) | ARGOS 크론잡 스케줄러 (Bun 네이티브, 0 의존성) | 기존 스케줄러 |
| [inngest/bun](https://github.com/inngest/bun-docker) Docker | ARM64 네이티브 이미지 | 기존 Docker 이미지 |

**Phase 2 적용:**

| 패키지 | 용도 | 대체 대상 |
|--------|------|---------|
| [assistant-ui](https://github.com/assistant-ui/assistant-ui) 또는 [AI Elements](https://github.com/vercel/ai-elements) | 허브 채팅 UI (SSE 스트리밍, 마크다운, 자동 스크롤, 접근성) | 채팅 UI 직접 구현 |
| [TanStack Query + WebSocket 패턴](https://tkdodo.eu/blog/using-web-sockets-with-react-query) | 실시간 핸드오프 이벤트 → 캐시 자동 업데이트 | 수동 캐시 관리 |

**Phase 3 적용:**

| 패키지 | 용도 | 대체 대상 |
|--------|------|---------|
| [React Flow](https://reactflow.dev) + [ELK.js](https://reactflow.dev/examples/layout/elkjs) | NEXUS 조직도 (드래그&드롭, 계층 레이아웃, 접기/펼치기) | Cytoscape 커스텀 구현 |

**Phase 4 적용:**

| 패키지 | 용도 | 대체 대상 |
|--------|------|---------|
| [notebooklm-mcp](https://github.com/m4yk3ldev/notebooklm-mcp) (Python, 32도구) | NotebookLM MCP 서버 (Stdio spawn) | TypeScript 직접 구현 (~80줄) |
| [pgvector-node](https://github.com/pgvector/pgvector-node) + Drizzle `cosineDistance()` | 벡터 유사도 검색 | cosine 계산 직접 구현 |
| [@google/genai](https://ai.google.dev/gemini-api/docs/embeddings) (`gemini-embedding-001`) | Gemini Embedding API (768/1536/3072차원) | REST 직접 호출 |

**Phase 5+ 검토:**

| 패키지 | 용도 |
|--------|------|
| [Langfuse](https://github.com/langfuse/langfuse) (오픈소스, 셀프호스트) | 에이전트 성과 대시보드 기반 — LLM 트레이싱, 도구 호출 로깅, 비용 모니터 |

**직접 구현 유지 (CORTHEX 고유 가치):**
- `engine/agent-loop.ts` — SDK query() 래퍼 + CLI 토큰 주입 + Soul 변수 치환
- `tool-handlers/builtins/call-agent.ts` — N단계 핸드오프 패턴
- `engine/hooks/tool-permission-guard.ts` — 에이전트별 도구 허용 로직 (DB 조회)
- `engine/hooks/delegation-tracker.ts` — WebSocket 이벤트 발행 로직
- Soul 템플릿 3종 (비서/매니저/전문가) — CORTHEX 고유 오케스트레이션
- 스케치바이브 CLI MCP 서버 — CORTHEX 고유 캔버스 연동

**총 효과:**
- 직접 작성 코드: ~1,000줄+ 추가 절감 (채팅 UI + NEXUS가 가장 큼)
- 개발 시간: ~1~2주 추가 절약
- 핵심 가치 코드 비율: 직접 코드의 80%+가 CORTHEX 고유 로직

## Functional Requirements

*이 섹션은 제품의 **기능 계약서**이다. 여기에 없는 기능은 최종 제품에 존재하지 않는다. UX 디자이너·아키텍트·Epic 분할 — 전부 이 목록만 참조한다.*

### 에이전트 실행 (Agent Execution)

에이전트가 자연어 명령을 받아 도구를 사용하고, 다른 에이전트에게 핸드오프하며, 결과를 실시간 스트리밍한다.

- FR1: [Phase 1] 사용자가 허브에서 에이전트에게 자연어로 명령을 보낼 수 있다
- FR2: [Phase 1] 에이전트가 허용된 도구를 사용하여 작업을 수행할 수 있다 (v1 도구 전체 호환 포함)
- FR3: [Phase 1] 에이전트가 call_agent 도구로 다른 에이전트에게 작업을 핸드오프할 수 있다
- FR4: [Phase 1] 핸드오프가 N단계 깊이로 이루어질 수 있다 (회사별 상한 설정 가능, 기본 5단계)
- FR5: [Phase 1] 에이전트가 여러 하위 에이전트에게 병렬로 핸드오프할 수 있다 (회사별 상한 설정 가능, 기본 10개)
- FR6: [Phase 1] 에이전트 응답이 SSE 스트리밍으로 사용자에게 실시간 전달된다
- FR7: [Phase 1] SDK query() 실패 시 자동 재시도 1회 후 사용자에게 에러 메시지를 표시한다
- FR8: [Phase 1] 모든 에이전트가 call_agent 도구를 기본으로 보유한다 (Admin이 제거 불가)
- FR9: [Phase 1] 에이전트가 핸드오프 체인 내 순환을 감지하면 핸드오프를 거부한다
- FR10: [Phase 1] 여러 사용자가 동일 에이전트에게 동시에 명령하면 각각 독립 세션으로 처리한다

### 비서 & 오케스트레이션 (Secretary & Orchestration)

비서실장이 사용자 의도를 분석하여 적절한 에이전트로 라우팅하고, 비서 유무에 따라 다른 UX를 제공한다.

- FR11: [Phase 2] Admin이 Human 직원에게 비서 에이전트를 할당하거나 해제할 수 있다
- FR12: [Phase 2] 비서가 있는 사용자가 자연어로 명령하면 비서가 해당 에이전트에게 라우팅한다
- FR13: [Phase 2] 비서가 없는 사용자가 에이전트 목록에서 직접 선택하여 명령할 수 있다
- FR14: [Phase 2] 비서가 있는 사용자의 허브는 채팅 입력 중심으로 표시된다 (에이전트 목록 숨김)
- FR15: [Phase 2] 비서가 없는 사용자의 허브는 에이전트 목록 선택 후 채팅으로 표시된다
- FR16: [Phase 2] 매니저 에이전트가 하위 에이전트 결과를 교차 검증하고, 의견 충돌 시 양쪽을 병기한다
- FR17: [Phase 2] 에이전트가 범위 밖 요청을 거절하되 적절한 에이전트를 안내한다
- FR18: [Phase 2] 비서가 있는 사용자는 비서 Soul에 정의된 범위 내에서만 에이전트에 접근한다
- FR19: [Phase 2] 비서가 없는 사용자는 자기 회사의 모든 에이전트를 선택할 수 있다
- FR20: [Phase 2] Admin이 에이전트를 추가하면 코드 변경 없이 즉시 사용 가능하다

### Soul 관리 (Soul Management)

Admin이 Soul을 편집하면 에이전트 행동이 즉시 변한다. 코드 수정 0줄, 배포 0회.

- FR21: [Phase 2] Admin이 에이전트의 Soul을 편집할 수 있다
- FR22: [Phase 2] Soul 편집이 다음 요청부터 반영되어 에이전트 행동이 변한다 (배포 불필요)
- FR23: [Phase 1] Soul 템플릿 변수({agent_list}, {subordinate_list}, {tool_list} 등)가 DB 데이터로 자동 치환된다
- FR24: [Phase 2] 기본 Soul 템플릿 3종(비서/매니저/전문가)이 새 에이전트 생성 시 자동 적용된다
- FR25: [Phase 2] 모든 Soul에 금지 섹션(토큰 노출 방지, 범위 밖 행동 금지)이 자동 포함된다

### 조직 관리 (Organization Management)

Admin이 부서·에이전트·Human을 관리하고, NEXUS에서 조직도를 시각적으로 편집한다.

- FR26: [Phase 2] Admin이 부서를 생성/수정/삭제할 수 있다
- FR27: [Phase 2] Admin이 AI 에이전트를 생성/수정/삭제하고 부서에 배치할 수 있다
- FR28: [Phase 2] Admin이 Human 직원을 등록/수정/삭제하고 CLI 토큰을 관리할 수 있다
- FR29: [Phase 2] Admin이 에이전트에게 사용 가능한 도구를 할당/해제할 수 있다
- FR30: [Phase 3] Admin이 NEXUS에서 조직도를 시각적으로 편집할 수 있다 (드래그&드롭으로 부서·에이전트 배치)
- FR31: [Phase 3] NEXUS에서 저장한 조직 구조가 즉시 반영된다 (배포 불필요)
- FR32: [Phase 2] CEO/Human이 NEXUS 조직도를 읽기 전용으로 확인할 수 있다
- FR33: [Phase 2] Admin이 비서실장(루트 에이전트)을 삭제하려 하면 시스템이 거부한다

### 티어 & 비용 관리 (Tier & Cost Management)

N단계 티어로 모델 등급을 세분화하고, 비용을 투명하게 추적한다.

- FR34: [Phase 3] Admin이 N단계 티어를 생성/수정/삭제할 수 있다 (상한 10단계)
- FR35: [Phase 3] 각 티어에 LLM 모델이 자동 매핑된다 (tier_configs 테이블 조회)
- FR36: [Phase 3] Admin이 에이전트의 티어를 변경할 수 있다
- FR37: [Phase 1] 시스템이 세션·에이전트·Human별 CLI 토큰 사용량과 비용을 자동 기록한다
- FR38: [Phase 1] 핸드오프 체인 전체에서 최초 명령자의 CLI 토큰이 전파된다
- FR39: [Phase 3] Admin/팀장이 팀별·에이전트별 비용 사용 현황을 확인할 수 있다

### 보안 & 감사 (Security & Audit)

에이전트 출력에서 민감 정보를 마스킹하고, 모든 도구 호출을 감사 로그에 기록한다.

- FR40: [Phase 1] 에이전트가 비허용 도구를 호출하면 차단된다 (tool-permission-guard)
- FR41: [Phase 1] 에이전트 출력에서 API 키·토큰 패턴이 자동 마스킹된다 (credential-scrubber + output-redactor)
- FR42: [Phase 1] 모든 도구 호출이 감사 로그에 기록된다 (토큰 필터 적용 후)
- FR43: [Phase 1] CLI 토큰이 암호화 저장된다
- FR44: [Phase 2] Soul/시스템 프롬프트에 CLI 토큰이 절대 주입되지 않는다
- FR45: [Phase 1] 회사 간 데이터가 격리된다 (멀티테넌트 row-level 격리)

### 실시간 모니터링 (Real-time Monitoring)

허브 트래커에서 핸드오프 체인이 실시간으로 흘러가고, 에러 시 명확한 피드백을 제공한다.

- FR46: [Phase 2] 허브 트래커에서 핸드오프 체인이 실시간으로 표시된다 (어떤 에이전트가 작업 중인지)
- FR47: [Phase 2] 에이전트 실패 시 "○○가 응답 못 함 → 나머지로 종합" 형식으로 사용자에게 표시된다 (블랙박스 에러 0건)
- FR48: [Phase 1] 서버 메모리 과부하 시 사용자에게 경고하고 신규 세션을 제한한다
- FR49: [Phase 2] 진행 중인 작업이 서버 재시작으로 중단되면 사용자에게 안내한다

### 라이브러리 — 지식 검색 & 브리핑 (Library — Knowledge & Briefing)

의미 기반 벡터 검색으로 관련 문서를 발견하고, 음성 브리핑을 생성하여 텔레그램으로 전송한다.

- FR50: [Phase 4] 에이전트가 의미 기반 벡터 검색으로 관련 문서를 찾을 수 있다
- FR51: [Phase 4] 사용자가 음성 브리핑을 요청하면 NotebookLM이 오디오를 비동기 생성한다
- FR52: [Phase 4] 음성 브리핑 생성 요청 시 사용자에게 '생성 중' 알림을 즉시 보낸다
- FR53: [Phase 4] 생성된 음성 브리핑이 텔레그램으로 자동 전송된다
- FR54: [Phase 4] 음성 생성 실패 시 텍스트 브리핑으로 대체 전송된다
- FR55: [Phase 유지] ARGOS 크론잡이 예약된 시간에 자동으로 분석 + 브리핑을 실행한다
- FR56: [Phase 유지] 사용자가 텔레그램에서 에이전트에게 명령할 수 있다

### 개발 협업 (Development Collaboration)

Claude Code CLI에서 스케치바이브 MCP 도구로 캔버스를 읽고 쓰고 승인한다.

- FR57: [Phase 4] Claude Code CLI에서 스케치바이브 MCP 도구로 캔버스를 읽기/쓰기/승인할 수 있다
- FR58: [Phase 4] 브라우저에서 승인 요청에 대해 [적용]/[거부]를 선택할 수 있다

### 온보딩 (Onboarding)

새 사용자가 CLI 토큰 검증 → 기본 조직 자동 생성 → 즉시 사용 가능.

- FR59: [Phase 2] 새 사용자가 CLI 토큰을 입력하면 유효성이 자동 검증된다
- FR60: [Phase 2] 첫 사용자가 "기본 AI 조직 만들기"를 원클릭으로 실행할 수 있다 (비서실장 + 기본 부서 자동 생성)
- FR61: [Phase 2] Admin이 회사 초기 설정(회사 정보 + Human + 부서 + 에이전트 + 도구)을 완료할 수 있다

### v1 호환 & 사용자 경험 (v1 Compat & UX)

v1에서 동작하던 기능을 유지하고, 기본적인 사용자 편의 기능을 제공한다.

- FR62: [Phase 유지] 사용자가 이전 대화 기록을 조회할 수 있다
- FR63: [Phase 유지] 에이전트가 동일 세션 내 이전 대화 맥락을 유지한다
- FR64: [Phase 유지] 에이전트가 작업 중 학습한 내용을 자동 저장하고 이후 활용한다 (autoLearn)
- FR65: [Phase 유지] 사용자가 파일(이미지/문서)을 첨부하여 에이전트에게 전달할 수 있다
- FR66: [Phase 2] 사용자가 진행 중인 에이전트 작업을 취소할 수 있다
- FR67: [Phase 2] 사용자가 에이전트 응답을 복사할 수 있다
- FR68: [Phase 2] 에이전트 응답이 마크다운(표/코드/리스트)으로 렌더링된다

### Phase 5+ 예약

- FR69: [Phase 5+] 사용자가 과거 대화를 키워드로 검색할 수 있다
- FR70: [Phase 5+] 사용자가 테마(다크/라이트)를 전환할 수 있다
- FR71: [Phase 5+] Admin이 감사 로그를 조회할 수 있다
- FR72: [Phase 5+] 사용자가 키보드만으로 허브의 핵심 기능을 사용할 수 있다

## Non-Functional Requirements

*NFR은 시스템이 "얼마나 잘" 동작해야 하는지를 정의한다. 해당되는 카테고리만 포함.*

### 성능 (Performance)

| ID | 요구사항 | 목표 | 측정 | 우선순위 | Phase |
|----|---------|------|------|---------|-------|
| NFR-P1 | 허브 초기 로드 | FCP ≤ 1.5초, LCP ≤ 2.5초 | Lighthouse | P1 | 1 |
| NFR-P2 | 관리자 콘솔 초기 로드 | FCP ≤ 2초 | Lighthouse | P1 | 2 |
| NFR-P3 | NEXUS 50+ 노드 렌더 | 60fps 유지 | Chrome DevTools | P1 | 3 |
| NFR-P4 | 번들 크기 | 허브 ≤ 300KB gzip, 관리자 ≤ 500KB gzip | Vite 빌드 | P1 | 1 |
| NFR-P5 | API 응답 시간 | 기존 P95 ±10% | Phase 1 전 주요 API 5개(`/agents/:id/chat`, `/agents`, `/admin/departments`, `/admin/agents`, `/ws/delegation`) 100회 P95 측정 베이스라인 | 🔴 P0 | 1 |
| NFR-P6 | call_agent 3단계 핸드오프 | E2E ≤ 60초 (각 단계 ≤ 15초) | 통합 테스트 타이머 | 🔴 P0 | 1 |
| NFR-P7 | call_agent 5단계 핸드오프 | E2E ≤ 90초, 메모리 ≤ 50MB | 벤치마크 | P2 | 1 |
| NFR-P8 | 세션 타임아웃 | query() 최대 120초. 초과 시 강제 종료 + 에러 | 타이머 | 🔴 P0 | 1 |
| NFR-P9 | WebSocket 재연결 | 끊김 후 ≤ 3초 자동 재연결 | 네트워크 테스트 | P1 | 1 |
| NFR-P10 | 트래커 이벤트 지연 | ≤ 100ms | 타임스탬프 측정 | P1 | 2 |
| NFR-P11 | 음성 브리핑 E2E | 생성 ≤ 3분, 전송 ≤ 30초, 총 ≤ 4분. 성공률 90%+ | E2E 테스트 | P2 | 4 |
| NFR-P12 | 한국 TTFB | ≤ 500ms (Cloudflare CDN 경유) | WebPageTest | P1 | 1 |

### 보안 (Security)

| ID | 요구사항 | 목표 | 우선순위 | Phase |
|----|---------|------|---------|-------|
| NFR-S1 | CLI 토큰 암호화 | AES-256, 복호화 키 환경변수 분리 | 🔴 P0 | 유지 |
| NFR-S2 | 토큰 메모리 노출 | query() 호출 후 토큰 변수 즉시 null 처리 | 🔴 P0 | 1 |
| NFR-S3 | 프로세스 격리 | Docker 네임스페이스 분리 + SDK 임시파일 `/tmp/{sessionId}/` | 🔴 P0 | 유지 |
| NFR-S4 | output-redactor | `sk-ant-cli-*`, `sk-ant-api-*`, OAuth Bearer 100% 마스킹 | 🔴 P0 | 1 |
| NFR-S5 | credential-scrubber | API 키 패턴 100% 필터 (10개 패턴 테스트) | 🔴 P0 | 1 |
| NFR-S6 | tool-permission-guard | 비허용 도구 100% 차단 (10건 테스트) | 🔴 P0 | 1 |
| NFR-S7 | cost-tracker 정확도 | 세션당 토큰/비용 오차 ≤ 1% | 🔴 P0 | 1 |

### 확장성 (Scalability)

| ID | 요구사항 | 목표 | 우선순위 | Phase |
|----|---------|------|---------|-------|
| NFR-SC1 | 동시 세션 | 최소 10개 동시 query(). 초과 시 429 | 🔴 P0 | 1 |
| NFR-SC2 | 세션 메모리 | query() 세션당 ≤ 50MB | 🔴 P0 | 1 |
| NFR-SC3 | 메모리 모니터링 | 80%+ 경고, 90%+ 신규 세션 거부 | P1 | 1 |
| NFR-SC4 | 에이전트 수 | 50명+ 조직에서 성능 저하 없음 | P1 | 3 |
| NFR-SC5 | SDK 호환 | 0.2.72 ~ 0.2.x 패치 자동 호환 | P1 | 1 |
| NFR-SC6 | graceful degradation | SDK 비정상 종료 시 에러 + 자동 재시도 1회 | 🔴 P0 | 1 |
| NFR-SC7 | 총 메모리 | pgvector HNSW 인덱스 포함 ≤ 3GB (Oracle VPS 4GB 기준) | P2 | 4 |

### 가용성 (Availability)

| ID | 요구사항 | 목표 | 우선순위 | Phase |
|----|---------|------|---------|-------|
| NFR-AV1 | 서비스 가동률 | 99% (월 ~7시간 다운타임 허용, 계획 배포 제외) | P1 | 1 |
| NFR-AV2 | 복구 시간 | 비계획 다운타임 30분 이내 복구 (Docker restart) | P1 | 1 |
| NFR-AV3 | DB 백업 | PostgreSQL 일일 자동 백업, 최소 7일 보관 | P1 | 1 |

### 접근성 (Accessibility)

| ID | 요구사항 | 목표 | 우선순위 | Phase |
|----|---------|------|---------|-------|
| NFR-A1 | WCAG | 2.1 AA (최소) | P1 | 1~4 |
| NFR-A2 | 색상 대비 | 4.5:1 이상 (텍스트), 3:1 이상 (UI) | P1 | 1 |
| NFR-A3 | 트래커 접근성 | aria-live="polite" 텍스트 업데이트 | P1 | 2 |
| NFR-A4 | 키보드 기본 | Tab 이동 + Enter 전송 (assistant-ui/React Flow 내장 활용) | P2 | 2 |

### 데이터 무결성 & 보존 (Data Integrity & Retention)

| ID | 요구사항 | 목표 | 우선순위 | Phase |
|----|---------|------|---------|-------|
| NFR-D1 | DB 마이그레이션 | enum→integer 전후 데이터 100% 보존 + 롤백 무손실 | P1 | 3 |
| NFR-D2 | 마이그레이션 무중단 | 온라인, 서비스 중단 0 | P1 | 3 |
| NFR-D3 | 벡터 생성 실패 | embedding = NULL 허용, 문서 저장은 진행 | P2 | 4 |
| NFR-D4 | 의미 검색 품질 | 키워드 대비 관련 문서 3건 중 1건+ 추가 발견 (10개 쿼리 A/B) | P2 | 4 |
| NFR-D5 | 대화 기록 보관 | 무제한 (사용자 수동 삭제 가능) | P1 | 유지 |
| NFR-D6 | 회사 삭제 | 해당 회사 모든 데이터 완전 삭제 | P1 | 2 |
| NFR-D7 | 비용 기록 보관 | 최소 12개월 | P1 | 1 |

### 외부 의존성 (External Dependencies)

| ID | 요구사항 | 목표 | 우선순위 | Phase |
|----|---------|------|---------|-------|
| NFR-EXT1 | Claude CLI 장애 | '서비스 일시 중단' 메시지를 허브에 표시 | 🔴 P0 | 1 |
| NFR-EXT2 | 부분 장애 격리 | 개별 외부 API 장애가 전체 시스템을 중단시키지 않음 | 🔴 P0 | 1 |
| NFR-EXT3 | API 타임아웃 | 외부 API 호출 기본 30초. 초과 시 에러 반환 | P1 | 1 |

### 운영 (Operations)

| ID | 요구사항 | 목표 | 우선순위 | Phase |
|----|---------|------|---------|-------|
| NFR-O1 | 배포 무중단 | Docker graceful shutdown → 신규 컨테이너 시작 | P1 | 유지 |
| NFR-O2 | 좀비 방지 | SDK 종료 후 cleanup. 좀비 크론잡 정리 | P1 | 1 |
| NFR-O3 | pgvector ARM64 | Phase 4 시작 전 Docker 내 빌드 검증 | P2 | 4 |
| NFR-O4 | 응답 품질 유지 | 10개 프롬프트(Phase 1 전 정의) A/B 블라인드. 평가자 2명 5점 척도. 평균 ≥ 기존 | 🔴 P0 | 1 |
| NFR-O5 | 비서 라우팅 정확도 | 10개 시나리오(Phase 2 전 정의). 8/10+ = 80%+ | P1 | 2 |
| NFR-O6 | Soul 반영률 | 3개 규칙 시나리오 × 10회 요청. 24/30+ = 80%+ | P1 | 2 |
| NFR-O7 | Admin 초기 설정 | ≤ 15분 (기본 Soul 템플릿 제공) | P1 | 2 |
| NFR-O8 | CEO NEXUS 첫 설계 | ≤ 10분 (튜토리얼 없이) | P1 | 3 |

### 비용 (Cost)

| ID | 요구사항 | 목표 | 우선순위 | Phase |
|----|---------|------|---------|-------|
| NFR-COST1 | 인프라 운영비 | CLI Max 외 월 $10 이하 (Oracle Free Tier + Cloudflare) | P1 | 1~4 |
| NFR-COST2 | Gemini Embedding | 월 $5 이하 (문서 1,000건 기준) | P2 | 4 |

### 로깅 (Logging)

| ID | 요구사항 | 목표 | 우선순위 | Phase |
|----|---------|------|---------|-------|
| NFR-LOG1 | 구조화 로그 | JSON 형식 (timestamp, level, sessionId, agentId, companyId) | P1 | 1 |
| NFR-LOG2 | 로그 보관 | 최소 30일 | P1 | 1 |
| NFR-LOG3 | 에러 알림 | 에러 발생 시 텔레그램 또는 관리자 콘솔 알림 | P2 | 2 |

### 브라우저 호환 (Browser Compatibility)

| ID | 요구사항 | 테스트 우선순위 |
|----|---------|-------------|
| NFR-B1 | Chrome 최신 2버전 | 🔴 P0 — 릴리스 게이트 |
| NFR-B2 | Safari 최신 2버전 | P1 — WebSocket/SSE 호환 확인 |
| NFR-B3 | Firefox/Edge 최신 2버전 | P2 — 보고되면 수정 |

### 코드 품질 (Architecture Constraint)

- NFR-CQ1: CLAUDE.md에 정의된 코딩 컨벤션(strict TypeScript, kebab-case 파일명, API 응답 형식) 및 배포 프로토콜(tsc --noEmit 필수)을 준수한다

### NFR 우선순위 요약

| 우선순위 | 개수 | 설명 |
|---------|------|------|
| 🔴 P0 | 19개 | Phase 1 릴리스 블로커. 미달성 시 배포 불가 |
| P1 | 28개 | Phase 2~3 목표. 미달성 시 품질 저하 |
| P2 | 14개 | Phase 4 + 데이터 수집. 점진적 개선 |
| **총** | **61개** | 12개 카테고리 |
