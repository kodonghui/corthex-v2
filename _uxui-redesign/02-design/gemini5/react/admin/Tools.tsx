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

function Tools() {
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
                <li className="space-y-6 pt-4">
                    <span className="label-mono text-gray-300 block mb-4">AGENT REGISTRY</span>
                    <ul className="space-y-6 pl-4">
                        <li><a href="/app/agents"
                                className="body-base text-gray-500 hover:text-black transition-colors">System Agents</a>
                        </li>
                        <li><a href="/app/soul-templates"
                                className="body-base text-gray-500 hover:text-black transition-colors">Soul Templates</a>
                        </li>
                        {/* GET /api/admin/tools */}
                        <li><a href="/app/tools" className="title-3 transition-colors">Tool Functions</a></li>
                    </ul>
                </li>
            </ul>
        </div>
    </nav>

    <main className="flex-1 overflow-y-auto p-16 lg:p-32 bg-white">

        <header className="mb-32 flex justify-between items-end border-b border-black pb-8">
            <div>
                <h1 className="title-display mb-6">Tool Schema Registry</h1>
                <p className="body-base max-w-2xl text-gray-500">
                    Master list of all executable functions (tools) that can be bound to agents. Describes JSON schemas,
                    required clearances, and execution environments.
                </p>
            </div>
            {/* POST /api/admin/tools */}
            <button className="bg-black text-white px-8 py-4 label-mono hover:bg-gray-900 transition-colors">REGISTER
                FUNCTION</button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-24">

            {/* Tool Item */}
            <div className="flex flex-col">
                <div className="mb-8 border-b border-black pb-4 flex justify-between items-end">
                    <h2 className="title-2 tracking-tight">core_search</h2>
                    <span className="label-mono text-black bg-gray-100 px-2 py-1">T-0</span>
                </div>
                <p className="body-sm text-gray-500 mb-8 flex-1">
                    Execute semantic vector search over the tenant's RAG knowledge base. Allows bounding by namespace
                    array.
                </p>
                <div className="bg-gray-50 p-6 font-mono text-sm text-gray-500 border border-gray-100 mb-8 break-all">
                    IN: { "query": string, "namespaces": string[] }<br />
                    OUT: { "results": Document[] }
                </div>
                <div className="flex justify-between items-center text-label-mono text-gray-500">
                    <span>Usage: 142k / mo</span>
                    <button
                        className="hover:text-black transition-colors border-b border-transparent hover:border-black pb-1">VIEW
                        SCHEMA</button>
                </div>
            </div>

            {/* Tool Item */}
            <div className="flex flex-col">
                <div className="mb-8 border-b border-black pb-4 flex justify-between items-end">
                    <h2 className="title-2 tracking-tight">delegate_task</h2>
                    <span className="label-mono text-status-red border border-status-red px-2 py-1">ROOT ONLY</span>
                </div>
                <p className="body-sm text-gray-500 mb-8 flex-1">
                    Spawns a child agent thread with a specific context and task. Only Secretary General has native
                    clearance.
                </p>
                <div className="bg-gray-50 p-6 font-mono text-sm text-gray-500 border border-gray-100 mb-8 break-all">
                    IN: { "target_agent": id, "task": string }<br />
                    OUT: { "completion_status": enum, "result": string }
                </div>
                <div className="flex justify-between items-center text-label-mono text-gray-500">
                    <span>Usage: 2.1M / mo</span>
                    <button
                        className="hover:text-black transition-colors border-b border-transparent hover:border-black pb-1">VIEW
                        SCHEMA</button>
                </div>
            </div>

            {/* Tool Item */}
            <div className="flex flex-col">
                <div className="mb-8 border-b border-black pb-4 flex justify-between items-end">
                    <h2 className="title-2 tracking-tight">fetch_kis_account</h2>
                    <span className="label-mono text-black bg-gray-100 px-2 py-1">T-1</span>
                </div>
                <p className="body-sm text-gray-500 mb-8 flex-1">
                    Wrapper for Korea Investment & Securities API. Returns current portfolio holdings and cash balance.
                    Requires tenant to have valid KIS credentials mapped.
                </p>
                <div className="bg-gray-50 p-6 font-mono text-sm text-gray-500 border border-gray-100 mb-8 break-all">
                    IN: {}<br />
                    OUT: { "holdings": Asset[], "cash": USD }
                </div>
                <div className="flex justify-between items-center text-label-mono text-gray-500">
                    <span>Usage: 840 / mo</span>
                    <button
                        className="hover:text-black transition-colors border-b border-transparent hover:border-black pb-1">VIEW
                        SCHEMA</button>
                </div>
            </div>

        </div>

    </main>
    </>
  );
}

export default Tools;
