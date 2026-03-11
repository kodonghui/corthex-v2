# 01. OCR / PDF / 보고서 생성 도구 — CORTHEX v2 통합 가이드

> 작성일: 2026-03-11 | BMAD 참조용 기술 보고서

---

## 1. Claude Code의 OCR 기능 현황

### 결론: 별도 OCR 라이브러리 설치 불필요

Claude Code의 `Read` 도구가 이미지(PNG, JPG, GIF, WebP)와 PDF를 **네이티브로 읽고 해석**합니다.
전통적 OCR 엔진(Tesseract 등)이 아니라 **멀티모달 LLM 비전** 방식입니다.

| 기능 | 지원 여부 | 상세 |
|------|----------|------|
| 이미지 읽기 (PNG, JPG, GIF, WebP) | **Yes** | Read 도구로 파일 경로 지정 → 시각적 해석 |
| PDF 읽기 | **Yes** | 페이지당 이미지 변환 후 해석. 10p 이상은 `pages` 파라미터 필수, 요청당 최대 20p |
| 스캔 문서 텍스트 추출 | **사실상 Yes** | Claude Vision이 텍스트 추출 수행 |
| 필기(손글씨) 인식 | **가능** | 정확도는 필기 품질에 따라 다름 |
| 파일 크기 제한 | 32MB/요청 | API 기준 |
| 토큰 비용 | ~1,334 토큰/1000x1000px | 이미지 해상도에 비례 |

### CORTHEX v2 적용 방법

에이전트가 OCR이 필요한 경우 **별도 도구 불필요** — Claude SDK의 멀티모달 입력으로 처리:

```typescript
// agent-loop.ts 내에서 이미지/PDF를 메시지에 첨부
const message = {
  role: 'user',
  content: [
    { type: 'image', source: { type: 'base64', media_type: 'image/png', data: base64Data } },
    { type: 'text', text: '이 문서에서 텍스트를 추출해주세요' }
  ]
};
```

### 별도 OCR 도구가 필요한 경우 (대량 배치 처리)

| 도구 | 용도 | 설치 |
|------|------|------|
| `tesseract.js` (npm, ~35K stars) | 오프라인 OCR, 배치 처리, 한국어 지원 | `npm i tesseract.js` |
| PaddleOCR MCP | 고정밀 문서 OCR | MCP 서버로 연결 |

---

## 2. Markdown → PDF 변환

### Claude Code에는 내장 기능 없음. 외부 도구 필요.

### 추천 옵션 3가지

#### A. `md-to-pdf` (npm) — 가장 추천

