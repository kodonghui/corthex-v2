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
{/* Global Nav */}
    <nav className="w-64 border-r border-gray-100 flex flex-col justify-between py-8 px-6 flex-shrink-0">
        <div>
            <div className="mb-16">
                <span className="title-2 tracking-tighter">CORTHEX</span>
                <span className="label-mono ml-2">v2</span>
            </div>

            <ul className="space-y-6">
                <li><a href="/app/home" className="body-base hover:text-gray-500 transition-colors">Home</a></li>
                <li><a href="/app/dashboard" className="body-base hover:text-gray-500 transition-colors">Dashboard</a></li>
                <li><a href="/app/command-center" className="body-base hover:text-gray-500 transition-colors">Command
                        Center</a></li>
                <li><a href="/app/chat" className="body-base hover:text-gray-500 transition-colors">Chat</a></li>
                <li><a href="/app/trading" className="body-base hover:text-gray-500 transition-colors">Trading</a></li>
                <li><a href="/app/agora" className="body-base hover:text-gray-500 transition-colors">Agora</a></li>
                <li><a href="/app/nexus" className="body-base hover:text-gray-500 transition-colors">Nexus</a></li>
            </ul>
        </div>

        <div className="space-y-6">
            <ul className="space-y-6 pb-6 border-b border-gray-100">
                {/* GET /api/workspace/agents */}
                <li><a href="/app/agents" className="title-3 font-medium transition-colors">Agents</a></li>
                {/* GET /api/workspace/departments (implicit from PRD dynamic org) */}
                <li><a href="/app/departments"
                        className="body-small hover:text-black transition-colors pl-4">Departments</a></li>
                <li><a href="/app/knowledge" className="body-small hover:text-black transition-colors mt-4">Knowledge</a>
                </li>
                <li><a href="/app/costs" className="body-small hover:text-black transition-colors">Costs</a></li>
            </ul>
        </div>
    </nav>

    {/* Main Content: Agent Management */}
    <main className="flex-1 flex overflow-hidden">

        {/* Left: Agent Roster */}
        {/* API: GET /api/workspace/agents */}
        <div className="w-1/3 min-w-[320px] max-w-sm border-r border-gray-100 flex flex-col bg-white">
            <div className="p-8 pb-4">
                <h2 className="title-2 mb-6">Personnel</h2>
                {/* Search input */}
                <input type="text" placeholder="Search agents by name or role..."
                    className="w-full bg-gray-50 border-b border-gray-300 py-3 text-sm focus:outline-none focus:border-black mb-6" />

                <div className="flex space-x-4 mb-2">
                    <button className="label-mono text-black border-b border-black pb-1">ALL</button>
                    <button className="label-mono text-gray-300 hover:text-black transition-colors pb-1">MANAGERS</button>
                    <button
                        className="label-mono text-gray-300 hover:text-black transition-colors pb-1">SPECIALISTS</button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <ul className="divide-y divide-gray-100">
                    <li className="p-6 cursor-pointer bg-gray-50 border-l-[3px] border-black">
                        <div className="flex justify-between items-start mb-2">
                            <span className="label-mono text-gray-900">SYSTEM / ROOT</span>
                            <span className="w-2 h-2 rounded-full bg-status-green"></span>
                        </div>
                        <h4 className="title-3 font-semibold mb-1">Secretary / Editor</h4>
                        <div className="body-small text-gray-500">Claude 3.5 Sonnet</div>
                    </li>
                    <li className="p-6 cursor-pointer hover:bg-gray-50 transition-colors border-l-[3px] border-transparent">
                        <div className="flex justify-between items-start mb-2">
                            <span className="label-mono text-gray-500">MANAGER / STRATEGY</span>
                            <span className="w-2 h-2 rounded-full bg-status-green"></span>
                        </div>
                        <h4 className="title-3 font-semibold mb-1 text-gray-500">Chief Investment Officer</h4>
                        <div className="body-small text-gray-300">Claude 3.5 Sonnet</div>
                    </li>
                    <li className="p-6 cursor-pointer hover:bg-gray-50 transition-colors border-l-[3px] border-transparent">
                        <div className="flex justify-between items-start mb-2">
                            <span className="label-mono text-gray-500">SPECIALIST / MKTG</span>
                            <span className="w-2 h-2 rounded-full bg-black"></span>
                        </div>
                        <h4 className="title-3 font-semibold mb-1 text-gray-500">Content Strategist</h4>
                        <div className="body-small text-gray-300">Claude 3.0 Haiku</div>
                    </li>
                </ul>
            </div>
        </div>

        {/* Right: Agent Detail & Soul Editor */}
        {/* API: GET /api/workspace/agents/:id */}
        <div className="flex-1 overflow-y-auto bg-white p-12 lg:p-24">

            <header className="mb-16 border-b border-black pb-12 flex justify-between items-end">
                <div className="max-w-xl">
                    <div className="label-mono text-gray-500 mb-4 flex items-center space-x-2">
                        <span>SYSTEM AGENT</span>
                        <span>/</span>
                        <span className="text-status-green flex items-center gap-2"><span
                                className="w-1.5 h-1.5 bg-status-green rounded-full"></span>ONLINE</span>
                    </div>
                    <h1 className="title-1 mb-4">Secretary General</h1>
                    <p className="body-base text-gray-500">Core routing and orchestration agent. Evaluates initial user
                        input and delegates tasks down the hierarchy. Cannot be reassigned or deleted.</p>
                </div>
                {/* API: GET /api/workspace/dashboard/costs/by-agent (filtered) */}
                <div className="text-right">
                    <span className="label-mono text-gray-300 block mb-2">LIFETIME COST</span>
                    <span className="title-2">$42.15</span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">

                {/* Agent Configuration */}
                <section>
                    <h3 className="label-mono text-black mb-8">Agent Parameters</h3>

                    <div className="space-y-8">
                        <div>
                            <label className="label-mono text-gray-300 block mb-2">Display Name</label>
                            <input type="text" value="Secretary General" readOnly className="w-full bg-transparent border-b border-gray-100 py-3 title-3 text-black focus:outline-none focus:border-black transition-colors" />
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <label className="label-mono text-gray-300 block mb-2">Tier Level</label>
                                <select
                                    className="w-full bg-transparent border-b border-gray-100 py-3 body-base text-black focus:outline-none appearance-none rounded-none"
                                    disabled>
                                    <option>Manager (Tier 1)</option>
                                </select>
                            </div>
                            <div>
                                <label className="label-mono text-gray-300 block mb-2">LLM Engine</label>
                                <select
                                    className="w-full bg-transparent border-b border-gray-100 py-3 body-base text-black focus:outline-none appearance-none rounded-none">
                                    <option>Claude 3.5 Sonnet</option>
                                    <option>GPT-4o</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="label-mono text-gray-300 block mb-2">Tool Clearances (Allowed Tools)</label>
                            <div className="flex flex-wrap gap-2 mt-4">
                                <span className="px-3 py-1 bg-gray-100 body-small text-black">core_search</span>
                                <span className="px-3 py-1 bg-gray-100 body-small text-black">delegate_task</span>
                                <span className="px-3 py-1 bg-gray-100 body-small text-black">quality_gate_eval</span>
                                <button
                                    className="px-3 py-1 border border-gray-300 body-small text-gray-500 hover:text-black hover:border-black transition-colors">+
                                    Add Clearance</button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Soul (System Prompt) Editor */}
                {/* API: PATCH /api/workspace/agents/:id/soul */}
                <section>
                    <div className="flex justify-between items-end mb-8">
                        <h3 className="label-mono text-black">Identity / System Prompt</h3>
                        <button className="label-mono text-gray-500 hover:text-black transition-colors">Reset to
                            Default</button>
                    </div>

                    <div className="relative">
                        <textarea
                            className="w-full h-[500px] border border-gray-100 bg-gray-50 p-6 body-base text-gray-900 font-mono focus:outline-none focus:border-black transition-colors resize-none leading-relaxed">You are the Secretary General, the highest-ranking orchestration agent in the CORTHEX v2 environment. 

Your primary directive is to receive commands from the CEO (user), analyze the intent, and delegate tasks to the appropriate department managers.

1. Do NOT execute final operations yourself.
2. ALWAYS use the `delegate_task` tool to assign sub-tasks.
3. Upon receiving results from subordinate agents, you must evaluate them against the system quality gate.
4. Maintain a formal, highly concise, and executive tone.</textarea>

                        {/* Floating Action Bar */}
                        <div className="absolute bottom-6 right-6 flex space-x-4">
                            <span className="label-mono text-status-green bg-white py-2 opacity-0 transition-opacity"
                                id="saveHint">SAVED</span>
                            <button
                                className="bg-black text-white px-6 py-3 label-mono hover:bg-gray-900 transition-colors">UPDATE
                                SOUL</button>
                        </div>
                    </div>
                </section>

            </div>

        </div>

    </main>
    </>
  );
}

export default Agents;
