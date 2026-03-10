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

function Settings() {
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
                {/* GET /api/workspace/settings */}
                <li className="pt-6 border-t border-gray-100 mt-6"><a href="/app/settings"
                        className="title-3 font-medium transition-colors border-l-2 border-black pl-4">Settings</a></li>
            </ul>
        </div>

        <div className="space-y-6">
            <ul className="space-y-6 pb-6 border-b border-gray-100">
                <li><a href="/app/credentials"
                        className="body-small hover:text-black transition-colors pl-4">Credentials</a></li>
                <li><a href="/app/activity-log" className="body-small hover:text-black transition-colors pl-4">Audit
                        Trail</a></li>
            </ul>
        </div>
    </nav>

    {/* Settings Sidebar */}
    <aside className="w-64 border-r border-gray-100 flex flex-col bg-white flex-shrink-0 py-12 px-8">
        <ul className="space-y-8">
            <li><a href="/app/#general" className="label-mono text-black font-bold">General</a></li>
            <li><a href="/app/#billing" className="label-mono text-gray-500 hover:text-black transition-colors">Billing &
                    Usage</a></li>
            <li><a href="/app/#members" className="label-mono text-gray-500 hover:text-black transition-colors">Team Members</a>
            </li>
            <li><a href="/app/#guards" className="label-mono text-gray-500 hover:text-black transition-colors">Global
                    Guardrails</a></li>
            <li><a href="/app/#api" className="label-mono text-gray-500 hover:text-black transition-colors">Developer API</a>
            </li>
        </ul>
    </aside>

    <main className="flex-1 overflow-y-auto p-12 lg:p-24 relative bg-white">

        <div className="max-w-3xl">
            <header className="mb-24">
                <h1 className="title-display mb-6">Workspace Settings</h1>
                <p className="body-base text-gray-500">
                    Configure your tenant environment, manage team access, and set global API limits.
                </p>
            </header>

            {/* General Settings (GET /api/workspace/settings/general) */}
            <section id="general" className="mb-24 scroll-mt-24">
                <h2 className="title-2 mb-12 pb-4 border-b border-black">General Configuration</h2>

                <div className="space-y-12">
                    <div>
                        <label className="label-mono text-gray-500 block mb-2">Workspace Name</label>
                        <input type="text" value="Acme Corporation"
                            className="w-full bg-transparent border-b border-gray-300 py-3 title-3 text-black focus:outline-none focus:border-black transition-colors"
                            placeholder="e.g. Acme Corp" />
                    </div>

                    <div>
                        <label className="label-mono text-gray-500 block mb-2">Primary Domain</label>
                        <input type="text" value="acme.com"
                            className="w-full bg-transparent border-b border-gray-300 py-3 title-3 text-black focus:outline-none focus:border-black transition-colors"
                            placeholder="e.g. acme.com" />
                        <p className="body-small text-gray-500 mt-2">Used for resolving internal @mentions and routing.</p>
                    </div>

                    <div>
                        <label className="label-mono text-gray-500 block mb-4">Workspace Avatar</label>
                        <div className="flex items-center space-x-6">
                            <div className="w-20 h-20 bg-gray-100 flex items-center justify-center title-2">A</div>
                            {/* POST /api/workspace/settings/avatar */}
                            <button
                                className="label-mono border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors">UPLOAD
                                NEW</button>
                            <button className="label-mono text-status-red">REMOVE</button>
                        </div>
                    </div>

                    <div className="pt-8">
                        {/* PATCH /api/workspace/settings/general */}
                        <button
                            className="bg-black text-white px-8 py-3 label-mono hover:bg-gray-900 transition-colors">SAVE
                            GENERAL SETTINGS</button>
                    </div>
                </div>
            </section>

            {/* Billing Settings (GET /api/workspace/settings/billing) */}
            <section id="billing" className="mb-24 scroll-mt-24">
                <h2 className="title-2 mb-12 pb-4 border-b border-black">Billing & Usage Limits</h2>

                <div className="space-y-12">
                    <div className="bg-gray-50 p-8 border border-gray-200">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="title-3 mb-1">Current Plan: Enterprise (Monthly)</h3>
                                <p className="body-small text-gray-500">Includes 20 concurrent agent threads and 100M base
                                    tokens.</p>
                            </div>
                            <span
                                className="label-mono text-status-green border border-status-green px-2 py-1">ACTIVE</span>
                        </div>
                        <button
                            className="label-mono text-black border-b border-black hover:text-gray-500 hover:border-gray-500 transition-colors">MANAGE
                            SUBSCRIPTION IN STRIPE -></button>
                    </div>

                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <label className="label-mono text-gray-500">Hard Spend Limit (Monthly)</label>
                            <span className="title-3">$1,000.00</span>
                        </div>
                        <p className="body-small text-gray-500 mb-4">If exceeded, all Tier 2 and Tier 3 agent operations
                            will halt.</p>
                        {/* Range slider representation */}
                        <div className="w-full bg-gray-100 h-2 relative cursor-pointer group">
                            <div className="bg-black h-2 absolute left-0" style={{width: "25%"}}></div>
                            <div className="w-4 h-4 bg-white border-2 border-black rounded-full absolute top-1/2 -translate-y-1/2 -ml-2 hover:scale-125 transition-transform"
                                style={{left: "25%"}}></div>
                        </div>
                        <div className="flex justify-between mt-2 label-mono text-gray-300">
                            <span>$0</span>
                            <span>$4,000</span>
                        </div>
                    </div>

                    <div className="pt-8">
                        {/* PATCH /api/workspace/settings/billing */}
                        <button
                            className="bg-black text-white px-8 py-3 label-mono hover:bg-gray-900 transition-colors">SAVE
                            LIMITS</button>
                    </div>
                </div>
            </section>

            {/* Global Guardrails (GET /api/workspace/settings/guardrails) */}
            <section id="guards" className="mb-24 scroll-mt-24">
                <h2 className="title-2 mb-12 pb-4 border-b border-status-red flex items-center space-x-3">
                    <span className="w-3 h-3 rounded-full bg-status-red"></span>
                    <span>Global Guardrails</span>
                </h2>

                <div className="space-y-8">
                    <div
                        className="border border-gray-200 p-8 flex justify-between items-center group hover:border-black transition-colors">
                        <div>
                            <h3 className="title-3 mb-1">Require Human Approval for External Comm</h3>
                            <p className="body-small text-gray-500">Agents cannot publish to SNS or Email without explicit
                                review.</p>
                        </div>
                        {/* Toggle */}
                        <div className="w-12 h-6 bg-black rounded-full relative cursor-pointer">
                            <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                        </div>
                    </div>

                    <div
                        className="border border-gray-200 p-8 flex justify-between items-center group hover:border-black transition-colors">
                        <div>
                            <h3 className="title-3 mb-1">Strict PII Filtering</h3>
                            <p className="body-small text-gray-500">Automatically redact emails and names in RAG ingestion.
                            </p>
                        </div>
                        <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                            <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Danger Zone */}
            <section className="mt-32 pt-12 border-t mt-auto border-status-red">
                <h2 className="title-2 mb-4 text-status-red">Danger Zone</h2>
                <div className="flex justify-between items-center bg-red-50 p-8 border border-status-red">
                    <div>
                        <h3 className="title-3 mb-1 text-status-red">Delete Workspace</h3>
                        <p className="body-small text-gray-900">Permanently remove all agents, data, and configurations.
                            This cannot be undone.</p>
                    </div>
                    {/* DELETE /api/workspace */}
                    <button
                        className="bg-status-red text-white px-6 py-3 label-mono hover:bg-red-600 transition-colors">DELETE
                        WORKSPACE</button>
                </div>
            </section>

        </div>
    </main>
    </>
  );
}

export default Settings;
