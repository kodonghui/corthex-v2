"use client";
import React from "react";

const styles = `
body {
            background-color: #0a0a0f; color: #f3f4f6;
            background-image: radial-gradient(circle at 15% 50%, rgba(168, 85, 247, 0.05), transparent 25%),
                              radial-gradient(circle at 85% 30%, rgba(34, 211, 238, 0.05), transparent 25%);
            background-attachment: fixed; font-weight: 300; line-height: 1.5;
        }
        .num-bold { font-family: 'JetBrains Mono', monospace; font-weight: 700; letter-spacing: -0.05em; }
        .glass-panel {
            background-color: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 1rem;
        }
        .btn-primary {
            background: linear-gradient(135deg, #a855f7 0%, #22d3ee 100%);
            color: white; border: none; border-radius: 0.5rem; padding: 0.5rem 1rem;
            font-weight: 500; transition: all 0.3s ease; cursor: pointer; text-sm;
            box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3); text-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }
        .btn-glass {
            background-color: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);
            color: white; border-radius: 0.5rem; padding: 0.4rem 0.8rem;
            transition: all 0.3s ease; backdrop-filter: blur(8px); cursor: pointer; font-weight: 400; text-sm;
        }
        .btn-glass:hover { background-color: rgba(255, 255, 255, 0.1); }
        .btn-icon { background: transparent; border: 1px solid transparent; color: #9ca3af; border-radius: 0.5rem; padding: 0.5rem; transition: all 0.2s ease; cursor: pointer; }
        .btn-icon:hover { color: white; background-color: rgba(255, 255, 255, 0.05); }
        
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 3px; }

        .timeline-container { position: relative; }
        .timeline-container::before {
            content: ''; position: absolute; top: 0; bottom: 0; left: 19px; width: 2px;
            background: linear-gradient(to bottom, rgba(34, 211, 238, 0.5), rgba(255, 255, 255, 0.05));
        }
        
        .log-item { position: relative; padding-left: 3rem; margin-bottom: 1.5rem; transition: all 0.2s ease; }
        .log-item:hover { transform: translateX(4px); }
        
        .log-icon-wrapper {
            position: absolute; left: 0; top: 0; width: 40px; height: 40px;
            border-radius: 50%; background-color: #151525; border: 2px solid #0a0a0f;
            display: flex; align-items: center; justify-center; z-index: 10;
        }
`;

