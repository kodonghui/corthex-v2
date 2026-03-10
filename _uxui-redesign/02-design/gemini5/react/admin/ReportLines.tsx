"use client";
import React from "react";

const styles = `
body {
            background-color: #FFFFFF;
            color: #000000;
            -webkit-font-smoothing: antialiased;
        }

        ::-webkit-scrollbar {
            width: 0px;
            background: transparent;
        }

        ::selection {
            background-color: #000000;
            color: #FFFFFF;
        }

        .title-display {
            font-size: 4rem;
            line-height: 1;
            font-weight: 800;
            letter-spacing: -0.04em;
        }

        .title-1 {
            font-size: 2.5rem;
            line-height: 1.1;
            font-weight: 700;
            letter-spacing: -0.02em;
        }

        .title-2 {
            font-size: 1.5rem;
            line-height: 1.2;
            font-weight: 600;
            letter-spacing: -0.02em;
        }

        .title-3 {
            font-size: 1.125rem;
            line-height: 1.4;
            font-weight: 600;
        }

        .body-base {
            font-size: 0.9375rem;
            line-height: 1.6;
            font-weight: 400;
            color: #111111;
        }

        .body-small {
            font-size: 0.8125rem;
            line-height: 1.5;
            font-weight: 400;
            color: #666666;
        }

        .label-mono {
            font-size: 0.6875rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #999999;
        }
`;

