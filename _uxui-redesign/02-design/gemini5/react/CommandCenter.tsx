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

        /* Terminal-like blink cursor effect */
        .cursor-blink {
            animation: blink 1s step-end infinite;
        }

        @keyframes blink {

            0%,
            100% {
                opacity: 1;
            }

            50% {
                opacity: 0;
            }
        }
`;

function CommandCenter() {
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
                {/* GET /api/workspace/dashboard/summary */}
                <li><a href="/app/dashboard" className="body-base hover:text-gray-500 transition-colors">Dashboard</a></li>
                {/* POST /api/workspace/commands */}
                <li><a href="/app/command-center" className="title-3 font-medium transition-colors">Command Center</a></li>
                {/* GET /api/workspace/chat/sessions */}
                <li><a href="/app/chat" className="body-base hover:text-gray-500 transition-colors">Chat</a></li>
                <li className="pt-6 border-t border-gray-100 mt-6"><a href="/app/trading"
                        className="body-base hover:text-gray-500 transition-colors">Trading</a></li>
                <li><a href="/app/agora" className="body-base hover:text-gray-500 transition-colors">Agora</a></li>
                <li><a href="/app/nexus" className="body-base hover:text-gray-500 transition-colors">Nexus</a></li>
            </ul>
        </div>

        <div className="space-y-6">
            <ul className="space-y-6 pb-6 border-b border-gray-100">
                {/* GET /api/workspace/agents */}
                <li><a href="/app/agents" className="body-small hover:text-black transition-colors">Agents</a></li>
                <li><a href="/app/knowledge" className="body-small hover:text-black transition-colors">Knowledge</a></li>
                {/* GET /api/workspace/dashboard/costs */}
                <li><a href="/app/costs" className="body-small hover:text-black transition-colors">Costs</a></li>
            </ul>
        </div>
    </nav>

    {/* Main Content: Command Interface */}
    <main className="flex-1 flex flex-col h-full bg-white relative">

        {/* Top header, fixed */}
        <header className="p-8 pb-4 absolute top-0 w-full bg-white/90 backdrop-blur z-10 flex justify-between items-center">
            <div>
                <h1 className="title-1 mb-1">Command Vector</h1>
                <p className="label-mono text-gray-500">Awaiting Delegation Target</p>
            </div>
            {/* API: GET /api/workspace/agents (for status) */}
            <div className="flex space-x-8">
                <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-status-green"></span>
                    <span className="label-mono text-black">Secretary Node</span>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-black"></span>
                    <span className="label-mono text-black">Batch Engine</span>
                </div>
            </div>
        </header>

        {/* Command History & Active Operations (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-12 pt-40 pb-48">

            {/* API: GET /api/workspace/commands (History list) */}

            {/* Completed Command Block */}
            <div className="mb-16 border-l-2 border-gray-100 pl-8 pb-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="label-mono text-gray-300">2026-03-10 14:22:01</div>
                    <div className="label-mono text-status-green">Complete / $0.12</div>
                </div>
                {/* Command Input */}
                <div className="title-3 mb-6">"Analyze AAPL Q3 earnings and cross-reference with previous quarter guidance."
                </div>

                {/* Delegation Chain Output (WS: command channel) */}
                <div className="bg-gray-100 p-6 space-y-4">
                    <div className="flex items-start">
                        <span className="label-mono text-gray-500 w-24 flex-shrink-0 pt-1">SYS_O01</span>
                        <p className="body-base">Secretary parsed intent -> Finance Department -> Investment Strategy Team.
                        </p>
                    </div>
                    <div className="flex items-start">
                        <span className="label-mono text-black w-24 flex-shrink-0 pt-1">MGR_FIN</span>
                        <p className="body-base text-gray-500">Allocated tasks to Tech Analyst (Data retrieval) and Risk
                            Manager (Guidance diff).</p>
                    </div>
                    <div className="flex items-start">
                        <span className="label-mono text-black w-24 flex-shrink-0 pt-1">SPL_TCH</span>
                        <p className="body-base text-gray-500">Tool execution: [fetch_sec_filings_10Q: AAPL]. Extracted
                            metrics.</p>
                    </div>
                </div>

                {/* Final Output Reference */}
                <div className="mt-6 flex items-center space-x-4">
                    <button className="label-mono bg-black text-white px-4 py-2 hover:bg-gray-900 transition-colors">View
                        Deep Report [ID: RPT-2026-09A]</button>
                    {/* PATCH /api/workspace/commands/:id/feedback */}
                    <button className="label-mono text-gray-500 hover:text-black transition-colors">Thumbs Up</button>
                    <button className="label-mono text-gray-500 hover:text-black transition-colors">Thumbs Down</button>
                </div>
            </div>

            {/* Active Command Block (Streaming) */}
            <div className="mb-16 border-l-2 border-black pl-8 pb-8 relative">
                {/* Active Indicator */}
                <div className="absolute -left-1 top-0 w-2 h-2 rounded-full bg-black"></div>

                <div className="flex items-center justify-between mb-4">
                    <div className="label-mono text-black">2026-03-10 14:48:15</div>
                    <div className="label-mono text-black animate-pulse">Processing / Estimating...</div>
                </div>
                {/* Command Input */}
                <div className="title-3 mb-6">"Deploy promotional content regarding new trading algorithm to LinkedIn and
                    Twitter."</div>

                {/* Delegation Chain Output (WS: command channel) */}
                <div className="bg-white border border-gray-100 p-6 space-y-4">
                    <div className="flex items-start">
                        <span className="label-mono text-gray-500 w-24 flex-shrink-0 pt-1">SYS_O01</span>
                        <p className="body-base">Secretary analyzing intent...</p>
                    </div>
                    <div className="flex items-start">
                        <span className="label-mono text-black w-24 flex-shrink-0 pt-1">MGR_MKT</span>
                        <p className="body-base font-medium">Drafting variants. Checking platform character limits...</p>
                    </div>
                    <div className="flex items-start">
                        <span className="label-mono text-gray-300 w-24 flex-shrink-0 pt-1">...</span>
                        <p className="body-base text-gray-500 flex items-center"><span
                                className="w-1 h-4 bg-black mr-2 cursor-blink"></span> waiting on tool
                            [sns_publish_validate]</p>
                    </div>
                </div>
            </div>

        </div>

        {/* Sticky Command Input Area */}
        <div className="absolute bottom-0 w-full bg-white p-8 border-t border-gray-100">
            <div className="max-w-4xl mx-auto flex flex-col relative">

                {/* Presets (GET /api/workspace/presets) */}
                <div className="flex space-x-4 mb-4 overflow-x-auto pb-2">
                    <span className="label-mono text-gray-300 py-1">Presets</span>
                    <button
                        className="label-mono text-black hover:bg-gray-100 px-2 py-1 transition-colors border border-transparent">Morning
                        Briefing</button>
                    <button
                        className="label-mono text-black hover:bg-gray-100 px-2 py-1 transition-colors border border-transparent">Sys
                        Health Check</button>
                    <button
                        className="label-mono text-black hover:bg-gray-100 px-2 py-1 transition-colors border border-transparent">Portfolio
                        Rebalance</button>
                </div>

                {/* Main Input (POST /api/workspace/commands) */}
                <div className="relative flex items-center">
                    <span className="absolute left-6 title-2 text-gray-300">/</span>
                    <input type="text"
                        placeholder="Enter command, use @ to mention specific agents, or select a preset..."
                        className="w-full bg-gray-100 text-black py-6 pl-12 pr-32 title-3 focus:outline-none focus:ring-1 focus:ring-black placeholder-gray-500 rounded-none transition-shadow" />
                    <button
                        className="absolute right-4 bg-black text-white px-6 py-3 label-mono hover:bg-gray-900 transition-colors">EXECUTE</button>
                </div>

                {/* Slash Command Hint */}
                <div className="mt-4 flex justify-between">
                    <span className="label-mono text-gray-500">Hit [Enter] to dispatch. Use /debate for Agora engine.</span>
                    <div className="flex space-x-2">
                        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                        <div className="w-2 h-2 rounded-full bg-black"></div>
                    </div>
                </div>

            </div>
        </div>

    </main>
    </>
  );
}

export default CommandCenter;
