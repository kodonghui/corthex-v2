# Stage 5 Step 2 Discovery — Fixes Applied

Date: 2026-03-23
R1 avg: 7.88/10 (john 7.7, dev 7.95, quinn 7.95, winston 7.90)

---

## Fixes Applied (by critic)

### Dev (must-fix)
1. **CEO 앱 페이지 수 수정**: "~43개 (v2 42 + /office)" → "~35개 (v2 42 - GATE costs/workflows 제거 - FR-UX 14→6그룹 통합 + /office)" (Line 82)
2. **FCP 지표 분리**: "≤ 3초 FCP" → "FCP (shell) ≤ 1.5초, TTI (캐릭터+WS 연결) ≤ 3초" (Line 96, DO-1)
3. **DC-2 에이전트 수 임계값 추가**: ≤10명 단일 뷰, 11~30명 방 분리+미니맵, 30명+ 미니맵 필수+검색+필터
4. **DC-4 빈 상태 UX 추가**: Reflection 0건 시 Dashboard/Performance 위젯 placeholder 정의

### Dev (should-fix)
5. **DC-3 로딩 상태 추가**: 슬라이더 skeleton + "성격 프로필 불러오는 중..." 텍스트

### John (must-fix)
6. **Admin Tier별 Reflection 한도 설정 UI**: DC-4에 추가 — Tier별 일일 한도 ($0.10~$0.50/agent/day), 한도 초과 시 자동 중단 + 알림
7. **PixiJS 200KB 번들 초과 fallback**: DC-1 + DO-1에 추가 — 간소화 리스트 뷰를 데스크톱 fallback으로 사용

### John (medium)
8. **Reflection 비용 폭주 Admin 경고 UI**: DC-4에 추가 — "Reflection 일일 비용 추이" 위젯 + 80%/100% 경고 배너

### Quinn (high)
9. **에러 상태 UI 추가**: DC-1 (WebSocket 끊김), DC-3 (Big Five 저장 실패), DC-4 (Reflection 크론 에러) — 각 DC에 에러 경로 추가
10. **WebSocket fallback UX**: DC-1에 추가 — stale indicator + retry banner + 3초 자동 재연결 (최대 5회) + 새로고침 버튼

### Quinn (medium)
11. **빈 상태 패턴**: DC-1 (에이전트 0명 /office), DC-4 (Reflection 0건) 추가
12. **로딩 상태**: DC-1 (PixiJS 캔버스), DC-3 (슬라이더) 추가
13. **aria-live="assertive"**: DC-1 에러 상태에 assertive 적용 (polite는 일반 상태용)

### Quinn (low)
14. **"Controlled Nature" 출처**: Vision & Identity §2.3 참조 추가

### Winston (must-fix)
15. **FR-MKT 마케팅 자동화 UX**: DC-5에 추가 — 6단계 파이프라인 UX 흐름, 외부 API fallback 시각화, Admin 엔진 설정 페이지
16. **페이지 수 수정**: DC-6 "74페이지" → "~67페이지" (v2 71 - GATE 4 + v3 3 = ~67, Brief §4 기준)

### Winston (should-fix)
17. **DC-7 신설**: 서버 리소스 병목의 UX 영향 — WebSocket 접속 초과, 배포 중 성능 저하, graceful degradation 순서 정의

### Quinn (low) + Additional
18. **1인 창업자 UX**: 온보딩 note 확장 — 앱 전환 네비게이션, "CEO 초대" 단계 조건부 스킵

### Dev (nice-to-have)
19. **Sovereign Sage 팔레트 명확화**: "v2의 slate-950/cyan-400 Sovereign Sage와는 다른 새 팔레트" 문구 추가

---

## Not Applied (deferred to later steps)
- Dev: rough component count (~15-20) → Step 3 Core Experience에서 상세 정의
- Dev: PixiJS v8 tree-shaking risk note → Sprint 4 Go/No-Go 체크리스트에서 다룸
