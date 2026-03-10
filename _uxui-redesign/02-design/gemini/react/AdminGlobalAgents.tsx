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

        .pulse-ring-green {
            animation: pulse_green 2s infinite cubic-bezier(0.215, 0.61, 0.355, 1);
        }

        @keyframes pulse_green {
            0% {
                transform: scale(0.95);
                box-shadow: 0 0 0 0 rgba(129, 178, 154, 0.7);
            }

            70% {
                transform: scale(1);
                box-shadow: 0 0 0 6px rgba(129, 178, 154, 0);
            }

            100% {
                transform: scale(0.95);
                box-shadow: 0 0 0 0 rgba(129, 178, 154, 0);
            }
        }

        .pulse-ring-coral {
            animation: pulse_coral 2s infinite cubic-bezier(0.215, 0.61, 0.355, 1);
        }

        @keyframes pulse_coral {
            0% {
                transform: scale(0.95);
                box-shadow: 0 0 0 0 rgba(229, 115, 115, 0.7);
            }

            70% {
                transform: scale(1);
                box-shadow: 0 0 0 6px rgba(229, 115, 115, 0);
            }

            100% {
                transform: scale(0.95);
                box-shadow: 0 0 0 0 rgba(229, 115, 115, 0);
            }
        }
`;

function AdminGlobalAgents() {
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
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-buildings text-lg"></i> Tenants
                </a>
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-credit-card text-lg"></i> Billing
                </a>

                <div className="pt-6 pb-2 px-4 text-[11px] font-bold text-base-300 uppercase tracking-wider">시스템 자원 및 운영
                </div>
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-cpu text-lg"></i> Platform Metrics
                </a>
                {/* Active menu */}
                <a href="#"
                    className="flex items-center gap-3 px-4 py-3 font-medium text-accent-terracotta bg-white rounded-xl border border-[#e8e4d9] shadow-sm transition-colors">
                    <i className="ph ph-robot text-lg"></i> Global Agents Status
                </a>
            </nav>
        </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 overflow-y-auto px-12 py-10 relative hide-scrollbar">

        <header
            className="flex justify-between items-end mb-8 sticky top-0 bg-[#f5f3ec]/90 backdrop-blur-md z-10 pt-2 pb-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-text-main">Global Agents Fleet</h1>
                <p className="text-text-muted mt-2 text-sm">플랫폼 전체 고객사가 구동 중인 AI 에이전트의 상태 및 리소스 점유율을 모니터링합니다.</p>
            </div>

            <div className="flex items-center gap-3">
                <button
                    className="bg-white border border-[#e8e4d9] text-text-main px-4 py-2 flex items-center gap-2 rounded-lg text-sm font-bold shadow-sm hover:bg-base-50 transition-colors">
                    <i className="ph ph-arrows-clockwise"></i> Refresh
                </button>
            </div>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="panel p-6">
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Total Agents (Created)</h3>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-text-main font-mono">15,842</span>
                </div>
            </div>
            <div className="panel p-6 bg-white border border-accent-green/30">
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Active Computing (Running)
                </h3>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-text-main font-mono flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-accent-green pulse-ring-green"></div>
                        3,894
                    </span>
                </div>
            </div>
            <div className="panel p-6">
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Sleeping/Idle (Background)
                </h3>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-text-main font-mono flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-base-300"></div>
                        11,921
                    </span>
                </div>
            </div>
            <div className="panel p-6 bg-[#fdf5f5] border-accent-coral/30">
                <h3 className="text-xs font-bold text-accent-coral uppercase tracking-wider mb-2">Errored / Stalled</h3>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-text-main font-mono flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-accent-coral pulse-ring-coral"></div>
                        27
                    </span>
                </div>
            </div>
        </div>

        {/* Filters */}
        <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
                <div className="relative w-80">
                    <i
                        className="ph ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-lg"></i>
                    <input type="text" placeholder="에이전트 ID, 고객사명(Tenant) 검색..."
                        className="w-full bg-white border border-[#e8e4d9] outline-none text-sm pl-10 pr-4 py-2.5 rounded-xl text-text-main placeholder:text-base-300 shadow-sm focus:border-accent-terracotta/50 transition-colors" />
                </div>
                <select
                    className="bg-white border border-[#e8e4d9] px-4 py-2.5 rounded-xl text-text-main text-sm font-medium shadow-sm outline-none cursor-pointer">
                    <option>상태:전체</option>
                    <option>Running (실행 중)</option>
                    <option>Sleeping (대기)</option>
                    <option>Error (오류)</option>
                </select>
            </div>
            <div className="text-sm text-text-muted">
                Showing top 100 consuming agents...
            </div>
        </div>

        {/* Agents Data Table */}
        <div className="panel overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr
                        className="bg-[#fcfbf9] text-[11px] uppercase tracking-wider text-text-muted border-b border-[#e8e4d9]">
                        <th className="px-6 py-4 font-bold">Agent Name / ID</th>
                        <th className="px-6 py-4 font-bold">Tenant (Owner)</th>
                        <th className="px-6 py-4 font-bold">Base Model</th>
                        <th className="px-6 py-4 font-bold">Status</th>
                        <th className="px-6 py-4 font-bold text-right">CPU / Mem usage</th>
                        <th className="px-6 py-4 font-bold text-right">Tokens (24h)</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="text-sm text-text-main divide-y divide-[#e8e4d9]">

                    {/* Row 1: Error */}
                    <tr className="hover:bg-[#fcfbf9] transition-colors group bg-[#fdf5f5]/30">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-lg bg-accent-coral/10 text-accent-coral flex items-center justify-center font-bold text-lg">
                                    <i className="ph ph-warning-circle"></i></div>
                                <div>
                                    <h4 className="font-bold text-text-main mb-0.5">Finance_Reconciler_Auto</h4>
                                    <p className="text-[10px] text-text-muted font-mono">agt_9831a2c4_f</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span className="font-bold text-text-main text-xs">MegaCorp AI Ltd.</span>
                            <p className="text-[10px] text-text-muted font-mono">ten_8x9a2_mcorp</p>
                        </td>
                        <td className="px-6 py-4 font-mono text-[11px]">gpt-4-turbo</td>
                        <td className="px-6 py-4">
                            <span
                                className="px-2 py-1 rounded bg-accent-coral/10 text-accent-coral text-[10px] font-bold uppercase flex items-center gap-1.5 w-max">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent-coral"></div> Error Loop
                            </span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-xs">
                            <span className="text-accent-coral font-bold mt-1">94%</span> / 1.2GB
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-accent-coral">
                            1.42M
                        </td>
                        <td className="px-6 py-4 text-center">
                            <button
                                className="bg-white border border-[#e8e4d9] text-text-main px-2 py-1 rounded shadow-sm text-xs font-bold hover:bg-base-50">Kill
                                Process</button>
                        </td>
                    </tr>

                    {/* Row 2: Running Heavy */}
                    <tr className="hover:bg-[#fcfbf9] transition-colors group">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-lg bg-[#f0f9f4] text-accent-green flex items-center justify-center font-bold text-lg">
                                    <i className="ph ph-robot"></i></div>
                                <div>
                                    <h4 className="font-bold text-text-main mb-0.5">CS_Intl_Agent_Hub</h4>
                                    <p className="text-[10px] text-text-muted font-mono">agt_4b31x9y2_c</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span className="font-bold text-text-main text-xs">Global Retails</span>
                            <p className="text-[10px] text-text-muted font-mono">ten_4b2c1_gret</p>
                        </td>
                        <td className="px-6 py-4 font-mono text-[11px] text-accent-blue font-bold">claude-3-sonnet</td>
                        <td className="px-6 py-4">
                            <span
                                className="px-2 py-1 rounded bg-[#f0f9f4] text-accent-green text-[10px] font-bold uppercase flex items-center gap-1.5 w-max">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent-green pulse-ring-green"></div> Running
                            </span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-xs">
                            12% / 512MB
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-text-main">
                            780K
                        </td>
                        <td className="px-6 py-4 text-center">
                            <button className="text-text-muted hover:text-text-main"><i
                                    className="ph ph-dots-three text-lg"></i></button>
                        </td>
                    </tr>

                    {/* Row 3: Sleeping */}
                    <tr className="hover:bg-[#fcfbf9] transition-colors group opacity-70">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-lg bg-base-100 text-text-muted flex items-center justify-center font-bold text-lg">
                                    <i className="ph ph-moon"></i></div>
                                <div>
                                    <h4 className="font-bold text-text-main mb-0.5">Marketing_Copy_Assistant</h4>
                                    <p className="text-[10px] text-text-muted font-mono">agt_1x2y3z4w_m</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span className="font-bold text-text-main text-xs">TechStart Inc.</span>
                            <p className="text-[10px] text-text-muted font-mono">ten_7y1m3_tst</p>
                        </td>
                        <td className="px-6 py-4 font-mono text-[11px]">gpt-4o-mini</td>
                        <td className="px-6 py-4">
                            <span
                                className="px-2 py-1 rounded bg-base-100 text-text-muted text-[10px] font-bold uppercase flex items-center gap-1.5 w-max">
                                <div className="w-1.5 h-1.5 rounded-full bg-base-300"></div> Sleeping
                            </span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-xs">
                            0% / 0MB
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-text-main">
                            12K
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

export default AdminGlobalAgents;
