# Story 12.3: Selenium 자동 발행 엔진 (5개 플랫폼)

Status: review

## Story

As a CEO/Human 직원,
I want 승인된 SNS 콘텐츠를 5개 플랫폼(Instagram, Twitter/X, Facebook, Naver Blog, Tistory)에 자동으로 발행할 수 있기를,
so that 수동 복붙 없이 원클릭으로 멀티 플랫폼 발행이 가능하고, 실패 시 자동 재시도까지 처리된다.

## Acceptance Criteria

1. **플랫폼 Publisher 인터페이스**: 모든 플랫폼 publisher가 공통 `PlatformPublisher` 인터페이스를 구현한다. `publish(content, credentials) → PublishResult` 시그니처를 따르며, 성공 시 `{ success: true, url, platformId }`, 실패 시 `{ success: false, error }` 반환.
2. **Instagram Publisher (API)**: Instagram Graph API v21.0을 사용하여 사진 게시물을 발행한다. 미디어 컨테이너 생성 → 발행 → permalink 반환. snsAccounts 테이블의 암호화된 credentials에서 access_token을 복호화하여 사용.
3. **Twitter/X Publisher (API)**: Twitter API v2를 사용하여 텍스트+미디어 트윗을 발행한다. OAuth 1.0a 인증. 280자 초과 시 자동 스레드 분할.
4. **Facebook Publisher (API)**: Facebook Graph API를 사용하여 페이지에 게시물을 발행한다. 페이지 액세스 토큰 사용. 이미지+텍스트 게시 지원.
5. **Naver Blog Publisher (Selenium)**: Selenium WebDriver를 사용하여 네이버 블로그에 자동 발행한다. 네이버 ID/PW 로그인 → SmartEditor에 HTML 주입 → 발행 → URL 캡처. 헤드리스 모드 지원. 안티봇 감지 회피(CDP navigator.webdriver override).
6. **Tistory Publisher (API)**: Tistory Open API를 사용하여 블로그 글을 발행한다. access_token 인증. HTML 본문 + 태그 + 공개설정 지원.
7. **발행 큐 프로세서**: approved/scheduled 상태의 콘텐츠를 자동으로 픽업하여 대상 플랫폼에 발행한다. 실패 시 최대 3회 재시도 (지수 백오프: 1분, 5분, 15분). 재시도 횟수와 마지막 에러를 snsContents.metadata에 기록.
8. **스크린샷 캡처**: Selenium 발행 시 발행 완료 페이지의 스크린샷을 캡처하여 검증용으로 저장한다. 파일 경로를 metadata에 기록.
9. **플랫폼별 Rate Limiting**: 플랫폼별 분당 요청 제한을 적용한다 (Instagram: 25/hr, Twitter: 300/3hr, Facebook: 200/hr, Naver Blog: 5/hr, Tistory: 10/hr). 제한 초과 시 다음 슬롯까지 대기.
10. **snsPlatformEnum 확장**: 기존 3개(instagram, tistory, daum_cafe)에서 5개(instagram, twitter, facebook, naver_blog, tistory)로 확장. daum_cafe는 하위 호환을 위해 유지. DB 마이그레이션 포함.
11. **발행 결과 API**: 발행 결과(성공/실패, URL, 재시도 횟수, 스크린샷)를 조회할 수 있는 API 엔드포인트 제공.
12. **Credential 복호화**: snsAccounts.credentials(AES-256-GCM 암호화)를 복호화하여 각 publisher에 전달한다. 기존 credential-vault 서비스 활용.

## Tasks / Subtasks

