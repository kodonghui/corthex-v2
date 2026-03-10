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
<nav className="w-72 flex flex-col justify-between py-12 px-10 flex-shrink-0 bg-gray-50 border-r border-gray-100">
        <div>
            <div className="mb-24 flex items-center">
                <span className="title-2 tracking-tighter">CORTHEX</span>
                <span className="label-mono ml-3 text-status-red bg-red-50 px-2 py-1">ADMIN</span>
            </div>

            <ul className="space-y-10">
                <li><a href="/app/dashboard" className="body-base text-gray-500 hover:text-black transition-colors">Platform
                        Overview</a></li>
                <li className="space-y-6 pt-4">
                    <span className="label-mono text-gray-300 block mb-4">SYSTEM</span>
                    <ul className="space-y-6 pl-4">
                        <li><a href="/app/monitoring"
                                className="body-base text-gray-500 hover:text-black transition-colors">Health & Metrics</a>
                        </li>
                        {/* GET /api/admin/costs */}
                        <li><a href="/app/costs" className="title-3 transition-colors">Platform Costs</a></li>
                    </ul>
                </li>
            </ul>
        </div>
    </nav>

    <main className="flex-1 overflow-y-auto p-16 lg:p-32 bg-white flex flex-col">

        <header className="mb-32 flex justify-between items-end border-b border-black pb-8">
            <div>
                <h1 className="title-display mb-6">P&L Overview</h1>
                <p className="body-base max-w-2xl text-gray-500">
                    Gross margin estimation based on LLM inference costs, server compute, and tenant SaaS revenue.
                </p>
            </div>
            <select className="label-mono text-black border-b border-black pb-1 focus:outline-none bg-transparent">
                <option>OCTOBER 2026 (MTD)</option>
                <option>SEPTEMBER 2026</option>
            </select>
        </header>

        {/* KPI Summary */}
        <div className="flex flex-wrap gap-24 mb-32">
            <div className="border-l-4 border-status-green pl-6 py-2">
                <span className="label-mono text-gray-500 block mb-2">GROSS REVENUE (MRR)</span>
                <span className="title-1 tracking-tight">$84,500</span>
            </div>
            <div className="border-l-4 border-status-red pl-6 py-2">
                <span className="label-mono text-gray-500 block mb-2">INFRASTRUCTURE COGS</span>
                <span className="title-1 tracking-tight">$31,240</span>
            </div>
            <div className="border-l-4 border-black pl-6 py-2">
                <span className="label-mono text-gray-500 block mb-2">GROSS MARGIN</span>
                <span className="title-1 tracking-tight">63.0<span className="title-3">%</span></span>
            </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-32">

            {/* COGS Breakdown */}
            <section>
                <div className="mb-12 border-b border-black pb-4">
                    <h2 className="title-2">Cost Breakdown</h2>
                </div>

                <div className="space-y-8">
                    <div className="flex justify-between items-center bg-gray-50 p-6 border border-gray-100">
                        <div>
                            <span className="label-mono text-gray-500 block mb-1">LLM PROVIDER</span>
                            <span className="title-3 text-black">Anthropic (Claude 3.5)</span>
                        </div>
                        <div className="text-right">
                            <span className="title-2">$24,105</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center p-6 border border-gray-100">
                        <div>
                            <span className="label-mono text-gray-500 block mb-1">LLM PROVIDER</span>
                            <span className="title-3 text-black">OpenAI (GPT-4o)</span>
                        </div>
                        <div className="text-right">
                            <span className="title-2">$4,820</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center p-6 border border-gray-100">
                        <div>
                            <span className="label-mono text-gray-500 block mb-1">CLOUD COMPUTE</span>
                            <span className="title-3 text-black">AWS Inference Clusters</span>
                        </div>
                        <div className="text-right">
                            <span className="title-2">$2,315</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Most Expensive Tenants */}
            <section>
                <div className="mb-12 border-b border-black pb-4">
                    <h2 className="title-2">Cost Sink Tenants</h2>
                </div>

                <div className="space-y-8">
                    <div className="flex justify-between items-center p-6 border-l-4 border-status-red bg-red-50/20">
                        <div>
                            <span className="label-mono text-status-red block mb-1">MARGIN < 20%</span>
                                    <span className="title-3 text-black font-medium">Acme Corporation</span>
                        </div>
                        <div className="text-right">
                            <span className="body-base block text-gray-500">Cost: $8,420</span>
                            <span className="body-base block text-black">Rev: $10,000</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center p-6 border-l-4 border-gray-300">
                        <div>
                            <span className="label-mono text-gray-500 block mb-1">MARGIN: 45%</span>
                            <span className="title-3 text-black font-medium">Globex Finance</span>
                        </div>
                        <div className="text-right">
                            <span className="body-base block text-gray-500">Cost: $5,500</span>
                            <span className="body-base block text-black">Rev: $10,000</span>
                        </div>
                    </div>

                    <div className="mt-8 text-right">
                        <button className="label-mono text-black border-b border-black">VIEW DETAILED COGS REPORT</button>
                    </div>
                </div>
            </section>

        </div>

    </main>
    </>
  );
}

export default Costs;
