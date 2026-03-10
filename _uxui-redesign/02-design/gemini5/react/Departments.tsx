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

function Departments() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Global Nav */}
    <nav className="w-64 border-r border-gray-100 flex flex-col justify-between py-8 px-6 flex-shrink-0">
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
                <li><a href="/app/nexus" className="body-base hover:text-gray-500 transition-colors">Nexus</a></li>
            </ul>
        </div>

        <div className="space-y-6">
            <ul className="space-y-6 pb-6 border-b border-gray-100">
                <li><a href="/app/agents" className="body-small hover:text-gray-500 transition-colors">Agents</a></li>
                {/* Represents organization/department management */}
                <li><a href="/app/departments"
                        className="title-3 font-medium transition-colors pl-4 border-l-2 border-black">Departments</a></li>
                <li><a href="/app/knowledge" className="body-small hover:text-black transition-colors mt-4">Knowledge</a>
                </li>
                <li><a href="/app/costs" className="body-small hover:text-black transition-colors">Costs</a></li>
            </ul>
        </div>
    </nav>

    <main className="flex-1 overflow-y-auto p-12 lg:p-24 relative bg-white">

        <header className="mb-20 flex justify-between items-end">
            <div>
                <h1 className="title-display mb-6">Departments</h1>
                <p className="body-base max-w-2xl text-gray-500">
                    Structural organization units. Manage agent allocations and unit budgets.
                </p>
            </div>
            <button className="bg-black text-white px-6 py-3 label-mono hover:bg-gray-900 transition-colors">CREATE
                DEPARTMENT</button>
        </header>

        {/* Department List */}
        <div className="space-y-24">

            {/* Strategy Dept */}
            <section>
                <div className="flex justify-between items-end border-b border-black pb-4 mb-8">
                    <div>
                        <span className="label-mono text-gray-500 mb-2 block">D-01</span>
                        <h2 className="title-1">Investment Strategy</h2>
                    </div>
                    <div className="text-right">
                        <span className="label-mono text-gray-300 block mb-2">BUDGET USAGE</span>
                        <span className="body-base text-black">$120.40 <span className="text-gray-300">/ $500.00</span></span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Manager */}
                    <div
                        className="bg-gray-50 p-6 border border-transparent hover:border-black transition-colors cursor-pointer group">
                        <div className="label-mono text-gray-900 mb-6">MANAGER</div>
                        <h4 className="title-3 leading-tight mb-2">Chief Investment Officer</h4>
                        <p className="body-small text-gray-500">Sonnet 3.5</p>
                        <div className="mt-8 label-mono text-gray-300 group-hover:text-black transition-colors">Edit
                            Parameter -></div>
                    </div>

                    {/* Specialist */}
                    <div
                        className="bg-white p-6 border border-gray-200 hover:border-black transition-colors cursor-pointer group">
                        <div className="label-mono text-gray-500 mb-6">SPECIALIST</div>
                        <h4 className="title-3 leading-tight mb-2">Macro Economist</h4>
                        <p className="body-small text-gray-500">Haiku 3.0</p>
                    </div>

                    {/* Specialist */}
                    <div
                        className="bg-white p-6 border border-gray-200 hover:border-black transition-colors cursor-pointer group">
                        <div className="label-mono text-gray-500 mb-6">SPECIALIST</div>
                        <h4 className="title-3 leading-tight mb-2">Technical Analyst</h4>
                        <p className="body-small text-gray-500">GPT-4o Mini</p>
                    </div>

                    {/* Add Agent */}
                    <div
                        className="bg-white p-6 border border-dashed border-gray-300 flex items-center justify-center hover:border-black transition-colors cursor-pointer">
                        <span className="label-mono text-gray-500">+ ASSIGN AGENT</span>
                    </div>
                </div>
            </section>

            {/* Marketing Dept */}
            <section>
                <div className="flex justify-between items-end border-b border-black pb-4 mb-8">
                    <div>
                        <span className="label-mono text-gray-500 mb-2 block">D-02</span>
                        <h2 className="title-1">Marketing & Comms</h2>
                    </div>
                    <div className="text-right">
                        <span className="label-mono text-gray-300 block mb-2">BUDGET USAGE</span>
                        <span className="body-base text-black">$45.10 <span className="text-gray-300">/ $200.00</span></span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div
                        className="bg-gray-50 p-6 border border-transparent hover:border-black transition-colors cursor-pointer group">
                        <div className="label-mono text-gray-900 mb-6">MANAGER</div>
                        <h4 className="title-3 leading-tight mb-2">Brand Director</h4>
                        <p className="body-small text-gray-500">Sonnet 3.5</p>
                    </div>
                    <div
                        className="bg-white p-6 border border-gray-200 hover:border-black transition-colors cursor-pointer group">
                        <div className="label-mono text-gray-500 mb-6">WORKER</div>
                        <h4 className="title-3 leading-tight mb-2">Social Poster</h4>
                        <p className="body-small text-gray-500">Haiku 3.0</p>
                    </div>
                </div>
            </section>

        </div>

    </main>
    </>
  );
}

export default Departments;
