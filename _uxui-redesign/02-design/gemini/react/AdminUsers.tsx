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

function AdminUsers() {
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
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-briefcase text-lg"></i> Departments
                </a>
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-users-three text-lg"></i> Global Employees
                </a>
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-robot text-lg"></i> Global Agents
                </a>
                {/* Active menu */}
                <a href="#"
                    className="flex items-center gap-3 px-4 py-3 font-medium text-accent-terracotta bg-white rounded-xl border border-[#e8e4d9] shadow-sm transition-colors">
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
                <h1 className="text-3xl font-bold tracking-tight text-text-main">System Users (Super Admins)</h1>
                <p className="text-text-muted mt-2 text-sm">CORTHEX 플랫폼 자체를 관리하는 시스템 최상위 관리자 계정 목록입니다.</p>
            </div>

            <div className="flex items-center gap-3">
                <button
                    className="bg-text-main text-white px-5 py-2.5 flex items-center gap-2 rounded-xl text-sm font-bold shadow-soft hover:bg-opacity-90 transition-colors">
                    <i className="ph ph-user-plus text-lg"></i> Add Admin
                </button>
            </div>
        </header>

        {/* System Admin Notice */}
        <div className="bg-[#fff5f2] border border-accent-terracotta/30 rounded-2xl p-5 mb-8 flex items-start gap-4">
            <div
                className="w-8 h-8 rounded-full bg-accent-terracotta/20 text-accent-terracotta flex items-center justify-center shrink-0 mt-0.5">
                <i className="ph ph-warning-circle text-lg"></i></div>
            <div>
                <h4 className="font-bold text-text-main mb-1">최상위 권한자 관리 경고</h4>
                <p className="text-sm text-text-muted">이곳에 나열된 계정은 모든 테넌트(고객사)의 접속 로그, 청구 정보, 전역 리소스 설정에 접근할 수 있는 Super
                    Admin 권한을 가집니다. 계정 발급 및 권한 관리에 각별히 유의하십시오. 2FA(이중 인증) 사용이 강제됩니다.</p>
            </div>
        </div>

        {/* Admin Users Table */}
        <div className="panel overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr
                        className="bg-[#fcfbf9] text-[11px] uppercase tracking-wider text-text-muted border-b border-[#e8e4d9]">
                        <th className="px-6 py-4 font-bold">Admin Account</th>
                        <th className="px-6 py-4 font-bold">Role & Access Level</th>
                        <th className="px-6 py-4 font-bold">Security (2FA)</th>
                        <th className="px-6 py-4 font-bold">Last Login (IP)</th>
                        <th className="px-6 py-4 text-center font-bold">Actions</th>
                    </tr>
                </thead>
                <tbody className="text-sm text-text-main divide-y divide-[#e8e4d9]">

                    {/* Super Admin 1 */}
                    <tr className="hover:bg-[#fcfbf9] transition-colors group">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-9 h-9 rounded-full bg-text-main flex items-center justify-center text-white font-bold">
                                    UB</div>
                                <div>
                                    <h4 className="font-bold text-text-main">ubuntu (You)</h4>
                                    <p className="text-xs text-text-muted mt-0.5 font-mono">sysadmin@corthex.ai</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span
                                className="px-2 py-1 rounded bg-[#fff5f2] text-accent-terracotta border border-accent-terracotta/20 text-xs font-bold w-max flex items-center gap-1.5"><i
                                    className="ph ph-shield-star"></i> Root Admin</span>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                                <i className="ph ph-check-circle text-accent-green text-lg"></i>
                                <span className="text-xs font-bold text-text-main">Enabled (YubiKey)</span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="text-xs font-bold text-text-main mb-0.5">Current Session</div>
                            <span className="text-[10px] text-text-muted font-mono flex items-center gap-1"><i
                                    className="ph ph-globe"></i> 142.250.207.46 (KR)</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <button className="text-text-muted hover:text-text-main opacity-50 cursor-not-allowed"
                                title="Cannot edit root account"><i className="ph ph-dots-three text-lg"></i></button>
                        </td>
                    </tr>

                    {/* Secondary Admin */}
                    <tr className="hover:bg-[#fcfbf9] transition-colors group">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-9 h-9 rounded-full bg-base-300 flex items-center justify-center text-text-main font-bold">
                                    MJ</div>
                                <div>
                                    <h4 className="font-bold text-text-main">Minsu Jung</h4>
                                    <p className="text-xs text-text-muted mt-0.5 font-mono">mjung@corthex.ai</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span
                                className="px-2 py-1 rounded bg-base-100 text-text-muted border border-[#e8e4d9] text-xs font-bold w-max flex items-center gap-1.5"><i
                                    className="ph ph-shield-check"></i> Billing Ops</span>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                                <i className="ph ph-check-circle text-accent-green text-lg"></i>
                                <span className="text-xs font-bold text-text-main">Enabled (OTP)</span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="text-xs text-text-main mb-0.5">2 days ago</div>
                            <span className="text-[10px] text-text-muted font-mono flex items-center gap-1"><i
                                    className="ph ph-globe"></i> 118.235.15.8 (KR)</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <button className="text-text-muted hover:text-text-main"><i
                                    className="ph ph-dots-three text-lg"></i></button>
                        </td>
                    </tr>

                    {/* DevOps Admin */}
                    <tr className="hover:bg-[#fcfbf9] transition-colors group">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-9 h-9 rounded-full bg-accent-blue/10 flex items-center justify-center text-accent-blue font-bold">
                                    AK</div>
                                <div>
                                    <h4 className="font-bold text-text-main">Alex Kim</h4>
                                    <p className="text-xs text-text-muted mt-0.5 font-mono">devops@corthex.ai</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span
                                className="px-2 py-1 rounded bg-accent-blue/10 text-accent-blue border border-accent-blue/20 text-xs font-bold w-max flex items-center gap-1.5"><i
                                    className="ph ph-hard-drives"></i> Sys Ops</span>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                                <i className="ph ph-warning-circle text-accent-amber text-lg"></i>
                                <span className="text-xs font-bold text-accent-amber">Pending Setup</span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="text-[11px] text-text-muted italic">Never logged in</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <button className="text-text-muted hover:text-text-main"><i
                                    className="ph ph-dots-three text-lg"></i></button>
                        </td>
                    </tr>

                </tbody>
            </table>
        </div>

    </main>
    </>
  );
}

export default AdminUsers;
