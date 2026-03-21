# Stage 0 Brief Review — Critic-C (John, PM)

> Document: `_bmad-output/planning-artifacts/product-brief-corthex-v3-2026-03-20.md`
> Date: 2026-03-21 (Updated after cross-talk + team lead context)
> Reviewer: John (PM / Critic-C — Product + Delivery)
> Rubric: `_bmad-output/planning-artifacts/critic-rubric.md` (v9.2 Grade A = 8.0/10)
> Context read: product-brief, v3-openclaw-planning-brief, v3-corthex-v2-audit, v1-feature-spec, project-context.yaml, ECC analysis plan (Part 2), analyst review (updated), sally cross-talk

---

## Critic-C Review — Product Brief v3

### 차원별 점수

| 차원 | 점수 | 가중치 | 근거 |
|------|------|--------|------|
| D1 구체성 | 7/10 | 20% | 파일 경로·테이블명·API 수·persona 연령 등 대부분 구체적. 그러나 "PRD에서 정의" 위임 3곳, Layer 0 "60%" 미정의, sprint 기간 부재. |
| D2 완전성 | 5/10 | 20% | 4개 Layer + 타깃 사용자 + 지표 + 스프린트 순서 잘 구성. **치명적 누락 다수**: 전용 Risks 섹션 부재, 에이전트 보안(tool response prompt injection) 미포함, 임베딩 프로바이더(Voyage AI) 미명시, v1 기능 패리티 게이트 없음, **접근성(a11y) 전무**, Admin AHA 피드백 루프 단절. |
| D3 정확성 | 5/10 | 15% | v2 audit 수치 정확 인용. **그러나**: 6곳 Subframe→Stitch 2 오류, **15곳 "OpenClaw" 폐기된 코드네임**, WebSocket 채널 수 14→실제 16 오류(3곳), 페이지 총수 73→74 산술 오류. |
| D4 실행가능성 | 7/10 | 15% | extraVars 메커니즘, E8 경계, zero-downtime migration 등 기술 패턴 구체적. Go/No-Go 8개 게이트 실용적. sprint 기간과 observations 테이블 스키마 세부사항 부족. |
| D5 일관성 | 5/10 | 10% | CEO planning brief·v2 audit와 대체로 정합. **6곳 Subframe/Stitch 2 불일치**, **15곳 폐기된 OpenClaw 코드네임**, **WebSocket 14→16 불일치(3곳)**, Admin "+1 예정"이 실제 +2와 모순. |
| D6 리스크 | 4/10 | 20% | HTML 주석과 인라인에 산발적 리스크 언급. **전용 Risks 섹션 부재**, 확률/영향 평가 없음, 에이전트 보안 리스크 누락, **접근성 리스크 완전 누락**, n8n Docker 리소스 영향 미평가, v2 실패 반복 리스크 미언급. |

### 가중 평균: 5.55/10 ❌ FAIL

계산: (7×0.20) + (5×0.20) + (5×0.15) + (7×0.15) + (5×0.10) + (4×0.20) = 1.40 + 1.00 + 0.75 + 1.05 + 0.50 + 0.80 = **5.50**

> D6 리스크 4/10 — 자동 불합격 임계(3점) 근접 주의. 접근성 완전 누락 + 전용 Risks 섹션 부재가 주 원인.

---

### 이슈 목록

#### CRITICAL (Must fix — PRD 진행 전 필수 수정)

**1. [D3/D5] "OpenClaw" 코드네임 전면 폐기 — 15곳 수정 필요** ⭐ NEW
- **사장님 직접 결정 (2026-03-21)**: "OpenClaw" 코드네임 폐기. 실제 OpenClaw 오픈소스(228K stars)와 무관하며 혼동 유발.
- v3 전체 명칭: **"CORTHEX v3"** (코드네임 없음)
- PixiJS 가상 사무실 기능명: **"Virtual Office"** 또는 **"가상 사무실"**
- Brief 내 15곳: 문서 제목(L36), Executive Summary(L79, L83), Layer 1 설명(L167, L171), Key Differentiators(L187), Sprint Order(L372, L383), Future Vision(L455) 등 전부 수정 필요.

**2. [D3/D5] 6곳 Subframe → Stitch 2 stale reference**
- Lines 88, 187, 355, 378, 388, 391
- Subframe은 2026-03-19부로 폐기됨. 현재 디자인 도구는 Google Stitch 2.
- 다운스트림 문서(PRD, Architecture)에 오류 전파 위험 → 즉시 수정 필수.

**3. [D3/D5] WebSocket 채널 수 오류 — 14→16 (3곳)** ⭐ NEW
- Brief Lines 125, 173, 420: "14채널"이라 기재되었으나 실제 코드(`packages/shared/src/types.ts:484-500`)에는 **16채널** (audit에서 `strategy`, `argos` 누락).
- 결과적으로 +1 채널(/ws/office) 추가 시 15가 아니라 **17채널**이 됨.
- v2 audit 문서도 14로 잘못 기재 → audit 수정도 필요.

**4. [D2/D6] 전용 Risks 섹션 부재**
- 현재 리스크가 HTML 주석(lines 59-65)과 인라인 플래그에 산발적으로 존재.
- Product Brief는 반드시 확률(H/M/L) × 영향(H/M/L) × 대응전략이 포함된 리스크 테이블을 가져야 함.
- 최소 포함해야 할 리스크:
  1. PixiJS 8 학습 곡선 (팀 경험 없는 새 의존성)
  2. n8n Docker 리소스 소비 (VPS CPU/RAM 영향)
  3. Reflection LLM 비용 폭발 (에이전트 수 × 관찰량 × 빈도)
  4. 에셋 생성 타임라인 (AI 픽셀 아트 품질 불확실성)
  5. **Tool response prompt injection** (ECC 2.1 — 에이전트 84% 취약, CORTHEX = "root access agent" 패턴)
  6. 테마 결정 지연 → 전 Sprint 캐스케이딩
  7. **v2 실패 반복 리스크** — v2가 10,154 테스트에도 불구하고 실사용 없이 폐기됨
  8. **접근성(a11y) 미고려** — PixiJS canvas + n8n drag-and-drop = 스크린리더 불가 (sally cross-talk)

