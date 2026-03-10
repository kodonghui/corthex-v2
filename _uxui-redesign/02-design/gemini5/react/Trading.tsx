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

function Trading() {
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
                {/* GET /api/workspace/strategy/portfolios */}
                <li className="pt-6 border-t border-gray-100 mt-6"><a href="/app/trading"
                        className="title-3 font-medium transition-colors">Trading</a></li>
                <li><a href="/app/agora" className="body-base hover:text-gray-500 transition-colors">Agora</a></li>
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

    <main className="flex-1 overflow-y-auto p-12 lg:p-24 relative">

        <header className="mb-20 flex justify-between items-start">
            <div>
                {/* GET /api/workspace/strategy/trading-status */}
                <h1 className="title-display mb-6">Strategy & Portfolio</h1>
                <p className="body-base max-w-2xl text-gray-500">
                    Active management by CIO. Auto-execution via KIS VECTOR is currently in <span
                        className="text-black font-semibold">Simulated Environment</span>.
                </p>
            </div>
            {/* PUT /api/workspace/strategy/settings/trading-mode */}
            <button className="label-mono border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors">
                Switch to Live KIS API
            </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">

            {/* Portfolio Performance (GET /api/workspace/strategy/portfolio/:id/performance) */}
            <div className="col-span-1 lg:col-span-8">
                <div className="flex items-end space-x-6 mb-12 border-b border-black pb-4">
                    <span className="label-mono text-gray-500">Total Value</span>
                    <span className="title-1">$1,204,450.00</span>
                    <span className="title-3 text-status-green">+4.2% YTD</span>
                </div>

                <h3 className="label-mono mb-6 text-black">Active Holdings</h3>
                {/* GET /api/workspace/strategy/shares */}
                <div className="space-y-4">
                    <div className="grid grid-cols-12 gap-4 pb-2 border-b border-gray-100">
                        <div className="col-span-3 label-mono text-gray-300">Ticker</div>
                        <div className="col-span-3 label-mono text-gray-300">Weight</div>
                        <div className="col-span-3 label-mono text-gray-300 text-right">Value</div>
                        <div className="col-span-3 label-mono text-gray-300 text-right">Return</div>
                    </div>

                    <div className="grid grid-cols-12 gap-4 py-4 border-b border-gray-100 hover:bg-gray-100 cursor-pointer">
                        <div className="col-span-3 title-2">AAPL</div>
                        <div className="col-span-3 body-base text-gray-500 items-center flex">32.4%</div>
                        <div className="col-span-3 body-base text-right text-gray-900 flex items-center justify-end">
                            $390,241</div>
                        <div className="col-span-3 text-right flex items-center justify-end">
                            <span className="title-3 text-status-green">+12.4%</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4 py-4 border-b border-gray-100 hover:bg-gray-100 cursor-pointer">
                        <div className="col-span-3 title-2">MSFT</div>
                        <div className="col-span-3 body-base text-gray-500 items-center flex">28.1%</div>
                        <div className="col-span-3 body-base text-right text-gray-900 flex items-center justify-end">
                            $338,450</div>
                        <div className="col-span-3 text-right flex items-center justify-end">
                            <span className="title-3 text-status-green">+8.2%</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4 py-4 border-b border-gray-100 hover:bg-gray-100 cursor-pointer">
                        <div className="col-span-3 title-2">TSLA</div>
                        <div className="col-span-3 body-base text-gray-500 items-center flex">14.5%</div>
                        <div className="col-span-3 body-base text-right text-gray-900 flex items-center justify-end">
                            $174,645</div>
                        <div className="col-span-3 text-right flex items-center justify-end">
                            <span className="title-3 text-status-red">-2.1%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending Orders & Watchlist */}
            <div className="col-span-1 lg:col-span-4 pl-0 lg:pl-16 border-l-0 lg:border-l border-gray-100">
                {/* GET /api/workspace/strategy/orders/pending */}
                <h3 className="label-mono mb-8 text-black">Awaiting CIO Execution</h3>
                <div className="space-y-6 mb-16">
                    <div className="border border-black p-4 bg-gray-100">
                        <div className="flex justify-between items-center mb-2">
                            <span className="title-3">BUY <span className="font-normal text-gray-500">NVDA</span></span>
                            <span className="label-mono text-status-green">Confidence 0.92</span>
                        </div>
                        <div className="body-small text-gray-500 mb-4">CIO Prop: Reallocating from TSLA based on Q4 chip
                            demand analysis.</div>
                        <div className="flex justify-between items-center border-t border-gray-300 pt-3">
                            <span className="body-base">50 shares @ MKT</span>
                            <div className="space-x-2">
                                {/* POST /api/workspace/strategy/orders/:id/reject */}
                                <button className="label-mono text-status-red hover:opacity-70">REJECT</button>
                                {/* POST /api/workspace/strategy/orders/:id/approve */}
                                <button
                                    className="label-mono bg-black text-white px-3 py-1 hover:bg-gray-900">APPROVE</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* GET /api/workspace/strategy/watchlist */}
                <h3 className="label-mono mb-8 text-black">Observation Matrix</h3>
                <ul className="space-y-4">
                    <li className="flex justify-between items-center pb-2 border-b border-gray-100">
                        <span className="body-base">005930.KS (Samsung)</span>
                        <span className="label-mono text-black">ARGOS Tracking</span>
                    </li>
                    <li className="flex justify-between items-center pb-2 border-b border-gray-100">
                        <span className="body-base">GOOGL</span>
                        <span className="label-mono text-black">Earnings Alert</span>
                    </li>
                    <li className="pt-4">
                        {/* POST /api/workspace/strategy/watchlist */}
                        <button className="label-mono text-gray-500 hover:text-black transition-colors">+ Add
                            Ticker</button>
                    </li>
                </ul>
            </div>

        </div>

    </main>
    </>
  );
}

export default Trading;
