# Story 13.3: 파일 관리 UI 페이지

Status: done

## Story
As a 사용자, I want 파일을 시각적으로 관리할 수 있는 페이지가 있다, so that 업로드/다운로드/삭제를 쉽게 할 수 있다.

## Acceptance Criteria
1. /files 경로에 파일 관리 페이지 표시
2. 파일 목록 (이름, 크기, 날짜, 다운로드/삭제 버튼)
3. 파일 업로드 버튼 → FormData 전송
4. 사이드바에 "파일함" 메뉴 추가
5. turbo build 3/3 성공

## Dev Notes
### 새 파일
- `packages/app/src/pages/files.tsx` — 파일 관리 페이지
### 수정 파일
- `packages/app/src/App.tsx` — /files lazy 라우트 추가
- `packages/app/src/components/sidebar.tsx` — 파일함 메뉴 추가
