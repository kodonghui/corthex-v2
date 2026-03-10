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

function AdminEmployees() {
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

                <div className="pt-6 pb-2 px-4 text-[11px] font-bold text-base-300 uppercase tracking-wider">조직 및 권한 관리
                    (Global)</div>
                <a href="/admin/departments"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-briefcase text-lg"></i> Departments
                </a>
                {/* Active menu */}
                <a href="#"
                    className="flex items-center gap-3 px-4 py-3 font-medium text-accent-terracotta bg-white rounded-xl border border-[#e8e4d9] shadow-sm transition-colors">
                    <i className="ph ph-users-three text-lg"></i> Global Employees
                </a>
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-robot text-lg"></i> Global Agents
                </a>
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-key text-lg"></i> System Users
                </a>

                <div className="pt-6 pb-2 px-4 text-[11px] font-bold text-base-300 uppercase tracking-wider">고객사 관리</div>
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-buildings text-lg"></i> Tenants
                </a>
            </nav>
        </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 overflow-y-auto px-12 py-10 relative hide-scrollbar">

        <header
            className="flex justify-between items-end mb-8 sticky top-0 bg-[#f5f3ec]/90 backdrop-blur-md z-10 pt-2 pb-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-text-main">Global Employees</h1>
                <p className="text-text-muted mt-2 text-sm">플랫폼에 등록된 전체 B2B 기업의 Human(인간) 직원 계정을 통합 모니터링합니다.</p>
            </div>

            <div className="flex items-center gap-3">
                <button
                    className="bg-white border border-[#e8e4d9] text-text-main px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-base-50 transition-colors flex items-center gap-2">
                    <i className="ph ph-download-simple text-lg"></i> Export CSV
                </button>
            </div>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="panel p-5 bg-white">
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Total Employees</h3>
                <div className="text-2xl font-bold text-text-main">1,248</div>
            </div>
            <div className="panel p-5 bg-white border-l-4 border-l-accent-blue">
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Active Today</h3>
                <div className="text-2xl font-bold text-accent-blue">892</div>
            </div>
            <div className="panel p-5 bg-white">
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Pending Invites</h3>
                <div className="text-2xl font-bold text-text-main">45</div>
            </div>
            <div className="panel p-5 bg-[#fdf5f5] border border-accent-coral/30">
                <h3 className="text-xs font-bold text-accent-coral uppercase tracking-wider mb-1">Suspended</h3>
                <div className="text-2xl font-bold text-accent-coral">12</div>
            </div>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-2 mb-6">
            <div className="relative w-80">
                <i className="ph ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm"></i>
                <input type="text" placeholder="이름, 이메일, 테넌트명 검색..."
                    className="w-full bg-white border border-[#e8e4d9] outline-none text-sm pl-9 pr-4 py-2.5 rounded-lg text-text-main placeholder:text-base-300 shadow-sm focus:border-accent-terracotta/50" />
            </div>

            <select
                className="bg-white border border-[#e8e4d9] px-3 py-2.5 rounded-lg text-text-main text-sm font-medium shadow-sm outline-none cursor-pointer">
                <option>Tenant: All</option>
                <option>MegaCorp AI Ltd.</option>
                <option>Global Retails</option>
            </select>

            <select
                className="bg-white border border-[#e8e4d9] px-3 py-2.5 rounded-lg text-text-main text-sm font-medium shadow-sm outline-none cursor-pointer">
                <option>Status: Active</option>
                <option>Status: Pending</option>
                <option>Status: Suspended</option>
            </select>

            <select
                className="bg-white border border-[#e8e4d9] px-3 py-2.5 rounded-lg text-text-main text-sm font-medium shadow-sm outline-none cursor-pointer">
                <option>Role: All</option>
                <option>Role: CEO (Admin)</option>
                <option>Role: Member</option>
            </select>
        </div>

        {/* Employees Table */}
        <div className="panel overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr
                        className="bg-[#fcfbf9] text-[11px] uppercase tracking-wider text-text-muted border-b border-[#e8e4d9]">
                        <th className="px-6 py-4 font-bold">Employee</th>
                        <th className="px-6 py-4 font-bold">Tenant (Company)</th>
                        <th className="px-6 py-4 font-bold">Role</th>
                        <th className="px-6 py-4 font-bold">Departments Access</th>
                        <th className="px-6 py-4 font-bold">Status & Last Active</th>
                        <th className="px-6 py-4 text-center font-bold">Actions</th>
                    </tr>
                </thead>
                <tbody className="text-sm text-text-main divide-y divide-[#e8e4d9]">

                    {/* CEO Role */}
                    <tr className="hover:bg-[#fcfbf9] transition-colors group">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <img src="https://i.pravatar.cc/100?img=11" alt="avatar"
                                    className="w-9 h-9 rounded-full object-cover" />
                                <div>
                                    <h4 className="font-bold text-text-main">David Kim</h4>
                                    <p className="text-xs text-text-muted mt-0.5">david.k@megacorp.ai</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span className="font-medium text-text-main">MegaCorp AI Ltd.</span>
                            <p className="text-[10px] text-text-muted font-mono mt-0.5">ten_8x9a2_mcorp</p>
                        </td>
                        <td className="px-6 py-4">
                            <span
                                className="px-2 py-1 rounded bg-[#fff5f2] text-accent-terracotta border border-accent-terracotta/20 text-xs font-bold w-max flex items-center gap-1"><i
                                    className="ph ph-crown"></i> CEO / Admin</span>
                        </td>
                        <td className="px-6 py-4">
                            <span className="text-xs text-text-muted font-bold">All Departments</span>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent-green"></div>
                                <span className="text-xs font-bold">Active</span>
                            </div>
                            <span className="text-[11px] text-text-muted">Just now</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <button className="text-text-muted hover:text-text-main"><i
                                    className="ph ph-dots-three text-lg"></i></button>
                        </td>
                    </tr>

                    {/* Member Role */}
                    <tr className="hover:bg-[#fcfbf9] transition-colors group">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-9 h-9 rounded-full bg-base-200 text-text-muted flex items-center justify-center font-bold">
                                    SL</div>
                                <div>
                                    <h4 className="font-bold text-text-main">Sarah Lee</h4>
                                    <p className="text-xs text-text-muted mt-0.5">sarah@globalretails.com</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span className="font-medium text-text-main">Global Retails</span>
                            <p className="text-[10px] text-text-muted font-mono mt-0.5">ten_4b2c1_gret</p>
                        </td>
                        <td className="px-6 py-4">
                            <span
                                className="px-2 py-1 rounded bg-base-100 text-text-muted border border-[#e8e4d9] text-xs font-medium w-max">Member</span>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                                <span
                                    className="px-1.5 py-0.5 bg-base-100 rounded text-[10px] whitespace-nowrap border border-[#e8e4d9]">Marketing</span>
                                <span
                                    className="px-1.5 py-0.5 bg-base-100 rounded text-[10px] whitespace-nowrap border border-[#e8e4d9]">CS</span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent-green"></div>
                                <span className="text-xs font-bold">Active</span>
                            </div>
                            <span className="text-[11px] text-text-muted">2 hours ago</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <button className="text-text-muted hover:text-text-main"><i
                                    className="ph ph-dots-three text-lg"></i></button>
                        </td>
                    </tr>

                    {/* Suspended Role */}
                    <tr className="hover:bg-[#fcfbf9] transition-colors group bg-accent-coral/5">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-9 h-9 rounded-full bg-accent-coral/20 text-accent-coral flex items-center justify-center font-bold">
                                    MJ</div>
                                <div className="opacity-60">
                                    <h4 className="font-bold text-text-main line-through">Mike Johnson</h4>
                                    <p className="text-xs text-text-muted mt-0.5">mike.j@techstart.io</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 opacity-60">
                            <span className="font-medium text-text-main">TechStart Inc.</span>
                            <p className="text-[10px] text-text-muted font-mono mt-0.5">ten_7y1m3_tst</p>
                        </td>
                        <td className="px-6 py-4 opacity-60">
                            <span
                                className="px-2 py-1 rounded bg-base-100 text-text-muted border border-[#e8e4d9] text-xs font-medium w-max">Member</span>
                        </td>
                        <td className="px-6 py-4 opacity-60">
                            <span className="text-xs text-text-muted italic">Access Revoked</span>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent-coral"></div>
                                <span className="text-xs font-bold text-accent-coral">Suspended</span>
                            </div>
                            <span className="text-[11px] text-text-muted">Since Oct 12, 2026</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <button className="text-text-main font-bold text-xs hover:underline">Restore</button>
                        </td>
                    </tr>

                </tbody>
            </table>

            <div className="py-4 px-6 border-t border-[#e8e4d9] flex justify-between items-center bg-[#fcfbf9]">
                <span className="text-xs text-text-muted">Showing 1 to 3 of 1,248 employees</span>
                <div className="flex gap-1">
                    <button
                        className="w-8 h-8 rounded border border-[#e8e4d9] bg-white text-text-muted flex items-center justify-center hover:text-text-main hover:bg-base-50 transition-colors cursor-not-allowed opacity-50"><i
                            className="ph ph-caret-left"></i></button>
                    <button
                        className="w-8 h-8 rounded border border-[#e8e4d9] bg-text-main text-white flex items-center justify-center text-sm font-bold">1</button>
                    <button
                        className="w-8 h-8 rounded border border-[#e8e4d9] bg-white text-text-main flex items-center justify-center hover:bg-base-50 transition-colors text-sm">2</button>
                    <button
                        className="w-8 h-8 rounded border border-[#e8e4d9] bg-white text-text-main flex items-center justify-center hover:bg-base-50 transition-colors text-sm">3</button>
                    <span className="w-8 h-8 flex items-center justify-center text-text-muted">...</span>
                    <button
                        className="w-8 h-8 rounded border border-[#e8e4d9] bg-white text-text-muted flex items-center justify-center hover:text-text-main hover:bg-base-50 transition-colors"><i
                            className="ph ph-caret-right"></i></button>
                </div>
            </div>
        </div>

    </main>
    </>
  );
}

export default AdminEmployees;
