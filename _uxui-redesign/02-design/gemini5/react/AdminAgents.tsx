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

function AdminAgents() {
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
                                className="text-mono-100 font-bold border-l-2 border-mono-100 pl-3 -ml-4 block">Agents</a>
                        </li>
                        <li><a href="#"
                                className="text-mono-500 hover:text-mono-100 transition-colors block">Departments</a></li>
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

        {/* Right Content: Agents Management */}
        <section className="lg:col-span-9 p-16 lg:px-32 pt-32 pb-32">

            <header className="mb-section pb-16 border-b border-mono-800 flex justify-between items-end">
                <div>
                    <div className="text-mono-500 font-mono text-caption uppercase tracking-widest mb-6">Organization /
                        Registry</div>
                    <h1 className="text-hero leading-tight tracking-tighter">AI Agents</h1>
                </div>
                {/* API: POST /api/admin/agents */}
                <button
                    className="bg-mono-100 text-mono-900 px-8 py-4 font-mono font-bold uppercase tracking-widest text-caption hover:bg-mono-400 transition-colors">
                    > DEPLOY NEW AGENT
                </button>
            </header>

            {/* Filters */}
            {/* API: GET /api/admin/agents?dept=...&status=... */}
            <div className="flex gap-8 mb-16 font-mono text-caption uppercase tracking-widest">
                <input type="text" placeholder="SEARCH ID/NAME..."
                    className="bg-transparent border-b border-mono-800 text-mono-50 focus:border-mono-100 focus:outline-none pb-2 w-64 placeholder:text-mono-600" />
                <select
                    className="bg-transparent border-b border-mono-800 text-mono-400 focus:outline-none pb-2 cursor-pointer appearance-none">
                    <option className="bg-mono-900">ALL DEPARTMENTS</option>
                    <option className="bg-mono-900">STRATEGY</option>
                    <option className="bg-mono-900">HR</option>
                    <option className="bg-mono-900">SYSTEM</option>
                </select>
                <select
                    className="bg-transparent border-b border-mono-800 text-mono-400 focus:outline-none pb-2 cursor-pointer appearance-none">
                    <option className="bg-mono-900">ALL STATUSES</option>
                    <option className="bg-mono-900">ACTIVE</option>
                    <option className="bg-mono-900">IDLE</option>
                    <option className="bg-mono-900">PAUSED</option>
                </select>
            </div>

            {/* Agents Data Table */}
            {/* API: GET /api/admin/agents */}
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Agent ID</th>
                        <th>Alias (Name)</th>
                        <th>Department</th>
                        <th>Model Binding</th>
                        <th>Status</th>
                        <th className="text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="text-body-s font-medium font-sans">

                    <tr className="group cursor-pointer">
                        <td className="font-mono text-mono-500 uppercase tracking-widest">A-001</td>
                        <td className="text-body-l font-bold text-mono-100">비서실장</td>
                        <td className="text-mono-400">Secretariat</td>
                        <td className="font-mono text-mono-500">gpt-4o</td>
                        <td><span
                                className="w-2 h-2 rounded-full bg-status-green inline-block mr-2 animate-pulse"></span>ACTIVE
                        </td>
                        <td className="text-right font-mono text-caption text-mono-600 uppercase tracking-widest">
                            <button className="hover:text-mono-100 transition-colors mx-2">EDIT</button>
                            <button className="hover:text-status-red transition-colors mx-2">PAUSE</button>
                        </td>
                    </tr>

                    <tr className="group cursor-pointer">
                        <td className="font-mono text-mono-500 uppercase tracking-widest">A-042</td>
                        <td className="text-body-l font-bold text-mono-100">마케팅 리스크 분석기</td>
                        <td className="text-mono-400">Strategy Dept</td>
                        <td className="font-mono text-mono-500">claude-3.5-sonnet</td>
                        <td><span className="w-2 h-2 rounded-full bg-mono-600 inline-block mr-2"></span>IDLE</td>
                        <td className="text-right font-mono text-caption text-mono-600 uppercase tracking-widest">
                            <button className="hover:text-mono-100 transition-colors mx-2">EDIT</button>
                            <button className="hover:text-mono-100 transition-colors mx-2">START</button>
                        </td>
                    </tr>

                    <tr className="group cursor-pointer opacity-50">
                        <td className="font-mono text-mono-500 uppercase tracking-widest">A-088</td>
                        <td className="text-body-l font-bold text-mono-100 line-through">HR 드래프터 V1</td>
                        <td className="text-mono-400">HR Dept</td>
                        <td className="font-mono text-mono-500">gpt-4-turbo</td>
                        <td><span className="w-2 h-2 rounded-full bg-status-red inline-block mr-2"></span>DEPRECATED</td>
                        <td className="text-right font-mono text-caption text-mono-600 uppercase tracking-widest">
                            <button className="hover:text-mono-100 transition-colors mx-2">LOGS</button>
                            <button className="hover:text-status-red transition-colors mx-2 hover:underline">PURGE</button>
                        </td>
                    </tr>

                    <tr className="group cursor-pointer">
                        <td className="font-mono text-mono-500 uppercase tracking-widest">A-091</td>
                        <td className="text-body-l font-bold text-mono-100">글로벌 마켓 트래커</td>
                        <td className="text-mono-400">Trading Group</td>
                        <td className="font-mono text-mono-500">gemini-1.5-pro</td>
                        <td><span
                                className="w-2 h-2 rounded-full bg-status-green inline-block mr-2 animate-pulse"></span>ACTIVE
                        </td>
                        <td className="text-right font-mono text-caption text-mono-600 uppercase tracking-widest">
                            <button className="hover:text-mono-100 transition-colors mx-2">EDIT</button>
                            <button className="hover:text-status-red transition-colors mx-2">PAUSE</button>
                        </td>
                    </tr>

                </tbody>
            </table>

            <div className="mt-8 text-center font-mono text-caption text-mono-600 uppercase tracking-widest">
                Showing 4 of 142 Agents. <button
                    className="text-mono-100 hover:text-mono-50 border-b border-mono-100 ml-4">LOAD MORE</button>
            </div>

        </section>
    </main>
    </>
  );
}

export default AdminAgents;
