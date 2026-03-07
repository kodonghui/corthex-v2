# Epic 0 회고: Foundation — Multi-tenancy & Auth

**날짜**: 2026-03-07
**에픽 번호**: Epic 0
**에픽 이름**: Foundation — Multi-tenancy & Auth
**FRs**: FR84, FR85, FR86, FR87, FR88
**NFRs**: NFR6, NFR7, NFR8, NFR11, NFR12
**스토리 수**: 4
**전체 테스트 수**: 201건 (43 + 65 + 48 + 45)
**결과**: 전체 완료

---

## Part 1: 에픽 리뷰

### 1.1 에픽 요약

Epic 0은 CORTHEX v2의 멀티 테넌시 기반 인프라를 구축하는 에픽이었습니다. 회사 등록, 사용자 인증, 초대 시스템, 자격증명 보관소, 관리 콘솔 UI까지 4개 스토리를 통해 전체 인증/인가 파이프라인을 완성했습니다.

| 스토리 | 이름 | 테스트 | 상태 |
|--------|------|--------|------|
| 0-1 | Company+Admin 셀프 등록 | 43건 | Done |
| 0-2 | 초대 시스템 (생성/수락/JWT) | 65건 | Done |
| 0-3 | Credential Vault (AES-256-GCM) | 48건 | Done |
| 0-4 | Admin Console UI (통계/검색/편집) | 45건 | Done |

### 1.2 잘한 점 (What Went Well)

**1. 기존 코드 활용 전략이 효과적이었습니다**

Story 0-1은 대부분이 이미 구현되어 있었고(Task 1~8), 팀은 이를 정확히 파악하여 신규 구현이 필요한 부분(self-registration endpoint)만 집중 개발했습니다. 불필요한 중복 작업을 피하고 기존 코드의 무결성을 보존한 좋은 판단이었습니다.

> "Tasks 1-8: Already implemented in existing codebase (verified working)"
> — Story 0-1 Dev Notes

**2. 일관된 코드 패턴 확립**

4개 스토리 모두 동일한 아키텍처 패턴을 따랐습니다:
- Hono route + zValidator 스키마 검증
- authMiddleware / adminOnly / companyAdminOnly 미들웨어 체인
- Drizzle ORM 쿼리 + tenant isolation (companyId 필터)
- HTTPError + 에러 코드 (REG_001, INVITE_001, CRED_001 등)
- TanStack Query + Zustand 상태 관리 (프론트엔드)

이 패턴은 이후 에픽에서도 기본 템플릿으로 재사용됩니다.

**3. 보안 기능이 실제로 동작합니다**

- AES-256-GCM 암호화: 실제 Web Crypto API 사용, per-field 암호화/복호화
- 비밀번호 해싱: Bun.password.hash() 사용
- JWT 24h 만료 + 이중 인증 시스템 (admin_users vs users)
- Tenant isolation: 모든 쿼리에 companyId 필터 적용
- Rate limiting: 등록/로그인 엔드포인트에 적용

**4. 코드 리뷰가 실질적 개선을 가져왔습니다**

- Story 0-2: 이메일 중복 체크, orderBy 추가, isActive 체크 — 3건 수정
- Story 0-3: 프로바이더 enum 동기화, 업데이트 시 재암호화 — 2건 수정
- Story 0-4: ConfirmDialog 적용, 부서 필터 수정 — 2건 수정

리뷰에서 발견된 7건의 이슈가 모두 커밋 전에 수정되었습니다.

### 1.3 개선할 점 (What Could Be Improved)

**1. 기존 v2 레거시 코드와의 충돌 관리**

Epic 0은 이전 v2 반복에서 이미 구현된 코드 위에 작업했습니다. 각 스토리마다 "이미 구현됨" vs "신규 구현 필요" 분석이 필요했습니다. 이 분석이 정확했지만, 향후 에픽에서도 비슷한 상황이 발생할 수 있으므로 명확한 가이드라인이 필요합니다.

**2. 통합 테스트 환경 부재**

현재 테스트는 모두 단위 테스트(unit test)입니다. 실제 DB 연결이 필요한 통합 테스트(tenant-isolation.test.ts 등)는 로컬 서버가 없으면 실패합니다:

```
error: Unable to connect. Is the computer able to access the url?
  path: "http://localhost:3000/api/workspace/agents"
  code: "ConnectionRefused"
```

단위 테스트만으로는 실제 DB 트랜잭션, 마이그레이션, tenant isolation을 완전히 검증하기 어렵습니다.

**3. Story 파일에 TEA/QA/CR 결과가 인라인으로 기록되지 않음**

각 스토리의 Dev Notes에는 구현 내용이 잘 기록되어 있지만, TEA 테스트 생성 결과, QA 검증 결과, 코드 리뷰 피드백이 별도 섹션으로 기록되지 않았습니다. 향후 회고에서 참조하기 위해 스토리 파일에 이런 정보를 포함시키면 좋겠습니다.

### 1.4 배운 점 (Lessons Learned)

**1. "이미 있는 것 위에 쌓기" 전략이 효과적입니다**

v2 초기 반복에서 구현된 기초(schema, auth, admin routes)가 있었기 때문에, Epic 0은 순수 구현보다는 "갭 분석 → 갭 메우기" 접근이 효과적이었습니다. 각 스토리의 Dev Notes에 "What's Already Implemented" 섹션이 이를 잘 지원했습니다.

