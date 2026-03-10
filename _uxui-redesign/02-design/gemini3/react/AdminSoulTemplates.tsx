"use client";
import React from "react";
import { Bot, Copy, Dna, Folders, LayoutDashboard, Plus, Save, Search, Wrench } from "lucide-react";

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
        }
`;

function AdminSoulTemplates() {
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
                <a href="/admin/agents" className="nav-item"><Bot className="w-4 h-4" /> Agent
                    Registry</a>
            </div>

            <div className="space-y-1">
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Capabilities</p>
                <a href="/admin/tools" className="nav-item"><Wrench className="w-4 h-4" /> Tool
                    Integrations</a>
                <a href="/admin/soul-templates" className="nav-item active"><Dna className="w-4 h-4" />
                    Soul Templates</a>
                <a href="/admin/org-templates" className="nav-item"><Folders className="w-4 h-4" /> Org
                    Templates</a>
            </div>
        </div>
    </aside>

    <main className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">

        <header
            className="h-16 flex items-center justify-between px-8 border-b border-white/[0.05] bg-dark-300/50 backdrop-blur shrink-0">
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-300"><Dna
                        className="w-4 h-4 inline mr-2 text-accent-purple" />AI Soul Architectures</span>
            </div>
            <div className="flex items-center gap-3">
                <button className="btn btn-primary text-xs py-1.5"><Plus className="w-3 h-3" /> Design Soul
                    Template</button>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
            <div className="max-w-7xl mx-auto flex gap-8">

                {/* Left: Master Template List */}
                <div className="w-80 shrink-0 flex flex-col gap-4">
                    <div className="relative">
                        <Search
                            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input type="text" placeholder="Search templates..."
                            className="w-full bg-dark-200/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-accent-purple/50" />
                    </div>

                    <div className="glass-panel overflow-y-auto h-[calc(100vh-14rem)] scrollbar-hide">
                        <div
                            className="p-4 border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors bg-white/5 border-l-2 border-l-accent-purple">
                            <h3 className="text-sm font-medium text-white">Quantitative Analyst (Base)</h3>
                            <p className="text-xs text-gray-500 mt-1 font-mono">ID: soul_quant_v2</p>
                            <div className="flex gap-2 mt-2">
                                <span
                                    className="text-[9px] bg-accent-purple/10 text-accent-purple px-1.5 py-0.5 rounded">Analytical</span>
                                <span
                                    className="text-[9px] bg-gray-500/10 text-gray-400 px-1.5 py-0.5 rounded border border-gray-500/20">System</span>
                            </div>
                        </div>

                        <div className="p-4 border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors">
                            <h3 className="text-sm font-medium text-gray-300">Creative Director (Alpha)</h3>
                            <p className="text-xs text-gray-500 mt-1 font-mono">ID: soul_creative_v1</p>
                            <div className="flex gap-2 mt-2">
                                <span
                                    className="text-[9px] bg-accent-cyan/10 text-accent-cyan px-1.5 py-0.5 rounded">Abstract</span>
                                <span
                                    className="text-[9px] bg-gray-500/10 text-gray-400 px-1.5 py-0.5 rounded border border-gray-500/20">System</span>
                            </div>
                        </div>

                        <div className="p-4 border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors">
                            <h3 className="text-sm font-medium text-gray-300">Strict Code Reviewer</h3>
                            <p className="text-xs text-gray-500 mt-1 font-mono">ID: soul_reviewer_strict</p>
                            <div className="flex gap-2 mt-2">
                                <span
                                    className="text-[9px] bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded">Cynical</span>
                                <span
                                    className="text-[9px] bg-gray-500/10 text-gray-400 px-1.5 py-0.5 rounded border border-gray-500/20">System</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Template Editor */}
                <div className="flex-1 glass-panel flex flex-col">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-dark-300/30">
                        <div>
                            <h2 className="text-lg font-medium text-white mb-1">Quantitative Analyst (Base)</h2>
                            <p className="text-xs text-gray-500 font-mono">soul_quant_v2 • Last updated: 2026-09-15</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="btn btn-secondary text-xs py-1.5"><Copy className="w-3 h-3" />
                                Duplicate</button>
                            <button className="btn btn-primary text-xs py-1.5"><Save className="w-3 h-3" />
                                Save Blueprint</button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 scrollbar-hide space-y-6">

                        <div>
                            <label
                                className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex justify-between">
                                System Prompt (Core Identity)
                                <span className="text-[10px] text-gray-500 font-mono">Token Limit: 2048</span>
                            </label>
                            <div className="relative">
                                <textarea
                                    className="w-full h-48 bg-dark-200/50 border border-white/10 rounded-lg p-4 text-sm text-gray-300 font-mono focus:outline-none focus:border-accent-purple/50 resize-y"
                                    spellcheck="false">You are an elite level Quantitative Analyst working for a top-tier hedge fund. Your primary objective is to analyze financial datasets, extract statistical significance, and identify predictive alpha signals.

Behavioral Traits:
- Extremely precise and detail-oriented.
- Highly skeptical of low p-value signals or untested theories.
- Communicates purely in data-backed conclusions and statistical probability.
- Never gives personal financial advice.</textarea>
                                <button
                                    className="absolute bottom-4 right-4 text-xs font-mono bg-white/5 border border-white/10 px-2 py-1 rounded text-gray-400 hover:text-white transition-colors">Test
                                    Context</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label
                                    className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex justify-between">
                                    Temperature
                                    <span className="text-accent-purple">0.1</span>
                                </label>
                                <input type="range" className="w-full accent-accent-purple" min="0" max="1" step="0.1"
                                    value="0.1" />
                                <p className="text-[10px] text-gray-500 mt-2">Low temperature for deterministic, highly
                                    analytical outputs.</p>
                            </div>

                            <div>
                                <label
                                    className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Default
                                    Base Model</label>
                                <select
                                    className="w-full bg-dark-200/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 appearance-none focus:outline-none">
                                    <option>Claude 3.5 Sonnet</option>
                                    <option>GPT-4o</option>
                                    <option>Claude 3.5 Opus</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label
                                className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Required
                                Capabilities (Tools)</label>
                            <div className="space-y-2">
                                <label
                                    className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] cursor-pointer transition-colors">
                                    <input type="checkbox" checked
                                        className="accent-accent-purple w-4 h-4 rounded border-white/10 bg-dark-300" />
                                    <div>
                                        <p className="text-sm text-white">Data Fetcher (Yahoo Finance / AlphaVantage)</p>
                                        <p className="text-[10px] text-gray-500">Provides access to historical equity
                                            constraints.</p>
                                    </div>
                                </label>
                                <label
                                    className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] cursor-pointer transition-colors">
                                    <input type="checkbox" checked
                                        className="accent-accent-purple w-4 h-4 rounded border-white/10 bg-dark-300" />
                                    <div>
                                        <p className="text-sm text-white">Python Data Execution Environment</p>
                                        <p className="text-[10px] text-gray-500">Sandboxed Python execution via Jupyter
                                            kernel.</p>
                                    </div>
                                </label>
                                <label
                                    className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] cursor-pointer transition-colors">
                                    <input type="checkbox"
                                        className="accent-accent-purple w-4 h-4 rounded border-white/10 bg-dark-300" />
                                    <div>
                                        <p className="text-sm text-gray-300">SEC EDGAR API Reader</p>
                                        <p className="text-[10px] text-gray-500">Retrieves 10-K and 10-Q corporate filings.
                                        </p>
                                    </div>
                                </label>
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

export default AdminSoulTemplates;
