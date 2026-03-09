# Plan 2: NotebookLM 에이전트 통합 — AI 직원들의 지식 무기

> **⚠️ 다음 단계 안내**
> 이 문서는 아이디어 메모입니다. 실제 구현 전에 반드시 BMAD 파이프라인으로 구체화할 것.
>
> ```
> /bmad-full-pipeline planning
> ```
>
> 위 명령으로 기획 파이프라인을 실행하여 Brief → PRD → Architecture → UX → Epics 순서로 정식 기획 문서를 만들고 나서 구현을 시작하세요.

---

## 개요

Google NotebookLM의 핵심 기능들을 CORTHEX AI 에이전트의 **도구(Tool)** 로 탑재하여,
에이전트들이 지식을 **소화 → 요약 → 변환 → 전달**하는 능력을 대폭 강화하는 방안.

### 현재 상태 vs 목표

| 영역 | 현재 (v2) | NotebookLM 통합 후 |
|------|----------|-------------------|
| 지식 저장 | RAG 텍스트 검색 | + 구조화된 노트북 단위 관리 |
| 지식 요약 | 에이전트가 LLM으로 직접 요약 | + 자동 오디오 브리핑 생성 |
| 보고서 출력 | 마크다운 텍스트만 | + 슬라이드, 인포그래픽, 플래시카드 |
| 브리핑 | 텔레그램 텍스트 | + 음성 브리핑 (팟캐스트 형식) |
| 학습 자료 | 없음 | + 자동 학습 가이드/퀴즈 생성 |
| 마인드맵 | NEXUS (수동) | + 자동 마인드맵 생성 |

---

## 1. 기술적 통합 방식

### 1-1. notebooklm-py 라이브러리 활용

Google의 NotebookLM을 프로그래밍 방식으로 제어하는 Python 라이브러리.
corthex 서버(Bun/TypeScript)에서 Python 프로세스로 호출하는 브릿지 구조.

```
CORTHEX Agent
  ↓ tool_use: "notebooklm_create_briefing"
  ↓
Tool Handler (TypeScript)
  ↓ child_process.spawn('python3', ['notebooklm-bridge.py', ...])
  ↓
notebooklm-py (Python)
  ↓ Google OAuth → NotebookLM API
  ↓
Google NotebookLM
  ↓ 결과 (오디오 URL, 마인드맵 데이터 등)
  ↓
Tool Handler → Agent → CEO
```

### 1-2. 브릿지 서비스 구조

```
packages/server/src/
  lib/
    notebooklm/
      bridge.ts              ← Python 프로세스 호출 래퍼
      types.ts               ← 타입 정의
      credential-manager.ts  ← Google OAuth 토큰 관리
  tool-handlers/builtins/
    notebooklm-create-notebook.ts
    notebooklm-audio-briefing.ts
    notebooklm-mindmap.ts
    notebooklm-slides.ts
    notebooklm-flashcards.ts
    notebooklm-infographic.ts
scripts/
  notebooklm-bridge.py       ← Python 브릿지 스크립트
```

### 1-3. bridge.ts (핵심 래퍼)

```typescript
// packages/server/src/lib/notebooklm/bridge.ts
import { spawn } from 'child_process'

interface NotebookLMRequest {
  action: 'create_notebook' | 'generate_audio' | 'generate_mindmap'
         | 'generate_slides' | 'generate_flashcards' | 'generate_infographic'
  sources: Array<{
    type: 'text' | 'url' | 'file'
    content: string
    title?: string
  }>
  options?: Record<string, unknown>
  credentials: {
    googleToken: string
  }
}

interface NotebookLMResponse {
  success: boolean
  notebookId?: string
  outputUrl?: string
  outputData?: unknown
  error?: string
}

export async function callNotebookLM(
  request: NotebookLMRequest
): Promise<NotebookLMResponse> {
  return new Promise((resolve, reject) => {
    const proc = spawn('python3', [
      'scripts/notebooklm-bridge.py',
      '--action', request.action,
      '--input', JSON.stringify(request),
    ], {
      timeout: 120_000,  // 2분 타임아웃 (오디오 생성은 시간 소요)
      cwd: process.cwd(),
    })

    let stdout = ''
    let stderr = ''

    proc.stdout.on('data', chunk => { stdout += chunk })
    proc.stderr.on('data', chunk => { stderr += chunk })

    proc.on('close', code => {
      if (code === 0) {
        resolve(JSON.parse(stdout))
      } else {
        reject(new Error(`NotebookLM bridge failed: ${stderr}`))
      }
    })
  })
}
```

