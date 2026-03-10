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
            background-color: #BFFF00;
            background-image: radial-gradient(#1E1E1E 1px, transparent 1px);
            background-size: 20px 20px;
        }
`;

function AdminTemplateMarket() {
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
                className="w-10 h-10 bg-neo-black text-white rounded-full border-3 border-black shadow-sm flex items-center justify-center font-black">
                SW</div>
        </div>
    </header>

    <div className="flex h-[calc(100vh-4rem)]">

        <nav className="w-64 border-r-3 border-neo-black bg-white flex flex-col h-full z-10 shrink-0 overflow-y-auto">
            <div className="p-4 space-y-1">
                <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mt-2 mb-1 pl-2">Market
                    Management</p>
                <a href="/admin/agent-marketplace"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">🛒 Agent Market</a>
                <a href="/admin/template-market"
                    className="nav-item active flex items-center gap-3 p-2 font-bold transition-colors text-sm">🏪 Org
                    Templates Store</a>
            </div>
        </nav>

        <main className="flex-grow flex flex-col h-full bg-transparent overflow-y-auto w-full p-8 relative z-0">
            <div className="max-w-6xl mx-auto w-full space-y-8">

                <div
                    className="flex justify-between items-center bg-white p-6 border-3 border-neo-black shadow-[8px_8px_0px_#1E1E1E] transform -rotate-1">
                    <div>
                        <h2 className="text-3xl font-black uppercase text-neo-orange tracking-tight">Org Template Storefront
                        </h2>
                        <p className="font-bold text-gray-600 mt-1 text-sm">Manage the public-facing storefront where
                            tenants browse and purchase entire pre-configured organization setups.</p>
                    </div>
                    {/* API: POST /api/admin/template-market/publish */}
                    <button
                        className="neo-btn bg-neo-orange text-white px-6 py-3 font-black uppercase tracking-wide border-3 border-black text-sm">Publish
                        New Bundle</button>
                </div>

                {/* API: GET /api/admin/template-market */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Store Item 1 */}
                    <div className="neo-card bg-white p-0 flex flex-col group overflow-hidden">
                        <div
                            className="h-40 bg-gray-200 border-b-3 border-neo-black flex items-center justify-center bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4yKSIvPjwvc3ZnPg==')] relative">
                            <span className="text-5xl group-hover:scale-110 transition-transform">🚀</span>
                            <div
                                className="absolute top-2 right-2 bg-neo-lime px-2 py-0.5 border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0px_#000]">
                                Featured</div>
                        </div>
                        <div className="p-5 flex-grow flex flex-col">
                            <h3 className="font-black text-xl uppercase mb-1">Growth Startup</h3>
                            <p className="text-xs font-bold text-gray-600 mb-4 line-clamp-2 mt-2">Perfect for seed-stage
                                startups needing a quick Marketing and Dev-Ops skeleton to scale operations instantly.
                            </p>

                            <div
                                className="mt-auto pt-4 border-t-2 border-dashed border-gray-300 flex justify-between items-end">
                                <div>
                                    <span className="block text-[10px] uppercase font-black text-gray-500 mb-1">Price /
                                        MRR</span>
                                    <span className="font-black text-lg text-neo-blue">$499<span
                                            className="text-xs text-gray-600 font-bold">/mo</span></span>
                                </div>
                                <div className="text-xs font-black bg-gray-100 border border-black px-2 py-1">214 Active
                                </div>
                            </div>
                        </div>
                        <button
                            className="w-full bg-neo-black text-white font-black py-3 border-t-3 border-black uppercase text-xs hover:bg-gray-800 transition-colors">Edit
                            Store Listing</button>
                    </div>

                    {/* Store Item 2 */}
                    <div className="neo-card bg-white p-0 flex flex-col group overflow-hidden">
                        <div
                            className="h-40 bg-gray-200 border-b-3 border-neo-black flex items-center justify-center bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4yKSIvPjwvc3ZnPg==')] relative">
                            <span className="text-5xl group-hover:scale-110 transition-transform">💎</span>
                        </div>
                        <div className="p-5 flex-grow flex flex-col">
                            <h3 className="font-black text-xl uppercase mb-1">Boutique Agency</h3>
                            <p className="text-xs font-bold text-gray-600 mb-4 line-clamp-2 mt-2">Tailored for design and
                                creative agencies. Includes specialized 'Creative Soul' agents for copy and assets.</p>

                            <div
                                className="mt-auto pt-4 border-t-2 border-dashed border-gray-300 flex justify-between items-end">
                                <div>
                                    <span className="block text-[10px] uppercase font-black text-gray-500 mb-1">Price /
                                        MRR</span>
                                    <span className="font-black text-lg text-neo-blue">$299<span
                                            className="text-xs text-gray-600 font-bold">/mo</span></span>
                                </div>
                                <div className="text-xs font-black bg-gray-100 border border-black px-2 py-1">89 Active
                                </div>
                            </div>
                        </div>
                        <button
                            className="w-full bg-neo-black text-white font-black py-3 border-t-3 border-black uppercase text-xs hover:bg-gray-800 transition-colors">Edit
                            Store Listing</button>
                    </div>

                    {/* Store Item 3 */}
                    <div className="neo-card bg-white p-0 flex flex-col group overflow-hidden opacity-75">
                        <div
                            className="h-40 bg-gray-200 border-b-3 border-neo-black flex items-center justify-center bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4yKSIvPjwvc3ZnPg==')] relative">
                            <span className="text-5xl group-hover:scale-110 transition-transform grayscale">⚖️</span>
                            <div
                                className="absolute top-2 right-2 bg-gray-800 text-white px-2 py-0.5 border-2 border-black text-xs font-black uppercase rotate-6 shadow-[2px_2px_0px_#000]">
                                Draft</div>
                        </div>
                        <div className="p-5 flex-grow flex flex-col">
                            <h3 className="font-black text-xl uppercase mb-1 text-gray-600">Legal Firm Core</h3>
                            <p className="text-xs font-bold text-gray-500 mb-4 line-clamp-2 mt-2">Compliance-heavy setup
                                with RAG collections pre-configured for legal discovery.</p>

                            <div
                                className="mt-auto pt-4 border-t-2 border-dashed border-gray-300 flex justify-between items-end">
                                <div>
                                    <span className="block text-[10px] uppercase font-black text-gray-500 mb-1">Price /
                                        MRR</span>
                                    <span className="font-black text-lg text-gray-500">$899<span
                                            className="text-xs font-bold">/mo</span></span>
                                </div>
                                <div
                                    className="text-xs font-black bg-gray-200 border border-gray-400 text-gray-500 px-2 py-1">
                                    Unpublished</div>
                            </div>
                        </div>
                        <button
                            className="w-full bg-gray-200 text-gray-600 font-black py-3 border-t-3 border-black uppercase text-xs hover:bg-gray-300 transition-colors">Continue
                            Editing</button>
                    </div>

                </div>

            </div>
        </main>
    </div>
    </>
  );
}

export default AdminTemplateMarket;
