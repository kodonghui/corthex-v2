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

function ActivityLog() {
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
            <a href="/app/activity-log" className="nav-item active flex items-center gap-3 p-3 font-bold transition-colors">
                <span
                    className="w-6 h-6 bg-neo-black text-white flex items-center justify-center neo-border text-xs shadow-[2px_2px_0px_#BFFF00]">A</span>
                Activity Log
            </a>
            <a href="/app/notifications" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">N</span>
                Notifications
            </a>
            <a href="/app/settings" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">⚙</span> Settings
            </a>
        </div>
    </nav>

    {/* Main Content */}
    <main className="flex-grow flex flex-col h-full bg-neo-bg overflow-y-auto w-full">

        {/* Topbar */}
        <header
            className="h-16 border-b-3 border-neo-black bg-white flex items-center justify-between px-8 sticky top-0 z-20 shrink-0">
            <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black uppercase">Workspace Activity stream</h2>
            </div>
            <div className="flex items-center">
                <button
                    className="bg-white border-2 border-neo-black px-3 py-1 text-xs font-bold shadow-sm uppercase">Export</button>
            </div>
        </header>

        <div className="p-8 max-w-5xl mx-auto w-full">

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center mb-8">
                <select
                    className="p-2 border-3 border-neo-black bg-white font-bold cursor-pointer hover:bg-gray-100 outline-none shadow-[4px_4px_0px_#000]">
                    <option>All Actors</option>
                    <option>Human Users</option>
                    <option>AI Agents</option>
                    <option>System Jobs</option>
                </select>

                <select
                    className="p-2 border-3 border-neo-black bg-white font-bold cursor-pointer hover:bg-gray-100 outline-none shadow-[4px_4px_0px_#000]">
                    <option>All Events</option>
                    <option>File Uploads</option>
                    <option>Agent Deployment</option>
                    <option>Settings Change</option>
                </select>
            </div>

            {/* Activity Timeline */}
            {/* API: GET /api/workspace/activity */}
            <div
                className="relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-transparent before:via-neo-black before:to-transparent">

                {/* Timeline Item: Agent Action */}
                <div
                    className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-8">
                    <div
                        className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-neo-black bg-neo-lime shadow-[4px_4px_0px_#000] z-10 font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        CM
                    </div>
                    <div
                        className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white neo-card p-5 group-hover:-translate-y-1 transition-transform cursor-default">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-black text-lg">CMO Agent Updated Strategy</h4>
                            <time className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 neo-border">10 mins
                                ago</time>
                        </div>
                        <p className="text-sm font-medium text-gray-700">Modified the Q4 Marketing Strategy document based
                            on new competitor lead data. Added 3 new execution tasks.</p>
                        <div className="mt-3 flex gap-2">
                            <span
                                className="text-xs border-b-2 border-neo-pink text-neo-pink uppercase font-bold cursor-pointer hover:bg-neo-pink hover:text-white transition-colors">View
                                Diff</span>
                        </div>
                    </div>
                </div>

                {/* Timeline Item: Human Action */}
                <div
                    className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-8">
                    <div
                        className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-neo-black bg-white shadow-[4px_4px_0px_#000] z-10 font-black text-xl shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=transparent"
                            alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    </div>
                    <div
                        className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white neo-card p-5 group-hover:-translate-y-1 transition-transform cursor-default">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-black text-lg">Alex (Admin) Uploaded File</h4>
                            <time className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 neo-border">2 hours
                                ago</time>
                        </div>
                        <p className="text-sm font-medium text-gray-700">Uploaded <code>brand_assets_v2.zip</code> (145MB)
                            to root directory.</p>
                    </div>
                </div>

                {/* Timeline Item: System Alert */}
                <div
                    className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-8">
                    <div
                        className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-neo-black bg-neo-pink text-white shadow-[4px_4px_0px_#000] z-10 font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            strokeWidth="3">
                            <path
                                d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z">
                            </path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                    </div>
                    <div
                        className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-neo-pink/10 neo-card border-neo-pink p-5 group-hover:-translate-y-1 transition-transform cursor-default ring-4 ring-neo-pink/20">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-black text-lg text-neo-pink">API Limit Reached</h4>
                            <time
                                className="text-xs font-bold text-neo-pink bg-white px-2 py-1 neo-border border-neo-pink">Yesterday,
                                14:30</time>
                        </div>
                        <p className="text-sm font-bold text-neo-black">Anthropic API rate limit exceeded by Researcher Bot.
                            Job automatically paused and queued for retry.</p>
                    </div>
                </div>

                {/* Timeline Item: Job Completion */}
                <div
                    className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-8">
                    <div
                        className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-neo-black bg-neo-blue shadow-[4px_4px_0px_#000] z-10 font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    <div
                        className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white neo-card p-5 group-hover:-translate-y-1 transition-transform cursor-default">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-black text-lg">Daily Scrape Completed</h4>
                            <time className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 neo-border">Yesterday,
                                08:05</time>
                        </div>
                        <p className="text-sm font-medium text-gray-700">Successfully fetched and indexed 142 new articles
                            into 'Competitor Intel' RAG collection.</p>
                    </div>
                </div>

            </div>

            {/* Load More */}
            <div className="flex justify-center mt-12 mb-8">
                <button
                    className="bg-white border-3 border-neo-black px-6 py-3 font-black uppercase tracking-widest shadow-[6px_6px_0px_#000] hover:transform hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_#000] transition-all">Load
                    More History</button>
            </div>

        </div>
    </main>
    </>
  );
}

export default ActivityLog;
