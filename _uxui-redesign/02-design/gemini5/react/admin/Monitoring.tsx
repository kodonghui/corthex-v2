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

function Monitoring() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
<nav className="w-72 flex flex-col justify-between py-12 px-10 flex-shrink-0 bg-gray-50 border-r border-gray-100">
        <div>
            <div className="mb-24 flex items-center">
                <span className="title-2 tracking-tighter">CORTHEX</span>
                <span className="label-mono ml-3 text-status-red bg-red-50 px-2 py-1">ADMIN</span>
            </div>

            <ul className="space-y-10">
                <li><a href="/app/dashboard" className="body-base text-gray-500 hover:text-black transition-colors">Platform
                        Overview</a></li>
                <li className="space-y-6 pt-4">
                    <span className="label-mono text-gray-300 block mb-4">SYSTEM</span>
                    <ul className="space-y-6 pl-4">
                        {/* GET /api/admin/metrics */}
                        <li><a href="/app/monitoring" className="title-3 transition-colors">Health & Metrics</a></li>
                        <li><a href="/app/costs"
                                className="body-base text-gray-500 hover:text-black transition-colors">Platform Costs</a>
                        </li>
                        <li><a href="/app/settings"
                                className="body-base text-gray-500 hover:text-black transition-colors">Global Settings</a>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
    </nav>

    <main className="flex-1 overflow-y-auto p-16 lg:p-32 bg-white">

        <header className="mb-24 flex justify-between items-end border-b border-black pb-8">
            <div>
                <h1 className="title-display mb-6 border-l-[12px] border-status-green pl-6 -ml-[30px]">System Health</h1>
                <p className="body-base max-w-2xl text-gray-500">
                    Live telemetry across AWS Clusters, Vector DB shards, and LLM Provider API status.
                </p>
            </div>
            <span className="label-mono text-gray-300">AUTO-REFRESH: <span className="text-black">5s</span></span>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-24">

            <div className="p-8 border border-gray-100 bg-gray-50">
                <span className="label-mono text-gray-500 mb-4 block">DATABASE LOAD</span>
                <div className="flex items-end justify-between mb-4">
                    <span className="title-1">68<span className="title-3">%</span></span>
                    <span className="label-mono text-status-green border border-status-green px-1 bg-green-50">STABLE</span>
                </div>
                <div className="w-full h-2 bg-gray-200">
                    <div className="h-2 bg-black w-[68%]"></div>
                </div>
            </div>

            <div className="p-8 border border-gray-100 bg-gray-50">
                <span className="label-mono text-gray-500 mb-4 block">LLM THROTTLING (429s)</span>
                <div className="flex items-end justify-between mb-4">
                    <span className="title-1">1.2<span className="title-3">%</span></span>
                    <span className="label-mono text-yellow-600 border border-yellow-600 px-1 bg-yellow-50">WATCH</span>
                </div>
                <div className="w-full h-2 bg-gray-200">
                    <div className="h-2 bg-yellow-500 w-[12%]"></div>
                </div>
            </div>

            <div className="p-8 border border-gray-100 bg-gray-50">
                <span className="label-mono text-gray-500 mb-4 block">GLOBAL WORKER QUEUE</span>
                <div className="flex items-end justify-between mb-4">
                    <span className="title-1">14</span>
                    <span
                        className="label-mono text-status-green border border-status-green px-1 bg-green-50">OPTIMAL</span>
                </div>
                <div className="w-full h-2 bg-gray-200">
                    <div className="h-2 bg-black w-[5%]"></div>
                </div>
            </div>

        </div>

        <section>
            <h2 className="title-2 mb-12">Cluster Nodes</h2>

            <table className="w-full text-left">
                <thead>
                    <tr>
                        <th className="label-mono text-gray-500 pb-4 border-b border-gray-200 w-1/4">NODE ID</th>
                        <th className="label-mono text-gray-500 pb-4 border-b border-gray-200 w-1/4">REGION</th>
                        <th className="label-mono text-gray-500 pb-4 border-b border-gray-200 w-1/4">CPU LOAD</th>
                        <th className="label-mono text-gray-500 pb-4 border-b border-gray-200 text-right">STATUS</th>
                    </tr>
                </thead>
                <tbody className="body-base font-mono">
                    <tr>
                        <td className="py-6 border-b border-gray-50">ctx-wrk-us-e-01</td>
                        <td className="py-6 border-b border-gray-50 text-gray-500">us-east-1a</td>
                        <td className="py-6 border-b border-gray-50">42.1%</td>
                        <td className="py-6 border-b border-gray-50 text-right text-status-green">UP</td>
                    </tr>
                    <tr>
                        <td className="py-6 border-b border-gray-50">ctx-wrk-us-e-02</td>
                        <td className="py-6 border-b border-gray-50 text-gray-500">us-east-1b</td>
                        <td className="py-6 border-b border-gray-50">38.9%</td>
                        <td className="py-6 border-b border-gray-50 text-right text-status-green">UP</td>
                    </tr>
                    <tr className="opacity-50 line-through">
                        <td className="py-6 border-b border-gray-50 text-status-red">ctx-wrk-eu-w-01</td>
                        <td className="py-6 border-b border-gray-50 text-status-red">eu-west-1</td>
                        <td className="py-6 border-b border-gray-50 text-status-red">ERR</td>
                        <td className="py-6 border-b border-gray-50 text-right text-status-red">DOWN</td>
                    </tr>
                </tbody>
            </table>
        </section>

    </main>
    </>
  );
}

export default Monitoring;
