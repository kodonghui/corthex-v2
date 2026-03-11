# 02. 마케팅 콘텐츠 파이프라인 — 플랫폼별 도구 & 워크플로우

> 작성일: 2026-03-11 | BMAD 참조용 기술 보고서

---

## 1. 플랫폼별 API 현황 요약

| 플랫폼 | API 상태 | 게시 가능? | 인증 방식 | 비용 | 난이도 |
|--------|---------|----------|----------|------|--------|
| **Instagram** | Graph API (활성) | Yes (이미지/캐러셀/릴스/스토리) | OAuth 2.0 (Facebook Business) | 무료 | 중 |
| **Tistory** | **API 폐쇄 (2024-02)** | 브라우저 자동화만 가능 | N/A | 무료 | 상 |
| **X (Twitter)** | v2 API (활성) | Yes (텍스트/이미지/스레드) | OAuth 2.0 | $200+/월 | 하 |
| **다음카페** | 읽기 전용 (게시 불가) | 브라우저 자동화만 가능 | N/A | 무료 | 상 |
| **YouTube** | Data API v3 (활성) | Yes (영상/Shorts/썸네일) | OAuth 2.0 | 무료 (쿼터제) | 중 |

---

## 2. Instagram 도구

### API 개요
- **엔드포인트**: `POST /{ig-user-id}/media` → `POST /{ig-user-id}/media_publish`
- **필수 조건**: Facebook App + Instagram Business/Creator 계정
- **일일 제한**: 25개 게시물/일 (이미지+영상+릴스+캐러셀 합산)

### 게시 가능 콘텐츠

| 콘텐츠 유형 | API 지원 | 제약 |
|------------|---------|------|
| 단일 이미지 | Yes | JPEG, 8MB 이하 |
| 캐러셀 (카드뉴스) | Yes | 최대 10장, 1080x1080px 권장 |
| Reels | Yes | `media_type=REELS`, 최대 15분 |
| Stories | Yes | 2023년부터 지원 |

### CORTHEX v2 도구 핸들러 설계

```typescript
// publish-instagram.ts (기존 v2에 이미 존재 — 확장 필요)
export const publishInstagramHandler: ToolHandler = {
  name: 'publish_instagram',
  description: 'Instagram에 이미지, 캐러셀(카드뉴스), 릴스를 게시합니다',
  inputSchema: {
    properties: {
      type: { type: 'string', enum: ['image', 'carousel', 'reel'] },
      // 단일 이미지
      imageUrl: { type: 'string', description: '이미지 URL (공개 접근 가능)' },
      caption: { type: 'string', description: '게시글 텍스트 + 해시태그' },
      // 캐러셀 (카드뉴스)
      carouselItems: {
        type: 'array',
        items: { type: 'object', properties: { imageUrl: { type: 'string' } } },
        description: '캐러셀 이미지 URL 배열 (최대 10개)',
      },
      // 릴스
      videoUrl: { type: 'string', description: '릴스 영상 URL' },
      coverUrl: { type: 'string', description: '커버 이미지 URL' },
      shareToFeed: { type: 'boolean', default: true },
    },
    required: ['type', 'caption'],
  },
  async execute(input, ctx) {
    const token = ctx.credentials.instagramToken;
    const userId = ctx.credentials.instagramUserId;

    if (input.type === 'carousel') {
      // Step 1: 각 아이템 컨테이너 생성
      const containerIds = await Promise.all(
        input.carouselItems.map(item =>
          createMediaContainer(userId, token, { image_url: item.imageUrl, is_carousel_item: true })
        )
      );
      // Step 2: 캐러셀 컨테이너 생성
      const carouselId = await createCarouselContainer(userId, token, containerIds, input.caption);
      // Step 3: 게시
      const result = await publishMedia(userId, token, carouselId);
      return { success: true, postId: result.id };
    }
    // ... image, reel 처리
  },
};
```

### 인사이트 도구 (기존 v2에 존재)
- `get_instagram_insights` — 이미 구현됨
- 확장 필요: 게시물별 도달률, 저장 수, 공유 수 추적