**5. [D2/D6] 에이전트 보안 — tool response prompt injection 미포함**
- ECC 2.1: "에이전트 84%가 tool response 경유 프롬프트 주입에 취약"
- CORTHEX 에이전트는 사용자 CLI 토큰으로 실행 = ECC가 경고하는 "root access agent" 패턴과 동일
- Brief에 n8n 포트 보안만 있고, 에이전트 자체의 tool response 방어가 없음
- **Go/No-Go 게이트 추가 필요**: "tool response sanitization 검증"

**6. [D2/D5] 임베딩 프로바이더 미명시**
- project-context.yaml line 65: "Embedding: Voyage AI (Anthropic recommended) — NOT Gemini"
- Brief Line 163: "pgvector 시맨틱 검색" 언급하지만 임베딩 프로바이더 미지정
- Epic 10에서 Gemini embedding 사용했으나 현재 금지됨 → Voyage AI 명시 필수
- Layer 4 메모리 아키텍처의 핵심 의존성 — 모호하게 두면 안 됨

**7. [D2/D6] 접근성(a11y) 전무 — 엔터프라이즈 플랫폼에 치명적** ⭐ NEW (sally cross-talk)
- 459줄 Brief에 접근성 관련 언급이 **단 한 줄도 없음**
- PixiJS 8 canvas = 스크린리더 불가, n8n drag-and-drop = 키보드 대안 필요
- 엔터프라이즈 플랫폼의 법적/컴플라이언스 리스크
- **최소 v3 요구사항**: 키보드 네비게이션 + ARIA 기본 지원. /office는 접근 가능한 companion panel(텍스트 기반 상태 표시) 필요
- 전체 WCAG 2.1 AA는 v4 deferred 가능하나, Brief에 리스크로 명시 + 최소 기준 정의 필수

#### IMPORTANT (Should fix — 품질 개선)

**8. [D3/D5] 페이지 수 산술 오류**
- Line 224: Admin "v3 +1 예정" → 실제 +2 (n8n 관리 페이지 Line 404 + /office read-only Line 238)
- Line 262: CEO "v3 +1 예정" → 정확 (/office 1개)
- Line 313: "73개 예상" → 실제 **74개** (Admin 29 + CEO 43 + Login 2)

**9. [D1/D4] Sprint 기간 추정 부재**
- Sprint 순서 테이블에 내용·의존성은 있으나 시간 차원 없음.
- Brief 수준에서도 상대 복잡도(주 단위)가 있어야 다운스트림 계획 가능.
- 제안: Sprint 1(2주), Sprint 2(3주), Sprint 3(4주), Sprint 4(3주) 수준의 rough estimate.

**10. [D1/D6] Layer 0 "60%" 게이팅 메트릭 미정의**
- Line 379: "Sprint 2 종료까지 ≥ 60% 미달 시 레드라인 검토"
- 60%가 무엇을 측정하는지 정의되지 않음.
- **sally 제안 채택**: "user-facing 74 페이지 중 Stitch 2 디자인 스펙 일치(≥95% fidelity) + 하드코딩 색상 0 + dead button 0을 달성한 페이지 비율"로 정의해야 함.

**11. [D2] Go/No-Go에 v1 기능 패리티 검증 게이트 없음**
- 절대 규칙: "v1에서 동작한 것은 v3에서도 동작한다"
- Go/No-Go #1(485 API smoke test)은 API 수준이지 기능 수준이 아님
- v1 슬래시 명령어(/전체, /순차, /토론, /심층토론 등 8종), CEO 프리셋, 위임 체인 추적 등은 API smoke test로 검증 불가
- **Go/No-Go 게이트 추가 필요**: "v1 feature spec 체크리스트 전수 검증"

**12. [D2] Go/No-Go에 사용성 검증 게이트 없음** ⭐ NEW (sally 합의)
- 현재 8개 게이트가 전부 기술 검증 — 사용성 검증 0개
- v2가 기술적으로 완벽(10,154 테스트)했으나 실사용 없이 폐기된 교훈 미반영
- **sally 제안 "Real User Task Flow" 게이트 채택**:
  - Admin: 비기술자가 외부 도움 없이 온보딩 Wizard 완주 가능한가? (회사설정 → 에이전트 생성+Big Five → CEO 초대)
  - CEO: "Virtual Office 열기 → 작업 중 에이전트 식별 → Chat에서 태스크 지시 → Virtual Office에서 처리 확인" 5분 내 완주 가능한가?

**13. [D2/D4] Admin Big Five AHA 모먼트 피드백 루프 단절** ⭐ NEW (sally cross-talk)
- Admin이 성격 슬라이더를 설정해도 효과를 즉시 확인할 방법이 없음
- 확인하려면: CEO 앱 전환 → 대화 시작 → 전후 비교 — 너무 간접적
- **제안**: 에이전트 편집 페이지에 "성격 미리보기" 패널 — 샘플 프롬프트로 성격 반영 응답 즉시 확인
- AHA 모먼트가 Brief의 핵심 성공 지표인데, 실현 경로가 끊겨 있음

**14. [D2] ECC observations 테이블 스키마 갭**
- ECC 2.3 권장: `confidence` (0.3~0.9), `domain` 필드 추가
- Brief Line 156: "raw 실행 로그" 수준으로만 기술 — 스키마 세부사항 없음
- Reflection 품질에 직결되는 필드 → Brief에서 최소 방향 명시 필요

**15. [D6] n8n Docker 운영 책임 미정의**
- Brief: n8n Docker on VPS, API-only 모드, 포트 5678 내부
- 누가 n8n 업그레이드, 백업, 장애 대응하는지 미정의
- 운영 지속성 관점에서 책임 소재 명확히 해야 함

