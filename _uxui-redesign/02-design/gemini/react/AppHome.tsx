"use client";
import React from "react";

const styles = `
body {
            background-color: #fcfbf9;
            color: #2c2c2c;
            /* Subtly hide scrollbar for clean look */
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
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04);
        }
        .sidebar-item {
            transition: all 0.2s ease;
        }
        .sidebar-item:hover, .sidebar-item.active {
            background-color: #f5f3ec;
            color: #e07a5f;
            border-radius: 1rem;
        }
`;

function AppHome() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Sidebar */}
    <aside className="w-64 flex flex-col justify-between py-8 px-4 border-r border-base-200 bg-base-50/50 backdrop-blur-md">
        <div>
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 mb-10">
                <div className="w-8 h-8 rounded-full bg-accent-terracotta flex items-center justify-center text-white font-bold text-lg">
                    C
                </div>
                <span className="text-xl font-bold tracking-tight text-text-main">CORTHEX</span>
            </div>

            {/* Navigation */}
            {/* Associated APIs for Nav: general workspace routing */}
            <nav className="space-y-2">
                <a href="#" className="sidebar-item active flex items-center gap-3 px-4 py-3 font-medium text-text-main">
                    <i className="ph ph-squares-four text-xl"></i>
                    홈
                </a>
                <a href="#" className="sidebar-item flex items-center gap-3 px-4 py-3 text-text-muted">
                    <i className="ph ph-terminal-window text-xl"></i>
                    사령관실
                </a>
                <a href="#" className="sidebar-item flex items-center gap-3 px-4 py-3 text-text-muted">
                    <i className="ph ph-chats text-xl"></i>
                    채팅
                </a>
                <a href="#" className="sidebar-item flex items-center gap-3 px-4 py-3 text-text-muted">
                    <i className="ph ph-chart-line-up text-xl"></i>
                    전략실
                </a>
                <a href="#" className="sidebar-item flex items-center gap-3 px-4 py-3 text-text-muted">
                    <i className="ph ph-users-three text-xl"></i>
                    부서 및 직원
                </a>
            </nav>
        </div>

        <div>
            {/* Bottom Nav */}
            <nav className="space-y-2">
                <a href="#" className="sidebar-item flex items-center gap-3 px-4 py-3 text-text-muted">
                    <i className="ph ph-gear text-xl"></i>
                    설정
                </a>
                {/* User Profile */}
                <div className="mt-4 px-4 py-3 flex items-center gap-3 border-t border-base-200">
                    <img src="https://i.pravatar.cc/100?img=11" alt="Profile" className="w-10 h-10 rounded-full border border-base-300" />
                    <div>
                        <p className="text-sm font-semibold text-text-main">김대표</p>
                        <p className="text-xs text-text-muted">CEO</p>
                    </div>
                </div>
            </nav>
        </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 flex flex-col h-full overflow-y-auto px-10 py-8">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-text-main">작전현황</h1>
                <p className="text-text-muted mt-1 text-sm">현재 CORTHEX 조직의 활동 및 상태 요약입니다.</p>
            </div>
            
            <div className="flex items-center gap-4">
                {/* 퀵 액션 (API: GET /api/workspace/dashboard/quick-actions) */}
                <button className="px-5 py-2.5 bg-accent-terracotta text-white font-medium rounded-full hover:bg-opacity-90 transition-colors shadow-soft flex items-center gap-2">
                    <i className="ph ph-lightning text-lg"></i>
                    새로운 작전 지시
                </button>
                <div className="relative">
                    <button className="w-10 h-10 rounded-full bg-white border border-base-200 flex items-center justify-center text-text-main hover:bg-base-100 transition-colors">
                        <i className="ph ph-bell text-xl"></i>
                        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-accent-coral rounded-full border-2 border-white"></span>
                    </button>
                </div>
            </div>
        </header>

        {/* Summary Cards */}
        {/* API: GET /api/workspace/dashboard/summary */}
        <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="card p-6 flex flex-col">
                <div className="w-10 h-10 rounded-full bg-[#fdece6] text-accent-terracotta flex items-center justify-center mb-4">
                    <i className="ph ph-check-circle text-xl"></i>
                </div>
                <h3 className="text-sm font-medium text-text-muted mb-1">오늘 완료된 작업</h3>
                <div className="text-3xl font-bold text-text-main">124<span className="text-sm font-medium text-text-muted ml-1">건</span></div>
                <div className="mt-2 text-xs font-medium text-accent-green flex items-center gap-1">
                    <i className="ph ph-trend-up"></i> 어제 대비 12% 증가
                </div>
            </div>

            <div className="card p-6 flex flex-col">
                <div className="w-10 h-10 rounded-full bg-[#e8f3ef] text-accent-green flex items-center justify-center mb-4">
                    <i className="ph ph-robot text-xl"></i>
                </div>
                <h3 className="text-sm font-medium text-text-muted mb-1">활성 에이전트</h3>
                <div className="text-3xl font-bold text-text-main">18<span className="text-sm font-medium text-text-muted ml-1">/ 24명</span></div>
                <div className="mt-2 text-xs font-medium text-text-muted">
                    6개 부서에서 근무 중
                </div>
            </div>

            <div className="card p-6 flex flex-col">
                <div className="w-10 h-10 rounded-full bg-[#fef5ec] text-accent-amber flex items-center justify-center mb-4">
                    <i className="ph ph-coins text-xl"></i>
                </div>
                <h3 className="text-sm font-medium text-text-muted mb-1">오늘 사용 비용</h3>
                <div className="text-3xl font-bold text-text-main">$4.20</div>
                <div className="mt-2 text-xs font-medium text-text-muted flex items-center gap-1">
                    <i className="ph ph-trend-down text-accent-green"></i> 3계급 모델 배정으로 42% 절감
                </div>
            </div>

            <div className="card p-6 flex flex-col">
                <div className="w-10 h-10 rounded-full bg-[#f5f3ec] text-text-main flex items-center justify-center mb-4">
                    <i className="ph ph-plugs-connected text-xl"></i>
                </div>
                <h3 className="text-sm font-medium text-text-muted mb-1">연동 서비스 상태</h3>
                <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e8f3ef] text-accent-green text-xs font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-green"></span> KIS 증권
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e8f3ef] text-accent-green text-xs font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-green"></span> Claude
                    </span>
                </div>
                <div className="mt-3 text-xs font-medium text-text-muted">
                    125+ 도구 정상 작동
                </div>
            </div>
        </div>

        {/* Lower Section (Charts & Bars) */}
        <div className="grid grid-cols-3 gap-6">
            
            {/* Usage Graph */}
            {/* API: GET /api/workspace/dashboard/usage */}
            <div className="col-span-2 card p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-text-main">LLM 사용량 추이</h2>
                    <select className="px-3 py-1.5 bg-base-50 border border-base-200 rounded-full text-sm font-medium text-text-muted focus:outline-none">
                        <option>최근 7일</option>
                        <option>이번 달</option>
                    </select>
                </div>
                {/* Placeholder for Chart.js / Recharts */}
                <div className="h-64 w-full bg-base-50 rounded-2xl border border-base-200 border-dashed flex items-center justify-center text-text-muted flex-col gap-2 relative overflow-hidden">
                    <i className="ph ph-chart-line text-3xl opacity-50"></i>
                    <span className="text-sm font-medium opacity-50">[ 차트 컴포넌트 렌더링 영역 ]</span>
                    
                    {/* decorative illustrative line */}
                    <svg className="absolute bottom-0 w-full h-1/2 opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0,100 L0,80 Q25,100 50,50 T100,20 L100,100 Z" fill="#e07a5f"></path>
                    </svg>
                </div>
            </div>

            <div className="flex flex-col gap-6">
                {/* Budget Management */}
                {/* API: GET /api/workspace/dashboard/budget */}
                <div className="card p-6 flex-1">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-text-main">예산 관리</h2>
                        <i className="ph ph-wallet text-xl text-text-muted"></i>
                    </div>
                    
                    <div className="mb-5">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-text-muted font-medium">이번 달 예산 ($200)</span>
                            <span className="font-bold text-text-main">62% 사용</span>
                        </div>
                        <div className="w-full h-3 bg-base-100 rounded-full overflow-hidden">
                            <div className="h-full bg-accent-terracotta rounded-full" style={{width: "62%"}}></div>
                        </div>
                        <p className="text-xs text-text-muted mt-2 text-right">$124 / $200</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-text-muted">마케팅부</span>
                                <span className="font-medium text-text-main">$58</span>
                            </div>
                            <div className="w-full h-1.5 bg-base-100 rounded-full overflow-hidden">
                                <div className="h-full bg-accent-amber rounded-full" style={{width: "45%"}}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-text-muted">투자전략실</span>
                                <span className="font-medium text-text-main">$42</span>
                            </div>
                            <div className="w-full h-1.5 bg-base-100 rounded-full overflow-hidden">
                                <div className="h-full bg-accent-coral rounded-full" style={{width: "35%"}}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-text-muted">법무팀</span>
                                <span className="font-medium text-text-main">$24</span>
                            </div>
                            <div className="w-full h-1.5 bg-base-100 rounded-full overflow-hidden">
                                <div className="h-full bg-accent-green rounded-full" style={{width: "20%"}}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Satisfaction */}
                {/* API: GET /api/workspace/dashboard/satisfaction */}
                <div className="card p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-bold text-text-main mb-1">CEO 만족도</h2>
                        <div className="text-xs text-text-muted flex items-center gap-1">
                            품질 검수 통과율
                        </div>
                    </div>
                    <div className="w-16 h-16 rounded-full border-4 border-accent-green border-r-base-100 flex items-center justify-center transform -rotate-45">
                        <span className="text-lg font-bold text-text-main transform rotate-45">92%</span>
                    </div>
                </div>

            </div>
        </div>

    </main>
    </>
  );
}

export default AppHome;
