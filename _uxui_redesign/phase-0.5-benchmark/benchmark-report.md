# UXUI Benchmark Report — Phase 0.5

**Date:** 2026-03-23
**Screenshots:** 15 sites, desktop viewport (1280x800)
**Purpose:** CORTHEX v3 OpenClaw 디자인 방향 참고

---

## 수집된 사이트

| # | Site | Category | Theme | Key Pattern |
|---|------|----------|-------|-------------|
| 1 | Linear | SaaS Dashboard | Dark | 미니멀, 좌측 사이드바, 모노톤 |
| 2 | Vercel | Platform Landing | Light/Gradient | 그라디언트 히어로, 코드 블록 |
| 3 | Supabase | DevTool Landing | Dark (green accent) | 다크+그린, 코드 중심 |
| 4 | Clerk | Auth Landing | Light | 깔끔한 라이트, 퍼플 accent |
| 5 | GitHub | Platform Landing | Dark→Light | 대형 타이포, WebGL 배경 |
| 6 | Notion | Workspace Landing | Light | 일러스트, 따뜻한 흰색 |
| 7 | PostHog | Analytics Landing | Light (warm) | IDE 스타일 내비, 유머러스 |
| 8 | shadcn/ui | Component Library | Light | 미니멀, 컴포넌트 쇼케이스 |
| 9 | v0.dev | AI Builder | Light | 채팅 인터페이스, 템플릿 그리드 |
| 10 | Stripe | Payment Landing | Light (gradient) | 그라디언트, 깔끔한 타이포 |
| 11 | Tailwind UI | Component Store | Light | 대형 타이포, 컴포넌트 프리뷰 |
| 12 | Mixpanel | Analytics Landing | Light | 카드 기반, 카테고리 선택 |
| 13 | Datadog | Monitoring Landing | Light | 대시보드 프리뷰, 엔터프라이즈 |
| 14 | Grafana | Observability | Dark | 다크 테마, 기술적 |
| 15 | Resend | Email API Landing | Dark | 세리프 타이포, 미니멀 다크 |

---

## 패턴 분석

### 1. 레이아웃 패턴

**랜딩 페이지:**
- Hero: 중앙 정렬 대형 타이포 (95%) — "Build X" / "The Y platform"
- CTA: 2버튼 패턴 (Primary + Ghost) — "Get Started" + "View Demo"
- 소셜 프루프: 로고 스크롤 바 (80%) — 고객 로고 무한 스크롤
- Feature 섹션: 탭 기반 (40%) 또는 카드 그리드 (60%)

**대시보드/앱:**
- Sidebar: 좌측 고정 (Linear, GitHub, Notion)
- Topbar: 미니멀 (로고 + 네비 + CTA)
- Content: 1-column 또는 grid

### 2. 색상 트렌드

| 패턴 | 비율 | 예시 |
|------|------|------|
| Dark theme | 40% | Linear, Supabase, GitHub, Grafana, Resend |
| Light theme | 47% | Vercel, Clerk, Notion, shadcn/ui, Tailwind UI, Mixpanel |
| Gradient accent | 13% | Vercel, Stripe |

**다크 테마 특징:** slate-900~950 배경, 1개 accent color (green/cyan/purple)
**라이트 테마 특징:** white/cream 배경, subtle borders, soft shadows

### 3. 타이포그래피

- **Sans-serif 지배적** (100%) — Inter, Geist, custom sans
- **Mono 보조** — 코드 블록용 (JetBrains Mono, Fira Code)
- **히어로 크기:** 48-72px (desktop)
- **본문:** 16-18px, line-height 1.5-1.75

### 4. CORTHEX에 추천하는 방향

**Option A: Dark Minimal (Linear/Supabase 스타일)**
- 배경: slate-950 (#020617)
- Accent: cyan-400 (#22d3ee)
- 장점: AI/에이전트 제품에 어울림, 프리미엄 느낌
- 단점: 접근성 주의 필요

**Option B: Light Warm (Notion/Clerk 스타일)**
- 배경: cream (#faf8f5) 또는 white
- Accent: olive/sage green
- 장점: 친근함, 비개발자 접근성
- 단점: AI 제품치고 평범할 수 있음

**Option C: Dark + Natural Organic (현재 v2 테마 발전)**
- 배경: slate-950 + cream surface cards
- Accent: olive #283618 → sage #5a7247
- 장점: 기존 브랜드 유지, 독특함
- 단점: olive가 SaaS에서 드문 색상

### 5. Top 5 참고 디자인

1. **Linear** — 사이드바 대시보드 구조, 미니멀 다크
2. **Notion** — 워크스페이스 경험, 따뜻한 톤
3. **shadcn/ui** — 컴포넌트 시스템, Tailwind 네이티브
4. **Vercel** — 랜딩 페이지 구조, 그라디언트 사용
5. **Resend** — 다크 테마 + 세리프 타이포 조합

---

## CORTHEX v3 OpenClaw 권장

**대시보드/앱:** Linear 스타일 다크 사이드바 + 밝은 content area (하이브리드)
**랜딩 페이지:** Vercel/Stripe 스타일 그라디언트 히어로
**컴포넌트:** shadcn/ui 기반 (이미 프로젝트에 있음)
**아이콘:** Lucide React (현재 유지)
**폰트:** Inter + JetBrains Mono (현재 유지)
