# Story 10.4: 전략 노트 — 종목별 투자 메모 CRUD + 마크다운 편집

Status: review

## Story

As a 일반 직원(유저),
I want 전략실에서 선택한 종목에 대한 투자 메모를 작성/수정/삭제할 수 있다,
so that 종목 분석 내용과 투자 전략을 기록하고 나중에 참고할 수 있다.

## Acceptance Criteria

1. **Given** 종목 선택 상태 **When** 차트 하단 영역 **Then** 해당 종목의 노트 목록 표시 (최신순)
2. **Given** 노트 영역 **When** "새 메모" 버튼 클릭 **Then** 마크다운 편집기 표시, 저장 시 DB 저장
3. **Given** 기존 노트 **When** 클릭 **Then** 편집 모드 전환, 수정 후 저장 가능
4. **Given** 기존 노트 **When** 삭제 버튼 **Then** ConfirmDialog 후 삭제
5. **Given** 종목 변경 **When** 다른 종목 선택 **Then** 해당 종목 노트로 자동 전환
6. **Given** 모바일 **When** 노트 작성 **Then** 전체 화면 편집기 표시
7. `turbo build` 3/3 성공

## Tasks / Subtasks

- [x] Task 1: DB — strategy_notes 테이블 (AC: #1, #2, #4)
  - [x] `packages/server/src/db/schema.ts`에 `strategyNotes` 테이블 추가
    - id, companyId, userId, stockCode, title, content(text), createdAt, updatedAt
    - 인덱스: (companyId, userId, stockCode)
  - [x] Drizzle 마이그레이션 생성

- [x] Task 2: 서버 — 노트 CRUD API (AC: #1, #2, #3, #4)
  - [x] `packages/server/src/routes/workspace/strategy.ts`에 노트 엔드포인트 추가
    - GET `/notes?stockCode=005930` — 종목별 노트 목록 (최신순)
    - POST `/notes` — 노트 생성 `{ stockCode, title?, content }`
    - PATCH `/notes/:id` — 노트 수정 `{ title?, content }`
    - DELETE `/notes/:id` — 노트 삭제
  - [x] zValidator로 입력 검증, UUID params 검증

- [x] Task 3: 프론트엔드 — NotesPanel 컴포넌트 (AC: #1, #2, #3, #4, #5, #6)
  - [x] `packages/app/src/components/strategy/notes-panel.tsx` 신규
    - 노트 목록 (제목 + 날짜 + 미리보기)
    - 인라인 마크다운 편집기 (textarea + 미리보기 토글)
    - 새 메모 / 수정 / 삭제 기능
    - useSearchParams에서 stockCode 읽기
  - [x] `packages/app/src/components/strategy/chart-panel.tsx` 하단에 NotesPanel 통합
    - 차트 카드 아래 노트 패널 배치
  - [x] 모바일 대응: 편집 시 전체 높이

- [x] Task 4: 빌드 확인 (AC: #7)
  - [x] `npx turbo build --force` 3/3 성공

## Dev Notes

### 핵심 설계: 종목별 개인 메모 시스템

전략실에서 종목을 선택하면 해당 종목에 대한 개인 메모를 볼 수 있음. 마크다운으로 작성/편집 가능. chatSessions처럼 companyId + userId + stockCode로 격리.

### DB 테이블 설계

```sql
CREATE TABLE strategy_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  user_id UUID NOT NULL REFERENCES users(id),
  stock_code VARCHAR(20) NOT NULL,
  title VARCHAR(200),
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX strategy_notes_user_stock_idx ON strategy_notes(company_id, user_id, stock_code);
```

### API 패턴 (기존 strategy.ts 확장)

기존 패턴 그대로:
- `authMiddleware` → `tenant.companyId`, `tenant.userId`
- `zValidator` + Zod 스키마
- UUID params에 반드시 `z.string().uuid()` 검증
- 에러코드: `STRATEGY_020` ~ `STRATEGY_029` 범위 사용

### 프론트엔드 배치

현재 ChartPanel은 시세 헤더 Card + 차트 Card로 구성. 차트 Card 아래에 NotesPanel을 추가:
```
ChartPanel (p-4 h-full flex flex-col gap-3)
├── Card: 시세 헤더 (shrink-0)
├── Card: 캔들스틱 차트 (flex-1 min-h-0) → 높이 줄여서 min-h-[200px]
└── NotesPanel: 노트 목록 + 편집 (shrink-0, max-h-[40%])
```

### 마크다운 편집기

이미 프로젝트에 `markdown-renderer` 컴포넌트가 존재 (`chat-area`에서 사용). 동일한 렌더러를 노트 미리보기에 재사용. 편집은 단순 `<textarea>`로 충분.

### 이전 스토리 학습사항

- **10-1**: UUID params에 zValidator 필수, 중첩 button 금지
- **10-2**: metadata JSONB 패턴, strategy 마커
- **10-3**: 종목코드 정규식 검증 (`/^[A-Za-z0-9]{1,20}$/`), URL 인코딩, Promise.allSettled 병렬

### 파일 구조

```
수정 파일:
  packages/server/src/db/schema.ts (strategyNotes 테이블 추가)
  packages/server/src/routes/workspace/strategy.ts (노트 CRUD API 추가)
  packages/app/src/components/strategy/chart-panel.tsx (NotesPanel 통합)
신규 파일:
  packages/server/src/db/migrations/0013_*.sql (마이그레이션)
  packages/app/src/components/strategy/notes-panel.tsx (노트 UI)
```

### 이 스토리에서 하지 않는 것

- 노트 공유 (개인 메모만)
- 노트 검색 (목록만)
- 노트에 이미지/파일 첨부
- AI 요약/분석 연동 (채팅 에이전트가 이미 있음)

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- strategyNotes 테이블 + 0013 마이그레이션 생성
- strategy.ts에 노트 CRUD 4개 엔드포인트 추가 (GET/POST/PATCH/DELETE)
- notes-panel.tsx 신규: 노트 목록 + 인라인 편집 + ConfirmDialog 삭제
- chart-panel.tsx에 NotesPanel 통합 (차트 하단 배치)
- toast import: `@corthex/ui` 사용 (sonner 직접 import 금지)
- ConfirmDialog: isOpen/onConfirm/onCancel/variant="danger" 패턴

### File List
- packages/server/src/db/schema.ts (strategyNotes 테이블 + relations 추가)
- packages/server/src/db/migrations/0013_strategy-notes.sql (신규)
- packages/server/src/routes/workspace/strategy.ts (노트 CRUD API 추가)
- packages/app/src/components/strategy/notes-panel.tsx (신규)
- packages/app/src/components/strategy/chart-panel.tsx (NotesPanel 통합)
