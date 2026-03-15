# 2026-03-15: Pipeline Rewrite + Epic 16-21 Wrap-up

## 변경 사항

### Pipeline 개선
- kdh-full-auto: v6.0 → v7.0 (1,244 → 348줄, 72% 감소)
- kdh-uxui: v1.1 → v2.0 (1,026 → 503줄, 51% 감소)
- 변경 로그/중복/장황한 설명 삭제, 규칙 43→10개 압축
- 3 Critics × 2 personas 유지, stage-specific opus 유지

### Epic 16-21 마무리
- swarm 완료 보고서 생성 (swarm-epic-16-21-report.md)
- 회고 실행 (epic-16-21-retro-2026-03-15.md)
- sprint-status.yaml 업데이트

### 인프라
- Docker corthex-v2: CREDENTIAL_ENCRYPTION_KEY 환경변수 추가 → 컨테이너 정상 실행
- v1 폴더 삭제 (corthex/, CORTHEX_HQ/)
- tmux 모바일 키바인딩 (Tab=윈도우전환, Space=윈도우목록)
- kdh-libre 파이프라인 삭제

## 커밋
- `5cb42cc` — pipeline v6.0 + v1.1 stage-specific model strategy
- `3afd67b` — pipeline v7.0 + v2.0 rewrite (63% 감소)
