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

function Chat() {
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
                <li><a href="/app/command-center" className="body-base hover:text-gray-500 transition-colors">Command
                        Center</a></li>
                {/* GET /api/workspace/chat/sessions */}
                <li><a href="/app/chat" className="title-3 font-medium transition-colors">Chat</a></li>
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

    {/* Session Sidebar */}
    <aside className="w-80 border-r border-gray-100 flex flex-col bg-white flex-shrink-0">
        <div className="p-8 border-b border-gray-100">
            {/* POST /api/workspace/chat/sessions */}
            <button className="w-full bg-black text-white py-3 label-mono hover:bg-gray-900 transition-colors">NEW
                SESSION</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {/* API: GET /api/workspace/chat/sessions */}
            <div className="p-4 bg-gray-100 cursor-pointer">
                <span className="label-mono text-gray-500 mb-1 block">Strategy Dept / CIO</span>
                <h4 className="body-base font-medium truncate">Q3 Portfolio Review</h4>
                <div className="mt-2 text-label-mono text-gray-300">10 mins ago</div>
            </div>
            <div className="p-4 hover:bg-gray-100 cursor-pointer transition-colors border border-transparent">
                <span className="label-mono text-gray-500 mb-1 block">Marketing Dept</span>
                <h4 className="body-base font-medium truncate text-gray-500">Drafting SNS Copy</h4>
                <div className="mt-2 text-label-mono text-gray-300">2 hours ago</div>
            </div>
            <div className="p-4 hover:bg-gray-100 cursor-pointer transition-colors border border-transparent">
                <span className="label-mono text-gray-500 mb-1 block">Legal Dept</span>
                <h4 className="body-base font-medium truncate text-gray-500">Contract Review: Vendor X</h4>
                <div className="mt-2 text-label-mono text-gray-300">Yesterday</div>
            </div>
        </div>
    </aside>

    {/* Chat Area */}
    <main className="flex-1 flex flex-col h-full bg-white relative">

        <header className="p-8 border-b border-gray-100 flex justify-between items-center bg-white z-10 w-full">
            <div>
                <h2 className="title-2 mb-1">Q3 Portfolio Review</h2>
                {/* GET /api/workspace/agents/:id */}
                <p className="body-base text-gray-500">Agent: Chief Investment Officer (Strategy Dept)</p>
            </div>
            <div className="label-mono text-gray-300">Cost: $1.24 (Session)</div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-12 lg:px-24 pb-48">

            {/* API: GET /api/workspace/chat/sessions/:sessionId/messages */}

            {/* Agent Message */}
            <div className="mb-12 max-w-3xl">
                <div className="flex items-center space-x-3 mb-2">
                    <span className="label-mono text-black">Chief Investment Officer</span>
                    <span className="label-mono text-gray-300">10:45 AM</span>
                </div>
                <div className="body-base">
                    <p className="mb-4">I've reviewed the current portfolio allocations and cross-referenced them with the
                        latest Q3 macro reports. The tech sector exposure is currently at 42%, which exceeds our defined
                        risk parameter of 35%.</p>
                    <p>I recommend rebalancing by taking profits on AAPL and MSFT, and reallocating towards the
                        defensive sectors.</p>
                </div>

                {/* Tools / Inner Monologue */}
                <div className="mt-4 p-4 bg-gray-100 border-l border-black">
                    <span className="label-mono text-gray-500 mb-2 block">Tool Execution</span>
                    <div className="body-small text-gray-500">[kis_portfolio_balance] -> Rebalancing matrix generated.</div>
                </div>
            </div>

            {/* User Message */}
            <div className="mb-12 max-w-3xl ml-auto text-right">
                <div className="flex items-center justify-end space-x-3 mb-2">
                    <span className="label-mono text-gray-300 text-right">10:48 AM</span>
                    <span className="label-mono text-black text-right">CEO Kim</span>
                </div>
                <div className="body-base">
                    <p>Can you simulate the impact of reducing tech to 30% and moving the rest into healthcare?</p>
                </div>
            </div>

            {/* Agent Message (Streaming state) */}
            <div className="mb-12 max-w-3xl">
                <div className="flex items-center space-x-3 mb-2">
                    <span className="label-mono text-black">Chief Investment Officer</span>
                    <span className="w-2 h-2 rounded-full bg-black animate-pulse"></span>
                </div>
                {/* SSE Stream response */}
                <div className="body-base text-gray-500 border-l border-gray-300 pl-4 py-1">
                    Running simulation on the KIS sandbox environment. Adjusting weights...
                </div>
            </div>

        </div>

        {/* Sticky Chat Input */}
        {/* POST /api/workspace/chat/sessions/:sessionId/messages */}
        <div className="absolute bottom-0 w-full bg-white p-8 border-t border-gray-100">
            <div className="max-w-4xl mx-auto flex flex-col relative">
                <div className="relative flex items-center">
                    <span className="absolute left-6 title-2 text-gray-300">></span>
                    <input type="text" placeholder="Type message to the CIO..."
                        className="w-full bg-gray-100 text-black py-4 pl-12 pr-32 body-base focus:outline-none focus:ring-1 focus:ring-black placeholder-gray-500 rounded-none transition-shadow" />
                    <button
                        className="absolute right-4 bg-black text-white px-6 py-2 label-mono hover:bg-gray-900 transition-colors">SEND</button>
                </div>
            </div>
        </div>

    </main>
    </>
  );
}

export default Chat;
