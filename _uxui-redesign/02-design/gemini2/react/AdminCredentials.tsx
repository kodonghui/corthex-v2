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
            background-color: #FFE800;
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
            background-image: radial-gradient(#1E1E1E 1px, transparent 1px);
            background-size: 20px 20px;
            opacity: 0.95;
        }
`;

function AdminCredentials() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Top Admin Navbar */}
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

        {/* Sidebar Navigation */}
        <nav className="w-64 border-r-3 border-neo-black bg-white flex flex-col h-full z-10 shrink-0 overflow-y-auto">
            <div className="p-4 space-y-1">

                <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mt-2 mb-1 pl-2">Platform
                    Overview</p>
                <a href="/admin/dashboard"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">
                    🏢 Dashboard
                </a>

                <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mt-6 mb-1 pl-2">System Masters
                </p>
                <a href="/admin/agents"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">
                    🤖 Global Agents
                </a>
                <a href="/admin/credentials"
                    className="nav-item active flex items-center gap-3 p-2 font-bold transition-colors text-sm">
                    🔑 Base API Keys
                </a>
                <a href="/admin/tools"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">
                    🔨 Global Tools
                </a>
            </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow flex flex-col h-full overflow-y-auto w-full p-8 relative z-0">

            <div className="max-w-5xl mx-auto w-full space-y-8">

                <div
                    className="flex justify-between items-center bg-black text-white p-6 border-3 border-neo-black shadow-[8px_8px_0px_#BFFF00]">
                    <div>
                        <h2 className="text-3xl font-black uppercase text-neo-lime">Platform Foundation Credentials</h2>
                        <p className="font-bold text-gray-300 mt-2 text-sm">Manage the root LLM and core integration API
                            keys used across the entire Corthex platform infrastructure. Extremely sensitive.</p>
                    </div>
                    {/* API: POST /api/admin/credentials */}
                    <button className="neo-btn bg-white text-black px-4 py-2 font-black uppercase tracking-wide text-sm">+
                        Add Root Key</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Anthropic Key */}
                    <div
                        className="neo-card bg-white border-neo-black p-6 flex flex-col hover:-translate-y-1 transition-transform">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-black text-xl uppercase tracking-wider flex items-center gap-2">
                                <span className="text-2xl">🧠</span> Anthropic API
                            </h3>
                            <span
                                className="bg-neo-lime px-2 py-0.5 border border-black text-xs font-black uppercase shadow-sm">Active</span>
                        </div>

                        <div className="bg-neo-bg p-3 neo-border mb-4">
                            <p className="text-[10px] uppercase font-black text-gray-500 mb-1">Key Value (Masked)</p>
                            <div className="flex justify-between items-center font-mono font-bold text-sm">
                                <span>sk-ant-api03-••••••••••••••••••••••••f8Q</span>
                                <button className="text-neo-blue underline text-xs hover:text-black">Reveal</button>
                            </div>
                        </div>

                        <div
                            className="mt-auto pt-4 border-t-2 border-dashed border-gray-300 flex justify-between items-center text-xs font-bold text-gray-600">
                            <span>Used by: All Platform Agents</span>
                            <span>Limit: $50k /mo</span>
                        </div>
                    </div>

                    {/* OpenAI Key */}
                    <div
                        className="neo-card bg-white border-neo-black p-6 flex flex-col hover:-translate-y-1 transition-transform">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-black text-xl uppercase tracking-wider flex items-center gap-2">
                                <span className="text-2xl">⚡</span> OpenAI API
                            </h3>
                            <span
                                className="bg-neo-lime px-2 py-0.5 border border-black text-xs font-black uppercase shadow-sm">Active</span>
                        </div>

                        <div className="bg-neo-bg p-3 neo-border mb-4">
                            <p className="text-[10px] uppercase font-black text-gray-500 mb-1">Key Value (Masked)</p>
                            <div className="flex justify-between items-center font-mono font-bold text-sm">
                                <span>sk-proj-••••••••••••••••••••••••••••Zf9</span>
                                <button className="text-neo-blue underline text-xs hover:text-black">Reveal</button>
                            </div>
                        </div>

                        <div
                            className="mt-auto pt-4 border-t-2 border-dashed border-gray-300 flex justify-between items-center text-xs font-bold text-gray-600">
                            <span>Used by: Fallback Generators</span>
                            <span>Limit: $10k /mo</span>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="mt-12 bg-neo-pink/10 border-4 border-neo-pink p-6 text-neo-black relative overflow-hidden">
                    <h3 className="text-xl font-black uppercase text-neo-pink mb-2">Key Rotation & Revocation</h3>
                    <p className="text-sm font-bold mb-4">Rotating root keys will momentarily pause all agent activities
                        across all tenants until the new keys propagate (est. 15 seconds).</p>
                    <button
                        className="bg-white border-2 border-neo-pink text-neo-pink px-4 py-2 font-black uppercase text-sm shadow-[4px_4px_0px_#FF3366] hover:bg-neo-pink hover:text-white transition-colors">Force
                        Global Rotation</button>
                </div>

            </div>
        </main>
    </div>
    </>
  );
}

export default AdminCredentials;
