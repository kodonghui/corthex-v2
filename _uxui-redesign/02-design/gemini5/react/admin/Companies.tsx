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

function Companies() {
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
                    <span className="label-mono text-gray-300 block mb-4">TENANT MANAGEMENT</span>
                    <ul className="space-y-6 pl-4">
                        {/* GET /api/admin/companies */}
                        <li><a href="/app/companies" className="title-3 transition-colors">Companies</a></li>
                        <li><a href="/app/users"
                                className="body-base text-gray-500 hover:text-black transition-colors">Global Users</a></li>
                        <li><a href="/app/onboarding"
                                className="body-base text-gray-500 hover:text-black transition-colors">Onboarding Queue</a>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
    </nav>

    <main className="flex-1 flex overflow-hidden bg-white">

        <div className="w-2/3 border-r border-gray-100 flex flex-col">
            <header className="p-16 pb-8 border-b border-black">
                <h1 className="title-display mb-12">Tenant Roster</h1>
                <div className="relative">
                    <input type="text" placeholder="Search by name, ID, or domain..."
                        className="w-full title-3 font-light placeholder-gray-300 border-none focus:outline-none focus:ring-0" />
                </div>
            </header>

            <div className="flex-1 overflow-y-auto w-full">

                <table className="w-full text-left">
                    <thead className="sticky top-0 bg-white shadow-[0_1px_0_0_#eeeeee] z-10">
                        <tr>
                            <th className="label-mono text-gray-500 py-6 px-16 w-1/3">COMPANY</th>
                            <th className="label-mono text-gray-500 py-6">PLAN</th>
                            <th className="label-mono text-gray-500 py-6">USERS</th>
                            <th className="label-mono text-gray-500 py-6">AGENTS</th>
                            <th className="label-mono text-gray-500 py-6">MRR</th>
                        </tr>
                    </thead>
                    <tbody className="body-base">

                        <tr className="group hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50">
                            <td className="px-16 py-8">
                                <div className="flex items-center space-x-6">
                                    <div
                                        className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold">
                                        A</div>
                                    <div>
                                        <span className="title-3 block mb-1">Acme Corporation</span>
                                        <span className="body-small text-gray-500">acme.co</span>
                                    </div>
                                </div>
                            </td>
                            <td className="py-8"><span
                                    className="label-mono border border-black px-2 py-1 bg-black text-white">ENTERPRISE</span>
                            </td>
                            <td className="py-8">4,192</td>
                            <td className="py-8">14</td>
                            <td className="py-8 font-medium">$10,400</td>
                        </tr>

                        <tr className="group hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50">
                            <td className="px-16 py-8">
                                <div className="flex items-center space-x-6">
                                    <div className="w-10 h-10 bg-gray-100 flex items-center justify-center font-bold">G
                                    </div>
                                    <div>
                                        <span className="title-3 block mb-1">Globex Finance</span>
                                        <span className="body-small text-gray-500">globex.io</span>
                                    </div>
                                </div>
                            </td>
                            <td className="py-8"><span
                                    className="label-mono border border-gray-300 px-2 py-1 text-gray-500">PRO</span></td>
                            <td className="py-8">145</td>
                            <td className="py-8">6</td>
                            <td className="py-8 font-medium">$2,100</td>
                        </tr>

                        <tr className="group hover:bg-gray-50 cursor-pointer transition-colors opacity-50">
                            <td className="px-16 py-8">
                                <div className="flex items-center space-x-6">
                                    <div
                                        className="w-10 h-10 bg-gray-50 flex items-center justify-center font-bold text-gray-300">
                                        I</div>
                                    <div>
                                        <span className="title-3 block mb-1 line-through">Initech</span>
                                        <span className="body-small text-status-red">SUSPENDED (Billing)</span>
                                    </div>
                                </div>
                            </td>
                            <td className="py-8"><span
                                    className="label-mono border border-gray-300 px-2 py-1 text-gray-300">PRO</span></td>
                            <td className="py-8">42</td>
                            <td className="py-8">0</td>
                            <td className="py-8 font-medium text-gray-300">$0</td>
                        </tr>

                    </tbody>
                </table>

            </div>
        </div>

        {/* Detail Sidebar */}
        <div className="w-1/3 bg-gray-50 p-16 flex flex-col">
            <header className="mb-12 border-b border-black pb-8">
                <div className="w-16 h-16 bg-black text-white flex items-center justify-center title-2 font-bold mb-6">A
                </div>
                <h2 className="title-1 mb-2">Acme Corporation</h2>
                <a href="https://acme.co" target="_blank" className="label-mono text-gray-500 hover:text-black">acme.co</a>
            </header>

            <div className="space-y-12">
                <div>
                    <h3 className="label-mono text-gray-500 mb-4">TENANT CONTACT</h3>
                    <p className="body-base text-black mb-1">Jane Doe (CIO)</p>
                    <p className="body-small text-gray-500">jane@acme.co</p>
                </div>

                <div>
                    <h3 className="label-mono text-gray-500 mb-4">RESOURCE CONSUMPTION (MTD)</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="body-small">LLM Tokens</span>
                            <span className="body-small font-mono">142,401,992</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="body-small">Vector DB Storage</span>
                            <span className="body-small font-mono">14.2 GB</span>
                        </div>
                        <div className="flex justify-between text-status-red">
                            <span className="body-small">API Error Rate</span>
                            <span className="body-small font-mono">1.2%</span>
                        </div>
                    </div>
                </div>

                <div className="pt-12 border-t border-gray-200">
                    <button
                        className="w-full bg-black text-white px-6 py-4 label-mono hover:bg-gray-900 transition-colors mb-4 border border-black">IMPERSONATE
                        TENANT ADMIN</button>
                    <button
                        className="w-full bg-transparent text-gray-500 px-6 py-4 label-mono border border-gray-300 hover:border-status-red hover:text-status-red transition-colors">SUSPEND
                        TENANT</button>
                </div>
            </div>
        </div>

    </main>
    </>
  );
}

export default Companies;
