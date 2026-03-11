# 2026-03-11 코드 감사 결과

## 배경
- 엔진 리팩토링 스프린트 64/64 완료 후 코드 전수 분석
- git pull로 새 PRD(엔진 리팩토링 기반 리라이트) + v5.1 pipeline 동기화

## 발견 사항

### CRITICAL: Hook 미연결
- engine/hooks/ 5개 파일 존재하나 agent-loop.ts에서 호출 없음
- tool-permission-guard, credential-scrubber, output-redactor, delegation-tracker, cost-tracker
- 보안 Hook이 프로덕션에서 완전히 우회됨

### CRITICAL: 이중 엔진
- 새 엔진(agent-loop.ts) 사용: hub.ts, agora, argos, call-agent (4곳)
- 옛 엔진(agent-runner.ts) 사용: chief-of-staff 경유 8곳+
- commands.ts, presets.ts, public-api, telegram은 전부 옛 경로

### HIGH: E8 경계 위반
- soul-renderer, model-selector가 engine/ 밖 4곳에서 직접 import

## PRD 용어 변경 확인
- 사령관실→허브, 정보국→라이브러리, 계급→티어, 위임→핸드오프, 크론→ARGOS

## 다음 조치
- `/kdh-full-auto-pipeline` v5.1로 해결 예정
