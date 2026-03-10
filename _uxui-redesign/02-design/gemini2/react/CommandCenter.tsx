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

        /* Scrollbar */
        ::-webkit-scrollbar {
            width: 10px;
            height: 10px;
            border-left: 3px solid #1E1E1E;
        }

        ::-webkit-scrollbar-track {
            background: #F4F4F0;
        }

        ::-webkit-scrollbar-thumb {
            background: #1E1E1E;
            border: 2px solid #F4F4F0;
        }
`;

function CommandCenter() {
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
            <a href="/app/command-center"
                className="nav-item active flex items-center gap-3 p-3 font-bold transition-colors">
                <span
                    className="w-6 h-6 bg-neo-pink text-white flex items-center justify-center neo-border text-xs">C</span>
                Command Center
            </a>
            <a href="/app/dashboard" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">D</span> Dashboard
            </a>
            <div className="pt-4 border-t-3 border-neo-black mt-4 mb-2"></div>
            <a href="/app/agents" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">A</span> Agents
            </a>
            <a href="/app/reports" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">R</span> Reports
            </a>
        </div>
    </nav>

    {/* Main Content */}
    <main className="flex-grow flex flex-col h-full bg-neo-bg">
        {/* Topbar */}
        <header className="h-16 border-b-3 border-neo-black bg-white flex items-center justify-between px-8 shrink-0">
            <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black uppercase">Command Center</h2>
                <span className="px-2 py-1 bg-neo-lime text-xs font-bold neo-border shadow-[2px_2px_0px_#000]">Websocket
                    Active</span>
            </div>
            {/* API: GET /api/workspace/presets */}
            <button className="neo-btn bg-white px-4 py-1.5 text-sm flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <path d="M2 15h10"></path>
                    <path d="M9 18l3-3-3-3"></path>
                </svg>
                Load Preset
            </button>
        </header>

        {/* Command Area */}
        <div className="flex-grow flex overflow-hidden">

            {/* Timeline / Execution Area (Left) */}
            <div className="flex-grow overflow-y-auto p-8 flex flex-col gap-6">

                {/* History Item 1 */}
                <div className="neo-card bg-white w-full max-w-4xl opacity-75 grayscale-[50%]">
                    <div className="border-b-3 border-neo-black p-4 bg-neo-bg flex justify-between items-center">
                        <div className="flex items-center gap-3 font-bold">
                            <span
                                className="w-8 h-8 rounded-full bg-neo-black text-white flex items-center justify-center text-xs">KC</span>
                            <span>@Strategist Analyze Q3 competitor revenue.</span>
                        </div>
                        <span className="text-xs font-bold">Yesterday, 14:02</span>
                    </div>
                    <div className="p-4 bg-white border-b-3 border-neo-black space-y-2">
                        <div className="flex items-center gap-2 text-sm font-bold text-neo-pink">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                strokeWidth="3">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            Task Completed
                        </div>
                    </div>
                </div>

                {/* Current Active Execution */}
                {/* API: GET /api/workspace/commands/:id/delegation */}
                <div
                    className="neo-card bg-white w-full max-w-4xl shadow-[12px_12px_0px_0px_rgba(30,30,30,1)] ring-4 ring-neo-lime">
                    {/* User Input */}
                    <div className="border-b-3 border-neo-black p-4 bg-neo-yellow flex justify-between items-start">
                        <div className="flex items-start gap-4">
                            <div
                                className="w-10 h-10 bg-white neo-border flex items-center justify-center font-black mt-1 shadow-[2px_2px_0px_#000]">
                                KC</div>
                            <div>
                                <h4 className="font-black text-xl mb-1">Create Tech Spec for v2 Architecture</h4>
                                <div className="flex gap-2 text-xs font-bold mt-2">
                                    <span className="bg-white px-2 py-0.5 neo-border">/spec</span>
                                    <span className="bg-white px-2 py-0.5 neo-border">@ChiefOfStaff</span>
                                </div>
                            </div>
                        </div>
                        <span className="bg-white px-2 py-1 neo-border text-xs font-black animate-pulse">Running (1m
                            24s)</span>
                    </div>

                    {/* Delegation Chain UI */}
                    <div className="p-6 bg-neo-bg space-y-6">
                        {/* Step 1 */}
                        <div className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <div
                                    className="w-8 h-8 rounded-full bg-neo-blue neo-border flex items-center justify-center text-white p-1">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </div>
                                <div className="w-1 h-full bg-neo-black mt-2"></div>
                            </div>
                            <div className="bg-white neo-border p-3 flex-grow shadow-[4px_4px_0px_#000]">
                                <p className="font-bold text-sm">Chief of Staff (Manager)</p>
                                <p className="text-sm">Delegating task to Engineering Department.</p>
                            </div>
                        </div>
                        {/* Step 2 */}
                        <div className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <div
                                    className="w-8 h-8 rounded-full bg-neo-pink text-white neo-border flex items-center justify-center">
                                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="3">
                                        <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                                    </svg>
                                </div>
                            </div>
                            <div className="bg-white border-3 border-neo-pink p-3 flex-grow shadow-[4px_4px_0px_#FF3366]">
                                <p className="font-bold text-sm">Architect Agent (Specialist)</p>
                                <p className="text-sm">Executing <code>read_prd_file</code> tool... analyzing requirements.
                                </p>
                                <div className="mt-2 text-xs bg-gray-100 p-2 font-mono neo-border w-fit">
                                    > tool_call: search_web("modern SaaS design patterns")
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Context Inspector (Right Sidebar) */}
            <aside className="w-80 border-l-3 border-neo-black bg-white flex flex-col shrink-0">
                <div className="p-4 border-b-3 border-neo-black bg-neo-yellow">
                    <h3 className="font-black tracking-widest uppercase">Context Inspector</h3>
                </div>
                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    <div className="neo-card bg-neo-bg p-4 text-sm font-medium">
                        <strong className="block mb-2 text-base uppercase">Available Departments</strong>
                        <ul className="space-y-1">
                            <li className="flex justify-between border-b border-black pb-1"><span>Marketing</span> <span
                                    className="bg-neo-lime font-bold px-1 border border-black">8 Agents</span></li>
                            <li className="flex justify-between border-b border-black py-1"><span>Engineering</span> <span
                                    className="bg-neo-lime font-bold px-1 border border-black">3 Agents</span></li>
                            <li className="flex justify-between py-1"><span>Strategy</span> <span
                                    className="bg-neo-pink text-white font-bold px-1 border border-black">Busy (4)</span>
                            </li>
                        </ul>
                    </div>

                    <div className="neo-card bg-white p-4 text-sm">
                        <strong className="block mb-2 text-base uppercase">Budget Cap</strong>
                        <div className="w-full bg-gray-200 h-3 border-2 border-black rounded-full overflow-hidden mb-1">
                            <div className="bg-neo-pink h-full w-[85%] border-r-2 border-black"></div>
                        </div>
                        <div className="flex justify-between font-bold">
                            <span>$42.50 used</span>
                            <span>$50.00 max</span>
                        </div>
                    </div>
                </div>
            </aside>

        </div>

        {/* Input Box Area (Bottom Fixed) */}
        <div className="h-auto border-t-3 border-neo-black bg-white p-6 shrink-0 relative z-20">
            <div className="max-w-5xl mx-auto flex flex-col gap-3">
                <div className="flex gap-2">
                    <button
                        className="bg-neo-bg px-3 py-1 neo-border text-xs font-bold hover:bg-neo-yellow uppercase">@Mention
                        Agent</button>
                    <button
                        className="bg-neo-bg px-3 py-1 neo-border text-xs font-bold hover:bg-neo-yellow uppercase">/Slash
                        Command</button>
                    <button className="bg-neo-bg px-3 py-1 neo-border text-xs font-bold hover:bg-neo-yellow uppercase">+
                        Attachment</button>
                </div>
                <form className="flex gap-4 relative" onSubmit="event.preventDefault();">
                    <textarea
                        className="flex-grow p-4 text-xl neo-border neo-shadow focus:outline-none focus:bg-white bg-neo-bg resize-none h-20"
                        placeholder="Enter command for the AI organization..."></textarea>
                    {/* API: POST /api/workspace/commands */}
                    <button type="submit"
                        className="neo-btn bg-neo-lime text-2xl font-black px-10 h-20 shrink-0 uppercase tracking-widest shadow-[6px_6px_0px_#000] hover:shadow-[8px_8px_0px_#000]">EXECUTE</button>
                </form>
            </div>
        </div>
    </main>
    </>
  );
}

export default CommandCenter;