| 항목 | 내용 |
|------|------|
| 패키지 | `md-to-pdf` v5.2.5 |
| GitHub | [simonhaenisch/md-to-pdf](https://github.com/simonhaenisch/md-to-pdf) (~1,400 stars) |
| 작동 원리 | Marked(MD→HTML) + Puppeteer(HTML→PDF) + highlight.js |
| 설치 | `npm i md-to-pdf` |
| 마지막 커밋 | 2025-11-19 (Active) |

**CLI 사용:**
```bash
npx md-to-pdf report.md
```

**API 사용 (CORTHEX 도구 핸들러에 통합):**
```typescript
import { mdToPdf } from 'md-to-pdf';

async function generatePdf(markdownContent: string, outputPath: string) {
  const result = await mdToPdf(
    { content: markdownContent },
    {
      stylesheet: ['./templates/report-style.css'],
      pdf_options: {
        format: 'A4',
        margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
        printBackground: true,
      },
      launch_options: { headless: true },
    }
  );
  fs.writeFileSync(outputPath, result.content);
  return outputPath;
}
```

**커스텀 CSS 예시 (회사 브랜딩):**
```css
/* templates/report-style.css */
body { font-family: 'Pretendard', sans-serif; color: #1e293b; }
h1 { color: #0f172a; border-bottom: 3px solid #3b82f6; padding-bottom: 8px; }
h2 { color: #1e40af; }
table { border-collapse: collapse; width: 100%; }
th { background: #1e293b; color: white; padding: 10px; }
td { border: 1px solid #e2e8f0; padding: 8px; }
code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
.header-logo { width: 120px; margin-bottom: 20px; }
.footer { text-align: center; font-size: 10px; color: #94a3b8; }
```

#### B. `markdown2pdf-mcp` (MCP 서버) — Claude Code에서 직접 사용

| 항목 | 내용 |
|------|------|
| GitHub | [2b3pro/markdown2pdf-mcp](https://github.com/2b3pro/markdown2pdf-mcp) |
| npm | `@99xio/markdown2pdf-mcp` |
| 특징 | 구문 강조, 커스텀 스타일, 페이지 번호, 워터마크 |

**설정 (claude_desktop_config.json):**
```json
{
  "mcpServers": {
    "markdown2pdf": {
      "command": "npx",
      "args": ["@99xio/markdown2pdf-mcp"]
    }
  }
}
```

#### C. Pandoc + Typst — 출판 수준 고품질

| 항목 | 내용 |
|------|------|
| GitHub | [jgm/pandoc](https://github.com/jgm/pandoc) (~42,500 stars) |
| 설치 | `choco install pandoc` (Windows) |
| 사용 | `pandoc input.md -o output.pdf --pdf-engine=typst` |
| 장점 | 학술/전문 수준 타이포그래피, 거의 모든 문서 포맷 상호 변환 |
| 단점 | Node.js 네이티브 아님, Typst 또는 LaTeX 설치 필요 |

### CORTHEX v2 도구 핸들러 설계

```
packages/server/src/lib/tool-handlers/builtins/
  └── generate-pdf.ts        ← 신규 도구 핸들러
```

```typescript
// generate-pdf.ts — tool handler 스켈레톤
import type { ToolHandler } from '../types';
import { mdToPdf } from 'md-to-pdf';

export const generatePdfHandler: ToolHandler = {
  name: 'generate_pdf',
  description: '마크다운 텍스트를 PDF 파일로 변환합니다',
  inputSchema: {
    type: 'object',
    properties: {
      markdown: { type: 'string', description: '변환할 마크다운 텍스트' },
      filename: { type: 'string', description: '출력 파일명 (예: report.pdf)' },
      template: { type: 'string', enum: ['default', 'formal', 'minimal'], description: '스타일 템플릿' },
    },
    required: ['markdown', 'filename'],
  },
  async execute(input, ctx) {
    const css = getTemplate(input.template || 'default');
    const result = await mdToPdf(
      { content: input.markdown },
      { stylesheet: [css], pdf_options: { format: 'A4', printBackground: true } }
    );
    // 파일 저장 경로는 companyId별 격리
    const outputPath = `storage/${ctx.companyId}/reports/${input.filename}`;
    await writeFile(outputPath, result.content);
    return { success: true, path: outputPath, size: result.content.length };
  },
};
```

---

## 3. 에이전트 보고서(.md) 생성 시스템

### A. 보고서 템플릿 표준

에이전트가 일관된 보고서를 생성하려면 **Soul 템플릿에 보고서 포맷을 포함**해야 합니다:

```markdown
## 보고서 포맷 규칙
모든 보고서는 아래 구조를 따릅니다:

### 필수 섹션
1. **요약 (Executive Summary)** — 3줄 이내 핵심 요약
2. **배경 (Background)** — 왜 이 작업을 했는지
3. **분석 (Analysis)** — 데이터, 표, 차트 포함
4. **결론 (Findings)** — 발견사항 번호 매기기
5. **권고사항 (Recommendations)** — 구체적 액션 아이템
6. **다음 단계 (Next Steps)** — 기한 포함

### 포맷 규칙
- 테이블은 최소 3열 이상
- 수치는 단위 명시 (원, %, 건 등)
- 모든 결론에 근거 데이터 링크
- "좋음/나쁨" 금지 → 구체적 수치로 표현
```

### B. 보고서 배포 경로 4가지

#### 1) Notion 연동

| 패키지 | 용도 | 설치 |
|--------|------|------|
| `@notionhq/client` (공식) | Notion API v2025 | `npm i @notionhq/client` |
| `notion-to-md` (~1,600 stars) | Notion → MD 변환 | `npm i notion-to-md` |
| `martian` (tryfabric) | MD → Notion 블록 변환 | `npm i @tryfabric/martian` |
| Notion MCP 서버 (공식) | Claude Code에서 직접 | `npm i @notionhq/notion-mcp-server` |

**도구 핸들러:**
```typescript
// publish-to-notion.ts
export const publishToNotionHandler: ToolHandler = {
  name: 'publish_to_notion',
  description: '보고서를 Notion 페이지로 발행합니다',
  inputSchema: {
    properties: {
      markdown: { type: 'string' },
      parentPageId: { type: 'string' },
      title: { type: 'string' },
    },
    required: ['markdown', 'title'],
  },
  async execute(input, ctx) {
    const notion = new Client({ auth: ctx.credentials.notionToken });
    const blocks = markdownToBlocks(input.markdown); // @tryfabric/martian
    const page = await notion.pages.create({
      parent: { page_id: input.parentPageId },
      properties: { title: [{ text: { content: input.title } }] },
      children: blocks,
    });
    return { success: true, url: page.url };
  },
};
```

#### 2) 이메일 발송

| 패키지 | 용도 | 설치 |
|--------|------|------|
| `nodemailer` | SMTP 이메일 전송 | `npm i nodemailer` |
| `nodemailer-markdown` | MD → HTML 이메일 자동 변환 | `npm i nodemailer-markdown` |
| Resend MCP 서버 | 현대적 이메일 API | MCP 연결 |

#### 3) NotebookLM 연동

- 보고서 .md → PDF 변환 후 NotebookLM에 업로드
- `notebooklm-mcp` (Phase 4 계획됨, 29개 도구)
- 오디오 브리핑 자동 생성 가능

#### 4) 웹 다운로드 (CORTHEX 앱 내)

```typescript
// routes/workspace/reports.ts
app.get('/api/workspace/reports/:id/download', async (c) => {
  const report = await getReport(c.req.param('id'));
  const pdf = await mdToPdf({ content: report.markdown });
  c.header('Content-Type', 'application/pdf');
  c.header('Content-Disposition', `attachment; filename="${report.title}.pdf"`);
  return c.body(pdf.content);
});
```

---

## 4. 역방향 도구: 문서 → 마크다운 변환

에이전트가 외부 문서를 읽어야 할 때:

| 도구 | 기능 | 설치 |
|------|------|------|
| `markdownify-mcp` (~2,400 stars) | PDF, 이미지, 오디오, 웹페이지 → MD | MCP 서버 |
| Microsoft `markitdown` | PDF, DOCX, PPTX, 이미지 → MD | `pip install markitdown` |
| `mcp-md-pdf` (Python) | MD → PDF + DOCX, .dotx 템플릿 지원 | `pip install mcp-md-pdf` |

---

## 5. CORTHEX v2 아키텍처 통합 설계

### 새로 만들어야 할 도구 핸들러

```
packages/server/src/lib/tool-handlers/builtins/
  ├── generate-pdf.ts          ← MD → PDF 변환
  ├── publish-to-notion.ts     ← Notion 페이지 발행
  ├── send-report-email.ts     ← 이메일로 보고서 발송
  └── markdown-converter.ts    ← 기존 (확장 필요)
```

### DB 스키마 (tool_definitions 시드)

```typescript
// seed 데이터
{
  name: 'generate_pdf',
  displayName: 'PDF 보고서 생성',
  description: '마크다운 보고서를 PDF로 변환합니다',
  category: 'report',
  handler: 'generate-pdf',
  inputSchema: { /* 위 스키마 */ },
  config: { templates: ['default', 'formal', 'minimal'] },
}
```

### 필요 패키지

```json
{
  "dependencies": {
    "md-to-pdf": "^5.2.5",
    "@notionhq/client": "^2.2.0",
    "@tryfabric/martian": "^1.2.0",
    "nodemailer": "^6.9.0"
  }
}
```

### Hook 연동

- **PreToolUse**: `generate_pdf` 호출 시 마크다운 입력 크기 제한 (100KB)
- **PostToolUse**: `credential-scrubber`가 보고서 내 민감정보 자동 마스킹
- **output-redactor**: API 키, 토큰 등 패턴 매칭 후 `[REDACTED]` 처리

---

## 6. 참고 소스

| 리소스 | URL |
|--------|-----|
| Claude Code Read 도구 (이미지/PDF) | Claude Code 시스템 프롬프트 내장 |
| md-to-pdf GitHub | https://github.com/simonhaenisch/md-to-pdf |
| markdown2pdf-mcp | https://github.com/2b3pro/markdown2pdf-mcp |
| Pandoc | https://github.com/jgm/pandoc |
| Notion 공식 SDK | https://www.npmjs.com/package/@notionhq/client |
| Notion MCP 서버 | https://github.com/makenotion/notion-mcp-server |
| martian (MD→Notion) | https://github.com/tryfabric/martian |
| markdownify-mcp | https://github.com/zcaceres/markdownify-mcp |
| Microsoft MarkItDown | https://github.com/microsoft/markitdown |
| nodemailer-markdown | https://github.com/andris9/nodemailer-markdown |
