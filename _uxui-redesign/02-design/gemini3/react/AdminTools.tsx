"use client";
import React from "react";
import { Bot, Github, Key, LayoutDashboard, Linkedin, Network, Plus, Twitter, Users, Webhook, Wrench } from "lucide-react";

const styles = `
@layer components {
            body { @apply bg-dark-900 text-gray-200 font-sans antialiased font-light min-h-screen overflow-hidden flex selection:bg-accent-cyan/30 selection:text-white; }
            .bg-ambient { @apply fixed inset-0 z-[-1] pointer-events-none; }
            .bg-ambient::before { content: ''; @apply absolute top-[-30%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-blue-600/10 blur-[150px]; }
            .bg-ambient::after { content: ''; @apply absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent-purple/5 blur-[120px]; }
            
            .glass-panel { @apply bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-glass rounded-2xl overflow-hidden transition-all duration-300; }
            
            .nav-item { @apply flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors font-medium text-sm; }
            .nav-item.active { @apply text-white bg-white/[0.08] shadow-[inset_2px_0_0_0_rgba(34,211,238,1)]; }
            
            .btn { @apply inline-flex items-center justify-center px-4 py-2 font-medium text-sm rounded-lg transition-all gap-2 cursor-pointer; }
            .btn-primary { @apply bg-gradient-accent text-white hover:shadow-glow hover:opacity-90; }
            .btn-secondary { @apply bg-white/[0.05] border border-white/[0.1] text-white hover:bg-white/[0.1]; }
            
            .text-gradient { @apply bg-gradient-accent bg-clip-text text-transparent; }
            
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            
            .tool-card { @apply p-5 rounded-xl border border-white/5 bg-dark-300/30 hover:bg-white/[0.02] hover:border-white/10 transition-all; }
        }
`;

function AdminTools() {
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
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Platform</p>
                <a href="/admin/agents" className="nav-item"><Bot className="w-4 h-4" /> Agent
                    Registry</a>
                <a href="/admin/departments" className="nav-item"><Network className="w-4 h-4" />
                    Departments</a>
                <a href="/admin/employees" className="nav-item"><Users className="w-4 h-4" />
                    Employees</a>
            </div>

            <div className="space-y-1">
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Systems</p>
                <a href="/admin/credentials" className="nav-item"><Key className="w-4 h-4" /> Global
                    Credentials</a>
                <a href="/admin/tools" className="nav-item active"><Wrench className="w-4 h-4" /> Tool
                    Integrations</a>
            </div>
        </div>
    </aside>

    <main className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">

        <header
            className="h-16 flex items-center justify-between px-8 border-b border-white/[0.05] bg-dark-300/50 backdrop-blur shrink-0">
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-300"><Wrench
                        className="w-4 h-4 inline mr-2 text-blue-400" />Tool Capabilities Registry</span>
            </div>
            <div className="flex items-center gap-3">
                <button className="btn btn-primary text-xs py-1.5"><Plus className="w-3 h-3" /> Register
                    Platform Tool</button>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
            <div className="max-w-7xl mx-auto">

                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-medium text-white">Platform Integrations</h2>
                    <div className="flex gap-2">
                        <select
                            className="bg-dark-200/50 border border-white/10 text-xs px-3 py-2 rounded-lg text-gray-300 appearance-none pr-8 focus:outline-none">
                            <option>Category: All</option>
                            <option>Communications (SNS)</option>
                            <option>Data Providers</option>
                            <option>Internal Systems</option>
                        </select>
                    </div>
                </div>

                {/* Tools Grid (API: GET /api/admin/tools) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Tool 1 */}
                    <div className="tool-card relative group">
                        <div
                            className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-medium border border-emerald-500/20">
                            Operational</div>
                        <div className="flex items-start gap-4 mb-4">
                            <div
                                className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex-center text-white shadow-lg shadow-blue-500/20">
                                <Linkedin className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-white">LinkedIn Marketing API</h3>
                                <p className="text-xs text-gray-400 mt-1">v2.0 • Communications</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-6 font-light">Allows marketing agents to draft, schedule, and
                            publish content directly to company LinkedIn pages.</p>

                        <div className="flex justify-between items-center pt-4 border-t border-white/5">
                            <span className="text-[10px] text-gray-500 font-mono">14 Workspaces using this</span>
                            <button
                                className="text-xs text-accent-cyan hover:text-white transition-colors">Configure</button>
                        </div>
                    </div>

                    {/* Tool 2 */}
                    <div className="tool-card relative group">
                        <div
                            className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-medium border border-emerald-500/20">
                            Operational</div>
                        <div className="flex items-start gap-4 mb-4">
                            <div
                                className="w-12 h-12 rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 flex-center text-white shadow-lg border border-white/10">
                                <Github className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-white">GitHub Enforcer</h3>
                                <p className="text-xs text-gray-400 mt-1">v1.4 • Internal Systems</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-6 font-light">Hooks for agents to read PRs, analyze code
                            diffs, and leave automated review comments.</p>

                        <div className="flex justify-between items-center pt-4 border-t border-white/5">
                            <span className="text-[10px] text-gray-500 font-mono">Global System Tool</span>
                            <button
                                className="text-xs text-accent-cyan hover:text-white transition-colors">Configure</button>
                        </div>
                    </div>

                    {/* Tool 3 */}
                    <div className="tool-card relative group">
                        <div
                            className="absolute top-4 right-4 bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded text-[10px] font-medium border border-amber-500/20">
                            Deprecated</div>
                        <div className="flex items-start gap-4 mb-4">
                            <div
                                className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex-center text-white shadow-lg shadow-blue-400/20 opacity-50">
                                <Twitter className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-400">Twitter/X API v1.1</h3>
                                <p className="text-xs text-gray-500 mt-1">Legacy • Communications</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 mb-6 font-light">Legacy API endpoint for SNS syndication.
                            Scheduled for removal on Dec 31st.</p>

                        <div className="flex justify-between items-center pt-4 border-t border-white/5">
                            <span className="text-[10px] text-amber-500/70 font-mono">0 Active Workspaces</span>
                            <button className="text-xs text-rose-400 hover:text-white transition-colors">Delete</button>
                        </div>
                    </div>

                    {/* Custom Webhook Tool */}
                    <div className="tool-card relative group border-dashed hover:border-solid">
                        <div
                            className="absolute top-4 right-4 bg-white/5 text-gray-400 px-2 py-0.5 rounded text-[10px] font-medium border border-white/10">
                            Draft</div>
                        <div className="flex items-start gap-4 mb-4">
                            <div
                                className="w-12 h-12 rounded-xl bg-dark-200 flex-center text-gray-400 shadow-lg border border-white/5">
                                <Webhook className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-white">Custom Endpoint Hook</h3>
                                <p className="text-xs text-gray-400 mt-1">Custom • Internal</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-6 font-light">Generic HTTP client allowing agents to make
                            REST/GraphQL calls to unspecified external systems.</p>

                        <div className="flex justify-between items-center pt-4 border-t border-white/5">
                            <span className="text-[10px] text-gray-500 font-mono">Review Pending</span>
                            <button className="text-xs text-accent-cyan hover:text-white transition-colors">Complete
                                Setup</button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    </main>
    </>
  );
}

export default AdminTools;
