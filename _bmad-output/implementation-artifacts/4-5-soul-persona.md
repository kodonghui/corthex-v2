# Story 4.5: Soul Persona

Status: done

## Story

As a 일반 직원(유저),
I want 에이전트의 소울(성격/역할/말투)을 마크다운 편집기로 편리하게 편집하고 실시간 미리보기를 확인하며, 변경사항이 실제 대화에 반영되는 것을 확인한다,
so that 에이전트의 응답 스타일을 내 업무에 맞게 커스터마이즈하고, 잘못 편집했을 때 원래 소울로 복원할 수 있다.

## Acceptance Criteria

1. **Given** 설정 > 소울 탭 진입 **When** 에이전트 선택 **Then** 좌: 마크다운 편집기 / 우: 마크다운 미리보기 (50/50 분할). 모바일: `[편집][미리보기]` 탭 전환
2. **Given** 소울 편집 중 **When** 입력할 때마다 **Then** 우하단 `XXX / 2000자` 실시간 카운터 표시. 2000자 초과 시 amber 색상
3. **Given** 소울 변경됨 **When** 저장하지 않고 다른 탭/페이지 이동 시도 **Then** "저장하지 않은 변경사항이 있습니다" ConfirmDialog 표시 (useBlocker)
4. **Given** 소울 편집 후 **When** [저장] 버튼 클릭 **Then** DB 업데이트 + Toast "소울이 업데이트되었습니다. 다음 대화부터 반영됩니다."
5. **Given** 저장된 소울 존재 **When** [초기화 ↺] 버튼 클릭 **Then** ConfirmDialog 표시 후 확인 시 관리자가 설정한 원본 소울로 복원
6. **Given** 소울이 변경된 상태 **When** 다음 채팅 메시지 전송 **Then** 변경된 소울이 시스템 프롬프트에 반영됨

## Tasks / Subtasks