---

## 2. 새로운 도구(Tool) 6종

### 2-1. notebooklm_create_notebook — 노트북 생성

**사용 시나리오**: 에이전트가 여러 문서를 하나의 "연구 노트북"으로 묶을 때

```typescript
export const notebooklmCreateNotebook: ToolHandler = async (input, ctx) => {
  const title = String(input.title || '새 노트북')
  const sources = input.sources as Array<{ type: string; content: string; title?: string }>

  if (!sources || sources.length === 0) {
    return JSON.stringify({ success: false, error: '소스 문서가 필요합니다' })
  }

  const creds = await ctx.getCredentials('google')
  const result = await callNotebookLM({
    action: 'create_notebook',
    sources: sources.map(s => ({
      type: s.type as 'text' | 'url',
      content: s.content,
      title: s.title,
    })),
    options: { title },
    credentials: { googleToken: creds.oauth_token },
  })

  return JSON.stringify({
    success: true,
    notebookId: result.notebookId,
    message: `"${title}" 노트북을 생성했습니다. ${sources.length}개 소스가 포함되어 있습니다.`,
  })
}
```

**에이전트 활용 예시:**
- 투자분석팀장: "삼성전자 관련 뉴스 10건 + DART 공시 5건 + 내부 분석 보고서 3건"을 하나의 노트북으로
- 법률팀: "관련 법률 조문 + 판례 + 내부 법률 의견"을 연구 노트북으로

---

### 2-2. notebooklm_audio_briefing — 음성 브리핑 생성

**사용 시나리오**: CEO에게 읽기 힘든 긴 보고서를 음성 팟캐스트처럼 전달

```typescript
export const notebooklmAudioBriefing: ToolHandler = async (input, ctx) => {
  const notebookId = String(input.notebookId || '')
  const topic = String(input.topic || '')
  const style = String(input.style || 'briefing')
    // 'briefing': 간결한 브리핑 (3-5분)
    // 'deep_dive': 심층 분석 (10-15분)
    // 'conversation': 대화형 팟캐스트 (15-20분)

  const sources = notebookId
    ? [{ type: 'notebook' as const, content: notebookId }]
    : [{ type: 'text' as const, content: String(input.text || ''), title: topic }]

  const creds = await ctx.getCredentials('google')
  const result = await callNotebookLM({
    action: 'generate_audio',
    sources,
    options: { style, topic, language: 'ko' },
    credentials: { googleToken: creds.oauth_token },
  })

  return JSON.stringify({
    success: true,
    audioUrl: result.outputUrl,
    duration: (result.outputData as any)?.durationSeconds,
    message: `음성 브리핑이 생성되었습니다. ${style === 'briefing' ? '약 5분' : '약 15분'} 분량입니다.`,
  })
}
```

**에이전트 활용 예시:**
```
CEO: "오늘 시장 현황 브리핑 음성으로 만들어줘"
  ↓
비서실장 → 투자분석팀장: "시황 분석해주세요"
  ↓
투자분석팀장:
  1. search_news("한국 증시 오늘") → 뉴스 수집
  2. kr_stock("005930") → 삼성전자 시세
  3. notebooklm_create_notebook(뉴스 + 시세 데이터)
  4. notebooklm_audio_briefing(style: 'briefing')
  5. 결과 URL을 CEO에게 전달
  ↓
CEO: 텔레그램으로 오디오 파일 수신 → 출퇴근길에 청취
```

