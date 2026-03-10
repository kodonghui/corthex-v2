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
            background-color: #FF3366;
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
            background-color: #FF3366;
            background-image: radial-gradient(rgba(0, 0, 0, 0.2) 2px, transparent 2px);
            background-size: 30px 30px;
        }
`;

function AdminAgentMarketplace() {
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
    </header>

    <div className="flex h-[calc(100vh-4rem)]">

        <nav className="w-64 border-r-3 border-neo-black bg-white flex flex-col h-full z-10 shrink-0 overflow-y-auto">
            <div className="p-4 space-y-1">
                <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mt-2 mb-1 pl-2">Market
                    Management</p>
                <a href="/admin/agent-marketplace"
                    className="nav-item active flex items-center gap-3 p-2 font-bold transition-colors text-sm">🛒 Agent
                    Market</a>
                <a href="/admin/template-market"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">🏪 Org Templates
                    Store</a>
            </div>
        </nav>

        <main className="flex-grow flex flex-col h-full bg-transparent overflow-y-auto w-full p-8 relative z-0">
            <div className="max-w-7xl mx-auto w-full space-y-8">

                <div
                    className="flex justify-between items-center bg-white p-6 border-3 border-neo-black shadow-[8px_8px_0px_#1E1E1E] rotate-1">
                    <div>
                        <h2 className="text-3xl font-black uppercase tracking-tight">Agent Marketplace (A La Carte)</h2>
                        <p className="font-bold text-gray-600 mt-1 text-sm">Manage individual agent listings that tenants
                            can purchase or subscribe to to extend their organization.</p>
                    </div>
                    {/* API: POST /api/admin/agent-marketplace/publish */}
                    <button
                        className="neo-btn bg-black text-white px-6 py-3 font-black uppercase tracking-wide border-3 border-neo-pink text-sm shadow-[4px_4px_0px_#FF3366]">Publish
                        Agent</button>
                </div>

                {/* API: GET /api/admin/agent-marketplace */}
                <div className="bg-white p-6 neo-card">

                    <div className="flex flex-wrap gap-4 items-center mb-6">
                        <input type="text" placeholder="Search Marketplace Listings..."
                            className="p-2 border-3 border-neo-black bg-neo-bg font-bold w-72 focus:outline-none focus:bg-white focus:ring-2 focus:ring-neo-pink shadow-[2px_2px_0px_#000]" />
                        <select
                            className="p-2 border-3 border-neo-black bg-white font-bold cursor-pointer outline-none shadow-[2px_2px_0px_#000]">
                            <option>All Categories</option>
                            <option>Marketing</option>
                            <option>Development</option>
                            <option>Sales</option>
                        </select>
                    </div>

                    <table className="w-full text-left font-medium border-collapse">
                        <thead
                            className="bg-gray-100 text-xs uppercase font-black tracking-widest border-b-3 border-neo-black border-t-3">
                            <tr>
                                <th className="p-4 border-r-3 border-black border-l-3">Agent Listing Name</th>
                                <th className="p-4 border-r-3 border-black">Category</th>
                                <th className="p-4 border-r-3 border-black text-center">Price / Type</th>
                                <th className="p-4 border-r-3 border-black text-center">Active Installs</th>
                                <th className="p-4 border-r-3 border-black text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-3 divide-neo-black border-x-3 border-b-3 border-neo-black border-t-3">

                            {/* Listing 1 */}
                            <tr className="hover:bg-neo-pink/10 transition-colors">
                                <td className="p-4 border-r-3 border-black flex items-center gap-4">
                                    <div
                                        className="w-12 h-12 bg-neo-yellow border-3 border-black flex items-center justify-center font-black text-xl shadow-[2px_2px_0px_#000]">
                                        S</div>
                                    <div>
                                        <div className="font-black text-lg uppercase flex items-center gap-2">
                                            SEO Blog Writer
                                            <span className="bg-neo-lime text-[8px] px-1 border border-black uppercase">Top
                                                Rated</span>
                                        </div>
                                        <div className="text-xs font-bold text-gray-500 max-w-xs truncate">Generates SEO
                                            optimized articles based on target keywords.</div>
                                    </div>
                                </td>
                                <td className="p-4 border-r-3 border-black font-black uppercase text-sm">Marketing</td>
                                <td className="p-4 border-r-3 border-black text-center">
                                    <span className="block font-black text-lg">$29</span>
                                    <span className="block text-[10px] font-bold uppercase text-gray-500">Per Month</span>
                                </td>
                                <td className="p-4 border-r-3 border-black text-center font-black text-xl">458</td>
                                <td className="p-4 text-center">
                                    {/* API: PUT /api/admin/agent-marketplace/:id */}
                                    <button
                                        className="bg-white border-2 border-black px-4 py-1.5 text-xs font-black uppercase hover:bg-black hover:text-white transition-colors">Edit
                                        Listing</button>
                                </td>
                            </tr>

                            {/* Listing 2 */}
                            <tr className="hover:bg-neo-pink/10 transition-colors">
                                <td className="p-4 border-r-3 border-black flex items-center gap-4">
                                    <div
                                        className="w-12 h-12 bg-neo-blue text-white border-3 border-black flex items-center justify-center font-black text-xl shadow-[2px_2px_0px_#000]">
                                        C</div>
                                    <div>
                                        <div className="font-black text-lg uppercase">Code Reviewer Bot</div>
                                        <div className="text-xs font-bold text-gray-500 max-w-xs truncate">Connects to
                                            GitHub and automatically reviews PRs for security flaws.</div>
                                    </div>
                                </td>
                                <td className="p-4 border-r-3 border-black font-black uppercase text-sm">Development</td>
                                <td className="p-4 border-r-3 border-black text-center">
                                    <span className="block font-black text-lg">$99</span>
                                    <span className="block text-[10px] font-bold uppercase text-gray-500">One-time
                                        Unlock</span>
                                </td>
                                <td className="p-4 border-r-3 border-black text-center font-black text-xl">120</td>
                                <td className="p-4 text-center">
                                    <button
                                        className="bg-white border-2 border-black px-4 py-1.5 text-xs font-black uppercase hover:bg-black hover:text-white transition-colors">Edit
                                        Listing</button>
                                </td>
                            </tr>

                        </tbody>
                    </table>

                </div>

            </div>
        </main>
    </div>
    </>
  );
}

export default AdminAgentMarketplace;
