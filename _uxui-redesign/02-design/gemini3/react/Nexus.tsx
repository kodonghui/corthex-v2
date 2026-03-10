"use client";
import React from "react";
import { Bot, Clock, GitBranch, GitMerge, Home, LayoutDashboard, MessageSquare, MousePointer2, Network, Play, Save, Terminal, Wrench, X, ZoomIn, ZoomOut } from "lucide-react";

const styles = `
@layer components {
            body { @apply bg-dark-400 text-gray-200 font-sans antialiased font-light min-h-screen overflow-hidden flex selection:bg-accent-purple/30 selection:text-white; }
            .bg-ambient { @apply fixed inset-0 z-[-1] pointer-events-none; }
            .bg-ambient::before { content: ''; @apply absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent-purple/10 blur-[120px]; }
            .bg-ambient::after { content: ''; @apply absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent-cyan/10 blur-[120px]; }
            
            .glass-panel { @apply bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-glass rounded-2xl overflow-hidden transition-all duration-300; }
            .glass-node { @apply absolute bg-dark-300/80 backdrop-blur-md border border-white/10 shadow-glass rounded-xl p-3 w-64 hover:border-accent-cyan/50 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all cursor-move z-10; }
            
            .nav-item { @apply flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors font-medium text-sm; }
            .nav-item.active { @apply text-white bg-white/[0.08] shadow-[inset_2px_0_0_0_rgba(168,85,247,1)]; }
            
            .btn { @apply inline-flex items-center justify-center px-4 py-2 font-medium text-sm rounded-lg transition-all gap-2 cursor-pointer; }
            .btn-secondary { @apply bg-white/[0.05] border border-white/[0.1] text-white hover:bg-white/[0.1]; }
            .btn-icon { @apply p-2 rounded-lg bg-dark-300 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 hover:bg-white/[0.05] shadow-lg; }
            
            .text-gradient { @apply bg-gradient-accent bg-clip-text text-transparent; }
            
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

            /* Canvas Grid Pattern */
            .canvas-grid {
                background-size: 40px 40px;
                background-image: 
                    linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
            }
        }
`;

