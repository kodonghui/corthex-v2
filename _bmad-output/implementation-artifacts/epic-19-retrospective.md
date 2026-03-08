# Epic 19 Retrospective: Internal Messenger

## Overview

| Metric | Value |
|--------|-------|
| Epic | 19 — Internal Messenger |
| Stories | 5/5 completed |
| Total SP | 10 |
| Total Tests | 102 (26 + 29 + 20 + 13 + 14) |
| Phase | Phase 3 — Extensions |
| PRD | FR76 |

## Story Summary

| Story | Title | SP | Tests | Key Deliverables |
|-------|-------|-----|-------|-----------------|
| 19-1 | 메신저 스키마 | 1 | 26 | conversations/messages/participants 테이블, ConversationService CRUD |
| 19-2 | 실시간 채팅 API + WebSocket | 3 | 29 | 12개 REST 엔드포인트, conversation WebSocket 채널, 타이핑/읽음 이벤트 |
| 19-3 | 1:1 + 그룹 메시지 UI | 3 | 20 | 4개 React 컴포넌트, 채널/대화 탭, infinite scroll, 실시간 WebSocket |
| 19-4 | AI 분석 결과 공유 | 2 | 13 | share-report API, ai_report 카드 렌더링, 보고서 공유 모달 |
| 19-5 | companyId 기반 채팅 격리 | 1 | 14 | verifyUsersInCompany, unread companyId 필터, 보안 이슈 3건 해결 |

## What Went Well

1. **점진적 빌드 패턴 성공**: 스키마(19-1) → API(19-2) → UI(19-3) → 기능확장(19-4) → 보안강화(19-5) 순서로 자연스럽게 쌓아감
2. **기존 인프라 활용**: WebSocket 서버, authMiddleware, React Query, Zustand ws-store 등 기존 패턴을 그대로 활용하여 일관성 유지
3. **채널 메신저와 공존**: 기존 messenger.tsx(채널 기반)를 건드리지 않고 탭 분리로 대화 기반 메신저 추가 — 회귀 리스크 제로
4. **보안 이슈 조기 발견**: 코드 리뷰에서 tenant isolation 누락 3건 발견 → 19-5에서 체계적으로 해결
5. **102개 테스트**: 순수 로직 중심 유닛 테스트로 빠른 피드백 루프 확보

## What Could Be Improved

1. **19-1에서 verifyUsersInCompany를 미리 구현했으면**: create/addParticipant의 회사 소속 검증이 19-5까지 누락 — 스키마 설계 단계에서 고려했으면 좋았음
2. **unread count N+1 쿼리**: GET /conversations/unread에서 대화방별 루프 쿼리 — 대화방 수 증가 시 성능 이슈 가능. 서브쿼리/JOIN으로 최적화 필요
3. **DOM 테스트 부재**: React 컴포넌트 렌더링 테스트 없음 (bun:test 환경 한계). E2E 또는 @testing-library 추가 고려

## Technical Debt

1. **unread count N+1**: 대화방별 개별 쿼리 → 단일 집계 쿼리로 리팩토링 필요
2. **대화방 이름 표시**: 1:1 대화에서 상대방 이름 표시가 서버에서 name 필드 의존 — 서버에서 상대방 이름 자동 설정 로직 추가 필요
3. **메시지 검색**: 대화 탭에 메시지 검색 기능 없음 (채널 탭에는 있음)

## Architecture Decisions

1. **별도 라우트 파일**: conversations.ts를 messenger.ts와 분리 — 관심사 분리 + 독립적 진화
2. **탭 기반 공존**: 기존 채널 메신저를 ChannelsView로 래핑, 새 대화 메신저를 ConversationsView로 분리
3. **ai_report JSON content**: messages.content에 JSON 문자열 저장 (reportId, title, summary) — 별도 테이블 불필요
4. **verifyUsersInCompany**: ConversationService 내부 private 메서드로 구현 — 모든 참여자 변경 경로에서 호출

## Metrics

- **총 신규 파일**: 10개 (서버 3, 클라이언트 5, 테스트 5, 스토리 5)
- **총 수정 파일**: 8개 (conversations.ts, conversation.ts, channels.ts, types.ts, index.ts, messenger.tsx, conversation-chat.tsx, reports.tsx)
- **테스트 커버리지**: 102 tests / 0 failures
- **빌드**: server + app 모두 clean
