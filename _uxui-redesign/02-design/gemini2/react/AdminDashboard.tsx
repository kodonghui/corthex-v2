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
            background-color: #00E5FF;
            border: 3px solid #1E1E1E;
            box-shadow: 2px 2px 0px 0px rgba(30, 30, 30, 1);
        }

        .nav-item:hover:not(.active) {
            background-color: #E5E5E5;
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
            background-image: radial-gradient(#FF3366 1px, transparent 1px);
            background-size: 20px 20px;
        }
`;

function AdminDashboard() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Top Admin Navbar */}
    <header
        className="h-16 border-b-3 border-neo-black bg-white flex items-center justify-between px-6 z-30 shrink-0 sticky top-0 shadow-[0px_4px_0px_#1E1E1E]">
        <div className="flex items-center gap-4">
            <h1 className="text-2xl font-black tracking-tight uppercase flex items-center gap-2">
                <span className="bg-neo-pink text-white px-2 border-2 border-black rotate-[-2deg] shadow-sm">CORTHEX</span>
                ADMIN
            </h1>
        </div>

        {/* Environment Switcher */}
        <div className="flex items-center bg-neo-bg neo-border p-1">
            <button className="bg-white hover:bg-gray-100 font-bold text-xs uppercase px-3 py-1 neo-border">Staging</button>
            <button className="bg-neo-black text-neo-lime font-black text-xs uppercase px-3 py-1 shadow-sm relative">
                Production <span
                    className="absolute -top-1 -right-1 w-2 h-2 bg-neo-lime border border-black rounded-full animate-pulse"></span>
            </button>
        </div>

        <div className="flex items-center gap-4">
            <button
                className="bg-neo-yellow px-3 py-1 font-bold text-sm uppercase shadow-sm border-2 border-neo-black hover:bg-yellow-300">View
                Live App</button>
            <div
                className="w-10 h-10 bg-neo-lime rounded-full border-3 border-neo-black shadow-sm flex items-center justify-center font-black">
                SW</div>
        </div>
    </header>

    <div className="flex h-[calc(100vh-4rem)]">

        {/* Sidebar Navigation */}
        <nav className="w-64 border-r-3 border-neo-black bg-white flex flex-col h-full z-10 shrink-0 overflow-y-auto">
            <div className="p-4 space-y-1">

                <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mt-2 mb-1 pl-2">Platform
                    Overview</p>
                <a href="/admin/dashboard"
                    className="nav-item active flex items-center gap-3 p-2 font-bold transition-colors text-sm">
                    🏢 Dashboard
                </a>
                <a href="/admin/companies"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">
                    🌐 Companies (Tenants)
                </a>
                <a href="/admin/users"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">
                    👤 Global Users
                </a>
                <a href="/admin/costs"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">
                    💸 Billing & Tokens
                </a>

                <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mt-6 mb-1 pl-2">System Masters
                </p>
                <a href="/admin/agents"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">
                    🤖 Global Agents
                </a>
                <a href="/admin/credentials"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">
                    🔑 Base API Keys
                </a>
                <a href="/admin/tools"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">
                    🔨 Global Tools
                </a>

                <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mt-6 mb-1 pl-2">Templates &
                    Market</p>
                <a href="/admin/agent-marketplace"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">
                    🛒 Agent Market
                </a>
                <a href="/admin/org-templates"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">
                    📑 Org Templates
                </a>
                <a href="/admin/soul-templates"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">
                    👻 Soul (Persona)
                </a>

                <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mt-6 mb-1 pl-2">Infrastructure
                </p>
                <a href="/admin/monitoring"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">
                    📡 Monitoring
                </a>
                <a href="/admin/settings"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">
                    ⚙ Settings
                </a>
            </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow flex flex-col h-full bg-transparent overflow-y-auto w-full p-8 relative z-0">

            <div className="max-w-7xl mx-auto w-full space-y-8">

                <h2
                    className="text-3xl font-black uppercase inline-block bg-white px-3 py-1 shadow-[4px_4px_0px_#1E1E1E] border-3 border-neo-black mb-2 transform -rotate-1">
                    SuperAdmin Overview</h2>

                {/* Top KPIs (Global) */}
                {/* API: GET /api/admin/dashboard/kpi */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                    <div className="neo-card bg-neo-yellow p-5 flex flex-col">
                        <span
                            className="text-xs font-black uppercase tracking-widest border-b-2 border-black pb-1 mb-2">Active
                            Tenants (MRR)</span>
                        <div className="flex items-end gap-2 mt-auto">
                            <span className="text-5xl font-black">42</span>
                            <span className="text-lg font-bold mb-1">/ $12.5k</span>
                        </div>
                    </div>

                    <div className="neo-card bg-white p-5 flex flex-col">
                        <span
                            className="text-xs font-black uppercase tracking-widest border-b-2 border-black pb-1 mb-2 text-gray-600">Total
                            Users</span>
                        <div className="text-5xl font-black mt-auto">1,204</div>
                        <div className="text-xs font-bold mt-2 text-green-600">+145 this week</div>
                    </div>

                    <div className="neo-card bg-neo-black text-white p-5 flex flex-col">
                        <span
                            className="text-xs font-black uppercase tracking-widest border-b-2 border-white pb-1 mb-2 text-neo-lime">Global
                            Tokens (M)</span>
                        <div className="text-5xl font-black mt-auto">2,840</div>
                        <div className="text-xs font-bold mt-2 text-gray-400">Anthropic: 1,840 | OpenAI: 1,000</div>
                    </div>

                    <div className="neo-card bg-neo-pink text-white p-5 flex flex-col">
                        <span
                            className="text-xs font-black uppercase tracking-widest border-b-2 border-white pb-1 mb-2">System
                            Status</span>
                        <div className="text-4xl font-black mt-auto leading-none">OPERATIONAL</div>
                        <div className="text-xs font-bold mt-2 text-white bg-black px-1 w-fit border border-white">Uptime
                            99.98%</div>
                    </div>

                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Col (Wider) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Recent Workspaces / Companies */}
                        <div className="neo-card bg-white flex flex-col">
                            <div
                                className="p-4 border-b-3 border-neo-black bg-neo-blue text-white flex justify-between items-center">
                                <h3 className="font-black text-xl uppercase">Recent Tenants</h3>
                                <a href="/admin/companies" className="text-xs font-bold underline hover:text-black">View
                                    All</a>
                            </div>
                            <div className="p-0">
                                <table className="w-full text-left font-medium">
                                    <thead
                                        className="bg-gray-100 text-xs uppercase font-black tracking-wider border-b-3 border-neo-black">
                                        <tr>
                                            <th className="p-4 border-r-2 border-black">Company Name</th>
                                            <th className="p-4 border-r-2 border-black">Plan</th>
                                            <th className="p-4 border-r-2 border-black text-center">Agents</th>
                                            <th className="p-4 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y-2 divide-gray-300">
                                        <tr className="hover:bg-neo-blue/20 cursor-pointer transition-colors">
                                            <td className="p-4 border-r-2 border-black font-black flex items-center gap-2">
                                                <div
                                                    className="w-6 h-6 bg-neo-yellow border border-black flex items-center justify-center text-[10px]">
                                                    A</div>
                                                Acme Corp
                                            </td>
                                            <td className="p-4 border-r-2 border-black font-bold">Enterprise</td>
                                            <td className="p-4 border-r-2 border-black font-bold text-center">12</td>
                                            <td className="p-4 text-center">
                                                <span
                                                    className="bg-neo-lime px-2 py-0.5 border border-black text-xs font-bold">Active</span>
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-neo-blue/20 cursor-pointer transition-colors">
                                            <td className="p-4 border-r-2 border-black font-black flex items-center gap-2">
                                                <div
                                                    className="w-6 h-6 bg-neo-pink text-white border border-black flex items-center justify-center text-[10px]">
                                                    G</div>
                                                Global Tech
                                            </td>
                                            <td className="p-4 border-r-2 border-black font-bold text-gray-500">Pro</td>
                                            <td className="p-4 border-r-2 border-black font-bold text-center">4</td>
                                            <td className="p-4 text-center">
                                                <span
                                                    className="bg-neo-lime px-2 py-0.5 border border-black text-xs font-bold">Active</span>
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-neo-blue/20 cursor-pointer transition-colors">
                                            <td className="p-4 border-r-2 border-black font-black flex items-center gap-2">
                                                <div
                                                    className="w-6 h-6 bg-gray-300 border border-black flex items-center justify-center text-[10px]">
                                                    B</div>
                                                Beta Startup
                                            </td>
                                            <td className="p-4 border-r-2 border-black font-bold text-gray-500">Free Trial
                                            </td>
                                            <td className="p-4 border-r-2 border-black font-bold text-center">2</td>
                                            <td className="p-4 text-center">
                                                <span
                                                    className="bg-neo-yellow px-2 py-0.5 border border-black text-xs font-bold">Trial
                                                    (3d left)</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>

                    {/* Right Col */}
                    <div className="space-y-8">

                        {/* Quick Actions */}
                        <div className="neo-card bg-white p-6">
                            <h3 className="font-black text-xl uppercase mb-4 border-b-4 border-neo-black pb-2 inline-block">
                                Admin Actions</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {/* API: POST /api/admin/onboarding */}
                                <button
                                    className="bg-white border-2 border-neo-black p-3 hover:bg-neo-yellow hover:shadow-[4px_4px_0px_#000] hover:-translate-y-1 transition-all text-center flex flex-col items-center">
                                    <span className="text-2xl mb-1">🏢</span>
                                    <span className="text-xs font-black uppercase">Create Tenant</span>
                                </button>
                                <button
                                    className="bg-white border-2 border-neo-black p-3 hover:bg-neo-blue hover:text-white hover:shadow-[4px_4px_0px_#000] hover:-translate-y-1 transition-all text-center flex flex-col items-center">
                                    <span className="text-2xl mb-1">🤖</span>
                                    <span className="text-xs font-black uppercase">Global Master Agent</span>
                                </button>
                                <button
                                    className="bg-white border-2 border-neo-black p-3 hover:bg-neo-pink hover:text-white hover:shadow-[4px_4px_0px_#000] hover:-translate-y-1 transition-all text-center flex flex-col items-center">
                                    <span className="text-2xl mb-1">📡</span>
                                    <span className="text-xs font-black uppercase">Broadcast Msg</span>
                                </button>
                                <button
                                    className="bg-white border-2 border-neo-black p-3 hover:bg-gray-200 hover:shadow-[4px_4px_0px_#000] hover:-translate-y-1 transition-all text-center flex flex-col items-center">
                                    <span className="text-2xl mb-1">📜</span>
                                    <span className="text-xs font-black uppercase">Sys Logs</span>
                                </button>
                            </div>
                        </div>

                        {/* System Alerts */}
                        <div className="neo-card bg-white p-6 border-neo-black shadow-[8px_8px_0px_#FF3366]">
                            <h3 className="font-black text-xl uppercase mb-4 border-b-4 border-neo-black pb-2 inline-block">
                                Monitoring Alerts</h3>

                            <div className="space-y-3">
                                <div className="bg-neo-pink/10 border-l-4 border-neo-pink p-3">
                                    <h4 className="font-black text-sm text-neo-pink">High Latency (Anthropic API)</h4>
                                    <p className="text-xs font-bold mt-1">Average response time > 5s for the last 10
                                        minutes. Region: US-East.</p>
                                </div>
                                <div className="bg-neo-yellow/20 border-l-4 border-neo-yellow p-3">
                                    <h4 className="font-black text-sm text-gray-800">Database Spikes</h4>
                                    <p className="text-xs font-bold mt-1 text-gray-600">VectorDB CPU utilization hit 85%
                                        during batch indexing.</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </main>
    </div>
    </>
  );
}

export default AdminDashboard;
