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

        /* Custom Toggle Switch for Neo-Brutalism */
        .neo-toggle {
            appearance: none;
            width: 48px;
            height: 24px;
            background: #fff;
            border: 3px solid #1E1E1E;
            border-radius: 999px;
            position: relative;
            cursor: pointer;
            outline: none;
            box-shadow: 2px 2px 0px #000;
        }

        .neo-toggle::after {
            content: '';
            position: absolute;
            top: 2px;
            left: 2px;
            width: 14px;
            height: 14px;
            background: #1E1E1E;
            border-radius: 50%;
            transition: all 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .neo-toggle:checked {
            background: #BFFF00;
        }

        .neo-toggle:checked::after {
            left: 26px;
        }
`;

function Settings() {
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
            <a href="/app/activity-log" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">A</span> Activity Log
            </a>
            <a href="/app/notifications" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">N</span>
                Notifications
            </a>
            <a href="/app/settings" className="nav-item active flex items-center gap-3 p-3 font-bold transition-colors">
                <span
                    className="w-6 h-6 bg-neo-black text-white flex items-center justify-center neo-border text-xs shadow-[2px_2px_0px_#BFFF00]">⚙</span>
                Settings
            </a>
        </div>
    </nav>

    {/* Main Content */}
    <main className="flex-grow flex flex-col h-full bg-neo-bg overflow-y-auto w-full">

        {/* Topbar */}
        <header
            className="h-16 border-b-3 border-neo-black bg-white flex items-center justify-between px-8 sticky top-0 z-20 shrink-0">
            <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black uppercase">Preferences</h2>
            </div>
            <div className="flex items-center gap-4">
                {/* API: PUT /api/workspace/settings */}
                <button className="neo-btn bg-neo-lime px-6 py-2 uppercase tracking-wide">Save Changes</button>
            </div>
        </header>

        <div className="p-8 max-w-5xl mx-auto space-y-8 w-full flex-grow">

            <div className="flex flex-col md:flex-row gap-8">

                {/* Settings Navigation Sidebar (Inner) */}
                <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
                    <button
                        className="bg-neo-yellow neo-border p-3 text-left font-black uppercase shadow-[4px_4px_0px_#000]">General</button>
                    <button
                        className="bg-white hover:bg-gray-100 neo-border p-3 text-left font-bold uppercase text-gray-600 transition-colors">Team
                        Members</button>
                    <button
                        className="bg-white hover:bg-gray-100 neo-border p-3 text-left font-bold uppercase text-gray-600 transition-colors">Security</button>
                    <button
                        className="bg-white hover:bg-gray-100 neo-border p-3 text-left font-bold uppercase text-gray-600 transition-colors">Billing
                        Details</button>
                </div>

                {/* Settings Content Area */}
                <div className="flex-grow space-y-8">

                    {/* Section: Workspace Info */}
                    {/* API: GET /api/workspace/settings/general */}
                    <div className="neo-card bg-white p-6 md:p-8 space-y-6">
                        <h3 className="text-2xl font-black uppercase border-b-4 border-neo-black pb-2 inline-block">
                            Workspace Details</h3>

                        <div className="grid grid-cols-1 gap-6 max-w-xl">
                            <div className="flex flex-col gap-2">
                                <label className="font-bold text-sm uppercase">Workspace Name</label>
                                <input type="text" value="Corthex Dev Team"
                                    className="p-3 bg-white neo-border focus:outline-none focus:ring-2 focus:ring-neo-pink shadow-[4px_4px_0px_#000] font-bold" />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="font-bold text-sm uppercase">Industry / Domain</label>
                                <select
                                    className="p-3 bg-white neo-border focus:outline-none focus:ring-2 focus:ring-neo-pink shadow-[4px_4px_0px_#000] font-bold appearance-none cursor-pointer">
                                    <option>Software / SaaS</option>
                                    <option>Finance</option>
                                    <option>E-commerce</option>
                                    <option>Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section: AI Behavior */}
                    <div className="neo-card bg-white p-6 md:p-8 space-y-6">
                        <h3
                            className="text-2xl font-black uppercase border-b-4 border-neo-black pb-2 inline-block text-neo-blue">
                            AI Behavior & Autonomy</h3>

                        <div className="space-y-6">

                            <div
                                className="flex items-center justify-between p-4 bg-gray-50 neo-border hover:bg-gray-100 transition-colors">
                                <div>
                                    <h4 className="font-black text-lg">Require Approval for Trades</h4>
                                    <p className="text-sm font-bold text-gray-500">Requires human confirmation before
                                        executing any real financial transaction.</p>
                                </div>
                                <input type="checkbox" className="neo-toggle" checked />
                            </div>

                            <div
                                className="flex items-center justify-between p-4 bg-gray-50 neo-border hover:bg-gray-100 transition-colors">
                                <div>
                                    <h4 className="font-black text-lg">Auto-Post to SNS</h4>
                                    <p className="text-sm font-bold text-gray-500">Allows Marketing agents to publish
                                        immediately without review queue.</p>
                                </div>
                                <input type="checkbox" className="neo-toggle" />
                            </div>

                            <div
                                className="flex items-center justify-between p-4 bg-gray-50 neo-border hover:bg-gray-100 transition-colors">
                                <div>
                                    <h4 className="font-black text-lg">Cross-Agent Communication</h4>
                                    <p className="text-sm font-bold text-gray-500">Allows agents to delegate sub-tasks to
                                        other specialized agents automatically.</p>
                                </div>
                                <input type="checkbox" className="neo-toggle" checked />
                            </div>

                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="neo-card bg-neo-pink/10 border-neo-pink p-6 md:p-8 space-y-6 relative overflow-hidden">
                        <div className="absolute -right-10 -bottom-10 text-neo-pink opacity-20 transform rotate-12">
                            <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                strokeWidth="4">
                                <path
                                    d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z">
                                </path>
                                <line x1="12" y1="9" x2="12" y2="13"></line>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                        </div>
                        <h3 className="text-2xl font-black uppercase text-neo-pink flex items-center gap-2 relative z-10">
                            Danger Zone</h3>
                        <p className="font-bold text-neo-black relative z-10">Irreversible actions apply here.</p>
                        {/* API: DELETE /api/workspace */}
                        <button
                            className="bg-white border-3 border-neo-pink text-neo-pink px-6 py-3 font-black uppercase tracking-wider hover:bg-neo-pink hover:text-white transition-colors relative z-10 shadow-[4px_4px_0px_#FF3366]">Delete
                            Workspace</button>
                    </div>

                </div>
            </div>

        </div>
    </main>
    </>
  );
}

export default Settings;
