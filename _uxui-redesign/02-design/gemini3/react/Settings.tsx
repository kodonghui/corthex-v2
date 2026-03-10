"use client";
import React from "react";
import { Bell, Calculator, Camera, CreditCard, Home, Layout, LayoutDashboard, Plug, Save, Settings, Shield, Users } from "lucide-react";

const styles = `
@layer components {
            body { @apply bg-dark-400 text-gray-200 font-sans antialiased font-light min-h-screen overflow-hidden flex selection:bg-accent-purple/30 selection:text-white; }
            .bg-ambient { @apply fixed inset-0 z-[-1] pointer-events-none; }
            .bg-ambient::before { content: ''; @apply absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent-purple/10 blur-[120px]; }
            .bg-ambient::after { content: ''; @apply absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent-cyan/10 blur-[120px]; }
            
            .glass-panel { @apply bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-glass rounded-2xl overflow-hidden transition-all duration-300; }
            
            .nav-item { @apply flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors font-medium text-sm; }
            .nav-item.active { @apply text-white bg-white/[0.08] shadow-[inset_2px_0_0_0_rgba(168,85,247,1)]; }
            
            .btn { @apply inline-flex items-center justify-center px-4 py-2 font-medium text-sm rounded-lg transition-all gap-2 cursor-pointer; }
            .btn-primary { @apply bg-gradient-accent text-white hover:shadow-glow hover:opacity-90; }
            .btn-secondary { @apply bg-white/[0.05] border border-white/[0.1] text-white hover:bg-white/[0.1]; }
            
            .text-gradient { @apply bg-gradient-accent bg-clip-text text-transparent; }
            
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            
            .settings-section { @apply mb-10 pb-10 border-b border-white/5 last:border-0 last:pb-0; }
            .settings-input { @apply w-full bg-dark-300/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-purple/50 transition-colors; }
        }
`;

