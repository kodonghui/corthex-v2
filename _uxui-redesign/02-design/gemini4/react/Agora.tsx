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

        .timeline-line {
            position: absolute;
            left: 1.25rem;
            top: 0;
            bottom: 0;
            width: 2px;
            background-color: inherit /* FIXME: theme value not in map */;
        }
`;

function Agora() {
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
            <a href="/app/trading" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
                전략실 (투자동향)
            </a>
            <a href="/app/agora" className="nav-item active">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z">
                    </path>
                </svg>
                AGORA (토론장)
            </a>
            <a href="/app/nexus" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5">
                    </path>
                </svg>
                NEXUS (워크플로우)
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

    {/* Debate List */}
    {/* API: GET /api/workspace/debates */}
    <aside className="w-80 bg-background-alt border-r border-border flex flex-col h-full z-10 shrink-0">
        <div className="p-5 border-b border-border flex justify-between items-center">
            <h2 className="font-serif text-lg text-text-main flex items-center gap-2">
                토론 목록
            </h2>
            <button
                className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary-hover shadow-sm transition-colors"
                title="새 토론 열기">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Active Debate Item */}
            <div
                className="p-4 bg-surface border-2 border-primary rounded-xl shadow-soft cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                <div className="flex justify-between items-start mb-2">
                    <span
                        className="text-[10px] font-bold text-primary bg-primary-light px-2 py-0.5 rounded uppercase tracking-wide">진행중
                        (Round 2)</span>
                    <span className="text-[10px] text-text-light font-sans">방금 전</span>
                </div>
                <h3 className="font-medium text-text-main mb-2 leading-snug">신사업 A안(SaaS) vs B안(모바일앱) 진출 방향성</h3>
                <div className="flex items-center gap-1">
                    <div className="flex -space-x-1.5 overflow-hidden">
                        <div
                            className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-primary text-[8px] flex items-center justify-center text-white font-bold">
                            비</div>
                        <div
                            className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-secondary text-[8px] flex items-center justify-center text-white font-bold">
                            마</div>
                        <div
                            className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-accent text-[8px] flex items-center justify-center text-white font-bold">
                            기</div>
                    </div>
                    <span className="text-[11px] text-text-muted ml-1">참여 3명</span>
                </div>
            </div>

            {/* Completed Debate Item */}
            <div
                className="p-4 rounded-xl border border-border hover:bg-surface transition-colors cursor-pointer bg-transparent">
                <div className="flex justify-between items-start mb-2">
                    <span
                        className="text-[10px] font-bold text-text-muted bg-border px-2 py-0.5 rounded uppercase tracking-wide flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7">
                            </path>
                        </svg>
                        합의 완료
                    </span>
                    <span className="text-[10px] text-text-light font-sans">어제</span>
                </div>
                <h3 className="font-medium text-text-main mb-2 leading-snug">올해 하반기 마케팅 예산 배분안 적정성</h3>
                <div className="flex items-center gap-1">
                    <div className="flex -space-x-1.5 overflow-hidden filter grayscale opacity-80">
                        <div
                            className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-secondary text-[8px] flex items-center justify-center text-white font-bold">
                            마</div>
                        <div
                            className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-green-600 text-[8px] flex items-center justify-center text-white font-bold">
                            재</div>
                    </div>
                    <span className="text-[11px] text-text-muted ml-1">참여 2명</span>
                </div>
            </div>
        </div>
    </aside>

    {/* Main Content: Active Debate (SSE streaming interface) */}
    {/* API: GET /api/workspace/debates/:id/timeline */}
    <main className="flex-1 flex flex-col relative bg-background">
        {/* Debate Header */}
        <header
            className="p-6 border-b border-border bg-surface shrink-0 z-10 shadow-sm flex justify-between items-start border-l border-primary/20">
            <div>
                <h1 className="text-2xl font-serif text-text-main mb-2">신사업 A안(SaaS) vs B안(모바일앱) 진출 방향성</h1>
                <p className="text-sm text-text-muted max-w-2xl leading-relaxed font-sans">
                    현재 우리의 B2B 솔루션 기술력을 바탕으로 다음 분기에 중소기업용 SaaS 구독 모델로 피벗할지,
                    아니면 기존 기획대로 B2C 모바일 앱을 출시할지에 대해 3개 부서의 관점을 듣고 합의안을 도출합니다.
                </p>
            </div>
            <div className="flex items-center gap-3">
                <div className="text-right">
                    <p className="text-[10px] text-text-muted uppercase tracking-widest mb-0.5">진행 상태</p>
                    <p className="text-sm font-bold text-primary flex items-center gap-1.5 justify-end">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse inline-block"></span>
                        Round 2 발언 중
                    </p>
                </div>
                {/* API: POST /api/workspace/debates/:id/stop */}
                <button
                    className="bg-surface border border-border text-text-muted px-3 py-1.5 rounded-lg hover:text-secondary-hover hover:bg-secondary-light transition-colors font-medium text-xs">
                    강제 종료
                </button>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 relative flex gap-8">

            {/* Timeline (Left) */}
            <div className="flex-1 max-w-3xl relative">
                <div className="timeline-line"></div>

                {/* Timeline Event: Round 1 Start */}
                <div className="relative pl-12 mb-8 group">
                    <div
                        className="absolute left-[1.05rem] -translate-x-1/2 w-4 h-4 rounded-full bg-border border-2 border-background flex items-center justify-center z-10 text-[8px] font-bold text-text-muted">
                        R1</div>
                    <h3 className="font-serif text-lg text-text-muted mb-4 border-b border-border pb-1 inline-block">1라운드: 각
                        부서 초기 입장 표명</h3>

                    {/* Debate Message: Participant 1 */}
                    <div className="card p-5 mb-4 border border-border ml-2 bg-surface">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-sm">
                                    마</div>
                                <div>
                                    <span className="font-bold text-text-main text-sm">마케팅팀장</span>
                                    <span
                                        className="bg-secondary-light text-secondary px-1.5 py-0.5 rounded text-[10px] ml-1">관점:
                                        시장 크기 및 고객 획득 비용(CAC)</span>
                                </div>
                            </div>
                            <span className="text-xs text-text-light font-sans">14:20</span>
                        </div>
                        <div className="text-[14px] text-text-main font-sans leading-relaxed space-y-2">
                            <p>저는 <strong>B안(B2C 모바일 앱)</strong>을 지지합니다.</p>
                            <p>단기적으로 트래픽과 활성 사용자 수(MAU)를 극대화하여 투자 유치를 해야 하는 현 시점에서는, 세일즈 주기가 길고 초기 진입 장벽이 높은 SaaS 모델보다
                                모바일 바이럴을 노리는 편이 낫습니다. 마케팅 비용 대비 전환율 자체는 B2C가 초기 확보에 훨씬 유리합니다.</p>
                        </div>
                    </div>

                    {/* Debate Message: Participant 2 */}
                    <div className="card p-5 mb-4 border border-border ml-2 bg-surface">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm">
                                    기</div>
                                <div>
                                    <span className="font-bold text-text-main text-sm">기술총괄부장</span>
                                    <span
                                        className="bg-accent-light text-accent-hover px-1.5 py-0.5 rounded text-[10px] ml-1">관점:
                                        개발 리소스 및 시스템 안정성</span>
                                </div>
                            </div>
                            <span className="text-xs text-text-light font-sans">14:22</span>
                        </div>
                        <div className="text-[14px] text-text-main font-sans leading-relaxed space-y-2">
                            <p>마케팅팀장님의 의견에 반대하며 <strong>A안(B2B SaaS)</strong>을 강력히 추천합니다.</p>
                            <p>현재 우리의 코어 기술인 '실시간 위임 체인 엔진'은 대량의 가벼운 동시접속 트랜잭션(B2C)보다는 딥하고 복잡한 워크플로우를 소화하는 데 최적화되어 있습니다.
                                모바일 환경으로 포팅하기 위해 UI/UX를 새로 개발하는 데 최소 3개월이 소요되며, 이는 엔지니어링 리소스의 낭비입니다.</p>
                        </div>
                    </div>
                </div>

                {/* Timeline Event: Round 2 (Streaming View) */}
                <div className="relative pl-12 mb-8">
                    <div
                        className="absolute left-[1.05rem] -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-2 border-background flex items-center justify-center z-10 text-[8px] font-bold text-white shadow-soft">
                        R2</div>
                    <h3
                        className="font-serif text-lg text-primary mb-4 border-b border-primary/30 pb-1 inline-block flex items-center gap-2">
                        2라운드: 관점 교차 검증 및 반박
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse block"></span>
                    </h3>

                    <div
                        className="card p-5 mb-4 border border-primary/50 ml-2 bg-primary-light/10 shadow-soft relative overflow-hidden">
                        {/* Streaming gradient effect */}
                        <div
                            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-primary-light w-full animate-pulse">
                        </div>
                        <div className="flex justify-between items-center mb-3 relative z-10">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                                    비</div>
                                <div>
                                    <span className="font-bold text-text-main text-sm">비서실장 (중재자)</span>
                                    <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] ml-1">관점:
                                        전사 전략 정렬</span>
                                </div>
                            </div>
                            <span className="text-xs text-primary font-bold animate-pulse font-sans">생성 중...</span>
                        </div>
                        <div className="text-[14px] text-text-main font-sans leading-relaxed space-y-2 relative z-10">
                            <p>두 분의 의견 모두 타당성이 있습니다. 마케팅팀은 '자금 유치를 위한 지표(MAU)'를, 기술팀은 '핵심 기술의 핏(Product-Market Fit)'을
                                중시하고 있습니다.</p>
                            <p>기술총괄부장님께 질문드립니다. 현재 딥한 워크플로우를 강조하셨는데, 이를 B2C 모바일 환경에서도 경량화하여 적용할 '템플릿 방식'을 도입한다면, 마케팅팀이
                                우려하는 B2B의 긴 세일즈 주기를 단축할 수 있지 않을까요? <span
                                    className="border-r-2 border-primary animate-pulse pr-1">의견을</span></p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Participants & Rules Panel (Right sticky) */}
            <div className="w-64 shrink-0 hidden lg:block">
                <div className="sticky top-0 space-y-4">
                    <div className="bg-surface border border-border rounded-xl p-4 shadow-sm">
                        <h4 className="font-serif text-sm border-b border-border pb-2 mb-3">토론자 라인업</h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 opacity-100">
                                <div
                                    className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[10px]">
                                    비</div>
                                <span className="text-xs font-bold text-text-main flex-1">비서실장(진행)</span>
                                <span className="w-2 h-2 rounded-full bg-primary border border-white"></span>
                            </div>
                            <div className="flex items-center gap-2 opacity-60">
                                <div
                                    className="w-6 h-6 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-[10px]">
                                    마</div>
                                <span className="text-xs font-medium text-text-main">마케팅팀장</span>
                            </div>
                            <div className="flex items-center gap-2 opacity-60">
                                <div
                                    className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center font-bold text-[10px]">
                                    기</div>
                                <span className="text-xs font-medium text-text-main">기술총괄부장</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-background-alt border border-border rounded-xl p-4">
                        <h4 className="font-serif text-sm border-b border-border pb-2 mb-2 text-text-muted">설정된 규칙</h4>
                        <ul className="text-[11px] text-text-muted space-y-1.5 font-sans">
                            <li className="flex items-start gap-1"><span className="text-primary mt-0.5">•</span> 3라운드 진행제</li>
                            <li className="flex items-start gap-1"><span className="text-primary mt-0.5">•</span> 근거 없는 추측 배제
                                (Quality Rule #4)</li>
                            <li className="flex items-start gap-1"><span className="text-primary mt-0.5">•</span> 최종 합의안 1장 요약
                                제출</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

    </main>
    </>
  );
}

export default Agora;
