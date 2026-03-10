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

function Performance() {
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
                {/* GET /api/workspace/dashboard/metrics */}
                <li className="pt-6 border-t border-gray-100 mt-6"><a href="/app/performance"
                        className="title-3 font-medium transition-colors border-l-2 border-black pl-4">Performance
                        Metrics</a></li>
            </ul>
        </div>

        <div className="space-y-6">
            <ul className="space-y-6 pb-6 border-b border-gray-100">
                <li><a href="/app/costs" className="body-small hover:text-black transition-colors pl-4">Costs & Usage</a>
                </li>
                <li><a href="/app/ops-log" className="body-small hover:text-black transition-colors pl-4">Ops Log</a></li>
            </ul>
        </div>
    </nav>

    <main className="flex-1 overflow-y-auto p-12 lg:p-24 relative bg-white">

        <header className="mb-24 flex justify-between items-end">
            <div>
                <h1 className="title-display mb-6">System Telemetery</h1>
                <p className="body-base max-w-2xl text-gray-500">
                    Agent throughput, API latency, and resolution success rates.
                </p>
            </div>
            <div className="text-right">
                <span className="label-mono text-status-green flex items-center justify-end space-x-2">
                    <div className="w-2 h-2 rounded-full bg-status-green"></div>LIVE
                </span>
            </div>
        </header>

        {/* KPI Grid (GET /api/workspace/dashboard/metrics/kpi) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-24 pb-12 border-b border-black">
            <div>
                <span className="label-mono text-gray-500 block mb-2">AVG TASK RESOLUTION TIME</span>
                <span className="title-1 tracking-tight">2.4<span className="title-3">s</span></span>
            </div>
            <div>
                <span className="label-mono text-gray-500 block mb-2">AGENT SUCCESS RATE</span>
                <span className="title-1 tracking-tight">94.2<span className="title-3">%</span></span>
            </div>
            <div>
                <span className="label-mono text-gray-500 block mb-2">AVG API LATENCY</span>
                <span className="title-1 tracking-tight">412<span className="title-3">ms</span></span>
            </div>
            <div>
                <span className="label-mono text-gray-500 block mb-2">ACTIVE THREADS</span>
                <span className="title-1 tracking-tight">4</span>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">

            {/* Latency / Throughput Chart area (placeholder) */}
            <section>
                <h2 className="label-mono text-black mb-8 border-b border-black pb-4">Throughput (Req / min) - Last 6h</h2>
                <div className="h-64 border border-gray-200 bg-gray-50 relative flex items-end p-4 space-x-2">
                    {/* Placeholder bars showing monochrome aesthetic */}
                    <div className="w-full bg-black h-[20%]"></div>
                    <div className="w-full bg-gray-500 h-[45%]"></div>
                    <div className="w-full bg-black h-[80%]"></div>
                    <div className="w-full bg-gray-900 h-[60%]"></div>
                    <div className="w-full bg-gray-300 h-[30%]"></div>
                    <div className="w-full bg-gray-500 h-[50%]"></div>
                    <div className="w-full bg-black h-[90%] relative">
                        {/* 'Current' marker */}
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 label-mono text-black">420/m</div>
                    </div>
                </div>
            </section>

            {/* Agent Error Rates */}
            {/* GET /api/workspace/dashboard/metrics/errors */}
            <section>
                <h2 className="label-mono text-black mb-8 border-b border-black pb-4">Recent Escalations / Tool Failures
                </h2>

                <div className="space-y-4">
                    <div className="border border-status-red p-6 flex justify-between items-start bg-red-50/20">
                        <div>
                            <div className="flex space-x-3 mb-2">
                                <span className="label-mono text-status-red border border-status-red px-2">HTTP 429</span>
                                <span className="label-mono text-black">MKTG_CONTENT</span>
                            </div>
                            <h4 className="title-3 mb-1">LinkedIn API Rate Limit Exceeded</h4>
                            <p className="body-small text-gray-500">Auto-recovery engaged. Backoff: 15m.</p>
                        </div>
                        <span className="label-mono text-gray-500">12m ago</span>
                    </div>

                    <div
                        className="border border-gray-200 hover:border-black transition-colors p-6 flex justify-between items-start cursor-pointer">
                        <div>
                            <div className="flex space-x-3 mb-2">
                                <span className="label-mono text-gray-900 border border-black px-2">PARSE_ERR</span>
                                <span className="label-mono text-black">STRATEGY_CIO</span>
                            </div>
                            <h4 className="title-3 mb-1">Failed to parse JSON response from KIS API</h4>
                            <p className="body-small text-gray-500">Agent successfully retried and corrected parsing logic.
                            </p>
                        </div>
                        <span className="label-mono text-gray-500">1h ago</span>
                    </div>

                    <div
                        className="border border-gray-200 hover:border-black transition-colors p-6 flex justify-between items-start cursor-pointer opacity-60">
                        <div>
                            <div className="flex space-x-3 mb-2">
                                <span className="label-mono text-gray-500 border border-gray-300 px-2">TIMEOUT</span>
                                <span className="label-mono text-black">SEC_GENERAL</span>
                            </div>
                            <h4 className="title-3 mb-1">RAG retrieval exceeded 5000ms SLA</h4>
                            <p className="body-small text-gray-500">Query semantic search performance flagged.</p>
                        </div>
                        <span className="label-mono text-gray-500">Yesterday</span>
                    </div>
                </div>
            </section>

        </div>

    </main>
    </>
  );
}

export default Performance;