---

### 2-3. notebooklm_mindmap — 자동 마인드맵 생성

**사용 시나리오**: 복잡한 주제를 시각적으로 정리

```typescript
export const notebooklmMindmap: ToolHandler = async (input, ctx) => {
  const notebookId = String(input.notebookId || '')
  const text = String(input.text || '')
  const format = String(input.format || 'mermaid')
    // 'mermaid': Mermaid 문법 → NEXUS SketchVibe에서 표시 가능
    // 'json': 구조화된 JSON
    // 'image': PNG 이미지

  const sources = notebookId
    ? [{ type: 'notebook' as const, content: notebookId }]
    : [{ type: 'text' as const, content: text }]

  const creds = await ctx.getCredentials('google')
  const result = await callNotebookLM({
    action: 'generate_mindmap',
    sources,
    options: { format },
    credentials: { googleToken: creds.oauth_token },
  })

  return JSON.stringify({
    success: true,
    mindmapData: result.outputData,
    format,
    message: format === 'mermaid'
      ? 'Mermaid 형식 마인드맵 생성 완료. NEXUS에서 확인 가능합니다.'
      : '마인드맵 생성 완료.',
  })
}
```

**NEXUS SketchVibe 연동 포인트:**
- NotebookLM이 생성한 마인드맵 → Mermaid 형식 → NEXUS 캔버스에 자동 렌더링
- NEXUS에 Mermaid ↔ Cytoscape.js 양방향 변환이 있으므로 바로 연결 가능

---

### 2-4. notebooklm_slides — 프레젠테이션 생성

**사용 시나리오**: 보고서를 발표 자료로 변환

```typescript
export const notebooklmSlides: ToolHandler = async (input, ctx) => {
  const notebookId = String(input.notebookId || '')
  const text = String(input.text || '')
  const slideCount = Number(input.slideCount || 10)
  const style = String(input.style || 'professional')
    // 'professional': 비즈니스 발표용
    // 'minimal': 깔끔한 미니멀
    // 'data_heavy': 데이터/차트 중심

  const sources = notebookId
    ? [{ type: 'notebook' as const, content: notebookId }]
    : [{ type: 'text' as const, content: text }]

  const creds = await ctx.getCredentials('google')
  const result = await callNotebookLM({
    action: 'generate_slides',
    sources,
    options: { slideCount, style },
    credentials: { googleToken: creds.oauth_token },
  })

  return JSON.stringify({
    success: true,
    slidesUrl: result.outputUrl,
    slideCount: (result.outputData as any)?.slideCount,
    message: `${slideCount}장 프레젠테이션이 생성되었습니다.`,
  })
}
```

**에이전트 활용 예시:**
```
CEO: "지난 분기 실적 보고서를 발표 자료로 만들어줘"
  ↓
비서실장:
  1. 지식 베이스에서 분기 보고서 검색
  2. notebooklm_create_notebook(보고서들)
  3. notebooklm_slides(style: 'data_heavy', slideCount: 15)
  4. 다운로드 URL 전달
```

---

### 2-5. notebooklm_flashcards — 학습 카드 생성

**사용 시나리오**: 신입 에이전트 학습, CEO 브리핑 자료, 직원 교육

```typescript
export const notebooklmFlashcards: ToolHandler = async (input, ctx) => {
  const notebookId = String(input.notebookId || '')
  const text = String(input.text || '')
  const cardCount = Number(input.cardCount || 20)
  const difficulty = String(input.difficulty || 'intermediate')
    // 'beginner': 기본 개념 위주
    // 'intermediate': 핵심 포인트
    // 'advanced': 세부 사항 + 엣지케이스

  const sources = notebookId
    ? [{ type: 'notebook' as const, content: notebookId }]
    : [{ type: 'text' as const, content: text }]

  const creds = await ctx.getCredentials('google')
  const result = await callNotebookLM({
    action: 'generate_flashcards',
    sources,
    options: { cardCount, difficulty },
    credentials: { googleToken: creds.oauth_token },
  })

  return JSON.stringify({
    success: true,
    cards: result.outputData,
    cardCount: (result.outputData as any)?.length,
    message: `${cardCount}장의 학습 카드가 생성되었습니다.`,
  })
}
```

