---
type: ux-design-addendum
epic: 'Epic 15 — 3-Layer Caching'
baseDocument: _bmad-output/planning-artifacts/ux-design-specification.md
inputDocuments:
  - _bmad-output/planning-artifacts/epic-15-prd-addendum.md
  - _bmad-output/planning-artifacts/epic-15-architecture-addendum.md
  - _bmad-output/planning-artifacts/epic-15-caching-brief.md
  - _bmad-output/planning-artifacts/v1-feature-spec.md
author: BMAD Writer Agent
date: '2026-03-12'
status: draft
partyModeRounds: 0
---

# UX Design Addendum: Epic 15 — 3-Layer Caching

> 기존 ux-design-specification.md를 기반으로 Epic 15 캐싱 UX 결정을 추가하는 공식 문서.
> 포맷은 ux-design-specification.md 기존 패턴과 동일.

---

## Section 1: Caching UX Elements

### 1.0 관련 페르소나

| 페르소나 | 역할 | Epic 15 접점 |
|----------|------|-------------|
| **김운영** (Admin, 운영 관리자) | 에이전트 CRUD, Soul 편집, 비용 책임 | AgentEditForm 캐싱 토글 ON/OFF 결정 |
| **이주임** (Hub 사용자, 일반 직원) | 매일 Hub에서 AI 직원에게 업무 요청 | Semantic Cache 히트 시 즉시 응답 수신 |

---

### 1.1 Admin Panel — enableSemanticCache 토글 (AgentEditForm)

#### 배치 위치

**진입 경로**: Admin 콘솔(`/admin/agents`) → 에이전트 목록 → 에이전트 행 클릭 → 우측 에이전트 상세 → `[편집]` 버튼 → AgentEditForm 모달

**섹션 순서**: 기본 정보 → Soul 편집 → **캐싱 설정** (신규) → 도구 권한

**근거**: Soul(응답 콘텐츠 설정) 바로 아래 배치. 캐싱(응답 효율)은 Soul과 직접 연결 — Soul 변경 시 Semantic Cache TTL 자연만료 동작을 Admin이 인지하도록.

---

#### AgentEditForm 와이어프레임 — OFF 상태 (기본)

```
┌─────────────────────────────────────────────────────────────────────┐
│ 에이전트 편집                                          [X]          │
├─────────────────────────────────────────────────────────────────────┤
│  기본 정보                                                          │
│  ────────────────────────────────────────────────                  │
│  이름    [BD 전문가___________________________]                     │
│  부서    [사업개발부                         ▾]                     │
│  모델    [claude-sonnet-4-6                 ▾]                     │
│                                                                     │
│  Soul (시스템 프롬프트)                                             │
│  ────────────────────────────────────────────────                  │
│  [편집 ✏️]  "당신은 사업개발 전문가입니다..."                       │
│                                                                     │
│  캐싱 설정                              ← Epic 15 신규 섹션        │
│  ────────────────────────────────────────────────                  │
│                                                                     │
│  응답 캐싱           [●────] OFF                                   │
│  유사한 질문에 기존 응답을 재사용합니다.                            │
│  ⓘ 같은 회사의 모든 사용자가 캐시를 공유합니다.                    │
│                                                                     │
│  도구 권한                                                          │
│  ────────────────────────────────────────────────                  │
│  ☑ kr_stock   ☑ search_web   ☐ dart_api   ☐ law_search            │
│                                                                     │
│                                   [취소]  [저장]                   │
└─────────────────────────────────────────────────────────────────────┘
```

#### AgentEditForm 와이어프레임 — ON 상태

```
│  캐싱 설정                                                          │
│  ────────────────────────────────────────────────                  │
│                                                                     │
│  응답 캐싱           [────●] ON                                    │
│  유사한 질문에 기존 응답을 재사용합니다.                            │
│  ⓘ 같은 회사의 모든 사용자가 캐시를 공유합니다.                    │
│                                                                     │
│  TTL: 24시간 자동 만료  ·  유사도 임계값: 95%                      │
│  ✓ 이 에이전트는 캐싱에 적합합니다.              ← 권장 표시       │
```

---

#### SemanticCacheToggle 컴포넌트 명세

