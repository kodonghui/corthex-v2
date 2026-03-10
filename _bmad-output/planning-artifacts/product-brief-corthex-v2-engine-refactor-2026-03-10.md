---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments:
  - _bmad-output/planning-artifacts/product-brief-corthex-v2-2026-03-07.md
  - _bmad-output/planning-artifacts/v1-feature-spec.md
  - _enhancement-plans/02-notebooklm-agent-integration.md
date: 2026-03-10
author: ubuntu
partyModeRounds: 5
decisions: 26
---

# Product Brief: CORTHEX v2 — 에이전트 엔진 리팩토링 + 지식 강화

## Executive Summary

CORTHEX v2의 에이전트 엔진은 현재 **모든 오케스트레이션 로직을 자체 구현**한 상태다. AgentRunner의 도구 루프, ChiefOfStaff의 위임 체인, ManagerDelegate의 병렬 실행, LLMRouter의 폴백/서킷브레이커, CIOOrchestrator의 3-Phase 패턴 — 이 모든 것이 `packages/server/src/services/` 안에 직접 짜여져 있다. 총 ~1,200줄의 오케스트레이션 코드 중 ~800줄(57%)이 Claude Agent SDK와 Gemini ADK가 이미 해결한 문제를 자체 구현한 것이다.

동시에 AI 업계에서 에이전트 SDK가 공식 출시되었다:
- **Claude Agent SDK** (`@anthropic-ai/claude-agent-sdk`): 자동 도구 루프, 서브에이전트, Hook 시스템, 세션/메모리, 비용 추적 내장
- **Gemini ADK** (`@google/adk`): SequentialAgent, ParallelAgent, LoopAgent 워크플로우 패턴, State prefix 체계

**핵심 전략**: "바퀴를 다시 발명하지 않는다." 검증된 SDK 패턴을 채택하여 인프라 코드를 삭제하고, CORTHEX 고유의 비즈니스 로직(동적 조직 관리, CLI 토큰 인증, N단계 계급, 비서 선택제, call_agent 위임)에만 집중한다.

**3대 축**:
1. **에이전트 엔진 리라이트**: 기존 서비스 파일 5개(~1,200줄) 삭제 → SDK 기반 새 엔진(~150줄)으로 교체
2. **조직 설계 혁신**: 품질게이트 제거, N단계 계급, 비서 선택제, NEXUS 조직 관리 UI
3. **지식 무기 강화**: NotebookLM MCP 연동(음성 브리핑, 마인드맵, 슬라이드) + pgvector 의미 검색

**기대 효과**:
- 오케스트레이션 코드 **~85% 삭제** (1,200줄 → ~150줄)
- 새 워크플로우 추가 시 **서비스 코드 수정 0** (에이전트 Soul + call_agent 도구로 해결)
- CEO가 웹 UI(NEXUS)에서 **드래그&드롭으로 AI 조직 설계** — 비서, 계급, 위임 관계 시각적 관리
- 에이전트가 문서를 **음성 브리핑으로 변환** → 텔레그램으로 CEO에게 전달

핵심 가치: **"전문가가 만든 검증된 코드 위에, 나만의 AI 조직을 자유롭게 설계한다."**

---

## Core Vision

### Problem Statement

CORTHEX v2의 에이전트 엔진에는 5가지 구조적 문제가 있다:

**1. 도구 루프 자체 구현** (`agent-runner.ts` ~300줄)
- `max 5회` 하드코딩된 반복, `tool_use` stop_reason 수동 체크, 도구 결과 수동 append
- Claude Agent SDK는 `query()` 한 줄로 대체. 도구 호출 횟수 제한(`maxTurns`), 비용 제한(`maxBudgetUsd`), 자동 컨텍스트 컴팩션까지 내장

**2. 오케스트레이션 하드코딩** (`chief-of-staff.ts` ~200줄, `manager-delegate.ts` ~250줄)
- "비서실장 → 매니저 → 전문가" 위임 체인이 `if/else`와 함수 호출로 고정
- CIOOrchestrator처럼 도메인별 전용 오케스트레이터가 증가하는 패턴
- 새로운 위임 패턴 추가 시 서비스 코드 직접 수정 필요

**3. 감사/보안 로직 산발** (여러 파일에 인라인)
- 도구 권한 체크(NFR14), 크레덴셜 스크러빙(NFR11), 출력 검열(FR55)이 AgentRunner 안에 인라인
- Claude Agent SDK Hook(`PreToolUse`, `PostToolUse`, `Stop`)으로 분리하면 관심사 분리 + 재사용성 확보