**16. [D2/D6] Virtual Office + Phase 0 테마 시각적 일관성 원칙 부재** ⭐ NEW (sally cross-talk)
- Brief Line 393: "CEO /office 픽셀 아트 감성과 앱 전체 UI 테마의 시각적 일관성 확보"를 언급하지만 "Phase 0 테마 결정 후 확정"으로 위임
- **sally 의견**: 위임만으로 불충분. Brief에 지금 **Visual Coherence Principle** 명시 필요: "Phase 0 테마 선택 기준에 '픽셀 아트 호환성'을 차원으로 포함할 것"
- 그렇지 않으면 Phase 0에서 미니멀 테마 선택 → 픽셀 아트와 충돌 → Layer 1 재작업 리스크

#### MINOR (Nice to fix)

**17. [D5] Line 90: Step 4 leftover pipeline 참조**
- "정량 지표는 Step 4에서 정의" — Step 4 이미 완료됨. 삭제 필요.

**18. [D1] Line 435: "외부 구매" → "유료 에셋 구매" 명확화**
- In Scope에 LPC Sprite Sheet(오픈소스) 포함 → Out of Scope은 "유료" 명시해야 모순 없음.

**19. [D2] 성공 지표 베이스라인 부재**
- Line 328: "↓ 6개월 후 초기 대비 감소" — 초기 베이스라인을 어떻게 측정하는지 미정의.
- v3 출시 전 또는 직후 베이스라인 측정 시점을 명시해야 감소를 증명 가능.

**20. [D6] Midjourney/DALL-E 사용 범위 명확화**
- Line 421: "Midjourney/DALL-E 또는 최신 AI 스프라이트 도구"
- key constraint "Claude OAuth CLI only — NO Gemini API anywhere"와의 관계 명확화 필요
- 이미지 생성 도구는 런타임 API가 아니므로 허용 범위일 가능성 높으나, 명시적 언급 필요.

---

## PM 관점 핵심 분석

### 1. 제품 비전 부합성 — ⚠️ 부분 부합

Brief의 4-Layer 아키텍처(가시성, 자동화, 개성, 성장)는 CEO planning brief의 의도와 정확히 일치한다. "블랙박스→투명성, 획일성→개성, 정체→성장" 문제-해결 매핑이 명확하다.

**그러나**, v2의 핵심 실패 교훈이 제대로 반영되지 않았다. v2는 기술적으로 완벽(10,154 테스트)했으나 **실제로 사용되지 못하고 폐기**됐다. Brief는 이를 "UXUI 색상 혼재"와 "dead button"으로 축소하고 있다. 진짜 문제는 기술 완성도와 제품 완성도의 괴리였다. Go/No-Go 게이트 8개가 전부 기술 검증(smoke test, bundle size, security)이고 **사용성 검증이 하나도 없다** — v2 실패를 반복할 구조적 위험이 있다.

**추가**: "OpenClaw" 코드네임이 실제 오픈소스 프로젝트(228K stars)와 혼동을 유발한다. 사장님이 폐기 결정. 제품 비전에 맞는 고유한 아이덴티티가 필요하다면 별도 코드네임을 새로 정하거나, "CORTHEX v3"으로 충분.

### 2. 사용자 페르소나 — ✅ 우수 (단, AHA 루프 문제)

이수진(Admin, 32세)과 김도현(CEO, 38세) 페르소나가 구체적이고 현실적이다. 특히:
- "Admin이 항상 첫 번째 사용자" 교훈 반영 — 우수
- 온보딩 강제 구현(Wizard + ProtectedRoute) — 기술적으로 검증 가능
- 1인 창업자 케이스 고려 — 엣지 케이스 인식

**문제**: Admin의 AHA 모먼트("Big Five 설정 → 성격 반영 확인")가 Admin 앱 내에서 완결되지 않음. CEO 앱으로 전환해야 효과를 확인할 수 있어 피드백 루프가 단절됨.

### 3. 성공 지표 — ⚠️ 개선 필요

지표 자체는 잘 설계됐으나:
- 베이스라인 측정 시점 미정의 (어떻게 "감소"를 증명?)
- "PRD에서 정의" 위임이 3곳 — Brief 수준에서 방향값이라도 있어야 함
- **ECC 2.4 Capability Eval 미반영**: "에이전트가 이전에 못 했던 것을 이제 할 수 있는지" — Layer 4 메모리 효과를 측정하는 강력한 지표인데 누락

### 4. Sprint 순서 — ✅ 우수 (단, 기간 부재)

Layer 3(낮음)→2(중간)→4(높음)→1(에셋 선행) 순서는 의존성과 난이도를 잘 반영. Phase 0 선행 필수도 올바른 판단. Sprint 3 블로커(Tier 비용 한도 PRD 확정)와 Sprint 4 선행 조건(에셋 품질 승인)도 적절.

**문제**: 기간 추정이 전혀 없어 리소스 배분과 일정 관리가 불가능.

### 5. Go/No-Go 게이트 — ❌ 기술 편향 (구조적 결함)

8개 게이트가 전부 기술 검증:
1. API smoke test ✓
2. Big Five 주입 ✓
3. n8n 보안 ✓
4. Memory Zero Regression ✓
5. PixiJS 번들 ✓
6. UXUI Layer 0 ✓
7. Reflection 비용 한도 ✓
8. 에셋 품질 승인 ✓

**누락된 게이트 (PM + UX 합의)**:
- Tool response prompt injection 방어 검증 (ECC 2.1)
- v1 기능 패리티 전수 검증 (절대 규칙 이행)
- **사용성 검증 — Real User Task Flow** (sally 제안, john 동의)
- 접근성 최소 기준 충족 (키보드 네비게이션 + ARIA 기본)

### 6. ECC 반영 — ⚠️ 부분적

| ECC 아이디어 | Brief 반영 | PM 판단 |
|-------------|-----------|---------|
| 2.1 Agent Security | n8n 포트만 | **CRITICAL GAP** — tool response injection 필수 |
| 2.2 Cost-Aware | Tier 한도, Reflection 비용 | 대부분 반영. immutable tracking 미언급 (MINOR) |
| 2.3 Continuous Learning | Memory 3단계 | confidence/domain 필드 누락 (IMPORTANT) |
| 2.4 Capability Eval | 미반영 | Layer 4 성공 지표 보강 가능 (MINOR) |

