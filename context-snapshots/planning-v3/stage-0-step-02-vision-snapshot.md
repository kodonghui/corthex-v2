# Context Snapshot — Stage 0, Step 02 Vision
Date: 2026-03-20
Pipeline: /kdh-full-auto-pipeline planning (v9.0)
Project: CORTHEX v3 "OpenClaw"

---

## Step 02 Outcome

**Status**: ✅ PASS (avg 8.29/10 after fixes)

| Critic | Initial | Verified | Note |
|--------|---------|----------|------|
| John | 7.5 ✅ | 8.1 ✅ | Layer 4 carryover noted |
| Bob | 7.5 ✅ | 8.35 ✅ | Layer 4 carryover noted |
| Sally | 7.75 ✅ | 8.65 ✅ | Architecture stage carryover |
| Winston | 7.35 ✅ | 8.05 ✅ | Step 5 Scope carryover |

## Vision Core Message (CEO 확정)

"CORTHEX v3 OpenClaw는 AI 에이전트들이 개성을 갖고, 성장하며, 실제로 일하는 모습을 볼 수 있는 엔터프라이즈 AI 조직 운영 플랫폼이다."

## 4개 레이어 (구현 순서)

1. **Layer 3: Big Five 성격 시스템** (1번째 — 독립·낮음)
   - `agents.personality_traits JSONB` 컬럼
   - `engine/soul-renderer.ts` `extraVars` 확장 → `{{personality_traits}}` 변수 (E8 준수)

2. **Layer 2: n8n 워크플로우 연동** (2번째 — 독립·중간)
   - n8n Docker, 포트 5678 내부망, Hono 리버스 프록시 `/admin/n8n/*`
   - 신규 자동화 전용. 기존 ARGOS(`services/argos-service.ts`) 유지.

3. **Layer 4: 3단계 메모리** (3번째 — 복잡·높음)
   - **Option B 확장**: 기존 `agent_memories` + `memory-extractor.ts` 확장
   - `memoryTypeEnum`에 'reflection', 'observation' 추가
   - 신규 `observations` 테이블만 추가 (raw 로그 계층)
   - Reflection 크론: 기본 일 1회. ⚠️ Tier별 비용 한도 필요 (Step 4에서 정의)

4. **Layer 1: OpenClaw 가상 사무실** (4번째 — 에셋 선행 필요)
   - PixiJS 8 + @pixi/react, Tiled JSON, LPC Sprite Sheet 오픈소스
   - `/ws/office` 채널 1개 추가 (기존 14 → 15)
   - 픽셀 캐릭터 = 투명성 인터페이스 (agent-loop.ts 로그 실시간 시각화)
   - VPS: 번들 < 200KB gzipped

## 핵심 결정사항

- **Big Five 주입 경로**: `soul-renderer.ts` `extraVars` 확장 (신규 파일 불필요)
- **n8n 보안**: Hono 리버스 프록시, 포트 5678 외부 노출 없음
- **Layer 4 전략**: Option B (기존 확장), Zero Regression 준수
- **UXUI 도구**: Subframe(메인) + Phase 0 아키타입 테마 결정
- **에셋**: LPC Sprite Sheet(오픈소스) + AI 보조

## 이월 사항 (Architecture/Step 5 단계)

- `agent_memories` 기존 테이블과 v3 Layer 4 상세 통합 설계
- `memory-extractor.ts` Reflection 크론 모드 확장 구체적 설계
- OpenClaw 픽셀 감성 ↔ 앱 전체 테마 접점 (Phase 0 테마 결정 후)
- Tier별 Reflection 비용 한도 수치 (Step 4 Metrics)

## Output File

`_bmad-output/planning-artifacts/product-brief-corthex-v3-2026-03-20.md`
Lines 75–185 (Executive Summary + Core Vision)
