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

function Messenger() {
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
            <a href="/app/sns" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">S</span> SNS Accs
            </a>
            <a href="/app/messenger" className="nav-item active flex items-center gap-3 p-3 font-bold transition-colors">
                <span
                    className="w-6 h-6 bg-neo-lime flex items-center justify-center neo-border text-xs shadow-[2px_2px_0px_#000]">M</span>
                Messenger Accs
            </a>
        </div>
    </nav>

    {/* Main Content */}
    <main className="flex-grow flex flex-col h-full bg-neo-bg overflow-y-auto w-full">

        {/* Topbar */}
        <header
            className="h-16 border-b-3 border-neo-black bg-white flex items-center justify-between px-8 sticky top-0 z-20 shrink-0">
            <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black uppercase">Messenger Integration</h2>
            </div>
            <div className="flex items-center gap-4">
                {/* API: POST /api/workspace/messenger/connect */}
                <button className="neo-btn bg-neo-lime px-4 py-1.5 text-sm uppercase tracking-wide">Add Bot Webhook</button>
            </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto space-y-8 w-full flex-grow">

            <div
                className="neo-card bg-neo-yellow p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start justify-between shadow-[8px_8px_0px_#FF6600]">
                <div>
                    <h3 className="text-3xl font-black uppercase mb-3 text-neo-black">Internal Communication</h3>
                    <p className="font-bold text-gray-800 max-w-2xl">Connect workspace messengers. Agents can summarize
                        daily discussions, alert on critical events, or receive direct commands via slash commands from
                        your team channels.</p>
                </div>
            </div>

            {/* Platforms Grid */}
            {/* API: GET /api/workspace/messenger */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Discord */}
                <div className="space-y-4">
                    <div
                        className="bg-discord text-white p-4 neo-border flex items-center gap-4 shadow-[4px_4px_0px_#1E1E1E]">
                        <div
                            className="w-12 h-12 bg-white text-discord rounded-full flex items-center justify-center font-black text-2xl neo-border">
                            D</div>
                        <h3 className="text-2xl font-black uppercase tracking-wider">Discord Bot</h3>
                    </div>

                    <div className="neo-card bg-white p-6 space-y-4">
                        <div className="flex justify-between items-center border-b-2 border-dashed border-gray-300 pb-3">
                            <span className="font-bold">Status</span>
                            <span
                                className="bg-neo-lime px-2 py-0.5 border border-black text-xs font-bold shadow-sm">Connected</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold uppercase text-gray-500">Listening Channels (2)</span>
                            <div className="flex gap-2">
                                <span className="bg-gray-100 px-2 py-1 neo-border text-sm font-bold">#general</span>
                                <span className="bg-gray-100 px-2 py-1 neo-border text-sm font-bold">#dev-ops</span>
                            </div>
                        </div>
                        <div className="bg-neo-bg p-3 neo-border text-sm font-medium italic text-gray-700">
                            "Bot is configured to read messages and respond to /corthex commands."
                        </div>
                        <div className="pt-2">
                            {/* API: PUT /api/workspace/messenger/:id/settings */}
                            <button className="neo-btn bg-white w-full py-2 uppercase text-sm">Configure Channels</button>
                        </div>
                    </div>
                </div>

                {/* Slack */}
                <div className="space-y-4">
                    <div
                        className="bg-slack text-white p-4 neo-border flex items-center gap-4 shadow-[4px_4px_0px_#1E1E1E]">
                        <div
                            className="w-12 h-12 bg-white text-slack rounded flex items-center justify-center font-black text-2xl neo-border rotate-3">
                            S</div>
                        <h3 className="text-2xl font-black uppercase tracking-wider">Slack App</h3>
                    </div>

                    <div
                        className="neo-card bg-neo-bg p-6 space-y-4 border-dashed border-gray-400 opacity-70 hover:opacity-100 hover:border-neo-black hover:border-solid transition-all">
                        <div className="flex justify-between items-center border-b-2 border-dashed border-gray-300 pb-3">
                            <span className="font-bold">Status</span>
                            <span
                                className="bg-gray-300 px-2 py-0.5 border border-black text-xs font-bold">Unconfigured</span>
                        </div>
                        <p className="text-sm font-bold text-gray-500 text-center py-4">Click below to setup Slack Webhooks
                            and OAuth Integration.</p>
                        <div className="pt-2">
                            <button
                                className="neo-btn bg-neo-pink text-white w-full py-2 uppercase text-sm shadow-[4px_4px_0px_#1E1E1E]">Setup
                                Webhook</button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </main>
    </>
  );
}

export default Messenger;
