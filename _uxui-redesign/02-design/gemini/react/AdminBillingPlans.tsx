"use client";
import React from "react";

const styles = `
body {
            background-color: #fcfbf9;
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

        .plan-card {
            background-color: white;
            border-radius: 1.5rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
            border: 1px solid #e8e4d9;
            transition: all 0.2s ease;
            display: flex;
            flex-direction: column;
        }

        .plan-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.05);
            border-color: #d5cfc1;
        }

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

function AdminBillingPlans() {
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

                <div className="pt-6 pb-2 px-4 text-[11px] font-bold text-base-300 uppercase tracking-wider">고객사 및 결제</div>
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-buildings text-lg"></i> Tenants
                </a>
                {/* Active menu */}
                <a href="#"
                    className="flex items-center gap-3 px-4 py-3 font-medium text-accent-terracotta bg-white rounded-xl border border-[#e8e4d9] shadow-sm transition-colors">
                    <i className="ph ph-credit-card text-lg"></i> Billing & Revenue
                </a>

                <div className="pt-6 pb-2 px-4 text-[11px] font-bold text-base-300 uppercase tracking-wider">시스템 자원 및 운영
                </div>
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-cpu text-lg"></i> Platform Metrics
                </a>

                <div className="pt-6 pb-2 px-4 text-[11px] font-bold text-base-300 uppercase tracking-wider">설정</div>
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-gear text-lg"></i> Settings
                </a>
            </nav>
        </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 overflow-y-auto relative hide-scrollbar">

        <header className="px-12 py-8 bg-[#fcfbf9] border-b border-[#e8e4d9] sticky top-0 z-10">
            <h1 className="text-3xl font-bold tracking-tight text-text-main">Billing & Revenue</h1>
            <p className="text-text-muted mt-2 text-sm">요금제별 기능 제한, 사용자당 가격 및 토큰 한도를 설정합니다.</p>

            {/* Quick Sub-nav */}
            <div className="flex gap-6 mt-8">
                <button
                    className="tab-btn pb-3 text-sm font-medium text-text-muted hover:text-text-main transition-colors">Overview</button>
                <button className="tab-btn active pb-3 text-sm font-bold text-text-main">Plans & Pricing</button>
                <button
                    className="tab-btn pb-3 text-sm font-medium text-text-muted hover:text-text-main transition-colors">Invoices</button>
                <button
                    className="tab-btn pb-3 text-sm font-medium text-text-muted hover:text-text-main transition-colors">Tax
                    & Compliance</button>
            </div>
        </header>

        <div className="px-12 py-10 bg-base-50/30">

            <div className="flex justify-between items-center mb-8">
                <h2
                    className="text-lg font-bold text-text-main border border-[#e8e4d9] bg-white px-4 py-1.5 rounded-lg shadow-sm">
                    Stripe 연결: 연동됨 <i className="ph ph-check-circle text-accent-green ml-1"></i>
                </h2>
                <div className="flex gap-3">
                    <button
                        className="px-5 py-2.5 bg-white border border-[#e8e4d9] text-text-main text-sm font-bold rounded-xl shadow-sm hover:bg-base-50 transition-colors">취소</button>
                    <button
                        className="px-5 py-2.5 bg-accent-terracotta text-white text-sm font-bold rounded-xl shadow-soft hover:bg-opacity-90 transition-colors flex items-center gap-2"><i
                            className="ph ph-floppy-disk"></i> 퍼블리시 (라이브 적용)</button>
                </div>
            </div>

            {/* Pricing Tier Editor */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">

                {/* Starter Plan */}
                <div className="plan-card">
                    <div className="p-8 border-b border-[#e8e4d9]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-xl text-text-main">Starter</h3>
                            <button className="text-text-muted hover:text-text-main"><i
                                    className="ph ph-dots-three text-xl"></i></button>
                        </div>

                        <div className="mb-6">
                            <label
                                className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Base
                                Price (Monthly)</label>
                            <div className="relative">
                                <span
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-bold">$</span>
                                <input type="text" value="49"
                                    className="w-full bg-[#fcfbf9] border border-[#e8e4d9] outline-none text-2xl font-bold pl-8 pr-4 py-2 rounded-xl text-text-main focus:border-text-main/30" />
                            </div>
                        </div>

                        <div>
                            <label
                                className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Stripe
                                Product ID</label>
                            <input type="text" value="prod_NMqk8sY2"
                                className="w-full bg-[#fcfbf9] border border-[#e8e4d9] outline-none text-xs font-mono pl-3 pr-3 py-2 rounded-lg text-text-muted"
                                readOnly />
                        </div>
                    </div>

                    <div className="p-8 flex-1 bg-white/50">
                        <h4 className="text-xs font-bold text-text-main mb-4">Features & Limits</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-text-muted">Max Members</span>
                                <input type="number" value="10"
                                    className="w-16 bg-[#fcfbf9] border border-[#e8e4d9] text-center rounded text-text-main font-bold outline-none py-1" />
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-text-muted">Max Active Agents</span>
                                <input type="number" value="5"
                                    className="w-16 bg-[#fcfbf9] border border-[#e8e4d9] text-center rounded text-text-main font-bold outline-none py-1" />
                            </div>
                            <div className="flex justify-between items-center text-sm pt-2 border-t border-[#e8e4d9]">
                                <span className="text-text-muted leading-tight">Included Tokens<br /><span
                                        className="text-[10px]">Per month</span></span>
                                <div className="flex gap-1 items-center">
                                    <input type="number" value="5"
                                        className="w-16 bg-[#fcfbf9] border border-[#e8e4d9] text-right rounded text-text-main font-bold outline-none py-1 px-2" />
                                    <span className="text-text-muted text-xs">M</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-text-muted">Overage Price / 1M</span>
                                <div
                                    className="flex gap-1 items-center bg-[#fcfbf9] border border-[#e8e4d9] px-2 rounded w-20">
                                    <span className="text-text-muted text-xs">$</span>
                                    <input type="number" value="3.5"
                                        className="w-full bg-transparent text-right text-text-main font-bold outline-none py-1" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Business Plan */}
                <div className="plan-card border-accent-blue/30 relative">
                    <div className="absolute -top-3 inset-x-0 flex justify-center">
                        <span
                            className="bg-accent-blue text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">Most
                            Popular</span>
                    </div>

                    <div className="p-8 border-b border-[#e8e4d9]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-xl text-text-main">Business Pro</h3>
                            <button className="text-text-muted hover:text-text-main"><i
                                    className="ph ph-dots-three text-xl"></i></button>
                        </div>

                        <div className="mb-6">
                            <label
                                className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Base
                                Price (Monthly)</label>
                            <div className="relative">
                                <span
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-bold">$</span>
                                <input type="text" value="299"
                                    className="w-full bg-[#fcfbf9] border border-[#e8e4d9] outline-none text-2xl font-bold pl-8 pr-4 py-2 rounded-xl text-text-main focus:border-text-main/30" />
                            </div>
                        </div>

                        <div>
                            <label
                                className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Stripe
                                Product ID</label>
                            <input type="text" value="prod_BQk9j3M1"
                                className="w-full bg-[#fcfbf9] border border-[#e8e4d9] outline-none text-xs font-mono pl-3 pr-3 py-2 rounded-lg text-text-muted"
                                readOnly />
                        </div>
                    </div>

                    <div className="p-8 flex-1 bg-white/50">
                        <h4 className="text-xs font-bold text-text-main mb-4">Features & Limits</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-text-muted">Max Members</span>
                                <input type="number" value="50"
                                    className="w-16 bg-[#fcfbf9] border border-[#e8e4d9] text-center rounded text-text-main font-bold outline-none py-1" />
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-text-muted">Max Active Agents</span>
                                <input type="number" value="25"
                                    className="w-16 bg-[#fcfbf9] border border-[#e8e4d9] text-center rounded text-text-main font-bold outline-none py-1" />
                            </div>
                            <div className="flex justify-between items-center text-sm pt-2 border-t border-[#e8e4d9]">
                                <span className="text-text-muted leading-tight">Included Tokens<br /><span
                                        className="text-[10px]">Per month</span></span>
                                <div className="flex gap-1 items-center">
                                    <input type="number" value="50"
                                        className="w-16 bg-[#fcfbf9] border border-[#e8e4d9] text-right rounded text-text-main font-bold outline-none py-1 px-2" />
                                    <span className="text-text-muted text-xs">M</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-text-muted">Overage Price / 1M</span>
                                <div
                                    className="flex gap-1 items-center bg-[#fcfbf9] border border-[#e8e4d9] px-2 rounded w-20">
                                    <span className="text-text-muted text-xs">$</span>
                                    <input type="number" value="2.5"
                                        className="w-full bg-transparent text-right text-text-main font-bold outline-none py-1" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enterprise Plan */}
                <div className="plan-card">
                    <div className="p-8 border-b border-[#e8e4d9]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-xl text-text-main flex items-center gap-2">Enterprise <i
                                    className="ph ph-buildings text-text-muted text-lg"></i></h3>
                            <button className="text-text-muted hover:text-text-main"><i
                                    className="ph ph-dots-three text-xl"></i></button>
                        </div>

                        <div className="mb-6">
                            <label
                                className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Custom
                                Pricing (Contact Sales)</label>
                            <div
                                className="w-full bg-[#fcfbf9] border border-[#e8e4d9] text-text-muted text-sm font-bold px-4 py-3 rounded-xl flex justify-center opacity-70">
                                영업팀 협의 (Custom)
                            </div>
                        </div>

                        <div>
                            <label
                                className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Stripe
                                Product Category</label>
                            <input type="text" value="Enterprise / Negotiated"
                                className="w-full bg-[#fcfbf9] border border-[#e8e4d9] outline-none text-xs pl-3 pr-3 py-2 rounded-lg text-text-muted"
                                readOnly />
                        </div>
                    </div>

                    <div className="p-8 flex-1 bg-white/50">
                        <h4 className="text-xs font-bold text-text-main mb-4">Features & Limits</h4>
                        <div className="space-y-4">
                            <div className="flex items-start gap-2 text-sm text-text-main font-medium">
                                <i className="ph ph-check-circle text-accent-green mt-0.5"></i> 무제한 사용자 멤버 (SSO 지원)
                            </div>
                            <div className="flex items-start gap-2 text-sm text-text-main font-medium">
                                <i className="ph ph-check-circle text-accent-green mt-0.5"></i> 무제한 에이전트 생성
                            </div>
                            <div className="flex items-start gap-2 text-sm text-text-main font-medium">
                                <i className="ph ph-check-circle text-accent-green mt-0.5"></i> 커스텀 LLM 및 로컬 모델 연동
                            </div>
                            <div className="flex items-start gap-2 text-sm text-text-main font-medium">
                                <i className="ph ph-check-circle text-accent-green mt-0.5"></i> VPC Peering 및 전용 인프라
                            </div>
                            <div className="flex items-start gap-2 text-sm text-text-main font-medium">
                                <i className="ph ph-check-circle text-accent-green mt-0.5"></i> 24/7 전담 기술 지원
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add New Button */}
                <button
                    className="col-span-1 md:col-span-3 h-20 border-2 border-dashed border-[#e8e4d9] hover:border-[#d5cfc1] rounded-2xl flex items-center justify-center gap-2 text-text-muted hover:text-text-main font-bold transition-colors bg-white/50">
                    <i className="ph ph-plus text-xl"></i> 새로운 커스텀 플랜 추가
                </button>

            </div>

        </div>

    </main>
    </>
  );
}

export default AdminBillingPlans;
