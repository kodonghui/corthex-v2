"use client";
import React from "react";

const styles = `
@layer base {
            body { @apply bg-background text-text-main font-sans antialiased; }
            h1, h2, h3 { @apply font-serif text-text-main; }
        }
        @layer components {
            .card { @apply bg-surface rounded-2xl shadow-soft border border-border p-6; }
            .nav-item { @apply flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-text-main hover:bg-surface-alt transition-colors; }
            .nav-item.active { @apply bg-surface-alt font-semibold text-primary-700; }
            .badge-bull { @apply bg-[#fbf8eb] text-secondary-600 border border-secondary-100; }
            .badge-bear { @apply bg-[#f2f6ef] text-primary-700 border border-primary-100; }
        }
`;

function AppTrading() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
<aside className="w-64 flex-shrink-0 inset-y-0 left-0 bg-surface border-r border-border flex flex-col z-10 w-[256px]">
        <div className="h-16 flex items-center px-6 border-b border-border mr-4">
            <div
                className="w-6 h-6 rounded bg-primary-600 mr-2 flex items-center justify-center text-white text-xs font-bold">
                C</div>
            <span className="font-serif font-bold text-lg">CORTHEX</span>
        </div>
        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
            <a href="/app/home" className="nav-item"><svg className="w-4 h-4" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6">
                    </path>
                </svg>홈</a>
            <a href="/app/command-center" className="nav-item"><svg className="w-4 h-4" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>사령관실</a>
            <a href="/app/trading" className="nav-item active"><svg className="w-4 h-4 text-primary-600" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>전략실</a>
        </div>
    </aside>

    <main className="flex-1 p-8 md:p-12 relative overflow-y-auto">
        <header className="mb-10 flex items-end justify-between border-b border-border pb-6">
            <div>
                <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-50 text-secondary-700 border border-secondary-200 mb-2">모의
                    투자 모드</span>
                <h1 className="text-3xl font-bold font-serif mb-2">전략실 포트폴리오</h1>
                <p className="text-text-muted">에이전트가 주식 시장을 감시하고 분석하여 거래를 실행합니다.</p>
            </div>
            <div className="flex items-center gap-3">
                <button
                    className="bg-surface border border-border px-4 py-2 rounded-xl border-dashed text-text-main text-sm hover:border-primary-400 hover:text-primary-600 transition-colors">+
                    포트폴리오 추가</button>
                <button
                    className="bg-primary-600 border border-primary-600 px-4 py-2 rounded-xl text-white font-medium text-sm hover:bg-primary-700 shadow-sm transition-colors">수동
                    주문</button>
            </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2 card">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <p className="text-sm font-medium text-text-muted mb-1">총 자산 가치</p>
                        <div className="flex items-end gap-3">
                            <h2 className="text-3xl font-bold font-serif">₩ 45,210,500</h2>
                            <span className="text-sm font-medium text-secondary-600 mb-1">+₩ 1,230,000 (2.8%)</span>
                        </div>
                    </div>
                    <div className="w-24 h-12 flex items-center">
                        <svg className="w-full h-full text-secondary-500" viewBox="0 0 100 30" preserveAspectRatio="none">
                            <polyline fill="none" stroke="currentColor" strokeWidth="2"
                                points="0,20 10,18 20,22 30,15 40,25 50,12 60,18 70,8 80,12 90,5 100,2" />
                        </svg>
                    </div>
                </div>

                <h3 className="text-lg font-serif font-bold mb-4 border-t border-border pt-4">보유 종목</h3>
                <div className="flex flex-col gap-0 border border-border rounded-xl bg-surface-alt overflow-hidden">
                    <div
                        className="grid grid-cols-5 text-xs font-medium text-text-muted px-4 py-3 bg-white border-b border-border">
                        <div className="col-span-2">종목명</div>
                        <div className="text-right">현재가</div>
                        <div className="text-right">수익률</div>
                        <div className="text-right">평가금액</div>
                    </div>
                    {/* Item 1 */}
                    <div
                        className="grid grid-cols-5 items-center px-4 py-3 bg-white border-b border-border hover:bg-surface-alt cursor-pointer transition-colors">
                        <div className="col-span-2">
                            <p className="font-bold text-sm">삼성전자 <span
                                    className="text-xs text-text-light font-normal ml-1">005930</span></p>
                        </div>
                        <div className="text-right font-medium text-sm">74,200</div>
                        <div className="text-right"><span
                                className="px-2 py-0.5 rounded text-xs font-medium badge-bull">+1.2%</span></div>
                        <div className="text-right font-medium text-sm">14,840,000</div>
                    </div>
                    {/* Item 2 */}
                    <div
                        className="grid grid-cols-5 items-center px-4 py-3 bg-white hover:bg-surface-alt cursor-pointer transition-colors">
                        <div className="col-span-2">
                            <p className="font-bold text-sm">NAVER <span
                                    className="text-xs text-text-light font-normal ml-1">035420</span></p>
                        </div>
                        <div className="text-right font-medium text-sm">185,500</div>
                        <div className="text-right"><span
                                className="px-2 py-0.5 rounded text-xs font-medium badge-bear">-0.8%</span></div>
                        <div className="text-right font-medium text-sm">7,420,000</div>
                    </div>
                </div>
            </div>

            <div className="card flex flex-col">
                <h3 className="font-serif font-bold text-lg border-b border-border pb-3 mb-4">대기 중인 오더 (승인 필요)</h3>
                <div
                    className="flex-1 flex flex-col justify-center items-center text-center p-6 border border-dashed border-border rounded-xl bg-surface-alt">
                    <svg className="w-8 h-8 text-text-light mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p className="text-sm font-medium text-text-muted">에이전트가 제안한 대기 오더가 없습니다.</p>
                </div>
                <div className="mt-4 p-4 rounded-xl bg-primary-50 border border-primary-100">
                    <p className="text-xs font-bold text-primary-800 mb-1">CIO 투자 제안 자동 모드</p>
                    <p className="text-xs text-primary-700">활성화 시, 에이전트가 KIS API를 통해 실시간 매매를 승인 후 실행합니다.</p>
                </div>
            </div>
        </section>
    </main>
    </>
  );
}

export default AppTrading;
