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

        /* Org chart connection lines */
        .org-line-vert {
            width: 2px;
            height: 1.5rem;
            background-color: inherit /* FIXME: theme value not in map */;
            margin: 0 auto;
        }

        .org-line-horiz {
            height: 2px;
            width: 100%;
            background-color: inherit /* FIXME: theme value not in map */;
            position: absolute;
            top: -1.5rem;
        }
`;

function Departments() {
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
            <a href="/app/departments" className="nav-item active">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4">
                    </path>
                </svg>
                부서 관리
            </a>
            <a href="/app/agents" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z">
                    </path>
                </svg>
                직원 (에이전트)
            </a>
            <a href="/app/credentials" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z">
                    </path>
                </svg>
                도구 권한/인증
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
    {/* API: GET /api/workspace/departments */}
    <main className="flex-1 overflow-y-auto px-8 py-10 relative">
        <header className="mb-10 flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-serif text-text-main mb-2">조직도 및 부서</h1>
                <p className="text-text-muted">독립적으로 예산을 관리하고 협업하는 에이전트 그룹(부서)을 구성하세요.</p>
            </div>

            <button
                className="bg-surface border border-border text-text-main px-4 py-2 rounded-xl hover:bg-background-alt transition-colors font-medium shadow-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
                새 부서 설립
            </button>
        </header>

        {/* Org Chart View */}
        <div
            className="bg-background-alt rounded-2xl border border-border p-10 flex flex-col items-center mb-12 shadow-inner min-h-[500px] overflow-x-auto">

            {/* Root: CEO */}
            <div className="flex flex-col items-center">
                <div className="bg-surface border-2 border-primary/30 p-4 rounded-xl shadow-card text-center min-w-[180px]">
                    <h3 className="font-serif font-bold text-lg mb-1">최고 경영자 (CEO)</h3>
                    <p className="text-xs text-text-muted">인간 사령관</p>
                </div>
                <div className="org-line-vert"></div>
            </div>

            {/* Level 1: Secretariat */}
            <div className="flex flex-col items-center w-full relative">
                <div
                    className="bg-primary/5 border-2 border-primary/50 p-4 rounded-xl shadow-sm text-center min-w-[200px] z-10 cursor-pointer hover:bg-primary/10 transition-colors">
                    <h3 className="font-serif font-bold text-lg text-primary mb-1">비서실</h3>
                    <p className="text-xs text-text-muted flex items-center justify-center gap-1">
                        <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z">
                            </path>
                        </svg>
                        에이전트 1명
                    </p>
                </div>
                <div className="org-line-vert"></div>
            </div>

            {/* Level 2: Departments Container */}
            <div className="relative w-full max-w-4xl flex justify-between px-8 mt-6">
                {/* Horizontal connecting line */}
                <div className="org-line-horiz left-8 right-8 w-auto"></div>

                {/* Dept: Strategy */}
                <div className="flex flex-col items-center relative z-10 w-64">
                    <div className="absolute -top-[1.5rem] w-0.5 h-[1.5rem] bg-border-focus"></div>
                    <div
                        className="bg-surface border border-border p-5 rounded-xl text-center w-full shadow-sm cursor-pointer hover:shadow-card hover:-translate-y-1 transition-all group">
                        <div
                            className="w-10 h-10 mx-auto rounded-full bg-secondary-light text-secondary flex items-center justify-center mb-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                            </svg>
                        </div>
                        <h3 className="font-serif font-bold text-lg mb-1 group-hover:text-primary transition-colors">전략 기획실
                        </h3>
                        <p className="text-xs text-text-muted mb-3">투자 분석 및 시황</p>
                        <div className="flex justify-center -space-x-2">
                            <div
                                className="w-6 h-6 rounded-full bg-secondary text-white border-2 border-surface flex items-center justify-center text-[10px] font-bold z-10">
                                C</div>
                            <div
                                className="w-6 h-6 rounded-full border border-border bg-surface text-text-main flex items-center justify-center text-[10px] font-bold z-0">
                                시</div>
                            <div
                                className="w-6 h-6 rounded-full border border-border bg-surface text-text-main flex items-center justify-center text-[10px] font-bold z-0">
                                분</div>
                        </div>
                    </div>
                </div>

                {/* Dept: Marketing */}
                <div className="flex flex-col items-center relative z-10 w-64">
                    <div className="absolute -top-[1.5rem] w-0.5 h-[1.5rem] bg-border-focus"></div>
                    <div
                        className="bg-surface border border-border p-5 rounded-xl text-center w-full shadow-sm cursor-pointer hover:shadow-card hover:-translate-y-1 transition-all group">
                        <div
                            className="w-10 h-10 mx-auto rounded-full bg-accent-light text-accent-hover flex items-center justify-center mb-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z">
                                </path>
                            </svg>
                        </div>
                        <h3 className="font-serif font-bold text-lg mb-1 group-hover:text-primary transition-colors">마케팅부
                        </h3>
                        <p className="text-xs text-text-muted mb-3">콘텐츠 및 SNS 게재</p>
                        <div className="flex justify-center -space-x-2">
                            <div
                                className="w-6 h-6 rounded-full bg-accent-hover text-white border-2 border-surface flex items-center justify-center text-[10px] font-bold z-10">
                                마</div>
                            <div
                                className="w-6 h-6 rounded-full border border-border bg-surface text-text-main flex items-center justify-center text-[10px] font-bold z-0">
                                콘</div>
                            <div
                                className="w-6 h-6 rounded-full border border-border bg-surface text-text-main flex items-center justify-center text-[10px] font-bold z-0">
                                S</div>
                        </div>
                    </div>
                </div>

                {/* Dept: HR/Admin */}
                <div className="flex flex-col items-center relative z-10 w-64">
                    <div className="absolute -top-[1.5rem] w-0.5 h-[1.5rem] bg-border-focus"></div>
                    <div
                        className="bg-surface border border-border border-dashed p-5 rounded-xl text-center w-full shadow-sm cursor-pointer hover:shadow-card hover:-translate-y-1 transition-all group opacity-70">
                        <div
                            className="w-10 h-10 mx-auto rounded-full bg-background-alt text-text-muted flex items-center justify-center mb-3 border border-border">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z">
                                </path>
                            </svg>
                        </div>
                        <h3 className="font-serif font-bold text-lg mb-1 group-hover:text-primary transition-colors">인사 재무팀
                        </h3>
                        <p className="text-xs text-text-muted mb-3">휴업 상태 (예산초과 방지)</p>
                        <div className="flex justify-center -space-x-2">
                            <div
                                className="w-6 h-6 rounded-full border border-border bg-surface text-text-muted flex items-center justify-center text-[10px] font-bold z-10">
                                인</div>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        {/* Department Details Section */}
        <div>
            <h2 className="font-serif text-xl mb-4 text-text-main">부서 상세 설정</h2>
            <div className="grid lg:grid-cols-2 gap-6">
                {/* API: GET /api/workspace/departments/:id/agents */}
                <div className="card p-0 overflow-hidden cursor-pointer hover:border-primary-light transition-colors">
                    <div className="p-5 border-b border-border bg-surface-alt flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-8 h-8 rounded-full bg-secondary-light text-secondary flex items-center justify-center font-bold">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                                </svg>
                            </div>
                            <h3 className="text-lg font-serif">전략 기획실</h3>
                        </div>
                        <span
                            className="text-xs font-medium text-text-muted bg-background px-2 py-1 rounded-md border border-border">예산:
                            월 ₩100k</span>
                    </div>
                    <div className="p-5">
                        <p className="text-sm text-text-muted mb-4 leading-relaxed">최신 트렌드 분석 및 투자 포트폴리오 관리를 담당합니다. KIS API와
                            웹 검색 권한을 독점적으로 사용합니다.</p>

                        <h4 className="text-xs font-bold text-text-main uppercase tracking-wider mb-2">소속 직원 (3명)</h4>
                        <div className="space-y-2 mb-4">
                            <div
                                className="flex items-center gap-2 p-2 rounded-lg bg-background hover:bg-background-alt transition-colors">
                                <div
                                    className="w-6 h-6 rounded bg-secondary text-white text-[10px] font-bold flex items-center justify-center">
                                    C</div>
                                <span className="text-sm font-medium flex-1">투자 총괄 (CIO)</span>
                                <span
                                    className="text-[10px] text-primary px-1.5 py-0.5 bg-primary-light rounded border border-primary/20">Manager</span>
                            </div>
                            <div
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-background-alt transition-colors border border-transparent">
                                <div
                                    className="w-6 h-6 rounded border border-border bg-surface text-text-main text-[10px] font-bold flex items-center justify-center">
                                    시</div>
                                <span className="text-sm flex-1 text-text-main">시황 분석가</span>
                            </div>
                            <div
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-background-alt transition-colors border border-transparent">
                                <div
                                    className="w-6 h-6 rounded border border-border bg-surface text-text-main text-[10px] font-bold flex items-center justify-center">
                                    분</div>
                                <span className="text-sm flex-1 text-text-main">기업 분석가</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border flex justify-between items-center">
                            <span className="text-xs text-text-light">최근 활동: 5분 전 (명령 처리)</span>
                            <button className="text-primary text-sm font-medium hover:underline">부서 설정 관리 &rarr;</button>
                        </div>
                    </div>
                </div>

                <div
                    className="card p-0 flex flex-col items-center justify-center border-dashed border-2 bg-transparent hover:bg-surface/50 h-[350px]">
                    <div
                        className="w-12 h-12 rounded-full bg-background-alt border border-border text-text-muted flex items-center justify-center mb-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4">
                            </path>
                        </svg>
                    </div>
                    <span className="font-serif text-lg text-text-main">새 부서 만들기</span>
                    <p className="text-xs text-text-muted mt-2 max-w-[200px] text-center">템플릿을 사용하여 새로운 역할을 수행할 부서를 조직하세요.
                    </p>
                </div>
            </div>
        </div>
    </main>
    </>
  );
}

export default Departments;