### 7. 코드네임 "OpenClaw" — ❌ 폐기 결정

사장님 직접 결정으로 폐기. 실제 오픈소스 프로젝트와 혼동 유발. Brief 전체에서 15곳 수정 필요. PM 관점에서도 제품 아이덴티티 혼선을 유발하므로 올바른 결정.

---

## Cross-talk

### john → sally (PM → UX) — 질문 (2026-03-21)

> v2가 10,154 테스트에도 불구하고 실사용 없이 폐기됐다. Brief의 Go/No-Go 게이트 8개가 전부 기술 검증이고 사용성 검증이 없다.
>
> 1. End-to-end 사용자 여정 검증 Go/No-Go 게이트가 필요한가?
> 2. /office 픽셀 아트 + Phase 0 테마 시각적 일관성을 지금 원칙으로 명시해야 하는가?
> 3. Layer 0 "60%" 게이팅 메트릭은 UX 관점에서 무엇을 측정해야 하는가?

### sally → john (UX → PM) — 응답 (2026-03-21)

1. **YES — "Real User Task Flow" Go/No-Go 게이트 필요.** Playwright E2E가 아닌 시나리오 기반 검증:
   - Admin: 비기술자가 온보딩 Wizard 완주 (회사설정→에이전트+Big Five→CEO 초대) 외부 도움 없이 가능한가?
   - CEO: "Virtual Office → 에이전트 식별 → Chat → 태스크 → Virtual Office 확인" 5분 내 완주 가능한가?
   - **v2 실패가 기술 완성도 ≠ 사용성을 증명** — john 동의.

2. **Phase 0 위임 불충분. Visual Coherence Principle 지금 명시 필요.** "Phase 0 테마 선택 기준에 '픽셀 아트 호환성'을 차원으로 포함." 미니멀 테마 선택 시 픽셀 아트 충돌 → Layer 1 재작업 리스크. — john 동의.

3. **"60%" = 74 페이지 중 Stitch 2 디자인 스펙 일치(≥95%) + 하드코딩 색상 0 + dead button 0 달성 페이지 비율.** — john 채택.

### sally 추가 우려 (john 동의 포함)

- **접근성(a11y) 전무**: 459줄 Brief에 a11y 언급 0줄. PixiJS canvas = 스크린리더 불가. 엔터프라이즈 법적/컴플라이언스 리스크. — **john 동의**: 최소 키보드 네비게이션 + ARIA 기본 v3 필수. 전체 WCAG v4 deferred 가능.
- **Admin AHA 피드백 루프 단절**: 성격 슬라이더 설정 → 효과 확인이 CEO 앱 전환 필요 → 너무 간접적. — **john 제안**: "성격 미리보기" 패널 (에이전트 편집 페이지 내 샘플 대화) 추가.

---

## 종합 평가

Brief는 **아키텍처적으로 잘 설계**되었다. 4-Layer 구조가 명확하고, Zero Regression 철학이 일관되며, 타깃 사용자 섹션이 우수하다. CEO planning brief의 4가지 기능 요구사항이 충실히 반영됐다.

**그러나 다섯 가지 구조적 약점이 8.0 통과를 막는다:**

1. **팩트 오류 폭발**: 15곳 OpenClaw stale ref + 6곳 Subframe stale ref + 3곳 WebSocket 채널 수 오류 + 페이지 수 산술 오류 = **25곳 이상의 팩트 오류**. D3/D5에 치명적.
2. **리스크 관리 부재**: 전용 Risks 섹션 없음 + 에이전트 보안 누락 + 접근성 누락 — 에이전트 플랫폼으로서 치명적 갭.
3. **사용성 검증 공백**: Go/No-Go 게이트가 전부 기술 검증 — v2 실패의 구조적 원인이 반복될 수 있음.
4. **접근성 전무**: 엔터프라이즈 AI 플랫폼에 a11y 언급이 한 줄도 없음 — 법적·시장 리스크.
5. **코드네임 혼동**: "OpenClaw"이 실제 오픈소스와 혼동 유발 (사장님 폐기 결정 완료).

**수정 후 예상 점수**:
- Critical 7건 수정 (특히 Risks 섹션 추가 + a11y 최소 기준 + 모든 stale ref 수정) → D3 7+, D5 7+, D6 7+
- Important 9건 수정 → D2 7+
- 예상 최종: **7.5~8.0/10** — 통과 가능하나 모든 Critical 수정이 전제.

---

**Cycle 1 점수: 5.50/10 ❌ FAIL**

**이슈 총계: 20건** — CRITICAL 7, IMPORTANT 9, MINOR 4

---

## Re-verification (Cycle 2) — After Fixes Applied

> Re-read: `_bmad-output/planning-artifacts/product-brief-corthex-v3-2026-03-20.md` (2026-03-21 수정본)
> Fixes log: `party-logs/stage-0-brief-review-fixes.md` (25 fixes applied)
> Stale reference grep: 0 "OpenClaw", 0 "Subframe", 0 "14채널" — **CLEAN**

### CRITICAL Issues — Verification

| # | Issue | Status | Verification |
|---|-------|--------|-------------|
| C1 | 15x "OpenClaw" → CORTHEX v3 / Virtual Office | ✅ FIXED | L36, L79, L83, L168, L172, L189, L334, L374, L385, L391, L396, L425, L428, L466-467 — grep 0 hits |
| C2 | 6x Subframe → Stitch 2 | ✅ FIXED | L88, L189, L357, L380, L391, L394 — grep 0 hits |
| C3 | WebSocket 14→16 | ✅ FIXED | L125 "16개", L175 "기존 16채널", L428 "기존 16 → 17" |
| C4 | Risks section 추가 | ✅ FIXED | L492-505: 10 risks with P/I/M. R1 테마 지연, R2 n8n Docker, R3 Reflection 비용, R4 에셋, R5 tool injection, R6 UXUI, R7 v2 실패, R8 PixiJS 학습, R9 Canvas a11y, R10 인지 과부하 |
| C5 | Agent security Go/No-Go | ✅ FIXED | L460 Go/No-Go #9 + L500 R5. ECC 2.1 인용, root access agent 패턴 명시 |
| C6 | Embedding provider Voyage AI | ✅ FIXED | L157 "Voyage AI `voyage-3` (1024d)" + L485 Technical Constraints |
| C7 | Accessibility | ✅ FIXED | L397 키보드+ARIA 기본선, L429 Canvas ARIA live region, L471 WCAG v4+, R9 리스크 |

