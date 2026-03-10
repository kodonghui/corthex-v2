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

function ActivityLog() {
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
                <li className="pt-6 border-t border-gray-100 mt-6"><a href="/app/settings"
                        className="body-base hover:text-gray-500 transition-colors">Settings</a></li>
            </ul>
        </div>

        <div className="space-y-6">
            <ul className="space-y-6 pb-6 border-b border-gray-100">
                {/* User/Tenant settings context */}
                {/* GET /api/workspace/activities */}
                <li><a href="/app/activity-log"
                        className="title-3 font-medium transition-colors border-l-2 border-black pl-4">Activity Log</a></li>
                <li><a href="/app/credentials"
                        className="body-small hover:text-black transition-colors pl-4">Credentials</a></li>
            </ul>
        </div>
    </nav>

    <main className="flex-1 overflow-y-auto p-12 lg:p-24 relative bg-white">

        <header className="mb-20 flex justify-between items-end">
            <div>
                <h1 className="title-display mb-6">Audit Trail</h1>
                <p className="body-base max-w-2xl text-gray-500">
                    High-level, human-readable record of system changes, authentication events, and major operations.
                </p>
            </div>
            <div className="flex space-x-6">
                <button
                    className="label-mono border border-gray-300 text-gray-500 px-4 py-2 hover:border-black hover:text-black transition-colors">EXPORT
                    CSV</button>
            </div>
        </header>

        {/* Timeline / Audit Log (GET /api/workspace/activities) */}
        <div className="max-w-4xl border-l-[3px] border-black ml-4 pl-12 space-y-16 py-8">

            {/* Date Separator */}
            <div className="relative">
                <div
                    className="absolute -left-[58px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-4 border-black">
                </div>
                <h3 className="label-mono text-gray-500 bg-white inline-block pr-4">TODAY (OCT 24, 2026)</h3>
            </div>

            {/* Event item */}
            <div className="group">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center space-x-3 mb-2">
                            <span className="label-mono text-black font-semibold">TENANT ADMIN</span>
                            <span className="body-base text-gray-900">Modified Department Budget</span>
                        </div>
                        <p className="body-small text-gray-500">Max limit for `D-01: Investment Strategy` increased from
                            $500 to $1,000.</p>
                    </div>
                    <span className="label-mono text-gray-300">14:32:00</span>
                </div>
            </div>

            <div className="group">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center space-x-3 mb-2">
                            <span className="label-mono text-black font-semibold">SEC_GENERAL</span>
                            <span className="body-base text-gray-900">Agent Parameter Updated</span>
                        </div>
                        <p className="body-small text-gray-500">Chief Marketing Officer engine switched from `gpt-4o` to
                            `claude-3-5-sonnet`.</p>
                    </div>
                    <span className="label-mono text-gray-300">11:05:12</span>
                </div>
            </div>

            {/* Date Separator */}
            <div className="relative mt-24">
                <div
                    className="absolute -left-[58px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-4 border-gray-300">
                </div>
                <h3 className="label-mono text-gray-300 bg-white inline-block pr-4">YESTERDAY (OCT 23, 2026)</h3>
            </div>

            <div className="group">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center space-x-3 mb-2">
                            <span className="label-mono text-status-red font-semibold border-b border-status-red">AUTH
                                FAILURE</span>
                            <span className="body-base text-gray-900">Failed Login Attempt</span>
                        </div>
                        <p className="body-small text-gray-500 font-mono">IP: 192.168.1.105 / Region: Unknown</p>
                    </div>
                    <span className="label-mono text-gray-300">22:15:44</span>
                </div>
            </div>

            <div className="group">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center space-x-3 mb-2">
                            <span className="label-mono text-black font-semibold">USER 'Kim'</span>
                            <span className="body-base text-gray-900">Credential Added</span>
                        </div>
                        <p className="body-small text-gray-500">New API Key `Finch Financial Data` added to registry.</p>
                    </div>
                    <span className="label-mono text-gray-300">09:00:21</span>
                </div>
            </div>

        </div>

        <div className="mt-16 text-center">
            <button className="label-mono text-gray-500 hover:text-black transition-colors">LOAD OLDER RECORDS</button>
        </div>

    </main>
    </>
  );
}

export default ActivityLog;
