# Critic-C Review — Step 09 Functional Requirements Synthesis

**Reviewer**: Sally (UX Designer / Critic-C)
**Date**: 2026-03-21
**File**: `_bmad-output/planning-artifacts/prd.md` L2137–2337
**Step**: step-09-functional-requirements.md

---

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 20% | 9/10 | 신규 FR 전부 Sprint 태그. FR-MKT1 AI 도구 엔진 목록(Flux 2, Kling 3.0 등) 구체적. FR-MEM9 성장 지표 3종 열거. FR-PERS7 "최소 3종" 수치화. FR-UX1 통합 대상 페이지 조합 명시. FR-MKT2 파이프라인 6단계 상세. |
| D2 완전성 | 20% | 7/10 | 16건 신규 FR로 대부분 커버. **BUT**: (1) Step 05 MKT-4(저작권 워터마크)가 FR에 없음 — Step 07 통합 목록 L1798에 "워터마크 옵션(MKT-4)" 명시인데 FR 누락. (2) PER-6(슬라이더 행동 예시 툴팁)가 Step 05에서 Sally MEDIUM으로 추가되었으나 FR에 미반영. (3) NRT-2(heartbeat 5s/15s/30s 적응형 간격)가 FR에 없음 — 구현 상세일 수 있으나 Step 05에서 도메인 요구사항으로 정의됨. (4) FR-MKT3 승인 채널이 Slack/Telegram만 — CEO앱 내 웹 승인 UI 미정의 시 Admin이 외부 메신저 필수 의존. |
| D3 정확성 | 15% | 8/10 | FR-OC2 연결 상한 20 + graceful eviction = Step 07 통일 ✅. Sprint 할당 Step 08과 정합 ✅. **BUT**: John 요약 "총 104개 FR (v2 70 + v3 34)"이나 실제 카운트: v2 70 + v3 43(OC11+N8N6+MKT5+PERS7+MEM11+UX3) = **113개**. 9개 차이. FR-N8N6가 FR-N8N4 구현 상세와 내용 중복(에디터 접근 경로 동일). |
| D4 실행가능성 | 15% | 8/10 | 대부분 테스트 가능. **BUT**: FR-MEM9 "유사 태스크 성공률 추이" — "성공"의 정의가 PRD 어디에도 없음(에이전트 태스크 성공 = 사용자 만족? 도구 호출 성공? 에러 미발생?). 이 메트릭은 구현 시 해석이 갈림. FR-MKT2가 단일 FR에 6단계 파이프라인 전체를 기술 — Epic 분할 시 경계 불명확. |
| D5 일관성 | 10% | 9/10 | Step 07 RBAC과 FR 권한 정합 ✅. FR-OC11 "읽기 전용" = Bob+Sally RBAC 합의 ✅. Sprint 배정 Step 08 정합 ✅. FR-UX1 GATE 참조 ✅. |
| D6 리스크 | 20% | 8/10 | FR-MKT3 외부 플랫폼(Slack/Telegram) 단일 의존 — 승인 경로가 외부 메신저에만 있으면 Admin이 Slack/Telegram 미사용 시 워크플로우 블록. FR-MKT1 AI 모델 버전(Nano Banana 2, Kling 3.0 등)이 FR에 하드코딩 — 6개월 내 구식화 확실. FR 대비 도메인 요구사항 누락 3건이 Sprint 실행 시 "문서에 없으니 안 만들었다" 리스크. |

## 가중 평균: 8.10/10 ✅ PASS

계산: (9×0.20) + (7×0.20) + (8×0.15) + (8×0.15) + (9×0.10) + (8×0.20) = 1.80 + 1.40 + 1.20 + 1.20 + 0.90 + 1.60 = **8.10**

---

## 이슈 목록

