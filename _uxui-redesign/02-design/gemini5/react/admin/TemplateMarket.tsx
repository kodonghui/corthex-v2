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

function TemplateMarket() {
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
                        {/* GET /api/admin/market/templates */}
                        <li><a href="/app/template-market" className="title-3 transition-colors">Preset Market</a></li>
                        <li><a href="/app/agent-marketplace"
                                className="body-base text-gray-500 hover:text-black transition-colors">Agent Market</a></li>
                    </ul>
                </li>
            </ul>
        </div>
    </nav>

    <main className="flex-1 overflow-y-auto p-16 lg:p-32 bg-white">

        <header className="mb-32 flex justify-between items-end border-b border-black pb-8">
            <div>
                <h1 className="title-display mb-6">Template Market Admin</h1>
                <p className="body-base max-w-2xl text-gray-500">
                    Curation and pricing controls for the public facing department & org preset marketplace.
                </p>
            </div>
            <button
                className="label-mono border border-black text-black px-6 py-3 hover:bg-black hover:text-white transition-colors">REVIEW
                SUBMISSIONS</button>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-24">

            {/* Curated Promoted Templates */}
            <section>
                <h2 className="label-mono text-gray-500 mb-8 border-b border-gray-100 pb-2">FEATURED IN TENANT HUB</h2>

                <div className="space-y-8">
                    <div className="border border-black p-8 group flex items-start justify-between">
                        <div>
                            <span className="label-mono bg-black text-white px-2 py-1 mb-4 inline-block">SYSTEM
                                OFFICIAL</span>
                            <h3 className="title-2 mb-2">Enterprise HR Core</h3>
                            <p className="body-small text-gray-500 max-w-sm mb-4">Handles recruitment processing, employee
                                queries, and policy QA across the vector DB.</p>
                            <span className="title-3 text-black font-medium">Included in Base</span>
                        </div>
                        <div className="text-right">
                            <span className="label-mono text-gray-300 block mb-2">INSTALLS</span>
                            <span className="title-3 block mb-6">412</span>
                            <button
                                className="label-mono text-gray-500 hover:text-black transition-colors">UNFEATURE</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Community Approvals */}
            <section>
                <h2 className="label-mono text-gray-500 mb-8 border-b border-gray-100 pb-2">COMMUNITY MONETIZATION LISTINGS
                </h2>

                <div className="space-y-8">
                    <div
                        className="border border-gray-200 p-8 group flex items-start justify-between hover:border-black transition-colors">
                        <div>
                            <span
                                className="label-mono border border-gray-300 text-gray-500 px-2 py-1 mb-4 inline-block">PARTNER:
                                QUANT_LOGIC</span>
                            <h3 className="title-2 mb-2">HFT Arb Pod</h3>
                            <p className="body-small text-gray-500 max-w-sm mb-4">High-Frequency Sentiment Analysis +
                                Execution strategy pod. Uses 3 specialized agents.</p>
                            <span className="title-3 text-status-green font-medium">$499 / mo</span>
                        </div>
                        <div className="text-right">
                            <span className="label-mono text-gray-300 block mb-2">REVENUE SHARE</span>
                            <span className="title-3 block mb-6">15%</span>
                            <button className="label-mono text-black border-b border-black">EDIT TERMS</button>
                        </div>
                    </div>

                    <div className="border border-gray-200 p-8 group flex items-start justify-between bg-gray-50">
                        <div>
                            <span
                                className="label-mono text-status-red border border-status-red px-2 py-1 mb-4 inline-block">PENDING
                                APPROVAL</span>
                            <h3 className="title-2 mb-2 text-gray-500">Legal Audit Shell</h3>
                            <p className="body-small text-gray-500 max-w-sm">Submitted by 'Dev_LegalTech'. Awaiting QA
                                review for prompt injection vulnerabilities.</p>
                        </div>
                        <div className="text-right flex flex-col items-end space-y-4 pt-12">
                            <button
                                className="label-mono bg-black text-white px-4 py-2 hover:bg-gray-900 transition-colors w-full">APPROVE</button>
                            <button
                                className="label-mono text-status-red border border-status-red px-4 py-2 hover:bg-red-50 w-full transition-colors">REJECT</button>
                        </div>
                    </div>
                </div>
            </section>

        </div>

    </main>
    </>
  );
}

export default TemplateMarket;
