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
            padding: 1.5rem;
            border: 1px solid inherit /* FIXME: theme value not in map */;
            transition: box-shadow 0.3s ease;
        }

        .card:hover {
            box-shadow: inherit /* FIXME: theme value not in map */;
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

        .chat-bubble-user {
            background-color: inherit /* FIXME: theme value not in map */;
            border: 1px solid inherit /* FIXME: theme value not in map */;
            border-radius: 1rem 1rem 0 1rem;
            padding: 1rem 1.25rem;
        }

        .chat-bubble-ai {
            background-color: inherit /* FIXME: theme value not in map */;
            color: inherit /* FIXME: theme value not in map */;
            border: 1px solid inherit /* FIXME: theme value not in map */;
            opacity: 0.9;
            border-radius: 1rem 1rem 1rem 0;
            padding: 1.25rem;
        }

        .input-bar {
            background-color: inherit /* FIXME: theme value not in map */;
            border: 1px solid inherit /* FIXME: theme value not in map */;
            border-radius: 1.5rem;
            box-shadow: inherit /* FIXME: theme value not in map */;
            transition: box-shadow 0.2s;
        }

        .input-bar:focus-within {
            box-shadow: 0 0 0 3px inherit /* FIXME: theme value not in map */;
            border-color: inherit /* FIXME: theme value not in map */;
        }
`;

function CommandCenter() {
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
            <a href="/app/command-center" className="nav-item active">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z">
                    </path>
                </svg>
                사령관실
            </a>
            <a href="/app/agents" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z">
                    </path>
                </svg>
                부서 및 직원
            </a>
            <a href="/app/reports" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                    </path>
                </svg>
                보고서
            </a>
            <a href="/app/costs" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
                    </path>
                </svg>
                비용 관리
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

    {/* Main Content: Command Center */}
    <main className="flex-1 flex flex-col relative bg-background">
        {/* Header */}
        <header
            className="h-16 border-b border-border bg-surface/80 backdrop-blur-md flex items-center justify-between px-8 z-10 sticky top-0">
            <h1 className="font-serif text-xl tracking-wide flex items-center gap-2">
                <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                사령관실
            </h1>
            <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-text-muted flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary block animate-pulse"></span>
                    비서실장 연결됨
                </span>
                {/* API: GET /api/workspace/agents */}
                <button className="text-text-muted hover:text-text-main transition-colors" title="활성 에이전트 목록">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z">
                        </path>
                    </svg>
                </button>
            </div>
        </header>

        {/* Command History (Chat Area) */}
        {/* API: GET /api/workspace/commands */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 flex flex-col">

            {/* Welcome Message */}
            <div className="text-center my-8 text-text-muted">
                <h2 className="font-serif text-2xl mb-2 text-text-main">무엇을 도와드릴까요, 김대표님?</h2>
                <p>텍스트 명령, @멘션, 템플릿 사용 등 원하는 방식으로 지시해주세요.</p>
            </div>

            {/* User Command: Date Divider */}
            <div className="flex items-center justify-center relative">
                <div className="border-t border-border w-full absolute"></div>
                <span className="bg-background px-4 text-xs font-medium text-text-light relative z-10">오늘</span>
            </div>

            {/* Single Command Block */}
            <div className="flex flex-col gap-4">
                {/* User input */}
                <div className="flex justify-end">
                    <div className="max-w-2xl flex items-end gap-3 flex-row-reverse">
                        <div
                            className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center font-bold text-text-muted shrink-0 shadow-sm">
                            김</div>
                        <div className="chat-bubble-user text-base leading-relaxed">
                            <span
                                className="font-medium text-primary bg-primary-light px-1.5 py-0.5 rounded mr-1">@마케팅부</span>
                            이번 주 발표 예정인 신제품 '알파 에이전트' 런칭 캠페인 아이디어 3개 제안해줘.
                        </div>
                    </div>
                </div>

                {/* AI Response & Delegation Chain */}
                <div className="flex justify-start">
                    <div className="max-w-3xl flex items-start gap-4">
                        <div
                            className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0 mt-1 shadow-sm">
                            비</div>
                        <div className="flex flex-col gap-3 w-full">
                            {/* Delegation Chain Visualizer */}
                            <div
                                className="flex items-center gap-2 text-xs font-medium text-text-muted bg-surface/50 p-2 rounded-lg border border-border w-max">
                                <span className="flex items-center gap-1"><span
                                        className="w-1.5 h-1.5 rounded-full bg-primary"></span>비서실장</span>
                                <svg className="w-3 h-3 text-text-light" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M9 5l7 7-7 7"></path>
                                </svg>
                                <span className="flex items-center gap-1 text-secondary"><span
                                        className="w-1.5 h-1.5 rounded-full bg-secondary"></span>마케팅팀장(가동)</span>
                                <svg className="w-3 h-3 text-text-light" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M9 5l7 7-7 7"></path>
                                </svg>
                                <span className="flex items-center gap-1">콘텐츠 전문가 & SEO аналитик</span>
                            </div>

                            {/* Final Output */}
                            <div className="bg-surface border border-border rounded-xl p-5 shadow-soft">
                                <h3 className="font-serif text-lg mb-4 pb-3 border-b border-border">신제품 '알파 에이전트' 런칭 캠페인 제안
                                </h3>
                                <div className="space-y-4 text-text-main text-base font-sans mt-2">
                                    <p>김대표님, 마케팅부서에서 신제품 캠페인 아이디어 3가지를 정리했습니다.</p>

                                    <div className="bg-background-alt p-4 rounded-lg">
                                        <h4 className="font-bold text-primary mb-1">1. "누구나 가지는 AI 비서실" 캠페인</h4>
                                        <p className="text-sm">B2B 타겟으로 기존 복잡한 도구들 대신 1명의 비서실장을 채용한다는 컨셉의 영상 및 링크드인 광고입니다.
                                        </p>
                                    </div>
                                    <div className="bg-background-alt p-4 rounded-lg">
                                        <h4 className="font-bold text-primary mb-1">2. 체험형 "10분 만에 조직 세팅" 웨비나</h4>
                                        <p className="text-sm">라이브 데모를 통해 직접 템플릿으로 조직을 구성하는 과정을 보여주는 실시간 스트리밍입니다.</p>
                                    </div>
                                    <div className="bg-background-alt p-4 rounded-lg">
                                        <h4 className="font-bold text-primary mb-1">3. 성공사례 백서 가이드 무료 배포</h4>
                                        <p className="text-sm">기존 베타테스터들의 사용 사례(예: 마케팅 비용 40% 절감)를 다룬 SEO 최적화 백서입니다.</p>
                                    </div>
                                </div>
                                <div
                                    className="mt-5 pt-3 border-t border-border flex justify-between items-center text-xs text-text-light">
                                    <span className="flex items-center gap-1 text-primary">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                        품질 게이트 통과 (비서실장)
                                    </span>
                                    <div className="flex gap-2">
                                        <button className="hover:text-primary transition-colors">👍 만족</button>
                                        <button className="hover:text-secondary-hover transition-colors">👎 불만족</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        {/* Input Area (Sticky Bottom) */}
        {/* API: POST /api/workspace/commands */}
        <div className="px-8 py-5 border-t border-border bg-surface/80 backdrop-blur-md sticky bottom-0 z-20">
            <div className="relative max-w-4xl mx-auto flex gap-3">

                <button
                    className="p-3 bg-surface border border-border rounded-xl text-text-muted hover:text-text-main hover:bg-background-alt transition-colors shrink-0 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13">
                        </path>
                    </svg>
                </button>

                <div className="flex-1 relative">
                    <textarea
                        className="input-bar w-full py-3.5 pl-5 pr-14 resize-none overflow-hidden max-h-32 min-h-[56px] text-base leading-relaxed placeholder:text-text-light"
                        placeholder="명령을 입력하세요... (@부서명으로 지정 가능, '/' 입력시 단축 메뉴)" rows="1"></textarea>
                    <button
                        className="absolute right-2 bottom-2 p-2 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                        </svg>
                    </button>
                </div>

                {/* Helper Tips */}
                <div
                    className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-4 text-xs font-medium text-text-muted">
                    <span className="flex items-center gap-1 bg-background-alt px-2 py-1 rounded">
                        <kbd className="font-sans border-b border-border text-text-main">Enter</kbd> 전송
                    </span>
                    <span className="flex items-center gap-1 bg-background-alt px-2 py-1 rounded">
                        <kbd className="font-sans border-b border-border text-text-main">Shift</kbd> + <kbd
                            className="font-sans border-b border-border text-text-main">Enter</kbd> 줄바꿈
                    </span>
                    <span className="flex items-center gap-1 bg-background-alt px-2 py-1 rounded">
                        <kbd className="font-sans border-b border-border text-text-main">/</kbd> 슬래시 메뉴
                    </span>
                </div>
            </div>
        </div>
    </main>
    </>
  );
}

export default CommandCenter;