**4. 세션/메모리 수동 관리**
- 에이전트 메모리: `autoLearn` 플래그로 fire-and-forget 추출, 시스템 프롬프트에 수동 주입
- 대화 이력: 세션 간 컨텍스트 연속성 없음 (매 실행이 독립)
- 정보국 검색: Jaccard 키워드 매칭만 가능, "삼성전자 투자" 질문에 "반도체 시장 전망" 문서를 못 찾음

**5. 조직 설계 경직**
- 3계급 고정 (Manager/Specialist/Worker) — CEO가 4, 5단계 계급을 만들 수 없음
- 비서실장이 모든 Human에게 강제 — 비서 없이 직접 에이전트와 일하고 싶은 유저 대응 불가
- 품질 게이트(15/25점 통과제)가 응답 속도를 늦추고, 실제로 유용하지 않음
- NEXUS(캔버스)와 조직 관리가 혼합 — 기능 정체성이 불분명

### Problem Impact

| 영향 영역 | 현재 상태 | 리팩토링 후 |
|----------|----------|-----------|
| 새 워크플로우 추가 | 서비스 파일 신규 작성 (2~5일) | 에이전트 Soul 편집 + call_agent 도구 (0.5일) |
| 도구 루프 버그 수정 | AgentRunner 내부 디버깅 | SDK 업데이트로 자동 해결 |
| 감사 로그 추가 | 각 서비스에 인라인 코드 삽입 | Hook 1개 등록 (5줄) |
| 부서별 지식 검색 | 키워드만 매칭 | 의미 기반 벡터 검색 |
| 조직 설계 자유도 | 3계급 고정, 비서 강제 | N단계 계급, 비서 선택, NEXUS 시각적 편집 |
| CEO 브리핑 | 텍스트 보고서만 | 음성 브리핑 + 마인드맵 + 슬라이드 |
| 신규 개발자 온보딩 | 6개 서비스 파일 ~1,200줄 이해 필요 | SDK 문서 + CORTHEX 비즈니스 로직만 |
| 업스트림 개선 수혜 | 없음 (자체 코드) | SDK 버전 업그레이드로 자동 반영 |

### Why Existing Solutions Fall Short

| 접근법 | 장점 | CORTHEX에 부적합한 이유 |
|--------|------|----------------------|
| Claude Agent SDK 전면 도입 | 도구 루프, Hook, 세션 내장 | CLI 토큰 인증과의 호환성 확인 필요 (PoC 필수) |
| Gemini ADK 직접 도입 | Workflow Agent 패턴 우수 | TypeScript SDK 미성숙, Gemini 모델 종속 |
| LangGraph | 가장 성숙한 오픈소스 프레임워크 | Python 중심, Bun/TS 스택과 이질적 |
| 현재 코드 유지 | 리스크 없음, 동작함 | 5가지 문제 계속 누적, v2 비전(워크플로우 빌더) 구현 불가 |
| 전면 리라이트 (SDK 무관) | 자유도 최고 | "바퀴를 다시 발명"하는 것. 전문가 코드를 쓰지 않음 |

**결론**: SDK를 직접 사용하되, CORTHEX 고유 로직은 얇은 래퍼(thin wrapper) 안에서 관리하여 SDK 종속을 최소화한다. PoC로 호환성을 먼저 검증한다.

### Proposed Solution

**"CORTHEX Agent Engine v3"** — 3계층 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│  Layer 3: CORTHEX 비즈니스 레이어 (유지 + 강화)          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│  │CLI Token │ │ N-Tier   │ │ call_    │ │ Secretary  │ │
│  │  Auth    │ │ System   │ │ agent    │ │ Optional   │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘ │
│  CLI 토큰 인증, N단계 계급, call_agent 위임, 비서 선택제  │
├─────────────────────────────────────────────────────────┤
│  Layer 2: Hook 시스템 (Claude Agent SDK 패턴)            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│  │  Tool    │ │Credential│ │Delegation│ │   Cost     │ │
│  │Permission│ │ Scrubber │ │ Tracker  │ │  Tracker   │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘ │
│  도구 권한, 크레덴셜 필터, 위임 추적, 비용 기록           │
├─────────────────────────────────────────────────────────┤
│  Layer 1: SDK 실행 엔진 (얇은 래퍼)                      │
│  ┌──────────────────────────────────────────────────┐   │
│  │  engine/agent-loop.ts (~50줄)                    │   │
│  │  → SDK query() 호출 + CLI 토큰 주입              │   │
│  │  → 이 파일만 SDK에 직접 의존                      │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

