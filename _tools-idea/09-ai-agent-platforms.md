# AI 에이전트 플랫폼 비교 (CORTHEX 참고용)

> 조사일: 2026-03-11
> CORTHEX가 구축 중인 "동적 조직 관리 기반 AI 에이전트 시스템"과 비교하기 위한 자료

---

## 1. CrewAI — 역할 기반 에이전트 팀

- **사이트**: https://crewai.com
- **GitHub**: github.com/crewAI-Inc/crewAI
- **핵심 기능**:
  - 역할 기반 에이전트 팀 구성 (마케터, 리서처, 라이터 등 역할 부여)
  - 드래그앤드롭으로 멀티에이전트 워크플로우 생성
  - 에이전트 간 협업 (태스크 위임, 결과 공유)
  - 도구(Tools) 연결 (웹검색, 파일읽기, API 호출 등)
  - Python 기반
- **가격**:
  - Free: 오픈소스 (셀프호스팅)
  - Enterprise: $60,000/년 (10,000 실행/월)
- **차별점**: "Time-to-Production" 최강 — LangGraph 대비 40% 빠른 배포
- **CORTHEX와 비교**:
  - CrewAI: 고정 역할 에이전트 → CORTHEX: **동적 부서/인력/AI CRUD**
  - CrewAI: 개발자만 설정 → CORTHEX: **관리자 UI로 비개발자도 관리**

---

## 2. LangGraph (LangChain) — 가장 정밀한 실행 제어

- **사이트**: https://langchain-ai.github.io/langgraph/
- **핵심 기능**:
  - 그래프 기반 상태 머신: 노드=에이전트, 엣지=전환 조건
  - **Durable Execution**: 장시간 실행 워크플로우 (중간에 서버 재시작해도 이어서 실행)
  - **Human-in-the-loop**: 특정 단계에서 인간 승인 대기
  - Checkpointing (중간 상태 저장/복원)
  - Python + JavaScript 모두 지원
- **가격**: 무료 (오픈소스)
- **차별점**: 가장 정밀한 실행 흐름 제어. 복잡한 비즈니스 로직에 최적
- **CORTHEX와 비교**:
  - LangGraph: 개발자가 코드로 그래프 정의 → CORTHEX: **UI로 조직 구조 정의**
  - LangGraph: 범용 프레임워크 → CORTHEX: **조직 관리 특화**

---

## 3. AutoGen (Microsoft) — 대화 기반 합의

- **사이트**: https://microsoft.github.io/autogen/
- **핵심 기능**:
  - 에이전트 간 채팅으로 합의 도출 (토론 방식)
  - 멀티에이전트 대화 패턴
  - 코드 실행 에이전트 내장
- **가격**: 무료 (오픈소스)
- **현재 상태**: MS가 전략적 초점을 "Microsoft Agent Framework"으로 이동. **버그 패치만 유지, 신규 기능 개발 둔화**
- **CORTHEX와 비교**: BMAD Party Mode와 유사한 "토론 방식" 접근. 하지만 AutoGen은 개발 둔화 중

---

## 4. Dify — 비개발자 LLM 앱 개발

- **사이트**: https://dify.ai
- **GitHub Stars**: 34,800+
- **핵심 기능**:
  - 오픈소스 LLM 앱 개발 플랫폼
  - **드래그앤드롭 워크플로우 빌더** (비개발자도 접근 가능)
  - RAG (문서 기반 Q&A) 내장
  - 에이전트 + 도구 연결
  - 모델 관리 (Claude, GPT, Gemini 등 멀티모델)
  - 100만+ 앱 운영 중
- **가격**:
  - Free Sandbox: 200 메시지/월
  - Pro: $59/월 (5,000 메시지, 50 앱)
  - Enterprise: 커스텀
- **차별점**: 비개발자도 AI 앱 만들 수 있는 UI
- **CORTHEX와 비교**:
  - Dify: 범용 LLM 앱 플랫폼 → CORTHEX: **조직 내 에이전트 관리 특화**
  - Dify: 앱 단위 → CORTHEX: **부서/직원/에이전트 조직 단위**

---

## 5. Coze 2.0 (ByteDance) — 오피스 통합 AI

