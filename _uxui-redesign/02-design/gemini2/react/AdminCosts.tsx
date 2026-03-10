"use client";
import React from "react";

const styles = `
body {
            background-color: #F4F4F0;
            color: #1E1E1E;
        }

        .neo-border {
            border: 3px solid #1E1E1E;
        }

        .neo-shadow {
            box-shadow: 4px 4px 0px 0px rgba(30, 30, 30, 1);
        }

        .neo-shadow-sm {
            box-shadow: 2px 2px 0px 0px rgba(30, 30, 30, 1);
        }

        .neo-card {
            border: 3px solid #1E1E1E;
            box-shadow: 8px 8px 0px 0px rgba(30, 30, 30, 1);
            background-color: white;
        }

        .neo-btn {
            border: 3px solid #1E1E1E;
            box-shadow: 4px 4px 0px 0px rgba(30, 30, 30, 1);
            transition: all 0.1s ease-in-out;
            font-weight: 700;
            cursor: pointer;
        }

        .neo-btn:hover {
            transform: translate(-2px, -2px);
            box-shadow: 6px 6px 0px 0px rgba(30, 30, 30, 1);
        }

        .neo-btn:active {
            transform: translate(4px, 4px);
            box-shadow: 0px 0px 0px 0px rgba(30, 30, 30, 1);
        }

        .nav-item.active {
            background-color: #00CC66;
            color: white;
            border: 3px solid #1E1E1E;
            box-shadow: 2px 2px 0px 0px rgba(30, 30, 30, 1);
        }

        .nav-item:hover:not(.active) {
            background-color: #E5E5E5;
            color: black;
        }

        ::-webkit-scrollbar {
            width: 10px;
            height: 10px;
            border-left: 3px solid #1E1E1E;
            border-top: 3px solid #1E1E1E;
        }

        ::-webkit-scrollbar-track {
            background: #F4F4F0;
        }

        ::-webkit-scrollbar-thumb {
            background: #1E1E1E;
            border: 2px solid #F4F4F0;
        }

        .admin-bg {
            background-image: radial-gradient(#00CC66 1px, transparent 1px);
            background-size: 20px 20px;
            opacity: 0.95;
        }
`;

