---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7]
inputDocuments:
  - _bmad-output/planning-artifacts/product-brief-corthex-v3-2026-03-20.md
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/technical-research-2026-03-20.md
  - _bmad-output/party-logs/confirmed-decisions-stage1.md
  - _uxui_redesign/phase-3-design-system/design-tokens.md
  - _uxui_redesign/phase-0-foundation/vision/vision-identity.md
workflowType: 'ux-design'
project_name: 'corthex-v3-openclaw'
date: '2026-03-23'
---

# UX Design Specification — CORTHEX v3 OpenClaw

**Author:** Sally (UX Designer)
**Date:** 2026-03-23

---

## Executive Summary

### Project Vision

CORTHEX v3 "OpenClaw"은 **AI 에이전트가 개성을 갖고, 성장하며, 실제로 일하는 모습을 볼 수 있는** 엔터프라이즈 AI 조직 운영 플랫폼이다.

v2에서 검증된 엔터프라이즈 기반(485개 API, 86개 DB 테이블, 71개 프론트엔드 페이지, 10,154개 테스트) 위에 4가지 핵심 레이어를 추가한다:

| Layer | 기능 | 해결하는 문제 | Sprint | UX 핵심 접점 |
|-------|------|-------------|--------|-------------|
| Layer 1 — OpenClaw 가상 사무실 | PixiJS 8 픽셀 캐릭터로 에이전트 실시간 시각화 | 블랙박스 문제 (CEO가 AI 조직 상태를 볼 수 없음) | Sprint 4 | CEO 앱 `/office` — 5-state 픽셀 애니메이션 (idle→working→speaking→tool_calling→error) |
| Layer 2 — n8n 워크플로우 | Docker 컨테이너 드래그앤드롭 자동화 | 반복 업무 문제 (코드 없이 자동화 불가) | Sprint 2 | Admin n8n 관리 페이지, CEO 워크플로우 결과 뷰 |
| Layer 3 — Big Five 성격 | OCEAN 5축 (0-100 정수) 성격 슬라이더 | 획일성 문제 (모든 에이전트가 동일 톤) | Sprint 1 | Admin 에이전트 편집 페이지 — 성격 슬라이더 5개 + 역할 프리셋 |
| Layer 4 — 3단계 메모리 | 관찰→반성→계획 파이프라인 | 정체 문제 (어제 실수를 오늘도 반복) | Sprint 3 | CEO Dashboard 성장 지표, Notifications 반성 알림 |

동시에 **Layer 0: UXUI 완전 리셋**을 전 Sprint에 병행 수행하여 v2의 428곳 색상 혼재, dead button, 메뉴 구조 불일치 문제를 근본 해결한다.

**디자인 방향**: "Controlled Nature" (Vision & Identity §2.3) — Natural Organic 팔레트 (Sovereign Sage: cream `#faf8f5`, olive `#283618`, sage `#606C38` — v2의 slate-950/cyan-400 Sovereign Sage와는 다른 새 팔레트). Swiss Design 구조 + Arts & Crafts 자연 소재 감성. 단일 테마 (v2의 5개 테마 폐기). 다크 모드 미지원 (v3 초기 런치).

**핵심 디자인 철학**: "Your AI organization, alive and accountable." — CEO가 유리창을 통해 살아있는 조직을 보는 경험. 텍스트 로그가 아니라 픽셀 캐릭터, 성격 슬라이더, 성장 차트로 AI 조직을 체감한다.

---

### Target Users

#### Primary User #1: 시스템 관리자 (Admin 앱) — 첫 번째 사용자

**페르소나: 이수진, 32세, AI 시스템 운영 담당자**

| 속성 | 상세 |
|------|------|
| 역할 | 회사의 AI 조직 전체를 설계·운영 |
| 기술 배경 | 중간 (SaaS 운영 경험, 코딩 불필요) |
| 접근 앱 | Admin 앱 (~29개 페이지: v2 27 + n8n 관리 + /office read-only) |
| 사용 빈도 | 초기 집중 설정 + 주 1~2회 유지보수 |
| v3 핵심 기능 | Big Five 성격 슬라이더, n8n 관리, 메모리 Reflection 설정, NEXUS 조직도 |

**핵심 문제 (Before v3):**
1. "에이전트가 다 똑같이 말한다" → 전략 담당과 고객 서비스 담당이 동일 톤으로 응답
2. "워크플로우를 만들려면 코드를 짜야 한다" → 자체 구현 코드에 버그 반복 (v2에서 500 에러 확인)
3. "에이전트가 어제 실수를 오늘도 반복" → 학습 메커니즘 부재

**AHA Moment:** 성실성(conscientiousness) 슬라이더를 95로 설정한 에이전트가 체크리스트를 자동 생성하며 꼼꼼하게 응답하는 것을 처음 확인 — "이게 진짜 개성이네."

**UX 설계 시사점:**
- Big Five 슬라이더 UI는 **즉시 피드백**이 핵심: 슬라이더 위치별 행동 예시 툴팁 ("성실성 90+: 체크리스트 자동 생성, 꼼꼼한 검증")
- n8n 관리는 **iframe이 아닌 Hono 리버스 프록시** — Admin 앱 내 일관된 네비게이션 경험 유지
- 온보딩은 **Wizard 방식** 잠금 해제 패턴 (Notion/Linear 참고) — "막는" 느낌 없이 단계 완료 시 다음 단계 활성화

---

#### Primary User #2: CEO / 창업자 (CEO 앱) — 두 번째 사용자

**페르소나: 김도현, 38세, SaaS 스타트업 대표**

| 속성 | 상세 |
|------|------|
| 역할 | AI 조직에 태스크를 지시하고 결과를 감독 |
| 기술 배경 | 낮음 (비개발자, 비즈니스 집중) |
| 접근 앱 | CEO 앱 (~35개 페이지: v2 42 - GATE costs/workflows 제거 - FR-UX 14→6그룹 통합 + /office) |
| 사용 빈도 | 매일 (Hub, Chat, /office, Dashboard) |
| 전제 조건 | **Admin 설정 완료 후에만 접근 가능** (v2 교훈: CEO 앱 먼저 설계 → 온보딩 혼란 반복) |

**핵심 문제 (Before v3):**
1. "내 AI 팀이 지금 뭘 하는지 모르겠다" → 텍스트 로그만으로는 비개발자가 파악 불가
2. "에이전트가 발전이 없다" → 매 태스크를 '처음 하는 것처럼' 처리
3. "워크플로우 요청이 개발팀 경유" → 자동화 설정 장벽

**AHA Moment (2단계):**
1. **즉시 WOW**: `/office`를 처음 열었을 때 픽셀 캐릭터들이 실시간으로 타이핑/도구 사용/말풍선 — "내 AI 팀이 실제로 일하고 있다는 걸 처음으로 '봤다'."
2. **장기 WOW**: 한 달 후 동일 태스크를 에이전트가 수정 없이 1번에 완성 — "이 에이전트가 성장했다."

**UX 설계 시사점:**
- `/office` 성능 목표: **FCP (shell) ≤ 1.5초** + **TTI (캐릭터 표시 + WS 연결) ≤ 3초** — WOW 모먼트를 지연이 깨뜨리면 안 됨
- Admin이 사전에 **테스트 태스크 예약 실행** 권장 → CEO 첫 접속 시 에이전트 working 상태 목격 보장 (WOW 달성률 90%+ 목표)
- 에이전트 성장 체감은 **중간 피드백 설계** 필수: Dashboard "이번 주 반성 3건 생성", Performance 페이지 "유사 태스크 성공률 65%→80%" 지표
- 비개발자 — 기술 용어 최소화, 시각적 표현 우선 (차트, 아이콘, 픽셀 캐릭터)

---

#### Secondary User: 일반 직원 (CEO 앱 일부)

에이전트와 Messenger/Agora에서 직접 대화하는 사용자. v3 신규 기능 직접 사용 없음 — 기존 v2 기능 (Messenger, Agora) 그대로 유지. Zero Regression 원칙 적용.

---

#### 온보딩 플로우 (필수 순서)

```
Admin 계정 생성
  → 회사 설정 (이름, 구독 티어, 모델 선택)
  → 조직 구성 (부서 생성, 직원 등록)
  → AI 에이전트 설정 (역할, Big Five 성격 슬라이더, Soul Template)
  → [권장] 테스트 태스크 예약 실행 — CEO /office WOW 모먼트 보장
  → n8n 워크플로우 연결 (선택)
  → CEO 계정 초대
    → CEO 앱 사용 시작 (Hub, Chat, /office)
```

> **1인 창업자 케이스**: Admin=CEO 동일인 — Admin 설정 완료 후 CEO 앱으로 전환. 동일 계정으로 양 앱 접근 가능 (Admin: `/admin/...`, CEO: `/...`). 온보딩 순서는 동일 적용. UX 주의점: 1인이 양 앱을 오가므로 **앱 전환 네비게이션** 명확해야 함 (사이드바 하단 "Admin 앱으로 전환" / "CEO 앱으로 전환" 링크). 온보딩 Wizard의 "CEO 계정 초대" 단계는 1인 모드에서 스킵 가능하도록 조건부 표시.

---

### Key Design Challenges

#### DC-1: PixiJS Canvas 접근성 (Layer 1, Sprint 4)

**문제**: PixiJS `<canvas>` 요소는 스크린리더가 읽을 수 없고 키보드 내비게이션이 불가능하다. `/office`가 시각 전용이면 WCAG 2.1 AA 기본선 위반.

