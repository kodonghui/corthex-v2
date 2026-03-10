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

function Workflows() {
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
                    <span className="label-mono text-gray-300 block mb-4">SYSTEM</span>
                    <ul className="space-y-6 pl-4">
                        <li><a href="/app/settings"
                                className="body-base text-gray-500 hover:text-black transition-colors">Global Settings</a>
                        </li>
                        {/* GET /api/admin/workflows */}
                        <li><a href="/app/workflows" className="title-3 transition-colors">System Workflows</a></li>
                    </ul>
                </li>
            </ul>
        </div>
    </nav>

    <main className="flex-1 overflow-y-auto p-16 lg:p-32 bg-white flex flex-col">

        <header className="mb-32 flex justify-between items-end border-b border-black pb-8">
            <div>
                <h1 className="title-display mb-6">Internal Workflows</h1>
                <p className="body-base max-w-2xl text-gray-500">
                    Cron jobs, data migrations, and automated tenant management scripts running on the management plane.
                </p>
            </div>
            <button className="bg-black text-white px-8 py-4 label-mono hover:bg-gray-900 transition-colors">AUTHOR
                WORKFLOW</button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-24">

            <div className="border border-black p-10 bg-gray-50 flex items-start flex-col">
                <div className="w-full flex justify-between items-center mb-6">
                    <span className="label-mono text-black">SCHED: @DAILY 00:00 UTC</span>
                    <div className="w-12 h-6 bg-black rounded-full relative cursor-pointer">
                        <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                    </div>
                </div>

                <h2 className="title-2 mb-4 tracking-tight">Billing Aggregator (Stripe Sync)</h2>
                <p className="body-small text-gray-500 mb-8 max-w-sm">Calculates token usage for all 42 tenants via
                    ClickHouse telemetry and pushes draft invoices to Stripe.</p>

                <div
                    className="mt-auto w-full pt-6 border-t border-black flex justify-between items-center text-label-mono text-gray-500">
                    <span>Last Run: 8h ago (Success)</span>
                    <button className="hover:text-black hover:underline">VIEW LOGS</button>
                </div>
            </div>

            <div
                className="border border-gray-200 hover:border-black transition-colors p-10 bg-white flex items-start flex-col">
                <div className="w-full flex justify-between items-center mb-6">
                    <span className="label-mono text-gray-500">EVENT: TENANT.ONBOARDED</span>
                    <div className="w-12 h-6 bg-black rounded-full relative cursor-pointer">
                        <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                    </div>
                </div>

                <h2 className="title-2 mb-4 tracking-tight">Auto-Provision DB Shard & Agent Prefabs</h2>
                <p className="body-small text-gray-500 mb-8 max-w-sm">When an admin approves a tenant, allocate a vector
                    namespace, initialize root user, and clone base system agents.</p>

                <div
                    className="mt-auto w-full pt-6 border-t border-gray-200 flex justify-between items-center text-label-mono text-gray-500">
                    <span>Executions: 42</span>
                    <button className="hover:text-black border-b border-transparent hover:border-black pb-0.5">EDIT
                        SCRIPT</button>
                </div>
            </div>

            <div
                className="border border-status-red hover:bg-red-50/10 transition-colors p-10 bg-white flex items-start flex-col group">
                <div className="w-full flex justify-between items-center mb-6">
                    <span className="label-mono text-status-red">EVENT: BUGET.EXCEEDED(100%)</span>
                    <div className="w-12 h-6 bg-status-red rounded-full relative cursor-pointer">
                        <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                    </div>
                </div>

                <h2 className="title-2 mb-4 tracking-tight text-status-red">Halt Non-Essential Tier API</h2>
                <p className="body-small text-gray-500 mb-8 max-w-sm">Automatically revokes API keys and places all non-T0
                    agents into sleeper state until billing resolves.</p>

                <div
                    className="mt-auto w-full pt-6 border-t border-status-red flex justify-between items-center text-label-mono text-gray-500">
                    <span>Triggered 4 times</span>
                    <button className="text-status-red hover:underline">EDIT SCRIPT</button>
                </div>
            </div>

        </div>

    </main>
    </>
  );
}

export default Workflows;
