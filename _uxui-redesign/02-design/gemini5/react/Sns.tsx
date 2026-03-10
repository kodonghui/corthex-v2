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

function Sns() {
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
                {/* Represents social media / marketing domain */}
                {/* GET /api/workspace/sns/channels */}
                <li><a href="/app/sns" className="title-3 font-medium transition-colors">Marketing / SNS</a></li>
                <li><a href="/app/agora" className="body-base hover:text-gray-500 transition-colors">Agora</a></li>
            </ul>
        </div>
    </nav>

    {/* Main Content: SNS View Split */}
    <main className="flex-1 flex overflow-hidden">

        {/* Left: Channels & Pending Approvals */}
        <div className="w-1/3 min-w-[350px] border-r border-gray-100 flex flex-col bg-white">
            <div className="p-8 border-b border-gray-100">
                <h2 className="title-2 mb-2">Broadcasting</h2>
                <p className="body-small text-gray-500">Manage outgoing communications</p>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="p-8">
                    {/* GET /api/workspace/sns/drafts */}
                    <h3 className="label-mono text-black mb-6">Awaiting Approval (2)</h3>

                    <div className="border border-black p-4 mb-4 hover:bg-gray-50 cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                            <span className="label-mono text-gray-500">LINKEDIN</span>
                            <span className="label-mono text-status-red animate-pulse">ACTION REQ</span>
                        </div>
                        <p className="body-small text-gray-900 line-clamp-2 mb-4">"We are excited to announce our new Q4
                            restructuring regarding the tech sector portfolio allocation..."</p>
                        <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                            <span className="body-small text-gray-500">By: Marketing Dept</span>
                            {/* POST /api/workspace/sns/drafts/:id/approve */}
                            <button className="label-mono bg-black text-white px-3 py-1 hover:bg-gray-900">REVIEW</button>
                        </div>
                    </div>
                </div>

                <div className="p-8 border-t border-gray-100">
                    <h3 className="label-mono text-black mb-6">Active Channels</h3>
                    {/* GET /api/workspace/sns/channels */}
                    <ul className="space-y-4">
                        <li className="flex justify-between items-center group cursor-pointer">
                            <span className="body-base font-medium group-hover:underline">X (Twitter)</span>
                            <span className="w-2 h-2 rounded-full bg-status-green"></span>
                        </li>
                        <li className="flex justify-between items-center group cursor-pointer">
                            <span className="body-base font-medium group-hover:underline">LinkedIn</span>
                            <span className="w-2 h-2 rounded-full bg-status-green"></span>
                        </li>
                        <li className="flex justify-between items-center group cursor-pointer">
                            <span className="body-base font-medium text-gray-500 group-hover:text-black">Medium Blog</span>
                            <span className="w-2 h-2 rounded-full bg-black"></span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        {/* Right: Content Editor / Composer */}
        <div className="flex-1 flex flex-col bg-white h-full relative">
            <header className="p-8 border-b border-gray-100 flex justify-between items-center shrink-0">
                <h2 className="title-2">Draft Editor</h2>
                <div className="label-mono text-gray-500">Draft ID: MKT-DRAFT-24A</div>
            </header>

            <div className="flex-1 p-12 lg:px-24 overflow-y-auto">

                <div className="mb-12 border-b border-black pb-4">
                    <div className="flex items-center space-x-6">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" className="accent-black" checked />
                            <span className="label-mono text-black">LINKEDIN</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" className="accent-black" />
                            <span className="label-mono text-gray-500">X (TWITTER)</span>
                        </label>
                    </div>
                </div>

                {/* PATCH /api/workspace/sns/drafts/:id */}
                <textarea
                    className="w-full h-96 border-none bg-transparent title-3 text-black focus:outline-none resize-none placeholder-gray-300"
                    placeholder="Agent drafted content will appear here...">"We are excited to announce our new Q4 restructuring regarding the tech sector portfolio allocation. By leveraging CORTHEX v2 analysis pipelines, we've identified key resilience markers in healthcare infrastructure leading into 2027. Read our full reasoning..."</textarea>

                <div className="mt-8 border border-gray-100 p-6 bg-gray-50">
                    <h4 className="label-mono text-gray-500 mb-4">Agent Reasoning Log</h4>
                    <p className="body-small text-gray-500 font-mono">
                        -> Initialized by MGR_MKT based on CIO Rebalance Action.<br />
                        -> Verified compliance policies: PASS.<br />
                        -> Adjusted tone for LinkedIn audience (Professional/Analytical).
                    </p>
                </div>
            </div>

            {/* Sticky Actions */}
            <div
                className="absolute bottom-0 w-full bg-white p-8 border-t border-gray-100 flex justify-between items-center">
                {/* POST /api/workspace/sns/drafts/:id/reject */}
                <button className="label-mono text-gray-500 hover:text-status-red transition-colors">DISCARD /
                    REJECT</button>
                <div className="space-x-4">
                    {/* POST /api/workspace/sns/drafts/:id/revise */}
                    <button
                        className="label-mono text-black border border-black px-6 py-3 hover:bg-gray-100 transition-colors">REQUEST
                        REVISION</button>
                    {/* POST /api/workspace/sns/drafts/:id/approve */}
                    <button className="label-mono bg-black text-white px-6 py-3 hover:bg-gray-900 transition-colors">APPROVE
                        & PUBLISH</button>
                </div>
            </div>
        </div>

    </main>
    </>
  );
}

export default Sns;