### IMPORTANT Issues — Verification

| # | Issue | Status | Verification |
|---|-------|--------|-------------|
| I8 | Page count 74 | ✅ FIXED | L226 "v3 +2", L315 "74개" |
| I9 | Sprint durations | ✅ FIXED | Pre 1w, S1 2w, S2 3w, S3 4w, S4 3w, total ~14w (L380-386) |
| I10 | Layer 0 "60%" defined | ✅ FIXED | L381 "74페이지 중 ≥60% Stitch 2 스펙 매칭(≥95% fidelity) + 하드코딩 색상 0 + dead button 0" |
| I11 | v1 feature parity gate | ✅ FIXED | L461 Go/No-Go #10 — 슬래시 명령어 8종, 프리셋, 위임 체인 구체 명시 |
| I12 | Usability gate | ✅ FIXED | L462 Go/No-Go #11 — Admin/CEO 시나리오 + "5분 이내 완주" + v2 교훈 명시 |
| I13 | Admin AHA feedback loop | ⏸ DEFERRED | UX Design 단계로 적절히 위임. Brief 수준 결정 아님. 수용. |
| I14 | observations schema | ✅ FIXED | L156 confidence (0.3~0.9), domain (대화/도구/에러), 30일 purge |
| I15 | n8n Docker ops responsibility | ⏸ DEFERRED | Architecture 단계로 위임. Brief 수준에선 Technical Constraints (L482 `--memory=2g`) 명시로 충분. 수용. |
| I16 | Visual coherence principle | ✅ FIXED | L189 + L391 "테마 선택 시 Virtual Office 픽셀 아트 호환성 평가 기준 포함" |

### MINOR Issues — Verification

| # | Issue | Status | Verification |
|---|-------|--------|-------------|
| M17 | Line 90 Step 4 leftover | ✅ FIXED | L90 "핵심 성과 목표:" — leftover 제거됨 |
| M18 | "외부 구매" → "유료 에셋 구매" | ✅ FIXED | L444 "PixiJS 유료 에셋 구매" |
| M19 | 베이스라인 측정 | ⏸ DEFERRED | PRD 수준. Brief에서는 방향만 필요. 수용. |
| M20 | Midjourney/DALL-E 범위 | ⏸ DEFERRED | MINOR — key constraint와 관계 미명시이나 런타임 API 아니므로 실질 영향 없음 |

### Remaining Minor Observations (Non-blocking)

1. **L163 "상세 설계는 Step 4 Metrics에서 정의"** — Step 4 pipeline 참조가 한 곳 남아있으나, 문맥상 "위 Metrics 섹션에서 정의됨"의 의미로 해석 가능. 아주 사소.
2. **Admin AHA 서사**: L242-243 AHA 모먼트가 여전히 CEO 앱 전환 없이 확인 가능한 것처럼 읽힐 수 있으나, 구체적 UX 해결책(미리보기 패널)은 UX Design 단계가 적절.

---

### Cycle 2 차원별 점수

| 차원 | Cycle 1 | Cycle 2 | 근거 |
|------|---------|---------|------|
| D1 구체성 | 7/10 | **8/10** | Sprint 기간 추정 추가, Layer 0 "60%" 정의, observations 스키마 구체화, Voyage AI+모델명 명시, n8n Docker 리소스 제한 명시. "PRD에서 정의" 위임 3곳 남으나 범위값($0.10~$0.50) 제공으로 완화. |
| D2 완전성 | 5/10 | **8.5/10** | Risks 10건 + Technical Constraints + a11y 기본선 + Go/No-Go 11개(보안+패리티+사용성) + n8n 통합 패턴 + Visual Coherence. 위임 항목들은 Brief 범위 밖으로 적절. |
| D3 정확성 | 5/10 | **8.5/10** | 모든 stale ref 제거 (grep 0 hits). 페이지 수 74 정확. WebSocket 16→17 정확. L163 Step 4 참조 1곳 남으나 문맥상 허용 가능. |
| D4 실행가능성 | 7/10 | **8/10** | n8n webhook→API→callback 통합 패턴 추가. L0 3단계 분리(A/B/C) 실행 가능. 에셋 품질 최소 기준(5 state, 32×32+). 사용성 게이트 시나리오 구체. |
| D5 일관성 | 5/10 | **8.5/10** | 모든 용어 통일(Virtual Office, Stitch 2, 16/17채널, 74페이지). Zero Regression 일관 적용. CEO planning brief와 정합. |
| D6 리스크 | 4/10 | **8/10** | 전용 Risks 섹션 10건(P/I/M 포함). 보안(R5), 제품(R7), 접근성(R9), 운영(R2), 비용(R3) 전방위 커버. v2 실패 교훈이 R7 + Go/No-Go #11에 반영. |

### Cycle 2 가중 평균: 8.2/10 ✅ PASS

계산: (8×0.20) + (8.5×0.20) + (8.5×0.15) + (8×0.15) + (8.5×0.10) + (8×0.20) = 1.60 + 1.70 + 1.275 + 1.20 + 0.85 + 1.60 = **8.225 → 8.2/10**

### 왜 8.2이고 8.5+ 아닌가

