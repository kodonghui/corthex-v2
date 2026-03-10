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

        /* Admin layout is slightly denser/more formal but retains the aesthetic */
        .metric-card {
            background-color: white;
            border-radius: 1.5rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
            border: 1px solid #e8e4d9;
            transition: all 0.2s ease;
        }

        .metric-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
        }
`;

function AdminDashboard() {
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
                {/* Environment Badge */}
                <span
                    className="px-2 py-0.5 bg-accent-coral/10 text-accent-coral text-[10px] font-bold rounded uppercase tracking-wider">Production</span>
            </div>

            <nav className="space-y-1.5">
                {/* Active menu */}
                <a href="#"
                    className="flex items-center gap-3 px-4 py-3 font-medium text-accent-terracotta bg-white rounded-xl border border-[#e8e4d9] shadow-sm transition-colors">
                    <i className="ph ph-gauge text-lg"></i> Global Dashboard
                </a>

                <div className="pt-6 pb-2 px-4 text-[11px] font-bold text-base-300 uppercase tracking-wider">고객사 및 결제</div>
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-buildings text-lg"></i> Tenants (고객사 관리)
                </a>
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-credit-card text-lg"></i> Billing & Revenue
                </a>

                <div className="pt-6 pb-2 px-4 text-[11px] font-bold text-base-300 uppercase tracking-wider">시스템 자원 및 운영
                </div>
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-cpu text-lg"></i> Platform Metrics
                </a>
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-robot text-lg"></i> Global Agents Status
                </a>

                <div className="pt-6 pb-2 px-4 text-[11px] font-bold text-base-300 uppercase tracking-wider">설정</div>
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-gear text-lg"></i> Settings
                </a>
            </nav>
        </div>

        <div>
            <div className="mt-4 px-4 py-3 flex items-center gap-3 border-t border-[#e8e4d9]">
                <img src="https://i.pravatar.cc/100?img=15" alt="Profile"
                    className="w-10 h-10 rounded-full border border-base-300" />
                <div>
                    <p className="text-sm font-semibold text-text-main">Super Admin</p>
                    <p className="text-[10px] text-text-muted uppercase tracking-wider font-mono">ID: sys_root_1</p>
                </div>
            </div>
        </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 overflow-y-auto px-12 py-10 relative hide-scrollbar">

        {/* Header (API: GET /api/admin/dashboard/overview) */}
        <header
            className="flex justify-between items-end mb-10 sticky top-0 bg-[#f5f3ec]/90 backdrop-blur-md z-10 pt-2 pb-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-text-main">Platform Overview</h1>
                <p className="text-text-muted mt-2 text-sm">CORTHEX V2 전체 고객사의 시스템 지표 및 비즈니스 현황입니다.</p>
            </div>

            <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-text-muted">Last updated: <span
                        className="font-mono bg-white px-2 py-1 rounded shadow-sm border border-base-200">2 min
                        ago</span></span>
                <button
                    className="bg-white border border-[#e8e4d9] text-text-main px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-base-50 transition-colors flex items-center gap-2">
                    <i className="ph ph-download-simple"></i> 리포트 생성
                </button>
            </div>
        </header>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

            <div className="metric-card p-6 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                    <div
                        className="w-10 h-10 rounded-xl bg-accent-green/10 text-accent-green flex items-center justify-center text-xl">
                        <i className="ph ph-currency-dollar text-accent-green"></i></div>
                    <span className="text-[11px] font-bold text-accent-green flex items-center gap-1"><i
                            className="ph ph-trend-up"></i> +12.4%</span>
                </div>
                <div>
                    <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Total MRR</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-text-main">$42,500</span>
                    </div>
                </div>
            </div>

            <div className="metric-card p-6 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                    <div
                        className="w-10 h-10 rounded-xl bg-accent-blue/10 text-accent-blue flex items-center justify-center text-xl">
                        <i className="ph ph-buildings text-accent-blue"></i></div>
                    <span className="text-[11px] font-bold text-accent-green flex items-center gap-1"><i
                            className="ph ph-trend-up"></i> +3 New</span>
                </div>
                <div>
                    <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Active Tenants</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-text-main">142</span>
                        <span className="text-sm font-medium text-text-muted">Workspaces</span>
                    </div>
                </div>
            </div>

            <div className="metric-card p-6 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                    <div
                        className="w-10 h-10 rounded-xl bg-accent-terracotta/10 text-accent-terracotta flex items-center justify-center text-xl">
                        <i className="ph ph-robot text-accent-terracotta"></i></div>
                    <span className="text-[11px] font-bold text-text-muted flex items-center gap-1">Concurrent: 420</span>
                </div>
                <div>
                    <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Total Active Agents</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-text-main">3,894</span>
                        <span className="text-sm font-medium text-text-muted">Agents</span>
                    </div>
                </div>
            </div>

            <div
                className="metric-card p-6 flex flex-col justify-between bg-gradient-to-br from-text-main to-[#1a1a1a] border-none text-white shadow-soft-lg">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center text-xl"><i
                            className="ph ph-lightning"></i></div>
                    <span className="text-[11px] font-bold text-accent-coral flex items-center gap-1"><i
                            className="ph ph-warning-circle"></i> Spike Detected</span>
                </div>
                <div>
                    <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-1">Global LLM API Traffic
                        (24h)</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">4.21B</span>
                        <span className="text-sm font-medium text-white/70">Tokens</span>
                    </div>
                </div>
            </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

            {/* Growth Chart (API: GET /api/admin/dashboard/growth) */}
            <div className="lg:col-span-2 metric-card p-8">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="font-bold text-text-main text-lg">Tenant Growth & Revenue</h3>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-text-main"></span><span
                                className="text-xs font-medium text-text-muted">MRR</span></div>
                        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#e8e4d9]"></span><span
                                className="text-xs font-medium text-text-muted">New Tenants</span></div>
                    </div>
                </div>

                {/* Mock Bar Chart using CSS */}
                <div className="h-64 flex items-end gap-2 pt-4">
                    {/* Week/Month 1 */}
                    <div className="flex-1 flex flex-col justify-end items-center group relative h-full">
                        <div className="w-full flex justify-center items-end gap-1 px-1 relative h-full">
                            {/* MRR Bar */}
                            <div className="w-full max-w-12 bg-text-main rounded-t-md opacity-80 group-hover:opacity-100 transition-opacity"
                                style={{height: "40%"}}></div>
                            {/* Tenants Bar */}
                            <div className="w-full max-w-12 bg-[#e8e4d9] rounded-t-md opacity-80 group-hover:opacity-100 transition-opacity"
                                style={{height: "20%"}}></div>
                        </div>
                        <span className="text-[10px] font-mono text-text-muted mt-2">W1</span>
                    </div>
                    {/* Week/Month 2 */}
                    <div className="flex-1 flex flex-col justify-end items-center group relative h-full">
                        <div className="w-full flex justify-center items-end gap-1 px-1 relative h-full">
                            <div className="w-full max-w-12 bg-text-main rounded-t-md opacity-80 group-hover:opacity-100 transition-opacity"
                                style={{height: "45%"}}></div>
                            <div className="w-full max-w-12 bg-[#e8e4d9] rounded-t-md opacity-80 group-hover:opacity-100 transition-opacity"
                                style={{height: "25%"}}></div>
                        </div>
                        <span className="text-[10px] font-mono text-text-muted mt-2">W2</span>
                    </div>
                    {/* Week/Month 3 */}
                    <div className="flex-1 flex flex-col justify-end items-center group relative h-full">
                        <div className="w-full flex justify-center items-end gap-1 px-1 relative h-full">
                            <div className="w-full max-w-12 bg-text-main rounded-t-md opacity-80 group-hover:opacity-100 transition-opacity"
                                style={{height: "60%"}}></div>
                            <div className="w-full max-w-12 bg-[#e8e4d9] rounded-t-md opacity-80 group-hover:opacity-100 transition-opacity"
                                style={{height: "35%"}}></div>
                        </div>
                        <span className="text-[10px] font-mono text-text-muted mt-2">W3</span>
                    </div>
                    {/* Week/Month 4 */}
                    <div className="flex-1 flex flex-col justify-end items-center group relative h-full">
                        <div className="w-full flex justify-center items-end gap-1 px-1 relative h-full">
                            <div className="w-full max-w-12 bg-text-main rounded-t-md opacity-80 group-hover:opacity-100 transition-opacity"
                                style={{height: "55%"}}></div>
                            <div className="w-full max-w-12 bg-[#e8e4d9] rounded-t-md opacity-80 group-hover:opacity-100 transition-opacity"
                                style={{height: "30%"}}></div>
                        </div>
                        <span className="text-[10px] font-mono text-text-muted mt-2">W4</span>
                    </div>
                    {/* Week/Month 5 */}
                    <div className="flex-1 flex flex-col justify-end items-center group relative h-full">
                        <div className="w-full flex justify-center items-end gap-1 px-1 relative h-full">
                            <div className="w-full max-w-12 bg-text-main rounded-t-md opacity-80 group-hover:opacity-100 transition-opacity"
                                style={{height: "75%"}}></div>
                            <div className="w-full max-w-12 bg-[#e8e4d9] rounded-t-md opacity-80 group-hover:opacity-100 transition-opacity"
                                style={{height: "50%"}}></div>
                        </div>
                        <span className="text-[10px] font-mono text-text-muted mt-2">W5</span>
                    </div>
                    {/* Week/Month 6 (Current) */}
                    <div className="flex-1 flex flex-col justify-end items-center group relative h-full">
                        <div className="w-full flex justify-center items-end gap-1 px-1 relative h-full">
                            <div className="w-full max-w-12 bg-accent-terracotta rounded-t-md opacity-100 transition-opacity relative"
                                style={{height: "90%"}}>
                                <div
                                    className="absolute -top-8 left-1/2 -translate-x-1/2 bg-text-main text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm whitespace-nowrap">
                                    $42.5k</div>
                            </div>
                            <div className="w-full max-w-12 bg-[#e8e4d9] rounded-t-md opacity-100 transition-opacity relative"
                                style={{height: "60%"}}></div>
                        </div>
                        <span className="text-[10px] font-mono text-text-main font-bold mt-2">Current</span>
                    </div>
                </div>
            </div>

            {/* Top Resource Consumers List */}
            <div className="metric-card p-8 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-text-main text-lg">Platform Load Headers</h3>
                </div>

                <div className="flex-1 space-y-4">
                    <h4
                        className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 border-b border-[#e8e4d9] pb-2">
                        Top Tenants by LLM Usage</h4>

                    <div className="flex items-center justify-between">
                        <div className="flex mx-0 items-center gap-3">
                            <div
                                className="w-6 h-6 rounded bg-text-main text-white flex items-center justify-center text-[10px] font-bold">
                                1</div>
                            <span className="text-sm font-bold text-text-main">MegaCorp AI Ltd.</span>
                        </div>
                        <span className="text-sm font-mono text-text-muted">1.2B (28%)</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex mx-0 items-center gap-3">
                            <div
                                className="w-6 h-6 rounded bg-[#d5cfc1] text-text-main flex items-center justify-center text-[10px] font-bold">
                                2</div>
                            <span className="text-sm font-medium text-text-main">TechStart Inc.</span>
                        </div>
                        <span className="text-sm font-mono text-text-muted">840M (19%)</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex mx-0 items-center gap-3">
                            <div
                                className="w-6 h-6 rounded bg-[#f5f3ec] text-text-main flex items-center justify-center text-[10px] font-bold border border-[#e8e4d9]">
                                3</div>
                            <span className="text-sm font-medium text-text-main">Global Retails</span>
                        </div>
                        <span className="text-sm font-mono text-text-muted">420M (9%)</span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#e8e4d9]">
                        <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">System Health Alerts
                        </h4>
                        <div className="bg-accent-coral/10 border border-accent-coral/20 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                                <i className="ph ph-warning-octagon text-accent-coral mt-0.5"></i>
                                <div>
                                    <p className="text-xs font-bold text-accent-coral mb-0.5">Main DB CPU Spikes</p>
                                    <p className="text-[10px] text-text-main font-medium">Postgres Primary node DB_A hit 95%
                                        CPU for 3 mins. Scaling recommended.</p>
                                </div>
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

export default AdminDashboard;
