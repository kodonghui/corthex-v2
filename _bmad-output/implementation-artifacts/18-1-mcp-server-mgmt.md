# Story 18.1: MCP 서버 관리

Status: done

## Story

As a 워크스페이스 일반 유저,
I want 설정 페이지에서 MCP 서버를 등록/테스트/삭제하고 도구 목록을 확인,
so that 에이전트가 외부 MCP 도구를 사용할 수 있게 된다.

## Acceptance Criteria

1. **Given** 설정 페이지 **When** 탭 목록 표시 **Then** 기존 6개 탭 뒤에 "MCP" 탭(value: `mcp`, shortLabel: `MCP`)이 추가되어 총 7개 탭 표시
2. **Given** MCP 탭 활성화 **When** `GET /api/workspace/settings/mcp` 호출 **Then** 현재 유저의 companyId에 속한 mcpServers 목록 반환 (isActive=true만). 빈 목록이면 빈 상태 UI 표시
3. **Given** MCP 탭 **When** `[+ 서버 추가]` 클릭 **Then** 등록 폼 표시: URL(필수, http/https만), 이름(필수, URL blur 시 자동 제안). URL에 localhost 감지 시 경고 Toast
4. **Given** 등록 폼 **When** `[연결 테스트]` 클릭 **Then** `POST /api/workspace/settings/mcp/test {url}` 호출. 성공: "연결 성공 (도구 N개 발견)" 녹색. 실패: "연결 실패: {오류}" 빨간색. 로딩 중 spinner
5. **Given** 등록 폼 **When** `[등록]` 클릭 **Then** `POST /api/workspace/settings/mcp {name, url}` 호출. 성공 시 목록 갱신 + Toast "MCP 서버가 등록되었습니다"
6. **Given** 서버 10개 등록됨 **When** `[+ 서버 추가]` 버튼 **Then** disabled + "최대 10개까지 등록 가능합니다" 안내
7. **Given** 서버 카드 **When** 삭제 아이콘 클릭 **Then** ConfirmDialog 표시 후 `DELETE /api/workspace/settings/mcp/:id` 호출. 성공 시 목록에서 제거
8. **Given** 서버 카드 클릭 **When** 아코디언 펼침 **Then** `GET /api/workspace/settings/mcp/:id/tools` lazy 호출. 도구명(font-mono) + 설명 표시. 로딩 중 skeleton
9. **Given** 페이지 진입 **When** 서버 목록 로드 **Then** 각 서버 연결 상태(connected/disconnected/error) dot 표시 (1회 ping)
10. **Given** `turbo build type-check` **When** 전체 빌드 **Then** 8/8 success, 타입 에러 0건

## Tasks / Subtasks