- [x] Task 1: 서버 — 소울 초기화 API + admin_soul 컬럼 (AC: #5)
  - [x] agents 테이블에 `admin_soul` 컬럼 추가 (관리자가 설정한 원본 소울 보존용)
  - [x] 마이그레이션 생성: 기존 soul 값을 admin_soul에 복사
  - [x] POST /workspace/agents/:id/soul/reset API 구현 — admin_soul 값으로 soul 복원
  - [x] 관리자 에이전트 수정(PATCH /admin/agents/:id) 시 admin_soul도 동시 업데이트
- [x] Task 2: 프론트엔드 — 소울 편집기 개선 (AC: #1, #2, #3, #4)
  - [x] AgentSoulSection 리팩토링: 기존 textarea → SoulEditor 컴포넌트 분리
  - [x] 편집기/미리보기 50/50 분할 레이아웃 (데스크톱: 나란히, 모바일: 탭 전환)
  - [x] 마크다운 미리보기: `react-markdown` 으로 실시간 렌더링
  - [x] 글자 수 카운터: `XXX / 2000자` (2000자 초과 시 amber)
  - [x] 미저장 변경사항 감지 + 상단 배너 표시 + useBlocker 이탈 방지
- [x] Task 3: 프론트엔드 — 소울 초기화 기능 (AC: #5)
  - [x] [초기화 ↺] 버튼 + ConfirmDialog
  - [x] POST /agents/:id/soul/reset 호출 → 편집기에 admin_soul 로드
- [x] Task 4: 빌드 + 기존 테스트 통과 확인
  - [x] `turbo build` 3/3 성공 (settings 번들 133KB)
  - [x] `bun test src/__tests__/unit/` 69 pass, 0 fail

## Dev Notes

### 현재 상태 분석

현재 `AgentSoulSection` (settings.tsx:384-439)에 기본 textarea 기반 소울 편집기가 있음:
- 에이전트 선택 드롭다운 → 소울 로드 → textarea 편집 → 저장
- 미리보기 없음, 글자 수 카운터 없음, 이탈 방지 없음, 초기화 없음

### 서버 변경

**admin_soul 컬럼:**
```sql
ALTER TABLE agents ADD COLUMN admin_soul text;
UPDATE agents SET admin_soul = soul WHERE admin_soul IS NULL;
```

**초기화 API:**
```typescript
// POST /workspace/agents/:id/soul/reset
const [agent] = await db
  .select({ adminSoul: agents.adminSoul })
  .from(agents)
  .where(eq(agents.id, id))
const [updated] = await db
  .update(agents)
  .set({ soul: agent.adminSoul, updatedAt: new Date() })
  .where(eq(agents.id, id))
  .returning()
```

**관리자 수정 시 admin_soul 동시 업데이트:**
기존 PATCH /admin/agents/:id에서 soul이 포함되면 admin_soul도 동일 값으로 설정.

### 프론트엔드 — SoulEditor 컴포넌트

```
packages/app/src/components/settings/soul-editor.tsx  ← 새 파일
```

**레이아웃:**
```
데스크톱 (md 이상):
┌─ 편집기 ─────────┐  ┌─ 미리보기 ──────────┐
│ textarea/codemirror│  │ react-markdown 렌더  │
│             247자  │  └─────────────────────┘
└──────────────────┘

모바일:
[편집] [미리보기]  ← 탭 전환
```

**CodeMirror 대신 textarea 사용 (단순화):**
UX 스펙에서 CodeMirror를 권장하지만, P1 단계에서는 textarea + font-mono로 충분. CodeMirror는 Phase F(P3)에서 도입 가능. 글자 수 카운터와 미리보기만 구현하면 핵심 UX는 달성됨.

**react-markdown 설치:**
이미 설치되어 있는지 확인 필요. 없으면 `bun add react-markdown` 실행.

**useBlocker 패턴:**
```typescript
import { useBlocker } from 'react-router-dom'

const blocker = useBlocker(
  ({ currentLocation, nextLocation }) =>
    isDirty && currentLocation.pathname !== nextLocation.pathname
)

// blocker.state === 'blocked' 일 때 ConfirmDialog 표시
```

### 기존 코드 주의사항

- `PATCH /workspace/agents/:id/soul` API는 이미 구현됨 (agents.ts:63-96). 변경 불필요.
- `GET /workspace/agents/:id` 에서 soul 반환 중. admin_soul도 추가 반환 필요.
- chat-area.tsx에서 soul은 서버 측 시스템 프롬프트에서 사용되므로 프론트엔드 변경 불필요 (AC #6은 서버에서 이미 동작).
- settings.tsx의 `AgentSoulSection`을 SoulEditor 컴포넌트로 교체.

### Project Structure Notes

```
packages/server/src/
├── db/schema.ts              ← admin_soul 컬럼 추가
├── routes/workspace/agents.ts ← POST /soul/reset + admin_soul 반환
├── routes/admin/agents.ts     ← soul 수정 시 admin_soul 동시 업데이트
packages/app/src/
├── pages/settings.tsx         ← AgentSoulSection → SoulEditor 연결
├── components/settings/
│   └── soul-editor.tsx        ← 새 파일: 에디터 + 미리보기 + 카운터
```

### References

- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#소울 편집 탭] — 소울 편집기 UX 사양
- [Source: packages/server/src/routes/workspace/agents.ts] — 기존 PATCH /soul API
- [Source: packages/server/src/lib/ai.ts#89] — 시스템 프롬프트에서 soul 사용
- [Source: packages/app/src/pages/settings.tsx#384-439] — 기존 AgentSoulSection
- [Source: packages/server/src/db/schema.ts#98] — agents.soul 컬럼

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Completion Notes List

- admin_soul 컬럼 추가 + 마이그레이션 (기존 soul → admin_soul 복사)
- POST /workspace/agents/:id/soul/reset API 구현
- 관리자 에이전트 수정 시 admin_soul 동시 업데이트
- SoulEditor 컴포넌트 신규: 50/50 편집기+미리보기, 글자 수 카운터, useBlocker 이탈 방지
- react-markdown 설치 + 실시간 마크다운 미리보기
- settings.tsx AgentSoulSection → SoulEditor 교체

### File List

- packages/server/src/db/schema.ts — admin_soul 컬럼 추가
- packages/server/src/db/migrations/0008_flaky_black_tarantula.sql — admin_soul 마이그레이션
- packages/server/src/routes/workspace/agents.ts — POST /soul/reset API + adminSoul 반환
- packages/server/src/routes/admin/agents.ts — admin_soul 동시 업데이트
- packages/app/src/components/settings/soul-editor.tsx — 새 SoulEditor 컴포넌트
- packages/app/src/pages/settings.tsx — SoulEditor 연결 + AgentSoulSection 삭제
- packages/app/package.json — react-markdown 의존성 추가
