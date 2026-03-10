"use client";
import React from "react";
import { BarChart3, Building2, KeySquare, LayoutDashboard, Settings, ShieldAlert } from "lucide-react";

const styles = `
@layer components {
            body { @apply bg-dark-900 text-gray-200 font-sans antialiased font-light min-h-screen overflow-hidden flex selection:bg-gray-500/30 selection:text-white; }
            .bg-ambient { @apply fixed inset-0 z-[-1] pointer-events-none; }
            .bg-ambient::before { content: ''; @apply absolute top-[-30%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-blue-600/10 blur-[150px]; }
            .bg-ambient::after { content: ''; @apply absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent-purple/5 blur-[120px]; }
            
            .glass-panel { @apply bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-glass rounded-2xl overflow-hidden transition-all duration-300; }
            
            .nav-item { @apply flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors font-medium text-sm; }
            .nav-item.active { @apply text-white bg-white/[0.08] shadow-[inset_2px_0_0_0_rgba(255,255,255,0.3)]; }
            
            .btn { @apply inline-flex items-center justify-center px-4 py-2 font-medium text-sm rounded-lg transition-all gap-2 cursor-pointer; }
            .btn-primary { @apply bg-white text-black hover:bg-gray-200; }
            
            .text-gradient { @apply bg-gradient-accent bg-clip-text text-transparent; }
            
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            
            /* Toggle Switch */
            .toggle-checkbox:checked { @apply right-0 border-accent-cyan; right: 0; left: auto; border-color: #22d3ee; }
            .toggle-checkbox:checked + .toggle-label { @apply bg-accent-cyan; }
        }
`;

function AdminSettings() {
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
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Platform
                    Administration</p>
                <a href="/admin/api-keys" className="nav-item"><KeySquare className="w-4 h-4" /> Platform
                    API Keys</a>
                <a href="/admin/costs" className="nav-item"><BarChart3 className="w-4 h-4" /> Global
                    Costs</a>
                <a href="/admin/companies" className="nav-item"><Building2 className="w-4 h-4" /> Tenancy
                    / Companies</a>
                <a href="/admin/settings" className="nav-item active"><Settings className="w-4 h-4" />
                    Platform Settings</a>
            </div>
        </div>
    </aside>

    <main className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">

        <header
            className="h-16 flex items-center justify-between px-8 border-b border-white/[0.05] bg-dark-300/50 backdrop-blur shrink-0">
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-300"><Settings
                        className="w-4 h-4 inline mr-2 text-gray-400" />Global Platform Settings</span>
            </div>
            <div className="flex items-center gap-3">
                <button className="btn btn-primary text-xs py-1.5 px-6">Save Changes</button>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
            <div className="max-w-4xl mx-auto space-y-8">

                <div className="glass-panel overflow-hidden">
                    <div className="p-6 border-b border-white/5 bg-dark-300/30">
                        <h3 className="text-base font-medium text-white">System Defaults</h3>
                        <p className="text-xs text-gray-500 mt-1">Configure baseline limits for newly provisioned
                            workspaces.</p>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-2">Default Base AI
                                    Model</label>
                                <select
                                    className="w-full bg-dark-200/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 appearance-none focus:outline-none">
                                    <option>Claude 3.5 Sonnet (Recommended)</option>
                                    <option>GPT-4o Mini</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-2">Default Monthly Token Limit
                                    (Soft)</label>
                                <input type="number" value="1000000"
                                    className="w-full bg-dark-200/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-panel overflow-hidden border-rose-500/20">
                    <div className="p-6 border-b border-white/5 bg-rose-500/5">
                        <h3 className="text-base font-medium text-rose-400 flex items-center gap-2"><ShieldAlert className="w-4 h-4" /> Danger Zone</h3>
                        <p className="text-xs text-gray-500 mt-1">Platform-altering actions affecting all tenants.</p>
                    </div>
                    <div className="p-6 space-y-6">

                        <div className="flex justify-between items-center pb-6 border-b border-white/5">
                            <div>
                                <h4 className="text-sm font-medium text-white">Maintenance Mode</h4>
                                <p className="text-xs text-gray-500 mt-1">Lock out non-admin users and pause all background
                                    agents.</p>
                            </div>
                            <div
                                className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                <input type="checkbox" name="toggle" id="maintenance"
                                    className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-dark-300 appearance-none cursor-pointer transition-colors duration-200 ease-in-out" />
                                <label htmlFor="maintenance"
                                    className="toggle-label block overflow-hidden h-5 rounded-full bg-dark-300 cursor-pointer"></label>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="text-sm font-medium text-white">Global Agent Killswitch</h4>
                                <p className="text-xs text-gray-500 mt-1">Force terminate all running agent pods globally.
                                    Used for severe cost overruns.</p>
                            </div>
                            <button
                                className="px-4 py-2 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider">Execute
                                Killswitch</button>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    </main>
    </>
  );
}

export default AdminSettings;