- [x] Task 1: 서버 API — MCP CRUD 라우트 (AC: #2, #5, #7)
  - [x] `packages/server/src/routes/workspace/settings-mcp.ts` 신규 생성
  - [x] `GET /settings/mcp` — companyId 기반 mcpServers 목록 조회 (isActive=true)
  - [x] `POST /settings/mcp` — name, url 등록 (zValidator). transport 기본값 'stdio'. companyId는 JWT에서 추출. 10개 제한 체크
  - [x] `DELETE /settings/mcp/:id` — soft delete (isActive=false). companyId 테넌트 격리 확인
  - [x] index.ts에 라우트 등록: `app.route('/api/workspace/settings', settingsMcpRoute)`

- [x] Task 2: 서버 API — 연결 테스트 + 도구 목록 (AC: #4, #8)
  - [x] `POST /settings/mcp/test` — url 파라미터로 HTTP HEAD/GET 요청 stub. 성공 시 `{ success: true, toolCount: 0 }`, 실패 시 에러 메시지
  - [x] `GET /settings/mcp/:id/tools` — stub 응답 `{ tools: [] }` (실제 MCP 프로토콜 연동은 18-2에서)
  - [x] 연결 상태 ping: `GET /settings/mcp/:id/ping` — url로 HEAD 요청 시도, status 반환

- [x] Task 3: 프론트엔드 — settings.tsx MCP 탭 추가 (AC: #1)
  - [x] TABS 배열에 `{ value: 'mcp', label: 'MCP 연동', shortLabel: 'MCP' }` 추가 (disabled 아님)
  - [x] `activeTab === 'mcp'` 분기에서 `<SettingsMcp />` 컴포넌트 렌더
  - [x] URL 파라미터 `?tab=mcp` 지원 (기존 패턴과 동일)

- [x] Task 4: 프론트엔드 — settings-mcp.tsx 컴포넌트 (AC: #2, #3, #5, #6, #7, #8, #9)
  - [x] `packages/app/src/components/settings/settings-mcp.tsx` 신규 생성
  - [x] 서버 목록: useQuery로 `GET /settings/mcp` 호출. 카드 형태 표시 (이름, URL, 연결 상태 dot, 도구 수, 삭제 아이콘)
  - [x] 서버 추가 폼: URL 입력(http/https 검증) + 이름 입력(URL blur 시 자동 제안) + [연결 테스트] + [등록]
  - [x] 10개 제한: 서버 수 >= 10이면 추가 버튼 disabled + 안내 텍스트
  - [x] localhost 경고: URL에 localhost 포함 시 Toast 경고
  - [x] 아코디언 도구 목록: 카드 클릭 시 lazy로 도구 목록 fetch. skeleton 로딩
  - [x] 삭제: ConfirmDialog 사용 (기존 패턴)
  - [x] 빈 상태: "연결된 MCP 서버가 없습니다" 메시지 + 추가 버튼
  - [x] 연결 상태 ping: 페이지 진입 시 각 서버 ping 1회

- [x] Task 5: 빌드 검증 (AC: #10)
  - [x] `bunx turbo build type-check` → 8/8 success

## Dev Notes

### DB 스키마 (이미 존재 — 건드리지 않음)

`mcpServers` 테이블은 Epic 17-1 (Story 17-1)에서 이미 정의됨:
```
packages/server/src/db/schema.ts:666-676
- id: uuid PK
- companyId: uuid FK→companies
- name: varchar(100)
- url: text
- transport: varchar(20) default 'stdio'
- config: jsonb nullable
- isActive: boolean default true
- createdAt: timestamp
- updatedAt: timestamp
```
마이그레이션 0019에 CREATE TABLE SQL 이미 존재. **새 마이그레이션 불필요.**

### 서버 API 패턴 참고 — soul-templates 라우트

`packages/server/src/routes/admin/soul-templates.ts` 패턴을 따르되:
- **admin 미들웨어 대신 workspace 미들웨어 사용** (authMiddleware만, adminOnly 없음)
- companyId를 `c.get('user').companyId`에서 추출 (JWT 기반)
- zValidator로 입력 검증
- `eq(mcpServers.companyId, companyId)` 테넌트 격리
- soft delete: `isActive = false`로 업데이트 (물리 삭제 아님)

### 라우트 등록 위치

`packages/server/src/index.ts`에 라우트 추가:
```typescript
import { settingsMcpRoute } from './routes/workspace/settings-mcp'
// ...
app.route('/api/workspace/settings', settingsMcpRoute)
```
기존 workspace 라우트 패턴과 동일 (83-99번째 줄 참고).

### 프론트엔드 설정 탭 구조

`packages/app/src/pages/settings.tsx:52-59` TABS 배열:
```typescript
const TABS: TabItem[] = [
  { value: 'api', label: 'API 연동', shortLabel: 'API' },
  { value: 'telegram', label: '텔레그램', shortLabel: '텔레' },
  { value: 'soul', label: '소울 편집', shortLabel: '소울' },
  { value: 'files', label: '파일 관리', shortLabel: '파일', disabled: true },
  { value: 'trading', label: '매매 설정', shortLabel: '매매', disabled: true },
  { value: 'notifications', label: '알림 설정', shortLabel: '알림', disabled: true },
  // 여기에 MCP 탭 추가
]
```

### UX 설계 핵심 사항 (ux-design-specification.md:2063-2108)

1. **MCP 탭 위치**: 설정 페이지 6번째(또는 마지막) 탭. 모바일 레이블 "MCP" 그대로
2. **서버 URL**: Streamable HTTP `http://host:port/mcp` 또는 SSE `http://host:port/sse`. http/https만 허용
3. **등록 최대 수**: 계정당(companyId당) 10개
4. **서버 이름 자동 제안**: URL blur 시 이름 필드 자동 채움 (예: `http://localhost:3000/sse` → `localhost-3000`)
5. **연결 테스트**: `POST /settings/mcp/test {url}`. 성공: 녹색 "연결 성공 (도구 N개 발견)". 실패: 빨간색
6. **연결 상태 dot**: connected(녹), disconnected(회), error(빨). 페이지 진입 시 자동 ping
7. **도구 목록**: 카드 클릭 아코디언. lazy 호출. 도구명 `font-mono text-sm` + 설명 `text-xs text-zinc-500`
8. **삭제**: 카드 우측 휴지통 아이콘. ConfirmDialog
9. **빈 상태**: "연결된 MCP 서버가 없습니다. 서버를 추가하면 에이전트가 외부 도구를 사용할 수 있습니다." + `[+ 서버 추가]`

### 연결 테스트/도구 목록 — Stub 구현

이 스토리에서는 **stub**으로 구현:
- `POST /settings/mcp/test`: URL로 간단한 HTTP HEAD 요청 시도. 응답 있으면 success, 없으면 fail. toolCount는 0 고정
- `GET /settings/mcp/:id/tools`: 빈 배열 `{ tools: [] }` 반환
- **실제 MCP 프로토콜 연동은 Story 18-2 (mcp-tool-exec)에서 구현**

### API 경로 요약

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/workspace/settings/mcp` | 서버 목록 |
| POST | `/api/workspace/settings/mcp` | 서버 등록 |
| DELETE | `/api/workspace/settings/mcp/:id` | 서버 삭제 (soft) |
| POST | `/api/workspace/settings/mcp/test` | 연결 테스트 |
| GET | `/api/workspace/settings/mcp/:id/tools` | 도구 목록 (stub) |

### 기존 코드 패턴 재사용

1. **zValidator 패턴** → soul-templates.ts, nexus.ts 참고
2. **테넌트 격리** → `eq(mcpServers.companyId, companyId)` (모든 admin/workspace 라우트 동일)
3. **useQuery/useMutation** → settings.tsx 기존 API 호출 패턴
4. **ConfirmDialog** → 기존 삭제 패턴 (messenger, files 등)
5. **Toast** → `@corthex/ui`의 `toast` 함수
6. **Tabs 컴포넌트** → `@corthex/ui`의 `Tabs` + `TabItem` 타입
7. **카드 레이아웃** → WorkflowListPanel의 카드 패턴 참고

### Project Structure Notes

```
packages/server/src/
  routes/workspace/settings-mcp.ts    <- 신규: MCP CRUD + 테스트 + 도구 API
  index.ts                            <- 수정: settingsMcpRoute 등록
  db/schema.ts                        <- 변경 없음 (mcpServers 이미 존재)

packages/app/src/
  pages/settings.tsx                  <- 수정: MCP 탭 추가
  components/settings/settings-mcp.tsx <- 신규: MCP 설정 UI
```

### References

- [Source: packages/server/src/db/schema.ts:666-676] — mcpServers 테이블 정의
- [Source: packages/server/src/routes/admin/soul-templates.ts] — CRUD 라우트 패턴
- [Source: packages/server/src/index.ts:61-99] — 라우트 등록 패턴
- [Source: packages/app/src/pages/settings.tsx:52-59] — TABS 배열
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md:2063-2108] — MCP 연동 탭 UX 상세
- [Source: _bmad-output/implementation-artifacts/17-1-p4-db-schema-ws.md] — mcpServers DB 스키마 정의 완료
- [Source: _bmad-output/implementation-artifacts/17-5-nexus-mobile-access.md] — 이전 에픽 마지막 스토리

### Previous Story Intelligence (Epic 17-5)

- 순수 프론트엔드 모바일 반응형 작업이었음 (DB/API 변경 없음)
- 모바일 패턴: hidden md:block, fixed bottom-0, animate-slide-up, 더보기 드롭다운
- turbo build 8/8 success, 2161+ unit tests 유지
- 이번 스토리는 서버 API + 프론트 신규 — 별도 마이그레이션 불필요

### Git Intelligence

Recent commits:
- `4939550` docs: Epic 17 회고 완료
- `26972d2` feat: Story 17-5 NEXUS 모바일 접근
- `2381ebc` feat: Story 17-4 NEXUS 템플릿 공유
- `b2a8eca` feat: Story 17-3 워크플로우 편집 + 실행
- `f917a50` feat: Story 17-2 NEXUS 캔버스 베이스

커밋 메시지 패턴: `feat: Story X-Y 한글 제목 — 핵심 변경 요약 + TEA N건`

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: settings-mcp.ts 라우트 — GET/POST/DELETE MCP CRUD + zValidator + 10개 제한 + 테넌트 격리 + soft delete
- Task 2: 연결 테스트(POST /mcp/test) HTTP HEAD stub + 도구 목록(GET /mcp/:id/tools) 빈 배열 stub + ping 엔드포인트
- Task 3: settings.tsx TABS에 MCP 탭 추가 + SettingsMcp 컴포넌트 렌더 + max-w-3xl 적용
- Task 4: settings-mcp.tsx — 서버 카드 목록 + 추가 폼(URL/이름/테스트/등록) + 아코디언 도구 + 연결 상태 dot + 10개 제한 + localhost 경고 + 빈 상태
- Task 5: turbo build type-check 8/8 success + 38 unit tests pass
- Code Review: SSRF 방지(isPrivateUrl), 이중 fetch 수정(safeFetch), DELETE isActive 체크 추가 — 3건 자동 수정

### File List

- packages/server/src/routes/workspace/settings-mcp.ts (신규 — MCP CRUD + 테스트 + 도구 + ping API + SSRF 방지)
- packages/server/src/index.ts (수정 — settingsMcpRoute 임포트 + 라우트 등록)
- packages/app/src/pages/settings.tsx (수정 — MCP 탭 추가 + SettingsMcp 임포트 + max-w 분기)
- packages/app/src/components/settings/settings-mcp.tsx (신규 — MCP 설정 UI 컴포넌트)
- packages/server/src/__tests__/unit/mcp-server-mgmt.test.ts (신규 — 38 tests)
- packages/server/src/__tests__/unit/mcp-server-mgmt-tea.test.ts (신규 — TEA 101 tests)
- packages/server/src/__tests__/unit/mcp-server-mgmt-qa.test.ts (신규 — QA 30 tests)
