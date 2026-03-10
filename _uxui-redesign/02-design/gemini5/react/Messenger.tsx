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

function Messenger() {
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
                {/* Represents internal communications, potentially intertwined with chat but distinct for channels */}
                {/* GET /api/workspace/communications */}
                <li className="pt-6 border-t border-gray-100 mt-6"><a href="/app/messenger"
                        className="title-3 font-medium transition-colors">Comms / Messengers</a></li>
            </ul>
        </div>
        <div className="space-y-6">
            <ul className="space-y-6 pb-6 border-b border-gray-100">
                <li><a href="/app/agents" className="body-small hover:text-black transition-colors">Agents</a></li>
                <li><a href="/app/knowledge" className="body-small hover:text-black transition-colors">Knowledge</a></li>
                <li><a href="/app/costs" className="body-small hover:text-black transition-colors">Costs</a></li>
            </ul>
        </div>
    </nav>

    {/* Channels Sidebar */}
    <aside className="w-80 border-r border-gray-100 flex flex-col bg-white flex-shrink-0">
        <div className="p-8 border-b border-gray-100">
            <h2 className="title-2 mb-6">Channels</h2>
            <button
                className="w-full border border-black text-black py-2 label-mono hover:bg-black hover:text-white transition-colors">+
                NEW CHANNEL</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {/* GET /api/workspace/communications/channels */}
            <div className="p-4 bg-gray-100 cursor-pointer">
                <span className="label-mono text-black font-semibold"># general-alerts</span>
            </div>
            <div
                className="p-4 hover:bg-gray-100 cursor-pointer transition-colors border border-transparent flex justify-between">
                <span className="label-mono text-gray-500 font-semibold"># trading-desk</span>
                <span className="w-2 h-2 rounded-full bg-status-red mt-1"></span>
            </div>
            <div className="p-4 hover:bg-gray-100 cursor-pointer transition-colors border border-transparent">
                <span className="label-mono text-gray-500 font-semibold"># marketing-sync</span>
            </div>
        </div>
    </aside>

    {/* Chat Area */}
    <main className="flex-1 flex flex-col h-full bg-white relative">

        <header className="p-8 border-b border-gray-100 flex justify-between items-center bg-white z-10 w-full shrink-0">
            <div>
                <h2 className="title-2 mb-1"># general-alerts</h2>
                <p className="body-base text-gray-500">System-wide notifications and high-level agent broadcasts.</p>
            </div>
            <div className="label-mono text-gray-300">8 Members (Human & Agent)</div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-12 lg:px-24">

            {/* System Message */}
            <div className="mb-12 border-l-2 border-black pl-6 py-2">
                <div className="flex items-center space-x-3 mb-2">
                    <span className="label-mono text-black font-bold">SYSTEM</span>
                    <span className="label-mono text-gray-300">08:00 AM</span>
                </div>
                <div className="body-base text-gray-900">
                    <p>Daily Knowledge DB Vectorization completed successfully. (Added: 1,204 docs, Removed: 12).</p>
                </div>
            </div>

            {/* Agent Broadcast Message */}
            <div className="mb-12 max-w-2xl">
                <div className="flex items-center space-x-3 mb-2">
                    <span className="label-mono text-black">Chief Technology Officer</span>
                    <span className="label-mono text-gray-300">09:15 AM</span>
                </div>
                <div className="body-base">
                    <p>Alert: API Latency for external market data provider (Finch) has exceeded 500ms for the past 10
                        minutes. Will monitor. Fallback to secondary provider invoked.</p>
                </div>
            </div>

            {/* Human Message */}
            <div className="mb-12 max-w-2xl ml-auto text-right">
                <div className="flex items-center justify-end space-x-3 mb-2">
                    <span className="label-mono text-gray-300 text-right">09:20 AM</span>
                    <span className="label-mono text-black text-right">DevOps Lead (Human)</span>
                </div>
                <div className="body-base text-gray-500">
                    <p>Noted. I'll check the Finch dev dashboard to see if there's an ongoing incident.</p>
                </div>
            </div>

        </div>

        {/* Sticky Chat Input */}
        {/* POST /api/workspace/communications/channels/:id/messages */}
        <div className="p-8 border-t border-gray-100 bg-white shrink-0">
            <div className="max-w-4xl mx-auto flex flex-col relative">
                <div className="relative flex items-center">
                    <span className="absolute left-6 title-2 text-gray-300">#</span>
                    <input type="text" placeholder="Message #general-alerts (Use @ to tag agents)..."
                        className="w-full bg-gray-100 text-black py-4 pl-12 pr-32 body-base focus:outline-none focus:ring-1 focus:ring-black placeholder-gray-500 rounded-none transition-shadow" />
                    <button
                        className="absolute right-4 text-black label-mono hover:text-gray-500 transition-colors font-bold tracking-widest">SEND</button>
                </div>
            </div>
        </div>

    </main>
    </>
  );
}

export default Messenger;