#### 핵심 메커니즘: call_agent 도구

SDK 서브에이전트가 아닌, **도구(tool)로 에이전트 간 위임**을 구현한다:

```typescript
// call_agent 도구 — CORTHEX 에이전트 위임의 핵심
{
  name: "call_agent",
  description: "다른 에이전트에게 업무를 위임합니다",
  input: {
    agentId: "위임할 에이전트 ID",
    message: "업무 지시 내용",
    waitForResult: true
  }
}
```

**동작 흐름**:
```
비서실장의 Soul: "명령을 분석해서 적합한 에이전트에게 call_agent로 위임하세요"
비서실장의 시스템 프롬프트에 자동 주입:
  "사용 가능한 에이전트:
   - CIO (투자분석부 팀장): 투자, 주식, 시황 분석
   - CTO (기술부 팀장): 시스템, 개발, 인프라
   - CMO (마케팅부 팀장): SNS, 콘텐츠, 캠페인"

CEO: "삼성전자 분석해줘"
→ 비서실장 query() 실행
→ 비서실장이 tool_use: call_agent(CIO, "삼성전자 분석")
→ CIO query() 실행 (새 세션, 같은 CLI 토큰)
→ CIO가 tool_use: call_agent(종목분석가, "삼성전자 재무 분석")
         + call_agent(기술분석가, "삼성전자 기술적 분석") ← 병렬 가능
→ 전문가들 각각 query() 실행
→ 결과가 CIO에게 반환 → CIO가 종합
→ 결과가 비서실장에게 반환 → CEO 눈높이로 정리
→ CEO에게 최종 보고서 반환
```

**장점**:
- SDK 서브에이전트 기능에 의존하지 않음 (PoC 실패 시에도 동작)
- 에이전트 수에 제한 없음 (50명이든 100명이든)
- NEXUS의 조직도 = 실제 call_agent 호출 구조 (시각적 일치)
- 매니저 Soul에 "전문가 실패 시 나머지 결과로 종합" 지침 포함 → 에러 전파 처리

#### 비서 선택제

```
관리자가 Human 직원 생성 시:

┌──────────────────────────────────────────┐
│  👤 새 직원 생성                          │
│                                          │
│  이름: [김대표          ]                 │
│  역할: [CEO       ▾]                     │
│                                          │
│  🔑 CLI 토큰 (API 아님!)                  │
│  [sk-ant-cli-...              ] [검증]    │
│  ✅ 토큰 유효 (Claude Max 플랜)           │
│                                          │
│  🤖 비서 에이전트                          │
│  [✅] 비서 추가                           │
│  이름: [비서실장        ]  ← CEO 전용      │
│  모델: [Sonnet      ▾]                   │
│  Soul: [기본 비서 템플릿 ▾] [편집 ✏️]     │
│                                          │
│  📊 계급 구조                             │
│  Tier 1: [임원급    ] — [Opus   ▾]       │
│  Tier 2: [팀장급    ] — [Sonnet ▾]       │
│  Tier 3: [전문가급  ] — [Haiku  ▾]       │
│  Tier 4: [실무자급  ] — [Haiku  ▾]       │
│  [+ 계급 추가]                            │
│                                          │
│              [생성하기]                    │
└──────────────────────────────────────────┘
```

**비서 있는 사령관실**: 텍스트 입력 → 비서가 알아서 라우팅
**비서 없는 사령관실**: 에이전트 목록에서 직접 선택 → 텍스트 입력

#### 품질 게이트 대체

코드 기반 품질 게이트(15/25점 통과제)는 **삭제**한다. 대신:

- **매니저 계급 Soul 기본 템플릿**에 결과 검증 지침 포함:
  ```markdown
  ## 종합 시 필수 검증
  - 전문가 결과에 수치가 있으면 상호 교차 검증
  - 명백한 오류(시가총액 10배 차이 등) 발견 시 해당 전문가에게 재요청
  - 출처 불분명한 주장은 제외하고 종합
  - 전문가가 응답 실패하면 나머지 결과로 종합 후 "일부 데이터 누락" 명시
  ```
- **코드 기반 점수 시스템 → LLM 기반 자체 검증으로 전환**
- 에이전트가 맥락을 이해하고 검증하므로, 하드코딩된 규칙보다 유연

#### NEXUS / 스케치바이브 분리

