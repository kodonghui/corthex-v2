"use client";
import React from "react";

const styles = `
body {
            background-color: #FFFFFF;
            color: #000000;
            -webkit-font-smoothing: antialiased;
        }

        ::-webkit-scrollbar {
            width: 0px;
            background: transparent;
        }

        ::selection {
            background-color: #000000;
            color: #FFFFFF;
        }

        .title-display {
            font-size: 4rem;
            line-height: 1;
            font-weight: 800;
            letter-spacing: -0.04em;
        }

        .title-1 {
            font-size: 2.5rem;
            line-height: 1.1;
            font-weight: 700;
            letter-spacing: -0.02em;
        }

        .title-2 {
            font-size: 1.5rem;
            line-height: 1.2;
            font-weight: 600;
            letter-spacing: -0.02em;
        }

        .title-3 {
            font-size: 1.125rem;
            line-height: 1.4;
            font-weight: 600;
        }

        .body-base {
            font-size: 0.9375rem;
            line-height: 1.6;
            font-weight: 400;
            color: #111111;
        }

        .body-small {
            font-size: 0.8125rem;
            line-height: 1.5;
            font-weight: 400;
            color: #666666;
        }

        .label-mono {
            font-size: 0.6875rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #999999;
        }

        /* Grid background for the node map */
        .bg-grid {
            background-image:
                radial-gradient(circle, #999999 1px, transparent 1px);
            background-size: 2rem 2rem;
            background-position: center center;
        }
`;

