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
                linear-gradient(45deg, rgba(0, 0, 0, 0.05) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.05) 75%, rgba(0, 0, 0, 0.05)),
                linear-gradient(45deg, rgba(0, 0, 0, 0.05) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.05) 75%, rgba(0, 0, 0, 0.05));
            background-size: 20px 20px;
            background-position: 0 0, 10px 10px;
        }
`;

function AdminOrgTemplates() {
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
                <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mt-2 mb-1 pl-2">Templates &
                    Market</p>
                <a href="/admin/agent-marketplace"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">🛒 Agent Market</a>
                <a href="/admin/soul-templates"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">👻 Soul
                    Templates</a>
                <a href="/admin/org-templates"
                    className="nav-item active flex items-center gap-3 p-2 font-bold transition-colors text-sm">📑 Org
                    Templates</a>
                <a href="/admin/org-chart"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">🗺 Global Org
                    Map</a>
            </div>
        </nav>

        <main className="flex-grow flex flex-col h-full bg-transparent overflow-y-auto w-full p-8 relative z-0">
            <div className="max-w-6xl mx-auto w-full space-y-8">

                <div
                    className="flex justify-between items-center bg-white p-6 border-3 border-neo-black shadow-[8px_8px_0px_#1E1E1E]">
                    <div>
                        <h2 className="text-3xl font-black uppercase text-indigo-700">Pre-built Organizations</h2>
                        <p className="font-bold text-gray-600 mt-1 text-sm">Package agents, departments, and communication
                            structures into ready-to-deploy enterprise starting points.</p>
                    </div>
                    {/* API: POST /api/admin/org-templates */}
                    <button
                        className="neo-btn bg-indigo-500 text-white px-4 py-2 font-black uppercase tracking-wide border-3 border-black text-sm">+
                        Create Org Template</button>
                </div>

                {/* API: GET /api/admin/org-templates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Template 1 */}
                    <div
                        className="neo-card bg-white p-6 flex flex-col hover:shadow-[12px_12px_0px_#1E1E1E] transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-black text-2xl uppercase border-b-4 border-neo-black pb-1">SaaS Startup Pack
                            </h3>
                            <span
                                className="bg-neo-lime text-black px-2 py-0.5 border-2 border-black text-xs font-black uppercase -rotate-2 shadow-sm">Popular</span>
                        </div>
                        <p className="font-bold text-gray-700 text-sm mb-6">Designed for software companies with &lt;50
                            employees. Emphasizes growth marketing, basic sales SDR bots, and standard customer support.
                        </p>

                        <div className="space-y-4 mb-6 flex-grow">
                            <div className="flex flex-col gap-2">
                                <h4 className="font-black text-xs uppercase text-gray-500">Included Structure:</h4>
                                <div className="bg-gray-100 p-3 neo-border text-sm font-bold flex flex-wrap gap-2">
                                    <span className="bg-white border border-black px-1">Chief of Staff</span>
                                    <span className="bg-white border border-black px-1 text-neo-blue">Marketing (3
                                        bots)</span>
                                    <span className="bg-white border border-black px-1 text-neo-pink">Support (L1)</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex border-t-3 border-neo-black pt-4 justify-between items-center">
                            <span className="text-xs font-bold bg-gray-200 px-2 py-1 neo-border">Price: Tier 1 Plan</span>
                            <button
                                className="bg-white border-2 border-neo-black px-6 py-2 font-black uppercase text-sm hover:bg-indigo-100 transition-colors">Edit
                                Package</button>
                        </div>
                    </div>

                    {/* Template 2 */}
                    <div
                        className="neo-card bg-white p-6 flex flex-col hover:shadow-[12px_12px_0px_#1E1E1E] transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-black text-2xl uppercase border-b-4 border-neo-black pb-1">Quant Finance
                                Firm</h3>
                            <span
                                className="bg-neo-black text-white px-2 py-0.5 border-2 border-black text-xs font-black uppercase rotate-2 shadow-sm">Enterprise</span>
                        </div>
                        <p className="font-bold text-gray-700 text-sm mb-6">High-security setup focused heavily on research,
                            data ingestion pipelines, and algorithmic trading approvals.</p>

                        <div className="space-y-4 mb-6 flex-grow">
                            <div className="flex flex-col gap-2">
                                <h4 className="font-black text-xs uppercase text-gray-500">Included Structure:</h4>
                                <div className="bg-gray-100 p-3 neo-border text-sm font-bold flex flex-wrap gap-2">
                                    <span className="bg-white border border-black px-1">Risk Assessor</span>
                                    <span className="bg-white border border-black px-1 text-neo-lime">Trading Vectors (5
                                        bots)</span>
                                    <span className="bg-neo-pink text-white border border-black px-1">Argos Compliance <span
                                            className="text-[8px] border ml-1 px-0.5">REQ</span></span>
                                </div>
                            </div>
                        </div>

                        <div className="flex border-t-3 border-neo-black pt-4 justify-between items-center">
                            <span className="text-xs font-bold bg-gray-200 px-2 py-1 neo-border">Price: Custom
                                Enterprise</span>
                            <button
                                className="bg-white border-2 border-neo-black px-6 py-2 font-black uppercase text-sm hover:bg-indigo-100 transition-colors">Edit
                                Package</button>
                        </div>
                    </div>

                </div>

            </div>
        </main>
    </div>
    </>
  );
}

export default AdminOrgTemplates;
