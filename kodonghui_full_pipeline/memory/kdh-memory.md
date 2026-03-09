---
name: 'kdh-memory'
description: 'Context memory manager for compaction survival. Usage: /kdh-memory [save|recall|session-end|status]'
---

# Context Memory Manager

컴팩션(대화 압축)으로 인한 맥락 유실을 방지하는 메모리 시스템.
어떤 프로젝트에서든 `.claude/commands/`에 복사해서 사용 가능.

## Mode Selection

- `save` or no args: 현재 작업 상태를 `.claude/memory/working-state.md`에 저장
- `recall`: 저장된 작업 상태 + 최근 세션 기록을 읽어서 맥락 복원
- `session-end`: 세션 요약을 날짜별 파일로 저장하고 working-state 초기화
- `status`: 메모리 폴더 현황 표시 (파일 목록, 마지막 저장 시각)

---

## Mode: save (작업 상태 저장)

현재 대화에서 파악한 맥락을 `.claude/memory/working-state.md`에 기록한다.

### 실행 순서

```
1. 현재 대화 맥락에서 아래 4가지를 추출:
   - 지금 하고 있는 것 (구체적 파일명/기능명 포함)
   - 핵심 결정사항 (왜 그렇게 결정했는지 이유 포함)
   - 다음 할 것 (우선순위 순서)
   - 주의사항 (놓치면 안 되는 것, 알려진 버그, 임시 상태 등)

2. `.claude/memory/working-state.md`에 기록 (기존 내용 덮어쓰기)

3. 형식:
```

```markdown
# 현재 작업 상태
> 마지막 업데이트: {YYYY-MM-DD HH:MM}

## 지금 하고 있는 것
- {구체적 설명}

## 핵심 결정사항
- {결정 내용} — 이유: {왜}

## 다음 할 것
1. {다음 작업 1}
2. {다음 작업 2}

## 주의사항
- {주의할 것}
```

```
4. 사용자에게 저장 완료 보고 (저장된 항목 수)
```

### 자동 저장 트리거 (CLAUDE.md 규칙과 연동)

이 커맨드를 수동으로 실행하지 않아도, CLAUDE.md의 메모리 규칙에 의해 AI가 자동으로 같은 파일을 업데이트한다. 이 커맨드는 "지금 당장 저장해줘"라고 명시적으로 요청할 때 사용.

---

## Mode: recall (맥락 복원)

저장된 메모리를 읽어서 현재 세션에 맥락을 복원한다.

### 실행 순서

```
1. `.claude/memory/working-state.md` 읽기
   - 있으면: 현재 작업 상태 파악
   - 없으면: "저장된 작업 상태 없음" 보고

2. `.claude/memory/` 폴더에서 세션 기록 파일 검색
   - 패턴: YYYY-MM-DD-*.md
   - 최근 3개 파일의 내용 읽기

3. 복원된 맥락 요약 보고:
   - 마지막 작업 상태 (working-state.md 기준)
   - 최근 세션 히스토리 (날짜 + 주제 + 한줄 요약)
   - 이어서 할 작업 제안

4. 형식:
```

```
📋 맥락 복원 완료

[마지막 작업 상태] (YYYY-MM-DD HH:MM 기준)
- 하던 것: {설명}
- 핵심 결정: {N}개
- 다음 할 것: {첫 번째 항목}

[최근 세션 기록]
| 날짜 | 주제 | 요약 |
|------|------|------|
| ... | ... | ... |

이어서 작업하시겠어요?
```

---

## Mode: session-end (세션 종료 정리)

현재 세션의 작업 내용을 날짜별 파일로 저장하고, working-state를 다음 세션을 위해 정리한다.

### 실행 순서

```
1. 현재 대화 맥락에서 세션 요약 추출:
   - 오늘 한 것 (주요 변경사항, 완료된 작업)
   - 중요한 결정들 (이유 포함)
   - 남은 것 (미완료 작업, 다음에 이어서 할 것)
   - 발견한 이슈 (버그, 기술 부채, 개선점)

2. `.claude/memory/YYYY-MM-DD-{주제}.md`로 저장
   - 주제는 오늘 작업의 핵심 키워드 (예: photo-review, auth-fix)
   - 같은 날 여러 세션이면 숫자 붙임 (예: 2026-03-09-photo-review-2.md)

3. 형식:
```

