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
        }

        .list-item:hover {
            background-color: white;
            border-color: #e8e4d9;
        }

        .list-item.active {
            background-color: white;
            border-color: #e07a5f;
            box-shadow: 0 4px 12px rgba(224, 122, 95, 0.05);
        }

        /* Document styling */
        .doc-content h2 {
            font-size: 1.5rem;
            font-weight: 700;
            margin-top: 2rem;
            margin-bottom: 1rem;
            color: #2c2c2c;
        }

        .doc-content h3 {
            font-size: 1.125rem;
            font-weight: 700;
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
            color: #2c2c2c;
        }

        .doc-content p {
            margin-bottom: 1rem;
            line-height: 1.8;
            color: #4b4b4b;
        }

        .doc-content ul {
            list-style-type: disc;
            padding-left: 1.5rem;
            margin-bottom: 1.5rem;
            color: #4b4b4b;
        }

        .doc-content li {
            margin-bottom: 0.5rem;
            line-height: 1.6;
        }
`;

function AppReports() {
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
            {/* Active menu */}
            <a href="#"
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-accent-terracotta bg-base-100 transition-colors"
                title="보고서">
                <i className="ph ph-chart-pie-slice text-2xl"></i>
            </a>
            <a href="#"
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-text-muted hover:bg-base-100 transition-colors"
                title="작전 일지">
                <i className="ph ph-list-dashes text-2xl"></i>
            </a>
        </div>
        <div>
            <img src="https://i.pravatar.cc/100?img=11" alt="Profile"
                className="w-10 h-10 rounded-full border border-base-300" />
        </div>
    </aside>

    {/* Report List (API: GET /api/workspace/reports) */}
    <aside className="w-80 border-r border-base-200 bg-base-100/30 flex flex-col h-full z-10 shrink-0">
        <div className="p-6 pb-4 shrink-0">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-text-main">보고서 보관함</h2>
                <div className="flex gap-2">
                    <button
                        className="w-8 h-8 rounded-full bg-white border border-base-200 flex items-center justify-center text-text-main shadow-sm hover:bg-base-50 transition-colors">
                        <i className="ph ph-magnifying-glass"></i>
                    </button>
                    {/* API: POST /api/workspace/reports */}
                    <button
                        className="w-8 h-8 rounded-full bg-text-main flex items-center justify-center text-white shadow-sm hover:bg-opacity-90 transition-colors">
                        <i className="ph ph-plus"></i>
                    </button>
                </div>
            </div>

            {/* Folders */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                <button
                    className="px-3 py-1.5 rounded-full text-xs font-bold bg-text-main text-white shadow-sm whitespace-nowrap">전체</button>
                <button
                    className="px-3 py-1.5 rounded-full text-xs font-medium text-text-muted hover:text-text-main hover:bg-base-50 transition-colors whitespace-nowrap"><i
                        className="ph ph-folder mr-1"></i>재무</button>
                <button
                    className="px-3 py-1.5 rounded-full text-xs font-medium text-text-muted hover:text-text-main hover:bg-base-50 transition-colors whitespace-nowrap"><i
                        className="ph ph-folder mr-1"></i>마케팅</button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar px-3 pb-4 space-y-1">

            {/* Item 1 (Active) */}
            <div className="list-item active p-4 rounded-3xl cursor-pointer relative overflow-hidden group">
                <div className="flex justify-between items-start mb-2 relative z-10">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-6 h-6 rounded-lg bg-accent-terracotta/10 flex items-center justify-center text-accent-terracotta">
                            <i className="ph ph-file-text"></i></div>
                        <span className="font-bold text-[11px] text-text-muted">마케팅부</span>
                    </div>
                </div>
                <h4 className="font-bold text-text-main text-sm mb-1 line-clamp-2 relative z-10 leading-snug">Q3 소셜 미디어 캠페인
                    성과 및 인사이트 보고서</h4>
                <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] text-text-muted font-medium">오늘 오전 09:00</span>
                    <span className="flex items-center -space-x-1">
                        <div
                            className="w-4 h-4 rounded-full bg-[#fdece6] border border-white text-[8px] flex items-center justify-center text-accent-terracotta font-bold">
                            M</div>
                    </span>
                </div>
            </div>

            {/* Item 2 */}
            <div className="list-item p-4 rounded-3xl cursor-pointer relative overflow-hidden">
                <div className="flex justify-between items-start mb-2 relative z-10">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-6 h-6 rounded-lg bg-accent-amber/10 flex items-center justify-center text-accent-amber">
                            <i className="ph ph-file-pdf"></i></div>
                        <span className="font-bold text-[11px] text-text-muted">경영전략실</span>
                    </div>
                </div>
                <h4 className="font-bold text-text-main text-sm mb-1 line-clamp-2 relative z-10 leading-snug">[주간요약] 시장 동향 및
                    경쟁사 분석 브리핑 (10월 2주차)</h4>
                <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] text-text-muted font-medium">어제</span>
                    <span className="flex items-center -space-x-1">
                        <div
                            className="w-4 h-4 rounded-full bg-[#fef5ec] border border-white text-[8px] flex items-center justify-center text-accent-amber font-bold">
                            S</div>
                    </span>
                </div>
            </div>

            {/* Item 3 */}
            <div className="list-item p-4 rounded-3xl cursor-pointer relative overflow-hidden">
                <div className="flex justify-between items-start mb-2 relative z-10">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-6 h-6 rounded-lg bg-accent-green/10 flex items-center justify-center text-accent-green">
                            <i className="ph ph-file-xls"></i></div>
                        <span className="font-bold text-[11px] text-text-muted">재무팀</span>
                    </div>
                </div>
                <h4 className="font-bold text-text-main text-sm mb-1 line-clamp-2 relative z-10 leading-snug">Q3 클라우드 인프라 비용
                    효율성 진단</h4>
                <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] text-text-muted font-medium">3일 전</span>
                    <span className="flex items-center -space-x-1">
                        <div
                            className="w-4 h-4 rounded-full bg-base-100 border border-white text-[8px] flex items-center justify-center text-text-main font-bold">
                            <i className="ph ph-robot"></i></div>
                    </span>
                </div>
            </div>

        </div>
    </aside>

    {/* Main Document Viewer (API: GET /api/workspace/reports/:id) */}
    <main className="flex-1 flex flex-col h-full bg-[#fcfbf9]/50 relative">

        {/* Document Toolbar */}
        <header
            className="px-8 py-4 bg-white/60 backdrop-blur-md border-b border-base-200 z-10 shrink-0 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <button
                    className="w-8 h-8 rounded-full hover:bg-base-100 flex items-center justify-center text-text-muted transition-colors"><i
                        className="ph ph-sidebar-simple text-lg"></i></button>
                <div className="w-px h-4 bg-base-200"></div>
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs font-medium">
                    <span className="text-text-muted">보고서 보관함</span> <i className="ph ph-caret-right text-base-300"></i>
                    <span className="text-text-muted">마케팅부</span> <i className="ph ph-caret-right text-base-300"></i>
                    <span className="text-text-main">Q3 소셜 미디어 캠페인 성과 및 인사이트 보고서</span>
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    className="px-3 py-1.5 rounded-lg border border-base-200 text-text-main text-xs font-bold hover:bg-white transition-colors flex items-center gap-1.5"><i
                        className="ph ph-share-network text-sm"></i> 공유</button>
                <button
                    className="px-3 py-1.5 rounded-lg border border-base-200 text-text-main text-xs font-bold hover:bg-white transition-colors flex items-center gap-1.5"><i
                        className="ph ph-download-simple text-sm"></i> PDF 다운로드</button>
            </div>
        </header>

        {/* Document Content */}
        <div className="flex-1 overflow-y-auto px-10 py-12 hide-scrollbar flex justify-center pb-32">

            {/* Paper */}
            <div
                className="w-full max-w-[800px] bg-white rounded-3xl border border-base-200 shadow-soft-lg p-12 md:p-16 relative">

                {/* Tag / Meta */}
                <div className="flex justify-between items-end mb-12 pb-6 border-b border-base-100">
                    <div>
                        <span
                            className="px-2.5 py-1 bg-accent-terracotta/10 text-accent-terracotta text-xs font-bold rounded-lg mb-4 inline-block">종합
                            성과 분석</span>
                        <h1
                            className="text-3xl md:text-4xl font-bold tracking-tight text-text-main leading-tight font-serif">
                            Q3 소셜 미디어 캠페인 <br />성과 및 오픈 인사이트 도출</h1>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center justify-end gap-2 mb-2">
                            <span className="text-xs text-text-muted">작성자</span>
                            <div
                                className="flex items-center gap-1.5 bg-base-50 px-2 py-1 rounded-full border border-base-200">
                                <div
                                    className="w-4 h-4 rounded-full bg-[#fdece6] flex items-center justify-center text-accent-terracotta text-[8px] font-bold">
                                    M</div>
                                <span className="text-[11px] font-bold text-text-main">마케팅부장</span>
                            </div>
                        </div>
                        <p className="text-xs text-text-muted">생성일시: 2026. 10. 15. 09:00 AM</p>
                    </div>
                </div>

                {/* Markdown Extracted Content */}
                <div className="doc-content">
                    <p className="text-lg font-medium text-text-main leading-relaxed">이 보고서는 3분기(7월~9월) 동안 진행된 소셜 미디어
                        채널(LinkedIn, Twitter, 공식 블로그)의 운영 성과를 다각도로 분석하고, 향후 전환율(CVR) 극대화를 위한 AI 기반의 콘텐츠 전략을 제안합니다.</p>

                    <h2>1. 핵심 성과 요약 (Executive Summary)</h2>
                    <p>3분기 전체 소셜 채널 노출 수는 전 분기 대비 <strong>34% 증가한 124만 회</strong>를 기록했습니다. 가장 큰 성장을 견인한 플랫폼은 LinkedIn으로,
                        B2B 타겟팅 광고 및 기술 블로그 아티클 연계 전략이 주효했습니다.</p>
                    <ul>
                        <li><strong>총 노출 수 (Impressions):</strong> 1,240,500회 (+34% QoQ)</li>
                        <li><strong>참여율 (Engagement Rate):</strong> 평균 4.2% (+0.8%p QoQ)</li>
                        <li><strong>웹사이트 유입 유저수:</strong> 15,200명 (+22% QoQ)</li>
                        <li><strong>세일즈 리드 전환 (MQLs):</strong> 215건 (+18% QoQ)</li>
                    </ul>

                    <h2>2. 플랫폼별 기여도 및 트래픽 분석</h2>
                    <p>데이터 분석에 따르면 플랫폼별 유저의 의도가 명확히 구분됩니다. Twitter는 새로운 기능 업데이트(릴리즈 노트) 확산에 유리하며, LinkedIn은 심도 있는 기술 문서
                        및 Use Case 중심의 긴 글에 대한 반응률이 월등히 높습니다.</p>

                    {/* Chart Placeholder */}
                    <div
                        className="my-8 rounded-2xl bg-[#fcfbf9] border border-base-200 p-6 flex flex-col items-center justify-center h-64 relative overflow-hidden">
                        <div className="text-center z-10">
                            <i className="ph ph-chart-line-up text-4xl text-accent-terracotta opacity-50 mb-2"></i>
                            <p className="text-sm font-bold text-text-muted">플랫폼별 유입 트래픽 추이 (Q3)</p>
                        </div>
                        {/* Mock lines */}
                        <div
                            className="absolute bottom-6 left-10 right-10 h-32 flex items-end justify-between opacity-30 gap-2">
                            <div className="w-full bg-accent-terracotta rounded-t" style={{height: "40%"}}></div>
                            <div className="w-full bg-accent-terracotta rounded-t" style={{height: "60%"}}></div>
                            <div className="w-full bg-accent-terracotta rounded-t" style={{height: "50%"}}></div>
                            <div className="w-full bg-accent-terracotta rounded-t" style={{height: "80%"}}></div>
                            <div className="w-full bg-accent-terracotta rounded-t" style={{height: "90%"}}></div>
                            <div className="w-full bg-accent-terracotta rounded-t" style={{height: "70%"}}></div>
                        </div>
                        <div
                            className="absolute bottom-10 left-10 right-10 h-32 flex items-end justify-between opacity-20 gap-2">
                            <div className="w-full bg-accent-blue rounded-t" style={{height: "30%"}}></div>
                            <div className="w-full bg-accent-blue rounded-t" style={{height: "40%"}}></div>
                            <div className="w-full bg-accent-blue rounded-t" style={{height: "35%"}}></div>
                            <div className="w-full bg-accent-blue rounded-t" style={{height: "45%"}}></div>
                            <div className="w-full bg-accent-blue rounded-t" style={{height: "55%"}}></div>
                            <div className="w-full bg-accent-blue rounded-t" style={{height: "50%"}}></div>
                        </div>
                    </div>

                    <h2>3. 향후 전략 및 AI 에이전트 태스크 지시안</h2>
                    <p>도출된 인사이트를 바탕으로, 마케팅 부서 산하의 에이전트들에게 다음과 같은 업무 파이프라인 변화를 권장합니다. (본 문서는 승인 시 자동으로 워크플로우를 생성합니다.)</p>
                    <ul>
                        <li><strong>초급 작성자 (Worker) 에이전트:</strong> 단순 기능 업데이트 트윗의 자동 발행 비율을 높여 (주 2회 -> 주 4회) Twitter 채널
                            노출을 극대화.</li>
                        <li><strong>콘텐츠 전문가 (Specialist) 에이전트:</strong> 공식 블로그 발행 주기를 월 1회로 줄이되, 2,000단어 이상의
                            백서(Whitepaper) 형태의 딥 다이브 문서 위주로 퀄리티 허들을 높일 것.</li>
                        <li><strong>캠페인 매니저 활용:</strong> 확보된 MQL 리스트를 대상으로, 'A/B 테스트 이메일 시퀀스' 자동화 모듈을 활성화할 것.</li>
                    </ul>
                </div>

                {/* Action Footer */}
                <div className="mt-12 pt-8 border-t border-base-100 flex justify-between items-center">
                    <p className="text-xs text-text-muted">보고서 승인 시 본문에 명시된 워크플로우가 자동 실행될 수 있습니다.</p>
                    <button
                        className="bg-text-main text-white px-6 py-3 rounded-full font-bold shadow-soft hover:bg-opacity-90 transition-all flex items-center gap-2">
                        <i className="ph ph-check-circle text-xl"></i> 인사이트 승인 및 공유
                    </button>
                </div>
            </div>

        </div>

    </main>
    </>
  );
}

export default AppReports;