| 속성 | 값 |
|------|-----|
| 컴포넌트 | `<Switch>` (shadcn/ui) |
| prop name | `enableSemanticCache: boolean` |
| 기본값 | `false` (DEFAULT FALSE, FR-CACHE-3.2) |
| ON 색상 | `bg-indigo-500` (#6366f1) |
| OFF 색상 | `bg-slate-600` (#475569) |
| 크기 | `w-11 h-6` (44×24px) thumb `w-5 h-5` |
| 레이블 | `text-sm font-medium text-slate-200` — "응답 캐싱" |
| 설명 | `text-xs text-slate-400` — "유사한 질문에 기존 응답을 재사용합니다." |
| 보조 아이콘 | `<InformationCircleIcon className="w-3.5 h-3.5 text-slate-500">` |
| ON 상태 부가 정보 | `text-xs text-slate-500` — "TTL: 24시간 자동 만료 · 유사도 임계값: 95%" |

#### ⓘ 툴팁 (`SemanticCacheTooltip`)

```
┌───────────────────────────────────────────────────────┐
│ 응답 캐싱이란?                                         │
│                                                       │
│ 유사한 질문(코사인 유사도 ≥ 95%)에 기존 LLM 응답을    │
│ 재사용합니다. (Semantic Cache)                        │
│                                                       │
│ • 응답 속도: ≤ 100ms (LLM 미호출)                    │
│ • 비용: $0 / 캐시 히트                                │
│ • TTL: 24시간 자동 만료                               │
│ • 공유 범위: 이 회사의 모든 사용자                     │
│                                                       │
│ ⚠ 실시간 데이터가 중요한 에이전트는 OFF 권장          │
│   (예: 주가, 실시간 뉴스 전용 에이전트)               │
└───────────────────────────────────────────────────────┘
```

구현: `@radix-ui/react-tooltip`, `side="top"`, `sideOffset={4}`, `className="max-w-xs"`

---

#### ON→OFF 전환 확인 모달

**트리거**: 현재 ON 상태에서 토글 클릭 시 (즉시 전환 대신 확인 모달)

```
┌───────────────────────────────────────────────────────┐
│ 응답 캐싱을 비활성화하시겠습니까?                      │
│                                                       │
│ 비활성화 시:                                           │
│ • 새로운 응답이 캐시에 저장되지 않습니다.              │
│ • 기존 캐시는 각 응답의 저장 시점부터 24시간이          │
│   지나면 자동 만료됩니다. (즉시 삭제 아님)             │
│                                                       │
│               [취소]  [비활성화]                      │
└───────────────────────────────────────────────────────┘
```

**OFF→ON 전환**: 확인 없이 즉시 전환 (위험 없음).

**UX 근거**: ON→OFF는 "기존 캐시 TTL 자연만료 (즉시 삭제 없음, FR-CACHE-3.3)" 동작을 Admin(김운영)이 명확히 이해하도록 확인 모달 필수. 반대 방향은 즉시 전환으로 마찰 최소화.

---

#### 에이전트 유형별 권장 표시

AgentEditForm 캐싱 섹션 하단 — 에이전트가 보유한 도구 목록 기반 자동 감지:

**우선순위**: `✗ > ⚠ > ✓` — 조건 중복 시 더 높은 경고가 우선 표시 (예: `generate_image + kr_stock` 동시 보유 → `✗` 표시)

| 조건 | 표시 | Tailwind |
|------|------|----------|
| `get_current_time` 또는 `generate_image` 포함 | `✗ 캐싱 비권장 — 매 응답이 고유해야 합니다.` | `text-rose-400 text-xs` |
| `kr_stock` 또는 `search_news` 포함 (위 조건 없음) | `⚠ 실시간 도구 포함 — 최대 24시간 이전 응답이 반환될 수 있습니다.` | `text-amber-400 text-xs` |
| 위 도구 없음 (분석/리포트 에이전트) | `✓ 이 에이전트는 캐싱에 적합합니다.` | `text-emerald-400 text-xs` |

> **자동 감지 범위 외 주의**: 다단계 핸드오프 오케스트레이터나 Library 즉각 반영이 필요한 에이전트는 도구 목록으로 자동 감지되지 않습니다. 해당 에이전트는 수동으로 OFF 설정을 권장합니다.
>
> **Story 15.3 구현 명세 — 동적 감지 기준**: 권장 표시는 `tool-cache-config.ts`의 TTL 값 기반으로 동적 처리:
> - 에이전트 도구 중 `TTL = 0` 항목 존재 → `✗ 비권장` (현재 예시: `get_current_time`, `generate_image`)
> - 에이전트 도구 중 `TTL ≤ 15분(900,000ms)` 항목 존재 (TTL=0 제외) → `⚠ 실시간 도구 포함` (현재 예시: `kr_stock` 1분, `search_news` 15분)
> - 등록 도구 없음 또는 모두 `TTL > 15분` → `✓ 권장`
>
> 신규 도구 추가 시 `tool-cache-config.ts` TTL만 등록하면 권장 표시 자동 반영. UX 코드 변경 불필요.

**근거**: Admin(김운영)이 도구 목록을 외우지 않아도 캐싱 적합성 즉시 판단 가능.

---

### 1.2 Admin Panel — Cache Stats View (Deferred Phase 5+)

**현재 Phase 1~3 상태**: FR-CACHE-1.5 — 캐시 비용 데이터는 서버 로그(`cost_tracker` Hook)에만 기록. Admin UI에 미노출.

**김운영의 Phase 1~3 측정 방법**: Anthropic 대시보드에서 `cache_read_input_tokens` 필드로 절감 확인, 또는 서버 로그 `event: 'cache_cost_summary'` 직접 조회.

**Phase 5+ 설계 (구현 시 참조):**

```
Admin 콘솔 → 대시보드 (/admin/dashboard) → "캐싱 성과" 섹션

┌─────────────────────────────────────────────────────────────────────────┐
│ 캐싱 성과 (이번 달)                        [기간 선택 ▾]  [↻ 새로고침] │
├─────────────────┬─────────────────┬─────────────────┬───────────────────┤
│  Prompt Cache   │  Tool Cache     │  Semantic Cache │  이번 달 절감액   │
│  ⚡ 82%         │  📦 45%         │  🧠 23%         │  💰 $24.50        │
│  히트율         │  히트율         │  히트율         │  추정             │
│  ✓ 목표(70%) 초과│  ✓ 목표(40%) 초과│  ⚠ 목표(40%) 진행│  -$27 Soul 비용   │
└─────────────────┴─────────────────┴─────────────────┴───────────────────┘
```

컴포넌트: 기존 `SummaryCard` 재사용 (ux-design-spec 10.4절). 아이콘: `Zap`(indigo-400) / `Archive`(cyan-400) / `Brain`(violet-400) / `TrendingDown`(emerald-400).

---

### 1.3 Hub UX — Cache Hit Indicator (⚡ 배지, Deferred Phase 5+)

**현재 Phase 1~3 상태**: Semantic Cache 히트 시 이주임에게 별도 표시 없음. 단지 빠른 응답(≤ 100ms)만 경험. 이는 의도된 설계 — 캐시 여부는 내부 최적화이며 UX 노출 시 "오래된 답변" 불안감 유발 위험.

**Phase 5+ 설계**: Hub 응답 메시지 버블 우측 하단.

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  출장비 처리 규정은 다음과 같습니다:                      │
│  1. 교통비는 최대 5만원...                               │
│  2. 숙박비는 회사 규정에 따라...                         │
│                                                          │
│                          ⚡ 캐시  │ 👍 │ 👎 │ 🔁        │
└──────────────────────────────────────────────────────────┘
```

| 속성 | 값 |
|------|-----|
| 배지 레이블 | `⚡ 캐시` |
| 배지 스타일 | `bg-indigo-950 border border-indigo-800 text-indigo-300 text-xs font-medium px-2 py-0.5 rounded-full` |
| 표시 조건 | Semantic Cache 히트만. Prompt Cache / Tool Cache 히트는 내부 최적화로 배지 없음 |
| 호버 툴팁 | "이전 유사한 질문의 캐시에서 반환됨 (유사도: XX%)" |
| Phase 5+ 데이터 | SSE `message` 이벤트에 `cacheHit: boolean`, `similarity: number` 필드 추가 필요 |

---

### 1.4 Hub UX — Semantic Cache 응답 동작 (이주임 시점)

#### 캐시 히트 시 응답 흐름 (Phase 1~3, 배지 없음)

```
이주임: "출장비 처리 규정이 어떻게 돼?"
           ↓
[입력 전송] → SSE accepted (50ms)
           ↓
[캐시 히트 — Semantic Cache, ≤ 100ms]
           ↓
SSE message 즉시 스트리밍 (스피너 없음)
           ↓
┌──────────────────────────────────────────┐
│ 출장비 처리 규정은 다음과 같습니다:     │
│ 1. 교통비는 최대 5만원 실비...          │
│                                 👍 👎 🔁 │
└──────────────────────────────────────────┘
```

**핵심 UX 결정 — 로딩 스피너 300ms 지연 (base spec 오버라이드)**:
- **base ux-design-spec 기존 패턴**: `accepted` 이벤트 수신 시 즉시 스피너 + "명령 접수됨" 표시
- **Epic 15 오버라이드**: `accepted` → `setTimeout(showSpinner, 300)` — 300ms 내 `message` 이벤트 도착 시 스피너 미표시
- **변경 근거**: Semantic Cache 히트(≤ 100ms) 시 스피너가 100ms 후 즉시 사라져 깜빡임(flicker) 발생. 300ms 지연으로 캐시 히트 경우 스피너 미노출 → 이주임 체험: "빠르게 답변이 왔다"
- **base spec 업데이트 필요**: `ux-design-specification.md` Hub 로딩 상태 섹션 — "accepted 즉시 스피너" → "300ms 지연 스피너 (Semantic Cache 히트 flicker 방지)"로 갱신 (Story 15.3 완료 후)

#### "이전 유사 질문의 답변" 안내 문구 — 채택 여부 결정

**결정: MVP에서 채택하지 않음**

| 고려 항목 | 분석 |
|----------|------|
| 표시 시: 이점 | 캐시 출처 투명성 확보 |
| 표시 시: 위험 | "오래된 답변?" 불안감 → 이주임이 불필요한 재질문 → Semantic Cache 효율 저하 |
| TTL 24시간 내 변경 가능성 | Library 업데이트 즉시 무효화 없음 (FR-CACHE-3.12) — 일부 에이전트에서 24시간 내 stale 응답 가능 |
| Admin 대응 | 실시간 정보 중요 에이전트는 `enableSemanticCache=false` 설정으로 제외 (FR-CACHE-3.11) |
| 최종 결정 | 이주임에게 안내 문구 미표시. Phase 5+ 배지(⚡ 캐시)로 대체 — 간결한 선택적 표시 |

**Edge Case 1**: 이주임이 "아까 답변이랑 같네?" 인지 시 — 이는 정상 동작. 에이전트가 일관된 답변을 주는 것으로 경험됨 (캐시 때문이 아닌, AI가 일관성 있다는 인식).

**Edge Case 2**: 이주임이 에이전트에게 "방금 답변이 캐시에서 나온 건가요?" 직접 질문 시 — 의도된 동작. 에이전트는 캐시 메타데이터를 수신하지 않음 (agent-loop.ts가 cacheHit 정보를 LLM 컨텍스트에 주입하지 않음 — Epic 15 범위 외). 에이전트는 "모른다"고 응답하거나 무관한 답변 제공. 거짓 주장 없음. Phase 5+ 배지(⚡ 캐시)가 이 질문 자체를 예방.

---

### 1.5 Error UX — Graceful Fallback (이주임 시점)

#### Semantic Cache 오류 시

```
[Semantic Cache 조회 실패 (DB 연결 오류 등)]
           ↓
try/catch → log.warn + fallback
           ↓
정상 LLM 호출 진행 (세션 중단 없음 — NFR-CACHE-R2)
           ↓
이주임 화면: 정상 응답 (5초 소요, 캐시 오류 미노출)
```

**이주임 UX**: 오류 발생 여부를 전혀 알 수 없음. 단지 응답이 평소(5초)처럼 느리게 왔을 뿐. "오류" 메시지 없음.

#### Tool Cache 오류 시

```
[withCache() 내부 예외 발생]
           ↓
catch → log.warn + 원본 함수 직접 실행 (NFR-CACHE-R1)
           ↓
이주임 화면: 정상 응답 (외부 API 직접 호출 결과)
```

**이주임 UX**: 완전히 동일한 응답. 캐시 여부 차이 없음.

#### 3-레이어 전부 비활성 시

```
[enableSemanticCache=false + Tool Cache 오류(graceful fallback으로 원본 함수 실행) + Prompt Cache 미적용]
           ↓
정상 LLM 호출 (Epic 15 이전 동작과 완전 동일 — NFR-CACHE-R3)
           ↓
이주임 화면: 정상 응답
```

**Admin(김운영) 확인 경로**: 서버 로그 `event: 'tool_cache_miss'`, `event: 'semantic_cache_miss'` — 히트율 0% 시 캐싱 설정 문제 진단.

---

### 1.6 UX 결정 요약

| 결정 | 선택 | 근거 |
|------|------|------|
| 토글 위치 | AgentEditForm: Soul 아래, 도구 권한 위 | Soul 변경 → 캐시 자연만료 연계 인지 |
| 토글 기본값 | OFF | 예상치 못한 companyId 공유 방지. 김운영이 의식적으로 ON 전환 |
| OFF→ON | 즉시 전환 (확인 없음) | 위험 없음 |
| ON→OFF | 확인 모달 필수 | "기존 캐시 24h 유지" 동작 명시 필요 |
| 캐시 공유 범위 | 툴팁에 "이 회사의 모든 사용자" 명시 | companyId 단위 공유(FR-CACHE-3.11) 투명성 |
| 캐시 히트 스피너 | 300ms 지연 후 표시 (캐시 히트 시 미표시) | 100ms 내 응답 시 깜빡임 방지 |
| "이전 유사 질문" 안내 | **MVP 미표시** | 이주임 불안감 유발 위험 > 투명성 이점 |
| 캐시 오류 표시 | **이주임에게 미표시** | NFR-CACHE-R1/R2 graceful fallback — 세션 중단 0건 |
| Cache Hit Badge | **Deferred Phase 5+** | MVP SSE 필드 미전송. 이주임 UX 단순화 우선 |
| Cost Dashboard | **Deferred Phase 5+** | Phase 1~3 서버 로그만 (FR-CACHE-1.5) |
| 에이전트 권장 표시 | 도구 목록 자동 감지 (3단계 색상) | 김운영이 도구 목록 암기 없이 판단 |

---

*Section 1 작성 완료 v2 — 검토 대기*
