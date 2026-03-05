# Story 2.3: CLI Token & API Key Management

Status: ready-for-dev

## Story

As a 관리자,
I want CLI 토큰과 API key를 직원별로 등록/관리하기를,
so that 에이전트가 직원의 CLI 구독으로 실행되고 외부 서비스와 연동할 수 있다.

## Acceptance Criteria

1. **Given** 직원 선택 **When** CLI 토큰 등록 **Then** AES-256-GCM 암호화 후 cli_credentials 저장
2. **Given** CLI 토큰 등록됨 **When** 토큰 목록 조회 **Then** 마스킹된 형태 표시 (sk-ant-oat01-...xxxx)
3. **Given** 회사 **When** 공용 API key 등록 **Then** api_keys 테이블에 userId=null로 암호화 저장
4. **Given** CLI 토큰 **When** 서버에서 복호화 **Then** 원본 토큰 정상 복구 (암호화/복호화 무결성)
5. **Given** credentials 페이지 **When** CLI 토큰/API 키 관리 **Then** 회사 선택 store 기준 표시 (하드코딩 X)
6. **Given** 없는 credential ID **When** 삭제 시도 **Then** 404 에러

## Tasks / Subtasks

- [ ] Task 1: CLI credential 서버 라우트 검증/보강 (AC: #1, #4, #6)
  - [ ] `GET /api/admin/cli-credentials?userId=` — 마스킹된 토큰 반환 확인
  - [ ] `POST /api/admin/cli-credentials` — crypto.ts의 encrypt 함수로 암호화 저장
  - [ ] `DELETE /api/admin/cli-credentials/:id` — 존재하지 않으면 404
  - [ ] 복호화 함수(decrypt) 정상 동작 유닛 테스트
- [ ] Task 2: 공용 API key 지원 (AC: #3)
  - [ ] `POST /api/admin/api-keys` — userId=null 허용 (회사 공용)
  - [ ] UI: "회사 공용 API 키" 섹션을 직원 선택 없이도 볼 수 있도록
- [ ] Task 3: UI 개선 (AC: #2, #5)
  - [ ] 회사 선택 store(2-2에서 생성) 연동 — 하드코딩 `companyData?.data?.[0]?.id` 제거
  - [ ] 토큰 마스킹 표시: `sk-ant-oat01-...{마지막4자}`
  - [ ] 공용 API key 섹션 추가 (직원 선택 상관없이 표시)
- [ ] Task 4: 테스트
  - [ ] 암호화→복호화 라운드트립 테스트 (crypto.ts)
  - [ ] CLI credential CRUD API 테스트
  - [ ] 잘못된 ID 삭제 시 404 테스트

## Dev Notes

### 현재 코드베이스 상태

**이미 존재하는 것:**
- `packages/admin/src/pages/credentials.tsx` — 직원별 CLI 토큰 + API 키 관리 UI
- `packages/server/src/lib/crypto.ts` — AES-256-GCM encrypt/decrypt 함수
- `packages/server/src/lib/credential-vault.ts` — 자격증명 관리 서비스
- `packages/server/src/db/schema.ts` — cli_credentials, api_keys 테이블
- 서버 라우트: `/admin/cli-credentials`, `/admin/api-keys`

**수정 필요:**

| 항목 | 현재 | 목표 |
|------|------|------|
| 회사 선택 | `companyData?.data?.[0]?.id` | admin-store 연동 |
| 공용 API key | userId 필수 | userId=null 허용 |
| 토큰 표시 | 목록에 라벨만 표시 | 마스킹된 토큰 prefix 표시 |

### 파일 변경 범위

```
packages/admin/src/pages/credentials.tsx         — store 연동 + 공용 키 섹션
packages/server/src/routes/admin/credentials.ts  — 공용 API key userId=null
packages/server/src/__tests__/                   — 암호화/복호화 + CRUD 테스트
```

### References

- [Source: packages/admin/src/pages/credentials.tsx] — 현재 UI
- [Source: packages/server/src/lib/crypto.ts] — AES-256-GCM 구현
- [Source: PRD FR-1.4, FR-1.5] — CLI 토큰 등록, 공용 API key

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
