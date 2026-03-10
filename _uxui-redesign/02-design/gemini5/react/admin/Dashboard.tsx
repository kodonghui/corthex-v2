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

function Dashboard() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Super Admin Nav */}
    <nav className="w-72 flex flex-col justify-between py-12 px-10 flex-shrink-0 bg-gray-50">
        <div>
            <div className="mb-24 flex items-center">
                <span className="title-2 tracking-tighter">CORTHEX</span>
                <span className="label-mono ml-3 text-status-red bg-red-50 px-2 py-1">ADMIN</span>
            </div>

            <ul className="space-y-10">
                {/* GET /api/admin/dashboard */}
                <li><a href="/app/dashboard" className="title-3 transition-colors">Platform Overview</a></li>
                <li className="space-y-6">
                    <span className="label-mono text-gray-300 block mb-4">TENANT MANAGEMENT</span>
                    <ul className="space-y-6 pl-4">
                        <li><a href="/app/companies"
                                className="body-base text-gray-500 hover:text-black transition-colors">Companies</a></li>
                        <li><a href="/app/users"
                                className="body-base text-gray-500 hover:text-black transition-colors">Global Users</a></li>
                        <li><a href="/app/onboarding"
                                className="body-base text-gray-500 hover:text-black transition-colors">Onboarding Queue</a>
                        </li>
                    </ul>
                </li>
                <li className="space-y-6 pt-4">
                    <span className="label-mono text-gray-300 block mb-4">AGENT REGISTRY</span>
                    <ul className="space-y-6 pl-4">
                        <li><a href="/app/agents"
                                className="body-base text-gray-500 hover:text-black transition-colors">System Agents</a>
                        </li>
                        <li><a href="/app/soul-templates"
                                className="body-base text-gray-500 hover:text-black transition-colors">Soul Templates</a>
                        </li>
                        <li><a href="/app/tools" className="body-base text-gray-500 hover:text-black transition-colors">Tool
                                Functions</a></li>
                    </ul>
                </li>
                <li className="space-y-6 pt-4">
                    <span className="label-mono text-gray-300 block mb-4">SYSTEM</span>
                    <ul className="space-y-6 pl-4">
                        <li><a href="/app/monitoring"
                                className="body-base text-gray-500 hover:text-black transition-colors">Health & Metrics</a>
                        </li>
                        <li><a href="/app/costs"
                                className="body-base text-gray-500 hover:text-black transition-colors">Platform Costs</a>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>

        <div>
            <a href="/app/../home" className="label-mono text-gray-500 hover:text-black transition-colors"><- BACK TO
                    APP</a>
        </div>
    </nav>

    <main className="flex-1 overflow-y-auto p-16 lg:p-32 bg-white">

        {/* Intentionally no borders, using massive whitespace */}
        <header className="mb-32 flex justify-between items-end">
            <div>
                <h1 className="title-display mb-8">Platform Status</h1>
                <p className="body-base max-w-2xl text-gray-500">
                    High-level aggregate metrics across all 42 tenants and 1,204 active agents.
                </p>
            </div>
            <div className="text-right">
                <span className="label-mono text-status-green flex items-center justify-end space-x-2">
                    <div className="w-3 h-3 bg-status-green"></div>ALL SYSTEMS NOMINAL
                </span>
            </div>
        </header>

        {/* Key Metrics */}
        <div className="flex flex-wrap gap-32 mb-40">
            <div>
                <span className="label-mono text-gray-500 block mb-6">LIVE TENANTS</span>
                <span className="title-display tracking-tighter">42</span>
            </div>
            <div>
                <span className="label-mono text-gray-500 block mb-6">ACTIVE AGENT THREADS</span>
                <span className="title-display tracking-tighter">318</span>
            </div>
            <div>
                <span className="label-mono text-gray-500 block mb-6">GLOBAL LLM LATENCY</span>
                <span className="title-display tracking-tighter">412<span className="title-2 text-gray-300">ms</span></span>
            </div>
            <div>
                <span className="label-mono text-gray-500 block mb-6">MRR (EST)</span>
                <span className="title-display tracking-tighter">$84.5<span className="title-2 text-gray-300">k</span></span>
            </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-32">

            {/* High Load Tenants */}
            <section>
                <div className="flex justify-between items-end mb-16">
                    <h2 className="title-1">Top Consumers</h2>
                    <a href="/app/companies" className="label-mono text-gray-500 hover:text-black">VIEW ALL</a>
                </div>

                <div className="space-y-12">
                    <div className="group cursor-pointer">
                        <div className="flex justify-between items-end mb-4">
                            <span className="title-3 text-black">Acme Corporation</span>
                            <span className="body-base text-gray-500">142.5M Tokens</span>
                        </div>
                        <div className="w-full h-1 bg-gray-100">
                            <div className="h-1 bg-black w-[80%] transition-all"></div>
                        </div>
                    </div>

                    <div className="group cursor-pointer">
                        <div className="flex justify-between items-end mb-4">
                            <span className="title-3 text-black">Globex Finance</span>
                            <span className="body-base text-gray-500">89.1M Tokens</span>
                        </div>
                        <div className="w-full h-1 bg-gray-100">
                            <div className="h-1 bg-gray-700 w-[50%] transition-all"></div>
                        </div>
                    </div>

                    <div className="group cursor-pointer">
                        <div className="flex justify-between items-end mb-4">
                            <span className="title-3 text-gray-500">Stark Industries</span>
                            <span className="body-base text-gray-300">12.2M Tokens</span>
                        </div>
                        <div className="w-full h-1 bg-gray-100">
                            <div className="h-1 bg-gray-300 w-[10%] transition-all"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* System Anomalies */}
            <section>
                <div className="flex justify-between items-end mb-16">
                    <h2 className="title-1">Anomalies</h2>
                    <a href="/app/monitoring" className="label-mono text-gray-500 hover:text-black">LOGS</a>
                </div>

                <div className="space-y-12">
                    <div>
                        <div className="flex space-x-4 mb-4">
                            <span className="label-mono text-status-red bg-red-50 px-2 py-1">API TIMEOUT</span>
                            <span className="label-mono text-gray-500 py-1">4m ago</span>
                        </div>
                        <h3 className="title-3 mb-2">Claude 3.5 Sonnet Engine Delay</h3>
                        <p className="body-small text-gray-500">Region us-east-1 experienced a 5s latency spike. Swarm load
                            balancer shifted 40% traffic to gpt-4o as fallback.</p>
                    </div>

                    <div>
                        <div className="flex space-x-4 mb-4">
                            <span className="label-mono bg-gray-100 px-2 py-1 text-black">RATE LIMIT</span>
                            <span className="label-mono text-gray-500 py-1">1h ago</span>
                        </div>
                        <h3 className="title-3 mb-2">Tenant 'Initech' exceeded RPM allowance</h3>
                        <p className="body-small text-gray-500">Automatically throttled batch jobs to queue state.</p>
                    </div>
                </div>
            </section>

        </div>

    </main>
    </>
  );
}

export default Dashboard;