**2. companyAdminOnly vs adminOnly 구분의 중요성**

Story 0-2에서 플랫폼 관리자(admin_users)와 회사 관리자(users with role='admin')의 구분이 명확히 설계되어, 이후 모든 workspace 라우트에서 일관된 접근 제어가 가능해졌습니다. 이 패턴이 Epic 0의 핵심 설계 결정 중 하나입니다.

**3. 프로바이더 스키마 동기화 문제**

Story 0-3에서 PROVIDER_SCHEMAS(서비스)와 라우트 Zod enum이 동기화되지 않은 문제가 있었습니다. `SUPPORTED_PROVIDERS`를 export하여 단일 소스로 관리하는 해결책이 적용되었습니다. "데이터 스키마는 단일 소스에서 파생" 원칙을 확인했습니다.

### 1.5 기술 부채 (Technical Debt)

| 항목 | 심각도 | 설명 |
|------|--------|------|
| 통합 테스트 환경 | MEDIUM | 로컬 서버 없이는 API 통합 테스트 실행 불가. CI에서 테스트 DB 환경 필요 |
| 이메일 발송 미구현 | LOW | 초대 시스템에서 초대 링크를 직접 반환하지만, 실제 이메일 발송은 미구현. FR85 완전 이행을 위해 필요 |
| 비밀번호 정책 미적용 | LOW | 비밀번호 최소 길이(6자)만 검증. 복잡도 요구사항(대소문자, 특수문자 등) 미적용 |
| Admin Console 테스트 | LOW | UI 컴포넌트 테스트가 서버측 로직 테스트로 대체됨. 실제 React 컴포넌트 렌더링 테스트 없음 |

### 1.6 메트릭 요약

| 메트릭 | 값 |
|--------|-----|
| 전체 테스트 | 201건 |
| 테스트 통과율 | 100% (Epic 0 범위 내) |
| 소스 코드 라인 | ~1,438 LOC (신규/수정 핵심 파일) |
| 신규 파일 생성 | 8개 |
| 수정 파일 | 11개 |
| 코드 리뷰 수정 | 7건 |
| 커밋 수 | 4건 (스토리당 1건) |
| 에러 코드 체계 | REG (2), INVITE (3), CRED (3), AUTH (4) |

---

## Part 2: 다음 에픽 준비

### 2.1 다음 에픽: Epic 3 — Agent Organization & Soul System

Sprint plan에 따르면 구현 순서는: Epic 0 → **Epic 3** → Epic 5 → Epic 4

Epic 3은 29개 에이전트 조직을 배포하고, Soul Editor(마크다운 기반 페르소나 편집기)를 만들고, 부서별 지식 주입 기능을 구현합니다.

### 2.2 Epic 0에서 Epic 3으로 이어지는 의존성

| Epic 0 산출물 | Epic 3 활용 |
|---------------|------------|
| 회사+유저 인증 시스템 | 에이전트가 특정 회사에 속하므로 tenant isolation 필수 |
| JWT + companyId 컨텍스트 | 에이전트 CRUD 라우트에서 companyId 필터 |
| adminOnly / companyAdminOnly 미들웨어 | 에이전트 설정은 admin 권한 필요 |
| 기존 departments + agents 테이블 | Story 3-1에서 29개 에이전트 데이터 시드 |
| Credential Vault | 에이전트가 외부 API 호출 시 자격증명 조회 |

### 2.3 Epic 3 준비 사항

1. **에이전트 스키마 검토**: 기존 `agents` 테이블이 Soul 시스템(마크다운 페르소나, 3-tier 계층)을 지원하는지 확인
2. **v1 에이전트 구조 참조**: v1-feature-spec.md의 29개 에이전트 조직도, 부서별 역할, Manager/Specialist/Worker 계층
3. **마크다운 에디터 라이브러리 선정**: Soul Editor에 사용할 React 마크다운 에디터 조사

### 2.4 Epic 0 회고에서 Epic 3에 적용할 교훈

1. **갭 분석 먼저**: 기존 에이전트/부서 관련 코드를 먼저 파악하고 신규 구현 범위를 확정
2. **단일 소스 원칙**: 에이전트 목록, 부서 매핑 등을 하드코딩하지 말고 seed 데이터 또는 설정 파일에서 관리
3. **코드 리뷰 수정 패턴**: enum 동기화, 중복 체크, 활성화 상태 검증 — Epic 3에서도 동일 패턴이 나올 수 있으므로 미리 적용

---

## 팀 합의 사항 (Action Items)

| # | 항목 | 담당 | 우선순위 |
|---|------|------|----------|
| 1 | 통합 테스트 환경 구축 (테스트 DB) | 아키텍트 | MEDIUM |
| 2 | 스토리 파일에 TEA/QA/CR 결과 섹션 추가 | SM | LOW |
| 3 | Epic 3 시작 전 기존 에이전트 코드 갭 분석 | Dev | HIGH |
| 4 | 이메일 발송 기능은 Epic 16 (Telegram & Messenger)과 통합 고려 | PM | LOW |

---

**회고 완료**: Epic 0 Foundation은 4개 스토리, 201건 테스트, 100% 통과로 성공적으로 완료되었습니다. 멀티 테넌시 인프라, 인증/인가 체계, 암호화된 자격증명 관리, 관리 콘솔 UI가 모두 실제 동작하는 코드로 구현되었습니다. 이 기반 위에 Epic 3 (Agent Organization & Soul System) 구현을 진행합니다.
