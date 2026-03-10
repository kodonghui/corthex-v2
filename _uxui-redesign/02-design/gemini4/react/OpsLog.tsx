"use client";
import React from "react";

const styles = `
body {
            background-color: inherit /* FIXME: theme value not in map */;
            color: inherit /* FIXME: theme value not in map */;
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

        .log-row:hover {
            background-color: inherit /* FIXME: theme value not in map */;
        }
`;

function OpsLog() {
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
            <a href="/app/ops-log" className="nav-item active">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01">
                    </path>
                </svg>
                전사 작전 로그
            </a>
            <a href="/app/activity-log" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                감사 및 접속 기록
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
    {/* API: GET /api/workspace/activity/ops-log */}
    <main className="flex-1 flex flex-col relative bg-background">
        <header className="h-24 border-b border-border bg-surface flex items-center justify-between px-8 z-10 shrink-0">
            <div>
                <h1 className="text-2xl font-serif text-text-main mb-1">전사 작전 통제 로그 (Operations Log)</h1>
                <p className="text-xs text-text-muted">에이전트들이 배경에서 수행 취소, 완료한 모든 '이벤트 및 시스템 로그'를 실시간 모니터링합니다.</p>
            </div>

            <div className="flex gap-3 items-center">
                <div className="flex items-center gap-2 bg-background-alt px-3 py-1.5 rounded-lg border border-border">
                    <span className="w-2 h-2 rounded-full bg-primary block animate-pulse"></span>
                    <span className="text-xs font-bold text-text-main">실시간 감시 활성</span>
                </div>
                {/* API: GET /api/workspace/activity/export */}
                <button
                    className="bg-surface border border-border text-text-main px-4 py-1.5 rounded-lg hover:bg-background-alt transition-colors font-medium shadow-sm flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                    CSV
                </button>
            </div>
        </header>

        {/* Filters */}
        <div className="bg-surface border-b border-border p-4 flex gap-4 px-8 items-center shadow-sm shrink-0">
            <div className="relative w-64">
                <svg className="w-4 h-4 text-text-light absolute left-3 top-2.5" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <input type="text"
                    className="w-full border border-border rounded-lg pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:border-primary-light"
                    placeholder="로그 내용, 에이전트명 검색..." />
            </div>

            <select
                className="border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary-light text-text-main bg-background-alt">
                <option value="all">모든 수준 (Level)</option>
                <option value="info">정보 (INFO)</option>
                <option value="success">성공 (SUCCESS)</option>
                <option value="warning">경고 (WARN)</option>
                <option value="error">오류 (ERROR)</option>
            </select>

            <select
                className="border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary-light text-text-main bg-background-alt">
                <option value="all">모든 주체 (Actor)</option>
                <option value="human">인간 (명령)</option>
                <option value="agent">에이전트</option>
                <option value="system">시스템</option>
            </select>

            <button className="text-sm font-medium text-text-muted hover:text-text-main ml-auto flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                    </path>
                </svg>
                새로고침
            </button>
        </div>

        {/* Log Table */}
        <div className="flex-1 overflow-y-auto bg-surface p-4">
            <div className="border border-border rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-background-alt border-b border-border sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider w-32">
                                Timestamp</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider w-24">
                                Level</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider w-32">주체
                                (Actor)</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider w-40">
                                이벤트 타입</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">상세 메시지
                            </th>
                            <th
                                className="px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider w-32 text-center">
                                Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-sm font-mono text-[13px]">

                        {/* Log Item 1: Success */}
                        <tr className="log-row transition-colors cursor-pointer border-l-[3px] border-l-primary">
                            <td className="px-4 py-3 text-text-light">24-03-10 14:32:01</td>
                            <td className="px-4 py-3"><span
                                    className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold">SUCCESS</span>
                            </td>
                            <td className="px-4 py-3 text-text-main flex items-center gap-2">
                                <div
                                    className="w-4 h-4 rounded-full bg-secondary text-white text-[8px] flex items-center justify-center">
                                    마</div>
                                마케팅부
                            </td>
                            <td className="px-4 py-3 text-text-muted font-sans font-medium text-xs">WORKFLOW_END</td>
                            <td className="px-4 py-3 font-sans text-text-main truncate max-w-xl">
                                Task #842 (신제품 런칭 캠페인) 하위 위임 '콘텐츠 전문가 호출' 정상 종료. DRAFT 생성됨.
                            </td>
                            <td className="px-4 py-3 text-center">
                                <button className="p-1 text-text-muted hover:text-primary transition-colors"><svg
                                        className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z">
                                        </path>
                                    </svg></button>
                            </td>
                        </tr>

                        {/* Log Item 2: Info (Tool Call) */}
                        <tr className="log-row transition-colors cursor-pointer border-l-[3px] border-l-transparent">
                            <td className="px-4 py-3 text-text-light">24-03-10 14:31:05</td>
                            <td className="px-4 py-3"><span
                                    className="bg-text-main text-white px-2 py-0.5 rounded text-[10px] font-bold">INFO</span>
                            </td>
                            <td className="px-4 py-3 text-text-main flex items-center gap-2">
                                <div
                                    className="w-4 h-4 rounded-full border border-border bg-surface text-text-muted text-[8px] flex items-center justify-center font-bold">
                                    시</div>
                                시황 분석가
                            </td>
                            <td className="px-4 py-3 text-text-muted font-sans font-medium text-xs">TOOL_CALL</td>
                            <td className="px-4 py-3 font-sans text-text-main truncate max-w-xl">
                                API 호출 수행: [Tavily] query="SSRN recent papers on macro volatility" (응답 1.2초)
                            </td>
                            <td className="px-4 py-3 text-center">
                                <button className="p-1 text-text-muted hover:text-primary transition-colors"><svg
                                        className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z">
                                        </path>
                                    </svg></button>
                            </td>
                        </tr>

                        {/* Log Item 3: Warning */}
                        <tr className="log-row transition-colors cursor-pointer border-l-[3px] border-l-accent bg-accent/5">
                            <td className="px-4 py-3 text-text-light">24-03-10 14:28:44</td>
                            <td className="px-4 py-3"><span
                                    className="bg-accent/20 text-accent-hover px-2 py-0.5 rounded text-[10px] font-bold flex items-center w-max gap-1"><svg
                                        className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z">
                                        </path>
                                    </svg> WARN</span></td>
                            <td className="px-4 py-3 text-text-main flex items-center gap-2">
                                <div
                                    className="w-4 h-4 rounded-full bg-[#2D3F87] text-white text-[8px] flex items-center justify-center font-bold">
                                    K</div>
                                SYSTEM (KIS)
                            </td>
                            <td className="px-4 py-3 text-text-muted font-sans font-medium text-xs">API_RATE_LIMIT</td>
                            <td className="px-4 py-3 font-sans text-text-main truncate max-w-xl">
                                KIS API 초당 호출 제한 근접 (1.8회/초). 지연(Backoff) 전략 적용.
                            </td>
                            <td className="px-4 py-3 text-center">
                                <button className="p-1 text-text-muted hover:text-primary transition-colors"><svg
                                        className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z">
                                        </path>
                                    </svg></button>
                            </td>
                        </tr>

                        {/* Log Item 4: Human User Input */}
                        <tr className="log-row transition-colors cursor-pointer border-l-[3px] border-l-transparent">
                            <td className="px-4 py-3 text-text-light">24-03-10 14:15:02</td>
                            <td className="px-4 py-3"><span
                                    className="bg-background-alt border border-border text-text-muted px-2 py-0.5 rounded text-[10px] font-bold">EVENT</span>
                            </td>
                            <td className="px-4 py-3 text-text-main flex items-center gap-2 font-bold font-sans">
                                <div
                                    className="w-4 h-4 rounded-full bg-surface border border-border text-text-muted text-[8px] flex items-center justify-center font-bold">
                                    김</div>
                                김대표 (CEO)
                            </td>
                            <td className="px-4 py-3 text-text-muted font-sans font-medium text-xs">USER_COMMAND</td>
                            <td className="px-4 py-3 font-sans text-text-main truncate max-w-xl">
                                사령관실 수동 명령 입력: "@마케팅부 이번 주 발표 예정인 신제품..."
                            </td>
                            <td className="px-4 py-3 text-center">
                                <button className="p-1 text-text-muted hover:text-primary transition-colors"><svg
                                        className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z">
                                        </path>
                                    </svg></button>
                            </td>
                        </tr>

                        {/* Log Item 5: Error */}
                        <tr
                            className="log-row transition-colors cursor-pointer border-l-[3px] border-l-red-500 bg-red-50/50">
                            <td className="px-4 py-3 text-text-light">24-03-10 13:40:11</td>
                            <td className="px-4 py-3"><span
                                    className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold">ERROR</span>
                            </td>
                            <td className="px-4 py-3 text-text-main flex items-center gap-2">
                                <div
                                    className="w-4 h-4 rounded border border-border bg-surface text-text-main text-[8px] font-bold flex items-center justify-center">
                                    N</div>
                                SYSTEM (Notion)
                            </td>
                            <td className="px-4 py-3 text-text-muted font-sans font-medium text-xs">AUTH_FAILED</td>
                            <td className="px-4 py-3 font-sans text-red-700 truncate max-w-xl font-medium">
                                Notion API 토큰 만료. API 호출 실패 (401 Unauthorized). 비서실장 작업 중단됨.
                            </td>
                            <td className="px-4 py-3 text-center">
                                <button
                                    className="p-1 px-2 border border-border bg-surface shadow-sm rounded text-xs font-sans text-text-main hover:bg-background-alt transition-colors">상세</button>
                            </td>
                        </tr>

                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex justify-between items-center text-xs text-text-muted">
                <span>Total 12,408 logs</span>
                <div className="flex gap-1">
                    <button className="px-2 py-1 bg-surface border border-border rounded opacity-50 cursor-not-allowed">&lt;
                        Prev</button>
                    <button className="px-2 py-1 bg-primary text-white rounded">1</button>
                    <button
                        className="px-2 py-1 bg-surface hover:bg-background-alt border border-border rounded transition-colors">2</button>
                    <button
                        className="px-2 py-1 bg-surface hover:bg-background-alt border border-border rounded transition-colors">3</button>
                    <span className="px-2 py-1">...</span>
                    <button
                        className="px-2 py-1 bg-surface hover:bg-background-alt border border-border rounded transition-colors">Next
                        &gt;</button>
                </div>
            </div>
        </div>
    </main>
    </>
  );
}

export default OpsLog;
