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
            transform: translateY(-3px);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
        }
`;

function AppAgents() {
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
                    className="sidebar-item active flex items-center gap-3 px-4 py-3 font-medium text-accent-terracotta bg-base-100 rounded-2xl transition-colors">
                    <i className="ph ph-robot text-xl"></i> 에이전트 목록
                </a>
                <a href="#"
                    className="sidebar-item flex items-center gap-3 px-4 py-3 text-text-muted hover:bg-base-100 rounded-2xl transition-colors">
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

        {/* Header (API: GET /api/workspace/agents) */}
        <header
            className="flex justify-between items-center mb-8 sticky top-0 bg-[#fcfbf9]/80 backdrop-blur-md z-10 pt-2 pb-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-text-main">에이전트 목록</h1>
                <p className="text-text-muted mt-1 text-sm">총 18명의 AI 에이전트가 서브시스템에서 근무 중입니다.</p>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative">
                    <i className="ph ph-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"></i>
                    <input type="text" placeholder="에이전트 검색..."
                        className="bg-white border text-text-main border-base-200 rounded-full pl-10 pr-4 py-2 text-sm shadow-sm focus:outline-none focus:border-base-300 w-64" />
                </div>
                {/* API: POST /api/workspace/agents */}
                <button
                    className="bg-text-main text-white px-5 py-2.5 rounded-full font-bold shadow-soft hover:bg-opacity-90 transition-all flex items-center gap-2">
                    <i className="ph ph-plus-circle text-lg"></i> 새 에이전트 생성
                </button>
            </div>
        </header>

        {/* Filters */}
        <div className="flex gap-2 mb-8">
            <button
                className="px-5 py-2 rounded-full text-sm font-bold bg-white border border-base-200 text-text-main shadow-sm">전체
                (18)</button>
            <button
                className="px-5 py-2 rounded-full text-sm font-medium text-text-muted hover:text-text-main hover:bg-white transition-colors border border-transparent">Manager
                (4)</button>
            <button
                className="px-5 py-2 rounded-full text-sm font-medium text-text-muted hover:text-text-main hover:bg-white transition-colors border border-transparent">Specialist
                (8)</button>
            <button
                className="px-5 py-2 rounded-full text-sm font-medium text-text-muted hover:text-text-main hover:bg-white transition-colors border border-transparent">Worker
                (6)</button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-6 pb-20">

            {/* Agent Card (Chief of Staff) */}
            <div className="card p-6 flex flex-col relative overflow-hidden">
                <div
                    className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#fdece6] to-transparent rounded-bl-[100px] opacity-50 z-0">
                </div>

                <div className="flex justify-between items-start z-10 mb-4">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-14 h-14 rounded-full border-2 border-accent-terracotta bg-white flex items-center justify-center text-accent-terracotta shadow-sm">
                            <i className="ph ph-star text-2xl"></i>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-text-main leading-tight">비서실장</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span
                                    className="px-2 py-0.5 bg-base-100 text-text-muted text-[10px] font-bold rounded uppercase tracking-wide">Manager</span>
                                {/* API: POST /api/workspace/agents/:id/status */}
                                <span
                                    className="flex items-center gap-1 text-[10px] text-accent-coral font-bold bg-accent-coral/10 px-2 py-0.5 rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-accent-coral animate-pulse"></span> 작업 중
                                </span>
                            </div>
                        </div>
                    </div>
                    <button className="text-text-muted hover:text-text-main"><i
                            className="ph ph-dots-three text-xl"></i></button>
                </div>

                <div className="space-y-4 mb-6 z-10 flex-1">
                    <div>
                        <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">소속 부서</div>
                        <div className="text-[13px] font-medium text-text-main flex items-center gap-1.5"><i
                                className="ph ph-buildings"></i> 시스템 공통</div>
                    </div>
                    <div>
                        <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">모델</div>
                        <div className="text-[13px] font-medium text-text-main flex items-center gap-1.5"><i
                                className="ph ph-cpu"></i> Claude 3.5 Sonnet</div>
                    </div>
                    <div>
                        <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">할당된 도구</div>
                        <div className="flex flex-wrap gap-1.5">
                            <span
                                className="px-2 py-1 bg-base-50 border border-base-200 rounded text-[10px] font-medium text-text-muted">품질
                                게이트</span>
                            <span
                                className="px-2 py-1 bg-base-50 border border-base-200 rounded text-[10px] font-medium text-text-muted">문서
                                분석</span>
                            <span
                                className="px-2 py-1 bg-base-50 border border-base-200 rounded text-[10px] font-medium text-text-muted">+
                                2개</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-base-100 z-10">
                    <button
                        className="flex-1 py-2 rounded-xl bg-base-50 text-text-main text-sm font-bold shadow-sm border border-base-200 hover:bg-base-100 transition-colors">설정</button>
                    {/* API: POST /api/workspace/agents/:id/tasks (or open chat) */}
                    <button
                        className="flex-1 py-2 rounded-xl bg-text-main text-white text-sm font-bold shadow-soft hover:bg-opacity-90 transition-colors">지시하기</button>
                </div>
            </div>

            {/* Agent Card (Marketer) */}
            <div className="card p-6 flex flex-col relative overflow-hidden">
                <div
                    className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#e8f3ef] to-transparent rounded-bl-[100px] opacity-50 z-0">
                </div>

                <div className="flex justify-between items-start z-10 mb-4">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-14 h-14 rounded-full border border-base-300 bg-base-50 flex items-center justify-center text-accent-green shadow-sm">
                            <i className="ph ph-megaphone text-2xl"></i>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-text-main leading-tight">마케팅부장</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span
                                    className="px-2 py-0.5 bg-base-100 text-text-muted text-[10px] font-bold rounded uppercase tracking-wide">Manager</span>
                                <span
                                    className="flex items-center gap-1 text-[10px] text-text-muted font-bold bg-base-100 px-2 py-0.5 rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-base-300"></span> 대기 중
                                </span>
                            </div>
                        </div>
                    </div>
                    <button className="text-text-muted hover:text-text-main"><i
                            className="ph ph-dots-three text-xl"></i></button>
                </div>

                <div className="space-y-4 mb-6 z-10 flex-1">
                    <div>
                        <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">소속 부서</div>
                        <div className="text-[13px] font-medium text-text-main flex items-center gap-1.5"><i
                                className="ph ph-buildings"></i> 마케팅부</div>
                    </div>
                    <div>
                        <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">모델</div>
                        <div className="text-[13px] font-medium text-text-main flex items-center gap-1.5"><i
                                className="ph ph-cpu"></i> Claude 3.5 Sonnet</div>
                    </div>
                    <div>
                        <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">할당된 도구</div>
                        <div className="flex flex-wrap gap-1.5">
                            <span
                                className="px-2 py-1 bg-base-50 border border-base-200 rounded text-[10px] font-medium text-text-muted">이메일
                                발송</span>
                            <span
                                className="px-2 py-1 bg-base-50 border border-base-200 rounded text-[10px] font-medium text-text-muted">웹
                                스크래핑</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-base-100 z-10">
                    <button
                        className="flex-1 py-2 rounded-xl bg-base-50 text-text-main text-sm font-bold shadow-sm border border-base-200 hover:bg-base-100 transition-colors">설정</button>
                    <button
                        className="flex-1 py-2 rounded-xl bg-text-main text-white text-sm font-bold shadow-soft hover:bg-opacity-90 transition-colors">지시하기</button>
                </div>
            </div>

            {/* Agent Card (Content Specialist) */}
            <div className="card p-6 flex flex-col relative overflow-hidden">
                <div
                    className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#fef5ec] to-transparent rounded-bl-[100px] opacity-50 z-0">
                </div>

                <div className="flex justify-between items-start z-10 mb-4">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-14 h-14 rounded-full border border-base-300 bg-base-50 flex items-center justify-center text-accent-amber shadow-sm">
                            <i className="ph ph-pen-nib text-2xl"></i>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-text-main leading-tight">콘텐츠 전문가</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span
                                    className="px-2 py-0.5 bg-base-100 text-text-muted text-[10px] font-bold rounded uppercase tracking-wide">Specialist</span>
                                <span
                                    className="flex items-center gap-1 text-[10px] text-text-muted font-bold bg-base-100 px-2 py-0.5 rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-base-300"></span> 대기 중
                                </span>
                            </div>
                        </div>
                    </div>
                    <button className="text-text-muted hover:text-text-main"><i
                            className="ph ph-dots-three text-xl"></i></button>
                </div>

                <div className="space-y-4 mb-6 z-10 flex-1">
                    <div>
                        <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">소속 부서</div>
                        <div className="text-[13px] font-medium text-text-main flex items-center gap-1.5"><i
                                className="ph ph-buildings"></i> 마케팅부</div>
                    </div>
                    <div>
                        <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">모델</div>
                        <div className="text-[13px] font-medium text-text-main flex items-center gap-1.5"><i
                                className="ph ph-cpu"></i> Claude 3.5 Haiku</div>
                    </div>
                    <div>
                        <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">할당된 도구</div>
                        <div className="flex flex-wrap gap-1.5">
                            <span
                                className="px-2 py-1 bg-base-50 border border-base-200 rounded text-[10px] font-medium text-text-muted">마크다운
                                생성</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-base-100 z-10">
                    <button
                        className="flex-1 py-2 rounded-xl bg-base-50 text-text-main text-sm font-bold shadow-sm border border-base-200 hover:bg-base-100 transition-colors">설정</button>
                    <button
                        className="flex-1 py-2 rounded-xl bg-text-main text-white text-sm font-bold shadow-soft hover:bg-opacity-90 transition-colors">지시하기</button>
                </div>
            </div>

            {/* Agent Card (Trader) */}
            <div className="card p-6 flex flex-col relative overflow-hidden">

                <div className="flex justify-between items-start z-10 mb-4">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-14 h-14 rounded-full border border-base-300 bg-base-50 flex items-center justify-center text-text-main shadow-sm">
                            <i className="ph ph-chart-line-up text-2xl"></i>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-text-main leading-tight">전략실장</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span
                                    className="px-2 py-0.5 bg-base-100 text-text-muted text-[10px] font-bold rounded uppercase tracking-wide">Manager</span>
                                <span
                                    className="flex items-center gap-1 text-[10px] text-accent-coral font-bold bg-accent-coral/10 px-2 py-0.5 rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-accent-coral animate-pulse"></span> 작업 중
                                </span>
                            </div>
                        </div>
                    </div>
                    <button className="text-text-muted hover:text-text-main"><i
                            className="ph ph-dots-three text-xl"></i></button>
                </div>

                <div className="space-y-4 mb-6 z-10 flex-1">
                    <div>
                        <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">소속 부서</div>
                        <div className="text-[13px] font-medium text-text-main flex items-center gap-1.5"><i
                                className="ph ph-buildings"></i> 전략실</div>
                    </div>
                    <div>
                        <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">모델</div>
                        <div className="text-[13px] font-medium text-text-main flex items-center gap-1.5"><i
                                className="ph ph-cpu"></i> Claude 3.5 Sonnet</div>
                    </div>
                    <div>
                        <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">할당된 도구</div>
                        <div className="flex flex-wrap gap-1.5">
                            <span
                                className="px-2 py-1 bg-base-50 border border-base-200 rounded text-[10px] font-medium text-text-muted">KIS
                                자동매매</span>
                            <span
                                className="px-2 py-1 bg-base-50 border border-base-200 rounded text-[10px] font-medium text-text-muted">시장
                                데이터 분석</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-base-100 z-10">
                    <button
                        className="flex-1 py-2 rounded-xl bg-base-50 text-text-main text-sm font-bold shadow-sm border border-base-200 hover:bg-base-100 transition-colors">설정</button>
                    <button
                        className="flex-1 py-2 rounded-xl bg-text-main text-white text-sm font-bold shadow-soft hover:bg-opacity-90 transition-colors">지시하기</button>
                </div>
            </div>

        </div>

    </main>
    </>
  );
}

export default AppAgents;
