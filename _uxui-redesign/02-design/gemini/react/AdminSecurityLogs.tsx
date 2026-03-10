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

        /* Code styling for logs */
        .log-code {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.7rem;
            background: #fcfbf9;
            padding: 2px 4px;
            border-radius: 4px;
            border: 1px solid #e8e4d9;
        }
`;

function AdminSecurityLogs() {
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

                <div className="pt-6 pb-2 px-4 text-[11px] font-bold text-base-300 uppercase tracking-wider">시스템 보안 및 리소스
                </div>
                {/* Active menu */}
                <a href="#"
                    className="flex items-center gap-3 px-4 py-3 font-medium text-accent-terracotta bg-white rounded-xl border border-[#e8e4d9] shadow-sm transition-colors">
                    <i className="ph ph-shield-check text-lg"></i> Security Audit Logs
                </a>
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-robot text-lg"></i> Global Agents
                </a>
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-gear text-lg"></i> Settings
                </a>
            </nav>
        </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 flex flex-col h-screen relative hide-scrollbar">

        <header
            className="px-12 py-8 bg-[#f5f3ec]/90 backdrop-blur-md border-b border-[#e8e4d9] sticky top-0 z-10 shrink-0">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-main flex items-center gap-2">
                        Global Security Audit <i className="ph ph-shield-check text-accent-terracotta"></i>
                    </h1>
                    <p className="text-text-muted mt-2 text-sm">플랫폼 내의 모든 Tenant에서 발생하는 인증/인가, 관리자 행동, 비정상 접근 로그입니다.</p>
                </div>

                <div className="flex gap-3">
                    <button
                        className="bg-white border border-[#e8e4d9] text-text-main px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-base-50 transition-colors flex items-center gap-2">
                        <i className="ph ph-download-simple"></i> Export CSV
                    </button>
                    <button
                        className="bg-text-main border border-text-main text-white px-4 py-2 rounded-lg text-sm font-bold shadow-soft hover:bg-opacity-90 transition-colors flex items-center gap-2">
                        <i className="ph ph-siren"></i> Security Rules
                    </button>
                </div>
            </div>

            {/* Advanced Filters */}
            <div className="mt-6 flex flex-wrap gap-2">
                <div className="relative w-64">
                    <i
                        className="ph ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm"></i>
                    <input type="text" placeholder="IP, User Email, Action..."
                        className="w-full bg-white border border-[#e8e4d9] outline-none text-xs pl-8 pr-4 py-2 rounded-lg text-text-main placeholder:text-base-300 shadow-sm focus:border-text-main/50" />
                </div>

                <select
                    className="bg-white border border-[#e8e4d9] px-3 py-2 rounded-lg text-text-main text-xs font-medium shadow-sm outline-none cursor-pointer">
                    <option>All Tenants</option>
                    <option>ten_8x9a2_mcorp (MegaCorp)</option>
                    <option>ten_4b2c1_gret (Global Retails)</option>
                </select>

                <select
                    className="bg-white border border-[#e8e4d9] px-3 py-2 rounded-lg text-text-main text-xs font-medium shadow-sm outline-none cursor-pointer">
                    <option>Severity: All</option>
                    <option>High (Threat, Failed Auth)</option>
                    <option>Medium (Mgmt Action)</option>
                    <option>Low (Standard Login)</option>
                </select>

                <select
                    className="bg-white border border-[#e8e4d9] px-3 py-2 rounded-lg text-text-main text-xs font-medium shadow-sm outline-none cursor-pointer">
                    <option>Time: Last 24 Hours</option>
                    <option>Last 7 Days</option>
                    <option>Custom Range...</option>
                </select>

                <button
                    className="text-xs font-bold text-text-muted hover:text-text-main px-2 py-2 flex items-center gap-1 transition-colors">
                    <i className="ph ph-x"></i> Clear Filters
                </button>
            </div>
        </header>

        {/* Dense Log Table */}
        <div className="flex-1 overflow-auto p-12 bg-white">
            <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white z-10 shadow-[0_1px_0_#e8e4d9]">
                    <tr className="text-[10px] uppercase tracking-wider text-text-muted">
                        <th className="px-4 py-3 font-bold">Timestamp (UTC)</th>
                        <th className="px-4 py-3 font-bold">Severity</th>
                        <th className="px-4 py-3 font-bold">Event Type</th>
                        <th className="px-4 py-3 font-bold">Tenant ID</th>
                        <th className="px-4 py-3 font-bold">Actor (User/IP)</th>
                        <th className="px-4 py-3 font-bold">Details (JSON payload)</th>
                    </tr>
                </thead>
                <tbody className="text-xs text-text-main divide-y divide-[#e8e4d9] font-mono">

                    {/* CRITICAL EVENT */}
                    <tr className="hover:bg-[#fdf5f5]/30 transition-colors group cursor-crosshair">
                        <td className="px-4 py-3 text-text-muted">2026-10-15 14:32:01</td>
                        <td className="px-4 py-3">
                            <span
                                className="px-1.5 py-0.5 rounded bg-accent-coral/20 text-accent-coral text-[10px] font-bold uppercase border border-accent-coral/30">High</span>
                        </td>
                        <td className="px-4 py-3 font-bold text-accent-coral">auth.login.failed_bruteforce</td>
                        <td className="px-4 py-3 text-text-muted">ten_8x9a2_mcorp</td>
                        <td className="px-4 py-3">
                            <div>Unauthenticated</div>
                            <div className="text-[10px] text-accent-coral font-bold flex items-center gap-1"><i
                                    className="ph ph-globe"></i> 192.168.45.22 (RU)</div>
                        </td>
                        <td className="px-4 py-3">
                            <div
                                className="log-code w-full overflow-hidden text-ellipsis whitespace-nowrap max-w-sm text-text-code">
                                {"attempts": 15, "target_email": "admin@megacorp.com", "action_taken": "ip_banned"}
                            </div>
                        </td>
                    </tr>

                    {/* MEDIUM EVENT (Admin action) */}
                    <tr className="hover:bg-[#fcfbf9] transition-colors group cursor-crosshair">
                        <td className="px-4 py-3 text-text-muted">2026-10-15 14:28:44</td>
                        <td className="px-4 py-3">
                            <span
                                className="px-1.5 py-0.5 rounded bg-accent-amber/20 text-accent-amber text-[10px] font-bold uppercase border border-accent-amber/30">Med</span>
                        </td>
                        <td className="px-4 py-3 font-bold text-text-main">tenant.api_key.created</td>
                        <td className="px-4 py-3 text-text-muted">ten_4b2c1_gret</td>
                        <td className="px-4 py-3">
                            <div>sarah (Workspace Admin)</div>
                            <div className="text-[10px] text-text-muted flex items-center gap-1"><i className="ph ph-globe"></i>
                                10.0.12.4 (US)</div>
                        </td>
                        <td className="px-4 py-3">
                            <div
                                className="log-code w-full overflow-hidden text-ellipsis whitespace-nowrap max-w-sm text-text-code">
                                {"key_id": "pk_live_8u...", "permissions": ["agent:write", "agent:read"], "name":
                                "CI_Deploy_Key"}
                            </div>
                        </td>
                    </tr>

                    {/* LOW EVENT (Standard) */}
                    <tr className="hover:bg-[#fcfbf9] transition-colors group cursor-crosshair">
                        <td className="px-4 py-3 text-text-muted">2026-10-15 14:15:22</td>
                        <td className="px-4 py-3">
                            <span
                                className="px-1.5 py-0.5 rounded bg-base-200 text-text-muted text-[10px] font-bold uppercase border border-[#e8e4d9]">Low</span>
                        </td>
                        <td className="px-4 py-3 font-bold text-text-main">auth.sso.login_success</td>
                        <td className="px-4 py-3 text-text-muted">ten_8x9a2_mcorp</td>
                        <td className="px-4 py-3">
                            <div>david@megacorp.com</div>
                            <div className="text-[10px] text-text-muted flex items-center gap-1"><i className="ph ph-globe"></i>
                                142.250.207.46 (KR)</div>
                        </td>
                        <td className="px-4 py-3">
                            <div
                                className="log-code w-full overflow-hidden text-ellipsis whitespace-nowrap max-w-sm text-text-code">
                                {"provider": "okta", "session_id": "sess_91823ab", "mfa_used": true}
                            </div>
                        </td>
                    </tr>

                    {/* MEDIUM EVENT (Deletion) */}
                    <tr className="hover:bg-[#fcfbf9] transition-colors group cursor-crosshair">
                        <td className="px-4 py-3 text-text-muted">2026-10-15 13:50:11</td>
                        <td className="px-4 py-3">
                            <span
                                className="px-1.5 py-0.5 rounded bg-accent-amber/20 text-accent-amber text-[10px] font-bold uppercase border border-accent-amber/30">Med</span>
                        </td>
                        <td className="px-4 py-3 font-bold text-text-main">agent.deleted</td>
                        <td className="px-4 py-3 text-text-muted">ten_7y1m3_tst</td>
                        <td className="px-4 py-3">
                            <div>dev_team_lead</div>
                            <div className="text-[10px] text-text-muted flex items-center gap-1"><i className="ph ph-globe"></i>
                                104.21.34.11 (US)</div>
                        </td>
                        <td className="px-4 py-3">
                            <div
                                className="log-code w-full overflow-hidden text-ellipsis whitespace-nowrap max-w-sm text-text-code">
                                {"agent_id": "agt_1x2y3z4w_m", "name": "Marketing_Copy_Assistant_v1"}
                            </div>
                        </td>
                    </tr>

                    {/* SUPER ADMIN EVENT */}
                    <tr className="hover:bg-base-50 transition-colors group bg-accent-blue/5 cursor-crosshair">
                        <td className="px-4 py-3 text-text-muted">2026-10-15 13:20:00</td>
                        <td className="px-4 py-3">
                            <span
                                className="px-1.5 py-0.5 rounded bg-accent-blue/20 text-accent-blue text-[10px] font-bold uppercase border border-accent-blue/30">System</span>
                        </td>
                        <td className="px-4 py-3 font-bold text-accent-blue">platform.billing.plan_updated</td>
                        <td className="px-4 py-3 text-text-muted italic">global</td>
                        <td className="px-4 py-3">
                            <div className="font-bold">Super Admin (sys_root_1)</div>
                            <div className="text-[10px] text-text-muted flex items-center gap-1"><i className="ph ph-globe"></i>
                                Internal Net</div>
                        </td>
                        <td className="px-4 py-3">
                            <div
                                className="log-code w-full overflow-hidden text-ellipsis whitespace-nowrap max-w-sm text-text-code bg-accent-blue/5 border-accent-blue/20">
                                {"target_plan": "Business Pro", "changes": {"base_price": [249, 299]}}
                            </div>
                        </td>
                    </tr>

                </tbody>
            </table>

            <div className="py-6 flex justify-center border-t border-[#e8e4d9]">
                <button
                    className="text-sm font-bold text-text-main py-2 px-6 rounded-lg border border-[#e8e4d9] hover:bg-base-50 shadow-sm transition-colors">Load
                    Older Logs</button>
            </div>
        </div>

    </main>
    </>
  );
}

export default AdminSecurityLogs;
