"use client";
import React from "react";

const styles = `
body {
            background-color: #0a0a0f;
            color: #f3f4f6;
            background-image: radial-gradient(circle at 15% 50%, rgba(168, 85, 247, 0.05), transparent 25%),
                radial-gradient(circle at 85% 30%, rgba(34, 211, 238, 0.05), transparent 25%);
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

        .btn-primary {
            background: linear-gradient(135deg, #a855f7 0%, #22d3ee 100%);
            color: white;
            border: none;
            border-radius: 0.5rem;
            padding: 0.5rem 1rem;
            font-weight: 500;
            transition: all 0.3s ease;
            cursor: pointer;
            text-sm;
            box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .btn-glass {
            background-color: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: white;
            border-radius: 0.5rem;
            padding: 0.4rem 0.8rem;
            transition: all 0.3s ease;
            backdrop-filter: blur(8px);
            cursor: pointer;
            font-weight: 400;
            text-sm;
        }

        .btn-glass:hover {
            background-color: rgba(255, 255, 255, 0.1);
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

        /* Rich Text Document Styles */
        .document-view {
            background: #fff;
            color: #111827;
        }

        .dark .document-view {
            background: #11111a;
            color: #e5e7eb;
        }
`;

function Reports() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Sidebar Navigation */}
    <aside
        className="w-64 flex flex-col border-r border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl h-full shrink-0 relative z-20 hidden md:flex">
        <div className="p-6">
            <h1 className="text-xl font-bold tracking-tight text-white mb-2">CORTHEX <span
                    className="text-xs font-normal text-white/40 ml-1">v2</span></h1>
        </div>

        <div className="p-4 flex-1 overflow-y-auto w-full">
            <div className="mb-4">
                <div className="text-xs text-white/30 font-semibold mb-2 px-2 uppercase tracking-wider">Workspace</div>
                <nav className="space-y-1">
                    <a href="/app/home"
                        className="flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <i className="fas fa-home w-4"></i> <span>홈</span>
                    </a>
                </nav>
            </div>

            <div className="mb-4">
                <div className="text-xs text-white/30 font-semibold mb-2 px-2 uppercase tracking-wider">Audit & History
                </div>
                <nav className="space-y-1">
                    <a href="/app/ops-log"
                        className="flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <i className="fas fa-list-alt w-4"></i> <span>작업 로그 (Ops Log)</span>
                    </a>
                    <a href="/app/reports"
                        className="flex items-center gap-3 px-3 py-2 text-white bg-white/10 rounded-lg border border-white/10 transition-colors">
                        <i className="fas fa-chart-bar w-4 text-accent-cyan"></i> <span>리포트 관리</span>
                    </a>
                </nav>
            </div>
        </div>
    </aside>

    {/* Main Split View */}
    <main className="flex-1 flex overflow-hidden">

        {/* Left Panel: Folder & Document List */}
        <section className="w-80 border-r border-white/5 bg-[#0a0a0f]/50 backdrop-blur-md flex flex-col shrink-0 z-10">
            <header className="p-4 border-b border-white/5">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">생성된 리포트</h2>
                    <button className="btn-icon"><i className="fas fa-folder-plus"></i></button>
                </div>
                <div className="relative">
                    <i
                        className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-white/30 text-xs"></i>
                    <input type="text"
                        className="w-full bg-black/40 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-sm text-white focus:outline-none focus:border-accent-cyan/50 transition-colors placeholder-white/30"
                        placeholder="문서 검색..." />
                </div>
            </header>

            <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-4">

                    {/* Folder Group */}
                    <div>
                        <div
                            className="flex items-center gap-2 text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 cursor-pointer hover:text-white/80 transition-colors">
                            <i className="fas fa-folder-open text-accent-purple"></i> 정기 리포트 (Weekly/Monthly)
                        </div>
                        <div className="space-y-1 pl-2 border-l border-white/10 ml-1.5">

                            {/* Selected Doc */}
                            <div
                                className="flex items-start gap-3 p-2 rounded-lg bg-white/10 border border-white/10 cursor-pointer relative">
                                <i className="fas fa-file-alt text-accent-cyan mt-1 px-1"></i>
                                <div>
                                    <div className="text-sm font-medium text-white line-clamp-2 leading-snug">Q3 마케팅 캠페인 성과
                                        및 채널별 ROI 분석 통합 보고서</div>
                                    <div className="text-[10px] text-white/40 mt-1 flex items-center gap-2">
                                        <i className="fas fa-robot"></i> 데이터분석가 · 어제
                                    </div>
                                </div>
                            </div>

                            {/* Other Doc */}
                            <div
                                className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 border border-transparent cursor-pointer transition-colors group">
                                <i
                                    className="fas fa-file-alt text-white/30 group-hover:text-white/60 mt-1 px-1 transition-colors"></i>
                                <div>
                                    <div
                                        className="text-sm font-medium text-white/70 group-hover:text-white line-clamp-2 leading-snug transition-colors">
                                        2026년 9월 IT 인프라 비용/사용량 최적화 제안서</div>
                                    <div className="text-[10px] text-white/40 mt-1 flex items-center gap-2">
                                        <i className="fas fa-robot text-green-400/50"></i> 시스템엔지니어 · 10월 5일
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Folder Group */}
                    <div className="pt-2">
                        <div
                            className="flex items-center gap-2 text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 cursor-pointer hover:text-white/80 transition-colors">
                            <i className="fas fa-folder text-blue-400"></i> 임시/분석 요청 (Ad-hoc)
                        </div>
                        <div className="space-y-1 pl-2 border-l border-white/10 ml-1.5">

                            <div
                                className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 border border-transparent cursor-pointer transition-colors group">
                                <i
                                    className="fas fa-file-code text-white/30 group-hover:text-white/60 mt-1 px-1 transition-colors"></i>
                                <div>
                                    <div
                                        className="text-sm font-medium text-white/70 group-hover:text-white line-clamp-2 leading-snug transition-colors">
                                        경쟁사 A 신제품 발표에 따른 대응 전략 초안</div>
                                    <div className="text-[10px] text-white/40 mt-1 flex items-center gap-2">
                                        <i className="fas fa-robot text-accent-purple/50"></i> 비서실장 · 3일 전
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </section>

        {/* Right Panel: Document Viewer */}
        <section
            className="flex-1 flex flex-col relative bg-[#11111a] document-view shadow-[inset_10px_0_20px_rgba(0,0,0,0.5)]">

            {/* Document Toolbar */}
            <header
                className="h-14 border-b border-white/5 flex justify-between items-center px-6 shrink-0 z-20 bg-[#11111a]/95 backdrop-blur">
                <div className="flex items-center gap-3">
                    <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded border border-blue-500/30">최종본
                        (Final)</span>
                    <span className="text-xs text-white/40 flex items-center gap-1"><i className="fas fa-sync-alt"></i>
                        저장됨</span>
                </div>

                <div className="flex gap-2">
                    <button className="btn-glass !py-1 !px-3 font-medium text-xs"><i
                            className="fas fa-share-alt mr-2"></i>공유</button>
                    <button className="btn-glass !py-1 !px-3 font-medium text-xs"><i className="fas fa-file-export mr-2"></i>PDF
                        다운로드</button>
                    <button className="btn-primary !py-1 !px-4 text-xs">편집 모드</button>
                </div>
            </header>

            {/* Document Content Container */}
            <div className="flex-1 overflow-y-auto w-full p-8 md:p-12 pb-24 flex justify-center">
                {/* A4 like paper */}
                <div className="w-full max-w-[850px] space-y-8">

                    {/* Document Header */}
                    <div className="border-b border-white/10 pb-8 mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                            Q3 마케팅 캠페인 성과 및 <br />채널별 ROI 분석 통합 보고서
                        </h1>
                        <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2 text-white/60">
                                <span className="text-white/40">작성 에이전트:</span>
                                <div
                                    className="bg-white/10 px-2 py-0.5 rounded flex items-center gap-1.5 border border-white/5">
                                    <i className="fas fa-chart-pie text-accent-cyan text-[10px]"></i> <span
                                        className="text-white">데이터분석가 (@data_analyst)</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-white/60">
                                <span className="text-white/40">감수:</span>
                                <div
                                    className="bg-white/10 px-2 py-0.5 rounded flex items-center gap-1.5 border border-white/5">
                                    <i className="fas fa-user-tie text-accent-purple text-[10px]"></i> <span
                                        className="text-white">비서실장 (@chief)</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-white/60 ml-auto">
                                <i className="far fa-calendar-alt text-white/40"></i> 2026-10-26 18:30 KST
                            </div>
                        </div>
                    </div>

                    {/* AI Summary Callout */}
                    <div className="bg-accent-cyan/5 border border-accent-cyan/20 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-accent-cyan"></div>
                        <h3 className="text-lg font-bold text-accent-cyan mb-3 flex items-center gap-2"><i
                                className="fas fa-magic"></i> AI 요약 (Executive Summary)</h3>
                        <p className="text-white/80 leading-relaxed font-light text-[15px]">
                            2026년 3분기 총 마케팅 비용은 $450k로 예산 대비 5% 절감되었으나, 신규 고객 획득(CAC) 효율은 12% 향상되었습니다.
                            특히 유튜브를 활용한 동영상 광고(Video Campaign A)의 전환율이 4.2%를 기록하며 전체 ROI 상승을 견인했습니다.
                            반면, 기존 검색 광고(SEM) 키워드 단가 상승으로 인해 해당 채널의 예산 15%를 리타겟팅(Retargeting) 매체로 전환하는 것을 권장합니다.
                        </p>
                    </div>

                    {/* Doc Body (Markdown-like content styling) */}
                    <div
                        className="prose prose-invert prose-lg max-w-none text-white/70 font-light leading-relaxed prose-headings:font-bold prose-headings:text-white prose-a:text-accent-cyan hover:prose-a:text-cyan-300">

                        <h2>1. 목표 및 주요 성과 지표 (KPIs)</h2>
                        <p>본 3분기 캠페인의 주요 목적은 북미 및 유럽 지역의 신규 B2B 리드(Lead)를 창출하고 플랫폼 가입 전환율을 높이는 데 있었습니다. 설정된 목표와 결과는 아래
                            표와 같습니다.</p>

                        {/* Formatted Table */}
                        <div className="my-8 overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-white/5 text-white/60 uppercase text-xs">
                                    <tr>
                                        <th className="border-b border-white/10 p-3">핵심 지표 (Metric)</th>
                                        <th className="border-b border-white/10 p-3">목표 (Target)</th>
                                        <th className="border-b border-white/10 p-3">결과 (Actual)</th>
                                        <th className="border-b border-white/10 p-3">달성률</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="border-b border-white/5 p-3 text-white font-medium">신규 가입 리드 수</td>
                                        <td className="border-b border-white/5 p-3 font-mono">15,000</td>
                                        <td className="border-b border-white/5 p-3 font-mono text-green-400">16,420</td>
                                        <td className="border-b border-white/5 p-3"><span
                                                className="bg-green-400/20 text-green-400 px-2 py-0.5 rounded text-xs border border-green-400/30">109%</span>
                                        </td>
                                    </tr>
                                    <tr className="bg-white/[0.02]">
                                        <td className="border-b border-white/5 p-3 text-white font-medium">고객 획득 비용 (CAC)
                                        </td>
                                        <td className="border-b border-white/5 p-3 font-mono">$32.00</td>
                                        <td className="border-b border-white/5 p-3 font-mono text-green-400">$28.15</td>
                                        <td className="border-b border-white/5 p-3"><span
                                                className="bg-green-400/20 text-green-400 px-2 py-0.5 rounded text-xs border border-green-400/30">112%
                                                효율</span></td>
                                    </tr>
                                    <tr>
                                        <td className="border-b border-white/5 p-3 text-white font-medium">트라이얼 -> 유료 전환율
                                        </td>
                                        <td className="border-b border-white/5 p-3 font-mono">8.5%</td>
                                        <td className="border-b border-white/5 p-3 font-mono text-yellow-400">8.1%</td>
                                        <td className="border-b border-white/5 p-3"><span
                                                className="bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded text-xs border border-yellow-400/30">95%</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <h2>2. 채널별 투자 대비 수익률 (ROI) 분석</h2>
                        <p>다양한 매체 중 <strong>소셜 미디어 비디오 광고</strong>가 가장 높은 ROI를 보였습니다. 아래는 에이전트가 데이터 웨어하우스에서 실시간으로 생성한
                            채널별 효율 차트입니다.</p>

                        {/* Embedded Chart Mockup */}
                        <div className="my-8 bg-black/40 border border-white/10 rounded-xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-white font-medium m-0 flex items-center gap-2"><i
                                        className="fas fa-chart-bar text-accent-cyan"></i> 채널별 전환 단가 (CPA) 비교</h4>
                                <button className="btn-glass !py-1 !px-2 text-xs"><i className="fas fa-expand-alt mr-1"></i> 데이터
                                    소스</button>
                            </div>

                            {/* Fake Bar Chart */}
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-white/60">Social Video (YouTube 등)</span>
                                        <span className="font-mono text-white">$18.50 <span
                                                className="text-green-400">최상</span></span>
                                    </div>
                                    <div className="h-4 bg-white/5 rounded-full overflow-hidden flex">
                                        <div className="h-full bg-gradient-to-r from-accent-purple to-accent-cyan w-[30%]">
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-white/60">Search Network (Google/Bing)</span>
                                        <span className="font-mono text-white">$35.20</span>
                                    </div>
                                    <div className="h-4 bg-white/5 rounded-full overflow-hidden flex">
                                        <div className="h-full bg-blue-500 w-[55%]"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-white/60">Display Network (Banners)</span>
                                        <span className="font-mono text-white">$42.80 <span
                                                className="text-red-400">주의</span></span>
                                    </div>
                                    <div className="h-4 bg-white/5 rounded-full overflow-hidden flex">
                                        <div className="h-full bg-red-400 w-[70%]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <h2>3. 향후 액션 아이템 제안 (Q4)</h2>
                        <ul>
                            <li>디스플레이 네크워크 예산 20% 삭감 및 소셜 비디오 캠페인으로 재배정</li>
                            <li>유럽 지역 유료 전환율 개선을 위한 온보딩 프로세스 A/B 테스트용 에이전트(FE 개발, 카피라이터) 워크플로우 승인 요청</li>
                        </ul>
                    </div>

                </div>
            </div>

            {/* Floating Action Button (Ask Agent) */}
            <button
                className="absolute bottom-8 right-8 w-14 h-14 rounded-full bg-gradient-accent shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-center text-white text-xl hover:scale-110 transition-transform">
                <i className="fas fa-sparkles"></i>
            </button>
        </section>

    </main>
    </>
  );
}

export default Reports;
