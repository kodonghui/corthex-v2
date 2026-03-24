# Critic-C Review — Story 22.6: Neon Pro Upgrade & VPS Resource Verification

**Reviewer:** John (Product Manager)
**Date:** 2026-03-24
**Spec:** `_bmad-output/implementation-artifacts/stories/22-6-neon-pro-vps-verification.md`
**Round:** R2 — 4 fixes verified

---

## NFR/AR Coverage Verification

| Reference | 요구사항 | 스펙 커버리지 | 상태 |
|-----------|---------|-------------|------|
| AR6 | Neon Pro upgrade blocker | AC-1 + Task 2.4 (indirect tier detection + documented reasoning) | ✅ |
| AR7 | VPS resource budget | AC-2 + Task 1 (os module + docker + headroom calc) | ✅ |
| NFR-COST1 | 인프라 월 $10 이하 | AC-5 + Task 4.2 (**Free: PASS, Pro: CONDITIONAL PASS 명시**) | ✅ |
| NFR-COST2 | Embedding 월 $5 이하 | AC-5 + Task 4.2 | ✅ |
| Go/No-Go #10 | Voyage AI migration | AC-4 + Task 3 | ✅ |

## Fix Verification (R1 → R2)

| 이슈 | 심각도 | 수정 | 상태 |
|------|--------|------|------|
| `knowledge_chunks` → `knowledge_docs` | HIGH | Task 2.2: `knowledge_docs.embedding` + `semantic_cache.query_embedding` 모두 명시 | ✅ |
| `voyage-3-large` → `voyage-3` | HIGH | Task 4.1: `voyage-3: pricing per Voyage AI docs (verify via WebSearch)` | ✅ |
| NFR-COST1 vs Neon Pro 충돌 | MEDIUM | Task 4.2: Free=PASS, Pro=CONDITIONAL PASS + threshold revision 언급 | ✅ |
| Neon tier detection 불명확 | MEDIUM | Task 2.4: indirect detection (max_connections + pg_settings) + reasoning 문서화 | ✅ |

## 차원별 점수 (R2)

| 차원 | R1 | R2 | 근거 |
|------|-----|-----|------|
| D1 구체성 | 7 | 8 | Tier detection에 indirect 접근법 명시. Voyage 모델명 수정. Task 2.2에 두 테이블 모두 명시 (knowledge_docs + semantic_cache). |
| D2 완전성 | 8 | 9 | NFR-COST1 충돌 명시적 해결. semantic_cache 차원 검증 추가. Go/No-Go #10 범위 명확. |
| D3 정확성 | 6 | 9 | 테이블명, 모델명 모두 수정. Voyage 가격은 WebSearch 검증 지시로 정확성 보장. |
| D4 실행가능성 | 8 | 9 | Tier detection 구현 가능한 대안 제시. Cost 문서에 양 시나리오(Free/Pro) 포함. |
| D5 일관성 | 8 | 8 | 변동 없음. Go/No-Go 넘버링 LOW 잔여. |
| D6 리스크 | 8 | 9 | NFR-COST1 위반 시나리오 문서화. Pro tier 대응 명시. |

## 가중 평균: 8.70/10 ✅ PASS

> D1(8×0.20) + D2(9×0.20) + D3(9×0.15) + D4(9×0.15) + D5(8×0.10) + D6(9×0.20) = 1.60 + 1.80 + 1.35 + 1.35 + 0.80 + 1.80 = **8.70**

---

## 이슈 목록

### RESOLVED (R1 → R2)

1. ~~**[HIGH] `knowledge_chunks` → `knowledge_docs`**~~ → ✅ 수정 + semantic_cache 추가
2. ~~**[HIGH] `voyage-3-large` → `voyage-3`**~~ → ✅ 수정 + WebSearch 검증 지시
3. ~~**[MEDIUM] NFR-COST1 vs Neon Pro 충돌**~~ → ✅ Free=PASS, Pro=CONDITIONAL PASS 명시
4. ~~**[MEDIUM] Neon tier detection 불명확**~~ → ✅ indirect detection 접근법

### REMAINING (LOW — non-blocking)

5. **[LOW] AC-2 RAM headroom 서술**: "~12GB headroom (peak usage ~12GB)" — headroom과 peak 혼동. 구현에 영향 없음.
6. **[LOW] Task 5.1 체크리스트 항목 혼재**: Go/No-Go #10 + AR references + story references 혼합. 검증 방법(코드 테스트 vs 수동 확인 vs 문서 참조)이 항목별로 다르지만 명시 안 됨. 구현 시 dev가 자연스럽게 구분 가능.

---

## Quinn Edge Cases 대응

1. **DB 연결 실패 시 fallback**: Dev Notes에 "skip gracefully if not available (CI environment)" 있음. `describe.skipIf(!process.env.DATABASE_URL)` 패턴으로 충분. 별도 fallback 불필요 — 검증 스토리에서 DB 접근 불가면 해당 AC는 "UNABLE TO VERIFY" 문서화가 맞음.

2. **Neon Free tier = PASS or FAIL?**: Task 4.2에서 해결됨. Free tier에서 NFR-COST1 PASS. Go/No-Go 관점: Free tier는 Sprint 1 시작에 충분 (AR6는 "upgrade is a blocker" 이지만, Free tier로도 pgvector + connection pool ≥10 충족 가능하면 functional blocker 아님). COST blocker만 해당.

3. **Task 5.1 — 완료된 story "checking" 의미**: 검증 스토리에서 이미 완료된 story(22.4, 22.5)를 "check"한다는 것은 해당 기능이 여전히 배포되어 동작하는지 확인. CI pipeline = latest workflow run 확인, Security headers = response header 확인. Regression check 성격.

---

## 제품 관점 평가

### Final Gate Story: 적절한 스코프
- Epic 22의 마지막 스토리로서 모든 전제 조건 종합 검증.
- Feature dev 아닌 verification + documentation 스토리 — 스코프 올바름.

### NFR-COST1 충돌 해결: 우수
- R1에서 지적한 $10/month vs $19/month Pro tier 충돌이 명시적으로 문서화됨.
- CONDITIONAL PASS 접근은 제품 판단에 정확한 정보 제공.
- Sprint 1 착수 판단 시 비용 제약 사항을 명확히 인지 가능.

### Go/No-Go #10: Sprint 1 게이트 완성
- Stories 22.1-22.3 증거 기반 검증.
- HNSW 1024 + Voyage SDK 0.2.1 확인.
- 아키텍처 매트릭스의 14개 gate 중 Pre-Sprint 해당 항목 커버.

---

## Cross-talk 요약

- Winston 8.80 R2 PASS — 전원 동의.
- Quinn 7.35 R1 — edge cases 제기. 위 대응 참조. R2 대기.

---

## 판정

**✅ PASS (8.70/10)** — R1 HIGH 2건 + MEDIUM 2건 전부 해결. 검증 스토리로서 NFR-COST1 충돌 명시적 문서화가 핵심 가치. 수정 후 구현 진행 가능. Epic 22 마지막 스토리.
