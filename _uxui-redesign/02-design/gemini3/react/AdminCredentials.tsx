"use client";
import React from "react";
import { AlertCircle, Bot, Cloud, Cpu, Key, LayoutDashboard, Lock, Network, Plus, RefreshCw, Settings2, ShieldCheck, Users, Wrench } from "lucide-react";

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

function AdminCredentials() {
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
                <a href="/admin/credentials" className="nav-item active"><Key className="w-4 h-4" />
                    Global Credentials</a>
                <a href="/admin/tools" className="nav-item"><Wrench className="w-4 h-4" /> Tool
                    Integrations</a>
            </div>
        </div>
    </aside>

    <main className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">

        <header
            className="h-16 flex items-center justify-between px-8 border-b border-white/[0.05] bg-dark-300/50 backdrop-blur shrink-0">
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-emerald-400 font-mono tracking-wide"><ShieldCheck
                        className="w-4 h-4 inline mr-2" />PLATFORM KMS VAULT</span>
            </div>
            <div className="flex items-center gap-3">
                <button className="btn btn-primary text-xs py-1.5"><Plus className="w-3 h-3" /> Add
                    Secret</button>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
            <div className="max-w-6xl mx-auto">

                <h2 className="text-xl font-medium text-white mb-2">Platform Secrets & Keys</h2>
                <p className="text-sm text-gray-400 mb-8 max-w-2xl">Manage system-level API keys and overarching credential
                    templates. Workspace-specific keys are managed inside individual tenant settings.</p>

                {/* Vault List (API: GET /api/admin/credentials) */}
                <div className="glass-panel overflow-hidden border-emerald-500/20">
                    <div className="p-4 border-b border-white/5 bg-emerald-500/5 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-mono text-emerald-400">ENCRYPTED AT REST (AES-256)</span>
                        </div>
                        <input type="text" placeholder="Search Vault..."
                            className="bg-dark-900 border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none w-64" />
                    </div>

                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr
                                className="bg-dark-300/30 text-gray-400 border-b border-white/5 uppercase text-[10px] tracking-wider font-mono">
                                <th className="py-4 px-6 font-medium">Service Name</th>
                                <th className="py-4 px-6 font-medium">Key Prefix</th>
                                <th className="py-4 px-6 font-medium">Environment</th>
                                <th className="py-4 px-6 font-medium">Last Rotated</th>
                                <th className="py-4 px-6 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-300">

                            <tr className="border-b border-white/5 hover:bg-white/[0.02]">
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 rounded bg-white/5 border border-white/10 flex-center text-white">
                                            <Cpu className="w-4 h-4" /></div>
                                        <p className="font-medium text-white">Anthropic API (Primary)</p>
                                    </div>
                                </td>
                                <td
                                    className="py-4 px-6 font-mono text-xs text-emerald-400 bg-emerald-500/5 p-1 rounded inline-block mt-3">
                                    sk-ant-api03-**************</td>
                                <td className="py-4 px-6"><span
                                        className="bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded text-[10px] border border-rose-500/20">Production</span>
                                </td>
                                <td className="py-4 px-6 font-mono text-[10px] text-gray-500">14 days ago</td>
                                <td className="py-4 px-6 text-right">
                                    <div className="flex gap-2 justify-end">
                                        <button className="btn-icon p-1.5"><RefreshCw
                                                className="w-3 h-3" /></button>
                                        <button className="btn-icon p-1.5"><Settings2
                                                className="w-3 h-3" /></button>
                                    </div>
                                </td>
                            </tr>

                            <tr className="border-b border-white/5 hover:bg-white/[0.02]">
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 rounded bg-white/5 border border-white/10 flex-center text-white">
                                            <Cpu className="w-4 h-4" /></div>
                                        <p className="font-medium text-white">Anthropic API (Fallback)</p>
                                    </div>
                                </td>
                                <td
                                    className="py-4 px-6 font-mono text-xs text-emerald-400 bg-emerald-500/5 p-1 rounded inline-block mt-3">
                                    sk-ant-api03-**************</td>
                                <td className="py-4 px-6"><span
                                        className="bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded text-[10px] border border-rose-500/20">Production</span>
                                </td>
                                <td className="py-4 px-6 font-mono text-[10px] text-gray-500">60 days ago</td>
                                <td className="py-4 px-6 text-right">
                                    <div className="flex gap-2 justify-end">
                                        <button className="btn-icon p-1.5"><RefreshCw
                                                className="w-3 h-3" /></button>
                                        <button className="btn-icon p-1.5"><Settings2
                                                className="w-3 h-3" /></button>
                                    </div>
                                </td>
                            </tr>

                            <tr className="border-b border-white/5 hover:bg-white/[0.02]">
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 rounded bg-blue-500/10 border border-blue-500/20 flex-center text-blue-400">
                                            <Cloud className="w-4 h-4" /></div>
                                        <p className="font-medium text-white">AWS S3 Role Access</p>
                                    </div>
                                </td>
                                <td
                                    className="py-4 px-6 font-mono text-xs text-emerald-400 bg-emerald-500/5 p-1 rounded inline-block mt-3">
                                    AKIAIOSFODNN7E******</td>
                                <td className="py-4 px-6"><span
                                        className="bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded text-[10px] border border-gray-500/20">Staging</span>
                                </td>
                                <td className="py-4 px-6 font-mono text-[10px] text-gray-500">120 days ago <AlertCircle className="w-3 h-3 inline text-amber-500 ml-1" /></td>
                                <td className="py-4 px-6 text-right">
                                    <div className="flex gap-2 justify-end">
                                        <button className="btn-icon p-1.5 text-amber-500 hover:text-amber-400"><RefreshCw className="w-3 h-3" /></button>
                                        <button className="btn-icon p-1.5"><Settings2
                                                className="w-3 h-3" /></button>
                                    </div>
                                </td>
                            </tr>

                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    </main>
    </>
  );
}

export default AdminCredentials;
