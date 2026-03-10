"use client";
import React from "react";

const styles = `
body {
            background-color: inherit /* FIXME: theme value not in map */;
            color: inherit /* FIXME: theme value not in map */;
        }

        .card {
            background-color: inherit /* FIXME: theme value not in map */;
            border-radius: 1rem;
            box-shadow: inherit /* FIXME: theme value not in map */;
            border: 1px solid inherit /* FIXME: theme value not in map */;
        }

        .nav-item {
            display: flex;
            items-center;
            gap: 0.75rem;
            padding: 0.75rem 1rem;
            border-radius: 0.75rem;
            color: inherit /* FIXME: theme value not in map */;
            font-weight: 500;
            transition: all 0.2s;
        }

        .nav-item:hover {
            background-color: inherit /* FIXME: theme value not in map */;
            color: inherit /* FIXME: theme value not in map */;
        }

        .nav-item.active {
            background-color: inherit /* FIXME: theme value not in map */;
            color: inherit /* FIXME: theme value not in map */;
            font-weight: 600;
        }

        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }

        ::-webkit-scrollbar-thumb {
            background: inherit /* FIXME: theme value not in map */;
            border-radius: 3px;
        }
`;

function ActivityLog() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Sidebar */}
    <aside className="w-64 bg-surface border-r border-border flex flex-col h-full z-10 shadow-soft shrink-0">
        <div className="p-6">
            <h2 className="font-serif text-2xl tracking-tight text-primary font-bold">CORTHEX</h2>
            <p className="text-xs text-text-light mt-1">회사명: 알파 랩스</p>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            <a href="/app/home" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6">
                    </path>
                </svg>
                홈 대시보드
            </a>
            <a href="/app/command-center" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z">
                    </path>
                </svg>
                사령관실
            </a>
            <p className="px-4 text-[10px] font-bold text-text-light uppercase tracking-widest mt-6 mb-2">모니터링</p>
            <a href="/app/ops-log" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01">
                    </path>
                </svg>
                전사 작전 로그
            </a>
            <a href="/app/activity-log" className="nav-item active">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                보안 감사 및 접속 기록
            </a>
            <a href="/app/settings" className="nav-item mt-4 border-t border-border pt-4 rounded-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z">
                    </path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                보안 설정
            </a>
        </nav>

        <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
                <div
                    className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold">
                    김</div>
                <div>
                    <p className="font-medium text-text-main">김대표 (CEO)</p>
                </div>
            </div>
        </div>
    </aside>

    {/* Main Content */}
    {/* API: GET /api/workspace/activity/logs */}
    <main className="flex-1 overflow-y-auto px-8 py-10 relative">
        <header className="mb-10 lg:flex lg:justify-between lg:items-end">
            <div className="mb-4 lg:mb-0">
                <h1 className="text-3xl font-serif text-text-main mb-2">보안 감사 로그 (Audit Log)</h1>
                <p className="text-text-muted">사용자 및 에이전트의 워크스페이스 내 모든 설정 변경, 권한 부여 및 로그인 이력을 추적합니다.</p>
            </div>

            <div className="flex gap-2">
                <button
                    className="bg-surface border border-text-main text-text-main px-4 py-2 rounded-xl hover:bg-background transition-colors font-medium shadow-sm text-sm">
                    감사 보고서 내보내기 (PDF)
                </button>
            </div>
        </header>

        {/* Filters */}
        <div className="card p-4 mb-8 flex flex-col md:flex-row gap-4 items-center bg-surface-alt">
            <div className="relative w-full md:w-64">
                <svg className="w-4 h-4 text-text-light absolute left-3 top-2.5" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <input type="text"
                    className="w-full bg-surface border border-border text-text-main rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:border-primary-light shadow-sm"
                    placeholder="사용자, IP, 액션 검색..." />
            </div>

            <input type="date"
                className="border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none bg-surface text-text-main shadow-smw-full md:w-auto" />

            <select
                className="border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none bg-surface text-text-main shadow-sm w-full md:w-auto">
                <option value="all">모든 이벤트 유형</option>
                <option value="auth">인증 (로그인 등)</option>
                <option value="settings">설정 변경</option>
                <option value="permissions">권한/API 변경</option>
                <option value="billing">결제 관련</option>
            </select>
        </div>

        {/* Log List */}
        <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden mb-8">
            <div
                className="grid grid-cols-[100px_150px_1fr_150px] gap-4 p-4 bg-background-alt border-b border-border text-[10px] font-bold text-text-muted uppercase tracking-wider items-center">
                <div className="text-center">이벤트 유형</div>
                <div>참조 주체 (User/Agent)</div>
                <div>상세 내용 (Action Details)</div>
                <div className="text-right">발생 일시 및 IP</div>
            </div>

            <div className="divide-y divide-border">

                {/* Log Item: Permissions */}
                <div
                    className="grid grid-cols-[100px_150px_1fr_150px] gap-4 p-4 items-center hover:bg-background-alt/50 transition-colors">
                    <div className="text-center flex justify-center">
                        <span
                            className="bg-secondary/10 text-secondary border border-secondary/20 px-2 py-0.5 rounded text-[10px] font-bold">권한
                            변경</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div
                            className="w-5 h-5 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-[8px]">
                            김</div>
                        <span className="text-text-main font-medium text-sm">김대표</span>
                    </div>
                    <div>
                        <p className="text-text-main text-sm font-medium">에이전트 권한 설정 변경</p>
                        <p className="text-[11px] text-text-muted font-mono mt-1 pr-4">"투자 총괄 (CIO)" 에이전트의 [한국투자증권 Open API]
                            도구 접근 권한을 DISABLED로 변경함.</p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <span className="text-text-main text-xs font-medium">오늘 14:10</span>
                        <span className="text-[10px] text-text-light font-mono">119.192.x.x</span>
                    </div>
                </div>

                {/* Log Item: Auth */}
                <div
                    className="grid grid-cols-[100px_150px_1fr_150px] gap-4 p-4 items-center hover:bg-background-alt/50 transition-colors">
                    <div className="text-center flex justify-center">
                        <span
                            className="bg-background-alt border border-border text-text-muted px-2 py-0.5 rounded text-[10px] font-bold">인증</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div
                            className="w-5 h-5 rounded-full bg-text-muted text-surface flex items-center justify-center font-bold text-[8px]">
                            이</div>
                        <span className="text-text-main font-medium text-sm">이실장</span>
                    </div>
                    <div>
                        <p className="text-text-main text-sm font-medium">워크스페이스 로그인 성공</p>
                        <p className="text-[11px] text-text-muted font-mono mt-1 pr-4">Oauth2 provider: Google / Platform:
                            Mac OS X (Chrome)</p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <span className="text-text-main text-xs font-medium">오늘 09:12</span>
                        <span className="text-[10px] text-text-light font-mono">211.36.x.x</span>
                    </div>
                </div>

                {/* Log Item: Billing */}
                <div
                    className="grid grid-cols-[100px_150px_1fr_150px] gap-4 p-4 items-center hover:bg-background-alt/50 transition-colors">
                    <div className="text-center flex justify-center">
                        <span
                            className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded text-[10px] font-bold">결제/비용</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div
                            className="w-5 h-5 rounded bg-surface border border-border text-text-muted flex items-center justify-center font-bold text-[8px]">
                            SYS</div>
                        <span className="text-text-main font-medium text-sm">System</span>
                    </div>
                    <div>
                        <p className="text-text-main text-sm font-medium">시스템 자동 경고 봇 트리거</p>
                        <p className="text-[11px] text-text-muted font-mono mt-1 pr-4">월간 예산 한도의 80% (₩400,000) 도달을 '비서실장'에게
                            알림.</p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <span className="text-text-main text-xs font-medium">어제 22:40</span>
                        <span className="text-[10px] text-text-light font-mono">internal</span>
                    </div>
                </div>

                {/* Log Item: Auth Failed (Warning) */}
                <div
                    className="grid grid-cols-[100px_150px_1fr_150px] gap-4 p-4 items-center bg-red-50/20 hover:bg-red-50/50 transition-colors">
                    <div className="text-center flex justify-center">
                        <span
                            className="bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded text-[10px] font-bold">인증
                            실패</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div
                            className="w-5 h-5 rounded-full bg-surface border border-border text-text-muted flex items-center justify-center font-bold text-[8px]">
                            ?</div>
                        <span className="text-text-main font-medium text-sm">Unknown</span>
                    </div>
                    <div>
                        <p className="text-text-main text-sm font-medium text-red-700">로그인 시도 5회 연속 실패</p>
                        <p className="text-[11px] text-text-muted font-mono mt-1 pr-4">이메일: ceo@alpha... / 해당 IP를 30분간 임시 차단
                            조치함.</p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <span className="text-text-main text-xs font-medium">어제 11:05</span>
                        <span className="text-[10px] font-bold text-red-600 font-mono">185.122.x.x</span>
                    </div>
                </div>

            </div>

            <div className="p-4 border-t border-border bg-background-alt/50 flex justify-center">
                <button className="text-sm font-medium text-text-muted hover:text-text-main">100개 더 보기</button>
            </div>
        </div>

    </main>
    </>
  );
}

export default ActivityLog;