function Settings() {
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
                <a href="/app/dashboard" className="nav-item"><LayoutDashboard className="w-4 h-4" />
                    Dashboard</a>
            </div>

            <div className="space-y-1">
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Systems</p>
                <a href="/app/costs" className="nav-item"><Calculator className="w-4 h-4" /> Resource
                    Costs</a>
            </div>

            <div className="space-y-1">
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">User</p>
                <a href="/app/notifications" className="nav-item"><Bell className="w-4 h-4" />
                    Notifications</a>
                <a href="/app/settings" className="nav-item active"><Settings className="w-4 h-4" />
                    Settings</a>
            </div>
        </div>
    </aside>

    <main className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">

        <header
            className="h-16 flex items-center justify-between px-8 border-b border-white/[0.05] bg-dark-400/50 backdrop-blur shrink-0">
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-300"><Settings
                        className="w-4 h-4 inline mr-2 text-gray-400" />Workspace Settings</span>
            </div>
            <div className="flex items-center gap-3">
                {/* API: PUT /api/workspace/settings */}
                <button className="btn btn-primary text-xs py-1.5"><Save className="w-3 h-3" /> Save
                    Changes</button>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide flex gap-10 max-w-7xl mx-auto w-full">

            {/* Left Navigation Menu */}
            <div className="w-64 shrink-0">
                <div className="sticky top-0 space-y-1">
                    <button
                        className="w-full text-left px-4 py-2.5 rounded-lg bg-white/5 text-white text-sm font-medium border border-white/10 flex items-center gap-3">
                        <Layout className="w-4 h-4 text-accent-purple" /> Workspace Profile
                    </button>
                    <button
                        className="w-full text-left px-4 py-2.5 rounded-lg text-gray-400 hover:bg-white/[0.02] hover:text-white transition-colors text-sm flex items-center gap-3">
                        <Users className="w-4 h-4" /> Members & Roles
                    </button>
                    <button
                        className="w-full text-left px-4 py-2.5 rounded-lg text-gray-400 hover:bg-white/[0.02] hover:text-white transition-colors text-sm flex items-center gap-3">
                        <Plug className="w-4 h-4" /> Integrations
                    </button>
                    <button
                        className="w-full text-left px-4 py-2.5 rounded-lg text-gray-400 hover:bg-white/[0.02] hover:text-white transition-colors text-sm flex items-center gap-3">
                        <CreditCard className="w-4 h-4" /> Billing & Limits
                    </button>
                    <button
                        className="w-full text-left px-4 py-2.5 rounded-lg text-gray-400 hover:bg-white/[0.02] hover:text-white transition-colors text-sm flex items-center gap-3">
                        <Shield className="w-4 h-4" /> Security & Tokens
                    </button>
                </div>
            </div>

            {/* Settings Content (API: GET /api/workspace/settings) */}
            <div className="flex-1 max-w-3xl pb-20">

                {/* Section: Workspace Profile */}
                <div className="settings-section">
                    <h2 className="text-xl font-medium text-white mb-6">Workspace Profile</h2>

                    <div className="flex items-start gap-8 mb-8">
                        <div
                            className="w-24 h-24 rounded-2xl bg-dark-300 border border-white/10 flex-center text-gray-500 overflow-hidden group cursor-pointer relative">
                            <span className="text-2xl font-bold font-mono">GT</span>
                            <div
                                className="absolute inset-0 bg-black/60 flex-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="flex-1 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Workspace Name</label>
                                <input type="text" value="Global Tech Inc." className="settings-input" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Workspace Slug</label>
                                <div className="flex">
                                    <span
                                        className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-white/10 bg-dark-200 text-gray-500 sm:text-sm">corthex.com/</span>
                                    <input type="text" value="global-tech" className="settings-input rounded-l-none" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section: Default Models */}
                <div className="settings-section">
                    <h2 className="text-xl font-medium text-white mb-2">Default AI Providers</h2>
                    <p className="text-sm text-gray-500 mb-6 font-light">Set the default models used when creating new
                        agents or generating quick drafts.</p>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-5 rounded-xl border border-white/10 bg-dark-300/30">
                            <label
                                className="block text-sm font-medium text-gray-300 mb-3 flex items-center justify-between">
                                Smart Routing Model
                                <span
                                    className="bg-accent-purple/10 text-accent-purple text-[10px] px-2 py-0.5 rounded border border-accent-purple/20">Recommended</span>
                            </label>
                            <select className="settings-input cursor-pointer appearance-none">
                                <option>Claude 3.5 Sonnet</option>
                                <option>GPT-4o</option>
                                <option>Claude 3.5 Opus</option>
                            </select>
                            <p className="text-[10px] text-gray-500 mt-2">Used for complex reasoning and planning.</p>
                        </div>

                        <div className="p-5 rounded-xl border border-white/10 bg-dark-300/30">
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                                Fast/Cheap Model
                            </label>
                            <select className="settings-input cursor-pointer appearance-none">
                                <option>Claude 3.5 Haiku</option>
                                <option>GPT-4o mini</option>
                                <option>Llama 3 (Groq)</option>
                            </select>
                            <p className="text-[10px] text-gray-500 mt-2">Used for data extraction and simple tasks.</p>
                        </div>
                    </div>
                </div>

                {/* Section: Preferences */}
                <div className="settings-section">
                    <h2 className="text-xl font-medium text-white mb-6">System Preferences</h2>

                    <div className="space-y-4">
                        <div
                            className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                            <div>
                                <h4 className="text-sm font-medium text-white">Require Human Approval (SNS)</h4>
                                <p className="text-xs text-gray-500 mt-0.5">Agents must request approval before posting to
                                    external social networks.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" value="" className="sr-only peer" checked />
                                <div
                                    className="w-11 h-6 bg-dark-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500">
                                </div>
                            </label>
                        </div>

                        <div
                            className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                            <div>
                                <h4 className="text-sm font-medium text-white">Strict Rate Limiting</h4>
                                <p className="text-xs text-gray-500 mt-0.5">Automatically throttle agents if they approach
                                    80% of API rate limits.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" value="" className="sr-only peer" checked />
                                <div
                                    className="w-11 h-6 bg-dark-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500">
                                </div>
                            </label>
                        </div>

                        <div
                            className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                            <div>
                                <h4 className="text-sm font-medium text-white text-rose-400">Hibernate Inactive Agents</h4>
                                <p className="text-xs text-gray-500 mt-0.5">Put agents to sleep if idle for more than 24
                                    hours to save infrastructure costs.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" value="" className="sr-only peer" />
                                <div
                                    className="w-11 h-6 bg-dark-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500">
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="settings-section">
                    <h2 className="text-xl font-medium text-rose-500 mb-6">Danger Zone</h2>
                    <div className="p-6 rounded-xl border border-rose-500/30 bg-rose-500/5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-medium text-white">Delete Workspace</h4>
                                <p className="text-xs text-rose-400/80 mt-1">Permanently delete this workspace, all agents,
                                    and associated vector data. This action cannot be undone.</p>
                            </div>
                            <button
                                className="btn border border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors">Delete
                                Workspace</button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </main>
    </>
  );
}

export default Settings;
