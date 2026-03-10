"use client";
import React from "react";

const styles = `
body {
            background-color: #0a0a0f;
            color: #f3f4f6;
            background-image: radial-gradient(circle at 15% 50%, rgba(168, 85, 247, 0.05), transparent 25%),
                radial-gradient(circle at 85% 30%, rgba(34, 211, 238, 0.05), transparent 25%);
            background-attachment: fixed;
            font-weight: 300;
            line-height: 1.5;
        }

        .num-bold {
            font-family: 'JetBrains Mono', monospace;
            font-weight: 700;
            letter-spacing: -0.05em;
        }

        .glass-panel {
            background-color: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 1rem;
        }

        .btn-primary {
            background: linear-gradient(135deg, #a855f7 0%, #22d3ee 100%);
            color: white;
            border: none;
            border-radius: 0.5rem;
            padding: 0.4rem 0.8rem;
            font-weight: 500;
            transition: all 0.3s ease;
            cursor: pointer;
            text-sm;
            box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .btn-buy {
            background-color: rgba(239, 68, 68, 0.15);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #ef4444;
            border-radius: 0.5rem;
            padding: 0.4rem 0.8rem;
            transition: all 0.3s ease;
            font-weight: 500;
            text-sm;
        }

        .btn-buy:hover {
            background-color: rgba(239, 68, 68, 0.25);
            box-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
        }

        .btn-sell {
            background-color: rgba(59, 130, 246, 0.15);
            border: 1px solid rgba(59, 130, 246, 0.3);
            color: #3b82f6;
            border-radius: 0.5rem;
            padding: 0.4rem 0.8rem;
            transition: all 0.3s ease;
            font-weight: 500;
            text-sm;
        }

        .btn-sell:hover {
            background-color: rgba(59, 130, 246, 0.25);
            box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
        }

        .btn-glass {
            background-color: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: white;
            border-radius: 0.5rem;
            padding: 0.4rem 0.8rem;
            transition: all 0.3s ease;
            backdrop-filter: blur(8px);
            cursor: pointer;
            font-weight: 400;
            text-sm;
        }

        .btn-glass:hover {
            background-color: rgba(255, 255, 255, 0.1);
        }

        .btn-icon {
            background: transparent;
            border: 1px solid transparent;
            color: #9ca3af;
            border-radius: 0.5rem;
            padding: 0.5rem;
            transition: all 0.2s ease;
            cursor: pointer;
        }

        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }

        ::-webkit-scrollbar-track {
            background: transparent;
        }

        ::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
        }

        .ticker-text-up {
            color: #ef4444;
        }

        /* Red for up (KR) */
        .ticker-text-down {
            color: #3b82f6;
        }

        /* Blue for down (KR) */
`;