function AdminCosts() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
<header
        className="h-16 border-b-3 border-neo-black bg-white flex items-center justify-between px-6 z-30 shrink-0 sticky top-0 shadow-[0px_4px_0px_#1E1E1E]">
        <div className="flex items-center gap-4">
            <h1 className="text-2xl font-black tracking-tight uppercase flex items-center gap-2">
                <span className="bg-neo-pink text-white px-2 border-2 border-black rotate-[-2deg] shadow-sm">CORTHEX</span>
                ADMIN
            </h1>
        </div>
        <div className="flex items-center gap-4">
            <div
                className="w-10 h-10 bg-neo-lime rounded-full border-3 border-neo-black shadow-sm flex items-center justify-center font-black">
                SW</div>
        </div>
    </header>

    <div className="flex h-[calc(100vh-4rem)]">

        <nav className="w-64 border-r-3 border-neo-black bg-white flex flex-col h-full z-10 shrink-0 overflow-y-auto">
            <div className="p-4 space-y-1">
                <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mt-2 mb-1 pl-2">Platform
                    Overview</p>
                <a href="/admin/dashboard"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">🏢 Dashboard</a>
                <a href="/admin/companies"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">🌐 Companies
                    (Tenants)</a>
                <a href="/admin/costs"
                    className="nav-item active flex items-center gap-3 p-2 font-bold transition-colors text-sm">💸 Billing &
                    Tokens</a>
            </div>
        </nav>

        <main className="flex-grow flex flex-col h-full bg-transparent overflow-y-auto w-full p-8 relative z-0">
            <div className="max-w-6xl mx-auto w-full space-y-8">

                <div
                    className="flex justify-between items-center bg-white p-6 border-3 border-neo-black shadow-[8px_8px_0px_#1E1E1E]">
                    <div>
                        <h2 className="text-3xl font-black uppercase text-neo-green tracking-tight">Platform Economics</h2>
                        <p className="font-bold text-gray-600 mt-1 text-sm">Monitor overall platform LLM token expenditures,
                            API costs, and tenant MRR.</p>
                    </div>
                    <button
                        className="neo-btn bg-black text-neo-lime px-4 py-2 font-black uppercase tracking-wide border-3 border-black text-sm">Export
                        Financials CSV</button>
                </div>

                {/* Aggregate Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="neo-card p-4 bg-neo-lime flex flex-col justify-between h-32">
                        <div className="text-[10px] font-black uppercase tracking-widest border-b-2 border-black pb-1">Total
                            MRR (Platform)</div>
                        <div className="text-4xl font-black tracking-tighter mt-2">$248.5K</div>
                        <div className="text-xs font-bold text-gray-800 mt-1">↑ 12% vs last month</div>
                    </div>
                    <div className="neo-card p-4 bg-neo-pink text-white flex flex-col justify-between h-32">
                        <div className="text-[10px] font-black uppercase tracking-widest border-b-2 border-white pb-1">Est.
                            LLM Costs (Month)</div>
                        <div className="text-4xl font-black tracking-tighter mt-2">$42.1K</div>
                        <div className="text-xs font-bold text-white mt-1">Anthropic (60%), OpenAI (40%)</div>
                    </div>
                    <div className="neo-card p-4 bg-white flex flex-col justify-between h-32">
                        <div
                            className="text-[10px] font-black uppercase tracking-widest border-b-2 border-black pb-1 text-gray-500">
                            Gross Margin (LLM only)</div>
                        <div className="text-4xl font-black tracking-tighter mt-2 text-neo-blue">83.1%</div>
                        <div className="text-xs font-bold text-gray-600 mt-1">Healthy Zone</div>
                    </div>
                    <div className="neo-card p-4 bg-white flex flex-col justify-between h-32">
                        <div
                            className="text-[10px] font-black uppercase tracking-widest border-b-2 border-black pb-1 text-gray-500">
                            Tokens Processed (24h)</div>
                        <div className="text-4xl font-black tracking-tighter mt-2">1.2B</div>
                        <div className="text-xs font-bold text-gray-600 mt-1">Avg 800M/day</div>
                    </div>
                </div>

                {/* Chart Area */}
                <div className="neo-card bg-white p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-black text-xl uppercase tracking-wider">Costs vs Revenue (Trailing 30 Days)</h3>
                    </div>
                    {/* API: GET /api/admin/costs/aggregate?range=30d */}
                    <div className="w-full h-80 border-3 border-neo-black p-4 bg-gray-50">
                        <canvas id="economicsChart"></canvas>
                    </div>
                </div>

                {/* Tenant Top Spenders */}
                <div className="neo-card bg-white p-0">
                    <div className="p-4 border-b-3 border-neo-black bg-gray-100 flex justify-between items-center">
                        <h3 className="font-black text-lg uppercase">Top Margin Eating Tenants</h3>
                        <span className="text-xs font-bold px-2 py-1 bg-neo-yellow neo-border">High Risk LLM Usage</span>
                    </div>

                    {/* API: GET /api/admin/companies/costs?sort=-total_cost_month limit=5 */}
                    <table className="w-full text-left font-medium border-collapse">
                        <thead
                            className="bg-gray-50 text-xs uppercase font-black tracking-widest border-b-3 border-neo-black">
                            <tr>
                                <th className="p-4 border-r-3 border-black">Tenant Name</th>
                                <th className="p-4 border-r-3 border-black text-right">Plan MRR</th>
                                <th className="p-4 border-r-3 border-black text-right">LLM Cost (MTD)</th>
                                <th className="p-4 text-center">Current Margin</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-3 divide-gray-200">

                            {/* Tenant 1 */}
                            <tr className="hover:bg-neo-blue/10 transition-colors bg-neo-pink/5">
                                <td className="p-4 border-r-3 border-black font-black">Startup Y Combinator</td>
                                <td className="p-4 border-r-3 border-black text-right font-mono">$499.00</td>
                                <td className="p-4 border-r-3 border-black text-right font-mono text-neo-pink font-bold">
                                    $420.50</td>
                                <td className="p-4 text-center">
                                    <span
                                        className="bg-neo-pink text-white px-2 py-0.5 border-2 border-black text-[10px] font-black uppercase">15.7%
                                        (ALERT)</span>
                                </td>
                            </tr>

                            {/* Tenant 2 */}
                            <tr className="hover:bg-neo-blue/10 transition-colors">
                                <td className="p-4 border-r-3 border-black font-black">Global Tech Enterprise</td>
                                <td className="p-4 border-r-3 border-black text-right font-mono">$5,000.00</td>
                                <td className="p-4 border-r-3 border-black text-right font-mono">$1,200.00</td>
                                <td className="p-4 text-center">
                                    <span
                                        className="bg-white text-black px-2 py-0.5 border-2 border-black text-[10px] font-black uppercase">76.0%
                                        (OK)</span>
                                </td>
                            </tr>

                        </tbody>
                    </table>
                </div>

            </div>
        </main>
    </div>
    </>
  );
}

export default AdminCosts;
