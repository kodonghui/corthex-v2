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

        .bar-chart-container {
            display: flex;
            align-items: flex-end;
            gap: 8px;
            height: 120px;
            border-bottom: 1px dashed inherit /* FIXME: theme value not in map */;
            padding-bottom: 8px;
        }

        .bar {
            width: 32px;
            border-radius: 4px 4px 0 0;
            position: relative;
            transition: height 0.5s ease;
        }

        .bar:hover .tooltip {
            opacity: 1;
            visibility: visible;
        }
`;

function Performance() {
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
            <p className="px-4 text-[10px] font-bold text-text-light uppercase tracking-widest mt-6 mb-2">분석</p>
            <a href="/app/dashboard" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
                    </path>
                </svg>
                메인 통계표
            </a>
            <a href="/app/performance" className="nav-item active">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
                에이전트 성과 (ROI)
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
    {/* API: GET /api/workspace/metrics/agents */}
    <main className="flex-1 overflow-y-auto px-8 py-10 relative">
        <header className="mb-10 flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-serif text-text-main mb-2">에이전트별 업무 성과 평가</h1>
                <p className="text-text-muted">사용된 비용(Token) 대비 산출 처리량을 분석해 가장 효율적인 직원을 찾아냅니다.</p>
            </div>

            <div className="flex gap-2">
                <select
                    className="bg-surface border border-border text-text-main px-4 py-2 rounded-xl focus:outline-none focus:border-primary-light text-sm shadow-sm font-medium">
                    <option>최근 30일 (This Month)</option>
                    <option>최근 7일 (This Week)</option>
                    <option>전체 기간 (All Time)</option>
                </select>
            </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">

            {/* Most Efficient Agent */}
            <div className="card p-6 border-l-4 border-l-primary bg-surface flex flex-col justify-between">
                <div>
                    <h3 className="text-xs font-bold text-text-light uppercase tracking-wider mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z">
                            </path>
                        </svg>
                        이달의 최고 효율 에이전트
                    </h3>
                    <div className="flex items-center gap-4 mb-6">
                        <div
                            className="w-14 h-14 rounded-xl bg-primary-light text-primary flex items-center justify-center font-bold text-xl shadow-sm border border-border">
                            마</div>
                        <div>
                            <h2 className="font-serif text-2xl text-text-main font-bold">마케팅 카피라이터</h2>
                            <p className="text-sm text-text-muted">마케팅부 • GPT-3.5 Turbo 최적화 (90%)</p>
                        </div>
                    </div>
                </div>

                <div className="bg-background-alt border border-border rounded-xl p-4 grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-[10px] text-text-muted uppercase font-bold mb-1">건당 평균 소요 비용</p>
                        <p className="text-lg font-mono font-bold text-primary">₩2.4</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-text-muted uppercase font-bold mb-1">월간 작업 처리량</p>
                        <p className="text-lg font-mono font-bold text-text-main">4,208건</p>
                    </div>
                </div>
            </div>

            {/* Most Expensive Agent */}
            <div className="card p-6 border-l-4 border-l-secondary bg-surface flex flex-col justify-between">
                <div>
                    <h3 className="text-xs font-bold text-text-light uppercase tracking-wider mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        비용 최적화 주의 (High Cost)
                    </h3>
                    <div className="flex items-center gap-4 mb-6">
                        <div
                            className="w-14 h-14 rounded-xl bg-secondary-light text-secondary flex items-center justify-center font-bold text-xl shadow-sm border border-border">
                            전</div>
                        <div>
                            <h2 className="font-serif text-2xl text-text-main font-bold">데이터 스페셜리스트</h2>
                            <p className="text-sm text-text-muted">전략 기획실 • GPT-4 + Advanced Data Analysis</p>
                        </div>
                    </div>
                </div>

                <div className="bg-red-50/50 border border-red-100 rounded-xl p-4 grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-[10px] text-red-600/70 uppercase font-bold mb-1">건당 평균 소요 비용</p>
                        <p className="text-lg font-mono font-bold text-red-700">₩450.0</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-red-600/70 uppercase font-bold mb-1">전사 비용 점유율</p>
                        <p className="text-lg font-mono font-bold text-secondary">38.4%</p>
                    </div>
                </div>
            </div>

        </div>

        {/* Detailed Leaderboard */}
        <h2 className="font-serif text-xl border-b border-border pb-2 text-text-main mb-6 mt-12">전체 에이전트 ROI 리더보드</h2>

        <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden mb-8">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr
                            className="bg-background-alt border-b border-border text-[10px] font-bold text-text-muted uppercase tracking-wider">
                            <th className="p-4 font-bold">순위</th>
                            <th className="p-4 font-bold">에이전트 명 (부서)</th>
                            <th className="p-4 font-bold text-right">처리량 (Requests)</th>
                            <th className="p-4 font-bold text-right">총 비용 (₩)</th>
                            <th className="p-4 font-bold text-center">ROI 점수 (가성비)</th>
                            <th className="p-4 font-bold">주요 주력 모델</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-sm">
                        {/* Rank 1 */}
                        <tr className="hover:bg-background-alt/50 transition-colors">
                            <td className="p-4">
                                <span
                                    className="w-6 h-6 rounded bg-accent/20 text-accent-hover font-bold flex items-center justify-center text-xs">1</span>
                            </td>
                            <td className="p-4">
                                <div
                                    className="font-bold text-text-main hover:text-primary cursor-pointer transition-colors">
                                    마케팅 카피라이터</div>
                                <div className="text-[10px] text-text-muted mt-0.5">마케팅부</div>
                            </td>
                            <td className="p-4 text-right font-mono font-medium">4,208</td>
                            <td className="p-4 text-right font-mono text-text-muted">₩10,099</td>
                            <td className="p-4 text-center">
                                <div className="inline-flex items-center">
                                    <div
                                        className="w-24 bg-background border border-border rounded-full h-2 overflow-hidden mr-2">
                                        <div className="bg-primary h-full rounded-full" style={{width: "95%"}}></div>
                                    </div>
                                    <span className="font-bold text-primary text-xs">95</span>
                                </div>
                            </td>
                            <td className="p-4">
                                <span
                                    className="bg-surface border border-border text-[10px] px-2 py-0.5 rounded font-mono text-text-muted">gpt-3.5-turbo</span>
                            </td>
                        </tr>

                        {/* Rank 2 */}
                        <tr className="hover:bg-background-alt/50 transition-colors">
                            <td className="p-4">
                                <span
                                    className="w-6 h-6 rounded bg-surface border border-border text-text-muted font-bold flex items-center justify-center text-xs">2</span>
                            </td>
                            <td className="p-4">
                                <div
                                    className="font-bold text-text-main hover:text-primary cursor-pointer transition-colors">
                                    리서치 보조봇</div>
                                <div className="text-[10px] text-text-muted mt-0.5">비서실</div>
                            </td>
                            <td className="p-4 text-right font-mono font-medium">1,105</td>
                            <td className="p-4 text-right font-mono text-text-muted">₩5,800</td>
                            <td className="p-4 text-center">
                                <div className="inline-flex items-center">
                                    <div
                                        className="w-24 bg-background border border-border rounded-full h-2 overflow-hidden mr-2">
                                        <div className="bg-primary h-full rounded-full" style={{width: "82%"}}></div>
                                    </div>
                                    <span className="font-bold text-primary text-xs">82</span>
                                </div>
                            </td>
                            <td className="p-4">
                                <span
                                    className="bg-surface border border-border text-[10px] px-2 py-0.5 rounded font-mono text-text-muted">claude-3-haiku</span>
                            </td>
                        </tr>

                        {/* Rank 3 */}
                        <tr className="hover:bg-background-alt/50 transition-colors">
                            <td className="p-4">
                                <span
                                    className="w-6 h-6 rounded bg-surface border border-border text-text-muted font-bold flex items-center justify-center text-xs">3</span>
                            </td>
                            <td className="p-4">
                                <div
                                    className="font-bold text-text-main hover:text-primary cursor-pointer transition-colors">
                                    소셜 미디어 매니저</div>
                                <div className="text-[10px] text-text-muted mt-0.5">마케팅부</div>
                            </td>
                            <td className="p-4 text-right font-mono font-medium">850</td>
                            <td className="p-4 text-right font-mono text-text-muted">₩8,500</td>
                            <td className="p-4 text-center">
                                <div className="inline-flex items-center">
                                    <div
                                        className="w-24 bg-background border border-border rounded-full h-2 overflow-hidden mr-2">
                                        <div className="bg-accent h-full rounded-full" style={{width: "65%"}}></div>
                                    </div>
                                    <span className="font-bold text-accent-hover text-xs">65</span>
                                </div>
                            </td>
                            <td className="p-4">
                                <span
                                    className="bg-surface border border-border text-[10px] px-2 py-0.5 rounded font-mono text-text-muted">gpt-4o-mini</span>
                            </td>
                        </tr>

                        {/* Rank 12 (Last) */}
                        <tr className="hover:bg-background-alt/50 transition-colors opacity-90">
                            <td className="p-4">
                                <span
                                    className="w-6 h-6 rounded bg-surface border border-border text-text-muted font-bold flex items-center justify-center text-xs">12</span>
                            </td>
                            <td className="p-4">
                                <div
                                    className="font-bold text-text-main hover:text-primary cursor-pointer transition-colors text-secondary">
                                    데이터 스페셜리스트</div>
                                <div className="text-[10px] text-text-muted mt-0.5">전략 기획실</div>
                            </td>
                            <td className="p-4 text-right font-mono font-medium">210</td>
                            <td className="p-4 text-right font-mono text-secondary font-bold">₩94,500</td>
                            <td className="p-4 text-center">
                                <div className="inline-flex items-center">
                                    <div
                                        className="w-24 bg-background border border-border rounded-full h-2 overflow-hidden mr-2">
                                        <div className="bg-secondary h-full rounded-full" style={{width: "18%"}}></div>
                                    </div>
                                    <span className="font-bold text-secondary text-xs">18</span>
                                </div>
                            </td>
                            <td className="p-4">
                                <span
                                    className="bg-secondary/10 border border-secondary/20 text-secondary text-[10px] px-2 py-0.5 rounded font-mono font-bold">gpt-4</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="p-3 bg-background border-t border-border flex justify-center text-xs text-text-muted">
                * ROI 점수는 자체 알고리즘에 의해 (유용한 처리 건수 / 소모 토큰 비율) 로 계산됩니다.
            </div>
        </div>

    </main>
    </>
  );
}

export default Performance;
