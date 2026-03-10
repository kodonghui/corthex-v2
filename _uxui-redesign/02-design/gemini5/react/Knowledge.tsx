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

function Knowledge() {
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
            </ul>
        </div>

        <div className="space-y-6">
            <ul className="space-y-6 pb-6 border-b border-gray-100">
                <li><a href="/app/agents" className="body-small hover:text-black transition-colors">Agents</a></li>
                {/* GET /api/workspace/knowledge/collections */}
                <li><a href="/app/knowledge"
                        className="title-3 font-medium transition-colors border-l-2 border-black pl-4">Knowledge Base</a>
                </li>
                {/* GET /api/workspace/files */}
                <li><a href="/app/files" className="body-small hover:text-black transition-colors pl-4">Files & Assets</a>
                </li>
                <li><a href="/app/costs" className="body-small hover:text-black transition-colors mt-4">Costs</a></li>
            </ul>
        </div>
    </nav>

    <main className="flex-1 overflow-y-auto p-12 lg:p-24 relative bg-white">

        <header className="mb-24 flex justify-between items-end">
            <div>
                <h1 className="title-display mb-6">RAG Memory</h1>
                <p className="body-base max-w-2xl text-gray-500">
                    Vectorized domain context available to all agents. Collections dictate access scopes.
                </p>
            </div>
            {/* POST /api/workspace/knowledge/collections */}
            <button className="bg-black text-white px-6 py-3 label-mono hover:bg-gray-900 transition-colors">+ NEW
                COLLECTION</button>
        </header>

        {/* Stats Grid (GET /api/workspace/knowledge/stats) */}
        <div className="grid grid-cols-3 gap-8 mb-24 pb-8 border-b border-gray-100">
            <div>
                <span className="label-mono text-gray-300 block mb-2">VECTORIZED CHUNKS</span>
                <span className="title-2">1,245,901</span>
            </div>
            <div>
                <span className="label-mono text-gray-300 block mb-2">TOTAL STORAGE</span>
                <span className="title-2">4.2 GB</span>
            </div>
            <div>
                <span className="label-mono text-gray-300 block mb-2">LAST EMBEDDING MODEL</span>
                <span className="body-base font-semibold pt-1">text-embedding-3-small</span>
            </div>
        </div>

        {/* Collections / Namespaces */}
        <h2 className="label-mono text-black mb-8">Namespaces (GET /api/workspace/knowledge/collections)</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            <div className="border border-gray-200 p-8 hover:border-black transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-6">
                    <span className="label-mono text-gray-900 px-2 py-1 bg-gray-100">NS_GLOBAL_PARAMS</span>
                    <span className="label-mono text-gray-300 group-hover:text-black transition-colors">EDIT</span>
                </div>
                <h3 className="title-2 mb-2">Company Core Values</h3>
                <p className="body-small text-gray-500 mb-8">Base behavioral constraints for all outgoing content and
                    internal debate resolution protocols.</p>
                <div className="border-t border-gray-100 pt-4 flex justify-between">
                    <span className="label-mono text-black">Sources: 3</span>
                    <span className="label-mono text-gray-500">Global Read</span>
                </div>
            </div>

            <div className="border border-gray-200 p-8 hover:border-black transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-6">
                    <span className="label-mono text-gray-900 px-2 py-1 bg-gray-100">NS_FINANCE_H1</span>
                    <span className="label-mono text-gray-300 group-hover:text-black transition-colors">EDIT</span>
                </div>
                <h3 className="title-2 mb-2">Q3 Regulatory Filings</h3>
                <p className="body-small text-gray-500 mb-8">Ingested 10-Q and 10-K filings for major tech equities. Highly
                    factual.</p>
                <div className="border-t border-gray-100 pt-4 flex justify-between">
                    <span className="label-mono text-black">Sources: 840</span>
                    <span className="label-mono text-gray-500">Dept: Strategy</span>
                </div>
            </div>

            <div className="border border-gray-200 p-8 hover:border-black transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-6">
                    <span className="label-mono text-gray-900 px-2 py-1 bg-gray-100">NS_COMPETITIVE</span>
                    <span className="label-mono text-status-red animate-pulse px-2 py-1 border border-status-red">SYNC
                        ERR</span>
                </div>
                <h3 className="title-2 mb-2">Competitor Blogs</h3>
                <p className="body-small text-gray-500 mb-8">Daily RSS scrapes of Competitor A & B marketing materials.</p>
                <div className="border-t border-gray-100 pt-4 flex justify-between">
                    <span className="label-mono text-black">Sources: 42</span>
                    <span className="label-mono text-gray-500">Job: Scraping</span>
                </div>
            </div>

        </div>

        {/* Testing Vector Memory */}
        <div className="mt-24 p-12 bg-gray-50 border border-black">
            <h2 className="title-2 mb-2">Semantic Search Simulator</h2>
            <p className="body-small text-gray-500 mb-8">Test retrieval accuracy across namespaces.</p>

            <div className="flex space-x-4 mb-8">
                <input type="text" placeholder="Query: What is the company stance on aggressive trading?"
                    className="flex-1 bg-white border-b border-black py-4 body-base focus:outline-none placeholder-gray-300" />
                <select className="w-64 bg-transparent border-b border-black body-base focus:outline-none rounded-none">
                    <option>Namespace: ALL</option>
                    <option>NS_GLOBAL_PARAMS</option>
                </select>
                {/* POST /api/workspace/knowledge/search */}
                <button
                    className="bg-black text-white px-8 label-mono hover:bg-gray-900 transition-colors">RETRIEVE</button>
            </div>

            <div className="border border-gray-300 p-8 bg-white opacity-50">
                <span className="label-mono text-gray-300 block mb-4">Awaiting Query...</span>
            </div>
        </div>

    </main>
    </>
  );
}

export default Knowledge;