**에이전트 활용 시나리오:**

1. **새 에이전트 온보딩**: 부서 지식 베이스 → 플래시카드 → 새 에이전트의 초기 메모리에 주입
2. **CEO 일일 브리핑 카드**: 오늘의 주요 뉴스 + 시장 동향 → 5장 카드로 요약 → 텔레그램 전송
3. **직원 교육 자료**: 새 정책/법률 변경 → 학습 카드 → 직원들에게 배포

---

### 2-6. notebooklm_infographic — 인포그래픽 생성

**사용 시나리오**: SNS 게시용 시각 콘텐츠, 내부 보고 시각화

```typescript
export const notebooklmInfographic: ToolHandler = async (input, ctx) => {
  const notebookId = String(input.notebookId || '')
  const text = String(input.text || '')
  const type = String(input.type || 'summary')
    // 'summary': 핵심 요약 인포그래픽
    // 'timeline': 시간순 타임라인
    // 'comparison': 비교 인포그래픽
    // 'statistics': 통계/숫자 중심
    // 'process': 프로세스/단계 설명

  const sources = notebookId
    ? [{ type: 'notebook' as const, content: notebookId }]
    : [{ type: 'text' as const, content: text }]

  const creds = await ctx.getCredentials('google')
  const result = await callNotebookLM({
    action: 'generate_infographic',
    sources,
    options: { type },
    credentials: { googleToken: creds.oauth_token },
  })

  return JSON.stringify({
    success: true,
    imageUrl: result.outputUrl,
    type,
    message: `${type} 인포그래픽이 생성되었습니다.`,
  })
}
```

**SNS 연동 시나리오:**
```
CEO: "이번 달 실적을 인스타그램에 올려줘"
  ↓
비서실장 → 마케팅팀:
  1. 실적 데이터 수집 (cost_records, trading_results)
  2. notebooklm_create_notebook(실적 데이터)
  3. notebooklm_infographic(type: 'statistics')
  4. SNS 콘텐츠 생성 (인포그래픽 이미지 + 캡션)
  5. CEO 승인 대기
  6. publish_instagram(imageUrl, caption)
```

---

## 3. 부서별 구체적 활용 방안

### 3-1. 투자분석부 (CIO 부서)

| 기능 | 활용법 | 기대 효과 |
|------|--------|----------|
| **오디오 브리핑** | 매일 오전 시황을 음성 팟캐스트로 → 텔레그램 전송 | CEO가 출퇴근길에 청취 |
| **마인드맵** | 종목 분석 시 "삼성전자 사업부 구조" 자동 시각화 | 복잡한 기업 구조 한눈에 파악 |
| **슬라이드** | 분기 투자 보고서 → 10장 프레젠테이션 | 투자위원회 발표 자료 자동 생성 |
| **인포그래픽** | 포트폴리오 수익률 → 비주얼 카드 | SNS 공유 or 내부 보고 |

**자동화 시나리오 — 일일 투자 브리핑:**
```
[크론 작업: 매일 08:00]
  ↓
투자분석팀장:
  1. search_news("한국 증시 미국 증시 전날 마감") → 뉴스 5건
  2. kr_stock("KOSPI,KOSDAQ,SPY,QQQ") → 지수 데이터
  3. 포트폴리오 현황 조회
  4. notebooklm_create_notebook(뉴스 + 지수 + 포트폴리오)
  5. notebooklm_audio_briefing(style: 'briefing', topic: '오늘의 시장')
  6. send_telegram(CEO, "오늘의 투자 브리핑", audioUrl)
  ↓
CEO: 텔레그램에서 5분 음성 브리핑 청취
```

