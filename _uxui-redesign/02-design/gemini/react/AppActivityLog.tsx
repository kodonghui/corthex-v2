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

        .list-item {
            transition: all 0.2s ease;
            border: 1px solid transparent;
            border-bottom-color: #f5f3ec;
        }

        .list-item:hover {
            background-color: white;
            border-color: #e8e4d9;
            border-radius: 1rem;
            z-index: 10;
            position: relative;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
        }

        .list-item.active {
            background-color: white;
            border-color: #e07a5f;
            border-radius: 1rem;
            z-index: 10;
            position: relative;
            box-shadow: 0 4px 12px rgba(224, 122, 95, 0.05);
        }

        /* Code block syntax mock */
        .token.property {
            color: #e57373;
        }

        .token.string {
            color: #81b29a;
        }

        .token.boolean,
        .token.number {
            color: #f4a261;
        }

        .token.punctuation {
            color: #6b6b6b;
        }

        .token.keyword {
            color: #9b5de5;
            font-weight: bold;
        }
`;

function AppActivityLog() {
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
                title="작전 일지">
                <i className="ph ph-list-dashes text-2xl"></i>
            </a>
            <a href="#"
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-text-muted hover:bg-base-100 transition-colors"
                title="작업 스케줄러">
                <i className="ph ph-activity text-2xl"></i>
            </a>
            {/* Active menu */}
            <a href="#"
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-accent-terracotta bg-base-100 transition-colors relative"
                title="통신 로그 (LLM 기록)">
                <i className="ph ph-codesandbox-logo text-2xl"></i>
            </a>
        </div>
        <div>
            <img src="https://i.pravatar.cc/100?img=11" alt="Profile"
                className="w-10 h-10 rounded-full border border-base-300" />
        </div>
    </aside>

    {/* Communication List (API: GET /api/workspace/communications) */}
    <aside className="w-[380px] border-r border-base-200 bg-base-100/30 flex flex-col h-full z-10 shrink-0">
        <div className="p-6 pb-4 shrink-0 border-b border-base-200/50 bg-[#fcfbf9]/80 backdrop-blur-md">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-text-main">통신 로그</h2>
                    <p className="text-[11px] text-text-muted mt-0.5">LLM 프롬프트 및 응답 Raw Payload 현황</p>
                </div>
            </div>

            <div className="relative w-full mb-4">
                <i className="ph ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"></i>
                <input type="text" placeholder="요청 ID, 에이전트명 검색..."
                    className="w-full bg-white border border-base-200 outline-none text-xs font-medium pl-9 pr-4 py-2.5 rounded-xl text-text-main placeholder:text-base-300 shadow-sm focus:border-accent-terracotta/50 transition-colors" />
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                <button
                    className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-text-main text-white shadow-sm whitespace-nowrap">전체
                    로깅</button>
                <button
                    className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-white border border-base-200 text-text-muted hover:text-text-main hover:bg-base-50 transition-colors whitespace-nowrap flex items-center gap-1"><i
                        className="ph ph-robot"></i> LLM Call</button>
                <button
                    className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-white border border-base-200 text-text-muted hover:text-text-main hover:bg-base-50 transition-colors whitespace-nowrap flex items-center gap-1"><i
                        className="ph ph-arrows-left-right"></i> 에이전트 간</button>
                <button
                    className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-white border border-base-200 text-text-muted hover:text-text-main hover:bg-base-50 transition-colors whitespace-nowrap"><i
                        className="ph ph-warning-circle text-accent-coral"></i> 오류</button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar px-2 py-2">

            {/* List Item (LLM API Call) - Active */}
            <div className="list-item active p-4 cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2">
                        <span
                            className="px-2 py-0.5 bg-[#10a37f]/10 text-[#10a37f] text-[9px] font-bold rounded uppercase tracking-wider">OpenAI</span>
                        <span
                            className="px-2 py-0.5 bg-base-50 text-text-main text-[9px] font-bold rounded uppercase border border-base-200">gpt-4o</span>
                    </div>
                    <span className="text-[10px] text-text-muted font-mono bg-base-100 px-1.5 py-0.5 rounded">130ms</span>
                </div>
                <h4 className="font-bold text-text-main text-sm line-clamp-1 mb-1">LinkedIn 포스팅 생성 프롬프트</h4>
                <div className="flex items-center gap-1.5 mb-3">
                    <div
                        className="w-4 h-4 rounded-full bg-[#fdece6] border border-white flex items-center justify-center text-accent-terracotta text-[8px] font-bold">
                        M</div>
                    <span className="text-[11px] text-text-muted">마케팅부장 <i className="ph ph-arrow-right text-[10px] mx-0.5"></i>
                        LLM Endpoint</span>
                </div>
                {/* Token Usage Mini */}
                <div className="flex gap-4 text-[10px] text-text-muted font-mono border-t border-base-100 pt-2">
                    <span title="Prompt Tokens"><i className="ph ph-upload-simple"></i> 1,420</span>
                    <span title="Completion Tokens"><i className="ph ph-download-simple"></i> 345</span>
                    <span className="text-accent-terracotta font-bold ml-auto opacity-80"
                        title="Estimated Cost">~$0.024</span>
                </div>
            </div>

            {/* List Item (Inter-Agent Comm) */}
            <div className="list-item p-4 cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2">
                        <span
                            className="px-2 py-0.5 bg-accent-blue/10 text-accent-blue text-[9px] font-bold rounded uppercase tracking-wider">Inter-Agent
                            RPC</span>
                    </div>
                    <span className="text-[10px] text-text-muted font-mono bg-base-100 px-1.5 py-0.5 rounded">45ms</span>
                </div>
                <h4 className="font-bold text-text-main text-sm line-clamp-1 mb-1">데이터 분석 파이프라인 트리거 요청</h4>
                <div className="flex items-center gap-1.5 mb-3">
                    <div
                        className="w-4 h-4 rounded-full bg-[#fdece6] border border-white flex items-center justify-center text-accent-terracotta text-[8px] font-bold">
                        M</div>
                    <span className="text-[11px] text-text-muted">마케팅부장 <i className="ph ph-arrow-right text-[10px] mx-0.5"></i>
                    </span>
                    <div
                        className="w-4 h-4 rounded-full bg-[#e8f3ef] border border-white flex items-center justify-center text-accent-green text-[8px] font-bold">
                        <i className="ph ph-chart-line-up"></i></div>
                    <span className="text-[11px] text-text-muted">전략실장</span>
                </div>
                <div className="flex gap-4 text-[10px] text-text-muted font-mono border-t border-base-100 pt-2">
                    <span>REQ_ID: msg_94f28a</span>
                    <span className="text-accent-green font-bold ml-auto">HTTP 200</span>
                </div>
            </div>

            {/* List Item (LLM API Call Error) */}
            <div className="list-item p-4 cursor-pointer bg-[#fdece6]/20">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2">
                        <span
                            className="px-2 py-0.5 bg-[#4A90E2]/10 text-[#4A90E2] text-[9px] font-bold rounded uppercase tracking-wider">Anthropic</span>
                        <span
                            className="px-2 py-0.5 bg-base-50 text-text-main text-[9px] font-bold rounded uppercase border border-base-200">claude-3.5-sonnet</span>
                    </div>
                    <span className="text-[10px] text-text-muted font-mono bg-base-100 px-1.5 py-0.5 rounded">4,520ms</span>
                </div>
                <h4 className="font-bold text-text-main text-sm line-clamp-1 mb-1">복잡한 문서 요약 RDD</h4>
                <div className="flex items-center gap-1.5 mb-3">
                    <div
                        className="w-4 h-4 rounded-full bg-base-200 border border-white flex items-center justify-center text-text-main text-[8px] font-bold">
                        <i className="ph ph-robot"></i></div>
                    <span className="text-[11px] text-text-muted">문서요약봇 <i className="ph ph-arrow-right text-[10px] mx-0.5"></i>
                        LLM Endpoint</span>
                </div>
                <div className="flex gap-4 text-[10px] text-text-muted font-mono border-t border-[#e07a5f]/20 pt-2">
                    <span>REQ_ID: cl_429xx</span>
                    <span className="text-accent-coral font-bold ml-auto"><i className="ph ph-warning-octagon"></i> HTTP 429 Too
                        Many Requests</span>
                </div>
            </div>

        </div>
    </aside>

    {/* Detailed Payload Viewer (API: GET /api/workspace/communications/:id) */}
    <main className="flex-1 flex flex-col h-full bg-[#fcfbf9]/50 relative">

        {/* Action Toolbar */}
        <header
            className="px-8 py-5 bg-white/60 backdrop-blur-md border-b border-base-200 z-10 shrink-0 flex justify-between items-center">
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <span
                        className="px-2 py-1 bg-text-main text-white text-[10px] font-bold rounded uppercase tracking-wider font-mono">POST</span>
                    <span
                        className="text-xs font-mono text-text-main font-medium">https://api.openai.com/v1/chat/completions</span>
                </div>
                <h1 className="text-lg font-bold tracking-tight text-text-main">REQ_ID: req_8f29ab21cd</h1>
            </div>

            <div className="flex gap-2">
                <button
                    className="w-9 h-9 rounded-lg border border-base-200 bg-white flex items-center justify-center text-text-main hover:bg-base-50 transition-colors shadow-sm"
                    title="복사"><i className="ph ph-copy text-lg"></i></button>
                <button
                    className="w-9 h-9 rounded-lg border border-base-200 bg-white flex items-center justify-center text-text-main hover:bg-base-50 transition-colors shadow-sm"
                    title="Raw JSON 토글"><i className="ph ph-brackets-curly text-lg"></i></button>
                <button
                    className="w-9 h-9 rounded-lg border border-base-200 bg-white flex items-center justify-center text-text-main hover:bg-base-50 transition-colors shadow-sm"
                    title="Replay (재수행)"><i className="ph ph-play text-lg"></i></button>
            </div>
        </header>

        {/* Viewer Area */}
        <div className="flex-1 flex flex-col pt-0 pb-0 overflow-hidden">

            <div className="flex-1 grid grid-rows-2 h-full">

                {/* Prompt (RequestPayload) */}
                <div className="border-b border-base-200 flex flex-col bg-[#fcfbf9]/30">
                    <div
                        className="flex justify-between items-center px-6 py-2.5 bg-base-50 border-b border-base-100 shrink-0">
                        <span
                            className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5"><i
                                className="ph ph-upload-simple"></i> Request Payload (Prompt)</span>
                        <div className="flex gap-4 text-[10px] font-mono text-text-muted">
                            <span className="bg-white px-2 py-0.5 rounded border border-base-200">1.4K Tokens</span>
                            <span className="bg-white px-2 py-0.5 rounded border border-base-200">Content-Type:
                                application/json</span>
                        </div>
                    </div>

                    {/* Code Block macOS style */}
                    <div
                        className="flex-1 p-6 overflow-y-auto bg-[#282c34] text-[#abb2bf] font-mono text-xs leading-relaxed selection:bg-[#3e4451] hide-scrollbar relative">
                        <pre><code><span className="token punctuation">{</span>
  <span className="token property">"model"</span><span className="token punctuation">:</span> <span className="token string">"gpt-4o"</span><span className="token punctuation">,</span>
  <span className="token property">"temperature"</span><span className="token punctuation">:</span> <span className="token number">0.7</span><span className="token punctuation">,</span>
  <span className="token property">"messages"</span><span className="token punctuation">:</span> <span className="token punctuation">[</span>
    <span className="token punctuation">{</span>
      <span className="token property">"role"</span><span className="token punctuation">:</span> <span className="token string">"system"</span><span className="token punctuation">,</span>
      <span className="token property">"content"</span><span className="token punctuation">:</span> <span className="token string">"당신은 CORTHEX 시스템의 고도로 전문적인 마케팅부장 에이전트('M')입니다. 주어지는 맥락 데이터를 바탕으로 가장 매력적이고 엔터프라이즈 B2B 시장에 적합한 LinkedIn 포스트를 작성해야 합니다. 반드시 지정된 페르소나의 톤앤매너를 유지하세요."</span>
    <span className="token punctuation">}</span><span className="token punctuation">,</span>
    <span className="token punctuation">{</span>
      <span className="token property">"role"</span><span className="token punctuation">:</span> <span className="token string">"user"</span><span className="token punctuation">,</span>
      <span className="token property">"content"</span><span className="token punctuation">:</span> <span className="token string">"새로운 V2.1 릴리즈 노트(에이전트 메모리 공유 모듈 추가)를 기반으로 작성해주세요. 타겟 청중은 IT 인프라 결정권자 및 CTO입니다. 다음의 [Context Data]를 RAG 스토리지에서 추출하여 참고하십시오. \n\n[Context Data]\n- 기능1: Cross-department memory sync (응답속도 42% 향상)\n- 기능2: Enterprise grade RBAC for LLM calls\n..."</span>
    <span className="token punctuation">}</span>
  <span className="token punctuation">]</span>
<span className="token punctuation">}</span></code></pre>
                    </div>
                </div>

                {/* Response Payload */}
                <div className="flex flex-col">
                    <div
                        className="flex justify-between items-center px-6 py-2.5 bg-base-50 border-b border-base-100 shrink-0">
                        <span
                            className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5"><i
                                className="ph ph-download-simple"></i> Response Payload (Completion)</span>
                        <div className="flex gap-4 text-[10px] font-mono text-text-muted">
                            <span
                                className="bg-base-200/50 text-accent-green font-bold px-2 py-0.5 rounded border border-accent-green/20">HTTP
                                200 OK</span>
                            <span className="bg-white px-2 py-0.5 rounded border border-base-200">345 Tokens</span>
                            <span className="bg-white px-2 py-0.5 rounded border border-base-200">130ms</span>
                        </div>
                    </div>

                    {/* Code Block macOS style */}
                    <div
                        className="flex-1 p-6 overflow-y-auto bg-[#282c34] text-[#abb2bf] font-mono text-xs leading-relaxed selection:bg-[#3e4451] hide-scrollbar relative">
                        <pre><code><span className="token punctuation">{</span>
  <span className="token property">"id"</span><span className="token punctuation">:</span> <span className="token string">"chatcmpl-9Axyz..."</span><span className="token punctuation">,</span>
  <span className="token property">"object"</span><span className="token punctuation">:</span> <span className="token string">"chat.completion"</span><span className="token punctuation">,</span>
  <span className="token property">"created"</span><span className="token punctuation">:</span> <span className="token number">1709230514</span><span className="token punctuation">,</span>
  <span className="token property">"model"</span><span className="token punctuation">:</span> <span className="token string">"gpt-4o-2024-05-13"</span><span className="token punctuation">,</span>
  <span className="token property">"choices"</span><span className="token punctuation">:</span> <span className="token punctuation">[</span>
    <span className="token punctuation">{</span>
      <span className="token property">"index"</span><span className="token punctuation">:</span> <span className="token number">0</span><span className="token punctuation">,</span>
      <span className="token property">"message"</span><span className="token punctuation">:</span> <span className="token punctuation">{</span>
        <span className="token property">"role"</span><span className="token punctuation">:</span> <span className="token string">"assistant"</span><span className="token punctuation">,</span>
        <span className="token property">"content"</span><span className="token punctuation">:</span> <span className="token string">"💡 사일로화된 AI 에이전트, 엔터프라이즈 환경에서 어떻게 통합할 것인가?\n\n생성형 AI 도입의 다음 과제는 부서별 에이전트 간의 '맥락 단절'을 해결하는 것입니다. CORTHEX V2.1의 핵심 업데이트인 [Cross-Department Memory Sync] 모듈은 전사적 맥락(Context)을 통합하며, 실측 데이터 결과 응답 레이턴시를 42% 개선했습니다.\n\n특히, 보안이 최우선인 IT 결정권자를 위해 설계된 [Enterprise Grade RBAC] 엔진은 LLM 호출 단계에서부터 데이터 접근을 엄격히 통제합니다.\n\n이제, 완벽히 통제 가능하면서도 매끄럽게 소통하는 AI 조직을 구축하십시오.\n\n#AI #EnterpriseArchitecture #SaaS #CORTHEX #TechLeadership"</span>
      <span className="token punctuation">}</span><span className="token punctuation">,</span>
      <span className="token property">"finish_reason"</span><span className="token punctuation">:</span> <span className="token string">"stop"</span>
    <span className="token punctuation">}</span>
  <span className="token punctuation">]</span><span className="token punctuation">,</span>
  <span className="token property">"usage"</span><span className="token punctuation">:</span> <span className="token punctuation">{</span>
    <span className="token property">"prompt_tokens"</span><span className="token punctuation">:</span> <span className="token number">1420</span><span className="token punctuation">,</span>
    <span className="token property">"completion_tokens"</span><span className="token punctuation">:</span> <span className="token number">345</span><span className="token punctuation">,</span>
    <span className="token property">"total_tokens"</span><span className="token punctuation">:</span> <span className="token number">1765</span>
  <span className="token punctuation">}</span>
<span className="token punctuation">}</span></code></pre>
                    </div>
                </div>

            </div>

        </div>

    </main>
    </>
  );
}

export default AppActivityLog;
