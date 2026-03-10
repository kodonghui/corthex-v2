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
            transition: all 0.3s;
        }

        .card:hover {
            transform: translateY(-2px);
            box-shadow: inherit /* FIXME: theme value not in map */;
            border-color: inherit /* FIXME: theme value not in map */;
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

        /* Grid Masonry-like layout */
        .columns-break-inside-avoid {
            break-inside: avoid;
        }
`;

function Reports() {
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
            <p className="px-4 text-[10px] font-bold text-text-light uppercase tracking-widest mt-6 mb-2">아카이브</p>
            <a href="/app/reports" className="nav-item active">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                    </path>
                </svg>
                보고서 및 콘텐츠
            </a>
            <a href="/app/files" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                </svg>
                공용 파일함 (RAG)
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
    {/* API: GET /api/workspace/reports */}
    <main className="flex-1 overflow-y-auto px-8 py-10 relative">
        <header className="mb-10 flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-serif text-text-main mb-2">산출물 라이브러리 (Reports)</h1>
                <p className="text-text-muted">에이전트들이 생성한 최종 보고서, 기획서, 분석 결과를 열람하고 다운로드합니다.</p>
            </div>

            <div className="flex gap-2">
                <div className="relative w-64">
                    <svg className="w-4 h-4 text-text-light absolute left-3 top-2.5" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <input type="text"
                        className="w-full bg-surface border border-border text-text-main rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary-light shadow-sm"
                        placeholder="문서 제목, 에이전트명 검색..." />
                </div>
                <button
                    className="bg-surface border border-border text-text-main p-2 rounded-xl hover:bg-background-alt transition-colors shadow-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z">
                        </path>
                    </svg>
                </button>
            </div>
        </header>

        {/* Categories / Tags */}
        <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
            <button className="px-4 py-1.5 rounded-full bg-primary text-white text-xs font-bold shadow-sm shrink-0">전체
                산출물</button>
            <button
                className="px-4 py-1.5 rounded-full bg-surface border border-border text-text-main hover:bg-background-alt hover:border-text-light transition-colors text-xs font-medium shrink-0 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                    </path>
                </svg> 투자/리서치 (12)
            </button>
            <button
                className="px-4 py-1.5 rounded-full bg-surface border border-border text-text-main hover:bg-background-alt hover:border-text-light transition-colors text-xs font-medium shrink-0 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z">
                    </path>
                </svg> 마케팅/기획 (8)
            </button>
            <button
                className="px-4 py-1.5 rounded-full bg-surface border border-border text-text-main hover:bg-background-alt hover:border-text-light transition-colors text-xs font-medium shrink-0">
                📄 문서 (Notion)
            </button>
            <button
                className="px-4 py-1.5 rounded-full bg-surface border border-border text-text-main hover:bg-background-alt hover:border-text-light transition-colors text-xs font-medium shrink-0">
                📊 스프레드시트
            </button>
            <button
                className="px-4 py-1.5 rounded-full bg-surface border border-border text-text-main hover:bg-background-alt hover:border-text-light transition-colors text-xs font-medium shrink-0">
                💬 회의록
            </button>
        </div>

        {/* Document Grid (Masonry-like) */}
        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">

            {/* Report Card 1 */}
            <div className="card p-0 overflow-hidden columns-break-inside-avoid cursor-pointer group">
                <div className="p-5 border-b border-border bg-surface-alt flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-6 h-6 rounded bg-text-muted text-white flex items-center justify-center font-bold text-xs shadow-sm">
                            비</div>
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">주간 동향 요약</span>
                    </div>
                </div>
                <div className="p-5">
                    <h3 className="font-serif text-lg text-text-main mb-3 group-hover:text-primary transition-colors">4월
                        2주차: 거시경제 및 AI 섹터 동향 보고서</h3>
                    <div
                        className="bg-background-alt border border-border rounded-xl p-4 font-sans text-xs text-text-muted mb-4 h-32 overflow-hidden relative">
                        <p className="whitespace-pre-line leading-relaxed">
                            요약:
                            1. 미 CPI 예상치 상회에도 불구하고 AI 빅테크 실적 호조로 나스닥 0.5% 상승.
                            2. 오픈AI 신규 모델 발표 임박 루머로 AI 하드웨어 밸류체인 수급 집중.
                            3. 특히 HBM 관련 국내 반도체 장비주(KOR) 강세 유지...
                        </p>
                        <div
                            className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-background-alt to-transparent">
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-xs text-text-light mt-auto">
                        <span>오늘 10:45 AM</span>
                        <div className="flex gap-2">
                            <span className="hover:text-primary"><svg className="w-4 h-4" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z">
                                    </path>
                                </svg></span>
                            <span className="hover:text-primary"><svg className="w-4 h-4" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                </svg></span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Card 2 (Image/Slide) */}
            <div className="card p-0 overflow-hidden columns-break-inside-avoid cursor-pointer group">
                <div className="h-32 bg-secondary-light flex items-center justify-center p-4 relative">
                    <div
                        className="w-full h-full border-2 border-dashed border-secondary/30 rounded flex items-center justify-center bg-surface/50 font-serif font-bold text-secondary">
                        신제품 런칭 기획안.md (Notion)
                    </div>
                    <div
                        className="absolute top-2 right-2 bg-surface text-secondary px-2 py-0.5 rounded text-[10px] shadow-sm font-bold">
                        마케팅부</div>
                </div>
                <div className="p-5">
                    <h3 className="font-serif text-lg text-text-main mb-2 group-hover:text-secondary transition-colors">알파
                        에이전트 GTM (Go-to-market) 전략</h3>
                    <p className="text-sm text-text-muted line-clamp-2 leading-relaxed font-sans mb-4">
                        경쟁사(X, Y) 대비 당사 LLM 파이프라인의 강점을 어필하는 소셜 미디어 드립 캠페인. 페르소나 설계 완료.
                    </p>
                    <div
                        className="flex justify-between items-center text-xs text-text-light mt-auto pt-4 border-t border-border">
                        <span className="flex items-center gap-1"><span
                                className="w-1.5 h-1.5 rounded-full bg-secondary block"></span> 마케팅팀장 작성</span>
                        <span>어제 16:20</span>
                    </div>
                </div>
            </div>

            {/* Report Card 3 */}
            <div className="card p-0 overflow-hidden columns-break-inside-avoid cursor-pointer group">
                <div className="p-5 border-b border-border bg-surface-alt flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-6 h-6 rounded border border-border bg-surface text-text-main flex items-center justify-center font-bold text-xs shadow-sm">
                            시</div>
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">단일 종목 분석</span>
                    </div>
                </div>
                <div className="p-5">
                    <h3 className="font-serif text-lg text-text-main mb-3 group-hover:text-primary transition-colors">TSML
                        (Taiwan Semiconductor) 실적 리뷰 및 밸류에이션</h3>
                    <div className="flex gap-2 mb-4">
                        <span
                            className="bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded text-xs font-bold">Strong
                            Buy</span>
                        <span
                            className="bg-background-alt border border-border text-text-muted px-2 py-0.5 rounded text-xs font-bold">Target:
                            $165</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-text-light pt-4 border-t border-border">
                        <span>이틀 전</span>
                        <div className="flex gap-2">
                            <span className="hover:text-primary flex items-center gap-1"><svg className="w-3.5 h-3.5"
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                                    </path>
                                </svg> PDF</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Card 4 (Generated Code Layout) */}
            <div className="card p-0 overflow-hidden columns-break-inside-avoid cursor-pointer group">
                <div className="bg-[#1e1e1e] p-4 font-mono text-xs text-[#d4d4d4] h-32 overflow-hidden relative">
                    <div className="text-[#569cd6] font-bold mb-1">def calculate_risk_parity(portfolio):</div>
                    <div className="pl-4 text-[#6A9955] italic mb-1">"""Calc weight allocations"""</div>
                    <div className="pl-4">cov = portfolio.cov()</div>
                    <div className="pl-4">inv_vol = 1 / np.sqrt(np.diag(cov))</div>
                    <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#1e1e1e] to-transparent">
                    </div>
                </div>
                <div className="p-5">
                    <h3 className="font-serif text-lg text-text-main mb-2 group-hover:text-primary transition-colors">Risk
                        Parity 포트폴리오 백테스팅 파이썬 스크립트</h3>
                    <p className="text-sm text-text-muted line-clamp-2 leading-relaxed font-sans mb-4">
                        어제 요청하신 5개 자산군에 대한 리스크 패리티 백테스팅 코드입니다. (기간: 2010~2024년)
                    </p>
                    <div
                        className="flex justify-between items-center text-xs text-text-light mt-auto pt-4 border-t border-border">
                        <span className="flex items-center gap-1"><span
                                className="w-1.5 h-1.5 rounded-full bg-accent block"></span> 데이터 스페셜리스트</span>
                        <span>3월 5일</span>
                    </div>
                </div>
            </div>

        </div>

        {/* Load More */}
        <div className="mt-8 flex justify-center">
            <button
                className="bg-surface border border-border text-text-main px-6 py-2 rounded-xl hover:bg-background-alt transition-colors font-medium shadow-sm">
                과거 보고서 더 불러오기
            </button>
        </div>

    </main>
    </>
  );
}

export default Reports;
