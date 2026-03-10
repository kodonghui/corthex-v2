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

function ApiKeys() {
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
                    <span className="label-mono text-gray-300 block mb-4">ACCESS</span>
                    <ul className="space-y-6 pl-4">
                        <li><a href="/app/credentials"
                                className="body-base text-gray-500 hover:text-black transition-colors">System
                                Credentials</a></li>
                        {/* GET /api/admin/api-keys */}
                        <li><a href="/app/api-keys" className="title-3 transition-colors">Platform API Keys</a></li>
                        <li><a href="/app/employees"
                                className="body-base text-gray-500 hover:text-black transition-colors">Internal Staff</a>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
    </nav>

    <main className="flex-1 overflow-y-auto p-16 lg:p-32 bg-white flex flex-col">

        <header className="mb-32 flex justify-between items-end border-b border-black pb-8">
            <div>
                <h1 className="title-display mb-6">API & Integrations</h1>
                <p className="body-base max-w-2xl text-gray-500">
                    Manage global API keys issued to enterprise partners, SI companies, and high-volume external
                    aggregators.
                </p>
            </div>
            {/* POST /api/admin/api-keys */}
            <button className="bg-black text-white px-8 py-4 label-mono hover:bg-gray-900 transition-colors">ISSUE NEW
                KEY</button>
        </header>

        <div className="grid grid-cols-1 gap-12 max-w-6xl">

            <table className="w-full text-left">
                <thead>
                    <tr>
                        <th className="label-mono text-gray-500 pb-6 border-b border-gray-300">AUTHORIZATION</th>
                        <th className="label-mono text-gray-500 pb-6 border-b border-gray-300">ISSUED TO</th>
                        <th className="label-mono text-gray-500 pb-6 border-b border-gray-300">USAGE (MTD)</th>
                        <th className="label-mono text-gray-500 pb-6 border-b border-gray-300 text-right">ACTION</th>
                    </tr>
                </thead>
                <tbody className="body-base text-gray-900">

                    <tr className="group hover:bg-gray-50 transition-colors">
                        <td className="py-8 border-b border-gray-100">
                            <span className="title-3 font-mono tracking-widest block mb-2">ctx_live_9a...<span
                                    className="text-gray-300">e2</span></span>
                            <span className="label-mono text-gray-500">SCOPE: READ_ALL, WRITE_LIMIT</span>
                        </td>
                        <td className="py-8 border-b border-gray-100">
                            <span className="body-base block mb-1">Deloitte Consulting (SI Partner)</span>
                            <span className="body-small text-gray-500">Created Oct 10, 2026</span>
                        </td>
                        <td className="py-8 border-b border-gray-100">
                            <span className="title-3 block mb-1">1.2M Req</span>
                            <div className="w-24 h-1 bg-gray-200">
                                <div className="h-1 bg-black w-[40%]"></div>
                            </div>
                        </td>
                        <td className="py-8 border-b border-gray-100 text-right">
                            <button className="label-mono text-gray-300 hover:text-status-red transition-colors">REVOKE
                                KEY</button>
                        </td>
                    </tr>

                    <tr className="group hover:bg-gray-50 transition-colors">
                        <td className="py-8 border-b border-gray-100">
                            <span className="title-3 font-mono tracking-widest block mb-2">ctx_live_4b...<span
                                    className="text-gray-300">f1</span></span>
                            <span
                                className="label-mono text-status-red border border-status-red px-1 mb-1 inline-block">SCOPE:
                                GLOBAL_ADMIN</span>
                        </td>
                        <td className="py-8 border-b border-gray-100">
                            <span className="body-base block mb-1 flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-status-red"></div><span>Internal Jenkins CI</span>
                            </span>
                            <span className="body-small text-gray-500">Created Jan 1, 2026</span>
                        </td>
                        <td className="py-8 border-b border-gray-100">
                            <span className="title-3 block mb-1">14,202 Req</span>
                            <div className="w-24 h-1 bg-gray-200">
                                <div className="h-1 bg-black w-[5%]"></div>
                            </div>
                        </td>
                        <td className="py-8 border-b border-gray-100 text-right">
                            <button className="label-mono text-gray-300 hover:text-black transition-colors">ROLL
                                KEY</button>
                        </td>
                    </tr>

                </tbody>
            </table>

        </div>

    </main>
    </>
  );
}

export default ApiKeys;
