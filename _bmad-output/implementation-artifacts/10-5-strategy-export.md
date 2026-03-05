# Story 10.5: 전략 데이터 내보내기 — 관심종목·노트·차트 CSV/MD 다운로드

Status: review

## Story

As a 일반 직원(유저),
I want 전략실의 관심종목 목록, 종목별 메모, 차트 데이터를 파일로 내보내기할 수 있다,
so that 투자 분석 자료를 외부에서 활용하거나 백업할 수 있다.

## Acceptance Criteria

1. **Given** 전략실 차트 패널 **When** 내보내기 버튼 클릭 **Then** ExportDialog 모달 표시 (내보내기 유형 + 포맷 선택)
2. **Given** ExportDialog **When** "관심종목" 선택 + CSV **Then** stockCode, stockName, market 컬럼의 CSV 파일 다운로드
3. **Given** ExportDialog **When** "메모" 선택 + MD **Then** 현재 종목의 노트를 마크다운 파일로 다운로드 (제목 H2 + 내용 + 날짜)
4. **Given** ExportDialog **When** "차트 데이터" 선택 + CSV **Then** 현재 종목의 OHLCV 일봉 데이터 CSV 다운로드
5. **Given** CSV 내보내기 **When** 한글 종목명 포함 **Then** UTF-8 BOM 포함하여 Excel에서 한글 깨짐 없음
6. **Given** 모바일 **When** 내보내기 **Then** ExportDialog 전체 화면, 동일 기능
7. `turbo build` 3/3 성공

## Tasks / Subtasks

