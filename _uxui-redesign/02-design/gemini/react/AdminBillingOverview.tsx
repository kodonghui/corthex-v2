"use client";
import React from "react";

const styles = `
body {
            background-color: #fcfbf9;
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
            border: 1px solid #f5f3ec;
        }

        .tab-btn {
            position: relative;
        }

        .tab-btn.active::after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            right: 0;
            height: 2px;
            background-color: #2c2c2c;
        }
`;

function AdminBillingOverview() {
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
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-gauge text-lg"></i> Global Dashboard
                </a>

                <div className="pt-6 pb-2 px-4 text-[11px] font-bold text-base-300 uppercase tracking-wider">고객사 및 결제</div>
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-buildings text-lg"></i> Tenants
                </a>
                {/* Active menu */}
                <a href="#"
                    className="flex items-center gap-3 px-4 py-3 font-medium text-accent-terracotta bg-white rounded-xl border border-[#e8e4d9] shadow-sm transition-colors">
                    <i className="ph ph-credit-card text-lg"></i> Billing & Revenue
                </a>

                <div className="pt-6 pb-2 px-4 text-[11px] font-bold text-base-300 uppercase tracking-wider">시스템 자원 및 운영
                </div>
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-cpu text-lg"></i> Platform Metrics
                </a>

                <div className="pt-6 pb-2 px-4 text-[11px] font-bold text-base-300 uppercase tracking-wider">설정</div>
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-gear text-lg"></i> Settings
                </a>
            </nav>
        </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 overflow-y-auto relative hide-scrollbar">

        <header className="px-12 py-8 bg-[#fcfbf9] border-b border-[#e8e4d9] sticky top-0 z-10">
            <h1 className="text-3xl font-bold tracking-tight text-text-main">Billing & Revenue</h1>
            <p className="text-text-muted mt-2 text-sm">플랫폼 전체의 실시간 매출, 플랜 분포 및 결제 내역을 모니터링합니다. (Stripe 연동)</p>

            {/* Quick Sub-nav */}
            <div className="flex gap-6 mt-8">
                <button className="tab-btn active pb-3 text-sm font-bold text-text-main">Overview</button>
                <button
                    className="tab-btn pb-3 text-sm font-medium text-text-muted hover:text-text-main transition-colors">Plans
                    & Pricing</button>
                <button
                    className="tab-btn pb-3 text-sm font-medium text-text-muted hover:text-text-main transition-colors">Invoices</button>
                <button
                    className="tab-btn pb-3 text-sm font-medium text-text-muted hover:text-text-main transition-colors">Tax
                    & Compliance</button>
            </div>
        </header>

        <div className="px-12 py-10 bg-base-50/30">

            {/* Revenue Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

                <div className="panel p-6 bg-white border-2 border-transparent">
                    <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Monthly Recurring Rev.
                        (MRR)</h3>
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl font-bold text-text-main font-mono">$42,500</span>
                    </div>
                    <span
                        className="text-[11px] font-bold text-accent-green bg-accent-green/10 px-2 py-0.5 rounded flex items-center gap-1 w-max"><i
                            className="ph ph-trend-up"></i> +12.4% vs Last Month</span>
                </div>

                <div className="panel p-6">
                    <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Annual Run Rate (ARR)
                    </h3>
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl font-bold text-text-main font-mono">$510K</span>
                    </div>
                    <span
                        className="text-[11px] font-bold text-accent-green bg-accent-green/10 px-2 py-0.5 rounded flex items-center gap-1 w-max"><i
                            className="ph ph-trend-up"></i> Projecting $600K</span>
                </div>

                <div className="panel p-6">
                    <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Overage Revenue (Tokens)
                    </h3>
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl font-bold text-text-main font-mono">$8,450</span>
                    </div>
                    <span
                        className="text-[11px] font-bold text-accent-blue bg-accent-blue/10 px-2 py-0.5 rounded flex items-center gap-1 w-max"><i
                            className="ph ph-info"></i> APIs Driven Growth</span>
                </div>

                <div className="panel p-6">
                    <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Logo Churn Rate</h3>
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl font-bold text-text-main font-mono">1.2%</span>
                    </div>
                    <span
                        className="text-[11px] font-bold text-accent-coral bg-accent-coral/10 px-2 py-0.5 rounded flex items-center gap-1 w-max"><i
                            className="ph ph-warning-circle"></i> +0.4% from avg</span>
                </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                {/* MRR Growth Area Chart */}
                <div className="lg:col-span-2 panel p-8 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-8 z-10 relative">
                        <div>
                            <h3 className="font-bold text-text-main text-lg mb-1">MRR Growth (YTD)</h3>
                            <p className="text-xs text-text-muted">Subscription vs Usage-based Revenue</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-1.5"><span
                                    className="w-3 h-3 rounded bg-accent-terracotta"></span><span
                                    className="text-xs font-medium text-text-muted">Base Subs</span></div>
                            <div className="flex items-center gap-1.5"><span
                                    className="w-3 h-3 rounded bg-accent-amber"></span><span
                                    className="text-xs font-medium text-text-muted">Overages</span></div>
                        </div>
                    </div>

                    {/* SVG Area Chart */}
                    <div className="h-64 w-full relative">
                        <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                            {/* Background Gradients for Area */}
                            <defs>
                                <linearGradient id="gradBase" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stop-color="#e07a5f" stop-opacity="0.2" />
                                    <stop offset="100%" stop-color="#e07a5f" stop-opacity="0" />
                                </linearGradient>
                                <linearGradient id="gradOverage" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stop-color="#f4a261" stop-opacity="0.3" />
                                    <stop offset="100%" stop-color="#f4a261" stop-opacity="0" />
                                </linearGradient>
                            </defs>

                            {/* Base Subs Area */}
                            <path
                                d="M 0,100 C 20,95 40,80 60,85 S 80,70 100,75 S 120,60 140,65 S 160,50 180,55 S 200,40 220,40 L 220,100 L 0,100 Z"
                                fill="url(#gradBase)"></path>
                            {/* Base Subs Line */}
                            <path
                                d="M 0,100 C 20,95 40,80 60,85 S 80,70 100,75 S 120,60 140,65 S 160,50 180,55 S 200,40 220,40"
                                fill="none" stroke="#e07a5f" strokeWidth="3" vector-effect="non-scaling-stroke"></path>

                            {/* Total (Base+Overage) Area */}
                            <path
                                d="M 0,90 C 20,85 40,70 60,70 S 80,55 100,60 S 120,40 140,45 S 160,25 180,30 S 200,10 220,15 L 220,100 L 0,100 Z"
                                fill="url(#gradOverage)"></path>
                            {/* Total Line */}
                            <path
                                d="M 0,90 C 20,85 40,70 60,70 S 80,55 100,60 S 120,40 140,45 S 160,25 180,30 S 200,10 220,15"
                                fill="none" stroke="#f4a261" strokeWidth="3" vector-effect="non-scaling-stroke"></path>
                        </svg>

                        {/* X Axis Labels */}
                        <div
                            className="absolute left-0 right-0 bottom-[-20px] h-6 flex justify-between items-end text-[10px] text-text-muted font-mono">
                            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
                        </div>
                    </div>
                </div>

                {/* Plan Distribution */}
                <div className="panel p-8">
                    <h3 className="font-bold text-text-main text-lg mb-6">Plan Distribution</h3>

                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm font-bold text-text-main">Enterprise</span>
                                <span className="text-sm font-mono text-text-muted">45%</span>
                            </div>
                            <div className="w-full h-3 bg-base-100 rounded-full overflow-hidden">
                                <div className="h-full bg-text-main rounded-full" style={{width: "45%"}}></div>
                            </div>
                            <p className="text-[10px] text-text-muted mt-1 text-right">64 Tenants</p>
                        </div>

                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm font-bold text-text-main">Business Pro</span>
                                <span className="text-sm font-mono text-text-muted">38%</span>
                            </div>
                            <div className="w-full h-3 bg-base-100 rounded-full overflow-hidden">
                                <div className="h-full bg-accent-blue rounded-full" style={{width: "38%"}}></div>
                            </div>
                            <p className="text-[10px] text-text-muted mt-1 text-right">54 Tenants</p>
                        </div>

                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm font-bold text-text-main">Starter / Trial</span>
                                <span className="text-sm font-mono text-text-muted">17%</span>
                            </div>
                            <div className="w-full h-3 bg-base-100 rounded-full overflow-hidden">
                                <div className="h-full bg-base-300 rounded-full" style={{width: "17%"}}></div>
                            </div>
                            <p className="text-[10px] text-text-muted mt-1 text-right">24 Tenants</p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Recent Invoices Table */}
            <div className="panel overflow-hidden">
                <div className="px-6 py-4 border-b border-[#e8e4d9] flex justify-between items-center bg-white">
                    <h3 className="font-bold text-text-main">Recent High-Value Invoices</h3>
                    <button
                        className="text-xs font-bold text-text-main border border-[#e8e4d9] px-3 py-1.5 rounded hover:bg-base-50 transition-colors">View
                        All in Stripe</button>
                </div>

                <table className="w-full text-left border-collapse">
                    <tbody className="text-sm text-text-main divide-y divide-[#e8e4d9]">

                        <tr className="hover:bg-base-50 transition-colors group">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded-lg bg-[#f0f9f4] text-accent-green flex items-center justify-center font-bold">
                                        <i className="ph ph-check-circle"></i></div>
                                    <div>
                                        <h4 className="font-bold text-text-main mb-0.5">MegaCorp AI Ltd.</h4>
                                        <p className="text-[11px] text-text-muted font-mono">inv_2X9A1B... | Oct 1, 2026</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span
                                    className="px-2 py-1 rounded bg-[#f0f9f4] text-accent-green text-[10px] font-bold uppercase">Paid</span>
                            </td>
                            <td className="px-6 py-4 text-xs text-text-muted text-right">
                                Base: $10,000<br />Usage: $2,500
                            </td>
                            <td className="px-6 py-4 text-right font-mono font-bold text-base">$12,500.00</td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-text-muted hover:text-text-main"><i
                                        className="ph ph-download-simple"></i></button>
                            </td>
                        </tr>

                        <tr className="hover:bg-base-50 transition-colors group">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded-lg bg-accent-amber/10 text-accent-amber flex items-center justify-center font-bold">
                                        <i className="ph ph-clock"></i></div>
                                    <div>
                                        <h4 className="font-bold text-text-main mb-0.5">Global Retails</h4>
                                        <p className="text-[11px] text-text-muted font-mono">inv_4C2D3E... | Due: Oct 5,
                                            2026</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span
                                    className="px-2 py-1 rounded bg-accent-amber/10 text-accent-amber text-[10px] font-bold uppercase">Open</span>
                            </td>
                            <td className="px-6 py-4 text-xs text-text-muted text-right">
                                Base: $7,000<br />Usage: $1,200
                            </td>
                            <td className="px-6 py-4 text-right font-mono font-bold text-base">$8,200.00</td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-text-muted hover:text-text-main"><i
                                        className="ph ph-download-simple"></i></button>
                            </td>
                        </tr>

                    </tbody>
                </table>
            </div>

        </div>

    </main>
    </>
  );
}

export default AdminBillingOverview;
