"use client";
import React from "react";

const styles = `
body {
            background-color: #fcfbf9;
            color: #2c2c2c;
            -ms-overflow-style: none;
            scrollbar-width: none;
            overflow: hidden;
        }

        body::-webkit-scrollbar {
            display: none;
        }

        .node {
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
        }

        .node:hover {
            transform: scale(1.05);
            z-index: 10;
        }

        .node.selected {
            border-color: #e07a5f;
            box-shadow: 0 0 0 4px rgba(224, 122, 95, 0.15);
        }

        .edge {
            position: absolute;
            background-color: #e8e4d9;
            z-index: 0;
            transform-origin: top left;
        }

        .panel-slide {
            animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }

            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        /* Background grid for canvas */
        .bg-canvas {
            background-image: radial-gradient(#d5cfc1 1px, transparent 1px);
            background-size: 40px 40px;
        }
`;

function AppNexus() {
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
                {/* Other menus */}
                <div className="pt-4 pb-2 px-4 text-xs font-bold text-base-300 uppercase tracking-wider">조직 관리</div>
                <a href="#"
                    className="sidebar-item active flex items-center gap-3 px-4 py-3 font-medium text-accent-terracotta bg-base-100 rounded-2xl transition-colors">
                    <i className="ph ph-graph text-xl"></i> 넥서스
                </a>
                <a href="#"
                    className="sidebar-item flex items-center gap-3 px-4 py-3 text-text-muted hover:bg-base-100 rounded-2xl transition-colors">
                    <i className="ph ph-robot text-xl"></i> 에이전트 목록
                </a>
                <a href="#"
                    className="sidebar-item flex items-center gap-3 px-4 py-3 text-text-muted hover:bg-base-100 rounded-2xl transition-colors">
                    <i className="ph ph-buildings text-xl"></i> 부서 관리
                </a>
            </nav>
        </div>
    </aside>

    {/* Main Content Canvas (API: GET /api/workspace/nexus) */}
    <main className="flex-1 relative bg-canvas overflow-hidden flex flex-col">

        {/* Header Controls (Overlay) */}
        <header className="absolute top-8 left-10 right-10 z-10 flex justify-between items-start pointer-events-none">
            <div
                className="pointer-events-auto bg-white/80 backdrop-blur-md px-6 py-4 rounded-3xl border border-base-200 shadow-soft">
                <h1 className="text-2xl font-bold tracking-tight text-text-main">넥서스</h1>
                <p className="text-text-muted mt-0.5 text-xs font-medium">조직도 및 위임 구조 시각화</p>
            </div>

            <div className="pointer-events-auto flex gap-3">
                <div
                    className="bg-white/80 backdrop-blur-md p-1.5 rounded-full flex items-center shadow-soft border border-base-200">
                    <button
                        className="px-5 py-2 rounded-full text-sm font-bold bg-white text-text-main shadow-sm pointer-events-auto">트리
                        뷰</button>
                    <button
                        className="px-5 py-2 rounded-full text-sm font-medium text-text-muted hover:text-text-main transition-colors pointer-events-auto">네트워크
                        뷰</button>
                </div>
                <button
                    className="w-12 h-12 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center border border-base-200 text-text-muted hover:bg-base-50 transition-colors shadow-soft pointer-events-auto">
                    <i className="ph ph-corners-out text-xl"></i>
                </button>
            </div>
        </header>

        {/* Node Canvas Area */}
        <div
            className="flex-1 relative w-full h-full cursor-grab active:cursor-grabbing overflow-scroll hide-scrollbar flex items-center justify-center pt-20">

            <div className="relative w-[1200px] h-[800px] flex justify-center mt-[-100px]">

                {/* Edges (Static visual representation for mockup) */}
                {/* CEO to Chief of Staff */}
                <div className="edge w-[2px] h-[60px]" style={{left: "600px", top: "120px"}}></div>
                {/* Chief of Staff to Managers */}
                <div className="edge w-[450px] h-[2px]" style={{left: "375px", top: "280px"}}></div>
                <div className="edge w-[2px] h-[40px]" style={{left: "375px", top: "280px"}}></div>
                <div className="edge w-[2px] h-[40px]" style={{left: "600px", top: "280px"}}></div>
                <div className="edge w-[2px] h-[40px]" style={{left: "825px", top: "280px"}}></div>

                {/* Manager 1 to Specs */}
                <div className="edge w-[150px] h-[2px]" style={{left: "300px", top: "460px"}}></div>
                <div className="edge w-[2px] h-[40px]" style={{left: "300px", top: "460px"}}></div>
                <div className="edge w-[2px] h-[40px]" style={{left: "375px", top: "460px"}}></div>
                <div className="edge w-[2px] h-[40px]" style={{left: "450px", top: "460px"}}></div>

                {/* Manager 3 to Specs */}
                <div className="edge w-[150px] h-[2px]" style={{left: "750px", top: "460px"}}></div>
                <div className="edge w-[2px] h-[40px]" style={{left: "750px", top: "460px"}}></div>
                <div className="edge w-[2px] h-[40px]" style={{left: "900px", top: "460px"}}></div>

                {/* Node: CEO (User) */}
                <div className="node absolute bg-white border-2 border-base-200 rounded-3xl p-4 shadow-soft flex flex-col items-center gap-2 w-48 z-10"
                    style={{left: "504px", top: "40px"}}>
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-base-100">
                        <img src="https://i.pravatar.cc/100?img=11" alt="CEO" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-center">
                        <h3 className="font-bold text-text-main text-sm">김대표</h3>
                        <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold mt-1">CEO (유저)</p>
                    </div>
                </div>

                {/* Node: 비서실장 (Chief of Staff) */}
                <div className="node selected absolute bg-white border-2 border-base-200 rounded-3xl p-4 shadow-soft flex flex-col items-center gap-2 w-48 z-10"
                    style={{left: "504px", top: "180px"}}>
                    <div
                        className="absolute -top-3 -right-3 w-6 h-6 bg-accent-coral text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center">
                        3</div>
                    <div
                        className="w-12 h-12 rounded-full border-2 border-accent-terracotta bg-white flex items-center justify-center text-accent-terracotta shadow-sm">
                        <i className="ph ph-star text-2xl"></i>
                    </div>
                    <div className="text-center">
                        <h3 className="font-bold text-text-main text-sm">비서실장</h3>
                        <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold mt-1">Manager</p>
                    </div>
                    {/* Status dot */}
                    <div className="absolute bottom-4 right-4 w-2.5 h-2.5 rounded-full bg-accent-coral animate-pulse"></div>
                </div>

                {/* Node: 영업/마케팅실장 */}
                <div className="node absolute bg-white border border-base-200 rounded-2xl p-4 shadow-sm flex flex-col items-center gap-2 w-40 z-10"
                    style={{left: "295px", top: "320px"}}>
                    <div
                        className="w-10 h-10 rounded-full border border-base-300 bg-base-50 flex items-center justify-center text-text-main">
                        <i className="ph ph-megaphone text-xl"></i>
                    </div>
                    <div className="text-center">
                        <h3 className="font-bold text-text-main text-sm">마케팅부장</h3>
                        <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold mt-1">Manager</p>
                    </div>
                    <div className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-accent-green"></div>
                </div>

                {/* Node: 전략실장 */}
                <div className="node absolute bg-white border border-base-200 rounded-2xl p-4 shadow-sm flex flex-col items-center gap-2 w-40 z-10 opacity-70"
                    style={{left: "520px", top: "320px"}}>
                    <div
                        className="w-10 h-10 rounded-full border border-base-300 bg-base-50 flex items-center justify-center text-text-main">
                        <i className="ph ph-chart-line-up text-xl"></i>
                    </div>
                    <div className="text-center">
                        <h3 className="font-bold text-text-main text-sm">전략실장</h3>
                        <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold mt-1">Manager</p>
                    </div>
                    <div className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-base-300"></div>
                </div>

                {/* Node: 개발/IT부장 */}
                <div className="node absolute bg-white border border-base-200 rounded-2xl p-4 shadow-sm flex flex-col items-center gap-2 w-40 z-10"
                    style={{left: "745px", top: "320px"}}>
                    <div
                        className="w-10 h-10 rounded-full border border-base-300 bg-base-50 flex items-center justify-center text-text-main">
                        <i className="ph ph-code text-xl"></i>
                    </div>
                    <div className="text-center">
                        <h3 className="font-bold text-text-main text-sm">IT개발부장</h3>
                        <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold mt-1">Manager</p>
                    </div>
                    <div className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-accent-green"></div>
                </div>

                {/* Level 3 Nodes (Workers/Specialists under Marketing) */}
                <div className="node absolute bg-white border border-base-200 rounded-xl p-3 shadow-sm flex items-center gap-2 w-32 z-10"
                    style={{left: "236px", top: "500px"}}>
                    <div
                        className="w-6 h-6 rounded-full bg-accent-amber/10 text-accent-amber flex items-center justify-center text-xs">
                        <i className="ph ph-pen-nib"></i></div>
                    <div className="text-left">
                        <p className="font-bold text-text-main text-xs">콘텐츠</p>
                    </div>
                </div>
                <div className="node absolute bg-white border border-base-200 rounded-xl p-3 shadow-sm flex items-center gap-2 w-32 z-10"
                    style={{left: "311px", top: "500px"}}>
                    <div
                        className="w-6 h-6 rounded-full bg-accent-amber/10 text-accent-amber flex items-center justify-center text-xs">
                        <i className="ph ph-share-network"></i></div>
                    <div className="text-left">
                        <p className="font-bold text-text-main text-xs">SNS운영</p>
                    </div>
                </div>
                <div className="node absolute bg-white border border-base-200 rounded-xl p-3 shadow-sm flex items-center gap-2 w-32 z-10"
                    style={{left: "386px", top: "500px"}}>
                    <div
                        className="w-6 h-6 rounded-full bg-accent-amber/10 text-accent-amber flex items-center justify-center text-xs">
                        <i className="ph ph-magnifying-glass"></i></div>
                    <div className="text-left">
                        <p className="font-bold text-text-main text-xs">검색광고</p>
                    </div>
                </div>

                {/* Level 3 Nodes under IT */}
                <div className="node absolute bg-white border border-base-200 rounded-xl p-3 shadow-sm flex items-center gap-2 w-32 z-10"
                    style={{left: "686px", top: "500px"}}>
                    <div
                        className="w-6 h-6 rounded-full bg-accent-green/10 text-accent-green flex items-center justify-center text-xs">
                        <i className="ph ph-hard-drives"></i></div>
                    <div className="text-left">
                        <p className="font-bold text-text-main text-xs">백엔드</p>
                    </div>
                </div>
                <div className="node absolute bg-white border border-base-200 rounded-xl p-3 shadow-sm flex items-center gap-2 w-32 z-10"
                    style={{left: "836px", top: "500px"}}>
                    <div
                        className="w-6 h-6 rounded-full bg-accent-green/10 text-accent-green flex items-center justify-center text-xs">
                        <i className="ph ph-browser"></i></div>
                    <div className="text-left">
                        <p className="font-bold text-text-main text-xs">프론트엔드</p>
                    </div>
                </div>

            </div>
        </div>

        {/* Floating Detail Panel (Right Side) */}
        <aside
            className="absolute top-8 right-10 bottom-8 w-80 bg-white/90 backdrop-blur-xl border border-base-200 shadow-soft-lg rounded-3xl overflow-hidden flex flex-col panel-slide z-30">
            {/* Header */}
            <div className="p-6 border-b border-base-100 bg-gradient-to-br from-white to-[#fef5ec]">
                <div className="flex justify-between items-start mb-4">
                    <div
                        className="w-12 h-12 rounded-full border-2 border-accent-terracotta bg-white flex items-center justify-center text-accent-terracotta shadow-sm">
                        <i className="ph ph-star text-2xl"></i>
                    </div>
                    <button
                        className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-text-muted hover:bg-white transition-colors">
                        <i className="ph ph-x"></i>
                    </button>
                </div>
                <h2 className="text-xl font-bold text-text-main">비서실장</h2>
                <div className="flex items-center gap-2 mt-2">
                    <span
                        className="px-2 py-0.5 bg-base-100 text-text-muted text-[11px] font-bold rounded uppercase tracking-wide">Manager</span>
                    <span
                        className="flex items-center gap-1 text-[11px] text-accent-coral font-bold bg-accent-coral/10 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-coral animate-pulse"></span> 작업 처리 중
                    </span>
                </div>
            </div>

            {/* Details Scroll */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar">

                <div>
                    <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">기본 정보</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-text-muted">사용 모델</span>
                            <span className="font-medium text-text-main">Claude 3.5 Sonnet</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-text-muted">역할</span>
                            <span className="font-medium text-text-main text-right break-words w-2/3">CEO의 명령을 해석하고 각 부서장에게
                                로직 분배 및 최종 검수</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">보유 도구 (3)</h3>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 p-2 rounded-lg border border-base-200 bg-base-50">
                            <i className="ph ph-file-magnifying-glass text-accent-terracotta"></i>
                            <span className="text-xs font-medium text-text-main">문서 심층 분석 가이드</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-lg border border-base-200 bg-base-50">
                            <i className="ph ph-shield-check text-accent-green"></i>
                            <span className="text-xs font-medium text-text-main">품질 게이트 (최종)</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-lg border border-base-200 bg-base-50">
                            <i className="ph ph-arrow-bend-down-right text-text-muted"></i>
                            <span className="text-xs font-medium text-text-main">타 부서 위임기능</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">최근 프롬프트 지시</h3>
                    <div
                        className="bg-base-50 p-3 rounded-xl border border-base-200 text-xs text-text-main font-medium leading-relaxed">
                        "너는 CORTHEX의 비서실장으로서 모든 부서간의 작업 흐름을 통제한다. 항상 CEO의 의도를 먼저 파악하고..."
                        <button className="text-accent-terracotta mt-1 hover:underline block">전체 보기</button>
                    </div>
                </div>

                {/* API: POST /api/workspace/agents/:id/status */}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-base-100 bg-base-50 flex gap-2 shrink-0">
                <button
                    className="flex-1 py-2 rounded-xl bg-white border border-base-200 text-text-main text-sm font-bold shadow-sm hover:bg-base-50 transition-colors">설정
                    변경</button>
                <button
                    className="flex-1 py-2 rounded-xl bg-text-main text-white text-sm font-bold shadow-soft hover:bg-opacity-90 flex items-center justify-center gap-1">
                    <i className="ph ph-chat-teardrop-text"></i> 대화하기
                </button>
            </div>
        </aside>

        {/* Tool bar Controls */}
        <div
            className="absolute bottom-8 right-[360px] bg-white/80 backdrop-blur-md rounded-full shadow-soft-lg flex border border-base-200 p-1 z-10">
            <button
                className="w-10 h-10 rounded-full flex items-center justify-center text-text-muted hover:bg-base-100 transition-colors"><i
                    className="ph ph-minus"></i></button>
            <div className="w-16 flex items-center justify-center text-xs font-bold text-text-main">100%</div>
            <button
                className="w-10 h-10 rounded-full flex items-center justify-center text-text-muted hover:bg-base-100 transition-colors"><i
                    className="ph ph-plus"></i></button>
        </div>

    </main>
    </>
  );
}

export default AppNexus;
