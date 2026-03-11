# CORTHEX v2 — Research Reports

> 작성일: 2026-03-11 | BMAD 참조용 기술 보고서 모음

---

## 보고서 목록

| # | 파일 | 주제 | 핵심 내용 |
|---|------|------|----------|
| 01 | [01-ocr-pdf-report-tools.md](./01-ocr-pdf-report-tools.md) | OCR / PDF / 보고서 도구 | Claude Code OCR 현황, md-to-pdf, Notion/이메일 배포, 도구 핸들러 설계 |
| 02 | [02-marketing-content-pipeline.md](./02-marketing-content-pipeline.md) | 마케팅 콘텐츠 파이프라인 | Instagram/Tistory/X/다음카페/YouTube API, AI 이미지/영상/TTS, 플랫폼별 도구 |
| 03 | [03-mcp-servers-catalog.md](./03-mcp-servers-catalog.md) | MCP 서버 카탈로그 (66개) | 8개 카테고리, 우선순위 분류, 설치법, 인증, CORTHEX 통합 |
| 04 | [04-v1-v2-tool-migration.md](./04-v1-v2-tool-migration.md) | V1→V2 도구 마이그레이션 | V1 75개 도구 분석, V2 44개 현황, 신규 10개 도구, 핸들러 작성 표준 |
| 05 | [05-marketing-team-agent-design.md](./05-marketing-team-agent-design.md) | 마케팅팀 에이전트 설계 | 4명 에이전트 구성, 콘텐츠 유형별 워크플로우, 자율 실행, 비용 예산 |

---

## 핵심 발견 요약

### OCR / PDF
- **Claude Code OCR**: 별도 설치 불필요 — Read 도구가 멀티모달 네이티브 지원
- **MD→PDF**: `md-to-pdf` (npm, 1.4K stars) 추천. MCP 서버도 3개+ 존재
- **보고서 배포**: Notion API + 이메일 + PDF 다운로드 3중 경로

### 마케팅 플랫폼
- **Instagram/YouTube**: 공식 API로 완전 자동화 가능 (무료)
- **X (Twitter)**: API v2 사용 가능하나 Basic 티어 $200/월 필요
- **Tistory**: API 폐쇄됨 (2024-02) — Playwright 자동화만 가능
- **다음카페**: 게시 API 없음 — Playwright 자동화만 가능

### MCP 서버
- **66개 서버** 조사 (공식 + 커뮤니티)
- **한국 전용 6개**: KiMCP, Naver Search, Naver Maps, Naver 맞춤법, Kakao Navigation, Kakao Mobility
- **필수**: GitHub, Slack, Brave Search, PostgreSQL, Sequential Thinking, Memory

### 도구 마이그레이션
- **V1**: Python 75개 도구 → **V2**: TypeScript 44개 도구 (이미 존재)
- **신규 필요**: 10개 도구 (PDF, SNS 게시, 카드뉴스, 영상 등)
- **마이그레이션 대상**: 30+ V1 전용 도구 (우선순위별 분류 완료)

### 마케팅팀
- **4명 에이전트**: 부서장, 기획자, 크리에이터, 퍼블리셔
- **월 운영비**: ~$244 (X API + AI 이미지/영상/TTS)
- **5가지 콘텐츠 워크플로우**: 카드뉴스, 블로그, 쇼츠/릴스, 긴 영상, X 스레드

---

## 활용 방법

1. **BMAD 파이프라인**: 이 보고서들을 PRD/Architecture 참조 문서로 사용
2. **도구 구현**: Phase별로 도구 핸들러 구현 시 해당 보고서의 코드 스켈레톤 참조
3. **MCP 설정**: 에이전트별 MCP 서버 할당 시 03번 보고서 참조
4. **마케팅팀 구성**: 에이전트 생성 시 05번 보고서의 Soul 설계 참조
