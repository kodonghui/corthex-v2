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

function Reports() {
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
                {/* GET /api/workspace/reports */}
                <li className="pt-6 border-t border-gray-100 mt-6"><a href="/app/reports"
                        className="title-3 font-medium transition-colors">Reports</a></li>
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

    {/* Main Content: Reports Split View */}
    <main className="flex-1 flex overflow-hidden">

        {/* Left: Reports List */}
        <div className="w-1/3 min-w-[350px] border-r border-gray-100 flex flex-col bg-white">
            <div className="p-12 pb-8 border-b border-black">
                <h2 className="title-1 mb-6">Intelligence</h2>

                <div className="flex space-x-6 border-b border-gray-100 pb-2">
                    {/* GET /api/workspace/reports?status=review */}
                    <button className="label-mono text-black font-semibold">FOR REVIEW (1)</button>
                    {/* GET /api/workspace/reports */}
                    <button className="label-mono text-gray-300 hover:text-black transition-colors">ARCHIVE</button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">

                <div className="p-8 border-b border-gray-100 bg-gray-50 cursor-pointer border-l-4 border-black">
                    <div className="flex justify-between items-start mb-2">
                        <span className="label-mono text-gray-500">MKTG / 2h ago</span>
                        <span className="label-mono text-black font-bold">REQ. REVIEW</span>
                    </div>
                    <h3 className="title-3 leading-snug text-gray-900 mb-2">Q4 Competitor Positioning Analysis</h3>
                    <p className="body-small text-gray-500 truncate">Synthesized from 12 URLs and 3 PDF reports.</p>
                </div>

                <div
                    className="p-8 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors border-l-4 border-transparent">
                    <div className="flex justify-between items-start mb-2">
                        <span className="label-mono text-gray-500">STRATEGY / Yesterday</span>
                        <span className="label-mono text-gray-300">PUBLISHED</span>
                    </div>
                    <h3 className="title-3 leading-snug text-gray-500 mb-2">Semiconductor Sector Deep Dive</h3>
                    <p className="body-small text-gray-300 truncate">Cost: $4.12 / 82,000 tokens</p>
                </div>

            </div>
        </div>

        {/* Right: Report Document View */}
        {/* API: GET /api/workspace/reports/:id */}
        <div className="flex-1 flex flex-col bg-white h-full relative">
            <header className="p-12 lg:px-24 border-b border-gray-100 flex justify-between items-end shrink-0">
                <div className="max-w-2xl">
                    <div className="label-mono text-gray-500 mb-4">REPORT ID: RPT-2026-MKT-094</div>
                    <h1 className="title-2 mb-2">Q4 Competitor Positioning Analysis</h1>
                    <p className="body-base text-gray-500">Author: Chief Marketing Officer (Sonnet 3.5)</p>
                </div>
                {/* GET /api/workspace/reports/:id/pdf */}
                <button
                    className="label-mono border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors">Export
                    PDF</button>
            </header>

            <div className="flex-1 p-12 lg:px-24 overflow-y-auto max-w-4xl mx-auto w-full">

                <div className="prose prose-lg max-w-none text-gray-900 leading-relaxed font-serif">
                    <h2 className="font-sans font-bold text-2xl mb-6">Executive Summary</h2>
                    <p className="mb-6">
                        Competitor A has shifted their messaging towards "Ease of Use" for enterprise clients,
                        de-emphasizing raw performance metrics. This leaves a gap in the market for our
                        "High-Performance / Engineer-First" positioning.
                    </p>

                    <h2 className="font-sans font-bold text-2xl mb-6 mt-12">Actionable Intelligence</h2>
                    <ul className="list-disc pl-6 space-y-2 mb-6 text-gray-600">
                        <li>Increase social media tempo regarding benchmark results.</li>
                        <li>Update landing page Header 1 to emphasize "Zero Latency" rather than "Simple Integration."
                        </li>
                        <li>Draft a technical whitepaper contrasting our system architecture with industry standard
                            (Competitor A).</li>
                    </ul>

                    <h2 className="font-sans font-bold text-2xl mb-6 mt-12">Quality Gate Assessment</h2>
                    <div className="bg-gray-50 p-6 border-l-2 border-black font-sans text-sm text-gray-500">
                        Evaluated by: Secretary General<br />
                        Confidence Score: 0.94<br />
                        Notes: Met all formatting requirements. Citations correctly linked to internal knowledge base.
                        Action items are concrete.
                    </div>
                </div>

            </div>

            {/* Sticky Actions */}
            <div
                className="absolute bottom-0 w-full bg-white p-8 border-t border-gray-100 flex justify-end items-center space-x-4">
                {/* PATCH /api/workspace/reports/:id/feedback */}
                <button
                    className="label-mono text-black border border-black px-6 py-3 hover:bg-gray-100 transition-colors">REQUEST
                    REWRITE</button>
                {/* POST /api/workspace/reports/:id/approve */}
                <button className="label-mono bg-black text-white px-6 py-3 hover:bg-gray-900 transition-colors">APPROVE
                    REPORT</button>
            </div>
        </div>

    </main>
    </>
  );
}

export default Reports;
