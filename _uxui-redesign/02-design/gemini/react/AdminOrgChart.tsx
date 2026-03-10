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

        /* Dotted background for canvas */
        .canvas-bg {
            background-image: radial-gradient(#d5cfc1 1px, transparent 1px);
            background-size: 24px 24px;
        }

        /* Connecting Lines */
        .org-line-vertical {
            position: absolute;
            width: 2px;
            background-color: #d5cfc1;
            left: 50%;
            transform: translateX(-50%);
            z-index: 0;
        }

        .org-line-horizontal {
            position: absolute;
            height: 2px;
            background-color: #d5cfc1;
            top: 0;
            z-index: 0;
        }

        .org-card {
            position: relative;
            z-index: 10;
            background: white;
            border-radius: 1rem;
            border: 1px solid #e8e4d9;
            padding: 1rem;
            width: 220px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
        }
`;

function AdminOrgChart() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Top Nav (Compact Admin) */}
    <header
        className="h-16 bg-white border-b border-[#e8e4d9] flex items-center justify-between px-6 z-20 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
            <button
                className="w-8 h-8 rounded-full bg-base-100 flex items-center justify-center text-text-muted hover:bg-[#e8e4d9] transition-colors">
                <i className="ph ph-arrow-left text-lg"></i>
            </button>
            <div>
                <h1 className="font-bold text-text-main text-sm flex items-center gap-2">MegaCorp AI Ltd. (ten_8x9a2_mcorp)
                    <span className="text-text-muted font-normal">/ Organization Canvas</span></h1>
            </div>
        </div>

        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border border-[#e8e4d9] bg-base-50 rounded-lg p-1">
                <button
                    className="w-8 h-8 rounded shrink-0 flex items-center justify-center text-text-muted hover:text-text-main"><i
                        className="ph ph-minus"></i></button>
                <span className="text-xs font-bold font-mono">100%</span>
                <button
                    className="w-8 h-8 rounded shrink-0 flex items-center justify-center text-text-muted hover:text-text-main"><i
                        className="ph ph-plus"></i></button>
            </div>
            <button className="bg-text-main text-white px-4 py-2 rounded-lg text-xs font-bold shadow-soft">View
                Mode</button>
        </div>
    </header>

    {/* Canvas Area */}
    <main className="flex-1 canvas-bg relative overflow-auto hide-scrollbar cursor-grab active:cursor-grabbing p-12">

        <div className="flex flex-col items-center w-max min-w-full relative mt-10">

            {/* Root: CEO */}
            <div className="org-card border-accent-terracotta/40 shadow-[0_0_15px_rgba(229,115,115,0.1)]">
                <div className="flex items-center gap-3 mb-3">
                    <img src="https://i.pravatar.cc/100?img=11" alt="avatar"
                        className="w-10 h-10 rounded-full object-cover border-2 border-accent-terracotta/20" />
                    <div>
                        <h4 className="font-bold text-text-main text-sm">David Kim</h4>
                        <p className="text-[10px] uppercase font-bold text-accent-terracotta mt-0.5"><i
                                className="ph ph-crown mr-0.5"></i> CEO / Admin</p>
                    </div>
                </div>
            </div>

            <div className="org-line-vertical h-12" style={{top: "88px"}}></div>

            {/* Level 1: System Chief (비서실장) */}
            <div className="org-card border-text-main/20 mt-12">
                <div className="flex items-center gap-3 mb-3">
                    <div
                        className="w-10 h-10 rounded-xl bg-text-main flex items-center justify-center text-white text-xl shadow-sm">
                        <i className="ph ph-robot"></i></div>
                    <div>
                        <h4 className="font-bold text-text-main text-sm">System Chief</h4>
                        <p className="text-[10px] uppercase font-bold text-text-muted mt-0.5"><i
                                className="ph ph-lock-key mr-0.5"></i> System Agent</p>
                    </div>
                </div>
                <div className="flex gap-1 flex-wrap">
                    <span
                        className="px-1.5 py-0.5 rounded bg-base-100 text-[10px] border border-[#e8e4d9] text-text-muted font-mono">claude-3-opus</span>
                    <span
                        className="px-1.5 py-0.5 rounded bg-base-100 text-[10px] border border-[#e8e4d9] text-text-muted">Orchestrator</span>
                </div>
            </div>

            <div className="org-line-vertical h-12" style={{top: "247px"}}></div>

            {/* Horizontal distributor line */}
            <div className="org-line-horizontal" style={{top: "295px", left: "calc(50% - 300px)", width: "600px"}}></div>

            {/* Level 2: Departments Container */}
            <div className="flex gap-16 mt-12 relative w-max" style={{transform: "translateX(0)"}}>

                {/* Marketing Dept */}
                <div className="flex flex-col items-center relative gap-8">
                    {/* Drop line from horizontal */}
                    <div className="w-[2px] h-12 bg-[#d5cfc1] absolute -top-12 left-1/2 -translate-x-1/2 z-0"></div>

                    <div
                        className="w-[240px] bg-[#fff5f2] border border-accent-terracotta/20 rounded-2xl p-4 shadow-sm z-10">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-accent-terracotta text-sm flex items-center gap-2"><i
                                    className="ph ph-megaphone"></i> Marketing</h3>
                        </div>

                        {/* Manager */}
                        <div className="bg-white rounded-xl p-3 border border-accent-terracotta/10 shadow-sm mb-3">
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-text-main text-xs">CMO_Agent</span>
                                <span
                                    className="text-[9px] bg-accent-terracotta/10 text-accent-terracotta px-1.5 rounded font-bold uppercase">MGR</span>
                            </div>
                            <span className="text-[9px] text-text-muted font-mono">claude-3-sonnet</span>
                        </div>

                        {/* Specialists */}
                        <div className="bg-white/60 rounded-xl p-3 border border-[#e8e4d9] border-dashed">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-text-main text-[11px]"><i
                                            className="ph ph-robot text-accent-blue mr-1"></i>Content_Gen</span>
                                    <span
                                        className="text-[9px] bg-base-200 text-text-muted px-1.5 rounded font-mono">SPEC</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-text-main text-[11px]"><i
                                            className="ph ph-robot text-accent-blue mr-1"></i>SEO_Analyzer</span>
                                    <span
                                        className="text-[9px] bg-base-200 text-text-muted px-1.5 rounded font-mono">SPEC</span>
                                </div>
                            </div>
                        </div>

                        {/* Human Members */}
                        <div className="mt-3 pt-3 border-t border-accent-terracotta/10 flex gap-1.5 justify-center">
                            <div
                                className="w-6 h-6 rounded-full bg-base-300 flex items-center justify-center text-[9px] font-bold text-text-main ring-2 ring-white">
                                SL</div>
                            <div
                                className="w-6 h-6 rounded-full bg-base-300 flex items-center justify-center text-[9px] font-bold text-text-main ring-2 ring-white">
                                T1</div>
                        </div>
                    </div>
                </div>

                {/* Investment Dept */}
                <div className="flex flex-col items-center relative gap-8">
                    {/* Drop line from horizontal */}
                    <div className="w-[2px] h-12 bg-[#d5cfc1] absolute -top-12 left-1/2 -translate-x-1/2 z-0"></div>

                    <div className="w-[240px] bg-[#f0f9f4] border border-accent-green/20 rounded-2xl p-4 shadow-sm z-10">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-accent-green text-sm flex items-center gap-2"><i
                                    className="ph ph-chart-line-up"></i> Strategy (Invest)</h3>
                        </div>

                        {/* Manager */}
                        <div className="bg-white rounded-xl p-3 border border-accent-green/10 shadow-sm mb-3">
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-text-main text-xs">CIO_Agent</span>
                                <span
                                    className="text-[9px] bg-accent-green/10 text-accent-green px-1.5 rounded font-bold uppercase">MGR</span>
                            </div>
                            <span className="text-[9px] text-text-muted font-mono">gpt-4-turbo</span>
                        </div>

                        {/* Specialists */}
                        <div className="bg-white/60 rounded-xl p-3 border border-[#e8e4d9] border-dashed mb-3">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-text-main text-[11px]"><i
                                            className="ph ph-robot text-accent-blue mr-1"></i>Macro_Analysis</span>
                                    <span
                                        className="text-[9px] bg-base-200 text-text-muted px-1.5 rounded font-mono">SPEC</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-text-main text-[11px]"><i
                                            className="ph ph-robot text-accent-blue mr-1"></i>Tech_Analysis</span>
                                    <span
                                        className="text-[9px] bg-base-200 text-text-muted px-1.5 rounded font-mono">SPEC</span>
                                </div>
                            </div>
                        </div>

                        {/* Worker / Exec */}
                        <div className="bg-white rounded-xl p-2 border-l-2 border-l-accent-coral shadow-sm">
                            <div className="flex items-center justify-between">
                                <span
                                    className="font-bold text-text-main text-[11px] text-accent-coral flex items-center gap-1.5"><i
                                        className="ph ph-lightning"></i> VECTOR_Bot</span>
                                <span
                                    className="text-[9px] bg-base-200 text-text-muted px-1.5 rounded font-mono">WORKER</span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* CS Dept */}
                <div className="flex flex-col items-center relative gap-8">
                    {/* Drop line from horizontal */}
                    <div className="w-[2px] h-12 bg-[#d5cfc1] absolute -top-12 left-1/2 -translate-x-1/2 z-0"></div>

                    <div
                        className="w-[240px] bg-[#eef4f9] border border-accent-blue/20 rounded-2xl p-4 shadow-sm z-10 opacity-70">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-accent-blue text-sm flex items-center gap-2"><i
                                    className="ph ph-chat-circle-text"></i> Customer Success</h3>
                            <i className="ph ph-moon text-text-muted text-xs"></i>
                        </div>

                        <div className="bg-white rounded-xl p-3 border border-[#e8e4d9] shadow-sm mb-3">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-text-main text-xs">Support_Router</span>
                                <span
                                    className="text-[9px] bg-base-200 text-text-muted px-1.5 rounded font-bold uppercase">MGR</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </div>

    </main>

    {/* Details Sidebar Overlay (Hidden by Default, Mockup shows it slightly visible) */}
    <div
        className="absolute right-0 top-16 bottom-0 w-80 bg-white border-l border-[#e8e4d9] shadow-xl transform translate-x-full transition-transform duration-300 z-30">
        {/* Content placeholder */}
    </div>
    </>
  );
}

export default AdminOrgChart;