---

## 3. Tistory 도구

### 핵심: API가 2024년 2월에 완전 폐쇄됨

공식 Tistory Open API는 **더 이상 작동하지 않습니다**.

### 유일한 대안: 브라우저 자동화 (Playwright)

```typescript
// publish-tistory.ts — Playwright 기반 브라우저 자동화
import { chromium } from 'playwright';

export const publishTistoryHandler: ToolHandler = {
  name: 'publish_tistory',
  description: 'Tistory 블로그에 글을 게시합니다 (브라우저 자동화)',
  inputSchema: {
    properties: {
      title: { type: 'string' },
      content: { type: 'string', description: 'HTML 형식의 게시글 내용' },
      category: { type: 'string' },
      tags: { type: 'array', items: { type: 'string' } },
      visibility: { type: 'string', enum: ['public', 'private'], default: 'public' },
    },
    required: ['title', 'content'],
  },
  async execute(input, ctx) {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // 1. 카카오 로그인
    await page.goto('https://www.tistory.com/auth/login');
    await page.click('a.btn_login_kakao');
    await page.fill('#loginId--1', ctx.credentials.kakaoEmail);
    await page.fill('#password--2', ctx.credentials.kakaoPassword);
    await page.click('button[type=submit]');

    // 2. 글쓰기 페이지 이동
    await page.goto(`https://${ctx.credentials.tistoryBlogName}.tistory.com/manage/newpost`);

    // 3. 제목 + 본문 입력
    await page.fill('#post-title-inp', input.title);
    // HTML 모드로 전환 후 본문 입력
    await page.evaluate((html) => {
      // 에디터에 HTML 삽입
      document.querySelector('.mce-edit-area iframe')
        ?.contentDocument?.body?.innerHTML = html;
    }, input.content);

    // 4. 태그 입력
    for (const tag of input.tags || []) {
      await page.fill('#tagText', tag);
      await page.keyboard.press('Enter');
    }

    // 5. 발행
    await page.click('#publish-layer-btn');
    await page.click('#publish-btn');

    await browser.close();
    return { success: true, blog: ctx.credentials.tistoryBlogName };
  },
};
```

**주의사항:**
- Tistory 이용약관 위반 가능성 있음
- CAPTCHA 대응 필요할 수 있음
- 로그인 세션 관리 (쿠키 저장/재사용) 필요
- **대안 고려**: Tistory 대신 자체 블로그(Ghost, WordPress) 또는 Notion 퍼블리시 검토

---

## 4. X (Twitter) 도구

### API 가격

| 티어 | 월 비용 | 읽기 | 쓰기 |
|------|--------|------|------|
| Free | $0 | 0 | 1,500건/월 |
| **Basic** | **$200/월** | 15,000/월 | **50,000/월** |
| Pro | $5,000/월 | 1M/월 | 300,000/월 |

**추천: Basic ($200/월)** — LeetMaster 마케팅에 충분

### npm 패키지

| 패키지 | Stars | 설치 |
|--------|-------|------|
| `twitter-api-v2` | ~1,500 | `npm i twitter-api-v2` |

### CORTHEX v2 도구 핸들러

```typescript
// publish-x.ts
import { TwitterApi } from 'twitter-api-v2';

