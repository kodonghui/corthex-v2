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

function Files() {
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
                <li><a href="/app/knowledge" className="body-small hover:text-gray-500 transition-colors pl-4">Knowledge
                        Base</a></li>
                {/* GET /api/workspace/files */}
                <li><a href="/app/files"
                        className="title-3 font-medium transition-colors border-l-2 border-black pl-4">Files & Assets</a>
                </li>
                <li><a href="/app/costs" className="body-small hover:text-black transition-colors mt-4">Costs</a></li>
            </ul>
        </div>
    </nav>

    <main className="flex-1 flex flex-col bg-white h-full relative">

        <header className="p-12 lg:px-24 border-b border-gray-100 shrink-0 flex justify-between items-end">
            <div>
                <h1 className="title-display mb-2">Drive</h1>
                <p className="body-base text-gray-500">
                    Raw file storage. PDFs, CSVs, and context files before ingestion to Knowledge DB.
                </p>
            </div>
            <div className="flex space-x-4">
                <button
                    className="label-mono border border-gray-300 text-gray-500 px-4 py-2 hover:border-black hover:text-black transition-colors">NEW
                    FOLDER</button>
                {/* POST /api/workspace/files/upload */}
                <button className="bg-black text-white px-6 py-2 label-mono hover:bg-gray-900 transition-colors">UPLOAD
                    FILE</button>
            </div>
        </header>

        <div className="p-4 px-12 lg:px-24 border-b border-gray-100 bg-gray-50 flex space-x-6 text-label-mono">
            <button className="label-mono text-black font-semibold">/ root</button>
            <button className="label-mono text-gray-500 hover:text-black transition-colors">/ Q3_Financials</button>
        </div>

        <div className="flex-1 overflow-y-auto px-12 lg:px-24 py-8">

            {/* Header Row */}
            <div className="grid grid-cols-12 gap-4 pb-4 border-b border-black label-mono text-gray-500">
                <div className="col-span-6">NAME</div>
                <div className="col-span-2">SIZE</div>
                <div className="col-span-2">SYNC STATE</div>
                <div className="col-span-2 text-right">DATE</div>
            </div>

            {/* List (GET /api/workspace/files) */}
            <div
                className="grid grid-cols-12 gap-4 py-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors items-center group">
                <div className="col-span-6 flex items-center space-x-4">
                    <span className="font-mono text-gray-300">📄</span>
                    <span className="body-base font-medium group-hover:underline">aapl_q3_report.pdf</span>
                </div>
                <div className="col-span-2 body-base text-gray-500">4.2 MB</div>
                <div className="col-span-2">
                    <span className="label-mono text-status-green border border-status-green px-2 py-1">VECTORIZED</span>
                </div>
                <div className="col-span-2 text-right body-small text-gray-500">Oct 24, 2026</div>
            </div>

            <div
                className="grid grid-cols-12 gap-4 py-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors items-center group">
                <div className="col-span-6 flex items-center space-x-4">
                    <span className="font-mono text-gray-300">📄</span>
                    <span className="body-base font-medium group-hover:underline">msft_earnings_call.txt</span>
                </div>
                <div className="col-span-2 body-base text-gray-500">142 KB</div>
                <div className="col-span-2">
                    <span className="label-mono text-status-green border border-status-green px-2 py-1">VECTORIZED</span>
                </div>
                <div className="col-span-2 text-right body-small text-gray-500">Oct 23, 2026</div>
            </div>

            <div
                className="grid grid-cols-12 gap-4 py-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors items-center group">
                <div className="col-span-6 flex items-center space-x-4">
                    <span className="font-mono text-gray-300">📊</span>
                    <span className="body-base font-medium group-hover:underline">trading_log_2026_Q2.csv</span>
                </div>
                <div className="col-span-2 body-base text-gray-500">12.8 MB</div>
                <div className="col-span-2">
                    <span className="label-mono text-gray-500 border border-gray-300 px-2 py-1 text-black">RAW
                        (PENDING)</span>
                </div>
                <div className="col-span-2 text-right body-small text-gray-500">Jul 01, 2026</div>
            </div>

            {/* Folder */}
            <div
                className="grid grid-cols-12 gap-4 py-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors items-center group">
                <div className="col-span-6 flex items-center space-x-4">
                    <span className="font-mono text-black">📁</span>
                    <span className="body-base font-medium group-hover:underline">Archive_2025</span>
                </div>
                <div className="col-span-2 body-base text-gray-500">--</div>
                <div className="col-span-2">
                    <span className="label-mono text-gray-300">-</span>
                </div>
                <div className="col-span-2 text-right body-small text-gray-500">Dec 31, 2025</div>
            </div>

        </div>

        {/* Drag & Drop Zone Overlay (Hidden by default, shown on drag) */}
        {/* <div className="absolute inset-0 bg-white/90 z-50 border-4 border-dashed border-black m-8 flex items-center justify-center pointer-events-none opacity-0">
            <span className="title-1">DROP TO UPLOAD TO /Q3_Financials</span>
        </div> */}

    </main>
    </>
  );
}

export default Files;
