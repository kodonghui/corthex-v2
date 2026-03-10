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

        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }

        ::-webkit-scrollbar-thumb {
            background: inherit /* FIXME: theme value not in map */;
            border-radius: 3px;
        }

        .chat-bubble-user {
            background-color: inherit /* FIXME: theme value not in map */;
            border: 1px solid inherit /* FIXME: theme value not in map */;
            border-radius: 1rem 1rem 0 1rem;
            padding: 0.875rem 1.25rem;
        }

        .chat-bubble-other {
            background-color: inherit /* FIXME: theme value not in map */;
            border: 1px solid inherit /* FIXME: theme value not in map */;
            border-radius: 1rem 1rem 1rem 0;
            padding: 0.875rem 1.25rem;
        }
`;

function Messenger() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* App Sidebar */}
    <aside className="w-64 bg-surface border-r border-border flex flex-col h-full z-20 shadow-soft shrink-0">
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
            <a href="/app/chat" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z">
                    </path>
                </svg>
                에이전트 1:1 대화
            </a>
            <p className="px-4 text-[10px] font-bold text-text-light uppercase tracking-widest mt-6 mb-2">커뮤니케이션</p>
            <a href="/app/messenger" className="nav-item active">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z">
                    </path>
                </svg>
                사내 메신저 (인간 전용)
            </a>
            <a href="/app/files" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                </svg>
                문서 및 파일함
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

    {/* Chat Channels / DMs */}
    {/* API: GET /api/workspace/messenger/channels */}
    <aside className="w-72 bg-background-alt border-r border-border flex flex-col h-full z-10 shrink-0">
        <div className="p-5 border-b border-border">
            <h2 className="font-serif text-lg text-text-main flex items-center justify-between">
                <span>메시지</span>
                <button className="text-text-muted hover:text-primary transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                        </path>
                    </svg>
                </button>
            </h2>
            <div className="mt-4 relative">
                <svg className="w-4 h-4 text-text-light absolute left-3 top-2.5" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <input type="text"
                    className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary-light"
                    placeholder="사람 또는 채널 검색..." />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-4">

            {/* Channels */}
            <div>
                <h3 className="px-3 text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">채널</h3>
                <div className="space-y-1">
                    <div
                        className="p-2.5 rounded-xl bg-surface border border-border flex items-center gap-3 cursor-pointer shadow-sm">
                        <span className="text-text-muted font-bold ml-1">#</span>
                        <span className="font-bold text-text-main">general</span>
                    </div>
                    <div
                        className="p-2.5 rounded-xl hover:bg-surface/50 border border-transparent flex items-center justify-between gap-3 cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                            <span className="text-text-muted font-bold ml-1">#</span>
                            <span className="font-medium text-text-main">marketing</span>
                        </div>
                        <span
                            className="w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">2</span>
                    </div>
                    <div
                        className="p-2.5 rounded-xl hover:bg-surface/50 border border-transparent flex items-center gap-3 cursor-pointer transition-colors opacity-70">
                        <span className="text-text-muted font-bold ml-1">🔒</span>
                        <span className="font-medium text-text-main">management</span>
                    </div>
                </div>
            </div>

            {/* Direct Messages */}
            <div>
                <h3 className="px-3 text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">다이렉트 메시지</h3>
                <div className="space-y-1">
                    {/* API: GET /api/workspace/messenger/dms */}
                    <div
                        className="p-2.5 rounded-xl hover:bg-surface/50 border border-transparent flex items-center gap-3 cursor-pointer transition-colors relative">
                        <div
                            className="w-8 h-8 rounded-full bg-text-muted text-white flex items-center justify-center font-bold text-xs relative">
                            이
                            <span
                                className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-primary border-2 border-surface block"></span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-0.5">
                                <span className="font-medium text-text-main">이실장 (운영)</span>
                                <span className="text-[10px] text-text-light font-sans">12:30</span>
                            </div>
                            <p className="text-[11px] text-text-muted truncate">이번주 주간보고서 취합 완료되었습니다.</p>
                        </div>
                    </div>
                    <div
                        className="p-2.5 rounded-xl hover:bg-surface/50 border border-transparent flex items-center gap-3 cursor-pointer transition-colors relative">
                        <div
                            className="w-8 h-8 rounded-full bg-text-muted text-white flex items-center justify-center font-bold text-xs relative opacity-60">
                            박
                            <span
                                className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-surface border border-border block"></span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-0.5">
                                <span className="font-medium text-text-main">박팀장 (세일즈)</span>
                                <span className="text-[10px] text-text-light font-sans">어제</span>
                            </div>
                            <p className="text-[11px] text-text-muted truncate">네 확인했습니다. 수고하셨습니다 👏</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </aside>

    {/* Chat Area */}
    <main className="flex-1 flex flex-col relative bg-surface">
        {/* Header */}
        <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-8 z-10 shrink-0">
            <div className="flex items-center gap-2">
                <span className="text-xl text-text-muted font-bold">#</span>
                <h2 className="font-serif text-lg text-text-main">general</h2>
                <span className="text-xs text-text-muted ml-2">알파 랩스 임직원 전체 채널 🏢</span>
            </div>
            <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                    <div
                        className="w-7 h-7 rounded-full bg-primary-light border-2 border-surface text-primary flex items-center justify-center text-[10px] font-bold z-30">
                        김</div>
                    <div
                        className="w-7 h-7 rounded-full bg-text-muted border-2 border-surface text-white flex items-center justify-center text-[10px] font-bold z-20">
                        이</div>
                    <div
                        className="w-7 h-7 rounded-full bg-text-muted border-2 border-surface text-white flex items-center justify-center text-[10px] font-bold z-10">
                        박</div>
                </div>
                <span className="text-xs text-text-muted border-l border-border pl-3 ml-1">인간: 3명, 봇: 1</span>
            </div>
        </header>

        {/* Messages Area */}
        {/* API: GET /api/workspace/messenger/channels/:id/messages */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 flex flex-col bg-surface">

            <div className="text-center my-4">
                <span
                    className="bg-background-alt border border-border px-3 py-1 text-xs font-medium text-text-light rounded-full">2026년
                    3월 10일 화요일</span>
            </div>

            {/* Other Message */}
            <div className="flex justify-start">
                <div className="max-w-[70%] flex items-start gap-3">
                    <div
                        className="w-10 h-10 rounded-full bg-text-muted text-white flex items-center justify-center font-bold">
                        이</div>
                    <div>
                        <div className="flex items-baseline gap-2 mb-1 pl-1">
                            <span className="font-bold text-text-main">이실장</span>
                            <span className="text-[10px] text-text-light font-sans">09:15</span>
                        </div>
                        <div className="chat-bubble-other text-[15px] leading-relaxed shadow-soft">
                            안녕하세요 팀원 여러분! 오늘 오후 3시에 타운홀 미팅이 예정되어 있습니다.
                            회의실 A 또는 구글 미트 링크로 참석 부탁드립니다.
                        </div>
                    </div>
                </div>
            </div>

            {/* User Message */}
            <div className="flex justify-end">
                <div className="max-w-[70%] flex items-end gap-2 flex-row-reverse">
                    <div className="chat-bubble-user text-[15px] leading-relaxed relative shadow-sm">
                        확인했습니다. 어제 마무리된 SaaS 기획안 관련해서 짧게 공유할게요.
                        <span className="text-[10px] text-text-light absolute -bottom-5 right-1">09:20</span>
                    </div>
                </div>
            </div>

            {/* System/Bot Message */}
            <div className="flex justify-start">
                <div className="max-w-[80%] flex items-start gap-3">
                    <div
                        className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs shadow-sm">
                        🤖</div>
                    <div className="w-full">
                        <div className="flex items-baseline gap-2 mb-1 pl-1">
                            <span className="font-bold text-text-main flex items-center gap-1">CORTHEX 알림봇 <span
                                    className="bg-primary/10 text-primary text-[9px] px-1 py-0.5 rounded uppercase">BOT</span></span>
                            <span className="text-[10px] text-text-light font-sans">10:00</span>
                        </div>
                        <div
                            className="bg-surface border border-border rounded-xl p-4 shadow-sm border-l-4 border-l-primary">
                            <h4 className="font-medium text-primary mb-2 flex items-center gap-1.5">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                마케팅부 '콘텐츠 전문가' 작업 완료
                            </h4>
                            <p className="text-sm text-text-main mb-3">LinkedIn 신규 포스트 초안이 생성되어 승인 대기 중입니다.</p>
                            <div className="flex gap-2">
                                <button
                                    className="px-3 py-1.5 bg-background-alt border border-border rounded text-xs font-medium hover:bg-surface transition-colors">초안
                                    검토하기</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="scroll-anchor"></div>
        </div>

        {/* Input Area */}
        {/* API: POST /api/workspace/messenger/channels/:id/messages */}
        <div className="px-8 py-5 border-t border-border bg-background">
            <div
                className="relative bg-surface border border-border rounded-xl shadow-sm focus-within:border-primary-light transition-colors flex items-end">
                <button className="p-4 text-text-muted hover:text-primary transition-colors h-full">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13">
                        </path>
                    </svg>
                </button>
                <textarea
                    className="w-full py-4 bg-transparent resize-none overflow-hidden min-h-[56px] max-h-40 focus:outline-none text-base leading-relaxed placeholder:text-text-light placeholder:font-sans"
                    placeholder="#general 채널에 메시지 보내기..." rows="1"></textarea>
                <div className="p-3">
                    <button
                        className="p-2 bg-text-main text-white rounded-lg hover:bg-black transition-colors shadow-sm disabled:opacity-50">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <div className="text-left mt-2 text-[11px] text-text-light flex gap-4">
                <span className="hover:text-text-main cursor-pointer"><b className="font-sans">@</b> 멘션</span>
                <span className="hover:text-text-main cursor-pointer">이모지</span>
            </div>
        </div>
    </main>
    </>
  );
}

export default Messenger;
