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

function OpsLog() {
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
                {/* GET /api/workspace/operations/logs */}
                <li className="pt-6 border-t border-gray-100 mt-6"><a href="/app/ops-log"
                        className="title-3 font-medium transition-colors">Operation Logs</a></li>
                <li><a href="/app/reports" className="body-base hover:text-gray-500 transition-colors">Reports</a></li>
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

    <main className="flex-1 flex flex-col h-full bg-white relative">

        <header className="p-12 lg:px-24 border-b border-black pb-8 shrink-0 flex justify-between items-end">
            <div>
                <h1 className="title-display mb-2">Ops Log</h1>
                <p className="body-base text-gray-500">
                    Raw stream of all agent tool executions, API calls, and system events.
                </p>
            </div>
            <div className="flex space-x-6">
                <select className="label-mono text-black border-b border-black pb-1 focus:outline-none bg-transparent">
                    <option>Level: ALL</option>
                    <option>Level: ERROR</option>
                    <option>Level: WARN</option>
                </select>
                <select className="label-mono text-black border-b border-black pb-1 focus:outline-none bg-transparent">
                    <option>Agent: ALL</option>
                    <option>Agent: Secretary</option>
                    <option>Agent: CIO</option>
                </select>
            </div>
        </header>

        {/* Log Stream (GET /api/workspace/operations/logs) */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-12 lg:px-24 font-mono body-small text-gray-900 space-y-2">

            <div className="flex space-x-4 hover:bg-white py-1 transition-colors">
                <span className="text-gray-500 w-32 shrink-0">14:22:01.001</span>
                <span className="text-status-green font-bold w-16 shrink-0">INFO</span>
                <span className="text-black w-48 shrink-0 truncate">SEC_GENERAL</span>
                <span className="break-all whitespace-pre-wrap">Parsed intent from User_Kim. Confidence: 0.98. Routing to
                    STRATEGY_CIO.</span>
            </div>

            <div className="flex space-x-4 hover:bg-white py-1 transition-colors">
                <span className="text-gray-500 w-32 shrink-0">14:22:02.145</span>
                <span className="text-gray-500 font-bold w-16 shrink-0">DEBUG</span>
                <span className="text-black w-48 shrink-0 truncate">STRATEGY_CIO</span>
                <span className="break-all whitespace-pre-wrap">Tool call initiated: `[fetch_market_data]` args: `{"ticker":
                    "AAPL", "interval": "1d"}`</span>
            </div>

            <div className="flex space-x-4 hover:bg-white py-1 transition-colors">
                <span className="text-gray-500 w-32 shrink-0">14:22:04.992</span>
                <span className="text-gray-500 font-bold w-16 shrink-0">DEBUG</span>
                <span className="text-black w-48 shrink-0 truncate">SYS_NET</span>
                <span className="break-all whitespace-pre-wrap">HTTP GET api.finch.com/v1/historical/AAPL => HTTP 200
                    (Duration: 2.8s)</span>
            </div>

            <div className="flex space-x-4 hover:bg-white py-1 transition-colors">
                <span className="text-gray-500 w-32 shrink-0">14:23:10.512</span>
                <span className="text-status-red font-bold w-16 shrink-0">ERROR</span>
                <span className="text-black w-48 shrink-0 truncate">MKTG_CONTENT</span>
                <span className="break-all whitespace-pre-wrap">Tool execution failed: `[sns_publish]`. Error: Rate Limit
                    Exceeded on LinkedIn OAuth Token. Retry scheduled in 15m.</span>
            </div>

            <div className="flex space-x-4 hover:bg-white py-1 transition-colors">
                <span className="text-gray-500 w-32 shrink-0">14:25:00.000</span>
                <span className="text-status-green font-bold w-16 shrink-0">INFO</span>
                <span className="text-black w-48 shrink-0 truncate">CRON_JOB</span>
                <span className="break-all whitespace-pre-wrap">Triggered scheduled workflow:
                    `[Daily_Asset_Sync_DB]`.</span>
            </div>

        </div>

        <footer
            className="p-8 border-t border-gray-100 bg-white shrink-0 flex justify-between items-center text-label-mono">
            <span className="label-mono text-status-green flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-status-green animate-pulse"></div>STREAMING
            </span>
            <button className="label-mono text-black hover:text-gray-500">PAUSE STREAM</button>
        </footer>

    </main>
    </>
  );
}

export default OpsLog;
