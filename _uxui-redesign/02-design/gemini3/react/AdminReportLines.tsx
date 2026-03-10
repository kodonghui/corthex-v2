"use client";
import React from "react";
import { ArrowRight, Bot, Crown, Dna, Folders, LayoutDashboard, Save, Share2, Webhook, Wrench } from "lucide-react";

const styles = `
@layer components {
            body { @apply bg-dark-900 text-gray-200 font-sans antialiased font-light min-h-screen overflow-hidden flex selection:bg-accent-purple/30 selection:text-white; }
            .bg-ambient { @apply fixed inset-0 z-[-1] pointer-events-none; }
            .bg-ambient::before { content: ''; @apply absolute top-[-30%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-blue-600/10 blur-[150px]; }
            .bg-ambient::after { content: ''; @apply absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent-purple/5 blur-[120px]; }
            
            .glass-panel { @apply bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-glass rounded-2xl overflow-hidden transition-all duration-300; }
            
            .nav-item { @apply flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors font-medium text-sm; }
            .nav-item.active { @apply text-white bg-white/[0.08] shadow-[inset_2px_0_0_0_rgba(168,85,247,1)]; }
            
            .btn { @apply inline-flex items-center justify-center px-4 py-2 font-medium text-sm rounded-lg transition-all gap-2 cursor-pointer; }
            .btn-primary { @apply bg-gradient-accent text-white hover:shadow-glow hover:opacity-90; }
            .btn-secondary { @apply bg-white/[0.05] border border-white/[0.1] text-white hover:bg-white/[0.1]; }
            
            .text-gradient { @apply bg-gradient-accent bg-clip-text text-transparent; }
            
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            
            .matrix-node { @apply p-4 rounded-xl border border-white/10 bg-dark-200/50 flex flex-col; }
            .matrix-arrow { @apply absolute top-1/2 -translate-y-1/2 border-t-2 border-dashed border-accent-purple/50 flex items-center; }
        }
`;

