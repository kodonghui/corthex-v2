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

function Dashboard() {
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
                <li><a href="/app/home" className="body-base font-medium hover:text-gray-500 transition-colors">Home</a>
                </li>
                {/* API endpoints for navigation are not strictly endpoints, but represent areas */}
                {/* GET /api/workspace/dashboard/summary */}
                <li><a href="/app/dashboard" className="title-3 hover:text-gray-500 transition-colors">Dashboard</a></li>
                {/* GET /api/workspace/commands */}
                <li><a href="/app/command-center" className="body-base hover:text-gray-500 transition-colors">Command
                        Center</a></li>
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
            <div className="flex items-center space-x-3 cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center title-3">E</div>
                <div>
                    <div className="label-mono text-black">Workspace</div>
                    <div className="body-small">elddl.com</div>
                </div>
            </div>
        </div>
    </nav>

    {/* Main Content */}
    <main className="flex-1 overflow-y-auto p-12 lg:p-24 relative">

        <header className="mb-20">
            {/* API: GET /api/workspace/dashboard/summary */}
            <h1 className="title-display mb-6">Operations</h1>
            <p className="body-base max-w-2xl text-gray-500">
                Aggregated view of tenant activities, agent throughput, and systemic costs. All systems nominal.
            </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-24">
            {/* API: GET /api/workspace/dashboard/summary (tasks) */}
            <div>
                <span className="label-mono text-gray-500 block mb-4">Active Tasks</span>
                <span className="title-display">14</span>
                <p className="body-small mt-2">4 compiling, 10 analyzing</p>
            </div>
            {/* API: GET /api/workspace/dashboard/summary (cost) */}
            <div>
                <span className="label-mono text-gray-500 block mb-4">Today's Inference</span>
                <span className="title-display">$12.4</span>
                <p className="body-small mt-2">24% of daily budget</p>
            </div>
            {/* API: GET /api/workspace/dashboard/summary (agents) */}
            <div>
                <span className="label-mono text-gray-500 block mb-4">Active Agents</span>
                <div className="flex items-center space-x-4">
                    <span className="title-display">8</span>
                    <span className="w-3 h-3 rounded-full bg-status-green"></span>
                </div>
                <p className="body-small mt-2">All specialized units online</p>
            </div>
        </section>

        {/* API: GET /api/workspace/dashboard/usage */}
        <section className="mb-24">
            <h3 className="title-2 mb-8">Throughput (7d)</h3>
            <div className="h-64 border-b border-gray-100 flex items-end space-x-2 pb-4">
                {/* Extremely minimal chart representation (css bars) */}
                <div className="w-full bg-gray-100 h-[60%] hover:bg-black transition-colors"></div>
                <div className="w-full bg-gray-100 h-[80%] hover:bg-black transition-colors"></div>
                <div className="w-full bg-gray-100 h-[40%] hover:bg-black transition-colors"></div>
                <div className="w-full bg-gray-100 h-[90%] hover:bg-black transition-colors"></div>
                <div className="w-full bg-gray-100 h-[100%] hover:bg-black transition-colors"></div>
                <div className="w-full bg-gray-100 h-[50%] hover:bg-black transition-colors"></div>
                <div className="w-full bg-black h-[75%] transition-colors relative group">
                    <div
                        className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap label-mono text-black">
                        TODAY / 244K</div>
                </div>
            </div>
        </section>

        {/* API: GET /api/workspace/dashboard/satisfaction */}
        <section>
            <h3 className="title-2 mb-8">Quality Gate Index</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div>
                    <div className="flex justify-between items-end mb-4 border-b border-black pb-2">
                        <span className="body-base font-medium">Approval Rate</span>
                        <span className="title-3">94.2%</span>
                    </div>
                    <div
                        className="flex justify-between items-end mb-4 border-b border-gray-100 pb-2 hover:border-gray-500 transition-colors cursor-default">
                        <span className="body-base">Total Reports</span>
                        <span className="body-base">142</span>
                    </div>
                    <div
                        className="flex justify-between items-end mb-4 border-b border-gray-100 pb-2 hover:border-gray-500 transition-colors cursor-default">
                        <span className="body-base">First-pass Success</span>
                        <span className="body-base">128</span>
                    </div>
                </div>

                <div className="bg-gray-100 p-8">
                    <h4 className="label-mono text-black mb-6">Recent Anomaly</h4>
                    <p className="body-base mb-4">
                        "Market manipulation report rejected by Secretary Agent due to insufficient citation for Q2
                        earnings projection."
                    </p>
                    <p className="body-small">
                        Action: Auto-assigned to Research Dept. Resolving in 2m.
                    </p>
                </div>
            </div>
        </section>

        <footer className="mt-32 pt-8 border-t border-black pb-12 flex justify-between items-center">
            <span className="label-mono text-black">CORTHEX v2 / DASHBOARD</span>
            <span className="label-mono text-status-green flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-status-green"></div>WS CONNECTED
            </span>
        </footer>

    </main>
    </>
  );
}

export default Dashboard;
