# CLI-Anything 분석 리포트

> 작성일: 2026-03-12 | GitHub: [HKUDS/CLI-Anything](https://github.com/HKUDS/CLI-Anything)

---

## 1. CLI-Anything란?

**한마디로**: 아무 소프트웨어나 AI 에이전트가 쓸 수 있도록 CLI 인터페이스를 자동 생성해주는 도구.

```
$ /cli-anything <software-path-or-repo>
→ 7단계 자동 파이프라인
→ 해당 소프트웨어의 완전한 CLI 생성
→ AI 에이전트가 CLI로 소프트웨어 제어 가능
```

### 핵심 철학

> "오늘의 소프트웨어는 사람을 위해 만들어졌다 👨‍💻
> 내일의 사용자는 AI 에이전트가 될 것이다 🤖"

---

## 2. 작동 방식 (7-Phase Pipeline)

| Phase | 단계 | 설명 |
|-------|------|------|
| 1 | **Analyze** | 소스코드 스캔 → GUI 액션을 API로 매핑 |
| 2 | **Design** | 커맨드 그룹, 상태 모델, 출력 포맷 설계 |
| 3 | **Implement** | Click 기반 CLI 구축 (REPL, JSON 출력, undo/redo) |
| 4 | **Plan Tests** | 포괄적 테스트 명세 작성 |
| 5 | **Write Tests** | 유닛 + E2E 테스트 구현 |
| 6 | **Document** | 문서 자동 생성 |
| 7 | **Publish** | setup.py 생성 → 시스템 PATH 설치 |

### 생성물 구조

```
[app]/agent-harness/
├── setup.py                    # pip install -e .
├── cli_anything_[app]/         # CLI 소스코드
│   ├── __init__.py
│   ├── commands/               # 커맨드 그룹들
│   └── utils/
├── tests/                      # pytest 테스트
└── TEST.md                     # 테스트 명세
```

---

## 3. 지원 플랫폼

| 플랫폼 | 설치 방법 |
|--------|-----------|
| **Claude Code** | `/plugin install cli-anything` → `/cli-anything:cli-anything ./app` |
| **OpenCode** | `~/.config/opencode/commands/`에 복사 |
| **Codex** | `bash CLI-Anything/codex-skill/scripts/install.sh` |
| **Cursor** | 지원 예정 |

---

## 4. 검증된 앱 (11개, 1,508+ 테스트 통과)

| 소프트웨어 | 분야 | CLI 명령 | 테스트 수 |
|-----------|------|----------|-----------|
| GIMP | 이미지 편집 | `cli-anything-gimp` | 107 |
| Blender | 3D 모델링 | `cli-anything-blender` | 208 |
| Inkscape | 벡터 그래픽 | `cli-anything-inkscape` | 202 |
| Audacity | 오디오 | `cli-anything-audacity` | 161 |
| LibreOffice | 오피스 | `cli-anything-libreoffice` | 158 |
| OBS Studio | 스트리밍 | `cli-anything-obs-studio` | 153 |
| Kdenlive | 영상 편집 | `cli-anything-kdenlive` | 155 |
| Shotcut | 영상 편집 | `cli-anything-shotcut` | 154 |
| Zoom | 화상회의 | `cli-anything-zoom` | 22 |
| Draw.io | 다이어그램 | `cli-anything-drawio` | 138 |
| AnyGen | AI 콘텐츠 | `cli-anything-anygen` | 50 |

---

## 5. 기술 스택

| 항목 | 값 |
|------|-----|
| 언어 | Python 3.10+ |
| CLI 프레임워크 | Click 8.0+ |
| 테스트 | pytest (100% pass rate) |
| 출력 | JSON (에이전트용) + human-readable (사람용) |
| 설치 | `pip install -e .` |
| 네임스페이스 | `cli_anything.*` (충돌 방지) |

### 핵심 특징
- **`--json` 플래그**: 모든 커맨드에 JSON 출력 내장
- **`--help` 탐색**: 에이전트가 기능을 자체 발견
- **REPL 모드**: 세션 유지, undo/redo
- **Zero Config**: PATH에 자동 설치

---

## 6. Corthex v2 적용 가능성 분석

### 6-1. 직접 적용 가능한가? → ❌ 직접 적용 불가

| 이유 | 설명 |
|------|------|
| **목적 불일치** | CLI-Anything = 데스크톱 앱 → CLI 변환. Corthex = 웹 기반 AI 에이전트 플랫폼 |
| **기술 스택 불일치** | CLI-Anything = Python/Click. Corthex = TypeScript/Hono/React |
| **대상 불일치** | CLI-Anything = GIMP/Blender 같은 GUI 앱. Corthex = API 기반 SaaS |
| **아키텍처 불일치** | CLI-Anything = 로컬 프로세스 제어. Corthex = 클라우드 멀티테넌트 |

### 6-2. 아이디어 차원에서 배울 점 → ✅ 3가지

#### 배울 점 1: "Agent-Native Design" 패턴

CLI-Anything의 핵심: **모든 출력에 `--json` 구조화 데이터**

```python
# CLI-Anything 방식
$ cli-anything-gimp image resize --width 800 --json
{"status": "success", "data": {"width": 800, "height": 600, "path": "/tmp/out.png"}}
```

**Corthex 적용**: 에이전트 실행 결과를 항상 구조화된 JSON으로 반환하는 것은 이미 하고 있음
(`{ success: true, data }` 패턴). 이 부분은 이미 잘 되어 있음.

#### 배울 점 2: "자기 발견(Self-Discovery)" 패턴

CLI-Anything에서 에이전트는 `--help`로 기능을 스스로 발견:

```
$ cli-anything-gimp --help
Commands:
  image    Image manipulation commands
  filter   Apply filters
  export   Export in various formats
```

**Corthex 적용 가능성**: 에이전트가 "사용 가능한 도구/Hook 목록"을 자체 발견하는 메커니즘.
현재 `engine/agent-loop.ts`에서 도구는 하드코딩. **동적 도구 발견** 패턴 도입 가능.

#### 배울 점 3: "세션 상태 + Undo/Redo"

CLI-Anything의 REPL은 세션 상태를 유지하며 실행 취소 가능.

**Corthex 적용 가능성**: 에이전트 대화의 "실행 취소" — 직전 명령의 영향을 되돌리는 기능.
현재 `doc_versions` 테이블로 문서는 버전 관리가 되지만, 에이전트 액션의 undo는 없음.

### 6-3. 결론

| 항목 | 판정 |
|------|------|
| 코드 직접 사용 | ❌ 불가능 (Python, 데스크톱 앱 대상) |
| 플러그인으로 설치 | ❌ 불필요 (Corthex는 CLI 앱이 아님) |
| 디자인 패턴 참고 | ✅ Agent-Native, Self-Discovery, Session State |
| 우선순위 | 🟢 낮음 — 당장 필요하지 않음 |

---

## 7. 대신 주목할 만한 것들

Corthex에 더 직접적으로 도움이 될 기술들:

| 기술 | 설명 | Corthex 연관성 |
|------|------|----------------|
| **Cloudflare AutoRAG** | 관리형 RAG 파이프라인 | Corthex가 Cloudflare 기반이므로 직접 활용 가능 |
| **Cloudflare Vectorize** | 벡터 DB 서비스 | 현재 pgvector → Vectorize 마이그레이션 검토 가능 |
| **MCP (Model Context Protocol)** | 도구 표준 프로토콜 | 에이전트 도구 확장에 직접 활용 가능 |
| **NotebookLM** | 문서 기반 AI 비서 | 아키텍처 문서에 이미 MCP 연동 언급됨 |

---

## Sources

- [GitHub - HKUDS/CLI-Anything](https://github.com/HKUDS/CLI-Anything)
- [CLI-Anything README](https://github.com/HKUDS/CLI-Anything/blob/main/README.md)
- [Chao Huang (X/Twitter)](https://x.com/huang_chao4969/status/2030677277974167609)
