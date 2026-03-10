"use client";
import React from "react";

const styles = `
body {
            background-color: #F4F4F0;
            color: #1E1E1E;
            -webkit-font-smoothing: antialiased;
        }

        /* Essential Neo-Brutalism Utilities */
        .neo-border {
            border: 3px solid #1E1E1E;
        }

        .neo-shadow {
            box-shadow: 4px 4px 0px 0px rgba(30, 30, 30, 1);
        }

        .neo-shadow-sm {
            box-shadow: 2px 2px 0px 0px rgba(30, 30, 30, 1);
        }

        /* Interactive Elements */
        .neo-btn {
            border: 3px solid #1E1E1E;
            box-shadow: 4px 4px 0px 0px rgba(30, 30, 30, 1);
            transition: all 0.1s ease-in-out;
            font-weight: 700;
        }

        .neo-btn:hover {
            transform: translate(-2px, -2px);
            box-shadow: 6px 6px 0px 0px rgba(30, 30, 30, 1);
        }

        .neo-btn:active {
            transform: translate(4px, 4px);
            box-shadow: 0px 0px 0px 0px rgba(30, 30, 30, 1);
        }

        .neo-card {
            border: 3px solid #1E1E1E;
            box-shadow: 8px 8px 0px 0px rgba(30, 30, 30, 1);
            background-color: white;
            transition: transform 0.2s ease;
        }

        .neo-input {
            border: 3px solid #1E1E1E;
            box-shadow: 4px 4px 0px 0px rgba(30, 30, 30, 1);
            transition: all 0.2s;
        }

        .neo-input:focus {
            outline: none;
            box-shadow: 6px 6px 0px 0px rgba(30, 30, 30, 1);
            transform: translate(-2px, -2px);
        }

        /* Custom Scrollbar for Neo-Brutalism */
        ::-webkit-scrollbar {
            width: 12px;
            height: 12px;
            border-left: 3px solid #1E1E1E;
        }

        ::-webkit-scrollbar-track {
            background: #F4F4F0;
        }

        ::-webkit-scrollbar-thumb {
            background: #1E1E1E;
            border: 2px solid #F4F4F0;
        }
`;

