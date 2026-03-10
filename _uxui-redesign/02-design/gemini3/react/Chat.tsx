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

        /* Chat bubbles */
        .chat-bubble-user {
            background-color: rgba(34, 211, 238, 0.1);
            border: 1px solid rgba(34, 211, 238, 0.2);
            border-bottom-right-radius: 4px;
        }

        .chat-bubble-agent {
            background-color: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-bottom-left-radius: 4px;
        }

        .typing-dot {
            animation: typing-dot 1.4s infinite ease-in-out both;
        }

        .typing-dot:nth-child(1) {
            animation-delay: -0.32s;
        }

        .typing-dot:nth-child(2) {
            animation-delay: -0.16s;
        }

        @keyframes typing-dot {

            0%,
            80%,
            100% {
                transform: scale(0);
            }

            40% {
                transform: scale(1);
            }
        }
`;

function Chat() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Secondary Sidebar: Chat Sessions (API: GET /api/workspace/chat/sessions) */}
    <aside
        className="w-72 flex flex-col border-r border-white/5 bg-[#0a0a0f]/80 backdrop-blur-3xl h-full border-l border-white/5 relative z-20 shadow-[10px_0_30px_rgba(0,0,0,0.5)]">
        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/5">
            <h2 className="text-white/90 font-medium flex items-center gap-2">
                <i className="fas fa-comments text-accent-cyan"></i> 1:1 대화
            </h2>
            <button className="btn-icon !p-1.5"><i className="fas fa-plus"></i></button>
        </div>

        <div className="px-5 py-3 border-b border-white/5">
            <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-white/30 text-xs"></i>
                <input type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-sm text-white focus:outline-none focus:border-accent-cyan/50 transition-colors"
                    placeholder="세션 검색..." />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto w-full p-2 space-y-1">
            {/* Session Item (Active) */}
            <div
                className="p-3 bg-gradient-to-r from-accent-cyan/20 to-transparent border-l-2 border-accent-cyan rounded-r-lg cursor-pointer group relative">
                <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-medium text-white truncate max-w-[160px]">투자 포트폴리오 리밸런싱 방향 논의</span>
                    <span className="text-[10px] text-white/40 font-mono">14:02</span>
                </div>
                <div className="text-xs text-white/60 truncate w-full pr-6">네, 현재 보유 중이신 기술주 비중을 줄이고 헬스케어 비중을 확대하는 것을 권장합니다.
                </div>

                <div
                    className="absolute right-2 bottom-2 bg-[#0a0a0f] px-1.5 py-0.5 rounded border border-white/10 text-[9px] text-white/50 flex align-center gap-1.5">
                    <i className="fas fa-robot text-accent-cyan mt-[1px]"></i> 김전략 (CIO)
                </div>
            </div>

            {/* Session Item */}
            <div
                className="p-3 hover:bg-white/5 rounded-lg cursor-pointer transition-colors group relative border-l-2 border-transparent">
                <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-medium text-white/80 group-hover:text-white truncate max-w-[160px]">신규 마케팅
                        카피라이팅 수정 건</span>
                    <span className="text-[10px] text-white/40 font-mono">어제</span>
                </div>
                <div className="text-xs text-white/50 truncate w-full pr-6 group-hover:text-white/70">말씀하신 대로 타겟을 20대 후반으로
                    조정하여 다시 작성해보겠습니다.</div>

                <div
                    className="absolute right-2 bottom-2 bg-[#0a0a0f] px-1.5 py-0.5 rounded border border-white/10 text-[9px] text-white/50 flex align-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <i className="fas fa-pen-nib text-accent-purple mt-[1px]"></i> 정작가
                </div>
            </div>

            {/* Session Item */}
            <div
                className="p-3 hover:bg-white/5 rounded-lg cursor-pointer transition-colors group relative border-l-2 border-transparent">
                <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-medium text-white/80 group-hover:text-white truncate max-w-[160px]">계약서
                        독소조항 검토</span>
                    <span className="text-[10px] text-white/40 font-mono">10/24</span>
                </div>
                <div className="text-xs text-white/50 truncate w-full pr-6 group-hover:text-white/70">제 7조항에 손해배상 청구 권리를
                    제한하는 내용이 있습니다.</div>

                <div
                    className="absolute right-2 bottom-2 bg-[#0a0a0f] px-1.5 py-0.5 rounded border border-white/10 text-[9px] text-white/50 flex align-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <i className="fas fa-balance-scale text-white/70 mt-[1px]"></i> 최법무
                </div>
            </div>

            <div
                className="p-3 hover:bg-white/5 rounded-lg cursor-pointer transition-colors group relative border-l-2 border-transparent opacity-60">
                <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-medium text-white/80 truncate max-w-[160px]">Q3 분기 실적 데이터 정제</span>
                    <span className="text-[10px] text-white/40 font-mono">10/21</span>
                </div>
                <div className="text-xs text-white/50 truncate w-full">데이터 정제를 완료하여 파일로 저장했습니다.</div>
            </div>
        </div>
    </aside>

    {/* Main Chat Content */}
    <main className="flex-1 flex flex-col relative h-full bg-[#0a0a0f] z-10 w-full">
        {/* Chat Header */}
        <header
            className="p-6 border-b border-white/5 flex justify-between items-center shrink-0 bg-white/5 backdrop-blur-xl">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <div
                        className="w-10 h-10 rounded-full bg-base-200 border border-white/10 flex items-center justify-center">
                        <i className="fas fa-robot text-accent-cyan text-sm"></i>
                    </div>
                    <div
                        className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-400 border-2 border-[#151525] rounded-full">
                    </div>
                </div>
                <div>
                    <h2 className="text-lg font-medium text-white">투자 포트폴리오 리밸런싱 방향 논의</h2>
                    <div className="text-xs text-white/50 flex items-center gap-2 mt-0.5">
                        <span className="text-accent-cyan">김전략 (CIO)</span>
                        <span className="w-1 h-1 rounded-full bg-white/20"></span>
                        <span>Manager</span>
                        <span className="w-1 h-1 rounded-full bg-white/20"></span>
                        <span>Claude 3.5 Sonnet</span>
                    </div>
                </div>
            </div>
            <div className="flex gap-2">
                <button className="btn-glass text-xs flex items-center gap-2"><i className="fas fa-scroll"></i> 소울 확인</button>
                <button className="btn-icon"><i className="fas fa-ellipsis-v"></i></button>
            </div>
        </header>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth">

            <div className="text-center my-6">
                <span
                    className="text-xs font-mono text-white/30 bg-white/5 px-3 py-1 rounded-full border border-white/5">오늘</span>
            </div>

            {/* User Message */}
            <div className="flex justify-end pr-2">
                <div className="max-w-[70%]">
                    <div className="flex items-center justify-end gap-2 mb-1">
                        <span className="text-[10px] text-white/40 font-mono">13:50</span>
                        <span className="text-xs text-white/80 font-medium">CEO</span>
                    </div>
                    <div
                        className="chat-bubble-user p-4 rounded-xl shadow-sm text-sm text-white/90 leading-relaxed font-light">
                        현재 글로벌 거시경제 지표를 고려했을 때, 우리 회사의 금융 투자 포트폴리오 비중을 어떻게 조정하는 게 좋을까? 기술주 비중이 너무 높은 것 같은데.
                    </div>
                </div>
            </div>

            {/* Agent Tool Use / Thinking */}
            <div className="flex justify-start pl-2">
                <div className="max-w-[70%]">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-accent-cyan font-medium">김전략 (CIO)</span>
                        <span className="text-[10px] text-white/40 font-mono">13:51</span>
                    </div>

                    <div className="bg-black/40 border border-white/5 rounded-lg p-3 text-sm text-white/60 mb-2">
                        <div className="flex items-center justify-between cursor-pointer group">
                            <span className="flex items-center gap-2 text-xs">
                                <i className="fas fa-cogs text-accent-purple opacity-70"></i>
                                <span className="font-mono text-accent-purple/80">도구 호출: KIS 증권 시세 조회 및 거시경제 지표 분석기</span>
                            </span>
                            <i
                                className="fas fa-chevron-down text-[10px] opacity-30 group-hover:opacity-100 transition-opacity"></i>
                        </div>
                    </div>

                    <div className="bg-black/40 border border-white/5 rounded-lg p-3 text-sm text-white/60 mb-2">
                        <div className="flex items-center justify-between cursor-pointer group">
                            <span className="flex items-center gap-2 text-xs">
                                <i className="fas fa-sitemap text-white/50"></i>
                                <span className="text-white/70">하위 에이전트 위임: 리스크관리 전문가에게 위험도 평가 요청</span>
                            </span>
                            <span
                                className="px-1.5 py-0.5 rounded text-[10px] bg-green-400/10 text-green-400 border border-green-400/20">완료</span>
                        </div>
                    </div>

                    {/* Agent Message Response */}
                    <div
                        className="chat-bubble-agent p-5 rounded-xl text-sm text-white/90 leading-relaxed font-light mt-4 shadow-lg">
                        <p className="mb-4">네, 대표님. 최근 금리 동향과 인플레이션 지표를 분석하고 리스크관리 전문가의 의견을 종합해본 결과, 현재의 <strong>기술주 편향
                                포트폴리오는 단기 변동성 리스크가 높습니다.</strong></p>

                        <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-4">
                            <h4 className="font-medium text-white mb-2 text-xs">분석 요약</h4>
                            <ul className="list-disc list-inside space-y-1 text-white/70">
                                <li>나스닥 주요 기술주 밸류에이션 부담 가중</li>
                                <li>연준의 금리 인하 기대감 지연</li>
                                <li>방어적 섹터(헬스케어, 필수소비재) 상대적 매력도 상승</li>
                            </ul>
                        </div>

                        <p>결론적으로, 현재 보유 중이신 기술주 비중을 15% 정도 줄이고, 헬스케어 비중을 확대하는 리밸런싱을 권장합니다. 구체적인 종목 변경안을 시뮬레이션 해볼까요?</p>
                    </div>
                    {/* Footer of agent msg */}
                    <div className="mt-2 flex gap-2">
                        <button
                            className="text-xs text-white/40 hover:text-white bg-white/5 px-2 py-1 rounded border border-white/5 transition-colors"><i
                                className="fas fa-copy"></i></button>
                    </div>
                </div>
            </div>

            {/* User Message */}
            <div className="flex justify-end pr-2">
                <div className="max-w-[70%]">
                    <div className="flex items-center justify-end gap-2 mb-1">
                        <span className="text-[10px] text-white/40 font-mono">14:02</span>
                        <span className="text-xs text-white/80 font-medium">CEO</span>
                    </div>
                    <div
                        className="chat-bubble-user p-4 rounded-xl shadow-sm text-sm text-white/90 leading-relaxed font-light">
                        좋아. 구체적으로 어떤 종목을 팔고 어떤 종목을 사야 할지 리포트로 정리해서 <br />
                        <code>@투자위원회</code> 폴더에 문서로 남겨줘.
                    </div>
                </div>
            </div>

            {/* Agent typing indicator (SSE in progress) */}
            <div className="flex justify-start pl-2">
                <div className="max-w-[70%]">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-accent-cyan font-medium">김전략 (CIO)</span>
                        <span className="text-[10px] text-white/40 font-mono">Just now</span>
                    </div>
                    <div className="chat-bubble-agent py-3 px-5 rounded-xl shadow-sm">
                        <div className="flex gap-1 items-center h-4">
                            <div className="w-1.5 h-1.5 bg-accent-cyan rounded-full typing-dot"></div>
                            <div className="w-1.5 h-1.5 bg-accent-cyan rounded-full typing-dot"></div>
                            <div className="w-1.5 h-1.5 bg-accent-cyan rounded-full typing-dot"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-10"></div> {/* spacing */}
        </div>

        {/* Sticky Chat Input Area */}
        <div
            className="absolute bottom-0 left-0 right-0 p-6 pt-10 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/90 to-transparent z-20">
            <div className="relative max-w-4xl mx-auto">
                <div className="absolute inset-0 bg-gradient-accent rounded-xl blur-md opacity-20"></div>
                <div
                    className="relative bg-[#151525]/80 backdrop-blur-3xl border border-white/10 rounded-xl p-1 flex items-end shadow-2xl">
                    <button className="btn-icon mb-1 ml-1 !text-white/40 hover:!text-white"><i
                            className="fas fa-paperclip"></i></button>
                    {/* API: POST /api/workspace/chat/sessions/:sessionId/messages */}
                    <textarea
                        className="flex-1 bg-transparent border-none text-white p-3 resize-none focus:outline-none min-h-[50px] max-h-[150px] font-light placeholder-white/30 text-sm"
                        placeholder="김전략 에이전트와 대화하기..." rows="1"></textarea>
                    {/* Action buttons */}
                    <div className="flex gap-1 mb-1 mr-1">
                        <button className="btn-icon !hidden md:!block !text-white/40 hover:!text-white"><i
                                className="fas fa-microphone"></i></button>
                        <button
                            className="bg-white/10 text-white/50 w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white/20 hover:text-white transition-all">
                            <i className="fas fa-arrow-up"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div className="text-[10px] text-white/30 text-center mt-3 font-mono">
                AI can make mistakes. Consider verifying important information.
            </div>
        </div>

    </main>
    </>
  );
}

export default Chat;
