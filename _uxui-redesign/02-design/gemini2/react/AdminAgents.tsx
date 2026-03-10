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
            background-image: radial-gradient(#BFFF00 1px, transparent 1px);
            background-size: 20px 20px;
        }
`;

function AdminAgents() {
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
                    className="nav-item active flex items-center gap-3 p-2 font-bold transition-colors text-sm">
                    🤖 Global Agents
                </a>
                <a href="/admin/departments"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">
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
                <a href="/admin/soul-templates"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">
                    👻 Soul (Persona)
                </a>

                <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mt-6 mb-1 pl-2">Infrastructure
                </p>
                <a href="/admin/settings"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">
                    ⚙ Settings
                </a>
            </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow flex flex-col h-full bg-transparent overflow-y-auto w-full p-8 relative z-0">

            <div className="max-w-7xl mx-auto w-full space-y-8">

                <div
                    className="flex justify-between items-center bg-white p-4 border-3 border-neo-black shadow-[4px_4px_0px_#1E1E1E]">
                    <div>
                        <h2 className="text-2xl font-black uppercase">Master Agent Catalog</h2>
                        <p className="text-sm font-bold text-gray-600 mt-1">Manage base Agent templates that tenants can
                            deploy in their workspaces.</p>
                    </div>
                    {/* API: POST /api/admin/agents */}
                    <button className="neo-btn bg-neo-lime px-4 py-2 font-black uppercase tracking-wide">Create Master
                        Agent</button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 items-center">
                    <input type="text" placeholder="Search Master Agents..."
                        className="p-2 border-3 border-neo-black bg-white font-bold w-64 focus:outline-none focus:ring-2 focus:ring-neo-lime shadow-[2px_2px_0px_#000]" />
                    <select
                        className="p-2 border-3 border-neo-black bg-white font-bold cursor-pointer outline-none shadow-[2px_2px_0px_#000]">
                        <option>All Departments</option>
                        <option>Executive</option>
                        <option>Marketing</option>
                        <option>Engineering</option>
                    </select>
                </div>

                {/* Master Agents Grid */}
                {/* API: GET /api/admin/agents */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Agent Card 1 */}
                    <div className="neo-card bg-white flex flex-col hover:-translate-y-1 transition-transform group">
                        <div className="p-4 border-b-3 border-neo-black flex justify-between items-start bg-neo-blue">
                            <div
                                className="w-12 h-12 bg-white rounded-full border-3 border-neo-black flex items-center justify-center font-black text-xl shadow-[2px_2px_0px_#000]">
                                C</div>
                            <span
                                className="bg-black text-white px-2 py-0.5 border border-white text-xs font-bold shadow-sm">Executive</span>
                        </div>
                        <div className="p-5 flex-grow flex flex-col">
                            <h3 className="font-black text-xl uppercase mb-1">Chief of Staff</h3>
                            <p className="text-xs font-bold text-gray-500 mb-4 line-clamp-2">The central dispatcher. Reads
                                emails/slack, delegates to other agents, and compiles daily briefs.</p>

                            <div className="space-y-2 mt-auto">
                                <div
                                    className="bg-gray-100 p-2 neo-border flex justify-between items-center text-xs font-bold">
                                    <span className="text-gray-600">Base Model:</span>
                                    <span>Claude 3.5 Sonnet</span>
                                </div>
                                <div
                                    className="bg-gray-100 p-2 neo-border flex justify-between items-center text-xs font-bold">
                                    <span className="text-gray-600">Active Instances:</span>
                                    <span>24 deployments</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex border-t-3 border-neo-black">
                            {/* API: PUT /api/admin/agents/:id */}
                            <button
                                className="flex-1 bg-white py-3 font-bold uppercase text-sm border-r-3 border-neo-black hover:bg-neo-yellow transition-colors">Edit
                                Template</button>
                        </div>
                    </div>

                    {/* Agent Card 2 */}
                    <div className="neo-card bg-white flex flex-col hover:-translate-y-1 transition-transform group">
                        <div className="p-4 border-b-3 border-neo-black flex justify-between items-start bg-neo-pink">
                            <div
                                className="w-12 h-12 bg-white rounded-full border-3 border-neo-black flex items-center justify-center font-black text-xl shadow-[2px_2px_0px_#000]">
                                M</div>
                            <span
                                className="bg-black text-white px-2 py-0.5 border border-white text-xs font-bold shadow-sm">Marketing</span>
                        </div>
                        <div className="p-5 flex-grow flex flex-col">
                            <h3 className="font-black text-xl uppercase mb-1">CMO Agent</h3>
                            <p className="text-xs font-bold text-gray-500 mb-4 line-clamp-2">Analyzes market trends,
                                generates content strategies, and oversees Social Poster sub-agents.</p>

                            <div className="space-y-2 mt-auto">
                                <div
                                    className="bg-gray-100 p-2 neo-border flex justify-between items-center text-xs font-bold">
                                    <span className="text-gray-600">Base Model:</span>
                                    <span>Claude 3 Opus</span>
                                </div>
                                <div
                                    className="bg-gray-100 p-2 neo-border flex justify-between items-center text-xs font-bold">
                                    <span className="text-gray-600">Active Instances:</span>
                                    <span>38 deployments</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex border-t-3 border-neo-black">
                            <button
                                className="flex-1 bg-white py-3 font-bold uppercase text-sm border-r-3 border-neo-black hover:bg-neo-yellow transition-colors">Edit
                                Template</button>
                        </div>
                    </div>

                    {/* Agent Card 3 */}
                    <div className="neo-card bg-gray-50 flex flex-col hover:-translate-y-1 transition-transform opacity-75">
                        <div className="p-4 border-b-3 border-neo-black flex justify-between items-start bg-gray-300">
                            <div
                                className="w-12 h-12 bg-white rounded-full border-3 border-neo-black flex items-center justify-center font-black text-xl shadow-[2px_2px_0px_#000]">
                                D</div>
                            <span
                                className="bg-black text-white px-2 py-0.5 border border-white text-xs font-bold shadow-sm">Engineering</span>
                        </div>
                        <div className="p-5 flex-grow flex flex-col">
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="font-black text-xl uppercase">DevOps Monitor</h3>
                                <span className="text-[10px] bg-white border border-black px-1 font-bold">DRAFT</span>
                            </div>
                            <p className="text-xs font-bold text-gray-500 mb-4 line-clamp-2">Monitors AWS metrics,
                                auto-scales resources, and pages humans on critical downtime.</p>

                            <div className="space-y-2 mt-auto">
                                <div
                                    className="bg-gray-200 p-2 border-2 border-dashed border-gray-400 flex justify-between items-center text-xs font-bold">
                                    <span className="text-gray-500">Base Model:</span>
                                    <span className="text-gray-500">Claude 3.5 Sonnet</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex border-t-3 border-neo-black">
                            <button
                                className="flex-1 bg-white py-3 font-bold uppercase text-sm hover:bg-neo-yellow transition-colors">Continue
                                Editing</button>
                        </div>
                    </div>

                </div>

            </div>
        </main>
    </div>
    </>
  );
}

export default AdminAgents;
