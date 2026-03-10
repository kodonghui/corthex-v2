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

function OrgTemplates() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
<nav className="w-72 flex flex-col justify-between py-12 px-10 flex-shrink-0 bg-gray-50">
        <div>
            <div className="mb-24 flex items-center">
                <span className="title-2 tracking-tighter">CORTHEX</span>
                <span className="label-mono ml-3 text-status-red bg-red-50 px-2 py-1">ADMIN</span>
            </div>

            <ul className="space-y-10">
                <li><a href="/app/dashboard" className="body-base text-gray-500 hover:text-black transition-colors">Platform
                        Overview</a></li>
                <li className="space-y-6 pt-4">
                    <span className="label-mono text-gray-300 block mb-4">ORG STRUCTURES</span>
                    <ul className="space-y-6 pl-4">
                        <li><a href="/app/departments"
                                className="body-base text-gray-500 hover:text-black transition-colors">Dept Templates</a>
                        </li>
                        <li><a href="/app/org-chart"
                                className="body-base text-gray-500 hover:text-black transition-colors">Global
                                Connectivity</a></li>
                        {/* GET /api/admin/org-templates */}
                        <li><a href="/app/org-templates" className="title-3 transition-colors">Org Chart Presets</a></li>
                    </ul>
                </li>
            </ul>
        </div>
    </nav>

    <main className="flex-1 overflow-y-auto p-16 lg:p-32 bg-white">

        <header className="mb-32 flex justify-between items-end border-b border-black pb-8">
            <div>
                <h1 className="title-display mb-6">Org Chart Presets</h1>
                <p className="body-base max-w-2xl text-gray-500">
                    Macro-level organizational blueprints that assemble multiple departments into a cohesive company
                    structure. Used during tenant onboarding.
                </p>
            </div>
            <button className="bg-black text-white px-8 py-3 label-mono hover:bg-gray-900 transition-colors">CREATE NEW
                PRESET</button>
        </header>

        <div className="space-y-16">

            {/* Preset Item */}
            <div className="border border-gray-200 p-12 hover:border-black transition-colors group">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="title-1 tracking-tight mb-2">Hedge Fund Starter Pack</h2>
                        <span className="label-mono text-gray-500">PRESET ID: PRE-FIN-A</span>
                    </div>
                </div>

                <p className="body-base text-gray-500 mb-12 max-w-3xl">
                    Standard layout for medium-sized algorithmic trading firms. Prioritizes low-latency strategy
                    execution and stringent compliance logging.
                </p>

                <div className="grid grid-cols-3 gap-8 mb-8">
                    <div className="bg-gray-50 p-6 border border-gray-100">
                        <span className="label-mono text-black block mb-2">D1: STRATEGY</span>
                        <ul className="body-small text-gray-500 space-y-1 list-disc pl-4">
                            <li>CIO (Mgr)</li>
                            <li>Quant Dev (Spec)</li>
                        </ul>
                    </div>
                    <div className="bg-gray-50 p-6 border border-gray-100">
                        <span className="label-mono text-gray-500 block mb-2">D2: COMPLIANCE</span>
                        <ul className="body-small text-gray-500 space-y-1 list-disc pl-4">
                            <li>Risk Officer (Mgr)</li>
                            <li>Auditor (Spec)</li>
                        </ul>
                    </div>
                    <div className="bg-gray-50 p-6 border border-gray-100">
                        <span className="label-mono text-gray-500 block mb-2">D3: OPERATIONS</span>
                        <ul className="body-small text-gray-500 space-y-1 list-disc pl-4">
                            <li>Systems Lead (Mgr)</li>
                        </ul>
                    </div>
                </div>

                <button className="label-mono text-black border-b border-black pb-1 hover:text-gray-500">EDIT PRESET
                    TOPOLOGY -> </button>
            </div>

            {/* Preset Item */}
            <div className="border border-gray-200 p-12 hover:border-black transition-colors group">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="title-1 tracking-tight mb-2">Aggressive Marketing Agency</h2>
                        <span className="label-mono text-gray-500">PRESET ID: PRE-MKT-B</span>
                    </div>
                </div>

                <p className="body-base text-gray-500 mb-12 max-w-3xl">
                    High volume content generation structure with multiple interconnected writer nodes and a centralized
                    quality gate.
                </p>

                <div className="grid grid-cols-3 gap-8 mb-8">
                    <div className="bg-white p-6 border border-gray-200">
                        <span className="label-mono text-black block mb-2">D1: BRANDING</span>
                        <ul className="body-small text-gray-500 space-y-1 list-disc pl-4">
                            <li>Creative Dir (Mgr)</li>
                        </ul>
                    </div>
                    <div className="bg-white p-6 border border-gray-200">
                        <span className="label-mono text-gray-500 block mb-2">D2: CONTENT POD A</span>
                        <ul className="body-small text-gray-500 space-y-1 list-disc pl-4">
                            <li>Writer (Spec) x3</li>
                        </ul>
                    </div>
                    <div className="bg-white p-6 border border-gray-200">
                        <span className="label-mono text-gray-500 block mb-2">D3: DISTRIBUTION</span>
                        <ul className="body-small text-gray-500 space-y-1 list-disc pl-4">
                            <li>Growth Hacker (Mgr)</li>
                            <li>SNS Auto-Poster (Script)</li>
                        </ul>
                    </div>
                </div>

                <button className="label-mono text-black border-b border-black pb-1 hover:text-gray-500">EDIT PRESET
                    TOPOLOGY -> </button>
            </div>

        </div>

    </main>
    </>
  );
}

export default OrgTemplates;
