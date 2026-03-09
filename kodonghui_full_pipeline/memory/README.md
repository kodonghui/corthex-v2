# Context Memory (컴팩션 대비 메모리)

Claude Code의 **컴팩션(대화 압축)** 문제를 해결하는 범용 메모리 시스템.
어떤 프로젝트에서든 복사해서 바로 사용 가능합니다.

---

## 이게 뭔가요?

Claude Code는 대화가 길어지면 이전 내용을 **압축(컴팩션)** 합니다.
이때 중요한 맥락(왜 이 결정을 했는지, 다음에 뭘 해야 하는지)이 사라질 수 있어요.

이 도구는 두 가지 방법으로 맥락 유실을 방지합니다:

1. **자동 저장**: CLAUDE.md 규칙에 의해, AI가 중요한 순간마다 상태를 파일에 자동 기록
2. **수동 저장/복원**: `/kdh-memory` 커맨드로 직접 저장하거나 불러올 수 있음

컴팩션이 일어나도 CLAUDE.md는 항상 다시 읽히기 때문에, 메모리 파일도 다시 읽혀서 맥락이 복원됩니다.

---

## 어떤 문제를 해결하나요?

| 상황 | 문제 | 이 도구의 해결 |
|------|------|--------------|
| 긴 세션 중간 | 컴팩션으로 앞의 맥락 유실 | `working-state.md` 자동 저장 → 복원 |
| 새 세션 시작 | 어제 뭘 했는지 모름 | 세션 기록 파일 → `/kdh-memory recall` |
| 방향 전환 후 | 왜 그 결정을 했는지 까먹음 | 결정사항 + 이유가 기록되어 있음 |

---

## 설치 방법

### 방법 1: 프로젝트에 직접 설치 (권장)

```bash
# 1. 커맨드 파일 복사
cp kodonghui_full_pipeline/memory/kdh-memory.md [프로젝트]/.claude/commands/

# 2. 메모리 폴더 생성
mkdir -p [프로젝트]/.claude/memory

# 3. CLAUDE.md에 메모리 규칙 추가
#    example_CLAUDE_memory.md의 내용을 프로젝트 CLAUDE.md 맨 아래에 붙여넣기
```

### 방법 2: 글로벌 설치 (모든 프로젝트에서 사용)

```bash
# 1. 커맨드 파일 복사
cp kodonghui_full_pipeline/memory/kdh-memory.md ~/.claude/commands/

# 2. 각 프로젝트에서 메모리 폴더는 별도 생성
mkdir -p .claude/memory

# 3. 각 프로젝트의 CLAUDE.md에 메모리 규칙 추가
```

### 주의: 중복 방지

- 프로젝트 `.claude/commands/`와 글로벌 `~/.claude/commands/`에 같은 파일이 있으면 스킬이 2번 뜹니다
- 한 곳에만 넣으세요

---

## 사용법

### 작업 중 상태 저장
```
/kdh-memory save
```
→ 현재 하고 있는 것, 결정사항, 다음 할 것, 주의사항을 `working-state.md`에 저장

### 새 세션에서 맥락 복원
```
/kdh-memory recall
```
→ 마지막 작업 상태 + 최근 3개 세션 기록을 읽어서 보여줌

### 세션 끝날 때 정리
```
/kdh-memory session-end
```
→ 오늘 한 것을 날짜별 파일로 저장 + `working-state.md` 정리

### 메모리 현황 확인
```
/kdh-memory status
```
→ 저장된 파일 목록 + 마지막 저장 시각

---

## 자동 저장이 작동하는 원리

CLAUDE.md에 메모리 규칙을 추가하면:

1. AI가 **중요한 결정을 내릴 때** → `working-state.md` 자동 업데이트
2. AI가 **기능 하나를 완료할 때** → `working-state.md` 자동 업데이트
3. **컴팩션 발생** → CLAUDE.md를 다시 읽음 → "메모리 파일을 읽어라"는 규칙 발견 → `working-state.md` 읽음 → 맥락 복원

즉, 따로 `/kdh-memory save`를 안 해도 AI가 알아서 저장합니다.
커맨드는 "지금 당장 저장해줘"라고 명시적으로 말하고 싶을 때 쓰는 겁니다.

---

## 파일 구조

```
.claude/
├── commands/
│   └── kdh-memory.md          ← 슬래시 커맨드
└── memory/
    ├── working-state.md        ← 현재 작업 상태 (수시 업데이트)
    ├── 2026-03-09-photo-review.md  ← 세션 기록
    ├── 2026-03-08-org-setup.md
    └── ...
```

---

## 패키지 구성

```
kodonghui_full_pipeline/memory/
├── README.md                    ← 지금 보고 있는 파일
├── kdh-memory.md                ← 슬래시 커맨드 (복사해서 사용)
└── example_CLAUDE_memory.md     ← CLAUDE.md에 붙여넣을 규칙
```

---

## FAQ

**Q: CLAUDE.md가 너무 길어지지 않나요?**
A: CLAUDE.md에는 규칙 5줄만 추가됩니다. 실제 내용은 전부 `.claude/memory/` 폴더에 저장돼요.

**Q: 세션 기록이 쌓이면 용량이 많아지지 않나요?**
A: recall 할 때 최근 3개만 읽습니다. 오래된 건 보관만 되고 토큰을 소비하지 않아요.

**Q: 다른 AI 도구(Codex, Cursor 등)에서도 쓸 수 있나요?**
A: `.claude/memory/` 폴더의 파일 자체는 범용 마크다운이라 다른 도구에서도 읽을 수 있어요. 다만 `/kdh-memory` 커맨드는 Claude Code 전용입니다.

**Q: 민감한 정보가 저장되면 어떡하나요?**
A: 비밀번호, API 키, 토큰 등은 저장하지 않도록 규칙에 명시되어 있어요. `.gitignore`에 `.claude/memory/`를 추가하면 더 안전합니다.
