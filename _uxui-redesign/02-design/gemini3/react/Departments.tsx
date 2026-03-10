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
            padding: 0.5rem 1rem;
            font-weight: 500;
            transition: all 0.3s ease;
            cursor: pointer;
            text-sm;
            box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
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

        .btn-icon:hover {
            color: white;
            background-color: rgba(255, 255, 255, 0.05);
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

        /* Organization Tree Styles */
        .org-tree ul {
            padding-top: 20px;
            position: relative;
            transition: all 0.5s;
            display: flex;
            justify-content: center;
        }

        .org-tree li {
            position: relative;
            padding: 20px 15px 0 15px;
            transition: all 0.5s;
        }

        /* Connecting lines */
        .org-tree li::before,
        .org-tree li::after {
            content: '';
            position: absolute;
            top: 0;
            right: 50%;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
            width: 50%;
            height: 20px;
        }

        .org-tree li::after {
            right: auto;
            left: 50%;
            border-left: 1px solid rgba(255, 255, 255, 0.2);
        }

        /* remove links from single children */
        .org-tree li:only-child::after,
        .org-tree li:only-child::before {
            display: none;
        }

        .org-tree li:only-child {
            padding-top: 0;
        }

        /* remove left connector from first child and right connector from last child */
        .org-tree li:first-child::before,
        .org-tree li:last-child::after {
            border: 0 none;
        }

        /* add back down connector for last node */
        .org-tree li:last-child::before {
            border-right: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 0 5px 0 0;
        }

        .org-tree li:first-child::after {
            border-radius: 5px 0 0 0;
        }

        /* Parent to children connector */
        .org-tree ul ul::before {
            content: '';
            position: absolute;
            top: 0;
            left: 50%;
            border-left: 1px solid rgba(255, 255, 255, 0.2);
            width: 0;
            height: 20px;
        }

        .org-node {
            display: inline-block;
            transition: all 0.3s;
            cursor: pointer;
        }

        .org-node:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.5);
        }
