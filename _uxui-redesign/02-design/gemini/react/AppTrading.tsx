"use client";
import React from "react";

const styles = `
body {
            background-color: #fcfbf9;
            color: #2c2c2c;
            -ms-overflow-style: none;
            scrollbar-width: none;
        }

        body::-webkit-scrollbar {
            display: none;
        }

        .card {
            background-color: white;
            border-radius: 1.5rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
            border: 1px solid #f5f3ec;
            transition: all 0.2s ease;
        }

        /* hide scrollbar for list */
        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }

        .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
`;

function AppTrading() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Sidebar */}
    <aside
        className="w-64 flex flex-col justify-between py-8 px-4 border-r border-base-200 bg-base-50/50 backdrop-blur-md shrink-0">
        <div>
            <div className="flex items-center gap-3 px-4 mb-10">
                <div
                    className="w-8 h-8 rounded-full bg-accent-terracotta flex items-center justify-center text-white font-bold text-lg">
                    C</div>
                <span className="text-xl font-bold tracking-tight text-text-main">CORTHEX</span>
            </div>
            <nav className="space-y-2">
                <a href="#"
                    className="sidebar-item flex items-center gap-3 px-4 py-3 text-text-muted hover:bg-base-100 rounded-2xl transition-colors">
                    <i className="ph ph-squares-four text-xl"></i> 홈
                </a>
                <a href="#"
                    className="sidebar-item flex items-center gap-3 px-4 py-3 text-text-muted hover:bg-base-100 rounded-2xl transition-colors">
                    <i className="ph ph-terminal-window text-xl"></i> 사령관실
                </a>
                <a href="#"
                    className="sidebar-item active flex items-center gap-3 px-4 py-3 font-medium text-accent-terracotta bg-base-100 rounded-2xl transition-colors">
                    <i className="ph ph-chart-line-up text-xl"></i> 전략실
                </a>
            </nav>
        </div>
        <div>
            <nav className="space-y-2">
                <div className="mt-4 px-4 py-3 flex items-center gap-3 border-t border-base-200">
                    <img src="https://i.pravatar.cc/100?img=11" alt="Profile"
                        className="w-10 h-10 rounded-full border border-base-300" />
                    <div>
                        <p className="text-sm font-semibold text-text-main">이사장</p>
                        <p className="text-xs text-text-muted">CEO</p>
                    </div>
                </div>
            </nav>
        </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 overflow-y-auto px-10 py-8 relative">

        {/* Header */}
        <header className="flex justify-between items-center mb-8 sticky top-0 bg-[#fcfbf9]/80 backdrop-blur-md z-20 pb-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-text-main">전략실</h1>
                <p className="text-text-muted mt-1 text-sm">포트폴리오 현황을 모니터링하고 AI 자동매매를 지휘합니다.</p>
            </div>

            <div className="flex items-center gap-4">
                {/* Trading Mode Toggle (API: PUT /api/workspace/strategy/settings/trading-mode) */}
                <div className="bg-base-100 p-1 rounded-full flex items-center shadow-inner">
                    <button
                        className="px-4 py-1.5 rounded-full text-sm font-bold bg-white text-text-main shadow-sm">모의투자</button>
                    <button
                        className="px-4 py-1.5 rounded-full text-sm font-medium text-text-muted hover:text-text-main transition-colors">실전투자</button>
                </div>

                <div
                    className="bg-white border text-text-main border-base-200 rounded-full px-4 py-2 flex items-center gap-2 shadow-sm font-medium text-sm">
                    <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse"></span>
                    KIS 연동 정상
                </div>
            </div>
        </header>

        {/* Portfolio Overview (API: GET /api/workspace/strategy/shares) */}
        <div className="grid grid-cols-4 gap-6 mb-8">
            <div
                className="card p-6 col-span-2 flex justify-between items-center bg-gradient-to-br from-white to-[#fef5ec]">
                <div>
                    <h3 className="text-sm font-medium text-text-muted mb-1">총 자산 추정 자산</h3>
                    <div className="text-3xl font-bold text-text-main flex items-baseline gap-2">
                        124,530,000<span className="text-lg font-medium text-text-muted">원</span>
                    </div>
                    <div className="mt-2 text-sm font-bold text-trade-up flex items-center gap-1">
                        <i className="ph ph-caret-up"></i> +1,245,000원 (1.01%)
                    </div>
                </div>
                <div
                    className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-accent-terracotta border-4 border-[#fdece6]">
                    <i className="ph ph-wallet text-3xl"></i>
                </div>
            </div>

            <div className="card p-6 flex flex-col justify-center">
                <h3 className="text-sm font-medium text-text-muted mb-1">투자 원금</h3>
                <div className="text-2xl font-bold text-text-main">100,000,000<span
                        className="text-sm text-text-muted ml-1 font-medium">원</span></div>
                <div className="mt-2 text-xs font-semibold text-trade-up flex items-center gap-1">
                    <span className="text-text-muted font-medium">총 수익률</span> +24.53%
                </div>
            </div>

            <div className="card p-6 flex flex-col justify-center">
                <h3 className="text-sm font-medium text-text-muted mb-1">주문 가능 금액</h3>
                <div className="text-2xl font-bold text-text-main border-b border-base-100 pb-1 mb-1">12,450,000<span
                        className="text-sm text-text-muted ml-1 font-medium">원</span></div>
                <div className="text-xs font-medium text-text-muted flex justify-between">
                    <span>증거금 현황</span>
                    <span className="text-text-main">정상</span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-3 gap-6">

            {/* Left Column: Chart & Order Queue */}
            <div className="col-span-2 flex flex-col gap-6">

                {/* Chart Area (API: GET /api/workspace/strategy/shares/:symbol/chart) */}
                <div className="card p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-full bg-[#e8e4d9] flex items-center justify-center text-text-main font-bold">
                                S
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-text-main leading-tight">삼성전자</h2>
                                <p className="text-xs font-medium text-text-muted">005930 | KOSPI</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xl font-bold text-trade-up">73,400원</div>
                            <div className="text-xs font-medium text-trade-up flex items-center gap-1 justify-end">
                                <i className="ph ph-caret-up"></i> +1,200 (1.66%)
                            </div>
                        </div>
                    </div>

                    <div
                        className="h-[280px] w-full border border-base-200 rounded-xl relative overflow-hidden bg-base-50 flex items-center justify-center text-text-muted flex-col">
                        {/* Placeholder for candlestick chart */}
                        <i className="ph ph-chart-candlestick text-4xl mb-2 opacity-30"></i>
                        <span className="text-xs font-medium opacity-50">[ 캔들스틱 차트 영역 ]</span>
                    </div>

                    <div className="flex gap-2 mt-4">
                        <button
                            className="flex-1 py-3 rounded-xl bg-trade-up text-white font-bold shadow-soft hover:opacity-90 transition-opacity">매수</button>
                        <button
                            className="flex-1 py-3 rounded-xl bg-trade-down text-white font-bold shadow-soft hover:opacity-90 transition-opacity">매도</button>
                    </div>
                </div>

                {/* AI Order Queue (API: GET /api/workspace/strategy/orders/pending) */}
                <div className="card p-0 overflow-hidden">
                    <div className="px-6 py-4 border-b border-base-200 flex justify-between items-center bg-[#fcfbf9]">
                        <h2 className="text-base font-bold text-text-main flex items-center gap-2">
                            <i className="ph ph-robot text-accent-terracotta"></i> CIO 제안 대기열
                        </h2>
                        <span className="px-2 py-0.5 rounded bg-accent-amber/10 text-accent-amber text-xs font-bold">승인 대기
                            2건</span>
                    </div>

                    <div className="divide-y divide-base-100">
                        {/* AI Order Item */}
                        <div className="p-6 hover:bg-base-50 transition-colors">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span
                                            className="px-2 py-0.5 rounded text-white text-xs font-bold bg-trade-up">매수</span>
                                        <span className="font-bold text-text-main">현대차 (005380)</span>
                                    </div>
                                    <p className="text-[13px] text-text-muted mt-2 leading-relaxed w-5/6">
                                        "비서실장 및 시황분석가 의견 종합 결과, 금일 환율 효과 및 북미 시장 실적 호조에 따라 단기 반등 예상. 목표가 260,000원."
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="text-sm font-bold text-text-main">20주</div>
                                    <div className="text-xs text-text-muted">시장가</div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-4">
                                <div
                                    className="flex items-center gap-2 text-xs text-text-muted font-medium bg-base-100 px-3 py-1.5 rounded-full">
                                    <i className="ph ph-shield-check text-accent-green"></i> 리스크 평가: 안전 (포트폴리오 비중 5% 이내)
                                </div>
                                <div className="flex gap-2">
                                    {/* API: POST /api/workspace/strategy/orders/:id/reject */}
                                    <button
                                        className="px-4 py-1.5 rounded-lg border border-base-200 text-text-muted font-medium hover:bg-base-100 text-sm">거절</button>
                                    {/* API: POST /api/workspace/strategy/orders/:id/approve */}
                                    <button
                                        className="px-4 py-1.5 rounded-lg bg-text-main text-white font-bold shadow-soft hover:bg-opacity-90 text-sm flex items-center gap-1">
                                        승인 실행
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* AI Order Item */}
                        <div className="p-6 hover:bg-base-50 transition-colors opacity-90">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span
                                            className="px-2 py-0.5 rounded text-white text-xs font-bold bg-trade-down">매도</span>
                                        <span className="font-bold text-text-main">NAVER (035420)</span>
                                    </div>
                                    <p className="text-[13px] text-text-muted mt-2 leading-relaxed w-5/6">
                                        "선제적 리스크 관리. 기술적 하향 돌파 감지 및 플랫폼 규제 이슈 부각에 따라 비중 축소 제안."
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="text-sm font-bold text-text-main">전량 (45주)</div>
                                    <div className="text-xs text-text-muted">시장가</div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    className="px-4 py-1.5 rounded-lg border border-base-200 text-text-muted font-medium hover:bg-base-100 text-sm">거절</button>
                                <button
                                    className="px-4 py-1.5 rounded-lg bg-text-main text-white font-bold shadow-soft hover:bg-opacity-90 text-sm">승인
                                    실행</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Watchlist & Holdings */}
            <div className="flex flex-col gap-6 h-[850px]">
                {/* Watchlist (API: GET /api/workspace/strategy/watchlist) */}
                <div className="card flex flex-col h-1/2 overflow-hidden">
                    <div className="p-5 border-b border-base-200 flex justify-between items-center shrink-0">
                        <h2 className="text-sm font-bold text-text-main">와치리스트</h2>
                        <button className="text-text-muted hover:text-text-main"><i className="ph ph-plus text-lg"></i></button>
                    </div>
                    <div className="overflow-y-auto p-2 hide-scrollbar">
                        <div
                            className="p-3 hover:bg-base-50 rounded-xl flex justify-between items-center cursor-pointer transition-colors mb-1">
                            <div>
                                <h4 className="font-bold text-sm text-text-main">SK하이닉스</h4>
                                <span className="text-[10px] text-text-muted">000660</span>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium text-trade-up">158,200</div>
                                <div className="text-[10px] font-bold text-trade-up">+1.41%</div>
                            </div>
                        </div>
                        <div
                            className="p-3 bg-base-100 rounded-xl flex justify-between items-center cursor-pointer mb-1 border border-base-200 shadow-sm">
                            <div>
                                <h4 className="font-bold text-sm text-text-main">삼성전자</h4>
                                <span className="text-[10px] text-text-muted">005930</span>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium text-trade-up">73,400</div>
                                <div className="text-[10px] font-bold text-trade-up">+1.66%</div>
                            </div>
                        </div>
                        <div
                            className="p-3 hover:bg-base-50 rounded-xl flex justify-between items-center cursor-pointer transition-colors mb-1">
                            <div>
                                <h4 className="font-bold text-sm text-text-main">카카오</h4>
                                <span className="text-[10px] text-text-muted">035720</span>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium text-trade-down">48,100</div>
                                <div className="text-[10px] font-bold text-trade-down">-2.04%</div>
                            </div>
                        </div>
                        <div
                            className="p-3 hover:bg-base-50 rounded-xl flex justify-between items-center cursor-pointer transition-colors mb-1">
                            <div>
                                <h4 className="font-bold text-sm text-text-main">LG에너지솔루션</h4>
                                <span className="text-[10px] text-text-muted">373220</span>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium text-text-muted">392,500</div>
                                <div className="text-[10px] font-bold text-text-muted">0.00%</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Holden Shares (API: GET /api/workspace/strategy/shares) */}
                <div className="card flex flex-col h-1/2 overflow-hidden">
                    <div className="p-5 border-b border-base-200 flex justify-between items-center shrink-0">
                        <h2 className="text-sm font-bold text-text-main">보유 종목</h2>
                        <span className="text-xs font-medium text-text-muted">4종목</span>
                    </div>
                    <div className="overflow-y-auto p-2 hide-scrollbar">
                        <div
                            className="p-3 hover:bg-base-50 rounded-xl flex justify-between items-center cursor-pointer transition-colors mb-1">
                            <div>
                                <h4 className="font-bold text-sm text-text-main">삼성전자</h4>
                                <span className="text-[10px] text-text-muted">120주</span>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium text-trade-up">8,808,000</div>
                                <div className="text-[10px] font-bold text-trade-up">+5.21%</div>
                            </div>
                        </div>
                        <div
                            className="p-3 hover:bg-base-50 rounded-xl flex justify-between items-center cursor-pointer transition-colors mb-1">
                            <div>
                                <h4 className="font-bold text-sm text-text-main">NAVER</h4>
                                <span className="text-[10px] text-text-muted">45주</span>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium text-trade-down">8,235,000</div>
                                <div className="text-[10px] font-bold text-trade-down">-4.12%</div>
                            </div>
                        </div>
                        <div
                            className="p-3 hover:bg-base-50 rounded-xl flex justify-between items-center cursor-pointer transition-colors mb-1">
                            <div>
                                <h4 className="font-bold text-sm text-text-main">현대모비스</h4>
                                <span className="text-[10px] text-text-muted">60주</span>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium text-trade-up">14,220,000</div>
                                <div className="text-[10px] font-bold text-trade-up">+8.40%</div>
                            </div>
                        </div>
                    </div>
                    {/* API: POST /api/workspace/strategy/portfolio/reset */}
                    <div className="px-5 py-3 border-t border-base-200 bg-base-50 shrink-0">
                        <button
                            className="w-full py-2 bg-white border border-base-200 rounded-lg text-xs font-bold text-text-muted shadow-sm hover:text-text-main">
                            포트폴리오 설정
                        </button>
                    </div>
                </div>
            </div>

        </div>

    </main>
    </>
  );
}

export default AppTrading;
