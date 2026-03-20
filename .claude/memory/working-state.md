# Working State — 2026-03-20

## 현재 작업: CORTHEX v3 OpenClaw 기획 파이프라인

### 파이프라인 v9.0 재설계 완료 (이번 세션)

v8.0의 근본 문제를 발견하고 전면 재설계:
- BMAD 워크플로우 62% 누락 → 100% 자동 디스커버리로 수정
- 가짜 페르소나(Amelia, Dana) → BMAD 8명 실명 스폰 (winston, quinn, john, sally, bob, dev, analyst, tech-writer)
- PRD Spec Fix 단일패스 → BMAD Brief부터 9 Stage 풀 사이클
- Story Dev Skill 호출 → 6 Phase 파티 모드
- User Gate 16개 추가 (사장님 비즈니스 결정 체크포인트)
- PRD Validate + Readiness 병렬화

### 파이프라인 v9.0 Planning 구조 (72 스텝)

| Stage | 워크플로우 | 스텝 | Writer | 팀 규모 | GATE |
|-------|-----------|------|--------|---------|------|
| 0 | Product Brief | 6 | analyst | 5 | 4 |
| 1 | Technical Research | 6 | dev | 4 | 0 |
| 2 | PRD Create | 14 | john | 5 | 8 |
| 3 | PRD Validate | 14 | analyst | 4 | 0 (병렬) |
| 4 | Architecture | 8 | winston | 5 | 1 |
| 5 | UX Design | 14 | sally | 5 | 2 |
| 6 | Epics & Stories | 4 | bob | 5 | 1 |
| 7 | Readiness Check | 6 | tech-writer | 5 | 0 (병렬) |
| 8 | Sprint Planning | auto | - | - | 0 |

### 다음 할 것
- `/kdh-full-auto-pipeline planning` 실행 (v9.0으로)
- Brief부터 시작, 4개 root 파일을 input으로

### 사장님 결정사항 (2026-03-20)
- 기존 테마 전부 폐기 → 새 테마로 UXUI 완전 리디자인
- OpenClaw 가상 사무실 + n8n + 성격 시스템 + 메모리 아키텍처 추가
- UXUI: Subframe 메인 + Stitch 보조 (둘 다 MCP 설치됨)
- 조직 템플릿: 유지 (온보딩 연결)
- 전원 Opus 모델, 스텝 등급별 sonnet 믹스
- 품질 우선, 병렬 코딩 지원
- Brief/PRD는 사장님 align 포인트 (User Gate)

### 기획 문서 (root input)
1. `_bmad-output/planning-artifacts/v3-openclaw-planning-brief.md` — 초안 (참고용)
2. `_bmad-output/planning-artifacts/v3-corthex-v2-audit.md` — v2 정확한 수치
3. `_bmad-output/planning-artifacts/critic-rubric.md` — 6차원 채점 루브릭
4. `_bmad-output/planning-artifacts/v3-vps-prompt.md` — 실행 맥락

### 이번 세션 커밋 이력
- a20de20: feat(pipeline): kdh-full-auto-pipeline v8.0 → v9.0 BMAD full-cycle rewrite
- 0ac7326: docs(v3): accurate v2 audit — 485 APIs, 71 pages, 86 tables

### Stitch/UXUI 교훈 (v3에 반영 필수)
- App shell(layout+sidebar) 먼저 확정 → 페이지는 content area만
- 사이드바 중복 방지 (v2에서 Stitch가 페이지마다 사이드바 생성)
- 테마 변경 시 전체 grep (v2 428곳 색상 혼재 사건)
- Dead button 금지

### E2E 상태
- 35 사이클 완료, WATCH 모드
- Recurring known: workflow suggestions 500
