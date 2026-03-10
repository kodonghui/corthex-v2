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

        /* Grid background pattern for the home/landing representation */
        .bg-grid {
            background-image:
                linear-gradient(to right, #EEEEEE 1px, transparent 1px),
                linear-gradient(to bottom, #EEEEEE 1px, transparent 1px);
            background-size: 4rem 4rem;
            background-position: center center;
        }
`;

function Home() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Global Nav */}
    <nav className="w-64 border-r border-gray-100 flex flex-col justify-between py-8 px-6 flex-shrink-0 bg-white z-20">
        <div>
            <div className="mb-16">
                <span className="title-2 tracking-tighter">CORTHEX</span>
                <span className="label-mono ml-2">v2</span>
            </div>

            <ul className="space-y-6">
                <li><a href="/app/home" className="title-3 font-medium transition-colors">Home</a></li>
                {/* GET /api/workspace/dashboard/summary */}
                <li><a href="/app/dashboard" className="body-base hover:text-gray-500 transition-colors">Dashboard</a></li>
                {/* POST /api/workspace/commands */}
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
        </div>
    </nav>

    {/* Main Content: Home Entry Point */}
    <main className="flex-1 flex flex-col h-full bg-grid relative overflow-y-auto">

        <div className="max-w-5xl mx-auto w-full px-12 lg:px-24 pt-32 pb-32 relative z-10">

            {/* Quick Greeting & Setup Status */}
            <div className="mb-24 flex justify-between items-start">
                <div>
                    <span className="label-mono text-gray-500 block mb-2">Welcome Back, CEO Kim.</span>
                    <h1 className="title-display tracking-tighter mix-blend-multiply">Your Organization is Online.</h1>
                </div>
                {/* GET /api/auth/me */}
                <div className="bg-white p-4 border border-gray-100 shadow-sm">
                    <span className="label-mono text-black block mb-2">Org Health</span>
                    <div className="flex space-x-2 items-center">
                        <span className="w-2 h-2 rounded-full bg-status-green"></span>
                        <span className="body-small text-black font-medium">100% Nominal</span>
                    </div>
                </div>
            </div>

            {/* Central Hub Action (POST /api/workspace/commands shortcut) */}
            <div
                className="bg-white p-8 md:p-12 mb-24 shadow-sm border border-black group cursor-pointer hover:bg-gray-900 transition-colors">
                <a href="/app/command-center" className="block w-full">
                    <div className="flex justify-between items-end">
                        <div>
                            <span
                                className="label-mono text-gray-500 group-hover:text-gray-300 block mb-4 transition-colors">Direct
                                Entry</span>
                            <h2 className="title-1 group-hover:text-white transition-colors">Initialize Command</h2>
                        </div>
                        <span className="title-3 group-hover:text-white transition-colors">-></span>
                    </div>
                </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">

                {/* Quick Reports (GET /api/workspace/reports?limit=3) */}
                <div>
                    <h3 className="label-mono text-black mb-8 border-b border-black pb-2">Recent Intelligence</h3>
                    <ul className="space-y-6">
                        <li className="group cursor-pointer">
                            <a href="/app/reports" className="block">
                                <span className="label-mono text-gray-300 block mb-1">2h ago · Finance Dept</span>
                                <h4 className="title-3 group-hover:text-gray-500 transition-colors">Market Volatility
                                    Analysis: Tech Sector</h4>
                            </a>
                        </li>
                        <li className="group cursor-pointer">
                            <a href="/app/reports" className="block">
                                <span className="label-mono text-gray-300 block mb-1">5h ago · Marketing Dept</span>
                                <h4 className="title-3 group-hover:text-gray-500 transition-colors">Drafted SNS Campaign:
                                    Algo-Trading Promo</h4>
                            </a>
                        </li>
                        <li className="group cursor-pointer">
                            <a href="/app/reports" className="block">
                                <span className="label-mono text-gray-300 block mb-1">1d ago · Strategy Dept</span>
                                <h4 className="title-3 group-hover:text-gray-500 transition-colors">Competitor Feature
                                    Matrix Evaluation</h4>
                            </a>
                        </li>
                    </ul>
                    <a href="/app/reports" className="label-mono text-black mt-8 inline-block hover:text-gray-500">View All
                        Reports -></a>
                </div>

                {/* Active Workflows & Jobs (GET /api/workspace/jobs?status=active) */}
                <div>
                    <h3 className="label-mono text-black mb-8 border-b border-black pb-2">Background Operations</h3>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-white p-4 border border-gray-100">
                            <div>
                                <h4 className="body-base font-medium">Daily Asset Rebalance (Cron)</h4>
                                <span className="body-small text-gray-500">Next run: 14:00 KST</span>
                            </div>
                            <span className="w-2 h-2 rounded-full bg-status-green"></span>
                        </div>
                        <div className="flex justify-between items-center bg-white p-4 border border-gray-100">
                            <div>
                                <h4 className="body-base font-medium">Argos: Listen for AAPL > $200</h4>
                                <span className="body-small text-gray-500">Monitoring 2 APIs</span>
                            </div>
                            <span className="w-2 h-2 rounded-full bg-status-green"></span>
                        </div>
                        <div className="flex justify-between items-center bg-gray-50 p-4 border border-gray-100 opacity-50">
                            <div>
                                <h4 className="body-base font-medium text-gray-500">Knowledge DB Indexing</h4>
                                <span className="body-small text-gray-500">Completed 30m ago</span>
                            </div>
                            <span className="w-2 h-2 rounded-full bg-black"></span>
                        </div>
                    </div>
                </div>

            </div>

        </div>

    </main>
    </>
  );
}

export default Home;