| 항목 | NEXUS 탭 | 스케치바이브 탭 |
|------|----------|--------------|
| **역할** | AI 조직 관리 | Claude Code 개발 협업 |
| **접근** | 관리자 + 일반 유저 | 관리자 모드 전용 |
| **표현** | 노드 기반 조직도 | 자유 캔버스 |
| **기능** | 부서/에이전트/비서 CRUD, 계급/모델 설정, 위임 관계 시각화, 드래그&드롭 조직 재편 | 마인드맵, 와이어프레임, 플로우차트, MCP로 Claude Code 실시간 협업 |
| **MCP** | 불필요 | v1에서 이미 구현됨 |
| **라우트** | `/app/nexus` (유저), `/admin/nexus` (관리자) | `/admin/sketchvibe` |

**NEXUS 조직도 UI**:
```
  ┌─────┐
  │ 나  │ ← 유저 노드 (CLI 토큰 연결)
  │김대표│
  └──┬──┘
     │
  ┌──┴──┐
  │비서  │ ← 비서실장 (선택사항)
  │실장  │
  └──┬──┘
     ├────────────┬──────────┐
  ┌──┴──┐     ┌──┴──┐   ┌──┴──┐
  │ CIO │     │ CTO │   │ CMO │  ← Tier 2 팀장급
  └──┬──┘     └──┬──┘   └─────┘
     ├───┐       │
  ┌──┴┐┌┴──┐ ┌──┴──┐
  │분석││분석│ │개발 │  ← Tier 3 전문가급
  │가1 ││가2 │ │자  │
  └───┘└───┘ └─────┘
```

### Key Differentiators

1. **오케스트레이션 = AI 에이전트의 Soul**: 시장 유일. 다른 멀티에이전트 도구(CrewAI, LangGraph, AutoGPT)는 오케스트레이션이 코드에 고정되어 있다. CORTHEX는 비서의 Soul(프롬프트)이 곧 오케스트레이션 로직이다. 관리자가 웹 UI에서 Soul을 수정하면 라우팅 규칙이 바뀐다. 개발자 없이 오케스트레이션을 변경할 수 있는 유일한 시스템.

2. **N단계 계급으로 모델 비용 극한 최적화**: Tier 1(Opus, $15/M) → Tier 2(Sonnet, $3/M) → Tier 3(Haiku, $0.25/M) → Tier 4(Flash, $0.05/M) → Tier 5(Nano). CEO가 자유롭게 계급을 설계하고, 대부분의 작업을 저비용 Tier에서 처리. 기존 3계급 대비 비용 60%+ 추가 절감 가능.

3. **call_agent 도구 패턴**: SDK 서브에이전트에 종속되지 않는 CORTHEX 고유 위임 메커니즘. 에이전트를 다른 에이전트의 "도구"로 호출. NEXUS 조직도와 1:1 매핑. 에이전트 수 무제한, 중첩 위임 자연스럽게 동작.

4. **비서 선택제**: Human마다 비서를 붙일지 선택 가능. CEO의 비서는 "비서실장", 이과장의 비서는 "비서" 등 이름도 자유. 비서가 없으면 에이전트 직접 지목. 비서가 있으면 자연어로 명령하면 알아서 라우팅. 같은 시스템에서 두 가지 UX 공존.

5. **NEXUS 시각적 조직 관리**: 노드 기반 드래그&드롭으로 AI 조직을 설계. 비개발자(법학 전공 CEO)도 부서 생성, 에이전트 배치, 계급 설정, 위임 관계 연결을 시각적으로 수행. "AI 팀을 조직도처럼 설계하세요."

6. **NotebookLM 지식 무기**: 에이전트가 문서를 음성 브리핑(텔레그램으로 CEO에게 전송), 마인드맵(NEXUS 연동), 슬라이드, 인포그래픽으로 변환. MCP 연동(notebooklm-mcp-cli, 29개 도구)으로 즉시 사용 가능.

7. **얇은 래퍼 + SDK 독립성**: SDK를 직접 사용하되, `engine/agent-loop.ts` 한 파일에서만 SDK를 호출. 나머지 코드는 SDK에 무관. SDK를 교체하거나 업데이트할 때 한 파일만 수정. "전문가 코드를 쓰되, 종속되지 않는다."

---

## Target Users

### Primary Users

**페르소나 1: CEO 김대표 (1인 사업가 / 소규모 기업 대표)**
- 법학 전공, 비개발자. AI를 적극 활용하지만 코드를 만지지 않음
- NEXUS에서 드래그&드롭으로 AI 조직 설계. 비서실장에게 자연어로 명령
- 출퇴근길에 텔레그램으로 음성 브리핑 청취 (NotebookLM)
- 계급을 자유롭게 설계하여 비용 최적화
- 핵심 동기: "혼자지만 팀이 있는 것처럼 일한다"

