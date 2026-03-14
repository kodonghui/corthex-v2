# 노코드 워크플로우 자동화 (n8n, Make, Zapier)

> 조사일: 2026-03-11

---

## 1. n8n — 셀프호스팅 무료, AI 네이티브, 가장 빠르게 성장

- **사이트**: https://n8n.io
- **GitHub Stars**: 100,000~160,000+ (2026년 기준 자동화 도구 중 최대)
- **핵심 기능**:
  - **셀프호스팅 무료** (무제한 실행, 무제한 워크플로우)
  - **AI 네이티브**: LangChain 내장, 70개 이상 AI 전용 노드
  - **AI Agent Builder**: AI 에이전트를 워크플로우로 구축
  - **AI Agent Tool Node**: 멀티에이전트 오케스트레이션
  - **실행 단위 과금**: 10단계 워크플로우도 1실행으로 카운트 (Zapier는 각 단계가 1태스크)
  - 1,200+ 앱 연동
  - 커뮤니티 템플릿 5,815개 AI 워크플로우, 8,732개 전체
  - JavaScript/Python 코드 노드 (커스텀 로직)
  - 웹훅, 크론, 이벤트 트리거
- **가격**:
  - Community: **무료** (셀프호스팅, 무제한)
  - Cloud Starter: €20/월 (2,500 실행)
  - Cloud Pro: €50/월 (10,000 실행)
  - Enterprise: €800/월
- **마케팅 워크플로우 예시**:

### 예시 1: 인스타 자동 포스팅
```
[Schedule Trigger] 매일 오전 9시
  ↓
[Google Sheets] 콘텐츠 캘린더에서 오늘 주제 가져오기
  ↓
[OpenAI] 주제 → 캡션 + 해시태그 생성
  ↓
[ContentDrips API] 캡션 → 이미지 자동 생성
  ↓
[Facebook Graph API] Instagram에 이미지+캡션 게시
  ↓
[Slack] 팀에 "오늘 인스타 게시 완료" 알림
```

### 예시 2: 4개 플랫폼 동시 콘텐츠 생성+게시
```
[Trigger] 새 블로그 글 발행
  ↓
[OpenAI] 블로그 → 인스타/페북/링크드인/X 각 플랫폼에 맞게 변환
  ↓
[분기] 각 플랫폼 API로 동시 게시
  ├→ [Instagram] 이미지+짧은 캡션
  ├→ [Facebook] 긴 글+링크
  ├→ [LinkedIn] 전문적 톤
  └→ [X] 280자 요약+해시태그
```

### 예시 3: 고객 리뷰 → 카드뉴스 자동 생성
```
[Google Forms] 고객 후기 수집
  ↓
[OpenAI] 후기 → 카드뉴스 텍스트 정제
  ↓
[Canva API] 카드뉴스 이미지 자동 생성
  ↓
[Google Drive] 생성된 이미지 저장
  ↓
[Slack] 마케팅팀에 "새 후기 카드뉴스 생성됨" 알림
```

- **CORTHEX 활용**: Oracle VPS에 셀프호스팅 → 무료로 무제한 자동화. CORTHEX AI 에이전트가 n8n 워크플로우 트리거 가능

---

## 2. Make (구 Integromat) — 비주얼 시나리오 빌더

- **사이트**: https://www.make.com
- **핵심 기능**:
  - **비주얼 시나리오 빌더**: 워크플로우를 그림처럼 그려서 만듦 (분기/루프/에러 핸들링 시각화)
  - **Make AI Agents**: 자율 실행 AI 에이전트
  - **Make Grid**: 엔터프라이즈 거버넌스 (누가 뭘 실행했는지 추적)
  - AI Assistant: 시나리오 빌딩, 매핑, 에러 관리 AI 도우미
  - 프롬프트 엔지니어링 인터페이스 내장
  - OpenAI/Claude/Google AI 통합
  - 2,000+ 앱 연동
  - Instagram 자동화 가이드 및 템플릿 제공
- **가격**:
  - Free: 1,000 operations/월
  - Core: $9/월 (10,000 ops)
  - Pro: $16/월
  - Teams: $29/월/블록
