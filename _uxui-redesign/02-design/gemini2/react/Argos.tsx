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

        .grid-bg {
            background-image:
                linear-gradient(to right, #1E1E1E 1px, transparent 1px),
                linear-gradient(to bottom, #1E1E1E 1px, transparent 1px);
            background-size: 20px 20px;
            background-position: center center;
            opacity: 0.1;
        }
`;

function Argos() {
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
            <a href="/app/argos" className="nav-item active flex items-center gap-3 p-3 font-bold transition-colors">
                <span
                    className="w-6 h-6 bg-neo-black text-white flex items-center justify-center neo-border text-xs shadow-[2px_2px_0px_#BFFF00]">👁</span>
                Project Argos
            </a>
            <a href="/app/classified" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">█</span> Classified
            </a>
        </div>
    </nav>

    {/* Main Content */}
    <main className="flex-grow flex flex-col h-full bg-neo-bg overflow-y-auto w-full relative">
        <div className="absolute inset-0 grid-bg pointer-events-none"></div>

        {/* Topbar */}
        <header
            className="h-16 border-b-3 border-neo-black bg-white flex items-center justify-between px-8 sticky top-0 z-20 shrink-0">
            <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black uppercase tracking-widest">Project Argos <span
                        className="text-neo-pink">(Compliance)</span></h2>
            </div>
            <div className="flex items-center">
                <span
                    className="bg-neo-lime text-neo-black px-3 py-1 text-xs font-black uppercase border-2 border-neo-black shadow-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-neo-black animate-pulse"></span> Security Active
                </span>
            </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto space-y-8 w-full relative z-10">

            <div
                className="neo-card bg-neo-black text-white p-8 mb-8 border-none shadow-[8px_8px_0px_#FF3366] ring-4 ring-neo-black">
                <h3 className="font-black text-3xl uppercase text-neo-lime mb-4 flex items-center gap-4">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                    Safety & Guardrails
                </h3>
                <p className="font-bold text-gray-300 max-w-3xl text-lg leading-relaxed">
                    Argos oversees all agent interactions to prevent data leaks, unauthorized trades, or brand-damaging
                    language. It acts as the final firewall between your autonomous workspace and the outside world.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Rule Configuration */}
                <div className="neo-card bg-white p-6 space-y-6">
                    <h4 className="font-black text-xl uppercase border-b-4 border-neo-black pb-2 inline-block">Active
                        Filters</h4>

                    <div className="space-y-4">
                        <div
                            className="flex justify-between items-center p-3 bg-gray-100 neo-border border-l-8 border-l-neo-pink">
                            <div>
                                <h5 className="font-black text-sm uppercase">PII Redaction</h5>
                                <p className="text-xs font-bold text-gray-600">Masks Social Security, Credit Cards in RAG
                                </p>
                            </div>
                            {/* API: PUT /api/workspace/argos/rules/:id */}
                            <button
                                className="bg-neo-black text-white px-3 py-1 text-xs font-bold shadow-sm uppercase">Enabled</button>
                        </div>

                        <div
                            className="flex justify-between items-center p-3 bg-gray-100 neo-border border-l-8 border-l-neo-lime">
                            <div>
                                <h5 className="font-black text-sm uppercase">Financial Guardrail</h5>
                                <p className="text-xs font-bold text-gray-600">Halt trades exceeding 10% of portfolio</p>
                            </div>
                            <button
                                className="bg-neo-black text-white px-3 py-1 text-xs font-bold shadow-sm uppercase">Enabled</button>
                        </div>

                        <div
                            className="flex justify-between items-center p-3 bg-gray-100 neo-border border-l-8 border-l-neo-yellow opacity-70">
                            <div>
                                <h5 className="font-black text-sm uppercase">Brand Tone Checker</h5>
                                <p className="text-xs font-bold text-gray-600">Flags controversial keywords in generated
                                    posts</p>
                            </div>
                            <button
                                className="bg-gray-300 text-gray-600 border border-gray-400 px-3 py-1 text-xs font-bold uppercase cursor-pointer hover:bg-gray-400">Disabled</button>
                        </div>
                    </div>

                    <button
                        className="neo-btn bg-white w-full py-3 uppercase text-sm border-dashed text-gray-600 hover:text-black">Add
                        Custom Rule</button>
                </div>

                {/* Audit Log Preview */}
                <div className="neo-card bg-white p-6 flex flex-col">
                    <div className="flex justify-between items-center border-b-4 border-neo-black pb-2 mb-4">
                        <h4 className="font-black text-xl uppercase">Recent Interventions</h4>
                        <span className="text-xs font-bold bg-neo-pink text-white px-2 py-0.5 border border-black">2 Blocks
                            Today</span>
                    </div>

                    <div className="space-y-4 overflow-y-auto flex-grow max-h-80">
                        <div
                            className="p-3 bg-neo-pink/10 border-2 border-neo-pink font-mono text-sm shadow-[2px_2px_0px_#FF3366]">
                            <div className="flex justify-between font-bold text-neo-pink mb-1 text-xs uppercase">
                                <span>Agent: Social Poster</span>
                                <span>10:45 AM</span>
                            </div>
                            <p className="font-bold text-black text-xs">BLOCKED: Attempted to post sensitive earnings data
                                before official release time.</p>
                        </div>

                        <div
                            className="p-3 bg-neo-yellow/20 border-2 border-neo-yellow font-mono text-sm shadow-[2px_2px_0px_#FFE800]">
                            <div className="flex justify-between font-bold text-neo-orange mb-1 text-xs uppercase">
                                <span>Agent: Vector Bot</span>
                                <span>Yesterday</span>
                            </div>
                            <p className="font-bold text-black text-xs">WARNING: High volatility detected. Trade required
                                manual override confirmation.</p>
                        </div>
                    </div>

                    <button
                        className="w-full mt-4 text-center font-bold text-xs uppercase border-t-2 border-black pt-2 hover:text-neo-pink">View
                        Full Security Audit Log</button>
                </div>

            </div>
        </div>
    </main>
    </>
  );
}

export default Argos;
