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
            cursor: pointer;
        }

        .card:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
        }
`;

function AppDepartments() {
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
                <a href="#"
                    className="sidebar-item flex items-center gap-3 px-4 py-3 text-text-muted hover:bg-base-100 rounded-2xl transition-colors">
                    <i className="ph ph-chats text-xl"></i> 채팅
                </a>

                <div className="pt-4 pb-2 px-4 text-xs font-bold text-base-300 uppercase tracking-wider">조직 관리</div>
                <a href="#"
                    className="sidebar-item flex items-center gap-3 px-4 py-3 text-text-muted hover:bg-base-100 rounded-2xl transition-colors">
                    <i className="ph ph-graph text-xl"></i> 넥서스
                </a>
                <a href="#"
                    className="sidebar-item flex items-center gap-3 px-4 py-3 text-text-muted hover:bg-base-100 rounded-2xl transition-colors">
                    <i className="ph ph-robot text-xl"></i> 에이전트 목록
                </a>
                <a href="#"
                    className="sidebar-item active flex items-center gap-3 px-4 py-3 font-medium text-accent-terracotta bg-base-100 rounded-2xl transition-colors">
                    <i className="ph ph-buildings text-xl"></i> 부서 관리
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
    <main className="flex-1 overflow-y-auto px-10 py-8 relative bg-[#fcfbf9]/50">

        {/* Header (API: GET /api/workspace/departments) */}
        <header
            className="flex justify-between items-center mb-8 sticky top-0 bg-[#fcfbf9]/80 backdrop-blur-md z-10 pt-2 pb-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-text-main">부서 관리</h1>
                <p className="text-text-muted mt-1 text-sm">에이전트를 논리적인 부서로 묶어 목표와 예산을 할당합니다.</p>
            </div>

            <div className="flex items-center gap-4">
                {/* API: POST /api/workspace/departments */}
                <button
                    className="bg-text-main text-white px-5 py-2.5 rounded-full font-bold shadow-soft hover:bg-opacity-90 transition-all flex items-center gap-2">
                    <i className="ph ph-plus-circle text-lg"></i> 새 부서 생성
                </button>
            </div>
        </header>

        {/* Grid of Departments */}
        <div className="grid grid-cols-2 gap-8 pb-20">

            {/* Department Card: Strategy */}
            <div className="card p-8 flex flex-col relative overflow-hidden group">
                <div
                    className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#fdece6] to-transparent rounded-bl-[100px] opacity-40 z-0">
                </div>

                <div className="flex justify-between items-start z-10 mb-6">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-16 h-16 rounded-3xl border border-base-200 bg-white flex items-center justify-center text-accent-terracotta shadow-sm">
                            <i className="ph ph-chart-line-up text-3xl"></i>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-text-main">투자전략실</h3>
                            <p className="text-sm font-medium text-text-muted mt-1">시장 데이터를 수집 분석하고 투자 인사이트를 제공</p>
                        </div>
                    </div>
                    <button
                        className="w-10 h-10 rounded-full flex items-center justify-center text-text-muted hover:bg-base-50 transition-colors border border-transparent group-hover:border-base-200">
                        <i className="ph ph-dots-three text-2xl"></i>
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8 z-10">
                    <div className="bg-base-50 p-4 rounded-2xl border border-base-200">
                        <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">소속 에이전트 (4명)
                        </div>
                        <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-white text-accent-terracotta shadow-sm flex items-center justify-center font-bold text-[10px]"
                                title="실장 (Manager)">M</div>
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-[#fdece6] text-accent-terracotta shadow-sm flex items-center justify-center font-bold text-[10px]"
                                title="시황 분석가 (Specialist)">S</div>
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-[#f5f3ec] text-text-main shadow-sm flex items-center justify-center font-bold text-[10px]"
                                title="종목 헌터 (Worker)">W</div>
                            <div
                                className="w-8 h-8 rounded-full border-2 border-white bg-base-100 text-text-main shadow-sm flex items-center justify-center font-bold text-xs">
                                <i className="ph ph-plus"></i></div>
                        </div>
                    </div>

                    <div className="bg-base-50 p-4 rounded-2xl border border-base-200">
                        <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">진행 중인 작전</div>
                        <div className="text-2xl font-bold text-text-main flex items-center gap-2">
                            2<span className="text-xs font-medium text-text-muted">건</span>
                            <span className="w-2 h-2 rounded-full bg-accent-green ml-auto animate-pulse"></span>
                        </div>
                    </div>
                </div>

                <div className="z-10 mt-auto pt-6 border-t border-base-100">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-text-muted font-medium">부서 월간 예산 ($60)</span>
                        <span className="font-bold text-text-main">70% 사용</span>
                    </div>
                    <div className="w-full h-2.5 bg-base-100 rounded-full overflow-hidden">
                        <div className="h-full bg-accent-terracotta rounded-full" style={{width: "70%"}}></div>
                    </div>
                    <p className="text-xs text-text-muted mt-2 text-right">$42.00 / $60.00</p>
                </div>
            </div>

            {/* Department Card: Marketing */}
            <div className="card p-8 flex flex-col relative overflow-hidden group">
                <div
                    className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#e8f3ef] to-transparent rounded-bl-[100px] opacity-40 z-0">
                </div>

                <div className="flex justify-between items-start z-10 mb-6">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-16 h-16 rounded-3xl border border-base-200 bg-white flex items-center justify-center text-accent-green shadow-sm">
                            <i className="ph ph-megaphone text-3xl"></i>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-text-main">마케팅부</h3>
                            <p className="text-sm font-medium text-text-muted mt-1">블로그 포스팅, 뉴스레터 작성, 경쟁사 동향 분석</p>
                        </div>
                    </div>
                    <button
                        className="w-10 h-10 rounded-full flex items-center justify-center text-text-muted hover:bg-base-50 transition-colors border border-transparent group-hover:border-base-200">
                        <i className="ph ph-dots-three text-2xl"></i>
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8 z-10">
                    <div className="bg-base-50 p-4 rounded-2xl border border-base-200">
                        <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">소속 에이전트 (6명)
                        </div>
                        <div className="flex -space-x-2">
                            <div
                                className="w-8 h-8 rounded-full border-2 border-white bg-white text-accent-green shadow-sm flex items-center justify-center font-bold text-[10px]">
                                M</div>
                            <div
                                className="w-8 h-8 rounded-full border-2 border-white bg-[#e8f3ef] text-accent-green shadow-sm flex items-center justify-center font-bold text-[10px]">
                                S</div>
                            <div
                                className="w-8 h-8 rounded-full border-2 border-white bg-[#e8f3ef] text-accent-green shadow-sm flex items-center justify-center font-bold text-[10px]">
                                S</div>
                            <div
                                className="w-8 h-8 rounded-full border-2 border-white bg-[#f5f3ec] text-text-main shadow-sm flex items-center justify-center font-bold text-[10px]">
                                W</div>
                            <div
                                className="w-8 h-8 rounded-full border-2 border-white bg-[#f5f3ec] text-text-main shadow-sm flex items-center justify-center font-bold text-[10px]">
                                W</div>
                            <div
                                className="w-8 h-8 rounded-full border-2 border-white bg-base-100 text-text-main shadow-sm flex items-center justify-center font-bold text-xs">
                                <i className="ph ph-plus"></i></div>
                        </div>
                    </div>

                    <div className="bg-base-50 p-4 rounded-2xl border border-base-200">
                        <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">진행 중인 작전</div>
                        <div className="text-2xl font-bold text-text-main flex items-center gap-2">
                            5<span className="text-xs font-medium text-text-muted">건</span>
                        </div>
                    </div>
                </div>

                <div className="z-10 mt-auto pt-6 border-t border-base-100">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-text-muted font-medium">부서 월간 예산 ($80)</span>
                        <span className="font-bold text-text-main">52% 사용</span>
                    </div>
                    <div className="w-full h-2.5 bg-base-100 rounded-full overflow-hidden">
                        <div className="h-full bg-accent-green rounded-full" style={{width: "52%"}}></div>
                    </div>
                    <p className="text-xs text-text-muted mt-2 text-right">$41.60 / $80.00</p>
                </div>
            </div>

            {/* Department Card: Legal */}
            <div className="card p-8 flex flex-col relative overflow-hidden group">
                <div
                    className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#fef5ec] to-transparent rounded-bl-[100px] opacity-40 z-0">
                </div>

                <div className="flex justify-between items-start z-10 mb-6">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-16 h-16 rounded-3xl border border-base-200 bg-white flex items-center justify-center text-accent-amber shadow-sm">
                            <i className="ph ph-scales text-3xl"></i>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-text-main">법무팀</h3>
                            <p className="text-sm font-medium text-text-muted mt-1">계약서 리뷰, 규제 준수 모니터링 및 리스크 관리</p>
                        </div>
                    </div>
                    <button
                        className="w-10 h-10 rounded-full flex items-center justify-center text-text-muted hover:bg-base-50 transition-colors border border-transparent group-hover:border-base-200">
                        <i className="ph ph-dots-three text-2xl"></i>
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8 z-10">
                    <div className="bg-base-50 p-4 rounded-2xl border border-base-200">
                        <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">소속 에이전트 (2명)
                        </div>
                        <div className="flex -space-x-2">
                            <div
                                className="w-8 h-8 rounded-full border-2 border-white bg-white text-accent-amber shadow-sm flex items-center justify-center font-bold text-[10px]">
                                M</div>
                            <div
                                className="w-8 h-8 rounded-full border-2 border-white bg-[#fef5ec] text-accent-amber shadow-sm flex items-center justify-center font-bold text-[10px]">
                                S</div>
                            <div
                                className="w-8 h-8 rounded-full border-2 border-white bg-base-100 text-text-main shadow-sm flex items-center justify-center font-bold text-xs">
                                <i className="ph ph-plus"></i></div>
                        </div>
                    </div>

                    <div className="bg-base-50 p-4 rounded-2xl border border-base-200">
                        <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">진행 중인 작전</div>
                        <div className="text-2xl font-bold text-text-main flex items-center gap-2">
                            0<span className="text-xs font-medium text-text-muted">건</span>
                        </div>
                    </div>
                </div>

                <div className="z-10 mt-auto pt-6 border-t border-base-100">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-text-muted font-medium">부서 월간 예산 ($30)</span>
                        <span className="font-bold text-text-main">80% 사용</span>
                    </div>
                    <div className="w-full h-2.5 bg-base-100 rounded-full overflow-hidden">
                        <div className="h-full bg-accent-amber rounded-full" style={{width: "80%"}}></div>
                    </div>
                    <p className="text-xs text-text-muted mt-2 text-right">$24.00 / $30.00</p>
                </div>
            </div>

            {/* Create New Department Placeholder */}
            <div
                className="card p-8 flex flex-col justify-center items-center border-dashed border-2 hover:border-text-main group cursor-pointer bg-transparent">
                <div
                    className="w-16 h-16 rounded-full border border-base-200 bg-white flex items-center justify-center text-text-muted mb-4 group-hover:bg-text-main group-hover:text-white transition-colors shadow-sm">
                    <i className="ph ph-plus text-3xl"></i>
                </div>
                <h3 className="text-lg font-bold text-text-main group-hover:text-text-main transition-colors">새 부서 생성</h3>
                <p className="text-sm font-medium text-text-muted mt-2 text-center w-2/3">에이전트들을 목적에 맞게 그룹화하여 효율적으로 관리하세요.
                </p>
            </div>

        </div>

    </main>
    </>
  );
}

export default AppDepartments;
