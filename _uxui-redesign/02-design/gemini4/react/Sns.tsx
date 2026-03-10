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

        .sns-logo-box {
            background: linear-gradient(135deg, #0A66C2 0%, #004182 100%);
        }
`;

function Sns() {
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
            <p className="px-4 text-[10px] font-bold text-text-light uppercase tracking-widest mt-6 mb-2">마케팅</p>
            <a href="/app/sns" className="nav-item active">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z">
                    </path>
                </svg>
                SNS 스케줄러 (자동 게재)
            </a>
            <a href="/app/reports" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                    </path>
                </svg>
                콘텐츠 라이브러리
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
    {/* API: GET /api/workspace/sns/posts */}
    <main className="flex-1 overflow-y-auto px-8 py-10 relative">
        <header className="mb-10 flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-serif text-text-main mb-2">SNS 자동화 스케줄러</h1>
                <p className="text-text-muted">마케팅부서(콘텐츠 전문가)가 생성한 콘텐츠를 각 플랫폼에 연결하여 스케줄링하고 자동 게재합니다.</p>
            </div>

            <button
                className="bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-primary-hover transition-colors font-medium shadow-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
                새 포스트 작성 (마케팅팀 호출)
            </button>
        </header>

        {/* Connected Accounts */}
        {/* API: GET /api/workspace/sns/accounts */}
        <div className="mb-8">
            <h2 className="font-serif text-lg text-text-main mb-4">연결된 계정</h2>
            <div className="flex gap-4">
                <div className="bg-surface border border-border rounded-xl p-3 flex items-center gap-3 pr-8 shadow-sm">
                    <div
                        className="w-8 h-8 rounded-lg sns-logo-box text-white flex items-center justify-center font-bold font-serif text-xs">
                        in
                    </div>
                    <div>
                        <p className="font-bold text-sm">Alpha Labs Official</p>
                        <p className="text-[10px] text-text-muted">LinkedIn (Company Page)</p>
                    </div>
                </div>
                <div
                    className="card p-0 flex items-center justify-center border-dashed border-2 bg-transparent hover:bg-surface/50 transition-colors cursor-pointer px-4 w-40">
                    <span className="text-text-muted text-sm font-medium">+ 계정 연동</span>
                </div>
            </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Calendar/Timeline */}
            <div className="lg:col-span-2 space-y-6">

                {/* Status Tabs */}
                <div className="flex gap-4 border-b border-border">
                    <button className="pb-3 text-sm font-bold text-primary border-b-2 border-primary">게재 대기 (3)</button>
                    <button className="pb-3 text-sm font-medium text-text-muted hover:text-text-main">초안 검토 중 (1)</button>
                    <button className="pb-3 text-sm font-medium text-text-muted hover:text-text-main">게재 완료 내역</button>
                </div>

                {/* Scheduled Posts */}
                <div className="space-y-4">
                    {/* Post 1 */}
                    <div className="card p-0 overflow-hidden flex shadow-soft hover:shadow-float transition-shadow">
                        {/* Left indicator */}
                        <div className="w-2 bg-primary"></div>

                        <div className="flex-1 p-5 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-5 h-5 rounded sns-logo-box text-white flex items-center justify-center text-[8px] font-bold">
                                            in</div>
                                        <span className="text-xs font-bold text-text-main">LinkedIn</span>
                                    </div>
                                    <span
                                        className="bg-primary-light text-primary text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">내일
                                        오전 09:00 예약됨</span>
                                </div>

                                <h3 className="font-serif text-lg text-text-main mb-2">B2B 영업 효율화: AI 에이전트 도입 사례 분석</h3>
                                <p className="text-sm text-text-muted line-clamp-2 leading-relaxed font-sans mb-4">
                                    "최근 알파 랩스의 파트너사인 A기업은 영업팀에 'CORTHEX 문서 작성관'을 도입한 후, 제안서 작성 시간을 40% 단축하는 데 성공했습니다.
                                    복잡한 표와 수치가..."
                                </p>
                            </div>

                            <div className="flex justify-between items-center border-t border-border pt-4 mt-2">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-6 h-6 rounded-full border border-border bg-surface text-text-main flex items-center justify-center font-bold text-[10px]">
                                        콘</div>
                                    <span className="text-xs text-text-light">작성: 콘텐츠 전문가</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        className="text-xs font-medium text-text-muted hover:text-text-main px-3 py-1.5 border border-border rounded-lg">편집</button>
                                    <button
                                        className="text-xs font-medium text-danger hover:underline px-3 py-1.5">취소</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Post 2 */}
                    <div className="card p-0 overflow-hidden flex shadow-sm opacity-80 border-dashed">
                        <div className="w-2 bg-secondary"></div>
                        <div className="flex-1 p-5 flex flex-col justify-between bg-surface-alt/30">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-5 h-5 rounded sns-logo-box text-white flex items-center justify-center text-[8px] font-bold filter grayscale">
                                            in</div>
                                        <span className="text-xs font-bold text-text-main">LinkedIn</span>
                                    </div>
                                    <span
                                        className="bg-background-alt border border-border text-text-muted text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">초안:
                                        최고 경영자 승인 대기중</span>
                                </div>

                                <h3 className="font-serif text-lg text-text-main mb-2">이번주 금요일: 알파 에이전트 신규 기능 업데이트 안내</h3>
                                <p className="text-sm text-text-muted line-clamp-2 leading-relaxed font-sans mb-4">
                                    (본문 생성중...)
                                </p>
                            </div>

                            <div className="flex justify-between items-center border-t border-border pt-4 mt-2">
                                <button
                                    className="w-full py-2 bg-secondary text-white rounded-lg hover:bg-secondary-hover transition-colors font-medium text-xs">
                                    검토 및 승인하기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Right: Content Generation Prompt & Stats */}
            <div className="space-y-6">
                {/* API: GET /api/workspace/sns/analytics */}
                {/* Mini Stats */}
                <div className="card p-5">
                    <h3 className="font-serif text-base mb-4 border-b border-border pb-2">최근 게재 성과 (7일)</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-text-muted">노출 수 (Impressions)</span>
                            <span className="text-base font-bold text-text-main font-serif">14,280</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-text-muted">클릭률 (CTR)</span>
                            <span className="text-base font-bold text-text-main font-serif">4.2%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-text-muted">자동 생애 포스트</span>
                            <span className="text-base font-bold text-text-main font-serif">5건</span>
                        </div>
                    </div>
                </div>

                {/* Quick Prompt */}
                <div className="card p-0 overflow-hidden">
                    <div className="bg-primary/5 p-5 border-b border-border">
                        <div className="flex gap-2 items-center mb-1">
                            <div
                                className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center font-bold text-[10px]">
                                콘</div>
                            <h3 className="font-serif text-base">콘텐츠 스페셜리스트에게 지시</h3>
                        </div>
                    </div>
                    <div className="p-4 bg-surface">
                        <textarea
                            className="w-full h-24 p-3 border border-border rounded-xl text-sm focus:outline-none focus:border-primary-light resize-none mb-3 placeholder:text-text-light font-sans"
                            placeholder="예: 방금 발표된 오픈AI Sora 소식을 엮어서 우리 비디오 생성 AI 파이프라인 홍보하는 링크드인 포스트 작성해줘."></textarea>
                        <button
                            className="w-full py-2 bg-text-main text-white rounded-xl hover:bg-black transition-colors font-medium text-sm flex items-center justify-center gap-2">
                            초안 작성 시작
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>

    </main>
    </>
  );
}

export default Sns;
