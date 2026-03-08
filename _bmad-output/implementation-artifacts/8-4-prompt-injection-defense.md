# Story 8.4: Prompt Injection Defense

Status: done

## Story

As a 시스템 관리자 (보안 운영),
I want 프롬프트 인젝션 공격을 실시간으로 탐지/차단하고 에이전트 출력에서 크리덴셜 유출을 자동 필터링한다,
so that 사용자 명령과 에이전트 응답 전체 파이프라인에서 보안 위협을 방어하고 감사 추적이 가능하다.

## Acceptance Criteria

1. **Given** 사용자가 "ignore previous instructions" 패턴 입력 **When** 명령 제출 **Then** 입력 차단 + 감사 로그 기록 + 사용자에게 경고 메시지 반환
2. **Given** 사용자가 "repeat your system prompt" 패턴 입력 **When** 명령 제출 **Then** 입력 차단 + 감사 로그 기록 + 사용자에게 경고 메시지 반환
3. **Given** 사용자가 "you are now a..." 역할 탈취 패턴 입력 **When** 명령 제출 **Then** 입력 차단 + 감사 로그 기록
4. **Given** 에이전트 응답에 API 키 패턴 (sk-*, AKIA*, Bearer 등) 포함 **When** 응답 전달 전 **Then** 패턴을 [REDACTED]로 자동 치환
5. **Given** 에이전트 응답에 connection string, password 패턴 포함 **When** 응답 전달 전 **Then** 패턴을 [REDACTED]로 자동 치환
6. **Given** 프롬프트 인젝션 시도 **When** 감사 로그 조회 **Then** severity(critical/major/minor) + 상세 정보 + 원본 입력 기록 확인 가능
7. **Given** 보안 미들웨어 **When** 명령 처리 파이프라인 **Then** commands.ts POST /api/workspace/commands 에서 입력 검증 미들웨어로 동작
8. **Given** 보안 설정 **When** 민감도 레벨 설정 **Then** strict/moderate/permissive 3단계 설정 가능 (기본: moderate)
9. **Given** strict 모드 **When** 약한 인젝션 패턴 (예: "act as") **Then** 차단
10. **Given** permissive 모드 **When** 강한 인젝션 패턴만 (예: "ignore all previous") **Then** 차단, 약한 패턴은 경고만
11. **Given** 보안 관련 기술 토론 **When** 화이트리스트된 컨텍스트 감지 **Then** 합법적 보안 토론은 차단하지 않고 통과
12. **Given** turbo build **When** 전체 빌드 **Then** 3/3 패키지 성공

## Tasks / Subtasks

