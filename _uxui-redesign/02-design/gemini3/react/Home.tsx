"use client";
import React from "react";

const styles = `
body {
            background-color: #0a0a0f;
            color: #f3f4f6;
            background-image: radial-gradient(circle at 15% 50%, rgba(168, 85, 247, 0.08), transparent 25%),
                radial-gradient(circle at 85% 30%, rgba(34, 211, 238, 0.08), transparent 25%);
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
            box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .btn-primary:hover {
            opacity: 0.95;
            box-shadow: 0 0 20px rgba(34, 211, 238, 0.5);
            transform: translateY(-1px);
        }

        .btn-glass {
            background-color: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: white;
            border-radius: 0.5rem;
            padding: 0.5rem 1rem;
            transition: all 0.3s ease;
            backdrop-filter: blur(8px);
            cursor: pointer;
            font-weight: 400;
        }

        .btn-glass:hover {
            background-color: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.2);
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
            border-color: rgba(255, 255, 255, 0.1);
        }

        .text-gradient {
            background: linear-gradient(135deg, #a855f7 0%, #22d3ee 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
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

        ::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.2);
        }
`;

function Home() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Sidebar Navigation */}
    <aside className="w-64 flex flex-col border-r border-white/5 bg-black/20 backdrop-blur-xl h-full">
        <div className="p-6">
            <h1 className="text-xl font-bold tracking-tight text-white mb-2">CORTHEX <span
                    className="text-xs font-normal text-white/40 ml-1">v2</span></h1>
            <div
                className="flex items-center gap-2 mt-4 text-sm text-white/50 bg-white/5 p-2 rounded-lg border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                <div className="w-2 h-2 rounded-full bg-accent-cyan shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
                온라인 · A사 워크스페이스
            </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto w-full">
            <div className="mb-4">
                <div className="text-xs text-white/30 font-semibold mb-2 px-2 uppercase tracking-wider">Workspace</div>
                <nav className="space-y-1">
                    <a href="#"
                        className="flex items-center gap-3 px-3 py-2 text-white bg-white/10 rounded-lg border border-white/10 transition-colors">
                        <i className="fas fa-home w-4 text-accent-cyan"></i> <span>홈 (작전현황)</span>
                    </a>
                    <a href="#"
                        className="flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <i className="fas fa-terminal w-4"></i> <span>사령관실</span>
                    </a>
                    <a href="#"
                        className="flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <i className="fas fa-comments w-4"></i> <span>채팅</span>
                    </a>
                    <a href="#"
                        className="flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <i className="fas fa-chart-line w-4"></i> <span>전략실</span>
                    </a>
                </nav>
            </div>

            <div className="mb-4">
                <div className="text-xs text-white/30 font-semibold mb-2 px-2 uppercase tracking-wider">Organization</div>
                <nav className="space-y-1">
                    <a href="#"
                        className="flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <i className="fas fa-sitemap w-4"></i> <span>부서 관리</span>
                    </a>
                    <a href="#"
                        className="flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <i className="fas fa-users-cog w-4"></i> <span>에이전트 목록</span>
                    </a>
                </nav>
            </div>
        </div>

        <div className="p-4 border-t border-white/5">
            <div
                className="flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white cursor-pointer rounded-lg hover:bg-white/5 transition-colors">
                <i className="fas fa-cog"></i>
                <span className="text-sm">설정</span>
            </div>
        </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 overflow-y-auto p-8 lg:p-10 relative">
        <header className="flex justify-between items-end mb-8">
            <div>
                <h2 className="text-3xl font-semibold mb-1">작전현황 대시보드</h2>
                {/* API: GET /api/workspace/dashboard/summary */}
                <p className="text-white/40 text-sm">에이전트 조직의 현재 활동 및 리소스 사용 현황을 확인합니다.</p>
            </div>
            <div className="flex gap-3">
                <button className="btn-glass text-sm flex items-center gap-2"><i className="fas fa-calendar-alt"></i>
                    오늘</button>
                <button className="btn-icon"><i className="fas fa-bell outline-none"></i></button>
                <div
                    className="w-10 h-10 rounded-full bg-base-200 border border-white/10 ml-2 overflow-hidden flex items-center justify-center">
                    <span className="text-sm text-white/80 font-medium">CEO</span>
                </div>
            </div>
        </header>

        {/* Summary Cards (GET /api/workspace/dashboard/summary) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="glass-panel p-5">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm text-white/60">활성 에이전트</h3>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex flex-col items-center justify-center">
                        <i className="fas fa-robot text-white/40 text-xs"></i>
                    </div>
                </div>
                <div className="flex items-end gap-3 mt-1">
                    <span className="text-3xl num-bold text-white">12</span>
                    <span className="text-sm text-white/40 mb-1">/ 29명</span>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 text-xs text-white/40 flex justify-between">
                    <span>에러 발생: 0건</span>
                    <span className="text-green-400">정상 동작 중</span>
                </div>
            </div>

            <div className="glass-panel p-5">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm text-white/60">오늘 처리한 명령</h3>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex flex-col items-center justify-center">
                        <i className="fas fa-check-double text-accent-cyan text-xs"></i>
                    </div>
                </div>
                <div className="flex items-end gap-3 mt-1">
                    <span className="text-3xl num-bold text-accent-cyan">142</span>
                    <span className="text-sm text-green-400 mb-1">+12%</span>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 text-xs text-white/40 flex justify-between">
                    <span>실패: 1건 (품질반려)</span>
                    <span>성공률: 99.3%</span>
                </div>
            </div>

            <div className="glass-panel p-5">
                {/* API: GET /api/workspace/dashboard/budget */}
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm text-white/60">이번 달 누적 비용</h3>
                    <div
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-purple/20 to-accent-cyan/20 flex flex-col items-center justify-center border border-white/5">
                        <i className="fas fa-dollar-sign text-accent-purple text-xs"></i>
                    </div>
                </div>
                <div className="flex items-end gap-3 mt-1">
                    <span className="text-3xl num-bold text-white">$42.50</span>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-2 cursor-pointer group">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/50">예산 소진율 (한도 $100)</span>
                        <span
                            className="num-bold text-accent-purple group-hover:text-accent-cyan transition-colors">42%</span>
                    </div>
                    <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-gradient-accent h-1.5 rounded-full" style={{width: "42%"}}></div>
                    </div>
                </div>
            </div>

            <div className="glass-panel p-5">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm text-white/60">CEO 만족도</h3>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex flex-col items-center justify-center">
                        <i className="fas fa-smile text-yellow-400 text-xs shadow-glow-sm"></i>
                    </div>
                </div>
                {/* API: GET /api/workspace/dashboard/satisfaction */}
                <div className="flex items-end gap-3 mt-1">
                    <span className="text-3xl num-bold text-white">92<span className="text-xl">%</span></span>
                    <span className="text-sm text-green-400 mb-1">+4%</span>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 text-xs text-white/40 flex justify-between">
                    <span>긍정 45건 / 중립 3건</span>
                    <span><a href="#" className="text-accent-cyan hover:underline">상세보기</a></span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Quick Actions & Agent Status */}
            <div className="lg:col-span-2 space-y-8">

                {/* Quick Actions (PUT/GET /api/workspace/dashboard/quick-actions) */}
                <div className="glass-panel p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-medium text-white/90">빠른 실행 메뉴</h3>
                        <button className="btn-icon"><i className="fas fa-edit text-xs"></i></button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button
                            className="glass-panel-hover bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center gap-3 group text-center cursor-pointer">
                            <div
                                className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-accent-cyan/20 transition-colors flex items-center justify-center border border-white/5">
                                <i
                                    className="fas fa-terminal text-white/70 group-hover:text-accent-cyan transition-colors"></i>
                            </div>
                            <span className="text-sm text-white/80 group-hover:text-white transition-colors">새 명령 하달</span>
                        </button>
                        <button
                            className="glass-panel-hover bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center gap-3 group text-center cursor-pointer">
                            <div
                                className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-accent-purple/20 transition-colors flex items-center justify-center border border-white/5">
                                <i
                                    className="fas fa-building text-white/70 group-hover:text-accent-purple transition-colors"></i>
                            </div>
                            <span className="text-sm text-white/80 group-hover:text-white transition-colors">신규 부서 설립</span>
                        </button>
                        <button
                            className="glass-panel-hover bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center gap-3 group text-center cursor-pointer">
                            <div
                                className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-blue-400/20 transition-colors flex items-center justify-center border border-white/5">
                                <i
                                    className="fas fa-file-contract text-white/70 group-hover:text-blue-400 transition-colors"></i>
                            </div>
                            <span className="text-sm text-white/80 group-hover:text-white transition-colors">계약서 리뷰
                                요청</span>
                        </button>
                        <button
                            className="glass-panel-hover bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center gap-3 group text-center cursor-pointer">
                            <div
                                className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-green-400/20 transition-colors flex items-center justify-center border border-white/5">
                                <i
                                    className="fas fa-chart-pie text-white/70 group-hover:text-green-400 transition-colors"></i>
                            </div>
                            <span className="text-sm text-white/80 group-hover:text-white transition-colors">마켓 리서치
                                요청</span>
                        </button>
                    </div>
                </div>

                {/* Agent Status List */}
                <div className="glass-panel p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-medium text-white/90">활성 에이전트 목록 <span
                                className="bg-white/10 py-0.5 px-2 rounded-full text-xs text-white/50 ml-2">12</span></h3>
                        <a href="#" className="text-xs text-accent-cyan hover:underline">조직도 보기</a>
                    </div>

                    <div className="space-y-3">
                        {/* Agent Row */}
                        <div
                            className="flex justify-between text-sm py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg transition-colors items-center cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-full bg-gradient-accent flex items-center justify-center shadow-glow-sm">
                                    <i className="fas fa-robot text-white text-xs"></i>
                                </div>
                                <div>
                                    <div className="font-medium text-white/90">비서실장</div>
                                    <div className="text-xs text-white/40">오케스트레이션 총괄</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="text-xs text-white/40">금일 비용</div>
                                    <div className="num-bold text-white/80 text-xs">$0.45</div>
                                </div>
                                <span className="badge-accent">명령 분류 중</span>
                            </div>
                        </div>

                        {/* Agent Row */}
                        <div
                            className="flex justify-between text-sm py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg transition-colors items-center cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <div className="relative w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                    <div
                                        className="absolute -top-1 -right-1 w-3 h-3 bg-accent-cyan border-2 border-[#151525] rounded-full shadow-[0_0_5px_rgba(34,211,238,0.8)]">
                                    </div>
                                    <i className="fas fa-user-tie text-white/60 text-xs"></i>
                                </div>
                                <div>
                                    <div className="font-medium text-white/90">조선임 (CIO)</div>
                                    <div className="text-xs text-white/40">전략기획실 / Manager</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="text-xs text-white/40">금일 비용</div>
                                    <div className="num-bold text-white/80 text-xs">$1.20</div>
                                </div>
                                <span
                                    className="bg-white/5 text-white/60 border border-white/5 px-2 py-0.5 rounded-full text-xs font-light">대기
                                    중</span>
                            </div>
                        </div>

                        {/* Agent Row */}
                        <div
                            className="flex justify-between text-sm py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg transition-colors items-center cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <div className="relative w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                    <div
                                        className="absolute -top-1 -right-1 w-3 h-3 bg-accent-cyan border-2 border-[#151525] rounded-full shadow-[0_0_5px_rgba(34,211,238,0.8)]">
                                    </div>
                                    <i className="fas fa-pen-nib text-white/60 text-xs"></i>
                                </div>
                                <div>
                                    <div className="font-medium text-white/90">정작가</div>
                                    <div className="text-xs text-white/40">마케팅부 / Specialist</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="text-xs text-white/40">금일 비용</div>
                                    <div className="num-bold text-white/80 text-xs">$0.85</div>
                                </div>
                                <span
                                    className="bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 px-2 py-0.5 rounded-full text-xs font-medium">콘텐츠
                                    작성 중</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Recent Activity Feed */}
            <div className="lg:col-span-1 space-y-8">
                <div className="glass-panel p-6 h-full min-h-[500px] flex flex-col">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
                        <h3 className="text-lg font-medium text-white/90">최근 통신로그</h3>
                        <a href="#" className="btn-icon"><i className="fas fa-history text-xs"></i></a>
                    </div>

                    <div className="relative flex-1 overflow-y-auto space-y-6 pr-2">
                        {/* Timeline Line */}
                        <div className="absolute left-2.5 top-2 bottom-0 w-px bg-white/10 z-0"></div>

                        {/* Activity Item */}
                        <div className="relative z-10 flex gap-4">
                            <div
                                className="w-5 h-5 rounded-full bg-[#1a1a2e] border-2 border-accent-cyan flex-shrink-0 flex items-center justify-center text-[10px] text-accent-cyan shadow-glow-sm">
                            </div>
                            <div className="flex-1 bg-white/5 border border-white/5 rounded-lg p-3">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-medium text-white/80">마케팅부 정작가</span>
                                    <span className="text-[10px] text-white/40 font-mono">10:42 AM</span>
                                </div>
                                <div className="text-sm text-white/60 leading-tight">
                                    [보고서] 주간 트렌드 분석 초안 작성 완료. 승인 대기 중입니다.
                                </div>
                                <div className="mt-2 text-xs flex gap-2">
                                    <span
                                        className="bg-accent-purple/20 text-accent-purple px-1.5 py-0.5 rounded border border-accent-purple/30 cursor-pointer hover:bg-accent-purple/30">승인하기</span>
                                    <span
                                        className="bg-white/5 text-white/50 px-1.5 py-0.5 rounded border border-white/5 cursor-pointer hover:bg-white/10">반려</span>
                                </div>
                            </div>
                        </div>

                        {/* Activity Item */}
                        <div className="relative z-10 flex gap-4">
                            <div
                                className="w-5 h-5 rounded-full bg-[#1a1a2e] border-2 border-accent-purple flex-shrink-0 flex items-center justify-center text-[10px] text-accent-purple">
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-medium text-white/80">비서실장</span>
                                    <span className="text-[10px] text-white/40 font-mono">09:15 AM</span>
                                </div>
                                <div className="text-sm text-white/60 leading-tight">
                                    CEO 명령("테슬라 3분기 실적 요약해줘")을 전략기획실로 위임 분류했습니다.
                                </div>
                            </div>
                        </div>

                        {/* Activity Item */}
                        <div className="relative z-10 flex gap-4">
                            <div
                                className="w-5 h-5 rounded-full bg-[#1a1a2e] border-2 border-white/20 flex-shrink-0 flex items-center justify-center">
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-medium text-white/80">크론 스케줄러</span>
                                    <span className="text-[10px] text-white/40 font-mono">08:00 AM</span>
                                </div>
                                <div className="text-sm text-white/60 leading-tight">
                                    자동화 작업 "아침 뉴스 헤드라인 수집"을 완료하여 지식센터에 저장했습니다.
                                </div>
                            </div>
                        </div>

                        {/* Activity Item */}
                        <div className="relative z-10 flex gap-4">
                            <div
                                className="w-5 h-5 rounded-full bg-[#1a1a2e] border-2 border-red-400 flex-shrink-0 flex items-center justify-center shadow-[0_0_8px_rgba(248,113,113,0.4)]">
                            </div>
                            <div className="flex-1 bg-red-400/10 border border-red-400/20 rounded-lg p-3">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-medium text-red-400">품질 게이트 (비서실장)</span>
                                    <span className="text-[10px] text-white/40 font-mono">07:22 AM</span>
                                </div>
                                <div className="text-sm text-white/60 leading-tight">
                                    결과물 반려 (사유: 근거 데이터 부족). 재작업을 지시했습니다.
                                </div>
                            </div>
                        </div>

                    </div>

                    <button className="w-full mt-4 btn-glass text-xs py-2 text-center text-white/50 hover:text-white">전체 로그
                        보기</button>
                </div>
            </div>
        </div>
    </main>
    </>
  );
}

export default Home;
