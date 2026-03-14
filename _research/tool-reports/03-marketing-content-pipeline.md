# 도구 보고서 #3: 마케팅 콘텐츠 파이프라인
> CORTHEX v2 마케팅팀 직원(AI Agent)용 콘텐츠 제작·배포 시스템
> 작성일: 2026-03-11 | BMAD 참고용

---

## 1. 개요

LeetMaster 마케팅을 위해 CORTHEX v2 AI 직원이 **콘텐츠를 기획→제작→배포**하는 전체 파이프라인 설계.

### 대상 플랫폼
| 플랫폼 | 콘텐츠 유형 | API 상태 |
|--------|------------|----------|
| **Instagram** | 피드, 카루셀(카드뉴스), 릴스 | Graph API ✅ (비즈니스 계정만) |
| **Tistory** | 블로그 글 (텍스트+이미지) | 공식 API ✅ |
| **X (Twitter)** | 트윗, 스레드, 이미지 | API v2 ✅ (유료 플랜) |
| **다음카페** | 게시글 (텍스트+이미지) | 공식 API ❌ (Selenium 필요) |
| **YouTube** | 동영상, 쇼츠, 썸네일 | Data API v3 ✅ |

---

## 2. 마케팅팀 구성 제안

### 2.1 AI 직원 구성 (권장)

```
마케팅 부서장 (매니저 티어)
  ├── 콘텐츠 기획자 (스페셜리스트)
  │     └── 시장 조사, 주제 선정, 콘텐츠 캘린더 관리
  ├── 카피라이터 (스페셜리스트)
  │     └── 블로그 글, SNS 카피, 해시태그, SEO 최적화
  ├── 비주얼 디자이너 (스페셜리스트)
  │     └── 카드뉴스, 썸네일, 이미지 생성 (AI 이미지 도구 활용)
  ├── 영상 제작자 (스페셜리스트)
  │     └── 릴스/쇼츠 제작, 영상 편집, TTS 나레이션
  └── 퍼블리셔 (워커)
        └── 각 플랫폼별 최적화 + 업로드 실행
```

### 2.2 왜 여러 명이 좋은가
- **병렬 처리**: 기획→카피→디자인→배포를 동시 진행 가능
- **전문성**: 각 에이전트의 Soul을 특화시킬 수 있음
- **핸드오프**: `call_agent` 도구로 자연스럽게 작업 전달
- 예: 부서장이 "이번 주 LeetMaster 프로모션 콘텐츠 만들어" → 기획자가 주제 선정 → 카피라이터에게 핸드오프 → 디자이너에게 핸드오프 → 퍼블리셔가 배포

### 2.3 1인 운영도 가능
- 소규모 초기에는 "마케팅 올라운더" 1명으로 시작
- Soul에 모든 역할 지침 포함
- 단, 영상 제작 등 무거운 작업에서 병목 발생 가능

---

## 3. 콘텐츠별 파이프라인

### 3.1 블로그 글 (Tistory)

```
[기획] 주제 선정 + 키워드 리서치
  ↓
[작성] SEO 최적화 글 작성 (마크다운)
  ↓
[이미지] 대표 이미지 + 본문 이미지 생성
  ↓
[검수] 맞춤법, 팩트체크, SEO 점수
  ↓
[발행] Tistory API로 업로드
  ↓
[공유] X, 다음카페에 링크 공유
```

**필요 도구:**
| 도구 | 용도 | 구현 방식 |
|------|------|----------|
| `search_web` | 키워드 리서치 | 기존 도구 |
| `generate_image` | 대표/본문 이미지 | Replicate API |
| `publish_tistory` | 티스토리 발행 | 신규 개발 |
| `publish_x` | X 공유 | 신규 개발 |

### 3.2 카드뉴스 (Instagram 카루셀)

