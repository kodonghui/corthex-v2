"use client";
import React from "react";

const styles = `
/* Base styles enforcing the pure minimal aesthetic */
        body {
            background-color: #FFFFFF;
            color: #000000;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        /* Hide scrollbars for cleaner look */
        ::-webkit-scrollbar {
            width: 0px;
            background: transparent;
        }

        /* Selection styling */
        ::selection {
            background-color: #000000;
            color: #FFFFFF;
        }

        /* Typography Utilities */
        .title-display {
            font-size: 4rem;
            /* 64px */
            line-height: 1;
            font-weight: 800;
            /* ExtraBold */
            letter-spacing: -0.04em;
        }

        .title-1 {
            font-size: 2.5rem;
            /* 40px */
            line-height: 1.1;
            font-weight: 700;
            /* Bold */
            letter-spacing: -0.02em;
        }

        .title-2 {
            font-size: 1.5rem;
            /* 24px */
            line-height: 1.2;
            font-weight: 600;
            /* SemiBold */
            letter-spacing: -0.02em;
        }

        .title-3 {
            font-size: 1.125rem;
            /* 18px */
            line-height: 1.4;
            font-weight: 600;
            /* SemiBold */
        }

        .body-base {
            font-size: 0.9375rem;
            /* 15px */
            line-height: 1.6;
            font-weight: 400;
            /* Regular */
            color: #111111;
        }

        .body-small {
            font-size: 0.8125rem;
            /* 13px */
            line-height: 1.5;
            font-weight: 400;
            /* Regular */
            color: #666666;
        }

        .label-mono {
            font-size: 0.6875rem;
            /* 11px */
            font-weight: 600;
            /* SemiBold */
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #999999;
        }

        /* Component Classes */
        .ds-layout {
            max-width: 1200px;
            margin: 0 auto;
            padding: 4rem 2rem;
        }

        .ds-section {
            margin-bottom: 8rem;
            /* Large whitespace instead of borders */
        }

        .ds-card {
            background-color: #FFFFFF;
            /* NO border, NO shadow, just spacing and typography */
            transition: background-color 0.2s ease;
        }

        .ds-card:hover {
            background-color: #EEEEEE;
        }
`;

