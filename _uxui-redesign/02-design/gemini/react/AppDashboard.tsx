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

        .card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04);
        }

        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            display: inline-block;
        }

        .status-working {
            background-color: #e57373;
            box-shadow: 0 0 0 3px rgba(229, 115, 115, 0.2);
        }

        .status-idle {
            background-color: #81b29a;
        }

        .status-offline {
            background-color: #d5cfc1;
        }
`;

function AppDashboard() {
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
                    className="sidebar-item flex items-center gap-3 px-4 py-3 text-text-muted hover:bg-base-100 rounded-2xl transition-colors">
                    <i className="ph ph-chats text-xl"></i> 채팅
                </a>
                <a href="#"
                    className="sidebar-item active flex items-center gap-3 px-4 py-3 font-medium text-accent-terracotta bg-base-100 rounded-2xl transition-colors">
                    <i className="ph ph-chart-line-up text-xl"></i> 분석 대시보드
                </a>
            </nav>
        </div>
        <div>
            <nav className="space-y-2">
                <div className="mt-4 px-4 py-3 flex items-center gap-3 border-t border-base-200">
                    <img src="https://i.pravatar.cc/100?img=11" alt="Profile"
                        className="w-10 h-10 rounded-full border border-base-300" />
                    <div>
                        <p className="text-sm font-semibold text-text-main">김대표</p>
                        <p className="text-xs text-text-muted">CEO</p>
                    </div>
                </div>
            </nav>
        </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 overflow-y-auto px-10 py-8">

        {/* Header */}
        <header className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-text-main">분석 대시보드</h1>
                <p className="text-text-muted mt-1 text-sm">LLM API 사용량, 부서별 비용, 에이전트 상태를 상세 조회합니다.</p>
            </div>

            <div className="flex items-center gap-3">
                <div
                    className="bg-white border text-text-main border-base-200 rounded-full px-4 py-2 flex items-center gap-2 shadow-sm font-medium text-sm">
                    <i className="ph ph-calendar-blank text-text-muted text-lg"></i>
                    <span>2026.03.01 - 2026.03.31</span>
                    <i className="ph ph-caret-down text-text-muted ml-1"></i>
                </div>
                {/* API: GET /api/workspace/dashboard/stats */}
                <button
                    className="w-10 h-10 rounded-full bg-white border border-base-200 flex items-center justify-center text-text-muted hover:bg-base-100 transition-colors shadow-sm">
                    <i className="ph ph-download-simple text-lg"></i>
                </button>
            </div>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="card p-6 flex flex-col justify-center">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-medium text-text-muted">총 사용 토큰</h3>
                    <div className="w-8 h-8 rounded-full bg-[#fdece6] text-accent-coral flex items-center justify-center">
                        <i className="ph ph-cpu text-lg"></i>
                    </div>
                </div>
                <div className="text-3xl font-bold text-text-main">2.4<span
                        className="text-lg text-text-muted ml-1 font-medium">M</span></div>
                <div className="mt-2 text-xs font-semibold text-accent-green flex items-center gap-1">
                    <i className="ph ph-trend-up"></i> +5.2% (전월 대비)
                </div>
            </div>

            <div className="card p-6 flex flex-col justify-center">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-medium text-text-muted">이번 달 청구 예상 금액</h3>
                    <div className="w-8 h-8 rounded-full bg-[#fef5ec] text-accent-amber flex items-center justify-center">
                        <i className="ph ph-receipt text-lg"></i>
                    </div>
                </div>
                <div className="text-3xl font-bold text-text-main">$148.50</div>
                <div className="mt-2 text-xs font-medium text-text-muted flex items-center gap-1">
                    배치 API 50% 할인으로 $42 절약됨
                </div>
            </div>

            <div className="card p-6 flex flex-col justify-center">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-medium text-text-muted">평균 오케스트레이션 시간</h3>
                    <div className="w-8 h-8 rounded-full bg-[#e8f3ef] text-accent-green flex items-center justify-center">
                        <i className="ph ph-timer text-lg"></i>
                    </div>
                </div>
                <div className="text-3xl font-bold text-text-main">48<span
                        className="text-lg text-text-muted ml-1 font-medium">초</span></div>
                <div className="mt-2 text-xs font-semibold text-accent-green flex items-center gap-1">
                    <i className="ph ph-trend-down"></i> -1.2초 (전월 대비)
                </div>
            </div>
        </div>

        {/* Middle Section: Graph & Bar Chart */}
        <div className="grid grid-cols-3 gap-6 mb-8">

            {/* Usage Trend Chart */}
            {/* API: GET /api/workspace/dashboard/usage */}
            <div className="col-span-2 card p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-text-main">LLM 모델별 사용량 추이</h2>
                    <div className="flex gap-4 text-xs font-medium">
                        <div className="flex items-center gap-1.5"><span
                                className="w-3 h-3 rounded-full bg-accent-terracotta"></span> Claude 3.5 Sonnet</div>
                        <div className="flex items-center gap-1.5"><span
                                className="w-3 h-3 rounded-full bg-accent-amber"></span> Claude 3 Haiku</div>
                        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-base-300"></span>
                            GPT-4o Mini</div>
                    </div>
                </div>
                {/* Placeholder for Chart area */}
                <div className="h-64 w-full relative">
                    {/* Simple Y-axis */}
                    <div
                        className="absolute inset-y-0 left-0 flex flex-col justify-between text-[10px] text-text-muted z-10">
                        <span>100k</span>
                        <span>75k</span>
                        <span>50k</span>
                        <span>25k</span>
                        <span>0</span>
                    </div>
                    {/* Grid Lines */}
                    <div className="absolute inset-x-8 inset-y-0 flex flex-col justify-between z-0">
                        <div className="border-b border-base-100 w-full h-0"></div>
                        <div className="border-b border-base-100 w-full h-0"></div>
                        <div className="border-b border-base-100 w-full h-0"></div>
                        <div className="border-b border-base-100 w-full h-0"></div>
                        <div className="border-b border-base-200 w-full h-0"></div>
                    </div>
                    {/* Chart SVG Placeholder */}
                    <svg className="absolute inset-0 pl-8 w-full h-full bottom-0 left-0 right-0 z-10" viewBox="0 0 100 100"
                        preserveAspectRatio="none">
                        {/* Sonnet line */}
                        <path d="M0,80 Q10,75 20,85 T40,60 T60,55 T80,45 T100,20" fill="none" stroke="#e07a5f"
                            strokeWidth="2"></path>
                        {/* Haiku line */}
                        <path d="M0,90 Q15,85 30,70 T60,65 T80,30 T100,10" fill="none" stroke="#f4a261" strokeWidth="2"
                            stroke-dasharray="4,2"></path>
                    </svg>
                    {/* X-axis */}
                    <div
                        className="absolute bottom-[-24px] inset-x-8 flex justify-between text-[10px] text-text-muted py-1">
                        <span>03.01</span>
                        <span>03.05</span>
                        <span>03.10</span>
                        <span>03.15</span>
                        <span>03.20</span>
                        <span>03.25</span>
                        <span>03.31</span>
                    </div>
                </div>
            </div>

            {/* Agent Cost Distribution */}
            {/* API: GET /api/workspace/dashboard/costs/by-agent */}
            <div className="card p-6 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-base font-bold text-text-main">부서별 비용 비중</h2>
                    <i className="ph ph-chart-pie-slice text-xl text-text-muted"></i>
                </div>

                <div className="flex-1 flex flex-col justify-center items-center py-4 relative">
                    {/* Donut Chart Placeholder */}
                    <div
                        className="w-40 h-40 rounded-full border-[12px] border-base-100 flex items-center justify-center relative">
                        <div className="absolute inset-0 rounded-full border-[12px] border-accent-terracotta"
                            style={{clipPath: "polygon(0 0, 100% 0, 100% 50%, 50% 50%)", transform: "rotate(0deg)"}}></div>
                        <div className="absolute inset-0 rounded-full border-[12px] border-accent-amber"
                            style={{clipPath: "polygon(100% 50%, 100% 100%, 50% 100%, 50% 50%)", transform: "rotate(0deg)"}}>
                        </div>
                        <div className="absolute inset-0 rounded-full border-[12px] border-accent-green"
                            style={{clipPath: "polygon(0 50%, 50% 50%, 50% 100%, 0 100%)", transform: "rotate(0deg)"}}>
                        </div>

                        <div className="text-center">
                            <span className="block text-xl font-bold text-text-main">$148.5</span>
                            <span className="block text-[10px] text-text-muted">총합</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 mt-4">
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2"><span
                                className="w-2.5 h-2.5 rounded-full bg-accent-terracotta"></span> 마케팅부</div>
                        <span className="font-semibold text-text-main">45%</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2"><span
                                className="w-2.5 h-2.5 rounded-full bg-accent-amber"></span> 투자전략실</div>
                        <span className="font-semibold text-text-main">30%</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2"><span
                                className="w-2.5 h-2.5 rounded-full bg-accent-green"></span> 법무팀</div>
                        <span className="font-semibold text-text-main">15%</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-base-300"></span>
                            기타부서</div>
                        <span className="font-semibold text-text-main">10%</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Bottom Section: Agent Status List */}
        {/* API: GET /api/workspace/agents */}
        <div className="card p-0 overflow-hidden">
            <div className="p-6 border-b border-base-200 flex justify-between items-center">
                <h2 className="text-base font-bold text-text-main">실시간 에이전트 상태</h2>
                <div className="flex items-center gap-4 text-xs font-medium text-text-muted">
                    <span className="flex items-center gap-1.5"><span className="status-dot status-working"></span> 작업중
                        (3)</span>
                    <span className="flex items-center gap-1.5"><span className="status-dot status-idle"></span> 대기중 (15)</span>
                    <span className="flex items-center gap-1.5"><span className="status-dot status-offline"></span> 오프라인
                        (0)</span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-base-50 text-xs text-text-muted font-medium border-b border-base-200">
                            <th className="py-3 px-6 font-medium tracking-wide">에이전트명</th>
                            <th className="py-3 px-6 font-medium tracking-wide">부서</th>
                            <th className="py-3 px-6 font-medium tracking-wide">계급 / 모델</th>
                            <th className="py-3 px-6 font-medium tracking-wide">상태</th>
                            <th className="py-3 px-6 font-medium tracking-wide text-right">월간 누적 호출</th>
                        </tr>
                    </thead>
                    <tbody className="text-[13px] text-text-main divide-y divide-base-100">
                        <tr className="hover:bg-base-50 transition-colors">
                            <td className="py-3 px-6">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded-full bg-accent-terracotta/10 text-accent-terracotta flex items-center justify-center font-bold">
                                        C</div>
                                    <span className="font-bold">비서실장 (Chief of Staff)</span>
                                </div>
                            </td>
                            <td className="py-3 px-6 text-text-muted">시스템 에이전트</td>
                            <td className="py-3 px-6">
                                <span
                                    className="px-2 py-1 bg-base-100 border border-base-200 rounded text-[11px] font-medium mr-1 text-text-muted">Manager</span>
                                <span className="text-text-muted text-[11px]">Sonnet</span>
                            </td>
                            <td className="py-3 px-6">
                                <div className="flex items-center gap-2">
                                    <span className="status-dot status-working"></span>
                                    <span className="font-semibold text-accent-coral">명령 분류 중</span>
                                </div>
                            </td>
                            <td className="py-3 px-6 text-right font-medium">1,245회</td>
                        </tr>
                        <tr className="hover:bg-base-50 transition-colors">
                            <td className="py-3 px-6">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded-full bg-accent-amber/10 text-accent-amber flex items-center justify-center font-bold font-serif">
                                        A</div>
                                    <span className="font-bold">투자전략실장</span>
                                </div>
                            </td>
                            <td className="py-3 px-6 text-text-muted">전략실</td>
                            <td className="py-3 px-6">
                                <span
                                    className="px-2 py-1 bg-base-100 border border-base-200 rounded text-[11px] font-medium mr-1 text-text-muted">Manager</span>
                                <span className="text-text-muted text-[11px]">Sonnet</span>
                            </td>
                            <td className="py-3 px-6">
                                <div className="flex items-center gap-2">
                                    <span className="status-dot status-working"></span>
                                    <span className="font-semibold text-accent-coral">KIS 시세 조회 중</span>
                                </div>
                            </td>
                            <td className="py-3 px-6 text-right font-medium">892회</td>
                        </tr>
                        <tr className="hover:bg-base-50 transition-colors">
                            <td className="py-3 px-6">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded-full bg-accent-green/10 text-accent-green flex items-center justify-center font-bold font-serif">
                                        S</div>
                                    <span className="font-bold">시황분석가</span>
                                </div>
                            </td>
                            <td className="py-3 px-6 text-text-muted">전략실</td>
                            <td className="py-3 px-6">
                                <span
                                    className="px-2 py-1 bg-base-100 border border-base-200 rounded text-[11px] font-medium mr-1 text-text-muted">Specialist</span>
                                <span className="text-text-muted text-[11px]">Haiku</span>
                            </td>
                            <td className="py-3 px-6">
                                <div className="flex items-center gap-2">
                                    <span className="status-dot status-idle"></span>
                                    <span className="font-medium text-text-muted">대기 중</span>
                                </div>
                            </td>
                            <td className="py-3 px-6 text-right font-medium">351회</td>
                        </tr>
                        <tr className="hover:bg-base-50 transition-colors">
                            <td className="py-3 px-6">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded-full bg-base-200 text-text-main flex items-center justify-center font-bold font-serif">
                                        C</div>
                                    <span className="font-bold">콘텐츠 전문가</span>
                                </div>
                            </td>
                            <td className="py-3 px-6 text-text-muted">마케팅부</td>
                            <td className="py-3 px-6">
                                <span
                                    className="px-2 py-1 bg-base-100 border border-base-200 rounded text-[11px] font-medium mr-1 text-text-muted">Worker</span>
                                <span className="text-text-muted text-[11px]">Haiku</span>
                            </td>
                            <td className="py-3 px-6">
                                <div className="flex items-center gap-2">
                                    <span className="status-dot status-idle"></span>
                                    <span className="font-medium text-text-muted">대기 중</span>
                                </div>
                            </td>
                            <td className="py-3 px-6 text-right font-medium">512회</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="px-6 py-4 bg-base-50 border-t border-base-200 text-center">
                <button className="text-xs font-bold text-accent-terracotta hover:underline transition-all">모든 에이전트 보기
                    &rarr;</button>
            </div>
        </div>

    </main>
    </>
  );
}

export default AppDashboard;
