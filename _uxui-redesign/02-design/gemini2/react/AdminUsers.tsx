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
            background-image: radial-gradient(#00E5FF 1px, transparent 1px);
            background-size: 20px 20px;
        }
`;

function AdminUsers() {
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
                <a href="/admin/users"
                    className="nav-item active flex items-center gap-3 p-2 font-bold transition-colors text-sm">
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
                <a href="/admin/departments"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">
                    🏛 Global Departments
                </a>
            </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow flex flex-col h-full bg-transparent overflow-y-auto w-full p-8 relative z-0">

            <div className="max-w-6xl mx-auto w-full space-y-8">

                <div
                    className="flex justify-between items-center bg-white p-6 border-3 border-neo-black shadow-[8px_8px_0px_#1E1E1E] transform rotate-[-1deg]">
                    <div>
                        <h2 className="text-3xl font-black uppercase">Global User Directory</h2>
                        <p className="font-bold text-gray-600 mt-2">Manage all human accounts across all tenant workspaces.
                        </p>
                    </div>
                    {/* API: POST /api/admin/users/invite */}
                    <button className="neo-btn bg-neo-lime px-6 py-3 font-black uppercase tracking-wide">Invite
                        SuperAdmin</button>
                </div>

                <div className="neo-card bg-white flex flex-col pt-4">

                    {/* Filters */}
                    <div
                        className="px-6 pb-4 border-b-3 border-neo-black flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex gap-4">
                            <input type="text" placeholder="Search by name, email, or tenant..."
                                className="p-2 border-3 border-neo-black bg-neo-bg font-bold w-72 focus:outline-none focus:bg-white focus:ring-2 focus:ring-neo-blue shadow-[2px_2px_0px_#000]" />
                            <select
                                className="p-2 border-3 border-neo-black bg-white font-bold cursor-pointer outline-none shadow-[2px_2px_0px_#000]">
                                <option>All Tenants</option>
                                <option>Acme Corp</option>
                                <option>Global Tech</option>
                                <option>Beta Startup</option>
                            </select>
                            <select
                                className="p-2 border-3 border-neo-black bg-white font-bold cursor-pointer outline-none shadow-[2px_2px_0px_#000]">
                                <option>All Roles</option>
                                <option>Tenant Admin</option>
                                <option>Member</option>
                                <option>SuperAdmin (Platform)</option>
                            </select>
                        </div>
                        <span className="text-sm font-black bg-neo-yellow px-2 py-1 border border-black">Total: 1,204</span>
                    </div>

                    {/* Users Table */}
                    {/* API: GET /api/admin/users */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-medium">
                            <thead className="bg-neo-black text-white text-xs uppercase font-black tracking-widest">
                                <tr>
                                    <th className="p-4 border-r-2 border-gray-700">User</th>
                                    <th className="p-4 border-r-2 border-gray-700">Account / Tenant</th>
                                    <th className="p-4 border-r-2 border-gray-700 text-center">Role</th>
                                    <th className="p-4 border-r-2 border-gray-700">Last Active</th>
                                    <th className="p-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-gray-300">

                                <tr className="hover:bg-neo-blue/10 cursor-default transition-colors">
                                    <td className="p-4 border-r-2 border-black flex items-center gap-3">
                                        <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=transparent"
                                            alt="Avatar"
                                            className="w-10 h-10 rounded-full border-2 border-black bg-neo-yellow" />
                                        <div>
                                            <div className="font-black text-sm">Alex Mercer</div>
                                            <div className="text-xs font-bold text-gray-500">alex@acmecorp.com</div>
                                        </div>
                                    </td>
                                    <td className="p-4 border-r-2 border-black">
                                        <span className="bg-gray-200 border border-black px-2 py-0.5 text-xs font-bold">Acme
                                            Corp</span>
                                    </td>
                                    <td className="p-4 border-r-2 border-black text-center">
                                        <span
                                            className="bg-neo-pink text-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border border-black">Tenant
                                            Admin</span>
                                    </td>
                                    <td className="p-4 border-r-2 border-black text-sm font-bold">2 mins ago</td>
                                    <td className="p-4 text-center">
                                        {/* API: POST /api/admin/users/:id/hijack */}
                                        <button
                                            className="bg-white border-2 border-neo-black px-3 py-1 text-[10px] font-black uppercase hover:bg-neo-blue hover:text-white transition-colors tracking-wider">Impersonate</button>
                                    </td>
                                </tr>

                                <tr className="hover:bg-neo-blue/10 cursor-default transition-colors">
                                    <td className="p-4 border-r-2 border-black flex items-center gap-3">
                                        <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Sarah&backgroundColor=transparent"
                                            alt="Avatar"
                                            className="w-10 h-10 rounded-full border-2 border-black bg-neo-blue" />
                                        <div>
                                            <div className="font-black text-sm">Sarah Jenkins</div>
                                            <div className="text-xs font-bold text-gray-500">s.jenkins@globaltech.io</div>
                                        </div>
                                    </td>
                                    <td className="p-4 border-r-2 border-black">
                                        <span
                                            className="bg-gray-200 border border-black px-2 py-0.5 text-xs font-bold">Global
                                            Tech</span>
                                    </td>
                                    <td className="p-4 border-r-2 border-black text-center">
                                        <span
                                            className="bg-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border border-black">Member</span>
                                    </td>
                                    <td className="p-4 border-r-2 border-black text-sm font-bold">Yesterday</td>
                                    <td className="p-4 text-center">
                                        <button
                                            className="bg-white border-2 border-neo-black px-3 py-1 text-[10px] font-black uppercase hover:bg-neo-blue hover:text-white transition-colors tracking-wider">Impersonate</button>
                                    </td>
                                </tr>

                                <tr className="hover:bg-neo-blue/10 cursor-default transition-colors bg-gray-50 opacity-70">
                                    <td className="p-4 border-r-2 border-black flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 bg-gray-300 rounded-full border-2 border-gray-400 flex items-center justify-center font-bold text-gray-500">
                                            JD</div>
                                        <div>
                                            <div className="font-black text-sm text-gray-600">John Doe</div>
                                            <div className="text-xs font-bold text-gray-500">john@betastartup.com</div>
                                        </div>
                                    </td>
                                    <td className="p-4 border-r-2 border-black">
                                        <span
                                            className="bg-gray-200 border border-gray-400 text-gray-500 px-2 py-0.5 text-xs font-bold">Beta
                                            Startup</span>
                                    </td>
                                    <td className="p-4 border-r-2 border-black text-center">
                                        <span
                                            className="bg-gray-200 text-gray-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border border-gray-400">Tenant
                                            Admin</span>
                                    </td>
                                    <td className="p-4 border-r-2 border-black text-sm font-bold text-gray-500">2 months ago
                                    </td>
                                    <td className="p-4 text-center text-xs font-bold text-gray-500">
                                        Suspended (Billing)
                                    </td>
                                </tr>

                                <tr
                                    className="hover:bg-neo-blue/10 cursor-default transition-colors border-l-8 border-neo-yellow">
                                    <td className="p-4 border-r-2 border-black flex items-center gap-3 pl-2">
                                        <div
                                            className="w-10 h-10 bg-neo-black text-white rounded-full border-2 border-black flex items-center justify-center font-black">
                                            SW</div>
                                        <div>
                                            <div className="font-black text-sm text-neo-orange flex items-center gap-1">
                                                Sam Wilson
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                                                    stroke="currentColor" strokeWidth="3" strokeLinecap="round"
                                                    strokeLinejoin="round">
                                                    <polygon
                                                        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2">
                                                    </polygon>
                                                </svg>
                                            </div>
                                            <div className="text-xs font-bold text-gray-500">sam@corthex.net</div>
                                        </div>
                                    </td>
                                    <td className="p-4 border-r-2 border-black">
                                        <span
                                            className="bg-neo-black text-white border border-black px-2 py-0.5 text-xs font-bold uppercase">System
                                            Operator</span>
                                    </td>
                                    <td className="p-4 border-r-2 border-black text-center">
                                        <span
                                            className="bg-neo-yellow px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border border-black shadow-sm">Platform
                                            SuperAdmin</span>
                                    </td>
                                    <td className="p-4 border-r-2 border-black text-sm font-bold">Online</td>
                                    <td className="p-4 text-center">
                                        <span
                                            className="text-[10px] font-black uppercase tracking-wider text-gray-400">You</span>
                                    </td>
                                </tr>

                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-4 border-t-3 border-neo-black bg-gray-100 flex justify-between items-center">
                        <button
                            className="bg-white border-2 border-neo-black px-3 py-1 font-bold text-xs uppercase disabled:opacity-50">Prev</button>
                        <span className="text-xs font-bold">Page 1 of 121</span>
                        <button
                            className="bg-white border-2 border-neo-black px-3 py-1 font-bold text-xs uppercase shadow-sm hover:translate-y-px hover:shadow-none">Next</button>
                    </div>

                </div>

            </div>
        </main>
    </div>
    </>
  );
}

export default AdminUsers;