**페르소나 2: 팀장 박과장 (중소기업 관리자)**
- 팀원 5~10명에게 AI 도구 제공. 표준화와 비용 통제가 관건
- 관리자 콘솔에서 팀원별 워크스페이스 + 도구 권한 설정
- 일부 팀원에게는 비서 제공, 일부에게는 직접 에이전트 지목 방식
- 핵심 동기: "AI를 팀 인프라로 만든다"

**페르소나 3: 투자자 이사장 (개인 투자자)**
- CIO 산하 전문가 4명이 병렬 분석 → CIO 종합 → VECTOR 자동매매
- 매일 아침 시황 음성 브리핑(NotebookLM) → 텔레그램 수신
- ARGOS 트리거로 급등/급락 자동 감지 → 긴급 분석
- 핵심 동기: "4명의 애널리스트를 고용한 효과"

### Secondary Users

- **관리자 (Admin)**: 스케치바이브에서 Claude Code와 개발 협업. 전체 조직/비용/권한 총괄
- **Human 직원 (Staff)**: 자기 워크스페이스에서 AI 조직 접근. NEXUS에서 자기 팀만 관리
- **외부 연동**: 텔레그램 봇, KIS 증권 API, Notion/Google 연동

---

## Technical Architecture

### 삭제 대상 (기존 서비스 파일)

| 파일 | 줄 수 (추정) | 이유 | 대체 |
|------|------------|------|------|
| `services/chief-of-staff.ts` | ~200 | 비서 Soul + call_agent로 대체 | 비서 에이전트의 Soul |
| `services/manager-delegate.ts` | ~250 | 매니저 Soul + call_agent로 대체 | 매니저 에이전트의 Soul |
| `services/agent-runner.ts` | ~300 | SDK query()로 대체 | engine/agent-loop.ts |
| `services/cio-orchestrator.ts` | ~300 | CIO Soul + call_agent로 대체 | CIO 에이전트의 Soul |
| `services/delegation-tracker.ts` | ~150 | Hook으로 대체 | engine/hooks/delegation-tracker.ts |

**유지 (리팩토링)**: `services/llm-router.ts` — 폴백/서킷브레이커/예산 체크는 SDK가 미지원. 모델 배정 로직만 간소화.

### 신규 파일

```
packages/server/src/
  engine/
    agent-loop.ts              (~50줄) SDK query() 래퍼 + CLI 토큰 주입
    hooks/
      tool-permission-guard.ts (~20줄) NFR14 도구 권한 체크
      credential-scrubber.ts   (~20줄) NFR11 크레덴셜 필터
      delegation-tracker.ts    (~30줄) 위임 이벤트 WebSocket 브로드캐스트
      cost-tracker.ts          (~20줄) 토큰/비용 기록
      output-redactor.ts       (~15줄) FR55 출력 검열
  tool-handlers/builtins/
    call-agent.ts              (~40줄) 에이전트 간 위임 도구
```

### DB 스키마 변경

**계급 유연화**:
```sql
-- agents 테이블 변경
ALTER TABLE agents ALTER COLUMN tier TYPE INTEGER USING
  CASE tier WHEN 'manager' THEN 2 WHEN 'specialist' THEN 3 WHEN 'worker' THEN 4 END;

-- 회사별 계급 설정 테이블 (신규)
CREATE TABLE tier_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  tier_level INTEGER NOT NULL,           -- 1, 2, 3, 4, ...
  name VARCHAR(50) NOT NULL,             -- '임원급', '팀장급', '전문가급', ...
  default_model VARCHAR(50) NOT NULL,    -- 'claude-opus-4', 'claude-sonnet-4', ...
  color VARCHAR(7) DEFAULT '#6B7280',    -- NEXUS 노드 색상
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(company_id, tier_level)
);
```

**비서 관련**:
```sql
-- agents 테이블에 비서 여부 + 소속 Human 추가
ALTER TABLE agents ADD COLUMN is_secretary BOOLEAN DEFAULT false;
ALTER TABLE agents ADD COLUMN owner_user_id UUID REFERENCES users(id);
-- owner_user_id: 이 에이전트를 "소유"하는 Human (CLI 토큰 주인)
```