function Trading() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Sidebar Navigation */}
    <aside
        className="w-64 flex flex-col border-r border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl h-full shrink-0 relative z-20">
        <div className="p-6">
            <h1 className="text-xl font-bold tracking-tight text-white mb-2">CORTHEX <span
                    className="text-xs font-normal text-white/40 ml-1">v2</span></h1>
        </div>

        <div className="p-4 flex-1 overflow-y-auto w-full">
            <div className="mb-4">
                <div className="text-xs text-white/30 font-semibold mb-2 px-2 uppercase tracking-wider">Workspace</div>
                <nav className="space-y-1">
                    <a href="/app/home"
                        className="flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <i className="fas fa-home w-4"></i> <span>홈</span>
                    </a>
                    <a href="/app/command-center"
                        className="flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <i className="fas fa-terminal w-4"></i> <span>사령관실</span>
                    </a>
                </nav>
            </div>

            <div className="mb-4">
                <div className="text-xs text-white/30 font-semibold mb-2 px-2 uppercase tracking-wider">Finance</div>
                <nav className="space-y-1">
                    <a href="#"
                        className="flex items-center gap-3 px-3 py-2 text-white bg-white/10 rounded-lg border border-white/10 transition-colors">
                        <i className="fas fa-chart-line w-4 text-accent-cyan"></i> <span>전략실 (트레이딩)</span>
                    </a>
                    <a href="#"
                        className="flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <i className="fas fa-history w-4"></i> <span>매매 내역</span>
                    </a>
                </nav>
            </div>
        </div>

        <div className="p-4 border-t border-white/5 text-xs">
            <div className="flex items-center gap-2 mb-2 px-2 text-green-400">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_5px_rgba(74,222,128,0.8)]"></div>
                KIS 증권 API 실시간 연동 중
            </div>
            <div
                className="bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 px-2 py-1.5 rounded text-center font-medium">
                모의투자 모드
            </div>
        </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 overflow-y-auto p-8 relative flex flex-col">
        {/* Live Ticker Bar */}
        <div
            className="absolute top-0 left-0 right-0 h-10 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur leading-10 overflow-hidden flex whitespace-nowrap z-10 text-sm font-light">
            <div className="animate-[marquee_30s_linear_infinite] inline-block px-4">
                <span className="mr-8"><span className="text-white/80 mr-2">삼성전자</span> <span
                        className="num-bold ticker-text-up">73,400 <i className="fas fa-caret-up ml-1 text-[10px]"></i>
                        1.2%</span></span>
                <span className="mr-8"><span className="text-white/80 mr-2">SK하이닉스</span> <span
                        className="num-bold ticker-text-down">128,500 <i className="fas fa-caret-down ml-1 text-[10px]"></i>
                        2.4%</span></span>
                <span className="mr-8"><span className="text-white/80 mr-2">NAVER</span> <span
                        className="num-bold ticker-text-up">192,000 <i className="fas fa-caret-up ml-1 text-[10px]"></i>
                        0.5%</span></span>
                <span className="mr-8"><span className="text-white/80 mr-2">현대차</span> <span
                        className="num-bold ticker-text-up">190,500 <i className="fas fa-caret-up ml-1 text-[10px]"></i>
                        1.8%</span></span>
                <span className="mr-8"><span className="text-white/80 mr-2">TSLA</span> <span
                        className="num-bold ticker-text-up">214.50 <i className="fas fa-caret-up ml-1 text-[10px]"></i>
                        3.2%</span></span>
                <span className="mr-8"><span className="text-white/80 mr-2">AAPL</span> <span
                        className="num-bold ticker-text-down">172.30 <i className="fas fa-caret-down ml-1 text-[10px]"></i>
                        0.4%</span></span>
            </div>
        </div>
        <style>
            @keyframes marquee {
                0% {
                    transform: translateX(100%);
                }

                100% {
                    transform: translateX(-100%);
                }
            }
        </style>

        <header className="flex justify-between items-end mb-6 mt-10">
            <div>
                <h2 className="text-2xl font-semibold mb-1 flex items-center gap-2">전략실 <span
                        className="bg-white/10 text-white/50 px-2 py-0.5 rounded text-xs ml-2 font-mono">Portfolio.Alpha</span>
                </h2>
                <p className="text-white/40 text-sm">AI 에이전트의 투자 분석 및 자동매매 체결 현황.</p>
            </div>
            <div className="flex gap-2">
                <button className="btn-glass"><i className="fas fa-sync-alt text-xs mr-2"></i>동기화</button>
                <button className="btn-primary"><i className="fas fa-plus mr-2 text-xs"></i>수동 주문</button>
            </div>
        </header>

        {/* Dashboard Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1">

            {/* Left Column: Portfolio & Orders */}
            <div className="xl:col-span-8 flex flex-col gap-6">

                {/* Portfolio Summary Component */}
                <div className="glass-panel p-6 flex items-center justify-between">
                    <div>
                        <div className="text-white/50 text-sm mb-1">총 평가 금액 (KRW)</div>
                        <div className="text-4xl num-bold text-white mb-2">₩ 124,530,200</div>
                        <div className="flex gap-4 text-sm font-medium">
                            <div className="ticker-text-up"><i className="fas fa-chart-line mr-1"></i> +₩ 3,420,000 (2.8%)</div>
                            <div className="text-white/40">주식 82% · 현금 18%</div>
                        </div>
                    </div>
                    {/* Mini Chart Concept */}
                    <div className="w-48 h-16 flex items-end gap-1 opacity-50 relative overflow-hidden">
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                            <path d="M0 30 L 10 25 L 20 28 L 30 15 L 40 18 L 50 10 L 60 12 L 70 5 L 80 8 L 90 2 L 100 0"
                                fill="none" className="stroke-accent-cyan" strokeWidth="2" />
                            <path
                                d="M0 30 L 10 25 L 20 28 L 30 15 L 40 18 L 50 10 L 60 12 L 70 5 L 80 8 L 90 2 L 100 0 L 100 40 L 0 40 Z"
                                className="fill-accent-cyan/10" />
                        </svg>
                    </div>
                </div>

                {/* Active Holdings */}
                <div className="glass-panel p-5 flex-1 flex flex-col">
                    <h3 className="text-white/80 font-medium mb-4 flex items-center gap-2">
                        <i className="fas fa-briefcase text-accent-cyan text-sm"></i> 보유 종목
                    </h3>

                    <table className="w-full text-left text-sm text-white/70">
                        <thead className="text-xs text-white/40 border-b border-white/5">
                            <tr>
                                <th className="pb-3 px-2 font-medium">종목</th>
                                <th className="pb-3 px-2 font-medium text-right">수량</th>
                                <th className="pb-3 px-2 font-medium text-right">평가금액</th>
                                <th className="pb-3 px-2 font-medium text-right">수익률</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <tr className="hover:bg-white/5 transition-colors">
                                <td className="py-3 px-2">
                                    <div className="font-medium text-white/90">삼성전자</div>
                                    <div className="text-xs text-white/40 font-mono">005930.KS</div>
                                </td>
                                <td className="py-3 px-2 text-right num-bold">450</td>
                                <td className="py-3 px-2 text-right num-bold">₩ 33,030,000</td>
                                <td className="py-3 px-2 text-right num-bold ticker-text-up">+4.2%</td>
                            </tr>
                            <tr className="hover:bg-white/5 transition-colors">
                                <td className="py-3 px-2">
                                    <div className="font-medium text-white/90">Tesla Inc</div>
                                    <div className="text-xs text-white/40 font-mono">TSLA.US</div>
                                </td>
                                <td className="py-3 px-2 text-right num-bold">120</td>
                                <td className="py-3 px-2 text-right num-bold">$ 25,740</td>
                                <td className="py-3 px-2 text-right num-bold ticker-text-up">+12.4%</td>
                            </tr>
                            <tr className="hover:bg-white/5 transition-colors">
                                <td className="py-3 px-2">
                                    <div className="font-medium text-white/90">NAVER</div>
                                    <div className="text-xs text-white/40 font-mono">035420.KS</div>
                                </td>
                                <td className="py-3 px-2 text-right num-bold">100</td>
                                <td className="py-3 px-2 text-right num-bold">₩ 19,200,000</td>
                                <td className="py-3 px-2 text-right num-bold ticker-text-down">-1.5%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Pending Orders (GET /api/workspace/strategy/orders/pending) */}
                <div className="glass-panel p-5 border-yellow-400/20 shadow-[0_0_15px_rgba(250,204,21,0.05)]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-white/80 font-medium flex items-center gap-2">
                            <i className="fas fa-exclamation-circle text-yellow-400 text-sm"></i>
                            CEO 승인 대기 주문 <span
                                className="bg-yellow-400 text-[#0a0a0f] text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1">2</span>
                        </h3>
                        <span className="text-xs text-white/50">CIO 및 종목분석가 자동매매 제안</span>
                    </div>

                    <div className="space-y-3">
                        <div
                            className="bg-[#151525] border border-white/5 rounded-xl p-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span
                                        className="bg-red-500/20 text-red-500 border border-red-500/30 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider">BUY</span>
                                    <span className="text-white font-medium">에코프로비엠 (247540)</span>
                                </div>
                                <div className="text-sm text-white/60 mb-2">150주 @ 보통가 (현재가: ₩ 284,500)</div>
                                <div
                                    className="text-xs text-accent-cyan bg-accent-cyan/10 px-2 py-1.5 rounded inline-block border border-accent-cyan/20">
                                    <i className="fas fa-robot mr-1"></i> <strong>분석 의견:</strong> 단기 낙폭 과대, 이차전지 수급 개선 기대.
                                    (신뢰도 85%)
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="btn-buy"><i className="fas fa-check mr-1 text-xs"></i> 승인 및 전송</button>
                                <button className="btn-glass !py-1"><i className="fas fa-times text-xs"></i> 반려</button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Right Column: Watchlist & Agent Analysis */}
            <div className="xl:col-span-4 flex flex-col gap-6">

                {/* Watchlist */}
                <div className="glass-panel p-5 flex-1 max-h-[400px] flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-white/80 font-medium flex items-center gap-2">
                            <i className="fas fa-list-ul text-accent-purple text-sm"></i> 관심 종목
                        </h3>
                        <button className="btn-icon !p-1 text-xs"><i className="fas fa-plus"></i></button>
                    </div>

                    <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                        <div
                            className="bg-white/5 hover:bg-white/10 p-3 rounded-lg border border-transparent hover:border-white/10 transition-colors flex justify-between items-center cursor-pointer">
                            <div>
                                <div className="font-medium text-white/90 text-sm">Apple Inc</div>
                                <div className="text-[10px] text-white/40 font-mono">AAPL.US</div>
                            </div>
                            <div className="text-right">
                                <div className="num-bold text-sm text-white">$ 172.30</div>
                                <div className="text-xs ticker-text-down font-mono">-0.4%</div>
                            </div>
                        </div>
                        <div
                            className="bg-white/5 hover:bg-white/10 p-3 rounded-lg border border-transparent hover:border-white/10 transition-colors flex justify-between items-center cursor-pointer">
                            <div>
                                <div className="font-medium text-white/90 text-sm">SK하이닉스</div>
                                <div className="text-[10px] text-white/40 font-mono">000660.KS</div>
                            </div>
                            <div className="text-right">
                                <div className="num-bold text-sm text-white">₩ 128,500</div>
                                <div className="text-xs ticker-text-up font-mono">+2.4%</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Strategy Chat Quick Access */}
                <div className="glass-panel p-5 bg-gradient-to-b from-white/5 to-transparent border-t-accent-cyan/30">
                    <div className="flex items-center gap-3 mb-4">
                        <div
                            className="w-8 h-8 rounded-full bg-base-200 border border-accent-cyan/50 flex items-center justify-center relative">
                            <i className="fas fa-user-tie text-accent-cyan text-xs"></i>
                            <div
                                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border border-base-100">
                            </div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-white/90">CIO 에이전트 브리핑</div>
                            <div className="text-xs text-white/40">10분 전 분석 완료</div>
                        </div>
                    </div>
                    <div className="text-sm text-white/70 font-light leading-relaxed mb-4">
                        "오늘 밤 발표될 미국 CPI 지수 결과에 따라 내일 국내장 변동성이 커질 것으로 예상됩니다. 현금 비중 18% 유지를 권장합니다."
                    </div>
                    <button
                        className="w-full btn-glass text-xs border-accent-cyan/30 hover:border-accent-cyan/60 text-accent-cyan">
                        <i className="fas fa-comment-dots mr-2"></i>더 깊은 분석 요청하기
                    </button>
                </div>
            </div>

        </div>

    </main>
    </>
  );
}

export default Trading;