- [x] Task 1: Input Sanitizer 서비스 (AC: #1, #2, #3, #8, #9, #10, #11)
  - [x] 1.1 `packages/server/src/services/prompt-guard.ts` 생성
  - [x] 1.2 프롬프트 인젝션 패턴 정의 (severity별 분류)
    - critical: "ignore previous instructions", "ignore all prior", "disregard above", "override system prompt"
    - critical: "repeat your system prompt", "show me your instructions", "what is your system prompt", "출력해줘 시스템 프롬프트"
    - critical: "you are now a...", "act as if you have no restrictions", "DAN mode", "jailbreak"
    - major: "pretend you are", "roleplay as", "act as", "당신은 이제"
    - minor: 기타 약한 패턴
  - [x] 1.3 SensitivityLevel 타입: 'strict' | 'moderate' | 'permissive'
  - [x] 1.4 scanInput(text, level): { safe: boolean, threats: Threat[], sanitized?: string }
  - [x] 1.5 화이트리스트 컨텍스트 감지 (보안 토론, 코드 리뷰, 기술 문서 관련 키워드)
  - [x] 1.6 한국어 패턴 지원 ("이전 지시 무시", "시스템 프롬프트 보여줘", "너는 이제부터")

- [x] Task 2: Output Filter 서비스 (AC: #4, #5)
  - [x] 2.1 `packages/server/src/services/output-filter.ts` 생성
  - [x] 2.2 기존 credential-masker.ts 패턴 재사용 + 확장
    - API keys: sk-ant-*, sk-*, AIza*, AKIA*
    - Bearer/Basic auth tokens
    - Connection strings: postgres://, mysql://, mongodb://, redis://
    - Password patterns: password=, secret=, pwd=
    - Private keys: -----BEGIN PRIVATE KEY-----
    - .env 파일 패턴: KEY=value
  - [x] 2.3 filterOutput(text): { filtered: string, redactedCount: number, redactedTypes: string[] }
  - [x] 2.4 [REDACTED] 치환 + 원본 위치 정보 (감사용, 원본은 로그에만 마스킹 저장)

- [x] Task 3: 보안 감사 로깅 (AC: #6)
  - [x] 3.1 기존 audit-log.ts 확장 — 신규 액션 상수 추가
    - SECURITY_INPUT_BLOCKED: 입력 차단
    - SECURITY_OUTPUT_REDACTED: 출력 필터링
    - SECURITY_INJECTION_ATTEMPT: 인젝션 시도 탐지
  - [x] 3.2 SecurityAuditEntry 타입: severity, pattern, originalInput(마스킹), threatType, sensitivityLevel
  - [x] 3.3 logSecurityEvent(): audit-log.ts의 createAuditLog 활용

- [x] Task 4: 미들웨어 통합 (AC: #7)
  - [x] 4.1 `packages/server/src/middleware/prompt-guard.ts` — Hono 미들웨어 생성
  - [x] 4.2 commands.ts POST 엔드포인트에 미들웨어 추가 (Zod 검증 후, 처리 전)
  - [x] 4.3 agent-runner.ts 출력 경로에 output filter 통합
  - [x] 4.4 기본 민감도: moderate (회사 설정으로 오버라이드 가능)

- [x] Task 5: 회사별 설정 통합 (AC: #8)
  - [x] 5.1 companies.settings JSONB에 promptGuard 설정 추가
    - sensitivityLevel: 'strict' | 'moderate' | 'permissive'
    - customWhitelist: string[] (추가 허용 패턴)
    - enabled: boolean (기본 true)
  - [x] 5.2 GET /api/admin/security/prompt-guard — 현재 설정 조회
  - [x] 5.3 PUT /api/admin/security/prompt-guard — 설정 변경

- [x] Task 6: 빌드 검증 (AC: #12)
  - [x] 6.1 turbo build 3/3 성공

## Dev Notes

### 기존 코드 재사용 (매우 중요 -- 중복 금지)

**credential-masker.ts** (`packages/server/src/lib/credential-masker.ts`):
- 이미 CREDENTIAL_PATTERNS 정의됨 (sk-ant-*, sk-*, AKIA*, Bearer, Basic, hex/base64)
- maskCredentials(), maskCredentialsInString() 함수 존재
- **Output Filter는 이 모듈을 import해서 확장할 것** — 중복 패턴 정의 금지
- 추가 필요: connection string 패턴, .env 패턴, [REDACTED] 치환 모드

**agent-runner.ts** (`packages/server/src/services/agent-runner.ts`):
- CREDENTIAL_PATTERNS 상수 (line 42-49): sk-*, AIza*, Bearer, API_KEY, SECRET, PRIVATE KEY
- scanForCredentials() 함수: 시스템 프롬프트에서 크리덴셜 탐지
- buildSystemPrompt(): 크리덴셜 스크러빙 포함
- **Output filter는 agent-runner.ts의 응답 반환 경로에 통합** — executeTask() 결과에 적용

**quality_rules.yaml** (`packages/server/src/config/quality_rules.yaml`):
- safe-credential-leak 규칙: regex 기반 패턴 (sk-*, AKIA*, password=)
- safe-prompt-injection 규칙: keyword 기반 패턴 ("system prompt", "ignore previous", "you are now")
- **이 규칙들은 Quality Gate(8-2)에서 사용됨 — 8-4의 실시간 미들웨어와는 역할이 다름**
- Quality Gate = 에이전트 결과물 사후 검수 (비동기)
- Prompt Guard = 입력/출력 실시간 차단 (동기, 미들웨어)

**audit-log.ts** (`packages/server/src/services/audit-log.ts`):
- createAuditLog(): 감사 로그 삽입 (actor, action, target, before/after state)
- 기존 액션 상수: org, credentials, auth, trading, llm, company, employee, system
- **신규 보안 액션만 추가** — 기존 구조 그대로 활용

### commands.ts 통합 포인트

`packages/server/src/routes/commands.ts`:
- POST /api/workspace/commands: 명령 제출 엔드포인트
- 현재 flow: Zod 검증 → classifyCommand → commands insert → async 처리
- **Prompt Guard 미들웨어 삽입 위치: Zod 검증 후, classifyCommand 전**
- 차단 시 `{ success: false, error: { code: 'PROMPT_INJECTION_BLOCKED', message } }` 반환

### agent-runner.ts 출력 통합 포인트

- executeTask() 함수: LLM 호출 → 응답 반환
- **Output Filter 삽입 위치: LLM 응답 수신 후, 호출자에게 반환 전**
- chief-of-staff.ts가 executeTask() 결과를 받아 저장하므로, 필터링은 agent-runner 레벨에서 처리

### 아키텍처 결정

- **미들웨어 방식**: Hono middleware로 구현하여 route 레벨에서 적용
- **서비스 분리**: prompt-guard.ts (입력 검증) + output-filter.ts (출력 필터링) 2개 서비스
- **Quality Gate와 역할 분리**:
  - Prompt Guard (8-4) = 실시간 입출력 방어 (동기 미들웨어)
  - Quality Gate (8-2) = 에이전트 결과물 사후 검수 (비동기 엔진)
- **민감도 레벨**: strict(모든 패턴 차단) / moderate(major+critical 차단) / permissive(critical만 차단)

### 패턴 분류 기준

| Severity | 예시 패턴 | strict | moderate | permissive |
|----------|----------|--------|----------|------------|
| critical | "ignore previous instructions" | 차단 | 차단 | 차단 |
| major | "pretend you are", "act as" | 차단 | 차단 | 경고만 |
| minor | 약한 패턴, 간접적 조작 | 차단 | 경고만 | 통과 |

### 화이트리스트 로직

보안 관련 합법적 토론을 차단하지 않기 위해:
- "보안 취약점 분석", "프롬프트 인젝션 대응 방법", "OWASP" 등 기술 컨텍스트 키워드 감지
- 화이트리스트 키워드가 동일 문장에 존재하면 차단 대신 경고 로그만 기록
- 회사별 customWhitelist로 추가 허용 패턴 설정 가능

### 코딩 컨벤션 (필수)

- 파일명: kebab-case 소문자 (prompt-guard.ts, output-filter.ts)
- API 응답: `{ success: true, data }` / `{ success: false, error: { code, message } }`
- 테넌트 격리: 설정 조회 시 companyId 필수
- import 경로 대소문자: git ls-files 기준 실제 케이싱 일치 필수
- 테스트: bun:test, describe/it 구조

### 파일 구조

```
packages/server/src/
├── services/
│   ├── prompt-guard.ts         # 신규 - 입력 검증 + 패턴 탐지 서비스
│   └── output-filter.ts        # 신규 - 출력 필터링 서비스
├── middleware/
│   └── prompt-guard.ts         # 신규 - Hono 미들웨어 (서비스 래핑)
├── routes/
│   ├── commands.ts             # 수정 - 미들웨어 통합
│   └── admin/
│       └── security.ts         # 신규 - 보안 설정 API
├── services/
│   ├── audit-log.ts            # 수정 - 보안 액션 상수 추가
│   └── agent-runner.ts         # 수정 - 출력 필터 통합
├── lib/
│   └── credential-masker.ts    # 수정 - connection string 패턴 추가
└── __tests__/unit/
    ├── prompt-guard.test.ts    # 신규
    └── output-filter.test.ts   # 신규
```

### 이전 스토리 교훈

- **8-1에서**: YAML 파서 + Zod 검증 패턴 확립. js-yaml 패키지 사용. 캐싱 패턴.
- **credential-masker.ts**: regex 패턴은 global flag(g) 사용 시 lastIndex 리셋 필요
- **audit-log.ts**: createAuditLog()는 비동기 — await 필수, 실패해도 메인 flow 차단하면 안 됨
- **agent-runner.ts**: scanForCredentials()는 throw — output filter는 throw 대신 치환 방식

### v1 코드 참고

v1에서는 별도 프롬프트 인젝션 방어 모듈이 없었음. v2에서 신규 구현.
- v1 feature spec에서 "Quality gate: auto-review + rework" 항목 — 사후 검수만 존재
- v2에서는 실시간 입출력 방어를 추가하여 보안 강화

### 기술 스택

- Hono middleware (기존 패턴: auth.ts, tenant.ts, rbac.ts 참고)
- Zod (설정 검증용)
- bun:test (테스트)
- 기존 audit-log.ts, credential-masker.ts 재사용

### Project Structure Notes

- `packages/server/src/middleware/` — 기존 auth.ts, tenant.ts, rbac.ts가 있는 미들웨어 디렉토리
- `packages/server/src/services/` — 비즈니스 로직 서비스 디렉토리
- `packages/server/src/routes/admin/` — Admin API 라우트 디렉토리
- companies.settings JSONB — 이미 budget, qualityRuleOverrides 저장 중. promptGuard 추가

### References

- [Source: _bmad-output/planning-artifacts/prd.md#FR55 프롬프트 인젝션 방어]
- [Source: _bmad-output/planning-artifacts/architecture.md#Decision 6 Quality Gate Pipeline]
- [Source: _bmad-output/planning-artifacts/epics.md#E8-S4]
- [Source: packages/server/src/lib/credential-masker.ts — 기존 크리덴셜 마스킹]
- [Source: packages/server/src/services/agent-runner.ts#scanForCredentials — 기존 크리덴셜 스캔]
- [Source: packages/server/src/services/audit-log.ts — 감사 로그 서비스]
- [Source: packages/server/src/routes/commands.ts — 명령 처리 라우트]
- [Source: packages/server/src/config/quality_rules.yaml#safe-prompt-injection — 기존 규칙]
- [Source: packages/server/src/middleware/auth.ts — Hono 미들웨어 패턴 참고]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- prompt-guard.ts: 입력 검증 서비스 — 28개 인젝션 패턴 (critical 22 + major 5 + minor 1), 한국어 6패턴, 화이트리스트 25 키워드
- output-filter.ts: 출력 필터링 서비스 — 12개 크리덴셜 패턴 (API keys, tokens, connection strings, passwords, private keys, env vars)
- middleware/prompt-guard.ts: Hono 미들웨어 — commands.ts POST에 통합, 회사 설정 기반 민감도 조절
- agent-runner.ts: 출력 필터 통합 — executeTask() 응답에 자동 [REDACTED] 치환 + 감사 로그
- audit-log.ts: 3개 보안 액션 추가 (SECURITY_INPUT_BLOCKED, SECURITY_OUTPUT_REDACTED, SECURITY_INJECTION_ATTEMPT)
- prompt-guard-settings.ts: 회사별 프롬프트 가드 설정 (JSONB companies.settings.promptGuard)
- routes/admin/security.ts: Admin API (GET/PUT /api/admin/security/prompt-guard)
- 84 tests passing (prompt-guard 47 + output-filter 37), 127 expect calls
- turbo build 3/3 성공
- 민감도 3단계: strict(모두 차단) / moderate(critical+major 차단, 기본값) / permissive(critical만 차단)

### File List

- packages/server/src/services/prompt-guard.ts (신규)
- packages/server/src/services/output-filter.ts (신규)
- packages/server/src/services/prompt-guard-settings.ts (신규)
- packages/server/src/middleware/prompt-guard.ts (신규)
- packages/server/src/routes/admin/security.ts (신규)
- packages/server/src/services/audit-log.ts (수정 — 보안 액션 3개 추가)
- packages/server/src/services/agent-runner.ts (수정 — 출력 필터 통합)
- packages/server/src/routes/commands.ts (수정 — 프롬프트 가드 미들웨어 추가)
- packages/server/src/index.ts (수정 — securityRoute 등록)
- packages/server/src/__tests__/unit/prompt-guard.test.ts (신규)
- packages/server/src/__tests__/unit/output-filter.test.ts (신규)