export const publishXHandler: ToolHandler = {
  name: 'publish_x',
  description: 'X(Twitter)에 트윗, 이미지, 스레드를 게시합니다',
  inputSchema: {
    properties: {
      type: { type: 'string', enum: ['tweet', 'thread', 'image_tweet'] },
      text: { type: 'string', description: '트윗 텍스트 (280자 이내)' },
      // 스레드
      threadTexts: { type: 'array', items: { type: 'string' }, description: '스레드 트윗 배열' },
      // 이미지
      imageUrls: { type: 'array', items: { type: 'string' }, description: '첨부 이미지 URL (최대 4개)' },
    },
    required: ['type', 'text'],
  },
  async execute(input, ctx) {
    const client = new TwitterApi({
      appKey: ctx.credentials.xApiKey,
      appSecret: ctx.credentials.xApiSecret,
      accessToken: ctx.credentials.xAccessToken,
      accessSecret: ctx.credentials.xAccessSecret,
    });

    if (input.type === 'thread') {
      const tweets = input.threadTexts.map(text => ({ text }));
      const result = await client.v2.tweetThread(tweets);
      return { success: true, threadId: result[0].data.id, count: result.length };
    }

    if (input.type === 'image_tweet') {
      // 이미지 업로드
      const mediaIds = await Promise.all(
        input.imageUrls.map(url => client.v1.uploadMedia(url))
      );
      const result = await client.v2.tweet({
        text: input.text,
        media: { media_ids: mediaIds },
      });
      return { success: true, tweetId: result.data.id };
    }

    // 일반 트윗
    const result = await client.v2.tweet(input.text);
    return { success: true, tweetId: result.data.id };
  },
};
```

---

## 5. 다음카페 도구

### API 현황: 게시 API 없음 (읽기 전용)

Kakao Developers에서 제공하는 건 **Daum 검색 API**뿐입니다.
카페 글 작성은 **브라우저 자동화**로만 가능합니다.

```typescript
// publish-daum-cafe.ts — Playwright 기반
export const publishDaumCafeHandler: ToolHandler = {
  name: 'publish_daum_cafe',
  description: '다음카페에 글을 게시합니다 (브라우저 자동화)',
  inputSchema: {
    properties: {
      cafeUrl: { type: 'string', description: '카페 URL (예: https://cafe.daum.net/leetmaster)' },
      boardId: { type: 'string', description: '게시판 ID' },
      title: { type: 'string' },
      content: { type: 'string', description: 'HTML 형식' },
      images: { type: 'array', items: { type: 'string' }, description: '첨부 이미지 경로' },
    },
    required: ['cafeUrl', 'title', 'content'],
  },
  async execute(input, ctx) {
    // Playwright로 카카오 로그인 → 카페 글쓰기 페이지 → 제목/본문/이미지 입력 → 등록
    // Tistory와 유사한 패턴
  },
};
```

**주의**: 다음카페 자동화는 TOS 위반 위험이 높음. 수동 게시 또는 카페 운영자 도구 활용 권장.

---

## 6. YouTube 도구

### API: YouTube Data API v3

| 작업 | 쿼터 비용 (단위) |
|------|-----------------|
| 읽기 (list) | 1 |
| 쓰기 (update/delete) | 50 |
| 검색 | 100 |
| **영상 업로드** | **1,600** |
| 일일 기본 쿼터 | **10,000** |

→ 기본 쿼터로 **하루 ~6개 영상** 업로드 가능. 쿼터 증량 신청 가능.

### npm 패키지

| 패키지 | 버전 | 설치 |
|--------|------|------|
| `googleapis` (공식) | 171.4.0 | `npm i googleapis` |
| `@googleapis/youtube` | 31.0.0 | `npm i @googleapis/youtube` |

### CORTHEX v2 도구 핸들러

```typescript
// publish-youtube.ts
import { google } from 'googleapis';

