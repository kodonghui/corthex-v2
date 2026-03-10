"use client";
import React from "react";

const styles = `
body {
            background-color: #f5f3ec;
            color: #2c2c2c;
            -ms-overflow-style: none;
            scrollbar-width: none;
        }

        body::-webkit-scrollbar {
            display: none;
        }

        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }

        .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }

        .panel {
            background-color: white;
            border-radius: 1.5rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
            border: 1px solid #e8e4d9;
        }

        /* Tabs Activity indication */
        .tab-btn {
            position: relative;
        }

        .tab-btn.active::after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            right: 0;
            height: 2px;
            background-color: #2c2c2c;
        }
`;

function AdminTenantDetail() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Admin Sidebar */}
    <aside className="w-72 flex flex-col justify-between py-8 px-6 border-r border-[#e8e4d9] bg-[#fcfbf9] z-20 shrink-0">
        <div>
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                    <div
                        className="w-8 h-8 rounded-full bg-text-main flex items-center justify-center text-white font-bold text-lg">
                        A</div>
                    <span className="text-xl font-bold tracking-tight text-text-main">Admin</span>
                </div>
            </div>

            <nav className="space-y-1.5">
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-gauge text-lg"></i> Global Dashboard
                </a>

                <div className="pt-6 pb-2 px-4 text-[11px] font-bold text-base-300 uppercase tracking-wider">고객사 및 결제</div>
                {/* Active menu */}
                <a href="#"
                    className="flex items-center gap-3 px-4 py-3 font-medium text-accent-terracotta bg-white rounded-xl border border-[#e8e4d9] shadow-sm transition-colors">
                    <i className="ph ph-buildings text-lg"></i> Tenants
                </a>
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-credit-card text-lg"></i> Billing
                </a>

                <div className="pt-6 pb-2 px-4 text-[11px] font-bold text-base-300 uppercase tracking-wider">시스템 설정</div>
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-gear text-lg"></i> Platform Settings
                </a>
            </nav>
        </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 overflow-y-auto relative hide-scrollbar">

        {/* Breadcrumb & Top Actions */}
        <div
            className="px-12 py-6 flex justify-between items-center bg-[#fcfbf9] border-b border-[#e8e4d9] sticky top-0 z-10">
            <div className="flex items-center gap-2 text-sm text-text-muted font-medium">
                <a href="#" className="hover:text-text-main transition-colors">Tenants</a>
                <i className="ph ph-caret-right text-xs"></i>
                <span className="text-text-main">MegaCorp AI Ltd.</span>
            </div>

            <div className="flex gap-2">
                <button
                    className="bg-white border border-[#e8e4d9] text-text-main px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-base-50 transition-colors flex items-center gap-2">
                    <i className="ph ph-envelope-simple"></i> 연락하기
                </button>
            </div>
        </div>

        <div className="px-12 py-10 max-w-6xl">

            {/* Tenant Header Card (API: GET /api/admin/tenants/:id) */}
            <div className="panel p-8 mb-8 flex justify-between items-start">
                <div className="flex items-center gap-6">
                    <div
                        className="w-20 h-20 rounded-2xl bg-text-main text-white flex items-center justify-center text-3xl font-bold shadow-soft">
                        M</div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-bold tracking-tight text-text-main">MegaCorp AI Ltd.</h1>
                            <span
                                className="px-2.5 py-1 rounded bg-accent-green/10 text-accent-green text-xs font-bold uppercase tracking-wider">Active</span>
                        </div>
                        <p className="text-text-muted font-mono text-sm">Tenant ID: ten_8x9a2_mcorp | Created: Oct 2024</p>

                        <div className="flex gap-6 mt-4">
                            <div className="text-sm">
                                <span className="text-text-muted font-bold mr-1">Owner:</span>
                                <span className="text-text-main">David Kim (david@megacorp.com)</span>
                            </div>
                            <div className="text-sm">
                                <span className="text-text-muted font-bold mr-1">Domain:</span>
                                <span
                                    className="text-text-main underline decoration-base-200 underline-offset-4">megacorp.com</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Current Plan</div>
                    <div
                        className="text-xl font-bold text-text-main border border-[#e8e4d9] px-4 py-2 rounded-xl inline-block shadow-sm">
                        Enterprise</div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-8 border-b border-[#e8e4d9] mb-8">
                <button className="tab-btn active pb-4 text-sm font-bold text-text-main">Overview</button>
                <button
                    className="tab-btn pb-4 text-sm font-medium text-text-muted hover:text-text-main transition-colors">Members
                    (1,240)</button>
                <button
                    className="tab-btn pb-4 text-sm font-medium text-text-muted hover:text-text-main transition-colors">Agents
                    (342)</button>
                <button
                    className="tab-btn pb-4 text-sm font-medium text-text-muted hover:text-text-main transition-colors">Billing
                    & Usage</button>
                <button
                    className="tab-btn pb-4 text-sm font-medium text-accent-coral hover:text-red-600 transition-colors">Danger
                    Zone</button>
            </div>

            {/* Tab Content: Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                <div className="lg:col-span-2 space-y-8">
                    {/* Resource Limits & Usage */}
                    <div className="panel p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-text-main text-lg">Resource Allowance & Limits</h3>
                            <button
                                className="text-xs font-bold text-accent-terracotta border border-accent-terracotta/30 px-3 py-1.5 rounded-lg hover:bg-accent-terracotta/5 transition-colors">한도
                                수정</button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-sm font-bold text-text-muted">Monthly LLM Token Usage</span>
                                    <span className="text-sm font-mono font-bold text-text-main">1.2B / 2B Tokens</span>
                                </div>
                                <div className="w-full h-2 bg-base-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-accent-blue rounded-full" style={{width: "60%"}}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-sm font-bold text-text-muted">Active Agents Quota</span>
                                    <span className="text-sm font-mono font-bold text-text-main">342 / 500 Agents</span>
                                </div>
                                <div className="w-full h-2 bg-base-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-accent-green rounded-full" style={{width: "68%"}}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-sm font-bold text-text-muted">Cloud Storage (Vector DB &
                                        Files)</span>
                                    <span className="text-sm font-mono font-bold text-text-main">4.2 TB / 10 TB</span>
                                </div>
                                <div className="w-full h-2 bg-base-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-text-main rounded-full" style={{width: "42%"}}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Revenue Insights */}
                    <div className="panel p-6 bg-[#fcfbf9]">
                        <h3 className="font-bold text-text-main mb-4 flex items-center gap-2"><i className="ph ph-receipt"></i>
                            Monthly Revenue (MRR)</h3>
                        <div className="text-4xl font-bold text-text-main mb-2 font-mono">$12,500</div>
                        <p className="text-xs text-text-muted mb-6">결제일: 매월 1일 (Stripe 자동 결제)</p>

                        <div className="space-y-3 pt-4 border-t border-[#e8e4d9]">
                            <div className="flex justify-between text-sm">
                                <span className="text-text-muted">Base License</span>
                                <span className="font-mono font-bold">$10,000</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-muted">Overages (Tokens)</span>
                                <span className="font-mono font-bold text-accent-coral">+$2,500</span>
                            </div>
                        </div>
                    </div>

                    {/* Meta Information */}
                    <div className="panel p-6">
                        <h3 className="font-bold text-text-main mb-4">Workspace Settings</h3>
                        <div className="space-y-4">
                            <div>
                                <span
                                    className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Region</span>
                                <span className="text-sm font-medium text-text-main">ap-northeast-2 (Seoul)</span>
                            </div>
                            <div>
                                <span
                                    className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">SSO
                                    Enforced</span>
                                <span className="text-sm font-bold text-accent-green flex items-center gap-1"><i
                                        className="ph ph-check-circle"></i> Enabled (SAML)</span>
                            </div>
                            <div>
                                <span
                                    className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Dedicated
                                    Infrastructure</span>
                                <span className="text-sm font-bold text-text-main">Yes (VPC Peering Active)</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </div>

    </main>
    </>
  );
}

export default AdminTenantDetail;
