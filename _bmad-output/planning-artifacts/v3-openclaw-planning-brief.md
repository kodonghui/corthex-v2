# CORTHEX v3 "OpenClaw" — 기획 브리프

> 이 문서를 VPS tmux에서 `/kdh-full-auto-pipeline planning` 돌리기 전에 반드시 읽을 것.
> 작성: 2026-03-20 사장님 + Claude (VS Code 세션)

---

## 1. 배경: 왜 v3인가

v2는 21개 Epic, 53개 페이지, 62개 API, 117개 DB 테이블로 완성됨. 하지만:

1. **UXUI 혼재**: 3번의 테마 변경(Sovereign Sage → Natural Organic → 부분수정)으로 428곳에 색상 뒤섞임. slate-800이 cream 배경 위에 있어서 안 보이는 요소 다수.
2. **Dead button**: 기능 없는 버튼이 여러 페이지에 존재 (이번 세션에서 7개 제거함)
3. **메뉴 구조 불일치**: PRD와 실제 구현이 다름 (SketchVibe가 CEO앱에 있었는데 Admin 전용임)
4. **기능 한계**: 에이전트가 텍스트 로그로만 보이고, 워크플로우가 자체 구현(버그 많음), 에이전트에 성격/메모리 없음

**사장님 결정**: 패치로 수습 불가 → 기존 테마 전부 폐기 → 새 기능 추가 + 새 테마로 완전 리디자인

---

## 2. 추가할 기능 4가지

### 2-1. OpenClaw 가상 사무실 (PixiJS 8)
- **뭐냐**: 에이전트들이 픽셀아트 캐릭터로 가상 사무실에서 돌아다니며 일하는 모습을 실시간으로 보는 화면
- **기존 엔진(agent-loop.ts) 변경 없음**: 실행 로그를 읽어서 시각화만 하는 것
- **라우트**: CEO앱에 `/office` 추가
- **기술**: PixiJS 8 + @pixi/react, Tiled JSON 타일맵, 스프라이트 애니메이션
- **참고 레포**: Claw Empire (PixiJS 8), Agent Town (RPG UX), Pixel Agents (로그 관찰 패턴)
- **에이전트 상태 시각화**: idle(배회) → working(타이핑) → speaking(말풍선) → tool_calling(도구사용) → error(빨간불)
- **WebSocket 필요**: 기존 Bun WebSocket 15채널에 `/ws/office` 채널 추가

### 2-2. n8n 워크플로우 연동
- **뭐냐**: 기존 워크플로우 페이지(버그 많음, suggestions 500 에러)를 n8n으로 대체
- **왜 n8n**: 드래그앤드롭으로 자동화 만들 수 있음, Telegram/Discord/Slack 연동도 n8n이 처리, 크론잡/트리거/웹훅 전부 n8n이 해줌
- **통합 방식**: n8n을 Docker로 VPS에 띄우고, iframe 임베드 또는 API 연동
- **기존 워크플로우 코드**: 제거하거나 n8n 트리거로 연결
- **Admin**: n8n 관리 페이지 (워크플로우 목록, 실행 이력)
- **CEO**: 워크플로우 실행 결과 확인

### 2-3. 에이전트 성격 시스템 (Big Five)
- **뭐냐**: 각 에이전트에 성격 특성을 부여 (외향성, 성실성, 개방성, 친화성, 신경성 — 각 0~1)
- **구현**: agents 테이블에 `personality_traits` JSONB 컬럼 추가 → 시스템 프롬프트에 JSON 주입 → LLM이 성격에 맞게 응답
- **프론트**: 에이전트 생성/편집 시 성격 슬라이더 5개
- **참고**: AgentOffice의 Big Five 구현 (코드 분기 없이 프롬프트 주입 방식)
- **난이도**: 낮음 (DB 컬럼 + 프롬프트 변조)

### 2-4. 에이전트 메모리 아키텍처
- **뭐냐**: 에이전트가 과거 경험을 기억하고, 반성하고, 계획을 세우는 시스템
- **3단계**: 관찰(Observation) → 반성(Reflection) → 계획(Planning)
  - 관찰: 모든 실행 로그를 PostgreSQL에 저장
  - 반성: 크론으로 주기적으로 관찰을 요약 → 고수준 인사이트 생성
  - 계획: 태스크 시작 시 반성 결과를 바탕으로 실행 계획 수립
- **시맨틱 검색**: pgvector + 임베딩으로 관련 기억 검색
- **참고**: a16z AI Town (메모리), CrewAI (4단계 메모리)
- **난이도**: 높음 (핵심 챌린지)

---

## 3. UXUI 리디자인 방침

### 기존 테마 전부 폐기
- Sovereign Sage (dark/cyan) — 폐기
- Natural Organic (light/olive) — 폐기
- `_corthex_full_redesign/` 문서 — 참고만, 새로 만듦

### 새 테마
- `/kdh-uxui-redesign-full-auto-pipeline` Phase 0부터 풀 실행
- 5개 아키타입 테마 중 선택
- Dark mode / Light mode 결정은 파이프라인 Phase 0에서

### 메뉴 구조 (기획에서 확정 필요)