`;

function Departments() {
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
                </nav>
            </div>

            <div className="mb-4">
                <div className="text-xs text-white/30 font-semibold mb-2 px-2 uppercase tracking-wider">Organization</div>
                <nav className="space-y-1">
                    <a href="/app/agents"
                        className="flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <i className="fas fa-robot w-4"></i> <span>에이전트 목록</span>
                    </a>
                    <a href="/app/departments"
                        className="flex items-center gap-3 px-3 py-2 text-white bg-white/10 rounded-lg border border-white/10 transition-colors">
                        <i className="fas fa-sitemap w-4 text-accent-cyan"></i> <span>부서 조직도</span>
                    </a>
                </nav>
            </div>
        </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 overflow-hidden flex flex-col relative z-10 bg-gradient-to-br from-[#0a0a0f] to-[#151525]">

        <header
            className="p-8 pb-4 shrink-0 flex justify-between items-end border-b border-white/5 bg-[#0a0a0f]/50 backdrop-blur-md">
            <div>
                <h2 className="text-3xl font-semibold mb-2">부서 및 조직도</h2>
                {/* API: GET /api/workspace/departments */}
                <p className="text-white/40 text-sm">회사 목표에 맞춰 AI 에이전트들이 소속된 가상 조직의 구조를 시각화합니다.</p>
            </div>
            <div className="flex gap-2">
                <div className="bg-black/40 border border-white/10 rounded-lg p-1 flex">
                    <button className="px-4 py-1.5 rounded bg-white/10 text-white text-sm">트리 뷰</button>
                    <button className="px-4 py-1.5 rounded text-white/40 hover:text-white/80 text-sm">리스트 뷰</button>
                </div>
                <button className="btn-primary"><i className="fas fa-plus mr-2 text-xs"></i>부서 신설</button>
            </div>
        </header>

        <div className="flex-1 overflow-auto p-8 flex justify-center org-tree relative">
            <div className="absolute inset-0 pointer-events-none"
                style={{backgroundImage: "radial-gradient(circle at center, rgba(34,211,238,0.03) 0%, transparent 70%)"}}>
            </div>

            {/* Organization Tree */}
            <ul className="w-max m-auto pt-10">
                <li>
                    {/* Root Node: CEO / Command Center */}
                    <div
                        className="org-node glass-panel border-accent-purple/40 bg-[#151525]/90 p-5 min-w-[300px] relative">
                        <div
                            className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent-purple to-accent-cyan rounded-t-xl">
                        </div>
                        <div className="text-center mb-4">
                            <h3 className="text-xl font-bold text-white mb-1">C-Level 보드</h3>
                            <p className="text-xs text-white/50">최상위 의사결정 기구</p>
                        </div>

                        <div className="border-t border-white/10 pt-4 flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-full bg-base-200 border-2 border-accent-purple flex items-center justify-center shrink-0">
                                <i className="fas fa-user-tie text-accent-purple text-sm"></i>
                            </div>
                            <div className="flex-1 text-left">
                                <div className="text-sm font-medium text-white">비서실장 에이전트</div>
                                <div className="text-[10px] text-white/50">Chief Orchestrator</div>
                            </div>
                            <span
                                className="bg-green-400/20 text-green-400 text-[10px] px-2 py-0.5 rounded border border-green-400/30">Active</span>
                        </div>
                    </div>

                    <ul>
                        <li>
                            {/* Department 1: Strategy */}
                            <div className="org-node glass-panel border-white/10 bg-white/5 p-4 min-w-[260px]">
                                <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
                                    <div className="flex items-center gap-2">
                                        <i className="fas fa-chess-knight text-blue-400"></i>
                                        <h4 className="font-medium text-white">전략기획실</h4>
                                    </div>
                                    <span className="text-xs text-white/40">3 Agents</span>
                                </div>

                                <div className="space-y-3">
                                    <div
                                        className="flex items-center gap-3 bg-black/30 p-2 rounded-lg border border-white/5 hover:border-white/20 transition-colors">
                                        <div
                                            className="w-8 h-8 rounded-full bg-base-200 border border-blue-400/50 flex items-center justify-center">
                                            <i className="fas fa-chart-line text-blue-400 text-xs"></i>
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="text-xs font-medium text-white/90">김전략</div>
                                            <div className="text-[10px] text-white/40">Head / Manager</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-2 border border-transparent">
                                        <div
                                            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                            <i className="fas fa-database text-white/50 text-xs"></i>
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="text-xs font-medium text-white/80">데이터분석가</div>
                                            <div className="text-[10px] text-white/40">Worker</div>
                                        </div>
                                    </div>

                                    <button
                                        className="w-full text-center text-xs text-white/30 hover:text-accent-cyan py-1 border border-dashed border-white/10 rounded mt-2">
                                        <i className="fas fa-plus"></i> 에이전트 할당
                                    </button>
                                </div>
                            </div>

                            <ul>
                                <li>
                                    {/* Sub-department */}
                                    <div className="org-node glass-panel border-white/10 bg-black/40 p-3 min-w-[200px]">
                                        <h5 className="text-sm text-white/80 mb-2 border-b border-white/10 pb-2"><i
                                                className="fas fa-search-dollar text-white/40 mr-1.5 text-xs"></i>시장조사팀</h5>
                                        <div className="flex flex-col gap-2">
                                            <div className="text-[11px] text-white/60 flex items-center gap-2">
                                                <div className="w-4 h-4 rounded-full bg-white/10 text-center leading-4"><i
                                                        className="fas fa-robot text-[8px]"></i></div> 글로벌 트렌드 수집기
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </li>

                        <li>
                            {/* Department 2: Engineering */}
                            <div className="org-node glass-panel border-white/10 bg-white/5 p-4 min-w-[260px]">
                                <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
                                    <div className="flex items-center gap-2">
                                        <i className="fas fa-code-branch text-accent-cyan"></i>
                                        <h4 className="font-medium text-white">엔지니어링</h4>
                                    </div>
                                    <span className="text-xs text-white/40">4 Agents</span>
                                </div>

                                <div className="space-y-3">
                                    <div
                                        className="flex items-center gap-3 bg-black/30 p-2 rounded-lg border border-white/5 hover:border-white/20 transition-colors">
                                        <div
                                            className="w-8 h-8 rounded-full bg-base-200 border border-accent-cyan/50 flex items-center justify-center relative">
                                            <i className="fas fa-laptop-code text-accent-cyan text-xs"></i>
                                            <div
                                                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-base-200">
                                            </div>
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="text-xs font-medium text-white/90">최데옵 (DevOps)</div>
                                            <div className="text-[10px] text-red-400">Error State</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-2">
                                        <div className="flex-1 -space-x-2 flex">
                                            <div
                                                className="w-8 h-8 rounded-full bg-white/10 border-2 border-base-200 z-30 flex items-center justify-center text-[10px] text-white/50 font-mono">
                                                BE</div>
                                            <div
                                                className="w-8 h-8 rounded-full bg-white/10 border-2 border-base-200 z-20 flex items-center justify-center text-[10px] text-white/50 font-mono">
                                                FE</div>
                                            <div
                                                className="w-8 h-8 rounded-full bg-white/10 border-2 border-base-200 z-10 flex items-center justify-center text-[10px] text-white/50 font-mono">
                                                QA</div>
                                        </div>
                                        <span className="text-[10px] text-white/40">3 Workers</span>
                                    </div>
                                </div>
                            </div>
                        </li>

                        <li>
                            {/* Department 3: Marketing */}
                            <div className="org-node glass-panel border-white/10 bg-white/5 p-4 min-w-[260px]">
                                <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
                                    <div className="flex items-center gap-2">
                                        <i className="fas fa-bullhorn text-green-400"></i>
                                        <h4 className="font-medium text-white">마케팅부</h4>
                                    </div>
                                    <span className="text-xs text-white/40">2 Agents</span>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-2">
                                        <div
                                            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                            <i className="fas fa-pen-nib text-white/50 text-xs"></i>
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="text-xs font-medium text-white/80">정작가</div>
                                            <div className="text-[10px] text-white/40">Worker</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
    </main>
    </>
  );
}

export default Departments;
