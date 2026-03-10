"use client";
import React from "react";
import { Bot, Code, Dna, Folders, LayoutDashboard, PhoneOutgoing, Plus, Scale, Share2, Wrench } from "lucide-react";

const styles = `
@layer components {
            body { @apply bg-dark-900 text-gray-200 font-sans antialiased font-light min-h-screen overflow-hidden flex selection:bg-accent-cyan/30 selection:text-white; }
            .bg-ambient { @apply fixed inset-0 z-[-1] pointer-events-none; }
            .bg-ambient::before { content: ''; @apply absolute top-[-30%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-blue-600/10 blur-[150px]; }
            .bg-ambient::after { content: ''; @apply absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-500/5 blur-[120px]; }
            
            .glass-panel { @apply bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-glass rounded-2xl overflow-hidden transition-all duration-300; }
            
            .nav-item { @apply flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors font-medium text-sm; }
            .nav-item.active { @apply text-white bg-white/[0.08] shadow-[inset_2px_0_0_0_rgba(34,211,238,1)]; }
            
            .btn { @apply inline-flex items-center justify-center px-4 py-2 font-medium text-sm rounded-lg transition-all gap-2 cursor-pointer; }
            .btn-primary { @apply bg-gradient-accent text-white hover:shadow-glow hover:opacity-90; }
            .btn-secondary { @apply bg-white/[0.05] border border-white/[0.1] text-white hover:bg-white/[0.1]; }
            
            .text-gradient { @apply bg-gradient-accent bg-clip-text text-transparent; }
            
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        }
`;

