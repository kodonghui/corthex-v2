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

function Departments() {
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
            <a href="/app/command-center" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">C</span> Command
                Center
            </a>
            <div className="pt-4 border-t-3 border-neo-black mt-4 mb-2"></div>
            <a href="/app/agents" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">A</span> Agents
            </a>
            <a href="/app/departments" className="nav-item active flex items-center gap-3 p-3 font-bold transition-colors">
                <span
                    className="w-6 h-6 bg-neo-pink text-white flex items-center justify-center neo-border text-xs shadow-[2px_2px_0px_#000]">O</span>
                Departments
            </a>
            <a href="/app/reports" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">R</span> Reports
            </a>
        </div>
    </nav>

    {/* Main Content */}
    <main className="flex-grow flex flex-col h-full bg-neo-bg overflow-y-auto w-full">

        {/* Topbar */}
        <header
            className="h-16 border-b-3 border-neo-black bg-white flex items-center justify-between px-8 sticky top-0 z-20 shrink-0">
            <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black uppercase">Org Departments</h2>
            </div>
            <div className="flex items-center gap-4">
                <button className="neo-btn bg-neo-lime px-4 py-1.5 text-sm uppercase tracking-wide">Create Dept</button>
            </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-10 w-full">

            {/* Global Warning/Info about Cascade logic */}
            <div className="neo-card bg-neo-yellow p-4 flex items-start gap-4 shadow-[4px_4px_0px_#FF6600]">
                <div className="w-10 h-10 bg-white neo-border flex items-center justify-center font-black text-xl shrink-0">
                    !</div>
                <div>
                    <h4 className="font-black uppercase mb-1">Cascade Safety Protocols Active</h4>
                    <p className="text-sm font-medium pr-10">Deleting a department will archive its settings and trigger
                        Cascade processing. Any running tasks will be completed or halted based on your choice, and
                        sub-agents will become "Unassigned".</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Dept Item 1 */}
                <div className="neo-card bg-white overflow-hidden flex flex-col hover:-translate-y-1 transition-transform">
                    <div
                        className="p-5 border-b-3 border-neo-black bg-neo-pink text-white flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <h3 className="font-black text-2xl uppercase tracking-wider">Marketing & Comms</h3>
                        </div>
                        <div
                            className="bg-neo-black text-white text-xs font-bold px-2 py-1 neo-border shadow-[2px_2px_0px_#FFF]">
                            8 Agents</div>
                    </div>
                    <div className="p-6 space-y-5 bg-white">
                        <div className="flex gap-4 mb-2 pb-5 border-b-2 border-dashed border-gray-300">
                            <div className="flex-1">
                                <span className="text-xs font-bold uppercase text-gray-500 block mb-1">Monthly Budget</span>
                                <span className="font-black text-xl">$150.00</span>
                                <div className="w-full bg-gray-200 h-1.5 border border-black mt-2">
                                    <div className="bg-neo-pink h-full w-[45%] border-r border-black"></div>
                                </div>
                            </div>
                            <div className="w-px h-auto bg-gray-300"></div>
                            <div className="flex-1 text-center">
                                <span className="text-xs font-bold uppercase text-gray-500 block mb-1">Status</span>
                                <span
                                    className="bg-neo-lime px-2 py-0.5 border border-black text-sm font-bold inline-block mt-1">Active
                                    / Busy</span>
                            </div>
                        </div>

                        <div>
                            <span className="text-xs font-bold uppercase text-gray-500 block mb-2">Team Roster
                                Snapshot</span>
                            <div className="flex flex-wrap gap-2">
                                <span
                                    className="bg-neo-bg text-xs font-bold px-2 py-1 border-2 border-black flex items-center gap-1"><span
                                        className="w-2 h-2 rounded-full bg-neo-pink mr-1"></span>CMO Agent</span>
                                <span
                                    className="bg-neo-bg text-xs font-bold px-2 py-1 border border-gray-400 text-gray-600">SEO
                                    Bot</span>
                                <span
                                    className="bg-neo-bg text-xs font-bold px-2 py-1 border border-gray-400 text-gray-600">Content
                                    Gen</span>
                                <span
                                    className="bg-neo-bg text-xs font-bold px-2 py-1 border border-gray-400 text-gray-600">+
                                    5 more</span>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                className="flex-1 bg-white border-3 border-neo-black shadow-[3px_3px_0px_#000] py-2 font-bold uppercase hover:bg-neo-yellow transition-colors text-sm">Settings</button>
                            <button
                                className="flex-1 bg-white border-3 border-neo-black shadow-[3px_3px_0px_#000] py-2 font-bold uppercase hover:bg-neo-blue transition-colors text-sm">View
                                Chart</button>
                        </div>
                    </div>
                </div>

                {/* Dept Item 2 */}
                <div className="neo-card bg-white overflow-hidden flex flex-col hover:-translate-y-1 transition-transform">
                    <div className="p-5 border-b-3 border-neo-black bg-neo-blue flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <h3 className="font-black text-2xl uppercase tracking-wider text-neo-black">Strategy & Trading
                            </h3>
                        </div>
                        <div
                            className="bg-white text-neo-black text-xs font-bold px-2 py-1 border-2 border-neo-black shadow-[2px_2px_0px_#000]">
                            4 Agents</div>
                    </div>
                    <div className="p-6 space-y-5 bg-white">
                        <div className="flex gap-4 mb-2 pb-5 border-b-2 border-dashed border-gray-300">
                            <div className="flex-1">
                                <span className="text-xs font-bold uppercase text-gray-500 block mb-1">Monthly Budget</span>
                                <span className="font-black text-xl">$350.00</span>
                                <div className="w-full bg-gray-200 h-1.5 border border-black mt-2">
                                    <div className="bg-neo-blue h-full w-[80%] border-r border-black"></div>
                                </div>
                            </div>
                            <div className="w-px h-auto bg-gray-300"></div>
                            <div className="flex-1 text-center">
                                <span className="text-xs font-bold uppercase text-gray-500 block mb-1">Status</span>
                                <span
                                    className="bg-neo-yellow px-2 py-0.5 border border-black text-sm font-bold inline-block mt-1">Standby</span>
                            </div>
                        </div>

                        <div>
                            <span className="text-xs font-bold uppercase text-gray-500 block mb-2">Team Roster
                                Snapshot</span>
                            <div className="flex flex-wrap gap-2">
                                <span
                                    className="bg-neo-bg text-xs font-bold px-2 py-1 border-2 border-black flex items-center gap-1"><span
                                        className="w-2 h-2 rounded-full bg-neo-pink mr-1"></span>CIO Agent</span>
                                <span
                                    className="bg-neo-bg text-xs font-bold px-2 py-1 border border-gray-400 text-gray-600 flex items-center gap-1"><span
                                        className="w-2 h-2 rounded-full bg-neo-lime mr-1"></span>Vector</span>
                                <span
                                    className="bg-neo-bg text-xs font-bold px-2 py-1 border border-gray-400 text-gray-600">Risk
                                    Analyst</span>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                className="flex-1 bg-white border-3 border-neo-black shadow-[3px_3px_0px_#000] py-2 font-bold uppercase hover:bg-neo-yellow transition-colors text-sm">Settings</button>
                            <button
                                className="flex-1 bg-white border-3 border-neo-black shadow-[3px_3px_0px_#000] py-2 font-bold uppercase hover:bg-neo-blue transition-colors text-sm">View
                                Chart</button>
                        </div>
                    </div>
                </div>

                {/* Unassigned Pool */}
                <div
                    className="neo-card bg-neo-bg border-dashed border-4 border-gray-400 overflow-hidden flex flex-col lg:col-span-2 hover:border-neo-black transition-colors shadow-none hover:shadow-[8px_8px_0px_#1E1E1E]">
                    <div className="p-5 flex justify-between items-center opacity-70">
                        <div className="flex items-center gap-3">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                strokeWidth="3">
                                <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8c-1.1 0-2 .9-2 2v18z"></path>
                                <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                            </svg>
                            <h3 className="font-black text-xl uppercase tracking-wider text-gray-600">Unassigned Agents Pool
                            </h3>
                        </div>
                        <div className="bg-white text-gray-600 text-xs font-bold px-2 py-1 border-2 border-gray-400">2
                            Agents</div>
                    </div>
                    <div className="px-6 pb-6 pt-2">
                        <div className="flex flex-wrap gap-3">
                            <span
                                className="bg-white text-sm font-bold px-3 py-1.5 border-2 border-gray-400 text-gray-600 cursor-move hover:border-neo-black hover:text-neo-black hover:shadow-[2px_2px_0px_#000] transition-all">Support
                                Desk Bot</span>
                            <span
                                className="bg-white text-sm font-bold px-3 py-1.5 border-2 border-gray-400 text-gray-600 cursor-move hover:border-neo-black hover:text-neo-black hover:shadow-[2px_2px_0px_#000] transition-all">QA
                                Tester A</span>
                        </div>
                        <p className="text-xs font-bold text-gray-500 mt-4 leading-tight">These agents lost their department
                            due to deletion or reorg. Drag them into a department to reassign via the Nexus org map.</p>
                    </div>
                </div>

            </div>
        </div>
    </main>
    </>
  );
}

export default Departments;
