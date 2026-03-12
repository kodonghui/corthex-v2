# CRITIC-B Review: UX Design Epic 15 — 3-Layer Caching
**Round:** 1 | **Reviewer:** CRITIC-B (Winston/Amelia/Quinn/Bob) | **Date:** 2026-03-12

---

## 주요 확인 통과

- 토글 배치 위치 (Soul 아래, 도구 위): FR-CACHE-3.3 기반 ✅
- 기본값 OFF: FR-CACHE-3.2 `DEFAULT FALSE` 일치 ✅
- ON→OFF 확인 모달, OFF→ON 즉시: FR-CACHE-3.3 "즉시 삭제 없음" 반영 ✅
- 툴팁 공유 범위 "이 회사의 모든 사용자": FR-CACHE-3.11 일치 ✅
- Cache Hit Badge + Cost Dashboard Deferred Phase 5+ 처리: FR-CACHE-1.5 일치 ✅
- 와이어프레임 구체성: px/색상/아이콘 수치 명시 ✅

---

## Issue 1 — OFF 확인 모달 "24시간 후 자동 만료" 오해 소지 [High]
**[Quinn — QA 관점]**

현재 모달 텍스트 (line 122):
```
• 기존 캐시는 24시간 후 자동 만료됩니다.
```

FR-CACHE-3.3: "기존 `semantic_cache` 레코드는 TTL 자연만료(24시간)까지 유지된다"
FR-CACHE-3.4 SQL 조건: `created_at > NOW() - ttl_hours * INTERVAL '1 hour'`

TTL 24시간은 **캐시 생성 시점 기준**이다. 토글 OFF 시점 기준이 아니다. 예: 20시간 전 생성된 캐시 항목은 4시간 후 만료, 1시간 전 항목은 23시간 후 만료 — "24시간 후"로 표현하면 Admin이 "지금 OFF하면 24시간 동안 캐시가 유지된다"고 오해한다.

특히 실시간 데이터 에이전트의 Admin이 "지금 OFF하면 24시간이나 오래된 캐시가 반환된다"고 생각해 전환을 망설이거나, 반대로 "24시간만 기다리면 완전히 클리어된다"고 잘못 계획할 수 있다.

**요구사항:** 모달 텍스트를 `"기존 캐시는 각 항목 생성 시점으로부터 최대 24시간 이내 자동 만료됩니다."` 또는 `"기존 캐시는 자연 만료됩니다 (TTL 24시간, 생성 시점 기준)."`로 수정.

---

## Issue 2 — ON 상태 와이어프레임 "모든 에이전트" vs "모든 사용자" 불일치 [Medium]
**[Amelia — Dev 관점]**

ON 상태 와이어프레임 (line 76):
```
TTL: 24시간 | 유사도 임계값: 95% | 적용 대상: 이 회사의 모든 에이전트
```

툴팁 (line 108): "공유 범위: 이 회사의 모든 사용자" ← 다름
UX 결정 테이블 (line 254): "이 회사의 모든 사용자" ← 다름

FR-CACHE-3.11: "동일 `companyId` 내 에이전트 간 공유 (`agent_id` 컬럼 없음)"
→ 에이전트 간 캐시 공유이면서 동시에 사용자 간 공유이기도 하다.

"모든 에이전트"는 "에이전트 A가 저장한 캐시를 에이전트 B도 사용"이라는 FR-CACHE-3.11 의도를 잘 전달하지만, 동일 문서 내 툴팁("모든 사용자")과 불일치해 Admin이 혼란.

**요구사항:** ON 상태 와이어프레임 line 76을 `"적용 대상: 이 회사의 모든 사용자 (에이전트 간 공유, FR-CACHE-3.11)"`로 통일. 또는 Section 4 UX 결정 테이블과 일관되게 "이 회사의 모든 사용자"로 단순화.

---

## Issue 3 — 권장 표시 도구명 하드코딩 [Medium]
**[Winston — Architect 관점]**

Section 1.4 권장 로직:
- `generate_image` 또는 `get_current_time` → "✗ 캐싱 비권장"
- `kr_stock`, `search_news` → "⚠ 실시간 도구 포함"
- 도구 없음 + 일반 분석 → "✓ 권장"

