"use client";
import React from "react";

const styles = `
body {
            background-color: #f5f3ec;
            color: #2c2c2c;
            -ms-overflow-style: none;
            scrollbar-width: none;
        }

        body::-webkit-scrollbar {
            display: none;
        }

        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }

        .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }

        .panel {
            background-color: white;
            border-radius: 1.5rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
            border: 1px solid #e8e4d9;
        }
`;

function AdminCosts() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Admin Sidebar */}
    <aside className="w-72 flex flex-col justify-between py-8 px-6 border-r border-[#e8e4d9] bg-[#fcfbf9] z-20 shrink-0">
        <div>
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                    <div
                        className="w-8 h-8 rounded-full bg-text-main flex items-center justify-center text-white font-bold text-lg">
                        A</div>
                    <span className="text-xl font-bold tracking-tight text-text-main">Admin Console</span>
                </div>
            </div>

            <nav className="space-y-1.5">
                <a href="/admin/dashboard"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-gauge text-lg"></i> Global Dashboard
                </a>

                <div className="pt-6 pb-2 px-4 text-[11px] font-bold text-base-300 uppercase tracking-wider">환경설정 및 연동</div>
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-shield-key text-lg"></i> API Credentials
                </a>

                <div className="pt-6 pb-2 px-4 text-[11px] font-bold text-base-300 uppercase tracking-wider">비용 및 리소스</div>
                {/* Active menu */}
                <a href="#"
                    className="flex items-center gap-3 px-4 py-3 font-medium text-accent-terracotta bg-white rounded-xl border border-[#e8e4d9] shadow-sm transition-colors">
                    <i className="ph ph-coins text-lg"></i> Global Costs
                </a>
                <a href="/admin/billing-overview"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-receipt text-lg"></i> Tenant Billing
                </a>
            </nav>
        </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 overflow-y-auto px-12 py-10 relative hide-scrollbar">

        <header
            className="flex justify-between items-end mb-8 sticky top-0 bg-[#f5f3ec]/90 backdrop-blur-md z-10 pt-2 pb-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-text-main">Global Infrastructure Costs</h1>
                <p className="text-text-muted mt-2 text-sm">CORTHEX 플랫폼이 사용 중인 LLM API, 서버 인프라, DB 등의 원가(Cost) 발생 현황입니다.</p>
            </div>

            <div className="flex items-center gap-3">
                <select
                    className="bg-white border border-[#e8e4d9] px-4 py-2.5 rounded-xl text-text-main text-sm font-bold shadow-soft outline-none">
                    <option>This Month (Oct 2026)</option>
                    <option>Last Month (Sep 2026)</option>
                    <option>Year to Date</option>
                </select>
                <button
                    className="bg-base-200 text-text-main px-4 py-2.5 rounded-xl text-sm font-bold shadow-soft hover:bg-[#d5cfc1] transition-colors">
                    <i className="ph ph-download-simple"></i>
                </button>
            </div>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="panel p-5 bg-text-main text-white">
                <h3 className="text-xs font-medium text-white/70 uppercase tracking-wider mb-2">Total Est. Cost (MTD)</h3>
                <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold font-mono">$12,450</span>
                    <span className="text-xs font-medium text-accent-terracotta bg-white/10 px-1.5 py-0.5 rounded mb-1">+14%
                        vs Last Mo</span>
                </div>
            </div>
            <div className="panel p-5 bg-white border-l-4 border-l-[#d97757]">
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5"><i
                        className="ph ph-asterisk"></i> Anthropic API</h3>
                <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold font-mono text-text-main">$7,210</span>
                    <span className="text-xs text-text-muted mb-1 font-mono">58% of Total</span>
                </div>
            </div>
            <div className="panel p-5 bg-white border-l-4 border-l-accent-blue">
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5"><i
                        className="ph ph-aperture"></i> OpenAI API</h3>
                <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold font-mono text-text-main">$3,180</span>
                    <span className="text-xs text-text-muted mb-1 font-mono">25% of Total</span>
                </div>
            </div>
            <div className="panel p-5 bg-white border-l-4 border-l-text-main">
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5"><i
                        className="ph ph-cloud-warning"></i> Infrastructure</h3>
                <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold font-mono text-text-main">$2,060</span>
                    <span className="text-xs text-text-muted mb-1 font-mono">17% of Total</span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cost Trend Chart */}
            <div className="panel p-6 lg:col-span-2 flex flex-col h-[400px]">
                <h3 className="text-sm font-bold text-text-main mb-6">Daily Cost Burn Trend</h3>
                <div className="flex-1 relative w-full h-full">
                    <canvas id="costTrendChart"></canvas>
                </div>
            </div>

            {/* Cost Breakdown */}
            <div className="panel p-0 flex flex-col h-[400px]">
                <div className="p-6 border-b border-[#e8e4d9] flex justify-between items-center bg-[#fcfbf9]">
                    <h3 className="text-sm font-bold text-text-main">Cost Breakdown</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-2 hide-scrollbar">

                    <div className="flex items-center justify-between p-4 hover:bg-[#fcfbf9] rounded-xl transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-[#feedeb] text-[#d97757] flex items-center justify-center"><i
                                    className="ph ph-asterisk"></i></div>
                            <div>
                                <h4 className="font-bold text-text-main text-sm">claude-3-opus</h4>
                                <p className="text-[10px] text-text-muted">32.4M tokens</p>
                            </div>
                        </div>
                        <span className="font-mono text-sm font-bold text-text-main">$4,860.00</span>
                    </div>

                    <div className="flex items-center justify-between p-4 hover:bg-[#fcfbf9] rounded-xl transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-[#eef4f9] text-accent-blue flex items-center justify-center">
                                <i className="ph ph-aperture"></i></div>
                            <div>
                                <h4 className="font-bold text-text-main text-sm">gpt-4-turbo</h4>
                                <p className="text-[10px] text-text-muted">68.2M tokens (in/out)</p>
                            </div>
                        </div>
                        <span className="font-mono text-sm font-bold text-text-main">$2,450.50</span>
                    </div>

                    <div className="flex items-center justify-between p-4 hover:bg-[#fcfbf9] rounded-xl transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-[#feedeb] text-[#d97757] flex items-center justify-center"><i
                                    className="ph ph-asterisk"></i></div>
                            <div>
                                <h4 className="font-bold text-text-main text-sm">claude-3-sonnet</h4>
                                <p className="text-[10px] text-text-muted">145.1M tokens</p>
                            </div>
                        </div>
                        <span className="font-mono text-sm font-bold text-text-main">$2,150.00</span>
                    </div>

                    <div className="flex items-center justify-between p-4 hover:bg-[#fcfbf9] rounded-xl transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-base-200 flex items-center justify-center text-text-main"><i
                                    className="ph ph-hard-drives"></i></div>
                            <div>
                                <h4 className="font-bold text-text-main text-sm">AWS EC2 (Workers)</h4>
                                <p className="text-[10px] text-text-muted">14 Instances / 730h</p>
                            </div>
                        </div>
                        <span className="font-mono text-sm font-bold text-text-main">$1,120.00</span>
                    </div>
                </div>
                <div className="p-4 bg-[#fcfbf9] border-t border-[#e8e4d9] flex justify-center">
                    <button className="text-xs font-bold text-accent-blue hover:underline">View Full Invoice List</button>
                </div>
            </div>
        </div>

    </main>
    </>
  );
}

export default AdminCosts;