export const publishYoutubeHandler: ToolHandler = {
  name: 'publish_youtube',
  description: 'YouTube에 영상을 업로드합니다 (Shorts 포함)',
  inputSchema: {
    properties: {
      videoPath: { type: 'string', description: '업로드할 영상 파일 경로' },
      title: { type: 'string', description: '영상 제목' },
      description: { type: 'string' },
      tags: { type: 'array', items: { type: 'string' } },
      categoryId: { type: 'string', default: '22', description: 'YouTube 카테고리 ID' },
      privacy: { type: 'string', enum: ['public', 'unlisted', 'private'], default: 'public' },
      isShort: { type: 'boolean', default: false, description: 'Shorts 여부 (60초 이하, 9:16)' },
      thumbnailPath: { type: 'string', description: '커스텀 썸네일 이미지 경로' },
    },
    required: ['videoPath', 'title'],
  },
  async execute(input, ctx) {
    const auth = new google.auth.OAuth2(
      ctx.credentials.googleClientId,
      ctx.credentials.googleClientSecret
    );
    auth.setCredentials({ refresh_token: ctx.credentials.googleRefreshToken });

    const youtube = google.youtube({ version: 'v3', auth });

    // Shorts는 제목에 #Shorts 추가
    const title = input.isShort ? `${input.title} #Shorts` : input.title;

    const response = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title,
          description: input.description,
          tags: input.tags,
          categoryId: input.categoryId,
        },
        status: { privacyStatus: input.privacy },
      },
      media: { body: createReadStream(input.videoPath) },
    });

    // 썸네일 업로드
    if (input.thumbnailPath) {
      await youtube.thumbnails.set({
        videoId: response.data.id,
        media: { body: createReadStream(input.thumbnailPath) },
      });
    }

    return {
      success: true,
      videoId: response.data.id,
      url: `https://youtube.com/watch?v=${response.data.id}`,
    };
  },
};
```

---

## 7. 콘텐츠 제작 도구 모음

### 7.1 AI 이미지 생성

| 서비스 | 모델 | API 있음? | 가격/이미지 | 한국어 이해 | 추천 |
|--------|------|----------|------------|------------|------|
| **OpenAI** | GPT Image 1.5 | Yes | $0.005~$0.20 | Yes | 텍스트 정확도 95% |
| **Black Forest Labs** | Flux 2 Pro | Yes | $0.04 | 제한적 | 품질 대비 가성비 |
| **Stability AI** | SD 3.5 | Yes | $0.04~$0.08 | 제한적 | 오픈소스 옵션 |
| **Replicate** | 다양한 모델 호스팅 | Yes | 종량제 (GPU초) | 모델별 | 모델 선택 자유 |
| **Midjourney** | v6 | **NO API** | N/A | — | 프로그래밍 불가 |

**추천**: OpenAI GPT Image (텍스트 포함 이미지) + Flux 2 Pro (예술적 이미지)

### 7.2 카드뉴스 생성

| 도구 | GitHub Stars | 설치 | 용도 |
|------|-------------|------|------|
| **Satori** (Vercel) | ~11,000 | `npm i satori` | HTML/CSS → SVG → PNG (템플릿 기반) |
| `@resvg/resvg-js` | — | `npm i @resvg/resvg-js` | SVG → PNG 변환 (Rust, 고속) |
| **Sharp** | ~30,000 | `npm i sharp` | 이미지 합성, 리사이즈, 텍스트 오버레이 |

**카드뉴스 파이프라인:**
```
Satori (JSX 템플릿 → SVG) → resvg (SVG → PNG) → Sharp (리사이즈/최적화)
```

```typescript
// card-news-generator.ts — 카드뉴스 생성 예시
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