### 1. **[D2 완전성] Step 05 도메인 요구사항 3건이 FR에 누락** — HIGH
- **위치**: FR 섹션 전체 (L2271-2337)
- **문제**:
  - **MKT-4 저작권 워터마크**: Step 05 L31 "저작권 워터마크" + Step 07 L1798 "콘텐츠 저작권 워터마크 옵션(MKT-4)" — FR-MKT 섹션에 해당 FR 없음
  - **PER-6 슬라이더 행동 예시 툴팁**: Step 05 Sally MEDIUM으로 추가(L37) — FR-PERS 섹션에 미반영
  - **NRT-2 heartbeat 적응형 간격**: Step 05 L31 "heartbeat 5s/15s/30s" — FR-OC에 heartbeat 정책 미정의
- **제안**:
  - `FR-MKT6: [Sprint 2] Admin이 생성 콘텐츠에 저작권 워터마크 삽입 여부를 선택할 수 있다`
  - `FR-PERS8: [Sprint 1] 성격 슬라이더에 각 축별 행동 예시 툴팁이 표시된다 ("성실성 90: 체크리스트 + 리뷰" 등)`
  - `FR-OC12: [Sprint 4] /ws/office heartbeat 간격이 탭 활성 상태에 따라 적응한다 (포커스 5s, 백그라운드 15s, hidden 30s)`

### 2. **[D4 실행가능성] FR-MEM9 "유사 태스크 성공률 추이" 성공 정의 부재** — MEDIUM
- **위치**: FR-MEM9 (L2326)
- **문제**: "유사 태스크 성공률 추이"가 성장 지표로 포함되어 있으나, 에이전트 태스크의 "성공"이 어디에도 정의되지 않음. 가능한 정의:
  - (A) 에러 없이 완료 = 기술적 성공
  - (B) 사용자가 긍정 피드백 = 만족도 성공
  - (C) tool_calling 결과가 유효 = 도구 성공
  - 구현 시 개발자가 임의 해석하면 CEO가 보는 "성장 지표"의 의미가 왜곡
- **제안**: FR-MEM9에서 "유사 태스크 성공률 추이" 삭제하고 "(Phase 5+ 성공 메트릭 정의 후 추가)" 주석. 또는 "(A) 에러 없이 완료"로 명시적 정의 추가.

### 3. **[D6 리스크] FR-MKT3 승인 경로가 Slack/Telegram만 — CEO앱 내 웹 승인 미정의** — MEDIUM
- **위치**: FR-MKT3 (L2302)
- **문제**: "Slack/Telegram 미리보기에서 사람이 승인/거부" — Admin이 Slack/Telegram을 사용하지 않으면 콘텐츠 승인 경로가 없음. B2B SaaS에서 외부 메신저 의존은 도입 장벽.
- **제안**: "Slack/Telegram 미리보기 **또는 CEO앱 알림 패널**에서" 웹 fallback 추가. n8n Wait 노드가 webhook 기반이므로 CEO앱에서 webhook 호출로 승인 가능.

### 4. **[D3 정확성] FR-N8N6 ↔ FR-N8N4 내용 중복** — LOW
- **위치**: FR-N8N4 (L2292) vs FR-N8N6 (L2294)
- **문제**: FR-N8N4가 이미 "(2) n8n 에디터 UI 활성 (Admin 전용 접근, Hono proxy 경유)" + "/admin/n8n-editor/*"를 구현 상세로 포함. FR-N8N6가 동일 기능을 별도 capability로 추출 — 의도는 좋으나 FR-N8N4와 내용 중복.
- **제안**: FR-N8N4에서 에디터 접근 구현 상세를 제거하고 "N8N_DISABLE_UI 설정은 FR-N8N6 참조"로 포인터 남기기. 또는 FR-N8N6에 "(FR-N8N4 보안 조건 전부 적용)" 참조 추가.

### 5. **[D3 정확성] FR 총 카운트 불일치** — LOW
- **위치**: John 요약 vs 실제 FR 섹션
- **문제**: John 요약 "총 104개 FR (v2 70 + v3 34)". 실제 카운트: v2 70 (FR1-72 중 FR37,39 삭제) + v3 43 (OC 11 + N8N 6 + MKT 5 + PERS 7 + MEM 11 + UX 3) = **113개**. "v3 34개"는 이전 26개 + 신규 8개? 실제 v3 FR은 43개.
- **제안**: FR 섹션 상단에 "총 113개 FR (v2 70 + v3 43)" 정확 카운트 명시.

