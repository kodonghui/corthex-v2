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
            background-color: #1E1E1E;
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
            background-image: radial-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px);
            background-size: 20px 20px;
        }

        /* Toggle switch styles */
        .toggle-checkbox:checked {
            right: 0;
            border-color: #1E1E1E;
        }

        .toggle-checkbox:checked+.toggle-label {
            background-color: #BFFF00;
        }

        .toggle-checkbox:checked+.toggle-label:after {
            transform: translateX(100%);
            border-color: #1E1E1E;
        }
`;

function AdminSettings() {
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
                    className="nav-item active flex items-center gap-3 p-2 font-bold transition-colors text-sm">⚙️ Platform
                    Settings</a>
                <a href="/admin/monitoring"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">📈 System
                    Monitoring</a>
                <a href="/admin/onboarding"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">🚀 Tenant
                    Onboarding</a>
            </div>
        </nav>

        <main className="flex-grow flex flex-col h-full bg-transparent overflow-y-auto w-full p-8 relative z-0">
            <div className="max-w-4xl mx-auto w-full space-y-8">

                <div
                    className="flex justify-between items-center bg-white p-6 border-3 border-neo-black shadow-[8px_8px_0px_#1E1E1E]">
                    <div>
                        <h2 className="text-3xl font-black uppercase tracking-tight">Global Configurations</h2>
                        <p className="font-bold text-gray-600 mt-1 text-sm">Core rules that apply to the entire Corthex
                            infrastructure and all connected tenants.</p>
                    </div>
                </div>

                <div className="space-y-6">

                    {/* Section: Maintenance */}
                    {/* API: GET /api/admin/settings/maintenance */}
                    <div className="neo-card bg-white p-6">
                        <h3 className="font-black text-xl uppercase border-b-3 border-neo-black pb-2 mb-4">Operations &
                            Maintenance</h3>

                        <div
                            className="flex items-center justify-between p-4 bg-neo-yellow neo-border shadow-[4px_4px_0px_#000]">
                            <div>
                                <h4 className="font-black text-lg">Global Maintenance Mode</h4>
                                <p className="text-xs font-bold text-gray-800">Pauses all agent activities and shows
                                    maintenance screen to all tenants.</p>
                            </div>
                            <div
                                className="relative inline-block w-14 align-middle select-none transition duration-200 ease-in">
                                <input type="checkbox" name="toggle" id="toggle1"
                                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-2 border-black appearance-none cursor-pointer z-10 top-1 left-1 checked:right-1 checked:left-auto transition-transform" />
                                <label htmlFor="toggle1"
                                    className="toggle-label block overflow-hidden h-8 rounded-full bg-white border-3 border-neo-black cursor-pointer shadow-sm"></label>
                            </div>
                        </div>

                        <div
                            className="mt-4 flex items-center justify-between border-b-2 border-gray-200 border-dashed pb-4">
                            <div>
                                <h4 className="font-bold text-sm">Allow New Tenant Registrations</h4>
                                <p className="text-xs text-gray-500 font-medium">If disabled, public signups are blocked.
                                </p>
                            </div>
                            {/* API: PUT /api/admin/settings/registration */}
                            <div
                                className="relative inline-block w-14 align-middle select-none transition duration-200 ease-in">
                                <input type="checkbox" name="toggle" id="toggle2" checked
                                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-2 border-black appearance-none cursor-pointer z-10 top-1 left-1 checked:right-1 checked:left-auto transition-transform" />
                                <label htmlFor="toggle2"
                                    className="toggle-label block overflow-hidden h-8 rounded-full bg-neo-lime border-3 border-neo-black cursor-pointer shadow-sm"></label>
                            </div>
                        </div>

                    </div>

                    {/* Section: AI Limits */}
                    {/* API: GET /api/admin/settings/limits */}
                    <div className="neo-card bg-white p-6">
                        <h3 className="font-black text-xl uppercase border-b-3 border-neo-black pb-2 mb-4">AI Safety &
                            Limits</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block font-black text-sm uppercase mb-1">Max Tokens Per Tenant (Monthly
                                    Soft Limit)</label>
                                <div className="flex gap-2">
                                    <input type="number" value="50000000"
                                        className="flex-1 p-2 border-3 border-neo-black bg-neo-bg font-bold focus:outline-none focus:bg-white shadow-[2px_2px_0px_#000]" />
                                    <button
                                        className="bg-black text-white px-4 border-2 border-black font-bold text-xs uppercase hover:bg-gray-800 transition-colors">Apply</button>
                                </div>
                            </div>

                            <div>
                                <label className="block font-black text-sm uppercase mb-1">Global Fallback Model</label>
                                <p className="text-[10px] font-bold text-gray-500 mb-2">Used if primary Anthropic endpoints
                                    fail.</p>
                                <select
                                    className="w-full p-2 border-3 border-neo-black bg-white font-bold cursor-pointer outline-none shadow-[2px_2px_0px_#000]">
                                    <option>gpt-4o</option>
                                    <option>gpt-4o-mini</option>
                                    <option>claude-3-haiku-20240307 (Secondary region)</option>
                                </select>
                            </div>

                            <div
                                className="flex items-center justify-between border-t-2 border-gray-200 border-dashed pt-4 mt-4">
                                <div>
                                    <h4 className="font-bold text-sm">Strict PII Filtering (Platform Level)</h4>
                                    <p className="text-xs text-gray-500 font-medium">Force strip all SSN/CC data before
                                        hitting LLMs, regardless of tenant settings.</p>
                                </div>
                                <div
                                    className="relative inline-block w-14 align-middle select-none transition duration-200 ease-in">
                                    <input type="checkbox" name="toggle" id="toggle3" checked
                                        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-2 border-black appearance-none cursor-pointer z-10 top-1 left-1 checked:right-1 checked:left-auto transition-transform" />
                                    <label htmlFor="toggle3"
                                        className="toggle-label block overflow-hidden h-8 rounded-full bg-neo-lime border-3 border-neo-black cursor-pointer shadow-sm"></label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-neo-pink/10 border-4 border-neo-pink p-6 text-neo-black">
                        <h3 className="text-xl font-black uppercase text-neo-pink mb-2">Danger Zone</h3>
                        <p className="text-sm font-bold mb-4">Actions here can cause irreversible data loss across all
                            tenants.</p>
                        {/* API: POST /api/admin/settings/purge-cache */}
                        <button
                            className="bg-white border-2 border-neo-pink text-neo-pink px-4 py-2 font-black uppercase text-sm shadow-[4px_4px_0px_#FF3366] hover:bg-neo-pink hover:text-white transition-colors">Purge
                            All Global Caches</button>
                    </div>

                </div>

            </div>
        </main>
    </div>
    </>
  );
}

export default AdminSettings;
