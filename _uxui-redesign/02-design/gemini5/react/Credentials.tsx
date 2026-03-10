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

function Credentials() {
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
                {/* GET /api/workspace/credentials */}
                <li><a href="/app/credentials"
                        className="title-3 font-medium transition-colors pl-4 border-l-2 border-black">Credentials</a></li>
            </ul>
        </div>

        <div className="space-y-6">
            <div className="flex items-center space-x-3 cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center title-3">E</div>
                <div>
                    <div className="label-mono text-black">Workspace</div>
                    <div className="body-small">elddl.com</div>
                </div>
            </div>
        </div>
    </nav>

    <main className="flex-1 overflow-y-auto p-12 lg:p-24 relative bg-white">

        <header className="mb-20 flex justify-between items-end">
            <div>
                {/* GET /api/workspace/credentials/status */}
                <h1 className="title-display mb-6">Credentials Registry</h1>
                <p className="body-base max-w-2xl text-gray-500">
                    Secure vault for external API keys and authentication tokens needed by agents to execute actions.
                </p>
            </div>
            {/* POST /api/workspace/credentials */}
            <button className="bg-black text-white px-6 py-3 label-mono hover:bg-gray-900 transition-colors">+ NEW
                CREDENTIAL</button>
        </header>

        {/* Search and Filter */}
        <div className="mb-12 flex space-x-8 border-b border-black pb-4">
            <input type="text" placeholder="Search by name, platform..."
                className="w-full max-w-md bg-transparent border-none text-black body-base focus:outline-none placeholder-gray-300" />
            <div className="flex space-x-6 shrink-0 pt-1">
                <label className="flex items-center space-x-2 cursor-pointer group">
                    <input type="checkbox" checked className="accent-black" />
                    <span className="label-mono text-gray-500 group-hover:text-black">API Keys</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer group">
                    <input type="checkbox" checked className="accent-black" />
                    <span className="label-mono text-gray-500 group-hover:text-black">OAuth</span>
                </label>
            </div>
        </div>

        {/* Credentials List (GET /api/workspace/credentials) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            {/* Type: API_KEY, Purpose: TRADING */}
            <div className="border border-gray-200 p-8 hover:border-black transition-colors group relative">
                <div className="absolute top-8 right-8 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* PUT /api/workspace/credentials/:id */}
                    <button className="label-mono text-gray-500 hover:text-black">EDIT</button>
                    {/* DELETE /api/workspace/credentials/:id */}
                    <button className="label-mono text-status-red hover:text-black">RM</button>
                </div>
                <div className="flex space-x-2 mb-6">
                    <span className="px-2 py-1 bg-gray-100 label-mono text-black">TRADING</span>
                    <span className="px-2 py-1 border border-gray-100 label-mono text-gray-500">API_KEY</span>
                </div>
                <h3 className="title-2 mb-2">KIS Investment API</h3>
                <p className="body-small text-gray-500 mb-8">Production access to Korea Investment & Securities. Used by CIO
                    agent.</p>
                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="label-mono text-status-green flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-status-green"></div>VALIDATED
                    </span>
                    <span className="label-mono text-gray-300">Updated: 2w ago</span>
                </div>
            </div>

            {/* Type: SNS_OAUTH, Purpose: MKTG */}
            <div className="border border-gray-200 p-8 hover:border-black transition-colors group relative">
                <div className="absolute top-8 right-8 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="label-mono text-gray-500 hover:text-black">EDIT</button>
                    <button className="label-mono text-status-red hover:text-black">RM</button>
                </div>
                <div className="flex space-x-2 mb-6">
                    <span className="px-2 py-1 bg-gray-100 label-mono text-black">MARKETING</span>
                    <span className="px-2 py-1 border border-gray-100 label-mono text-gray-500">OAUTH2</span>
                </div>
                <h3 className="title-2 mb-2">X (Twitter) Official</h3>
                <p className="body-small text-gray-500 mb-8">Access to post on @corthex_sys account. Assigned to Social
                    Poster agent.</p>
                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="label-mono text-status-green flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-status-green"></div>TOKEN ACTV
                    </span>
                    <span className="label-mono text-gray-300">Updated: 1m ago</span>
                </div>
            </div>

            {/* Type: API_KEY, Purpose: GENERAL (Error state) */}
            <div className="border border-status-red p-8 hover:border-black transition-colors group relative">
                <div className="absolute top-8 right-8 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="label-mono text-gray-500 hover:text-black">EDIT</button>
                    <button className="label-mono text-status-red hover:text-black">RM</button>
                </div>
                <div className="flex space-x-2 mb-6">
                    <span className="px-2 py-1 bg-gray-100 label-mono text-black">GENERAL</span>
                    <span className="px-2 py-1 border border-status-red label-mono text-status-red">API_KEY</span>
                </div>
                <h3 className="title-2 mb-2">Finch Financial Data</h3>
                <p className="body-small text-gray-500 mb-8">Aggregated US market data feed.</p>
                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="label-mono text-status-red flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-status-red"></div>EXPIRED
                    </span>
                    <span className="label-mono text-gray-300">Failed 3h ago</span>
                </div>
            </div>

        </div>

    </main>
    </>
  );
}

export default Credentials;
