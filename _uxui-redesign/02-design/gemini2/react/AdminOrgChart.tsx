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

        .admin-bg {
            background-image:
                linear-gradient(to right, rgba(0, 0, 0, 0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
            background-size: 40px 40px;
        }
`;

function AdminOrgChart() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
<header
        className="h-16 border-b-3 border-neo-black bg-white flex items-center justify-between px-6 z-30 shrink-0 sticky top-0 shadow-[0px_4px_0px_#1E1E1E]">
        <div className="flex items-center gap-4">
            <h1 className="text-2xl font-black tracking-tight uppercase flex items-center gap-2">
                <span className="bg-neo-pink text-white px-2 border-2 border-black rotate-[-2deg] shadow-sm">CORTHEX</span>
                ADMIN
            </h1>
        </div>
        <div className="flex items-center gap-4">
            <div
                className="w-10 h-10 bg-neo-lime rounded-full border-3 border-neo-black shadow-sm flex items-center justify-center font-black">
                SW</div>
        </div>
    </header>

    <div className="flex h-[calc(100vh-4rem)]">

        <nav className="w-64 border-r-3 border-neo-black bg-white flex flex-col h-full z-10 shrink-0 overflow-y-auto">
            <div className="p-4 space-y-1">
                <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mt-2 mb-1 pl-2">Platform
                    Overview</p>
                <a href="/admin/dashboard"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">🏢 Dashboard</a>

                <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mt-6 mb-1 pl-2">Templates &
                    Market</p>
                <a href="/admin/org-templates"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">📑 Org
                    Templates</a>
                <a href="/admin/org-chart"
                    className="nav-item active flex items-center gap-3 p-2 font-bold transition-colors text-sm">🗺 Global
                    Org Map</a>
            </div>
        </nav>

        <main className="flex-grow flex flex-col h-full bg-transparent overflow-hidden w-full relative z-0">
            {/* Top Bar for Map */}
            <div
                className="bg-white border-b-3 border-neo-black p-4 flex justify-between items-center shrink-0 z-20 shadow-[0px_4px_0px_#1E1E1E]">
                <h2 className="text-xl font-black uppercase">Standard Organization Blueprint</h2>
                <div className="flex items-center gap-2">
                    <button
                        className="bg-white border-2 border-neo-black px-3 py-1 text-xs font-bold uppercase shadow-[2px_2px_0px_#000] hover:-translate-y-px">+
                        Add Node</button>
                    {/* API: POST /api/admin/org-chart/save */}
                    <button
                        className="bg-neo-lime border-2 border-neo-black px-3 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_#000] hover:-translate-y-px">Save
                        Blueprint</button>
                </div>
            </div>

            {/* Visual Graph Area (Interactive Node Map concept) */}
            {/* API: GET /api/admin/org-chart/graph */}
            <div className="flex-grow relative overflow-auto p-12 cursor-grab flex items-center justify-center">

                <div className="relative w-full max-w-4xl text-center">

                    {/* CEO Level */}
                    <div className="inline-block relative z-10 mx-auto">
                        <div
                            className="bg-black text-white neo-border px-6 py-4 font-black uppercase text-xl shadow-[6px_6px_0px_#FF3366] transform hover:-translate-y-1 transition-transform cursor-pointer">
                            Executive Directive
                            <div className="text-[10px] text-gray-400 mt-1 block">Root Command</div>
                        </div>
                        {/* Line down */}
                        <div
                            className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full w-1 h-8 bg-black">
                        </div>
                    </div>

                    <div className="h-8"></div> {/* Spacer */}

                    {/* Horizontal Connector */}
                    <div className="w-3/4 max-w-2xl h-1 bg-black mx-auto relative z-0">
                        {/* Line connections for children */}
                        <div className="absolute left-0 top-0 w-1 h-8 bg-black"></div>
                        <div className="absolute left-1/2 transform -translate-x-1/2 top-0 w-1 h-8 bg-black"></div>
                        <div className="absolute right-0 top-0 w-1 h-8 bg-black"></div>
                    </div>

                    <div className="h-8"></div> {/* Spacer */}

                    {/* Dept Level */}
                    <div className="flex justify-between max-w-3xl mx-auto relative z-10 w-full">

                        {/* CMO Node */}
                        <div
                            className="neo-card bg-neo-yellow px-4 py-3 min-w-[160px] text-center transform hover:-translate-y-1 transition-transform cursor-pointer group">
                            <span className="font-black uppercase block border-b-2 border-black pb-1 mb-1">Marketing</span>
                            <span className="text-xs font-bold block">CMO Default</span>
                            {/* + button hidden until hover */}
                            <div
                                className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    className="w-6 h-6 rounded-full bg-white border-2 border-neo-black font-black text-xs shadow-sm">+</button>
                            </div>
                        </div>

                        {/* CPO Node */}
                        <div
                            className="neo-card bg-neo-blue text-white px-4 py-3 min-w-[160px] text-center transform hover:-translate-y-1 transition-transform cursor-pointer">
                            <span className="font-black uppercase block border-b-2 border-white pb-1 mb-1">Product</span>
                            <span className="text-xs font-bold block">CPO Default</span>
                        </div>

                        {/* CTO Node */}
                        <div
                            className="neo-card bg-gray-200 px-4 py-3 min-w-[160px] text-center transform hover:-translate-y-1 transition-transform cursor-pointer border-dashed">
                            <span
                                className="font-black uppercase block border-b-2 border-dashed border-gray-400 pb-1 mb-1 text-gray-600">Engineering</span>
                            <span className="text-xs font-bold block text-gray-500">Draft</span>
                        </div>

                    </div>

                </div>

            </div>

        </main>
    </div>
    </>
  );
}

export default AdminOrgChart;
