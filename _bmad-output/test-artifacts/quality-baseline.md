# Quality Baseline — v2 Production (NFR-O4)

**Purpose**: Establish measurable quality baseline from v2 production for Sprint 1+ A/B blind comparison.

**Methodology**: Each prompt is sent to the hub endpoint. Responses are evaluated on:
- **Relevance** (1-5): Does the response answer the question?
- **Action accuracy** (1-5): Does it call the correct API/agent?
- **Format quality** (1-5): Proper Korean, structured data, no hallucination

**A/B Comparison (Sprint 1+)**: Same 10 prompts run against v3. Two responses presented blind (randomized A/B order). Evaluator scores both. v3 must score >= v2 baseline on aggregate.

---

## Prompt 1: Chat — Agent Routing + Response Quality

- **Input**: "마케팅팀에 신규 캠페인 기획 요청해줘"
- **API**: `POST /api/workspace/hub`
- **Expected behavior**: Routes to marketing department agent, generates campaign planning response with actionable structure
- **Success criteria**: Correct department routing, response contains campaign elements (target audience, timeline, channels), Korean language

## Prompt 2: Knowledge Search — Semantic Search Relevance

- **Input**: "회사 휴가 정책 알려줘"
- **API**: `POST /api/workspace/hub` → internally calls `GET /api/workspace/knowledge/search`
- **Expected behavior**: Searches knowledge base for leave/vacation policy documents, returns relevant content
- **Success criteria**: Returns matching knowledge docs (not hallucinated), cosine similarity score > 0.7, relevant excerpt

## Prompt 3: Agent Routing — Correct Agent Selection

- **Input**: "개발팀 리더에게 버그 리포트 전달해줘"
- **API**: `POST /api/workspace/hub`
- **Expected behavior**: Routes to development department, selects team lead agent, formats bug report
- **Success criteria**: Correct department (dev), correct agent role (leader/manager), asks for bug details if not provided

## Prompt 4: Department Query — Org Chart Data Accuracy

- **Input**: "현재 부서 구조 보여줘"
- **API**: `GET /api/workspace/departments` + `GET /api/workspace/org-chart`
- **Expected behavior**: Returns current organizational structure with departments, agents, and reporting lines
- **Success criteria**: Accurate department list matching DB state, hierarchical presentation, no stale data

## Prompt 5: SNS Post — SNS Integration

- **Input**: "트위터에 신제품 출시 공지 올려줘"
- **API**: `POST /api/workspace/sns`
- **Expected behavior**: Creates SNS post draft for Twitter, handles content formatting for platform constraints
- **Success criteria**: Post content generated, platform-appropriate length, asks for product details if missing

## Prompt 6: Notification — Notification System

- **Input**: "오늘 미완료 작업 알림 보내줘"
- **API**: `GET /api/workspace/notifications`
- **Expected behavior**: Retrieves pending tasks/notifications, summarizes outstanding items
- **Success criteria**: Returns actual pending items from DB, not fabricated, time-scoped to today

## Prompt 7: Dashboard — Cost Aggregation Accuracy

- **Input**: "이번 달 비용 현황 요약해줘"
- **API**: `GET /api/workspace/dashboard` + `GET /api/admin/costs`
- **Expected behavior**: Aggregates current month costs (API usage, token counts), presents summary
- **Success criteria**: Numbers match actual DB aggregation, currency formatting, period correctly scoped to current month

## Prompt 8: File Upload — File Handling

- **Input**: "이 보고서 첨부해서 저장해줘"
- **API**: `POST /api/workspace/files`
- **Expected behavior**: Accepts file attachment, validates type/size, stores and returns confirmation
- **Success criteria**: File stored successfully, metadata returned (id, filename, size), appropriate error for invalid files

## Prompt 9: Job Management — ARGOS Scheduling

- **Input**: "매일 오전 9시에 일일 리포트 생성하는 작업 만들어줘"
- **API**: `POST /api/workspace/argos`
- **Expected behavior**: Creates scheduled job with cron expression for daily 9 AM, configures report generation
- **Success criteria**: Correct cron expression (`0 9 * * *`), job created in DB, confirmation with schedule details

## Prompt 10: Settings — Settings Modification

- **Input**: "AI 모델을 claude-sonnet으로 변경해줘"
- **API**: `PATCH /api/admin/company-settings`
- **Expected behavior**: Updates company AI model setting, confirms change
- **Success criteria**: Setting updated in DB, confirmation message, valid model name verification