function DesignSystem() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
<header className="mb-24">
        <p className="label-mono mb-4 text-black">CORTHEX v2 / UI Foundations</p>
        <h1 className="title-display">Design System</h1>
        <p className="body-base mt-6 max-w-2xl text-gray-500">
            Monochrome Typography theme. Hierarchy is established exclusively through font size, weight, letter-spacing,
            and proximity. Red and Green are the only permitted colors, reserved strictly for absolute status
            indication.
        </p>
    </header>

    <main>
        {/* Typography Scale */}
        <section className="ds-section">
            <h2 className="label-mono mb-12 text-black">01 Typography Scale</h2>

            <div className="space-y-12">
                <div>
                    <div className="label-mono mb-2 text-gray-300">.title-display (64px, ExtraBold)</div>
                    <div className="title-display">System Overview</div>
                </div>
                <div>
                    <div className="label-mono mb-2 text-gray-300">.title-1 (40px, Bold)</div>
                    <div className="title-1">Quarterly Performance</div>
                </div>
                <div>
                    <div className="label-mono mb-2 text-gray-300">.title-2 (24px, SemiBold)</div>
                    <div className="title-2">Active Agents</div>
                </div>
                <div>
                    <div className="label-mono mb-2 text-gray-300">.title-3 (18px, SemiBold)</div>
                    <div className="title-3">Revenue Projection</div>
                </div>
                <div>
                    <div className="label-mono mb-2 text-gray-300">.body-base (15px, Regular)</div>
                    <div className="body-base max-w-xl">
                        The Chief Investment Officer agent has proposed a reallocation of the tech sector portfolio
                        based on recent earnings reports and macroeconomic indicators. Proceeding with analysis phase 2.
                    </div>
                </div>
                <div>
                    <div className="label-mono mb-2 text-gray-300">.body-small (13px, Regular, Gray-500)</div>
                    <div className="body-small">
                        Processed 244,192 tokens. Estimated cost: $0.12 US.
                    </div>
                </div>
                <div>
                    <div className="label-mono mb-2 text-gray-300">.label-mono (11px, SemiBold, Uppercase)</div>
                    <div className="label-mono">Department / Finance</div>
                </div>
            </div>
        </section>

        {/* Color Palette */}
        <section className="ds-section">
            <h2 className="label-mono mb-12 text-black">02 Core Palette</h2>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
                <div>
                    <div className="w-full aspect-square bg-black mb-4"></div>
                    <div className="title-3">Black</div>
                    <div className="label-mono mt-1">#000000</div>
                </div>
                <div>
                    <div className="w-full aspect-square bg-gray-900 mb-4"></div>
                    <div className="title-3">Gray 900</div>
                    <div className="label-mono mt-1">#111111</div>
                </div>
                <div>
                    <div className="w-full aspect-square bg-gray-500 mb-4"></div>
                    <div className="title-3">Gray 500</div>
                    <div className="label-mono mt-1">#666666</div>
                </div>
                <div>
                    <div className="w-full aspect-square bg-gray-300 mb-4"></div>
                    <div className="title-3">Gray 300</div>
                    <div className="label-mono mt-1">#999999</div>
                </div>
                <div>
                    <div className="w-full aspect-square bg-gray-100 mb-4 border border-gray-100"></div>
                    <div className="title-3">Gray 100</div>
                    <div className="label-mono mt-1">#EEEEEE</div>
                </div>
                <div>
                    <div className="w-full aspect-square bg-white mb-4 border border-gray-100"></div>
                    <div className="title-3">White</div>
                    <div className="label-mono mt-1">#FFFFFF</div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mt-12">
                <div>
                    <div className="w-full aspect-square bg-status-green mb-4"></div>
                    <div className="title-3">Green</div>
                    <div className="label-mono mt-1">Status OK</div>
                </div>
                <div>
                    <div className="w-full aspect-square bg-status-red mb-4"></div>
                    <div className="title-3">Red</div>
                    <div className="label-mono mt-1">Status ERROR</div>
                </div>
            </div>
        </section>

        {/* UI Components */}
        <section className="ds-section">
            <h2 className="label-mono mb-12 text-black">03 Core Components</h2>

            <div className="space-y-24">

                {/* Buttons */}
                <div>
                    <h3 className="title-3 mb-6">Interactive Elements</h3>
                    <div className="flex items-center space-x-6">
                        {/* Primary Action */}
                        <button
                            className="bg-black text-white px-6 py-3 font-medium text-sm hover:bg-gray-900 transition-colors">
                            Execute Command
                        </button>
                        {/* Secondary Action (Text only) */}
                        <button className="text-black font-medium text-sm hover:text-gray-500 transition-colors">
                            Cancel Analysis
                        </button>
                        {/* Danger Action */}
                        <button className="text-status-red font-medium text-sm hover:opacity-70 transition-opacity">
                            Terminate Process
                        </button>
                    </div>
                </div>

                {/* Input Field */}
                <div>
                    <h3 className="title-3 mb-6">Input Field</h3>
                    <div className="max-w-md">
                        <label className="block label-mono text-black mb-2">Command Center Input</label>
                        <input type="text" placeholder="/analyze AAPL latest earnings"
                            className="w-full bg-gray-100 text-black py-4 px-4 body-base focus:outline-none focus:ring-1 focus:ring-black placeholder-gray-500" />
                    </div>
                </div>

                {/* Status Indicators */}
                <div>
                    <h3 className="title-3 mb-6">Status Indicators</h3>
                    <div className="flex space-x-12">
                        <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-status-green"></span>
                            <span className="label-mono text-black">System Online</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-black"></span>
                            <span className="label-mono text-black">Processing</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-status-red"></span>
                            <span className="label-mono text-status-red">Critical Error</span>
                        </div>
                    </div>
                </div>

                {/* Data Card / Agent Card */}
                <div>
                    <h3 className="title-3 mb-6">Data Card / Agent Profile</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

                        <div className="ds-card p-6 cursor-pointer">
                            <div className="flex justify-between items-start mb-12">
                                <div className="label-mono text-black">Manager</div>
                                <span className="w-2 h-2 rounded-full bg-status-green"></span>
                            </div>
                            <h4 className="title-2 mb-2">Chief Investment Officer</h4>
                            <p className="body-small mb-6">Claude 3.5 Sonnet</p>
                            <div className="flex justify-between items-end border-t border-gray-100 pt-4">
                                <div>
                                    <div className="label-mono text-gray-300">Daily Cost</div>
                                    <div className="title-3 mt-1">$4.20</div>
                                </div>
                                <div>
                                    <div className="label-mono text-gray-300">Tasks</div>
                                    <div className="title-3 mt-1">12</div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Minimal Table / List */}
                <div>
                    <h3 className="title-3 mb-6">Data List</h3>
                    <div className="max-w-4xl">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 pb-4 border-b border-black">
                            <div className="col-span-3 label-mono text-black">Agent</div>
                            <div className="col-span-4 label-mono text-black">Task</div>
                            <div className="col-span-3 label-mono text-black">Model</div>
                            <div className="col-span-2 label-mono text-black text-right">Status</div>
                        </div>
                        {/* Table Rows */}
                        <div
                            className="grid grid-cols-12 gap-4 py-4 border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
                            <div className="col-span-3 body-base font-medium">Risk Manager</div>
                            <div className="col-span-4 body-base text-gray-500 truncate">Analyze Q3 SEC Filings for TSLA
                            </div>
                            <div className="col-span-3 body-small">Claude Haiku</div>
                            <div className="col-span-2 text-right">
                                <span className="label-mono text-black">Processing</span>
                            </div>
                        </div>
                        <div
                            className="grid grid-cols-12 gap-4 py-4 border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
                            <div className="col-span-3 body-base font-medium">Tech Analyst</div>
                            <div className="col-span-4 body-base text-gray-500 truncate">Compile morning sector briefing
                            </div>
                            <div className="col-span-3 body-small">GPT-4o Mini</div>
                            <div className="col-span-2 text-right">
                                <span className="label-mono text-status-green">Complete</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Layout Structural Element: Big Numbers */}
                <div>
                    <h3 className="title-3 mb-6">Big Metric</h3>
                    <div className="flex flex-col">
                        <span className="label-mono text-gray-500 mb-2">Total Platform Throughput (Tokens)</span>
                        <span className="title-display">2,045,190</span>
                    </div>
                </div>

            </div>
        </section>
    </main>

    <footer className="mt-32 pt-8 border-t border-black pb-12">
        <div className="flex justify-between items-center">
            <span className="label-mono text-black">CORTHEX v2 / System Build</span>
            <span className="label-mono text-gray-500">2026.03.10</span>
        </div>
    </footer>
    </>
  );
}

export default DesignSystem;