async function generateCardNews(slides: CardSlide[]): Promise<Buffer[]> {
  const font = await readFile('./fonts/Pretendard-Bold.otf');

  return Promise.all(slides.map(async (slide) => {
    const svg = await satori(
      // JSX 템플릿
      {
        type: 'div',
        props: {
          style: {
            width: 1080, height: 1080,
            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center',
            padding: 60, color: 'white', fontFamily: 'Pretendard',
          },
          children: [
            { type: 'h1', props: { style: { fontSize: 48, marginBottom: 20 }, children: slide.title } },
            { type: 'p', props: { style: { fontSize: 28, opacity: 0.9 }, children: slide.body } },
          ],
        },
      },
      {
        width: 1080, height: 1080,
        fonts: [{ name: 'Pretendard', data: font, weight: 700, style: 'normal' }],
      }
    );

    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1080 } });
    return resvg.render().asPng();
  }));
}
```

### 7.3 영상 제작

| 도구 | Stars | 설치 | 용도 | 비용 |
|------|-------|------|------|------|
| **Remotion** | ~38,000 | `npm i remotion` | React 기반 프로그래밍 영상 제작 | 개인 무료, 회사 $25/월 |
| **fluent-ffmpeg** | ~8,000 | `npm i fluent-ffmpeg` | FFmpeg 래퍼 (이미지→영상, 인코딩) | 무료 |
| `ffmpeg-static` | — | `npm i ffmpeg-static` | FFmpeg 바이너리 번들 | 무료 |

**Remotion이 최적**: React 컴포넌트를 프레임 단위로 렌더링 → MP4/WebM 출력

### 7.4 AI 영상 생성

| 서비스 | 모델 | 가격 (~5초) | 특징 |
|--------|------|------------|------|
| **Replicate** | Kling 3.0 Omni | ~$0.029/초 | 가성비 최고, 15초 시네마틱 |
| **Runway** | Gen-4.5 | ~$0.31 | 최고 품질 |
| **Google** | Veo 3.1 | ~$0.10/초 | Vertex AI 경유 |
| **OpenAI** | Sora 2 | ~$0.31 | Runway 경쟁 수준 |

**추천**: Replicate + Kling (가성비) 또는 Runway (품질 우선)

### 7.5 음성 합성 (TTS)

| 서비스 | 패키지 | 가격 | 한국어 | 품질 |
|--------|--------|------|--------|------|
| **ElevenLabs** | `elevenlabs` | $0.03/1K자 | Yes | 최고 (감정 표현) |
| **Google Cloud TTS** | `@google-cloud/text-to-speech` | $4/1M자 | Yes | 기업급 |
| **OpenAI TTS** | `openai` SDK 내장 | $15/1M자 | Yes | 양호 |

**추천**: ElevenLabs (품질) 또는 Google Cloud TTS (가성비)

---

## 8. 마케팅팀 에이전트 구성 제안

### 팀 구성: 3~4명의 AI 에이전트

| 에이전트 | 역할 | 주요 도구 |
|---------|------|----------|
| **콘텐츠 기획자** | 트렌드 분석, 콘텐츠 캘린더 관리, 주제 선정 | search_web, search_news, content_calendar, hashtag_generator |
| **크리에이터** | 글 작성, 이미지/카드뉴스 생성, 영상 제작 | generate_image, generate_card_news, generate_video, text_to_speech |
| **퍼블리셔** | 플랫폼별 포맷 변환 + 게시 | publish_instagram, publish_x, publish_youtube, publish_tistory, publish_daum_cafe |
| **분석가** (선택) | 게시 후 성과 추적, 보고서 생성 | get_instagram_insights, engagement_analyzer, generate_pdf |

### 왜 여러 에이전트인가?

1. **단일 에이전트의 한계**: 컨텍스트 윈도우 내에서 "기획→제작→게시→분석" 전체를 처리하면 품질 저하
2. **핸드오프 패턴 활용**: CORTHEX의 `call_agent` 도구로 자연스럽게 작업 전달
3. **병렬 처리**: 크리에이터가 이미지 만드는 동안 퍼블리셔가 이전 콘텐츠 게시
4. **전문성 분리**: 각 에이전트의 Soul 템플릿에 전문 지식 집중

### 워크플로우 예시: "LeetMaster 신기능 홍보"

```
[콘텐츠 기획자]
  → "LeetMaster 면접 대비 AI 코칭 신기능" 주제 선정
  → 플랫폼별 콘텐츠 전략 수립 (IG: 카드뉴스, X: 스레드, YT: 데모 영상)
  → call_agent → 크리에이터

[크리에이터]
  → 카드뉴스 5장 생성 (Satori + Flux 이미지)
  → X 스레드 텍스트 5개 작성
  → 데모 영상 스크립트 작성 + TTS 녹음 + Remotion 영상 생성
  → call_agent → 퍼블리셔