- **과금 방식**: Operations(오퍼레이션) 단위. 각 모듈 실행 = 1 operation
- **추천 이유**: n8n보다 쉽고 Zapier보다 저렴. 복잡한 분기 로직에 강함

---

## 3. Zapier — 8,000+ 앱, 비기술자 접근성 최고

- **사이트**: https://zapier.com
- **핵심 기능**:
  - **8,000+ 앱 연동** (가장 큰 앱 생태계)
  - **Zapier Agents**: 자율 실행 AI 에이전트 (동적 워크플로우 적응)
  - **Copilot**: 자연어로 자동화 생성 ("인스타에 올린 글을 슬랙에도 보내줘")
  - AI 필드: 감성분석, 요약, 분류 등 AI 기능을 워크플로우 내에서 사용
  - AI Actions: 외부에서 Zapier 자동화를 API로 호출
  - HubSpot/Salesforce/Mailchimp/GA 등 마케팅 스택 풀 연동
- **가격**:
  - Free: 100 tasks/월
  - Starter: $19.99/월 (750 tasks)
  - Professional: $49/월
  - Team: $69/월
- **과금 방식**: Tasks 단위. 각 액션 = 1 task (n8n 대비 비용 급증 가능)
- **추천 이유**: 설정이 가장 쉬움. 5분 만에 자동화 생성. 앱 연동 수 압도적

---

## 4. Flowise — 오픈소스 AI 워크플로우

- **사이트**: https://flowiseai.com
- **핵심 기능**:
  - 오픈소스 Node.js 기반
  - 3가지 비주얼 빌더: Assistant / Chatflow / Agentflow
  - LLM 체인/에이전트를 드래그앤드롭으로 구축
  - 멀티스레드 쿼리 처리
  - Workday가 인수 → HR/재무 유스케이스 통합 예정
- **가격**: 무료 (오픈소스, 셀프호스팅)
- **추천 이유**: AI 챗봇/에이전트를 빠르게 프로토타이핑

---

## 5. Langflow — Python 기반 AI 워크플로우

- **사이트**: https://langflow.org
- **핵심 기능**:
  - 오픈소스 Python 기반
  - **MCP 지원** (CORTHEX와 호환 가능)
  - 모든 LLM/벡터스토어 호환
  - 컴포넌트 소스코드 직접 수정 가능
  - LangChain 생태계 깊은 통합
- **가격**: 무료 (오픈소스) / DataStax 호스팅 버전 있음
- **추천 이유**: 연구/실험용. 커스터마이징 자유도 최고

---

## 3대 자동화 도구 비교

| 항목 | n8n | Make | Zapier |
|------|-----|------|--------|
| **무료 티어** | 셀프호스팅 무제한 | 1,000 ops/월 | 100 tasks/월 |
| **유료 시작** | €20/월 | $9/월 | $19.99/월 |
| **앱 연동 수** | 1,200+ | 2,000+ | 8,000+ |
| **AI 노드** | 70+ (LangChain 내장) | AI Assistant | AI Actions |
| **과금 방식** | 워크플로우 실행 단위 | 오퍼레이션 단위 | 태스크 단위 |
| **난이도** | 중급+ (개발자 친화) | 중급 | 초급 (가장 쉬움) |
| **셀프호스팅** | 가능 (무료) | 불가 | 불가 |
| **코드 노드** | JS + Python | 없음 | JS (제한적) |
| **GitHub Stars** | 100K+ | N/A | N/A |

### 비용 시뮬레이션: 월 1,000회 실행, 각 10단계 워크플로우

| 도구 | 계산 | 월 비용 |
|------|------|---------|
| **n8n (셀프호스팅)** | 1,000 실행 × 무료 | **$0** |
| **n8n (클라우드)** | 1,000 실행 (Starter 2,500 한도 내) | **€20** |
| **Make** | 1,000 × 10 = 10,000 ops (Core 한도) | **$9** |
| **Zapier** | 1,000 × 10 = 10,000 tasks (Professional) | **$49** |

