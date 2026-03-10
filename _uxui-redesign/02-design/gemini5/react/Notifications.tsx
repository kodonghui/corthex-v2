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

function Notifications() {
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
                {/* GET /api/workspace/notifications */}
                <li className="pt-6 border-t border-gray-100 mt-6"><a href="/app/notifications"
                        className="title-3 font-medium transition-colors border-l-2 border-black pl-4">Notifications</a>
                </li>
            </ul>
        </div>

        <div className="space-y-6">
            <ul className="space-y-6 pb-6 border-b border-gray-100">
                <li><a href="/app/settings" className="body-small hover:text-black transition-colors">Settings</a></li>
            </ul>
        </div>
    </nav>

    <main className="flex-1 overflow-y-auto p-12 lg:p-24 relative bg-gray-50">

        <div className="max-w-3xl mx-auto bg-white border border-gray-100 shadow-[0_0_0_1px_rgba(0,0,0,0.05)]">

            <header className="p-8 border-b border-black flex justify-between items-center sticky top-0 bg-white z-10">
                <h1 className="title-2">Inbox</h1>
                {/* POST /api/workspace/notifications/read-all */}
                <button className="label-mono text-gray-500 hover:text-black transition-colors">MARK ALL READ</button>
            </header>

            {/* Notification List */}
            <div className="divide-y divide-gray-100">

                {/* Unread, Action Required */}
                <div className="p-8 hover:bg-gray-50 cursor-pointer transition-colors relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-status-red"></div>
                    <div className="flex justify-between items-start mb-2 pl-4">
                        <span className="label-mono text-status-red font-bold">APPROVAL REQUIRED</span>
                        <span className="label-mono text-gray-300">10m ago</span>
                    </div>
                    <div className="pl-4">
                        <h3 className="title-3 mb-1">New Draft: Q4 Investor Update</h3>
                        <p className="body-small text-gray-500 mb-4">Marketing Dept has synthesized the latest performance
                            metrics into a draft. Awaiting your approval to publish to LinkedIn.</p>
                        <div className="flex space-x-4">
                            <a href="/app/sns"
                                className="label-mono bg-black text-white px-4 py-2 hover:bg-gray-900 transition-colors">REVIEW
                                DRAFT</a>
                        </div>
                    </div>
                </div>

                {/* Unread, System Alert */}
                <div className="p-8 hover:bg-gray-50 cursor-pointer transition-colors relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-black"></div>
                    <div className="flex justify-between items-start mb-2 pl-4">
                        <span className="label-mono text-black font-bold">SYSTEM ALERT</span>
                        <span className="label-mono text-gray-300">1h ago</span>
                    </div>
                    <div className="pl-4">
                        <h3 className="title-3 mb-1">Budget Threshold Reached</h3>
                        <p className="body-small text-gray-500">Workspace has consumed 80% of the allocated monthly API
                            budget ($800 / $1,000). Consider reviewing agent allocations.</p>
                    </div>
                </div>

                {/* Read, Info */}
                <div className="p-8 hover:bg-gray-50 cursor-pointer transition-colors opacity-60">
                    <div className="flex justify-between items-start mb-2 pl-4">
                        <span className="label-mono text-gray-500 font-medium">JOB COMPLETED</span>
                        <span className="label-mono text-gray-300">Yesterday</span>
                    </div>
                    <div className="pl-4">
                        <h3 className="title-3 mb-1 font-normal text-gray-900">Vector Ingestion: 2026 Strategy Docs</h3>
                        <p className="body-small text-gray-500">14 documents processed and added to namespace `NS_STRATEGY`.
                        </p>
                    </div>
                </div>

                {/* Read, Chat mention */}
                <div className="p-8 hover:bg-gray-50 cursor-pointer transition-colors opacity-60">
                    <div className="flex justify-between items-start mb-2 pl-4">
                        <span className="label-mono text-gray-500 font-medium">@MENTION</span>
                        <span className="label-mono text-gray-300">Yesterday</span>
                    </div>
                    <div className="pl-4">
                        <h3 className="title-3 mb-1 font-normal text-gray-900">Secretary General</h3>
                        <p className="body-small text-gray-500">"I have completed the delegated task regarding the market
                            scan. The resulting report is available."</p>
                    </div>
                </div>

            </div>

        </div>

    </main>
    </>
  );
}

export default Notifications;
