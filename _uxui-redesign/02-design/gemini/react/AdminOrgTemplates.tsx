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
`;

function AdminOrgTemplates() {
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
                    <span className="text-xl font-bold tracking-tight text-text-main">Admin Console</span>
                </div>
            </div>

            <nav className="space-y-1.5">
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-gauge text-lg"></i> Global Dashboard
                </a>

                <div className="pt-6 pb-2 px-4 text-[11px] font-bold text-base-300 uppercase tracking-wider">조직 템플릿 및 설정
                </div>
                {/* Active menu */}
                <a href="#"
                    className="flex items-center gap-3 px-4 py-3 font-medium text-accent-terracotta bg-white rounded-xl border border-[#e8e4d9] shadow-sm transition-colors">
                    <i className="ph ph-copy text-lg"></i> Org Templates
                </a>
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-briefcase text-lg"></i> Departments
                </a>
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-key text-lg"></i> API Credentials
                </a>

                <div className="pt-6 pb-2 px-4 text-[11px] font-bold text-base-300 uppercase tracking-wider">비용 및 리소스</div>
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-coins text-lg"></i> Billing & Costs
                </a>
            </nav>
        </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 overflow-y-auto px-12 py-10 relative hide-scrollbar">

        <header
            className="flex justify-between items-end mb-8 sticky top-0 bg-[#f5f3ec]/90 backdrop-blur-md z-10 pt-2 pb-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-text-main">Organization Templates (Presets)</h1>
                <p className="text-text-muted mt-2 text-sm">신규 테넌트 온보딩 시 클릭 한 번으로 생성할 수 있는 "전체 부서 통합" 조직 프리셋을 관리합니다.</p>
            </div>

            <div className="flex items-center gap-3">
                <button
                    className="bg-text-main text-white px-5 py-2.5 flex items-center gap-2 rounded-xl text-sm font-bold shadow-soft hover:bg-opacity-90 transition-colors">
                    <i className="ph ph-plus-circle text-lg"></i> Create Preset
                </button>
            </div>
        </header>

        {/* Template Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">

            {/* Standard Full Org */}
            <div
                className="panel p-0 overflow-hidden flex flex-col group cursor-pointer hover:border-text-main/50 transition-colors">
                <div className="bg-[#fcfbf9] p-6 border-b border-[#e8e4d9] relative">
                    <div
                        className="absolute top-4 right-4 bg-base-200 text-text-main px-2 py-1 rounded text-[10px] font-bold uppercase">
                        Default</div>

                    <div
                        className="w-14 h-14 rounded-2xl bg-white border border-[#e8e4d9] flex items-center justify-center text-2xl shadow-sm mb-4">
                        <i className="ph ph-buildings"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-text-main">Standard SME Org V2</h2>
                    <p className="text-sm text-text-muted mt-2">일반적인 중소기업(SME)을 위한 표준 마케팅, 재무, R&D 부서 구성 패키지입니다.</p>
                </div>

                <div className="p-6 bg-white flex-1">
                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">Includes 3 Departments
                    </h4>

                    <div className="space-y-3">
                        <div
                            className="flex items-center justify-between p-3 rounded-xl border border-[#e8e4d9] bg-[#fcfbf9]">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-lg bg-[#fff5f2] text-accent-terracotta flex items-center justify-center">
                                    <i className="ph ph-megaphone text-lg"></i></div>
                                <div>
                                    <span className="font-bold text-text-main text-sm">Marketing Team</span>
                                    <p className="text-[10px] text-text-muted">4 Agents (CMO, Content, SEO, Social)</p>
                                </div>
                            </div>
                            <span className="text-text-muted"><i className="ph ph-check-circle"></i></span>
                        </div>

                        <div
                            className="flex items-center justify-between p-3 rounded-xl border border-[#e8e4d9] bg-[#fcfbf9]">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-lg bg-[#f0f9f4] text-accent-green flex items-center justify-center">
                                    <i className="ph ph-calculator text-lg"></i></div>
                                <div>
                                    <span className="font-bold text-text-main text-sm">Finance Team</span>
                                    <p className="text-[10px] text-text-muted">2 Agents (CFO, Bookkeeper)</p>
                                </div>
                            </div>
                            <span className="text-text-muted"><i className="ph ph-check-circle"></i></span>
                        </div>

                        <div
                            className="flex items-center justify-between p-3 rounded-xl border border-[#e8e4d9] bg-[#fcfbf9]">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-lg bg-base-100 text-text-main flex items-center justify-center">
                                    <i className="ph ph-code text-lg"></i></div>
                                <div>
                                    <span className="font-bold text-text-main text-sm">Dev / R&D Team</span>
                                    <p className="text-[10px] text-text-muted">3 Agents (CTO, Backend, QA)</p>
                                </div>
                            </div>
                            <span className="text-text-muted"><i className="ph ph-check-circle"></i></span>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-[#fcfbf9] border-t border-[#e8e4d9] flex justify-between items-center px-6">
                    <span className="text-xs text-text-muted">Used by 42 Tenants</span>
                    <button
                        className="text-sm font-bold text-text-main hover:underline group-hover:text-accent-blue transition-colors">Edit
                        Template</button>
                </div>
            </div>

            {/* Investment Firm Org */}
            <div
                className="panel p-0 overflow-hidden flex flex-col group cursor-pointer hover:border-text-main/50 transition-colors">
                <div className="bg-[#f0f9f4] p-6 border-b border-[#e8e4d9] relative">
                    <div
                        className="absolute top-4 right-4 bg-accent-green/20 text-accent-green px-2 py-1 rounded text-[10px] font-bold uppercase">
                        Popular</div>

                    <div
                        className="w-14 h-14 rounded-2xl bg-white border border-[#e8e4d9] flex items-center justify-center text-accent-green text-2xl shadow-sm mb-4">
                        <i className="ph ph-chart-line-up"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-accent-green">Quant Trading Firm V3</h2>
                    <p className="text-sm text-text-muted mt-2">전문 투자자 및 자산운용사를 위한 분석, 증권 자동매매 통합 조직 패키지입니다.</p>
                </div>

                <div className="p-6 bg-white flex-1">
                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">Includes 2 Departments
                    </h4>

                    <div className="space-y-3">
                        <div
                            className="flex items-center justify-between p-3 rounded-xl border border-accent-green/30 bg-[#f0f9f4]">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-lg bg-white text-accent-green flex items-center justify-center">
                                    <i className="ph ph-trend-up text-lg"></i></div>
                                <div>
                                    <span className="font-bold text-accent-green text-sm flex items-center gap-1">CIO
                                        Advisory</span>
                                    <p className="text-[10px] text-text-muted">4 Agents (CIO, Macro, Tech, Quant)</p>
                                </div>
                            </div>
                            <span className="text-accent-green"><i className="ph ph-check-circle"></i></span>
                        </div>

                        <div
                            className="flex items-center justify-between p-3 rounded-xl border border-accent-coral/30 bg-[#fdf5f5]">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-lg bg-white text-accent-coral flex items-center justify-center">
                                    <i className="ph ph-lightning text-lg"></i></div>
                                <div>
                                    <span className="font-bold text-accent-coral text-sm">Execution Engine</span>
                                    <p className="text-[10px] text-accent-coral/70">1 Agent (VECTOR KIS Trader)</p>
                                </div>
                            </div>
                            <span className="text-accent-coral"><i className="ph ph-check-circle"></i></span>
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#e8e4d9] text-xs text-text-muted">
                            <i className="ph ph-warning-circle text-accent-amber mr-1"></i> Requires SEC API Keys
                            provisioning in Tenant Settings.
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-[#fcfbf9] border-t border-[#e8e4d9] flex justify-between items-center px-6">
                    <span className="text-xs text-text-muted">Used by 18 Tenants</span>
                    <button
                        className="text-sm font-bold text-text-main hover:underline group-hover:text-accent-blue transition-colors">Edit
                        Template</button>
                </div>
            </div>

        </div>

    </main>
    </>
  );
}

export default AdminOrgTemplates;
