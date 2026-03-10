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

function Notifications() {
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
    {/* API: GET /api/workspace/notifications */}
    <main className="flex-1 overflow-y-auto px-8 py-10 relative flex justify-center">

        <div className="max-w-4xl w-full">
            <header className="mb-10 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-serif text-text-main mb-2">알림 센터</h1>
                    <p className="text-text-muted">에이전트의 작업 완료, 결재 요청, 시스템 경고 등을 통합하여 확인합니다.</p>
                </div>

                <div className="flex gap-2">
                    <button
                        className="text-sm font-medium text-text-muted hover:text-text-main hover:bg-surface-alt px-3 py-1.5 rounded-lg transition-colors">모두
                        읽음 처리</button>
                    <button
                        className="bg-surface border border-border text-text-main p-2 rounded-xl hover:bg-background-alt transition-colors shadow-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z">
                            </path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                    </button>
                </div>
            </header>

            {/* Filters */}
            <div className="flex gap-4 mb-6 border-b border-border pb-4">
                <button className="text-sm font-bold text-primary border-b-2 border-primary pb-4 -mb-4">전체 (3)</button>
                <button
                    className="text-sm font-medium text-text-muted hover:text-text-main transition-colors pb-4 -mb-4">멘션/호출</button>
                <button
                    className="text-sm font-medium text-text-muted hover:text-text-main transition-colors pb-4 -mb-4">시스템
                    경고</button>
                <button className="text-sm font-medium text-text-muted hover:text-text-main transition-colors pb-4 -mb-4">승인
                    대기함</button>
            </div>

            {/* Notifications List */}
            <div className="space-y-4">

                {/* Unread: Approval Request */}
                <div
                    className="card p-5 border-l-4 border-l-secondary bg-surface transition-all hover:shadow-float cursor-pointer relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-secondary m-5"></div>
                    <div className="flex items-start gap-4">
                        <div
                            className="w-10 h-10 rounded-full bg-secondary-light text-secondary flex items-center justify-center font-bold text-lg shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-text-main">소셜 미디어 매니저</span>
                                <span className="text-xs text-text-muted">마케팅부</span>
                                <span className="text-[10px] text-text-light ml-auto">10분 전</span>
                            </div>
                            <h3 className="font-serif text-lg text-text-main mb-2">오늘 자정 발행 예정 포스트 (X/Twitter) 승인 요청</h3>
                            <p className="text-sm text-text-muted line-clamp-2 leading-relaxed font-sans mb-4">
                                "새로운 #Corthex 에이전트 기능을 소개합니다! 워크플로우를 자동화하는 가장 쉬운 방법..." 포함된 이미지 1장과 함께 승인 대기 중입니다.
                            </p>

                            <div className="flex gap-2">
                                <button
                                    className="px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary-hover transition-colors shadow-sm">승인하기</button>
                                <button
                                    className="px-4 py-1.5 bg-surface border border-border text-text-main rounded-lg text-xs font-medium hover:bg-background-alt transition-colors shadow-sm">반려
                                    및 수정 피드백</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Unread: Report Ready */}
                <div
                    className="card p-5 border-l-4 border-l-primary bg-surface transition-all hover:shadow-float cursor-pointer relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-primary m-5"></div>
                    <div className="flex items-start gap-4">
                        <div
                            className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-lg shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                                </path>
                            </svg>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-text-main">데이터 애널리스트</span>
                                <span className="text-xs text-text-muted">전략 기획실</span>
                                <span className="text-[10px] text-text-light ml-auto">1시간 전</span>
                            </div>
                            <h3 className="font-serif text-lg text-text-main mb-2">요청하신 [경쟁사 3분기 실적 종합 분석] 보고서가 완성되었습니다.
                            </h3>
                            <p className="text-sm text-text-muted line-clamp-1 leading-relaxed font-sans mb-3">
                                PDF 다운로드 및 웹 뷰어에서 확인 가능합니다. (분석 시간: 4분 12초 소요)
                            </p>
                            <button
                                className="text-xs font-medium text-text-main bg-background-alt hover:bg-surface border border-border px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 w-max">
                                보고서 열기 (새 탭)
                            </button>
                        </div>
                    </div>
                </div>

                {/* Unread: System Warning */}
                <div
                    className="card p-5 border-l-4 border-l-accent bg-surface transition-all hover:shadow-float cursor-pointer relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-accent m-5"></div>
                    <div className="flex items-start gap-4">
                        <div
                            className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold text-lg shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-text-main text-accent">시스템 (보안 모니터링)</span>
                                <span className="text-[10px] text-text-light ml-auto">어제 22:40</span>
                            </div>
                            <h3 className="font-serif text-lg text-text-main mb-1">API 과다 호출 감지 안내</h3>
                            <p className="text-sm text-text-muted line-clamp-2 leading-relaxed font-sans">
                                "비서실장" 에이전트가 단기간 내에 이메일 발송 API를 50회 이상 호출했습니다. 정상적인 매스 이메일 발송인지 확인 바랍니다.
                            </p>
                            <div className="mt-3 flex gap-2 text-xs">
                                <span className="text-primary hover:underline font-medium">옵스 로그 확인</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Read: Job Complete */}
                <div className="card p-5 bg-background-alt opacity-75 hover:opacity-100 transition-opacity cursor-pointer">
                    <div className="flex items-start gap-4">
                        <div
                            className="w-10 h-10 rounded-full bg-surface border border-border text-text-muted flex items-center justify-center font-bold text-lg shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-text-muted">배치 작업 워커</span>
                                <span className="text-[10px] text-text-light ml-auto">이틀 전</span>
                            </div>
                            <h3 className="font-serif text-lg text-text-muted mb-1">Q2 마케팅 캠페인 A/B 테스트 지표 집계 완료</h3>
                        </div>
                    </div>
                </div>

            </div>

            <div className="mt-8 flex justify-center">
                <button
                    className="bg-surface border border-border text-text-main px-6 py-2 rounded-xl hover:bg-background-alt transition-colors font-medium shadow-sm">
                    이전 알림 더보기
                </button>
            </div>

        </div>
    </main>
    </>
  );
}

export default Notifications;
