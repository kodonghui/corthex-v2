# Part 4-04: 정리 + 전체 검증 (3분)

## 시나리오
생성한 데이터 정리 + Admin에서 모든 게 제대��� 반영됐는지 최종 확인.

## 테스트 단계

### 1. Admin으로 전환
1. https://corthex-hq.com/admin/login → admin / admin1234

### 2. 넥스트웨이브 데이터 확인
2. 회사 → 넥스트웨이브 → **확인**: 활성 상태
3. 직원 → **확인**: 최넥스트(nw-ceo), 한개발(nw-dev01) 존재
4. 부서 → **확인**: 개발본부, 마케팅팀 존재
5. 에이전트 → **확인**: 넥스트비서, 데이터분석봇 online
6. 비용 → **확인**: API 호출 기록 (Part 4-03 대화에서 발생)
7. 스크린샷: `screenshots/part4-04-admin-verify.png`

### 3. 모니터링 확인
8. 사이드바 → 모니터링 → **확인**: 서버 상태 표시
9. 스크린샷: `screenshots/part4-04-monitoring.png`

### 4. 데이터 정리 (선택)
10. 넥스트웨이브 회사 → 비활성화 (Deactivate)
11. **확인**: 비활성화 성공
12. 스크린샷: `screenshots/part4-04-cleanup.png`

---

## Part 4 전체 완료

풀 플로우 결과 정리:
1. Admin 세팅 → App 실사용 연결이 정상 작동하는지
2. 데이터 일관성 (Admin에서 만든 것이 App에서 보이는지)
3. 발견된 버그 전체 목록
4. Part 4 완료율: X/4 섹션
