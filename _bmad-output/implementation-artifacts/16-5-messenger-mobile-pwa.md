# Story 16.5: 메신저 모바일 PWA

Status: done

## Story

As a workspace user (직원),
I want the messenger to work seamlessly as a mobile PWA with offline support, push notifications, and an install banner,
so that I can use the messenger like a native app on my phone with real-time alerts even when the browser is closed.

## Acceptance Criteria

1. **Given** Service Worker **When** 앱 로드 **Then** 앱 셸(HTML/CSS/JS) Cache First 전략 적용. 인증 API는 Network Only (캐시 금지). 정적 이미지 Cache First 7일. WebSocket/채팅 스트리밍 캐시 없음
2. **Given** PWA 설치 상태 (`display-mode: standalone`) **When** 메신저 새 메시지/멘션 수신 **Then** Web Push 알림 표시 (서버→VAPID→SW push event → `self.registration.showNotification`)
3. **Given** 미설치 브라우저 **When** 첫 방문 후 3일 경과 **Then** 하단 슬라이드업 설치 배너 표시. `beforeinstallprompt` 캡처. "나중에" 선택 시 7일간 재노출 없음 (`localStorage`)
4. **Given** 오프라인 상태 **When** 네트워크 끊김 **Then** 오프라인 전용 페이지 표시 ("인터넷 연결이 끊겼습니다 / 연결 복구 시 자동 재개 / [다시 시도]"). 온라인 복구 시 자동 이전 화면 복원
5. **Given** 로그아웃 **When** auth-store `logout()` 호출 **Then** SW에 `postMessage({ type: 'LOGOUT' })` → SW가 `caches.keys()` → `caches.delete()` 전체 캐시 삭제
6. **Given** 모바일(md 이하) 메신저 **When** 채널 목록/채팅 영역 전환 **Then** 채널 선택 시 채팅 영역 전체화면 + "← 채널 목록" 뒤로가기. 터치 타겟 44px 이상. safe area inset 적용
7. **Given** turbo build + type-check **When** 전체 빌드 **Then** 8/8 success

## Tasks / Subtasks

