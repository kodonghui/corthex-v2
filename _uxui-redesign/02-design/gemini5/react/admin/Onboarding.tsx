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

function Onboarding() {
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
                        <li><a href="/app/users"
                                className="body-base text-gray-500 hover:text-black transition-colors">Global Users</a></li>
                        {/* GET /api/admin/onboarding */}
                        <li><a href="/app/onboarding" className="title-3 transition-colors">Onboarding Queue</a></li>
                    </ul>
                </li>
            </ul>
        </div>
    </nav>

    <main className="flex-1 overflow-y-auto p-16 lg:p-32 bg-white flex flex-col">

        <header className="mb-24 flex justify-between items-end border-b border-black pb-8">
            <div>
                <h1 className="title-display mb-6">Tenant Onboarding</h1>
                <p className="body-base max-w-2xl text-gray-500">
                    Review and approve enterprise workspaces pending initialization. Map them to physical hardware
                    shards.
                </p>
            </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">

            {/* Pending Item */}
            <div className="border border-black p-12 relative group cursor-pointer bg-white">
                <div className="absolute top-0 right-0 bg-black text-white px-4 py-2 label-mono">NEW (2H AGO)</div>
                <h2 className="title-1 mb-2 tracking-tight">Umbrella Corp</h2>
                <p className="label-mono text-gray-500 mb-12">DOMAIN: umbrella.net</p>

                <div className="space-y-4 mb-12 bg-gray-50 p-6 border border-gray-100">
                    <div className="flex justify-between">
                        <span className="body-small text-gray-500">Requested Tier</span>
                        <span className="body-small text-black font-mono">ENTERPRISE</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="body-small text-gray-500">Initial Seat Count</span>
                        <span className="body-small text-black font-mono">1,500</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="body-small text-gray-500">Custom Data Egress</span>
                        <span className="body-small text-black font-mono">YES</span>
                    </div>
                </div>

                <div className="flex space-x-4">
                    <button
                        className="flex-1 bg-black text-white py-4 label-mono hover:bg-gray-900 transition-colors border border-black">PROVISION
                        DB SHARD</button>
                    <button
                        className="label-mono text-status-red px-6 hover:bg-red-50 transition-colors border border-status-red">REJECT</button>
                </div>
            </div>

            {/* Provisioning Item */}
            <div className="border border-gray-200 p-12 relative group cursor-pointer bg-gray-50 opacity-80">
                <div className="absolute top-0 right-0 bg-gray-200 text-gray-500 px-4 py-2 label-mono">INITIALIZING...</div>
                <h2 className="title-1 mb-2 tracking-tight">Stark Industries</h2>
                <p className="label-mono text-gray-500 mb-12">DOMAIN: stark.com</p>

                <div className="mb-12">
                    <span className="label-mono text-black block mb-2">PROGRESS: MIGRATING VECTORS</span>
                    <div className="w-full h-2 bg-gray-200">
                        <div className="h-2 bg-black w-[40%] animate-pulse"></div>
                    </div>
                </div>

                <div className="flex space-x-4">
                    <button
                        className="flex-1 bg-transparent text-gray-500 py-4 label-mono border border-gray-300 cursor-not-allowed">DB
                        PROVISIONED</button>
                </div>
            </div>

        </div>

    </main>
    </>
  );
}

export default Onboarding;
