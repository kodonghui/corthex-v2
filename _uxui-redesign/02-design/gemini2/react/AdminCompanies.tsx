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
            background-image:
                linear-gradient(rgba(0, 0, 0, 0.05) 2px, transparent 2px),
                linear-gradient(90deg, rgba(0, 0, 0, 0.05) 2px, transparent 2px);
            background-size: 30px 30px;
        }
`;

function AdminCompanies() {
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
                    className="nav-item active flex items-center gap-3 p-2 font-bold transition-colors text-sm">🌐 Companies
                    (Tenants)</a>
                <a href="/admin/users"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">👤 Global Users</a>
                <a href="/admin/costs"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">💸 Billing &
                    Tokens</a>
            </div>
        </nav>

        <main className="flex-grow flex flex-col h-full bg-transparent overflow-y-auto w-full p-8 relative z-0">
            <div className="max-w-7xl mx-auto w-full space-y-8">

                <div
                    className="flex justify-between items-center bg-white p-6 border-3 border-neo-black shadow-[8px_8px_0px_#1E1E1E]">
                    <div>
                        <h2 className="text-3xl font-black uppercase tracking-tight">Tenant Workspaces</h2>
                        <p className="font-bold text-gray-600 mt-1 text-sm">Manage, suspend, or configure all company
                            accounts registered on the platform.</p>
                    </div>
                    {/* API: POST /api/admin/companies */}
                    <button
                        className="neo-btn bg-neo-blue text-white px-6 py-3 font-black uppercase tracking-wide border-3 border-black text-sm hover:text-black hover:bg-white shadow-[4px_4px_0px_#00E5FF]">Provision
                        Tenant</button>
                </div>

                <div className="neo-card bg-white flex flex-col pt-4">

                    <div
                        className="px-6 pb-4 border-b-3 border-neo-black flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex gap-4">
                            <input type="text" placeholder="Search company name or ID..."
                                className="p-2 border-3 border-neo-black bg-neo-bg font-bold w-80 focus:outline-none focus:bg-white shadow-[2px_2px_0px_#000]" />
                            <select
                                className="p-2 border-3 border-neo-black bg-white font-bold cursor-pointer outline-none shadow-[2px_2px_0px_#000]">
                                <option>All Plans</option>
                                <option>Free Trial</option>
                                <option>Pro</option>
                                <option>Enterprise</option>
                            </select>
                            <select
                                className="p-2 border-3 border-neo-black bg-white font-bold cursor-pointer outline-none shadow-[2px_2px_0px_#000]">
                                <option>Status: Active</option>
                                <option>Status: Suspended</option>
                                <option>Status: Churned</option>
                            </select>
                        </div>
                        <span className="text-sm font-black bg-neo-yellow px-2 py-1 border border-black text-black">Total:
                            42 Active</span>
                    </div>

                    {/* API: GET /api/admin/companies (with pagination) */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-medium">
                            <thead
                                className="bg-gray-100 text-xs uppercase font-black tracking-widest border-b-3 border-neo-black">
                                <tr>
                                    <th className="p-4 border-r-3 border-black">Workspace / Company Name</th>
                                    <th className="p-4 border-r-3 border-black text-center">Plan</th>
                                    <th className="p-4 border-r-3 border-black text-center">Users</th>
                                    <th className="p-4 border-r-3 border-black text-center">Agents</th>
                                    <th className="p-4 border-r-3 border-black text-center">MRR</th>
                                    <th className="p-4 text-center">Manage</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-3 divide-gray-300">

                                {/* Tenant 1 */}
                                <tr className="hover:bg-neo-blue/10 cursor-default transition-colors">
                                    <td className="p-4 border-r-3 border-black flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 bg-neo-black text-white rounded border-2 border-black flex items-center justify-center font-black">
                                            AC</div>
                                        <div>
                                            <div className="font-black text-lg">Acme Corp</div>
                                            <div className="text-[10px] font-mono text-gray-500">ID: ten_9Xq2pL</div>
                                        </div>
                                    </td>
                                    <td className="p-4 border-r-3 border-black text-center">
                                        <span
                                            className="bg-black text-white px-2 py-0.5 border border-black text-xs font-black uppercase">Enterprise</span>
                                    </td>
                                    <td className="p-4 border-r-3 border-black text-center font-bold">120</td>
                                    <td className="p-4 border-r-3 border-black text-center font-bold">15</td>
                                    <td className="p-4 border-r-3 border-black text-center font-mono font-bold">$2,400</td>
                                    <td className="p-4 text-center">
                                        {/* API: GET /api/admin/companies/:id */}
                                        <button
                                            className="bg-white border-2 border-neo-black px-3 py-1.5 text-[10px] font-black uppercase hover:bg-neo-yellow transition-colors shadow-sm">View
                                            Details</button>
                                    </td>
                                </tr>

                                {/* Tenant 2 */}
                                <tr className="hover:bg-neo-blue/10 cursor-default transition-colors">
                                    <td className="p-4 border-r-3 border-black flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center font-black">
                                            GT</div>
                                        <div>
                                            <div className="font-black text-lg">Global Tech</div>
                                            <div className="text-[10px] font-mono text-gray-500">ID: ten_3Bm7zK</div>
                                        </div>
                                    </td>
                                    <td className="p-4 border-r-3 border-black text-center">
                                        <span
                                            className="bg-white text-black px-2 py-0.5 border border-black text-xs font-black uppercase">Pro</span>
                                    </td>
                                    <td className="p-4 border-r-3 border-black text-center font-bold">45</td>
                                    <td className="p-4 border-r-3 border-black text-center font-bold">8</td>
                                    <td className="p-4 border-r-3 border-black text-center font-mono font-bold">$499</td>
                                    <td className="p-4 text-center">
                                        <button
                                            className="bg-white border-2 border-neo-black px-3 py-1.5 text-[10px] font-black uppercase hover:bg-neo-yellow transition-colors shadow-sm">View
                                            Details</button>
                                    </td>
                                </tr>

                                {/* Tenant 3 (Suspended) */}
                                <tr className="bg-gray-50 opacity-80 cursor-default">
                                    <td className="p-4 border-r-3 border-black flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 bg-gray-300 border-2 border-gray-400 flex items-center justify-center font-black text-gray-500">
                                            BS</div>
                                        <div>
                                            <div className="font-black text-lg text-gray-500 flex items-center gap-2">
                                                Beta Startup
                                                <span
                                                    className="bg-neo-pink text-white text-[10px] px-1 border border-black uppercase shadow-sm">Suspended</span>
                                            </div>
                                            <div className="text-[10px] font-mono text-gray-400">ID: ten_1Nc4vX</div>
                                        </div>
                                    </td>
                                    <td className="p-4 border-r-3 border-black text-center">
                                        <span
                                            className="bg-white text-gray-500 border border-gray-400 px-2 py-0.5 text-xs font-black uppercase">Pro</span>
                                    </td>
                                    <td className="p-4 border-r-3 border-black text-center font-bold text-gray-500">12</td>
                                    <td className="p-4 border-r-3 border-black text-center font-bold text-gray-500">3</td>
                                    <td
                                        className="p-4 border-r-3 border-black text-center font-mono font-bold text-gray-500">
                                        $0 <span className="text-[10px]">(Unpaid)</span></td>
                                    <td className="p-4 text-center">
                                        <button
                                            className="bg-white border-2 border-gray-400 text-gray-500 px-3 py-1.5 text-[10px] font-black uppercase hover:bg-gray-200 transition-colors">Manage</button>
                                    </td>
                                </tr>

                            </tbody>
                        </table>
                    </div>

                    <div
                        className="p-4 border-t-3 border-neo-black bg-gray-100 flex justify-between items-center text-sm font-bold">
                        <button
                            className="bg-white border-2 border-neo-black px-4 py-1.5 uppercase disabled:opacity-50">Prev</button>
                        <span>Page 1 of 5</span>
                        <button
                            className="bg-white border-2 border-neo-black px-4 py-1.5 uppercase shadow-[2px_2px_0px_#000] hover:-translate-y-px hover:shadow-[3px_3px_0px_#000]">Next</button>
                    </div>

                </div>

            </div>
        </main>
    </div>
    </>
  );
}

export default AdminCompanies;