- [x] Task 1: DB 마이그레이션 — snsPlatformEnum 확장 (AC: #10)
  - [x] `0039_sns-platform-enum-extension.sql` — ALTER TYPE sns_platform ADD VALUE 'twitter', 'facebook', 'naver_blog'
  - [x] schema.ts 업데이트 — snsPlatformEnum에 새 값 추가
  - [x] sns.ts 라우트 — createSnsSchema, generateSnsSchema 등 enum 목록 확장
  - [x] PLATFORM_NAMES 사전 확장 (twitter, facebook, naver_blog)

- [x] Task 2: PlatformPublisher 인터페이스 + PublishResult 타입 (AC: #1)
  - [x] `packages/server/src/lib/sns-publishers/types.ts` — PlatformPublisher 인터페이스, PublishResult, PublishInput 타입 정의
  - [x] PlatformPublisher: `publish(input: PublishInput, credentials: Record<string, string>) → Promise<PublishResult>`
  - [x] PublishResult: `{ success: boolean, url?: string, platformId?: string, error?: string, screenshotPath?: string }`

- [x] Task 3: Instagram Publisher (API 기반) (AC: #2, #12)
  - [x] `packages/server/src/lib/sns-publishers/instagram-publisher.ts`
  - [x] Graph API v21.0: POST /{user-id}/media → POST /{user-id}/media_publish
  - [x] 이미지 URL + caption(body + hashtags) 조합
  - [x] v1 instagram_publisher.py 포트: 미디어 컨테이너 → 발행 → permalink
  - [x] access_token을 credentials에서 읽음

- [x] Task 4: Twitter/X Publisher (API 기반) (AC: #3, #12)
  - [x] `packages/server/src/lib/sns-publishers/twitter-publisher.ts`
  - [x] Twitter API v2: POST /2/tweets
  - [x] OAuth 1.0a 서명 (consumer_key, consumer_secret, access_token, access_token_secret)
  - [x] 280자 초과 시 스레드 분할 (reply_to_tweet_id 체인)
  - [x] 미디어 업로드: POST /1.1/media/upload (chunked)

- [x] Task 5: Facebook Publisher (API 기반) (AC: #4, #12)
  - [x] `packages/server/src/lib/sns-publishers/facebook-publisher.ts`
  - [x] Graph API: POST /{page-id}/feed (message + link) 또는 POST /{page-id}/photos (photo + caption)
  - [x] 페이지 access_token 사용
  - [x] 이미지 있으면 photo 엔드포인트, 없으면 feed 엔드포인트

- [x] Task 6: Naver Blog Publisher (Selenium) (AC: #5, #8, #12)
  - [x] `packages/server/src/lib/sns-publishers/naver-blog-publisher.ts`
  - [x] Selenium WebDriver 초기화 (headless Chrome, 안티봇 CDP override)
  - [x] v1 naver_blog_publisher.py 포트:
    - 네이버 로그인 (nid.naver.com)
    - blog.naver.com/{blog_id}/postwrite 이동
    - SmartEditor에 제목/본문 HTML 주입 (execute_script)
    - 태그 입력 (Enter 키)
    - 발행 버튼 클릭
    - 발행 완료 URL 캡처
  - [x] 쿠키 지속성: /data/sns_cookies/naver_cookies.json
  - [x] 스크린샷 캡처 (발행 완료 페이지)
  - [x] 안티봇: navigator.webdriver=false, disable-blink-features=AutomationControlled

- [x] Task 7: Tistory Publisher (API 기반) (AC: #6, #12)
  - [x] `packages/server/src/lib/sns-publishers/tistory-publisher.ts`
  - [x] Tistory Open API: POST /apis/post/write (blogName, title, content, tag, visibility)
  - [x] access_token 인증
  - [x] HTML 본문 지원 + 태그(hashtags → 쉼표 구분) + 공개(3)/보호(1)/비공개(0)

- [x] Task 8: Rate Limiter 서비스 (AC: #9)
  - [x] `packages/server/src/lib/sns-publishers/rate-limiter.ts`
  - [x] 인메모리 슬라이딩 윈도우 카운터 (플랫폼별)
  - [x] canPublish(platform) → boolean
  - [x] recordPublish(platform) → void
  - [x] getWaitTime(platform) → number (ms)
  - [x] 설정: { instagram: 25/hr, twitter: 100/hr, facebook: 200/hr, naver_blog: 5/hr, tistory: 10/hr }

- [x] Task 9: PublishEngine — 통합 발행 엔진 (AC: #1, #7, #9, #12)
  - [x] `packages/server/src/lib/sns-publishers/publish-engine.ts`
  - [x] publisherRegistry: Map<platform, PlatformPublisher>
  - [x] publishContent(contentId): snsContents 조회 → snsAccount credentials 복호화 → rate limit 확인 → publisher.publish() → 결과 DB 반영
  - [x] 재시도 로직: 실패 시 metadata.retryCount++ 기록, 3회 초과 시 최종 failed 처리
  - [x] credential 복호화: 기존 credential-vault의 decrypt 함수 사용

- [x] Task 10: 기존 sns-publisher.ts 교체 + 라우트 업데이트 (AC: #11)
  - [x] `packages/server/src/lib/sns-publisher.ts` — publishContent()를 PublishEngine으로 교체
  - [x] 발행 결과 API: GET /api/workspace/sns/:id/publish-result
  - [x] 재발행 API: POST /api/workspace/sns/:id/retry-publish (failed → 재시도)

## Dev Notes

### v1 참고 파일 (필수)

| v1 파일 | v2 포트 대상 | 핵심 기능 |
|---------|-------------|----------|
| `/home/ubuntu/CORTHEX_HQ/src/tools/sns/base_publisher.py` | types.ts | Publisher 인터페이스 정의 |
| `/home/ubuntu/CORTHEX_HQ/src/tools/sns/browser_utils.py` | naver-blog-publisher.ts | Selenium 브라우저 관리, 안티봇 설정, 쿠키 관리 |
| `/home/ubuntu/CORTHEX_HQ/src/tools/sns/naver_blog_publisher.py` | naver-blog-publisher.ts | SmartEditor HTML 주입, 네이버 로그인, 발행 |
| `/home/ubuntu/CORTHEX_HQ/src/tools/sns/tistory_publisher.py` | tistory-publisher.ts | TinyMCE 에디터, 카카오 로그인 (v1은 Selenium, v2는 API) |
| `/home/ubuntu/CORTHEX_HQ/src/tools/sns/instagram_publisher.py` | instagram-publisher.ts | Graph API v21.0, 미디어 컨테이너, carousel |
| `/home/ubuntu/CORTHEX_HQ/src/tools/sns/sns_manager.py` | publish-engine.ts | 발행 큐, 승인 플로우, 에러 핸들링 |
| `/home/ubuntu/CORTHEX_HQ/src/tools/sns/oauth_manager.py` | (참고) | OAuth 토큰 관리 패턴 |

### v1 안티봇 패턴 (Naver Blog Selenium)

```python
# v1 browser_utils.py — 반드시 포트할 설정
options.add_argument('--disable-blink-features=AutomationControlled')
driver.execute_cdp_cmd('Page.addScriptToEvaluateOnNewDocument', {
    'source': 'Object.defineProperty(navigator, "webdriver", {get: () => false})'
})
# 쿠키 persistence: pickle.dump(cookies, f) → v2는 JSON 파일 사용
# 랜덤 딜레이: time.sleep(random.uniform(1, 3))
```

### v1 Instagram Graph API 패턴

```python
# v1 instagram_publisher.py — 핵심 로직
# 1. 미디어 컨테이너 생성
response = requests.post(f'https://graph.instagram.com/v21.0/{user_id}/media',
    data={'image_url': url, 'caption': caption, 'access_token': token})
# 2. 발행
publish_response = requests.post(f'https://graph.instagram.com/v21.0/{user_id}/media_publish',
    data={'creation_id': container_id, 'access_token': token})
# 3. permalink 조회
permalink = requests.get(f'https://graph.instagram.com/v21.0/{media_id}?fields=permalink')
```

### v1 Naver Blog Selenium 패턴

```python
# 네이버 로그인 → SmartEditor 본문 주입
driver.get(f'https://blog.naver.com/{blog_id}/postwrite')
# 제목: JavaScript로 직접 값 설정
driver.execute_script("document.querySelector('.se-title-input').textContent = title")
# 본문: SmartEditor iframe 내 HTML 주입
driver.execute_script("document.querySelector('.se-component-content').innerHTML = html_body")
# 태그: 입력 필드에 텍스트 + Enter 키
tag_input.send_keys(tag + Keys.ENTER)
# 발행: '발행' 버튼 클릭
driver.find_element(By.CSS_SELECTOR, '.publish_btn__m9KHH').click()
```

### 도구/서비스 패턴 (반드시 준수)

```typescript
// 기존 credential vault 사용
import { decryptCredential } from '../../services/credential-vault'

// API 응답 패턴
return c.json({ success: true, data: result })
return c.json({ success: false, error: { code: 'SNS_PUBLISH_001', message: '...' } })

// 기존 publishContent 호출 경로: sns.ts:634 → sns-publisher.ts:66
// 이 경로를 새 PublishEngine으로 교체
```

### DB 마이그레이션 주의사항

```sql
-- PostgreSQL에서 enum 값 추가는 ALTER TYPE ... ADD VALUE
-- 트랜잭션 안에서 실행 불가 (Drizzle 마이그레이션은 자동 트랜잭션)
-- DO $$ BEGIN ... EXCEPTION ... END $$ 블록 사용 권장

ALTER TYPE sns_platform ADD VALUE IF NOT EXISTS 'twitter';
ALTER TYPE sns_platform ADD VALUE IF NOT EXISTS 'facebook';
ALTER TYPE sns_platform ADD VALUE IF NOT EXISTS 'naver_blog';
```

### Selenium WebDriver (Node.js)

- 라이브러리: `selenium-webdriver` (npm)
- ChromeDriver: 시스템 설치 chromedriver 사용 (ARM 서버 호환)
- headless 설정: `--headless=new` (Chrome 109+)
- v1은 Python selenium, v2는 Node.js selenium-webdriver로 포트

### 기존 코드 참고

- `packages/server/src/lib/sns-publisher.ts` — 현재 STUB (이 스토리에서 실제 구현으로 교체)
- `packages/server/src/routes/workspace/sns.ts` — 발행 라우트 (publishContent() 호출 지점)
- `packages/server/src/services/credential-vault.ts` — AES-256-GCM 암복호화
- `packages/server/src/db/schema.ts:14` — snsPlatformEnum 정의
- `packages/server/src/db/schema.ts:444` — snsAccounts 테이블 (credentials 컬럼)

### 12-1, 12-2 스토리 인텔리전스

- **12-1**: SNS 콘텐츠 관리 API 완료 (974줄, 라우트, 생성/승인/반려/발행/A/B 테스트)
  - publishContent() 스텁 호출 경로 이미 존재 (sns.ts:634-683)
  - snsAccounts 테이블 존재 (credentials 컬럼 = AES-256-GCM)
  - snsContents.metadata jsonb 필드 존재 (retryCount, screenshot 저장 가능)
- **12-2**: 마케팅 도구 3종 (hashtag_generator, content_calendar, engagement_analyzer) — 103 테스트
  - 도구 시스템, 라우트 수정 불필요 — publisher 시스템만 작업

### v1 대비 v2 변경점

| 항목 | v1 | v2 |
|------|-----|-----|
| 언어 | Python (selenium) | TypeScript (selenium-webdriver) |
| 플랫폼 수 | 4개 (IG, Tistory, Naver, Daum) | 5개 (IG, Twitter, Facebook, Naver, Tistory) |
| Tistory | Selenium (카카오 로그인) | API (Open API) |
| Twitter/Facebook | 미구현 | API 기반 신규 |
| 재시도 | 없음 | 지수 백오프 3회 |
| Rate Limiting | 랜덤 딜레이만 | 슬라이딩 윈도우 카운터 |
| 쿠키 저장 | Python pickle | JSON 파일 |
| 스크린샷 | 없음 | Selenium 발행 시 캡처 |

### Project Structure Notes

- 새 디렉토리: `packages/server/src/lib/sns-publishers/` (publisher 모듈 격리)
- 기존 `packages/server/src/lib/sns-publisher.ts` → 새 publish-engine으로 교체
- 마이그레이션: `packages/server/src/db/migrations/0038_sns-platform-enum-extension.sql`
- 테스트: `packages/server/src/__tests__/unit/sns-publishers.test.ts`
- 파일명: kebab-case (instagram-publisher.ts, twitter-publisher.ts 등)

### References

- [Source: packages/server/src/lib/sns-publisher.ts] — 현재 STUB (교체 대상)
- [Source: packages/server/src/routes/workspace/sns.ts:620-683] — 발행 라우트
- [Source: packages/server/src/db/schema.ts:14] — snsPlatformEnum
- [Source: packages/server/src/db/schema.ts:444-457] — snsAccounts 테이블
- [Source: packages/server/src/db/schema.ts:460-483] — snsContents 테이블
- [Source: /home/ubuntu/CORTHEX_HQ/src/tools/sns/] — v1 전체 SNS 시스템
- [Source: _bmad-output/planning-artifacts/epics.md#Epic12] — Epic 12 스펙
- [Source: _bmad-output/planning-artifacts/prd.md:898] — FR65 요구사항
- [Source: _bmad-output/implementation-artifacts/12-1-sns-content-management-api.md] — Story 12-1
- [Source: _bmad-output/implementation-artifacts/12-2-marketing-tools-3-implementation.md] — Story 12-2

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- 2026-03-08: 10개 Task 전부 구현 완료, 56 테스트 전부 통과
- 2026-03-08: TEA 완료 — 58 추가 엣지케이스 테스트 (총 114)

### Completion Notes List

- DB 마이그레이션: snsPlatformEnum에 twitter, facebook, naver_blog 추가 (0039_sns-platform-enum-extension.sql)
- PlatformPublisher 인터페이스: publish(input, credentials) → PublishResult 공통 계약
- Instagram Publisher: Graph API v21.0, 미디어 컨테이너 → 발행 → permalink, 에러코드 9007 재시도
- Twitter/X Publisher: OAuth 1.0a HMAC-SHA1 서명, API v2, 280자 초과 시 자동 스레드 분할
- Facebook Publisher: Graph API, feed/photos 엔드포인트 자동 선택 (이미지 유무)
- Naver Blog Publisher: Selenium WebDriver, 안티봇 CDP override, SmartEditor HTML 주입, 쿠키 지속성, 스크린샷 캡처
- Tistory Publisher: Open API POST /apis/post/write, HTML 본문 + 쉼표 구분 태그 + 공개설정
- Rate Limiter: 인메모리 슬라이딩 윈도우, 플랫폼별 한도 (IG:25, TW:100, FB:200, NB:5, TS:10/hr)
- PublishEngine: 6 publisher 레지스트리, credential 복호화, rate limit, 3회 지수 백오프 재시도, DB 상태 반영
- 기존 sns-publisher.ts stub 교체: 실제 publisher 위임, 하위 호환 유지
- SNS 라우트: engine-publish, retry-publish, publish-result 3개 엔드포인트 추가
- 56개 단위 테스트 작성, 0 실패

### Change Log

- 2026-03-08: dev-story 완료 — 5개 플랫폼 publisher + 통합 엔진 + rate limiter + 56 테스트
- 2026-03-08: TEA 완료 — 58 추가 엣지케이스 테스트 (총 114)

### File List

- `packages/server/src/db/migrations/0039_sns-platform-enum-extension.sql` (신규, DB 마이그레이션)
- `packages/server/src/db/schema.ts` (수정, snsPlatformEnum 확장)
- `packages/server/src/lib/sns-publishers/types.ts` (신규, PlatformPublisher 인터페이스)
- `packages/server/src/lib/sns-publishers/instagram-publisher.ts` (신규, Instagram Graph API)
- `packages/server/src/lib/sns-publishers/twitter-publisher.ts` (신규, Twitter API v2 + OAuth 1.0a)
- `packages/server/src/lib/sns-publishers/facebook-publisher.ts` (신규, Facebook Graph API)
- `packages/server/src/lib/sns-publishers/naver-blog-publisher.ts` (신규, Selenium WebDriver)
- `packages/server/src/lib/sns-publishers/tistory-publisher.ts` (신규, Tistory Open API)
- `packages/server/src/lib/sns-publishers/rate-limiter.ts` (신규, 슬라이딩 윈도우 Rate Limiter)
- `packages/server/src/lib/sns-publishers/publish-engine.ts` (신규, 통합 발행 엔진)
- `packages/server/src/lib/sns-publishers/index.ts` (신규, 모듈 re-export)
- `packages/server/src/lib/sns-publisher.ts` (수정, stub → 실제 publisher 위임)
- `packages/server/src/routes/workspace/sns.ts` (수정, 6플랫폼 enum + 3개 엔드포인트 추가)
- `packages/server/src/__tests__/unit/sns-publishers.test.ts` (신규, 56 테스트)
- `packages/server/src/__tests__/unit/sns-publishers-tea.test.ts` (신규, TEA 58 테스트)
- `_bmad-output/test-artifacts/12-3-tea-summary.md` (신규, TEA 요약)
