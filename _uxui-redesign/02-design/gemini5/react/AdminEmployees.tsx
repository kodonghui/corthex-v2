"use client";
import React from "react";

const styles = `
body {
            background-color: #000000;
            color: #ffffff;
            -webkit-font-smoothing: antialiased;
        }

        .admin-border {
            border-top: 4px solid #fff;
        }

        .data-table {
            width: 100%;
            text-align: left;
        }

        .data-table th,
        .data-table td {
            padding: 1.5rem 1rem;
            border-bottom: 1px solid #333;
        }

        .data-table th {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #666;
            font-weight: 500;
        }

        .data-table tr:hover td {
            background-color: #111;
        }
`;

function AdminEmployees() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
<nav className="flex justify-between items-center px-16 py-8 border-b border-mono-800 sticky top-0 bg-mono-900 z-50">
        <div className="flex items-center gap-8">
            <a href="/admin/dashboard"
                className="text-h2 font-bold tracking-tighter hover:text-mono-400 transition-colors">CORTHEX</a>
            <div className="text-caption text-mono-900 uppercase tracking-widest bg-mono-100 px-3 py-1 font-bold">
                WORKSPACE ADMIN
            </div>
        </div>

        <div className="flex gap-8 text-caption font-mono uppercase tracking-widest text-mono-500 items-center">
            <a href="/app/home" className="hover:text-mono-100 transition-colors">EXIT BACK TO APP -></a>
        </div>
    </nav>

    <main className="grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-80px)]">

        {/* Left Sidebar: Admin Navigation */}
        <aside
            className="lg:col-span-3 border-r border-mono-800 p-16 pt-32 lg:sticky lg:top-[80px] lg:h-[calc(100vh-80px)] overflow-y-auto">

            <div className="space-y-12 text-body-s font-mono uppercase tracking-widest">

                <div>
                    <h3 className="text-mono-600 mb-4 pb-2 border-b border-mono-800">Overview</h3>
                    <ul className="space-y-4">
                        <li><a href="/admin/dashboard"
                                className="text-mono-500 hover:text-mono-100 transition-colors block">Dashboard</a></li>
                        <li><a href="#" className="text-mono-500 hover:text-mono-100 transition-colors block">Monitoring</a>
                        </li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-mono-600 mb-4 pb-2 border-b border-mono-800">Organization</h3>
                    <ul className="space-y-4">
                        <li><a href="/admin/agents"
                                className="text-mono-500 hover:text-mono-100 transition-colors block">Agents</a></li>
                        <li><a href="/admin/departments"
                                className="text-mono-500 hover:text-mono-100 transition-colors block">Departments</a></li>
                        <li><a href="/admin/employees"
                                className="text-mono-100 font-bold border-l-2 border-mono-100 pl-3 -ml-4 block">Employees</a>
                        </li>
                        <li><a href="#" className="text-mono-500 hover:text-mono-100 transition-colors block">Org Chart</a>
                        </li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-mono-600 mb-4 pb-2 border-b border-mono-800">Resources</h3>
                    <ul className="space-y-4">
                        <li><a href="#" className="text-mono-500 hover:text-mono-100 transition-colors block">Credentials &
                                API Keys</a></li>
                        <li><a href="#" className="text-mono-500 hover:text-mono-100 transition-colors block">Tools</a></li>
                        <li><a href="#" className="text-mono-500 hover:text-mono-100 transition-colors block">Costs &
                                Billing</a></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-mono-600 mb-4 pb-2 border-b border-mono-800">Marketplace</h3>
                    <ul className="space-y-4">
                        <li><a href="#" className="text-mono-500 hover:text-mono-100 transition-colors block">Soul
                                Templates</a></li>
                        <li><a href="#" className="text-mono-500 hover:text-mono-100 transition-colors block">Agent
                                Market</a></li>
                    </ul>
                </div>

            </div>
        </aside>

        {/* Right Content: Employees (Human Users) Management */}
        <section className="lg:col-span-9 p-16 lg:px-32 pt-32 pb-32">

            <header className="mb-section pb-16 border-b border-mono-800 flex justify-between items-end">
                <div>
                    <div className="text-mono-500 font-mono text-caption uppercase tracking-widest mb-6">Organization /
                        Human Resources</div>
                    <h1 className="text-hero leading-tight tracking-tighter">Employees</h1>
                </div>
                {/* API: POST /api/admin/employees/invite */}
                <button
                    className="bg-mono-100 text-mono-900 px-8 py-4 font-mono font-bold uppercase tracking-widest text-caption hover:bg-mono-400 transition-colors">
                    > INVITE USER
                </button>
            </header>

            {/* Filters */}
            {/* API: GET /api/admin/employees?role=...&status=... */}
            <div className="flex gap-8 mb-16 font-mono text-caption uppercase tracking-widest">
                <input type="text" placeholder="SEARCH EXT OR EMAIL..."
                    className="bg-transparent border-b border-mono-800 text-mono-50 focus:border-mono-100 focus:outline-none pb-2 w-64 placeholder:text-mono-600" />
                <select
                    className="bg-transparent border-b border-mono-800 text-mono-400 focus:outline-none pb-2 cursor-pointer appearance-none">
                    <option className="bg-mono-900">ALL ROLES</option>
                    <option className="bg-mono-900">WORKSPACE ADMIN</option>
                    <option className="bg-mono-900">DEPARTMENT HEAD</option>
                    <option className="bg-mono-900">MEMBER</option>
                    <option className="bg-mono-900">OBSERVER</option>
                </select>
                <select
                    className="bg-transparent border-b border-mono-800 text-mono-400 focus:outline-none pb-2 cursor-pointer appearance-none">
                    <option className="bg-mono-900">ALL STATUSES</option>
                    <option className="bg-mono-900">ACTIVE</option>
                    <option className="bg-mono-900">INVITED</option>
                    <option className="bg-mono-900">SUSPENDED</option>
                </select>
            </div>

            {/* Employees Data Table */}
            {/* API: GET /api/admin/employees */}
            <table className="data-table">
                <thead>
                    <tr>
                        <th>User (Ext)</th>
                        <th>Role</th>
                        <th>Department</th>
                        <th>Clearance</th>
                        <th>Status</th>
                        <th className="text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="text-body-s font-medium font-sans">

                    <tr className="group cursor-pointer">
                        <td>
                            <div className="font-bold text-mono-100 text-body-l">KIM CEO</div>
                            <div className="font-mono text-mono-500 text-[10px] uppercase mt-1">ceo@corthex.net</div>
                        </td>
                        <td className="font-mono text-mono-400">ADMIN</td>
                        <td className="text-mono-400">Executive</td>
                        <td className="font-mono text-status-red">C-5 (TOP SECRET)</td>
                        <td><span
                                className="w-2 h-2 rounded-full bg-status-green inline-block mr-2 animate-pulse"></span>ONLINE
                        </td>
                        <td className="text-right font-mono text-caption text-mono-600 uppercase tracking-widest">
                            <button className="hover:text-mono-100 transition-colors mx-2">EDIT</button>
                        </td>
                    </tr>

                    <tr className="group cursor-pointer">
                        <td>
                            <div className="font-bold text-mono-100 text-body-l">LEE MANAGER</div>
                            <div className="font-mono text-mono-500 text-[10px] uppercase mt-1">lee@corthex.net</div>
                        </td>
                        <td className="font-mono text-mono-400">DEPT HEAD</td>
                        <td className="text-mono-400">Marketing</td>
                        <td className="font-mono text-mono-400">C-3 (CONFIDENTIAL)</td>
                        <td><span className="w-2 h-2 rounded-full bg-mono-600 inline-block mr-2"></span>OFFLINE</td>
                        <td className="text-right font-mono text-caption text-mono-600 uppercase tracking-widest">
                            <button className="hover:text-mono-100 transition-colors mx-2">EDIT</button>
                            <button className="hover:text-status-red transition-colors mx-2">SUSPEND</button>
                        </td>
                    </tr>

                    <tr className="group cursor-pointer opacity-50">
                        <td>
                            <div className="font-bold text-mono-100 text-body-l">PARK DEV</div>
                            <div className="font-mono text-mono-500 text-[10px] uppercase mt-1">park.dev@corthex.net</div>
                        </td>
                        <td className="font-mono text-mono-400">MEMBER</td>
                        <td className="text-mono-400">Engineering</td>
                        <td className="font-mono text-mono-400">C-2 (INTERNAL)</td>
                        <td><span className="w-2 h-2 rounded-full bg-status-red inline-block mr-2"></span>SUSPENDED</td>
                        <td className="text-right font-mono text-caption text-mono-600 uppercase tracking-widest">
                            <button className="hover:text-mono-100 transition-colors mx-2">EDIT</button>
                            <button className="hover:text-mono-100 transition-colors mx-2">RESTORE</button>
                        </td>
                    </tr>

                    <tr className="group cursor-pointer">
                        <td>
                            <div className="font-bold text-mono-100 text-body-l italic">Pending Invite...</div>
                            <div className="font-mono text-mono-500 text-[10px] uppercase mt-1">new.guy@corthex.net</div>
                        </td>
                        <td className="font-mono text-mono-400">MEMBER</td>
                        <td className="text-mono-400">Sales</td>
                        <td className="font-mono text-mono-400">C-1 (PUBLIC)</td>
                        <td><span
                                className="w-2 h-2 rounded-full bg-mono-800 border border-mono-500 inline-block mr-2"></span>INVITED
                        </td>
                        <td className="text-right font-mono text-caption text-mono-600 uppercase tracking-widest">
                            <button className="hover:text-mono-100 transition-colors mx-2">RESEND</button>
                            <button className="hover:text-status-red transition-colors mx-2">REVOKE</button>
                        </td>
                    </tr>

                </tbody>
            </table>

        </section>
    </main>
    </>
  );
}

export default AdminEmployees;
