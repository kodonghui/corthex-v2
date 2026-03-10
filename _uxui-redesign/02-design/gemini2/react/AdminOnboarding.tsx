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
            background-color: #9D00FF;
            color: white;
            border: 3px solid #1E1E1E;
            box-shadow: 2px 2px 0px 0px rgba(30, 30, 30, 1);
        }

        .nav-item:hover:not(.active) {
            background-color: #E5E5E5;
            color: black;
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
            background-color: #F4F4F0;
            background-image:
                linear-gradient(135deg, rgba(157, 0, 255, 0.1) 25%, transparent 25%),
                linear-gradient(225deg, rgba(157, 0, 255, 0.1) 25%, transparent 25%),
                linear-gradient(45deg, rgba(157, 0, 255, 0.1) 25%, transparent 25%),
                linear-gradient(315deg, rgba(157, 0, 255, 0.1) 25%, transparent 25%);
            background-position: 10px 0, 10px 0, 0 0, 0 0;
            background-size: 20px 20px;
            background-repeat: repeat;
        }
`;

function AdminOnboarding() {
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
                <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mt-2 mb-1 pl-2">System Config
                </p>
                <a href="/admin/settings"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">⚙️ Platform
                    Settings</a>
                <a href="/admin/monitoring"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">📈 System
                    Monitoring</a>
                <a href="/admin/onboarding"
                    className="nav-item active flex items-center gap-3 p-2 font-bold transition-colors text-sm">🚀 Tenant
                    Onboarding</a>
            </div>
        </nav>

        <main className="flex-grow flex flex-col h-full bg-transparent overflow-y-auto w-full p-8 relative z-0">
            <div className="max-w-6xl mx-auto w-full space-y-8">

                <div
                    className="flex justify-between items-center bg-white p-6 border-3 border-neo-black shadow-[8px_8px_0px_#1E1E1E] transform rotate-1">
                    <div>
                        <h2 className="text-3xl font-black uppercase text-neo-purple tracking-tight">Onboarding Workflows
                        </h2>
                        <p className="font-bold text-gray-600 mt-1 text-sm">Manage the setup checklists and initial
                            configurations for new companies joining the platform.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">

                    {/* Pending Onboardings list */}
                    {/* API: GET /api/admin/onboarding/pending */}
                    <div className="neo-card bg-white p-0 flex flex-col">
                        <div className="p-4 border-b-3 border-neo-black bg-gray-100 flex justify-between items-center">
                            <h3 className="font-black text-lg uppercase flex items-center gap-2">⌛ Pending Manual Setup</h3>
                            <span className="bg-neo-yellow px-2 py-0.5 border border-black text-xs font-black shadow-sm">2
                                In Queue</span>
                        </div>

                        <div className="divide-y-3 divide-gray-200">
                            {/* Item 1 */}
                            <div className="p-6">
                                <div className="flex justify-between mb-2">
                                    <h4 className="font-black text-xl">Stark Industries</h4>
                                    <span
                                        className="bg-black text-white px-2 py-0.5 text-[10px] font-black uppercase">Enterprise
                                        Tier</span>
                                </div>
                                <p className="text-sm font-bold text-gray-600 mb-4">Requires custom RAG vector DB
                                    provisioning before handoff.</p>

                                <div
                                    className="w-full bg-gray-200 h-4 border-2 border-neo-black relative overflow-hidden mb-4">
                                    <div
                                        className="absolute top-0 left-0 h-full bg-neo-purple w-1/4 border-r-2 border-black">
                                    </div>
                                </div>
                                <div className="flex justify-between text-xs font-bold text-gray-500 uppercase">
                                    <span>25% Complete</span>
                                    <span>Step: Vector Provisioning</span>
                                </div>

                                <button
                                    className="mt-4 w-full bg-white border-2 border-neo-black font-black uppercase py-2 text-sm hover:bg-neo-purple hover:text-white transition-colors">Resume
                                    Setup</button>
                            </div>

                            {/* Item 2 */}
                            <div className="p-6">
                                <div className="flex justify-between mb-2">
                                    <h4 className="font-black text-xl">Dunder Mifflin</h4>
                                    <span
                                        className="bg-white text-black border border-black px-2 py-0.5 text-[10px] font-black uppercase">Pro
                                        Tier</span>
                                </div>
                                <p className="text-sm font-bold text-gray-600 mb-4">Waiting on billing verification and
                                    default admin assignment.</p>

                                <div
                                    className="w-full bg-gray-200 h-4 border-2 border-neo-black relative overflow-hidden mb-4">
                                    <div className="absolute top-0 left-0 h-full bg-neo-lime w-3/4 border-r-2 border-black">
                                    </div>
                                </div>
                                <div className="flex justify-between text-xs font-bold text-gray-500 uppercase">
                                    <span>75% Complete</span>
                                    <span>Step: Billing Sync</span>
                                </div>

                                <button
                                    className="mt-4 w-full bg-white border-2 border-neo-black font-black uppercase py-2 text-sm hover:bg-neo-purple hover:text-white transition-colors">Resume
                                    Setup</button>
                            </div>
                        </div>
                    </div>

                    {/* Config Builder for Onboarding */}
                    <div className="neo-card bg-white p-6 flex flex-col">
                        <h3 className="font-black text-xl uppercase border-b-3 border-neo-black pb-2 mb-4">Default Workflow
                            Steps</h3>
                        <p className="text-sm font-bold text-gray-600 mb-6">These templates execute sequentially when a new
                            tenant signs up via self-serve.</p>

                        <div className="space-y-4">
                            {/* Drag and drop style list */}
                            <div
                                className="bg-gray-50 p-3 neo-border flex items-center gap-4 cursor-move hover:bg-gray-100">
                                <div className="text-gray-400">⋮⋮</div>
                                <div
                                    className="bg-black text-white w-6 h-6 flex items-center justify-center font-black text-xs">
                                    1</div>
                                <div className="font-bold flex-1">Create Base Subdomain</div>
                                <div
                                    className="text-[10px] font-black bg-neo-lime px-2 py-0.5 border border-black uppercase">
                                    Auto</div>
                            </div>

                            <div
                                className="bg-gray-50 p-3 neo-border flex items-center gap-4 cursor-move hover:bg-gray-100">
                                <div className="text-gray-400">⋮⋮</div>
                                <div
                                    className="bg-black text-white w-6 h-6 flex items-center justify-center font-black text-xs">
                                    2</div>
                                <div className="font-bold flex-1">Provision Tenant Database</div>
                                <div
                                    className="text-[10px] font-black bg-neo-lime px-2 py-0.5 border border-black uppercase">
                                    Auto</div>
                            </div>

                            <div
                                className="bg-gray-50 p-3 neo-border flex items-center gap-4 cursor-move hover:bg-gray-100">
                                <div className="text-gray-400">⋮⋮</div>
                                <div
                                    className="bg-black text-white w-6 h-6 flex items-center justify-center font-black text-xs">
                                    3</div>
                                <div className="font-bold flex-1 flex flex-col">
                                    <span>Apply Default "SaaS Startup" Org Template</span>
                                    <span className="text-[10px] text-gray-500">Includes 3 agents and basic chat UI.</span>
                                </div>
                                <div
                                    className="text-[10px] font-black bg-neo-orange text-white px-2 py-0.5 border border-black uppercase">
                                    Requires Approval</div>
                            </div>

                            <div
                                className="bg-neo-bg p-3 border-2 border-dashed border-gray-400 flex items-center justify-center gap-2 cursor-pointer hover:bg-white text-gray-500 font-black uppercase text-sm">
                                <span>+ Add Workflow Step</span>
                            </div>
                        </div>

                    </div>

                </div>

            </div>
        </main>
    </div>
    </>
  );
}

export default AdminOnboarding;