- [x] Task 1: 서버 — 내보내기 API 엔드포인트 (AC: #2, #3, #4, #5)
  - [x] `packages/server/src/routes/workspace/strategy.ts`에 `GET /export` 추가
    - query params: `type` (watchlist|notes|chart), `format` (csv|md), `stockCode?`, `count?`
    - watchlist CSV: UTF-8 BOM + `종목코드,종목명,시장` 헤더
    - notes MD: `# {stockName} 전략 메모\n\n## {title}\n{content}\n---`
    - chart CSV: UTF-8 BOM + `날짜,시가,고가,저가,종가,거래량` 헤더 + OHLCV 행
  - [x] `Content-Disposition: attachment` + 한글 파일명 인코딩 (`filename*=UTF-8''`)
  - [x] zValidator 검증, 종목코드 정규식, chart는 KIS API 호출

- [x] Task 2: 프론트엔드 — ExportDialog 컴포넌트 (AC: #1, #6)
  - [x] `packages/app/src/components/strategy/export-dialog.tsx` 신규
    - 내보내기 유형: 라디오 그룹 (관심종목 / 메모 / 차트 데이터)
    - 포맷: 유형별 가용 포맷 표시 (watchlist→CSV, notes→MD/CSV, chart→CSV)
    - 내보내기 버튼 → fetch blob → createObjectURL → a.click() 다운로드
    - isPending 상태 표시 (로딩 스피너/disabled)
  - [x] 모바일: Modal 컴포넌트 기반이므로 자동 반응형

- [x] Task 3: ChartPanel 통합 (AC: #1)
  - [x] `packages/app/src/components/strategy/chart-panel.tsx` 시세 헤더에 내보내기 버튼 추가
    - 종목 선택 상태에서만 표시
    - `<ExportDialog>` 연결

- [x] Task 4: 빌드 확인 (AC: #7)
  - [x] `npx turbo build --force` 3/3 성공

## Dev Notes

### 핵심 설계: 서버 사이드 파일 생성 + 클라이언트 blob 다운로드

기존 보고서 다운로드 패턴(`reports.ts` GET `/reports/:id/download`)을 그대로 따른다:
- 서버: `Content-Type` + `Content-Disposition` 헤더 설정 → `c.body(content)` 반환
- 클라이언트: `fetch → res.blob() → URL.createObjectURL → a.click() → revokeObjectURL`

### 기존 보고서 다운로드 패턴 (반드시 참조)

```typescript
// 서버 (packages/server/src/routes/workspace/reports.ts:401-434)
c.header('Content-Type', 'text/markdown; charset=utf-8')
c.header('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`)
return c.body(md)

// 클라이언트 (packages/app/src/pages/reports.tsx:221-241)
const blob = await res.blob()
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = `${title}.md`
a.click()
URL.revokeObjectURL(url)
```

### CSV 한글 인코딩 (AC #5)

Excel에서 UTF-8 CSV를 열 때 한글 깨짐 방지를 위해 **BOM(Byte Order Mark)** 필수:
```typescript
const BOM = '\uFEFF'
const csv = BOM + '종목코드,종목명,시장\n' + rows.join('\n')
c.header('Content-Type', 'text/csv; charset=utf-8')
```

### API 설계

```
GET /api/workspace/strategy/export?type=watchlist&format=csv
GET /api/workspace/strategy/export?type=notes&format=md&stockCode=005930
GET /api/workspace/strategy/export?type=chart&format=csv&stockCode=005930&count=60
```

Zod 스키마:
```typescript
const exportSchema = z.object({
  type: z.enum(['watchlist', 'notes', 'chart']),
  format: z.enum(['csv', 'md']),
  stockCode: z.string().max(20).optional(),
  count: z.coerce.number().int().min(1).max(200).default(60),
})
```
- `notes`와 `chart`는 `stockCode` 필수 → `.refine()` 검증
- `chart` 내보내기는 기존 KIS 일봉 API 로직을 재사용 (strategy.ts의 `/chart-data` 핸들러)

### 파일명 생성

```typescript
const today = new Date().toISOString().slice(0, 10)  // 2026-03-05
// watchlist → watchlist-2026-03-05.csv
// notes    → notes-삼성전자-2026-03-05.md
// chart    → chart-005930-60d-2026-03-05.csv
```
파일명에서 특수문자 제거: `.replace(/[^a-zA-Z0-9가-힣\s\-_]/g, '')`

### ExportDialog 컴포넌트 구조

```tsx
// Modal 기반 (기존 ConfirmDialog처럼 @corthex/ui의 Modal 사용)
<Modal isOpen={isOpen} onClose={onClose}>
  <h3>전략 데이터 내보내기</h3>
  {/* 라디오: 관심종목 / 메모 / 차트 데이터 */}
  {/* 포맷 선택 (유형에 따라 달라짐) */}
  {/* 내보내기 + 취소 버튼 */}
</Modal>
```

### 이전 스토리 학습사항

- **10-1**: UUID params에 zValidator 필수, 중첩 button 금지
- **10-2**: metadata JSONB 패턴, strategy 마커
- **10-3**: 종목코드 정규식 (`/^[A-Za-z0-9]{1,20}$/`), URL 인코딩, Promise.allSettled 병렬, KIS API 호출 패턴
- **10-4**: toast는 `@corthex/ui`에서 import (sonner 직접 금지), ConfirmDialog는 `isOpen/onConfirm/onCancel/variant="danger"`, PATCH 빈 body `.refine()` 검증, 모바일은 `fixed inset-0 sm:static` 패턴
- **코드 리뷰 H1**: 마이그레이션 journal 태그와 파일명 반드시 일치 (Drizzle 자동 생성명 사용)

### 이 스토리에서 하지 않는 것

- PDF 내보내기 (jspdf 의존성 추가 불필요)
- XLSX/Excel 내보내기 (CSV로 충분)
- 복합 전략 보고서 (여러 종목 합침)
- 채팅 히스토리 내보내기

### 파일 구조

```
수정 파일:
  packages/server/src/routes/workspace/strategy.ts (export 엔드포인트 추가)
  packages/app/src/components/strategy/chart-panel.tsx (내보내기 버튼 추가)
신규 파일:
  packages/app/src/components/strategy/export-dialog.tsx (ExportDialog 컴포넌트)
```

### 에러코드 범위

STRATEGY_030 ~ STRATEGY_039 사용

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- GET /export 엔드포인트: watchlist CSV, notes MD/CSV, chart CSV 지원
- UTF-8 BOM 포함하여 Excel 한글 깨짐 방지
- Content-Disposition + filename* 한글 파일명 인코딩
- ExportDialog: Modal 기반, 유형별 포맷 자동 전환, blob 다운로드
- ChartPanel 시세 헤더에 내보내기 버튼 배치
- chart export는 기존 KIS 일봉 API 로직 재사용
- .refine()으로 notes/chart에 stockCode 필수 검증

### File List
- packages/server/src/routes/workspace/strategy.ts (export 엔드포인트 추가)
- packages/app/src/components/strategy/export-dialog.tsx (신규)
- packages/app/src/components/strategy/chart-panel.tsx (내보내기 버튼 + ExportDialog 통합)
