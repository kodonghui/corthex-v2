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

function Sns() {
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
            <a href="/app/credentials" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">K</span> Credentials
            </a>
            <a href="/app/sns" className="nav-item active flex items-center gap-3 p-3 font-bold transition-colors">
                <span
                    className="w-6 h-6 bg-neo-blue flex items-center justify-center neo-border text-xs shadow-[2px_2px_0px_#000]">S</span>
                SNS Accs
            </a>
            <a href="/app/messenger" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">M</span> Messenger
                Accs
            </a>
        </div>
    </nav>

    {/* Main Content */}
    <main className="flex-grow flex flex-col h-full bg-neo-bg overflow-y-auto w-full">

        {/* Topbar */}
        <header
            className="h-16 border-b-3 border-neo-black bg-white flex items-center justify-between px-8 sticky top-0 z-20 shrink-0">
            <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black uppercase">SNS Automation</h2>
            </div>
            <div className="flex items-center gap-4">
                {/* API: POST /api/workspace/sns/connect */}
                <button className="neo-btn bg-neo-yellow px-4 py-1.5 text-sm uppercase tracking-wide">Connect
                    Account</button>
            </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto space-y-8 w-full flex-grow">

            {/* Marketing AI Control Block */}
            <div
                className="neo-card bg-neo-black text-white p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start justify-between">
                <div>
                    <h3 className="text-3xl font-black uppercase mb-3 flex items-center gap-3 text-neo-blue">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            strokeWidth="3">
                            <path
                                d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4">
                            </path>
                        </svg>
                        Marketing Automation
                    </h3>
                    <p className="font-bold text-gray-300 max-w-2xl">Connect your corporate social media accounts via OAuth
                        or automated session logic. Marketing agents will automatically plan, draft, and post content to
                        active accounts.</p>
                </div>
            </div>

            {/* Connected Accounts Grid */}
            {/* API: GET /api/workspace/sns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Twitter/X */}
                <div
                    className="neo-card bg-white overflow-hidden flex flex-col group hover:-translate-y-1 transition-transform">
                    <div className="p-4 border-b-3 border-neo-black flex justify-between items-center bg-gray-100">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 bg-neo-lime border border-black animate-pulse"></span>
                            <span className="font-black text-sm uppercase tracking-widest text-twitter">X (Twitter)</span>
                        </div>
                        <span
                            className="bg-white text-neo-black text-xs font-bold px-2 py-0.5 border border-black shadow-sm">OAuth</span>
                    </div>
                    <div className="p-6 flex-grow flex flex-col space-y-4">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-14 h-14 bg-twitter border-3 border-neo-black rounded-full flex items-center justify-center text-white font-black text-xl shadow-[2px_2px_0px_#000]">
                                X</div>
                            <div>
                                <h4 className="font-black text-xl leading-none">@CorthexHQ</h4>
                                <p className="text-xs font-bold text-gray-500 mt-1">2.4k Followers</p>
                            </div>
                        </div>

                        <div className="bg-neo-bg p-3 neo-border text-sm font-bold flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Post Frequency:</span>
                                <span>2 / Day</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Assigned Agent:</span>
                                <span className="bg-white px-1 border border-black">Social Poster</span>
                            </div>
                        </div>
                    </div>
                    {/* Actions */}
                    <div className="flex border-t-3 border-neo-black">
                        {/* API: PUT /api/workspace/sns/:id/settings */}
                        <button
                            className="flex-1 bg-white py-3 font-bold uppercase text-sm border-r-3 border-neo-black hover:bg-neo-yellow transition-colors">Settings</button>
                        {/* API: DELETE /api/workspace/sns/:id */}
                        <button
                            className="flex-1 bg-white py-3 font-bold uppercase text-sm hover:bg-neo-pink hover:text-white transition-colors">Disconnect</button>
                    </div>
                </div>

                {/* LinkedIn */}
                <div
                    className="neo-card bg-white overflow-hidden flex flex-col group hover:-translate-y-1 transition-transform">
                    <div className="p-4 border-b-3 border-neo-black flex justify-between items-center bg-gray-100">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 bg-neo-lime border border-black animate-pulse"></span>
                            <span className="font-black text-sm uppercase tracking-widest text-linkedin">LinkedIn</span>
                        </div>
                        <span
                            className="bg-white text-neo-black text-xs font-bold px-2 py-0.5 border border-black shadow-sm">OAuth</span>
                    </div>
                    <div className="p-6 flex-grow flex flex-col space-y-4">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-14 h-14 bg-linkedin border-3 border-neo-black rounded flex items-center justify-center text-white font-black text-2xl shadow-[2px_2px_0px_#000]">
                                in</div>
                            <div>
                                <h4 className="font-black text-xl leading-none">Corthex Inc.</h4>
                                <p className="text-xs font-bold text-gray-500 mt-1">Company Page</p>
                            </div>
                        </div>

                        <div className="bg-neo-bg p-3 neo-border text-sm font-bold flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Post Frequency:</span>
                                <span>3 / Week</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Assigned Agent:</span>
                                <span className="bg-white px-1 border border-black">PR Bot</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex border-t-3 border-neo-black">
                        <button
                            className="flex-1 bg-white py-3 font-bold uppercase text-sm border-r-3 border-neo-black hover:bg-neo-yellow transition-colors">Settings</button>
                        <button
                            className="flex-1 bg-white py-3 font-bold uppercase text-sm hover:bg-neo-pink hover:text-white transition-colors">Disconnect</button>
                    </div>
                </div>

                {/* Webhook (Custom) */}
                <div
                    className="neo-card bg-white overflow-hidden flex flex-col group hover:-translate-y-1 transition-transform">
                    <div className="p-4 border-b-3 border-neo-black flex justify-between items-center bg-gray-100">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 bg-neo-yellow border border-black"></span>
                            <span className="font-black text-sm uppercase tracking-widest text-neo-black">Content
                                Blog</span>
                        </div>
                        <span
                            className="bg-white text-neo-black text-xs font-bold px-2 py-0.5 border border-black shadow-sm">Webhook</span>
                    </div>
                    <div className="p-6 flex-grow flex flex-col space-y-4">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-14 h-14 bg-white border-3 border-neo-black rounded-lg flex items-center justify-center font-black shadow-[2px_2px_0px_#000] overflow-hidden p-2">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <path d="M12 20h9"></path>
                                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-black text-lg leading-none">Internal Ghost Blog</h4>
                                <p className="text-xs font-bold text-gray-500 mt-1">Manual Approval</p>
                            </div>
                        </div>

                        <div className="bg-neo-pink p-3 neo-border text-sm font-bold flex flex-col gap-2 text-white">
                            Status: Pending Review (1)
                        </div>
                    </div>
                    <div className="flex border-t-3 border-neo-black">
                        <button
                            className="flex-1 bg-white py-3 font-bold uppercase text-sm border-r-3 border-neo-black hover:bg-neo-yellow transition-colors">Review
                            Post</button>
                        <button
                            className="flex-1 bg-white py-3 font-bold uppercase text-sm hover:bg-neo-pink hover:text-white transition-colors">Disconnect</button>
                    </div>
                </div>

            </div>
        </div>
    </main>
    </>
  );
}

export default Sns;
