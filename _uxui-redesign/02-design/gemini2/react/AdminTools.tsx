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
            background-image: radial-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px);
            background-size: 20px 20px;
        }
`;

function AdminTools() {
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
                <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mt-2 mb-1 pl-2">System Masters
                </p>
                <a href="/admin/agents"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">🤖 Global
                    Agents</a>
                <a href="/admin/departments"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">🏛 Global
                    Departments</a>
                <a href="/admin/credentials"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">🔑 Base API
                    Keys</a>
                <a href="/admin/tools"
                    className="nav-item active flex items-center gap-3 p-2 font-bold transition-colors text-sm">🔨 Global
                    Tools</a>
            </div>
        </nav>

        <main className="flex-grow flex flex-col h-full bg-transparent overflow-y-auto w-full p-8 relative z-0">
            <div className="max-w-6xl mx-auto w-full space-y-8">

                <div
                    className="flex justify-between items-center bg-white p-6 border-3 border-neo-black shadow-[8px_8px_0px_#1E1E1E]">
                    <div>
                        <h2 className="text-3xl font-black uppercase tracking-wide">Global Tool Registry</h2>
                        <p className="font-bold text-gray-600 mt-1 text-sm">Define base capabilities and MCP (Model Context
                            Protocol) servers that agents can utilize.</p>
                    </div>
                    {/* API: POST /api/admin/tools */}
                    <button
                        className="neo-btn bg-neo-yellow text-black px-4 py-2 font-black uppercase text-sm tracking-wide shadow-[4px_4px_0px_#000] border-3 border-black">+
                        Register Tool</button>
                </div>

                {/* API: GET /api/admin/tools */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Tool 1 */}
                    <div className="neo-card bg-white p-5 hover:-translate-y-1 transition-transform relative group">
                        <div
                            className="absolute -top-3 -right-3 bg-neo-lime px-2 py-0.5 border-2 border-black text-[10px] font-black uppercase rotate-6 shadow-sm z-10">
                            Native</div>
                        <h3 className="font-black text-lg uppercase border-b-2 border-black pb-1 mb-2">Web Search API</h3>
                        <p className="text-xs font-bold text-gray-600 mb-4 h-12">Provides agents the ability to search live
                            internet data via DuckDuckGo standard API.</p>
                        <div className="bg-gray-100 p-2 text-[10px] font-mono border border-black mb-4">tool_name:
                            "search_web"</div>
                        {/* API: PUT /api/admin/tools/:id */}
                        <button
                            className="w-full bg-white border-2 border-neo-black py-1.5 text-xs font-black uppercase hover:bg-neo-black hover:text-white transition-colors">Configure</button>
                    </div>

                    {/* Tool 2 */}
                    <div className="neo-card bg-white p-5 hover:-translate-y-1 transition-transform relative group">
                        <div
                            className="absolute -top-3 -right-3 bg-neo-pink text-white px-2 py-0.5 border-2 border-black text-[10px] font-black uppercase -rotate-3 shadow-sm z-10">
                            MCP Server</div>
                        <h3 className="font-black text-lg uppercase border-b-2 border-black pb-1 mb-2">GitHub Connector</h3>
                        <p className="text-xs font-bold text-gray-600 mb-4 h-12">Allows Engineering agents to read repos,
                            create PRs, and review code diffs.</p>
                        <div
                            className="bg-gray-100 p-2 text-[10px] font-mono border border-black mb-4 truncate text-gray-500">
                            npx -y @modelcontextprotocol/server-github</div>
                        <button
                            className="w-full bg-white border-2 border-neo-black py-1.5 text-xs font-black uppercase hover:bg-neo-black hover:text-white transition-colors">Configure</button>
                    </div>

                    {/* Tool 3 */}
                    <div className="neo-card bg-gray-100 p-5 border-dashed relative opacity-80">
                        <h3 className="font-black text-lg uppercase border-b-2 border-gray-400 text-gray-500 pb-1 mb-2">
                            Google Analytics</h3>
                        <p className="text-xs font-bold text-gray-500 mb-4 h-12">Read standard performance metrics and
                            traffic data.</p>
                        <div
                            className="bg-gray-200 p-2 text-[10px] font-mono border border-gray-400 mb-4 text-center text-gray-500">
                            Not Configured</div>
                        <button
                            className="w-full bg-gray-200 border-2 border-gray-400 py-1.5 text-xs font-black uppercase text-gray-500 hover:bg-gray-300 transition-colors">Draft
                            Setup</button>
                    </div>

                </div>

            </div>
        </main>
    </div>
    </>
  );
}

export default AdminTools;
