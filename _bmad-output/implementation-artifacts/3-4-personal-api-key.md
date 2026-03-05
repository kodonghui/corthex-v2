# Story 3.4: Personal API Key

Status: done

## Story

As a 일반 직원(유저),
I want 설정 페이지에서 서비스별 API 키를 등록/관리하고 싶다,
so that 에이전트가 내 외부 서비스(KIS, 노션, 이메일 등)에 접근할 수 있다.

## Acceptance Criteria

1. **Given** 설정 API 연동 탭 **When** 서비스 선택(KIS/노션/이메일) **Then** 서비스별 필수 필드 폼 표시 (KIS: App Key+App Secret+계좌번호, 노션: API Key, 이메일: 호스트+포트+사용자+비밀번호+발신주소)
2. **Given** API 키 등록 **When** 서버에 저장 요청 **Then** credentials 객체로 전송 (서버 validateCredentials + encryptCredentials 활용)
3. **Given** 등록된 API 키 **When** 목록 표시 **Then** 서비스명 + 상태뱃지(✅연동됨) + 라벨 + 등록일 표시
4. **Given** 등록 폼 하단 **When** 렌더링 **Then** "🔒 모든 키는 서버에서 암호화되어 저장됩니다" 안내 표시
5. **Given** API 키 삭제 **When** 삭제 클릭 **Then** 확인 다이얼로그 후 삭제
6. **Given** 등록/삭제 성공 **When** 목록 갱신 **Then** React Query 캐시 무효화로 즉시 반영

## Tasks / Subtasks

- [x] Task 1: 서비스별 폼 필드 구현 (AC: #1, #4)
  - [x] PROVIDER_FIELDS 맵 정의 (provider → field 배열)
  - [x] 서비스 선택 시 동적 폼 필드 렌더링
  - [x] 🔒 암호화 안내 문구 추가
- [x] Task 2: 등록 로직 수정 (AC: #2)
  - [x] credentials 객체로 변환하여 서버 전송 ({ provider, label, credentials: Record<string,string> })
  - [x] 빈 필드 검증 (필수 필드 모두 입력 확인)
- [x] Task 3: 키 목록 표시 개선 (AC: #3, #5, #6)
  - [x] Badge 컴포넌트로 상태뱃지 표시
  - [x] 삭제 시 confirm 다이얼로그 유지
- [x] Task 4: 빌드 + 기존 테스트 통과 확인
  - [x] `turbo build` 3/3 성공
  - [x] `bun test src/__tests__/unit/` 전체 통과

## Dev Notes

### 핵심: 기존 설정 페이지 API 키 섹션 개선

현재 settings.tsx의 API Key 등록 폼이 단일 "API Key" 입력만 있어 서버의 provider별 필수 필드와 불일치.

### 서버 API

**엔드포인트:** `packages/server/src/routes/workspace/profile.ts`
- `GET /workspace/profile/api-keys` — 목록 (값 숨김)
- `POST /workspace/profile/api-keys` — 등록 `{ provider, label?, credentials: Record<string,string>, scope? }`
- `DELETE /workspace/profile/api-keys/:id` — 삭제

**서버 검증:** `credential-vault.ts`의 PROVIDER_SCHEMAS:
```typescript
kis: ['app_key', 'app_secret', 'account_no']
notion: ['api_key']
smtp: ['host', 'port', 'user', 'password', 'from']  // email → smtp
serper: ['api_key']
instagram: ['access_token', 'page_id']
```

### 프론트 폼 필드 맵

```typescript
const PROVIDER_FIELDS: Record<string, { key: string; label: string; type: string }[]> = {
  kis: [
    { key: 'app_key', label: 'App Key', type: 'password' },
    { key: 'app_secret', label: 'App Secret', type: 'password' },
    { key: 'account_no', label: '계좌번호', type: 'text' },
  ],
  notion: [
    { key: 'api_key', label: 'API Key', type: 'password' },
  ],
  email: [
    { key: 'host', label: 'SMTP 호스트', type: 'text' },
    { key: 'port', label: '포트', type: 'text' },
    { key: 'user', label: '사용자명', type: 'text' },
    { key: 'password', label: '비밀번호', type: 'password' },
    { key: 'from', label: '발신 주소', type: 'email' },
  ],
}
```

### 주의사항

- **서버 provider 이름**: email 프론트 → smtp 서버. 서버가 'email'도 받는지 확인 필요. PROVIDER_SCHEMAS에 'smtp'으로 정의됨
- **scope**: 유저 개인 키이므로 기본 'user'
- **텔레그램/소울 편집 섹션**: 이 스토리에서는 변경하지 않음. Story 3-5에서 탭 구조로 개편

### Project Structure Notes

```
packages/app/src/
├── pages/settings.tsx    ← 수정 (API Key 섹션 개선)
```

### References

- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Section 10.14] — 설정 API 연동 탭
- [Source: packages/server/src/routes/workspace/profile.ts] — workspace profile API
- [Source: packages/server/src/services/credential-vault.ts] — PROVIDER_SCHEMAS, validateCredentials
- [Source: packages/app/src/pages/settings.tsx] — 현재 설정 페이지

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- PROVIDER_FIELDS 맵: kis(3필드), notion(1필드), email(5필드 SMTP) — 서비스 선택 시 동적 폼 렌더링
- 등록 로직: 단일 `key` → `credentials: Record<string,string>` 객체로 변환하여 서버 전송 (버그 수정)
- 필수 필드 검증: allFieldsFilled로 모든 필드 입력 확인 후 등록 버튼 활성화
- Badge 컴포넌트: @corthex/ui Badge variant="success"로 "연동됨" 상태뱃지 표시
- 🔒 암호화 안내: 폼 하단에 "모든 키는 서버에서 암호화되어 저장됩니다" 문구 추가
- 삭제 confirm 다이얼로그 유지, React Query 캐시 무효화 유지
- providerLabels → PROVIDER_LABELS 상수명 변경
- 빌드 3/3 성공, 유닛 테스트 69/69 통과

### File List
- packages/app/src/pages/settings.tsx — PROVIDER_FIELDS 동적 폼, credentials 객체 전송, Badge 컴포넌트, 암호화 안내, 토스트 알림
- packages/server/src/services/credential-vault.ts — email alias 추가 (PROVIDER_SCHEMAS)
- packages/server/src/__tests__/unit/credential-vault.test.ts — email alias 테스트 추가