function AdminReportLines() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
<div className="bg-ambient"></div>

    <aside className="w-64 border-r border-white/[0.08] bg-dark-400/80 backdrop-blur-xl flex flex-col h-full z-20 shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-white/[0.05]">
            <h1 className="text-xl font-bold tracking-wider text-gradient">CORTHEX</h1>
            <span
                className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">ADMIN</span>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide py-6 px-4 space-y-8">
            <div className="space-y-1">
                <a href="/admin/dashboard" className="nav-item"><LayoutDashboard className="w-4 h-4" />
                    Global Dashboard</a>
            </div>

            <div className="space-y-1">
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Capabilities</p>
                <a href="/admin/tools" className="nav-item"><Wrench className="w-4 h-4" /> Tool
                    Integrations</a>
                <a href="/admin/soul-templates" className="nav-item"><Dna className="w-4 h-4" /> Soul
                    Templates</a>
                <a href="/admin/org-templates" className="nav-item"><Folders className="w-4 h-4" /> Org
                    Templates</a>
                <a href="/admin/report-lines" className="nav-item active"><Share2 className="w-4 h-4" />
                    Comms Matrix</a>
            </div>
        </div>
    </aside>

    <main className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">

        <header
            className="h-16 flex items-center justify-between px-8 border-b border-white/[0.05] bg-dark-300/50 backdrop-blur shrink-0">
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-300"><Share2
                        className="w-4 h-4 inline mr-2 text-accent-purple" />Agent Communications Matrix</span>
            </div>
            <div className="flex items-center gap-3">
                <button className="btn btn-primary text-xs py-1.5"><Save className="w-3 h-3" /> Sync Matrix
                    Policies</button>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h2 className="text-xl font-medium text-white mb-2">Reporting Pipelines</h2>
                        <p className="text-sm text-gray-500 font-light max-w-2xl">Configure how agents pass information,
                            summaries, and escalations up the command chain.</p>
                    </div>
                </div>

                {/* API: GET /api/admin/report-lines */}
                <div className="space-y-8">

                    {/* Pipeline 1 */}
                    <div className="glass-panel p-6 border-l-4 border-l-emerald-500 relative">
                        <h3 className="text-sm font-medium text-white mb-6">Daily Engineering Standup Rollup</h3>

                        <div
                            className="flex items-center justify-between relative pl-8 pr-16 bg-dark-900/50 py-8 rounded-xl border border-white/5 overflow-hidden">
                            {/* Background line */}
                            <div className="absolute left-10 right-10 h-px bg-white/10 top-1/2 -translate-y-1/2 z-0"></div>

                            {/* Node 1 */}
                            <div className="matrix-node w-48 z-10 shadow-glass border-white/20">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 flex-center"><Bot className="w-3 h-3" /></div>
                                    <span className="text-xs font-semibold text-gray-300">Junior Dev Agents</span>
                                </div>
                                <span className="text-[10px] text-gray-500 bg-white/5 py-1 text-center rounded">Task Updates
                                    (Hourly)</span>
                            </div>

                            <ArrowRight className="w-5 h-5 text-gray-500 z-10 -ml-4 -mr-4" />

                            {/* Node 2 */}
                            <div className="matrix-node w-48 z-10 shadow-glass border-white/20">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-6 h-6 rounded bg-blue-500/20 text-blue-400 flex-center"><Bot className="w-3 h-3" /></div>
                                    <span className="text-xs font-semibold text-gray-300">AI Project Manager</span>
                                </div>
                                <span className="text-[10px] text-gray-500 bg-white/5 py-1 text-center rounded">Blocker
                                    Triaging</span>
                            </div>

                            <ArrowRight className="w-5 h-5 text-gray-500 z-10 -ml-4 -mr-4" />

                            {/* Node 3 */}
                            <div className="matrix-node w-48 z-10 shadow-glass border-accent-purple/30 bg-accent-purple/5">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-6 h-6 rounded bg-accent-purple/20 text-accent-purple flex-center"><Crown className="w-3 h-3" /></div>
                                    <span className="text-xs font-semibold text-white">Strategy CIO</span>
                                </div>
                                <span
                                    className="text-[10px] text-accent-purple bg-accent-purple/10 py-1 text-center rounded border border-accent-purple/20">Daily
                                    Exec Summary</span>
                            </div>
                        </div>
                    </div>

                    {/* Pipeline 2 */}
                    <div className="glass-panel p-6 border-l-4 border-l-rose-500 relative">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-medium text-white">Critical Incident Escalation</h3>
                            <span
                                className="bg-rose-500/10 text-rose-400 text-[10px] px-2 py-0.5 rounded border border-rose-500/20 font-mono">HIGH
                                PRIORITY</span>
                        </div>

                        <div
                            className="flex items-center justify-start gap-12 relative pl-8 pr-16 bg-dark-900/50 py-8 rounded-xl border border-white/5 overflow-hidden">
                            {/* Background line */}
                            <div
                                className="absolute left-10 w-96 h-px bg-white/10 top-1/2 -translate-y-1/2 z-0 border-t border-dashed border-rose-500/50">
                            </div>

                            {/* Node 1 */}
                            <div className="matrix-node w-48 z-10 shadow-glass border-white/20">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-6 h-6 rounded bg-dark-300 text-gray-400 flex-center"><Webhook className="w-3 h-3" /></div>
                                    <span className="text-xs font-semibold text-gray-300">PagerDuty Hook</span>
                                </div>
                                <span
                                    className="text-[10px] text-gray-500 bg-white/5 py-1 text-center rounded border border-rose-500/20 text-rose-400/80">Alert
                                    Trigger</span>
                            </div>

                            <ArrowRight className="w-5 h-5 text-rose-500 z-10 -ml-4 -mr-4" />

                            {/* Node 2 */}
                            <div className="matrix-node w-48 z-10 shadow-[0_0_20px_rgba(244,63,94,0.1)] border-rose-500/30">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-6 h-6 rounded bg-rose-500/20 text-rose-500 flex-center"><Bot className="w-3 h-3" /></div>
                                    <span className="text-xs font-semibold text-white">SRE Agent Response</span>
                                </div>
                                <span
                                    className="text-[10px] text-rose-400 bg-rose-500/10 py-1 text-center rounded border border-rose-500/20">Intervention
                                    (Immediate)</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </main>
    </>
  );
}

export default AdminReportLines;