**의미 검색 (pgvector)**:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE knowledge_docs ADD COLUMN embedding vector(768);
CREATE INDEX ON knowledge_docs USING ivfflat (embedding vector_cosine_ops);
```

### CLI 토큰 정책

| 시나리오 | 사용되는 토큰 |
|----------|-------------|
| CEO가 비서실장에게 명령 | CEO의 CLI 토큰 |
| 비서실장이 CIO에게 call_agent | **같은 CEO의 CLI 토큰** (위임 체인 내) |
| 이과장이 자기 에이전트에게 명령 | 이과장의 CLI 토큰 |
| CEO가 이과장의 에이전트를 사용 | **CEO의 CLI 토큰** (실행하는 사람 기준) |

**원칙**: 에이전트를 **실행하는 사람(명령을 내린 Human)의 CLI 토큰**을 사용. 비용이 명령을 내린 사람에게 귀속.

위임 체인(call_agent) 내에서는 최초 명령자의 토큰이 전파됨. 비서실장이 CIO에게 위임해도, CIO가 전문가에게 위임해도, 최초 CEO의 토큰으로 실행.

### NotebookLM 통합

**1순위**: Claude Agent SDK + MCP → `notebooklm-mcp-cli` (29개 도구 즉시 사용)
```bash
# 설치 한 줄
pip install notebooklm-mcp-cli && nlm setup add claude-code
```

**2순위 (폴백)**: Python 브릿지 → `notebooklm-py` (이미 설계 완료)
- 상세: `_enhancement-plans/02-notebooklm-agent-integration.md` 참조

**도구 6종**: notebook, audio_briefing, mindmap, slides, flashcards, infographic
- NotebookLM 도구는 Google OAuth 크레덴셜 등록 필수
- NEXUS에서 도구 할당 시 크레덴셜 미등록이면 경고 표시

**의미 검색**: pgvector + Gemini Embedding API (무료 티어)
- 기존 Jaccard 키워드 매칭 → 코사인 벡터 유사도로 교체
- `knowledge-injector.ts`의 `collectSimilarMemories()` ~50줄 수정
- NotebookLM과 독립적으로 진행 가능

### 위임 실시간 추적 (DelegationTracker 대체)

```typescript
// Hook으로 대체 — WebSocket 이벤트 형식은 기존과 호환 유지
const delegationTrackerHook: PostToolUseHook = {
  name: 'delegation-tracker',
  matcher: 'call_agent',
  handler: async (toolCall, result) => {
    eventBus.emit('delegation', {
      type: 'AGENT_DELEGATED',
      from: currentAgent.name,
      to: targetAgent.name,
      message: toolCall.input.message,
      timestamp: Date.now(),
    });
  }
};