PRD FR-CACHE-2.5: `tool-cache-config.ts`에 도구별 TTL 등록 (`get_current_time TTL=0`, `generate_image TTL=0` → 캐싱 없음; `kr_stock TTL=1분`, `search_news TTL=15분` → 단기 캐싱).

이 UX 로직은 도구명을 하드코딩한다. 새 도구 추가 시 (예: `get_stock_news`, `live_translation`) UX 권장 로직을 별도 갱신해야 하는 유지보수 갭이 발생한다.

**더 나은 설계:** `tool-cache-config.ts`에 `semanticCacheCategory: 'safe' | 'realtime' | 'unique'` 플래그 추가 — UX가 이 플래그를 참조해 권장 표시를 동적 결정. 도구 등록만으로 권장 표시 자동 반영.

**요구사항:** UX 설계 문서에 "권장 표시 로직은 `tool-cache-config.ts` 도구 메타데이터 기반으로 구현"을 명시. 현재 3개 케이스의 판단 기준을 `TTL=0 → 비권장`, `TTL≤15분 → 경고`, `TTL없음(도구 미보유) → 권장`으로 TTL 기반으로 재정의하거나, 별도 `semanticCacheHint` 플래그 도입을 Story 15.3 scope에 명시.

---

## Issue 4 — TTL 24시간 고정(커스터마이징 불가) Admin 미명시 [Low]
**[Bob — SM 관점]**

FR-CACHE-3.9: "에이전트별 TTL 커스터마이징 UI는 구현하지 않는다."

툴팁에 "TTL: 24시간 자동 만료"가 표시되나 이 값이 고정값(변경 불가)임을 명시하지 않는다. Admin이 "24시간"을 클릭해 변경하려 할 수 있고, 기술팀에 문의할 수도 있다. MVP 범위 내에서 Admin이 설정 불가임을 인지하도록:

**요구사항:** 툴팁 또는 ON 상태 표시에 "TTL 24시간 (고정, MVP)" 또는 소형 안내 텍스트 `text-xs text-slate-500 "현재 TTL: 24시간 (조정 불가)"` 추가.

---

## Issue 5 — Semantic Cache 배지 — Prompt Cache TTFT 개선 체감 설명 부재 [Low]
**[Quinn — QA 관점]**

Section 2: Semantic Cache 히트만 배지 표시, Prompt Cache/Tool Cache 히트는 배지 없음.

Prompt Cache 히트 시 TTFT 85% 단축이라는 체감 가능한 개선이 발생하나 사용자에게 시각적 피드백이 없다. 배지 없는 이유 ("서버 내부 최적화")만 명시되고, "사용자가 응답이 빨라지는 것으로 자연 인지" 또는 "배지로 인한 혼란 방지" 등 UX 판단 근거가 없다.

**요구사항:** Section 2 Deferred 섹션에 "Prompt Cache / Tool Cache 히트 배지 미표시 근거: 두 캐싱은 LLM 응답 콘텐츠와 동일 — 배지로 인한 '이 응답은 오래된 것?' 불안감 유발 방지. Semantic Cache만 별도 배지: 실제 LLM 응답이 아닌 이전 응답 재사용임을 Admin/사용자에게 명시하는 투명성 목적." 를 추가.

---

## 종합 평가

| 이슈 | 심각도 | 유형 |
|------|--------|------|
| Issue 1: OFF 모달 "24시간 후" TTL 기준 오해 | **High** (Admin 오해 → 잘못된 운용) | 팩트 오류 |
| Issue 2: ON 와이어프레임 에이전트/사용자 불일치 | **Medium** (문서 내 불일치) | 표현 오류 |
| Issue 3: 권장 로직 도구명 하드코딩 | **Medium** (유지보수 갭) | 설계 구조 |
| Issue 4: TTL 고정값 Admin 미명시 | **Low** (UX 명확성) | 누락 |
| Issue 5: Prompt Cache 배지 미표시 근거 미설명 | **Low** (문서 완결성) | 누락 |

**전체 판정:** Section 1 핵심 UX 결정(배치, 기본값, 모달, 공유 범위)은 PRD와 일치하며 구체적. Issue 1(모달 TTL 기준)이 가장 중요 — Admin의 실제 운용 판단에 영향. Issue 3(하드코딩)은 Story 15.3 구현 범위에 명시가 필요한 설계 결정.
