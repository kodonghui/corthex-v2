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

function AdminApiKeys() {
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

                <div className="pt-6 pb-2 px-4 text-[11px] font-bold text-base-300 uppercase tracking-wider">환경설정 및 연동</div>
                <a href="/admin/credentials"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-shield-key text-lg"></i> Platform Credentials
                </a>
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-wrench text-lg"></i> Global Tools Reg
                </a>
            </nav>
        </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 overflow-y-auto px-12 py-10 relative hide-scrollbar">

        <header
            className="flex justify-between items-end mb-8 sticky top-0 bg-[#f5f3ec]/90 backdrop-blur-md z-10 pt-2 pb-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-text-main">Internal API Keys</h1>
                <p className="text-text-muted mt-2 text-sm">CORTHEX 백엔드 시스템에 접근하기 위해 발급된 서비스 및 어드민 전용 API Key 목록입니다.</p>
            </div>

            <div className="flex items-center gap-3">
                <button
                    className="bg-text-main text-white px-5 py-2.5 flex items-center gap-2 rounded-xl text-sm font-bold shadow-soft hover:bg-opacity-90 transition-colors">
                    <i className="ph ph-key text-lg"></i> Generate New Key
                </button>
            </div>
        </header>

        {/* Search & Filter */}
        <div className="flex gap-4 mb-6">
            <div className="relative w-96">
                <i className="ph ph-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm"></i>
                <input type="text" placeholder="Key Name, Prefix 검색..."
                    className="w-full bg-white border border-[#e8e4d9] outline-none text-sm pl-10 pr-4 py-2.5 rounded-lg text-text-main placeholder:text-base-300 shadow-sm focus:border-accent-terracotta/50 transition-colors" />
            </div>
            <select
                className="bg-white border border-[#e8e4d9] px-4 py-2.5 rounded-lg text-text-main text-sm font-medium shadow-sm outline-none cursor-pointer">
                <option>Status: All</option>
                <option>Active</option>
                <option>Revoked</option>
            </select>
        </div>

        {/* API Keys Table */}
        <div className="panel overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr
                        className="bg-[#fcfbf9] text-[11px] uppercase tracking-wider text-text-muted border-b border-[#e8e4d9]">
                        <th className="px-6 py-4 font-bold">Key Name</th>
                        <th className="px-6 py-4 font-bold">Token Prefix</th>
                        <th className="px-6 py-4 font-bold">Permissions</th>
                        <th className="px-6 py-4 font-bold">Created / Expire</th>
                        <th className="px-6 py-4 text-center font-bold">Actions</th>
                    </tr>
                </thead>
                <tbody className="text-sm text-text-main divide-y divide-[#e8e4d9]">

                    <tr className="hover:bg-[#fcfbf9] transition-colors group">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-accent-green mb-0.5"></div>
                                <h4 className="font-bold text-text-main">Backend Service Worker</h4>
                            </div>
                            <p className="text-[10px] text-text-muted mt-0.5 ml-4">Used by main backend microservices</p>
                        </td>
                        <td className="px-6 py-4">
                            <div
                                className="bg-base-50 border border-[#e8e4d9] rounded px-2 py-1 font-mono text-xs w-max text-text-muted">
                                ctx_sys_x8k2...
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span
                                className="px-2 py-1 rounded bg-[#fff5f2] text-accent-terracotta border border-accent-terracotta/20 text-[10px] font-bold uppercase w-max">Full
                                System Access</span>
                        </td>
                        <td className="px-6 py-4">
                            <div className="text-[11px] text-text-main mb-0.5">Oct 01, 2026</div>
                            <div className="text-[10px] text-text-muted">Never expires</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <button className="text-accent-coral hover:underline text-xs font-bold">Revoke</button>
                        </td>
                    </tr>

                    <tr className="hover:bg-[#fcfbf9] transition-colors group">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-accent-green mb-0.5"></div>
                                <h4 className="font-bold text-text-main">Webhook Listener</h4>
                            </div>
                            <p className="text-[10px] text-text-muted mt-0.5 ml-4">Stripe billing webhooks integration</p>
                        </td>
                        <td className="px-6 py-4">
                            <div
                                className="bg-base-50 border border-[#e8e4d9] rounded px-2 py-1 font-mono text-xs w-max text-text-muted">
                                ctx_hook_m9p...
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span
                                className="px-2 py-1 rounded bg-base-100 border border-[#e8e4d9] text-text-muted text-[10px] font-bold uppercase w-max">Billing
                                (Write)</span>
                        </td>
                        <td className="px-6 py-4">
                            <div className="text-[11px] text-text-main mb-0.5">Sep 15, 2026</div>
                            <div className="text-[10px] text-text-muted">Expires: Sep 15, 2027</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <button className="text-accent-coral hover:underline text-xs font-bold">Revoke</button>
                        </td>
                    </tr>

                    <tr className="bg-base-50 transition-colors group opacity-60">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-base-300 mb-0.5"></div>
                                <h4 className="font-bold text-text-muted line-through">Legacy Data Migration</h4>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div
                                className="bg-transparent border border-[#d5cfc1] rounded px-2 py-1 font-mono text-xs w-max text-base-300">
                                ctx_mig_a1b2...
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span
                                className="px-2 py-1 rounded bg-transparent border border-[#d5cfc1] text-base-300 text-[10px] font-bold uppercase w-max">Read
                                Only (Global)</span>
                        </td>
                        <td className="px-6 py-4">
                            <div className="text-[11px] text-text-muted mb-0.5">Aug 01, 2026</div>
                            <div className="text-[10px] text-accent-coral font-bold">Revoked</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <span className="text-xs text-base-300"><i className="ph ph-trash"></i></span>
                        </td>
                    </tr>

                </tbody>
            </table>
        </div>

    </main>
    </>
  );
}

export default AdminApiKeys;
