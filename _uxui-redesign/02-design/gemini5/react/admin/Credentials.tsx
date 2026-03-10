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
<nav className="w-72 flex flex-col justify-between py-12 px-10 flex-shrink-0 bg-gray-50">
        <div>
            <div className="mb-24 flex items-center">
                <span className="title-2 tracking-tighter">CORTHEX</span>
                <span className="label-mono ml-3 text-status-red bg-red-50 px-2 py-1">ADMIN</span>
            </div>

            <ul className="space-y-10">
                <li><a href="/app/dashboard" className="body-base text-gray-500 hover:text-black transition-colors">Platform
                        Overview</a></li>
                <li className="space-y-6">
                    <span className="label-mono text-gray-300 block mb-4">ACCESS</span>
                    <ul className="space-y-6 pl-4">
                        {/* GET /api/admin/credentials */}
                        <li><a href="/app/credentials" className="title-3 transition-colors">System Credentials</a></li>
                        <li><a href="/app/api-keys"
                                className="body-base text-gray-500 hover:text-black transition-colors">Platform API Keys</a>
                        </li>
                        <li><a href="/app/employees"
                                className="body-base text-gray-500 hover:text-black transition-colors">Internal Staff</a>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
    </nav>

    <main className="flex-1 overflow-y-auto p-16 lg:p-32 bg-white">

        <header className="mb-32 flex justify-between items-end border-b border-black pb-8">
            <div>
                <h1 className="title-display mb-6">Core Infrastructure Keys</h1>
                <p className="body-base max-w-2xl text-gray-500">
                    Keys utilized by the CORTHEX v2 platform itself to connect to LLM providers, cloud infrastructure,
                    and core global APIs. (Not tenant keys).
                </p>
            </div>
            {/* POST /api/admin/credentials */}
            <button className="label-mono bg-black text-white px-8 py-4 hover:bg-gray-900 transition-colors">+ INJECT
                KEY</button>
        </header>

        <div className="grid grid-cols-1 gap-12 max-w-5xl">

            {/* GET /api/admin/credentials list */}
            <div
                className="border border-gray-100 p-12 hover:border-black transition-colors group relative flex justify-between items-center">
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-black"></div>
                <div>
                    <div className="flex items-center space-x-4 mb-4">
                        <span className="label-mono bg-gray-100 text-black px-2 py-1 block w-max">LLM_PROVIDER</span>
                        <span className="label-mono text-gray-500 flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-status-green rounded-full"></div>VALID
                        </span>
                    </div>
                    <h3 className="title-2 mb-2">Anthropic API Master</h3>
                    <p className="body-small text-gray-500 font-mono tracking-widest">sk-ant-api03...<span
                            className="text-gray-300">b4f8</span></p>
                </div>
                <div className="text-right">
                    <span className="label-mono text-gray-300 block mb-2">LAST ROTATED</span>
                    <span className="body-base">Oct 1, 2026</span>
                    <button className="label-mono text-status-red block mt-4 hover:text-black">ROTATE NOW</button>
                </div>
            </div>

            <div
                className="border border-gray-100 p-12 hover:border-black transition-colors group relative flex justify-between items-center">
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-black"></div>
                <div>
                    <div className="flex items-center space-x-4 mb-4">
                        <span className="label-mono bg-gray-100 text-black px-2 py-1 block w-max">LLM_PROVIDER</span>
                        <span className="label-mono text-gray-500 flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-status-green rounded-full"></div>VALID
                        </span>
                    </div>
                    <h3 className="title-2 mb-2">OpenAI Organization Default</h3>
                    <p className="body-small text-gray-500 font-mono tracking-widest">sk-proj-7a...<span
                            className="text-gray-300">9c11</span></p>
                </div>
                <div className="text-right">
                    <span className="label-mono text-gray-300 block mb-2">LAST ROTATED</span>
                    <span className="body-base">Sep 15, 2026</span>
                    <button className="label-mono text-status-red block mt-4 hover:text-black">ROTATE NOW</button>
                </div>
            </div>

            <div
                className="border border-status-red p-12 hover:border-black transition-colors group relative flex justify-between items-center bg-red-50/10">
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-status-red animate-pulse"></div>
                <div>
                    <div className="flex items-center space-x-4 mb-4">
                        <span className="label-mono bg-status-red text-white px-2 py-1 block w-max">DATA_PROVIDER</span>
                        <span className="label-mono text-status-red flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-status-red rounded-full"></div>EXPIRED
                        </span>
                    </div>
                    <h3 className="title-2 mb-2">Bloomberg Terminal Service Auth</h3>
                    <p className="body-small text-gray-500 font-mono tracking-widest">bx-svc-x9...<span
                            className="text-gray-300">0e00</span></p>
                </div>
                <div className="text-right">
                    <span className="label-mono text-gray-300 block mb-2">LAST ATTEMPT</span>
                    <span className="body-base">2m ago</span>
                    <button className="label-mono text-black block mt-4 border-b border-black">UPDATE CREDENTIAL</button>
                </div>
            </div>

        </div>

    </main>
    </>
  );
}

export default Credentials;