---

## UX 관점 특별 코멘트

### FR-MKT 섹션 신설 👍
- 마케팅 자동화가 별도 카테고리로 독립 — Admin 이수진의 핵심 업무(콘텐츠 파이프라인)가 FR 레벨에서 명확. Epic 분할 시 마케팅 트랙이 자연스럽게 분리됨

### FR-PERS6~7 프리셋 추가 ✅
- Admin이 Big Five 5축을 처음부터 수동 조정하는 것은 도메인 전문가가 아니면 어려움. "전략 분석가" 같은 역할 프리셋이 있으면 진입 장벽 대폭 하락
- 최소 3종은 적절 (너무 많으면 선택 피로)

### FR-OC9~11 접근성 + 모바일 ✅
- /office를 데스크톱 전용으로 자르지 않고 모바일 리스트 뷰(FR-OC9) + aria-live(FR-OC10)로 대안 제공 — Step 05 PIX-4 Sally 이슈 완벽 반영

### FR-UX1~3 페이지 통합 ✅
- 14→6~8 통합이 FR로 명시 — "기능 100% 유지"(FR-UX3)와 "라우트 redirect"(FR-UX2)가 함께 있어 UX 회귀 방지

### FR-MEM10 알림 패턴 ✅
- Reflection 생성 시 CEO 알림 = "에이전트가 성장했다"는 체감 포인트. Brief의 "정체" 문제 해결을 사용자가 수동 확인 없이 인지

---

## Cross-talk 요청사항

**bob에게**: 이슈 #1(도메인 요구사항 FR 누락 3건) 중 NRT-2 heartbeat 적응형 간격은 delivery 관점에서 FR로 명시해야 하는지, NFR/구현 상세로 내려도 되는지 의견 부탁.

**Bob 답변**: NRT-2→NFR (품질 속성, 사용자 조작 없음), MKT-4→FR 필수 (Admin 설정), PER-6→UX 상세 (FR-PERS1 하위). Sally 동의.

---

## 재검증 (Verification Round)

**검증 대상**: John의 12건 수정 (stage-2-step09-fixes.md)

### 검증 결과

