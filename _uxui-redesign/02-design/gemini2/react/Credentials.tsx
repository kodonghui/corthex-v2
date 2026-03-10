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

function Credentials() {
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
            <a href="/app/credentials" className="nav-item active flex items-center gap-3 p-3 font-bold transition-colors">
                <span
                    className="w-6 h-6 bg-neo-black text-white flex items-center justify-center neo-border text-xs shadow-[2px_2px_0px_#BFFF00]">K</span>
                Credentials
            </a>
            <a href="/app/sns" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">S</span> SNS Accs
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
                <h2 className="text-2xl font-black uppercase">API & Global Credentials</h2>
            </div>
            <div className="flex items-center gap-4">
                <button className="neo-btn bg-neo-lime px-4 py-1.5 text-sm uppercase tracking-wide">Add Credential</button>
            </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto space-y-10 w-full flex-grow">

            {/* Global Info */}
            <div
                className="neo-card bg-white p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start justify-between shadow-[8px_8px_0px_#1E1E1E]">
                <div className="max-w-2xl">
                    <h3 className="text-3xl font-black uppercase mb-3 flex items-center gap-3">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            strokeWidth="3">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        Secure Vault
                    </h3>
                    <p className="font-bold text-gray-700">Keys stored here are accessible by specific AI Agents depending
                        on their allowed tools. We never display stored keys in plain text after input.</p>
                </div>
                <div className="bg-neo-black text-white p-4 neo-border shrink-0 w-full md:w-64 rotate-2">
                    <div className="text-xs font-bold uppercase tracking-widest border-b border-gray-600 pb-2 mb-2">Vault
                        Status</div>
                    <div className="text-2xl font-black text-neo-lime">SECURE</div>
                    <div className="text-xs font-bold mt-1 text-gray-400">12 Keys Registered</div>
                </div>
            </div>

            {/* List Category 1 */}
            {/* API: GET /api/workspace/credentials */}
            <div>
                <h3 className="text-xl font-black uppercase mb-4 border-b-3 border-neo-black pb-2 flex items-center gap-2">
                    <span className="w-4 h-4 bg-neo-lime border-2 border-neo-black block"></span> Model API Keys
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Item */}
                    <div className="neo-card bg-white p-5 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <h4 className="font-black text-xl flex items-center gap-2">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/e/e8/Anthropic_logo.svg"
                                    onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2NjYyIvPjwvc3ZnPg=='"
                                    alt="Anthropic" className="w-6 h-6 object-contain" />
                                Anthropic (Claude)
                            </h4>
                            <span
                                className="bg-neo-lime px-2 py-0.5 border border-black text-xs font-bold shadow-[2px_2px_0px_#000]">Active</span>
                        </div>
                        <div
                            className="bg-gray-100 p-3 neo-border font-mono text-sm text-gray-500 flex justify-between items-center mb-4">
                            sk-ant-api03...a9b2
                            <button className="hover:text-neo-pink"><svg width="16" height="16" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg></button>
                        </div>
                        <div className="flex-grow flex items-end">
                            <p className="text-xs font-bold text-gray-500">Used by: All Framework Agents</p>
                        </div>
                    </div>

                    {/* Item */}
                    <div className="neo-card bg-white p-5 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <h4 className="font-black text-xl flex items-center gap-2">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg"
                                    onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2NjYyIvPjwvc3ZnPg=='"
                                    alt="OpenAI" className="w-6 h-6 object-contain" />
                                OpenAI
                            </h4>
                            <span
                                className="bg-neo-yellow px-2 py-0.5 border border-black text-xs font-bold shadow-[2px_2px_0px_#000]">Optional</span>
                        </div>
                        <div
                            className="bg-gray-100 p-3 neo-border font-mono text-sm text-gray-500 flex justify-between items-center mb-4">
                            sk-proj-8x...2vQ
                            <button className="hover:text-neo-pink"><svg width="16" height="16" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg></button>
                        </div>
                        <div className="flex-grow flex items-end">
                            <p className="text-xs font-bold text-gray-500">Used by: Vision/Audio Specialized Tasks</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* List Category 2 */}
            <div className="mt-10">
                <h3 className="text-xl font-black uppercase mb-4 border-b-3 border-neo-black pb-2 flex items-center gap-2">
                    <span className="w-4 h-4 bg-neo-pink border-2 border-neo-black block"></span> Service & Trading APIs
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
                    {/* Item */}
                    <div className="neo-card bg-white p-5 flex flex-col hover:-translate-y-1 transition-transform">
                        <div className="flex justify-between items-start mb-4">
                            <h4 className="font-black text-xl">KIS API (Trading)</h4>
                            <span className="bg-neo-bg px-2 py-0.5 border border-black text-xs font-bold text-gray-500">2
                                Keys Required</span>
                        </div>
                        <div className="space-y-2 mb-4">
                            <div
                                className="bg-gray-100 p-2 neo-border font-mono text-xs flex justify-between items-center text-gray-500">
                                <span>[APP KEY] PSe...x2A</span>
                                <button className="hover:text-neo-pink">Edit</button>
                            </div>
                            <div
                                className="bg-gray-100 p-2 neo-border font-mono text-xs flex justify-between items-center text-gray-500">
                                <span>[SECRET] 7bV...9zP</span>
                                <button className="hover:text-neo-pink">Edit</button>
                            </div>
                        </div>
                        <div className="flex-grow flex items-end justify-between">
                            <p className="text-xs font-bold text-gray-500">Agent: Vector</p>
                            <span className="bg-neo-lime px-2 py-0.5 border border-black text-xs font-bold">Connected</span>
                        </div>
                    </div>

                    {/* Item */}
                    <div className="neo-card bg-white p-5 flex flex-col hover:-translate-y-1 transition-transform">
                        <div className="flex justify-between items-start mb-4">
                            <h4 className="font-black text-xl">Tavily Search API</h4>
                            <span
                                className="bg-neo-bg px-2 py-0.5 border border-black text-xs font-bold text-gray-500">Search</span>
                        </div>
                        <div
                            className="bg-gray-100 p-3 neo-border font-mono text-sm text-gray-500 flex justify-between items-center mb-4">
                            tvly-8a9...xq1
                            <button className="hover:text-neo-pink">Edit</button>
                        </div>
                        <div className="flex-grow flex items-end justify-between">
                            <p className="text-xs font-bold text-gray-500">Agent: Researcher Bot +2</p>
                            <span className="bg-neo-lime px-2 py-0.5 border border-black text-xs font-bold">Connected</span>
                        </div>
                    </div>

                    {/* Item */}
                    <div className="neo-card bg-neo-bg p-5 flex flex-col border-dashed border-gray-400 opacity-60">
                        <div className="flex justify-between items-start mb-4">
                            <h4 className="font-black text-xl text-gray-600">AWS Credentials</h4>
                            <span
                                className="bg-gray-200 px-2 py-0.5 border border-gray-400 text-xs font-bold text-gray-500">Optional</span>
                        </div>
                        <div
                            className="bg-gray-100 p-3 border-2 border-gray-300 font-mono text-sm text-gray-400 flex justify-between items-center mb-4 italic">
                            Not Configured
                        </div>
                        <div className="flex-grow flex items-end justify-between">
                            <button
                                className="text-xs font-bold text-neo-black border-b-2 border-neo-black hover:text-neo-pink">Setup
                                Now</button>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    </main>
    </>
  );
}

export default Credentials;
