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
`;

function Home() {
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
            {/* API: GET /api/auth/me */}
            <a href="/app/home" className="nav-item active flex items-center gap-3 p-3 font-bold">
                <span
                    className="w-6 h-6 bg-neo-pink text-white flex items-center justify-center neo-border text-xs">H</span>
                Home
            </a>
            <a href="/app/command-center" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">C</span> Command
                Center
            </a>
            <a href="/app/dashboard" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">D</span> Dashboard
            </a>
            <a href="/app/chat" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">M</span> Chat & Msgs
            </a>

            <div className="pt-4 border-t-3 border-neo-black mt-4 mb-2"></div>

            <a href="/app/agents" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">A</span> Agents
            </a>
            <a href="/app/departments" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">O</span> Departments
            </a>
            <a href="/app/trading" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">$</span> Strategy /
                Trade
            </a>
            <a href="/app/costs" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">₩</span> Costs &
                Budget
            </a>
        </div>

        <div className="p-4 border-t-3 border-neo-black bg-neo-bg">
            <div className="flex items-center gap-3">
                <div
                    className="w-10 h-10 bg-neo-blue neo-border neo-shadow-sm flex items-center justify-center font-black text-xl">
                    KC
                </div>
                <div>
                    <div className="font-bold text-sm leading-tight">Kim CEO</div>
                    <div className="text-xs font-bold text-gray-500">Startup Corp</div>
                </div>
            </div>
        </div>
    </nav>

    {/* Main Content */}
    <main className="flex-grow flex flex-col h-full overflow-y-auto bg-neo-bg relative">
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{backgroundImage: "radial-gradient(#1E1E1E 2px, transparent 2px)", backgroundSize: "24px 24px"}}></div>

        {/* Topbar */}
        <header
            className="h-16 border-b-3 border-neo-black bg-white flex items-center justify-between px-8 sticky top-0 z-10 shrink-0">
            <h2 className="text-2xl font-black uppercase">Home Base</h2>
            <div className="flex items-center gap-4">
                {/* API: GET /api/workspace/notifications/count */}
                <button className="neo-btn bg-neo-yellow p-2 flex items-center justify-center relative">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2.5">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    <span
                        className="absolute -top-2 -right-2 bg-neo-pink text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-neo-black">3</span>
                </button>
            </div>
        </header>

        {/* Page Content */}
        <div className="p-8 max-w-6xl w-full mx-auto space-y-12">

            {/* Welcome Hero */}
            <section className="neo-card bg-neo-blue p-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <h2 className="text-5xl font-black uppercase mb-4 tracking-tight">System Online, Commander.</h2>
                    <p className="text-xl font-bold max-w-xl">Your AI agents are currently executing 12 active workflows.
                        Daily budget is looking healthy.</p>
                </div>
                <div className="shrink-0 text-center">
                    <div className="text-6xl font-black bg-white px-4 py-2 neo-border neo-shadow inline-block">24</div>
                    <p className="font-bold uppercase mt-3 tracking-widest text-sm">Active Agents</p>
                </div>
            </section>

            {/* Quick Action Command Input (Lite Version) */}
            {/* API: POST /api/workspace/commands */}
            <section className="neo-card p-6 bg-white flex flex-col gap-4">
                <div className="flex items-center gap-3 border-b-3 border-neo-black pb-4">
                    <div className="w-8 h-8 bg-neo-lime neo-border flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"
                            fill="none">
                            <path d="M5 12h14"></path>
                            <path d="M12 5l7 7-7 7"></path>
                        </svg>
                    </div>
                    <h3 className="text-xl font-black uppercase">Quick Direct Command</h3>
                </div>
                <div className="flex gap-4">
                    <input type="text" placeholder="@ChiefOfStaff Summarize yesterday's sales report..."
                        className="flex-grow p-4 text-xl neo-border neo-shadow bg-neo-bg focus:outline-none focus:bg-white placeholder:text-gray-400 font-medium" />
                    <button className="neo-btn bg-neo-lime text-xl px-8 uppercase tracking-wider">Execute</button>
                </div>
                <div className="flex gap-3 text-sm font-bold uppercase overflow-x-auto pb-2">
                    <span className="bg-neo-bg px-2 py-1 neo-border shrink-0 cursor-pointer hover:bg-neo-yellow">/trade
                        TSLA</span>
                    <span className="bg-neo-bg px-2 py-1 neo-border shrink-0 cursor-pointer hover:bg-neo-yellow">/debate Mkt
                        Strategy</span>
                    <span className="bg-neo-bg px-2 py-1 neo-border shrink-0 cursor-pointer hover:bg-neo-yellow">/report
                        Weekly</span>
                </div>
            </section>

            {/* Three Column Status */}
            <div className="grid md:grid-cols-3 gap-8">

                {/* Active Depts */}
                <div className="neo-card bg-neo-yellow p-6 flex flex-col">
                    <h3
                        className="text-2xl font-black uppercase mb-6 flex justify-between items-center border-b-3 border-neo-black pb-2">
                        Departments
                        <span className="bg-white text-sm px-2 py-1 neo-border">4 Total</span>
                    </h3>
                    <div className="space-y-4 flex-grow">
                        <div className="bg-white p-3 neo-border neo-shadow-sm flex justify-between items-center font-bold">
                            Marketing <span className="text-neo-pink">Busy</span>
                        </div>
                        <div className="bg-white p-3 neo-border neo-shadow-sm flex justify-between items-center font-bold">
                            Strategy <span className="text-neo-lime">Idle</span>
                        </div>
                        <div className="bg-white p-3 neo-border neo-shadow-sm flex justify-between items-center font-bold">
                            R&D Lab <span className="text-neo-pink">Busy</span>
                        </div>
                    </div>
                    <a href="/app/departments" className="neo-btn bg-white w-full py-3 mt-6 text-center text-sm">MANAGE
                        ORG</a>
                </div>

                {/* Recent Activity */}
                {/* API: GET /api/workspace/activity-log */}
                <div className="neo-card bg-white p-6 md:col-span-2">
                    <h3
                        className="text-2xl font-black uppercase mb-6 border-b-3 border-neo-black pb-2 flex items-center justify-between">
                        Live Timeline
                        <a href="/app/activity-log" className="text-sm border-b-2 border-neo-black hover:text-neo-pink">View
                            All</a>
                    </h3>
                    <div
                        className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-neo-black before:to-transparent">

                        {/* Item */}
                        <div
                            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group mb-8">
                            <div
                                className="flex items-center justify-center w-10 h-10 rounded-full border-3 border-neo-black bg-neo-pink text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 neo-shadow-sm z-10 font-bold text-xs">
                                SV</div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 neo-card bg-neo-bg">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-black">SEO Robot</span>
                                    <span className="text-xs font-bold text-gray-500">1m ago</span>
                                </div>
                                <p className="text-sm font-medium">Published new blog post on "AI Automation Trends 2026"
                                    via SNS Agency.</p>
                            </div>
                        </div>

                        {/* Item */}
                        <div
                            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group mb-8">
                            <div
                                className="flex items-center justify-center w-10 h-10 rounded-full border-3 border-neo-black bg-neo-lime text-neo-black shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 neo-shadow-sm z-10 font-bold text-xs">
                                TR</div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 neo-card bg-white">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-black">Vector (Trader)</span>
                                    <span className="text-xs font-bold text-gray-500">15m ago</span>
                                </div>
                                <p className="text-sm font-medium">Executed BUY order: 15 shares of TSLA @ market price.</p>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    </main>
    </>
  );
}

export default Home;