function ReportLines() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
<nav className="w-72 flex flex-col justify-between py-12 px-10 flex-shrink-0 bg-gray-50 border-r border-gray-100">
        <div>
            <div className="mb-24 flex items-center">
                <span className="title-2 tracking-tighter">CORTHEX</span>
                <span className="label-mono ml-3 text-status-red bg-red-50 px-2 py-1">ADMIN</span>
            </div>

            <ul className="space-y-10">
                <li><a href="/app/dashboard" className="body-base text-gray-500 hover:text-black transition-colors">Platform
                        Overview</a></li>
                <li className="space-y-6 pt-4">
                    <span className="label-mono text-gray-300 block mb-4">ORG STRUCTURES</span>
                    <ul className="space-y-6 pl-4">
                        <li><a href="/app/departments"
                                className="body-base text-gray-500 hover:text-black transition-colors">Dept Templates</a>
                        </li>
                        <li><a href="/app/org-chart"
                                className="body-base text-gray-500 hover:text-black transition-colors">Global
                                Connectivity</a></li>
                        <li><a href="/app/org-templates"
                                className="body-base text-gray-500 hover:text-black transition-colors">Org Chart Presets</a>
                        </li>
                        {/* GET /api/admin/report-lines */}
                        <li><a href="/app/report-lines" className="title-3 transition-colors">Reporting Rules</a></li>
                    </ul>
                </li>
            </ul>
        </div>
    </nav>

    <main className="flex-1 overflow-y-auto p-16 lg:p-32 bg-white flex flex-col">

        <header className="mb-20 flex justify-between items-end border-b border-black pb-8">
            <div>
                <h1 className="title-display mb-6">Reporting Rules</h1>
                <p className="body-base max-w-2xl text-gray-500">
                    Define the system-level permissions governing how distinct agents can communicate, escalate tasks,
                    and evaluate outputs.
                </p>
            </div>
            <button className="bg-black text-white px-8 py-3 label-mono hover:bg-gray-900 transition-colors">+ NEW
                RULESET</button>
        </header>

        <div className="flex-1 min-h-0 bg-gray-50 border border-gray-200 p-12">

            <table className="w-full text-left">
                <thead>
                    <tr>
                        <th className="label-mono text-gray-500 pb-6 border-b border-gray-300 w-1/4">SOURCE NODE</th>
                        <th className="label-mono text-gray-500 pb-6 border-b border-gray-300 w-1/6">CONNECTION TYPE</th>
                        <th className="label-mono text-gray-500 pb-6 border-b border-gray-300 w-1/4">TARGET NODE</th>
                        <th className="label-mono text-gray-500 pb-6 border-b border-gray-300 w-1/4">CONSTRAINTS</th>
                        <th className="label-mono text-gray-500 pb-6 border-b border-gray-300 text-right">STATUS</th>
                    </tr>
                </thead>
                <tbody className="body-base text-gray-900">

                    <tr className="group hover:bg-white transition-colors cursor-pointer">
                        <td className="py-6 border-b border-gray-100">
                            <span className="label-mono text-black border border-black px-2 py-1 mr-2">SYS_CORE</span>
                            <span>Secretary General</span>
                        </td>
                        <td className="py-6 border-b border-gray-100">
                            <div className="flex items-center space-x-2 text-gray-500">
                                <span>Delegates To</span>
                                <span>-></span>
                            </div>
                        </td>
                        <td className="py-6 border-b border-gray-100">
                            <span className="label-mono text-gray-500 border border-gray-300 px-2 py-1 mr-2">ANY</span>
                            <span>Manager Tier Agents</span>
                        </td>
                        <td className="py-6 border-b border-gray-100 text-gray-500 body-small">
                            None. Absolute override.
                        </td>
                        <td className="py-6 border-b border-gray-100 text-right">
                            <span className="label-mono text-status-green flex items-center justify-end space-x-2">
                                <div className="w-1.5 h-1.5 bg-status-green rounded-full"></div>ACTIVE
                            </span>
                        </td>
                    </tr>

                    <tr className="group hover:bg-white transition-colors cursor-pointer">
                        <td className="py-6 border-b border-gray-100">
                            <span className="label-mono text-gray-500 border border-gray-300 px-2 py-1 mr-2">ANY</span>
                            <span>Specialist Tier Agents</span>
                        </td>
                        <td className="py-6 border-b border-gray-100">
                            <div className="flex items-center space-x-2 text-gray-500">
                                <span>Escalates To</span>
                                <span>-></span>
                            </div>
                        </td>
                        <td className="py-6 border-b border-gray-100">
                            <span className="label-mono text-gray-500 border border-gray-300 px-2 py-1 mr-2">DIRECT</span>
                            <span>Manager (Same Dept)</span>
                        </td>
                        <td className="py-6 border-b border-gray-100 text-gray-500 body-small">
                            Strict tree traversal. Cannot skip levels.
                        </td>
                        <td className="py-6 border-b border-gray-100 text-right">
                            <span className="label-mono text-status-green flex items-center justify-end space-x-2">
                                <div className="w-1.5 h-1.5 bg-status-green rounded-full"></div>ACTIVE
                            </span>
                        </td>
                    </tr>

                    <tr className="group hover:bg-white transition-colors cursor-pointer">
                        <td className="py-6 border-b border-gray-100">
                            <span
                                className="label-mono text-status-red border border-status-red px-2 py-1 mr-2">TPL_OVR</span>
                            <span>Compliance Agent</span>
                        </td>
                        <td className="py-6 border-b border-gray-100">
                            <div className="flex items-center space-x-2 text-status-red">
                                <span>Halts Process</span>
                                <span className="block w-4 h-px bg-status-red mx-1"></span>
                            </div>
                        </td>
                        <td className="py-6 border-b border-gray-100">
                            <span className="label-mono text-gray-500 border border-gray-300 px-2 py-1 mr-2">ANY</span>
                            <span>All Tiers</span>
                        </td>
                        <td className="py-6 border-b border-gray-100 text-gray-500 body-small">
                            Triggered on flagged content match.
                        </td>
                        <td className="py-6 border-b border-gray-100 text-right">
                            <span className="label-mono text-status-green flex items-center justify-end space-x-2">
                                <div className="w-1.5 h-1.5 bg-status-green rounded-full"></div>ACTIVE
                            </span>
                        </td>
                    </tr>

                </tbody>
            </table>

        </div>

    </main>
    </>
  );
}

export default ReportLines;
