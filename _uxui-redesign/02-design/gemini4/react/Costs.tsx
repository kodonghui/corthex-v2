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
`;

function Costs() {
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
            <p className="px-4 text-[10px] font-bold text-text-light uppercase tracking-widest mt-6 mb-2">관리</p>
            <a href="/app/departments" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4">
                    </path>
                </svg>
                조직 및 예산
            </a>
            <a href="/app/costs" className="nav-item active">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
                    </path>
                </svg>
                청구 및 비용 추적
            </a>
            <a href="/app/settings" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z">
                    </path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                환경설정
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
    {/* API: GET /api/workspace/billing/usage */}
    <main className="flex-1 overflow-y-auto px-8 py-10 relative">
        <header className="mb-10 flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-serif text-text-main mb-2">비용 추적 및 예산 한도</h1>
                <p className="text-text-muted">이번 달 에이전트들의 토큰(API) 사용량과 총 인건비(클라우드 비용)를 분석합니다.</p>
            </div>

            <div className="bg-primary/5 border border-primary/20 px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-4">
                <p className="text-xs text-text-muted">결제 수단: <span className="font-bold text-text-main">Visa ···· 4242</span>
                </p>
                <div className="h-4 w-[1px] bg-border"></div>
                <button className="text-sm font-bold text-primary hover:underline">결제 설정</button>
            </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
            {/* Total Cost Summary */}
            <div className="card p-6 bg-surface-alt col-span-1 border-primary/30 shadow-card flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-serif text-lg text-text-main">3월 누적 지출 (현재)</h3>
                        <span
                            className="bg-background-alt border border-border px-2 py-0.5 rounded text-[10px] font-bold text-text-muted">3월
                            1일 ~ 현재</span>
                    </div>
                    {/* Cost value */}
                    <div className="mb-2">
                        <span className="text-sm font-bold text-text-muted align-top mr-1">₩</span>
                        <span
                            className="text-5xl font-serif text-text-main font-bold tracking-tight text-primary">342,500</span>
                    </div>
                    <p className="text-sm text-secondary font-medium flex items-center gap-1 mb-8">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                        </svg>
                        지난 달 같은 기간 대비 15% 증가
                    </p>
                </div>

                <div>
                    <div className="flex justify-between text-xs text-text-main font-medium mb-2">
                        <span>전사 월간 활성 한도</span>
                        <span className="text-primary font-bold">₩500,000</span>
                    </div>
                    <div className="w-full bg-background rounded-full h-3 mb-2">
                        <div className="bg-primary h-3 rounded-full" style={{width: "68%"}}></div>
                    </div>
                    <p className="text-[10px] text-text-muted text-right">한도 도달 시 에이전트 자동 대기 상태 전환됨</p>
                </div>
            </div>

            {/* Spending by Department */}
            <div className="card p-6 col-span-2">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-serif text-lg text-text-main">부서별 인건비(토큰) 비중</h3>
                    <button
                        className="text-xs font-medium text-text-muted hover:text-text-main border border-border px-3 py-1.5 rounded-lg bg-background-alt hover:bg-surface transition-colors flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                        </svg>
                        상세 리포트
                    </button>
                </div>

                <div className="space-y-5">
                    {/* Dept 1 */}
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-primary block"></span>
                                <span className="font-medium text-text-main">비서실</span>
                            </div>
                            <span className="font-bold font-mono">₩184,800 (54%)</span>
                        </div>
                        <div className="w-full bg-background rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full" style={{width: "54%"}}></div>
                        </div>
                    </div>

                    {/* Dept 2 */}
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-secondary block"></span>
                                <span className="font-medium text-text-main">전략 기획실</span>
                            </div>
                            <span className="font-bold font-mono">₩102,700 (30%)</span>
                        </div>
                        <div className="w-full bg-background rounded-full h-2">
                            <div className="bg-secondary h-2 rounded-full" style={{width: "30%"}}></div>
                        </div>
                    </div>

                    {/* Dept 3 */}
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-accent block"></span>
                                <span className="font-medium text-text-main">마케팅부</span>
                            </div>
                            <span className="font-bold font-mono">₩55,000 (16%)</span>
                        </div>
                        <div className="w-full bg-background rounded-full h-2">
                            <div className="bg-accent h-2 rounded-full" style={{width: "16%"}}></div>
                        </div>
                    </div>
                </div>

                <div
                    className="bg-background-alt border border-dashed border-border p-3 rounded-lg mt-6 text-xs text-text-muted flex items-start gap-2">
                    <svg className="w-4 h-4 text-text-light mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <b>인사팀 제안:</b> 비서실의 GPT-4 의존도가 높습니다. 사소한 라우팅 작업은 GPT-3.5로 권한을 조정(Demotion)하여 비용을 최적화할 수 있습니다.
                    <button className="text-primary hover:underline ml-1">권한 일괄 변경하기</button>
                </div>
            </div>
        </div>

        <h2 className="font-serif text-xl border-b border-border pb-2 text-text-main mt-10 mb-6">청구서 내역 (Invoices)</h2>
        {/* API: GET /api/workspace/billing/invoices */}
        <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden mb-8">
            <div
                className="grid grid-cols-[100px_1fr_150px_150px_100px] gap-4 p-5 bg-background-alt border-b border-border text-xs font-bold text-text-muted uppercase tracking-wider">
                <div>상태</div>
                <div>청구월</div>
                <div className="text-right">금액</div>
                <div className="text-center">결제일</div>
                <div className="text-right">영수증</div>
            </div>

            <div className="divide-y divide-border text-sm">
                {/* Row 1 (Current/Pending) */}
                <div
                    className="grid grid-cols-[100px_1fr_150px_150px_100px] gap-4 p-5 items-center hover:bg-background-alt/50 transition-colors">
                    <div>
                        <span
                            className="bg-background border border-border text-text-main px-2 py-0.5 rounded text-[10px] font-bold">진행중</span>
                    </div>
                    <div className="font-bold font-serif">2026년 3월</div>
                    <div className="text-right font-mono font-bold text-text-main">₩342,500 <span
                            className="text-[10px] text-text-muted font-sans font-normal">(추정)</span></div>
                    <div className="text-center text-text-muted text-xs">4월 1일 예정</div>
                    <div className="text-right">-</div>
                </div>

                {/* Row 2 (Paid) */}
                <div
                    className="grid grid-cols-[100px_1fr_150px_150px_100px] gap-4 p-5 items-center hover:bg-background-alt/50 transition-colors">
                    <div>
                        <span
                            className="bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded text-[10px] font-bold">결제완료</span>
                    </div>
                    <div className="font-bold font-serif text-text-muted">2026년 2월</div>
                    <div className="text-right font-mono font-medium text-text-muted">₩298,400</div>
                    <div className="text-center text-text-muted text-xs">3월 1일</div>
                    <div className="text-right flex justify-end">
                        <button
                            className="p-1.5 text-text-muted hover:text-primary transition-colors hover:bg-surface rounded border border-transparent hover:border-border"><svg
                                className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                                </path>
                            </svg></button>
                    </div>
                </div>

                {/* Row 3 (Paid) */}
                <div
                    className="grid grid-cols-[100px_1fr_150px_150px_100px] gap-4 p-5 items-center hover:bg-background-alt/50 transition-colors opacity-70">
                    <div>
                        <span
                            className="bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded text-[10px] font-bold">결제완료</span>
                    </div>
                    <div className="font-bold font-serif text-text-muted">2026년 1월</div>
                    <div className="text-right font-mono font-medium text-text-muted">₩315,200</div>
                    <div className="text-center text-text-muted text-xs">2월 1일</div>
                    <div className="text-right flex justify-end">
                        <button
                            className="p-1.5 text-text-muted hover:text-primary transition-colors hover:bg-surface rounded border border-transparent hover:border-border"><svg
                                className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                                </path>
                            </svg></button>
                    </div>
                </div>
            </div>
        </div>

    </main>
    </>
  );
}

export default Costs;
