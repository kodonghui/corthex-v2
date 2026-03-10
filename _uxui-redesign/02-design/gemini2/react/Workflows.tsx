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

        /* Node connection line styling */
        .node-line {
            position: absolute;
            width: 2px;
            background-color: #1E1E1E;
            z-index: 0;
        }
`;

function Workflows() {
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
            <a href="/app/command-center" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">C</span> Commands
            </a>
            <a href="/app/workflows" className="nav-item active flex items-center gap-3 p-3 font-bold transition-colors">
                <span
                    className="w-6 h-6 bg-neo-blue text-white flex items-center justify-center neo-border text-xs shadow-[2px_2px_0px_#000]">W</span>
                Workflows
            </a>
            <a href="/app/agents" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">A</span> Agents
            </a>
        </div>
    </nav>

    {/* Main Content */}
    <main className="flex-grow flex flex-col h-full bg-neo-bg overflow-hidden w-full relative">

        {/* Topbar */}
        <header
            className="h-16 border-b-3 border-neo-black bg-white flex items-center justify-between px-8 sticky top-0 z-20 shrink-0">
            <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black uppercase tracking-wide">Automation Builder</h2>
            </div>
            <div className="flex items-center gap-4">
                {/* API: POST /api/workspace/workflows/save */}
                <button
                    className="bg-white border-3 border-neo-black px-4 py-1.5 font-bold uppercase text-sm hover:bg-gray-100 transition-colors shadow-sm">Draft
                    Saved</button>
                <button className="neo-btn bg-neo-lime px-6 py-1.5 text-sm uppercase tracking-wide">Publish
                    Workflow</button>
            </div>
        </header>

        {/* Builder Interface */}
        <div
            className="flex-grow relative overflow-hidden bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMzAsMzAsMzAsMC4yKSIvPjwvc3ZnPg==')]">

            {/* Toolbar Overlay */}
            <div className="absolute top-6 left-6 z-30 flex flex-col gap-4">
                <div className="neo-card bg-white p-3 flex flex-col gap-2 shadow-[4px_4px_0px_#000]">
                    <div
                        className="text-xs font-black uppercase tracking-widest border-b-2 border-black pb-1 mb-1 text-center">
                        Nodes</div>
                    <button
                        className="bg-neo-yellow neo-border p-2 font-bold text-xs hover:bg-yellow-300 transform hover:-translate-y-0.5 transition-all">Trigger</button>
                    <button
                        className="bg-neo-blue text-white neo-border p-2 font-bold text-xs hover:bg-blue-400 transform hover:-translate-y-0.5 transition-all">Agent
                        Task</button>
                    <button
                        className="bg-neo-pink text-white neo-border p-2 font-bold text-xs hover:bg-pink-400 transform hover:-translate-y-0.5 transition-all">Condition</button>
                    <button
                        className="bg-white neo-border p-2 font-bold text-xs hover:bg-gray-100 transform hover:-translate-y-0.5 transition-all">API
                        Action</button>
                </div>
            </div>

            {/* Canvas Area (Mockup of nodes) */}
            <div className="w-full h-full relative cursor-grab">

                {/* SVG Lines for Connections */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{overflow: "visible"}}>
                    <path d="M 300 150 C 300 250, 450 150, 450 250" fill="none" stroke="#1E1E1E" strokeWidth="4"
                        stroke-dasharray="8 4" />
                    <path d="M 450 330 C 450 430, 300 330, 300 430" fill="none" stroke="#1E1E1E" strokeWidth="4" />
                    <path d="M 450 330 C 450 430, 650 330, 650 430" fill="none" stroke="#1E1E1E" strokeWidth="4" />
                </svg>

                {/* Node 1: Trigger */}
                <div
                    className="absolute top-[70px] left-[150px] w-64 neo-card bg-neo-yellow z-20 shadow-[6px_6px_0px_#1E1E1E] transform hover:-translate-y-1 transition-transform">
                    <div className="p-3 border-b-3 border-neo-black flex justify-between items-center bg-white">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">⚡</span>
                            <span className="font-black text-sm uppercase">Webhook Trigger</span>
                        </div>
                    </div>
                    <div className="p-4 bg-neo-yellow text-sm font-bold">
                        <p className="mb-2">Listens for Typeform payload.</p>
                        <div className="bg-white p-2 neo-border font-mono text-xs truncate">POST /api/webhook/lead</div>
                    </div>
                </div>

                {/* Node 2: Agent Task */}
                <div
                    className="absolute top-[250px] left-[300px] w-72 neo-card bg-white z-20 shadow-[6px_6px_0px_#1E1E1E] ring-4 ring-neo-blue">
                    <div
                        className="p-3 border-b-3 border-neo-black flex justify-between items-center bg-neo-blue text-white">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                            <span className="font-black text-sm uppercase tracking-wide">Agent: CMO</span>
                        </div>
                    </div>
                    <div className="p-4 bg-white text-sm font-bold space-y-3">
                        <p className="text-gray-700">Analyze lead data and generate a personalized welcome email draft.</p>
                        <div className="flex justify-between items-center text-xs text-gray-500 uppercase">
                            <span>Input: Payload</span>
                            <span>Model: Opus</span>
                        </div>
                    </div>
                </div>

                {/* Node 3: Condition */}
                <div
                    className="absolute top-[430px] left-[200px] w-56 neo-card bg-neo-bg z-20 shadow-[6px_6px_0px_#1E1E1E] transform rotate-1">
                    <div
                        className="p-3 border-b-3 border-neo-black flex justify-between items-center bg-neo-pink text-white">
                        <span className="font-black text-sm uppercase tracking-wide">Condition (Fail)</span>
                    </div>
                    <div className="p-4 bg-white text-sm font-bold text-center">
                        Spam Detected
                        <div className="mt-2 text-xs text-gray-500">End Workflow</div>
                    </div>
                </div>

                {/* Node 4: Action */}
                <div className="absolute top-[430px] left-[550px] w-64 neo-card bg-white z-20 shadow-[6px_6px_0px_#1E1E1E]">
                    <div className="p-3 border-b-3 border-neo-black flex justify-between items-center bg-gray-100">
                        <div className="flex items-center gap-2">
                            <span className="font-black text-sm uppercase tracking-wide text-gray-800">API Action</span>
                        </div>
                    </div>
                    <div className="p-4 bg-white text-sm font-bold">
                        <p className="mb-2">Send Email via SendGrid</p>
                        <div className="bg-neo-bg p-2 neo-border font-mono text-xs text-center border-dashed">
                            Wait for Human Approval
                        </div>
                    </div>
                </div>

            </div>

            {/* Properties Panel (Right side) */}
            <div
                className="absolute top-0 right-0 w-80 h-full border-l-4 border-neo-black bg-white z-30 shadow-[-8px_0px_0px_rgba(0,0,0,0.1)] flex flex-col">
                <div className="p-4 border-b-3 border-neo-black bg-neo-blue text-white">
                    <h3 className="font-black uppercase tracking-wider">Node Properties</h3>
                    <p className="text-xs mt-1">Agent: CMO</p>
                </div>
                <div className="p-4 flex-grow overflow-y-auto space-y-6">
                    <div className="flex flex-col gap-2">
                        <label className="font-bold text-xs uppercase">Task Prompt</label>
                        <textarea
                            className="w-full h-32 p-3 border-3 border-neo-black bg-neo-bg font-mono text-xs focus:outline-none focus:bg-white shadow-[2px_2px_0px_#000] resize-none">You are the CMO. Analyze the JSON input from the webhook.
Determine if the lead is high-value based on company size.
Draft a personalized email addressing their likely pain points.</textarea>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="font-bold text-xs uppercase">Output Variable Name</label>
                        <input type="text" value="email_draft"
                            className="w-full p-2 border-3 border-neo-black bg-white font-mono text-xs focus:outline-none shadow-[2px_2px_0px_#000]" />
                    </div>
                    <div className="flex justify-between items-center bg-gray-100 p-2 neo-border">
                        <span className="font-bold text-xs uppercase">RAG Context Access</span>
                        <input type="checkbox" checked className="w-4 h-4 accent-neo-black" />
                    </div>
                </div>
                {/* API: DELETE /api/workspace/workflows/node/:id */}
                <button
                    className="bg-white border-t-3 border-neo-black text-neo-pink font-black uppercase py-4 hover:bg-neo-pink hover:text-white transition-colors">Delete
                    Node</button>
            </div>

        </div>
    </main>
    </>
  );
}

export default Workflows;
