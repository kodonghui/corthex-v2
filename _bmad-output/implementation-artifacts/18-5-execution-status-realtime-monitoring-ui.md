# Story 18-5: Execution Status Realtime Monitoring UI

## Overview
실행 중인 워크플로우의 상태를 실시간으로 시각화하는 대시보드 컴포넌트.
각 스텝의 상태(pending/running/success/failed/skipped)를 색상 코드와 애니메이션으로 표현.

## Requirements
1. **실시간 상태 표시**: 각 스텝의 실행 상태를 타임라인/노드 형태로 시각화
2. **Analytics 통합**: Story 18-3의 `/analytics` 데이터를 차트로 표시
3. **실행 히스토리**: 최근 실행 목록과 성공/실패율 요약
4. **실행 트리거**: 워크플로우를 직접 실행하고 결과를 확인

## Technical Plan
- `WorkflowMonitor` 컴포넌트: 실행 상태 시각화
- `AnalyticsDashboard` 컴포넌트: 통계 차트 (lightweight-charts 활용)
- API 연동: `GET /analytics`, `POST /execute`
