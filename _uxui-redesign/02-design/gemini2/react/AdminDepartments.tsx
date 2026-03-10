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
            background-color: #BFFF00;
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
            background-image: radial-gradient(#FF6600 1px, transparent 1px);
            background-size: 20px 20px;
        }
`;

function AdminDepartments() {
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
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">
                    🏢 Dashboard
                </a>
                <a href="/admin/companies"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">
                    🌐 Companies (Tenants)
                </a>

                <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mt-6 mb-1 pl-2">System Masters
                </p>
                <a href="/admin/agents"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">
                    🤖 Global Agents
                </a>
                <a href="/admin/departments"
                    className="nav-item active flex items-center gap-3 p-2 font-bold transition-colors text-sm">
                    🏛 Global Departments
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
            </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow flex flex-col h-full bg-transparent overflow-y-auto w-full p-8 relative z-0">

            <div className="max-w-5xl mx-auto w-full space-y-8">

                <div
                    className="flex justify-between items-center bg-white p-6 border-3 border-neo-black shadow-[8px_8px_0px_#1E1E1E] rotate-1">
                    <div>
                        <h2 className="text-3xl font-black uppercase">Master Departments</h2>
                        <p className="font-bold text-gray-600 mt-2">Define standard organizational units (e.g., Sales,
                            Engineering) and set their default characteristics, allowed tools, and typical agent roster.
                        </p>
                    </div>
                    {/* API: POST /api/admin/departments */}
                    <button className="neo-btn bg-neo-orange text-white px-6 py-3 font-black uppercase tracking-wide">Add
                        New Category</button>
                </div>

                {/* Departments List */}
                {/* API: GET /api/admin/departments */}
                <div className="space-y-6 mt-8">

                    {/* Dept 1 */}
                    <div className="neo-card bg-white p-6 flex flex-col md:flex-row gap-6 items-center">
                        <div
                            className="w-24 h-24 bg-neo-yellow border-3 border-neo-black rounded flex items-center justify-center text-4xl shadow-[4px_4px_0px_#000] shrink-0 transform -rotate-3">
                            📈
                        </div>
                        <div className="flex-grow">
                            <h3 className="font-black text-2xl uppercase border-b-2 border-black pb-1 mb-2 inline-block">
                                Sales & Marketing</h3>
                            <p className="text-sm font-bold text-gray-700">Focuses on outward communication, lead
                                generation, and CRM management. Primarily utilizes text generation and web search.</p>

                            <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold uppercase">
                                <span className="bg-gray-200 border border-black px-2 py-1">Tools: Search API, HubSpot,
                                    Twitter</span>
                                <span className="bg-gray-200 border border-black px-2 py-1">Default Memory: Shared Campaign
                                    DB</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
                            {/* API: PUT /api/admin/departments/:id */}
                            <button
                                className="bg-white border-2 border-neo-black px-4 py-2 font-black uppercase text-sm hover:bg-neo-yellow hover:shadow-[2px_2px_0px_#000] transition-all">Edit
                                Definition</button>
                            <span className="text-center text-xs font-bold text-gray-500">Used by 42 tenants</span>
                        </div>
                    </div>

                    {/* Dept 2 */}
                    <div className="neo-card bg-white p-6 flex flex-col md:flex-row gap-6 items-center">
                        <div
                            className="w-24 h-24 bg-neo-lime border-3 border-neo-black rounded flex items-center justify-center text-4xl shadow-[4px_4px_0px_#000] shrink-0 transform rotate-2">
                            💰
                        </div>
                        <div className="flex-grow">
                            <h3 className="font-black text-2xl uppercase border-b-2 border-black pb-1 mb-2 inline-block">
                                Finance & Trading</h3>
                            <div
                                className="bg-neo-pink text-white text-[10px] font-bold px-1 uppercase inline-block relative -top-3 ml-2">
                                High Security</div>
                            <p className="text-sm font-bold text-gray-700">Manages assets, executes algorithmic trades, and
                                handles portfolio reporting. Strict compliance requirements.</p>

                            <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold uppercase">
                                <span className="bg-gray-200 border border-black px-2 py-1">Tools: KIS API, Bloomberg
                                    Terminal Data</span>
                                <span
                                    className="bg-neo-pink text-white border border-black px-2 py-1 animate-pulse">Guardrail:
                                    Argos Protection Req.</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
                            <button
                                className="bg-white border-2 border-neo-black px-4 py-2 font-black uppercase text-sm hover:bg-neo-yellow hover:shadow-[2px_2px_0px_#000] transition-all">Edit
                                Definition</button>
                            <span className="text-center text-xs font-bold text-gray-500">Used by 18 tenants</span>
                        </div>
                    </div>

                    {/* Dept 3 */}
                    <div className="neo-card bg-white p-6 flex flex-col md:flex-row gap-6 items-center">
                        <div
                            className="w-24 h-24 bg-gray-100 border-3 border-neo-black rounded flex items-center justify-center text-4xl shadow-[4px_4px_0px_#000] shrink-0 border-dashed">
                            ⚙
                        </div>
                        <div className="flex-grow">
                            <h3
                                className="font-black text-2xl uppercase border-b-2 border-dashed border-gray-400 pb-1 mb-2 inline-block text-gray-600">
                                IT & Operations</h3>
                            <p className="text-sm font-bold text-gray-500">System maintenance, database handling, and
                                internal tool building.</p>

                            <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold uppercase opacity-60">
                                <span
                                    className="bg-gray-100 border border-dashed border-gray-400 px-2 py-1 text-gray-500">Tools:
                                    AWS CLI, Github Actions</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
                            <button
                                className="bg-white border-2 border-neo-black px-4 py-2 font-black uppercase text-sm hover:bg-neo-yellow hover:shadow-[2px_2px_0px_#000] transition-all">Draft
                                Setup</button>
                            <span className="text-center text-xs font-bold text-gray-500">Unpublished</span>
                        </div>
                    </div>

                </div>

            </div>
        </main>
    </div>
    </>
  );
}

export default AdminDepartments;
