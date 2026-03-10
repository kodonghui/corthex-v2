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
                linear-gradient(90deg, #1E1E1E 2px, transparent 2px),
                linear-gradient(0deg, #1E1E1E 2px, transparent 2px);
            background-size: 60px 60px;
            opacity: 0.05;
        }
`;

function AdminReportLines() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
<div className="absolute inset-0 admin-bg z-[-1] pointer-events-none"></div>

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
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">🗺 Global Org
                    Map</a>
                <a href="/admin/report-lines"
                    className="nav-item active flex items-center gap-3 p-2 font-bold transition-colors text-sm">🔀 Base
                    Report Lines</a>
            </div>
        </nav>

        <main className="flex-grow flex flex-col h-full bg-transparent overflow-y-auto w-full p-8 relative z-0">
            <div className="max-w-6xl mx-auto w-full space-y-8">

                <div
                    className="flex justify-between items-center bg-white p-6 border-3 border-neo-black shadow-[8px_8px_0px_#1E1E1E] transform rotate-1">
                    <div>
                        <h2 className="text-3xl font-black uppercase tracking-tight">Master Report Lines</h2>
                        <p className="font-bold text-gray-600 mt-1 text-sm">Define default permissions and reporting
                            structures for Agent-to-Agent and Human-to-Agent communication.</p>
                    </div>
                </div>

                {/* API: GET /api/admin/report-lines */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">

                    {/* Line Rule 1 */}
                    <div className="neo-card bg-white p-0 flex flex-col overflow-hidden">
                        <div
                            className="bg-neo-blue text-white p-4 border-b-3 border-neo-black flex justify-between items-center">
                            <h3 className="font-black text-lg uppercase tracking-wider">Exec to Managers</h3>
                            {/* API: PUT /api/admin/report-lines/:id */}
                            <button
                                className="bg-white text-neo-black border-2 border-black px-2 py-1 text-xs font-black uppercase hover:bg-neo-yellow transition-colors">Edit</button>
                        </div>

                        <div className="p-6 relative flex items-center justify-between">
                            {/* Visual Connection */}
                            <div
                                className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 w-32 h-2 bg-neo-black">
                                <div
                                    className="absolute -right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-l-[16px] border-l-neo-black">
                                </div>
                            </div>

                            <div className="bg-gray-100 p-3 neo-border text-center w-28 relative z-10 shadow-sm">
                                <span className="block text-xl">👔</span>
                                <span className="font-black text-xs uppercase mt-1 block">Level 1 (Exec)</span>
                            </div>

                            <div
                                className="bg-gray-100 p-3 neo-border text-center w-28 relative z-10 shadow-sm border-dashed">
                                <span className="block text-xl">👥</span>
                                <span className="font-black text-xs uppercase mt-1 block">Level 2 (Dept Head)</span>
                            </div>
                        </div>

                        <div className="px-6 pb-6 mt-auto">
                            <ul className="text-sm font-bold text-gray-700 space-y-2 mt-2 pt-2 border-t-2 border-gray-200">
                                <li>• Task Assignment: <span className="text-green-600 uppercase">Allowed</span></li>
                                <li>• Approval Overrides: <span className="text-green-600 uppercase">Allowed</span></li>
                                <li>• Full Conversation Read: <span className="text-green-600 uppercase">Allowed</span></li>
                            </ul>
                        </div>
                    </div>

                    {/* Line Rule 2 */}
                    <div className="neo-card bg-white p-0 flex flex-col overflow-hidden">
                        <div
                            className="bg-neo-pink text-white p-4 border-b-3 border-neo-black flex justify-between items-center">
                            <h3 className="font-black text-lg uppercase tracking-wider">Cross-Dept Sync (Lateral)</h3>
                            <button
                                className="bg-white text-neo-black border-2 border-black px-2 py-1 text-xs font-black uppercase hover:bg-neo-yellow transition-colors">Edit</button>
                        </div>

                        <div className="p-6 relative flex items-center justify-between">
                            {/* Visual Connection */}
                            <div
                                className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 w-32 h-2 bg-gray-400 border-y border-black border-dashed">
                                <div
                                    className="absolute -right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-l-[16px] border-l-gray-400">
                                </div>
                                <div
                                    className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-r-[16px] border-r-gray-400">
                                </div>
                            </div>

                            <div
                                className="bg-gray-100 p-3 neo-border text-center w-28 relative z-10 shadow-sm border-dashed">
                                <span className="block text-xl">👥</span>
                                <span className="font-black text-xs uppercase mt-1 block">Level 2 (Marketing)</span>
                            </div>

                            <div
                                className="bg-gray-100 p-3 neo-border text-center w-28 relative z-10 shadow-sm border-dashed">
                                <span className="block text-xl">👥</span>
                                <span className="font-black text-xs uppercase mt-1 block">Level 2 (Product)</span>
                            </div>
                        </div>

                        <div className="px-6 pb-6 mt-auto">
                            <ul className="text-sm font-bold text-gray-700 space-y-2 mt-2 pt-2 border-t-2 border-gray-200">
                                <li>• Task Assignment: <span
                                        className="text-neo-pink uppercase inline-block border border-neo-pink px-1">Restricted</span>
                                    (Req. L1 Approval)</li>
                                <li>• Information Request: <span className="text-green-600 uppercase">Allowed</span></li>
                                <li>• Full Conversation Read: <span className="text-gray-400 uppercase">Denied</span></li>
                            </ul>
                        </div>
                    </div>

                </div>

            </div>
        </main>
    </div>
    </>
  );
}

export default AdminReportLines;
