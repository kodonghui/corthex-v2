"use client";
import React from "react";

const styles = `
@layer base { body { @apply bg-background text-text-main font-sans antialiased; } h1, h2, h3 { @apply font-serif text-text-main; } }
        @layer components { 
            .card { @apply bg-surface rounded-2xl shadow-soft border border-border p-5; }
            .nav-item { @apply flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-text-main hover:bg-surface-alt transition-colors; }
            .nav-item.active { @apply bg-surface-alt font-semibold text-primary-700; }
        }
`;

function AppDepartments() {
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
            <a href="/app/agents" className="nav-item"><svg className="w-4 h-4" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z">
                    </path>
                </svg>에이전트 목록</a>
            <a href="/app/departments" className="nav-item active"><svg className="w-4 h-4 text-primary-600" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4">
                    </path>
                </svg>조직 부서 목록</a>
        </div>
    </aside>

    <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <header className="mb-10 flex items-center justify-between border-b border-border pb-6">
            <div>
                <h1 className="text-3xl font-bold font-serif mb-2">조직 부서 현황 (4실/부)</h1>
                <p className="text-text-muted">설립된 가상의 부서 목록과 할당된 예산, 소속 에이전트 규모를 파악합니다.</p>
            </div>
            <div className="flex gap-2">
                <button
                    className="bg-surface border border-border px-4 py-2 rounded-xl text-text-main text-sm font-medium hover:bg-surface-alt transition-colors">부서
                    신설 제안</button>
            </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {/* Dept 1 */}
            <div className="card hover:shadow-md cursor-pointer transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div
                        className="w-12 h-12 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 mb-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z">
                            </path>
                        </svg>
                    </div>
                    <span
                        className="inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-surface-alt border border-border text-text-muted">보호됨
                        (시스템)</span>
                </div>
                <h3 className="font-serif font-bold text-xl mb-1">비서실</h3>
                <p className="text-sm text-text-muted mb-6">CEO 명령의 접수, 적절한 부서로의 위임 및 품질 검수를 책임집니다.</p>
                <div className="flex justify-between items-center text-sm pt-4 border-t border-border">
                    <span className="font-medium text-text-main">소속: 1명</span>
                    <span className="text-text-muted">월 한도: 무제한</span>
                </div>
            </div>

            {/* Dept 2 */}
            <div className="card hover:shadow-md cursor-pointer transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div
                        className="w-12 h-12 rounded-2xl bg-secondary-50 border border-secondary-100 flex items-center justify-center text-secondary-600 mb-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
                        </svg>
                    </div>
                </div>
                <h3 className="font-serif font-bold text-xl mb-1">전략투자실</h3>
                <p className="text-sm text-text-muted mb-6">포트폴리오 설계, 주식/크립토 종목 분석 및 KIS API를 통한 트레이딩.</p>
                <div className="flex justify-between items-center text-sm pt-4 border-t border-border">
                    <span className="font-medium text-text-main">소속: 5명 (Specialist 3)</span>
                    <span className="text-text-muted">월 한도: $200.00</span>
                </div>
            </div>

            {/* Dept 3 */}
            <div className="card hover:shadow-md cursor-pointer transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div
                        className="w-12 h-12 rounded-2xl bg-accent-50 border border-accent-100 flex items-center justify-center text-accent-600 mb-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                            </path>
                        </svg>
                    </div>
                </div>
                <h3 className="font-serif font-bold text-xl mb-1">마케팅 브랜드부</h3>
                <p className="text-sm text-text-muted mb-6">SNS 콘텐츠 플래닝, 카피라이팅, 자동화된 포스팅 및 A/B 테스트 발행 전담.</p>
                <div className="flex justify-between items-center text-sm pt-4 border-t border-border">
                    <span className="font-medium text-text-main">소속: 4명</span>
                    <span className="text-text-muted">월 한도: $100.00</span>
                </div>
            </div>
        </section>
    </main>
    </>
  );
}

export default AppDepartments;
