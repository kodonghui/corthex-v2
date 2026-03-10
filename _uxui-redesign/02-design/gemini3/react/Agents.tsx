"use client";
import React from "react";

const styles = `
body {
            background-color: #0a0a0f;
            color: #f3f4f6;
            background-image: radial-gradient(circle at 15% 50%, rgba(168, 85, 247, 0.05), transparent 25%),
                radial-gradient(circle at 85% 30%, rgba(34, 211, 238, 0.05), transparent 25%);
            background-attachment: fixed;
            font-weight: 300;
            line-height: 1.5;
        }

        .num-bold {
            font-family: 'JetBrains Mono', monospace;
            font-weight: 700;
            letter-spacing: -0.05em;
        }

        .glass-panel {
            background-color: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 1rem;
        }

        .glass-panel-hover {
            transition: all 0.3s ease;
        }

        .glass-panel-hover:hover {
            background-color: rgba(255, 255, 255, 0.08);
            border-color: rgba(255, 255, 255, 0.15);
            transform: translateY(-2px);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
        }

        .btn-primary {
            background: linear-gradient(135deg, #a855f7 0%, #22d3ee 100%);
            color: white;
            border: none;
            border-radius: 0.5rem;
            padding: 0.5rem 1rem;
            font-weight: 500;
            transition: all 0.3s ease;
            cursor: pointer;
            text-sm;
            box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .btn-glass {
            background-color: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: white;
            border-radius: 0.5rem;
            padding: 0.4rem 0.8rem;
            transition: all 0.3s ease;
            backdrop-filter: blur(8px);
            cursor: pointer;
            font-weight: 400;
            text-sm;
        }

        .btn-glass:hover {
            background-color: rgba(255, 255, 255, 0.1);
        }

        .btn-icon {
            background: transparent;
            border: 1px solid transparent;
            color: #9ca3af;
            border-radius: 0.5rem;
            padding: 0.5rem;
            transition: all 0.2s ease;
            cursor: pointer;
        }

        .btn-icon:hover {
            color: white;
            background-color: rgba(255, 255, 255, 0.05);
        }

        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }

        ::-webkit-scrollbar-track {
            background: transparent;
        }

        ::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
        }
`;

