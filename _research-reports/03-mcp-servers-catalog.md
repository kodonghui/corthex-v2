# 03. MCP 서버 종합 카탈로그 — CORTHEX v2 에이전트용

> 작성일: 2026-03-11 | BMAD 참조용 기술 보고서

---

## 개요

MCP(Model Context Protocol) 서버 생태계에서 **66개 서버**를 8개 카테고리로 분류했습니다.
각 서버에 대해 설치법, 인증, CORTHEX v2 통합 방법을 기술합니다.

### 생태계 규모 (2026-03 기준)
- 공식 레포 (`modelcontextprotocol/servers`): **79,000+ GitHub stars**
- 전체 MCP 서버 수: **8,500+** (PulseMCP 기준)
- 큐레이션 리스트: `punkpeye/awesome-mcp-servers` (34 카테고리, 410개, 510K stars)

---

## CORTHEX v2 우선순위 분류

| 우선순위 | 서버 | Phase |
|---------|------|-------|
| **필수** | GitHub, Slack, Brave Search, PostgreSQL, Sequential Thinking, Memory | 1-2 |
| **높음** | Google Workspace, Notion, Firecrawl, Telegram, Playwright | 2-3 |
| **중간** | Stripe, Langfuse, Qdrant, Naver Search, SendGrid/Resend | 3-4 |
| **나중에** | MS 365, Salesforce, HubSpot, Docker, Kubernetes | 4+ |

---

## 1. Productivity & Office

### 1.1 Google Workspace MCP

