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
            background-color: #FFE800;
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
            background-image: radial-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px);
            background-size: 20px 20px;
        }
`;

function AdminWorkflows() {
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
            <button
                className="bg-neo-yellow px-3 py-1 font-bold text-sm uppercase shadow-sm border-2 border-neo-black hover:bg-yellow-300">View
                Live App</button>
            <div
                className="w-10 h-10 bg-neo-lime rounded-full border-3 border-neo-black shadow-sm flex items-center justify-center font-black">
                SW</div>
        </div>
    </header>

    <div className="flex h-[calc(100vh-4rem)]">

        <nav className="w-64 border-r-3 border-neo-black bg-white flex flex-col h-full z-10 shrink-0 overflow-y-auto">
            <div className="p-4 space-y-1">
                <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mt-2 mb-1 pl-2">System Masters
                </p>
                <a href="/admin/agents"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">🤖 Global
                    Agents</a>
                <a href="/admin/departments"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">🏛 Global
                    Departments</a>
                <a href="/admin/workflows"
                    className="nav-item active flex items-center gap-3 p-2 font-bold transition-colors text-sm">🔄 Master
                    Workflows</a>
            </div>
        </nav>

        <main className="flex-grow flex flex-col h-full bg-transparent overflow-y-auto w-full p-8 relative z-0">
            <div className="max-w-6xl mx-auto w-full space-y-8">

                <div
                    className="flex justify-between items-center bg-white p-6 border-3 border-neo-black shadow-[8px_8px_0px_#1E1E1E]">
                    <div>
                        <h2 className="text-3xl font-black uppercase tracking-wide text-neo-orange">Master Workflow
                            Templates</h2>
                        <p className="font-bold text-gray-600 mt-1 text-sm">Define base workflow DAGs (Directed Acyclic
                            Graphs) that tenants can copy and modify.</p>
                    </div>
                    {/* API: POST /api/admin/workflows */}
                    <button
                        className="neo-btn bg-neo-black text-white px-4 py-2 font-black uppercase text-sm tracking-wide shadow-[4px_4px_0px_#000] border-3 border-black">+
                        New Master Flow</button>
                </div>

                <div className="neo-card bg-white flex flex-col pt-4">

                    <div className="px-6 pb-4 border-b-3 border-neo-black flex flex-wrap gap-4 items-center">
                        <input type="text" placeholder="Search templates..."
                            className="p-2 border-3 border-neo-black bg-neo-bg font-bold w-64 focus:outline-none focus:bg-white shadow-[2px_2px_0px_#000]" />
                        <select
                            className="p-2 border-3 border-neo-black bg-white font-bold cursor-pointer outline-none shadow-[2px_2px_0px_#000]">
                            <option>All Categories</option>
                            <option>Content Creation</option>
                            <option>Data Processing</option>
                            <option>Customer Support</option>
                        </select>
                    </div>

                    {/* API: GET /api/admin/workflows */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-medium">
                            <thead
                                className="bg-gray-100 text-xs uppercase font-black tracking-widest border-b-3 border-neo-black">
                                <tr>
                                    <th className="p-4 border-r-2 border-black">Master Workflow Name</th>
                                    <th className="p-4 border-r-2 border-black">Description</th>
                                    <th className="p-4 border-r-2 border-black text-center">Nodes</th>
                                    <th className="p-4 border-r-2 border-black text-center">Used By</th>
                                    <th className="p-4 text-center">Manage</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-gray-300">

                                <tr className="hover:bg-neo-blue/10 cursor-default transition-colors">
                                    <td
                                        className="p-4 border-r-2 border-black font-black uppercase flex items-center gap-2">
                                        <div className="w-2 h-2 bg-neo-lime rounded-full border border-black"></div>
                                        Standard Blog Generation
                                    </td>
                                    <td
                                        className="p-4 border-r-2 border-black text-xs font-bold text-gray-600 truncate max-w-xs">
                                        Drafting -> SEO Optimization -> Human Review -> Publish
                                    </td>
                                    <td className="p-4 border-r-2 border-black text-center font-bold">4</td>
                                    <td className="p-4 border-r-2 border-black text-center font-black">45 Tenants</td>
                                    <td className="p-4 text-center">
                                        {/* API: PUT /api/admin/workflows/:id */}
                                        <button
                                            className="bg-white border-2 border-neo-black px-3 py-1 text-[10px] font-black uppercase hover:bg-neo-yellow transition-colors tracking-wider">Edit
                                            Node Graph</button>
                                    </td>
                                </tr>

                                <tr className="hover:bg-neo-blue/10 cursor-default transition-colors">
                                    <td
                                        className="p-4 border-r-2 border-black font-black uppercase flex items-center gap-2">
                                        <div className="w-2 h-2 bg-neo-pink rounded-full border border-black"></div>
                                        Customer Ticket Escalation
                                    </td>
                                    <td
                                        className="p-4 border-r-2 border-black text-xs font-bold text-gray-600 truncate max-w-xs">
                                        Triage (Agent) -> Resolve / Escalate -> Human Intercept
                                    </td>
                                    <td className="p-4 border-r-2 border-black text-center font-bold">3</td>
                                    <td className="p-4 border-r-2 border-black text-center font-black">12 Tenants</td>
                                    <td className="p-4 text-center">
                                        <button
                                            className="bg-white border-2 border-neo-black px-3 py-1 text-[10px] font-black uppercase hover:bg-neo-yellow transition-colors tracking-wider">Edit
                                            Node Graph</button>
                                    </td>
                                </tr>

                            </tbody>
                        </table>
                    </div>

                </div>

            </div>
        </main>
    </div>
    </>
  );
}

export default AdminWorkflows;
