# 도구 보고서 #1: OCR + PDF 변환 도구
> CORTHEX v2 직원(AI Agent)용 도구 통합 가이드
> 작성일: 2026-03-11 | BMAD 참고용

---

## 1. 개요

CORTHEX v2 직원(AI Agent)이 다음을 수행할 수 있도록 하는 도구 세트:
- **이미지/스캔 문서 → 텍스트 추출** (OCR)
- **Markdown → PDF 변환** (보고서 산출)
- **PDF → Markdown 변환** (문서 분석)

---

## 2. Claude Code의 기본 OCR/PDF 능력

### 2.1 이미지 읽기 (내장)
Claude 모델(Opus 4.x, Sonnet 4.x)은 **멀티모달**이므로 이미지를 직접 읽을 수 있음:
- Claude Code CLI의 Read 도구로 이미지 파일(.png, .jpg) 직접 읽기 가능
- 차트, 다이어그램, 스크린샷 해석 가능
- 손글씨 인식도 가능 (정확도는 필기 품질에 따라 다름)

### 2.2 PDF 읽기 (내장)
- Claude Code의 Read 도구로 `.pdf` 파일 직접 읽기 가능 (20페이지/요청)
- 내부적으로 각 페이지를 고해상도 이미지로 **래스터화** 후 OCR 수행
- 디지털 PDF: 텍스트 레이어 직접 추출 + 레이아웃 시각 분석 ("이중 모달 추론")
- 스캔 PDF: 고급 OCR로 텍스트 추출

### 2.3 한계
- **PDF → Markdown 자동 변환**: 내장 기능 없음 (별도 도구 필요)
- **Markdown → PDF 변환**: 내장 기능 없음 (별도 도구 필요)
- **대용량 PDF** (100+ 페이지): 20페이지 단위로 나눠서 읽어야 함
- **이미지 생성**: Claude Code는 이미지를 **만들 수** 없음 (읽기만 가능)

---

## 3. CORTHEX v2에 붙일 도구들

### 3.1 OCR 도구: `ocr_document`

#### 선택지 A: Claude Vision 직접 활용 (추천)
- Claude API의 vision 기능을 직접 tool handler에서 호출
- 별도 패키지 불필요, CLI 토큰으로 바로 사용
- 한국어/영어/일본어 모두 지원

```typescript
// packages/server/src/lib/tool-handlers/builtins/ocr-document.ts
import { z } from 'zod'
import type { ToolRegistration, ToolExecContext } from '../types'

const ocrDocumentSchema = z.object({
  file_path: z.string().describe('OCR할 이미지/PDF 파일 경로'),
  language: z.enum(['ko', 'en', 'ja', 'auto']).default('auto'),
  output_format: z.enum(['text', 'markdown', 'json']).default('markdown'),
})

export const ocrDocument: ToolRegistration = {
  name: 'ocr_document',
  description: '이미지나 스캔된 문서에서 텍스트를 추출합니다. 한국어/영어/일본어 지원.',
  category: 'productivity',
  parameters: ocrDocumentSchema,
  execute: async (params, ctx) => {
    const parsed = ocrDocumentSchema.parse(params)
    // 1. 파일 읽기 (이미지 → base64)
    // 2. Claude Vision API 호출 (ctx의 CLI 토큰 사용)
    // 3. 결과를 parsed.output_format으로 반환
    // 구현은 agent-loop.ts의 SDK query()를 활용
  }
}
```

#### 선택지 B: Mistral OCR API (고정밀 대량 처리)
- **패키지**: `@mistralai/mistralai` (npm)
- **강점**: 대량 PDF 배치 처리, 테이블/수식 인식 우수
- **가격**: $1/1,000페이지
- **MCP 서버**: `mcp-pdf2md` (GitHub: zicez/mcp-pdf2md)
- **용도**: 100+ 페이지 문서를 한번에 변환해야 할 때

#### 선택지 C: DeepSeek-OCR (무료/로컬)
- Simon Willison이 Claude Code로 돌린 사례 확인됨
- NVIDIA GPU 필요 → 현재 인프라(Oracle ARM64)에서 부적합
- **결론: 제외**

**추천**: 선택지 A를 기본으로, 대량 처리 필요 시 선택지 B 추가

---

### 3.2 Markdown → PDF 변환 도구: `md_to_pdf`

