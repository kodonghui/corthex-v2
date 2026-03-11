# 도구 보고서 #4: MCP 서버 통합 가이드
> CORTHEX v2 직원(AI Agent)에 MCP 서버를 연결하는 방법
> 작성일: 2026-03-11 | BMAD 참고용

---

## 1. 개요

CORTHEX v2의 `engine/agent-loop.ts`에서 Claude Agent SDK의 MCP 서버 연동 기능을 활용하여, 외부 서비스 도구를 AI 직원에게 동적으로 제공하는 방법.

### PoC 검증 완료 (8/8 PASS)
- SDK의 `createSdkMcpServer()`로 MCP 서버 동적 연결 확인
- 런타임에 MCP 서버 추가/제거 가능

---

## 2. MCP 연결 아키텍처

### 2.1 연결 흐름

```
사용자 명령 → 허브(Hub) → agent-loop.ts
  → SessionContext 생성 (CLI 토큰, companyId 등)
  → 에이전트의 allowed_tools 확인
  → 해당 에이전트에 허용된 MCP 서버 목록 로드
  → SDK query() 실행 시 mcpServers 옵션으로 전달
  → LLM이 필요한 MCP 도구를 자연스럽게 호출
```

### 2.2 코드 패턴

```typescript
// engine/agent-loop.ts 내부 (Phase 1 구현)
import { query, createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk'

async function runAgent(ctx: SessionContext, agent: AgentConfig) {
  // 1. 에이전트에 허용된 MCP 서버 목록 조회
  const mcpConfigs = await getMcpServersForAgent(ctx.companyId, agent.id)

  // 2. MCP 서버 인스턴스 생성
  const mcpServers = mcpConfigs.map(config => ({
    name: config.name,
    transport: config.transport, // 'stdio' | 'sse' | 'http'
    command: config.command,
    args: config.args,
    env: config.env,
  }))

  // 3. SDK query() 실행
  const result = await query({
    model: selectModel(agent.tier),
    systemPrompt: renderSoul(agent, ctx),
    tools: getBuiltinTools(agent.allowedTools),
    mcpServers, // ← MCP 서버 동적 연결
    messages: ctx.messages,
  })
}
```

### 2.3 MCP 서버 설정 DB 스키마

```sql
CREATE TABLE mcp_server_configs (
  id SERIAL PRIMARY KEY,
  company_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,          -- 'notion', 'google-workspace', etc.
  display_name VARCHAR(200) NOT NULL,   -- '노션 연동', '구글 워크스페이스'
  transport VARCHAR(10) NOT NULL,       -- 'stdio', 'sse', 'http'
  command VARCHAR(500),                 -- 'npx', 'uvx', 'node'
  args JSONB DEFAULT '[]',             -- ['-y', '@notionhq/notion-mcp-server']
  env JSONB DEFAULT '{}',              -- { "NOTION_TOKEN": "{{credential:notion_token}}" }
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 에이전트-MCP 연결 테이블
CREATE TABLE agent_mcp_access (
  agent_id UUID REFERENCES agents(id),
  mcp_config_id INT REFERENCES mcp_server_configs(id),
  PRIMARY KEY (agent_id, mcp_config_id)
);
```

---

## 3. 추천 MCP 서버 (우선순위별)

### Tier 1: 즉시 도입 (Phase 1~2)

| MCP 서버 | Stars | 용도 | 설치 명령 | 비고 |
|----------|-------|------|----------|------|
| **Notion** (공식) | 4,000 | 보고서·문서 관리 | `npx -y @notionhq/notion-mcp-server` | 22개 도구 |
| **Playwright** (MS 공식) | 28,600 | 웹 자동화·스크래핑 | `npx -y @anthropic-ai/mcp-playwright` | 다음카페 자동화에 활용 |
| **GitHub** (공식) | 27,800 | 코드·이슈 관리 | `npx -y @modelcontextprotocol/server-github` | 개발팀 필수 |
| **Firecrawl** | 5,700 | 웹 크롤링 | `npx -y firecrawl-mcp` | 시장 조사·경쟁사 분석 |
| **Brave Search** | 공식 | 웹 검색 | `npx -y @anthropic-ai/mcp-brave-search` | search_web 대체/보완 |