```markdown
# 세션 기록: {주제}
> 날짜: {YYYY-MM-DD}

## 오늘 한 것
- {완료된 작업 목록}

## 중요한 결정
- {결정} — 이유: {왜}

## 커밋 히스토리
- {hash} {message}

## 남은 것 (다음 세션에서 이어서)
- {미완료 작업}

## 발견한 이슈
- {이슈 목록}
```

```
4. `working-state.md` 업데이트
   - "지금 하고 있는 것" → 비움
   - "다음 할 것" → 남은 것으로 교체
   - 나머지 유지

5. 사용자에게 세션 정리 완료 보고
```

---

## Mode: status (메모리 현황)

### 실행 순서

```
1. `.claude/memory/` 폴더 존재 확인
   - 없으면: "메모리 폴더 없음. /kdh-memory save 로 첫 저장해주세요"

2. 파일 목록 + 마지막 수정 시각 표시

3. 형식:
```

```
📦 메모리 현황

작업 상태: working-state.md (마지막 업데이트: YYYY-MM-DD HH:MM)

세션 기록: N개
| 파일명 | 날짜 | 크기 |
|--------|------|------|
| ... | ... | ... |

총 용량: {KB}
```

---

## CLAUDE.md에 추가할 규칙 (자동 저장용)

이 커맨드를 설치할 때, 프로젝트의 CLAUDE.md에 아래 규칙을 추가해야 한다.
이 규칙이 있어야 AI가 커맨드 없이도 자동으로 상태를 저장한다.

```markdown
## 컨텍스트 메모리 규칙 (컴팩션 대비)
- 중요한 결정/방향 전환이 있을 때마다 `.claude/memory/working-state.md`에 현재 상태 기록
- 긴 작업 중 자연스러운 구간(기능 하나 완료, 방향 전환 등)마다 자동 업데이트
- 기록 항목: (1) 지금 하고 있는 것 (2) 핵심 결정사항 (3) 다음 할 것 (4) 주의사항
- 세션 종료 시 `.claude/memory/YYYY-MM-DD-주제.md`로 세션 요약 저장
- 새 세션 시작 시 `.claude/memory/working-state.md`와 최근 세션 기록을 먼저 읽을 것
```

---

## 디렉토리 구조

```
.claude/
├── commands/
│   └── kdh-memory.md          ← 이 파일
└── memory/
    ├── working-state.md        ← 현재 작업 상태 (자동 업데이트)
    ├── 2026-03-09-photo-review.md  ← 세션별 기록
    ├── 2026-03-08-org-setup.md
    └── ...
```

---

## 설치 방법

### 프로젝트에 설치

```bash
# 1. 커맨드 복사
cp kodonghui_full_pipeline/memory/kdh-memory.md [프로젝트]/.claude/commands/

# 2. 메모리 폴더 생성
mkdir -p [프로젝트]/.claude/memory

# 3. CLAUDE.md에 메모리 규칙 추가 (위의 "CLAUDE.md에 추가할 규칙" 참조)
```

### 글로벌 설치 (모든 프로젝트에서 사용)

```bash
# 1. 커맨드 복사
cp kodonghui_full_pipeline/memory/kdh-memory.md ~/.claude/commands/

# 2. 각 프로젝트에서 메모리 폴더는 별도 생성 필요
mkdir -p .claude/memory

# 3. 각 프로젝트의 CLAUDE.md에 메모리 규칙 추가
```

---

## 절대 규칙

1. `working-state.md`는 항상 **최신 상태** 유지 — 오래된 정보 방치 금지
2. 세션 기록 파일은 **삭제하지 말 것** — 나중에 맥락 추적용
3. 메모리에 **비밀번호, API 키, 토큰** 등 민감 정보 저장 금지
4. 자동 저장은 **과하게 자주 하지 말 것** — 자연스러운 구간에서만
5. recall 시 세션 기록은 **최근 3개만** 읽기 — 토큰 낭비 방지
