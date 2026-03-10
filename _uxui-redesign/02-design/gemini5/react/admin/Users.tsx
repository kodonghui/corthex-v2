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

function Users() {
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
                        <li><a href="/app/companies"
                                className="body-base text-gray-500 hover:text-black transition-colors">Companies</a></li>
                        {/* GET /api/admin/users */}
                        <li><a href="/app/users" className="title-3 transition-colors">Global Users</a></li>
                    </ul>
                </li>
            </ul>
        </div>
    </nav>

    <main className="flex-1 overflow-y-auto p-16 lg:p-32 bg-white flex flex-col">

        <header className="mb-32 flex justify-between items-end border-b border-black pb-8">
            <div className="w-2/3">
                <h1 className="title-display mb-6">Global User Directory</h1>
                <input type="text" placeholder="Search by email, name, or UUID across all 42 tenants..."
                    className="w-full title-3 font-light placeholder-gray-300 border-none focus:outline-none focus:ring-0" />
            </div>
        </header>

        <div className="flex-1 min-h-0 bg-white">

            <table className="w-full text-left">
                <thead>
                    <tr>
                        <th className="label-mono text-gray-500 pb-6 border-b border-gray-300">USER</th>
                        <th className="label-mono text-gray-500 pb-6 border-b border-gray-300">TENANT</th>
                        <th className="label-mono text-gray-500 pb-6 border-b border-gray-300">ROLE</th>
                        <th className="label-mono text-gray-500 pb-6 border-b border-gray-300">LAST LOGIN</th>
                        <th className="label-mono text-gray-500 pb-6 border-b border-gray-300 text-right">GLOBAL AUDIT</th>
                    </tr>
                </thead>
                <tbody className="body-base text-gray-900">

                    <tr className="group hover:bg-gray-50 cursor-pointer transition-colors">
                        <td className="py-6 border-b border-gray-100">
                            <span className="title-3 block mb-1">Jane Doe</span>
                            <span className="body-small text-gray-500 font-mono">jane.doe@acme.co</span>
                        </td>
                        <td className="py-6 border-b border-gray-100">
                            <a href="/app/companies"
                                className="label-mono text-black border-b border-black hover:text-gray-500 hover:border-gray-500 pb-0.5">ACME
                                CORP</a>
                        </td>
                        <td className="py-6 border-b border-gray-100">
                            <span className="label-mono border border-black px-2 py-1">TENANT_ADMIN</span>
                        </td>
                        <td className="py-6 border-b border-gray-100 body-small text-gray-500">
                            2 hours ago (IP: 192.168.1.1)
                        </td>
                        <td className="py-6 border-b border-gray-100 text-right">
                            <button className="label-mono text-gray-300 hover:text-black transition-colors">VIEW LOGS
                                -></button>
                        </td>
                    </tr>

                    <tr className="group hover:bg-gray-50 cursor-pointer transition-colors">
                        <td className="py-6 border-b border-gray-100">
                            <span className="title-3 block mb-1">Mark Zuckerberg</span>
                            <span className="body-small text-gray-500 font-mono">mz@meta.com</span>
                        </td>
                        <td className="py-6 border-b border-gray-100">
                            <a href="/app/companies"
                                className="label-mono text-black border-b border-black hover:text-gray-500 hover:border-gray-500 pb-0.5">META</a>
                        </td>
                        <td className="py-6 border-b border-gray-100">
                            <span className="label-mono border border-gray-300 px-2 py-1 text-gray-500">USER</span>
                        </td>
                        <td className="py-6 border-b border-gray-100 body-small text-gray-500">
                            12 days ago (IP: 10.0.0.5)
                        </td>
                        <td className="py-6 border-b border-gray-100 text-right">
                            <button className="label-mono text-gray-300 hover:text-black transition-colors">VIEW LOGS
                                -></button>
                        </td>
                    </tr>

                </tbody>
            </table>

            <div className="mt-12 text-center">
                <button className="label-mono text-gray-500 hover:text-black transition-colors">LOAD MORE RESULTS</button>
            </div>

        </div>

    </main>
    </>
  );
}

export default Users;
