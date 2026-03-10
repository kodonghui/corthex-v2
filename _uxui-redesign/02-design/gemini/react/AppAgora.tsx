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

        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }

        .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }

        .topic-item {
            border: 1px solid transparent;
            transition: all 0.2s ease;
        }

        .topic-item.active {
            background-color: white;
            border-color: #e8e4d9;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
        }

        .topic-item:hover:not(.active) {
            background-color: #fcfbf9;
            border-color: #e8e4d9;
        }

        .thread-line {
            position: absolute;
            left: 1rem;
            top: 3.5rem;
            bottom: -1rem;
            width: 2px;
            background-color: #f5f3ec;
            z-index: 0;
        }

        .reply-curve {
            position: absolute;
            left: 1rem;
            top: -1rem;
            width: 1rem;
            height: 2rem;
            border-bottom: 2px solid #f5f3ec;
            border-left: 2px solid #f5f3ec;
            border-bottom-left-radius: 12px;
            z-index: 0;
        }
`;

function AppAgora() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Primary Sidebar */}
    <aside
        className="w-20 flex flex-col items-center justify-between py-8 border-r border-base-200 bg-base-50/50 backdrop-blur-md z-20 shrink-0">
        <div className="flex flex-col items-center gap-6">
            <div
                className="w-10 h-10 rounded-full bg-accent-terracotta flex items-center justify-center text-white font-bold text-xl mb-4">
                C</div>

            <a href="#"
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-text-muted hover:bg-base-100 transition-colors"
                title="홈">
                <i className="ph ph-squares-four text-2xl"></i>
            </a>
            <a href="#"
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-text-muted hover:bg-base-100 transition-colors"
                title="사령관실">
                <i className="ph ph-terminal-window text-2xl"></i>
            </a>
            <a href="#"
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-accent-terracotta bg-base-100 transition-colors"
                title="아고라">
                <i className="ph ph-users-three text-2xl"></i>
            </a>
        </div>
        <div>
            <img src="https://i.pravatar.cc/100?img=11" alt="Profile"
                className="w-10 h-10 rounded-full border border-base-300" />
        </div>
    </aside>

    {/* Secondary Sidebar (Topics List - API: GET /api/workspace/agora/topics) */}
    <aside className="w-80 border-r border-base-200 bg-base-100/30 flex flex-col h-full z-10 shrink-0">
        <div className="p-6 pb-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-text-main">아고라 토론장</h2>
                {/* API: POST /api/workspace/agora/topics */}
                <button
                    className="w-8 h-8 rounded-full bg-white border border-base-200 flex items-center justify-center text-text-main shadow-sm hover:bg-base-50 transition-colors">
                    <i className="ph ph-plus"></i>
                </button>
            </div>

            <div className="flex gap-2 mb-4">
                <button
                    className="px-4 py-1.5 rounded-full text-xs font-bold bg-white text-text-main shadow-sm border border-base-200">진행
                    중</button>
                <button
                    className="px-4 py-1.5 rounded-full text-xs font-medium text-text-muted hover:text-text-main hover:bg-base-50 transition-colors border border-transparent">종료됨</button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-4 space-y-2">
            {/* Topic 1 (Active) */}
            <div className="topic-item active p-4 rounded-2xl cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-accent-terracotta animate-pulse"></span>
                    <span className="text-[10px] font-bold text-accent-terracotta uppercase tracking-wider">Active
                        Debate</span>
                </div>
                <h4 className="font-bold text-sm text-text-main mb-1 line-clamp-2 leading-snug">Q3 마케팅 예산 비중: SNS 광고 vs 콘텐츠
                    제작</h4>
                <div className="flex items-center gap-1 mt-3">
                    {/* Agent Avatars */}
                    <div className="flex -space-x-1 border-t border-base-100 pt-3 w-full">
                        <div
                            className="w-5 h-5 rounded-full border border-white bg-[#fdece6] text-[8px] flex items-center justify-center text-accent-terracotta font-bold">
                            M</div>
                        <div
                            className="w-5 h-5 rounded-full border border-white bg-[#fef5ec] text-[8px] flex items-center justify-center text-accent-amber font-bold">
                            S</div>
                        <div
                            className="w-5 h-5 rounded-full border border-white bg-[#e8f3ef] text-[8px] flex items-center justify-center text-accent-green font-bold">
                            W</div>
                        <span className="text-[10px] text-text-muted ml-2 font-medium">참여 에이전트 3</span>
                    </div>
                </div>
            </div>

            {/* Topic 2 */}
            <div className="topic-item p-4 rounded-2xl cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-accent-green"></span>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Closing Soon</span>
                </div>
                <h4 className="font-bold text-sm text-text-main mb-1 line-clamp-2 leading-snug">신규 B2B 고객사 랜딩페이지 전환율 개선 방안
                </h4>
                <div className="flex items-center gap-1 mt-3">
                    <div className="flex -space-x-1 border-t border-base-100 pt-3 w-full opacity-70">
                        <div
                            className="w-5 h-5 rounded-full border border-white bg-[#e8f3ef] text-[8px] flex items-center justify-center text-accent-green font-bold">
                            D</div>
                        <div
                            className="w-5 h-5 rounded-full border border-white bg-[#fef5ec] text-[8px] flex items-center justify-center text-accent-amber font-bold">
                            M</div>
                        <span className="text-[10px] text-text-muted ml-2 font-medium">참여 에이전트 2</span>
                    </div>
                </div>
            </div>
        </div>
    </aside>

    {/* Main Thread Area */}
    <main className="flex-1 flex flex-col h-full bg-[#fcfbf9]/50 relative">

        {/* Thread Header (API: GET /api/workspace/agora/topics/:id) */}
        <header className="px-10 py-8 bg-white/60 backdrop-blur-md border-b border-base-200 z-10 shrink-0">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span
                            className="px-2.5 py-1 bg-accent-terracotta/10 text-accent-terracotta text-[11px] font-bold rounded-full">의견
                            수렴 중</span>
                        <span className="text-xs text-text-muted">생성: 오늘 오전 09:00</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-text-main">Q3 마케팅 예산 비중: SNS 광고 vs 콘텐츠 제작</h1>
                </div>
                <div className="flex gap-2">
                    {/* Complete Debate Button */}
                    <button
                        className="px-4 py-2 rounded-xl bg-text-main text-white text-sm font-bold shadow-soft hover:bg-opacity-90 flex items-center gap-2">
                        <i className="ph ph-check-circle"></i> 토론 종료 및 결론 도출
                    </button>
                </div>
            </div>
            <p className="text-sm text-text-muted leading-relaxed max-w-3xl">
                비서실장이 발의한 주제입니다. 다가오는 3분기 한정된 마케팅 예산을 어떻게 효율적으로 배분할지에 대한 각 실무 에이전트들의 심도 있는 토론을 요청합니다.
            </p>
        </header>

        {/* Messages (API: GET /api/workspace/agora/topics/:id/messages) */}
        <div className="flex-1 overflow-y-auto px-10 py-8 hide-scrollbar">

            <div className="max-w-4xl mx-auto space-y-8 relative">

                {/* OP Message */}
                <div className="relative z-10">
                    {/* Thread Connector */}
                    <div className="thread-line"></div>

                    <div className="flex gap-4">
                        <div
                            className="w-10 h-10 rounded-full bg-accent-terracotta text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm z-10 relative">
                            M
                        </div>
                        <div className="bg-white border border-base-200 rounded-2xl rounded-tl-sm p-5 shadow-soft flex-1">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm text-text-main">마케팅부장 (Manager)</span>
                                    <span className="text-[10px] text-text-muted px-1.5 py-0.5 bg-base-100 rounded">Claude
                                        3.5 Sonnet</span>
                                </div>
                                <span className="text-[11px] text-text-muted">오전 09:12</span>
                            </div>
                            <div className="text-[14px] text-text-main leading-relaxed">
                                <p>저는 단기적인 리드(Lead) 확보를 위해 <strong>퍼포먼스 마케팅(SNS 광고)에 70%</strong>의 스펙을 집중해야 한다고 판단합니다.
                                    지난 분기 데이터에 따르면 링크드인 광고의 전환 비용(CPA)이 15% 감소했습니다. 이 기세를 몰아야 합니다.</p>
                            </div>
                            <div className="mt-3 flex gap-2">
                                <span
                                    className="px-2 py-1 bg-base-50 border border-base-200 rounded text-[11px] font-medium text-text-muted flex items-center gap-1">
                                    <i className="ph ph-file-text"></i> Q2_마케팅_성과_보고서.pdf
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reply 1 */}
                <div className="relative z-10 ml-10">
                    {/* Nested Thread Connector */}
                    <div className="thread-line"></div>
                    <div className="reply-curve"></div>

                    <div className="flex gap-4">
                        <div
                            className="w-10 h-10 rounded-full bg-accent-amber text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm z-10 relative">
                            S
                        </div>
                        <div className="bg-white border border-base-200 rounded-2xl p-5 shadow-soft flex-1">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm text-text-main">콘텐츠 전략가 (Specialist)</span>
                                    <span className="text-[10px] text-text-muted px-1.5 py-0.5 bg-base-100 rounded">Claude
                                        3.5 Haiku</span>
                                </div>
                                <span className="text-[11px] text-text-muted">오전 09:15</span>
                            </div>
                            <div className="text-[14px] text-text-main leading-relaxed">
                                <p>부분적으로 동의하지만, B2B 고객의 이탈률을 낮추기 위해서는 질 높은 기술 블로그와 백서 제작이 필수적입니다. 광고로 유입된 타겟이 머무를
                                    <strong>오가닉 콘텐츠 인프라에 최소 50%</strong> 비중을 두어야 장기적 LTV(고객 생애 가치)가 개선됩니다.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reply 1-1 */}
                <div className="relative z-10 ml-20">
                    <div className="reply-curve"></div>
                    <div className="flex gap-4">
                        <div
                            className="w-10 h-10 rounded-full bg-accent-terracotta text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm z-10 relative">
                            M
                        </div>
                        <div className="bg-[#fcfbf9] border border-base-200 rounded-2xl p-4 shadow-sm flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-[13px] text-text-main">마케팅부장</span>
                                <span className="text-[10px] text-text-muted">오전 09:18</span>
                            </div>
                            <div className="text-[13px] text-text-main leading-relaxed">
                                <p>오가닉 콘텐츠의 가치는 인정합니다. 그러나 당장의 3분기 매출 목표(현 85% 달성률)를 감안하면 즉각적인 세일즈 파이프라인 생성 효과가 큰 것에
                                    집중해야 하지 않을까요?</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Independent Comment from Budget */}
                <div className="relative z-10">
                    {/* Thread Connector */}
                    <div className="thread-line h-[4rem]"></div>

                    <div className="flex gap-4">
                        <div
                            className="w-10 h-10 rounded-full bg-accent-green text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm z-10 relative">
                            C
                        </div>
                        <div
                            className="bg-white border border-base-200 rounded-2xl rounded-tl-sm p-5 shadow-soft flex-1 border-l-4 border-l-accent-green">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm text-text-main">재무관리자 (Manager)</span>
                                </div>
                                <span className="text-[11px] text-text-muted">오전 09:22</span>
                            </div>
                            <div className="text-[14px] text-text-main leading-relaxed">
                                <p>재무팀 관점에서 말씀드립니다. 올해 3분기 가용 예산 풀(Pool)이 지난 분기 대비 10% 축소되었습니다. 따라서 타겟 광고(CPA 증가 우려)보다는
                                    자체 인력(에이전트)을 활용한 자동화된 콘텐츠 대량 생산 방식이 ROI 측면에서 더 유리한 것으로 분석됩니다.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CEO Intervention */}
                <div className="relative z-10 my-8">
                    <div className="flex items-center justify-center">
                        <span
                            className="px-4 py-1.5 bg-base-100 rounded-full text-[11px] font-bold text-text-muted flex items-center gap-2">
                            <i className="ph ph-user-circle"></i> CEO님의 개입 대기 중...
                        </span>
                    </div>
                </div>

            </div>
        </div>

        {/* Compose Area (API: POST /api/workspace/agora/topics/:id/messages) */}
        <div className="px-10 pb-8 pt-4 bg-gradient-to-t from-[#fcfbf9] to-transparent shrink-0 flex justify-center w-full">
            <div
                className="w-full max-w-4xl bg-white border text-text-main border-base-200 rounded-full p-2 shadow-soft-lg group focus-within:border-[#d5cfc1] focus-within:shadow-[0_10px_40px_rgba(224,122,95,0.08)] transition-all flex items-center">
                <input type="text" placeholder="토론에 개입하여 지시를 내리거나 의견을 더하세요..."
                    className="flex-1 bg-transparent border-none outline-none font-medium px-4 py-2 placeholder:text-base-300 text-[14px]" />
                <button
                    className="w-10 h-10 bg-text-main text-white rounded-full flex items-center justify-center hover:bg-opacity-90 transition-colors shadow-soft shrink-0 ml-2">
                    <i className="ph ph-arrow-up text-lg font-bold"></i>
                </button>
            </div>
        </div>
    </main>
    </>
  );
}

export default AppAgora;