const completionHook: StopHook = {
  name: 'completion-tracker',
  handler: async (result) => {
    eventBus.emit('delegation', {
      type: 'AGENT_COMPLETED',
      agent: currentAgent.name,
      duration: result.elapsed,
      cost: result.totalCostUsd,
    });
  }
};
```

---

## PoC (Proof of Concept) — 모든 결정의 전제조건

SDK 호환성을 확인하기 전에 아키텍처를 확정하면 안 된다. **PoC가 최우선.**

### PoC 체크리스트 (우선순위순)

**필수 (1개라도 FAIL → 전체 방향 변경)**:
1. Claude Agent SDK 설치 + 기본 `query()` 실행
2. 커스텀 Anthropic 클라이언트 주입 — "직원 A의 CLI 토큰으로 에이전트 B 실행" 패턴
3. 커스텀 도구 등록 — `call_agent` 패턴 시뮬레이션

**중요 (결과에 따라 세부 설계 조정)**:
4. Hook 등록 (PreToolUse, PostToolUse, Stop)
5. 비용 추적 (query당 토큰/비용 데이터 접근 가능한지)

**보너스 (있으면 좋지만 call_agent 패턴으로 대체 가능)**:
6. 서브에이전트 생성
7. 중첩 서브에이전트 (call_agent 패턴이면 불필요)
8. 서브에이전트 병렬 (Promise.allSettled로 대체 가능)
9. MCP 서버 연결 (NotebookLM 통합은 별도 Phase)

### PoC 판정 기준

| 결과 | 판정 | 다음 액션 |
|------|------|----------|
| 필수 3개 PASS | **SDK 채택 확정** | 클린룸 리라이트 시작 |
| 필수 중 1~2개 FAIL | **하이브리드** | SDK 일부 사용 + 자체 코드 보완 |
| 필수 전부 FAIL | **패턴 추출** | SDK 소스코드에서 패턴만 참고, 자체 엔진 구축 |

### PoC 두 트랙 (병렬 실행)

**트랙 A**: Claude Agent SDK 직접 사용 시도 → 성공하면 최선
**트랙 B**: SDK 소스코드를 읽고 핵심 패턴(agent-loop, hook-system) 추출 → 100~200줄 자체 구현 (보험, 반드시 성공)

소요 시간: **반나절 (4시간)**

---

## Implementation Phases

### Phase 0: PoC (1주)
- Claude Agent SDK + CLI 토큰 호환성 검증 (9개 테스트)
- PoC 결과에 따라 전체 방향 확정
- **산출물**: PoC 결과 보고서 + 아키텍처 최종 확정

### Phase 1: 에이전트 엔진 교체 (2주)
- `engine/agent-loop.ts` 작성 (SDK query() 래퍼)
- Hook 시스템 구현 (도구 권한, 크레덴셜, 위임 추적, 비용)
- `call_agent` 도구 구현
- `agent-runner.ts` → 새 엔진으로 교체
- 기존 오케스트레이션(chief-of-staff 등)은 **아직 유지** (안전망)
- **이것만으로도 "전문가 코드를 쓴다" 달성**

### Phase 2: 오케스트레이션 이동 (3주)
- 비서 선택제 구현 (DB + API + 관리자 UI)
- 비서 Soul 기본 템플릿 작성
- 매니저 Soul 기본 템플릿 작성 (결과 검증 지침 포함)
- 사령관실 UX 2종 (비서 있음/없음)
- `chief-of-staff.ts`, `manager-delegate.ts`, `cio-orchestrator.ts` 삭제
- NEXUS/스케치바이브 분리 (라우트 + 컴포넌트)

### Phase 3: 계급 유연화 (2주)
- `tier_configs` 테이블 + 마이그레이션
- agents.tier: enum → integer 변환
- NEXUS 조직도 UI (계급별 색상, 모델 배정)
- 관리자 콘솔: 계급 생성/편집 UI

### Phase 4: 정보국 강화 (2주, 독립적 — 아무 때나 진행 가능)
- pgvector 확장 설치 + knowledge_docs에 embedding 컬럼 추가
- Gemini Embedding API 연동 (문서 저장 시 벡터 자동 생성)
- `knowledge-injector.ts` 수정: Jaccard → 코사인 유사도
- NotebookLM MCP 연동 (SDK + MCP 또는 Python 브릿지)

### 각 Phase 완료 조건

| Phase | 완료 조건 |
|-------|----------|
| 0 | PoC 9개 테스트 완료 + 방향 확정 문서 작성 |
| 1 | 기존 테스트 전부 통과 + 새 엔진으로 명령 실행 성공 |
| 2 | 비서 있는 CEO + 비서 없는 직원 양쪽 사령관실 동작 |
| 3 | 4단계 이상 계급 생성 + 계급별 모델 자동 배정 동작 |
| 4 | "삼성전자 투자" 검색에 "반도체 시장 전망" 문서 반환 성공 |

---

## Success Metrics

### 엔진 리팩토링 지표

| 지표 | 목표 | 측정 |
|------|------|------|
| 오케스트레이션 코드 라인 수 | 1,200줄 → 150줄 이하 | `wc -l` |
| 새 워크플로우 추가 소요 시간 | 서비스 코드 0줄 수정 | 코드 리뷰 |
| SDK 업데이트 반영 | `agent-loop.ts` 1파일만 수정 | git diff |
| 기존 테스트 통과율 | 100% (regression 0) | CI |
| 평균 응답 시간 | 기존 대비 동등 또는 개선 | 서버 메트릭 |

### 사용자 경험 지표

| 지표 | 목표 | 측정 |
|------|------|------|
| NEXUS에서 조직 설계 소요 시간 | 첫 조직 5분 이내 | 유저 테스트 |
| 비서 유무 선택률 | 70% 비서 있음, 30% 비서 없음 | DB 집계 |
| N단계 계급 활용 | 50%+ 사용자가 4계급 이상 | DB 집계 |
| 음성 브리핑 청취율 | 투자 사용자의 60%+ | NotebookLM 호출 로그 |
| 의미 검색 히트율 | 키워드 대비 관련 문서 30%+ 추가 발견 | A/B 비교 |

### 비용 절감 지표

| 지표 | 목표 | 측정 |
|------|------|------|
| N단계 비용 절감 | 기존 3계급 대비 추가 40%+ 절감 | 비용 시뮬레이션 |
| Tier 4~5 작업 비율 | 전체 작업의 50%+ | 에이전트별 호출 로그 |
| NotebookLM 비용 | Google One AI Premium $20/월 이내 | Google 청구서 |
| Embedding API 비용 | $0 (무료 티어) | API 사용량 |

---

## Risk Assessment

| 리스크 | 확률 | 영향 | 대응 |
|--------|------|------|------|
| SDK + CLI 토큰 호환 불가 | 중 | 높음 | PoC 트랙 B (패턴 추출 자체 구현) |
| Soul 기반 오케스트레이션 품질 불안정 | 중 | 중 | 매니저 Soul 템플릿 반복 개선 + 에이전트 메타데이터 자동 주입 |
| NotebookLM MCP 불안정 (비공식) | 중 | 낮음 | Python 브릿지 폴백 (이미 설계 완료) |
| pgvector Oracle VPS 호환성 | 낮 | 중 | Docker 내 pgvector 확장 설치 확인 |
| SDK breaking change | 낮 | 중 | 얇은 래퍼 1파일만 수정 |
| N단계 계급 → 기존 코드 호환 | 중 | 중 | 마이그레이션 스크립트 + enum→integer 변환 테스트 |

---

## References

| 문서 | 경로 | 설명 |
|------|------|------|
| v1 Feature Spec | `_bmad-output/planning-artifacts/v1-feature-spec.md` | v1 22개 기능 상세 |
| 기존 Product Brief | `_bmad-output/planning-artifacts/product-brief-corthex-v2-2026-03-07.md` | v2 기존 비전 (동적 조직 관리) |
| NotebookLM 통합 계획 | `_enhancement-plans/02-notebooklm-agent-integration.md` | NotebookLM 6개 도구 + 부서별 활용 시나리오 |
| 에이전트 DB 스키마 | `packages/server/src/db/schema.ts` | agents, departments, tier 등 |
| 에이전트 실행 엔진 | `packages/server/src/services/agent-runner.ts` | 현재 도구 루프 구현 |
| 지식 주입 | `packages/server/src/services/knowledge-injector.ts` | 3계층 지식 시스템 |

---

## Party Mode 결정 기록

5라운드 파티 모드에서 확정된 26개 결정사항:

### 에이전트 엔진 (10개)
1. 품질 게이트 제거 → 매니저 Soul에 검증 지침
2. N단계 계급 → 정수 + tier_configs 테이블
3. 비서 선택제 → Human별 선택, CEO 비서 = "비서실장"
4. 기존 오케스트레이션 체인 전체 삭제 (5개 파일)
5. 오케스트레이션 = Soul + call_agent 도구
6. CLI 토큰 방식 유지 (API 아님!)
7. LLM Router 유지 (폴백/서킷브레이커/예산)
8. 얇은 래퍼 전략 (SDK 호출은 1파일에서만)
9. PoC 두 트랙 (SDK 직접 + 패턴 추출 보험)
10. Phase 분리 (0→1→2→3→4)

### NotebookLM 통합 (4개)
11. NotebookLM MCP 활용 (notebooklm-mcp-cli, 29도구)
12. 기존 설계 문서 유효 (02-notebooklm-agent-integration.md)
13. SDK + MCP 시너지 (PoC 테스트 9)
14. pgvector 의미 검색 (독립 진행 가능)

### NEXUS / 스케치바이브 (4개)
15. NEXUS = 조직 관리 (노드 기반 시각적)
16. 스케치바이브 = 개발 협업 (관리자 전용, MCP)
17. NEXUS 접근 권한 (관리자: 전체 / 유저: 자기 하위)
18. 스케치바이브 MCP (v1 구현 완료, UXUI만 개선)

### 최종 검증 추가사항 (8개)
19. 품질게이트 대체: 매니저 Soul 검증 지침 필수 포함
20. 계급 DB: 옵션 C (정수 + 회사별 tier_configs)
21. call_agent 도구 패턴 (SDK 서브에이전트 아닌 도구 기반)
22. PoC 우선순위: 필수 3개 → 중요 2개 → 보너스 4개
23. CLI 토큰 정책: 명령을 내린 Human의 토큰 사용, 위임 체인 내 전파
24. NotebookLM + 크레덴셜: Google OAuth 미등록 시 도구 할당 경고
25. 위임 실시간 추적: Hook으로 대체, WebSocket 이벤트 호환 유지
26. 에러 전파: call_agent 에러 반환 + 매니저 Soul 에러 대응 지침