- [x] Task 1: Service Worker 캐시 전략 구현 (AC: #1)
  - [x]`packages/app/public/sw.js` 전면 교체 — fetch 이벤트 핸들러 추가
  - [x]캐시 이름: `corthex-shell-v2` (기존 v1에서 업그레이드)
  - [x]앱 셸 (HTML/CSS/JS) → Cache First: `event.request.destination in ['document','script','style','font']` → cache.match → fallback network → put cache
  - [x]인증 API (`/api/`) → Network Only: 절대 캐시하지 않음 (보안)
  - [x]정적 이미지 (`/icons/`, `/assets/`) → Cache First, `max-age: 604800` (7일)
  - [x]WebSocket, `/ws` 경로 → 캐시 없음 (패스스루)
  - [x]`install` 이벤트: 오프라인 페이지 (`/offline.html`) pre-cache
  - [x]`activate` 이벤트: 이전 캐시 이름 삭제 (`corthex-v1` 등)
  - [x]`LOGOUT` 메시지 수신 시: `caches.keys()` → 모든 캐시 삭제
  - [x]파일: `packages/app/public/sw.js`

- [x] Task 2: 오프라인 페이지 (AC: #4)
  - [x]`packages/app/public/offline.html` 신규 생성 — 독립 HTML (React 불필요)
  - [x]디자인: `bg-zinc-950` 전체화면 중앙, `📡` 이모지, "인터넷 연결이 끊겼습니다", "연결 복구 시 자동으로 재개됩니다", `[다시 시도]` 버튼
  - [x]`[다시 시도]` 클릭 → `location.reload()`
  - [x]`online` 이벤트 감지 → 자동 `location.reload()`
  - [x]SW fetch 실패 시 (document 요청 + 네트워크 오류) → 오프라인 페이지 서빙
  - [x]파일: `packages/app/public/offline.html`

- [x] Task 3: PWA 설치 배너 (AC: #3)
  - [x]`packages/app/src/components/install-banner.tsx` 신규 생성
  - [x]`beforeinstallprompt` 이벤트 캡처 → state에 저장
  - [x]표시 조건: 첫 방문 후 3일 경과 (`localStorage: corthex_first_visit`) + 미설치 (`display-mode: standalone` 아님) + "나중에" 7일 미경과 (`corthex_install_dismissed`)
  - [x]UI: 하단 슬라이드업 (`fixed bottom-0 left-0 right-0`), 배경 `bg-indigo-600`, "CORTHEX 앱 설치하기" + [설치] + [나중에]
  - [x][설치] 클릭 → `deferredPrompt.prompt()` → 결과에 따라 배너 숨김
  - [x][나중에] 클릭 → `localStorage.setItem('corthex_install_dismissed', Date.now())` → 배너 숨김 (7일 후 재노출)
  - [x]`Layout` 컴포넌트에 `<InstallBanner />` 추가
  - [x]파일: `packages/app/src/components/install-banner.tsx`, `packages/app/src/components/layout.tsx`

- [x] Task 4: Web Push 알림 (AC: #2)
  - [x]서버: VAPID 키 생성 API `GET /workspace/push/vapid-key` → 공개키 반환
  - [x]서버: 구독 등록 API `POST /workspace/push/subscribe` → pushSubscriptions 저장 (userId, companyId, endpoint, keys)
  - [x]서버: 구독 해제 API `DELETE /workspace/push/subscribe`
  - [x]DB: `pushSubscriptions` 테이블 추가 (id, userId, companyId, endpoint, p256dh, auth, createdAt)
  - [x]서버: 메신저 메시지 전송 시 오프라인 유저에게 web-push 발송 (기존 `messenger_mention` 알림 경로 확장)
  - [x]`web-push` npm 패키지 설치 (서버 사이드)
  - [x]프론트엔드: PWA 설치 확인 후 `Notification.requestPermission()` → `registration.pushManager.subscribe()` → 서버에 구독 등록
  - [x]SW: `push` 이벤트 핸들러 → `self.registration.showNotification(title, { body, icon, data: { url } })`
  - [x]SW: `notificationclick` 이벤트 → `clients.openWindow(data.url)` 또는 포커스
  - [x]프론트엔드: 설정 페이지에 "푸시 알림" 토글 (PWA 미설치 시 비활성 + 안내 텍스트)
  - [x]로그아웃 시 서버에 구독 해제 호출
  - [x]파일: `packages/server/src/routes/workspace/push.ts` (신규), `packages/server/src/db/schema.ts`, `packages/app/public/sw.js`, `packages/app/src/components/push-permission.tsx` (신규)

- [x] Task 5: 메신저 모바일 반응형 최적화 (AC: #6)
  - [x]채널 목록 ↔ 채팅 영역 전환: `showChat` 상태 + `md:` 브레이크포인트 (chat.tsx 패턴 재사용)
  - [x]모바일: 채널 선택 시 채팅 전체화면, "← 채널 목록" 뒤로가기 버튼
  - [x]검색바, 채널 아이템, 메시지 입력 영역 터치 타겟 44px 이상
  - [x]메시지 입력 영역 `pb-[max(1rem,env(safe-area-inset-bottom))]` safe area
  - [x]스레드 패널: 모바일에서 전체화면 오버레이 (기존 우측 패널 → 전체화면)
  - [x]이모지 피커: 모바일에서 위치 조정 (뷰포트 초과 방지)
  - [x]채널 설정 모달: 모바일에서 전체화면 시트
  - [x]iOS momentum 스크롤 적용
  - [x]파일: `packages/app/src/pages/messenger.tsx`

- [x] Task 6: 로그아웃 시 캐시 삭제 (AC: #5)
  - [x]`packages/app/src/stores/auth-store.ts` — `logout()` 액션에 SW 캐시 삭제 메시지 추가
  - [x]`navigator.serviceWorker.controller?.postMessage({ type: 'LOGOUT' })`
  - [x]파일: `packages/app/src/stores/auth-store.ts`

- [x] Task 7: 빌드 검증 (AC: #7)
  - [x]`bunx turbo build type-check` → 8/8 success

## Dev Notes

### Existing Infrastructure (DO NOT re-implement)

1. **Service Worker 기본 골격** (`packages/app/public/sw.js`)
   - 현재: install/activate만 있음, fetch 핸들러 없음, push 핸들러 없음
   - **전면 교체 대상** — 캐시 전략 + push + logout 메시지 핸들링 추가

2. **PWA 기본 인프라** (Story 1.8에서 구축)
   - `manifest.json` — name, icons, display: standalone 설정 완료
   - `index.html` — `<link rel="manifest">`, theme-color, apple-mobile-web-app 메타태그 완료
   - `main.tsx` — `navigator.serviceWorker.register('/sw.js')` 등록 코드 완료
   - `viewport-fit=cover` + safe area inset 설정 완료 (Story 4.7)

3. **채팅 모바일 최적화 패턴** (Story 4.7에서 구축)
   - `showChat` 상태로 세션 목록/채팅 전환 (md 브레이크포인트) — **이 패턴을 메신저에도 적용**
   - safe area inset: `pb-[max(1rem,env(safe-area-inset-bottom))]` 패턴 사용
   - 터치 타겟 44px: `p-2` 또는 `py-3` 패턴
   - iOS momentum 스크롤: CSS로 적용
   - 파일: `packages/app/src/pages/chat.tsx`, `packages/app/src/components/chat/chat-area.tsx`

4. **알림 시스템** (`packages/server/src/routes/workspace/notifications.ts`)
   - 기존 알림 API + WebSocket `notifications` 채널 — push 알림과 연동
   - `messenger_mention` 알림 type 이미 존재 (Story 16-4)

5. **WebSocket 인프라** (`packages/server/src/ws/`)
   - `broadcastToChannel(channelKey, data)` — 재사용
   - 메신저 채널: `messenger::channelId`로 실시간 메시지 (16-2에서 완성)

6. **메신저 UI** (`packages/app/src/pages/messenger.tsx`)
   - 1110줄. 채널 목록/채팅/스레드/검색/리액션/unread 배지 모두 구현됨
   - 현재 데스크톱 레이아웃: 좌측 채널 목록(w-80) + 우측 채팅 영역 — **모바일 전환 필요**
   - ChannelSettingsModal, ThreadPanel, 검색 드롭다운 — 모바일 최적화 필요

### API 구현 주의사항

- **VAPID 키**: `web-push` 패키지의 `generateVAPIDKeys()` 사용. 키를 환경변수(`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`)에 저장하거나, 초기 실행 시 생성하여 DB/환경에 보관
- **pushSubscriptions 테이블**: `id (uuid PK), userId (FK), companyId (FK), endpoint (text), p256dh (text), auth (text), createdAt (timestamp)` — 같은 유저가 여러 디바이스 구독 가능 (endpoint별 unique)
- **Push 발송 로직**: 메신저 메시지 전송 시 → 채널 멤버 중 현재 WS 미연결(오프라인) 유저 → pushSubscriptions에서 조회 → `webpush.sendNotification(subscription, payload)`
- **VAPID subject**: `mailto:admin@corthex-hq.com` 또는 환경변수
- **Push payload**: JSON `{ title: "채널명", body: "발신자: 메시지내용", url: "/messenger?channelId=xxx" }`
- **구독 해제**: 로그아웃 시 + 410 Gone 응답 시 자동 삭제

### 프론트엔드 구현 주의사항

- **메신저 모바일 레이아웃**: chat.tsx의 `showChat` 패턴 참조. messenger.tsx에 `showChat` 상태 추가 → 모바일에서 채널 선택 시 `setShowChat(true)`, 뒤로가기 시 `setShowChat(false)`
- **설치 배너**: `Layout`에 추가. `beforeinstallprompt` 이벤트는 window에서 캡처하여 state에 저장. 3일 체크는 `Date.now() - firstVisit > 3 * 86400000`
- **Push 권한**: PWA 설치 여부 확인: `window.matchMedia('(display-mode: standalone)').matches`. 미설치 시 인앱 알림만 사용, 권한 요청하지 않음
- **오프라인 페이지**: 독립 HTML (React 번들 로드 불가능하므로). SW에서 navigation request 실패 시 오프라인 페이지 서빙
- **캐시 전략 구분**: `request.url`로 판단. `/api/` 포함 → Network Only. `/assets/`, `/icons/` → Cache First. 나머지 document → Cache First with network fallback

### 보안 고려사항

- 인증 API (`/api/`) 절대 캐시 금지 → Network Only
- Push 구독: userId 검증 (본인 구독만 등록/삭제)
- VAPID private key: 환경변수로만 관리 (코드에 하드코딩 금지)
- 로그아웃 시 모든 캐시 + push 구독 삭제
- pushSubscriptions companyId 테넌트 격리

### Project Structure Notes

```
packages/app/
├── public/
│   ├── sw.js                              ← 전면 교체 (캐시 + push + logout)
│   ├── offline.html                       ← 신규 생성
│   └── manifest.json                      ← 기존 유지
├── src/
│   ├── components/
│   │   ├── install-banner.tsx             ← 신규 생성
│   │   ├── push-permission.tsx            ← 신규 생성
│   │   └── layout.tsx                     ← InstallBanner 추가
│   ├── stores/
│   │   └── auth-store.ts                  ← logout에 SW 캐시 삭제 추가
│   └── pages/
│       └── messenger.tsx                  ← 모바일 반응형 최적화

packages/server/
├── src/
│   ├── routes/workspace/
│   │   ├── push.ts                        ← 신규 (VAPID + 구독 + push 발송)
│   │   └── messenger.ts                   ← push 발송 로직 연동
│   └── db/
│       ├── schema.ts                      ← pushSubscriptions 테이블 추가
│       └── migrations/                    ← 신규 마이그레이션
```

### References

- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#2156-2185] — PWA 캐시 전략, 설치 배너, 푸시 알림, 오프라인 페이지 UX 스펙
- [Source: _bmad-output/implementation-artifacts/1-8-docker-pipeline-pwa.md] — PWA 기본 인프라 (manifest, SW, icons)
- [Source: _bmad-output/implementation-artifacts/4-7-chat-mobile-optimize.md] — 채팅 모바일 최적화 패턴 (showChat, safe area, 터치 타겟)
- [Source: _bmad-output/implementation-artifacts/16-4-messenger-search-notify.md] — 이전 스토리 (검색, unread, 멘션 알림)
- [Source: packages/app/public/sw.js] — 현재 SW (패스스루만, 교체 대상)
- [Source: packages/app/src/pages/messenger.tsx] — 현재 메신저 UI (1110줄, 모바일 최적화 대상)
- [Source: packages/app/src/stores/auth-store.ts] — 로그아웃 로직 (SW 캐시 삭제 추가)
- [Source: packages/app/src/pages/chat.tsx] — showChat 모바일 전환 패턴 참조

### Previous Story Intelligence (16-4)

- 검색/unread/멘션 알림 구현 완료: ILIKE 검색, lastReadAt 기반 unread, 멘션 알림 notifications 테이블 + WS push
- Code Review: HIGH 1건 (ILIKE 이스케이프), MEDIUM 1건 (assertMember 누락) — 모두 수정됨
- messenger.tsx 인라인 컴포넌트 패턴 유지 — 모바일 반응형도 같은 파일 내 수정
- TEA 111건 통과
- 커밋 패턴: `feat: Story X-Y 한글제목 — 핵심내용 + TEA N건`

### Git Intelligence

Recent commits:
- `900c080` feat: Story 16-4 메신저 검색 + 알림 — ILIKE 검색 + @멘션 알림 + 미읽음 배지 + TEA 111건
- `6405dd4` feat: Story 16-3 리액션 + 스레드 — 이모지 리액션 CRUD + 스레드 패널 + TEA 75건
- `5c0d5c3` feat: Story 16-2 실시간 메시지 + AI 에이전트 — WS 브로드캐스트 + @멘션 호출 + TEA 84건
- `109c225` feat: Story 16-1 메신저 채널 관리 — 수정/삭제/나가기 + 설정 모달 + TEA 79건

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: SW 전면 교체 — Cache First(앱셸/정적), Network Only(API), Network First(navigation), offline.html pre-cache, LOGOUT 메시지 핸들링
- Task 2: offline.html 독립 HTML — 다크 테마, 📡 아이콘, 자동 재연결(online 이벤트), 다시 시도 버튼
- Task 3: InstallBanner — beforeinstallprompt 캡처, 3일 대기, 7일 dismiss 쿨다운, Layout에 추가
- Task 4: Web Push — pushSubscriptions 테이블 + VAPID API + subscribe/unsubscribe + web-push 패키지 + 메신저 메시지 발송 시 오프라인 유저 push + PushPermission 컴포넌트(standalone만)
- Task 5: 메신저 모바일 반응형 — showChat 토글(md 브레이크포인트), 뒤로가기 버튼, safe area inset, iOS momentum, 스레드 모바일 전체화면, 채널 목록 전체 너비
- Task 6: auth-store logout에 SW postMessage({ type: 'LOGOUT' }) 추가
- Task 7: turbo build type-check 8/8 success, 1703 tests pass

### File List

- packages/app/public/sw.js (전면 교체 — 캐시 전략 + push + logout)
- packages/app/public/offline.html (신규 — 오프라인 페이지)
- packages/app/src/components/install-banner.tsx (신규 — PWA 설치 배너)
- packages/app/src/components/push-permission.tsx (신규 — Web Push 권한 요청)
- packages/app/src/components/layout.tsx (수정 — InstallBanner + PushPermission 추가)
- packages/app/src/stores/auth-store.ts (수정 — logout에 SW 캐시 삭제)
- packages/app/src/pages/messenger.tsx (수정 — 모바일 반응형 showChat/뒤로가기/safe area/momentum)
- packages/server/src/routes/workspace/push.ts (신규 — VAPID + subscribe + push 발송)
- packages/server/src/routes/workspace/messenger.ts (수정 — sendPushToUser 오프라인 유저 push)
- packages/server/src/db/schema.ts (수정 — pushSubscriptions 테이블 + relations)
- packages/server/src/db/migrations/0027_push-subscriptions.sql (신규 — 마이그레이션)
- packages/server/src/db/migrations/meta/_journal.json (수정 — journal entry)
- packages/server/src/index.ts (수정 — pushRoute 등록)
- packages/server/src/__tests__/unit/messenger-mobile-pwa.test.ts (신규 — 56 tests)
