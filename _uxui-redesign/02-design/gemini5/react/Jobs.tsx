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

function Jobs() {
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
                {/* GET /api/workspace/jobs */}
                <li><a href="/app/jobs" className="title-3 font-medium transition-colors border-l-2 border-black pl-4">Jobs
                        / Pipelines</a></li>
                <li><a href="/app/agents" className="body-small hover:text-black transition-colors mt-4">Agents</a></li>
                <li><a href="/app/knowledge" className="body-small hover:text-black transition-colors">Knowledge</a></li>
                <li><a href="/app/costs" className="body-small hover:text-black transition-colors">Costs</a></li>
            </ul>
        </div>
    </nav>

    <main className="flex-1 overflow-y-auto p-12 lg:p-24 relative bg-white">

        <header className="mb-24 flex justify-between items-end">
            <div>
                {/* GET /api/workspace/jobs/stats */}
                <h1 className="title-display mb-6">Running Jobs</h1>
                <p className="body-base max-w-2xl text-gray-500">
                    Background operations, asynchronous orchestrations, and cron workflows executed by the agent swarm.
                </p>
            </div>
            <div className="text-right">
                <span className="label-mono text-gray-300 block mb-2">ACTIVE THREADS</span>
                <span className="title-2">4 <span className="text-gray-300">/ 20 Limit</span></span>
            </div>
        </header>

        {/* Ongoing Jobs */}
        <section className="mb-24">
            <h2 className="label-mono text-black mb-8 border-b border-black pb-4">In Progress (2)</h2>
            <div className="space-y-6">

                {/* Single Job Card (GET /api/workspace/jobs?status=running) */}
                <div className="border border-black p-8 group relative bg-gray-50">
                    <div className="absolute top-8 right-8">
                        {/* POST /api/workspace/jobs/:id/cancel */}
                        <button className="label-mono text-status-red hover:opacity-70">TERMINATE</button>
                    </div>

                    <div className="flex items-center space-x-3 mb-6">
                        <span className="w-2 h-2 rounded-full bg-status-green animate-pulse"></span>
                        <span className="label-mono text-black">JOB-X77</span>
                        <span className="label-mono text-gray-500">Started 14m ago</span>
                    </div>

                    <h3 className="title-2 mb-4">Ingest & Vectorize SEC Q3 Filings for Tech Sector</h3>

                    <div className="mb-6">
                        <div className="flex justify-between items-end mb-2">
                            <span className="body-small text-gray-500">Processing 80+ PDFs...</span>
                            <span className="label-mono text-black">64%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100">
                            <div className="h-full bg-black" style={{width: "64%"}}></div>
                        </div>
                    </div>

                    <div className="flex space-x-8 border-t border-gray-300 pt-4">
                        <div>
                            <span className="label-mono text-gray-500 block mb-1">OWNER</span>
                            <span className="body-small text-black font-medium">Data Scraper (MKTG)</span>
                        </div>
                        <div>
                            <span className="label-mono text-gray-500 block mb-1">TOKENS USED</span>
                            <span className="body-small text-black font-medium">~1.2M</span>
                        </div>
                        <div>
                            <span className="label-mono text-gray-500 block mb-1">PIPELINE</span>
                            <span className="body-small text-gray-500">Ingest -> Chunk -> Embed -> PGVector</span>
                        </div>
                    </div>
                </div>

                {/* Another Running Job */}
                <div className="border border-gray-300 p-8 group relative bg-white">
                    <div className="absolute top-8 right-8">
                        <button className="label-mono text-status-red hover:opacity-70">TERMINATE</button>
                    </div>

                    <div className="flex items-center space-x-3 mb-6">
                        <span className="w-2 h-2 rounded-full bg-black animate-pulse"></span>
                        <span className="label-mono text-black">JOB-X78</span>
                        <span className="label-mono text-gray-500">Started 2m ago</span>
                    </div>

                    <h3 className="title-2 mb-4">Competitor Marketing Tone Analysis</h3>

                    <div className="mb-6">
                        <div className="flex justify-between items-end mb-2">
                            <span className="body-small text-gray-500">Fetching sub-pages for [competitor_A]...</span>
                            <span className="label-mono text-black">12%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100">
                            <div className="h-full bg-gray-500" style={{width: "12%"}}></div>
                        </div>
                    </div>
                </div>

            </div>
        </section>

        {/* Scheduled / Cron Jobs */}
        <section>
            <h2 className="label-mono text-black mb-8 border-b border-black pb-4">Scheduled Workflows (GET
                /api/workspace/jobs/cron)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                <div className="border border-gray-200 p-6 hover:border-black transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                        <span className="label-mono px-2 py-1 bg-gray-100 text-black">0 14 * * *</span>
                        <span className="label-mono text-gray-300">CRON</span>
                    </div>
                    <h4 className="title-3 mb-2">Daily Portfolio Rebalance Sync</h4>
                    <p className="body-small text-gray-500 mb-6">Checks KIS external holdings against CIO strategy model.
                    </p>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <span className="label-mono text-black">Next: In 4h</span>
                        {/* PUT /api/workspace/jobs/cron/:id/toggle */}
                        <button className="label-mono text-status-green">ACTIVE</button>
                    </div>
                </div>

                <div className="border border-gray-200 p-6 hover:border-black transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                        <span className="label-mono px-2 py-1 bg-gray-100 text-black">0 9 * * 1</span>
                        <span className="label-mono text-gray-300">CRON</span>
                    </div>
                    <h4 className="title-3 mb-2">Weekly Executive Summary</h4>
                    <p className="body-small text-gray-500 mb-6">Generates cross-departmental roll-up report for CEO.</p>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <span className="label-mono text-black">Next: Monday</span>
                        <button className="label-mono text-status-green">ACTIVE</button>
                    </div>
                </div>

                {/* Add New Cron */}
                <div
                    className="border border-dashed border-gray-300 p-6 flex flex-col items-center justify-center hover:border-black transition-colors cursor-pointer text-center min-h-[220px]">
                    <span className="title-2 text-gray-300 mb-2">+</span>
                    <span className="label-mono text-black">CREATE RECURRING JOB</span>
                </div>

            </div>
        </section>

    </main>
    </>
  );
}

export default Jobs;
