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
                        <li><a href="/app/monitoring"
                                className="body-base text-gray-500 hover:text-black transition-colors">Health & Metrics</a>
                        </li>
                        <li><a href="/app/costs"
                                className="body-base text-gray-500 hover:text-black transition-colors">Platform Costs</a>
                        </li>
                        {/* GET /api/admin/settings */}
                        <li><a href="/app/settings" className="title-3 transition-colors">Global Settings</a></li>
                    </ul>
                </li>
            </ul>
        </div>
    </nav>

    <main className="flex-1 overflow-y-auto p-16 lg:p-32 bg-white flex justify-center">

        <div className="w-full max-w-4xl">
            <header className="mb-32">
                <h1 className="title-display mb-6">Global Directives</h1>
                <p className="body-base text-gray-500">
                    Mission-critical platform configurations. Changes here affect all tenants immediately.
                </p>
            </header>

            {/* Global Kill Switches */}
            <section className="mb-32">
                <h2 className="title-2 mb-12 border-b border-black pb-4 text-status-red">Defcon / Maintenance</h2>

                <div className="space-y-8">
                    {/* PATCH /api/admin/settings/maintenance */}
                    <div className="border border-status-red bg-red-50/10 p-8 flex justify-between items-center group">
                        <div>
                            <h3 className="title-3 mb-1 text-status-red">Global Maintenance Mode</h3>
                            <p className="body-small text-gray-900">Prevents user logins across all tenants. Active agents
                                will halt. Background jobs suspend.</p>
                        </div>
                        <div className="w-16 h-8 bg-black rounded-full relative cursor-pointer opacity-50">
                            <div className="w-6 h-6 bg-white rounded-full absolute left-1 top-1"></div>
                        </div>
                    </div>

                    <div
                        className="border border-gray-200 hover:border-black p-8 flex justify-between items-center group transition-colors">
                        <div>
                            <h3 className="title-3 mb-1">Halt New Signups</h3>
                            <p className="body-small text-gray-500">Disable the public onboarding flow and reject new API
                                provisioning.</p>
                        </div>
                        <div className="w-16 h-8 bg-black rounded-full relative cursor-pointer">
                            <div className="w-6 h-6 bg-status-green rounded-full absolute right-1 top-1"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Base Model Overrides */}
            <section className="mb-32">
                <h2 className="title-2 mb-12 border-b border-black pb-4">LLM Routing Fallbacks</h2>

                <div className="space-y-12">
                    <div>
                        <label className="label-mono text-gray-500 block mb-2">PRIMARY TIER 0 ENGINE</label>
                        <select
                            className="w-full bg-gray-50 border border-gray-200 py-4 px-6 title-3 focus:outline-none focus:border-black appearance-none">
                            <option>Anthropic Claude 3.5 Sonnet</option>
                            <option>Anthropic Claude 3 Opus</option>
                            <option>OpenAI GPT-4o</option>
                        </select>
                    </div>

                    <div>
                        <label className="label-mono text-gray-500 block mb-2">FALLBACK ENGINE (IN CASE OF PROVIDER
                            OUTAGE)</label>
                        <select
                            className="w-full bg-gray-50 border border-gray-200 py-4 px-6 title-3 focus:outline-none focus:border-black appearance-none">
                            <option>OpenAI GPT-4o-mini</option>
                            <option>Anthropic Claude 3 Haiku</option>
                        </select>
                    </div>
                </div>
            </section>

            <div className="flex justify-end pt-12 border-t border-gray-200">
                <button className="bg-black text-white px-12 py-4 label-mono hover:bg-gray-900 transition-colors">DEPLOY
                    CHANGES</button>
            </div>

        </div>

    </main>
    </>
  );
}

export default Settings;