**Admin 사이드바 (현재 → 정리 필요):**
- 대시보드 ✅
- 회사 관리 ✅
- 직원 관리 ✅
- 사용자 관리 ✅
- 부서 관리 ✅
- AI 에이전트 ✅ (성격 슬라이더 추가)
- 도구 관리 ✅
- 비용 관리 ✅ (dead button 제거됨)
- CLI / API 키 ✅
- 보고 라인 ✅
- 소울 템플릿 ✅ (dead 탭/페이지네이션 제거됨)
- 시스템 모니터링 ✅
- NEXUS 조직도 ✅ (조직도 텍스트 트리 제거됨)
- SketchVibe ✅ (CEO→Admin 이동 완료)
- 조직 템플릿 — 유지? 제거? (사장님 확인 필요)
- 템플릿 마켓 — 유지 (Phase 7+ 기능, 빈 상태 UX 개선됨)
- 에이전트 마켓 — 유지 (Phase 7+ 기능, 빈 상태 UX 개선됨)
- 공개 API 키 ✅
- 워크플로우 → **n8n 관리 페이지로 교체**
- 회사 설정 ✅ (모델 목록 수정됨: Sonnet 4.6 + Opus 4.6)
- **[신규] n8n 워크플로우** — n8n 임베드 또는 링크

**CEO 사이드바 (정리 필요):**
- 기존 27+ 페이지 유지
- SketchVibe 제거됨 (Admin으로 이동)
- **[신규] /office** — 가상 사무실 (OpenClaw)
- 워크플로우 → n8n 연동으로 교체

---

## 4. 기술 스택 변경사항

| 영역 | 현재 | 추가 |
|------|------|------|
| 시각화 | 없음 | PixiJS 8 + @pixi/react |
| 워크플로우 | 자체 구현 | n8n (Docker, API 연동) |
| 실시간 | Bun WebSocket 15채널 | +/ws/office 채널 |
| DB | 117 테이블 | +personality_traits 컬럼, +memories 테이블, +observations 테이블 |
| 벡터 검색 | 없음 | pgvector 확장 |
| 테마 | olive/cream 혼재 | 완전 새 테마 (파이프라인에서 결정) |

---

## 5. 절대 규칙

1. **기존 엔진(agent-loop.ts) 건드리지 않음** — 위에 얹는 것만
2. **기존 62개 API 라우트 유지** — 새 라우트만 추가
3. **기존 117개 DB 테이블 유지** — 컬럼 추가/새 테이블만
4. **n8n은 외부 서비스** — CORTHEX 코드에 워크플로우 로직 직접 구현하지 않음
5. **OpenClaw 시각화는 별도 패키지** — 실패해도 기존 기능에 영향 없음
6. **한 번에 다 안 함** — Epic/Story로 쪼개서 순차 실행

---

## 6. 파이프라인 실행 지침

### VPS tmux에서 실행:
```bash
cd ~/corthex-v2
git pull
claude
# 안에서:
/kdh-full-auto-pipeline planning
```

### 파이프라인이 할 일:
1. **PRD 업데이트** — 위 4가지 기능을 기존 PRD에 추가
2. **아키텍처 업데이트** — PixiJS, n8n, pgvector, WebSocket 설계
3. **UX 디자인** — 새 페이지 와이어프레임 (가상 사무실, n8n 관리, 성격 편집)
4. **Epic/Story 생성** — 구현 단위로 쪼개기
5. **구현 준비 검증** — 빠진 거 없는지 체크

### 참고 문서:
- 이 문서: `_bmad-output/planning-artifacts/v3-openclaw-planning-brief.md`
- OpenClaw 보고서: 사장님이 PDF로 제공 (7개 레포 분석)
- 기존 PRD: `_bmad-output/prd.md`
- 기존 아키텍처: `_bmad-output/planning-artifacts/architecture.md`
- 기존 v1 스펙: `_bmad-output/planning-artifacts/v1-feature-spec.md`

---

## 7. 이번 세션에서 이미 한 것 (2026-03-20)

| # | 작업 | 커밋 |
|---|------|------|
| 1 | Settings LLM 모델 → Sonnet 4.6 + Opus 4.6만 | e294213 |
| 2 | Workflows 더블 사이드바 제거 | e294213 |
| 3 | 사이드바: 조직도 제거, SketchVibe 추가 | e294213 |
| 4 | SketchVibe CEO→Admin 이동 | e294213 |
| 5 | 템플릿/에이전트 마켓 빈 상태 UX 개선 | e294213 |
| 6 | CLAUDE.md: PRD/아키텍처 참조 규칙 추가 | e294213 |
| 7 | Dashboard dead button(Actions) 제거 | 5ca692c |
| 8 | 비용관리 필터/CSV 추출 dead button 제거 | 5ca692c |
| 9 | 소울 템플릿 dead 탭/필터/페이지네이션 제거 | 5ca692c |
| 10 | Agent 생성 모델 목록 GPT/Gemini 제거 | 5ca692c |
| 11 | E2E 스킬 Phase 0/8 cleanup 강화 | 8603cf7 |
| 12 | Playwright MCP npx→node 직접 실행 수정 | .mcp.json |
| 13 | E2E Cycle #23~35 실행 (12연속 clean) | cycle-report.md |