### Tier 2: 중요 (Phase 2~3)

| MCP 서버 | Stars | 용도 | 설치 명령 | 비고 |
|----------|-------|------|----------|------|
| **Google Workspace** | 1,800 | Gmail·Drive·Calendar·Docs | `uvx workspace-mcp` | 50+ 도구, Python |
| **Telegram** | 779 | 텔레그램 봇 고급 기능 | `npx -y telegram-mcp` | 70+ 도구 |
| **Slack** | 1,400 | 팀 커뮤니케이션 | Docker 또는 npm | 15개 도구 |
| **NotebookLM** | 아키텍처 확정 | AI 학습·분석 | npm (확인 필요) | 29개 도구 |
| **Tavily** | 1,400 | 딥 리서치 검색 | `npx -y tavily-mcp` | 4개 도구 |

### Tier 3: 유용 (Phase 3~4)

| MCP 서버 | Stars | 용도 | 설치 명령 | 비고 |
|----------|-------|------|----------|------|
| **Exa** | 4,000 | 시맨틱 검색 | `npx -y exa-mcp-server` | AI 최적화 검색 |
| **Stripe** (공식) | 1,400 | 결제 관리 | `npx -y @stripe/mcp` | 결제 시스템 연동 시 |
| **Replicate** | 커뮤니티 | AI 이미지·영상 | 확인 필요 | 마케팅팀용 |
| **LINE** (공식) | 526 | LINE 메시징 | npm | 한국/일본 고객 대응 |
| **ElevenLabs** | 커뮤니티 | TTS | npm | 영상 나레이션 |
| **markdownify** | 커뮤니티 | 범용 문서→MD | npm | 문서 분석 |

### Tier 4: 한국 특화 (Phase 4+)

| MCP 서버 | Stars | 용도 | 비고 |
|----------|-------|------|------|
| **Naver MCP** | 114 | 네이버 검색·블로그·쇼핑 | 커뮤니티, 초기 단계 |
| **kimcp** | 6 | 카카오·다음·네이버 통합 | 매우 초기, 직접 개발 필요할 수 있음 |

### 메타 플랫폼 (하나로 여러 서비스)

| MCP 서버 | Stars | 특징 |
|----------|-------|------|
| **Activepieces** | 21,200 | 280+ 서비스를 MCP로 노출 |
| **Pipedream** | N/A | 2,500 API, 8,000+ 도구 |
| **FastAPI MCP** | 11,600 | 아무 FastAPI → MCP 변환 |

---

## 4. 설정 예시

### 4.1 Notion MCP 연결

```json
{
  "name": "notion",
  "display_name": "노션 연동",
  "transport": "stdio",
  "command": "npx",
  "args": ["-y", "@notionhq/notion-mcp-server"],
  "env": {
    "NOTION_TOKEN": "{{credential:notion_integration_token}}"
  }
}
```

**관리자 설정 과정:**
1. Notion에서 Internal Integration 생성
2. Integration Token 복사
3. CORTHEX 관리자 패널 → 크리덴셜 등록 → `notion_integration_token`
4. MCP 서버 설정에서 Notion 추가
5. 사용할 에이전트에 Notion MCP 접근 권한 부여

### 4.2 Google Workspace MCP 연결

```json
{
  "name": "google-workspace",
  "display_name": "구글 워크스페이스",
  "transport": "stdio",
  "command": "uvx",
  "args": ["workspace-mcp", "--tool-tier", "core"],
  "env": {
    "GOOGLE_CLIENT_ID": "{{credential:google_client_id}}",
    "GOOGLE_CLIENT_SECRET": "{{credential:google_client_secret}}",
    "GOOGLE_REFRESH_TOKEN": "{{credential:google_refresh_token}}"
  }
}
```

### 4.3 Playwright MCP 연결 (다음카페 자동화용)

```json
{
  "name": "playwright",
  "display_name": "웹 브라우저 자동화",
  "transport": "stdio",
  "command": "npx",
  "args": ["-y", "@anthropic-ai/mcp-playwright"],
  "env": {}
}
```

---

## 5. 보안 고려사항