function Nexus() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
<div className="bg-ambient"></div>

    <aside className="w-64 border-r border-white/[0.08] bg-dark-300/50 backdrop-blur-xl flex flex-col h-full z-20 shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-white/[0.05]">
            <h1 className="text-xl font-bold tracking-wider text-gradient">CORTHEX</h1>
            <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/10 text-gray-300">v2</span>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide py-6 px-4 space-y-8">
            <div className="space-y-1">
                <a href="/app/home" className="nav-item"><Home className="w-4 h-4" /> Home</a>
                <a href="/app/command-center" className="nav-item"><Terminal className="w-4 h-4" /> Command
                    Center</a>
                <a href="/app/chat" className="nav-item"><MessageSquare className="w-4 h-4" /> Chat</a>
                <a href="/app/dashboard" className="nav-item"><LayoutDashboard className="w-4 h-4" />
                    Dashboard</a>
            </div>

            <div className="space-y-1">
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Organization</p>
                <a href="/app/agents" className="nav-item"><Bot className="w-4 h-4" /> Agents</a>
                <a href="/app/departments" className="nav-item"><Network className="w-4 h-4" />
                    Departments</a>
                <a href="/app/nexus" className="nav-item active"><GitMerge className="w-4 h-4" /> Nexus
                    Canvas</a>
            </div>
        </div>
    </aside>

    <main className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">

        <header
            className="h-16 flex items-center justify-between px-8 border-b border-white/[0.05] bg-dark-400/80 backdrop-blur shrink-0 absolute top-0 w-full z-30">
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-300"><GitMerge
                        className="w-4 h-4 inline mr-2 text-accent-purple" />Nexus Workflow Builder</span>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 mr-2">Workflow: <strong className="text-white font-medium">Daily Market
                        Brief</strong></span>
                <button className="btn btn-secondary text-xs py-1.5"><Play
                        className="w-3 h-3 text-emerald-400" /> Run Test</button>
                <button className="btn-icon p-1.5"><Save className="w-4 h-4" /></button>
            </div>
        </header>

        {/* Canvas Area (API: GET /api/workspace/nexus) */}
        <div className="flex-1 relative w-full h-full bg-dark-400 canvas-grid cursor-grab overflow-hidden pt-16">

            {/* Tools Palette */}
            <div className="absolute left-6 top-24 z-20 glass-panel p-2 flex flex-col gap-2">
                <button className="btn-icon p-2" title="Select Element"><MousePointer2
                        className="w-5 h-5 text-accent-cyan" /></button>
                <button className="btn-icon p-2" title="Add Agent Node"><Bot className="w-5 h-5" /></button>
                <button className="btn-icon p-2" title="Add Tool Node"><Wrench className="w-5 h-5" /></button>
                <button className="btn-icon p-2" title="Add Logic Gate"><GitBranch
                        className="w-5 h-5" /></button>
                <div className="w-full h-px bg-white/10 my-1"></div>
                <button className="btn-icon p-2" title="Zoom In"><ZoomIn className="w-5 h-5" /></button>
                <button className="btn-icon p-2" title="Zoom Out"><ZoomOut className="w-5 h-5" /></button>
            </div>

            {/* SVG Paths for Connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <defs>
                    <linearGradient id="edge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="#a855f7" />
                        <stop offset="100%" stop-color="#22d3ee" />
                    </linearGradient>
                    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6"
                        orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#22d3ee" />
                    </marker>
                </defs>
                {/* Line 1: Trigger -> Data Collector */}
                <path d="M 320 250 C 370 250, 410 210, 460 210" fill="none" stroke="url(#edge-grad)" strokeWidth="2"
                    marker-end="url(#arrow)" />
                {/* Line 2: Data Collector -> Processing Logic */}
                <path d="M 716 210 C 766 210, 800 280, 850 280" fill="none" stroke="url(#edge-grad)" strokeWidth="2"
                    marker-end="url(#arrow)" />
            </svg>

            {/* Node: Trigger */}
            <div className="glass-node" style={{left: "100px", top: "210px"}}>
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded bg-accent-purple/20 flex-center text-accent-purple"><Clock className="w-3 h-3" /></div>
                    <span className="text-xs font-semibold text-white uppercase tracking-wider">CRON Trigger</span>
                </div>
                <p className="text-[10px] text-gray-500 font-mono bg-dark-400 p-1.5 rounded border border-white/5">0 9 * *
                    1-5</p>
                <div
                    className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent-purple border-2 border-dark-400 cursor-crosshair">
                </div>
            </div>

            {/* Node: Data Collector Agent */}
            <div className="glass-node border-accent-cyan/30 shadow-[0_0_20px_rgba(34,211,238,0.1)]"
                style={{left: "460px", top: "160px"}}>
                <div
                    className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent-purple border-2 border-dark-400">
                </div>

                <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded bg-gradient-accent flex-center text-white"><Bot
                            className="w-3 h-3" /></div>
                    <div>
                        <span className="text-xs font-semibold text-white block">Market Data Collector</span>
                        <span className="text-[9px] text-accent-cyan block">Model: Haiku 3.5</span>
                    </div>
                </div>
                <div className="space-y-1 mb-2">
                    <div
                        className="text-[10px] flex items-center gap-1 text-gray-400 bg-white/5 px-2 py-1 rounded border border-white/5">
                        <Wrench className="w-3 h-3" /> Tool: KIS API Pull</div>
                    <div
                        className="text-[10px] flex items-center gap-1 text-gray-400 bg-white/5 px-2 py-1 rounded border border-white/5">
                        <Wrench className="w-3 h-3" /> Tool: Web Scraper</div>
                </div>

                <div
                    className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent-cyan border-2 border-dark-400 cursor-crosshair">
                </div>
            </div>

            {/* Node: Analysis Agent */}
            <div className="glass-node" style={{left: "850px", top: "230px"}}>
                <div
                    className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent-cyan border-2 border-dark-400">
                </div>

                <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded bg-emerald-500/20 flex-center text-emerald-400"><Bot
                            className="w-3 h-3" /></div>
                    <div>
                        <span className="text-xs font-semibold text-white block">Senior Analyst</span>
                        <span className="text-[9px] text-gray-400 block">Model: Sonnet 3.5</span>
                    </div>
                </div>
                <div className="text-[10px] text-gray-500 p-2 bg-dark-400 rounded border border-white/5">
                    "Synthesize collected data and generate daily briefing report in Markdown."
                </div>

                <div
                    className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-emerald-400 border-2 border-dark-400 cursor-crosshair">
                </div>
            </div>

            {/* Properties Panel (Right) */}
            <div
                className="absolute right-0 top-16 bottom-0 w-80 glass-panel border-r-0 border-y-0 border-l border-white/10 rounded-none rounded-tl-2xl bg-dark-300/80 p-6 overflow-y-auto transform transition-transform z-20">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-medium text-white">Node Properties</h3>
                    <button className="btn-icon p-1 text-gray-500"><X className="w-4 h-4" /></button>
                </div>

                <div className="space-y-6">
                    <div className="space-y-1">
                        <label className="text-[10px] text-gray-500 uppercase font-semibold">Node Name</label>
                        <input type="text"
                            className="w-full bg-dark-200/50 border border-white/10 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-accent-cyan/50"
                            value="Market Data Collector" />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] text-gray-500 uppercase font-semibold">Assigned Agent</label>
                        <select
                            className="w-full bg-dark-200/50 border border-white/10 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-accent-cyan/50 appearance-none">
                            <option>Finance Specialist (Haiku)</option>
                            <option>CIO Manager (Sonnet)</option>
                            <option>Data Scraper (Worker)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-500 uppercase font-semibold">System Prompt Override</label>
                        <textarea
                            className="w-full bg-dark-200/50 border border-white/10 rounded px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-accent-cyan/50 h-24 resize-none leading-relaxed">Focus strictly on quantitative metrics. Do not provide qualitative analysis. Pull only the closing prices and volume data for the provided symbols.</textarea>
                    </div>

                    <button
                        className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 py-2 rounded-lg text-xs transition-colors">
                        Delete Node
                    </button>
                </div>
            </div>

        </div>
    </main>
    </>
  );
}

export default Nexus;
