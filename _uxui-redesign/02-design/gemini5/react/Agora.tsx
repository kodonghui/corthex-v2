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

function Agora() {
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
                {/* GET /api/workspace/debates */}
                <li className="pt-6 border-t border-gray-100 mt-6"><a href="/app/agora"
                        className="title-3 font-medium transition-colors">Agora</a></li>
                <li><a href="/app/nexus" className="body-base hover:text-gray-500 transition-colors">Nexus</a></li>
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

    {/* Debate Engine Split View */}
    <main className="flex-1 flex overflow-hidden">

        {/* Left: Debate Configuration & List */}
        <div className="w-1/3 border-r border-gray-100 flex flex-col bg-white">
            <div className="p-8 border-b border-gray-100">
                <h2 className="title-2 mb-6">Debate Arena</h2>
                {/* POST /api/workspace/debates */}
                <button className="w-full bg-black text-white py-3 label-mono hover:bg-gray-900 transition-colors">ASSEMBLE
                    PANEL</button>
            </div>

            {/* GET /api/workspace/debates */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-8 border-b border-black bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                        <span className="label-mono text-black">Active Debate</span>
                        <span className="w-2 h-2 rounded-full bg-status-green animate-pulse"></span>
                    </div>
                    <h3 className="title-3 leading-snug">"Viability of transitioning underlying DB from Neon to self-hosted
                        PostgreSQL"</h3>
                    <div className="mt-4 label-mono text-gray-500">Round 2 / 3</div>
                </div>

                <div className="p-8 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                        <span className="label-mono text-gray-500">Concluded</span>
                        <span className="label-mono text-gray-900">Consensus Reached</span>
                    </div>
                    <h3 className="body-base font-medium text-gray-500 leading-snug">"Q4 Marketing Strategy focus: Organic
                        vs Paid"</h3>
                </div>
            </div>
        </div>

        {/* Right: Active Debate Stream */}
        {/* GET /api/workspace/debates/:id/timeline */}
        <div className="flex-1 flex flex-col pt-8">
            <header className="px-12 pb-8 border-b border-gray-100 shrink-0">
                <div className="label-mono text-black mb-4 flex space-x-4">
                    <span>AGORA PROTOCOL</span>
                    <span className="text-gray-300">|</span>
                    <span>3 PARTICIPANTS</span>
                </div>
                <h1 className="title-1 max-w-2xl">"Viability of transitioning underlying DB from Neon to self-hosted
                    PostgreSQL"</h1>
            </header>

            <div className="flex-1 overflow-y-auto p-12 space-y-16 pb-32">

                {/* Round 1 Header */}
                <div className="border-t border-black pt-4 mb-8">
                    <h3 className="label-mono text-gray-900">Round 1: Initial Positions</h3>
                </div>

                {/* Speech 1 */}
                <div className="max-w-3xl ml-0">
                    <div className="flex items-center space-x-4 mb-4">
                        <span className="title-3 font-semibold">Chief Technology Officer</span>
                        <span className="label-mono text-gray-500">Proponent</span>
                    </div>
                    <div className="body-base pl-8 border-l border-gray-300">
                        <p className="mb-4">Given our recent scaling metrics, the per-read cost on serverless Neon DB is
                            becoming a bottleneck. A self-hosted PostgreSQL instance on AWS EC2, paired with proper
                            connection pooling (pGBouncer), will reduce our monthly database burn rate by an estimated
                            60%.</p>
                        <p>The control over the exact tuning parameters for vector search extensions is also a critical
                            requirement for our next phase of RAG enhancements.</p>
                    </div>
                </div>

                {/* Speech 2 */}
                <div className="max-w-3xl ml-16">
                    <div className="flex items-center space-x-4 mb-4">
                        <span className="title-3 font-semibold">DevOps Lead</span>
                        <span className="label-mono text-status-red">Opponent</span>
                    </div>
                    <div className="body-base pl-8 border-l border-gray-300">
                        <p className="mb-4">I strongly disagree. The "60% cost reduction" ignores the hidden human cost
                            regarding maintenance, patching, and SLA management. Neon provides automated branching and
                            point-in-time recovery which is vital for our staging velocity.</p>
                        <p>Moving to raw EC2 introduces single points of failure unless we build a complex multi-AZ HA
                            setup, which negates the cost savings entirely.</p>
                    </div>
                </div>

                {/* Round 2 Header */}
                <div className="border-t border-black pt-4 mb-8">
                    <h3 className="label-mono text-gray-900">Round 2: Rebuttal & Deep Analysis</h3>
                </div>

                {/* Streaming Speech */}
                <div className="max-w-3xl ml-0">
                    <div className="flex items-center space-x-4 mb-4">
                        <span className="title-3 font-semibold">Financial Controller</span>
                        <span className="label-mono text-gray-500">Neutral Analyst</span>
                    </div>
                    <div className="body-base pl-8 border-l-2 border-black py-1">
                        <span className="text-gray-500">I have modeled both scenarios requested by the CTO and DevOps Lead.
                            Evaluating the total cost of ownership over a 24-month horizon...<span
                                className="w-1 h-4 bg-black inline-block ml-1 animate-pulse"></span></span>
                    </div>
                </div>

            </div>

            {/* Active Controls */}
            <div className="p-8 border-t border-gray-100 bg-white">
                <div className="flex justify-between items-center text-label-mono">
                    <span className="label-mono text-status-green">SSE Stream Active [Round 2.1]</span>
                    <div className="space-x-4 flex">
                        {/* POST /api/workspace/debates/:id/inject */}
                        <button className="label-mono text-gray-500 hover:text-black transition-colors">Inject
                            Context</button>
                        {/* POST /api/workspace/debates/:id/force-conclude */}
                        <button
                            className="label-mono text-black hover:text-status-red transition-colors border-l border-gray-100 pl-4">Force
                            Conclusion</button>
                    </div>
                </div>
            </div>

        </div>

    </main>
    </>
  );
}

export default Agora;