### 5.1 크리덴셜 보안
- MCP 서버 env에 직접 토큰 노출 금지
- `{{credential:key_name}}` 패턴으로 DB에서 런타임 주입
- `@zapier/secret-scrubber` (아키텍처 확정)가 출력에서 토큰 필터링

### 5.2 에이전트별 접근 제어
- `agent_mcp_access` 테이블로 에이전트별 MCP 허용
- 워커 티어: MCP 접근 불가 (기본)
- 스페셜리스트: 부서 관련 MCP만 접근
- 매니저: 부서 내 모든 MCP 접근

### 5.3 Hook 파이프라인 적용
```
PreToolUse: tool-permission-guard
  → MCP 도구도 에이전트의 allowed_tools에 포함되어야 실행 가능
PostToolUse: credential-scrubber
  → MCP 도구 반환값에서 민감 정보 제거
PostToolUse: output-redactor
  → 회사별 금지어 필터링
```

---

## 6. 관리자 UI (Phase 2)

### MCP 관리 페이지 (`/admin/mcp-servers`)
- MCP 서버 목록 조회 (활성/비활성)
- MCP 서버 추가/수정/삭제
- 크리덴셜 연결
- 에이전트-MCP 접근 권한 매트릭스
- MCP 서버 연결 테스트 (ping/health)

### 에이전트 설정 페이지 (기존)
- 도구 탭에 MCP 서버 토글 추가
- "이 에이전트가 사용할 수 있는 MCP 서버" 체크리스트

---

## 7. 구현 우선순위

| 우선순위 | 항목 | Phase |
|---------|------|-------|
| P0 | MCP 연결 인프라 (agent-loop.ts) | Phase 1 |
| P0 | mcp_server_configs 테이블 | Phase 1 |
| P1 | Notion MCP 연동 | Phase 2 |
| P1 | Playwright MCP 연동 | Phase 2 |
| P1 | GitHub MCP 연동 | Phase 2 |
| P2 | Google Workspace MCP | Phase 2 |
| P2 | 관리자 MCP 관리 UI | Phase 2 |
| P3 | Telegram MCP (기존 대체) | Phase 3 |
| P3 | 한국 플랫폼 MCP | Phase 4+ |

---

## 8. BMAD 개발자 참고사항

### Phase 1 핵심 구현
1. `mcp_server_configs` 테이블 마이그레이션
2. `agent_mcp_access` 테이블 마이그레이션
3. `engine/agent-loop.ts`에 mcpServers 옵션 전달 로직
4. 크리덴셜 템플릿 치환 (`{{credential:key}}` → 실제 값)

### MCP vs 내장 도구 판단 기준
| 기준 | 내장 도구 (builtins) | MCP 서버 |
|------|---------------------|----------|
| 응답 속도 | 빠름 (동일 프로세스) | 느림 (IPC) |
| 커스터마이징 | 자유로움 | 제한적 |
| 유지보수 | 직접 관리 | 커뮤니티/공식 업데이트 |
| 설치 복잡도 | 코드만 | 별도 프로세스 관리 |
| **추천 용도** | 핵심 비즈니스 로직 | 외부 서비스 연동 |

### 테스트 케이스
- [ ] MCP 서버 동적 연결/해제
- [ ] 크리덴셜 템플릿 치환 정확성
- [ ] 에이전트별 MCP 접근 제어
- [ ] MCP 도구 실행 결과 credential-scrubber 통과
- [ ] MCP 서버 장애 시 graceful fallback
- [ ] 동시 10+ MCP 서버 연결 시 성능

---

## Sources
- [MCP Official Spec](https://github.com/modelcontextprotocol)
- [Notion MCP](https://github.com/makenotion/notion-mcp-server) - 4,000 stars
- [Playwright MCP](https://github.com/anthropics/mcp-playwright) - 28,600 stars (Microsoft)
- [GitHub MCP](https://github.com/modelcontextprotocol/servers) - 27,800 stars
- [Google Workspace MCP](https://github.com/taylorwilsdon/google_workspace_mcp) - 1,800 stars
- [Firecrawl MCP](https://github.com/mendableai/firecrawl-mcp) - 5,700 stars
- [Activepieces](https://github.com/activepieces/activepieces) - 21,200 stars
- [상세 MCP 조사 문서](./../mcp-servers-research-2025-2026.md)
