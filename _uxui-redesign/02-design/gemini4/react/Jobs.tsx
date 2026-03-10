"use client";
import React from "react";

const styles = `
body {
            background-color: inherit /* FIXME: theme value not in map */;
            color: inherit /* FIXME: theme value not in map */;
        }

        .card {
            background-color: inherit /* FIXME: theme value not in map */;
            border-radius: 1rem;
            box-shadow: inherit /* FIXME: theme value not in map */;
            border: 1px solid inherit /* FIXME: theme value not in map */;
        }

        .nav-item {
            display: flex;
            items-center;
            gap: 0.75rem;
            padding: 0.75rem 1rem;
            border-radius: 0.75rem;
            color: inherit /* FIXME: theme value not in map */;
            font-weight: 500;
            transition: all 0.2s;
        }

        .nav-item:hover {
            background-color: inherit /* FIXME: theme value not in map */;
            color: inherit /* FIXME: theme value not in map */;
        }

        .nav-item.active {
            background-color: inherit /* FIXME: theme value not in map */;
            color: inherit /* FIXME: theme value not in map */;
            font-weight: 600;
        }

        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }

        ::-webkit-scrollbar-thumb {
            background: inherit /* FIXME: theme value not in map */;
            border-radius: 3px;
        }
`;

function Jobs() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Sidebar */}
    <aside className="w-64 bg-surface border-r border-border flex flex-col h-full z-10 shadow-soft shrink-0">
        <div className="p-6">
            <h2 className="font-serif text-2xl tracking-tight text-primary font-bold">CORTHEX</h2>
            <p className="text-xs text-text-light mt-1">회사명: 알파 랩스</p>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            <a href="/app/home" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6">
                    </path>
                </svg>
                홈 대시보드
            </a>
            <a href="/app/command-center" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z">
                    </path>
                </svg>
                사령관실
            </a>
            <p className="px-4 text-[10px] font-bold text-text-light uppercase tracking-widest mt-6 mb-2">백그라운드</p>
            <a href="/app/nexus" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5">
                    </path>
                </svg>
                워크플로우 (NEXUS)
            </a>
            <a href="/app/jobs" className="nav-item active">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10">
                    </path>
                </svg>
                작업 큐 대기열 (Jobs)
            </a>
        </nav>

        <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
                <div
                    className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold">
                    김</div>
                <div>
                    <p className="font-medium text-text-main">김대표 (CEO)</p>
                </div>
            </div>
        </div>
    </aside>

    {/* Main Content */}
    {/* API: GET /api/workspace/jobs */}
    <main className="flex-1 overflow-y-auto px-8 py-10 relative">
        <header className="mb-10 flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-serif text-text-main mb-2">작업 관리 대기열 (Job Queue)</h1>
                <p className="text-text-muted">장시간(수십 분~수 시간) 서버 백그라운드에서 실행되는 무거운 에이전트 작업들의 상태를 모니터링합니다.</p>
            </div>

            <button
                className="bg-surface border border-border text-text-main px-4 py-2 rounded-xl hover:bg-background-alt transition-colors font-medium shadow-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                지난 작업 정리
            </button>
        </header>

        <div className="grid lg:grid-cols-4 gap-8">

            {/* Left: Active & Pending Jobs Column */}
            <div className="lg:col-span-3 space-y-6">
                <h2 className="font-serif text-xl border-b border-border pb-2 text-text-main">진행 중인 작업 (2)</h2>

                {/* Active Job 1 */}
                <div className="card p-5 border-l-4 border-l-primary bg-primary/5">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg shadow-sm">
                                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                                    </path>
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-serif text-lg text-text-main font-bold">2023-2024 상장사 ESG 보고서 크롤링 및 감성
                                    분석</h3>
                                <p className="text-xs text-text-muted">담당자: 데이터 스페셜리스트 (전략 기획실)</p>
                            </div>
                        </div>
                        <span
                            className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-1 rounded shadow-sm">RUNNING</span>
                    </div>

                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-text-main font-medium mb-1">
                            <span>진행률: 65% (1,300 / 2,000 기업)</span>
                            <span>남은 시간: 약 45분</span>
                        </div>
                        <div className="w-full bg-background rounded-full h-2 mb-3">
                            <div className="bg-primary h-2 rounded-full transition-all duration-1000" style={{width: "65%"}}>
                            </div>
                        </div>

                        <div
                            className="bg-surface border border-border p-3 rounded-lg font-mono text-xs text-text-muted mt-3 shadow-sm h-20 overflow-hidden flex flex-col justify-end relative">
                            <p className="opacity-50">[14:20:01] Processing: KAKAO CORP ESG Report 2023.pdf ... Success</p>
                            <p className="opacity-70">[14:20:15] Extracting keywords and Sentiment analysis ... Done. Score:
                                0.82</p>
                            <p className="text-primary font-bold">[14:20:45] Fetching: NAVER CORP ESG Report 2023.pdf ...
                                (Downloading 4MB/15MB)</p>
                            <div className="absolute top-0 right-0 p-2 opacity-0 hover:opacity-100 transition-opacity">
                                <button
                                    className="text-[10px] bg-background-alt border border-border px-1.5 py-0.5 rounded">로그
                                    뷰어 열기</button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            className="px-4 py-1.5 border border-border rounded-lg text-xs font-medium bg-surface hover:bg-background-alt transition-colors">일시정지</button>
                        <button
                            className="px-4 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors">작업
                            취소</button>
                    </div>
                </div>

                {/* API: GET /api/workspace/jobs/:id/status */}
                {/* Pending Job 1 */}
                <div className="card p-5 border-dashed opacity-80">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-xl bg-surface border border-border text-text-muted flex items-center justify-center font-bold text-lg shadow-sm">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-serif text-lg text-text-main font-bold">Q2 마케팅 캠페인 A/B 테스트 지표 집계</h3>
                                <p className="text-xs text-text-muted">담당자: 마케팅부 (정기 배치)</p>
                            </div>
                        </div>
                        <span
                            className="bg-background-alt border border-border text-text-muted text-[10px] font-bold px-2 py-1 rounded shadow-sm">PENDING</span>
                    </div>
                    <p className="text-sm text-text-main ml-13">이전 작업(ESG 크롤링) 완료 후 실행 리소스 할당 대기 중입니다.</p>
                </div>

                <h2 className="font-serif text-xl border-b border-border pb-2 text-text-main mt-8 pt-4">최근 완료된 작업</h2>

                {/* Completed Job */}
                <div className="card p-4 hover:shadow-card transition-shadow cursor-pointer group">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-text-main group-hover:text-primary transition-colors">주간 전사 지출
                                    및 클라우드(API) 코스트 결산</h3>
                                <p className="text-[10px] text-text-muted">인사 재무팀 • 소요시간: 4분 12초 • 어제 완료됨</p>
                            </div>
                        </div>
                        <button
                            className="text-xs font-medium text-text-light hover:text-primary border border-border hover:border-primary-light bg-surface px-3 py-1.5 rounded-lg transition-colors shadow-sm">
                            결과 보고서 열기 (PDF)
                        </button>
                    </div>
                </div>

                {/* Failed Job */}
                <div className="card p-4 bg-red-50/20 hover:shadow-card transition-shadow group">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-text-main group-hover:text-red-700 transition-colors">Notion
                                    워크스페이스 대규모 동기화</h3>
                                <p className="text-[10px] text-text-muted">비서실 • 실패 사유: API 토큰 만료 (401) • 3일 전 실패함</p>
                            </div>
                        </div>
                        <button
                            className="text-xs font-medium text-text-light hover:text-text-main border border-border bg-surface px-3 py-1.5 rounded-lg transition-colors shadow-sm">
                            재시작 (Retry)
                        </button>
                    </div>
                </div>

            </div>

            {/* Right: Queue Stats / Worker Status */}
            <div className="space-y-6">
                <div className="card p-5 bg-surface-alt">
                    <h3 className="font-serif text-base mb-4 text-text-main">백그라운드 워커 (Workers)</h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                <span className="text-sm font-bold text-text-main">Worker #1 (Heavy)</span>
                            </div>
                            <span
                                className="text-[10px] bg-background-alt px-1.5 py-0.5 rounded text-text-muted border border-border">98%
                                점유</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-border"></div>
                                <span className="text-sm font-medium text-text-main">Worker #2 (Default)</span>
                            </div>
                            <span
                                className="text-[10px] bg-background-alt px-1.5 py-0.5 rounded text-text-muted border border-border">0%
                                대기중</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-border"></div>
                                <span className="text-sm font-medium text-text-main">Worker #3 (Light)</span>
                            </div>
                            <span
                                className="text-[10px] bg-background-alt px-1.5 py-0.5 rounded text-text-muted border border-border">0%
                                대기중</span>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border">
                        <button
                            className="w-full py-2 bg-surface border border-border rounded-lg text-xs font-medium text-text-main hover:bg-background-alt transition-colors shadow-sm">
                            우선순위 스케줄링 설정
                        </button>
                    </div>
                </div>
            </div>

        </div>
    </main>
    </>
  );
}

export default Jobs;