function Nexus() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Global Nav */}
    <nav className="w-64 border-r border-gray-100 flex flex-col justify-between py-8 px-6 flex-shrink-0 bg-white z-20">
        <div>
            <div className="mb-16">
                <span className="title-2 tracking-tighter">CORTHEX</span>
                <span className="label-mono ml-2">v2</span>
            </div>

            <ul className="space-y-6">
                <li><a href="/app/home" className="body-base hover:text-gray-500 transition-colors">Home</a></li>
                <li><a href="/app/dashboard" className="body-base hover:text-gray-500 transition-colors">Dashboard</a></li>
                <li><a href="/app/command-center" className="body-base hover:text-gray-500 transition-colors">Command
                        Center</a></li>
                <li><a href="/app/chat" className="body-base hover:text-gray-500 transition-colors">Chat</a></li>
                <li><a href="/app/trading" className="body-base hover:text-gray-500 transition-colors">Trading</a></li>
                <li><a href="/app/agora" className="body-base hover:text-gray-500 transition-colors">Agora</a></li>
                {/* GET /api/workspace/nexus/org-data */}
                <li className="pt-6 border-t border-gray-100 mt-6"><a href="/app/nexus"
                        className="title-3 font-medium transition-colors">Nexus</a></li>
            </ul>
        </div>

        <div className="space-y-6">
            <ul className="space-y-6 pb-6 border-b border-gray-100">
                <li><a href="/app/agents" className="body-small hover:text-black transition-colors">Agents</a></li>
                <li><a href="/app/knowledge" className="body-small hover:text-black transition-colors">Knowledge</a></li>
                <li><a href="/app/costs" className="body-small hover:text-black transition-colors">Costs</a></li>
            </ul>
        </div>
    </nav>

    {/* Map Canvas Area */}
    <main className="flex-1 relative bg-gray-50 bg-grid cursor-move">

        {/* Controls Overlay */}
        <div className="absolute top-8 left-8 z-10">
            <h1 className="title-2 bg-white px-4 py-2 border border-black inline-block shadow-sm">Topology / Organization
            </h1>
            <p className="label-mono mt-4 bg-white px-3 py-1 inline-block border border-gray-100 text-gray-500">8 Nodes / 3
                Clusters</p>
        </div>

        <div className="absolute top-8 right-8 z-10 flex space-x-2">
            {/* Mock controls for ReactFlow type canvas */}
            <button
                className="w-10 h-10 bg-white border border-gray-100 flex items-center justify-center hover:bg-gray-100">+</button>
            <button
                className="w-10 h-10 bg-white border border-gray-100 flex items-center justify-center hover:bg-gray-100">-</button>
            <button
                className="px-4 h-10 bg-white border border-gray-100 flex items-center justify-center label-mono hover:bg-black hover:text-white transition-colors">RESET
                LAYOUT</button>
        </div>

        {/* Simulated Graph Nodes (SVG or purely CSS positioning in Reality, using absolute div here for mockup) */}
        {/* API: GET /api/workspace/nexus/graph */}

        {/* Central Node: Secretary */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            {/* Connecting lines (simulated) */}
            <svg className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none -z-10"
                style={{overflow: "visible"}}>
                {/* Line to Strategy */}
                <path d="M 0 0 C 0 -150, 200 -150, 200 -200" stroke="#000" strokeWidth="1.5" fill="none"
                    opacity="0.2" />
                {/* Line to Marketing */}
                <path d="M 0 0 C 0 150, -200 150, -200 200" stroke="#000" strokeWidth="1.5" fill="none"
                    opacity="0.2" />
                <path d="M 0 0 C 150 0, 250 150, 250 200" stroke="#000" strokeWidth="1.5" fill="none" opacity="0.2" />
            </svg>

            <div
                className="bg-black text-white p-6 w-64 shadow-lg border border-gray-900 z-20 relative hover:bg-gray-900 transition-colors cursor-pointer">
                <div className="flex justify-between items-start mb-4 border-b border-gray-500 pb-2">
                    <span className="label-mono text-gray-300">SYSTEM / ROOT</span>
                    <span className="w-2 h-2 rounded-full bg-status-green"></span>
                </div>
                <h3 className="title-3 leading-tight">Secretary General</h3>
                <p className="body-small text-gray-500 mt-2">Routing & Triage</p>
            </div>
        </div>

        {/* Strategy Cluster */}
        <div className="absolute top-[20%] left-[65%]">
            <div
                className="bg-white p-6 w-64 border-2 border-black z-20 relative hover:shadow-xl transition-shadow cursor-pointer group">
                <div className="absolute -top-3 left-4 bg-white px-2 label-mono text-gray-500">DEPT: STRATEGY</div>
                <div className="flex justify-between items-start mb-4">
                    <span className="label-mono text-black group-hover:underline">MANAGER</span>
                </div>
                <h3 className="title-3 leading-tight group-hover:text-gray-500 transition-colors">Chief Investment Officer
                </h3>
                <p className="body-small text-gray-500 mt-2">Sonnet 3.5</p>
            </div>
        </div>

        {/* Marketing Cluster */}
        <div className="absolute top-[75%] left-[25%]">
            <div
                className="bg-white p-6 w-64 border border-gray-300 z-20 relative hover:border-black transition-colors cursor-pointer">
                <div className="absolute -top-3 left-4 bg-gray-50 px-2 label-mono text-gray-500">DEPT: MARKETING</div>
                <div className="flex justify-between items-start mb-4">
                    <span className="label-mono text-gray-500">SPECIALIST</span>
                    <span className="w-2 h-2 rounded-full bg-status-green"></span>
                </div>
                <h3 className="title-3 leading-tight body-base font-medium">Content Strategist</h3>
                <p className="body-small text-gray-500 mt-2">Haiku 3.0</p>
            </div>
        </div>

        <div className="absolute top-[75%] left-[65%]">
            <div
                className="bg-white p-4 w-56 border border-gray-100 z-20 relative hover:border-black transition-colors cursor-pointer opacity-90">
                <div className="flex justify-between items-start mb-2">
                    <span className="label-mono text-gray-300">WORKER</span>
                </div>
                <h3 className="body-base leading-tight font-medium">Data Scraper</h3>
                <p className="body-small text-gray-300 mt-1">GPT-4o Mini</p>
            </div>
        </div>

    </main>
    </>
  );
}

export default Nexus;
