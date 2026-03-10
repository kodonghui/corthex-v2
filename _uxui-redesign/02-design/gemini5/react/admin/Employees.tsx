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

function Employees() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
<nav className="w-72 flex flex-col justify-between py-12 px-10 flex-shrink-0 bg-gray-50">
        <div>
            <div className="mb-24 flex items-center">
                <span className="title-2 tracking-tighter">CORTHEX</span>
                <span className="label-mono ml-3 text-status-red bg-red-50 px-2 py-1">ADMIN</span>
            </div>

            <ul className="space-y-10">
                <li><a href="/app/dashboard" className="body-base text-gray-500 hover:text-black transition-colors">Platform
                        Overview</a></li>
                <li className="space-y-6">
                    <span className="label-mono text-gray-300 block mb-4">PLATFORM ROSTER</span>
                    <ul className="space-y-6 pl-4">
                        {/* GET /api/admin/employees */}
                        <li><a href="/app/employees" className="title-3 transition-colors">Internal Staff</a></li>
                        <li><a href="/app/users"
                                className="body-base text-gray-500 hover:text-black transition-colors">Tenant Users</a></li>
                    </ul>
                </li>
                <li className="space-y-6 pt-4">
                    <span className="label-mono text-gray-300 block mb-4">ACCESS</span>
                    <ul className="space-y-6 pl-4">
                        <li><a href="/app/credentials"
                                className="body-base text-gray-500 hover:text-black transition-colors">System
                                Credentials</a></li>
                        <li><a href="/app/api-keys"
                                className="body-base text-gray-500 hover:text-black transition-colors">Platform API Keys</a>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
    </nav>

    <main className="flex-1 overflow-y-auto p-16 lg:p-32 bg-white">

        <header className="mb-32 flex justify-between items-end border-b border-black pb-8">
            <div>
                <h1 className="title-display mb-6">Corthex Staff</h1>
                <p className="body-base max-w-2xl text-gray-500">
                    Directory of CORTHEX internal employees holding super-admin or support access levels.
                </p>
            </div>
            <button className="bg-black text-white px-8 py-3 label-mono hover:bg-gray-900 transition-colors">PROVISION
                ACCOUNT</button>
        </header>

        <div className="table w-full">
            <div className="table-row label-mono text-gray-300">
                <div className="table-cell pb-8">NAME & EMAIL</div>
                <div className="table-cell pb-8">ROLE</div>
                <div className="table-cell pb-8">LAST ACTIVE</div>
                <div className="table-cell pb-8 text-right">ACTION</div>
            </div>

            {/* List (GET /api/admin/employees) */}
            <div className="table-row group">
                <div className="table-cell py-8 border-t border-gray-100 align-middle">
                    <div className="flex items-center space-x-6">
                        <div className="w-12 h-12 bg-gray-50 flex items-center justify-center font-bold">K</div>
                        <div>
                            <span className="title-3 block mb-1">Kim, System Admin</span>
                            <span className="body-small text-gray-500">admin@corthex.com</span>
                        </div>
                    </div>
                </div>
                <div className="table-cell py-8 border-t border-gray-100 align-middle">
                    <span className="label-mono text-status-red border border-status-red px-2 py-1">ROOT</span>
                </div>
                <div className="table-cell py-8 border-t border-gray-100 align-middle body-base text-gray-500">
                    Currently Online
                </div>
                <div className="table-cell py-8 border-t border-gray-100 align-middle text-right">
                    <button className="label-mono text-gray-300 hover:text-black transition-colors">REVOKE</button>
                </div>
            </div>

            <div className="table-row group">
                <div className="table-cell py-8 border-t border-gray-100 align-middle">
                    <div className="flex items-center space-x-6">
                        <div className="w-12 h-12 bg-gray-50 flex items-center justify-center font-bold">L</div>
                        <div>
                            <span className="title-3 block mb-1">Lee, Support Escalation</span>
                            <span className="body-small text-gray-500">lee.support@corthex.com</span>
                        </div>
                    </div>
                </div>
                <div className="table-cell py-8 border-t border-gray-100 align-middle">
                    <span className="label-mono text-black border border-black px-2 py-1">L2 SUPPORT</span>
                </div>
                <div className="table-cell py-8 border-t border-gray-100 align-middle body-base text-gray-500">
                    2 hours ago
                </div>
                <div className="table-cell py-8 border-t border-gray-100 align-middle text-right">
                    <button className="label-mono text-gray-300 hover:text-black transition-colors">REVOKE</button>
                </div>
            </div>

            {/* Suspended / Revoked Access */}
            <div className="table-row group opacity-40">
                <div className="table-cell py-8 border-t border-gray-100 align-middle">
                    <div className="flex items-center space-x-6">
                        <div className="w-12 h-12 bg-gray-50 flex items-center justify-center font-bold">P</div>
                        <div className="line-through text-gray-500">
                            <span className="title-3 block mb-1">Park, QA Ops</span>
                            <span className="body-small">park.qa@corthex.com</span>
                        </div>
                    </div>
                </div>
                <div className="table-cell py-8 border-t border-gray-100 align-middle">
                    <span className="label-mono text-gray-500 border border-gray-300 px-2 py-1">QA TEST</span>
                </div>
                <div className="table-cell py-8 border-t border-gray-100 align-middle body-small text-gray-500">
                    Revoked: Oct 1, 2026
                </div>
                <div className="table-cell py-8 border-t border-gray-100 align-middle text-right">
                    <button className="label-mono text-black">RESTORE</button>
                </div>
            </div>

        </div>

    </main>
    </>
  );
}

export default Employees;
