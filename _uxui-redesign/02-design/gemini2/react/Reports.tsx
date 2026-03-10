"use client";
import React from "react";

const styles = `
body {
            background-color: #F4F4F0;
            color: #1E1E1E;
        }

        .neo-border {
            border: 3px solid #1E1E1E;
        }

        .neo-shadow {
            box-shadow: 4px 4px 0px 0px rgba(30, 30, 30, 1);
        }

        .neo-shadow-sm {
            box-shadow: 2px 2px 0px 0px rgba(30, 30, 30, 1);
        }

        .neo-card {
            border: 3px solid #1E1E1E;
            box-shadow: 8px 8px 0px 0px rgba(30, 30, 30, 1);
            background-color: white;
        }

        .neo-btn {
            border: 3px solid #1E1E1E;
            box-shadow: 4px 4px 0px 0px rgba(30, 30, 30, 1);
            transition: all 0.1s ease-in-out;
            font-weight: 700;
            cursor: pointer;
        }

        .neo-btn:hover {
            transform: translate(-2px, -2px);
            box-shadow: 6px 6px 0px 0px rgba(30, 30, 30, 1);
        }

        .neo-btn:active {
            transform: translate(4px, 4px);
            box-shadow: 0px 0px 0px 0px rgba(30, 30, 30, 1);
        }

        .nav-item.active {
            background-color: #BFFF00;
            border: 3px solid #1E1E1E;
            box-shadow: 2px 2px 0px 0px rgba(30, 30, 30, 1);
        }

        .nav-item:hover:not(.active) {
            background-color: #E5E5E5;
        }

        ::-webkit-scrollbar {
            width: 10px;
            height: 10px;
            border-left: 3px solid #1E1E1E;
            border-top: 3px solid #1E1E1E;
        }

        ::-webkit-scrollbar-track {
            background: #F4F4F0;
        }

        ::-webkit-scrollbar-thumb {
            background: #1E1E1E;
            border: 2px solid #F4F4F0;
        }
`;

