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

function Departments() {
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
                    <span className="label-mono text-gray-300 block mb-4">TENANT MANAGEMENT</span>
                    <ul className="space-y-6 pl-4">
                        <li><a href="/app/companies"
                                className="body-base text-gray-500 hover:text-black transition-colors">Companies</a></li>
                        <li><a href="/app/users"
                                className="body-base text-gray-500 hover:text-black transition-colors">Global Users</a></li>
                    </ul>
                </li>
                <li className="space-y-6 pt-4">
                    <span className="label-mono text-gray-300 block mb-4">ORG STRUCTURES</span>
                    <ul className="space-y-6 pl-4">
                        {/* GET /api/admin/departments */}
                        <li><a href="/app/departments" className="title-3 transition-colors">Dept Templates</a></li>
                        <li><a href="/app/org-templates"
                                className="body-base text-gray-500 hover:text-black transition-colors">Org Chart Presets</a>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
    </nav>

    <main className="flex-1 overflow-y-auto p-16 lg:p-32 bg-white">

        <header className="mb-32 flex justify-between items-end">
            <div>
                <h1 className="title-display mb-8">Department Templates</h1>
                <p className="body-base max-w-2xl text-gray-500">
                    System-provided structural units that tenants can clone into their workspaces. Each template comes
                    with pre-configured agent roles and communication rules.
                </p>
            </div>
            <button className="bg-black text-white px-8 py-4 label-mono hover:bg-gray-900 transition-colors">CREATE NEW
                TEMPLATE</button>
        </header>

        {/* Templates Grid (GET /api/admin/departments/templates) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-24">

            {/* Strategy Template */}
            <div className="flex flex-col">
                <div className="mb-8">
                    <span className="label-mono text-gray-500 block mb-2">TPL-FIN-01</span>
                    <h2 className="title-1 tracking-tight">Investment Strategy</h2>
                </div>

                <p className="body-base text-gray-500 mb-12 flex-1">
                    Standard financial analysis department. Includes a Manager, Macro Economist, and Technical Analyst.
                    Configured to monitor market news and generate portfolio adjustments.
                </p>

                <div className="space-y-4 mb-12">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="body-small text-black font-medium">Chief Investment Officer</span>
                        <span className="label-mono text-gray-300">MANAGER</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="body-small text-gray-500">Macro Economist</span>
                        <span className="label-mono text-gray-300">SPECIALIST</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="body-small text-gray-500">Technical Analyst</span>
                        <span className="label-mono text-gray-300">SPECIALIST</span>
                    </div>
                </div>

                <div className="flex justify-between items-center text-label-mono text-gray-500 pt-4 border-t border-black">
                    <span>Adoption: 82% of Tenants</span>
                    <button className="hover:text-black transition-colors">EDIT SPEC</button>
                </div>
            </div>

            {/* Marketing Template */}
            <div className="flex flex-col">
                <div className="mb-8">
                    <span className="label-mono text-gray-500 block mb-2">TPL-MKT-01</span>
                    <h2 className="title-1 tracking-tight">Marketing & SNS</h2>
                </div>

                <p className="body-base text-gray-500 mb-12 flex-1">
                    Content generation and audience engagement pod. Pre-linked to SNS Draft/Approval workflows.
                </p>

                <div className="space-y-4 mb-12">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="body-small text-black font-medium">Brand Director</span>
                        <span className="label-mono text-gray-300">MANAGER</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="body-small text-gray-500">Social Poster</span>
                        <span className="label-mono text-gray-300">WORKER</span>
                    </div>
                </div>

                <div className="flex justify-between items-center text-label-mono text-gray-500 pt-4 border-t border-black">
                    <span>Adoption: 45% of Tenants</span>
                    <button className="hover:text-black transition-colors">EDIT SPEC</button>
                </div>
            </div>

            {/* Eng Template */}
            <div className="flex flex-col opacity-60 hover:opacity-100 transition-opacity">
                <div className="mb-8">
                    <span className="label-mono text-gray-500 block mb-2">TPL-ENG-02 (DRAFT)</span>
                    <h2 className="title-1 tracking-tight">Data Engineering</h2>
                </div>

                <p className="body-base text-gray-500 mb-12 flex-1">
                    Specializes in scraping, cleaning, and formatting large unstructured datasets for RAG ingestion.
                </p>

                <div className="space-y-4 mb-12">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="body-small text-black font-medium">Head of Data</span>
                        <span className="label-mono text-gray-300">MANAGER</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="body-small text-gray-500">Scraper Bot</span>
                        <span className="label-mono text-gray-300">SCRIPTED TOOL</span>
                    </div>
                </div>

                <div className="flex justify-between items-center text-label-mono text-gray-500 pt-4 border-t border-black">
                    <span>Not publicly available</span>
                    <button
                        className="text-black bg-gray-100 px-3 py-1 hover:bg-black hover:text-white transition-colors">PUBLISH</button>
                </div>
            </div>

        </div>

    </main>
    </>
  );
}

export default Departments;