[퍼블리셔]
  → Instagram: 카드뉴스 캐러셀 게시 (1080x1080)
  → X: 스레드 게시 + 첫 트윗에 카드뉴스 이미지 첨부
  → YouTube: 데모 영상 업로드 + 썸네일 설정
  → Tistory: 블로그 포스트 게시 (긴 글 + 이미지)
  → 다음카페: 커뮤니티 홍보글 게시
  → call_agent → 분석가 (24시간 후)

[분석가]
  → 각 플랫폼 성과 수집 (도달, 참여, 클릭)
  → 보고서 생성 → PDF → 이메일/Notion 발행
```

---

## 9. 플랫폼별 이미지 규격

| 플랫폼 | 콘텐츠 | 해상도 | 비율 |
|--------|--------|--------|------|
| Instagram 피드 | 정사각형 | 1080x1080 | 1:1 |
| Instagram 릴스 | 세로 | 1080x1920 | 9:16 |
| Instagram 스토리 | 세로 | 1080x1920 | 9:16 |
| X 이미지 | 가로 | 1200x675 | 16:9 |
| YouTube 썸네일 | 가로 | 1280x720 | 16:9 |
| YouTube Shorts | 세로 | 1080x1920 | 9:16 |
| Tistory 본문 | 가로 | 860px 폭 | 자유 |
| 다음카페 본문 | 가로 | 720px 폭 | 자유 |

### Sharp 리사이즈 유틸리티

```typescript
// utils/image-resizer.ts
import sharp from 'sharp';

const PLATFORM_SPECS = {
  instagram_feed: { width: 1080, height: 1080 },
  instagram_reel: { width: 1080, height: 1920 },
  x_image: { width: 1200, height: 675 },
  youtube_thumbnail: { width: 1280, height: 720 },
  youtube_short: { width: 1080, height: 1920 },
} as const;

export async function resizeForPlatform(
  inputBuffer: Buffer,
  platform: keyof typeof PLATFORM_SPECS
): Promise<Buffer> {
  const spec = PLATFORM_SPECS[platform];
  return sharp(inputBuffer)
    .resize(spec.width, spec.height, { fit: 'cover' })
    .jpeg({ quality: 90 })
    .toBuffer();
}
```

---

## 10. 필요 패키지 총정리

```json
{
  "dependencies": {
    "twitter-api-v2": "^1.29.0",
    "googleapis": "^171.0.0",
    "replicate": "^1.0.0",
    "satori": "^0.12.0",
    "@resvg/resvg-js": "^2.6.0",
    "sharp": "^0.33.0",
    "remotion": "^4.0.0",
    "fluent-ffmpeg": "^2.1.0",
    "ffmpeg-static": "^5.2.0",
    "elevenlabs": "^1.0.0",
    "playwright": "^1.48.0"
  }
}
```

### 월 운영 비용 예상

| 항목 | 비용 | 비고 |
|------|------|------|
| X API Basic | $200/월 | 50,000 트윗/월 |
| AI 이미지 생성 | ~$20/월 | GPT Image 400장 기준 |
| AI 영상 생성 | ~$50/월 | Kling 3.0, 30개 영상 기준 |
| TTS (ElevenLabs) | ~$22/월 | Starter 플랜 |
| YouTube/Instagram | 무료 | API 자체는 무료 |
| **합계** | **~$292/월** | |

---

## 11. 참고 소스

| 리소스 | URL |
|--------|-----|
| Instagram Graph API | https://developers.facebook.com/docs/instagram-platform/ |
| Tistory API 폐쇄 공지 | https://tistory.github.io/document-tistory-apis/ |
| twitter-api-v2 | https://github.com/PLhery/node-twitter-api-v2 |
| YouTube Data API v3 | https://developers.google.com/youtube/v3 |
| Replicate | https://replicate.com |
| Satori | https://github.com/vercel/satori |
| Sharp | https://www.npmjs.com/package/sharp |
| Remotion | https://github.com/remotion-dev/remotion |
| ElevenLabs JS SDK | https://github.com/elevenlabs/elevenlabs-js |
| Flux 2 | https://github.com/black-forest-labs/flux |