| 항목 | 내용 |
|------|------|
| **GitHub** | [taylorwilsdon/google_workspace_mcp](https://github.com/taylorwilsdon/google_workspace_mcp) |
| **기능** | Gmail, Drive, Docs, Sheets, Calendar, Slides, Forms, Tasks, Chat, Contacts — 100+ 도구 |
| **인증** | OAuth 2.1 (멀티 유저 지원) |
| **전송** | stdio / SSE |
| **설치** | Python 기반: `pip install google-workspace-mcp` |

**Claude Code 설정:**
```json
{
  "mcpServers": {
    "google-workspace": {
      "command": "python",
      "args": ["-m", "google_workspace_mcp"],
      "env": {
        "GOOGLE_CLIENT_ID": "...",
        "GOOGLE_CLIENT_SECRET": "...",
        "GOOGLE_REDIRECT_URI": "..."
      }
    }
  }
}
```

**CORTHEX v2 통합**: 에이전트별 Google OAuth 토큰을 `credential_vault`에 저장 → `getDB(companyId)`로 조회 → MCP 서버 환경변수로 주입

---

### 1.2 Notion MCP (공식)

| 항목 | 내용 |
|------|------|
| **GitHub** | [makenotion/notion-mcp-server](https://github.com/makenotion/notion-mcp-server) |
| **npm** | `@notionhq/notion-mcp-server` |
| **기능** | Pages, databases, blocks CRUD |
| **인증** | Notion Internal Integration Token |

**설정:**
```json
{
  "mcpServers": {
    "notion": {
      "command": "npx",
      "args": ["@notionhq/notion-mcp-server"],
      "env": { "NOTION_TOKEN": "ntn_..." }
    }
  }
}
```

---

### 1.3 Slack MCP (공식)

| 항목 | 내용 |
|------|------|
| **문서** | [docs.slack.dev/ai/slack-mcp-server](https://docs.slack.dev/ai/slack-mcp-server/) |
| **기능** | 채널 검색, 메시지 전송, Real-time Search API |
| **인증** | Slack Bot Token (`xoxb-...`) |
| **발표** | 2026-02 |

---

### 1.4 Atlassian (Jira + Confluence)

| 버전 | GitHub | 특징 |
|------|--------|------|
| 공식 | [atlassian/atlassian-mcp-server](https://github.com/atlassian/atlassian-mcp-server) | Jira + Confluence + Compass, Rovo MCP |
| 커뮤니티 | [sooperset/mcp-atlassian](https://github.com/sooperset/mcp-atlassian) | Cloud & Data Center 모두 지원 |

---

### 1.5 MS 365 MCP

| 항목 | 내용 |
|------|------|
| **GitHub** | [Softeria/ms-365-mcp-server](https://github.com/Softeria/ms-365-mcp-server) |
| **기능** | Outlook Mail, Calendar, OneDrive, Teams (Graph API 기반) |
| **인증** | Azure AD OAuth |
| **공식 버전** | [microsoft/mcp](https://github.com/microsoft/mcp) — M365 Copilot 라이센스 필요 |

---

## 2. Development & DevOps

### 2.1 GitHub MCP (공식)

| 항목 | 내용 |
|------|------|
| **GitHub** | [github/github-mcp-server](https://github.com/github/github-mcp-server) |
| **기능** | Repos, issues, PRs, code search, actions, workflows 전체 |
| **인증** | GitHub Personal Access Token |

**설정:**
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "ghp_..." }
    }
  }
}
```

---

### 2.2 Playwright MCP (Microsoft 공식)

| 항목 | 내용 |
|------|------|
| **GitHub** | [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp) |
| **기능** | 브라우저 자동화, 접근성 스냅샷, Chrome/Firefox/WebKit |
| **인증** | 없음 (로컬 실행) |

**설정:**
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

**CORTHEX 활용**: Tistory, 다음카페 등 API 없는 플랫폼 자동화에 필수

---

### 2.3 PostgreSQL MCP

| 항목 | 내용 |
|------|------|
| **공식** | `@modelcontextprotocol/server-postgres` (archived) |
| **고급** | [call518/MCP-PostgreSQL-Ops](https://github.com/call518/MCP-PostgreSQL-Ops) — 30+ 도구 (PG 12~17) |
| **기능** | DB 탐색, 쿼리 실행, 스키마 관리 |

---

### 2.4 Cloudflare MCP (공식)

| 항목 | 내용 |
|------|------|
| **GitHub** | [cloudflare/mcp](https://github.com/cloudflare/mcp) |
| **기능** | Cloudflare API 전체 (2,500+ endpoints) — DNS, Workers, R2, Zero Trust |
| **인증** | Cloudflare API Token |

**CORTHEX 활용**: 배포 후 캐시 퍼지, Workers 관리 자동화

---

### 2.5 기타 DevOps

| 서버 | 기능 | 인증 |
|------|------|------|
| Docker MCP | 컨테이너/이미지 관리 | Docker Socket |
| Kubernetes MCP | 멀티 클러스터 K8s, ~50 도구 | kubeconfig |
| Sentry MCP | 에러 추적, 이슈 관리 | Sentry Auth Token |
| Git MCP | Git 레포 읽기/검색/조작 | 없음 (로컬) |
| Supabase MCP (공식) | DB + Auth + Storage | Supabase Key |

---

## 3. Communication

### 3.1 Telegram MCP

| 항목 | 내용 |
|------|------|
| **GitHub** | [sparfenyuk/mcp-telegram](https://github.com/sparfenyuk/mcp-telegram) |
| **기능** | MTProto 기반. 메시지 읽기/전송, 채널 관리 |
| **인증** | Telegram API ID + Hash |

**CORTHEX 활용**: 텔레그램 봇 = 허브 입력 채널 중 하나 (아키텍처 D1)

---

### 3.2 이메일

| 서버 | 기능 | 인증 |
|------|------|------|
| **SendGrid MCP** | 마케팅/트랜잭션 이메일, 캠페인 관리 | SendGrid API Key |
| **Resend MCP** (공식) | 이메일 전송 (single/batch), 도메인 검증 | Resend API Key |
| **AgentMail MCP** | AI 에이전트 전용 이메일 전송/수신 | AgentMail API Key |

---

### 3.3 기타

| 서버 | 기능 | 인증 |
|------|------|------|
| Discord MCP | 메시지 읽기/전송, 채널 관리 | Discord Bot Token |
| Twilio MCP | SMS 전송, 전화 관리 | Twilio SID + Auth Token |

---

## 4. Content & Media

### 4.1 Figma MCP (공식)

| 항목 | 내용 |
|------|------|
| **문서** | [figma.com/blog/introducing-figma-mcp-server](https://www.figma.com/blog/introducing-figma-mcp-server/) |
| **기능** | Dev Mode MCP — 디자인 파일 구조를 LLM에 직접 전달 |
| **인증** | Figma Access Token |

**CORTHEX에 이미 등록됨** (MEMORY.md 참조)

---

### 4.2 이미지 생성

| 서버 | 기능 | 인증 |
|------|------|------|
| **DALL-E MCP** | DALL-E 3 텍스트→이미지 | OpenAI API Key |
| **Replicate Flux MCP** | Flux 모델 이미지 생성 | Replicate API Token |

---

### 4.3 문서 처리

| 서버 | 기능 | 인증 |
|------|------|------|
| **markdown2pdf MCP** | MD → PDF (구문 강조, 커스텀 CSS, 워터마크) | 없음 |
| **md-mermaid-to-pdf MCP** | MD + Mermaid → PDF (다이어그램 포함) | 없음 |
| **markdownify MCP** (~2,400 stars) | PDF/이미지/오디오/웹 → MD (역방향) | 없음 |
| **Mermaid MCP** | 22+ 다이어그램 타입 생성 | 없음 |

---

### 4.4 프레젠테이션/영상

| 서버 | 기능 | 인증 |
|------|------|------|
| **2slides MCP** | 프레젠테이션/PPT 변환 | API Key |
| **DaVinci Resolve MCP** | 비디오 편집 자동화 | 없음 (로컬) |

---

## 5. Search & Data

### 5.1 웹 검색

| 서버 | 기능 | 인증 | 비용 |
|------|------|------|------|
| **Brave Search MCP** | Web, local, image, video, news 검색 | Brave API Key | 무료 티어 있음 |
| **Perplexity MCP** (공식) | Search-augmented AI | Perplexity API Key | 종량제 |
| **Tavily MCP** | 사실 기반 검색 + citation | Tavily API Key | 무료 티어 |
| **Exa AI MCP** | 시맨틱 검색 + neural understanding | Exa API Key | 종량제 |
| **MCP Omnisearch** | 통합: Tavily + Brave + Kagi + Perplexity + Jina + Exa | 다중 키 | 종량제 |

---

### 5.2 웹 크롤링/스크래핑

| 서버 | 기능 | 인증 |
|------|------|------|
| **Firecrawl MCP** (공식) | 동적 컨텐츠, proxies, anti-bot | Firecrawl API Key (무료 티어) |
| **Apify MCP** (공식) | 웹 스크래핑/자동화 플랫폼 | Apify API Token |

---

### 5.3 특수 데이터

| 서버 | 기능 | 인증 |
|------|------|------|
| **Context7** | 버전별 코드 문서를 프롬프트에 주입 | API Key |

---

## 6. File & Storage

| 서버 | 기능 | 인증 |
|------|------|------|
| **Filesystem MCP** (공식) | 안전한 파일 작업, 접근 제어 | 없음 (로컬 경로) |
| **S3 Documentation MCP** | S3 호환 스토리지(AWS, MinIO, R2) MD 문서 RAG | AWS Credentials |
| **Google Drive MCP** | Google Drive 파일 검색/읽기 | Google OAuth |

---

## 7. Finance & Business

### 7.1 결제/CRM

| 서버 | 기능 | 인증 | 비고 |
|------|------|------|------|
| **Stripe MCP** (공식) | 결제, 고객, 구독, 재무 데이터 전체 | Stripe API Key | docs.stripe.com/mcp |
| **HubSpot MCP** (공식) | CRM deep research | HubSpot API Key | 최초 대형 CRM MCP |
| **Salesforce MCP** (공식) | Opportunities, contacts, accounts | Salesforce OAuth | GA: 2026-02 |
| **Adfin MCP** (공식) | Payment + accounting | Adfin API Key | — |

### 7.2 금융 데이터

| 서버 | 기능 | 인증 |
|------|------|------|
| **Alpaca MCP** | 주식/옵션 트레이딩 API | Alpaca API Key |
| **AlphaVantage MCP** | 금융 마켓 데이터 (100+ APIs) | AlphaVantage Key |

---

## 8. AI & ML

### 8.1 추론/메모리

| 서버 | 기능 | 인증 |
|------|------|------|
| **Sequential Thinking MCP** (공식) | 동적/반영적 문제 해결, 단계별 분해 | 없음 |
| **Memory MCP** (공식) | Knowledge graph 기반 persistent memory | 없음 |

---

### 8.2 벡터 DB

| 서버 | 기능 | 인증 |
|------|------|------|
| **Qdrant MCP** (공식) | 시맨틱 검색 + 메모리 | Qdrant API Key |
| **Chroma MCP** (공식) | 시맨틱 문서 검색 + 메타데이터 필터 | 없음 (로컬) |
| **Pinecone MCP** | Pinecone vector DB 검색 | Pinecone API Key |
| **Vector MCP** (통합) | ChromaDB, MongoDB, Qdrant, PGVector 통합 | 다양 |

---

### 8.3 Observability

| 서버 | 기능 | 인증 |
|------|------|------|
| **Langfuse MCP** (공식) | AI observability, trace 데이터 접근 | Langfuse Keys |

---

## 9. 한국 전용 MCP 서버

| 서버 | 기능 | 인증 |
|------|------|------|
| **KiMCP** | 한국 API 통합 (Naver, Kakao 등) | 다양 |
| **Naver Search MCP** | Naver Search API 14개 도구 (블로그, 뉴스, 쇼핑) + DataLab 트렌드 | Naver API Key |
| **Naver Maps MCP** | Naver 지도 API | Naver Maps Key |
| **Naver Spell Checker MCP** | 한국어 맞춤법/문법 교정 | 없음 |
| **Kakao Navigation MCP** | 카카오 네비게이션, 경로 계획, 지오코딩 | Kakao API Key |
| **Kakao Mobility MCP** | 카카오 모빌리티 API | Kakao API Key |

**GitHub:**
- KiMCP: [zeikar/kimcp](https://github.com/zeikar/kimcp)
- Naver Search: [isnow890/naver-search-mcp](https://github.com/isnow890/naver-search-mcp)

---

## 10. CORTHEX v2 MCP 통합 아키텍처

### 현재 등록된 MCP
- Stitch (projectId `11938638885905518037`) — UI 디자인
- Figma (`mcp.figma.com/mcp`) — 디자인 동기화
- Subframe (projectId `fe1d14ed3033`) — 컴포넌트 라이브러리

### 에이전트별 MCP 할당 패턴

```typescript
// agent_mcp_configs 테이블 또는 agent.config JSONB
{
  agentId: 'marketing-publisher',
  mcpServers: [
    { name: 'playwright', config: { /* Tistory/다음카페 자동화 */ } },
    { name: 'brave-search', config: { apiKey: '{{vault:brave-api-key}}' } },
  ]
}
```

### MCP 서버 관리 방식

1. **글로벌 MCP**: 모든 에이전트가 사용 가능 (예: filesystem, sequential-thinking, memory)
2. **부서별 MCP**: 특정 부서에만 허용 (예: 마케팅부서 → Naver Search, 재무부서 → Stripe)
3. **에이전트별 MCP**: 개별 에이전트에만 할당 (예: 트레이딩 봇 → Alpaca)

### 보안 고려사항

- MCP 서버 인증 정보는 `credential_vault`에 저장 (AES-256-GCM 암호화)
- `tool-permission-guard.ts` Hook에서 MCP 도구 접근도 검증
- `credential-scrubber.ts`가 MCP 응답에서 민감정보 자동 마스킹
- MCP 서버별 rate limit: `mcp-rate-limit.ts` 활용

---

## 11. 참고 소스

| 리소스 | URL |
|--------|-----|
| MCP 공식 서버 레포 | https://github.com/modelcontextprotocol/servers |
| awesome-mcp-servers | https://github.com/punkpeye/awesome-mcp-servers |
| PulseMCP 디렉토리 | https://www.pulsemcp.com/servers |
| MCP Awesome | https://mcp-awesome.com/ |
| FastMCP 인기 서버 | https://fastmcp.me/blog/top-10-most-popular-mcp-servers |
