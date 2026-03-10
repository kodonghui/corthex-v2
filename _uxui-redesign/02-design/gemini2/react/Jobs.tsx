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

function Jobs() {
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
            <a href="/app/reports" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">R</span> Reports
            </a>
            <a href="/app/ops-log" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">L</span> Ops Log
            </a>
            <a href="/app/jobs" className="nav-item active flex items-center gap-3 p-3 font-bold transition-colors">
                <span
                    className="w-6 h-6 bg-neo-orange text-white flex items-center justify-center neo-border text-xs shadow-[2px_2px_0px_#000]">J</span>
                Batch Jobs
            </a>
        </div>
    </nav>

    {/* Main Content */}
    <main className="flex-grow flex flex-col h-full bg-neo-bg overflow-y-auto w-full">

        {/* Topbar */}
        <header
            className="h-16 border-b-3 border-neo-black bg-white flex items-center justify-between px-8 sticky top-0 z-20 shrink-0">
            <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black uppercase">Cron & Batch Jobs</h2>
            </div>
            <div className="flex items-center gap-4">
                {/* API: POST /api/workspace/jobs */}
                <button className="neo-btn bg-neo-lime px-4 py-1.5 text-sm uppercase tracking-wide">Schedule Job</button>
            </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto space-y-8 w-full">

            <div
                className="neo-card bg-white p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start justify-between shadow-[8px_8px_0px_#FF6600]">
                <div>
                    <h3 className="text-3xl font-black uppercase mb-3 flex items-center gap-3 text-neo-black">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            strokeWidth="3">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        Job Scheduler
                    </h3>
                    <p className="font-bold text-gray-700 max-w-xl">Configure agents to run tasks periodically without human
                        trigger. Perfect for daily digests, automated scrapers, or health checks.</p>
                </div>
            </div>

            {/* Jobs List */}
            {/* API: GET /api/workspace/jobs */}
            <div className="space-y-6">

                {/* Active Running Job */}
                <div
                    className="neo-card bg-white overflow-hidden flex flex-col md:flex-row shadow-[6px_6px_0px_#BFFF00] ring-4 ring-neo-lime group">
                    <div
                        className="w-full md:w-48 bg-neo-yellow border-b-3 md:border-b-0 md:border-r-3 border-neo-black p-6 flex flex-col justify-center items-center shrink-0">
                        <h4 className="font-black text-2xl">08:00</h4>
                        <span className="text-xs font-bold uppercase tracking-widest mt-1">Every Day</span>
                    </div>
                    <div className="p-6 flex-grow flex flex-col justify-center">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-black uppercase">Daily Industry News Scraper</h3>
                            <span
                                className="text-xs font-bold bg-neo-lime border border-black px-2 py-0.5 animate-pulse shadow-sm">RUNNING
                                (3m 2s)</span>
                        </div>
                        <p className="text-sm font-bold text-gray-600 mb-4">Fetches RSS feeds, analyzes sentiment via Claude
                            Haiku, and alerts #general.</p>

                        <div
                            className="flex items-center gap-2 text-xs font-bold mt-auto border-t-2 border-dashed border-gray-300 pt-3">
                            <span className="bg-neo-bg px-2 py-1 neo-border">Agent: Researcher Bot</span>
                            <span className="bg-neo-bg px-2 py-1 neo-border">Last: Success</span>
                            {/* API: POST /api/workspace/jobs/:id/stop */}
                            <button className="ml-auto text-neo-pink hover:underline">Halt Execution</button>
                        </div>
                    </div>
                </div>

                {/* Scheduled Job 1 */}
                <div
                    className="neo-card bg-white overflow-hidden flex flex-col md:flex-row group hover:-translate-y-1 transition-transform">
                    <div
                        className="w-full md:w-48 bg-gray-100 border-b-3 md:border-b-0 md:border-r-3 border-neo-black p-6 flex flex-col justify-center items-center shrink-0">
                        <h4 className="font-black text-2xl text-gray-700">17:00</h4>
                        <span className="text-xs font-bold uppercase tracking-widest mt-1 text-gray-500">Every Friday</span>
                    </div>
                    <div className="p-6 flex-grow flex flex-col justify-center">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-black uppercase">Weekly CRM Sync</h3>
                            <span
                                className="text-xs font-bold bg-gray-200 border border-black px-2 py-0.5 text-gray-600">SCHEDULED</span>
                        </div>
                        <p className="text-sm font-bold text-gray-600 mb-4">Pull new lead data from LinkedIn and enrich
                            HubSpot records.</p>

                        <div
                            className="flex items-center gap-2 text-xs font-bold mt-auto border-t-2 border-dashed border-gray-300 pt-3">
                            <span className="bg-neo-bg px-2 py-1 neo-border">Agent: CMO Agent</span>
                            <button className="ml-auto hover:text-neo-blue uppercase border-b-2 border-black">Edit</button>
                            {/* API: DELETE /api/workspace/jobs/:id */}
                            <button className="hover:text-neo-pink uppercase border-b-2 border-black">Delete</button>
                        </div>
                    </div>
                </div>

                {/* Paused Job */}
                <div
                    className="neo-card bg-gray-50 overflow-hidden flex flex-col md:flex-row opacity-60 hover:opacity-100 transition-opacity group">
                    <div
                        className="w-full md:w-48 bg-gray-200 border-b-3 md:border-b-0 md:border-r-3 border-neo-black p-6 flex flex-col justify-center items-center shrink-0">
                        <h4 className="font-black text-2xl text-gray-500">--:--</h4>
                        <span className="text-xs font-bold uppercase tracking-widest mt-1 text-gray-400">Manual</span>
                    </div>
                    <div className="p-6 flex-grow flex flex-col justify-center">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-black uppercase text-gray-600">DB Backup Checker</h3>
                            <span
                                className="text-xs font-bold bg-white border border-black px-2 py-0.5 text-gray-500">PAUSED</span>
                        </div>
                        <p className="text-sm font-bold text-gray-500 mb-4">Verify Postgres backup integrity on S3.</p>

                        <div
                            className="flex items-center gap-2 text-xs font-bold mt-auto border-t-2 border-dashed border-gray-300 pt-3">
                            <span className="bg-white px-2 py-1 neo-border text-gray-500">Agent: DevOps Bot</span>
                            {/* API: PUT /api/workspace/jobs/:id/resume */}
                            <button className="ml-auto neo-btn bg-white py-1 px-3">Resume</button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </main>
    </>
  );
}

export default Jobs;
