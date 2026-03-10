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

function Notifications() {
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
            <a href="/app/activity-log" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">A</span> Activity Log
            </a>
            <a href="/app/notifications"
                className="nav-item active flex items-center gap-3 p-3 font-bold transition-colors">
                <span
                    className="w-6 h-6 bg-neo-pink text-white flex items-center justify-center neo-border text-xs shadow-[2px_2px_0px_#000]">N</span>
                Notifications
                <span
                    className="ml-auto bg-white text-neo-black px-1.5 py-0.5 text-[10px] font-black border border-black animate-pulse">3</span>
            </a>
            <a href="/app/settings" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">⚙</span> Settings
            </a>
        </div>
    </nav>

    {/* Main Content */}
    <main className="flex-grow flex flex-col h-full bg-neo-bg overflow-y-auto w-full relative">

        {/* Decorative Background Element */}
        <div
            className="fixed top-20 right-10 text-9xl font-black text-gray-200 opacity-50 z-0 pointer-events-none rotate-12">
            ALERTS</div>

        {/* Topbar */}
        <header
            className="h-16 border-b-3 border-neo-black bg-white flex items-center justify-between px-8 sticky top-0 z-20 shrink-0">
            <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black uppercase">Inbox & Alerts</h2>
            </div>
            <div className="flex items-center gap-4">
                {/* API: PUT /api/workspace/notifications/read-all */}
                <button
                    className="bg-white border-2 border-neo-black px-3 py-1 font-bold shadow-sm uppercase text-sm hover:bg-gray-100">Mark
                    all as read</button>
            </div>
        </header>

        <div className="p-8 max-w-4xl mx-auto w-full relative z-10 space-y-4">

            <div className="flex gap-4 mb-6 border-b-4 border-neo-black pb-4">
                <button className="font-black text-xl uppercase tracking-wider relative">
                    All
                    <span className="absolute -top-1 -right-4 w-2 h-2 rounded-full bg-neo-pink border border-black"></span>
                </button>
                <button
                    className="font-bold text-xl uppercase tracking-wider text-gray-400 hover:text-neo-black transition-colors">Approvals</button>
                <button
                    className="font-bold text-xl uppercase tracking-wider text-gray-400 hover:text-neo-black transition-colors">Mentions</button>
            </div>

            {/* Notifications List */}
            {/* API: GET /api/workspace/notifications */}

            {/* Approval Required (Urgent) */}
            <div
                className="neo-card bg-neo-pink/10 border-neo-pink border-4 p-5 flex gap-5 hover:bg-neo-pink/20 transition-colors ring-4 ring-offset-2 ring-transparent hover:ring-neo-pink">
                <div
                    className="shrink-0 w-12 h-12 bg-neo-pink text-white rounded-full border-3 border-neo-black flex items-center justify-center shadow-sm">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                </div>
                <div className="flex-grow">
                    <div className="flex justify-between items-start mb-1">
                        <h4 className="font-black text-lg">Trade Approval Required</h4>
                        <span
                            className="text-xs font-bold text-neo-pink bg-white border border-neo-pink px-2 py-0.5 shadow-sm">2
                            mins ago</span>
                    </div>
                    <p className="text-sm font-bold text-neo-black mb-3">Vector Agent requests approval to execute <b>BUY 50
                            $NVDA @ Market</b> based on recent ML inference.</p>

                    <div className="flex gap-3 mt-2">
                        {/* API: POST /api/workspace/trading/approve */}
                        <button className="neo-btn bg-neo-lime px-4 py-2 text-sm uppercase">Approve</button>
                        {/* API: POST /api/workspace/trading/reject */}
                        <button
                            className="bg-white border-2 border-neo-black px-4 py-2 text-sm font-bold uppercase hover:bg-neo-pink hover:text-white transition-colors">Reject</button>
                    </div>
                </div>
                {/* Unread indicator */}
                <div className="w-3 h-3 bg-neo-pink rounded-full border border-black mt-2"></div>
            </div>

            {/* Agent Mention */}
            <div className="neo-card bg-white p-5 flex gap-5 hover:-translate-y-1 transition-transform">
                <div
                    className="shrink-0 w-12 h-12 bg-neo-yellow text-neo-black rounded border-3 border-neo-black flex items-center justify-center shadow-sm font-black text-xl rotate-3">
                    @
                </div>
                <div className="flex-grow">
                    <div className="flex justify-between items-start mb-1">
                        <h4 className="font-black text-lg">Chief of Staff Mentioned You</h4>
                        <span className="text-xs font-bold text-gray-500">1 hour ago</span>
                    </div>
                    <p className="text-sm font-medium text-gray-700">"I have reviewed the new architecture doc. <span
                            className="bg-neo-yellow/30 font-bold px-1">@Alex</span>, should I disseminate this to the
                        DevOps and Engineering agents?"</p>
                    <a href="/app/chat"
                        className="text-xs border-b-2 border-neo-blue text-neo-blue font-bold uppercase mt-2 inline-block hover:bg-neo-blue hover:text-white transition-colors">Reply
                        in Chat</a>
                </div>
                <div className="w-3 h-3 bg-neo-lime rounded-full border border-black mt-2"></div>
            </div>

            {/* Info Update */}
            <div className="neo-card bg-gray-50 p-5 flex gap-5 opacity-70 hover:opacity-100 transition-opacity">
                <div
                    className="shrink-0 w-12 h-12 bg-gray-200 text-gray-500 rounded-full border-2 border-gray-400 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 16 12 12 12 8"></polyline>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                </div>
                <div className="flex-grow">
                    <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-lg text-gray-700">Billing Cycle Renewed</h4>
                        <span className="text-xs font-bold text-gray-400">Yesterday</span>
                    </div>
                    <p className="text-sm font-medium text-gray-600">Your workspace API limits have been reset for the new
                        month.</p>
                </div>
            </div>

        </div>
    </main>
    </>
  );
}

export default Notifications;