### 3-2. 마케팅부

| 기능 | 활용법 | 기대 효과 |
|------|--------|----------|
| **인포그래픽** | 캠페인 결과 → 시각 카드 → SNS 게시 | 전문적인 SNS 콘텐츠 |
| **슬라이드** | 마케팅 전략 → 프레젠테이션 | 클라이언트/경영진 보고 |
| **플래시카드** | 브랜드 가이드라인 → 핵심 요약 카드 | 신규 직원 온보딩 |
| **마인드맵** | 콘텐츠 아이디어 → 시각적 브레인스토밍 | 콘텐츠 캘린더 기획 |

### 3-3. 법률부

| 기능 | 활용법 | 기대 효과 |
|------|--------|----------|
| **노트북** | 판례 + 법조문 + 내부 의견 → 연구 노트북 | 체계적 법률 리서치 |
| **오디오** | 법률 분석 보고서 → 음성 브리핑 | CEO가 법률 이슈 빠르게 파악 |
| **플래시카드** | 새 법률/규정 → 핵심 변경사항 카드 | 컴플라이언스 교육 |
| **타임라인** | 소송 진행 상황 → 시각적 타임라인 | 진행 상황 한눈에 파악 |

### 3-4. 기술부

| 기능 | 활용법 | 기대 효과 |
|------|--------|----------|
| **마인드맵** | 시스템 아키텍처 → 시각 다이어그램 | 신규 개발자 온보딩 |
| **플래시카드** | 장애 대응 매뉴얼 → 긴급 참조 카드 | 당직자 빠른 대응 |
| **인포그래픽** | 모니터링 통계 → 시각 요약 | 주간 보고 자동화 |
| **오디오** | 기술 문서 → 음성 가이드 | 이동 중 학습 |

### 3-5. 비서실 (Chief of Staff)

| 기능 | 활용법 | 기대 효과 |
|------|--------|----------|
| **오디오 브리핑** | 전 부서 보고서 → 통합 음성 브리핑 | CEO 일일 종합 브리핑 |
| **슬라이드** | 이사회 보고 자료 자동 생성 | 보고 준비 시간 절감 |
| **인포그래픽** | KPI 대시보드 → 시각 카드 | 경영진 빠른 현황 파악 |
| **마인드맵** | 조직 이슈 맵핑 | 의사결정 지원 |

---

## 4. 텔레그램 연동 강화

### 4-1. 음성 브리핑 자동 전송

```typescript
// 텔레그램 봇 명령어 추가
// /브리핑 → 오늘의 종합 브리핑 음성 파일 생성 + 전송
// /시황음성 → 투자 시황 오디오 전송
// /요약카드 [주제] → 플래시카드 이미지 전송
```

### 4-2. 텔레그램에서 바로 명령

```
CEO (텔레그램): /브리핑
  ↓
텔레그램 봇: 비서실장에게 "오늘의 종합 브리핑 생성" 명령
  ↓
비서실장:
  1. 각 부서 오늘 활동 요약 수집
  2. 비용 현황 수집
  3. 미완료 작업 수집
  4. notebooklm_create_notebook(전체 데이터)
  5. notebooklm_audio_briefing(style: 'briefing')
  6. send_telegram(audioUrl)
  ↓
CEO: 텔레그램에서 음성 파일 재생 (5분)
```

---

## 5. 지식 베이스 연동

### 5-1. 기존 RAG와의 관계

```
현재 지식 흐름:
  문서 업로드 → knowledge_docs 테이블 → 텍스트 추출 → 에이전트 프롬프트에 주입

NotebookLM 강화 흐름:
  문서 업로드 → knowledge_docs 테이블
    ├→ 텍스트 추출 → 에이전트 프롬프트에 주입 (기존)
    └→ notebooklm_create_notebook → 오디오/마인드맵/카드 자동 생성 (신규)
```

### 5-2. 지식 폴더별 노트북 자동 생성

