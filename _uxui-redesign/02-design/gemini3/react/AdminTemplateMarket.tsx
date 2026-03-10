"use client";
import React from "react";
import { Bot, Briefcase, Download, Folders, GitBranchPlus, LayoutDashboard, PenTool, PhoneForwarded, Store, UploadCloud } from "lucide-react";

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
            
            .market-card { @apply p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent hover:border-white/20 hover:from-white/[0.05] transition-all cursor-pointer group flex flex-col h-full; }
        }
`;

function AdminTemplateMarket() {
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
                <a href="/admin/org-templates" className="nav-item"><Folders className="w-4 h-4" /> Org
                    Templates</a>
            </div>

            <div className="space-y-1">
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Marketplaces</p>
                <a href="/admin/template-market" className="nav-item active"><Store className="w-4 h-4" />
                    Blueprint Hub</a>
                <a href="/admin/agent-marketplace" className="nav-item"><Bot className="w-4 h-4" /> Agent
                    Store</a>
            </div>
        </div>
    </aside>

    <main className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">

        <header
            className="h-16 flex items-center justify-between px-8 border-b border-white/[0.05] bg-dark-300/50 backdrop-blur shrink-0">
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-300"><Store
                        className="w-4 h-4 inline mr-2 text-accent-cyan" />Global Blueprint Hub</span>
            </div>
            <div className="flex items-center gap-3">
                <button className="btn btn-primary text-xs py-1.5"><UploadCloud className="w-3 h-3" />
                    Publish Blueprint</button>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2
                            className="text-2xl font-bold text-white mb-2 tracking-tight transition-colors hover:text-accent-cyan">
                            Discover Architectures</h2>
                        <p className="text-sm text-gray-500 font-light max-w-2xl">Publish pre-configured organizational
                            layouts and soul templates for tenant workspaces to install with a single click.</p>
                    </div>
                </div>

                <div className="flex gap-4 mb-8 border-b border-white/5 pb-4">
                    <button className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium">All
                        Blueprints</button>
                    <button
                        className="px-4 py-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors text-sm font-medium">Engineering</button>
                    <button
                        className="px-4 py-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors text-sm font-medium">Sales
                        & Marketing</button>
                    <button
                        className="px-4 py-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors text-sm font-medium">Finance</button>
                    <button
                        className="px-4 py-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors text-sm font-medium">HR
                        & Legal</button>
                </div>

                {/* API: GET /api/admin/template-market */}
                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">

                    {/* Item 1 */}
                    <div className="market-card shadow-glass">
                        <div
                            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                            <GitBranchPlus className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Agile Dev Pod</h3>
                        <p className="text-xs text-gray-400 line-clamp-3 mb-6 flex-1">A fully configured development team
                            including an AI Product Manager, 2 Senior Devs, and an automated QA testing suite.</p>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                                <Download className="w-3 h-3" /> 1.2k Installs
                            </div>
                            <span className="text-xs font-bold text-accent-cyan">Free</span>
                        </div>
                    </div>

                    {/* Item 2 */}
                    <div className="market-card shadow-glass">
                        <div
                            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border border-blue-500/30 flex-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                            <PhoneForwarded className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Outbound SDR Squad</h3>
                        <p className="text-xs text-gray-400 line-clamp-3 mb-6 flex-1">High-volume sales prospecting.
                            Includes an AI researcher to scrape targets and an SDR agent to draft personalized cold
                            outreach.</p>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                                <Download className="w-3 h-3" /> 850 Installs
                            </div>
                            <span className="text-xs font-bold text-accent-cyan">Free</span>
                        </div>
                    </div>

                    {/* Item 3 */}
                    <div className="market-card shadow-glass relative overflow-hidden">
                        <div
                            className="absolute top-4 right-4 bg-accent-purple/20 text-accent-purple px-2 py-0.5 rounded text-[10px] border border-accent-purple/30 font-bold tracking-wider">
                            PREMIUM</div>
                        <div
                            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex-center text-amber-500 mb-6 group-hover:scale-110 transition-transform">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Quant Strategy Dept</h3>
                        <p className="text-xs text-gray-400 line-clamp-3 mb-6 flex-1">Advanced financial modeling unit.
                            Contains pre-configured data fetching capabilities, Python sandboxes, and SEC filing
                            analyzers.</p>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                                <Download className="w-3 h-3" /> 124 Installs
                            </div>
                            <span className="text-xs font-bold text-white">$499 <span
                                    className="text-[10px] font-normal text-gray-500">/mo</span></span>
                        </div>
                    </div>

                    {/* Item 4 */}
                    <div className="market-card shadow-glass">
                        <div
                            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-500/10 border border-rose-500/30 flex-center text-rose-400 mb-6 group-hover:scale-110 transition-transform">
                            <PenTool className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Content Marketing</h3>
                        <p className="text-xs text-gray-400 line-clamp-3 mb-6 flex-1">SEO blog generation and social media
                            syndication. Integrates with WordPress tools and LinkedIn API hooks.</p>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                                <Download className="w-3 h-3" /> 3.4k Installs
                            </div>
                            <span className="text-xs font-bold text-accent-cyan">Free</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </main>
    </>
  );
}

export default AdminTemplateMarket;