function DesignSystem() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
<div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <header className="mb-12 border-b-4 border-neo-black pb-6">
            <h1 className="text-6xl font-black tracking-tight mb-2 uppercase">Neo-Brutalism</h1>
            <p className="text-2xl font-bold bg-neo-yellow inline-block px-3 py-1 neo-border neo-shadow-sm">Design System &
                Component Library</p>
        </header>

        {/* Colors */}
        <section>
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <span
                    className="w-8 h-8 bg-neo-black text-white flex items-center justify-center text-sm neo-shadow-sm">1</span>
                Color Palette
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                <div className="neo-border bg-neo-bg h-24 flex items-end p-2 font-bold neo-shadow">BG</div>
                <div className="neo-border bg-white h-24 flex items-end p-2 font-bold neo-shadow">White</div>
                <div className="neo-border bg-neo-black text-white h-24 flex items-end p-2 font-bold neo-shadow">Black</div>
                <div className="neo-border bg-neo-yellow h-24 flex items-end p-2 font-bold neo-shadow">Yellow</div>
                <div className="neo-border bg-neo-lime h-24 flex items-end p-2 font-bold neo-shadow">Lime</div>
                <div className="neo-border bg-neo-pink text-white h-24 flex items-end p-2 font-bold neo-shadow">Pink</div>
                <div className="neo-border bg-neo-blue h-24 flex items-end p-2 font-bold neo-shadow">Blue</div>
                <div className="neo-border bg-neo-orange text-white h-24 flex items-end p-2 font-bold neo-shadow">Orange
                </div>
            </div>
        </section>

        {/* Typography */}
        <section>
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <span
                    className="w-8 h-8 bg-neo-black text-white flex items-center justify-center text-sm neo-shadow-sm">2</span>
                Typography
            </h2>
            <div className="neo-card p-8 bg-white max-w-3xl">
                <div className="space-y-6">
                    <div>
                        <span
                            className="text-sm font-bold bg-neo-lime px-2 py-0.5 border border-black mb-1 inline-block">text-6xl
                            font-black uppercase</span>
                        <h1 className="text-6xl font-black uppercase tracking-tight">Display Heading</h1>
                    </div>
                    <div>
                        <span
                            className="text-sm font-bold bg-neo-lime px-2 py-0.5 border border-black mb-1 inline-block">text-4xl
                            font-bold</span>
                        <h2 className="text-4xl font-bold">Headline Level 2</h2>
                    </div>
                    <div>
                        <span
                            className="text-sm font-bold bg-neo-lime px-2 py-0.5 border border-black mb-1 inline-block">text-2xl
                            font-bold</span>
                        <h3 className="text-2xl font-bold">Headline Level 3</h3>
                    </div>
                    <div>
                        <span
                            className="text-sm font-bold bg-neo-lime px-2 py-0.5 border border-black mb-1 inline-block">text-lg
                            font-medium</span>
                        <p className="text-lg font-medium leading-relaxed">This is standard body text for Neo-Brutalism. It
                            needs to be slightly larger and thicker than normal to stand out against the heavy borders
                            and bright colors. Space Grotesk has a nice tech-forward but organic feel.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Buttons */}
        <section>
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <span
                    className="w-8 h-8 bg-neo-black text-white flex items-center justify-center text-sm neo-shadow-sm">3</span>
                Buttons
            </h2>
            <div className="flex flex-wrap gap-8 items-center bg-white p-8 neo-card max-w-4xl">
                <button className="neo-btn bg-neo-yellow px-6 py-3 text-lg">Primary Action</button>
                <button className="neo-btn bg-white px-6 py-3 text-lg">Secondary Action</button>
                <button className="neo-btn bg-neo-black text-white px-6 py-3 text-lg hover:text-neo-yellow">Dark
                    Action</button>
                <button className="neo-btn bg-neo-pink text-white px-6 py-3 text-lg">Danger Zone</button>

                <div className="w-full h-0 border-b-2 border-dashed border-gray-300 my-4"></div>

                <button className="neo-btn bg-neo-lime px-4 py-2 text-sm">Small Btn</button>
                <button className="neo-btn bg-neo-blue p-3 aspect-square flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </button>
                <button className="neo-btn bg-white px-4 py-2 flex items-center gap-2">
                    <div className="w-3 h-3 bg-neo-pink rounded-full border border-black"></div>
                    Status Indicator
                </button>
            </div>
        </section>

        {/* Form Elements */}
        <section>
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <span
                    className="w-8 h-8 bg-neo-black text-white flex items-center justify-center text-sm neo-shadow-sm">4</span>
                Form Elements
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
                <div className="neo-card p-6 bg-neo-blue/10">
                    <form className="space-y-5" onSubmit="event.preventDefault();">
                        <div className="space-y-2">
                            <label className="font-bold text-lg block">Agent Name</label>
                            <input type="text" className="neo-input w-full p-3 text-lg bg-white"
                                placeholder="e.g. Content Writer" />
                        </div>
                        <div className="space-y-2">
                            <label className="font-bold text-lg block">Department</label>
                            <select className="neo-input w-full p-3 text-lg bg-white appearance-none cursor-pointer">
                                <option>Marketing</option>
                                <option>Engineering</option>
                                <option>HR</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="font-bold text-lg block">System Prompt</label>
                            <textarea className="neo-input w-full p-3 text-lg bg-white h-32 resize-none"
                                placeholder="You are a helpful assistant..."></textarea>
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative">
                                <input type="checkbox" className="peer sr-only" />
                                <div className="w-6 h-6 neo-border bg-white peer-checked:bg-neo-black transition-colors">
                                </div>
                                <svg className="absolute top-1 left-1 w-4 h-4 text-white opacity-0 peer-checked:opacity-100"
                                    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="4" strokeLinecap="round"
                                    strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                            <span className="font-bold text-lg group-hover:underline decoration-2 underline-offset-4">Enable
                                Vector DB Access</span>
                        </label>
                        <button className="neo-btn bg-neo-yellow w-full py-4 text-xl mt-4">Save Configuration</button>
                    </form>
                </div>
            </div>
        </section>

        {/* Cards & Containers */}
        <section>
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <span
                    className="w-8 h-8 bg-neo-black text-white flex items-center justify-center text-sm neo-shadow-sm">5</span>
                Cards & Containers
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
                {/* Agent Card */}
                <div className="neo-card bg-neo-yellow overflow-hidden flex flex-col">
                    <div className="p-4 border-b-3 border-neo-black bg-white flex justify-between items-center">
                        <div className="font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-neo-lime border border-black inline-block"></span>
                            Active
                        </div>
                        <button className="neo-btn bg-white px-2 py-1 text-xs">Edit</button>
                    </div>
                    <div className="p-6 flex-grow bg-white">
                        <h3 className="text-2xl font-black uppercase mb-1">Alpha-Bot</h3>
                        <p className="font-bold text-gray-600 mb-4">MKT Department</p>
                        <ul className="space-y-2 font-medium">
                            <li className="flex items-center gap-2">
                                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2">
                                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                </svg>
                                Role: Content Specialist
                            </li>
                            <li className="flex items-center gap-2">
                                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                Tools: 8 Enabled
                            </li>
                        </ul>
                    </div>
                    <div className="p-4 bg-neo-black text-white font-bold flex justify-between items-center text-sm">
                        <span>Cost: $12.50</span>
                        <span>This Month</span>
                    </div>
                </div>

                {/* Alert Card */}
                <div className="neo-card bg-neo-pink text-white p-6 relative">
                    <div
                        className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center neo-border neo-shadow-sm text-neo-black">
                        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.5">
                            <path
                                d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Budget Alert</h3>
                    <p className="font-medium mb-4">Marketing department has reached 90% of its monthly API allocation.</p>
                    <button className="neo-btn bg-white text-neo-black w-full py-2">Manage Limits</button>
                </div>

                {/* Stat Card */}
                <div className="neo-card bg-white p-6 flex flex-col justify-between">
                    <div>
                        <div className="text-sm font-bold uppercase text-gray-500 mb-1">Total Agents</div>
                        <div className="text-6xl font-black">24<span className="text-2xl text-neo-lime ml-2">↑ 3</span></div>
                    </div>
                    <div className="mt-6">
                        <div className="w-full bg-gray-200 h-4 neo-border overflow-hidden rounded-full">
                            <div className="bg-neo-blue h-full border-r-3 border-neo-black w-2/3"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Components / Modules */}
        <section>
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <span
                    className="w-8 h-8 bg-neo-black text-white flex items-center justify-center text-sm neo-shadow-sm">6</span>
                Tables & Data Lists
            </h2>
            <div className="neo-card bg-white overflow-hidden">
                <table className="w-full text-left font-medium">
                    <thead className="bg-neo-yellow border-b-3 border-neo-black font-black uppercase tracking-wider">
                        <tr>
                            <th className="p-4 border-r-3 border-neo-black">Status</th>
                            <th className="p-4 border-r-3 border-neo-black">Department</th>
                            <th className="p-4 border-r-3 border-neo-black">Agents</th>
                            <th className="p-4">Spend (Monthly)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y-3 divide-neo-black bg-white">
                        <tr className="hover:bg-neo-lime/20 cursor-pointer transition-colors">
                            <td className="p-4 border-r-3 border-neo-black">
                                <span
                                    className="bg-neo-lime px-2 py-1 neo-border text-xs font-bold uppercase shadow-[1px_1px_0px_#000]">Active</span>
                            </td>
                            <td className="p-4 border-r-3 border-neo-black font-bold">Marketing Team</td>
                            <td className="p-4 border-r-3 border-neo-black text-center text-lg font-bold">4</td>
                            <td className="p-4 font-black">$45.00</td>
                        </tr>
                        <tr className="hover:bg-neo-blue/20 cursor-pointer transition-colors bg-neo-bg">
                            <td className="p-4 border-r-3 border-neo-black">
                                <span
                                    className="bg-neo-pink text-white px-2 py-1 border border-black text-xs font-bold uppercase shadow-[1px_1px_0px_#000]">Paused</span>
                            </td>
                            <td className="p-4 border-r-3 border-neo-black font-bold">R&D Lab</td>
                            <td className="p-4 border-r-3 border-neo-black text-center text-lg font-bold">2</td>
                            <td className="p-4 font-black text-gray-500">$12.50</td>
                        </tr>
                        <tr className="hover:bg-neo-yellow/20 cursor-pointer transition-colors">
                            <td className="p-4 border-r-3 border-neo-black">
                                <span
                                    className="bg-neo-lime px-2 py-1 border border-black text-xs font-bold uppercase shadow-[1px_1px_0px_#000]">Active</span>
                            </td>
                            <td className="p-4 border-r-3 border-neo-black font-bold">Support Ops</td>
                            <td className="p-4 border-r-3 border-neo-black text-center text-lg font-bold">12</td>
                            <td className="p-4 font-black text-neo-pink">$210.30</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

        {/* Badge / Tags */}
        <section className="pb-20">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <span
                    className="w-8 h-8 bg-neo-black text-white flex items-center justify-center text-sm neo-shadow-sm">7</span>
                Badges & Tags
            </h2>
            <div className="flex flex-wrap gap-4 p-8 neo-card bg-white">
                <span className="px-3 py-1 bg-neo-yellow neo-border font-bold shadow-[2px_2px_0px_#1E1E1E]">GPT-4</span>
                <span className="px-3 py-1 bg-white neo-border font-bold shadow-[2px_2px_0px_#1E1E1E]">Claude 3.5
                    Sonnet</span>
                <span className="px-3 py-1 bg-neo-pink text-white neo-border font-bold shadow-[2px_2px_0px_#1E1E1E]">Claude
                    3.5 Haiku</span>
                <span
                    className="px-3 py-1 bg-neo-black text-white border-2 border-white ring-2 ring-neo-black font-bold shadow-[3px_3px_0px_#FFE800]">System
                    Agent</span>
            </div>
        </section>

    </div>
    </>
  );
}

export default DesignSystem;