function Agents() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Sidebar Navigation */}
    <aside
        className="w-64 flex flex-col border-r border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl h-full shrink-0 relative z-20">
        <div className="p-6">
            <h1 className="text-xl font-bold tracking-tight text-white mb-2">CORTHEX <span
                    className="text-xs font-normal text-white/40 ml-1">v2</span></h1>
        </div>

        <div className="p-4 flex-1 overflow-y-auto w-full">
            <div className="mb-4">
                <div className="text-xs text-white/30 font-semibold mb-2 px-2 uppercase tracking-wider">Workspace</div>
                <nav className="space-y-1">
                    <a href="/app/home"
                        className="flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <i className="fas fa-home w-4"></i> <span>홈</span>
                    </a>
                    <a href="/app/command-center"
                        className="flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <i className="fas fa-terminal w-4"></i> <span>사령관실</span>
                    </a>
                </nav>
            </div>

            <div className="mb-4">
                <div className="text-xs text-white/30 font-semibold mb-2 px-2 uppercase tracking-wider">Organization</div>
                <nav className="space-y-1">
                    <a href="#"
                        className="flex items-center gap-3 px-3 py-2 text-white bg-white/10 rounded-lg border border-white/10 transition-colors">
                        <i className="fas fa-robot w-4 text-accent-cyan"></i> <span>에이전트 목록</span>
                    </a>
                    <a href="/app/departments"
                        className="flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <i className="fas fa-sitemap w-4"></i> <span>부서 조직도</span>
                    </a>
                </nav>
            </div>
        </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 overflow-y-auto p-8 relative">
        <header className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
            <div>
                <h2 className="text-3xl font-semibold mb-1">에이전트 디렉토리</h2>
                {/* API: GET /api/workspace/agents */}
                <p className="text-white/40 text-sm">워크스페이스에 배포된 모든 AI 에이전트의 상태를 확인하고 관리합니다.</p>
            </div>
            <div className="flex gap-2">
                <div className="relative w-64">
                    <i
                        className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-white/30 text-xs"></i>
                    <input type="text"
                        className="w-full bg-black/40 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-sm text-white focus:outline-none focus:border-accent-cyan/50 transition-colors"
                        placeholder="에이전트 이름/역할 검색..." />
                </div>
                <button className="btn-glass"><i className="fas fa-filter text-xs mr-2"></i>필터</button>
                <button className="btn-primary"><i className="fas fa-plus mr-2 text-xs"></i>고용하기</button>
            </div>
        </header>

        {/* Department Quick Filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
            <button
                className="btn-glass !py-1.5 active bg-accent-cyan/10 border-accent-cyan/30 text-accent-cyan whitespace-nowrap">전체
                표기 (12)</button>
            <button className="btn-glass !py-1.5 whitespace-nowrap">전략기획실 (3)</button>
            <button className="btn-glass !py-1.5 whitespace-nowrap">마케팅부 (2)</button>
            <button className="btn-glass !py-1.5 whitespace-nowrap">엔지니어링 (4)</button>
            <button className="btn-glass !py-1.5 whitespace-nowrap">법무/지원 (3)</button>
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

            {/* Agent Card (System/C-Level) */}
            <div
                className="glass-panel-hover glass-panel p-5 relative overflow-hidden flex flex-col group cursor-pointer border-accent-cyan/30">
                <div
                    className="absolute inset-0 bg-gradient-to-b from-accent-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                </div>

                <div className="relative z-10 flex justify-between items-start mb-4">
                    <div className="relative">
                        <div
                            className="w-14 h-14 rounded-full bg-base-200 border-2 border-accent-cyan flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                            <i className="fas fa-user-tie text-accent-cyan text-xl"></i>
                        </div>
                        <div
                            className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-[#151525] rounded-full shadow-[0_0_8px_rgba(74,222,128,0.8)]">
                        </div>
                    </div>
                    <button className="btn-icon !p-1 text-white/30 hover:text-white"><i
                            className="fas fa-ellipsis-h"></i></button>
                </div>

                <div className="relative z-10 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-medium text-white">비서실장</h3>
                        <i className="fas fa-crown text-yellow-400 text-xs" title="시스템 코어"></i>
                    </div>
                    <div className="flex gap-1 mb-3">
                        <span
                            className="bg-white/10 text-white/60 text-[10px] px-1.5 py-0.5 rounded border border-white/10">CEO
                            직속</span>
                        <span
                            className="bg-accent-purple/20 text-accent-purple text-[10px] px-1.5 py-0.5 rounded border border-accent-purple/30">Manager</span>
                    </div>
                    <p className="text-xs text-white/50 line-clamp-2 leading-relaxed mb-4">모든 지시사항을 해석하고 하위 부서로 업무를 위임하는 최상위
                        오케스트레이터입니다.</p>
                </div>

                <div className="relative z-10 border-t border-white/5 pt-4 mt-auto">
                    <div className="flex justify-between items-center text-xs mb-3">
                        <span className="text-green-400"><i className="fas fa-bolt mr-1"></i>대기 중 (Idle)</span>
                        <span className="text-white/40"><i className="fas fa-coins mr-1 text-[10px]"></i>$12.5 (이번달)</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            className="flex-1 btn-glass !py-1.5 hover:bg-white/10 hover:text-white transition-colors text-white/70">명령하기</button>
                        <button
                            className="flex-1 btn-glass !py-1.5 hover:bg-white/10 hover:text-white transition-colors text-white/70">지식
                            주입</button>
                    </div>
                </div>
            </div>

            {/* Agent Card (Working) */}
            <div className="glass-panel-hover glass-panel p-5 relative overflow-hidden flex flex-col group cursor-pointer">
                <div
                    className="absolute inset-0 bg-gradient-to-b from-accent-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                </div>

                <div className="relative z-10 flex justify-between items-start mb-4">
                    <div className="relative">
                        <div
                            className="w-14 h-14 rounded-full bg-base-200 border border-white/20 flex items-center justify-center">
                            <i className="fas fa-chart-pie text-white/70 text-xl"></i>
                        </div>
                        <div
                            className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent-cyan border-2 border-[#151525] rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse">
                        </div>
                    </div>
                    <button className="btn-icon !p-1 text-white/30 hover:text-white"><i
                            className="fas fa-ellipsis-h"></i></button>
                </div>

                <div className="relative z-10 flex-1">
                    <h3 className="text-lg font-medium text-white mb-1">데이터분석가</h3>
                    <div className="flex gap-1 mb-3">
                        <span
                            className="bg-white/10 text-white/60 text-[10px] px-1.5 py-0.5 rounded border border-white/10">전략기획실</span>
                        <span
                            className="bg-blue-400/20 text-blue-400 text-[10px] px-1.5 py-0.5 rounded border border-blue-400/30">Specialist</span>
                    </div>
                    <p className="text-xs text-white/50 line-clamp-2 leading-relaxed mb-4">내외부 데이터를 수집하여 통계적 유의성을 검증하고 시각화
                        리포트를 생성합니다.</p>
                </div>

                <div className="relative z-10 border-t border-white/5 pt-4 mt-auto">
                    <div className="flex justify-between items-center text-xs mb-3">
                        <span className="text-accent-cyan flex items-center gap-1.5"><i
                                className="fas fa-circle-notch fa-spin text-[10px]"></i> 분석 중</span>
                        <span className="text-white/40"><i className="fas fa-coins mr-1 text-[10px]"></i>$4.2 (이번달)</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            className="flex-1 btn-glass !py-1.5 hover:bg-white/10 hover:text-white transition-colors text-white/70">진행상황</button>
                        <button className="btn-glass !py-1.5 !px-3 hover:bg-white/10 text-white/70" title="설정"><i
                                className="fas fa-cog"></i></button>
                    </div>
                </div>
            </div>

            {/* Agent Card (Worker) */}
            <div className="glass-panel-hover glass-panel p-5 relative overflow-hidden flex flex-col group cursor-pointer">
                <div className="relative z-10 flex justify-between items-start mb-4">
                    <div className="relative">
                        <div
                            className="w-14 h-14 rounded-full bg-base-200 border border-white/20 flex items-center justify-center">
                            <i className="fas fa-pen-nib text-white/70 text-xl"></i>
                        </div>
                        <div
                            className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-[#151525] rounded-full">
                        </div>
                    </div>
                    <button className="btn-icon !p-1 text-white/30 hover:text-white"><i
                            className="fas fa-ellipsis-h"></i></button>
                </div>

                <div className="relative z-10 flex-1">
                    <h3 className="text-lg font-medium text-white mb-1">정작가</h3>
                    <div className="flex gap-1 mb-3">
                        <span
                            className="bg-white/10 text-white/60 text-[10px] px-1.5 py-0.5 rounded border border-white/10">마케팅부</span>
                        <span
                            className="bg-white/10 text-white/60 text-[10px] px-1.5 py-0.5 rounded border border-white/10">Worker</span>
                    </div>
                    <p className="text-xs text-white/50 line-clamp-2 leading-relaxed mb-4">블로그 포스트, SNS 문구 등 카피라이팅 초안을 대량으로
                        작성합니다.</p>
                </div>

                <div className="relative z-10 border-t border-white/5 pt-4 mt-auto">
                    <div className="flex justify-between items-center text-xs mb-3">
                        <span className="text-white/50"><i className="fas fa-bed mr-1"></i>휴식 중</span>
                        <span className="text-white/40"><i className="fas fa-coins mr-1 text-[10px]"></i>$1.8 (이번달)</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            className="flex-1 btn-glass !py-1.5 hover:bg-white/10 hover:text-white transition-colors text-white/70">명령하기</button>
                    </div>
                </div>
            </div>

            {/* Agent Card (Error Mode mock) */}
            <div
                className="glass-panel-hover glass-panel p-5 relative overflow-hidden flex flex-col group cursor-pointer bg-red-500/5 border-red-500/20">
                <div className="relative z-10 flex justify-between items-start mb-4">
                    <div className="relative">
                        <div
                            className="w-14 h-14 rounded-full bg-base-200 border border-red-500/50 flex items-center justify-center">
                            <i className="fas fa-code text-red-400 text-xl"></i>
                        </div>
                        <div
                            className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 border-2 border-[#151525] rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]">
                        </div>
                    </div>
                    <button className="btn-icon !p-1 text-white/30 hover:text-white"><i
                            className="fas fa-ellipsis-h"></i></button>
                </div>

                <div className="relative z-10 flex-1">
                    <h3 className="text-lg font-medium text-white mb-1">최데옵 (DevOps)</h3>
                    <div className="flex gap-1 mb-3">
                        <span
                            className="bg-white/10 text-white/60 text-[10px] px-1.5 py-0.5 rounded border border-white/10">엔지니어링</span>
                        <span
                            className="bg-blue-400/20 text-blue-400 text-[10px] px-1.5 py-0.5 rounded border border-blue-400/30">Specialist</span>
                    </div>
                    <p className="text-xs text-white/50 line-clamp-2 leading-relaxed mb-4">인프라 모니터링 및 CICD 파이프라인 관리를 수행합니다.
                        AWS 도구 연결됨.</p>
                </div>

                <div className="relative z-10 border-t border-white/5 pt-4 mt-auto">
                    <div className="flex justify-between items-center text-xs mb-3">
                        <span className="text-red-400"><i className="fas fa-exclamation-triangle mr-1"></i>API 연결 오류</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            className="flex-1 btn-glass !py-1.5 bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20 transition-colors">오류
                            확인</button>
                    </div>
                </div>
            </div>

        </div>

    </main>
    </>
  );
}

export default Agents;
