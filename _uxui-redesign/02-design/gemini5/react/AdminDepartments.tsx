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

function AdminDepartments() {
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
                                className="text-mono-100 font-bold border-l-2 border-mono-100 pl-3 -ml-4 block">Departments</a>
                        </li>
                        <li><a href="#" className="text-mono-500 hover:text-mono-100 transition-colors block">Employees</a>
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

        {/* Right Content: Departments Management */}
        <section className="lg:col-span-9 p-16 lg:px-32 pt-32 pb-32">

            <header className="mb-section pb-16 border-b border-mono-800 flex justify-between items-end">
                <div>
                    <div className="text-mono-500 font-mono text-caption uppercase tracking-widest mb-6">Organization /
                        Structure</div>
                    <h1 className="text-hero leading-tight tracking-tighter">Departments</h1>
                </div>
                {/* API: POST /api/admin/departments */}
                <button
                    className="bg-mono-100 text-mono-900 px-8 py-4 font-mono font-bold uppercase tracking-widest text-caption hover:bg-mono-400 transition-colors">
                    > CREATE DEPARTMENT
                </button>
            </header>

            {/* Departments Data Table */}
            {/* API: GET /api/admin/departments */}
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Department Name</th>
                        <th>Department Head (AI)</th>
                        <th>Active Agents</th>
                        <th>Monthly Token Budget</th>
                        <th className="text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="text-body-s font-medium font-sans">

                    <tr className="group cursor-pointer">
                        <td className="text-h3 font-bold text-mono-100 tracking-tight">전략기획실<br /><span
                                className="font-mono text-caption text-mono-600 font-normal uppercase mt-1 block">Strategy &
                                Planning</span></td>
                        <td className="text-mono-400">CIO Agent <span className="text-mono-600 text-[10px] ml-2">(A-099)</span>
                        </td>
                        <td className="font-mono text-mono-100">14</td>
                        <td>
                            <div className="font-mono text-mono-400">$842.10 / $800.00</div>
                            <div className="w-full bg-mono-800 h-1 mt-2">
                                <div className="bg-status-red h-full" style={{width: "100%"}}></div>
                            </div>
                        </td>
                        <td className="text-right font-mono text-caption text-mono-600 uppercase tracking-widest">
                            <button className="hover:text-mono-100 transition-colors mx-2">EDIT</button>
                            <button className="hover:text-status-red transition-colors mx-2">DISABLE</button>
                        </td>
                    </tr>

                    <tr className="group cursor-pointer">
                        <td className="text-h3 font-bold text-mono-100 tracking-tight">인사혁신처<br /><span
                                className="font-mono text-caption text-mono-600 font-normal uppercase mt-1 block">Human
                                Resources</span></td>
                        <td className="text-mono-400">CHO Agent <span className="text-mono-600 text-[10px] ml-2">(A-042)</span>
                        </td>
                        <td className="font-mono text-mono-100">5</td>
                        <td>
                            <div className="font-mono text-mono-400">$120.00 / $500.00</div>
                            <div className="w-full bg-mono-800 h-1 mt-2">
                                <div className="bg-mono-100 h-full" style={{width: "24%"}}></div>
                            </div>
                        </td>
                        <td className="text-right font-mono text-caption text-mono-600 uppercase tracking-widest">
                            <button className="hover:text-mono-100 transition-colors mx-2">EDIT</button>
                            <button className="hover:text-status-red transition-colors mx-2">DISABLE</button>
                        </td>
                    </tr>

                    <tr className="group cursor-pointer">
                        <td className="text-h3 font-bold text-mono-100 tracking-tight">비서실<br /><span
                                className="font-mono text-caption text-mono-600 font-normal uppercase mt-1 block">Secretariat</span>
                        </td>
                        <td className="text-mono-400">비서실장 <span className="text-mono-600 text-[10px] ml-2">(A-001)</span></td>
                        <td className="font-mono text-mono-100">2</td>
                        <td>
                            <div className="font-mono text-mono-400">Unmetered</div>
                            <div className="w-full bg-mono-800 h-1 mt-2">
                                <div className="bg-mono-600 h-full" style={{width: "100%"}}></div>
                            </div>
                        </td>
                        <td className="text-right font-mono text-caption text-mono-600 uppercase tracking-widest">
                            <button className="hover:text-mono-100 transition-colors mx-2">EDIT</button>
                            <button className="hover:text-mono-600 cursor-not-allowed mx-2"
                                title="Cannot disable system group">DISABLE</button>
                        </td>
                    </tr>

                </tbody>
            </table>

        </section>
    </main>
    </>
  );
}

export default AdminDepartments;
