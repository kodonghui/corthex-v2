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
            transition: all 0.3s;
        }

        .card:hover {
            transform: translateY(-2px);
            box-shadow: inherit /* FIXME: theme value not in map */;
            border-color: inherit /* FIXME: theme value not in map */;
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

function Agents() {
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
            <a href="/app/departments" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4">
                    </path>
                </svg>
                부서 관리
            </a>
            <a href="/app/agents" className="nav-item active">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z">
                    </path>
                </svg>
                직원 (에이전트)
            </a>
            <a href="/app/reports" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                    </path>
                </svg>
                보고서
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
    <main className="flex-1 overflow-y-auto px-8 py-10 relative">
        <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
            <div>
                <h1 className="text-3xl font-serif text-text-main mb-2">고용된 직원 (에이전트)</h1>
                <p className="text-text-muted">현재 알파 랩스에서 근무 중인 AI 직원 명단입니다. 필요한 역할군을 추가 채용하세요.</p>
            </div>

            <div className="flex gap-2">
                <div className="relative">
                    <svg className="w-4 h-4 text-text-light absolute left-3 top-3" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <input type="text"
                        className="bg-surface border border-border text-text-main rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-primary-light shadow-sm w-64 text-sm"
                        placeholder="이름, 부서 또는 역할 검색" />
                </div>
                {/* API: POST /api/workspace/agents */}
                <button
                    className="bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-primary-hover transition-colors font-medium shadow-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    새 직원 채용
                </button>
            </div>
        </header>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-surface p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center"><svg
                        className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z">
                        </path>
                    </svg></div>
                <div>
                    <h4 className="text-xl font-bold font-serif text-text-main">12명</h4>
                    <span className="text-xs text-text-muted">총 임직원 수</span>
                </div>
            </div>
            <div className="bg-surface p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary-light text-secondary flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4">
                        </path>
                    </svg></div>
                <div>
                    <h4 className="text-xl font-bold font-serif text-text-main">3개</h4>
                    <span className="text-xs text-text-muted">활성화된 부서</span>
                </div>
            </div>
            <div className="bg-surface p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-accent-light text-accent flex items-center justify-center"><svg
                        className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg></div>
                <div>
                    <h4 className="text-xl font-bold font-serif text-text-main">9명</h4>
                    <span className="text-xs text-text-muted">오토파일럿 가능</span>
                </div>
            </div>
            <div className="bg-surface p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
                <div
                    className="w-10 h-10 rounded-full bg-background-alt text-text-muted border border-border flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
                        </path>
                    </svg></div>
                <div>
                    <h4 className="text-xl font-bold font-serif text-text-main">₩32.5k</h4>
                    <span className="text-xs text-text-muted">일일 추정 인건비</span>
                </div>
            </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-4 border-b border-border">
            <button className="pb-3 text-sm font-bold text-primary border-b-2 border-primary">전체 직무</button>
            <button className="pb-3 text-sm font-medium text-text-muted hover:text-text-main">매니저 (M)</button>
            <button className="pb-3 text-sm font-medium text-text-muted hover:text-text-main">스페셜리스트 (S)</button>
            <button className="pb-3 text-sm font-medium text-text-muted hover:text-text-main">스태프 (A)</button>
        </div>

        {/* Agents Grid */}
        {/* API: GET /api/workspace/agents */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

            {/* Agent Card 1: Manager */}
            <div className="card p-0 overflow-hidden group cursor-pointer">
                <div className="h-1 bg-primary"></div>
                <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                        <div
                            className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-lg shadow-sm">
                            비</div>
                        <span
                            className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Manager</span>
                    </div>
                    <h3 className="font-serif text-lg text-text-main mb-1">비서실장</h3>
                    <p className="text-xs text-text-muted mb-4 h-8 overflow-hidden text-ellipsis leading-relaxed">CEO의 직접
                        명령을 분석하여 최적의 부서장에게 라우팅하고 종합 보고서를 작성합니다.</p>

                    <div className="border-t border-border pt-4 mt-auto">
                        <div className="flex justify-between items-center text-xs text-text-muted">
                            <span className="flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4">
                                    </path>
                                </svg>
                                비서실 (단독)
                            </span>
                            <span className="flex items-center gap-1 text-primary">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary block"></span> 근무중
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Agent Card 2: Manager */}
            <div className="card p-0 overflow-hidden group cursor-pointer">
                <div className="h-1 bg-secondary"></div>
                <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                        <div
                            className="w-12 h-12 rounded-2xl bg-secondary text-white flex items-center justify-center font-bold text-lg shadow-sm">
                            마</div>
                        <span
                            className="bg-secondary/10 text-secondary text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Manager</span>
                    </div>
                    <h3 className="font-serif text-lg text-text-main mb-1">마케팅팀장</h3>
                    <p className="text-xs text-text-muted mb-4 h-8 overflow-hidden text-ellipsis leading-relaxed">전사 마케팅 전략을
                        기획하고 산하의 SEO, 콘텐츠 스페셜리스트에게 업무를 하달합니다.</p>

                    <div className="border-t border-border pt-4 mt-auto">
                        <div className="flex justify-between items-center text-xs text-text-muted">
                            <span className="flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4">
                                    </path>
                                </svg>
                                마케팅부
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-border block"></span> 대기중
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Agent Card 3: Specialist */}
            <div
                className="card p-0 overflow-hidden group cursor-pointer bg-surface/50 border-dashed border-2 hover:border-solid hover:bg-surface">
                <div className="h-1 bg-accent"></div>
                <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                        <div
                            className="w-12 h-12 rounded-2xl border-2 border-accent text-accent flex items-center justify-center font-bold text-lg">
                            시</div>
                        <span
                            className="bg-accent/10 text-accent-hover text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Specialist</span>
                    </div>
                    <h3 className="font-serif text-lg text-text-main mb-1">시황 분석가</h3>
                    <p className="text-xs text-text-muted mb-4 h-8 overflow-hidden text-ellipsis leading-relaxed">거시 경제 지표 및
                        특정 종목의 실적/모멘텀을 깊이 있게 분석하여 보고서를 제공합니다.</p>

                    <div className="border-t border-border pt-4 mt-auto">
                        <div className="flex justify-between items-center text-xs text-text-muted">
                            <span className="flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4">
                                    </path>
                                </svg>
                                전략실
                            </span>
                            <span className="flex items-center gap-1 text-primary">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary block animate-pulse"></span> 작업중
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Agent Card 4: Specialist */}
            <div
                className="card p-0 overflow-hidden group cursor-pointer bg-surface/50 border-dashed border-2 hover:border-solid hover:bg-surface">
                <div className="h-1 bg-border"></div>
                <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                        <div
                            className="w-12 h-12 rounded-2xl border-2 border-border text-text-muted flex items-center justify-center font-bold text-lg">
                            콘</div>
                        <span
                            className="bg-background-alt text-text-muted text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Specialist</span>
                    </div>
                    <h3 className="font-serif text-lg text-text-main mb-1">콘텐츠 전문가</h3>
                    <p className="text-xs text-text-muted mb-4 h-8 overflow-hidden text-ellipsis leading-relaxed">블로그 아티클,
                        링크드인 포스트 등 플랫폼별 최적화된 마케팅 콘텐츠를 작성합니다.</p>

                    <div className="border-t border-border pt-4 mt-auto">
                        <div className="flex justify-between items-center text-xs text-text-muted">
                            <span className="flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4">
                                    </path>
                                </svg>
                                마케팅부
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-border block"></span> 대기중
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add New Agent Placeholder */}
            <div
                className="card p-0 overflow-hidden border-dashed border-2 border-border bg-transparent hover:bg-surface/50 transition-colors cursor-pointer flex flex-col items-center justify-center h-full min-h-[220px]">
                <div
                    className="w-12 h-12 rounded-full bg-background-alt flex items-center justify-center text-text-muted mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                </div>
                <h3 className="font-serif text-base text-text-main mb-1">새로운 역할군 채용</h3>
                <p className="text-xs text-text-light text-center px-4">마켓플레이스에서 검증된 프리셋을 가져오거나 완전히 새로운 역할을 부여하세요.</p>
            </div>

        </div>
    </main>
    </>
  );
}

export default Agents;
