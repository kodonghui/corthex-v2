"use client";
import React from "react";
import { Activity, BarChart3, Building2, Check, Inbox, KeySquare, LayoutDashboard, Loader } from "lucide-react";

const styles = `
@layer components {
            body { @apply bg-dark-900 text-gray-200 font-sans antialiased font-light min-h-screen overflow-hidden flex selection:bg-accent-cyan/30 selection:text-white; }
            .bg-ambient { @apply fixed inset-0 z-[-1] pointer-events-none; }
            .bg-ambient::before { content: ''; @apply absolute top-[-30%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-blue-600/10 blur-[150px]; }
            .bg-ambient::after { content: ''; @apply absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent-cyan/5 blur-[120px]; }
            
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

function AdminOnboarding() {
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
                <a href="/admin/monitoring" className="nav-item"><Activity className="w-4 h-4" /> System
                    Monitoring</a>
                <a href="/admin/companies" className="nav-item"><Building2 className="w-4 h-4" /> Tenancy
                    / Companies</a>
                <a href="/admin/onboarding" className="nav-item active"><Inbox className="w-4 h-4" />
                    Provisioning Queue</a>
            </div>
        </div>
    </aside>

    <main className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">

        <header
            className="h-16 flex items-center justify-between px-8 border-b border-white/[0.05] bg-dark-300/50 backdrop-blur shrink-0">
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-300"><Inbox
                        className="w-4 h-4 inline mr-2 text-accent-cyan" />Tenant Onboarding Queue</span>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 font-mono">2 Pending Requests</span>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">

            {/* Queue List (API: GET /api/admin/onboarding) */}
            <div className="max-w-4xl mx-auto space-y-6">

                <h2 className="text-xl font-medium text-white mb-6">Workspace Provisioning Requests</h2>

                {/* Request 1 */}
                <div className="glass-panel p-6 border-l-4 border-l-amber-500 hover:border-white/10 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-bold text-white">Acme Corp</h3>
                                <span
                                    className="bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded text-[10px] border border-amber-500/20 font-bold tracking-wider">AWAITING
                                    APPROVAL</span>
                            </div>
                            <p className="text-xs text-gray-500 font-mono">Requested: Oct 15, 2025 • Plan: Enterprise Custom
                            </p>
                        </div>
                        <img src="https://ui-avatars.com/api/?name=A+C&background=f59e0b&color=fff&rounded=true"
                            className="w-10 h-10 border border-white/10 rounded-lg" />
                    </div>

                    <div className="bg-dark-300/50 rounded-lg p-4 border border-white/5 space-y-2 mb-6 text-sm">
                        <div className="flex gap-4">
                            <span className="text-gray-500 w-24">Admin Email:</span>
                            <span className="text-white font-mono">ceo@acme.corp</span>
                        </div>
                        <div className="flex gap-4">
                            <span className="text-gray-500 w-24">Initial Seats:</span>
                            <span className="text-white font-mono">150 Users</span>
                        </div>
                        <div className="flex gap-4">
                            <span className="text-gray-500 w-24">Note:</span>
                            <span className="text-gray-300 italic">"We need HIPAA compliant DB isolation."</span>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                        <button className="btn btn-secondary text-xs">Reject Request</button>
                        <button className="btn btn-primary text-xs"><Check className="w-3 h-3" /> Approve &
                            Provision</button>
                    </div>
                </div>

                {/* Request 2 */}
                <div className="glass-panel p-6 border-l-4 border-l-blue-500 opacity-80">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-bold text-gray-300">Stark Industries</h3>
                                <span
                                    className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-[10px] border border-blue-500/20 font-bold tracking-wider">PROVISIONING...</span>
                            </div>
                            <p className="text-[10px] text-gray-500 font-mono">Requested: Oct 14, 2025 • Plan: Enterprise
                                Standard</p>
                        </div>
                    </div>

                    <div className="space-y-4 mb-4">
                        <div>
                            <div className="flex justify-between text-[10px] text-gray-500 mb-1 font-mono uppercase">
                                <span>DB Schema Initialization</span>
                                <span>65%</span>
                            </div>
                            <div className="w-full h-1.5 bg-dark-200 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500" style={{width: "65%"}}></div>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 flex items-center gap-2"><Loader
                            className="w-3 h-3 animate-spin" /> Spawning Default Agent Pods...</p>
                </div>

                {/* History Log */}
                <div className="mt-12">
                    <h3 className="text-sm font-medium text-gray-400 mb-4 px-2 uppercase tracking-wider">Recent Onboardings
                    </h3>
                    <div className="glass-panel overflow-hidden">
                        <div className="p-4 border-b border-white/5 flex gap-4 text-xs hover:bg-white/[0.02]">
                            <span className="text-gray-500 font-mono w-24">Oct 10, 2025</span>
                            <span className="text-emerald-400 font-bold w-16">SUCCESS</span>
                            <span className="text-gray-300">Provisioned workspace <span
                                    className="text-white font-medium">Globex Corp</span> (tn_globex_99)</span>
                        </div>
                        <div className="p-4 border-b border-white/5 flex gap-4 text-xs hover:bg-white/[0.02]">
                            <span className="text-gray-500 font-mono w-24">Oct 05, 2025</span>
                            <span className="text-rose-400 font-bold w-16">REJECTED</span>
                            <span className="text-gray-300">Request from <span className="text-white font-medium">Spam
                                    LLC</span> denied by System Admin.</span>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    </main>
    </>
  );
}

export default AdminOnboarding;
