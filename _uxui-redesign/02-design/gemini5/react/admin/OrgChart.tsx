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
`;

function OrgChart() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
<nav className="w-72 flex flex-col justify-between py-12 px-10 flex-shrink-0 bg-gray-50 border-r border-gray-100 z-10">
        <div>
            <div className="mb-24 flex items-center">
                <span className="title-2 tracking-tighter">CORTHEX</span>
                <span className="label-mono ml-3 text-status-red bg-red-50 px-2 py-1">ADMIN</span>
            </div>

            <ul className="space-y-10">
                <li><a href="/app/dashboard" className="body-base text-gray-500 hover:text-black transition-colors">Platform
                        Overview</a></li>
                <li className="space-y-6 pt-4">
                    <span className="label-mono text-gray-300 block mb-4">ORG STRUCTURES</span>
                    <ul className="space-y-6 pl-4">
                        <li><a href="/app/departments"
                                className="body-base text-gray-500 hover:text-black transition-colors">Dept Templates</a>
                        </li>
                        {/* GET /api/admin/org-chart (Visualization) */}
                        <li><a href="/app/org-chart" className="title-3 transition-colors">Global Connectivity</a></li>
                        <li><a href="/app/org-templates"
                                className="body-base text-gray-500 hover:text-black transition-colors">Org Chart Presets</a>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
    </nav>

    {/* Canvas Map Area */}
    <main className="flex-1 relative bg-white overflow-hidden flex items-center justify-center">

        <div className="absolute top-16 left-16 z-10 max-w-sm">
            <h1 className="title-2 mb-4">Master Topology</h1>
            <p className="body-small text-gray-500">Live visualization of all tenant organizational structures and
                inter-department routing volumes.</p>
        </div>

        <div className="absolute top-16 right-16 z-10 flex space-x-4">
            <button
                className="label-mono border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors bg-white">RE-CENTER</button>
            <button className="label-mono border border-gray-300 bg-white px-4 py-2">+</button>
            <button className="label-mono border border-gray-300 bg-white px-4 py-2">-</button>
        </div>

        {/* Simulated Node Graph */}
        <div className="relative w-[1200px] h-[800px] border border-gray-50 bg-gray-50/20">

            {/* System Core (Root) */}
            <div
                className="absolute left-1/2 top-10 -translate-x-1/2 w-48 bg-black text-white p-4 text-center z-20 shadow-xl">
                <span className="label-mono">CORTHEX</span>
                <div className="title-3 mt-1">Platform Core</div>
            </div>

            {/* Lines (SVG approximation) */}
            <svg className="absolute inset-0 w-full h-full stroke-gray-300" strokeWidth="2" fill="none">
                <path d="M600,90 Q400,200 400,300" stroke-dasharray="4,4" />
                <path d="M600,90 Q800,200 800,300" stroke-dasharray="4,4" />

                {/* Tenant Internal Links */}
                <path d="M400,360 L200,500" />
                <path d="M400,360 L400,500" stroke="black" strokeWidth="4" /> {/* High traffic */}
                <path d="M400,360 L600,500" />

                <path d="M800,360 L800,500" />
            </svg>

            {/* Tenant 1 */}
            <div className="absolute left-[300px] top-[300px] w-48 bg-white border-2 border-black p-4 text-center z-20">
                <span className="label-mono text-gray-500">TENANT_01</span>
                <div className="title-3 mt-1 underline">Acme Corp</div>
            </div>

            {/* Acme Departments */}
            <div className="absolute left-[100px] top-[500px] w-48 bg-gray-50 border border-gray-300 p-4 text-center z-20">
                <span className="label-mono text-gray-500">DEPT</span>
                <div className="body-base mt-1">Marketing</div>
            </div>

            <div
                className="absolute left-[300px] top-[500px] w-48 bg-white border border-black p-4 text-center z-20 ring-4 ring-gray-100">
                <span className="label-mono text-status-green flex items-center justify-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-status-green rounded-full"></div>ACTIVE
                </span>
                <div className="body-base mt-1 font-bold">Strategy</div>
            </div>

            <div className="absolute left-[500px] top-[500px] w-48 bg-gray-50 border border-gray-300 p-4 text-center z-20">
                <span className="label-mono text-gray-500">DEPT</span>
                <div className="body-base mt-1">Operations</div>
            </div>


            {/* Tenant 2 */}
            <div
                className="absolute left-[700px] top-[300px] w-48 bg-white border-2 border-gray-300 p-4 text-center z-20 opacity-70">
                <span className="label-mono text-gray-500">TENANT_02</span>
                <div className="title-3 mt-1 line-through">Globex</div>
            </div>

            <div
                className="absolute left-[700px] top-[500px] w-48 bg-gray-50 border border-gray-300 p-4 text-center z-20 opacity-70">
                <span className="label-mono text-gray-500">DEPT</span>
                <div className="body-base mt-1 line-through">Strategy</div>
            </div>

        </div>

    </main>
    </>
  );
}

export default OrgChart;
