# 도구 보고서 #2: MD 보고서 산출 시스템
> CORTHEX v2 직원(AI Agent)이 마크다운 보고서를 생성하고 배포하는 체계
> 작성일: 2026-03-11 | BMAD 참고용

---

## 1. 개요

CORTHEX v2 AI 직원이 업무 결과를 **구조화된 마크다운 보고서**로 산출하고, 이를 다양한 채널(NotebookLM, 웹, 이메일, Notion)로 배포하는 전체 시스템 설계.

---

## 2. 보고서 산출 흐름

```
에이전트 작업 완료
  → Soul에 "보고서 작성 지침" 포함 (템플릿 준수)
  → 마크다운 보고서 생성 (.md 파일)
  → 저장: DB + 파일시스템
  → 배포 채널 선택:
      ├── NotebookLM 업로드 (분석/학습용)
      ├── 웹 대시보드 렌더링 (열람/다운로드)
      ├── PDF 변환 → 이메일 발송
      ├── Notion 페이지 생성
      └── Google Drive 업로드
```

---

## 3. 보고서 템플릿 시스템

### 3.1 Soul에 주입할 보고서 지침
에이전트의 Soul(시스템 프롬프트)에 보고서 작성 규칙을 포함:

```markdown
## 보고서 작성 규칙

### 필수 구조
1. **제목** (# 레벨): 보고서 명칭
2. **메타데이터**: 작성일, 작성자(에이전트명), 부서, 버전
3. **요약** (Executive Summary): 3문장 이내
4. **본문**: 주제별 섹션 (## 레벨)
5. **데이터**: 테이블 또는 차트 설명
6. **결론/제안**: 액션 아이템 포함
7. **부록**: 원본 데이터, 참고 링크

### 포맷 규칙
- 테이블: GFM(GitHub Flavored Markdown) 형식
- 코드: 언어 명시 (\`\`\`typescript)
- 수치: 천 단위 콤마, 통화 단위 명시
- 날짜: YYYY-MM-DD 형식
- 이미지 참조: ![설명](경로) 형식
```

### 3.2 보고서 타입별 템플릿

#### 일일 업무 보고서
```markdown
# {{department_name}} 일일 업무 보고
> 작성: {{agent_name}} | 날짜: {{date}} | 부서: {{department_name}}

## 요약
- 완료: N건 / 진행중: N건 / 보류: N건

## 완료 업무
| # | 업무 | 결과 | 비고 |
|---|------|------|------|
| 1 | ... | ... | ... |

## 진행중 업무
...

## 내일 계획
1. ...

## 이슈/건의
- ...
```

#### 분석 보고서
```markdown
# {{title}} 분석 보고서
> 작성: {{agent_name}} | 날짜: {{date}} | 의뢰: {{requester}}

## Executive Summary
{{3문장 요약}}

## 분석 배경
...

## 데이터 분석
### 핵심 지표
| 지표 | 현재 | 목표 | 차이 |
|------|------|------|------|
| ... | ... | ... | ... |

## 인사이트
1. ...
2. ...

## 권장 사항
- [ ] 액션 1: ...
- [ ] 액션 2: ...

## 부록
- 원본 데이터: [링크]
- 분석 방법론: ...
```

---

## 4. 보고서 저장 도구: `save_report`

```typescript
// packages/server/src/lib/tool-handlers/builtins/save-report.ts
import { z } from 'zod'

const saveReportSchema = z.object({
  title: z.string().describe('보고서 제목'),
  content: z.string().describe('마크다운 보고서 내용'),
  type: z.enum(['daily', 'analysis', 'meeting', 'incident', 'custom']),
  tags: z.array(z.string()).optional(),
  distribute_to: z.array(z.enum([
    'storage_only',  // DB + 파일 저장만
    'web_dashboard',  // 웹 대시보드에 게시
    'pdf_email',      // PDF 변환 후 이메일
    'notion',         // Notion 페이지 생성
    'google_drive',   // Google Drive 업로드
    'notebooklm',     // NotebookLM 소스로 추가
  ])).default(['storage_only']),
})

export const saveReport: ToolRegistration = {
  name: 'save_report',
  description: '작업 결과를 마크다운 보고서로 저장하고 지정된 채널로 배포합니다.',
  category: 'productivity',
  parameters: saveReportSchema,
  execute: async (params, ctx) => {
    const parsed = saveReportSchema.parse(params)
    const db = getDB(ctx.companyId)

    // 1. DB에 보고서 메타데이터 저장
    const report = await db.insertReport({
      title: parsed.title,
      content: parsed.content,
      type: parsed.type,
      agentId: ctx.agentId,
      tags: parsed.tags,
      createdAt: new Date(),
    })

    // 2. 배포 채널별 처리
    const results = []
    for (const channel of parsed.distribute_to) {
      switch (channel) {
        case 'pdf_email':
          // md_to_pdf 도구 → send_email 도구 체이닝
          break
        case 'notion':
          // Notion MCP 서버 호출
          break
        case 'google_drive':
          // Google Workspace MCP 호출
          break
        case 'notebooklm':
          // NotebookLM MCP 호출 (29개 도구 중 add_source)
          break
        case 'web_dashboard':
          // reports 테이블에 published=true 설정
          break
      }
    }

    return JSON.stringify({ success: true, data: { reportId: report.id, channels: results } })
  }
}
```

---

## 5. 배포 채널별 구현 가이드

### 5.1 웹 대시보드 (기본)

**프론트엔드 구현:**
```typescript
// packages/admin/src/pages/reports/ReportViewer.tsx
// 마크다운 렌더링: react-markdown + remark-gfm
// PDF 다운로드: md_to_pdf API 호출
// 검색/필터: 날짜, 작성자, 타입, 태그
```

