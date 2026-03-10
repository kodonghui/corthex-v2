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

        .bg-pattern {
            background-image:
                radial-gradient(#1E1E1E 1px, transparent 1px),
                radial-gradient(#1E1E1E 1px, transparent 1px);
            background-size: 20px 20px;
            background-position: 0 0, 10px 10px;
            opacity: 0.05;
        }
`;

function Agora() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
<div className="absolute inset-0 bg-pattern pointer-events-none z-0"></div>

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
            <a href="/app/trading" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">$</span> Strategy /
                Trade
            </a>
            <a href="/app/agora" className="nav-item active flex items-center gap-3 p-3 font-bold transition-colors">
                <span
                    className="w-6 h-6 bg-neo-yellow flex items-center justify-center neo-border text-xs shadow-[2px_2px_0px_#000]">Ä</span>
                Agora
            </a>
            <a href="/app/nexus" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">N</span> Nexus
            </a>
        </div>
    </nav>

    {/* Main Content */}
    <main className="flex-grow flex flex-col h-full bg-neo-bg overflow-y-auto relative z-10">

        {/* Topbar */}
        <header
            className="h-16 border-b-3 border-neo-black bg-white flex items-center justify-between px-8 sticky top-0 z-20 shrink-0">
            <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black uppercase tracking-wider">A G O R A</h2>
                <span
                    className="bg-neo-black text-white px-2 py-0.5 text-xs font-bold neo-border shadow-[2px_2px_0px_#FF3366]">Debate
                    Engine</span>
            </div>
            {/* API: POST /api/workspace/debates */}
            <button className="neo-btn bg-neo-lime px-6 py-2 uppercase tracking-wide">Start New Debate</button>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8 w-full flex flex-col h-[calc(100vh-4rem)]">

            {/* Context / Topic Header */}
            {/* API: GET /api/workspace/debates/:id */}
            <div className="neo-card bg-neo-blue p-6 shrink-0 relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full border-[10px] border-white/20"></div>

                <h3
                    className="text-sm font-black uppercase px-3 py-1 bg-white border-2 border-neo-black shadow-[2px_2px_0px_#000] inline-block mb-3">
                    Topic / Resolution</h3>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight lg:pr-24">"Should we migrate our
                    core database to Neon Serverless by Q4?"</h1>

                <div className="flex flex-wrap gap-4 mt-6">
                    <div className="bg-white px-3 py-1 neo-border text-sm font-bold flex items-center gap-2">
                        Round: <span className="bg-neo-yellow px-2 border border-black">2 of 3</span>
                    </div>
                    <div className="bg-white px-3 py-1 neo-border text-sm font-bold flex items-center gap-2">
                        Status: <span className="text-neo-pink">Live Debate</span>
                    </div>
                    <div className="bg-white px-3 py-1 neo-border text-sm font-bold flex items-center gap-2">
                        Format: <span className="text-neo-black">Structured (Pro vs Con)</span>
                    </div>
                </div>
            </div>

            {/* Debate Arena */}
            {/* API: GET /api/workspace/debates/:id/timeline */}
            <div className="flex-grow flex flex-col lg:flex-row gap-6 min-h-0 pb-8">

                {/* PRO Side */}
                <div className="flex-1 neo-card bg-neo-bg flex flex-col h-full">
                    <div className="p-4 border-b-3 border-neo-black bg-neo-lime flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-3">
                            <span
                                className="w-8 h-8 rounded-full bg-white text-neo-black neo-border font-black flex items-center justify-center text-xs">Ar</span>
                            <h3 className="font-black text-xl uppercase">Architect Agent</h3>
                        </div>
                        <span
                            className="bg-white px-2 py-0.5 border-2 border-black font-black uppercase text-xs rotate-[-3deg] shadow-[2px_2px_0px_#000]">PRO</span>
                    </div>
                    <div className="flex-grow p-6 overflow-y-auto space-y-4 shadow-inner">
                        {/* Round 1 */}
                        <div>
                            <span className="text-xs font-bold uppercase text-gray-500 mb-1 block">Round 1 (Opening)</span>
                            <div className="bg-white p-4 neo-border shadow-[4px_4px_0px_#000] font-medium leading-relaxed">
                                Moving to Neon Serverless provides distinct autoscaling advantages. Our current DB usage
                                is highly spiky due to marketing campaigns. By moving to serverless, we eliminate idle
                                DB costs and can instantly scale during high-traffic events. Branching features also
                                align perfectly with our CI/CD pipeline.
                            </div>
                        </div>

                        {/* Round 2 */}
                        <div className="opacity-50">
                            <span
                                className="text-xs font-bold uppercase text-gray-500 mb-1 block flex items-center gap-2">Round
                                2 (Rebuttal) <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" strokeWidth="3">
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                                </svg></span>
                            <div className="bg-white p-4 neo-border font-medium bg-gray-100">
                                <em>Drafting response to Ops Lead...</em>
                            </div>
                        </div>
                    </div>
                </div>

                {/* VS Divider (Desktop) */}
                <div className="hidden lg:flex flex-col items-center justify-center -mx-3 z-10">
                    <div
                        className="w-16 h-16 rounded-full bg-neo-black text-neo-yellow neo-border flex items-center justify-center text-2xl font-black shadow-[4px_4px_0px_0px_rgba(255,232,0,1)] uppercase -rotate-12 z-20">
                        VS</div>
                    <div className="w-3 h-32 bg-neo-black mt-[-16px] z-10 border-x-3 border-white"></div>
                </div>

                {/* CON Side */}
                <div className="flex-1 neo-card bg-neo-bg flex flex-col h-full">
                    <div
                        className="p-4 border-b-3 border-neo-black bg-neo-pink text-white flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-3">
                            <span
                                className="w-8 h-8 rounded-full bg-white text-neo-black border-2 border-white font-black flex items-center justify-center text-xs">Op</span>
                            <h3 className="font-black text-xl uppercase">Ops Lead Agent</h3>
                        </div>
                        <span
                            className="bg-neo-black text-white px-2 py-0.5 border-2 border-white font-black uppercase text-xs rotate-[3deg] shadow-[2px_2px_0px_#FFF]">CON</span>
                    </div>
                    <div className="flex-grow p-6 overflow-y-auto space-y-4 shadow-inner">
                        {/* Round 1 */}
                        <div>
                            <span className="text-xs font-bold uppercase text-gray-500 mb-1 block">Round 1 (Opening)</span>
                            <div className="bg-white p-4 neo-border shadow-[4px_4px_0px_#000] font-medium leading-relaxed">
                                The transition risk is too high right now. Serverless DB architectures often suffer from
                                "cold starts," which could severely degrade API performance on our first requests.
                                Furthermore, vendor lock-in with Neon's specific features makes migrating away later
                                much harder. Stability outweighs scalability.
                            </div>
                        </div>

                        {/* Round 2 */}
                        <div>
                            <span className="text-xs font-bold uppercase text-gray-500 mb-1 block">Round 2 (Rebuttal) -
                                <span className="text-neo-pink">New</span></span>
                            <div
                                className="bg-white border-3 border-neo-pink p-4 shadow-[4px_4px_0px_#FF3366] font-medium leading-relaxed">
                                Pointing out the "idle DB cost" from Architect is flawed. Our baseline traffic is high
                                enough that we rarely hit zero. In fact, consistently high traffic on a serverless
                                pricing model might actually cost MORE than provisioned capacity. Have we modeled the
                                cost crossing point?
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* CEO / Moderator Controls */}
            <div
                className="neo-card bg-white p-4 shrink-0 flex items-center md:items-start flex-col md:flex-row gap-4 justify-between border-t-4 border-b-0 border-x-0 md:border-t-3 md:border-b-3 md:border-x-3 border-neo-black">
                <div className="flex flex-col gap-1 w-full md:w-auto">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Moderator Actions
                        (CEO)</span>
                    <input type="text"
                        className="neo-input p-3 w-full md:w-96 text-sm font-medium focus:outline-none focus:bg-neo-yellow/10"
                        placeholder="Inject fact, demand clarification, or force conclude..." />
                </div>
                <div className="flex gap-2 w-full md:w-auto shrink-0 self-end">
                    <button className="neo-btn bg-neo-bg px-4 py-3 uppercase text-sm font-black hover:bg-neo-yellow">Inject
                        Info</button>
                    {/* API: POST /api/workspace/debates/:id/start (or conclude) */}
                    <button
                        className="neo-btn bg-neo-black text-neo-lime px-6 py-3 uppercase text-sm font-black shadow-[4px_4px_0px_#BFFF00]">Force
                        Conclude</button>
                </div>
            </div>

        </div>
    </main>
    </>
  );
}

export default Agora;
