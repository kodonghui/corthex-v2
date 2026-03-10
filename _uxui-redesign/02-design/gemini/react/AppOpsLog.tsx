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

        .log-row {
            transition: all 0.2s ease;
            border-bottom: 1px solid #f5f3ec;
        }

        .log-row:hover {
            background-color: white;
            transform: scale(1.01);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
            z-index: 10;
            position: relative;
            border-radius: 1rem;
            border-color: transparent;
        }

        .log-row:last-child {
            border-bottom: none;
        }
`;

function AppOpsLog() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Primary Sidebar */}
    <aside
        className="w-64 flex flex-col justify-between py-8 px-4 border-r border-base-200 bg-white/80 backdrop-blur-md z-20 shrink-0">
        <div>
            <div className="flex items-center gap-3 px-4 mb-10">
                <div
                    className="w-8 h-8 rounded-full bg-accent-terracotta flex items-center justify-center text-white font-bold text-lg">
                    C</div>
                <span className="text-xl font-bold tracking-tight text-text-main">CORTHEX</span>
            </div>
            <nav className="space-y-2">
                <a href="#"
                    className="sidebar-item flex items-center gap-3 px-4 py-3 text-text-muted hover:bg-base-100 rounded-2xl transition-colors">
                    <i className="ph ph-squares-four text-xl"></i> 홈
                </a>
                <a href="#"
                    className="sidebar-item flex items-center gap-3 px-4 py-3 text-text-muted hover:bg-base-100 rounded-2xl transition-colors">
                    <i className="ph ph-terminal-window text-xl"></i> 사령관실
                </a>

                <div className="pt-4 pb-2 px-4 text-xs font-bold text-base-300 uppercase tracking-wider">분석 및 기록</div>
                <a href="#"
                    className="sidebar-item flex items-center gap-3 px-4 py-3 text-text-muted hover:bg-base-100 rounded-2xl transition-colors">
                    <i className="ph ph-chart-pie-slice text-xl"></i> 보고서
                </a>
                {/* Active menu */}
                <a href="#"
                    className="sidebar-item active flex items-center gap-3 px-4 py-3 font-medium text-accent-terracotta bg-base-100 rounded-2xl transition-colors">
                    <i className="ph ph-list-dashes text-xl"></i> 작전 일지
                </a>

                <div className="pt-4 pb-2 px-4 text-xs font-bold text-base-300 uppercase tracking-wider">시스템</div>
                <a href="#"
                    className="sidebar-item flex items-center gap-3 px-4 py-3 text-text-muted hover:bg-base-100 rounded-2xl transition-colors">
                    <i className="ph ph-gear text-xl"></i> 설정
                </a>
            </nav>
        </div>
        <div>
            <nav className="space-y-2">
                <div className="mt-4 px-4 py-3 flex items-center gap-3 border-t border-base-200">
                    <img src="https://i.pravatar.cc/100?img=11" alt="Profile"
                        className="w-10 h-10 rounded-full border border-base-300" />
                    <div>
                        <p className="text-sm font-semibold text-text-main">김대표</p>
                        <p className="text-xs text-text-muted">CEO</p>
                    </div>
                </div>
            </nav>
        </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 overflow-y-auto px-10 py-8 relative bg-[#fcfbf9]/50">

        {/* Header (API: GET /api/workspace/logs) */}
        <header
            className="flex justify-between items-center mb-8 sticky top-0 bg-[#fcfbf9]/80 backdrop-blur-md z-10 pt-2 pb-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-text-main">작전 일지</h1>
                <p className="text-text-muted mt-1 text-sm">에이전트의 수행 기록 및 전체 시스템 활동 로그를 실시간으로 모니터링합니다.</p>
            </div>

            <div className="flex items-center gap-3">
                <button
                    className="bg-white text-text-main border border-base-200 px-4 py-2 rounded-xl font-bold shadow-sm hover:bg-base-50 transition-colors flex items-center gap-2 text-sm">
                    <i className="ph ph-export text-lg"></i> 내보내기 (.csv)
                </button>
            </div>
        </header>

        {/* Filters Box */}
        <div
            className="bg-white border text-text-main border-base-200 rounded-3xl p-4 shadow-soft mb-8 flex flex-wrap gap-4 items-center z-10 relative">

            {/* Search */}
            <div className="relative flex-1 min-w-[240px]">
                <i className="ph ph-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"></i>
                <input type="text" placeholder="로그 메시지 검색..."
                    className="w-full bg-base-50 border-none outline-none font-medium text-sm pl-10 pr-4 py-2 rounded-xl text-text-main placeholder:text-base-300" />
            </div>

            <div className="w-px h-8 bg-base-200"></div>

            {/* Filters */}
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider mr-2">필터</span>
                <button
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-text-main text-white shadow-sm flex items-center gap-2">
                    레벨 <i className="ph ph-caret-down"></i>
                </button>
                <button
                    className="px-4 py-2 rounded-xl text-xs font-medium bg-base-50 text-text-main border border-base-200 hover:bg-base-100 transition-colors flex items-center gap-2">
                    에이전트 <i className="ph ph-caret-down"></i>
                </button>
                <button
                    className="px-4 py-2 rounded-xl text-xs font-medium bg-base-50 text-text-main border border-base-200 hover:bg-base-100 transition-colors flex items-center gap-2">
                    기간: 오늘 <i className="ph ph-caret-down"></i>
                </button>
            </div>

        </div>

        {/* Log List */}
        <div className="bg-white/60 border border-base-200 rounded-4xl shadow-soft p-2 pb-10">

            {/* Table Header */}
            <div
                className="flex items-center px-6 py-4 border-b border-base-200/50 text-text-muted text-[11px] font-bold uppercase tracking-wider sticky top-[152px] bg-white/60 backdrop-blur-md z-10 w-full mb-2">
                <div className="w-24 shrink-0">시간</div>
                <div className="w-28 shrink-0">레벨</div>
                <div className="w-48 shrink-0">에이전트/서비스</div>
                <div className="flex-1">메시지</div>
                <div className="w-16 text-right">상세</div>
            </div>

            {/* Log Rows */}
            <div className="px-2 w-full">

                {/* Info Log */}
                <div className="log-row flex items-center px-4 py-4 w-full cursor-pointer">
                    <div className="w-24 shrink-0 text-xs text-text-muted font-medium">10:45:12</div>
                    <div className="w-28 shrink-0">
                        <span
                            className="px-2 py-1 bg-accent-green/10 text-accent-green rounded text-[10px] font-bold flex items-center gap-1.5 w-max">
                            <i className="ph ph-info font-bold"></i> INFO
                        </span>
                    </div>
                    <div className="w-48 shrink-0 flex items-center gap-2">
                        <div
                            className="w-6 h-6 rounded-full bg-[#fdece6] border border-white text-accent-terracotta text-[10px] flex items-center justify-center font-bold">
                            M</div>
                        <span className="text-sm font-bold text-text-main truncate">마케팅부장</span>
                    </div>
                    <div className="flex-1 text-sm text-text-main leading-snug">LinkedIn 포스트 #4521 생성 완료 및 예약 큐에 등록됨.</div>
                    <div className="w-16 text-right text-text-muted hover:text-text-main"><i className="ph ph-caret-right"></i>
                    </div>
                </div>

                {/* Warning Log */}
                <div className="log-row flex items-center px-4 py-4 w-full cursor-pointer bg-[#fef5ec]/30">
                    <div className="w-24 shrink-0 text-xs text-text-muted font-medium">10:32:05</div>
                    <div className="w-28 shrink-0">
                        <span
                            className="px-2 py-1 bg-accent-amber/10 text-accent-amber rounded text-[10px] font-bold flex items-center gap-1.5 w-max">
                            <i className="ph ph-warning font-bold"></i> WARN
                        </span>
                    </div>
                    <div className="w-48 shrink-0 flex items-center gap-2">
                        <div
                            className="w-6 h-6 rounded-full bg-base-100 border border-white text-text-main text-[10px] flex items-center justify-center font-bold">
                            <i className="ph ph-server"></i></div>
                        <span className="text-sm font-bold text-text-main truncate">시스템 코어</span>
                    </div>
                    <div className="flex-1 text-sm text-text-main leading-snug">API Rate Limit에 임접함. (OpenAI API 호출 빈도 95%
                        초과)</div>
                    <div className="w-16 text-right text-text-muted hover:text-text-main"><i className="ph ph-caret-right"></i>
                    </div>
                </div>

                {/* Success Log */}
                <div className="log-row flex items-center px-4 py-4 w-full cursor-pointer">
                    <div className="w-24 shrink-0 text-xs text-text-muted font-medium">10:15:00</div>
                    <div className="w-28 shrink-0">
                        <span
                            className="px-2 py-1 bg-accent-green/10 text-accent-green rounded text-[10px] font-bold flex items-center gap-1.5 w-max">
                            <i className="ph ph-check-circle font-bold"></i> SUCCESS
                        </span>
                    </div>
                    <div className="w-48 shrink-0 flex items-center gap-2">
                        <div
                            className="w-6 h-6 rounded-full bg-[#e8f3ef] border border-white text-accent-green text-[10px] flex items-center justify-center font-bold">
                            <i className="ph ph-chart-line-up"></i></div>
                        <span className="text-sm font-bold text-text-main truncate">전략실장 (트레이더)</span>
                    </div>
                    <div className="flex-1 text-sm text-text-main leading-snug">KIS API 자동매매 체결: 삼성전자 10주 (매수가: 78,500원)
                    </div>
                    <div className="w-16 text-right text-text-muted hover:text-text-main"><i className="ph ph-caret-right"></i>
                    </div>
                </div>

                {/* Error Log */}
                <div className="log-row flex items-center px-4 py-4 w-full cursor-pointer bg-[#fdece6]/40">
                    <div className="w-24 shrink-0 text-xs text-text-muted font-medium">09:54:22</div>
                    <div className="w-28 shrink-0">
                        <span
                            className="px-2 py-1 bg-accent-coral/10 text-accent-coral rounded text-[10px] font-bold flex items-center gap-1.5 w-max">
                            <i className="ph ph-warning-octagon font-bold"></i> ERROR
                        </span>
                    </div>
                    <div className="w-48 shrink-0 flex items-center gap-2">
                        <div
                            className="w-6 h-6 rounded-full bg-base-100 border border-white text-text-main text-[10px] flex items-center justify-center font-bold">
                            <i className="ph ph-slack-logo"></i></div>
                        <span className="text-sm font-bold text-text-main truncate">Slack Webhook</span>
                    </div>
                    <div className="flex-1 text-sm text-text-main leading-snug">Slack 메시지 전송 실패. 인증 토큰 만료됨. (HTTP 401
                        Unauthorized)</div>
                    <div className="w-16 text-right text-text-muted hover:text-text-main"><i className="ph ph-caret-right"></i>
                    </div>
                </div>

                {/* Action Log */}
                <div className="log-row flex items-center px-4 py-4 w-full cursor-pointer">
                    <div className="w-24 shrink-0 text-xs text-text-muted font-medium">09:00:15</div>
                    <div className="w-28 shrink-0">
                        <span
                            className="px-2 py-1 bg-text-main/10 text-text-main rounded text-[10px] font-bold flex items-center gap-1.5 w-max">
                            <i className="ph ph-user font-bold"></i> USER_ACTION
                        </span>
                    </div>
                    <div className="w-48 shrink-0 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full border border-base-200 overflow-hidden shrink-0"><img
                                src="https://i.pravatar.cc/100?img=11" className="w-full h-full" /></div>
                        <span className="text-sm font-bold text-text-main truncate">김대표 (CEO)</span>
                    </div>
                    <div className="flex-1 text-sm text-text-main leading-snug">아고라 토론장 신규 안건 발의 완료 (주제: Q3 마케팅 예산 비중)</div>
                    <div className="w-16 text-right text-text-muted hover:text-text-main"><i className="ph ph-caret-right"></i>
                    </div>
                </div>

            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-6 z-10 relative">
                <div className="flex gap-1 text-sm font-bold">
                    <button
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-base-50 transition-colors"><i
                            className="ph ph-caret-left"></i></button>
                    <button
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-text-main text-white shadow-soft">1</button>
                    <button
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-main hover:bg-base-50 transition-colors">2</button>
                    <button
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-main hover:bg-base-50 transition-colors">3</button>
                    <button
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-base-50 transition-colors"><i
                            className="ph ph-caret-right"></i></button>
                </div>
            </div>

        </div>

    </main>
    </>
  );
}

export default AppOpsLog;