| # | 수정 항목 | Sally 이슈 | 검증 | 위치 |
|---|---------|-----------|------|------|
| 1 | FR-N8N6 CSRF Origin 검증 추가 | **이슈 #4** (부분) ✅ | ✅ L2294 "JWT + Admin 권한 + CSRF Origin 검증, FR-N8N4 인프라 기반". FR-N8N4 참조 추가로 중복 관계 명확화. | FR-N8N6 |
| 2 | FR-MKT6 저작권 워터마크 신규 | **이슈 #1** (MKT-4) ✅ | ✅ L2305 "AI 생성 콘텐츠에 저작권 워터마크 삽입 여부를 ON/OFF". Step 05 MKT-4 + Step 07 L1798 대응. | FR-MKT6 |
| 3 | FR-PERS8 슬라이더 행동 예시 툴팁 | **이슈 #1** (PER-6) ✅ | ✅ L2317 "각 슬라이더 위치별 행동 예시 툴팁 (예: 성실성 90+: 체크리스트 자동 생성, 꼼꼼한 검증)". Step 05 PER-6 대응. | FR-PERS8 |
| 4 | NRT-2 heartbeat → NFR carry-forward | **이슈 #1** (NRT-2) ✅ | ✅ Bob cross-talk 합의: NFR 영역. Step 10 반영 예정. FR 비적용 타당. | carry-forward |
| 5 | FR-MKT7 fallback 엔진 자동 전환 | — (Bob+Quinn) | ✅ L2306 "외부 AI API 장애 시 fallback 엔진 자동 전환 + Admin 알림". Step 05 MKT-2 fallback 도메인 요구사항 해소. | FR-MKT7 |
| 6 | FR-MKT2 플랫폼별 실패 격리 | — (Quinn) | ✅ L2301 "일부 플랫폼 게시 실패 시 성공 플랫폼은 유지하고 실패 플랫폼만 Admin에게 알린다". UX 관점 우수 — 부분 실패가 전체 실패로 확대되지 않음. | FR-MKT2 |
| 7 | FR-MKT4 구현 상세 제거 | — (Quinn+Winston) | ✅ L2303 "다음 워크플로우 실행부터 즉시 반영된다". n8n Switch 노드 언급 제거, capability 고도 달성. | FR-MKT4 |
| 8 | FR-MEM9 성공 정의 추가 | **이슈 #2** ✅ | ✅ L2329 "성공 기준: observations.outcome='success'". 명시적 정의로 구현 시 해석 분기 방지. | FR-MEM9 |
| 9 | FR-MKT3 CEO앱 웹 승인 경로 | **이슈 #3** ✅ | ✅ L2302 "CEO앱 웹 UI 또는 Slack/Telegram 미리보기에서 사람이 승인/거부". 외부 메신저 미사용 시에도 승인 가능. | FR-MKT3 |
| 10 | FR-UX1 6개 그룹 확정 | — (Quinn) | ✅ L2337 "6개 그룹으로 통합" + 구체적 조합 명시. | FR-UX1 |
| 11 | FR-MKT1 모델명→카테고리 변환 | — (Bob) | ✅ L2300 "카테고리별(이미지 3종+, 영상 4종+, 나레이션 2종, 자막 3종)". 특정 모델명 제거로 향후 모델 변경에 유연. | FR-MKT1 |
| 12 | v3 altitude 신규 FR 준수 | — (Bob) | ✅ 신규 FR(MKT6, MKT7, PERS8) 전부 capability 고도. 기존 FR 구현 상세는 크리틱 검증 완료 항목이므로 유지 합리적. | 전체 |

### 잔여 사항 (Residual)

- **FR-UX 섹션 헤더 "6~8개"**: L2335 헤더에 "6~8개로 통합" 잔존, FR-UX1은 "6개 그룹"으로 확정. 헤더 미수정이나 기능 차이 없음. **점수 무영향**, 향후 정리 시 "6개"로 통일 권장.
- **FR 총수 내부 분류**: fixes log "v2 97 + v3 19 = 116"이나 실제 v2 70 + v3 46 = 116. 총수 일치, 분류만 차이. 점수 무영향.

### 재검증 점수

| 차원 | 가중치 | 초기 | 재검증 | 변동 근거 |
|------|--------|------|--------|---------|
| D1 구체성 | 20% | 9 | 9 | 유지. FR-MEM9 성공 기준 명시(#8), FR-PERS8 예시(#3), FR-MKT1 카테고리 수치(#11) 추가 구체성. |
| D2 완전성 | 20% | 7 | 9 | FR-MKT6 워터마크(#2), FR-PERS8 툴팁(#3), NRT-2 NFR carry-forward(#4), FR-MKT7 fallback(#5). 도메인 요구사항 전부 해소. |
| D3 정확성 | 15% | 8 | 9 | FR-N8N6→N8N4 참조 추가(#1). FR-MKT4 구현 상세 제거(#7). 총 카운트 116 합리적(#5 내부 분류 차이 점수 무영향). |
| D4 실행가능성 | 15% | 8 | 9 | FR-MEM9 성공 정의(#8). FR-MKT2 실패 격리(#6). FR-MKT4 capability 고도(#7). |
| D5 일관성 | 10% | 9 | 9 | 유지. FR-UX1 6개 그룹 확정(#10). |
| D6 리스크 | 20% | 8 | 9 | FR-MKT3 웹 fallback(#9). FR-MKT7 fallback 엔진(#5). FR-MKT1 카테고리화로 모델 변경 유연(#11). |

### 재검증 가중 평균: 9.00/10 ✅ PASS

계산: (9×0.20) + (9×0.20) + (9×0.15) + (9×0.15) + (9×0.10) + (9×0.20) = 1.80 + 1.80 + 1.35 + 1.35 + 0.90 + 1.80 = **9.00**
