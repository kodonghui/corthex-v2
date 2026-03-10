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

function Agents() {
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
                    <span className="label-mono text-gray-300 block mb-4">TENANT MANAGEMENT</span>
                    <ul className="space-y-6 pl-4">
                        <li><a href="/app/companies"
                                className="body-base text-gray-500 hover:text-black transition-colors">Companies</a></li>
                        <li><a href="/app/users"
                                className="body-base text-gray-500 hover:text-black transition-colors">Global Users</a></li>
                    </ul>
                </li>
                <li className="space-y-6 pt-4">
                    <span className="label-mono text-gray-300 block mb-4">AGENT REGISTRY</span>
                    <ul className="space-y-6 pl-4">
                        {/* GET /api/admin/agents */}
                        <li><a href="/app/agents" className="title-3 transition-colors">System Agents</a></li>
                        <li><a href="/app/soul-templates"
                                className="body-base text-gray-500 hover:text-black transition-colors">Soul Templates</a>
                        </li>
                        <li><a href="/app/tools" className="body-base text-gray-500 hover:text-black transition-colors">Tool
                                Functions</a></li>
                    </ul>
                </li>
            </ul>
        </div>
    </nav>

    {/* Main Content */}
    <main className="flex-1 flex overflow-hidden">

        {/* Agents Master List */}
        <div className="w-[480px] border-r border-gray-100 flex flex-col bg-white">
            <div className="p-16 pb-8">
                <h1 className="title-display mb-12">Registry</h1>
                <input type="text" placeholder="Search global agents..."
                    className="w-full text-3xl font-light placeholder-gray-300 border-none focus:outline-none focus:ring-0 mb-8" />

                <div className="flex space-x-8">
                    <button className="label-mono text-black font-bold">ALL <span
                            className="text-gray-300 font-normal ml-1">128</span></button>
                    <button className="label-mono text-gray-500 hover:text-black transition-colors">CORE <span
                            className="text-gray-300 font-normal ml-1">12</span></button>
                    <button className="label-mono text-gray-500 hover:text-black transition-colors">COMMUNITY <span
                            className="text-gray-300 font-normal ml-1">116</span></button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-16">

                <div className="p-8 hover:bg-gray-50 cursor-pointer transition-colors group">
                    <div className="flex justify-between items-start mb-4">
                        <span className="label-mono bg-gray-100 px-2 py-1 text-black">SYS_CORE</span>
                        <span className="label-mono text-status-green flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-status-green"></div>V 2.1.0
                        </span>
                    </div>
                    <h3 className="title-2 mb-2">Secretary General</h3>
                    <p className="body-small text-gray-500 line-clamp-2">Root orchestrator. Handles user intent routing and
                        macro-level delegation. Available to all tenants by default.</p>
                </div>

                <div className="p-8 hover:bg-gray-50 cursor-pointer transition-colors group">
                    <div className="flex justify-between items-start mb-4">
                        <span className="label-mono bg-gray-100 px-2 py-1 text-black">DEPT_MGR</span>
                        <span className="label-mono text-status-green flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-status-green"></div>V 1.4.2
                        </span>
                    </div>
                    <h3 className="title-2 mb-2">Chief Investment Officer</h3>
                    <p className="body-small text-gray-500 line-clamp-2">Manages portfolio strategy, calls trading APIs,
                        evaluates risk models.</p>
                </div>

                <div className="p-8 hover:bg-gray-50 cursor-pointer transition-colors group opacity-50 hover:opacity-100">
                    <div className="flex justify-between items-start mb-4">
                        <span className="label-mono border border-gray-300 px-2 py-1 text-gray-500">COMMUNITY</span>
                        <span className="label-mono text-gray-500 flex items-center space-x-2">BETA</span>
                    </div>
                    <h3 className="title-2 mb-2">Crypto Arbitrage Scanner</h3>
                    <p className="body-small text-gray-500 line-clamp-2">High frequency token pair scanner. Authored by
                        @quant_dev.</p>
                </div>

            </div>
        </div>

        {/* Agent Detail View */}
        {/* GET /api/admin/agents/:id */}
        <div className="flex-1 overflow-y-auto p-16 lg:p-32 bg-white">

            <div className="max-w-3xl">

                <div className="flex justify-between items-center mb-16">
                    <span className="label-mono text-gray-500">AGENT ID: AGT-SYS-001</span>
                    <button className="label-mono bg-black text-white px-6 py-3 hover:bg-gray-900 transition-colors">EDIT
                        SPECIFICATION</button>
                </div>

                <h2 className="title-display mb-8 tracking-tighter">Secretary General</h2>

                <p className="title-3 text-gray-500 leading-relaxed mb-24 max-w-2xl font-normal">
                    The highest-level orchestration agent. Instantiated once per tenant. Responsible for semantic
                    routing of user queries to appropriate department managers.
                </p>

                <div className="grid grid-cols-2 gap-24 mb-32">
                    <div>
                        <span className="label-mono text-gray-300 block mb-6">DEFAULT ENGINE</span>
                        <span className="title-2">Claude 3.5 Sonnet</span>
                    </div>
                    <div>
                        <span className="label-mono text-gray-300 block mb-6">CONTEXT WINDOW</span>
                        <span className="title-2">200K Tokens</span>
                    </div>
                    <div>
                        <span className="label-mono text-gray-300 block mb-6">TIER</span>
                        <span className="title-2">Tier 0 (Root)</span>
                    </div>
                    <div>
                        <span className="label-mono text-gray-300 block mb-6">TENANT ADOPTION</span>
                        <span className="title-2">100% (Mandatory)</span>
                    </div>
                </div>

                {/* Bound Tools */}
                <div className="mb-32">
                    <h3 className="title-1 mb-12">Authorized Tools</h3>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                            <span className="title-3">delegate_task</span>
                            <span className="label-mono text-gray-500">CORE SYSTEM</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                            <span className="title-3">system_query_rag</span>
                            <span className="label-mono text-gray-500">VECTOR DB</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                            <span className="title-3">evaluate_quality_gate</span>
                            <span className="label-mono text-gray-500">LOGIC</span>
                        </div>
                    </div>
                </div>

                {/* Base Prompt Template */}
                <div>
                    <h3 className="title-1 mb-12">Base Soul Template</h3>
                    <div className="bg-gray-50 p-12 whitespace-pre-wrap font-mono body-base text-gray-900 leading-relaxed">
                        You are the Secretary General for {{tenant_name}}.
                        Your role is to orchestrate, not to execute directly.
                        When you receive a user directive:
                        1. Identify the domain.
                        2. Formulate a sub-task.
                        3. Call `delegate_task` to the appropriate Tier 1 Manager.
                        4. If no manager exists for the domain, inform the user or request the creation of a new
                        department.</div>
                </div>

            </div>

        </div>

    </main>
    </>
  );
}

export default Agents;
