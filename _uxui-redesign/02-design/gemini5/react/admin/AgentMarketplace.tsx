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

function AgentMarketplace() {
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
                    <span className="label-mono text-gray-300 block mb-4">MARKETPLACES</span>
                    <ul className="space-y-6 pl-4">
                        <li><a href="/app/template-market"
                                className="body-base text-gray-500 hover:text-black transition-colors">Preset Market</a>
                        </li>
                        {/* GET /api/admin/market/agents */}
                        <li><a href="/app/agent-marketplace" className="title-3 transition-colors">Agent Market</a></li>
                    </ul>
                </li>
            </ul>
        </div>
    </nav>

    <main className="flex-1 overflow-y-auto p-16 lg:p-32 bg-white flex flex-col">

        <header className="mb-20 flex justify-between items-end border-b border-black pb-8">
            <div>
                <h1 className="title-display mb-6">Agent App Store</h1>
                <p className="body-base max-w-2xl text-gray-500">
                    Third-party developer ecosystem. Individual AI agents mapped to specific domains, sold a-la-carte to
                    tenants.
                </p>
            </div>
            <div className="flex space-x-6">
                {/* GET /api/admin/market/agents/revenue */}
                <button className="label-mono text-black border-b border-black font-bold">REVENUE REPORTS</button>
            </div>
        </header>

        <div className="flex-1 min-h-0 bg-white">

            <div className="table w-full border-b border-black">
                <div className="table-row label-mono text-gray-300">
                    <div className="table-cell pb-6 w-1/3">AGENT LISTING</div>
                    <div className="table-cell pb-6">AUTHOR / VENDOR</div>
                    <div className="table-cell pb-6">PRICING MODEL</div>
                    <div className="table-cell pb-6">INSTALLS</div>
                    <div className="table-cell pb-6 text-right">ACTION</div>
                </div>

                {/* Live Listing */}
                <div className="table-row group hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="table-cell py-8 border-t border-gray-100 align-middle">
                        <div className="flex items-center space-x-6">
                            <div
                                className="w-12 h-12 bg-black flex items-center justify-center font-bold text-white title-3 tracking-tighter">
                                S</div>
                            <div>
                                <span className="title-3 block mb-1">SEO Optimizer Bot</span>
                                <span className="label-mono text-status-green border border-status-green px-1">LIVE</span>
                            </div>
                        </div>
                    </div>
                    <div className="table-cell py-8 border-t border-gray-100 align-middle body-small text-gray-500">
                        MarketingPros Inc.
                    </div>
                    <div className="table-cell py-8 border-t border-gray-100 align-middle">
                        <span className="body-base text-gray-900 font-medium">$29 / mo</span>
                    </div>
                    <div className="table-cell py-8 border-t border-gray-100 align-middle title-3 text-gray-900">
                        1,420
                    </div>
                    <div className="table-cell py-8 border-t border-gray-100 align-middle text-right">
                        <button className="label-mono text-gray-300 hover:text-status-red transition-colors">DELIST</button>
                    </div>
                </div>

                {/* Pending Review Listing */}
                <div className="table-row group hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="table-cell py-8 border-t border-gray-100 align-middle">
                        <div className="flex items-center space-x-6">
                            <div
                                className="w-12 h-12 bg-gray-100 flex items-center justify-center font-bold text-black title-3 tracking-tighter border border-dashed border-black">
                                F</div>
                            <div>
                                <span className="title-3 block mb-1">Forex Arbitrage Sniffer</span>
                                <span className="label-mono text-status-red border border-status-red px-1 bg-red-50">MANUAL
                                    REVIEW REQUIRED</span>
                            </div>
                        </div>
                    </div>
                    <div className="table-cell py-8 border-t border-gray-100 align-middle body-small text-gray-500">
                        @quant_anon
                    </div>
                    <div className="table-cell py-8 border-t border-gray-100 align-middle">
                        <span className="body-base text-gray-900 font-medium">$500 + 0.1% transaction</span>
                    </div>
                    <div className="table-cell py-8 border-t border-gray-100 align-middle title-3 text-gray-300">
                        0
                    </div>
                    <div className="table-cell py-8 border-t border-gray-100 align-middle text-right">
                        <button
                            className="label-mono bg-black text-white px-4 py-2 hover:bg-gray-900 transition-colors">REVIEW
                            SPEC</button>
                    </div>
                </div>

            </div>

        </div>

    </main>
    </>
  );
}

export default AgentMarketplace;
