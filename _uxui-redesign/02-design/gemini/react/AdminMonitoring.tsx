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

        @keyframes pulse-ring-green {
            0% {
                box-shadow: 0 0 0 0 rgba(129, 178, 154, 0.7);
            }

            70% {
                box-shadow: 0 0 0 6px rgba(129, 178, 154, 0);
            }

            100% {
                box-shadow: 0 0 0 0 rgba(129, 178, 154, 0);
            }
        }

        .pulse-ring-green {
            animation: pulse-ring-green 2s infinite;
        }

        @keyframes pulse-ring-amber {
            0% {
                box-shadow: 0 0 0 0 rgba(244, 162, 97, 0.7);
            }

            70% {
                box-shadow: 0 0 0 6px rgba(244, 162, 97, 0);
            }

            100% {
                box-shadow: 0 0 0 0 rgba(244, 162, 97, 0);
            }
        }

        .pulse-ring-amber {
            animation: pulse-ring-amber 2s infinite;
        }
`;

function AdminMonitoring() {
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

                <div className="pt-6 pb-2 px-4 text-[11px] font-bold text-base-300 uppercase tracking-wider">시스템 및 로깅</div>
                {/* Active menu */}
                <a href="#"
                    className="flex items-center gap-3 px-4 py-3 font-medium text-accent-terracotta bg-white rounded-xl border border-[#e8e4d9] shadow-sm transition-colors">
                    <i className="ph ph-activity text-lg"></i> System Monitoring
                </a>
                <a href="/admin/security-logs"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-shield-warning text-lg"></i> Security Logs
                </a>
            </nav>
        </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 overflow-y-auto px-12 py-10 relative hide-scrollbar">

        <header
            className="flex justify-between items-end mb-8 sticky top-0 bg-[#f5f3ec]/90 backdrop-blur-md z-10 pt-2 pb-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-text-main">Global APM & Monitoring</h1>
                <p className="text-text-muted mt-2 text-sm">플랫폼 인프라, LLM 모델 지연 시간(Latency) 및 리소스 병목 현상을 실시간으로 추적합니다.</p>
            </div>

            <div className="flex items-center gap-3">
                <span
                    className="text-xs font-bold text-text-muted flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#e8e4d9]">
                    <div className="w-2 h-2 rounded-full bg-accent-green pulse-ring-green"></div> Live Data
                </span>
                <button
                    className="bg-base-200 text-text-main px-4 py-2.5 rounded-xl text-sm font-bold shadow-soft hover:bg-[#d5cfc1] transition-colors"><i
                        className="ph ph-arrows-clockwise text-lg"></i></button>
            </div>
        </header>

        {/* Service Health */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="panel p-6 flex flex-col items-center justify-center text-center">
                <div
                    className="w-16 h-16 rounded-full bg-[#f0f9f4] border-4 border-white shadow-soft flex items-center justify-center text-accent-green text-3xl mb-4">
                    <i className="ph ph-api"></i></div>
                <h3 className="font-bold text-text-main text-lg">Platform API</h3>
                <p className="text-sm text-text-muted mt-1 font-mono">99.99% Uptime</p>
                <div
                    className="mt-4 text-[10px] font-bold text-accent-green bg-[#f0f9f4] px-3 py-1 rounded-full uppercase tracking-wider">
                    Operational</div>
            </div>
            <div className="panel p-6 flex flex-col items-center justify-center text-center">
                <div
                    className="w-16 h-16 rounded-full bg-[#fffcf0] border-4 border-white shadow-soft flex items-center justify-center text-accent-amber text-3xl mb-4">
                    <i className="ph ph-brain"></i></div>
                <h3 className="font-bold text-text-main text-lg">LLM Orchestrator</h3>
                <p className="text-sm text-text-muted mt-1 font-mono">Avg Latency: 2.4s</p>
                <div
                    className="mt-4 text-[10px] font-bold text-accent-amber bg-[#fffcf0] px-3 py-1 rounded-full uppercase tracking-wider">
                    Degraded</div>
            </div>
            <div className="panel p-6 flex flex-col items-center justify-center text-center">
                <div
                    className="w-16 h-16 rounded-full bg-[#f0f9f4] border-4 border-white shadow-soft flex items-center justify-center text-accent-green text-3xl mb-4">
                    <i className="ph ph-database"></i></div>
                <h3 className="font-bold text-text-main text-lg">Neon DB Cluster</h3>
                <p className="text-sm text-text-muted mt-1 font-mono">Pool Usage: 42%</p>
                <div
                    className="mt-4 text-[10px] font-bold text-accent-green bg-[#f0f9f4] px-3 py-1 rounded-full uppercase tracking-wider">
                    Operational</div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Active Agents / Memory */}
            <div className="panel p-0 flex flex-col h-[350px]">
                <div className="p-6 border-b border-[#e8e4d9] flex justify-between items-center bg-[#fcfbf9]">
                    <h3 className="text-sm font-bold text-text-main">Agent Memory Load (Vector DB)</h3>
                    <span className="text-xs text-text-muted font-mono"><i className="ph ph-clock"></i> Last 6 hours</span>
                </div>
                <div className="flex-1 p-6 relative">
                    {/* Placeholder for Chart */}
                    <div className="absolute inset-x-6 top-6 bottom-6 flex items-end gap-2">
                        <div className="w-full bg-[#f0f9f4] rounded-t-sm" style={{height: "30%"}}></div>
                        <div className="w-full bg-[#f0f9f4] rounded-t-sm" style={{height: "35%"}}></div>
                        <div className="w-full bg-[#f0f9f4] rounded-t-sm" style={{height: "40%"}}></div>
                        <div className="w-full bg-[#f0f9f4] rounded-t-sm" style={{height: "42%"}}></div>
                        <div className="w-full bg-[#f0f9f4] rounded-t-sm" style={{height: "38%"}}></div>
                        <div className="w-full bg-[#f0f9f4] rounded-t-sm" style={{height: "45%"}}></div>
                        <div className="w-full bg-[#f0f9f4] rounded-t-sm" style={{height: "52%"}}></div>
                        <div className="w-full bg-[#f0f9f4] rounded-t-sm" style={{height: "55%"}}></div>
                        <div className="w-full bg-[#f0f9f4] rounded-t-sm" style={{height: "50%"}}></div>
                        <div className="w-full bg-[#fdb29e] rounded-t-sm opacity-80" style={{height: "75%"}}></div>
                        <div className="w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZTA3YTVmIiBmaWxsLW9wYWNpdHk9IjAuMSI+PC9yZWN0Pgo8cGF0aCBkPSJNMCAwTDggOFpNOCAwTDAgOFoiIHN0cm9rZT0iI2UwN2E1ZiIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIwLjMiPjwvcGF0aD4KPC9zdmc+')] rounded-t-sm"
                            style={{height: "85%"}}></div>
                        <div className="w-full bg-[#fdb29e] rounded-t-sm opacity-80" style={{height: "65%"}}></div>
                        <div className="w-full bg-[#f0f9f4] rounded-t-sm" style={{height: "40%"}}></div>
                    </div>
                </div>
            </div>

            {/* Error Spikes */}
            <div className="panel p-0 flex flex-col h-[350px]">
                <div className="p-6 border-b border-[#e8e4d9] flex justify-between items-center bg-[#fcfbf9]">
                    <h3 className="text-sm font-bold text-text-main flex items-center gap-2"><i
                            className="ph ph-warning-circle text-accent-terracotta"></i> Recent Error Spikes</h3>
                    <button className="text-xs font-bold text-text-muted hover:text-text-main"><i
                            className="ph ph-dots-three text-lg"></i></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 hide-scrollbar space-y-3">

                    <div className="bg-[#fffcf0] border border-accent-amber/30 p-4 rounded-xl">
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-text-main text-xs font-mono">OpenAI API Rate Limit Hit</h4>
                            <span className="text-[10px] text-text-muted">12 mins ago</span>
                        </div>
                        <p className="text-[11px] text-text-muted">Tenant `ten_4b2c1_gret` triggered 429 Too Many Requests
                            on gpt-4-turbo endpoint.</p>
                    </div>

                    <div className="bg-[#fcfbf9] border border-[#e8e4d9] p-4 rounded-xl">
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-text-main text-xs font-mono">Agent Timeout</h4>
                            <span className="text-[10px] text-text-muted">45 mins ago</span>
                        </div>
                        <p className="text-[11px] text-text-muted">Agent `SEO_Analyzer` failed to return response within 60s
                            threshold.</p>
                    </div>

                    <div className="bg-[#fcfbf9] border border-[#e8e4d9] p-4 rounded-xl">
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-text-main text-xs font-mono">DB Connection Pool High</h4>
                            <span className="text-[10px] text-text-muted">2 hours ago</span>
                        </div>
                        <p className="text-[11px] text-text-muted">Neon DB connection pool reached 85% capacity for 5
                            minutes.</p>
                    </div>

                </div>
            </div>

        </div>

    </main>
    </>
  );
}

export default AdminMonitoring;