```
[기획] 주제 + 스토리보드 (5~10장 구성)
  ↓
[카피] 각 장별 핵심 메시지 작성
  ↓
[디자인] 이미지 생성 (일관된 스타일)
  ↓  ← AI 이미지 생성 or HTML→이미지 변환
[조합] 카루셀 이미지 세트 구성
  ↓
[발행] Instagram Graph API로 업로드
  ↓
[공유] 스토리로 재공유 + X에 요약 포스트
```

**필요 도구:**
| 도구 | 용도 | 구현 방식 |
|------|------|----------|
| `generate_card_news` | 카드뉴스 이미지 세트 | Sharp + HTML→이미지 |
| `generate_image` | AI 이미지 생성 | Replicate API (Flux) |
| `publish_instagram` | 인스타 업로드 | 기존 도구 리팩토링 |

### 3.3 릴스/쇼츠 (Instagram + YouTube)

```
[기획] 영상 콘셉트 + 스크립트
  ↓
[스크립트] 나레이션 대본 작성 (15~60초)
  ↓
[나레이션] TTS로 음성 생성
  ↓
[비주얼] AI 이미지/영상 생성
  ↓  ← Replicate (Kling/Runway) or Remotion
[편집] 음성 + 비주얼 + 자막 합성
  ↓  ← FFmpeg or Remotion
[발행] YouTube Data API + Instagram Graph API
  ↓
[공유] X, 다음카페에 링크
```

**필요 도구:**
| 도구 | 용도 | 구현 방식 |
|------|------|----------|
| `text_to_speech` | 나레이션 생성 | 기존 도구 (ElevenLabs) |
| `generate_video` | AI 영상 생성 | Replicate API (신규) |
| `compose_video` | 영상 합성 | Remotion or FFmpeg (신규) |
| `publish_youtube` | 유튜브 업로드 | 신규 개발 |
| `publish_instagram` | 릴스 업로드 | 기존 도구 리팩토링 |

### 3.4 긴 영상 (YouTube)

```
[기획] 영상 기획서 작성 (주제, 타겟, 길이)
  ↓
[스크립트] 전체 대본 작성 (5~15분)
  ↓
[나레이션] TTS 생성 (분할 처리)
  ↓
[비주얼] 씬별 이미지/클립 생성
  ↓  ← Replicate (Kling v2.6: 이미지→영상)
[편집] Remotion으로 프로그래밍 영상 제작
  ↓  ← 트랜지션, 자막, BGM, 인포그래픽
[썸네일] AI 이미지 생성 + 텍스트 오버레이
  ↓
[발행] YouTube Data API v3 업로드
  ↓
[홍보] 쇼츠 하이라이트 클립 자동 생성
```

---

## 4. 플랫폼별 도구 상세

### 4.1 Instagram (`publish_instagram`)

**API**: Meta Instagram Graph API (비즈니스 계정 필수)

**인증**: Facebook App → Instagram Business Account → Long-lived Token

**제약사항:**
- 이미지: 직접 업로드 불가 → **공개 URL 필요** (S3/Cloudflare R2)
- 릴스: 영상 URL 제공 방식
- 카루셀: 최대 10장
- Rate Limit: 25 API calls/hour (게시물 생성)

**NPM 패키지:**
| 패키지 | Stars | 설명 |
|--------|-------|------|
| `instagram-graph-api` | 200+ | 공식 Graph API 래퍼 |
| `instagram-publisher` | 100+ | API 키 없이 게시 (비공식) |
| `instagram-private-api` | 5,000+ | Private API SDK (위험, 계정 밴 가능) |

**추천**: `instagram-graph-api` (공식 API, 안전)

```typescript
// packages/server/src/lib/tool-handlers/builtins/publish-instagram.ts
const publishInstagramSchema = z.object({
  type: z.enum(['image', 'carousel', 'reel']),
  media_urls: z.array(z.string().url()).describe('공개 접근 가능한 미디어 URL'),
  caption: z.string().max(2200),
  hashtags: z.array(z.string()).optional(),
  location_id: z.string().optional(),
})
```