function ActivityLog() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Sidebar Navigation */}
    <aside className="w-64 flex flex-col border-r border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl h-full shrink-0 relative z-20 hidden md:flex">
        <div className="p-6">
            <h1 className="text-xl font-bold tracking-tight text-white mb-2">CORTHEX <span className="text-xs font-normal text-white/40 ml-1">v2</span></h1>
        </div>

        <div className="p-4 flex-1 overflow-y-auto w-full">
            <div className="mb-4">
                <div className="text-xs text-white/30 font-semibold mb-2 px-2 uppercase tracking-wider">Workspace</div>
                <nav className="space-y-1">
                    <a href="/app/home" className="flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <i className="fas fa-home w-4"></i> <span>홈</span>
                    </a>
                </nav>
            </div>
            
            <div className="mb-4">
                <div className="text-xs text-white/30 font-semibold mb-2 px-2 uppercase tracking-wider">Audit & History</div>
                <nav className="space-y-1">
                    <a href="/app/ops-log" className="flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <i className="fas fa-list-alt w-4"></i> <span>작업 로그 (Ops Log)</span>
                    </a>
                    <a href="/app/activity-log" className="flex items-center gap-3 px-3 py-2 text-white bg-white/10 rounded-lg border border-white/10 transition-colors">
                        <i className="fas fa-history w-4 text-accent-cyan"></i> <span>활동 로그 (Activity)</span>
                    </a>
                </nav>
            </div>
        </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 overflow-hidden flex flex-col bg-[#0a0a0f] relative">
        <header className="p-8 pb-6 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-md shrink-0 z-10">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-semibold mb-2">워크스페이스 활동 로그</h2>
                    {/* API: GET /api/workspace/activity */}
                    <p className="text-white/40 text-sm">팀원(인간) 및 시스템의 주요 변경 사항, 권한 설정, 로그인 기록을 시간순으로 추적합니다.</p>
                </div>
                <div className="flex gap-2">
                    <button className="btn-glass"><i className="fas fa-filter text-xs mr-2"></i>필터</button>
                    <button className="btn-glass"><i className="fas fa-download text-xs mr-2"></i>CSV 내보내기</button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mt-6 overflow-x-auto pb-2 scrollbar-hide text-xs">
                <button className="bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30 px-3 py-1.5 rounded-full font-medium whitespace-nowrap">모든 이벤트</button>
                <button className="bg-white/5 hover:bg-white/10 text-white/60 border border-white/10 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors">보안 (Auth)</button>
                <button className="bg-white/5 hover:bg-white/10 text-white/60 border border-white/10 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors">에이전트 변경 (Agents)</button>
                <button className="bg-white/5 hover:bg-white/10 text-white/60 border border-white/10 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors">시스템 (System)</button>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 lg:px-12">
            
            <div className="max-w-4xl mx-auto timeline-container">
                
                {/* Date Divider */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="text-xs font-bold text-white/50 bg-black/50 px-3 py-1 rounded-full border border-white/10 z-10 relative">오늘 (Today)</div>
                    <div className="flex-1 border-t border-white/5"></div>
                </div>

                {/* Log Item: User Login */}
                <div className="log-item">
                    <div className="log-icon-wrapper text-blue-400 border-blue-400/30">
                        <i className="fas fa-sign-in-alt text-sm"></i>
                    </div>
                    <div className="glass-panel p-4 flex justify-between items-start gap-4">
                        <div>
                            <div className="text-sm text-white mb-1"><span className="font-bold text-blue-300">이관리자(Admin)</span>님이 워크스페이스에 로그인했습니다.</div>
                            <div className="text-xs text-white/40 flex items-center gap-3">
                                <span><i className="fas fa-map-marker-alt mr-1"></i> Seoul, KR (112.144.xxx.xx)</span>
                                <span><i className="fab fa-chrome mr-1"></i> Chrome / Mac OS</span>
                            </div>
                        </div>
                        <div className="text-xs text-white/30 font-mono shrink-0">14:22:05 KST</div>
                    </div>
                </div>

                {/* Log Item: Agent Config Change */}
                <div className="log-item">
                    <div className="log-icon-wrapper text-accent-purple border-accent-purple/30">
                        <i className="fas fa-robot text-sm"></i>
                    </div>
                    <div className="glass-panel p-4 flex justify-between items-start gap-4 border border-accent-purple/20 bg-accent-purple/5">
                        <div className="w-full">
                            <div className="text-sm text-white mb-2"><span className="font-bold">김개발(Developer)</span>님이 에이전트 구성을 변경했습니다.</div>
                            
                            {/* Detail Payload / Diff */}
                            <div className="bg-black/40 border border-white/10 rounded overflow-hidden text-xs mt-2">
                                <div className="bg-white/5 px-3 py-1.5 border-b border-white/5 text-white/60 font-mono">Target: @data_analyst (데이터분석가)</div>
                                <div className="p-3 font-mono space-y-1">
                                    <div className="text-red-400">- model: "gpt-4"</div>
                                    <div className="text-green-400">+ model: "gpt-4o"</div>
                                    <div className="text-green-400">+ temperature: 0.2</div>
                                </div>
                            </div>
                        </div>
                        <div className="text-xs text-white/30 font-mono shrink-0">11:05:12 KST</div>
                    </div>
                </div>

                {/* Log Item: API Key Created */}
                <div className="log-item">
                    <div className="log-icon-wrapper text-yellow-400 border-yellow-400/30 shadow-[0_0_10px_rgba(250,204,21,0.2)]">
                        <i className="fas fa-key text-sm"></i>
                    </div>
                    <div className="glass-panel p-4 flex justify-between items-start gap-4">
                        <div>
                            <div className="text-sm text-white mb-1"><span className="font-bold">시스템(System)</span>이 새 API 키를 발급했습니다.</div>
                            <div className="text-xs text-white/40">생성자: 이관리자(Admin) | 목적: 외부 연동용 (Read Only)</div>
                        </div>
                        <div className="text-xs text-white/30 font-mono shrink-0">09:15:00 KST</div>
                    </div>
                </div>

                {/* Date Divider */}
                <div className="flex items-center gap-4 mb-8 mt-8">
                    <div className="text-xs font-bold text-white/50 bg-black/50 px-3 py-1 rounded-full border border-white/10 z-10 relative">어제 (Yesterday)</div>
                    <div className="flex-1 border-t border-white/5"></div>
                </div>

                {/* Log Item: Workflow Error (Warning) */}
                <div className="log-item">
                    <div className="log-icon-wrapper text-red-400 border-red-400/30 bg-red-400/5 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                        <i className="fas fa-exclamation-triangle text-sm"></i>
                    </div>
                    <div className="glass-panel p-4 flex justify-between items-start gap-4 border border-red-400/20">
                        <div>
                            <div className="text-sm text-red-300 font-medium mb-1">워크플로우 실행 중 오류가 발생했습니다.</div>
                            <div className="text-xs text-white/50">Workflow: "일일 리포트 자동 생성" [ID: w-7281]</div>
                            <div className="text-xs font-mono text-red-400/70 bg-black/40 px-2 py-1 rounded mt-2 border border-red-400/10">Error: Database connection timed out after 30000ms</div>
                        </div>
                        <div className="text-xs text-white/30 font-mono shrink-0">23:55:01 KST</div>
                    </div>
                </div>

                {/* Log Item: File Upload */}
                <div className="log-item">
                    <div className="log-icon-wrapper text-emerald-400 border-emerald-400/30">
                        <i className="fas fa-file-upload text-sm"></i>
                    </div>
                    <div className="glass-panel p-4 flex justify-between items-start gap-4">
                        <div>
                            <div className="text-sm text-white mb-1"><span className="font-bold">최영업(Sales)</span>님이 지식 베이스에 새 문서를 업로드했습니다.</div>
                            <div className="text-xs text-white/40 flex items-center gap-2">
                                <i className="fas fa-file-pdf text-red-400"></i> 제품매뉴얼_v3.pdf (2.4MB)
                            </div>
                        </div>
                        <div className="text-xs text-white/30 font-mono shrink-0">15:30:22 KST</div>
                    </div>
                </div>

            </div>

            {/* Load More */}
            <div className="text-center mt-8 pb-8">
                <button className="btn-glass !py-2 !px-6 text-xs text-white/50 hover:text-white"><i className="fas fa-sync-alt mr-2"></i> 더 이전 기록 불러오기</button>
            </div>

        </div>

    </main>
    </>
  );
}

export default ActivityLog;
