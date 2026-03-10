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

        .bg-grid {
            background-size: 40px 40px;
            background-image:
                linear-gradient(to right, rgba(0, 0, 0, 0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
        }
`;

function Nexus() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Sidebar Navigation */}
    <nav
        className="w-64 border-r-3 border-neo-black bg-white flex flex-col h-full z-20 shrink-0 absolute left-0 top-0 bottom-0 md:relative">
        <div className="p-6 border-b-3 border-neo-black bg-neo-yellow">
            <h1 className="text-3xl font-black tracking-tight uppercase">CORTHEX</h1>
            <p className="font-bold text-xs mt-1 bg-white inline-block px-1 neo-border">WORKSPACE</p>
        </div>
        <div className="flex-grow overflow-y-auto p-4 space-y-2">
            <a href="/app/home" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">H</span> Home
            </a>
            <div className="pt-4 border-t-3 border-neo-black mt-4 mb-2"></div>
            <a href="/app/agora" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">Ä</span> Agora
            </a>
            <a href="/app/nexus" className="nav-item active flex items-center gap-3 p-3 font-bold transition-colors">
                <span
                    className="w-6 h-6 bg-neo-blue text-white flex items-center justify-center neo-border text-xs shadow-[2px_2px_0px_#000]">N</span>
                Nexus
            </a>
            <a href="/app/workflows" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">W</span> Workflows
            </a>
        </div>
    </nav>

    {/* Main Content */}
    <main className="flex-grow flex flex-col h-full bg-neo-bg overflow-hidden relative w-full translate-x-0">

        {/* Topbar */}
        <header
            className="h-16 border-b-3 border-neo-black bg-white flex items-center justify-between px-8 absolute top-0 left-0 right-0 z-10">
            <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black uppercase tracking-wider">N E X U S</h2>
                <span
                    className="bg-neo-black text-white px-2 py-0.5 text-xs font-bold neo-border shadow-[2px_2px_0px_#00E5FF] hidden sm:block">Organization
                    Map</span>
                {/* Mobile toggle */}
                <button className="md:hidden border-2 border-black p-1 bg-neo-yellow">Menu</button>
            </div>

            <div className="flex items-center gap-4">
                {/* Toolbar */}
                <div className="flex bg-white neo-border p-1">
                    <button className="hover:bg-gray-200 p-1 flex items-center justify-center transition-colors"
                        title="Zoom In">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            strokeWidth="3">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            <line x1="11" y1="8" x2="11" y2="14"></line>
                            <line x1="8" y1="11" x2="14" y2="11"></line>
                        </svg>
                    </button>
                    <div className="w-0.5 bg-black mx-1"></div>
                    <button className="hover:bg-gray-200 p-1 flex items-center justify-center transition-colors"
                        title="Zoom Out">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            strokeWidth="3">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            <line x1="8" y1="11" x2="14" y2="11"></line>
                        </svg>
                    </button>
                    <div className="w-0.5 bg-black mx-1"></div>
                    <button className="hover:bg-gray-200 p-1 flex items-center justify-center transition-colors"
                        title="Reset View">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            strokeWidth="3">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        </svg>
                    </button>
                </div>

                <button className="neo-btn bg-neo-lime px-4 py-1.5 text-sm uppercase tracking-wide hidden sm:block">Save
                    Layout</button>
            </div>
        </header>

        {/* Canvas Area */}
        <div className="flex-grow bg-grid cursor-grab overflow-hidden relative z-0 w-full h-full pt-16">

            {/* Context / Minimap Info */}
            <div
                className="absolute bottom-6 right-6 bg-white neo-border p-4 shadow-[4px_4px_0px_#000] z-10 w-64 hidden sm:block">
                <h4 className="font-black uppercase text-sm border-b-2 border-neo-black pb-1 mb-2">Legend</h4>
                <div className="space-y-2 text-xs font-bold">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-neo-black border border-black"></div> System Agent
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-neo-pink border border-black"></div> Manager (Tier 1)
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-neo-lime border border-black"></div> Specialist (Tier 2)
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-neo-yellow border border-black"></div> Worker (Tier 3)
                    </div>
                </div>
            </div>

            {/* Fake Graph Nodes using Absolute Positioning (Tailwind classes for demo) */}
            <div className="w-full h-full relative" id="nexusCanvas">

                {/* Central Node (System) */}
                {/* API: GET /api/workspace/nexus/org-data */}
                <div
                    className="absolute top-[10%] left-[50%] -translate-x-1/2 w-48 bg-white border-4 border-neo-black shadow-[8px_8px_0px_#1E1E1E] text-center z-20 cursor-move hover:-translate-y-1 transition-transform">
                    <div
                        className="bg-neo-black text-white py-1 font-black text-xs uppercase tracking-widest border-b-2 border-black">
                        System</div>
                    <div className="p-3">
                        <div
                            className="w-12 h-12 mx-auto bg-neo-yellow border-2 border-black rounded-full flex items-center justify-center font-black mb-2 shadow-sm">
                            CS</div>
                        <h3 className="font-black leading-tight text-lg">Chief of Staff</h3>
                        <p className="text-[10px] font-bold mt-1 text-gray-500 uppercase">Orchestrator</p>
                    </div>
                </div>

                {/* Connection Lines (Fake SVG) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                    <line x1="50%" y1="18%" x2="25%" y2="40%" stroke="#1E1E1E" strokeWidth="4"
                        stroke-dasharray="8 4" />
                    <line x1="50%" y1="18%" x2="50%" y2="40%" stroke="#1E1E1E" strokeWidth="4" />
                    <line x1="50%" y1="18%" x2="75%" y2="40%" stroke="#1E1E1E" strokeWidth="4" />

                    {/* Sub connections */}
                    <line x1="25%" y1="50%" x2="15%" y2="70%" stroke="#1E1E1E" strokeWidth="3" />
                    <line x1="25%" y1="50%" x2="35%" y2="70%" stroke="#1E1E1E" strokeWidth="3" />

                    <line x1="75%" y1="50%" x2="65%" y2="70%" stroke="#1E1E1E" strokeWidth="3" />
                    <line x1="75%" y1="50%" x2="85%" y2="70%" stroke="#1E1E1E" strokeWidth="3" />
                </svg>

                {/* Department: Marketing */}
                <div
                    className="absolute top-[40%] left-[25%] -translate-x-1/2 w-44 bg-white border-3 border-neo-black shadow-[6px_6px_0px_#FF3366] text-center z-20 cursor-move hover:-translate-y-1 transition-transform">
                    <div className="bg-neo-pink text-white py-1 font-black text-xs uppercase border-b-2 border-black">
                        Marketing</div>
                    <div className="p-3">
                        <div
                            className="w-10 h-10 mx-auto bg-neo-bg border-2 border-black font-black flex items-center justify-center mb-2 shadow-sm">
                            M1</div>
                        <h3 className="font-black leading-tight">CMO Agent</h3>
                        <p className="text-[10px] font-bold mt-1 text-gray-500 uppercase">Manager</p>
                    </div>
                </div>

                {/* Department: Strategy */}
                <div
                    className="absolute top-[40%] left-[50%] -translate-x-1/2 w-44 bg-white border-3 border-neo-black shadow-[6px_6px_0px_#00E5FF] text-center z-20 cursor-move hover:-translate-y-1 transition-transform">
                    <div className="bg-neo-blue text-neo-black py-1 font-black text-xs uppercase border-b-2 border-black">
                        Strategy</div>
                    <div className="p-3">
                        <div
                            className="w-10 h-10 mx-auto bg-neo-bg border-2 border-black font-black flex items-center justify-center mb-2 shadow-sm">
                            S1</div>
                        <h3 className="font-black leading-tight">CIO Agent</h3>
                        <p className="text-[10px] font-bold mt-1 text-gray-500 uppercase">Manager</p>
                    </div>
                </div>

                {/* Department: Engineering */}
                <div
                    className="absolute top-[40%] left-[75%] -translate-x-1/2 w-44 bg-white border-3 border-neo-black shadow-[6px_6px_0px_#FF6600] text-center z-20 cursor-move hover:-translate-y-1 transition-transform">
                    <div className="bg-neo-orange text-white py-1 font-black text-xs uppercase border-b-2 border-black">
                        Engineering</div>
                    <div className="p-3">
                        <div
                            className="w-10 h-10 mx-auto bg-neo-bg border-2 border-black font-black flex items-center justify-center mb-2 shadow-sm">
                            E1</div>
                        <h3 className="font-black leading-tight">CTO Agent</h3>
                        <p className="text-[10px] font-bold mt-1 text-gray-500 uppercase">Manager</p>
                    </div>
                </div>

                {/* Marketing Sub-Agents */}
                <div
                    className="absolute top-[70%] left-[15%] -translate-x-1/2 w-36 bg-white border-2 border-neo-black shadow-[4px_4px_0px_#1E1E1E] text-center z-20 cursor-move hover:-translate-y-1 transition-transform">
                    <div className="bg-neo-lime py-1 font-black text-[10px] uppercase border-b border-black">Specialist
                    </div>
                    <div className="p-2">
                        <h3 className="font-black text-sm">SEO Bot</h3>
                    </div>
                </div>

                <div
                    className="absolute top-[70%] left-[35%] -translate-x-1/2 w-36 bg-white border-2 border-neo-black shadow-[4px_4px_0px_#1E1E1E] text-center z-20 cursor-move hover:-translate-y-1 transition-transform hover:ring-2 hover:ring-neo-pink">
                    <div className="bg-neo-yellow py-1 font-black text-[10px] uppercase border-b border-black">Worker</div>
                    <div className="p-2">
                        <h3 className="font-black text-sm">Social Poster</h3>
                    </div>
                </div>

                {/* Engineering Sub-Agents */}
                <div
                    className="absolute top-[70%] left-[65%] -translate-x-1/2 w-36 bg-white border-2 border-neo-black shadow-[4px_4px_0px_#1E1E1E] text-center z-20 cursor-move hover:-translate-y-1 transition-transform">
                    <div className="bg-neo-lime py-1 font-black text-[10px] uppercase border-b border-black">Specialist
                    </div>
                    <div className="p-2">
                        <h3 className="font-black text-sm">Architect</h3>
                    </div>
                </div>

                <div
                    className="absolute top-[70%] left-[85%] -translate-x-1/2 w-36 bg-white border-2 border-neo-black shadow-[4px_4px_0px_#1E1E1E] text-center z-20 cursor-move hover:-translate-y-1 transition-transform">
                    <div className="bg-neo-yellow py-1 font-black text-[10px] uppercase border-b border-black">Worker</div>
                    <div className="p-2">
                        <h3 className="font-black text-sm">DevOps Bot</h3>
                    </div>
                </div>

            </div>

            {/* Side Panel (Selected Node Info) */}
            <div
                className="absolute top-20 right-8 w-80 bg-white neo-border shadow-[8px_8px_0px_#000] z-30 transition-transform hidden lg:block">
                <div className="p-4 border-b-3 border-neo-black bg-neo-bg flex justify-between items-center">
                    <h3 className="font-black uppercase tracking-widest text-sm">Node Inspector</h3>
                    <button className="font-black">X</button>
                </div>
                <div className="p-5 space-y-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 bg-neo-yellow border-2 border-black flex items-center justify-center font-black text-xl shadow-sm -rotate-6">
                            SP</div>
                        <div>
                            <h2 className="font-black text-lg leading-none">Social Poster</h2>
                            <span
                                className="bg-neo-black text-white px-2 py-0.5 text-[10px] font-bold uppercase block mt-1 w-max">Worker
                                (Tier 3)</span>
                        </div>
                    </div>

                    <div className="bg-gray-100 p-3 border-2 border-black">
                        <div className="text-xs font-bold uppercase text-gray-500 mb-1">Assigned Department</div>
                        <div className="font-bold flex items-center gap-2">
                            <span className="w-2 h-2 bg-neo-pink border border-black inline-block"></span> Marketing
                        </div>
                    </div>

                    <div className="bg-gray-100 p-3 border-2 border-black">
                        <div className="text-xs font-bold uppercase text-gray-500 mb-1">Model Engine</div>
                        <div className="font-bold">Claude 3.5 Haiku</div>
                    </div>

                    <div className="bg-gray-100 p-3 border-2 border-black">
                        <div className="text-xs font-bold uppercase text-gray-500 mb-1">Tools Allowed (3)</div>
                        <ul className="text-sm font-bold pl-4 list-disc marker:text-neo-pink">
                            <li>sns_publish</li>
                            <li>sns_analytics</li>
                            <li>image_generate</li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-2 mt-2">
                        <button className="neo-btn bg-white w-full py-2 hover:bg-neo-lime text-sm">Edit Agent Soul</button>
                        <button className="neo-btn bg-white w-full py-2 hover:bg-neo-yellow text-sm">Reassign Node</button>
                    </div>
                </div>
            </div>

        </div>
    </main>
    </>
  );
}

export default Nexus;