### 4.2 Tistory (`publish_tistory`)

**API**: 공식 Tistory Open API v1

**인증**: Tistory App 등록 → OAuth 2.0 → Access Token

**엔드포인트:**
- `POST /apis/post/write` - 글 작성
- `POST /apis/post/modify` - 글 수정
- `GET /apis/post/list` - 글 목록

**파라미터:**
| 파라미터 | 설명 |
|---------|------|
| `blogName` | 블로그 이름 |
| `title` | 글 제목 |
| `content` | HTML 본문 |
| `visibility` | 0: 비공개, 3: 공개 |
| `category` | 카테고리 ID |
| `tag` | 태그 (쉼표 구분) |
| `published` | 발행 시간 (예약 가능) |

**주의**: content는 **HTML** 형식 → MD를 HTML로 변환 필요 (`marked` 패키지)

```typescript
// packages/server/src/lib/tool-handlers/builtins/publish-tistory.ts
const publishTistorySchema = z.object({
  title: z.string(),
  content_markdown: z.string().describe('마크다운 본문 (HTML로 자동 변환)'),
  visibility: z.enum(['private', 'public']).default('public'),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  scheduled_at: z.string().optional().describe('예약 발행 시간 (YYYY-MM-DD HH:mm)'),
})
```

**Python 라이브러리 참조**: [WooilJeong/tistory](https://github.com/WooilJeong/tistory) (Node.js 직접 구현 필요)

### 4.3 X / Twitter (`publish_x`)

**API**: X API v2 (유료)

**가격:**
| 플랜 | 월 비용 | 트윗/월 | 읽기/월 |
|------|--------|---------|---------|
| Free | $0 | 1,500 | 제한적 |
| Basic | $200 | 3,000 | 10,000 |
| Pro | $5,000 | 300,000 | 1,000,000 |

**NPM 패키지**: `twitter-api-v2` (v1.29.0, 254+ 프로젝트 사용)
- GitHub: [PLhery/node-twitter-api-v2](https://github.com/PLhery/node-twitter-api-v2)
- TypeScript, 풀 타입 지원
- v1.1 + v2 API 모두 지원

**인증**: OAuth 2.0 User Context (게시용)

```typescript
// packages/server/src/lib/tool-handlers/builtins/publish-x.ts
const publishXSchema = z.object({
  text: z.string().max(280),
  media_urls: z.array(z.string().url()).optional(),
  thread: z.array(z.string().max(280)).optional().describe('스레드 추가 트윗'),
  reply_to: z.string().optional().describe('답글 대상 트윗 ID'),
})
```

### 4.4 다음카페 (`publish_daum_cafe`)

**API 상태: 공식 API 없음** ⚠️

**대안:**
1. **Selenium/Playwright 자동화** (추천)
   - 브라우저 자동화로 글 작성
   - 로그인 → 글쓰기 페이지 → 내용 입력 → 발행
   - Playwright MCP 서버 활용 가능

2. **카카오 API**
   - 다음카페는 카카오 소유이지만 카페 글쓰기 API는 미제공
   - 카카오톡 채널 API만 있음

3. **Activepieces/n8n 연동**
   - 노코드 자동화 도구를 통한 간접 접근

```typescript
// packages/server/src/lib/tool-handlers/builtins/publish-daum-cafe.ts
const publishDaumCafeSchema = z.object({
  cafe_url: z.string().url().describe('다음카페 URL'),
  board_id: z.string().describe('게시판 ID'),
  title: z.string(),
  content_html: z.string(),
  // Playwright MCP를 통한 브라우저 자동화
})
```

**주의**: Selenium 방식은 **불안정** → 최소한의 기능만 구현, 필수 아님

### 4.5 YouTube (`publish_youtube`)

**API**: YouTube Data API v3

**인증**: OAuth 2.0 (Google Cloud Console에서 앱 등록)

**기능:**
- `videos.insert` - 영상 업로드
- `thumbnails.set` - 썸네일 설정
- `captions.insert` - 자막 추가

**쇼츠 조건:**
- 세로형 (9:16)
- 60초 이하
- `#Shorts` 태그 또는 해시태그 (자동 감지)

```typescript
// packages/server/src/lib/tool-handlers/builtins/publish-youtube.ts
const publishYoutubeSchema = z.object({
  video_path: z.string().describe('업로드할 영상 파일 경로'),
  title: z.string().max(100),
  description: z.string().max(5000),
  tags: z.array(z.string()).optional(),
  category_id: z.string().default('22'), // People & Blogs
  privacy: z.enum(['private', 'unlisted', 'public']).default('private'),
  is_shorts: z.boolean().default(false),
  thumbnail_path: z.string().optional(),
})
```

---

## 5. 콘텐츠 제작 도구

### 5.1 AI 이미지 생성 (`generate_image`)

**Replicate API** (추천)
- 패키지: `replicate` (npm)
- 모델: **Flux 1.1 Pro** (텍스트→이미지, 최고 품질)
- 가격: ~$0.04/이미지
- GitHub: [replicate/replicate-javascript](https://github.com/replicate/replicate-javascript)

```typescript
import Replicate from 'replicate'
const replicate = new Replicate({ auth: token })

const output = await replicate.run('black-forest-labs/flux-1.1-pro', {
  input: {
    prompt: 'Professional marketing banner for LeetMaster coding platform...',
    width: 1080,
    height: 1080, // 인스타 정사각형
    num_inference_steps: 25,
  }
})
```

### 5.2 AI 영상 생성 (`generate_video`)

**Replicate API - Kling v2.6** (추천)
- 가격: ~$0.029/초
- 기능: 이미지→영상, 텍스트→영상, 시네마틱 품질
- 네이티브 오디오 생성 지원

```typescript
const output = await replicate.run('kwaivgi/kling-v2.6', {
  input: {
    prompt: 'A developer solving coding problems with focus...',
    image: 'https://...', // 시작 이미지 (선택)
    duration: 5, // 초
    aspect_ratio: '9:16', // 쇼츠/릴스용
  }
})
```

**대안: Runway Gen-4 Turbo**
- 패키지: `@runwayml/sdk` (npm)
- 가격: ~$0.05/초
- 설치: `bun add @runwayml/sdk`

### 5.3 프로그래밍 영상 제작 (`compose_video`)

**Remotion** (추천)
- GitHub: [remotion-dev/remotion](https://github.com/remotion-dev/remotion) - 21,000+ stars
- React로 영상 프로그래밍
- 설치: `bun add remotion @remotion/cli @remotion/renderer`

**활용 시나리오:**
```
1. 나레이션 TTS 생성 (ElevenLabs)
2. 타임라인 계산 (나레이션 길이 기반)
3. AI 이미지들을 Remotion 컴포넌트로 배치
4. 자막 오버레이 추가
5. 트랜지션, BGM 합성
6. MP4 렌더링
```

```typescript
// Remotion 컴포넌트 예시
const MarketingVideo: React.FC<{ scenes: Scene[] }> = ({ scenes }) => {
  return (
    <Composition
      id="marketing-reel"
      component={ReelComposition}
      durationInFrames={30 * 30} // 30fps × 30초
      fps={30}
      width={1080}
      height={1920} // 9:16 세로형
      defaultProps={{ scenes }}
    />
  )
}
```

### 5.4 카드뉴스 생성 (`generate_card_news`)

**방법 1: HTML → 이미지 (Puppeteer)**
```
1. 카드뉴스 HTML 템플릿 렌더링
2. Puppeteer로 스크린샷 → PNG
3. Sharp로 최적화 (리사이즈, 압축)
```

**방법 2: Sharp 직접 합성**
- 패키지: `sharp` (npm, 30,000+ stars)
- 배경 이미지 + 텍스트 오버레이 + 로고

**필요 패키지:**
- `sharp` - 이미지 처리
- `@napi-rs/canvas` - Canvas API (텍스트 렌더링)
- Puppeteer (md-to-pdf와 공유)

### 5.5 TTS 나레이션 (`text_to_speech`)

**기존 도구 활용** (56개 중 하나)
- ElevenLabs API (고품질 한국어)
- 대안: Google Cloud TTS, CLOVA Voice (네이버)

---

## 6. 파일 호스팅 (미디어 URL 제공)

Instagram, YouTube 등은 미디어 **URL**을 요구 → 파일 호스팅 필요.

**추천: Cloudflare R2**
- 이미 Cloudflare 인프라 사용 중
- 가격: 10GB 무료, 이후 $0.015/GB/월
- Workers를 통한 공개 URL 제공

```typescript
// packages/server/src/lib/tool-handlers/builtins/upload-media.ts
const uploadMediaSchema = z.object({
  file_path: z.string(),
  bucket: z.enum(['images', 'videos', 'documents']),
})
// → R2 업로드 → 공개 URL 반환
```

---

## 7. 콘텐츠 캘린더 도구 (`content_calendar`)

기존 도구 리팩토링 또는 신규:

```typescript
const contentCalendarSchema = z.object({
  action: z.enum(['create', 'list', 'update', 'delete']),
  entry: z.object({
    date: z.string(),
    platform: z.enum(['instagram', 'tistory', 'x', 'youtube', 'daum_cafe']),
    content_type: z.enum(['blog', 'card_news', 'reel', 'shorts', 'long_video', 'tweet']),
    topic: z.string(),
    status: z.enum(['idea', 'scripted', 'produced', 'scheduled', 'published']),
    assigned_to: z.string().optional(), // 담당 에이전트
  }).optional(),
})
```

---

## 8. 전체 도구 목록 요약

### 신규 개발 필요
| 도구 | 우선순위 | 복잡도 |
|------|---------|--------|
| `publish_tistory` | P0 | 낮음 (API 직접 호출) |
| `publish_x` | P0 | 낮음 (twitter-api-v2) |
| `publish_youtube` | P1 | 중간 (OAuth + 대용량 업로드) |
| `generate_video` | P1 | 중간 (Replicate API) |
| `generate_card_news` | P1 | 중간 (HTML→이미지) |
| `compose_video` | P2 | 높음 (Remotion 통합) |
| `upload_media` | P0 | 낮음 (R2 업로드) |
| `content_calendar` | P1 | 낮음 (CRUD) |
| `publish_daum_cafe` | P3 | 높음 (Playwright 자동화) |

### 기존 도구 리팩토링
| 도구 | 변경사항 |
|------|---------|
| `publish_instagram` | Graph API 카루셀/릴스 지원 추가 |
| `text_to_speech` | 영상 나레이션용 출력 포맷 추가 |
| `generate_image` | Replicate Flux 1.1 Pro 업그레이드 |
| `hashtag_generator` | 플랫폼별 최적화 |
| `content_calendar` | 다중 플랫폼 지원 |

---

## 9. 필요 패키지

```bash
# 신규 설치
bun add twitter-api-v2          # X/Twitter API
bun add replicate               # AI 이미지/영상 생성
bun add @runwayml/sdk           # Runway 영상 (대안)
bun add sharp                   # 이미지 처리
bun add @napi-rs/canvas         # Canvas API
bun add remotion @remotion/cli @remotion/renderer  # 영상 제작
bun add marked                  # MD → HTML (Tistory용)
bun add @aws-sdk/client-s3      # R2 업로드 (S3 호환)

# 이미 있을 가능성
bun add googleapis              # YouTube Data API
```

---

## 10. BMAD 개발자 참고사항

### 아키텍처 패턴 준수
- 모든 도구: `tool-handlers/builtins/` 하위에 kebab-case 파일
- Zod 스키마 + `ToolRegistration` 타입
- `ctx.getCredentials()` 로 API 키 조회 (하드코딩 금지)
- 반환: `{ success: true, data: {...} }`

### 크리덴셜 관리
각 플랫폼별 필요한 인증 정보:
| 플랫폼 | 필요 정보 | 저장 위치 |
|--------|----------|----------|
| Instagram | Facebook App Token + IG Business Account ID | credentials 테이블 |
| Tistory | OAuth Access Token | credentials 테이블 |
| X | API Key + Secret + User Token | credentials 테이블 |
| YouTube | Google OAuth Refresh Token | credentials 테이블 |
| Replicate | API Token | credentials 테이블 |
| Runway | API Token | credentials 테이블 |
| ElevenLabs | API Key | credentials 테이블 |
| Cloudflare R2 | Account ID + Access Key | env 변수 |

### 테스트 케이스
- [ ] Instagram 카루셀 업로드 (이미지 3장)
- [ ] Tistory 글 발행 + 이미지 포함
- [ ] X 스레드 게시 (트윗 5개)
- [ ] YouTube 쇼츠 업로드 (60초 세로 영상)
- [ ] Replicate Flux 이미지 생성 품질
- [ ] Kling v2.6 영상 생성 (5초)
- [ ] Remotion 렌더링 (30초 영상)
- [ ] R2 업로드 → 공개 URL 접근

---

---

## 11. CLI-Anything 통합 계획 (Remotion + FFmpeg)

> **CLI-Anything**: [HKUDS/CLI-Anything](https://github.com/HKUDS/CLI-Anything) (13,242 stars)
> Claude Code 플러그인. 소프트웨어 소스코드를 분석해서 Python CLI + JSON 인터페이스를 자동 생성.
> AI 에이전트가 subprocess로 진짜 소프트웨어를 직접 제어할 수 있게 해줌.

### 11.1 왜 CLI-Anything인가?

현재 문제:
```
CORTHEX 에이전트 → Remotion API (Node.js 코드 직접 작성 필요)
CORTHEX 에이전트 → FFmpeg (복잡한 CLI 옵션 암기 필요)
```

CLI-Anything 적용 후:
```
CORTHEX 에이전트 → cli-anything CLI (자연어 수준 명령)
                   → Remotion: "30초 릴스 만들어, 이미지 5장, 자막 포함"
                   → FFmpeg: "이 영상에 BGM 합성하고 9:16으로 자르기"
```

### 11.2 Remotion × CLI-Anything

**생성 명령:**
```bash
# Claude Code에서 실행
/plugin install cli-anything
/cli-anything https://github.com/remotion-dev/remotion
```

**예상 생성 CLI 구조:**
```
agent-harness/cli_anything/remotion/
├── cli.py              # Click CLI 진입점
├── composition.py      # 컴포지션 관리 (create, list, render)
├── render.py           # 렌더링 (MP4/GIF/WebM)
├── preview.py          # 프리뷰 서버
├── assets.py           # 에셋 관리 (이미지, 오디오, 폰트)
└── tests/
    ├── test_composition.py
    └── test_render.py
```

**핵심 CLI 명령 (예상):**
```bash
# 컴포지션 생성
cli-anything remotion composition create \
  --id "marketing-reel" \
  --width 1080 --height 1920 \
  --fps 30 --duration-seconds 30 \
  --json

# 렌더링
cli-anything remotion render \
  --composition-id "marketing-reel" \
  --output "/tmp/reel.mp4" \
  --codec h264 \
  --props '{"scenes": [...], "bgm": "/tmp/bgm.mp3"}' \
  --json

# 에셋 추가
cli-anything remotion assets add \
  --type image \
  --path "/tmp/scene1.png" \
  --start-frame 0 --duration-frames 90 \
  --json
```

**CORTHEX 도구 핸들러 통합:**
```typescript
// packages/server/src/lib/tool-handlers/builtins/compose-video.ts
import { execSync } from 'child_process'

const composeVideoSchema = z.object({
  action: z.enum(['create_composition', 'add_scene', 'render', 'add_audio']),
  // create_composition
  width: z.number().default(1080),
  height: z.number().default(1920),
  fps: z.number().default(30),
  duration_seconds: z.number().default(30),
  // add_scene
  image_path: z.string().optional(),
  start_second: z.number().optional(),
  duration: z.number().optional(),
  // render
  composition_id: z.string().optional(),
  output_path: z.string().optional(),
  codec: z.enum(['h264', 'h265', 'vp8', 'gif']).default('h264'),
  // add_audio
  audio_path: z.string().optional(),
  volume: z.number().default(1.0),
})

// CLI-Anything가 생성한 CLI를 subprocess로 호출
async function executeRemotion(action: string, args: Record<string, unknown>) {
  const cmd = `cli-anything remotion ${action} ${
    Object.entries(args)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => `--${k.replace(/_/g, '-')} ${JSON.stringify(v)}`)
      .join(' ')
  } --json`
  const result = execSync(cmd, { encoding: 'utf-8', timeout: 300_000 }) // 5분 타임아웃
  return JSON.parse(result)
}
```

**에이전트 사용 시나리오 (영상 제작자 AI):**
```
1. 부서장: "LeetMaster 프로모션 릴스 만들어"
2. 기획자 → 스크립트 5장면 작성
3. 디자이너 → Replicate Flux로 이미지 5장 생성 → /tmp/scene1~5.png
4. 영상 제작자:
   a. compose_video(action: 'create_composition', width: 1080, height: 1920, duration_seconds: 30)
   b. compose_video(action: 'add_scene', image_path: '/tmp/scene1.png', start_second: 0, duration: 6) × 5
   c. text_to_speech(text: "나레이션...") → /tmp/narration.mp3
   d. compose_video(action: 'add_audio', audio_path: '/tmp/narration.mp3')
   e. compose_video(action: 'render', output_path: '/tmp/reel.mp4')
5. 퍼블리셔 → publish_instagram(type: 'reel', media_urls: [...])
```

### 11.3 FFmpeg × CLI-Anything

**생성 명령:**
```bash
/cli-anything https://github.com/FFmpeg/FFmpeg
```

**핵심 CLI 명령 (예상):**
```bash
# 영상 합성 (이미지 + 오디오 → MP4)
cli-anything ffmpeg compose \
  --images "/tmp/scene*.png" \
  --audio "/tmp/narration.mp3" \
  --output "/tmp/video.mp4" \
  --fps 30 \
  --transition fade --transition-duration 0.5 \
  --json

# 영상 크롭 (16:9 → 9:16 세로형)
cli-anything ffmpeg crop \
  --input "/tmp/video.mp4" \
  --aspect-ratio "9:16" \
  --output "/tmp/reel.mp4" \
  --json

# 자막 합성
cli-anything ffmpeg subtitle \
  --input "/tmp/video.mp4" \
  --srt "/tmp/subtitles.srt" \
  --font-size 48 --font-color white \
  --position bottom \
  --output "/tmp/video_subtitled.mp4" \
  --json

# BGM 합성
cli-anything ffmpeg mix-audio \
  --video "/tmp/video.mp4" \
  --bgm "/tmp/bgm.mp3" --bgm-volume 0.3 \
  --output "/tmp/final.mp4" \
  --json

# 썸네일 추출
cli-anything ffmpeg thumbnail \
  --input "/tmp/video.mp4" \
  --timestamp "00:00:05" \
  --output "/tmp/thumb.png" \
  --json
```

**Remotion vs FFmpeg 역할 분담:**
| 작업 | Remotion | FFmpeg |
|------|----------|--------|
| React 컴포넌트 기반 영상 | ✅ 주력 | ❌ |
| 이미지 슬라이드쇼 | ✅ | ✅ (더 빠름) |
| 오디오 합성/믹싱 | 기본 | ✅ 주력 |
| 자막 하드코딩 | React 오버레이 | ✅ (ASS/SRT) |
| 영상 크롭/리사이즈 | ❌ | ✅ 주력 |
| 포맷 변환 | ❌ | ✅ 주력 |
| 추천 워크플로우 | **제작** | **후처리** |

### 11.4 주의사항

1. **CLI-Anything 제약**: 소프트웨어가 서버에 설치되어 있어야 함
   - Remotion: `bun add remotion @remotion/cli @remotion/renderer` (Node.js, 설치 간단)
   - FFmpeg: `apt install ffmpeg` (시스템 패키지, 이미 많은 서버에 설치됨)
2. **라이선스**: CLI-Anything 자체에 LICENSE 파일 없음 — 상업적 사용 전 확인 필요
3. **Node.js 프로젝트 호환성**: CLI-Anything는 주로 C/C++/Python 소프트웨어에 검증됨. Remotion은 Node.js이므로 CLI 생성 품질 테스트 필요
4. **렌더링 시간**: Remotion 30초 영상 렌더링 ~2-5분. FFmpeg 후처리 ~10-30초. 에이전트 타임아웃 설정 필수
5. **디스크 공간**: 영상 작업은 임시 파일 많이 생성 → /tmp 정리 로직 필요

### 11.5 BMAD Epic 스토리 제안

```
Epic: 마케팅 영상 자동화 (CLI-Anything 통합)

Story 1: FFmpeg CLI-Anything 래퍼 설치 + compose_video_ffmpeg 도구
  - /cli-anything FFmpeg → CLI 생성
  - 기본 도구: crop, mix-audio, subtitle, thumbnail
  - 테스트: 이미지 5장 → 30초 슬라이드쇼 MP4

Story 2: Remotion CLI-Anything 래퍼 설치 + compose_video_remotion 도구
  - /cli-anything remotion → CLI 생성
  - 기본 도구: create_composition, add_scene, render
  - 테스트: React 컴포넌트 기반 30초 영상

Story 3: 영상 제작 파이프라인 통합
  - Remotion(제작) → FFmpeg(후처리) → R2(업로드) → publish_youtube/instagram
  - 에이전트 핸드오프 워크플로우 완성
  - E2E 테스트: "프로모션 릴스 만들어" → 인스타 업로드까지
```

---

## Sources
- [Instagram Graph API Guide 2026](https://elfsight.com/blog/instagram-graph-api-complete-developer-guide-for-2026/)
- [instagram-publisher GitHub](https://github.com/yuvraj108c/instagram-publisher)
- [Tistory API 공식 문서](https://tistory.github.io/document-tistory-apis/apis/v1/post/write.html)
- [twitter-api-v2 npm](https://www.npmjs.com/package/twitter-api-v2)
- [X API Pricing 2026](https://elfsight.com/blog/how-to-get-x-twitter-api-key-in-2026/)
- [YouTube API Upload Guide 2025](https://medium.com/@dorangao/from-zero-to-first-upload-a-from-scratch-guide-to-publishing-videos-to-youtube-via-api-2025-73251a9324bd)
- [Replicate Video Models](https://replicate.com/collections/text-to-video)
- [Kling v2.6 on Replicate](https://replicate.com/kwaivgi/kling-v2.6)
- [Runway API Docs](https://docs.dev.runwayml.com/api/)
- [Remotion GitHub](https://github.com/remotion-dev/remotion)
- [AI Video API Pricing 2026](https://devtk.ai/en/blog/ai-video-generation-pricing-2026/)
- [AI Content Marketing Tools 2026](https://www.marketermilk.com/blog/ai-marketing-tools)