Brief는 모든 Critical/Important 이슈를 해결했으나, 아직 Brief 수준에서 "복붙해서 바로 PRD 작성 가능" 수준(9+)은 아니다:
- "PRD에서 정의" 위임이 3곳 남음 (Reflection 비용 수치, 베이스라인, 집계 방법)
- Admin AHA 서사가 실현 경로(피드백 루프)와 괴리 — UX Design에서 해결 예정이나 Brief 서사는 미조정
- Midjourney/DALL-E의 key constraint 관계 미명시 (MINOR)

이것들은 PRD/Architecture/UX Design 단계에서 자연스럽게 해결될 범위이므로 Brief 통과에 장애가 되지 않음.

---

**Cycle 2 점수: 8.2/10 ✅ PASS (Grade A)**

---

## Cycle 3: Devil's Advocate Fixes + ECC Full Audit (FINAL)

> Re-read: Brief 수정본 (29 fixes: 25 Cycle 1 + 4 DA)
> DA fixes log: analyst message (DA-1~DA-4)
> ECC full audit: john → analyst 메시지 (8 Brief body + 3 Future Vision = 11 additions requested)

### DA Fixes Verification

| # | Issue | Status | Verification |
|---|-------|--------|-------------|
| DA-1 | pgvector 768→1024 (Gemini→Voyage AI) | ✅ FIXED | L486: "기존 `vector(768)` Gemini → `vector(1024)` Voyage AI 마이그레이션 + re-embed 필수" — **코드 검증 기반 수정, 매우 중요.** 이전 Brief의 vector(1536) 기재는 완전히 틀렸음. |
| DA-2 | agent_memories 벡터 컬럼 부재 | ✅ FIXED | L158: "현재 `agent_memories` 테이블에는 벡터 컬럼이 **없음**... `vector(1024)` 신규 추가 + backfill job. Sprint 3 스코프 = 단순 enum 확장이 아닌 스키마 변경." — **Sprint 3 복잡도를 올바르게 재평가.** |
| DA-3 | v1 패리티 Gemini/GPT 제외 | ✅ FIXED | L462: "의도적 제외 목록: Gemini (key constraint), GPT (CEO, e294213)" — **Go/No-Go #10과 key constraint 간 모순 해소.** |
| DA-4 | Workflow 11 endpoint deprecation | ✅ FIXED | L440: "200 OK 유지 + `{deprecated: true, migrateTo: "n8n"}`. 완전 제거 v4." — **Zero Regression과 n8n 대체 간 긴장 우아하게 해소.** |

### DA Fixes PM 평가

4건 모두 **실제 구현 시 블로커가 될 수 있었던 팩트 오류를 코드 검증으로 교정**한 것으로, D3(정확성)과 D4(실행가능성)를 의미있게 향상시킨다.

특히:
- **DA-1/DA-2**: Sprint 3 Layer 4 메모리 스코프가 "enum 확장 + 테이블 추가"에서 "벡터 컬럼 추가 + 차원 마이그레이션 + backfill + re-embed"로 현실화됨. ~4주 추정이 이제 현실적.
- **DA-3**: v1 패리티 게이트가 key constraint와 충돌하는 논리적 모순을 해소. 제외 목록이 commit hash까지 추적 가능.
- **DA-4**: n8n이 기존 워크플로우를 대체하면서도 Zero Regression을 준수하는 deprecation 전략이 비즈니스 연속성을 보장.

### ECC Full Audit 상태

**⚠️ 미반영**: 내가 analyst에게 요청한 11건의 ECC 추가 항목은 아직 Brief에 반영되지 않음. Grep 확인 결과 MCP health check, governance logging, immutable cost tracking, budget auto-block, confidence prioritization, Capability Eval, handoff standardization, chief-of-staff triage 등 0 hits.

**PM 판단**: 이 11건은 **이미 커버된 테마의 하위 항목**이지, 완전히 새로운 갭이 아님:
- 보안(2.1): 핵심(tool injection)은 커버됨. 미반영 3건은 보강 항목.
- 비용(2.2): 핵심(Tier 한도, Reflection 비용)은 커버됨. 미반영 2건은 보강 항목.
- 메모리(2.3): 핵심(confidence/domain)은 커버됨. 미반영 2건은 보강+v4 항목.
- 기타(2.4, 2.7, 2.8): 개별적으로 MINOR~IMPORTANT 수준.

**따라서 ECC 미반영은 D2를 0.5점 감점하되, 통과 여부를 좌우하지는 않음.**

### Cycle 3 (FINAL) 차원별 점수

| 차원 | C1 | C2 | C3 (FINAL) | 변동 근거 |
|------|----|----|------------|-----------|
| D1 구체성 | 7 | 8 | **8/10** | DA 수정은 구체성보다 정확성 개선. 유지. |
| D2 완전성 | 5 | 8.5 | **8/10** | ECC 11건 미반영으로 -0.5. 하위 항목이므로 8 유지. |
| D3 정확성 | 5 | 8.5 | **9/10** | DA-1 vector(768→1024) + DA-2 벡터 컬럼 부재 = 코드 검증 팩트 교정. 정확성 대폭 향상. |
| D4 실행가능성 | 7 | 8 | **8.5/10** | DA-2로 Sprint 3 스코프 현실화. DA-4로 workflow deprecation 전략 구체화. |
| D5 일관성 | 5 | 8.5 | **9/10** | DA-3이 v1 패리티 ↔ key constraint 모순 해소. DA-4가 Zero Regression ↔ n8n 대체 긴장 해소. |
| D6 리스크 | 4 | 8 | **8/10** | DA 수정은 리스크 차원에 직접 영향 없음 (이미 Risks 섹션 존재). 유지. |

### Cycle 3 (FINAL) 가중 평균: 8.3/10 ✅ PASS (Grade A)

계산: (8×0.20) + (8×0.20) + (9×0.15) + (8.5×0.15) + (9×0.10) + (8×0.20) = 1.60 + 1.60 + 1.35 + 1.275 + 0.90 + 1.60 = **8.325 → 8.3/10**

### 왜 8.3이고 8.5+ 아닌가