- **사이트**: https://www.coze.com
- **핵심 기능**:
  - AI 에이전트 + **오피스 통합** (Word/PPT/Excel 심층 연동)
  - **Skills Marketplace**: 스킬을 자연어로 패키징하여 재사용
  - **Agent Plan**: 장기 자율 실행 (사람이 안 봐도 알아서 작업)
  - **Coze Coding**: 바이브 코딩 (자연어로 코드 생성)
  - 2026.1월 2.0 출시
- **가격**: Free / Premium / Premium Plus (3일 무료 체험)
- **차별점**: 오피스 문서 심층 통합이 독보적
- **CORTHEX와 비교**:
  - Coze: 개인 생산성 도구 → CORTHEX: **조직 관리 시스템**

---

## 6. Custom GPTs (OpenAI GPT Store)

- **핵심 기능**:
  - GPT Store에서 수천 개 특화 GPT 검색/사용
  - 코드 없이 커스텀 GPT 제작 (대화로 만듦)
  - 링크로 공유 가능
  - Knowledge 파일 업로드 (최대 20개)
  - Actions (외부 API 연결)
- **가격**: ChatGPT Plus $20/월 / Enterprise $60/유저/월
- **시장**: B2B 컨설팅 시장 형성 ($5K-$20K 셋업비)
- **한계**: 조직 외부 공유만 가능, 팀 내부 관리 기능 부족

---

## 7. Claude Projects (Anthropic)

- **핵심 기능**:
  - 프로젝트별 컨텍스트 + 지식 + 도구 묶음
  - 커스텀 지시사항 설정 (System Prompt)
  - 200K 토큰 컨텍스트 (GPTs보다 5배 긴 맥락)
  - 파일 업로드 + 분석
- **가격**: Claude Pro $20/월 / Team $25/유저/월
- **한계**: 조직 외부 공유 불가. GPTs 대비 기능은 우위이나 배포/공유에서 약함

---

## 종합 비교표

| 기준 | CrewAI | LangGraph | Dify | Coze | GPTs | Claude Projects | **CORTHEX** |
|------|--------|-----------|------|------|------|----------------|------------|
| **조직 관리** | X | X | X | X | X | X | **O (핵심)** |
| **비개발자 접근** | X | X | O | O | O | O | **O** |
| **멀티에이전트** | O | O | 제한적 | O | X | X | **O** |
| **동적 CRUD** | X | X | O | O | O | X | **O (부서/인력/AI)** |
| **핸드오프** | O | O | X | X | X | X | **O (call_agent)** |
| **오피스 통합** | X | X | X | O | O | X | 미정 |
| **한국어 최적화** | X | X | O | O | O | O | **O** |
| **가격** | 무료~ | 무료 | $59/월~ | 무료~ | $20/월 | $20/월 | 자체 호스팅 |

---

## CORTHEX의 차별점 요약

1. **동적 조직 관리가 핵심**: 29개 고정 에이전트가 아닌, 부서/인력/AI를 자유롭게 생성/수정/삭제
2. **call_agent 도구 패턴**: SDK 서브에이전트가 아닌 도구 기반 핸드오프 (에이전트 간 자연스러운 업무 위임)
3. **티어 시스템**: 에이전트별 권한/역할 계층 관리
4. **Soul 검증**: 품질 게이트 대신 매니저 Soul이 결과물 검증
5. **CLI 토큰 방식**: 인간 직원의 Claude Max 토큰으로 AI 에이전트 실행 (별도 API 과금 없음)

→ 위 플랫폼들은 "에이전트를 만드는 도구"이고, CORTHEX는 "에이전트로 구성된 조직을 관리하는 시스템"

---

## 참고 출처
- https://o-mega.ai/articles/langgraph-vs-crewai-vs-autogen-top-10-agent-frameworks-2026
- https://openagents.org/blog/posts/2026-02-23-open-source-ai-agent-frameworks-compared
- https://www.lindy.ai/blog/crew-ai-pricing
- https://dify.ai/pricing
- https://aixsociety.com/bytedances-coze-2-0/
- https://www.digitalapplied.com/blog/gpt-store-custom-gpts-business-guide-2026
- https://jeffreybowdoin.com/claude-projects-vs-custom-gpts/