**UX 대응 방안:**
- `aria-live="polite"` **텍스트 대안 패널** 병행: "마케팅 에이전트: 현재 보고서 작성 중", "CIO: idle" — 스크린리더/키보드 전용 사용자 지원. **에러 상태는 `aria-live="assertive"`**: "에이전트 X: 실행 실패" 즉시 알림
- 5-state 구분: 색상 + 아이콘/애니메이션 **이중 인코딩** (색맹 접근성)
- 모바일/태블릿: PixiJS 캔버스 비활성 → **간소화 리스트 뷰** (상태 텍스트만 표시) — 배터리/성능 고려. **이 리스트 뷰는 번들 200KB 초과 시 데스크톱 fallback으로도 사용** (Go/No-Go #5 실패 대비)
- Admin `/office`: read-only 관찰 뷰 (태스크 지시 불가 — CEO 앱에서만)
- **WebSocket fallback**: `/ws/office` 연결 실패 시 → stale indicator (캐릭터 위에 "⏸ 연결 끊김" 오버레이) + 상단 retry banner ("연결이 끊겼습니다. 재연결 중...") + 3초 간격 자동 재연결 (최대 5회) + 5회 실패 시 "새로고침" 버튼 표시
- **로딩 상태**: PixiJS 캔버스 로딩 중 — 크림 배경 + 중앙 스피너 + "사무실 준비 중..." 텍스트 + skeleton 에이전트 실루엣. 타일맵 로딩 → 캐릭터 로딩 → WS 연결 순서로 점진적 표시
- **빈 상태**: 에이전트 0명 시 — 빈 사무실 타일맵 + 중앙 CTA "첫 번째 에이전트를 만들어보세요" (Admin은 에이전트 생성 링크, CEO는 Admin 문의 안내)

#### DC-2: 대규모 에이전트 인지 과부하 (Layer 1, Sprint 4)

**문제**: 에이전트 20명 이상 시 한 화면에 모든 캐릭터를 표시하면 인지 과부하 발생.

**UX 대응 방안 (에이전트 수 기반 단계적 전략):**
- **≤10명**: 단일 뷰 — 모든 에이전트 한 화면에 표시, 줌/패닝 지원
- **11~30명**: 부서별 "방(room)" 분리 + 미니맵 도입 — 부서 탭/선택으로 이동, NEXUS 조직 구조와 시각적 연동
- **30명+**: 미니맵 필수 + 에이전트 검색 + 상태 필터 (working만/error만 표시) — 전체 뷰는 미니맵으로만 제공
- 모든 단계에서 상태 필터 (idle/working/speaking/tool_calling/error) 토글 가능

#### DC-3: Big Five 슬라이더 직관성 (Layer 3, Sprint 1)

**문제**: OCEAN 5축은 심리학 전문 용어다. "신경성(Neuroticism)"을 비개발자 Admin이 직관적으로 이해하기 어렵다.

**UX 대응 방안:**
- 슬라이더 위치별 **행동 예시 툴팁**: "성실성 90+: 체크리스트 자동 생성", "외향성 80+: 열정적 이모지 사용"
- **역할 프리셋** ("전략 분석가", "고객 서비스", "창작 콘텐츠") → 1-click 적용 후 미세 조정 가능
- 각 슬라이더: `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`, 특성 설명 `aria-label` — 키보드 Arrow keys 조작
- 프리셋 선택 시 설정 시간 ≤ 30초, 수동 설정 시 ≤ 2분/에이전트
- **에러 경로**: 슬라이더 저장 실패 시 → 인라인 에러 메시지 ("성격 설정 저장에 실패했습니다. 다시 시도해주세요.") + 슬라이더 값 복원 (optimistic update 롤백). API Zod 검증 실패 (범위 0-100 외) 시 → 슬라이더 UI에서 물리적으로 범위 밖 입력 불가 (min/max 속성)
- **로딩 상태**: 슬라이더 초기 로딩 시 → 5개 슬라이더 skeleton (회색 바) + "성격 프로필 불러오는 중..." 텍스트

#### DC-4: 에이전트 성장 체감의 시간 지연 (Layer 4, Sprint 3)

**문제**: 3단계 메모리 효과는 즉시 보이지 않는다. Reflection 크론은 일 1회 실행 — 사용자가 "이 기능이 작동하는 건가?"라고 의심할 수 있다.

**UX 대응 방안:**
- **중간 피드백 루프 설계**: Notifications에서 "오늘 반성(Reflection) 3건 생성됨" 실시간 알림 (Reflection 크론 완료 시)
- Dashboard "이번 주 Reflection N건" 위젯, Performance 페이지 "유사 태스크 성공률 추이" 차트
- 에이전트 프로필에 "학습 이력" 요약 섹션 (최근 Reflection 3건 + confidence 점수)
- 접근성: 성장 지표 차트 키보드 탐색, 데이터 포인트 `aria-label`, 스크린리더용 텍스트 요약 대안
- **빈 상태 (Day 1)**: Reflection 0건 시 Dashboard 위젯 → "아직 반성(Reflection) 기록이 없습니다. 에이전트가 태스크를 수행하면 매일 자동으로 학습합니다." + 작동 원리 간단 일러스트. Performance 차트 → "데이터 수집 중 — 첫 Reflection까지 약 24시간 소요" 안내
- **에러 경로**: Reflection 크론 실행 실패 시 → Admin Notifications "Reflection 크론 실패 — [에이전트명] 학습 중단됨" 알림 + Dashboard 위젯 경고 아이콘
- **Admin Tier별 Reflection 한도 설정 UI**: Admin 에이전트 설정 → Reflection 섹션에서 Tier별 일일 Reflection 한도 ($0.10~$0.50/agent/day Haiku 기준, PRD §Tier 비용), 한도 초과 시 해당 Tier Reflection 자동 중단 + Admin 알림
- **Admin Reflection 비용 모니터링**: Admin Dashboard에 "Reflection 일일 비용 추이" 위젯 + 일일 한도 80% 도달 시 경고 배너 ("Reflection 비용이 일일 한도의 80%에 도달했습니다"), 100% 초과 시 적색 알림

#### DC-5: n8n 임베딩 UX 일관성 (Layer 2, Sprint 2)

**문제**: n8n은 외부 Docker 컨테이너 — Admin 앱 내에서 n8n 에디터를 보여줄 때 UI/UX 일관성이 깨질 수 있다 (다른 폰트, 다른 컬러, 다른 인터랙션 패턴).

**UX 대응 방안:**
- Hono 리버스 프록시 `/admin/n8n/*` 경유 — 직접 외부 접근 차단
- Admin 앱 내 **워크플로우 목록/실행 이력 페이지는 네이티브 구현** (CORTHEX 디자인 토큰 적용)
- n8n 에디터 자체는 `/admin/n8n-editor/*` 프록시로 전체 화면 제공 — "외부 도구 모드"임을 명시
- 빈 상태: 워크플로우 0개 시 "첫 번째 워크플로우 만들기" 온보딩 가이드
- 에러 경로: n8n Docker 다운/OOM 시 "워크플로우 서비스 일시 중단" 안내 (Admin: "n8n 컨테이너 재시작 필요", CEO: "관리자에게 문의하세요") + Admin 알림. n8n Docker `--memory=2g` 제한 하에서 OOM 빈도: 복잡 워크플로우 동시 5+ 실행 시 위험. **Degraded mode**: n8n 다운 시 기존 ARGOS 크론잡은 독립 작동 (Zero Regression) — 워크플로우 목록 페이지에 "n8n 오프라인 — 기존 예약 작업은 정상 작동 중" 배너
- **마케팅 자동화 (FR-MKT) UX 흐름**: Admin → n8n 관리 → 마케팅 프리셋 워크플로우 6단계 파이프라인 (이미지 생성→영상→나레이션→자막→편집→배포). 각 단계 외부 AI API Switch 노드 — API 실패 시 fallback 엔진 자동 전환 + 실패 단계 시각적 하이라이트 (적색). Admin AI 도구 설정 페이지 (`/admin/marketing-settings`)에서 각 단계별 엔진 선택 UI (드롭다운). CEO 앱에서 마케팅 워크플로우 결과 확인 (읽기 전용)

#### DC-6: ~67페이지 점진적 UXUI 전환 (Layer 0, 전 Sprint)

**문제**: v2 71페이지 - GATE 제거 4개 (admin/CEO workflows + costs 전면 제거) + v3 신규 3개 = **~67페이지** (Brief §4 기준). 428곳 하드코딩 색상 + dead button을 한 번에 수정하면 리스크 과대. Sprint별 점진적 전환 시 "반은 새 테마, 반은 옛 테마" 어색한 상태가 발생.

**UX 대응 방안:**
- **3단계 분리**: L0-A (블로킹: 디자인 토큰 확정, Pre-Sprint) → L0-B (병렬: 428색상→토큰 전환) → L0-C (내장: 신규 페이지 테마)
- Sprint 2 종료 시점 게이팅: ~67페이지 중 ≥ 60% 스펙 매칭 + 하드코딩 색상 0 + dead button 0 미달 시 레드라인 검토
- ESLint 룰로 하드코딩 색상 자동 차단 — `themes.css` 토큰만 허용
- Playwright E2E로 dead button 자동 감지

#### DC-7: 서버 리소스 병목의 UX 영향 (전 Layer)

**문제**: Oracle ARM 4코어 24GB VPS에서 Bun + PostgreSQL + n8n Docker + CI/CD runner가 공존. 배포 중 성능 저하, WebSocket 50conn/company 초과, n8n+PG 동시 CPU 포화 시 사용자 체감 저하.

**UX 대응 방안:**
- **WebSocket 접속 초과 (50conn/company, 500/server)**: 초과 시 연결 거부 + "접속자가 많습니다. 잠시 후 다시 시도해주세요." 메시지 (HTTP 429 기반)
- **배포 중 성능 저하**: CI/CD 실행 중 API 응답 지연 가능 — 전역 토스트 "시스템 업데이트 중 — 일시적으로 느려질 수 있습니다" (Admin이 배포 알림 토글 설정 가능)
- **Graceful degradation 순서**: 1차: `/ws/office` 업데이트 주기 늘림 (500ms→2s) → 2차: PixiJS 60fps→30fps → 3차: 리스트 뷰 fallback

---

### Design Opportunities

#### DO-1: "/office" WOW 모먼트 — 시장 유일의 AI 조직 시각화

AI Town이 시뮬레이션 데모인 반면, OpenClaw는 실제 `agent-loop.ts` 실행 로그를 픽셀 동작으로 변환한다. "같은 엔진, 다른 창문" — 비개발자 CEO에게 AI 조직의 투명성을 처음으로 제공하는 UX. 첫 접속 WOW 모먼트 설계가 핵심 경쟁력.

**설계 포인트**: Admin 테스트 태스크 사전 예약 → CEO 첫 접속 시 에이전트 활동 보장 → FCP (shell) ≤ 1.5초 + TTI (캐릭터+WS) ≤ 3초 → 즉시 WOW. PixiJS 번들 ≤ 200KB gzipped 하드 한도 준수 (tree-shaking 필수, PixiJS v8 ESM + Vite/Rollup). **번들 초과 fallback**: Go/No-Go #5 실패 시 모바일 간소화 리스트 뷰를 데스크톱에서도 사용 — PixiJS 없이 에이전트 상태 텍스트 + 아이콘으로 대체 제공.

#### DO-2: Big Five 성격 — AI에 "인격"을 부여하는 UX

어떤 경쟁 SaaS도 에이전트에 OCEAN 5축 성격을 부여하는 UI를 제공하지 않는다. 슬라이더 조작 → 응답 톤 변화 → "같은 LLM, 다른 개성" 체감 — 에이전트를 도구가 아닌 팀원으로 느끼게 하는 감정적 UX 기회.

**설계 포인트**: 역할 프리셋 1-click → 즉각적 행동 예시 툴팁 → 저장 후 Chat에서 톤 변화 체감. 4-layer sanitization (Key Boundary→API Zod→extraVars strip→Template regex)으로 prompt injection 차단 — 보안이 투명하게 작동.

#### DO-3: 에이전트 성장 서사 — "함께 자라는 AI 팀"

3단계 메모리(관찰→반성→계획)는 단순 기능이 아니라 **서사(narrative)**다. 에이전트가 매일 경험에서 배우고 성장하는 과정을 사용자가 체감하면, CORTHEX는 "도구"가 아니라 "성장하는 조직"이 된다.

**설계 포인트**: Performance 페이지 "유사 태스크 성공률 추이" 차트 + 에이전트 프로필 "학습 이력" + Notifications "오늘 반성 N건 생성" → 중간 피드백 루프가 장기 리텐션의 핵심.

#### DO-4: 온보딩 — Admin→CEO 2단계 구조의 UX 혁신

v2 교훈: CEO 앱 먼저 설계 → 혼란 반복. v3에서 Admin-first 온보딩 Wizard는 **"준비된 조직에 CEO가 합류"** 경험을 제공한다. Linear/Notion의 Step-by-step 잠금 해제 패턴을 채택하되, 마지막 단계에서 "테스트 태스크 예약"을 권장하여 CEO 첫 접속 WOW를 Admin이 설계하는 구조.

#### DO-5: Sovereign Sage 팔레트 — SaaS 시장의 시각적 차별화

15개 벤치마크 사이트 (Linear, Vercel, Supabase, Notion 등) 중 Natural Organic 팔레트를 사용하는 곳은 없다. cream/olive/sage는 "AI = 차가운 테크"라는 고정관념을 깨고 "AI 조직 = 자연스러운 성장"이라는 브랜드 아이덴티티를 수립한다. 5개 테마 → 1개 테마 단일화로 v2의 428곳 color-mix 사고를 구조적으로 방지.

---

## Core User Experience

### Defining Experience

CORTHEX v3의 핵심 경험은 **두 앱, 두 역할, 하나의 AI 조직**으로 정의된다.

#### CEO 앱 — 핵심 행위: "지시하고, 관찰하고, 성장을 체감한다"

CEO가 가장 자주 수행하는 행위는 **Hub/Chat에서 에이전트에게 태스크를 지시하고, `/office`에서 실시간 진행을 관찰하며, Dashboard에서 성과를 확인하는** 루프다.

```
CEO Core Loop (일일 반복):
  1. Hub → 조직 현황 한눈에 확인 (active agents, pending tasks, 알림)
  2. Chat → 에이전트에게 태스크 자연어 지시 ("영업 보고서 작성해줘")
  3. /office → 픽셀 캐릭터로 실시간 진행 관찰 (working→speaking→tool_calling)
  4. Dashboard → 결과 확인 + 성장 지표 체크 ("유사 태스크 성공률 65%→80%")
  5. Notifications → "오늘 Reflection 3건 생성" 확인 → 에이전트 성장 체감
```

**절대적으로 완벽해야 하는 하나의 인터랙션**: Chat에서 자연어로 태스크를 지시하면, 비서(Secretary) 에이전트가 올바른 에이전트에게 자동 라우팅하고, 결과가 스트리밍으로 돌아오는 흐름. 이 흐름이 깨지면 전체 플랫폼의 가치가 무너진다. 비서 라우팅 정확도 목표: 첫 시도 80%+ (Soul 튜닝 후 95%+).

**비서 라우팅 실패 시 CEO 복구 UX** (80% 정확도 = 5번 중 1번 misroute):
- **인지**: Chat 응답 상단에 항상 `[에이전트명 · 부서명]` 태그 표시 → CEO가 응답 에이전트 즉시 확인
- **재라우팅**: 응답 하단 "다른 에이전트에게 다시 물어보기" 버튼 → 에이전트 목록 드롭다운 (부서별 그룹) → 수동 선택 후 재전송
- **피드백 루프**: misroute 시 "잘못된 라우팅 신고" 1-click → activity_logs 기록 → Secretary Soul 개선 데이터로 활용
- **자동 개선**: misroute 빈도 3회+ 동일 패턴 시 Admin Notifications "비서 라우팅 정확도 저하 — Soul 재검토 권장"

#### Admin 앱 — 핵심 행위: "설계하고, 조율하고, 비용을 통제한다"

Admin의 핵심 행위는 **NEXUS에서 조직을 시각적으로 설계하고, 에이전트에 개성(Big Five)과 역할(Soul)을 부여하며, Reflection 비용을 Tier별로 통제하는** 것이다.

```
Admin Core Loop (초기 설정 + 주간 유지보수):
  초기:
    1. 온보딩 Wizard → 회사 설정 → 부서/직원 → 에이전트 생성
    2. Big Five 슬라이더 → 역할별 성격 부여 (프리셋 또는 수동)
    3. Soul Template → 에이전트 행동 규칙 정의
    4. n8n → 비즈니스 자동화 워크플로우 설정
    5. 테스트 태스크 예약 → CEO WOW 모먼트 보장
    6. CEO 초대
  주간:
    1. Dashboard → Reflection 비용 추이 + Tier 한도 확인
    2. /office read-only → 에이전트 운영 상태 모니터링
    3. NEXUS → 조직 구조 미세 조정 (필요시)
    4. n8n → 워크플로우 실행 이력 확인 + 새 자동화 추가
```

**절대적으로 완벽해야 하는 하나의 인터랙션**: NEXUS에서 부서를 만들고, 에이전트를 드래그&드롭으로 배치하고, Soul을 편집하면 **저장 즉시 반영, 배포 0회**. "코드 없이 AI 조직 설계" — 이것이 CORTHEX의 시장 유일 차별점.

---

### Platform Strategy

| 속성 | 결정 | 근거 |
|------|------|------|
| **플랫폼** | Web-first SPA (React 19 + Vite) | 기존 v2 아키텍처 유지. 네이티브 모바일 앱 없음 — VPS 단일 서버 제약 |
| **반응형** | 데스크톱 우선, 모바일 지원 (lg=1024px 분기) | CEO는 주로 데스크톱, 모바일은 Hub/Chat 확인용 |
| **입력 방식** | 마우스/키보드 우선 + 터치 지원 | NEXUS 드래그&드롭, Big Five 슬라이더 — 정밀 조작 필요 |
| **오프라인** | 미지원 | 실시간 WebSocket 의존 (16+1채널), AI API 호출 필수 |
| **브라우저** | Chrome P0, Safari P1, Firefox/Edge P2 | PRD NFR-Browser 기준 |
| **상태 관리** | Zustand 5 (클라이언트) + React Query 5 (서버) | Architecture §311 기준. `/office` WS = Zustand store, API 데이터 = React Query 캐시 |
| **디바이스 활용** | 없음 (카메라, GPS, NFC 등 미사용) | 순수 웹 대시보드 — 디바이스 API 불필요 |

**반응형 전략 (4-breakpoint):**

| Breakpoint | 이름 | 레이아웃 | `/office` 처리 |
|-----------|------|---------|---------------|
| < 640px | Mobile (sm) | 단일 컬럼, 햄버거 네비, 카드 스택 | 리스트 뷰 (PixiJS 비활성) |
| 640–1023px | Tablet (md) | 단일 컬럼 + 넓은 카드, 햄버거 네비 | 리스트 뷰 (PixiJS 비활성) |
| 1024–1439px | Desktop (lg) | 사이드바 280px + 2열 그리드 | PixiJS 캔버스 (30fps) |
| ≥ 1440px | Wide (xl) | 사이드바 280px + 3열 그리드, max-width 1440px | PixiJS 캔버스 (60fps) |

**Tailwind 커스텀 breakpoint 주의**: `md: 640px` (기본 768px과 다름), `xl: 1440px` (기본 1280px과 다름) — `tailwind.config.ts`의 `theme.screens` 설정 필수.

**fps 전환 동작**: lg(30fps) ↔ xl(60fps) 경계 (1440px) 리사이즈 시 **500ms debounce 후 전환**. PixiJS Ticker `maxFPS`를 `matchMedia('(min-width: 1440px)')` 리스너로 제어. 즉시 전환 아닌 debounce로 리사이즈 중 불필요한 fps 토글 방지. **주의**: 30fps는 타이핑/말풍선 애니메이션에 부족할 수 있음 — Sprint 4 벤치마크에서 lg 30fps 적정성 검증 필수 (부적합 시 60fps 통일).

**앱 셸 구조 (확정):**
- Layout: 사이드바 (280px, olive `#283618`) + Topbar (56px, cream `#faf8f5`) + Content area (fluid, cream `#faf8f5`)
- 사이드바: 영구 좌측 패널 (데스크톱), 오버레이 슬라이드인 (모바일) — backdrop blur
- 페이지 컴포넌트: **content area만 렌더링** — 사이드바/Topbar 절대 중복 금지 (UXUI Rule #2)
- 라우팅: React Router v7 (`react-router-dom ^7.13.1`), React.lazy 코드 분할 — 페이지 전환 애니메이션 없음 (즉시 swap)

---

### Effortless Interactions

#### EI-1: Soul 편집 = 즉시 행동 변화 (Zero Deploy)

Soul(시스템 프롬프트)을 편집하면 에이전트 행동이 **즉시** 바뀐다. 코드 수정 0줄, 배포 0회, 재시작 0회. Admin이 NEXUS 또는 에이전트 편집에서 Soul 텍스트를 수정하고 저장하면, 다음 Chat 메시지부터 새 Soul이 적용된다.

- **경쟁사 대비**: CrewAI/LangGraph는 코드 수정 + 배포 필요. CORTHEX는 텍스트 편집만으로 워크플로우 변경.
- **자동화**: Soul Template 변수 `{{personality_traits}}`, `{{relevant_memories}}`, `{{department_context}}`가 자동 주입 — Admin은 변수 존재만 알면 됨, 기술적 구현은 `soul-enricher.ts` (PRD §soul-enricher, Sprint 1 신규 — `soul-renderer.ts` renderSoul()에 extraVars 전달)가 처리.

#### EI-2: Big Five 프리셋 → 1-Click 성격 부여

"전략 분석가" 프리셋 선택 → 성실성 90, 개방성 85, 외향성 30, 친화성 60, 신경성 20 자동 설정 → 저장. 30초 이내에 에이전트에 전문가 수준의 성격 프로파일 적용 완료.

- **자동**: 프리셋 적용 시 행동 예시 툴팁 자동 갱신
- **수동 조정 가능**: 프리셋 적용 후 개별 슬라이더 미세 조정 — "전략 분석가인데 좀 더 외향적으로"

#### EI-3: n8n 워크플로우 → 코드 없이 자동화

**일반 워크플로우** (≤ 10분): "매일 9시 영업 보고서 → Slack 전송" — 프리셋 선택 + API 키 입력으로 완성. 코드 0줄.

**마케팅 자동화 파이프라인** (≤ 30분, FR-MKT): 6단계 파이프라인 (리드 수집 → 세분화 → 콘텐츠 생성 → 멀티채널 배포 → A/B 테스트 → 성과 분석) — 단계별 노드 그룹 프리셋 제공, 외부 API 연결 필요. 일반 워크플로우보다 복잡하므로 별도 "마케팅 파이프라인" 프리셋 카테고리로 분리.

- **자동**: n8n Docker 컨테이너 시작/중지/상태 모두 Admin이 관리 — CEO는 결과만 확인
- **빈 상태**: 첫 방문 시 "마케팅 자동화", "보고서 생성", "알림 연동" 3개 프리셋 템플릿 제공
- **마케팅 외부 API fallback**: 외부 API (Mailchimp, GA4 등) 연결 실패 시 해당 노드에 경고 배지 + "API 키 확인" CTA — 파이프라인 전체 중단 아닌 해당 노드만 일시정지

#### EI-4: `/office` 접속 = 즉시 조직 상태 파악

CEO가 `/office`를 열면 **1.5초 내에 셸이 표시되고 3초 내에 에이전트 캐릭터와 WebSocket이 연결**된다. 스크롤, 클릭, 설정 없이 — 열면 바로 AI 조직이 눈에 들어온다.

- **자동**: WebSocket `/ws/office` 채널이 `agent-loop.ts` 활동 로그를 실시간 수신 → 픽셀 캐릭터 상태 자동 갱신
- **자동 재연결**: WS 끊김 시 3초 간격 자동 재연결 (최대 5회) — 사용자 개입 불필요

#### EI-5: 에이전트 성장 = 자동 학습, 수동 개입 0

Reflection 크론이 매일 자동 실행 → 관찰(observations) 분석 → 반성(reflections) 생성 → 다음 태스크에 자동 적용. CEO/Admin은 성장 지표만 확인하면 됨. 설정할 것: Tier별 일일 한도 1개뿐.

- **자동**: `memory-reflection.ts` 크론 + pgvector 시맨틱 검색 + `soul-enricher.ts` (PRD §soul-enricher, Sprint 1 신규) `{relevant_memories}` 주입
- **피드백**: Notifications "오늘 Reflection 3건 생성" + Dashboard 성공률 추이 차트
- **데이터 가시성 권한**: Admin = 전체 에이전트 Reflection 열람, CEO = 자사 에이전트만 열람, 일반 직원 = 접근 불가 (PRD 역할 기반 접근 제어)

---

### Critical Success Moments

#### CSM-1: CEO 첫 `/office` 접속 — "내 AI 팀이 살아있다" (Sprint 4)

**시나리오**: Admin이 테스트 태스크를 사전 예약 → CEO 첫 접속 시 픽셀 캐릭터들이 책상에서 타이핑/도구 사용/말풍선 표시.

| 요소 | 기준 | 실패 시 |
|------|------|--------|
| FCP (shell) | ≤ 1.5초 | 빈 화면 2초+ → "느리다" 인식 → WOW 불발 |
| TTI (캐릭터+WS) | ≤ 3초 | 정적 화면 3초+ → "이게 뭐지?" 혼란 |
| 에이전트 활동 | ≥ 1명 working 상태 | 전원 idle → "뭐하는 건지 모르겠다" → WOW 불발 |
| 시각적 품질 | 부드러운 애니메이션 (60fps desktop) | 버벅임 → "완성도 낮다" 인식 |
| 접근성 (a11y) | aria-live 패널 — 상태 변경 5초 내 스크린리더 전달, WebGL 미지원 시 리스트 뷰 fallback (DC-1) | 스크린리더 사용자 상태 파악 불가 |

**보장 메커니즘**: Admin 온보딩 마지막 단계에서 "테스트 태스크 예약" 권장 (선택이나 강력 안내) → CEO 첫 접속 WOW 달성률 90%+ 목표.

#### CSM-2: Big Five 슬라이더 첫 변경 — "진짜 개성이 있네" (Sprint 1)

**시나리오**: Admin이 성실성 슬라이더를 95로 올림 → 저장 → CEO 앱 Chat에서 해당 에이전트에게 태스크 지시 → 응답이 체크리스트 형태 + 꼼꼼한 검증 톤으로 변화.

| 요소 | 기준 | 실패 시 |
|------|------|--------|
| 슬라이더 반응 | 즉시 (드래그 지연 0) | 랙 → "이 UI 구린데" |
| 툴팁 피드백 | 슬라이더 이동 중 실시간 예시 업데이트 | 무반응 → 슬라이더 의미 파악 불가 |
| 성격 반영 | 다음 Chat 메시지부터 톤 변화 | 변화 없음 → "이 기능 작동 안 하는 거 아닌가?" |
| 저장 확인 | Toast "성격 설정 저장 완료 ✓" (≤ 500ms) | 저장 여부 불확실 → 반복 저장 |
| 접근성 (a11y) | 키보드 Arrow keys로 5개 슬라이더 전부 조작 가능, role="slider" + aria-valuemin/max/now | 키보드 사용자 성격 설정 불가 |

#### CSM-3: 첫 번째 Reflection 알림 — "에이전트가 배우고 있다" (Sprint 3)

**시나리오**: 에이전트 태스크 수행 1주일 후 → Reflection 크론 실행 → Notifications "마케팅 에이전트: 오늘 반성 3건 생성 (보고서 형식 개선, 데이터 출처 명시, 시각화 추가)" → CEO가 "이 에이전트가 실제로 학습하고 있구나" 체감.

| 요소 | 기준 | 실패 시 |
|------|------|--------|
| 알림 도착 | Reflection 크론 완료 후 즉시 (Notifications + 벨 아이콘 배지) | 무알림 → 기능 존재 인지 불가 |
| 알림 내용 | 구체적 학습 항목 3개 나열 | "Reflection 완료" 한 줄 → 가치 전달 불가 |
| Dashboard 연동 | "이번 주 Reflection 3건" 위젯 + 성공률 차트 업데이트 | 지표 없음 → 장기 성장 추적 불가 |
| 접근성 (a11y) | Reflection 알림 스크린리더 읽기 가능 — Notifications 벨 배지 aria-label "새 알림 N건" | 시각 장애 사용자 알림 인지 불가 |

#### CSM-4: Admin 온보딩 완료 — "우리 AI 조직이 준비됐다" (Pre-Sprint ~ Sprint 1)

**시나리오**: Admin이 Wizard 6단계 완료 (회사설정 → 조직 → 에이전트 + Big Five → Soul → [n8n] → CEO 초대) → ≤ 15분 내 완료 → CEO에게 초대 링크 발송 → "AI 조직이 준비됐다"는 성취감.

| 요소 | 기준 | 실패 시 |
|------|------|--------|
| 총 소요 시간 | ≤ 15분 (프리셋 사용 기준) | 30분+ → "이거 너무 복잡하다" 이탈 |
| 진행 표시 | 6단계 프로그레스 바 (현재 3/6) | 남은 단계 불명 → 불안감 |
| 단계별 완료 피드백 | 각 단계 완료 시 체크마크 + "다음: [단계명]" | 완료 여부 불확실 → 반복 작업 |
| 최종 완료 | 축하 화면 + CEO 초대 CTA | 무반응 → "끝난 건가?" |
| 접근성 (a11y) | Wizard 6단계 키보드만으로 완료 가능 + 단계 전환 시 focus 자동 이동, 프로그레스 바 aria-valuenow | 키보드 사용자 온보딩 불가 |

#### CSM-5: 첫 n8n 워크플로우 성공 실행 — "코드 없이 자동화했다" (Sprint 2)

**시나리오**: Admin이 "Slack 알림" 프리셋 워크플로우 선택 → API 키 입력 → 활성화 → 첫 자동 실행 성공 → Slack에 메시지 도착.

| 요소 | 기준 | 실패 시 |
|------|------|--------|
| 프리셋 → 활성화 | ≤ 10분 (API 키 입력 포함) | 30분+ → "그냥 개발자한테 맡길게" |
| 실행 결과 확인 | 워크플로우 목록에 "성공 ✓" + 실행 시간 | 결과 불명 → 불안감 |
| n8n Docker 가용성 | 99%+ (Hono healthcheck `/admin/n8n/healthz` 30초 간격) | OOM → "서비스 일시 중단" + 재시도 가이드 |
| 마케팅 파이프라인 | ≤ 30분 (6단계 프리셋 + API 키), 진행률 표시 | 복잡도로 인한 중도 포기 |
| 접근성 (a11y) | 워크플로우 목록/실행 이력 키보드 탐색 가능 (n8n 에디터 자체는 제외 — 외부 의존) | 키보드 사용자 결과 확인 불가 |

---

### Experience Principles

CORTHEX v3의 모든 UX 결정은 다음 5가지 원칙에 따른다:

#### EP-1: "보여주고, 설명하지 말라" (Show, Don't Tell)

AI 조직의 상태를 텍스트 로그가 아닌 **시각적 표현**으로 전달한다. `/office` 픽셀 캐릭터, Big Five 슬라이더, 성장 차트, NEXUS 조직도 — 비개발자 CEO가 한눈에 파악할 수 있는 시각적 인터페이스가 우선이다.

- **적용**: 에이전트 상태 = 픽셀 애니메이션 (텍스트 로그 ✕), 성격 = 슬라이더 (JSON 편집 ✕), 조직 = 노드 그래프 (테이블 ✕)
- **예외**: Chat 영역은 텍스트 중심 (대화 본질)

#### EP-2: "코드 0줄, 배포 0회" (Zero-Code, Zero-Deploy)

Admin/CEO가 수행하는 모든 설정 변경은 **저장 즉시 반영**된다. Soul 편집, Big Five 조정, 조직 구조 변경, n8n 워크플로우 — 모두 코드 수정과 배포 없이 완료.

- **적용**: Soul 저장 → 다음 메시지부터 적용, NEXUS 저장 → 즉시 반영, Big Five 저장 → 다음 태스크부터 적용
- **안전망**: "즉시 반영 = 실수도 즉시 반영". NEXUS 에이전트 이동/부서 삭제 시 확인 모달 ("정말 삭제하시겠습니까?"), Ctrl+Z undo (최근 10회 액션 스택). Soul 편집은 저장 전 diff 미리보기.
- **보안**: 저장 전 4-layer sanitization (성격), 8-layer 보안 (n8n) — 편의성과 보안은 양립

#### EP-3: "준비된 무대, 놀라운 첫인상" (Prepared Stage)

사용자의 첫 경험은 **사전에 설계**된다. Admin 온보딩이 CEO의 WOW 모먼트를 보장하는 구조. 빈 상태는 절대 방치하지 않는다 — 항상 다음 행동을 안내하는 CTA가 있다.

- **적용**: 테스트 태스크 예약 → CEO 첫 접속 WOW, 워크플로우 프리셋 3개 → 빈 n8n 페이지 방지, 역할 프리셋 → 빈 슬라이더 방지
- **빈 상태 패턴**: "첫 번째 [X]를 만들어보세요" + 작동 원리 일러스트 + CTA 버튼

#### EP-4: "성장이 눈에 보인다" (Visible Growth)

에이전트의 학습과 성장은 **즉시 눈에 보이지 않지만, 중간 피드백으로 기대감을 유지**한다. Reflection 알림, 성공률 차트, 학습 이력 — 매일 조금씩 성장하는 AI 조직을 사용자가 체감할 수 있는 장치를 모든 접점에 배치한다.

- **적용**: Notifications Reflection 알림, Dashboard 성공률 추이, 에이전트 프로필 학습 이력, Performance 페이지 비교 차트
- **서사**: "오늘은 아직 변화가 크지 않지만, 한 달 후에는 분명히 다릅니다"

#### EP-5: "실패해도 안전하다" (Safe to Fail)

모든 에러 상태에 **명확한 원인 + 다음 행동**을 제시한다. WebSocket 끊김, n8n OOM, 슬라이더 저장 실패, Reflection 크론 에러 — 사용자가 "뭔가 잘못됐는데 어떻게 해야 하는지 모르겠다" 상태에 빠지지 않도록 한다.

- **적용**: 에러 메시지 형식 `[E-XXX-NNN] 한국어 설명 + 다음 행동` (v3 UX 신규 형식 — XXX=모듈 코드, NNN=에러 번호), retry 자동 재시도, degraded mode 안내, 서버 부하 시 graceful degradation (DC-7 3단계)
- **보안 에러**: 4-layer sanitization 실패 시 사용자에게 "입력에 문제가 있습니다" (상세 원인 비노출) — 공격자에게 정보 유출 방지

---

## Desired Emotional Response

### Primary Emotional Goals

CORTHEX v3는 사용자에게 세 가지 핵심 감정을 전달해야 한다:

**1. "내가 이 AI 조직의 CEO다" — 통제감 (Sense of Command)**

CEO 김도현이 Chat에서 지시하고, `/office`에서 관찰하고, Dashboard에서 결과를 확인하는 루프를 돌 때, "내가 이 조직을 통제하고 있다"는 감정이 핵심이다. 에이전트가 자율적으로 움직이되 CEO의 지시에 즉시 반응하는 구조 — 자동화의 편리함과 통제의 안정감이 동시에 전달되어야 한다.

- **촉발 순간**: Chat에서 "보고서 작성해줘" → 에이전트 즉시 응답 시작 → `/office`에서 해당 에이전트 working 상태 확인
- **감정 강도**: 매일 반복하는 core loop에서도 **꾸준히** 느껴야 하는 baseline 감정 (흥분이 아닌 안정감)
- **실패 시**: "이 에이전트들이 뭘 하는지 모르겠다" → 통제감 상실 → 플랫폼 불신

**2. "진짜 성장하고 있구나" — 경이로움 (Wonder of Growth)**

Admin 이수진이 Big Five 슬라이더를 조정하고, 1주일 후 Reflection 알림을 확인하고, 한 달 후 성공률 차트가 올라간 것을 볼 때 "이 AI가 진짜 배우고 있다"는 감정. CORTHEX만의 고유한 감정 — 경쟁사(CrewAI, LangGraph)에서는 에이전트 "성장"이라는 개념 자체가 없다.

- **촉발 순간**: Notifications "마케팅 에이전트: 반성 3건 생성" + Dashboard 성공률 65%→80% 추이
- **감정 강도**: 드물지만 강렬한 WOW 모먼트 (CSM-3). 첫 Reflection 알림이 가장 강렬
- **실패 시**: "1주일째 아무 변화 없다" → "이 기능 작동하긴 하는 거야?" → 핵심 차별점 무효화

**3. "코드 한 줄 없이 이걸 만들었다" — 성취감 (Empowerment)**

Admin이 온보딩 Wizard 15분 만에 AI 조직을 완성하고, NEXUS에서 드래그&드롭으로 조직을 재설계하고, n8n에서 코드 없이 자동화를 구축할 때 — "비개발자인 내가 이 복잡한 시스템을 직접 만들었다"는 성취감.

- **촉발 순간**: CSM-4 온보딩 완료 축하 화면, CSM-5 첫 워크플로우 성공 실행
- **감정 강도**: 초기 설정 시 강렬 → 일상 사용 시 은은한 자신감으로 전환
- **실패 시**: "이거 너무 복잡하다, 개발자한테 맡겨야겠다" → Zero-Code 가치명제 붕괴

---

### Emotional Journey Mapping

```
Phase 1: 발견 (Discovery)
  Admin: "이런 게 있었어?" → 호기심 + 약간의 회의감
  감정 온도: ★★★☆☆ (neutral-positive)
  핵심 UX: 랜딩 페이지 / 소개 영상 — 30초 내 "코드 없이 AI 조직" 메시지 전달

Phase 2: 첫 설정 (Onboarding)
  Admin: "생각보다 쉽다!" → 성취감 상승 + 기대감
  감정 온도: ★★★★☆ (positive, building)
  핵심 UX: Wizard 6단계 프로그레스 바, 프리셋 1-click, 단계 완료 체크마크
  위험: 15분 넘어가면 → "복잡하다" → 이탈. 각 단계 ≤2.5분 목표

Phase 3: 첫 WOW (First Wow Moment)
  CEO: "와, 진짜 살아있는 것 같다!" → 놀라움 + 흥분
  감정 온도: ★★★★★ (peak positive)
  핵심 UX: CSM-1 `/office` 첫 접속 — 픽셀 캐릭터 활동 + 말풍선
  위험: 사전 태스크 없으면 전원 idle → WOW 불발. Admin 온보딩이 보장

Phase 4: 일상 사용 (Daily Use)
  CEO: "편하다, 매일 쓰게 된다" → 안정적 만족감 + 통제감
  Admin: "주간 체크만 하면 된다" → 가벼운 책임감 + 효율성
  감정 온도: ★★★★☆ (sustained positive)
  핵심 UX: Hub 대시보드 한눈 확인, Chat 즉시 응답, 사이드바 네비게이션
  위험: "매번 똑같다" → 무감각. Reflection 알림 + 성장 차트로 변화 주기

Phase 5: 성장 체감 (Growth Recognition)
  CEO/Admin: "진짜 똑똑해졌다!" → 경이로움 + 애착
  감정 온도: ★★★★★ (renewed peak)
  핵심 UX: CSM-3 Reflection 알림 + 성공률 차트 추이 + Performance 비교
  위험: Reflection 품질 낮으면 → "별 거 아니네" → 기능 무시

Phase 6: 에러/장애 (Failure Recovery)
  CEO/Admin: "잠깐 문제가 있었지만, 금방 해결됐다" → 안심 + 신뢰 유지
  감정 온도: ★★★☆☆ → ★★★★☆ (dip then recovery)
  핵심 UX: EP-5 에러 메시지 + 자동 재연결 + degraded mode 안내
  위험: 원인 불명 에러 → "뭐가 잘못된 거야?" → 신뢰 붕괴

Phase 7: 재방문 (Return)
  CEO: "오늘은 뭐가 달라졌을까?" → 기대감 + 호기심
  감정 온도: ★★★★☆ (anticipation)
  핵심 UX: Hub "마지막 접속 이후 변경사항" 위젯, 새 Reflection 알림 배지
  위험: "어제랑 똑같다" → 흥미 감소. 최소 주 1회 변화 포인트 필요
```

---

### Micro-Emotions

| 대비쌍 | 목표 감정 | 위험 감정 | 핵심 UX 장치 |
|--------|----------|----------|-------------|
| **자신감 vs 혼란** | Admin이 "다음 단계가 뭔지 안다" | "뭘 해야 하는지 모르겠다" | Wizard 프로그레스 바, 빈 상태 CTA, 단계별 안내 |
| **신뢰 vs 의심** | "에이전트가 제대로 작동하고 있다" | "이거 진짜 되는 건가?" | `/office` 실시간 상태, activity logs, 성공률 지표 |
| **흥분 vs 불안** | CEO 첫 `/office` "와!" | "뭐가 잘못된 건 아니지?" | 사전 태스크 예약, 로딩 스켈레톤, FCP ≤1.5s |
| **성취 vs 좌절** | "15분 만에 AI 조직 완성!" | "30분째인데 아직 절반도 안 했다" | 프리셋, 소요시간 표시, 단계 스킵 옵션 (1인 창업자) |
| **기쁨 vs 무감각** | "Reflection 알림이 왔다!" | "또 알림이야..." | 구체적 학습 항목 3개 나열 (추상적 "완료" ✕), 주간 요약 |
| **안전 vs 두려움** | "실수해도 되돌릴 수 있다" | "잘못 누르면 다 날아가는 거 아냐?" | Ctrl+Z undo, 삭제 확인 모달, Soul diff 미리보기 |
| **소속감 vs 고립** | "내 AI 팀이다" | "혼자서 이 복잡한 걸..." | `/office` 팀 시각화, 에이전트 개성(Big Five), 성장 서사 |

---

### Design Implications

감정 목표를 구체적 UX 선택으로 연결한다:

**통제감 → 즉시성 (Immediacy)**
- Soul 편집 = 다음 메시지부터 적용 (EI-1). 배포 대기 0초
- `/office` WebSocket 실시간 상태 갱신 (EI-4). 새로고침 불필요
- Chat 응답 스트리밍 — 타이핑 중 바로 보기, 완료 대기 불필요
- 설계 규칙: **모든 사용자 액션의 피드백 ≤ 500ms** (Toast, 상태 변경, 애니메이션 시작)

**경이로움 → 점진적 발견 (Progressive Disclosure)**
- 첫 주: "/office 예쁘다" (시각적 WOW)
- 1주 후: "Reflection이 뭐지?" → 알림 → "오, 배우고 있다!"
- 1개월 후: "성공률이 올랐다!" (성장 차트)
- 설계 규칙: **기능을 한꺼번에 보여주지 않는다.** 사용자가 준비됐을 때 자연스럽게 발견 (알림 → 호기심 → 탐색)

**성취감 → 축하와 확인 (Celebration & Confirmation)**
- 온보딩 완료 → 축하 화면 + "CEO 초대" CTA
- 워크플로우 첫 성공 → "성공 ✓" + 실행 시간 표시
- Big Five 저장 → Toast "성격 설정 저장 완료 ✓"
- 설계 규칙: **모든 의미 있는 완료에 피드백** — 무반응 = 불확실성 = 좌절

**안전 → 예측 가능성 (Predictability)**
- 에러 메시지 항상 동일 형식 `[E-XXX-NNN] 원인 + 다음 행동`
- 자동 재연결 3초 간격 (최대 5회) — 사용자 개입 없이 복구 시도
- 위험한 액션 (부서 삭제, 에이전트 제거) = 항상 확인 모달
- 설계 규칙: **예외 없는 일관성** — 같은 유형의 상호작용은 항상 같은 방식으로 동작

---

### Emotional Design Principles

**EDP-1: "1초 안에 반응하라"**
사용자가 액션을 취하면 **1초 안에 시각적 피드백**이 있어야 한다. 500ms 내 Toast/로딩/애니메이션 시작. 피드백 없는 1초 = "고장났나?" 감정 발생. 이 원칙은 EP-2 "Zero Deploy"와 결합하여 "즉시 반응하는 AI 조직"이라는 핵심 감정을 만든다.

**EDP-2: "실패를 축소하지 말라"**
에러가 발생하면 **숨기지 않되, 공포를 조장하지도 않는다.** "뭔가 잘못됐습니다"(모호) ✕, "WebSocket 연결이 끊어졌습니다. 자동 재연결 중... (3/5)" ✓. 사용자는 문제의 크기와 해결 진행을 **동시에** 알아야 안심한다. EP-5 "Safe to Fail"의 감정적 근거.

**EDP-3: "성장을 이야기로 만들어라"**
숫자만으로는 경이로움을 만들 수 없다. "성공률 80%"보다 **"마케팅 에이전트가 보고서 형식을 스스로 개선했습니다 (3일 전 피드백 반영)"**이 더 강력한 감정을 만든다. Reflection 알림은 항상 **구체적 학습 항목**을 포함하고, Dashboard는 **변화의 서사**를 보여준다.

**EDP-4: "첫인상은 두 번째 기회가 없다"**
CEO의 첫 `/office` 접속, Admin의 첫 Big Five 조정, 첫 워크플로우 실행 — 이 순간들은 **사전에 설계**되어야 한다. 빈 상태를 절대 보여주지 않는 것이 EP-3 "Prepared Stage"의 감정적 근거. 첫인상에서의 WOW가 장기 사용의 기반이다.

**EDP-5: "복잡함을 느끼게 하지 말라"**
CORTHEX는 내부적으로 복잡하다 (4-layer sanitization, 8-layer 보안, 3단계 메모리). 하지만 사용자는 이 복잡성을 **절대 느끼면 안 된다.** 슬라이더 하나, 프리셋 하나, 텍스트 편집 하나 — 복잡성은 시스템이 흡수하고 사용자에게는 단순함만 전달한다. 이것이 "코드 0줄, 배포 0회"의 감정적 본질이다.

---

## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis

CORTHEX v3의 4가지 핵심 경험 영역별로 가장 적합한 영감 소스를 분석한다:

#### 1. Linear — 프로젝트 관리 대시보드 UX

**핵심 배울 점**: "오파시티와 타이포그래피만으로 정보 위계를 만든다"
- **네비게이션**: 좌측 사이드바 + 키보드 단축키 (Cmd+K). 모든 액션에 키보드 경로 존재.
- **정보 밀도**: 높은 정보 밀도를 깔끔하게 처리 — 데이터가 많아도 "복잡하다"고 느끼지 않음
- **빈 상태**: "No issues match" + 필터 초기화 CTA — 빈 상태에서 다음 행동이 명확
- **속도감**: SPA 페이지 전환이 즉시 (인지 가능한 로딩 없음). 옵티미스틱 업데이트 활용.
- **CORTHEX 적용**: Hub/Dashboard의 정보 위계, 사이드바 네비게이션, 옵티미스틱 업데이트 패턴

#### 2. Notion — 에디터 + 블록 기반 UX

**핵심 배울 점**: "비개발자가 복잡한 구조를 직관적으로 만든다"
- **블록 기반**: 드래그&드롭으로 콘텐츠 재배치 — 코드 없이 복잡한 문서 구조 생성
- **슬래시 커맨드**: `/` 입력 → 기능 팔레트 — 발견 가능한(discoverable) 기능 접근
- **실시간 협업**: 변경 사항 즉시 반영 (Zero Deploy 감성과 동일)
- **온보딩**: 첫 워크스페이스에 샘플 콘텐츠 미리 채워둠 → 빈 상태 방지
- **CORTHEX 적용**: NEXUS 드래그&드롭 조직 편집, Soul Template 에디터, 빈 상태 프리셋 패턴

#### 3. Figma — 캔버스 기반 실시간 협업

**핵심 배울 점**: "캔버스 위의 실시간 상태가 '살아있음'을 전달한다"
- **커서 프레즌스**: 다른 사용자의 커서가 실시간으로 보임 → "함께 작업 중" 감각
- **캔버스 조작**: Pan, Zoom, Select가 매끄럽게 동작 (60fps)
- **컴포넌트 시스템**: 재사용 가능한 디자인 블록 → 일관성 보장
- **CORTHEX 적용**: `/office` PixiJS 캔버스에서 에이전트 캐릭터의 실시간 상태 표시 = Figma 커서 프레즌스의 변형. Pan/Zoom 조작감 참고. "살아있는 조직" 느낌의 핵심 레퍼런스.

#### 4. Vercel Dashboard — DevOps 상태 모니터링

**핵심 배울 점**: "시스템 상태를 비개발자도 이해할 수 있게 시각화한다"
- **배포 상태**: Building → Ready → Error 상태가 색상 + 아이콘으로 즉시 파악
- **로그 스트리밍**: 실시간 빌드 로그 스트리밍 — "진행 중"임을 확인
- **에러 UX**: 에러 발생 시 원인 + 해결 가이드 링크 — "무엇이 잘못됐고 어떻게 고치나"
- **CORTHEX 적용**: n8n 워크플로우 실행 상태 (Success/Failed/Running), Chat 응답 스트리밍, 에러 메시지 형식

#### 5. Habitica — 게이미피케이션 + 성장 시각화

**핵심 배울 점**: "보이지 않는 성장을 게이미피케이션으로 체감시킨다"
- **캐릭터 성장**: 습관 완료 → XP 획득 → 레벨업 + 외형 변화
- **시각적 피드백**: 모든 행동에 시각 + 사운드 피드백 (완료 = 체크마크 + 금화 효과)
- **일일 목표**: 매일 방문할 이유를 만듦 — 연속 기록(streak) 동기부여
- **CORTHEX 적용**: 에이전트 성장 시각화 — Reflection으로 인한 "성장" 느낌을 전달하는 방법. `/office` 픽셀 캐릭터의 시각적 상태 변화 참고. 과도한 게이미피케이션은 경계 (비즈니스 도구 ≠ 게임).

---

### Transferable UX Patterns

**네비게이션 패턴:**

| 패턴 | 출처 | CORTHEX 적용 | 영역 |
|------|------|-------------|------|
| 좌측 고정 사이드바 + Cmd+K 팔레트 | Linear | 사이드바 280px + 전역 검색 팔레트 | 전체 앱 |
| 빵가루 네비게이션 (breadcrumb) | Notion | Admin 앱 깊은 뎁스 페이지 (Settings > Tier > 편집) | Admin |
| 탭 기반 서브네비게이션 | Vercel | Settings 10탭, 에이전트 상세 (Soul/Big Five/Memory) | Admin |

**인터랙션 패턴:**

| 패턴 | 출처 | CORTHEX 적용 | 영역 |
|------|------|-------------|------|
| 드래그&드롭 캔버스 | Figma/Notion | NEXUS 조직 편집, `/office` pan/zoom | Admin, CEO |
| 옵티미스틱 업데이트 | Linear | Soul 저장 → UI 즉시 반영 (서버 응답 전) | 전체 |
| 슬라이더 + 실시간 프리뷰 | Spotify EQ | Big Five 슬라이더 → 행동 예시 실시간 갱신 | Admin |
| 스트리밍 응답 | ChatGPT | Chat 에이전트 응답 토큰 스트리밍 | CEO |
| 자동 재연결 인디케이터 | Slack | WebSocket 끊김 → 상단 배너 "재연결 중..." | CEO |

**시각 패턴:**

| 패턴 | 출처 | CORTHEX 적용 | 영역 |
|------|------|-------------|------|
| 상태 색상 체계 (green/yellow/red) | Vercel | 에이전트 idle/working/error, 워크플로우 성공/실패 | 전체 |
| 활동 히트맵/차트 | GitHub Contribution Graph | Dashboard 에이전트 활동 추이, 성공률 차트 | CEO |
| 픽셀아트 캐릭터 | Habitica | `/office` 에이전트 시각화 (8방향 이동 + 4 상태 애니메이션) | CEO |
| 빈 상태 일러스트 + CTA | Linear/Notion | "첫 번째 에이전트를 만들어보세요" + 아이콘 + 버튼 | 전체 |

---

### Anti-Patterns to Avoid

**AP-1: "AI 답변 로딩 스피너" (ChatGPT 초기 버전)**
AI 응답을 기다리는 동안 로딩 스피너만 보여주면 "멈춘 건가?" 불안감 유발. CORTHEX는 **토큰 스트리밍**으로 응답이 실시간으로 생성되는 과정을 보여준다. `/office`에서도 에이전트가 "working" 상태일 때 타이핑 애니메이션 표시.

**AP-2: "설정 미로" (Jira 초기 설정)**
Jira의 프로젝트 설정은 수십 개 탭과 복잡한 옵션으로 인해 "시작하기 전에 지침" 현상 유발. CORTHEX의 Admin 온보딩은 **6단계 Wizard + 프리셋**으로 제한. 고급 설정은 Wizard 완료 후 선택적 탐색.

**AP-3: "기능 과부하 사이드바" (Slack 채널 폭발)**
Slack의 채널이 수십 개가 되면 사이드바가 스크롤 지옥이 됨. CORTHEX CEO 앱은 **6그룹**으로 통합 (FR-UX), 가장 자주 쓰는 Hub/Chat/Office를 상단 고정.

**AP-4: "데이터 없는 대시보드" (비어있는 Analytics)**
Google Analytics를 처음 열면 "데이터 수집 중" 빈 차트만 보임 → 실망. CORTHEX는 Admin 온보딩에서 **테스트 태스크 예약**으로 CEO 첫 접속 시 빈 대시보드 방지. 데이터 최소 1건 보장.

**AP-5: "과도한 게이미피케이션" (뱃지 범람)**
Habitica의 강점을 차용하되, 비즈니스 도구에서 XP/레벨/뱃지를 남발하면 "장난감 같다"는 인식 유발. CORTHEX의 성장 시각화는 **비즈니스 지표** (성공률, Reflection 품질, 비용 추이)로 제한. 에이전트 픽셀 캐릭터의 시각적 표현은 허용하되 점수/랭킹 게이미피케이션은 금지.

**AP-6: "확인 없는 파괴적 액션" (실수로 삭제)**
에이전트/부서 삭제, Soul 초기화 등 되돌리기 어려운 액션을 확인 없이 실행하면 치명적. 모든 파괴적 액션에 **확인 모달 + Ctrl+Z undo** 안전망 (EP-2 보강).

---

### Design Inspiration Strategy

**채택 (Adopt) — 검증된 패턴 그대로 적용:**

| 패턴 | 출처 | 이유 |
|------|------|------|
| 좌측 고정 사이드바 | Linear | v2에서 이미 사용 중. CEO/Admin 모두 익숙한 패턴 |
| 옵티미스틱 업데이트 | Linear | "저장 즉시 반영" (EP-2) 감정의 기술적 구현 |
| 토큰 스트리밍 | ChatGPT | Chat AI 응답의 표준 UX. 사용자 기대치 형성 완료 |
| 빈 상태 CTA | Linear/Notion | 모든 빈 상태에 "만들기" CTA + 설명 일러스트 |
| 에러 + 해결 가이드 | Vercel | EP-5 에러 형식 `[E-XXX-NNN] 원인 + 다음 행동` |

**적응 (Adapt) — 패턴을 CORTHEX에 맞게 변형:**

| 패턴 | 출처 | 변형 | 이유 |
|------|------|------|------|
| 캔버스 실시간 상태 | Figma 커서 | 에이전트 픽셀 캐릭터 상태 | Figma는 사용자 커서, CORTHEX는 AI 에이전트 상태 |
| 캐릭터 성장 시각화 | Habitica | 비즈니스 지표 기반 성장 | 게임 XP → 성공률/Reflection 품질로 대체 |
| 드래그&드롭 편집 | Notion 블록 | NEXUS 조직도 노드 | 문서 블록 → 부서/에이전트 노드로 변형 |
| 슬라이더 프리뷰 | Spotify EQ | Big Five 행동 예시 | 소리 프리뷰 → 성격 행동 텍스트 프리뷰로 변형 |

**금지 (Avoid) — CORTHEX에 맞지 않는 패턴:**

| 패턴 | 출처 | 금지 이유 |
|------|------|----------|
| XP/레벨/랭킹 게이미피케이션 | Habitica | 비즈니스 도구 = 진지함. "장난감" 인식 방지 |
| 복잡한 초기 설정 (수십 옵션) | Jira | 온보딩 ≤15분 목표. 프리셋 + Wizard로 단순화 |
| 무한 채널/카테고리 사이드바 | Slack | CEO 앱 6그룹 제한 (FR-UX). 사이드바 스크롤 지옥 방지 |
| AI 응답 로딩 스피너 (비스트리밍) | ChatGPT 초기 | 토큰 스트리밍 필수. 로딩만 보여주면 "멈춤" 인식 |
| 다크 테마 기본 (테크 감성) | GitHub/Linear | Natural Organic 팔레트 = cream/olive/sage. "AI = 차가운 테크" 고정관념 탈피 |

---

## Design System Foundation

### Design System Choice

**Themeable System: Radix UI primitives + Tailwind CSS v4 + shadcn/ui 패턴**

CORTHEX v3는 완전 커스텀도 아니고 기성 디자인 시스템(Material, Ant)도 아닌, **Radix UI 무스타일 프리미티브 위에 Tailwind v4로 Sovereign Sage 팔레트를 입히는** 접근 방식을 채택한다. shadcn/ui의 "copy-paste 컴포넌트" 철학을 따르되, 토큰은 Phase 3 Design System에서 정의된 `corthex-*` 네임스페이스를 사용한다.

| 속성 | 선택 | 버전 (pinned) |
|------|------|---------------|
| **CSS 프레임워크** | Tailwind CSS v4 | `tailwindcss ^4.x` (CSS-first config, `@theme` 디렉티브) |
| **UI 프리미티브** | Radix UI | `@radix-ui/react-*` (Dialog, Dropdown, Tabs, Select, Slider 등) |
| **컴포넌트 패턴** | shadcn/ui 스타일 | Copy-paste into `packages/ui/src/components/` — 외부 의존성 아닌 소스 코드 소유 |
| **아이콘** | Lucide React | `lucide-react` (pinned version, no ^) — tree-shaken per-icon. v2에서 사용 중 |
| **폰트** | Inter + JetBrains Mono + Noto Serif KR | v2: CSS `font-family` 선언만 존재 (시스템 fallback). v3: `@fontsource/*` 설치하여 self-hosted 전환 (Pre-Sprint Layer 0) |
| **차트** | Recharts (v3 신규) 또는 Subframe Chart 유지 | v2: Subframe 내장 AreaChart/BarChart/LineChart 사용 중. v3: Recharts 도입 시 `recharts` 설치 필요, 또는 Subframe Chart를 `corthex-*` 토큰으로 리스타일하여 유지 (Sprint 시점 결정) |
| **캔버스** | PixiJS 8 + @pixi/react | `/office` 전용 — WebGL 2D 렌더링 |
| **조직도** | React Flow | NEXUS 캔버스 — 기존 v2 사용 중 |

---

### Rationale for Selection

**왜 Material Design / Ant Design이 아닌가:**

| 기준 | Material Design 3 | Ant Design 5 | Radix + Tailwind (선택) |
|------|-------------------|-------------|------------------------|
| **시각적 독자성** | Google 스타일 강제 — CORTHEX 브랜드와 충돌 | 중국 기업 대시보드 느낌 — 차별화 어려움 | 무스타일 → Sovereign Sage 100% 적용 가능 |
| **번들 크기** | MUI `@mui/material` ~300KB+ gzipped | Ant Design ~200KB+ gzipped | Radix 개별 import ~5-15KB/컴포넌트 |
| **Tailwind 호환** | MUI의 sx prop과 Tailwind 충돌 가능 | Less CSS 기반 — Tailwind와 이질적 | **네이티브 Tailwind** — 클래스 직접 적용 |
| **접근성** | 양호 (WCAG 2.1 AA) | 양호 | **Radix = WAI-ARIA 기본 내장** (Dialog, Tabs, Select 등) |
| **커스터마이징** | theme 오버라이드 복잡 | Less 변수 수정 | CSS 클래스만 수정 — 가장 유연 |
| **v2 기존 코드** | 미사용 | 미사용 | v2 미사용 — **v3 신규 도입**. 단, Subframe의 Radix 기반 구조와 개념적 유사성 있음 |

**왜 shadcn/ui 패턴인가:**

1. **소스 소유**: `npx shadcn@latest add` → 컴포넌트 소스가 프로젝트에 복사됨. 외부 패키지 의존 아닌 자체 코드 → 완전한 커스터마이징 자유.
2. **Radix 기반**: 접근성(WAI-ARIA), 키보드 네비게이션, 포커스 관리가 기본 내장. WCAG 2.1 AA 준수 부담 대폭 감소.
3. **Tailwind v4 네이티브**: `@theme` 디렉티브로 `corthex-*` 토큰을 등록하면 `bg-corthex-bg`, `text-corthex-accent` 같은 유틸리티 클래스가 자동 생성.
4. **트렌드 검증**: 2025-2026 React 생태계에서 shadcn/ui가 사실상 표준 컴포넌트 라이브러리로 자리잡음 (GitHub 80K+ stars).

**v3 신규 도입 전제 사항:**

Radix UI는 v2 코드베이스에 존재하지 않는 **v3 신규 의존성**이다. v2는 `@subframe/core ^1.154.0`을 사용 중이며, Radix와 직접적 관계가 없다. Sprint 1 사전 작업으로 다음 패키지 설치가 필요하다:

```
신규 설치 필요 (Pre-Sprint Layer 0):
@radix-ui/react-dialog
@radix-ui/react-dropdown-menu
@radix-ui/react-select
@radix-ui/react-slider (Big Five용)
@radix-ui/react-tabs
@radix-ui/react-toast
@radix-ui/react-tooltip
@radix-ui/react-slot (Button 패턴)
```

**아키텍처 의사결정 필요 (Pre-Sprint):**

Radix UI는 `architecture.md` L286-334 패키지 목록에 없는 **미계획 신규 의존성**이다. 도입 전 다음을 해결해야 한다:
1. **Architecture Decision 추가**: Radix UI 도입 근거를 D-number로 architecture.md에 등록
2. **React 19 호환성 검증**: 프로젝트 React 버전 (`react ^19.x`). Radix는 React 메이저 버전 업데이트에 대한 지원이 늦는 이력이 있으므로, 8개 패키지 전부 React 19 호환 확인 필수
3. **대안 검토 (리스크 낮음)**: Subframe 프리미티브를 유지하면서 `corthex-*` 토큰으로 리스타일하는 방식. Radix 도입보다 변경 범위가 작고 동일한 시각적 결과 달성 가능. 단, Subframe의 WAI-ARIA 준수 수준 검증 필요.

**최종 결정은 Pre-Sprint Architecture Review에서 확정.** 이 UX 스펙은 Radix를 기본 권장으로 기술하되, Subframe 리스타일 대안도 수용 가능한 경로로 명시한다.

**왜 완전 커스텀이 아닌가:**

1인 팀(Admin 이수진)이 운영하는 VPS 단일 서버 프로젝트에서 Dialog, Select, Tabs, Slider 같은 기본 컴포넌트를 처음부터 구현하는 것은 비효율적. Radix 또는 Subframe이 접근성과 키보드 인터랙션을 해결하므로 CORTHEX는 **비즈니스 로직과 시각 디자인에 집중**할 수 있다.

---

### Implementation Approach

#### 토큰 시스템: `corthex-*` 네임스페이스 단일화

```
packages/app/src/index.css
├── @import "tailwindcss"
├── @theme { /* corthex-* 토큰 전체 정의 */ }
├── @keyframes { /* pulse-dot, slide-in 등 */ }
└── @media (prefers-reduced-motion) { /* 0.01ms override */ }
```

**핵심 토큰 구조** (Phase 3 Design Tokens 기준):

| 카테고리 | 토큰 접두사 | 예시 | 출처 |
|----------|-----------|------|------|
| 배경 | `corthex-bg`, `corthex-surface`, `corthex-elevated` | `bg-corthex-bg` = `#faf8f5` | Design Tokens §1.2 |
| 크롬 | `corthex-chrome`, `corthex-chrome-hover` | `bg-corthex-chrome` = `#283618` | Design Tokens §1.2 |
| 액센트 | `corthex-accent`, `corthex-accent-hover`, `corthex-accent-secondary` | `bg-corthex-accent` = `#606C38` | Design Tokens §1.2 |
| 텍스트 | `corthex-text-primary`, `corthex-text-secondary`, `corthex-text-chrome` | `text-corthex-text-primary` = `#1a1a1a` | Design Tokens §1.3 |
| 시맨틱 | `corthex-success`, `corthex-warning`, `corthex-error`, `corthex-info`, `corthex-handoff` | `text-corthex-error` = `#dc2626` | Design Tokens §1.4 |
| 차트 | `corthex-chart-1` ~ `corthex-chart-6` | 4 hue family, CVD-safe | Design Tokens §1.5 |
| 포커스 | `corthex-focus`, `corthex-focus-chrome` | `ring-corthex-focus` = `#606C38` | Design Tokens §1.6 |

#### 컴포넌트 계층 구조

```
packages/ui/src/components/       ← 공유 컴포넌트 (CEO + Admin)
├── primitives/                   ← Radix 기반 무스타일 래퍼
│   ├── button.tsx               ← Radix Slot + cva() 변형
│   ├── dialog.tsx               ← Radix Dialog + corthex 스타일
│   ├── dropdown-menu.tsx        ← Radix DropdownMenu
│   ├── select.tsx               ← Radix Select
│   ├── slider.tsx               ← Radix Slider (Big Five용)
│   ├── tabs.tsx                 ← Radix Tabs
│   ├── toast.tsx                ← Radix Toast
│   └── tooltip.tsx              ← Radix Tooltip
├── composed/                     ← 비즈니스 컴포넌트
│   ├── agent-card.tsx           ← 에이전트 카드 (상태 dot + 이름 + 부서)
│   ├── big-five-panel.tsx       ← 5개 슬라이더 + 프리셋 + 행동 예시
│   ├── soul-editor.tsx          ← Monaco-lite Soul 템플릿 편집기
│   ├── office-canvas.tsx        ← PixiJS 캔버스 컨테이너
│   ├── nexus-canvas.tsx         ← React Flow 조직도
│   └── workflow-status.tsx      ← n8n 워크플로우 상태 카드
└── layout/                       ← 앱 셸 컴포넌트
    ├── sidebar.tsx              ← 280px olive 사이드바
    ├── topbar.tsx               ← 56px 상단바
    ├── mobile-nav.tsx           ← 모바일 하단 네비 (≤1023px)
    └── page-container.tsx       ← content max-width 1440px 래퍼
```

#### 레거시 마이그레이션: Subframe UI → Radix UI

v2 코드베이스에 **Subframe UI 컴포넌트 44개** (`packages/app/src/ui/components/`)가 존재하며, `theme.css`의 `brand-*`, `neutral-*` 토큰을 사용 중 (~290 usages).

| Phase | 전략 | 범위 |
|-------|------|------|
| **Pre-Sprint (Layer 0)** | `theme.css` 색상값을 `corthex-*` 동일값으로 정렬 + `index.css` 시맨틱 색상 5개 Design Tokens 기준으로 변경 + `--content-max` 1160→1440px + Radix UI 8개 패키지 설치 | `--color-brand-500` = `#606C38` (이미 동일), surface/bg 정렬. 시맨틱 색상: success `#34D399`→`#4d7c0f`, warning `#FBBF24`→`#b45309`, error `#c4622d`→`#dc2626`, info `#60A5FA`→`#2563eb`, handoff `#A78BFA`→`#7c3aed` |
| **Sprint 1~4** | 신규 페이지는 Radix + `corthex-*` 전용. 기존 페이지는 Subframe 유지 | 점진적 교체 — 신규/리팩터 시 교체 |
| **Post-v3** | Subframe 44개 컴포넌트 전수 교체 → `theme.css` + `@subframe/core` 제거 | ~60KB CSS 절감 |

**공존 규칙**: 같은 페이지에 Subframe + Radix 컴포넌트 혼재 허용하되, **신규 컴포넌트는 반드시 Radix + `corthex-*`** 사용. Subframe 컴포넌트에 `corthex-*` 클래스 직접 적용 금지 (토큰 충돌).

**CSS 공존 정책**: Subframe과 Radix 컴포넌트는 **토큰 네임스페이스 분리**로 공존한다. Subframe은 `brand-*`/`neutral-*` 토큰 (`theme.css` 기반, `SubframeCore.createTwClassNames()`으로 Tailwind 유틸리티 클래스 생성), Radix는 `corthex-*` 토큰 (`@theme {}` 기반). 같은 컴포넌트에 두 네임스페이스 혼용 금지. `!important` 금지 — 충돌 발생 시 wrapper `className` override 패턴으로만 해결.

---

### Customization Strategy

#### 색상: Sovereign Sage (60-30-10 규칙)

**"Controlled Nature" 철학**: 구조적 정밀함을 유기적 따뜻함으로 감싸는 팔레트.

| 영역 | 비율 | 색상 | Tailwind 클래스 | 감정적 역할 |
|------|------|------|----------------|------------|
| **Dominant (60%)** | 배경, 카드, 패널 | Cream `#faf8f5`, Surface `#f5f0e8`, Sand `#e5e1d3` | `bg-corthex-bg`, `bg-corthex-surface` | "따뜻하고 열린 공간" — Sage(현자)의 작업대 |
| **Secondary (30%)** | 사이드바, 크롬 | Olive `#283618` | `bg-corthex-chrome` | "권위와 안정감" — Ruler(통치자)의 경계 |
| **Accent (10%)** | 버튼, 활성 표시 | Sage `#606C38`, `#5a7247` | `bg-corthex-accent` | "성장과 생명력" — 통제와 성장의 교차점 |

**WCAG 검증 완료 주요 대비비** (Design Tokens Appendix B):

| 조합 | 대비비 | AA 기준 | 상태 |
|------|--------|---------|------|
| Text primary `#1a1a1a` on cream `#faf8f5` | 16.42:1 | 4.5:1 | PASS |
| Text secondary `#6b705c` on cream | 4.83:1 | 4.5:1 | PASS |
| Chrome text `#a3c48a` on olive `#283618` | 6.63:1 | 4.5:1 | PASS |
| White `#fff` on accent `#606C38` | 5.68:1 | 4.5:1 | PASS (버튼 텍스트) |
| White on accent-hover `#4e5a2b` | 7.44:1 (white-on) / 7.02:1 (on cream) | 4.5:1 | PASS |
| Focus ring `#606C38` on cream | 5.35:1 | 3:1 (UI) | PASS |
| Focus ring `#a3c48a` on olive (사이드바) | 6.63:1 | 3:1 (UI) | PASS |
| Input border `#908a78` on cream | 3.25:1 | 3:1 (1.4.11) | PASS |

**금지 조합**:
- `#e5e1d3` (decorative border)를 인터랙티브 입력 경계로 사용 금지 (1.23:1 — WCAG 1.4.11 FAIL)
- `#606C38` (accent)를 olive 사이드바 위 포커스 링으로 사용 금지 (2.27:1 — FAIL). 사이드바는 `#a3c48a` 사용
- `#a3a08e` (disabled text)를 정보 전달 텍스트로 사용 금지 (2.48:1 — FAIL). 장식용으로만

#### 타이포그래피: Inter + JetBrains Mono

| 역할 | 폰트 | 용도 | 감성 |
|------|------|------|------|
| **UI (primary)** | Inter 400-700 | 전체 UI 텍스트, 네비게이션, 버튼, 폼 | 기하학적 정밀함 — Ruler의 체계적 격자 |
| **Code/Data** | JetBrains Mono 400-500 | Agent ID, 비용값 `$0.0042`, API 엔드포인트, 코드 블록 | 고정폭 정밀함 — Sage의 분석적 데이터 |
| **한국어 세리프** | Noto Serif KR 400, 700 | 장문 한국어 콘텐츠 (Knowledge Library 문서) | 유기적 따뜻함 — 전통 붓글씨의 흐름 |

**2-폰트 규칙**: 단일 뷰에 최대 2종 폰트. Inter (UI) + JetBrains Mono (데이터). Noto Serif KR는 Knowledge 문서에서만 등장.

**타입 스케일** (Major Third 1.250 비율): xs:12 → sm:14 → base:16 → lg:18 → xl:20 → 2xl:24 → 3xl:32 → 4xl:40 → 5xl:48px.

#### 공간: 8px 그리드

모든 간격은 8px 배수 (4px 반간격 허용). 8px 그리드가 예측 가능한 시각적 리듬을 만들고 개발자 판단 비용을 제거한다.

| 토큰 | 값 | Tailwind | 주요 용도 |
|------|-----|----------|----------|
| `space-0.5` | 4px | `gap-1` | 아이콘-텍스트 간격, 인라인 배지 |
| `space-1` | 8px | `gap-2` | 태그, 콤팩트 버튼 패딩 |
| `space-2` | 16px | `gap-4` | 카드 내부 패딩, 폼 필드 간격 |
| `space-3` | 24px | `gap-6` | 콘텐츠 영역 패딩, 카드 그리드 간격 |
| `space-4` | 32px | `gap-8` | 페이지 콘텐츠 패딩 (카드 16px의 2:1 비율) |

#### 모션: 목적적 애니메이션만

| 원칙 | 적용 |
|------|------|
| **transform + opacity만 애니메이트** | width, height, margin 등 레이아웃 촉발 속성 금지 |
| **페이지 전환 애니메이션 없음** | React.lazy 즉시 swap. 인지 가능한 로딩 0 |
| **`prefers-reduced-motion` 필수** | 모든 애니메이션에 0.01ms override |
| **에이전트 상태 펄스만 무한** | `opacity 1→0.5→1` 2s cycle — "살아있음" 신호 |

| 토큰 | 시간 | 용도 |
|------|------|------|
| `duration-fast` | 100ms | 호버, 포커스 링, 버튼 프레스 |
| `duration-normal` | 200ms | 모달 열기/닫기, 커맨드 팔레트, 사이드바 접기 |
| `duration-slow` | 300ms | 모바일 드로어 슬라이드, 바텀 시트 |
| `duration-pulse` | 2000ms | Working 상태 인디케이터 (무한) |

#### 접근성: WCAG 2.1 AA 준수

| 영역 | 구현 | 세부 |
|------|------|------|
| **색상 대비** | 텍스트 ≥4.5:1, UI 컴포넌트 ≥3:1 | 전체 팔레트 검증 완료 (Design Tokens Appendix B) |
| **포커스 관리** | 2px solid ring + 2px offset | Light bg: `#606C38`, Dark bg: `#a3c48a` |
| **키보드 네비게이션** | Radix 기본 내장 | Dialog Esc 닫기, Tabs Arrow 이동, Select 키보드 열기 |
| **스크린리더** | 시맨틱 HTML + ARIA | `aria-live` 상태 변경, `aria-label` 아이콘 버튼, `aria-current="page"` 네비 |
| **색상 단독 금지** | 아이콘 + 텍스트 라벨 필수 | 시맨틱 색상 항상 Lucide 아이콘과 쌍 (CheckCircle, AlertTriangle 등) |
| **CVD 안전** | 차트 4 hue family | olive, blue, salmon, amber — deuteranopia 안전 |
| **터치 타겟** | ≥44px (모바일), ≥36px (데스크톱) | 버튼 `h-11`, 네비 `py-3`, FAB `56px` |
| **강제 색상 모드** | Windows High Contrast fallback | 사이드바, 카드, Zone-B에 `border: 1px solid ButtonText` |
| **감소 모션** | 전체 애니메이션 0.01ms override | `@media (prefers-reduced-motion: reduce)` |

#### 7가지 레이아웃 타입

CORTHEX의 ~67개 페이지는 7가지 레이아웃 타입으로 분류된다:

| 타입 | CSS 패턴 | 해당 페이지 (예시) |
|------|---------|-------------------|
| **Dashboard** | `auto-fit grid` (minmax 반응형) | Hub, Dashboard, Performance |
| **Master-Detail** | `280px list + flex-1 detail` | Chat, Agents, Notifications |
| **Canvas** | `full-bleed` (사이드바 제외 전체) | `/office` (PixiJS), NEXUS (React Flow) |
| **CRUD** | `single-col max-width form` | Settings, Agent Edit, Dept Edit |
| **Tabbed** | `tabs + content area` | Agent Detail (Soul/Big Five/Memory), Settings 10탭 |
| **Panels** | `2×2 grid` (동시 비교) | Performance (비교 모드), Trading |
| **Feed** | `720px centered column` | Activity Log, SNS, Agora |

**공통 앱 셸 (모든 레이아웃에 적용):**
- Sidebar 280px (olive `#283618`) — 데스크톱: 고정, 모바일: 오버레이
- Topbar 56px (cream `#faf8f5`) — breadcrumb + 검색 + 벨 아이콘
- Content area = fluid, max-width 1440px, padding 32px (현재 코드베이스 `--content-max: 1160px`). **주의**: xl breakpoint = 1440px에서 max-width 1440px = 사이드 패딩 0px. Design Tokens 값을 그대로 사용할지, 1280px로 조정할지 Pre-Sprint에서 확정 필요. 1280px 사용 시 양쪽 80px 여유 공간 확보.
- 페이지 컴포넌트는 **content area만 렌더링** (UXUI Rule #2)

#### 단일 테마 전략 (v2 5-테마 → v3 1-테마)

v2에서 5개 테마 (Sovereign/Imperial/Tactical/Mystic/Stealth) 유지로 428곳 `color-mix` 사고가 발생했다. v3는 **Sovereign Sage 단일 테마**로 통합한다.

| v2 (폐기) | v3 (확정) |
|-----------|----------|
| 5개 테마, `themes.css` | 1개 테마, `index.css @theme` |
| `color-mix()` 428곳 | `corthex-*` 토큰 직접 참조 |
| 다크 모드 기본 (slate-950) | **라이트 모드 전용** (cream #faf8f5) |
| 테마 전환 UI 필요 | 전환 UI 없음 — 일관된 경험 |

**다크 모드**: v3 초기 출시 범위 밖. 추후 단일 다크 테마 추가 시, 토큰 매핑 레이어 (`--bg-primary: #1a1f14` 등)로 대응 — 5-테마 반복 금지. Design Tokens §7.4에 참고용 매핑 사전 정의됨.

---

## Defining Experience Deep Dive

Step 3에서 정의한 CEO/Admin Core Loop을 "이 제품을 친구에게 한 문장으로 설명한다면?"이라는 관점에서 심화 분석한다.

### The One Interaction

> **"자연어로 AI 팀에게 일을 시키면, 에이전트들이 실시간으로 일하는 모습을 눈으로 본다."**

CORTHEX v3의 존재 이유를 한 문장으로 압축하면 이것이다. Chat에서 "분기 실적 분석해줘"를 입력하는 순간 → Secretary가 CIO에게 라우팅 → CIO가 전문가 4명에게 병렬 핸드오프 → `/office`에서 5개 픽셀 캐릭터가 동시에 타이핑 → 완료 시 말풍선 "분석 완료" — 이 **전체 흐름이 3초 안에 시작되고, 눈으로 확인되며, 결과가 스트리밍으로 돌아오는 것**.

이 인터랙션이 완벽하면 나머지(Dashboard, Settings, n8n)는 자연스럽게 따라온다. 이 인터랙션이 깨지면 — 응답이 늦거나, 잘못된 에이전트가 받거나, `/office`에서 아무 움직임이 없으면 — 플랫폼 전체의 가치가 무너진다.

**왜 이것인가:**

| 경쟁사 | 핵심 인터랙션 | CORTHEX 차별점 |
|--------|-------------|---------------|
| ChatGPT | 1:1 대화 | **1:N 조직** — 하나의 지시가 여러 에이전트로 분산 |
| CrewAI | 코드로 에이전트 정의 → CLI 실행 | **자연어 지시 + 실시간 시각화** — 코드 0줄, 결과를 눈으로 봄 |
| LangGraph | 그래프 정의 → 프로그래밍 실행 | **드래그&드롭 조직 설계 + 자연어 운영** — 비개발자 완전 접근 |
| AutoGen | 에이전트 그룹 채팅 (텍스트 로그) | **픽셀 캐릭터 + 상태 애니메이션** — "살아있는 조직" 체감 |

### User Mental Model

#### CEO의 멘탈 모델: "진짜 회사처럼"

CEO 김도현은 CORTHEX를 **실제 회사 운영과 동일한 프레임**으로 이해한다:

```
실제 회사 운영          →   CORTHEX v3
────────────────────    ───────────────────
사무실에 출근            →   /office 열기
비서에게 "이거 해줘"     →   Chat에서 자연어 지시
직원들이 각자 작업        →   에이전트 병렬 실행
사무실 돌아보기          →   /office 캐릭터 관찰
결과 보고 받기           →   Chat 스트리밍 응답
주간 성과 확인           →   Dashboard 성공률/비용 차트
```

**핵심 기대**: "내가 말하면 알아서 처리하고, 진행 상황을 내가 확인할 수 있어야 한다." 기술적 세부사항(API, WebSocket, LLM 모델)은 CEO의 멘탈 모델에 존재하지 않는다. CEO가 인지하는 것: 에이전트 이름, 부서, 현재 상태(일하는 중 / 대기 / 에러).

**혼란 가능 지점과 해소:**

| 혼란 | 원인 | UX 해소 |
|------|------|--------|
| "왜 직접 에이전트를 고를 수 없지?" | Secretary 자동 라우팅 개념 미숙지 | Chat 상단에 `[비서 → CIO]` 라우팅 경로 표시 + "다른 에이전트에게" 재라우팅 버튼 |
| "이 에이전트가 지금 뭘 하는 거지?" | `/office` 미접속, 텍스트만 봄 | Hub에서도 에이전트 상태 dot (idle/working/error) 표시 + `/office` 바로가기 |
| "성격을 바꿨는데 차이를 모르겠다" | Big Five 변경 효과가 미묘할 수 있음 | Chat 응답 상단에 `[성격 프로필: 성실성 85]` 표시 (Admin 설정 시 toggle) |
| "Reflection이 뭐야?" | 3단계 메모리 개념 생소 | Notifications에 "에이전트가 스스로 학습한 내용"이라는 부제 + 구체적 학습 항목 나열 |

#### Admin의 멘탈 모델: "HR + IT 관리자"

Admin 이수진은 CORTHEX를 **HR 조직 설계 + IT 인프라 관리의 합성**으로 이해한다:

```
HR 관리                 →   CORTHEX Admin
────────────────────    ───────────────────
조직도 작성              →   NEXUS 드래그&드롭
직원 채용 + 역할 부여    →   에이전트 생성 + Soul 편집
성격/적성 평가           →   Big Five 슬라이더 조정
워크플로우 표준화         →   n8n 프리셋 설치 + 커스터마이즈
인사 평가               →   Dashboard 성공률 + Reflection 모니터링
예산 관리               →   Tier 비용 한도 설정
```

**핵심 기대**: "처음에 잘 설계해두면, 이후에는 가끔 확인만 하면 된다." Admin은 **초기 설정 비용이 높고 유지 비용이 낮은** 구조를 기대한다. 매일 들어와서 무언가를 조정해야 한다면 실패.

**혼란 가능 지점과 해소:**

| 혼란 | 원인 | UX 해소 |
|------|------|--------|
| "Soul을 어떻게 써야 하지?" | 프롬프트 엔지니어링 경험 부재 | 역할별 Soul 프리셋 5개+ (분석가, 마케터, 고객지원 등) + "이 변수가 자동 주입됩니다" 안내 |
| "Big Five 숫자가 뭘 의미하는 건지" | 심리학 용어 생소 | 각 슬라이더에 행동 예시 실시간 표시 ("성실성 85 → 체크리스트 자동 생성, 빠짐없이 검증") |
| "n8n 에디터가 복잡하다" | n8n 자체 학습곡선 | CORTHEX React UI에서 워크플로우 CRUD + 활성화만 관리. n8n 에디터는 고급 사용자용 선택 접근 |
| "Reflection 비용이 얼마나 나오는 거지?" | 비용 예측 불가 | 온보딩에서 Tier별 일일 한도 설정 강제 안내 ($0.10~$0.50/agent/day) + Dashboard 비용 추이 위젯 |

#### 공통 멘탈 모델: "AI 조직 = 소규모 회사"

CEO와 Admin 모두 CORTHEX를 **"AI 에이전트로 구성된 소규모 회사"**로 이해한다. 이 은유(metaphor)가 플랫폼 전체 UX의 기반이다:

- **부서** = 에이전트 그룹 (실제 회사 부서와 동일 개념)
- **비서** = 프론트 데스크 (요청을 올바른 부서로 연결)
- **Soul** = 직무기술서 (Job Description)
- **Big Five** = 성격/적성 (실제 직원의 성향)
- **Reflection** = 업무 회고 (실제 직원의 자기 성장)
- **NEXUS** = 조직도 (실제 회사 org chart)
- **`/office`** = 사무실 CCTV (실시간 모니터링)

이 은유가 깨지면 — 예를 들어 "Soul"을 "시스템 프롬프트"라고 표시하거나, Reflection을 "vector embedding 기반 메모리 콘솔리데이션"이라고 설명하면 — 비개발자 사용자의 멘탈 모델이 붕괴한다. **모든 UI 라벨과 설명은 회사 운영 은유를 따른다.**

---

### Success Criteria for Core Experience

"이 제품이 작동한다"고 사용자가 느끼는 순간을 정량적으로 정의한다.

#### SC-1: Chat 지시 → 올바른 에이전트 응답 (Secretary 라우팅)

| 기준 | 수치 목표 | 측정 방법 |
|------|----------|----------|
| **라우팅 정확도** | 첫 시도 ≥80%, Soul 튜닝 후 ≥95% | `activity_logs`에서 misroute 신고 비율 |
| **첫 응답 시작** | ≤3초 (processing 이벤트 포함) | Chat UI 타임스탬프 — 전송 → 첫 토큰 |
| **라우팅 경로 표시** | 100% (모든 응답) | `[비서 → 에이전트명 · 부서명]` 태그 유무 |
| **재라우팅 성공** | 1-click, ≤2초 | "다른 에이전트에게" 버튼 → 재전송 → 응답 시작 |

**"작동한다" 감정**: CEO가 "영업 보고서 작성해줘"를 입력하고 3초 안에 올바른 에이전트(영업부 담당)가 응답을 시작하면 → "알아서 잘 돌아간다" 신뢰 형성.

**"작동 안 한다" 감정**: 5초 지나도 응답 없거나, HR 에이전트가 영업 보고서를 작성하면 → "이거 쓸 수 있는 건가?" 신뢰 붕괴.

#### SC-2: `/office` 실시간 상태 반영

| 기준 | 수치 목표 | 측정 방법 |
|------|----------|----------|
| **FCP (shell)** | ≤1.5초 | Lighthouse/Web Vitals |
| **TTI (캐릭터+WS)** | ≤3초 | WebSocket onopen → 첫 캐릭터 렌더 |
| **상태 반영 지연** | ≤500ms | agent_status 변경 → `/office` 애니메이션 시작 |
| **최소 활동** | ≥1명 working (첫 접속 시) | Admin 사전 태스크 예약 메커니즘 |
| **프레임레이트** | 60fps (xl), 30fps (lg) — Sprint 4 성능 테스트에서 최종 확정 | PixiJS Ticker stats |

**병렬 실행 전제**: Shell 렌더링(FCP)과 WebSocket 연결(TTI)은 **병렬 실행**한다. Shell paint 중 WS handshake 시작 → FCP 1.5s 시점에 WS 연결 이미 진행 중 → TTI ≤3s 달성. 순차 실행 시 1.5+2=3.5s로 TTI 초과.

**"작동한다" 감정**: `/office`를 열면 2초 안에 에이전트들이 각자 자리에서 움직이고, Chat에서 지시하면 해당 에이전트가 0.5초 내에 타이핑을 시작하면 → "내 AI 팀이 살아있다" WOW.

**"작동 안 한다" 감정**: 3초 넘게 빈 화면이거나, 전원 idle이거나, Chat 지시 후 `/office`에 변화가 없으면 → "이게 뭐지?" 혼란.

#### SC-3: Big Five → 행동 변화 인지

| 기준 | 수치 목표 | 측정 방법 |
|------|----------|----------|
| **슬라이더 반응** | 프레임 누락 없음 (60fps 유지) | Radix Slider + requestAnimationFrame |
| **저장 피드백** | ≤500ms Toast | 클릭 → Toast 타임스탬프 |
| **행동 변화** | 다음 Chat 응답부터 톤 변화 체감 | A/B 비교 (성실성 30 vs 85 응답 톤) |
| **프리뷰 갱신** | 슬라이더 이동 중 실시간 | debounce 100ms → 행동 예시 텍스트 갱신 |

**"작동한다" 감정**: 성실성 슬라이더를 85로 올리고 저장 → CEO가 태스크 지시 → 응답이 체크리스트 형태 + 꼼꼼한 톤으로 돌아옴 → "진짜 개성이 있네!"

**기대 관리**: LLM 성격 반영은 미묘할 수 있다. 극단값(≤20 또는 ≥80)에서는 차이가 명확하지만 중간 범위(40-60)는 체감이 어려울 수 있음. UX 대응: (1) Admin Big Five 패널에 "극단값일수록 성격 차이가 뚜렷합니다" 안내, (2) 슬라이더 저장 후 "성격 비교" 버튼 → 변경 전/후 동일 프롬프트로 샘플 응답 2개 나란히 표시 (A/B 미리보기), (3) 중간값 선택 시 "미묘한 톤 차이가 있을 수 있습니다" 부제.

#### SC-4: 에이전트 성장 체감 (Reflection → 행동 개선)

| 기준 | 수치 목표 | 측정 방법 |
|------|----------|----------|
| **Reflection 생성** | reflected=false AND confidence ≥ 0.7 관찰 ≥20건 누적 시 크론 실행 (PRD FR-MEM3, Architecture D28) | `agent_memories` reflected=true 카운트 |
| **알림 구체성** | 학습 항목 ≥3개 나열 | Notifications 텍스트 파싱 |
| **성공률 변화** | 4주 후 ≥10%p 개선 (baseline 대비, v3 UX 신규 제안 — PRD 명시값 없음) | Dashboard 성공률 추이 차트 |
| **비용 통제** | Tier별 일일 한도 내 | `costs` 테이블 vs `tier_settings` 한도 |

**"작동한다" 감정**: 1주일째 Notifications "CIO: 투자 분석 시 뉴스 자동 포함 학습" → 3주 후 Dashboard 성공률 65%→75% → "이 에이전트가 정말 배우고 있다!"

#### SC-5: Admin 온보딩 → CEO WOW 보장

| 기준 | 수치 목표 | 측정 방법 |
|------|----------|----------|
| **온보딩 소요 시간** | ≤15분 (프리셋 기준) | Wizard 시작 → 완료 타임스탬프 |
| **단계 이탈률** | 각 단계 ≤5% | Wizard 진행률 로그 |
| **CEO 초대 전환율** | ≥80% (온보딩 완료 → CEO 초대) | 초대 링크 발송 로그 |
| **CEO 첫 접속 WOW** | 사전 태스크 활성 비율 ≥90% | Admin 태스크 예약 + CEO 접속 시 에이전트 ≥1명 working |

---

### Novel vs. Established UX Patterns

CORTHEX v3의 인터랙션을 **사용자가 이미 알고 있는 패턴**과 **교육이 필요한 새로운 패턴**으로 분류한다.

#### Established Patterns (기존 UX 차용)

사용자가 별도 학습 없이 즉시 사용할 수 있는 검증된 패턴:

| 패턴 | 참조 | CORTHEX 적용 | 교육 필요도 |
|------|------|-------------|-----------|
| Chat 대화 입력 | ChatGPT, Slack | Hub/Chat — 자연어 입력 → AI 응답 스트리밍 | ☆☆☆ (없음) |
| 좌측 사이드바 네비게이션 | Linear, Notion, Gmail | 280px olive 사이드바 — 6그룹 메뉴 | ☆☆☆ (없음) |
| CRUD 폼 (생성/수정/삭제) | 모든 SaaS | 에이전트 생성, 부서 생성, 회사 설정 | ☆☆☆ (없음) |
| Dashboard 차트/카드 | Vercel, Linear | Hub 현황 카드, Dashboard 성공률 차트 | ☆☆☆ (없음) |
| 알림 벨 아이콘 + 배지 | 모든 웹앱 | Topbar 벨 → Notifications 드롭다운 | ☆☆☆ (없음) |
| 토큰 스트리밍 응답 | ChatGPT | Chat AI 응답 실시간 표시 | ☆☆☆ (없음) |
| 옵티미스틱 업데이트 | Linear | 저장 → UI 즉시 반영 (서버 응답 전) | ☆☆☆ (없음) |
| 탭 기반 상세 뷰 | Vercel, GitHub | Agent Detail (Soul/Big Five/Memory), Settings | ☆☆☆ (없음) |

#### Novel Patterns (CORTHEX 고유)

CORTHEX에서 처음 경험하는 패턴. 교육 전략이 필수적이다:

| 패턴 | 혁신 포인트 | 참조 은유 | 교육 전략 |
|------|-----------|----------|----------|
| **`/office` 가상 사무실** | AI 에이전트를 PixiJS 픽셀 캐릭터로 실시간 시각화 | Habitica + Figma 커서 | 첫 접속 시 "이곳은 AI 팀의 사무실입니다" 온보딩 오버레이 (1회) + 캐릭터 클릭 → 에이전트 상세 팝업 (탐색 유도) |
| **Secretary 자동 라우팅** | 자연어 입력 → 비서가 올바른 에이전트에게 자동 전달 | 회사 비서 (프론트 데스크) | Chat 라우팅 경로 `[비서 → CIO]` 상시 표시. 첫 사용 시 "비서가 가장 적합한 팀원에게 전달합니다" 툴팁 |
| **Big Five 성격 슬라이더** | 0-100 정수 슬라이더 5개로 AI 에이전트 성격 설정 | Spotify EQ + RPG 캐릭터 생성 | 역할 프리셋 1-click으로 초기 진입 장벽 제거. 각 슬라이더 옆 행동 예시 실시간 갱신. "성실성 85 = 체크리스트 자동 생성" |
| **Reflection 자동 학습** | 에이전트가 업무 피드백으로 자동 성장 (observations → reflections → planning) | 신입 직원의 업무 회고 | Notifications에 "에이전트가 배운 것" 구체적 나열 (추상적 "완료" 금지). Dashboard 성공률 차트로 시각적 성장 확인 |
| **Soul 편집 → 즉시 행동 변화** | 텍스트 편집만으로 에이전트 행동 실시간 변경, 배포 0회 | 직무기술서(JD) 수정 | 프리셋 Soul 템플릿 제공 + 변수 `{{personality_traits}}` 자동 주입 설명. diff 미리보기로 변경 확인 |
| **NEXUS 조직도 편집** | 드래그&드롭으로 AI 조직 구조 시각적 설계 (React Flow) | Figma + Notion 블록 편집 | v2에서 이미 사용 중. v3에서 에이전트 상태 색상(4색) 실시간 표시 추가 — 기존 사용자는 즉시 적응 |

**재교육 경로**: 온보딩 오버레이(1회)로 최초 학습 후 잊어버리는 사용자를 위해 — (1) 각 Novel 패턴 페이지 우상단 `?` 아이콘 → "사용 가이드" 미니 팝업 (항시 접근 가능), (2) Settings > "튜토리얼 다시 보기" 옵션으로 온보딩 오버레이 재실행, (3) Hub "도움말" 위젯에 Novel 패턴별 30초 안내 링크.

#### Innovative Combinations (기존 패턴의 새로운 조합)

CORTHEX의 진정한 혁신은 개별 패턴이 아닌 **조합**에 있다:

**IC-1: "지시하고 관찰하기" (Chat × `/office`)**

Chat에서 지시 → `/office`에서 실시간 관찰 → Chat에서 결과 수신. 두 화면을 동시에 열면 "입력 → 시각적 진행 → 결과"가 하나의 흐름으로 연결된다. ChatGPT(텍스트만) + Habitica(캐릭터만)에서 각각 가져왔지만, **AI 업무 지시의 실시간 시각화**라는 조합은 시장에 존재하지 않는다.

**IC-2: "설계하고 생명 불어넣기" (NEXUS × Big Five × Soul)**

NEXUS에서 조직 구조 설계 → 각 에이전트에 Big Five 성격 부여 → Soul 템플릿으로 행동 규칙 정의. "조직도를 그리면 AI 팀이 만들어진다"는 경험은 Figma(디자인) + RPG(캐릭터 생성)의 융합이다. 코드 0줄로 **개성 있는 AI 조직**을 설계하는 것은 CrewAI/LangGraph/AutoGen 어디에도 없다.

**IC-3: "성장이 보인다" (Reflection × Dashboard × `/office`)**

Reflection 알림(텍스트) + Dashboard 성공률 차트(수치) + `/office` 캐릭터 행동 변화(시각). 세 가지 채널에서 동시에 "에이전트가 성장하고 있다"는 증거를 제공한다. 한 가지만으로는 부족 — 숫자만 보면 "그래서 뭐?", 텍스트만 보면 "진짜야?", 시각만 보면 "기분 탓 아닐까?" → 세 채널이 합쳐져 **"진짜 배우고 있구나" 확신**을 만든다.

---

### Experience Mechanics

핵심 인터랙션 "지시 → 관찰 → 성장"의 스텝별 상세 흐름.

#### EM-1: "태스크 지시" 흐름 (CEO Chat → 에이전트 실행)

```
[Initiation]
  CEO가 사이드바에서 "Chat"을 클릭하거나, Hub에서 빠른 입력 필드에 접근한다.
  → 비서가 있는 사용자: 채팅창 상단 "[비서실장] 에이전트가 응답합니다" 표시
  → 비서 없는 사용자: 에이전트 선택 드롭다운 활성

[Interaction]
  1. CEO가 자연어 입력: "분기 실적 종합 분석해줘"
  2. 전송 (Enter 또는 Send 버튼)
  3. 즉시 피드백: 입력 메시지 채팅창에 표시 + "[처리 중...]" 인디케이터

[Processing — 사용자에게 보이는 것]
  4. [0.5초] Secretary routing 완료 → Chat에 `[비서 → CIO · 투자분석부]` 태그 표시
     (Secretary = Haiku tier 기준 ~300ms. Sonnet tier 사용 시 ~1s로 증가 가능)
  5. [1초] CIO 첫 토큰 스트리밍 시작 → 메시지 버블에 텍스트가 한 글자씩 나타남
  6. [1~2초] CIO가 전문가에게 핸드오프 시 → Chat에 `📨 종목분석가, 기술분석가에게 병렬 위임` 표시
  7. [3~20초] 전문가들 병렬 실행 → CIO 종합 → 결과 스트리밍 계속
  8. [완료] 최종 응답 렌더링 완료 → `[✅ 완료 · 12초]` 타임스탬프

[동시에 /office에서 (split-screen 또는 별도 탭 — 데스크톱 전용)]
  (모바일: /office 대신 Hub 에이전트 상태 리스트 뷰로 대체 — Step 3 Platform Strategy 반응형 참조)
  4'. 비서실장 캐릭터: 말풍선 "분석 요청 수신" + 타이핑 애니메이션
  5'. CIO 캐릭터: 도구 아이콘 + 스파크 효과 (tool_calling 상태)
  6'. 종목분석가 + 기술분석가 동시 타이핑 시작 (병렬 핸드오프 시각화)
  7'. 완료된 에이전트: ✅ 말풍선 → idle 복귀 (랜덤 배회)
  8'. 비서실장: "분석 완료" 말풍선

[Error Path]
  - Secretary 라우팅 실패 (baseline 80% = 5회 중 1회 misroute):
    · 자동 감지: PRD 3단계 폴백 — (1) Soul 규칙 매칭 → (2) 부서 태그 매칭 → (3) 프리라우팅 테이블
    · CEO 인지: 응답 상단 `[비서 → 에이전트명]` 태그로 즉시 확인
    · 수동 복구: 응답 하단 "다른 에이전트에게" 버튼 → 에이전트 목록 (부서별 그룹)
    · 피드백 루프: "잘못된 라우팅 신고" 1-click → misroute 3회+ 동일 패턴 시 Admin 알림
  - 에이전트 타임아웃 (15초): "에이전트가 응답하지 못했습니다. 나머지 결과로 종합합니다." + /office에서 해당 캐릭터 빨간 느낌표
  - WebSocket 끊김: 상단 배너 "재연결 중... (2/5)" + 3초 간격 자동 재시도
  - Rate limit 초과 (Chat REST API 60 req/min): "메시지 전송이 일시적으로 제한됩니다. 잠시 후 다시 시도해주세요." + Send 버튼 비활성 (cooldown 표시)

[접근성: Step 2 DC-1 aria-live 참조. 에러 메시지 aria-live="assertive", 라우팅 태그 aria-live="polite"]
```

#### EM-2: "AI 조직 설계" 흐름 (Admin NEXUS + Big Five + Soul)

```
[Initiation]
  Admin이 사이드바에서 "NEXUS"를 클릭한다.
  → 기존 조직도가 React Flow 캔버스에 로드 (노드 = 부서/에이전트, 엣지 = 소속 관계)
  → 빈 상태: "첫 번째 부서를 만들어보세요" + CTA 버튼

[Interaction — 조직 구조]
  1. [+ 부서] 버튼 클릭 → 부서 이름 입력 ("마케팅부") → 노드 생성
  2. [+ 에이전트] 부서 노드 내부 클릭 → 에이전트 이름 + Tier 선택 → 캐릭터 노드 생성
  3. 드래그&드롭: 에이전트를 다른 부서로 이동 (비서실장에서 마케팅부로 연결 드래그)
  4. [저장] → Toast "조직 구조 저장 완료 ✓" (≤500ms)
  5. 즉시 반영: CEO 앱에서 비서가 새 부서를 인식 → 자동 라우팅 경로 업데이트

[Interaction — 성격 설정]
  6. 에이전트 노드 더블클릭 → 에이전트 상세 패널 (슬라이드인)
  7. [Big Five] 탭 선택
  8. 프리셋 드롭다운: "분석가형" 선택 → 5개 슬라이더 자동 설정 (성실성 80, 개방성 30 등)
  9. 미세 조정: 성실성 슬라이더를 85로 드래그 → 우측 패널 실시간 갱신:
     "성실성 85: 체크리스트를 자동 생성하고, 모든 항목을 빠짐없이 검증합니다."
  10. [저장] → Toast "성격 설정 저장 완료 ✓"

[Interaction — Soul 편집]
  11. [Soul] 탭 선택 → 코드 에디터에 Soul 템플릿 로드
      (에디터 선택: CodeMirror 6 (~100KB) 권장. Monaco (~5-10MB)는 번들 크기 과대 — v3 신규 의존성이므로 Architecture Decision 필요)
  12. 편집: "뉴스 반드시 참고" 한 줄 추가
  13. 변수 자동 완성: `{{` 입력 → `personality_traits`, `relevant_memories`, `department_context` 팝업
  14. [저장] → diff 미리보기 ("+ 뉴스 반드시 참고") → 확인 → Toast "Soul 저장 완료 ✓"
  15. 즉시 반영: 다음 Chat 메시지부터 새 Soul 적용

[Completion]
  → NEXUS로 돌아가면 방금 편집한 에이전트 노드에 "편집됨" 배지 (5분 유지)
  → CEO 앱에서 해당 에이전트에게 태스크 지시 → 변경된 행동 확인

[Error Path]
  - 부서 삭제 시: 확인 모달 "마케팅부를 삭제하면 소속 에이전트 3명도 함께 삭제됩니다. 진행하시겠습니까?"
  - 에이전트 이동 후 실수: Ctrl+Z undo (최근 10회 액션 스택, EP-2 안전망 — v3 UX 신규 제안) → 이전 위치로 복귀
  - Soul 템플릿 구문 오류: 저장 시 변수 유효성 검사 → 잘못된 `{{unknown}}` 경고 표시

[접근성: Step 2 DC-3 슬라이더 aria-valuenow/min/max + 키보드 Arrow 참조. Toast 알림 aria-live="polite"]
```

#### EM-3: "성장 확인" 흐름 (Reflection → Dashboard → /office)

```
[Initiation — 자동 (크론)]
  1. 매일 새벽 3시 Reflection 크론 실행
  2. 조건: reflected=false AND confidence ≥ 0.7 관찰 ≥20건 누적 시에만 실행 (미달 시 스킵, PRD FR-MEM3)
  3. 실행: observations → Voyage AI 시맨틱 분석 → reflections 생성

[Feedback — 사용자에게 전달되는 3개 채널]

  Channel A: Notifications (즉시)
  4. Notification 생성: "📊 CIO: 오늘 반성 3건 생성"
     - 학습 항목 구체적 나열:
       "1. 투자 분석 시 뉴스 자동 포함 (7/10 태스크 피드백 반영)"
       "2. 보고서 형식 개선 (표 + 요약 추가)"
       "3. 데이터 출처 명시 (신뢰성 향상)"
  5. CEO 다음 접속 시: 벨 아이콘 빨간 배지 + "새 알림 3건" aria-label

  Channel B: Dashboard (접속 시)
  6. CEO가 Dashboard 접속 → "에이전트 성과" 위젯 업데이트
  7. 성공률 추이 차트: 1주차 65% → 2주차 70% → 3주차 75% (상승 트렌드 표시)
  8. "이번 주 Reflection 3건" 카운터 + "상세 보기" 링크

  Channel C: /office (시각적 변화)
  9. Reflection이 적용된 에이전트의 캐릭터에 미묘한 변화:
     - 이전: 단순 타이핑 애니메이션
     - 이후: 타이핑 + 도구 사용 빈도 증가 (학습된 패턴 반영)
     - 에이전트 클릭 → 팝업에 "최근 학습: 뉴스 자동 포함" 표시

[Completion — CEO의 인지]
  10. 3개 채널 종합: "알림이 왔고(A), 수치가 올랐고(B), 행동이 바뀌었다(C)" → "진짜 배우고 있구나" 확신
  11. CEO의 감정: CSM-3 "에이전트가 배우고 있다" (경이로움) → 플랫폼 신뢰 + 지속 사용 동기

[Admin 관리 경로]
  - Admin → 에이전트 상세 → 메모리 탭: Reflection 목록 + 관찰 통계
  - 잘못된 Reflection: Admin이 삭제 → 다음 크론에서 남은 관찰 기반 재생성
  - 비용 초과: Tier 일일 한도 ($0.10~$0.50) 도달 시 크론 자동 일시 중지 + Admin 알림

[Error Path]
  - Reflection 크론 실패: 메모리 탭 "마지막 Reflection 실패 (날짜)" 경고. 3회 연속 실패 시 Admin Notification
  - Observation 보안 위반: 4-layer 필터 차단 → Admin 대시보드에 🔴 플래그 표시

[접근성: Step 2 DC-4 Reflection 알림 스크린리더 참조. Dashboard 차트에 데이터 테이블 대체 제공]
```

#### EM-4: "온보딩 → CEO WOW 보장" 흐름 (Admin Wizard → CEO 첫 접속)

```
[Initiation]
  Admin 이수진이 초대 링크를 통해 Admin 앱에 첫 접속.
  → Wizard 화면: "AI 조직을 만들어볼까요?" + 6단계 프로그레스 바

[Interaction — 6단계 Wizard]
  Step 1 (≤1분): 회사 정보 입력 (이름, 업종, 설명)
  Step 2 (≤3분): Human 직원 등록 + CLI 토큰 검증 + 비서 유무 설정
    → 1인 창업자: "CEO 초대" 단계 조건부 스킵 옵션 + 앱 전환 네비게이션 안내
  Step 3 (≤3분): 부서 생성 + 에이전트 배치 + Tier 설정
    → 프리셋 조직 구조 3종: "소규모 투자팀", "마케팅+영업", "범용 사무실"
  Step 4 (≤3분): Big Five 성격 설정 (역할 프리셋 1-click)
    → "이 프리셋이면 충분합니다. 나중에 미세 조정 가능합니다." 안내
  Step 5 (선택, ≤3분): n8n 워크플로우 프리셋 설치
    → "건너뛰기" 허용 — 핵심 경험에 필수 아님
  Step 6 (≤2분): CEO 초대 + 테스트 태스크 예약
    → "CEO가 처음 접속할 때 에이전트가 일하는 모습을 보여주려면, 테스트 태스크를 예약하세요." 강력 안내
    → 추천: "모든 부서에 간단한 분석 요청 1건씩 예약" 1-click 옵션

[Completion]
  → 축하 화면: "🎉 AI 조직이 준비되었습니다!" + CEO 초대 링크 복사 버튼
  → "CEO가 접속하면 에이전트들이 일하는 모습을 바로 볼 수 있습니다." 피드백
  → "대시보드로 가기" + "NEXUS에서 조직 확인하기" 2가지 CTA

[CEO 첫 접속 — WOW 보장]
  1. CEO가 초대 링크 클릭 → CEO 앱 로그인
  2. Hub: "환영합니다, 김도현 님! AI 팀이 이미 일하고 있습니다." + 활성 에이전트 카운트
  3. 사이드바 /office 항목에 "NEW" 배지 (첫 방문 유도)
  4. /office 접속: Admin이 예약한 테스트 태스크 실행 중 → 픽셀 캐릭터 활동 + 말풍선
  5. WOW 달성: "내 AI 팀이 이미 일하고 있다!" → CSM-1 성공

[WOW Fallback — Admin 테스트 태스크 미예약 시]
  → CEO 첫 접속 시 활성 에이전트 0명 감지 → 시스템이 자동 데모 태스크 트리거:
    "비서실장에게 '안녕하세요, 간단한 자기소개 해주세요' 자동 전송"
  → 에이전트 ≥1명 working 상태 전환 → /office에서 활동 시각화
  → Hub에 "AI 팀이 인사를 준비하고 있습니다!" 안내 배너

[Error Path]
  - 15분 초과: "나중에 계속하기" 저장 → 다음 로그인 시 이어서 완료
  - CLI 토큰 검증 실패: "토큰이 올바르지 않습니다. 재발급 방법 →" 가이드 링크
  - CEO 초대 미완료: Admin Dashboard에 "CEO 초대 미완료" 배너 지속 표시

[접근성: Step 2 CSM-4 Wizard 키보드 완료 + focus 이동 참조. 프로그레스 바 aria-valuenow]

**온보딩 시간**: SC-5 목표 ≤15분은 PRD Journey 4 ~10분 + 프리셋 사용 여유 + n8n 선택 단계 포함. PRD Journey 4는 v2 기준 최소 경로 10분이며, v3에서 Big Five(Step 4) + n8n(Step 5) 추가로 ≤15분 확장.
```

#### EM-5: "워크플로우 자동화" 흐름 (Admin n8n 관리)

```
[Initiation]
  Admin이 사이드바에서 "워크플로우"를 클릭한다.
  → CORTHEX React UI: 워크플로우 목록 (활성/비활성 토글, 최근 실행 결과, 다음 예정)
  → 빈 상태: "첫 번째 워크플로우를 만들어보세요" + 프리셋 3종 카드 (마케팅 자동화, 보고서 생성, 알림 연동)

[Interaction — 프리셋 설치]
  1. "마케팅 자동화" 프리셋 카드 클릭 → 6단계 파이프라인 설명 팝업
  2. [설치] → n8n Docker에 프리셋 워크플로우 자동 생성 (≤10초)
  3. API 키 입력 안내: 필요한 외부 서비스 (Slack, GA4 등) API 키 입력 폼
  4. [활성화] 토글 ON → 즉시 동작 시작

[Interaction — 커스터마이즈 (고급)]
  5. "n8n 에디터 열기" 링크 → Admin 전용 n8n 비주얼 에디터 (별도 탭)
  6. 드래그&드롭으로 노드 추가/수정 → 저장
  7. CORTHEX UI로 복귀 → 수정된 워크플로우 반영 확인

[Feedback — 실행 결과]
  8. 워크플로우 실행 완료 → 목록에 "✅ 성공" + 실행 시간 + 결과 요약
  9. CEO 앱: 워크플로우 결과 읽기 전용 뷰 (실행 이력, 성공/실패)

[Error Path]
  - n8n Docker OOM (2G 한도): "워크플로우 실행 실패: 메모리 한도 초과. 워크플로우를 분할하거나 Admin에게 문의하세요." + 자동 재시작
  - 외부 API 장애: 해당 노드에 ⚠️ 배지 + "API 키 확인" CTA. 파이프라인 전체 중단 아닌 해당 노드만 일시정지
  - n8n Error Workflow: 타임아웃 30s + 재시도 2회 + fallback 엔진 자동 전환 → Slack/Admin 알림

[접근성: Step 3 CSM-5 워크플로우 목록 키보드 탐색 참조. n8n 에디터 자체는 외부 의존 — 접근성 제외]
```
