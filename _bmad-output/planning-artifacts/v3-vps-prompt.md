# VPS tmux에서 실행할 프롬프트

> VPS에서 tmux 접속 → `cd ~/corthex-v2 && git pull && claude` → 아래 프롬프트를 붙여넣기

---

## 프롬프트 (복붙용)

```
CORTHEX v3 "OpenClaw" 대규모 리팩토링 기획을 시작한다.

## 맥락
사장님이 v2의 문제점(색상 혼재 428곳, dead button, 메뉴 구조 불일치, 기능 부족)을 해결하기 위해 대규모 리팩토링을 결정했다. 단순 패치가 아니라 새 기능 추가 + 완전 UXUI 리디자인.

## 반드시 먼저 읽어야 할 문서 (순서대로)
1. `_bmad-output/planning-artifacts/v3-openclaw-planning-brief.md` — 전체 기획 브리프 (가장 중요)
2. `_bmad-output/planning-artifacts/critic-rubric.md` — 채점 루브릭 (Critics가 이걸로 채점)
3. `_bmad-output/planning-artifacts/v3-corthex-v2-audit.md` — v2 현황 정확한 수치 (있으면)
4. `_bmad-output/prd.md` — 기존 PRD
5. `_bmad-output/planning-artifacts/architecture.md` — 기존 아키텍처
6. `_bmad-output/planning-artifacts/v1-feature-spec.md` — v1 기능 스펙

## 추가할 기능 4가지
1. **OpenClaw 가상 사무실** — PixiJS 8로 에이전트가 픽셀 캐릭터로 사무실에서 일하는 모습 실시간 시각화. CEO앱 /office 라우트.
2. **n8n 워크플로우 연동** — 기존 자체 워크플로우 기능을 n8n(Docker)으로 대체. 드래그앤드롭 자동화.
3. **에이전트 성격 시스템** — Big Five 성격 특성(JSONB). 시스템 프롬프트에 주입하여 에이전트별 다른 행동.
4. **에이전트 메모리 아키텍처** — 관찰→반성→계획 3단계. pgvector 시맨틱 검색. 에이전트가 점점 똑똑해짐.

## UXUI 리디자인
- 기존 테마 전부 폐기 (Sovereign Sage, Natural Organic 둘 다)
- 새 테마로 완전 리디자인 (파이프라인 Phase 0에서 결정)
- Admin + CEO 메뉴 구조 확정 (기획에서 잡아야 함)

## 절대 규칙
- 기존 엔진(agent-loop.ts) 건드리지 않음 — 위에 얹는 것
- 기존 62개 API 라우트 유지 — 새 라우트만 추가
- 기존 117개 DB 테이블 유지 — 컬럼 추가/새 테이블만
- Critics는 반드시 `critic-rubric.md` 루브릭으로 6차원 채점

## 실행
/kdh-full-auto-pipeline planning
```

---

## 실행 전 체크리스트

```bash
# VPS에서:
cd ~/corthex-v2
git pull                    # 최신 코드 + planning brief + rubric 받기
cat _bmad-output/planning-artifacts/v3-openclaw-planning-brief.md | head -5  # 확인
cat _bmad-output/planning-artifacts/critic-rubric.md | head -5               # 확인
claude                      # Claude Code 실행
# 위 프롬프트 붙여넣기
```
