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

function Costs() {
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
            </ul>
        </div>

        <div className="space-y-6">
            <ul className="space-y-6 pb-6 border-b border-gray-100">
                <li><a href="/app/agents" className="body-small hover:text-black transition-colors">Agents</a></li>
                <li><a href="/app/knowledge" className="body-small hover:text-black transition-colors">Knowledge Base</a>
                </li>
                <li><a href="/app/files" className="body-small hover:text-black transition-colors">Files & Assets</a></li>
                {/* GET /api/workspace/dashboard/costs */}
                <li><a href="/app/costs"
                        className="title-3 font-medium transition-colors border-l-2 border-black pl-4">Costs & Usage</a>
                </li>
            </ul>
        </div>
    </nav>

    <main className="flex-1 overflow-y-auto p-12 lg:p-24 relative bg-white">

        <header className="mb-24 flex justify-between items-end">
            <div>
                <h1 className="title-display mb-6">Financial Impact</h1>
                <p className="body-base max-w-2xl text-gray-500">
                    Granular tracking of LLM API costs across agents, departments, and specific operations.
                </p>
            </div>
            <div className="text-right">
                <select className="label-mono text-black border-b border-black pb-1 focus:outline-none bg-transparent">
                    <option>October 2026</option>
                    <option>September 2026</option>
                    <option>August 2026</option>
                </select>
            </div>
        </header>

        {/* High-level Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24">
            <div className="border-t-[3px] border-black pt-6">
                <span className="label-mono text-gray-500 block mb-4">TOTAL SPEND (MTD)</span>
                <div className="title-display tracking-tight">$424.50</div>
                <div className="mt-4 flex items-center space-x-2">
                    <span className="label-mono text-status-red flex items-center"><svg className="w-3 h-3 mr-1" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                        </svg> +12% vs last month</span>
                </div>
            </div>
            <div className="border-t border-gray-300 pt-6">
                <span className="label-mono text-gray-500 block mb-4">PROJECTED EOM</span>
                <div className="title-display text-gray-300 tracking-tight">$812.00</div>
            </div>
            <div className="border-t border-gray-300 pt-6">
                <span className="label-mono text-gray-500 block mb-4">BUDGET LIMIT</span>
                <div className="title-display tracking-tight">$1,000</div>
                <div className="mt-4 w-full bg-gray-100 h-2">
                    <div className="bg-black h-2" style={{width: "42%"}}></div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-24">

            {/* Cost by Department */}
            {/* GET /api/workspace/dashboard/costs/by-dept */}
            <section>
                <h2 className="label-mono text-black mb-8 border-b border-black pb-4">Spend by Department</h2>

                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <span className="title-3">Investment Strategy</span>
                            <span className="body-base font-semibold">$245.10</span>
                        </div>
                        <div className="w-full bg-gray-100 h-3">
                            <div className="bg-black h-3" style={{width: "58%"}}></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <span className="title-3">Marketing & Comms</span>
                            <span className="body-base font-semibold">$112.40</span>
                        </div>
                        <div className="w-full bg-gray-100 h-3">
                            <div className="bg-gray-500 h-3" style={{width: "26%"}}></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <span className="title-3 text-gray-500">System Ops</span>
                            <span className="body-base font-semibold text-gray-500">$67.00</span>
                        </div>
                        <div className="w-full bg-gray-100 h-3">
                            <div className="bg-gray-300 h-3" style={{width: "16%"}}></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Top Spending Agents */}
            {/* GET /api/workspace/dashboard/costs/by-agent */}
            <section>
                <h2 className="label-mono text-black mb-8 border-b border-black pb-4">Top Spending Entities (Agents &
                    Scripts)</h2>

                <div className="table w-full">
                    <div className="table-row border-b border-gray-300 label-mono text-gray-500">
                        <div className="table-cell pb-4 align-bottom">ENTITY NAME</div>
                        <div className="table-cell pb-4 align-bottom">MODEL</div>
                        <div className="table-cell pb-4 align-bottom text-right">TOKENS (M)</div>
                        <div className="table-cell pb-4 align-bottom text-right">COST</div>
                    </div>

                    <div className="table-row group hover:bg-gray-50 cursor-pointer">
                        <div className="table-cell py-4 border-b border-gray-100 font-medium">Chief Investment Officer</div>
                        <div className="table-cell py-4 border-b border-gray-100 body-small text-gray-500">Sonnet 3.5</div>
                        <div className="table-cell py-4 border-b border-gray-100 text-right body-base">12.4</div>
                        <div className="table-cell py-4 border-b border-gray-100 text-right font-medium">$142.10</div>
                    </div>

                    <div className="table-row group hover:bg-gray-50 cursor-pointer">
                        <div className="table-cell py-4 border-b border-gray-100 font-medium">Secretary General</div>
                        <div className="table-cell py-4 border-b border-gray-100 body-small text-gray-500">Sonnet 3.5</div>
                        <div className="table-cell py-4 border-b border-gray-100 text-right body-base">8.1</div>
                        <div className="table-cell py-4 border-b border-gray-100 text-right font-medium">$88.40</div>
                    </div>

                    <div className="table-row group hover:bg-gray-50 cursor-pointer">
                        <div className="table-cell py-4 border-b border-gray-100 font-medium text-gray-500">[CRON] Daily SEC
                            Ingest</div>
                        <div className="table-cell py-4 border-b border-gray-100 body-small text-gray-500">Haiku 3.0</div>
                        <div className="table-cell py-4 border-b border-gray-100 text-right body-base text-gray-500">45.2
                        </div>
                        <div className="table-cell py-4 border-b border-gray-100 text-right font-medium text-gray-500">
                            $54.20</div>
                    </div>
                </div>
            </section>

        </div>

        {/* Callout / Settings Link */}
        <div className="mt-24 bg-gray-50 p-12 border border-gray-200 flex justify-between items-center">
            <div>
                <h3 className="title-3 mb-2">Hard Budget Limits</h3>
                <p className="body-base text-gray-500">System is configured to halt all non-essential Tier 3 agent
                    operations if spend exceeds $1,000.</p>
            </div>
            {/* Links to settings.html config section */}
            <button
                className="label-mono border border-black px-6 py-3 hover:bg-black hover:text-white transition-colors">CONFIGURE
                LIMITS</button>
        </div>

    </main>
    </>
  );
}

export default Costs;
