# Stage 5 Step 7 Defining Experience — Fixes Applied

Date: 2026-03-23
R1 scores: dev 8.00, quinn 8.15, winston 8.50, john 8.80 → avg 8.36 Grade A

---

## Fixes Applied (12건 일괄)

### Dev Must-Fix (2건)
1. **SC-3 "드래그 지연 0ms" → "프레임 누락 없음 (60fps 유지)"**: 물리적으로 0ms 불가 (60fps=16.7ms/frame). 표현 수정.
2. **SC-2 FCP/TTI 병렬 실행 명시**: Shell 렌더링(FCP)과 WS 연결(TTI) 병렬 실행 전제 추가. 순차 시 1.5+2=3.5s > TTI 3s 초과.

### Dev Should-Fix (3건)
3. **EM-1 Secretary routing 0.5초 — Haiku tier 기준 주석**: "(Secretary = Haiku tier 기준 ~300ms. Sonnet 시 ~1s)" 추가.
4. **EM-2 Monaco → CodeMirror 6 대안**: "모나코 에디터" → "코드 에디터" + CodeMirror 6 (~100KB) 권장, Monaco (~5-10MB) 번들 과대 경고.
5. **EM-1 Error Path rate limit 추가**: Architecture 10 msg/s 초과 시 UX (Send 비활성 + cooldown 표시).

### Quinn HIGH (2건)
6. **EM-1~4 접근성(a11y) DC-N 참조**: 각 EM 하단에 `[접근성: Step 2 DC-N 참조]` 1줄씩 추가.
7. **Secretary 20% 실패 3단계 폴백**: EM-1 Error Path에 PRD 3단계 (Soul 규칙→태그→프리라우팅) + 피드백 루프 상세화.

### Winston Should-Fix (2건)
8. **SC-4 confidence ≥ 0.7 조건**: PRD FR-MEM3, Architecture D28 기준. 크론 트리거 조건에 추가.
9. **EM-5 n8n 워크플로우 관리 흐름 신설**: Initiation/Interaction(프리셋+커스터마이즈)/Feedback/Error Path 완비. FR-N8N+FR-MKT 13 FRs 커버.

### John HIGH (1건)
10. **EM-4 CEO WOW fallback**: Admin 테스트 태스크 미예약 시 → 시스템 자동 데모 태스크 트리거 (비서실장 자기소개).

### John MEDIUM + Quinn MEDIUM (2건)
11. **SC-3 Big Five 기대 관리**: LLM 성격 반영 미묘함 인정 + A/B 미리보기 버튼 + 중간값 안내.
12. **Novel 패턴 재교육 경로**: `?` 아이콘 미니 팝업, Settings "튜토리얼 다시 보기", Hub 도움말 위젯.

### 추가 (Quinn LOW 2건)
- SC-4 "4주 후 ≥10%p" — "v3 UX 신규 제안 — PRD 명시값 없음" 주석 추가.
- EM-2 Ctrl+Z undo — "EP-2 안전망 — v3 UX 신규 제안" 주석 추가.
- EM-1 모바일 분기 — /office 대신 리스트 뷰 참조 추가.
- 온보딩 ≤15분 vs PRD ~10분 차이 설명 주석 추가.

---

## Not Applied (deferred)
- Winston nice-to-have: SC-2 LISTEN/NOTIFY vs 폴링 latency → Sprint 4 구현 시 상세화
- Winston nice-to-have: SC-4 baseline 정의 → Sprint 3 초기 데이터 수집 후 확정
- Dev nice-to-have: Chat 세션 관리 EM → Step 8 범위 검토
- John LOW: Secondary User 명시 → Step 8 Visual Foundation에서 페르소나 확장
- John LOW: 테스트 태스크 API 메커니즘 → Sprint 구현 단계에서 확정
- Winston should-fix #1: SC-2 fps D-number → "Sprint 4 성능 테스트에서 최종 확정" 주석으로 대응