**필요한 패키지:**
- `react-markdown` (14,000+ stars) - MD 렌더링
- `remark-gfm` - GFM 테이블, 체크리스트 지원
- `rehype-highlight` - 코드 하이라이팅

**DB 스키마:**
```sql
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  company_id UUID NOT NULL,
  agent_id UUID REFERENCES agents(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(20) NOT NULL,
  tags JSONB DEFAULT '[]',
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_reports_company ON reports(company_id, created_at DESC);
```

### 5.2 Notion 연동

**MCP 서버**: `@notionhq/notion-mcp-server` (공식, 22개 도구)

**구현 흐름:**
```
save_report(distribute_to: ['notion'])
  → Notion MCP의 create_page 도구 호출
  → 마크다운 → Notion 블록 변환 (자동)
  → 지정된 데이터베이스에 페이지 추가
  → 태그, 날짜, 작성자 속성 자동 설정
```

**필요 설정:**
- Notion Integration Token (관리자가 등록)
- 대상 Database ID (부서별 또는 통합)

### 5.3 이메일 발송

**구현 흐름:**
```
save_report(distribute_to: ['pdf_email'])
  → md_to_pdf 도구 호출 → PDF 생성
  → send_email 도구 호출 (기존 56개 도구 중 하나)
    → 수신자: 보고서 구독자 목록 또는 지정
    → 첨부: PDF 파일
    → 본문: 보고서 요약 (처음 3문장)
```

### 5.4 Google Drive 업로드

**MCP 서버**: Google Workspace MCP (50+ 도구)

**구현 흐름:**
```
save_report(distribute_to: ['google_drive'])
  → Google Workspace MCP의 drive_upload 도구 호출
  → MD 파일 업로드 (또는 PDF 변환 후 업로드)
  → 공유 폴더에 저장 → 공유 링크 반환
```

### 5.5 NotebookLM 연동

**MCP 서버**: `notebooklm-mcp` (29개 도구, 이미 아키텍처에 포함)

**구현 흐름:**
```
save_report(distribute_to: ['notebooklm'])
  → NotebookLM MCP의 add_source 도구 호출
  → 지정된 노트북에 보고서를 소스로 추가
  → AI가 요약, 질의응답, 팟캐스트 생성 가능
```

---

## 6. 아키텍처 통합

### 6.1 도구 등록
```
packages/server/src/lib/tool-handlers/builtins/
  ├── save-report.ts          # 보고서 저장 + 배포 (핵심)
  ├── md-to-pdf.ts            # MD → PDF (01번 문서 참조)
  ├── list-reports.ts         # 보고서 목록 조회
  └── get-report.ts           # 보고서 상세 조회
```

### 6.2 DB 마이그레이션
```
packages/server/src/db/schema/
  └── reports.ts              # reports 테이블 Drizzle 스키마
```

### 6.3 API 엔드포인트
```
packages/server/src/routes/
  └── reports.ts
      GET  /api/reports           # 목록 (필터, 페이지네이션)
      GET  /api/reports/:id       # 상세
      GET  /api/reports/:id/pdf   # PDF 다운로드
      POST /api/reports/:id/distribute  # 추가 배포
```

### 6.4 프론트엔드 페이지
```
packages/admin/src/pages/reports/
  ├── ReportsPage.tsx         # 보고서 목록
  ├── ReportViewer.tsx        # 상세 뷰 (MD 렌더링)
  └── ReportSettings.tsx      # 배포 채널 설정
```

---

## 7. 구현 우선순위

| 우선순위 | 항목 | Phase |
|---------|------|-------|
| P0 | save_report 도구 (DB 저장) | Phase 1 |
| P0 | 웹 대시보드 렌더링 | Phase 1 |
| P1 | md_to_pdf 변환 | Phase 1 |
| P1 | PDF 다운로드 API | Phase 1 |
| P2 | Notion 연동 | Phase 2 |
| P2 | 이메일 발송 | Phase 2 |
| P3 | Google Drive 연동 | Phase 3 |
| P3 | NotebookLM 연동 | Phase 3 |

---

## 8. BMAD 개발자 참고사항

### Soul 템플릿 변수 추가 필요
```
{{report_templates}}    # 사용 가능한 보고서 템플릿 목록
{{report_style_guide}}  # 보고서 스타일 가이드
```

### 테스트 케이스
- [ ] 에이전트가 Soul 지침에 따라 올바른 MD 구조 생성
- [ ] save_report → DB 저장 + 배포 채널 동작
- [ ] MD → PDF 변환 품질 (한글 폰트, 테이블)
- [ ] Notion 페이지 생성 시 마크다운 블록 변환 정확도
- [ ] 대용량 보고서 (10,000자+) 처리
- [ ] 동시 다채널 배포 에러 핸들링

### 기존 도구와의 관계
- `send_email` (기존 56개 중 하나): PDF 첨부 기능 추가 필요
- `chart_generator` (기존): 보고서 내 차트 이미지 생성에 활용
- `spreadsheet_tool` (기존): 보고서 데이터 소스로 활용

---

## Sources
- [react-markdown](https://github.com/remarkjs/react-markdown) - 14,000+ stars
- [Notion MCP Server](https://github.com/makenotion/notion-mcp-server) - 공식, 4,000 stars
- [Google Workspace MCP](https://github.com/taylorwilsdon/google_workspace_mcp) - 1,800 stars
- [notebooklm-mcp](https://github.com/nicholasgriffintn/notebooklm-mcp) - 아키텍처 확정 도구
- [md-to-pdf](https://github.com/simonhaenisch/md-to-pdf) - 1,200+ stars