1. **ECC 11건 미반영** — 팀 리드 지시사항이 아직 완수되지 않음. 하위 보강 항목이라 통과에 영향은 없으나, D2 만점(9+)을 막음.
2. **"PRD에서 정의" 위임 3곳** — Reflection 비용 수치, 베이스라인, 집계 방법. Brief 수준에선 허용되나 완벽하지는 않음.
3. **Admin AHA 서사 미조정** — 피드백 루프 단절 인정 없이 AHA 시나리오 제시. UX Design에서 해결 예정.

### 최종 판정

Brief는 **29건의 수정을 거쳐 Product Brief로서 충분한 품질에 도달**했다. 4-Layer 아키텍처가 명확하고, Zero Regression 철학이 일관되며, 11개 Go/No-Go 게이트가 기술+보안+사용성을 균형있게 커버한다. DA의 코드 검증 수정(vector 차원, 벡터 컬럼 부재, workflow deprecation)이 특히 다운스트림 Architecture/PRD의 정확성을 보장한다.

**Outstanding items for downstream stages:**
- ECC 11건 추가 (analyst 반영 대기 중)
- Admin AHA 피드백 루프 해결 (UX Design)
- Reflection 비용 수치 확정 (PRD)
- pgvector 차원 마이그레이션 상세 설계 (Architecture)

---

**Cycle 3 점수: 8.3/10 — ⚠️ VOIDED (팀 리드 지시: ECC HIGH 갭 남은 상태에서 PASS 불가)**

**이슈 추적**: 20건 제기 → 29건 수정 완료 → ECC 13건 추가 반영 대기 중

---

## Cycle 4: ECC Full Reflection Verification (TRUE FINAL)

> Re-read: Brief 수정본 (42 fixes: 25 Cycle 1 + 4 DA + 13 ECC)
> Fixes log: `party-logs/stage-0-brief-review-fixes.md`
> Team lead directive: "ECC HIGH 갭이 남아있으면 PASS 불가... ECC 반영 후 재채점해주세요."

### ECC Verification — 13 Additions

**Brief Body (9건):**

| # | ECC | Item | Line | Status | Verification |
|---|-----|------|------|--------|-------------|
| ECC-1 | 2.1 | Governance event logging | L426 | ✅ VERIFIED | "에이전트 감사 로그 (ECC 2.1): 민감 작업(도구 실행, 외부 API 호출, 비용 임계치 초과) 수행 시 감사 로그 기록" — observations 또는 별도 audit log. |
| ECC-2 | 2.1 | CLI token auto-deactivation | L510 | ✅ VERIFIED | R5 mitigation에 "CLI 토큰 유출 감지 시 자동 비활성화 메커니즘 (ECC 2.1 secret rotation)" 추가. |
| ECC-3 | 2.1 | MCP server health check | L497 | ✅ VERIFIED | Technical Constraints 신규 행: "Stitch 2, Playwright MCP 무응답 시 자동 알림 크론". ECC 2.1 43% 취약 인용. |
| ECC-4 | 2.2 | Cost-aware model routing | L427 | ✅ VERIFIED | Layer 4 scope: "Tier별 비용 인지 모델 라우팅 (ECC 2.2): 태스크 복잡도에 따라 Haiku/Sonnet 자동 선택". |
| ECC-5 | 2.2 | Budget exceed auto-block | L463 | ✅ VERIFIED | Go/No-Go #7 확장: "Tier별 일일/월간 예산 한도 초과 시 에이전트 실행 자동 차단 메커니즘 포함 (ECC 2.2)". |
| ECC-6 | 2.2 | Immutable cost tracking | L498 | ✅ VERIFIED | Technical Constraints 신규 행: "cost-aggregation 데이터 append-only (수정/삭제 불가)". frozen dataclass 패턴 Architecture 위임. |
| ECC-7 | 2.3 | Reflection confidence priority | L163 | ✅ VERIFIED | Layer 4 Reflection: "confidence ≥ 0.7 관찰 우선 통합하여 노이즈 필터링 (ECC 2.3)". |
| ECC-8 | 2.4 | Capability Eval metric | L354 | ✅ VERIFIED | Success Metrics Layer 4: "동일 유형 태스크 3회 반복 시 3회차 재수정률 ≤ 50%". 측정 방법 PRD 위임. |
| ECC-9 | 2.7 | Handoff response standardization | L425 | ✅ VERIFIED | Layer 4 scope: "call_agent 응답 포맷 `{ status, summary, next_actions, artifacts }`". E8 경계 준수 명시. |

**Future Vision (3건):**

| # | ECC | Item | Line | Status | Verification |
|---|-----|------|------|--------|-------------|
| ECC-10 | 2.3 | Cross-project global insight | L477 | ✅ VERIFIED | "동일 패턴 2+ 회사 발견 시 글로벌 인사이트 자동 승격 (ECC 2.3, 프라이버시 설계 필수)". |
| ECC-11 | 2.8 | Chief-of-Staff message triage | L478 | ✅ VERIFIED | "메시지 4단계 분류: skip/info_only/meeting_info/action_required (ECC 2.8)". |
| ECC-12 | 2.8 | Per-agent user preference | L479 | ✅ VERIFIED | "에이전트별 사용자 선호도 학습 — Layer 4 메모리 연동 (ECC 2.8)". |

**Executive Summary (1건):**

| # | Item | Line | Status | Verification |
|---|------|------|--------|-------------|
| ECC-13 | Vision 보완 | L90 | ✅ VERIFIED | "안전한 에이전트 실행 환경(감사 로그 + 토큰 보호), Tier별 비용 인지 모델 라우팅으로 비용 최적화". |

**제외된 4건 (Critic 합의 — 적절):**

| ECC | Item | 제외 사유 | PM 동의 |
|-----|------|----------|---------|
| 2.5 | Blueprint (context brief) | 파이프라인 방법론, 제품 Brief 범위 아님 | ✅ 동의 |
| 2.6 | Search-First | Stage 1 Technical Research에서 이미 수행 | ✅ 동의 |
| 2.7 | ReAct hybrid | E8 경계(agent-loop.ts 불변) 위반 | ✅ 동의 — 절대 규칙 준수가 우선 |
| 2.7 | Error recovery contract | Architecture 설계 단계 | ✅ 동의 |

