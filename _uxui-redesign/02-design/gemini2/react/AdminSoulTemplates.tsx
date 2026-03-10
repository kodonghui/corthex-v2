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
            background-image: radial-gradient(#FF00FF 1px, transparent 1px);
            background-size: 20px 20px;
        }
`;

function AdminSoulTemplates() {
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
                <a href="/admin/agent-marketplace"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">🛒 Agent Market</a>
                <a href="/admin/org-templates"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">📑 Org
                    Templates</a>
                <a href="/admin/soul-templates"
                    className="nav-item active flex items-center gap-3 p-2 font-bold transition-colors text-sm">👻 Soul
                    Templates</a>
            </div>
        </nav>

        <main className="flex-grow flex flex-col h-full bg-transparent overflow-y-auto w-full p-8 relative z-0">
            <div className="max-w-6xl mx-auto w-full space-y-8">

                <div
                    className="flex justify-between items-center bg-white p-6 border-3 border-neo-black shadow-[8px_8px_0px_#1E1E1E]">
                    <div>
                        <h2 className="text-3xl font-black uppercase text-fuchsia-600">Soul Catalog (Personas)</h2>
                        <p className="font-bold text-gray-600 mt-1 text-sm">Manage base communication styles, tones, and
                            core principles that tenants can apply to their agents.</p>
                    </div>
                    {/* API: POST /api/admin/soul-templates */}
                    <button
                        className="neo-btn bg-fuchsia-500 text-white px-4 py-2 font-black uppercase tracking-wide border-3 border-black">+
                        New Soul</button>
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                    <button className="bg-black text-white px-3 py-1 text-xs font-bold uppercase neo-border shadow-sm">All
                        Souls</button>
                    <button
                        className="bg-white px-3 py-1 text-xs font-bold uppercase neo-border shadow-sm hover:bg-gray-100">Professional</button>
                    <button
                        className="bg-white px-3 py-1 text-xs font-bold uppercase neo-border shadow-sm hover:bg-gray-100">Creative</button>
                    <button
                        className="bg-white px-3 py-1 text-xs font-bold uppercase neo-border shadow-sm hover:bg-gray-100">Aggressive
                        (Sales)</button>
                </div>

                {/* API: GET /api/admin/soul-templates */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Soul 1 */}
                    <div
                        className="neo-card bg-white p-0 flex flex-col hover:-translate-y-1 transition-transform overflow-hidden group">
                        <div className="h-2 bg-blue-500 w-full border-b-3 border-black"></div>
                        <div className="p-5 flex-grow">
                            <h3 className="font-black text-xl uppercase mb-1">Corporate Standard</h3>
                            <p className="text-xs font-bold text-gray-500 mb-4 line-clamp-2">"Polite, objective, concise.
                                Uses industry standard terminology without jargon overload."</p>
                            <div className="space-y-2">
                                <div
                                    className="bg-gray-100 p-2 text-xs font-mono border border-black text-gray-700 h-16 overflow-hidden">
                                    [SYSTEM] You are a professional assistant. Maintain neutral tone. Avoid emojis.
                                </div>
                            </div>
                        </div>
                        <div className="flex border-t-3 border-black">
                            <button
                                className="w-1/2 bg-white py-2 text-xs font-bold uppercase border-r-3 border-black hover:bg-neo-yellow">Edit
                                Prompt</button>
                            <span
                                className="w-1/2 bg-gray-100 py-2 text-xs font-bold uppercase text-center flex justify-center items-center">Used
                                by: 124</span>
                        </div>
                    </div>

                    {/* Soul 2 */}
                    <div
                        className="neo-card bg-white p-0 flex flex-col hover:-translate-y-1 transition-transform overflow-hidden group">
                        <div className="h-2 bg-pink-500 w-full border-b-3 border-black"></div>
                        <div className="p-5 flex-grow">
                            <h3 className="font-black text-xl uppercase mb-1">Gen-Z Marketer</h3>
                            <p className="text-xs font-bold text-gray-500 mb-4 line-clamp-2">"High energy, relies on current
                                internet slang, uses emojis heavily. Optimized for TikTok/Reels."</p>
                            <div className="space-y-2">
                                <div
                                    className="bg-gray-100 p-2 text-xs font-mono border border-black text-gray-700 h-16 overflow-hidden">
                                    [SYSTEM] Act like a 22yo social media manager. Tone is casual, 'unhinged' corporate.
                                </div>
                            </div>
                        </div>
                        <div className="flex border-t-3 border-black">
                            <button
                                className="w-1/2 bg-white py-2 text-xs font-bold uppercase border-r-3 border-black hover:bg-neo-yellow">Edit
                                Prompt</button>
                            <span
                                className="w-1/2 bg-gray-100 py-2 text-xs font-bold uppercase text-center flex justify-center items-center">Used
                                by: 45</span>
                        </div>
                    </div>

                    {/* Soul 3 */}
                    <div
                        className="neo-card bg-white p-0 flex flex-col hover:-translate-y-1 transition-transform overflow-hidden group">
                        <div className="h-2 bg-red-600 w-full border-b-3 border-black"></div>
                        <div className="p-5 flex-grow">
                            <h3 className="font-black text-xl uppercase mb-1">Ruthless Closer</h3>
                            <p className="text-xs font-bold text-gray-500 mb-4 line-clamp-2">"Sales focused. Assertive,
                                creates urgency, ignores pleasantries to drive immediate action."</p>
                            <div className="space-y-2">
                                <div
                                    className="bg-gray-100 p-2 text-xs font-mono border border-black text-gray-700 h-16 overflow-hidden">
                                    [SYSTEM] You are an elite closer. Do not take no for an answer. Apply BANT
                                    methodology.
                                </div>
                            </div>
                        </div>
                        <div className="flex border-t-3 border-black">
                            <button
                                className="w-1/2 bg-white py-2 text-xs font-bold uppercase border-r-3 border-black hover:bg-neo-yellow">Edit
                                Prompt</button>
                            <span
                                className="w-1/2 bg-gray-100 py-2 text-xs font-bold uppercase text-center flex justify-center items-center">Used
                                by: 12</span>
                        </div>
                    </div>

                </div>

            </div>
        </main>
    </div>
    </>
  );
}

export default AdminSoulTemplates;
