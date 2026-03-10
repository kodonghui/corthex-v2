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

        /* Specific classified styling */
        .bg-classified {
            background-color: #050505;
            color: #fff;
        }

        .border-classified {
            border-color: #333;
        }

        .text-classified-dim {
            color: #888;
        }

        .accent-classified {
            color: #fff;
            background: #222;
        }
`;

function Classified() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Global Nav (Dark mode variant) */}
    <nav className="w-64 border-r border-classified flex flex-col justify-between py-8 px-6 flex-shrink-0">
        <div>
            <div className="mb-16">
                <span className="title-2 tracking-tighter text-white">CORTHEX</span>
                <span className="label-mono ml-2 text-classified-dim">v2</span>
            </div>

            <ul className="space-y-6">
                <li><a href="/app/home"
                        className="body-base text-classified-dim hover:text-white transition-colors">Home</a></li>
                {/* GET /api/workspace/classified (Restricted) */}
                <li className="pt-6 border-t border-classified mt-6"><a href="/app/classified"
                        className="title-3 font-medium transition-colors border-l-2 border-white pl-4 text-white">Classified
                        Ops</a></li>
            </ul>
        </div>

        <div className="space-y-6 border-t border-classified pt-6">
            <span className="label-mono text-status-red flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-status-red animate-pulse"></div>RESTRICTED LAYER
            </span>
        </div>
    </nav>

    <main className="flex-1 overflow-y-auto p-12 lg:p-24 relative">

        <header className="mb-24 flex justify-between items-end border-b border-classified pb-8">
            <div>
                <h1 className="title-display mb-2 text-white">Classified Operations</h1>
                <p className="body-base text-classified-dim">
                    Root-level direct intervention, emergency halting, and sensitive data access. Proceed with extreme
                    caution.
                </p>
            </div>
            <div className="label-mono text-white border border-classified px-4 py-2">ROOT ACCESS VERIFIED</div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">

            {/* Nuclear Options */}
            <section>
                <h2 className="label-mono text-white mb-8">Emergency Protocols</h2>

                <div className="space-y-6">
                    {/* POST /api/workspace/admin/halt-all */}
                    <div
                        className="border border-classified p-8 hover:border-status-red transition-colors group cursor-pointer bg-[#111]">
                        <h3 className="title-2 mb-2 text-white">KILL SWITCH: Halt All Agents</h3>
                        <p className="body-small text-classified-dim mb-6">Immediately terminate all running jobs, freeze
                            agent context, and sever external API connections. Requires manual DBA intervention to
                            restart.</p>
                        <button
                            className="label-mono text-status-red border border-status-red px-6 py-2 w-full hover:bg-status-red hover:text-white transition-colors">INITIATE
                            GLOBAL HALT</button>
                    </div>

                    {/* POST /api/workspace/knowledge/purge */}
                    <div
                        className="border border-classified p-8 hover:border-white transition-colors group cursor-pointer bg-[#0a0a0a]">
                        <h3 className="title-2 mb-2 text-white">Purge Vector DB</h3>
                        <p className="body-small text-classified-dim mb-6">Wipe all embedded knowledge bases across all
                            namespaces. This will cause total memory loss for the swarm.</p>
                        <button
                            className="label-mono text-white border border-classified px-6 py-2 w-full hover:bg-white hover:text-black transition-colors">INITIATE
                            PURGE</button>
                    </div>
                </div>
            </section>

            {/* Raw Directives / System Prompts Override */}
            <section>
                <h2 className="label-mono text-white mb-8 border-b border-classified pb-4">Global Cortex Directive Override
                </h2>
                <p className="body-base text-classified-dim mb-6">Inject a tier-0 system prompt that overrides all
                    departmental and agent-specific parameters.</p>

                {/* PATCH /api/workspace/settings/global-directive */}
                <textarea
                    className="w-full h-64 border border-classified bg-[#0a0a0a] p-6 body-base text-white font-mono focus:outline-none focus:border-white transition-colors resize-none placeholder-classified-dim"
                    placeholder="Enter root directive here (e.g., 'Halt all trading operations and assume defensive posture across all accounts immediately.')"></textarea>

                <div className="mt-6 flex justify-end">
                    <button className="bg-white text-black px-8 py-3 label-mono hover:bg-gray-300 transition-colors">FORCE
                        INJECT</button>
                </div>
            </section>

        </div>

    </main>
    </>
  );
}

export default Classified;
