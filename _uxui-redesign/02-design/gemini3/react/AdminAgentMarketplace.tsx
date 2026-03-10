"use client";
import React from "react";
import { Bot, ChevronRight, LayoutDashboard, Search, ShoppingCart, Star, Store } from "lucide-react";

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
            
            .text-gradient { @apply bg-gradient-accent bg-clip-text text-transparent; }
            
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            
            .agent-card { @apply p-6 rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent hover:border-white/20 transition-all cursor-pointer group flex flex-col; }
        }
`;

function AdminAgentMarketplace() {
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
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Marketplaces</p>
                <a href="/admin/template-market" className="nav-item"><Store className="w-4 h-4" />
                    Blueprint Hub</a>
                <a href="/admin/agent-marketplace" className="nav-item active"><Bot className="w-4 h-4" />
                    Agent Store</a>
            </div>
        </div>
    </aside>

    <main className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">

        <header
            className="h-16 flex items-center justify-between px-8 border-b border-white/[0.05] bg-dark-300/50 backdrop-blur shrink-0">
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-300"><Bot
                        className="w-4 h-4 inline mr-2 text-accent-purple" />Agent Marketplace</span>
            </div>
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Search className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="text" placeholder="Search agents..."
                        className="bg-dark-900 border border-white/10 rounded px-8 py-1.5 text-xs text-white focus:outline-none w-64" />
                </div>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Hero Section */}
                <div
                    className="glass-panel p-10 relative overflow-hidden bg-gradient-to-r from-accent-purple/10 to-transparent border-accent-purple/20">
                    <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-black/50 to-transparent z-0">
                    </div>
                    <div className="relative z-10 max-w-xl">
                        <span
                            className="bg-accent-purple/20 text-accent-purple px-2 py-1 rounded text-xs font-bold tracking-wider mb-4 inline-block border border-accent-purple/30">FEATURED
                            PARTNER AI</span>
                        <h2 className="text-3xl font-bold text-white mb-4">Ernst & Young Tax Oracle</h2>
                        <p className="text-gray-400 mb-6 leading-relaxed">A specialized AI expert pre-trained on the US tax
                            code by EY domain experts. Automates corporate tax filings and deductions analysis in
                            real-time.</p>
                        <div className="flex gap-4 items-center">
                            <button className="btn btn-primary px-6"><ShoppingCart
                                    className="w-4 h-4 mr-2" /> Subscribe ($2k/mo)</button>
                            <span className="text-xs text-gray-500 font-mono">Requires Enterprise Tier</span>
                        </div>
                    </div>
                </div>

                {/* API: GET /api/admin/agent-marketplace */}
                <div>
                    <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">Top Rated Agents <ChevronRight className="w-4 h-4 text-gray-500" /></h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

                        {/* Agent 1 */}
                        <div className="agent-card shadow-glass">
                            <div className="flex justify-between items-start mb-4">
                                <img src="https://ui-avatars.com/api/?name=L+M&background=0D8ABC&color=fff&rounded=true"
                                    alt="Agent Icon"
                                    className="w-12 h-12 rounded-full border-2 border-white/10 group-hover:border-accent-cyan transition-colors" />
                                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                                    <Star className="w-3 h-3 fill-amber-400" /> 4.9
                                </div>
                            </div>
                            <h4 className="text-base font-medium text-white mb-1">LexisNexis Paralegal</h4>
                            <span className="text-[10px] text-gray-500 font-mono mb-4 block">by LegalTech Corp</span>
                            <p className="text-xs text-gray-400 line-clamp-3 mb-6">Automated paralegal trained on case law
                                datasets. Drafts standard motions and summarizes legal precedents.</p>

                            <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                                <span className="text-sm font-bold text-white">$150<span
                                        className="text-[10px] text-gray-500 font-normal">/mo</span></span>
                                <button
                                    className="text-xs font-medium text-accent-cyan hover:text-white transition-colors">View
                                    Details</button>
                            </div>
                        </div>

                        {/* Agent 2 */}
                        <div className="agent-card shadow-glass">
                            <div className="flex justify-between items-start mb-4">
                                <img src="https://ui-avatars.com/api/?name=S+D&background=a855f7&color=fff&rounded=true"
                                    alt="Agent Icon"
                                    className="w-12 h-12 rounded-full border-2 border-white/10 group-hover:border-accent-purple transition-colors" />
                                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                                    <Star className="w-3 h-3 fill-amber-400" /> 4.7
                                </div>
                            </div>
                            <h4 className="text-base font-medium text-white mb-1">Salesforce CRM Integrator</h4>
                            <span className="text-[10px] text-gray-500 font-mono mb-4 block">Official Tooling</span>
                            <p className="text-xs text-gray-400 line-clamp-3 mb-6">Background daemon agent that
                                cross-references chat data to automatically keep Salesforce records pristine.</p>

                            <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                                <span className="text-sm font-bold text-accent-cyan">Free Add-on</span>
                                <button
                                    className="text-xs font-medium text-accent-cyan hover:text-white transition-colors">Install</button>
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

export default AdminAgentMarketplace;