function AdminOrgTemplates() {
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
                <a href="/admin/soul-templates" className="nav-item"><Dna className="w-4 h-4" /> Soul
                    Templates</a>
                <a href="/admin/org-templates" className="nav-item active"><Folders className="w-4 h-4" />
                    Org Templates</a>
                <a href="/admin/report-lines" className="nav-item"><Share2 className="w-4 h-4" /> Comms
                    Matrix</a>
            </div>
        </div>
    </aside>

    <main className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">

        <header
            className="h-16 flex items-center justify-between px-8 border-b border-white/[0.05] bg-dark-300/50 backdrop-blur shrink-0">
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-300"><Folders
                        className="w-4 h-4 inline mr-2 text-emerald-400" />Department Blueprints</span>
            </div>
            <div className="flex items-center gap-3">
                <button className="btn btn-primary text-xs py-1.5"><Plus className="w-3 h-3" /> Create
                    Blueprint</button>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h2 className="text-xl font-medium text-white mb-2">Organizational Templates</h2>
                    <p className="text-sm text-gray-500 font-light max-w-3xl">Pre-configured bundles of AI Agents, internal
                        roles, and default permissions. Tenants can deploy these to instantly provision standard
                        business units.</p>
                </div>

                {/* API: GET /api/admin/org-templates */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Template 1: Standard SWE Pod */}
                    <div
                        className="glass-panel border-white/10 hover:border-emerald-500/30 transition-all group flex flex-col">
                        <div className="p-6 border-b border-white/5 flex-1 bg-dark-300/30">
                            <div className="flex justify-between items-start mb-4">
                                <div
                                    className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex-center text-emerald-400">
                                    <Code className="w-6 h-6" />
                                </div>
                                <span
                                    className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] border border-emerald-500/20">Active</span>
                            </div>
                            <h3
                                className="text-base font-medium text-white mb-1 group-hover:text-emerald-400 transition-colors">
                                Software Engineering Pod</h3>
                            <p className="text-[10px] text-gray-500 font-mono mb-4">ID: tpl_org_swe_v1</p>
                            <p className="text-xs text-gray-400 font-light line-clamp-2">A complete agile engineering pod
                                featuring automated Code Reviewers, a QA tester, and an AI Project Manager.</p>

                            <div className="mt-6 space-y-2">
                                <h4 className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Included
                                    Agents</h4>
                                <div className="flex gap-2 flex-wrap">
                                    <span
                                        className="text-[10px] border border-white/10 bg-dark-400 px-2 py-1 rounded text-gray-300"><Bot className="w-3 h-3 inline mr-1 text-accent-cyan" /> AI
                                        Product Manager</span>
                                    <span
                                        className="text-[10px] border border-white/10 bg-dark-400 px-2 py-1 rounded text-gray-300"><Bot className="w-3 h-3 inline mr-1 text-accent-cyan" /> Sr. Code
                                        Reviewer</span>
                                    <span
                                        className="text-[10px] border border-white/10 bg-dark-400 px-2 py-1 rounded text-gray-300"><Bot className="w-3 h-3 inline mr-1 text-accent-cyan" /> QA
                                        Automation</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-white/5 flex justify-between items-center bg-dark-100/50">
                            <span className="text-[10px] text-gray-500 font-mono">Used by 84 Tenants</span>
                            <button className="text-xs text-white hover:text-emerald-400 transition-colors font-medium">Edit
                                Blueprint</button>
                        </div>
                    </div>

                    {/* Template 2: Outbound Sales */}
                    <div
                        className="glass-panel border-white/10 hover:border-blue-500/30 transition-all group flex flex-col">
                        <div className="p-6 border-b border-white/5 flex-1 bg-dark-300/30">
                            <div className="flex justify-between items-start mb-4">
                                <div
                                    className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex-center text-blue-400">
                                    <PhoneOutgoing className="w-6 h-6" />
                                </div>
                                <span
                                    className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-[10px] border border-blue-500/20">Active</span>
                            </div>
                            <h3
                                className="text-base font-medium text-white mb-1 group-hover:text-blue-400 transition-colors">
                                Outbound Sales Squad</h3>
                            <p className="text-[10px] text-gray-500 font-mono mb-4">ID: tpl_org_sdr_v2</p>
                            <p className="text-xs text-gray-400 font-light line-clamp-2">High-volume lead generation and
                                email outreach pod. Includes persona researchers and sequence writers.</p>

                            <div className="mt-6 space-y-2">
                                <h4 className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Included
                                    Agents</h4>
                                <div className="flex gap-2 flex-wrap">
                                    <span
                                        className="text-[10px] border border-white/10 bg-dark-400 px-2 py-1 rounded text-gray-300"><Bot className="w-3 h-3 inline mr-1 text-accent-cyan" /> Lead
                                        Researcher</span>
                                    <span
                                        className="text-[10px] border border-white/10 bg-dark-400 px-2 py-1 rounded text-gray-300"><Bot className="w-3 h-3 inline mr-1 text-accent-cyan" /> SDR
                                        AI</span>
                                    <span
                                        className="text-[10px] border border-white/10 bg-dark-400 px-2 py-1 rounded text-gray-300"><Bot className="w-3 h-3 inline mr-1 text-accent-cyan" /> CRM
                                        Updater</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-white/5 flex justify-between items-center bg-dark-100/50">
                            <span className="text-[10px] text-gray-500 font-mono">Used by 120 Tenants</span>
                            <button className="text-xs text-white hover:text-blue-400 transition-colors font-medium">Edit
                                Blueprint</button>
                        </div>
                    </div>

                    {/* Template 3: HR / Legal */}
                    <div
                        className="glass-panel border-white/10 hover:border-amber-500/30 transition-all group flex flex-col opacity-60">
                        <div className="p-6 border-b border-white/5 flex-1 bg-dark-300/30">
                            <div className="flex justify-between items-start mb-4">
                                <div
                                    className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex-center text-amber-500">
                                    <Scale className="w-6 h-6" />
                                </div>
                                <span
                                    className="bg-white/5 text-gray-400 px-2 py-0.5 rounded text-[10px] border border-white/10">Draft</span>
                            </div>
                            <h3 className="text-base font-medium text-gray-400 mb-1">Legal & Compliance</h3>
                            <p className="text-[10px] text-gray-500 font-mono mb-4">ID: tpl_org_legal_draft</p>
                            <p className="text-xs text-gray-400 font-light line-clamp-2">Contract review, compliance
                                checking, and corporate policy drafting pod.</p>

                            <div className="mt-6 space-y-2">
                                <h4 className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Included
                                    Agents</h4>
                                <div className="flex gap-2 flex-wrap">
                                    <span
                                        className="text-[10px] border border-white/10 bg-dark-400 px-2 py-1 rounded text-gray-300"><Bot className="w-3 h-3 inline mr-1 text-accent-cyan" /> Contract
                                        Analyzer</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-white/5 flex justify-between items-center bg-dark-100/50">
                            <span className="text-[10px] text-gray-500 font-mono">Unpublished</span>
                            <button
                                className="text-xs text-white hover:text-amber-500 transition-colors font-medium">Continue
                                Editing</button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    </main>
    </>
  );
}

export default AdminOrgTemplates;
