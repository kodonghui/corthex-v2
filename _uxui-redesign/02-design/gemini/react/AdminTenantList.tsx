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

function AdminTenantList() {
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
                <span
                    className="px-2 py-0.5 bg-accent-coral/10 text-accent-coral text-[10px] font-bold rounded uppercase tracking-wider">Production</span>
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
                    <i className="ph ph-buildings text-lg"></i> Tenants (고객사 관리)
                </a>
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-credit-card text-lg"></i> Billing & Revenue
                </a>

                <div className="pt-6 pb-2 px-4 text-[11px] font-bold text-base-300 uppercase tracking-wider">시스템 자원 및 운영
                </div>
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-cpu text-lg"></i> Platform Metrics
                </a>
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-robot text-lg"></i> Global Agents Status
                </a>

                <div className="pt-6 pb-2 px-4 text-[11px] font-bold text-base-300 uppercase tracking-wider">설정</div>
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-gear text-lg"></i> Settings
                </a>
            </nav>
        </div>

        <div>
            <div className="mt-4 px-4 py-3 flex items-center gap-3 border-t border-[#e8e4d9]">
                <img src="https://i.pravatar.cc/100?img=15" alt="Profile"
                    className="w-10 h-10 rounded-full border border-base-300" />
                <div>
                    <p className="text-sm font-semibold text-text-main">Super Admin</p>
                    <p className="text-[10px] text-text-muted uppercase tracking-wider font-mono">ID: sys_root_1</p>
                </div>
            </div>
        </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 overflow-y-auto px-12 py-10 relative hide-scrollbar">

        <header
            className="flex justify-between items-end mb-8 sticky top-0 bg-[#f5f3ec]/90 backdrop-blur-md z-10 pt-2 pb-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-text-main">Tenants (고객사 목록)</h1>
                <p className="text-text-muted mt-2 text-sm">CORTHEX에 가입된 모든 B2B 조직 워크스페이스를 관리합니다.</p>
            </div>

            <div className="flex items-center gap-3">
                <button
                    className="bg-text-main text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-soft hover:bg-opacity-90 transition-colors flex items-center gap-2">
                    <i className="ph ph-plus"></i> 수동 워크스페이스 생성
                </button>
            </div>
        </header>

        {/* Filters & Search */}
        <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
                <div className="relative w-72">
                    <i
                        className="ph ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-lg"></i>
                    <input type="text" placeholder="회사명, 도메인, ID 검색..."
                        className="w-full bg-white border border-[#e8e4d9] outline-none text-sm pl-10 pr-4 py-2.5 rounded-xl text-text-main placeholder:text-base-300 shadow-sm focus:border-accent-terracotta/50 transition-colors" />
                </div>
                <select
                    className="bg-white border border-[#e8e4d9] px-4 py-2.5 rounded-xl text-text-main text-sm font-medium shadow-sm outline-none cursor-pointer">
                    <option>모든 플랜</option>
                    <option>Enterprise</option>
                    <option>Business</option>
                    <option>Trial</option>
                </select>
                <select
                    className="bg-white border border-[#e8e4d9] px-4 py-2.5 rounded-xl text-text-main text-sm font-medium shadow-sm outline-none cursor-pointer">
                    <option>상태:전체</option>
                    <option>Active</option>
                    <option>Suspended</option>
                </select>
            </div>

            <div className="text-sm font-medium text-text-muted">
                총 142개
            </div>
        </div>

        {/* Tenants Data Table (API: GET /api/admin/tenants) */}
        <div className="panel overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr
                        className="bg-[#fcfbf9] text-[11px] uppercase tracking-wider text-text-muted border-b border-[#e8e4d9]">
                        <th className="px-6 py-4 font-bold">Tenant Info</th>
                        <th className="px-6 py-4 font-bold">Status</th>
                        <th className="px-6 py-4 font-bold">Plan</th>
                        <th className="px-6 py-4 font-bold text-right">Members</th>
                        <th className="px-6 py-4 font-bold text-right">Active Agents</th>
                        <th className="px-6 py-4 font-bold text-right">MRR</th>
                        <th className="px-6 py-4"></th>
                    </tr>
                </thead>
                <tbody className="text-sm text-text-main divide-y divide-[#e8e4d9]">

                    {/* Row 1 */}
                    <tr className="hover:bg-[#fcfbf9] transition-colors group cursor-pointer">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-xl bg-text-main text-white flex items-center justify-center font-bold">
                                    M</div>
                                <div>
                                    <h4 className="font-bold text-text-main mb-0.5">MegaCorp AI Ltd.</h4>
                                    <p className="text-[11px] text-text-muted font-mono">megacorp.com | ID: ten_8x9a2</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span
                                className="px-2 py-1 rounded bg-accent-green/10 text-accent-green text-[10px] font-bold uppercase">Active</span>
                        </td>
                        <td className="px-6 py-4">
                            <span
                                className="font-medium text-text-main border border-[#e8e4d9] px-2 py-1 rounded shadow-sm text-xs">Enterprise</span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono">1,240</td>
                        <td className="px-6 py-4 text-right font-mono text-accent-terracotta">342</td>
                        <td className="px-6 py-4 text-right font-mono font-bold">$12,500</td>
                        <td className="px-6 py-4 text-right">
                            <button
                                className="w-8 h-8 rounded border border-transparent group-hover:border-[#e8e4d9] bg-transparent group-hover:bg-white text-text-muted hover:text-text-main transition-all flex items-center justify-center pointer-events-none group-hover:pointer-events-auto opacity-0 group-hover:opacity-100 shadow-sm"><i
                                    className="ph ph-caret-right"></i></button>
                        </td>
                    </tr>

                    {/* Row 2 */}
                    <tr className="hover:bg-[#fcfbf9] transition-colors group cursor-pointer">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-xl bg-accent-blue text-white flex items-center justify-center font-bold">
                                    G</div>
                                <div>
                                    <h4 className="font-bold text-text-main mb-0.5">Global Retails</h4>
                                    <p className="text-[11px] text-text-muted font-mono">globalretails.co | ID: ten_4b2c1
                                    </p>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span
                                className="px-2 py-1 rounded bg-accent-green/10 text-accent-green text-[10px] font-bold uppercase">Active</span>
                        </td>
                        <td className="px-6 py-4">
                            <span
                                className="font-medium text-text-main border border-[#e8e4d9] px-2 py-1 rounded shadow-sm text-xs">Enterprise</span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono">815</td>
                        <td className="px-6 py-4 text-right font-mono text-accent-terracotta">128</td>
                        <td className="px-6 py-4 text-right font-mono font-bold">$8,200</td>
                        <td className="px-6 py-4 text-right">
                            <button
                                className="w-8 h-8 rounded border border-transparent group-hover:border-[#e8e4d9] bg-transparent group-hover:bg-white text-text-muted hover:text-text-main transition-all flex items-center justify-center pointer-events-none group-hover:pointer-events-auto opacity-0 group-hover:opacity-100 shadow-sm"><i
                                    className="ph ph-caret-right"></i></button>
                        </td>
                    </tr>

                    {/* Row 3 */}
                    <tr className="hover:bg-[#fcfbf9] transition-colors group cursor-pointer">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-xl bg-accent-terracotta text-white flex items-center justify-center font-bold">
                                    T</div>
                                <div>
                                    <h4 className="font-bold text-text-main mb-0.5">TechStart Inc.</h4>
                                    <p className="text-[11px] text-text-muted font-mono">techstart.io | ID: ten_7y1m3</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span
                                className="px-2 py-1 rounded bg-accent-green/10 text-accent-green text-[10px] font-bold uppercase">Active</span>
                        </td>
                        <td className="px-6 py-4">
                            <span
                                className="font-medium text-text-main border border-[#e8e4d9] px-2 py-1 rounded shadow-sm text-xs bg-base-50">Business</span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono">45</td>
                        <td className="px-6 py-4 text-right font-mono text-accent-terracotta">12</td>
                        <td className="px-6 py-4 text-right font-mono font-bold">$950</td>
                        <td className="px-6 py-4 text-right">
                            <button
                                className="w-8 h-8 rounded border border-transparent group-hover:border-[#e8e4d9] bg-transparent group-hover:bg-white text-text-muted hover:text-text-main transition-all flex items-center justify-center pointer-events-none group-hover:pointer-events-auto opacity-0 group-hover:opacity-100 shadow-sm"><i
                                    className="ph ph-caret-right"></i></button>
                        </td>
                    </tr>

                    {/* Row 4 (Suspended) */}
                    <tr className="hover:bg-[#fcfbf9] transition-colors group cursor-pointer opacity-60 hover:opacity-100">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-xl bg-base-200 text-text-muted flex items-center justify-center font-bold">
                                    D</div>
                                <div>
                                    <h4 className="font-bold text-text-main mb-0.5">DeadCompany LLC</h4>
                                    <p className="text-[11px] text-text-muted font-mono">deadco.com | ID: ten_9p0q2</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span
                                className="px-2 py-1 rounded bg-accent-coral/10 text-accent-coral text-[10px] font-bold uppercase">Suspended</span>
                        </td>
                        <td className="px-6 py-4">
                            <span
                                className="font-medium text-text-muted border border-[#e8e4d9] px-2 py-1 rounded shadow-sm text-xs">Trial</span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono">2</td>
                        <td className="px-6 py-4 text-right font-mono text-text-muted">0</td>
                        <td className="px-6 py-4 text-right font-mono font-bold">$0</td>
                        <td className="px-6 py-4 text-right">
                            <button
                                className="w-8 h-8 rounded border border-transparent group-hover:border-[#e8e4d9] bg-transparent group-hover:bg-white text-text-muted hover:text-text-main transition-all flex items-center justify-center pointer-events-none group-hover:pointer-events-auto opacity-0 group-hover:opacity-100 shadow-sm"><i
                                    className="ph ph-caret-right"></i></button>
                        </td>
                    </tr>

                </tbody>
            </table>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-[#e8e4d9] flex justify-between items-center bg-[#fcfbf9]">
                <span className="text-xs text-text-muted">Showing 1 to 10 of 142 entries</span>
                <div className="flex gap-1">
                    <button
                        className="w-8 h-8 rounded border border-[#e8e4d9] bg-white text-text-muted flex items-center justify-center shadow-sm disabled:opacity-50"
                        disabled><i className="ph ph-caret-left"></i></button>
                    <button
                        className="w-8 h-8 rounded border border-accent-terracotta bg-accent-terracotta text-white flex items-center justify-center shadow-sm text-xs font-bold">1</button>
                    <button
                        className="w-8 h-8 rounded border border-[#e8e4d9] bg-white text-text-main hover:bg-base-50 flex items-center justify-center shadow-sm text-xs font-bold">2</button>
                    <button
                        className="w-8 h-8 rounded border border-[#e8e4d9] bg-white text-text-main hover:bg-base-50 flex items-center justify-center shadow-sm text-xs font-bold">3</button>
                    <span className="w-8 h-8 flex items-center justify-center text-text-muted text-xs">...</span>
                    <button
                        className="w-8 h-8 rounded border border-[#e8e4d9] bg-white text-text-muted hover:bg-base-50 hover:text-text-main flex items-center justify-center shadow-sm"><i
                            className="ph ph-caret-right"></i></button>
                </div>
            </div>
        </div>

    </main>
    </>
  );
}

export default AdminTenantList;