```typescript
async function onKnowledgeDocAdded(doc: KnowledgeDoc) {
  // 기존: RAG 인덱싱
  await indexForRAG(doc)

  // 신규: 해당 폴더의 NotebookLM 노트북에 소스 추가
  const folder = await getFolder(doc.folderId)
  if (folder.notebookId) {
    await callNotebookLM({
      action: 'add_source',
      notebookId: folder.notebookId,
      sources: [{ type: 'text', content: doc.content, title: doc.title }],
    })
  }
}
```

---

## 6. AGORA 토론 엔진 연동

### 6-1. 토론 결과 → 음성 요약

```
AGORA 토론 (6개 부서장 참여)
  ↓ 토론 종료
  ↓
notebooklm_create_notebook(토론 전문)
  ↓
notebooklm_audio_briefing(style: 'conversation')
  ↓
CEO: 30분 토론을 5분 음성으로 요약 청취
```

### 6-2. 토론 → 마인드맵 → NEXUS

```
AGORA 토론 결과
  ↓
notebooklm_mindmap(format: 'mermaid')
  ↓
NEXUS SketchVibe에 자동 렌더링
  ↓
CEO: 토론 논점 구조를 시각적으로 파악
```

---

## 7. 크론(스케줄러) 연동

### 7-1. 정기 브리핑 자동화

| 크론 표현식 | 작업 | 도구 |
|------------|------|------|
| `0 8 * * 1-5` | 일일 시황 오디오 브리핑 → 텔레그램 | audio_briefing |
| `0 9 * * 1` | 주간 종합 보고 슬라이드 → 이메일 | slides |
| `0 10 1 * *` | 월간 실적 인포그래픽 → SNS | infographic |
| `0 18 * * 5` | 주간 학습 리뷰 플래시카드 | flashcards |

### 7-2. 구현 방식

```typescript
const CRON_ACTIONS = {
  // 기존
  command: executeCommand,
  batch: executeBatch,

  // 신규 NotebookLM 관련
  audio_briefing: async (config) => {
    const sources = await collectSources(config.sourceConfig)
    const notebook = await callNotebookLM({ action: 'create_notebook', sources })
    const audio = await callNotebookLM({
      action: 'generate_audio',
      sources: [{ type: 'notebook', content: notebook.notebookId }],
      options: config.audioOptions,
    })
    await deliver(config.deliveryChannel, audio.outputUrl)
  },
}
```

---

## 8. 어드민 설정 UI

### 8-1. NotebookLM 설정 페이지 (어드민 콘솔)

```
/admin/settings/notebooklm

┌──────────────────────────────────────┐
│ NotebookLM 연동 설정                   │
├──────────────────────────────────────┤
│ Google 계정 연결: ✅ 연결됨             │
│ [재연결] [연결 해제]                    │
│                                      │
│ 자동 브리핑 설정:                      │
│ ☑ 일일 시황 오디오 (08:00)             │
│ ☑ 주간 종합 슬라이드 (월 09:00)         │
│ ☐ 월간 인포그래픽 (1일 10:00)           │
│                                      │
│ 전달 채널:                             │
│ ☑ 텔레그램  ☐ 이메일  ☑ 내부 메신저      │
│                                      │
│ 에이전트 도구 할당:                     │
│ ☑ 투자분석팀장 — audio, slides          │
│ ☑ 마케팅팀장 — infographic, flashcards  │
│ ☑ 비서실장 — 전체                      │
│ ☐ 법률팀장 — audio, mindmap            │
│                                      │
│ [저장]                                │
└──────────────────────────────────────┘
```

---

## 9. 비용 및 제약사항

### 9-1. NotebookLM 비용

| 항목 | 비용 | 비고 |
|------|------|------|
| NotebookLM Plus | $20/월 (Google One AI Premium) | 필수 |
| API 호출 | 현재 무료 (notebooklm-py 비공식) | 변경 가능성 있음 |
| 오디오 생성 | 무료 (NotebookLM 내장) | 한국어 품질 확인 필요 |

