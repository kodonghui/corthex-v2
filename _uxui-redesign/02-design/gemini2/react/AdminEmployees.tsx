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

function AdminEmployees() {
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
                <a href="/admin/employees"
                    className="nav-item active flex items-center gap-3 p-2 font-bold transition-colors text-sm">
                    👤 Internal Employees
                </a>
                <a href="/admin/users"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">
                    🌐 Global Users (Tenants)
                </a>

                <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mt-6 mb-1 pl-2">System Masters
                </p>
                <a href="/admin/agents"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">
                    🤖 Global Agents
                </a>
                <a href="/admin/departments"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">
                    🏛 Global Departments
                </a>
            </div>
        </nav>

        {/* Main Content */}
        {/* Note: This page manages the INTERNAL employees of the SaaS company (Corthex), not the users of the tenants. */}
        <main className="flex-grow flex flex-col h-full bg-transparent overflow-y-auto w-full p-8 relative z-0">

            <div className="max-w-6xl mx-auto w-full space-y-8">

                <div
                    className="flex justify-between items-center bg-white p-6 border-3 border-neo-black shadow-[8px_8px_0px_#1E1E1E]">
                    <div>
                        <h2 className="text-3xl font-black uppercase text-neo-pink">Internal Employee Portal</h2>
                        <p className="font-bold text-gray-600 mt-2">Manage Corthex staff access to the admin panel and
                            internal systems.</p>
                    </div>
                    {/* API: POST /api/admin/employees */}
                    <button className="neo-btn bg-neo-blue text-white px-6 py-3 font-black uppercase tracking-wide">Add
                        Staff Member</button>
                </div>

                <div className="neo-card bg-white flex flex-col pt-4">

                    <div className="px-6 pb-4 border-b-3 border-neo-black flex flex-wrap gap-4 items-center">
                        <input type="text" placeholder="Search staff..."
                            className="p-2 border-3 border-neo-black bg-neo-bg font-bold w-64 focus:outline-none focus:bg-white shadow-[2px_2px_0px_#000]" />
                        <select
                            className="p-2 border-3 border-neo-black bg-white font-bold cursor-pointer outline-none shadow-[2px_2px_0px_#000]">
                            <option>All Departments</option>
                            <option>Engineering (SRE)</option>
                            <option>Customer Success</option>
                            <option>Platform Ops</option>
                        </select>
                    </div>

                    {/* Employees Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-medium">
                            <thead
                                className="bg-gray-100 text-xs uppercase font-black tracking-widest border-b-3 border-neo-black">
                                <tr>
                                    <th className="p-4 border-r-2 border-black">Employee</th>
                                    <th className="p-4 border-r-2 border-black">Internal Role</th>
                                    <th className="p-4 border-r-2 border-black text-center">Clearance Level</th>
                                    <th className="p-4 border-r-2 border-black text-center">Key Rotation</th>
                                    <th className="p-4 text-center">Manage</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-gray-300">

                                <tr className="hover:bg-neo-blue/10 cursor-default transition-colors">
                                    <td className="p-4 border-r-2 border-black flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 bg-neo-black text-white rounded-full border-2 border-black flex items-center justify-center font-black text-xs">
                                            SW</div>
                                        <div>
                                            <div className="font-black text-sm">Sam Wilson (You)</div>
                                            <div className="text-[10px] font-bold text-gray-500 uppercase">
                                                sam.w@corthex.internal</div>
                                        </div>
                                    </td>
                                    <td className="p-4 border-r-2 border-black">
                                        <span className="font-bold text-sm">Lead Platform Operator</span>
                                    </td>
                                    <td className="p-4 border-r-2 border-black text-center">
                                        <span
                                            className="bg-neo-pink text-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border border-black shadow-sm">Level
                                            5 (Max)</span>
                                    </td>
                                    <td className="p-4 border-r-2 border-black text-center">
                                        <span className="text-xs font-bold text-green-600">Valid (20d left)</span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button
                                            className="bg-white border-2 border-gray-300 text-gray-400 px-3 py-1 text-[10px] font-black uppercase"
                                            disabled>Locked</button>
                                    </td>
                                </tr>

                                <tr className="hover:bg-neo-blue/10 cursor-default transition-colors">
                                    <td className="p-4 border-r-2 border-black flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 bg-neo-lime rounded-full border-2 border-black flex items-center justify-center font-black text-xs">
                                            EK</div>
                                        <div>
                                            <div className="font-black text-sm">Elias Kim</div>
                                            <div className="text-[10px] font-bold text-gray-500 uppercase">
                                                elias.k@corthex.internal</div>
                                        </div>
                                    </td>
                                    <td className="p-4 border-r-2 border-black">
                                        <span className="font-bold text-sm">Customer Support Lead</span>
                                    </td>
                                    <td className="p-4 border-r-2 border-black text-center">
                                        <span
                                            className="bg-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border border-black">Level
                                            2 (Read-Only)</span>
                                    </td>
                                    <td className="p-4 border-r-2 border-black text-center">
                                        <span className="text-xs font-bold text-neo-orange">Rotate Now</span>
                                    </td>
                                    <td className="p-4 text-center">
                                        {/* API: PUT /api/admin/employees/:id */}
                                        <button
                                            className="bg-white border-2 border-neo-black px-3 py-1 text-[10px] font-black uppercase hover:bg-neo-yellow hover:shadow-sm transition-all tracking-wider">Manage</button>
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

export default AdminEmployees;
