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
`;

function Knowledge() {
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
            <a href="/app/knowledge" className="nav-item active flex items-center gap-3 p-3 font-bold transition-colors">
                <span
                    className="w-6 h-6 bg-neo-lime flex items-center justify-center neo-border text-xs shadow-[2px_2px_0px_#000]">K</span>
                Knowledge
            </a>
            <a href="/app/files" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">F</span> Files Data
            </a>
            <a href="/app/performance" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">P</span> Performance
            </a>
        </div>
    </nav>

    {/* Main Content */}
    <main className="flex-grow flex flex-col h-full bg-neo-bg overflow-y-auto w-full">

        {/* Topbar */}
        <header
            className="h-16 border-b-3 border-neo-black bg-white flex items-center justify-between px-8 sticky top-0 z-20 shrink-0">
            <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black uppercase">Vector Knowledge Base</h2>
            </div>
            <div className="flex items-center gap-4">
                {/* API: POST /api/workspace/knowledge/import */}
                <button className="neo-btn bg-neo-blue text-white px-4 py-1.5 text-sm uppercase tracking-wide">Import /
                    Scrape Setup</button>
            </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto space-y-8 w-full flex-grow">

            <div
                className="neo-card bg-neo-lime p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start justify-between shadow-[8px_8px_0px_#000]">
                <div>
                    <h3 className="text-3xl font-black uppercase mb-3 text-neo-black flex items-center gap-3">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            strokeWidth="3">
                            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                            <polyline points="2 12 12 17 22 12"></polyline>
                            <polyline points="2 17 12 22 22 17"></polyline>
                        </svg>
                        RAG Vectors
                    </h3>
                    <p className="font-bold text-gray-800 max-w-2xl">This is the long-term memory of your organization.
                        Uploaded files, scraped websites, and finalized debates are heavily indexed here. All agents use
                        these collections for context.</p>
                </div>
                <div className="bg-white p-4 neo-border shrink-0 w-full md:w-48">
                    <div className="text-xs font-bold uppercase tracking-widest border-b border-black pb-2 mb-2">Total
                        Vectors</div>
                    <div className="text-3xl font-black">104.2k</div>
                </div>
            </div>

            {/* Collections Grid */}
            {/* API: GET /api/workspace/knowledge */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Collection Item 1 */}
                <div className="neo-card bg-white flex flex-col group hover:-translate-y-1 transition-transform">
                    <div
                        className="p-4 border-b-3 border-neo-black bg-neo-bg flex justify-between items-center bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4xKSIvPjwvc3ZnPg==')]">
                        <div className="flex items-center gap-2">
                            <span
                                className="font-black text-sm uppercase tracking-widest bg-white border border-black px-2 py-0.5 shadow-sm">Collection</span>
                        </div>
                    </div>
                    <div className="p-6 flex-grow flex flex-col space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-black text-2xl leading-none">Company Docs</h4>
                            <span
                                className="bg-neo-yellow px-2 py-0.5 border border-black text-xs font-bold shadow-[2px_2px_0px_#000]">24.5k
                                Vectors</span>
                        </div>
                        <p className="text-sm font-medium text-gray-600 flex-grow">Internal PRDs, HR guidelines, and
                            historical strategy documents.</p>

                        <div className="bg-gray-100 p-3 neo-border text-sm font-bold flex flex-col gap-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500 uppercase">Auto-Sync:</span>
                                <span>ON (G-Drive)</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex border-t-3 border-neo-black">
                        {/* API: PUT /api/workspace/knowledge/:id */}
                        <button
                            className="flex-1 bg-white py-3 font-bold uppercase text-sm border-r-3 border-neo-black hover:bg-neo-yellow transition-colors">Manage</button>
                    </div>
                </div>

                {/* Collection Item 2 */}
                <div className="neo-card bg-white flex flex-col group hover:-translate-y-1 transition-transform">
                    <div
                        className="p-4 border-b-3 border-neo-black bg-neo-bg flex justify-between items-center bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4xKSIvPjwvc3ZnPg==')]">
                        <div className="flex items-center gap-2">
                            <span
                                className="font-black text-sm uppercase tracking-widest bg-white border border-black px-2 py-0.5 shadow-sm">Collection</span>
                        </div>
                    </div>
                    <div className="p-6 flex-grow flex flex-col space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-black text-2xl leading-none">Competitor Intel</h4>
                            <span
                                className="bg-neo-pink text-white px-2 py-0.5 border border-black text-xs font-bold shadow-[2px_2px_0px_#000]">80.1k
                                Vectors</span>
                        </div>
                        <p className="text-sm font-medium text-gray-600 flex-grow">Scraped news articles, earnings calls,
                            and product pages of top 5 competitors.</p>

                        <div className="bg-gray-100 p-3 neo-border text-sm font-bold flex flex-col gap-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500 uppercase">Auto-Sync:</span>
                                <span>ON (Web Scraper Job)</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex border-t-3 border-neo-black">
                        {/* API: PUT /api/workspace/knowledge/:id */}
                        <button
                            className="flex-1 bg-white py-3 font-bold uppercase text-sm border-r-3 border-neo-black hover:bg-neo-yellow transition-colors">Manage</button>
                    </div>
                </div>

                {/* Add New Collection */}
                <div
                    className="neo-card bg-neo-bg border-dashed border-4 border-gray-400 flex flex-col items-center justify-center p-8 hover:border-neo-black hover:bg-white transition-all cursor-pointer group shadow-none hover:shadow-[8px_8px_0px_#1E1E1E]">
                    <div
                        className="w-16 h-16 rounded-full bg-white border-4 border-gray-300 group-hover:border-neo-black flex items-center justify-center mb-4 transition-colors">
                        <svg className="text-gray-400 group-hover:text-neo-black transition-colors" width="24" height="24"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </div>
                    <h3
                        className="font-black text-xl text-gray-500 group-hover:text-neo-black uppercase tracking-wider transition-colors">
                        New Collection</h3>
                </div>

            </div>
        </div>
    </main>
    </>
  );
}

export default Knowledge;
