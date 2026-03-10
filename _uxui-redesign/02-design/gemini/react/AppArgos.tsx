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

        .panel {
            background-color: white;
            border-radius: 1.5rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
            border: 1px solid #f5f3ec;
        }

        .pulse-ring {
            animation: pulse_ring 2s infinite cubic-bezier(0.215, 0.61, 0.355, 1);
        }

        @keyframes pulse_ring {
            0% {
                transform: scale(0.95);
                box-shadow: 0 0 0 0 rgba(229, 115, 115, 0.7);
            }

            70% {
                transform: scale(1);
                box-shadow: 0 0 0 10px rgba(229, 115, 115, 0);
            }

            100% {
                transform: scale(0.95);
                box-shadow: 0 0 0 0 rgba(229, 115, 115, 0);
            }
        }
`;

function AppArgos() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Primary Sidebar */}
    <aside
        className="w-20 flex flex-col items-center justify-between py-8 border-r border-base-200 bg-base-50/50 backdrop-blur-md z-20 shrink-0">
        <div className="flex flex-col items-center gap-6">
            <div
                className="w-10 h-10 rounded-full bg-accent-terracotta flex items-center justify-center text-white font-bold text-xl mb-4">
                C</div>

            <a href="#"
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-text-muted hover:bg-base-100 transition-colors"
                title="홈">
                <i className="ph ph-squares-four text-2xl"></i>
            </a>
            <a href="#"
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-text-muted hover:bg-base-100 transition-colors"
                title="성능 모니터링">
                <i className="ph ph-gauge text-2xl"></i>
            </a>
            {/* Active menu */}
            <a href="#"
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-accent-terracotta bg-base-100 transition-colors relative"
                title="감시망 (Argos)">
                <i className="ph ph-eye text-2xl"></i>
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-accent-coral pulse-ring"></div>
            </a>
            <a href="#"
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-text-muted hover:bg-base-100 transition-colors"
                title="보안 기밀">
                <i className="ph ph-shield-check text-2xl"></i>
            </a>
        </div>
        <div>
            <img src="https://i.pravatar.cc/100?img=11" alt="Profile"
                className="w-10 h-10 rounded-full border border-base-300" />
        </div>
    </aside>

    {/* Map & Live Feed Section */}
    <aside className="w-[480px] border-r border-base-200 bg-[#fcfbf9] flex flex-col h-full z-10 shrink-0">

        <div className="p-8 pb-6 border-b border-base-200">
            <div className="flex justify-between items-center mb-1">
                <h2 className="text-2xl font-bold text-text-main tracking-tight">Argos Security</h2>
                <div
                    className="px-3 py-1 bg-accent-coral/10 text-accent-coral rounded-full text-[11px] font-bold flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-accent-coral pulse-ring"></div> 위협 탐지 활성화됨
                </div>
            </div>
            <p className="text-[11px] text-text-muted">실시간 에이전트 이상 행동 및 API 엑세스 거부 로그</p>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar bg-base-50/30">

            {/* Geo/IP Threat Visualizer (Mock) */}
            <div
                className="h-64 border-b border-base-200 relative overflow-hidden bg-base-100 flex items-center justify-center">
                <div className="absolute inset-0 opacity-20"
                    style={{backgroundImage: "radial-gradient(circle at 1px 1px, #2c2c2c 1px, transparent 0)", backgroundSize: "20px 20px"}}>
                </div>

                <i className="ph ph-globe-hemisphere-east text-9xl text-base-300 opacity-50 relative z-0"></i>

                {/* Mock Alerts on map */}
                <div className="absolute top-1/3 left-1/4">
                    <div
                        className="w-3 h-3 bg-accent-coral rounded-full pulse-ring relative z-10 shadow-[0_0_10px_rgba(229,115,115,0.8)]">
                    </div>
                    <div
                        className="absolute top-4 left-1/2 -translate-x-1/2 bg-white text-text-main text-[9px] font-bold px-2 py-0.5 rounded shadow-sm border border-accent-coral/30">
                        Russia (IP block)</div>
                </div>

                <div className="absolute top-1/2 right-1/3">
                    <div className="w-2 h-2 bg-accent-amber rounded-full relative z-10 opacity-70"></div>
                </div>
            </div>

            {/* Live Feed (API: GET /api/workspace/argos/live) */}
            <div className="p-4">
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4 px-2">실시간 이벤트 스트림</h3>

                <div className="space-y-2">
                    {/* Critical Alert */}
                    <div
                        className="bg-white border-l-4 border-l-accent-coral border-y border-r border-y-base-200 border-r-base-200 rounded-lg p-3 shadow-sm select-none">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-[11px] font-bold text-accent-coral">UNAUTHORIZED_ACCESS_ATTEMPT</span>
                            <span className="text-[10px] text-text-muted font-mono">14초 전</span>
                        </div>
                        <p className="text-xs text-text-main font-medium mb-1">[영업부 에이전트]가 권한이 없는 'Q3 재무 기밀 데이터(Classified)'
                            RAG 벡터 조회 시도.</p>
                        <p className="text-[10px] text-text-muted font-mono bg-base-50 inline-block px-1.5 py-0.5 rounded">
                            Action: Blocked by RBAC Middleware</p>
                    </div>

                    {/* Warning Alert */}
                    <div
                        className="bg-white border-l-4 border-l-accent-amber border-y border-r border-y-base-200 border-r-base-200 rounded-lg p-3 shadow-sm select-none">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-[11px] font-bold text-accent-amber">RATE_LIMIT_EXCEEDED</span>
                            <span className="text-[10px] text-text-muted font-mono">3분 전</span>
                        </div>
                        <p className="text-xs text-text-main font-medium mb-1">[웹 스크래핑 봇]의 외부 타겟 도메인 요청이 초당 50회를 초과.</p>
                    </div>

                    {/* Info Event */}
                    <div className="bg-base-50 border border-base-200 rounded-lg p-3 select-none opacity-70">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-[11px] font-bold text-text-muted">NEW_DEVICE_LOGIN</span>
                            <span className="text-[10px] text-text-muted font-mono">15분 전</span>
                        </div>
                        <p className="text-xs text-text-main mb-1">관리자 계정(admin@)이 새로운 IP 주소에서 사령관실에 접근했습니다.</p>
                    </div>
                </div>
            </div>

        </div>
    </aside>

    {/* Main Table / Investigation Area (API: GET /api/workspace/argos/incidents) */}
    <main className="flex-1 overflow-y-auto px-10 py-10 bg-[#fcfbf9]/50 relative hide-scrollbar">

        <div className="flex justify-between items-end mb-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-text-main">Anomaly Detection (이상 탐지)</h1>
                <p className="text-text-muted mt-1 text-sm">에이전트 할루시네이션(환각) 및 프롬프트 인젝션 공격 시도 로그를 감사합니다.</p>
            </div>

            <button
                className="bg-white border border-base-200 text-text-main px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-base-50 transition-colors flex items-center gap-2">
                <i className="ph ph-export"></i> 보고서 반출
            </button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="panel p-6">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">프롬프트 인젝션 방어</span>
                <div className="flex items-end gap-2 text-text-main font-bold">
                    <span className="text-4xl">14</span>
                    <span className="text-sm text-text-muted mb-1">건 (이번 주)</span>
                </div>
            </div>
            <div className="panel p-6">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">데이터 유출(DLP)
                    차단</span>
                <div className="flex items-end gap-2 text-text-main font-bold">
                    <span className="text-4xl">3</span>
                    <span className="text-sm text-text-muted mb-1">건 (이번 주)</span>
                </div>
            </div>
            <div className="panel p-6 bg-accent-coral/5 border-accent-coral/20">
                <span className="text-xs font-bold text-accent-coral uppercase tracking-wider block mb-2">격리된 에이전트 수</span>
                <div className="flex items-end gap-2 text-text-main font-bold">
                    <span className="text-4xl flex items-center gap-2">1 <div
                            className="w-2 h-2 rounded-full bg-accent-coral pulse-ring"></div></span>
                </div>
            </div>
        </div>

        {/* Incident Table */}
        <div className="panel overflow-hidden">
            <div className="px-6 py-4 border-b border-base-200 flex justify-between items-center bg-base-50">
                <h3 className="font-bold text-text-main">위협 이벤트 로그</h3>
                <div className="relative">
                    <i className="ph ph-funnel absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm"></i>
                    <select
                        className="bg-white border border-base-200 outline-none text-xs font-bold pl-8 pr-4 py-1.5 rounded-lg text-text-main shadow-sm cursor-pointer">
                        <option>모든 위험도</option>
                        <option>Critical (심각)</option>
                        <option>Warning (경고)</option>
                    </select>
                </div>
            </div>

            <table className="w-full text-left border-collapse">
                <thead>
                    <tr
                        className="bg-base-50/50 text-[10px] uppercase tracking-wider text-text-muted border-b border-base-200">
                        <th className="px-6 py-3 font-bold">발생 시간</th>
                        <th className="px-6 py-3 font-bold">에이전트 / 소스</th>
                        <th className="px-6 py-3 font-bold">이벤트 유형</th>
                        <th className="px-6 py-3 font-bold">위험도</th>
                        <th className="px-6 py-3 font-bold">조치 상태</th>
                        <th className="px-6 py-3"></th>
                    </tr>
                </thead>
                <tbody className="text-sm text-text-main divide-y divide-base-100">

                    <tr className="hover:bg-base-50 transition-colors group">
                        <td className="px-6 py-4 font-mono text-[11px] text-text-muted">2026-10-15 14:02:11</td>
                        <td className="px-6 py-4 font-medium flex items-center gap-2">
                            <div
                                className="w-6 h-6 rounded-full bg-[#fdece6] flex items-center justify-center text-accent-terracotta text-[10px] font-bold">
                                M</div>
                            마케팅부장
                        </td>
                        <td className="px-6 py-4">허가되지 않은 Classified 문서 접근 시도</td>
                        <td className="px-6 py-4">
                            <span
                                className="px-2 py-1 rounded bg-accent-coral/10 text-accent-coral text-[10px] font-bold uppercase">Critical</span>
                        </td>
                        <td className="px-6 py-4">
                            <span className="flex items-center gap-1.5 text-text-muted text-xs font-medium"><i
                                    className="ph ph-shield text-accent-green"></i> RBAC 차단됨</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button
                                className="w-8 h-8 rounded-lg border border-transparent group-hover:border-base-200 bg-transparent group-hover:bg-white text-text-muted hover:text-text-main transition-all flex items-center justify-center pointer-events-none group-hover:pointer-events-auto opacity-0 group-hover:opacity-100"><i
                                    className="ph ph-magnifying-glass"></i></button>
                        </td>
                    </tr>

                    <tr className="hover:bg-base-50 transition-colors group">
                        <td className="px-6 py-4 font-mono text-[11px] text-text-muted">2026-10-15 11:45:00</td>
                        <td className="px-6 py-4 font-medium flex items-center gap-2">
                            <div
                                className="w-6 h-6 rounded-full bg-base-200 flex items-center justify-center text-text-muted text-[10px] font-bold">
                                <i className="ph ph-robot"></i></div>
                            CS_Bot_01
                        </td>
                        <td className="px-6 py-4">프롬프트 외부 유출 (Jailbreak) 시도 탐지</td>
                        <td className="px-6 py-4">
                            <span
                                className="px-2 py-1 rounded bg-accent-coral/10 text-accent-coral text-[10px] font-bold uppercase">Critical</span>
                        </td>
                        <td className="px-6 py-4">
                            <span className="flex items-center gap-1.5 text-text-main text-xs font-bold"><i
                                    className="ph ph-warning-octagon text-accent-coral"></i> 샌드박스 격리됨</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button
                                className="w-8 h-8 rounded-lg border border-transparent group-hover:border-base-200 bg-transparent group-hover:bg-white text-text-muted hover:text-text-main transition-all flex items-center justify-center pointer-events-none group-hover:pointer-events-auto opacity-0 group-hover:opacity-100"><i
                                    className="ph ph-magnifying-glass"></i></button>
                        </td>
                    </tr>

                    <tr className="hover:bg-base-50 transition-colors group">
                        <td className="px-6 py-4 font-mono text-[11px] text-text-muted">2026-10-14 20:10:05</td>
                        <td className="px-6 py-4 font-medium flex items-center gap-2">
                            <div
                                className="w-6 h-6 rounded-full bg-[#10a37f]/10 flex items-center justify-center text-[#10a37f] text-[10px] font-bold">
                                <i className="ph ph-api"></i></div>
                            오픈 API 엔드포인트
                        </td>
                        <td className="px-6 py-4">비정상적인 트래픽 급증 (DDoS 예비 징후)</td>
                        <td className="px-6 py-4">
                            <span
                                className="px-2 py-1 rounded bg-accent-amber/10 text-accent-amber text-[10px] font-bold uppercase">Warning</span>
                        </td>
                        <td className="px-6 py-4">
                            <span className="flex items-center gap-1.5 text-text-muted text-xs font-medium"><i
                                    className="ph ph-check-circle"></i> 자동 Rate Limit 적용</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button
                                className="w-8 h-8 rounded-lg border border-transparent group-hover:border-base-200 bg-transparent group-hover:bg-white text-text-muted hover:text-text-main transition-all flex items-center justify-center pointer-events-none group-hover:pointer-events-auto opacity-0 group-hover:opacity-100"><i
                                    className="ph ph-magnifying-glass"></i></button>
                        </td>
                    </tr>

                </tbody>
            </table>
        </div>

    </main>
    </>
  );
}

export default AppArgos;
