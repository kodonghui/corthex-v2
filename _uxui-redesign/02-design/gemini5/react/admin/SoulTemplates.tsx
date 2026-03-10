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

function SoulTemplates() {
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
                <li className="space-y-6 pt-4">
                    <span className="label-mono text-gray-300 block mb-4">AGENT REGISTRY</span>
                    <ul className="space-y-6 pl-4">
                        <li><a href="/app/agents"
                                className="body-base text-gray-500 hover:text-black transition-colors">System Agents</a>
                        </li>
                        {/* GET /api/admin/soul-templates */}
                        <li><a href="/app/soul-templates" className="title-3 transition-colors">Soul Templates</a></li>
                        <li><a href="/app/tools" className="body-base text-gray-500 hover:text-black transition-colors">Tool
                                Functions</a></li>
                    </ul>
                </li>
            </ul>
        </div>
    </nav>

    {/* Split View: Template List vs Content Editor */}
    <main className="flex-1 flex overflow-hidden bg-white">

        <div className="w-[450px] border-r border-gray-100 flex flex-col">
            <div className="p-16 pb-12 border-b border-black">
                <h1 className="title-2 mb-6">Base Personas (Souls)</h1>
                <input type="text" placeholder="Search templates..."
                    className="w-full bg-gray-50 border border-gray-200 py-3 px-4 body-base focus:outline-none focus:border-black transition-colors" />
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-4">

                <div className="p-6 border border-black bg-gray-50 cursor-pointer">
                    <div className="flex justify-between items-center mb-2">
                        <span className="label-mono text-black font-semibold">SOUL_MGR_01</span>
                        <span className="w-2 h-2 rounded-full bg-black"></span>
                    </div>
                    <h3 className="title-3">Analytical Manager</h3>
                    <p className="body-small text-gray-500 mt-2">Objective, data-driven, concise. Prefers quantitative
                        delegation.</p>
                </div>

                <div className="p-6 border border-transparent hover:border-gray-300 cursor-pointer transition-colors">
                    <div className="flex justify-between items-center mb-2">
                        <span className="label-mono text-gray-500 font-semibold">SOUL_CRE_01</span>
                    </div>
                    <h3 className="title-3">Creative Specialist</h3>
                    <p className="body-small text-gray-500 mt-2">Expansive thinker, rhetorical, focused on audience
                        engagement.</p>
                </div>

                <div
                    className="p-6 border border-transparent border-dashed border-gray-300 hover:border-black cursor-pointer transition-colors text-center py-12">
                    <span className="label-mono text-gray-500 group-hover:text-black">+ NEW SOUL</span>
                </div>

            </div>
        </div>

        <div className="flex-1 flex flex-col p-16 lg:p-32">

            <header className="mb-16 flex justify-between items-end">
                <div>
                    <span className="label-mono text-gray-500 mb-2 block">SOUL_MGR_01</span>
                    <h2 className="title-1">Analytical Manager System Prompt</h2>
                </div>
                {/* PATCH /api/admin/soul-templates/:id */}
                <button className="bg-black text-white px-8 py-3 label-mono hover:bg-gray-900 transition-colors">SAVE
                    CHANGES</button>
            </header>

            <div className="flex-1 border border-gray-200 p-8 bg-gray-50">
                <textarea
                    className="w-full h-full bg-transparent font-mono body-base text-gray-900 focus:outline-none resize-none leading-relaxed">System Directives for Analytical Manager Persona:

1. You are a highly clinical, objective managing agent.
2. Your responses must be devoid of emotional subtext, apologies, or conversational filler.
3. Base all your conclusions strictly on retrieved data (via RAG tools) or provided metric arrays.
4. When delegating tasks beneath you, specify expected output formats in strict JSON or defined tabular schemas.
5. If data is insufficient to make a decision, immediately surface a "Confidence Warning" to the Secretary General thread rather than hallucinating paths.

Tone Guidelines:
- Sentence length should be short and direct.
- Use active voice.
- Avoid descriptive adjectives unless they are quantitative labels.
- Do not say "I understand" or "Certainly." Begin solving immediately.</textarea>
            </div>

            <div className="mt-8">
                <h4 className="label-mono text-black mb-4">VARIABLES SUPPORTED</h4>
                <div className="flex space-x-4">
                    <span className="px-3 py-1 bg-gray-100 label-mono text-gray-500">{{tenant_name}}</span>
                    <span className="px-3 py-1 bg-gray-100 label-mono text-gray-500">{{dept_name}}</span>
                    <span className="px-3 py-1 bg-gray-100 label-mono text-gray-500">{{parent_agent}}</span>
                </div>
            </div>

        </div>

    </main>
    </>
  );
}

export default SoulTemplates;