→ n8n 셀프호스팅이 압도적으로 저렴. CORTHEX Oracle VPS에 설치 추천

---

## CORTHEX 추천: n8n 셀프호스팅

**이유**:
1. Oracle VPS에 이미 서버 운영 중 → n8n 추가 설치 무료
2. 무제한 워크플로우, 무제한 실행
3. AI 노드 70개+ 내장 (Claude/GPT 연동)
4. CORTHEX 에이전트가 n8n API 호출 → 워크플로우 자동 트리거 가능
5. 마케팅 자동화 템플릿 5,800개+ (커뮤니티)

**설치 명령** (Docker):
```bash
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -v n8n_data:/home/node/.n8n \
  n8nio/n8n
```

---

## CLI-Anything 통합 계획

> 추가일: 2026-03-14 | CLI-Anything (https://github.com/HKUDS/CLI-Anything) 적용 분석

### 개요

CLI-Anything는 GUI 소프트웨어의 코드베이스를 자동 분석해서 AI 에이전트가 사용할 수 있는 Python CLI + JSON 출력 인터페이스를 자동 생성하는 Claude Code 플러그인이다. GitHub 13,000+ Stars, 2026-03-08 출시, 활발한 개발 중.

### 적용 대상: n8n + Flowise + Langflow

| 도구 | GitHub | 언어 | CLI-Anything 적합도 | 이유 |
|------|--------|------|-------------------|------|
| **n8n** | n8n-io/n8n (100K+ stars) | TypeScript | ⭐⭐⭐ 높음 | 오픈소스, REST API 있으나 워크플로우 CRUD를 CLI로 단순화하면 에이전트가 "워크플로우 만들어서 실행해"를 한 줄로 처리 가능 |
| **Flowise** | FlowiseAI/Flowise (30K+ stars) | TypeScript | ⭐⭐ 중간 | 오픈소스, API 있으나 chatflow/agentflow 구성이 복잡 → CLI로 추상화하면 에이전트가 AI 워크플로우 빌딩 가능 |
| **Langflow** | langflow-ai/langflow (50K+ stars) | Python | ⭐⭐ 중간 | MCP 지원이 이미 있어서 CLI-Anything 필요성 낮음. 단, MCP 미사용 시 대안 |

### n8n × CLI-Anything 구체적 통합 설계

#### 1단계: CLI-Anything으로 n8n 래핑

```bash
# Claude Code에서 실행
/plugin marketplace add HKUDS/CLI-Anything
/plugin install cli-anything
/cli-anything https://github.com/n8n-io/n8n
```

CLI-Anything 7단계 파이프라인이 자동 실행:
1. **Phase 1 (분석)**: n8n TypeScript 소스 스캔, REST API 엔드포인트 파악, GUI 동작→API 매핑
2. **Phase 2 (설계)**: `workflow`, `execution`, `credential`, `node` 명령 그룹 설계
3. **Phase 3 (구현)**: Python Click CLI 생성 → n8n REST API를 subprocess/HTTP로 호출
4. **Phase 4-6 (테스트)**: 유닛 + E2E 테스트
5. **Phase 7 (패키징)**: `pip install cli-anything-n8n`

#### 2단계: 생성될 CLI 명령어 (예상)

```bash
# 워크플로우 관리
cli-anything-n8n workflow list --json
cli-anything-n8n workflow create --name "인스타 자동 포스팅" --template instagram-auto
cli-anything-n8n workflow activate --id 42
cli-anything-n8n workflow execute --id 42 --input '{"topic": "AI 트렌드"}'

# 실행 결과 조회
cli-anything-n8n execution list --workflow-id 42 --status success --json
cli-anything-n8n execution get --id 1234 --json

# 크리덴셜 관리
cli-anything-n8n credential list --json
cli-anything-n8n credential create --type openai --name "GPT-4" --data '{"apiKey":"sk-..."}'

# 노드 정보
cli-anything-n8n node list --category ai --json
```

#### 3단계: CORTHEX 에이전트 연동

```
CORTHEX 에이전트 → call_tool("execute_cli") → cli-anything-n8n → n8n REST API → 워크플로우 실행
```

**도구 등록:**
```typescript
// packages/server/src/lib/tool-handlers/builtins/n8n-workflow.ts
const n8nWorkflowSchema = z.object({
  action: z.enum(['list', 'create', 'execute', 'status']),
  workflow_id: z.number().optional(),
  workflow_name: z.string().optional(),
  input_data: z.record(z.unknown()).optional(),
})

// 내부적으로 cli-anything-n8n 호출 또는 n8n REST API 직접 호출
// CLI-Anything이 생성한 CLI 래퍼를 subprocess로 실행
```

**활용 시나리오:**
```
사용자: "매일 아침 9시에 인스타 자동 포스팅 워크플로우 만들어"
  ↓
마케팅 부서장 (CORTHEX 에이전트)
  ↓ call_tool("n8n_workflow", { action: "create", ... })
  ↓
cli-anything-n8n workflow create --name "인스타-일일-포스팅" --json
  ↓
n8n REST API: POST /api/v1/workflows
  ↓
결과: { "id": 42, "name": "인스타-일일-포스팅", "active": true }
```

### Flowise × CLI-Anything

```bash
/cli-anything https://github.com/FlowiseAI/Flowise
```

**생성될 CLI (예상):**
```bash
cli-anything-flowise chatflow list --json
cli-anything-flowise chatflow create --name "고객문의 RAG" --template rag-basic
cli-anything-flowise chatflow predict --id abc --question "반품 정책이 뭔가요?"
cli-anything-flowise agentflow create --name "리서치 에이전트" --tools search,web_browse
```

**CORTHEX 활용**: CORTHEX 에이전트가 Flowise에서 AI 챗봇/RAG를 자동으로 구성하고 테스트 가능.

### 설치 전제조건

| 항목 | 필요사항 |
|------|---------|
| n8n 서버 | Oracle VPS에 Docker로 설치 (이미 추천됨) |
| CLI-Anything | Claude Code 플러그인 설치 |
| Python 3.10+ | CLI 실행 환경 |
| 대상 소프트웨어 소스 | GitHub에서 클론 (자동) |

### 주의사항

1. **라이선스 미명시**: CLI-Anything 저장소에 LICENSE 파일 없음 → 상업적 사용 전 확인 필요
2. **출시 6일 신규 프로젝트**: 프로덕션 사용 전 충분한 검증 필요
3. **Python 래퍼**: CLI-Anything은 Python Click으로 생성 → CORTHEX(TypeScript)에서 subprocess 호출 또는 n8n REST API 직접 호출 병행
4. **n8n 자체 REST API 존재**: CLI-Anything 없이도 직접 REST API 호출 가능. CLI-Anything의 가치는 "AI가 이해하기 쉬운 JSON 구조로 래핑"하는 것
5. **레이스 컨디션 이슈(#51)**: 멀티 세션에서 상태 동기화 문제 보고됨 → 단일 에이전트 사용 시 문제 없음

### BMAD Epic 기획 시 참고

```
Epic: n8n 워크플로우 자동화 통합
  Story 1: n8n Docker 설치 + API 키 발급 (1SP)
  Story 2: CLI-Anything으로 n8n CLI 래퍼 생성 + 검증 (3SP)
  Story 3: n8n_workflow 도구 구현 (list/create/execute/status) (5SP)
  Story 4: 마케팅 워크플로우 템플릿 3개 생성 (3SP)
  Story 5: CORTHEX 마케팅 에이전트 Soul에 n8n 도구 연동 (2SP)
```

---

## 참고 출처
- https://n8n.io/pricing/
- https://n8n.io/workflows/categories/ai/
- https://genesysgrowth.com/blog/zapier-ai-vs-make-com-ai-vs-n8n-ai
- https://n8nblog.io/pricing-guide-2026-plans-features-costs/
- https://www.zignuts.com/blog/n8n-vs-zapier-2026-comparison
- https://sfailabs.com/guides/flowise-vs-langflow
- https://contentdrips.com/blog/2025/07/automate-instagram-posts-with-ai-openai-n8n-and-contentdrips-api/