### 9-2. 제약사항

| 제약 | 영향 | 대안 |
|------|------|------|
| Google 인증 필요 | 초기 설정 복잡 | 어드민에서 한 번만 설정 |
| notebooklm-py 비공식 | API 변경 시 깨질 수 있음 | 버전 고정 + 폴백 로직 |
| Python 의존성 | Bun 서버에 Python 설치 필요 | Docker에 Python 포함 |
| 한국어 오디오 품질 | 영어보다 자연스러움 떨어질 수 있음 | TTS 대안 (ElevenLabs) 준비 |
| 생성 시간 | 오디오 30초~2분 소요 | 비동기 처리 + 알림 |
| 소스 제한 | 노트북당 최대 50개 소스 | 중요 소스만 선별 |

### 9-3. 폴백 전략

```typescript
// 오디오 폴백: Google TTS 또는 ElevenLabs
if (notebooklmFailed) {
  const text = await generateSummary(sources)
  const audio = await googleTTS(text, 'ko')
  return { audioUrl: audio.url }
}

// 마인드맵 폴백: LLM으로 직접 Mermaid 생성
if (notebooklmFailed) {
  const mermaid = await generateMermaid(sources)
  return { mindmapData: mermaid, format: 'mermaid' }
}

// 인포그래픽 폴백: 이미지 생성 AI
if (notebooklmFailed) {
  const image = await generateImage(prompt)
  return { imageUrl: image.url }
}
```

---

## 10. 구현 우선순위

| 단계 | 기능 | 난이도 | 가치 | 시기 |
|------|------|--------|------|------|
| **Phase 1** | Python 브릿지 + 오디오 브리핑 | 중 | 매우 높음 | v2 중반 |
| **Phase 1** | 텔레그램 오디오 전송 | 낮 | 높음 | v2 중반 |
| **Phase 2** | 마인드맵 + NEXUS 연동 | 중 | 높음 | v2 후반 |
| **Phase 2** | 슬라이드 생성 | 중 | 중 | v2 후반 |
| **Phase 3** | 인포그래픽 + SNS 연동 | 높 | 중 | v2 이후 |
| **Phase 3** | 플래시카드 + 온보딩 | 중 | 중 | v2 이후 |
| **Phase 3** | 크론 자동 브리핑 | 낮 | 높음 | v2 이후 |

---

## 11. DB 스키마 추가 (필요시)

```sql
-- 노트북 관리 테이블
CREATE TABLE notebooklm_notebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  title VARCHAR(200) NOT NULL,
  external_notebook_id VARCHAR(200),
  source_type VARCHAR(50) NOT NULL,
  source_id UUID,
  department_id UUID REFERENCES departments(id),
  created_by UUID REFERENCES users(id),
  last_synced_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 생성된 산출물 추적
CREATE TABLE notebooklm_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  notebook_id UUID NOT NULL REFERENCES notebooklm_notebooks(id),
  output_type VARCHAR(50) NOT NULL,
  output_url TEXT,
  output_data JSONB,
  duration_seconds INTEGER,
  generated_by UUID REFERENCES agents(id),
  delivered_via VARCHAR(50),
  delivered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 12. 최종 요약

| 항목 | 내용 |
|------|------|
| **핵심 가치** | AI 에이전트가 지식을 "소화"해서 다양한 형태로 "변환 전달" |
| **주 수혜자** | CEO (음성 브리핑), 마케팅팀 (인포그래픽), 전 부서 (마인드맵) |
| **도구 6종** | notebook, audio, mindmap, slides, flashcards, infographic |
| **연동 포인트** | 텔레그램, SNS, NEXUS, 크론, 지식 베이스, AGORA |
| **기술 스택** | notebooklm-py (Python) + TypeScript 브릿지 |
| **비용** | Google One AI Premium $20/월 |
| **최우선 구현** | 오디오 브리핑 + 텔레그램 전송 (CEO 일일 브리핑) |