function Reports() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Sidebar Navigation */}
    <nav className="w-64 border-r-3 border-neo-black bg-white flex flex-col h-full z-10 shrink-0">
        <div className="p-6 border-b-3 border-neo-black bg-neo-yellow">
            <h1 className="text-3xl font-black tracking-tight uppercase">CORTHEX</h1>
            <p className="font-bold text-xs mt-1 bg-white inline-block px-1 neo-border">WORKSPACE</p>
        </div>
        <div className="flex-grow overflow-y-auto p-4 space-y-2">
            <a href="/app/home" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">H</span> Home
            </a>
            <div className="pt-4 border-t-3 border-neo-black mt-4 mb-2"></div>
            <a href="/app/reports" className="nav-item active flex items-center gap-3 p-3 font-bold transition-colors">
                <span
                    className="w-6 h-6 bg-neo-blue text-white flex items-center justify-center neo-border text-xs shadow-[2px_2px_0px_#000]">R</span>
                Reports
            </a>
            <a href="/app/ops-log" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">L</span> Ops Log
            </a>
            <a href="/app/jobs" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">J</span> Batch Jobs
            </a>
        </div>
    </nav>

    {/* Main Content */}
    <main className="flex-grow flex flex-col h-full bg-neo-bg overflow-y-auto w-full">

        {/* Topbar */}
        <header
            className="h-16 border-b-3 border-neo-black bg-white flex items-center justify-between px-8 sticky top-0 z-20 shrink-0">
            <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black uppercase">Report Archive</h2>
            </div>
            <div className="flex items-center gap-4">
                <button className="neo-btn bg-neo-lime px-4 py-1.5 text-sm uppercase tracking-wide">Generate New</button>
            </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8 w-full">

            <div className="flex gap-4 mb-4">
                <button
                    className="bg-neo-black text-white px-4 py-2 text-sm font-bold uppercase border-3 border-neo-black shadow-[4px_4px_0px_#FFF]">All
                    (24)</button>
                <button
                    className="bg-white hover:bg-neo-yellow px-4 py-2 text-sm font-bold uppercase border-3 border-neo-black shadow-[4px_4px_0px_#000] transition-colors text-gray-400 hover:text-black">Sales
                    & Marketing (12)</button>
                <button
                    className="bg-white hover:bg-neo-yellow px-4 py-2 text-sm font-bold uppercase border-3 border-neo-black shadow-[4px_4px_0px_#000] transition-colors text-gray-400 hover:text-black">Financial
                    (8)</button>
                <button
                    className="bg-white hover:bg-neo-yellow px-4 py-2 text-sm font-bold uppercase border-3 border-neo-black shadow-[4px_4px_0px_#000] transition-colors text-gray-400 hover:text-black">System
                    Ops (4)</button>
            </div>

            {/* Report Grid */}
            {/* API: GET /api/workspace/reports */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                {/* Report Item 1 */}
                <div
                    className="neo-card bg-white flex flex-col group cursor-pointer hover:-translate-y-2 transition-transform">
                    <div
                        className="aspect-[4/3] bg-neo-pink border-b-3 border-neo-black p-6 relative overflow-hidden flex flex-col justify-between">
                        {/* Decorative background */}
                        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100"
                            preserveAspectRatio="none">
                            <polygon fill="#1E1E1E" points="0,100 100,0 100,100" />
                        </svg>

                        <div className="relative z-10 flex justify-between items-start">
                            <span
                                className="bg-white text-neo-black text-xs font-black uppercase tracking-widest px-2 py-1 border-2 border-black shadow-[2px_2px_0px_#000]">Financial</span>
                            <span
                                className="w-8 h-8 rounded-full bg-neo-lime border-2 border-black flex items-center justify-center font-bold text-xs"
                                title="Generated by CIO">CIO</span>
                        </div>
                        <h3 className="relative z-10 text-white font-black text-2xl uppercase leading-tight mt-auto">Q3
                            Portfolio Review & Forecasting</h3>
                    </div>
                    <div className="p-6 flex-grow flex flex-col bg-white">
                        <p className="text-sm font-medium text-gray-700 mb-4 line-clamp-3">Comprehensive analysis of Q3
                            algorithmic trades, highlighted by a +12% return on Tech equities. Includes risk analysis
                            for Q4 based on macro events.</p>

                        <div className="mt-auto space-y-3">
                            <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase">
                                <span>Generated: 2 days ago</span>
                                <span>PDF / HTML</span>
                            </div>
                            <div className="w-full h-1 bg-gray-200"></div>
                            <div className="flex gap-2">
                                <button
                                    className="flex-1 bg-neo-black text-white neo-border py-2 text-xs font-bold uppercase hover:bg-neo-yellow hover:text-neo-black transition-colors">View
                                    Report</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Report Item 2 */}
                <div
                    className="neo-card bg-white flex flex-col group cursor-pointer hover:-translate-y-2 transition-transform">
                    <div
                        className="aspect-[4/3] bg-neo-blue border-b-3 border-neo-black p-6 relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute inset-0"
                            style={{backgroundImage: "radial-gradient(#1E1E1E 2px, transparent 2px)", backgroundSize: "16px 16px", opacity: "0.1"}}>
                        </div>

                        <div className="relative z-10 flex justify-between items-start">
                            <span
                                className="bg-white text-neo-black text-xs font-black uppercase tracking-widest px-2 py-1 border-2 border-black shadow-[2px_2px_0px_#000]">Sales
                                & Mktg</span>
                            <span
                                className="w-8 h-8 rounded-full bg-neo-yellow border-2 border-black flex items-center justify-center font-bold text-xs"
                                title="Generated by CMO">CMO</span>
                        </div>
                        <h3
                            className="relative z-10 text-neo-black font-black text-2xl uppercase leading-tight mt-auto bg-white px-2 py-1 inline-block w-fit">
                            Weekly Lead Gen Summary</h3>
                    </div>
                    <div className="p-6 flex-grow flex flex-col bg-white">
                        <p className="text-sm font-medium text-gray-700 mb-4 line-clamp-3">Automated collection of leads
                            from X/LinkedIn campaigns. Suggests a 15% increase in conversion following the new content
                            strategy.</p>

                        <div className="mt-auto space-y-3">
                            <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase">
                                <span>Generated: Today, 09:00</span>
                                <span>Markdown</span>
                            </div>
                            <div className="w-full h-1 bg-gray-200"></div>
                            <div className="flex gap-2">
                                <button
                                    className="flex-1 bg-neo-black text-white neo-border py-2 text-xs font-bold uppercase hover:bg-neo-yellow hover:text-neo-black transition-colors">View
                                    Report</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Daily Brief (Special) */}
                <div
                    className="neo-card bg-neo-yellow flex flex-col group cursor-pointer hover:-translate-y-2 transition-transform border-[6px] border-neo-black">
                    <div className="p-6 h-full flex flex-col relative">
                        <div className="absolute top-4 right-4 text-4xl font-black opacity-20 rotate-12">★</div>
                        <h4 className="font-black uppercase text-sm border-b-2 border-black pb-1 mb-4">Command Brief</h4>
                        <h3 className="font-black text-3xl uppercase leading-tight mb-4">Good Morning, Commander.</h3>
                        <p className="text-sm font-bold text-gray-800 mb-4">Here is your customized daily rundown compiled
                            by Chief of Staff.</p>

                        <ul className="space-y-2 text-sm font-bold list-disc pl-5 marker:text-neo-pink flex-grow">
                            <li>3 Agents need budget approval</li>
                            <li>Critical Slack message in #general</li>
                            <li>TSLA hit target price</li>
                        </ul>

                        <button
                            className="neo-btn bg-white w-full py-4 text-base tracking-widest uppercase mt-6 shadow-[6px_6px_0px_#000]">Read
                            Brief</button>
                    </div>
                </div>

            </div>
        </div>
    </main>
    </>
  );
}

export default Reports;
