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

        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }

        .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }

        .card {
            background-color: white;
            border-radius: 1.5rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
            border: 1px solid #f5f3ec;
            transition: all 0.2s ease;
        }

        .card:hover {
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
        }

        .progress-bar-warning {
            background-size: 200% 100%;
            animation: gradientMove 2s linear infinite;
            background-image: linear-gradient(90deg, #e07a5f 0%, #ebb4a4 50%, #e07a5f 100%);
        }

        @keyframes gradientMove {
            0% {
                background-position: 100% 0;
            }

            100% {
                background-position: -100% 0;
            }
        }
`;

function AppCosts() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Primary Sidebar */}
    <aside
        className="w-64 flex flex-col justify-between py-8 px-4 border-r border-base-200 bg-white/80 backdrop-blur-md z-20 shrink-0">
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

                <div className="pt-4 pb-2 px-4 text-xs font-bold text-base-300 uppercase tracking-wider">안전 및 자산</div>
                {/* Active menu */}
                <a href="#"
                    className="sidebar-item active flex items-center justify-between px-4 py-3 font-medium text-accent-terracotta bg-base-100 rounded-2xl transition-colors">
                    <div className="flex items-center gap-3">
                        <i className="ph ph-coins text-xl"></i> 예산/비용 관리
                    </div>
                </a>
                <a href="#"
                    className="sidebar-item flex items-center gap-3 px-4 py-3 text-text-muted hover:bg-base-100 rounded-2xl transition-colors">
                    <i className="ph ph-shield-check text-xl"></i> 보안 기밀 (Classified)
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
    <main className="flex-1 overflow-y-auto px-10 py-8 relative bg-[#fcfbf9]/50 hide-scrollbar">

        {/* Header (API: GET /api/workspace/costs/summary) */}
        <header
            className="flex justify-between items-end mb-8 sticky top-0 bg-[#fcfbf9]/80 backdrop-blur-md z-10 pt-2 pb-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-text-main">비용 예측 및 관리</h1>
                <p className="text-text-muted mt-1 text-sm">에이전트들이 사용하는 LLM API 토큰 및 클라우드 인프라 자원의 실시간 비용 추계입니다.</p>
            </div>

            <div className="flex items-center gap-3">
                <select
                    className="bg-white border border-base-200 px-4 py-2.5 rounded-xl text-text-main text-sm font-bold shadow-sm outline-none cursor-pointer">
                    <option>이번 달 (10월)</option>
                    <option>지난 달 (9월)</option>
                    <option>올해 전체</option>
                </select>
                {/* API: PUT /api/workspace/costs/budget */}
                <button
                    className="bg-text-main text-white px-5 py-2.5 rounded-full font-bold shadow-soft hover:bg-opacity-90 transition-all flex items-center gap-2">
                    <i className="ph ph-sliders-horizontal text-lg"></i> 예산 한도 설정
                </button>
            </div>
        </header>

        {/* Top Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

            {/* Total Cost Summary */}
            <div className="card p-8 bg-gradient-to-br from-[#fcfbf9] to-[#fdece6]/30 border-accent-terracotta/20">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <p
                            className="text-[11px] font-bold text-accent-terracotta uppercase tracking-wider flex items-center gap-1.5 mb-2">
                            <i className="ph ph-warning-circle text-sm mt-0.5"></i> 예산 소진 속도 주의
                        </p>
                        <h2 className="text-4xl font-bold tracking-tight text-text-main mb-1">₩1,420,500</h2>
                        <p className="text-sm text-text-muted">현재까지 발생 비용 (10. 01 - 10. 15)</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">총 설정 예산</p>
                        <p className="text-xl font-bold text-text-main mb-1">₩2,000,000</p>
                        <span
                            className="px-2.5 py-1 bg-accent-coral/10 text-accent-coral text-[11px] font-bold rounded-lg block w-max ml-auto">월말
                            예상: ₩2.8M (+40%)</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div>
                    <div className="flex justify-between text-xs font-bold text-text-main mb-2">
                        <span>71% 사용됨</span>
                        <span><span className="text-text-muted">남은 예산:</span> ₩579,500</span>
                    </div>
                    <div className="w-full bg-base-100 rounded-full h-3 overflow-hidden">
                        <div className="progress-bar-warning h-full rounded-full" style={{width: "71%"}}></div>
                    </div>
                </div>
            </div>

            {/* Trend Overview */}
            <div className="card p-8 flex flex-col justify-between relative overflow-hidden">
                <div className="flex justify-between items-start z-10 relative">
                    <div>
                        <h3 className="font-bold text-text-main text-xl mb-1">일별 토큰 지출 추이</h3>
                        <p className="text-xs text-text-muted">급격한 증가 구간 탐지 (10/14)</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xl font-bold text-text-main">+14.2%</p>
                        <p className="text-[10px] text-text-muted font-bold uppercase">전주 대비</p>
                    </div>
                </div>

                {/* Mock Area Chart */}
                <div className="absolute bottom-0 left-0 right-0 h-32 flex items-end pt-10">
                    <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stop-color="#e07a5f" stop-opacity="0.2" />
                                <stop offset="100%" stop-color="#e07a5f" stop-opacity="0" />
                            </linearGradient>
                        </defs>
                        {/* Trend Line */}
                        <path d="M0,25 L10,22 L20,24 L30,18 L40,20 L50,15 L60,16 L70,8 L80,10 L90,2 L100,5" fill="none"
                            stroke="#e07a5f" strokeWidth="1.5" vector-effect="non-scaling-stroke"></path>
                        {/* Area Fill */}
                        <path
                            d="M0,25 L10,22 L20,24 L30,18 L40,20 L50,15 L60,16 L70,8 L80,10 L90,2 L100,5 L100,30 L0,30 Z"
                            fill="url(#chartGradient)"></path>

                        {/* Spike Marker */}
                        <circle cx="90" cy="2" r="1.5" fill="#e07a5f"></circle>
                        <line x1="90" y1="2" x2="90" y2="30" stroke="#e07a5f" strokeWidth="0.5" stroke-dasharray="1,1">
                        </line>
                    </svg>
                    {/* Tooltip mock */}
                    <div
                        className="absolute right-[8%] top-[10%] bg-text-main text-white px-2 py-1 rounded text-[10px] font-bold shadow-sm whitespace-nowrap transform -translate-x-1/2">
                        ₩245.2k (개발부서 API 테스트)
                    </div>
                </div>
            </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

            {/* Cost by Department (API: GET /api/workspace/costs/departments) */}
            <div className="lg:col-span-2 card p-8 h-full">
                <h3 className="font-bold text-text-main text-lg mb-6">부서 및 에이전트별 지출 점유율</h3>

                <div className="space-y-6">

                    {/* Dept Item */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-6 h-6 rounded bg-accent-blue/10 text-accent-blue flex items-center justify-center text-xs">
                                    <i className="ph ph-code"></i></div>
                                <span className="font-bold text-sm text-text-main">개발본부 (코드리뷰 및 QA)</span>
                            </div>
                            <span className="font-bold text-sm text-text-main">₩840,000 <span
                                    className="text-text-muted font-normal text-xs ml-1">(59%)</span></span>
                        </div>
                        <div className="w-full bg-base-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-accent-blue h-full rounded-full" style={{width: "59%"}}></div>
                        </div>
                    </div>

                    {/* Dept Item */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-6 h-6 rounded bg-accent-terracotta/10 text-accent-terracotta flex items-center justify-center text-xs">
                                    <i className="ph ph-megaphone"></i></div>
                                <span className="font-bold text-sm text-text-main">마케팅부서 (콘텐츠 생성)</span>
                            </div>
                            <span className="font-bold text-sm text-text-main">₩425,000 <span
                                    className="text-text-muted font-normal text-xs ml-1">(30%)</span></span>
                        </div>
                        <div className="w-full bg-base-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-accent-terracotta h-full rounded-full" style={{width: "30%"}}></div>
                        </div>
                    </div>

                    {/* Dept Item */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-6 h-6 rounded bg-accent-green/10 text-accent-green flex items-center justify-center text-xs">
                                    <i className="ph ph-chart-line-up"></i></div>
                                <span className="font-bold text-sm text-text-main">전략실 (트레이딩 및 데이터 분석)</span>
                            </div>
                            <span className="font-bold text-sm text-text-main">₩112,500 <span
                                    className="text-text-muted font-normal text-xs ml-1">(8%)</span></span>
                        </div>
                        <div className="w-full bg-base-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-accent-green h-full rounded-full" style={{width: "8%"}}></div>
                        </div>
                    </div>

                    {/* Dept Item */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-6 h-6 rounded bg-base-200 text-text-muted flex items-center justify-center text-xs">
                                    <i className="ph ph-gear"></i></div>
                                <span className="font-bold text-sm text-text-main">자체 인프라 수동 스크래핑 봇</span>
                            </div>
                            <span className="font-bold text-sm text-text-main">₩43,000 <span
                                    className="text-text-muted font-normal text-xs ml-1">(3%)</span></span>
                        </div>
                        <div className="w-full bg-base-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-base-300 h-full rounded-full" style={{width: "3%"}}></div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Cost by AI Model / Service */}
            <div className="card p-8 bg-white h-full pb-10">
                <h3 className="font-bold text-text-main text-lg mb-6">사용 중인 모델/플랫폼 명세</h3>

                <div className="relative w-full aspect-square max-h-48 mx-auto mb-8 flex items-center justify-center">
                    {/* CSS Mock Donut Chart */}
                    <div
                        className="w-40 h-40 rounded-full border-[12px] border-[#10a37f] relative flex items-center justify-center">
                        <div
                            className="absolute inset-[-12px] rounded-full border-[12px] border-transparent border-t-[#4A90E2] border-r-[#4A90E2] transform rotate-45">
                        </div>
                        <div
                            className="absolute inset-[-12px] rounded-full border-[12px] border-transparent border-b-[#f4a261] transform -rotate-12">
                        </div>

                        <div className="text-center">
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Top Model
                            </p>
                            <p className="text-sm font-bold text-[#10a37f]">GPT-4o</p>
                            <p className="text-xs font-bold text-text-main">55%</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm bg-[#10a37f]"></div>
                            <span className="text-sm font-medium text-text-main">OpenAI (GPT-4o)</span>
                        </div>
                        <span className="text-sm font-bold text-text-main">₩781,275</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm bg-[#4A90E2]"></div>
                            <span className="text-sm font-medium text-text-main">Anthropic (Claude 3.5)</span>
                        </div>
                        <span className="text-sm font-bold text-text-main">₩497,175</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm bg-[#f4a261]"></div>
                            <span className="text-sm font-medium text-text-main">AWS 인프라 (DB/Storage)</span>
                        </div>
                        <span className="text-sm font-bold text-text-main">₩113,640</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm bg-base-300"></div>
                            <span className="text-sm font-medium text-text-main">기타 외부 API 연동</span>
                        </div>
                        <span className="text-sm font-bold text-text-main">₩28,410</span>
                    </div>
                </div>
            </div>

        </div>

    </main>
    </>
  );
}

export default AppCosts;