#### 선택지 A: `md-to-pdf` npm 패키지 (추천)
| 항목 | 상세 |
|------|------|
| **패키지** | `md-to-pdf` |
| **GitHub** | [simonhaenisch/md-to-pdf](https://github.com/simonhaenisch/md-to-pdf) |
| **Stars** | 1,200+ |
| **버전** | 5.x |
| **원리** | Marked (MD→HTML) + Puppeteer (HTML→PDF) |
| **특징** | CSS 커스텀 스타일, 코드 하이라이팅, 헤더/푸터, 페이지 번호 |
| **설치** | `bun add md-to-pdf` |
| **의존성** | Chromium (Puppeteer가 자동 다운로드) |

```typescript
// packages/server/src/lib/tool-handlers/builtins/md-to-pdf.ts
import { z } from 'zod'
import { mdToPdf } from 'md-to-pdf'

const mdToPdfSchema = z.object({
  markdown_content: z.string().describe('변환할 마크다운 내용'),
  title: z.string().describe('PDF 제목 (파일명에 사용)'),
  style: z.enum(['default', 'corporate', 'minimal']).default('corporate'),
})

export const markdownToPdf: ToolRegistration = {
  name: 'md_to_pdf',
  description: '마크다운 문서를 PDF 파일로 변환합니다. 보고서 산출용.',
  category: 'productivity',
  parameters: mdToPdfSchema,
  execute: async (params, ctx) => {
    const parsed = mdToPdfSchema.parse(params)

    // CSS 스타일 프리셋
    const styles = {
      corporate: `
        body { font-family: 'Pretendard', sans-serif; line-height: 1.8; color: #1e293b; }
        h1 { color: #0f172a; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; }
        h2 { color: #1e40af; }
        table { border-collapse: collapse; width: 100%; }
        th { background: #f1f5f9; }
        td, th { border: 1px solid #e2e8f0; padding: 8px 12px; }
        code { background: #f8fafc; padding: 2px 6px; border-radius: 4px; }
      `,
      minimal: `body { font-family: system-ui; line-height: 1.6; max-width: 800px; margin: auto; }`,
      default: '',
    }

    const pdf = await mdToPdf({
      content: parsed.markdown_content,
    }, {
      css: styles[parsed.style],
      pdf_options: {
        format: 'A4',
        margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
        printBackground: true,
      },
    })

    // pdf.content = Buffer → 파일 저장 or S3 업로드
    const filePath = `/tmp/reports/${parsed.title}.pdf`
    await Bun.write(filePath, pdf.content)

    return JSON.stringify({ success: true, data: { path: filePath, size: pdf.content.length } })
  }
}
```

#### 선택지 B: MCP 서버 활용
| 항목 | 상세 |
|------|------|
| **이름** | markdown2pdf-mcp |
| **GitHub** | [2b3pro/markdown2pdf-mcp](https://github.com/2b3pro/markdown2pdf-mcp) |
| **기능** | MD→PDF 변환, 코드 하이라이팅, 워터마크, 페이지 번호 |
| **장점** | MCP 프로토콜로 바로 연결 가능 |
| **단점** | 별도 프로세스 관리 필요 |

#### 선택지 C: Pandoc (고급 문서)
- 수식, 참조, 목차 등 학술 문서에 적합
- LaTeX 엔진 필요 → 서버 사이즈 증가
- **결론**: 현재 불필요, Phase 5+ 검토

**추천**: 선택지 A (`md-to-pdf`) 기본 채택. MCP 연동은 Phase 2+에서 선택적.

---

### 3.3 PDF → Markdown 변환 도구: `pdf_to_md`

#### 선택지 A: MarkItDown (Microsoft 공식)
| 항목 | 상세 |
|------|------|
| **패키지** | `markitdown` (PyPI) / MCP 서버 있음 |
| **제공** | Microsoft (공식) |
| **지원 포맷** | PDF, Word, PowerPoint, Excel, 이미지, 오디오, HTML, ZIP |
| **MCP** | `markitdown-mcp` (PulseMCP에 등록) |
| **특징** | 가장 범용적. 거의 모든 문서를 Markdown으로 변환 |

#### 선택지 B: `markdownify-mcp`
| 항목 | 상세 |
|------|------|
| **GitHub** | [zcaceres/markdownify-mcp](https://github.com/zcaceres/markdownify-mcp) |
| **기능** | "거의 모든 것"을 Markdown으로 변환 |
| **지원** | PDF, 이미지, 웹페이지, DOCX, XLSX, PPTX, 오디오 |

**추천**: MarkItDown MCP → 가장 넓은 포맷 커버리지

---

## 4. CORTHEX v2 아키텍처 통합 방안

### 4.1 도구 등록 위치
```
packages/server/src/lib/tool-handlers/builtins/
  ├── ocr-document.ts       # OCR (Claude Vision 활용)
  ├── md-to-pdf.ts          # MD → PDF 변환
  └── pdf-to-md.ts          # PDF → MD 변환
```

### 4.2 MCP 서버 연동 (Phase 2+)
```json
// claude_desktop_config.json 또는 동적 MCP 연결
{
  "mcpServers": {
    "markitdown": {
      "command": "uvx",
      "args": ["markitdown-mcp"]
    },
    "markdown2pdf": {
      "command": "npx",
      "args": ["-y", "markdown2pdf-mcp"]
    }
  }
}
```

### 4.3 실행 흐름

```
사용자 → "이 스캔 문서 분석해줘" → 허브(Hub)
  → agent-loop.ts → 에이전트 실행
    → ocr_document 도구 호출
      → Claude Vision API (CLI 토큰)
      → 텍스트 추출 결과 반환
    → 에이전트가 분석 결과를 마크다운으로 작성
    → md_to_pdf 도구 호출
      → PDF 생성 → 파일 경로 반환
  → 사용자에게 "보고서.pdf" 링크 제공
```

### 4.4 필요한 패키지 추가
```bash
# 서버 패키지에 추가
cd packages/server
bun add md-to-pdf
# Puppeteer는 md-to-pdf 의존성으로 자동 설치

# Dockerfile 업데이트 필요!
# Chromium 의존성 추가 (Puppeteer용)
```

### 4.5 Dockerfile 변경 사항
```dockerfile
# Puppeteer를 위한 Chromium 설치 (ARM64 호환)
RUN apt-get update && apt-get install -y \
  chromium \
  fonts-noto-cjk \
  --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
```

---

## 5. 비용 분석

| 도구 | 비용 | 비고 |
|------|------|------|
| OCR (Claude Vision) | CLI 토큰 소모 | 이미지 1장 ≈ 0.01~0.05 USD |
| md-to-pdf | 무료 (MIT) | Chromium 메모리 ~200MB |
| MarkItDown MCP | 무료 (MIT) | Python 런타임 필요 |
| Mistral OCR (선택) | $1/1,000페이지 | 대량 처리 시에만 |

---

## 6. BMAD 개발자 참고사항

### Phase 1에서 구현할 것
1. `ocr_document` 도구 (Claude Vision 기반)
2. `md_to_pdf` 도구 (md-to-pdf 패키지)
3. `pdf_to_md` 도구 (MarkItDown MCP 연동)

### 도구 핸들러 패턴 준수
- Zod 스키마 필수
- `ctx.getCredentials()` 사용 (하드코딩 금지)
- 반환값: `{ success: true, data: {...} }` 형식
- 결과 최대 4,000자 (자동 잘림)

### 테스트 케이스
- [ ] 한국어 스캔 문서 OCR 정확도
- [ ] 테이블이 포함된 PDF → MD 변환 품질
- [ ] 마크다운 보고서 → PDF 스타일 적용
- [ ] 대용량 PDF (50+ 페이지) 처리 시간
- [ ] Chromium 메모리 누수 확인 (장기 실행)

---

## Sources
- [Claude PDF Support](https://platform.claude.com/docs/en/build-with-claude/pdf-support)
- [Claude Vision for Document Analysis](https://getstream.io/blog/anthropic-claude-visual-reasoning/)
- [md-to-pdf GitHub](https://github.com/simonhaenisch/md-to-pdf)
- [markdown2pdf-mcp](https://github.com/2b3pro/markdown2pdf-mcp)
- [MarkItDown MCP](https://www.pulsemcp.com/servers/markitdown)
- [markdownify-mcp](https://github.com/zcaceres/markdownify-mcp)
- [DeepSeek-OCR + Claude Code](https://simonwillison.net/2025/Oct/20/deepseek-ocr-claude-code/)
- [Teaching Claude OCR Skills (Medium)](https://medium.com/@learngvrk/teaching-claude-a-skill-how-i-built-pdf-manipulation-and-handwriting-ocr-as-reusable-ai-skills-2a5e3ae06dc4)