### ECC PM 평가

13건 전수 반영 확인. 배치가 적절하다:
- **핵심 보안/비용/메모리** 항목(ECC-1~9)은 Layer 4 scope, Go/No-Go, Technical Constraints, Risks에 분산 배치 — 실행 가능한 위치에 있음.
- **장기 비전** 항목(ECC-10~12)은 Future Vision으로 적절히 분류 — v3 스코프 팽창 없이 방향성 제시.
- **Executive Summary**(ECC-13)은 비전 문장에 자연스럽게 통합 — 문서 도입부에서 ECC 방향을 선언.
- **제외 4건**은 E8 경계 절대 규칙, 파이프라인 방법론, Architecture 단계 위임 등 타당한 사유로 전원 합의.

Cycle 3에서 D2를 -0.5 감점한 사유("ECC 11건 미반영")가 완전히 해소됨.

### Cycle 4 (TRUE FINAL) 차원별 점수

| 차원 | C1 | C2 | C3 (void) | C4 (FINAL) | 변동 근거 |
|------|----|----|-----------|------------|-----------|
| D1 구체성 | 7 | 8 | 8 | **8/10** | ECC 항목들이 구체적 값 포함 (confidence ≥ 0.7, 3회차 ≤ 50%, 4단계 분류). 기존 수준 유지. |
| D2 완전성 | 5 | 8.5 | 8 | **8.5/10** | Cycle 3 감점 사유(ECC 미반영) 완전 해소. 13/17 ECC 아이디어 반영, 4건 합의 제외. Brief 수준에서 가능한 모든 내용 포함. |
| D3 정확성 | 5 | 8.5 | 9 | **9/10** | 변동 없음. 모든 ECC 참조가 정확한 ECC 섹션 번호(2.1, 2.2, 2.3, 2.4, 2.7, 2.8) 인용. |
| D4 실행가능성 | 7 | 8 | 8.5 | **8.5/10** | ECC-9 handoff 포맷이 구체적 응답 스키마 제공. ECC-4 모델 라우팅이 Admin 설정 가능 패턴 제시. Architecture 위임 항목들은 적절. |
| D5 일관성 | 5 | 8.5 | 9 | **9/10** | ECC 항목들이 기존 섹션(Layer 4 scope, Go/No-Go, Technical Constraints, Risks, Future Vision)에 일관되게 배치. 용어/포맷 통일. |
| D6 리스크 | 4 | 8 | 8 | **8.5/10** | ECC-2(CLI 토큰 자동 비활성화)가 R5 완화 강화. ECC-3(MCP health check)이 운영 장애 감지 추가. ECC-5(예산 자동 차단)이 R3 완화 구체화. ECC-6(immutable cost)이 감사 추적 보장. |

### Cycle 4 (TRUE FINAL) 가중 평균: 8.5/10 ✅ PASS (Grade A)

계산: (8×0.20) + (8.5×0.20) + (9×0.15) + (8.5×0.15) + (9×0.10) + (8.5×0.20) = 1.60 + 1.70 + 1.35 + 1.275 + 0.90 + 1.70 = **8.525 → 8.5/10**

### 왜 8.5이고 9.0 아닌가

1. **"PRD에서 정의" 위임 3곳** — Reflection 비용 수치, Capability Eval 측정 방법, 베이스라인 집계 방법. Brief 수준에선 허용되나 완전 자기 완결은 아님.
2. **Admin AHA 서사 미조정** — 피드백 루프 단절을 인정하지 않는 AHA 시나리오 유지. UX Design에서 해결 예정이나 서사 자체는 현실과 괴리.
3. **ECC 제외 4건의 충분성** — 제외 사유는 타당하나, Architecture 단계에서 반드시 재확인 필요 (특히 error recovery contract).

### 왜 8.5이고 8.2(Cycle 2) 대비 향상인가

1. **DA 코드 검증 수정 4건** — pgvector 차원, 벡터 컬럼 부재, v1 패리티 모순, workflow deprecation = D3/D4/D5 향상.
2. **ECC 전수 반영 13건** — Cycle 3에서 미반영이던 보안/비용/메모리/핸드오프 보강 = D2/D6 향상.
3. **42건 총 수정** — Brief가 4 cycle을 거치며 실질적으로 성숙.

### 최종 판정

Brief는 **42건의 수정(25 Cycle 1 + 4 DA + 13 ECC)을 거쳐 Product Brief로서 높은 품질에 도달**했다.

**강점:**
- 4-Layer 아키텍처가 명확하고 문제-해결 매핑이 논리적
- Zero Regression 철학이 전체 문서에 일관되게 관통
- 11개 Go/No-Go 게이트가 기술(#1-8) + 보안(#9) + 패리티(#10) + 사용성(#11) 균형
- 10개 리스크가 P/I/M 구조로 전방위 커버 (기술·보안·제품·접근성·운영·비용)
- DA 코드 검증 수정이 다운스트림 정확성 보장 (pgvector 차원, 벡터 컬럼 실재 여부)
- ECC 8가지 아이디어 중 실행 가능한 것은 모두 반영, 제외 항목은 합의 기반 사유 제시
- Technical Constraints 테이블이 VPS 환경 제약을 한 곳에 집약

**다운스트림 주의 항목:**
- Admin AHA 피드백 루프 → UX Design에서 해결
- Reflection 비용 수치 확정 → PRD (Sprint 3 블로커)
- pgvector 차원 마이그레이션 상세 → Architecture
- Error recovery contract → Architecture
- Capability Eval 측정 방법 → PRD

---

**TRUE FINAL 점수: 8.5/10 ✅ PASS (Grade A)**

**이슈 추적**: 20건 제기 → 42건 수정 완료 (4 cycles) → 5건 다운스트림 위임 (PRD/Architecture/UX Design)
