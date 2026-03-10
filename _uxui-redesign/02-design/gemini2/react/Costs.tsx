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

function Costs() {
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
            <a href="/app/dashboard" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">D</span> Dashboard
            </a>
            <a href="/app/performance" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">P</span> Performance
            </a>
            <a href="/app/costs" className="nav-item active flex items-center gap-3 p-3 font-bold transition-colors">
                <span
                    className="w-6 h-6 bg-neo-orange text-white flex items-center justify-center neo-border text-xs shadow-[2px_2px_0px_#000]">₩</span>
                Costs & Budget
            </a>
        </div>
    </nav>

    {/* Main Content */}
    <main className="flex-grow flex flex-col h-full bg-neo-bg overflow-y-auto w-full">

        {/* Topbar */}
        <header
            className="h-16 border-b-3 border-neo-black bg-white flex items-center justify-between px-8 sticky top-0 z-20 shrink-0">
            <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black uppercase">Token Costs & Budgeting</h2>
            </div>
            <div className="flex items-center">
                <div className="flex bg-white neo-border p-1">
                    <button className="bg-neo-black text-white px-3 py-1 text-xs font-bold uppercase cursor-default">Month
                        To Date</button>
                    <button className="hover:bg-gray-200 px-3 py-1 text-xs font-bold uppercase transition-colors">Previous
                        Month</button>
                </div>
            </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto space-y-8 w-full flex-grow">

            {/* Global Budget Summary */}
            {/* API: GET /api/workspace/billing/summary */}
            <div
                className="neo-card bg-neo-black text-white p-8 flex flex-col md:flex-row gap-8 justify-between relative overflow-hidden">
                <div className="absolute inset-0 opacity-20"
                    style={{backgroundImage: "repeating-linear-gradient(45deg, #FF6600 0, #FF6600 2px, transparent 2px, transparent 12px)"}}>
                </div>

                <div className="relative z-10 max-w-md">
                    <h3
                        className="text-sm font-black uppercase tracking-widest bg-neo-orange px-2 py-1 text-neo-black border-2 border-white inline-block mb-4 shadow-[2px_2px_0px_#FFF]">
                        Current Cycle Est.</h3>
                    <div className="text-6xl font-black mb-2">$ 42.50</div>
                    <p className="font-bold text-gray-300">Your global spending is on track. At this rate, projected
                        end-of-month cost is <span className="text-white">$120.00</span></p>
                </div>

                <div className="relative z-10 w-full md:w-1/2 flex flex-col justify-center">
                    <div className="flex justify-between items-center font-bold mb-2">
                        <span className="uppercase text-sm">Workspace Global Cap</span>
                        <span className="text-neo-pink">$50.00 Limit</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-6 border-3 border-white bg-neo-bg p-1 relative">
                        <div
                            className="bg-neo-orange h-full w-[85%] border-r-3 border-white z-10 relative flex justify-end items-center pr-2 font-black text-xs text-black">
                            85%</div>
                        {/* Alert Marker */}
                        <div className="absolute h-full w-0.5 bg-neo-pink z-20 top-0 left-[90%] pointer-events-none"></div>
                    </div>
                    {/* API: PUT /api/workspace/billing/limit */}
                    <button
                        className="neo-btn bg-white text-neo-black px-4 py-2 text-sm uppercase font-black w-fit mt-4 hover:bg-neo-yellow">Modify
                        Limit</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Breakdown by Department/Agent */}
                {/* API: GET /api/workspace/billing/breakdown */}
                <div className="neo-card bg-white flex flex-col">
                    <div className="p-4 border-b-3 border-neo-black bg-neo-yellow">
                        <h3 className="font-black text-lg uppercase tracking-wider">Top Consumers</h3>
                    </div>
                    <div className="p-6 space-y-6 bg-white overflow-y-auto flex-grow max-h-96">

                        {/* Item */}
                        <div>
                            <div className="flex justify-between items-end mb-1">
                                <span className="font-black uppercase">Marketing Dept</span>
                                <span className="font-black text-lg text-neo-pink">$18.50</span>
                            </div>
                            <div className="flex gap-2 text-xs font-bold text-gray-500 mb-2">
                                <span>2.4M Pro Tokens</span> • <span>0.8M Vision Tokens</span>
                            </div>
                            <div className="w-full bg-gray-200 h-2 border border-black">
                                <div className="bg-neo-pink h-full w-[45%] border-r border-black"></div>
                            </div>
                        </div>

                        {/* Item */}
                        <div>
                            <div className="flex justify-between items-end mb-1">
                                <span className="font-black uppercase">CIO Agent (Strategy)</span>
                                <span className="font-black text-lg">$12.00</span>
                            </div>
                            <div className="flex gap-2 text-xs font-bold text-gray-500 mb-2">
                                <span>1.2M Opus Tokens</span> (Heavy Reasoning)
                            </div>
                            <div className="w-full bg-gray-200 h-2 border border-black">
                                <div className="bg-neo-lime h-full w-[30%] border-r border-black"></div>
                            </div>
                        </div>

                        {/* Item */}
                        <div>
                            <div className="flex justify-between items-end mb-1">
                                <span className="font-black uppercase text-gray-600">Daily Scraper Bot</span>
                                <span className="font-black text-lg text-gray-600">$8.00</span>
                            </div>
                            <div className="flex gap-2 text-xs font-bold text-gray-500 mb-2">
                                <span>8M Haiku Tokens</span> (High Volume)
                            </div>
                            <div className="w-full bg-gray-200 h-2 border border-black">
                                <div className="bg-gray-400 h-full w-[15%] border-r border-black"></div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Breakdown by Model */}
                <div className="neo-card bg-white flex flex-col">
                    <div className="p-4 border-b-3 border-neo-black bg-neo-bg">
                        <h3 className="font-black text-lg uppercase tracking-wider">Usage By AI Model Engine</h3>
                    </div>
                    <div className="p-6 bg-white flex-grow flex flex-col justify-center items-center">

                        <div
                            className="w-48 h-48 rounded-full border-4 border-neo-black relative overflow-hidden shadow-[8px_8px_0px_#000] rotate-12 mb-8">
                            {/* Fake Pie Chart via conic-gradient */}
                            <div className="absolute inset-0"
                                style={{background: "conic-gradient(#1E1E1E 0% 60%, #FF3366 60% 85%, #BFFF00 85% 100%)"}}>
                            </div>
                            {/* Center hole for donut */}
                            <div
                                className="absolute inset-[25%] bg-white rounded-full border-4 border-neo-black flex items-center justify-center -rotate-12">
                                <span className="font-black uppercase text-xs text-center">Engine<br />Split</span>
                            </div>
                        </div>

                        <div className="w-full space-y-2 text-sm font-bold uppercase tracking-wide">
                            <div className="flex justify-between items-center p-2 bg-gray-100 neo-border">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-neo-black border border-black"></div> Claude 3.5 Sonnet
                                </div>
                                <span>60%</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-gray-100 neo-border">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-neo-pink border border-black"></div> Claude 3 Opus
                                </div>
                                <span>25%</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-gray-100 neo-border">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-neo-lime border border-black"></div> Claude 3 Haiku
                                </div>
                                <span>15%</span>
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

export default Costs;
