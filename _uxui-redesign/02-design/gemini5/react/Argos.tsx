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

function Argos() {
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
                {/* GET /api/workspace/argos */}
                <li className="pt-6 border-t border-gray-100 mt-6"><a href="/app/argos"
                        className="title-3 font-medium transition-colors border-l-2 border-black pl-4">Argos Monitors</a>
                </li>
                <li><a href="/app/trading" className="body-base hover:text-gray-500 transition-colors">Trading</a></li>
            </ul>
        </div>

        <div className="space-y-6">
            <ul className="space-y-6 pb-6 border-b border-gray-100">
                <li><a href="/app/jobs" className="body-small hover:text-black transition-colors">Jobs / Pipelines</a></li>
            </ul>
        </div>
    </nav>

    <main className="flex-1 overflow-y-auto p-12 lg:p-24 relative bg-white">

        <header className="mb-24 flex justify-between items-end">
            <div>
                <h1 className="title-display mb-6">Argos Event Triggers</h1>
                <p className="body-base max-w-2xl text-gray-500">
                    Always-on monitoring agents waiting for specific external conditions to trigger predefined
                    workflows.
                </p>
            </div>
            {/* POST /api/workspace/argos */}
            <button className="bg-black text-white px-6 py-3 label-mono hover:bg-gray-900 transition-colors">+ DEPLOY
                MONITOR</button>
        </header>

        {/* Monitors Grid */}
        {/* GET /api/workspace/argos/monitors */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            <div className="border border-black p-8 group relative bg-gray-50">
                <div className="flex justify-between items-start mb-6">
                    <span className="label-mono text-status-green flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-status-green animate-pulse"></div>WATCHING
                    </span>
                    <div className="label-mono text-gray-300">#A-001</div>
                </div>

                <h3 className="title-2 mb-4">VIX Volatility Spike</h3>
                <div className="p-4 bg-white border border-gray-200 font-mono text-sm text-gray-600 mb-6">
                    IF { VIX_INDEX > 25 AND (dVIX/dt) > 5 }
                </div>

                <div className="mb-4">
                    <span className="label-mono text-gray-500 block mb-1">THEN TRIGGER</span>
                    <span className="body-base text-black font-medium">Job: Defensive Portfolio Rebalance</span>
                </div>

                <div className="flex justify-between items-center border-t border-gray-200 pt-4 mt-6">
                    <span className="body-small text-gray-500">Checked 12s ago</span>
                    {/* PUT /api/workspace/argos/:id/toggle */}
                    <button className="label-mono text-black">PAUSE</button>
                </div>
            </div>

            <div className="border border-gray-200 hover:border-black transition-colors p-8 group relative bg-white">
                <div className="flex justify-between items-start mb-6">
                    <span className="label-mono text-status-green flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-status-green animate-pulse"></div>WATCHING
                    </span>
                    <div className="label-mono text-gray-300">#A-002</div>
                </div>

                <h3 className="title-2 mb-4">Twitter Competitor Mention</h3>
                <div className="p-4 bg-gray-50 border border-gray-200 font-mono text-sm text-gray-600 mb-6">
                    IF { X_API_STREAM contains ["competitor_A"] }
                </div>

                <div className="mb-4">
                    <span className="label-mono text-gray-500 block mb-1">THEN TRIGGER</span>
                    <span className="body-base text-black font-medium">Msg: #marketing-sync</span>
                </div>

                <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-6">
                    <span className="body-small text-gray-500">Stream connected</span>
                    <button className="label-mono text-gray-500 hover:text-black transition-colors">PAUSE</button>
                </div>
            </div>

            <div
                className="border border-gray-200 opacity-60 hover:opacity-100 hover:border-black transition-all p-8 group relative bg-white">
                <div className="flex justify-between items-start mb-6">
                    <span className="label-mono text-gray-500 flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-gray-300"></div>PAUSED
                    </span>
                    <div className="label-mono text-gray-300">#A-003</div>
                </div>

                <h3 className="title-2 mb-4">Earnings Report Release</h3>
                <div className="p-4 bg-gray-50 border border-gray-200 font-mono text-sm text-gray-600 mb-6">
                    IF { SEC_RSS feeds NEW_10Q for IN_PORTFOLIO }
                </div>

                <div className="mb-4">
                    <span className="label-mono text-gray-500 block mb-1">THEN TRIGGER</span>
                    <span className="body-base text-black font-medium">Job: Ingest & Summarize</span>
                </div>

                <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-6">
                    <span className="body-small text-gray-500">Paused user_kim</span>
                    <button className="label-mono text-black">ACTIVATE</button>
                </div>
            </div>

        </div>

    </main>
    </>
  );
}

export default Argos;
