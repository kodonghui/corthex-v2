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

        .ticker-red {
            background-color: #FF3366;
            color: white;
        }

        .ticker-green {
            background-color: #BFFF00;
            color: #1E1E1E;
        }
`;

function Trading() {
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
            <a href="/app/trading" className="nav-item active flex items-center gap-3 p-3 font-bold transition-colors">
                <span
                    className="w-6 h-6 bg-neo-lime flex items-center justify-center neo-border text-xs shadow-[2px_2px_0px_#000]">$</span>
                Strategy / Trade
            </a>
            <a href="/app/agora" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">Ä</span> Agora
            </a>
            <a href="/app/nexus" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">N</span> Nexus
            </a>
        </div>
    </nav>

    {/* Main Content */}
    <main className="flex-grow flex flex-col h-full bg-neo-bg overflow-y-auto">

        {/* Topbar */}
        <header
            className="h-16 border-b-3 border-neo-black bg-white flex items-center justify-between px-8 sticky top-0 z-20 shrink-0">
            <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black uppercase">Strategy / Trade</h2>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 font-bold bg-neo-bg px-3 py-1 neo-border shadow-sm">
                    <span className="w-3 h-3 bg-neo-lime rounded-full border border-black animate-pulse"></span>
                    KIS API CONNECTED
                </div>
                <button className="neo-btn bg-neo-yellow px-4 py-1 text-sm">Mode: Mock Trade</button>
            </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-10 w-full">

            {/* Portfolio Top Row */}
            {/* API: GET /api/workspace/strategy/prices */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Portfolio Value */}
                <div
                    className="neo-card bg-neo-black text-white p-6 lg:col-span-2 flex flex-col justify-between h-48 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20"
                        style={{backgroundImage: "repeating-linear-gradient(45deg, #FF3366 0, #FF3366 2px, transparent 2px, transparent 12px)"}}>
                    </div>

                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <span
                                className="font-bold text-sm uppercase tracking-widest bg-white border-2 border-neo-black px-2 py-0.5 text-neo-black">Total
                                Equity</span>
                            <div className="text-6xl font-black mt-2 tracking-tight">$ 142,504.20</div>
                            <div className="text-lg font-bold mt-2 text-neo-lime flex items-center gap-2">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    strokeWidth="3">
                                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                                    <polyline points="16 7 22 7 22 13"></polyline>
                                </svg>
                                +$3,240.50 (2.4%) Today
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button className="neo-btn bg-neo-yellow text-neo-black px-6 py-2">Deposit</button>
                            <button className="neo-btn bg-white text-neo-black px-6 py-2">Withdraw</button>
                        </div>
                    </div>
                </div>

                {/* Asset Allocation */}
                {/* API: GET /api/workspace/strategy/shares */}
                <div className="neo-card bg-white p-6 flex flex-col justify-between h-48">
                    <div className="flex justify-between items-start mb-4">
                        <span
                            className="font-bold text-sm uppercase tracking-widest bg-neo-blue border-2 border-neo-black px-2 py-0.5 shadow-[2px_2px_0px_#000]">Allocation</span>
                    </div>
                    <div className="space-y-3 font-bold text-sm flex-grow">
                        <div className="flex justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-neo-pink border border-black"></div>US Equities
                            </div><span>65%</span>
                        </div>
                        <div className="flex justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-neo-lime border border-black"></div>KR Equities
                            </div><span>25%</span>
                        </div>
                        <div className="flex justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-neo-yellow border border-black"></div>Cash
                            </div><span>10%</span>
                        </div>
                    </div>
                    {/* Allocation Bar */}
                    <div className="w-full flex h-4 border-2 border-neo-black mt-2">
                        <div className="bg-neo-pink h-full w-[65%] border-r-2 border-black"></div>
                        <div className="bg-neo-lime h-full w-[25%] border-r-2 border-black"></div>
                        <div className="bg-neo-yellow h-full w-[10%]"></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Sidebar: Watchlist */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="neo-card bg-white overflow-hidden flex flex-col">
                        <div className="p-4 border-b-3 border-neo-black bg-neo-yellow flex justify-between items-center">
                            <h3 className="text-lg font-black uppercase">Watchlist</h3>
                            <button className="font-black text-xl hover:text-neo-pink">+</button>
                        </div>
                        <div className="divide-y-3 divide-neo-black bg-white">
                            {/* Item 1 */}
                            <div className="p-3 hover:bg-neo-bg cursor-pointer flex justify-between items-center">
                                <div>
                                    <h4 className="font-black text-lg leading-none">TSLA</h4>
                                    <span className="text-xs font-bold text-gray-500">Tesla Inc</span>
                                </div>
                                <div className="text-right">
                                    <div className="font-black">$242.50</div>
                                    <div className="text-xs font-bold ticker-green px-1 border border-black">+3.20%</div>
                                </div>
                            </div>
                            {/* Item 2 */}
                            <div
                                className="p-3 hover:bg-neo-bg cursor-pointer flex justify-between items-center bg-gray-100">
                                <div>
                                    <h4 className="font-black text-lg leading-none">NVDA</h4>
                                    <span className="text-xs font-bold text-gray-500">NVIDIA Corp</span>
                                </div>
                                <div className="text-right">
                                    <div className="font-black">$128.90</div>
                                    <div className="text-xs font-bold ticker-red px-1 border border-black">-1.05%</div>
                                </div>
                            </div>
                            {/* Item 3 */}
                            <div className="p-3 hover:bg-neo-bg cursor-pointer flex justify-between items-center">
                                <div>
                                    <h4 className="font-black text-lg leading-none">AAPL</h4>
                                    <span className="text-xs font-bold text-gray-500">Apple Inc</span>
                                </div>
                                <div className="text-right">
                                    <div className="font-black">$175.20</div>
                                    <div className="text-xs font-bold text-gray-600 px-1 border border-black">+0.05%</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Signal Box */}
                    <div
                        className="neo-card bg-neo-pink text-white p-5 cursor-pointer hover:-translate-y-1 transition-transform">
                        <h4 className="font-black uppercase mb-2 flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                strokeWidth="3">
                                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                            </svg>
                            CIO Alert
                        </h4>
                        <p className="text-sm font-bold">Strong BUY signal detected for TSLA based on recent earnings call
                            sentiment analysis.</p>
                        <button
                            className="bg-white text-neo-black border-2 border-black font-bold uppercase text-xs px-3 py-1 mt-3 shadow-[2px_2px_0px_#000]">Analyze
                            Now</button>
                    </div>
                </div>

                {/* Main Area: Chart & Orders */}
                <div className="lg:col-span-3 space-y-6 flex flex-col">

                    {/* Chart Area Placeholder */}
                    {/* API: GET /api/workspace/strategy/shares/:symbol/chart */}
                    <div className="neo-card bg-white p-4 h-80 flex flex-col">
                        <div className="flex justify-between items-center mb-4 border-b-3 border-neo-black pb-4">
                            <div className="flex items-center gap-4">
                                <h3 className="text-3xl font-black">TSLA</h3>
                                <span className="text-xl font-bold bg-neo-bg px-2 neo-border block">$242.50</span>
                            </div>
                            <div className="flex gap-2 text-xs font-bold bg-neo-bg p-1 neo-border">
                                <button className="px-2 py-1 bg-white border border-black">1D</button>
                                <button className="px-2 py-1 hover:bg-gray-200 border border-transparent">1W</button>
                                <button className="px-2 py-1 hover:bg-gray-200 border border-transparent">1M</button>
                                <button className="px-2 py-1 hover:bg-gray-200 border border-transparent">3M</button>
                            </div>
                        </div>
                        <div
                            className="flex-grow bg-gray-50 border-3 border-neo-black relative overflow-hidden flex items-center justify-center p-8">
                            {/* Fake Line Chart */}
                            <svg className="w-full h-full opacity-60" viewBox="0 0 400 100" preserveAspectRatio="none">
                                <polyline fill="none" className="stroke-neo-lime" strokeWidth="4" strokeLinejoin="bevel"
                                    points="0,80 50,60 100,70 150,30 200,40 250,10 300,50 350,20 400,30" />
                                <polyline fill="none" className="stroke-neo-black" strokeWidth="2" stroke-dasharray="4"
                                    strokeLinejoin="bevel" points="0,50 400,50" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span
                                    className="bg-white px-3 py-1 neo-border font-bold text-sm rotate-[-5deg] shadow-[4px_4px_0px_#000]">Chart
                                    Render Area</span>
                            </div>
                        </div>
                    </div>

                    {/* AI Order Execution Approval List */}
                    {/* API: GET /api/workspace/strategy/orders/pending */}
                    <div className="neo-card bg-white overflow-hidden flex flex-col">
                        <div className="p-4 border-b-3 border-neo-black bg-neo-blue flex justify-between items-center">
                            <h3 className="text-xl font-black uppercase tracking-wider text-white">Pending Approvals</h3>
                            <span
                                className="bg-white text-neo-black text-xs font-bold px-2 py-0.5 border-2 border-black">Vector
                                Bot</span>
                        </div>
                        <div className="divide-y-3 divide-neo-black p-0">
                            {/* Pending Order */}
                            <div className="p-4 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex gap-6 items-center">
                                    <div
                                        className="bg-neo-lime px-3 py-1 neo-border font-black uppercase text-xl rotate-[-2deg] shadow-[2px_2px_0px_#000]">
                                        BUY</div>
                                    <div>
                                        <h4 className="font-black text-xl">15 <span
                                                className="text-sm font-bold ml-1 text-gray-500">TSLA</span></h4>
                                        <p className="text-xs font-bold text-gray-500 mt-1">Market Order • Est. Total:
                                            $3,637.50</p>
                                    </div>
                                    <div className="hidden md:block w-px h-10 bg-black"></div>
                                    <div className="hidden md:block w-64 text-xs font-medium italic text-gray-600">
                                        "Executing based on CIO mandate. Earnings report sentiment exceeded +30%
                                        threshold."
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {/* API: POST /api/workspace/strategy/orders/:id/approve */}
                                    <button
                                        className="neo-btn bg-neo-lime px-4 py-2 font-bold uppercase text-sm">Approve</button>
                                    <button
                                        className="neo-btn bg-white px-4 py-2 font-bold uppercase text-sm hover:bg-neo-pink hover:text-white">Reject</button>
                                </div>
                            </div>

                            {/* Pending Order 2 */}
                            <div className="p-4 flex items-center justify-between bg-neo-bg">
                                <div className="flex gap-6 items-center">
                                    <div
                                        className="bg-neo-pink text-white px-3 py-1 neo-border font-black uppercase text-xl rotate-[2deg] shadow-[2px_2px_0px_#000]">
                                        SELL</div>
                                    <div>
                                        <h4 className="font-black text-xl">5 <span
                                                className="text-sm font-bold ml-1 text-gray-500">AAPL</span></h4>
                                        <p className="text-xs font-bold text-gray-500 mt-1">Limit @ $180.00 • Est. Total:
                                            $900.00</p>
                                    </div>
                                    <div className="hidden md:block w-px h-10 bg-black"></div>
                                    <div className="hidden md:block w-64 text-xs font-medium italic text-gray-600">
                                        "Rebalancing portfolio as requested. Taking profits at upper resistance level."
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        className="neo-btn bg-neo-lime px-4 py-2 font-bold uppercase text-sm">Approve</button>
                                    <button
                                        className="neo-btn bg-white px-4 py-2 font-bold uppercase text-sm hover:bg-neo-pink hover:text-white">Reject</button>
                                </div>
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

export default Trading;
