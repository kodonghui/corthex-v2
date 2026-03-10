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
        }
`;

function AppAgora() {
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
            <a href="/app/agora" className="nav-item active"><svg className="w-4 h-4 text-primary-600" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z">
                    </path>
                </svg>아고라</a>
        </div>
    </aside>

    <main className="flex-1 p-8 md:p-12 relative overflow-y-auto w-full max-w-5xl mx-auto">
        <header className="mb-10 flex items-center justify-between border-b border-border pb-6">
            <div>
                <h1 className="text-3xl font-bold font-serif mb-2">아고라 (토론장)</h1>
                <p className="text-text-muted">다양한 에이전트들이 복잡한 사안에 대해 다자간 토론을 진행하고 결론을 도출합니다.</p>
            </div>
            <button
                className="bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:bg-primary-700 transition-colors">새
                토론 시작</button>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200">진행
                        중</span>
                    <span className="text-xs text-text-muted">라운드 2/3</span>
                </div>
                <h3 className="font-serif font-bold text-xl mb-2">신규 앱 론칭 시기: Q3 vs Q4</h3>
                <p className="text-sm text-text-muted mb-6 leading-relaxed">경쟁사 B의 빠른 점유율 확장으로 인해, 개발팀(품질 보장)과 마케팅팀(시장 선점)의
                    의견 대립 조율.</p>
                <div className="border-t border-border pt-4 flex gap-4 text-sm font-medium">
                    <div className="flex items-center gap-1.5">
                        <div
                            className="w-5 h-5 bg-surface-alt border border-border rounded-full flex items-center justify-center text-[10px] font-bold text-text-muted">
                            M</div>마케팅부
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div
                            className="w-5 h-5 bg-surface-alt border border-border rounded-full flex items-center justify-center text-[10px] font-bold text-text-muted">
                            D</div>개발부
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div
                            className="w-5 h-5 bg-primary-100 border border-primary-200 rounded-full flex items-center justify-center text-[10px] font-bold text-primary-700">
                            C</div>비서실장(조재자)
                    </div>
                </div>
            </div>

            <div className="card cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
                <div className="flex justify-between items-start mb-4">
                    <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-surface-alt text-text-muted border border-border">합의
                        도출 (종료)</span>
                    <span className="text-xs text-text-light">어제</span>
                </div>
                <h3 className="font-serif font-bold text-xl mb-2">테라코타 vs 올리브그린: 메인 브랜드 컬러</h3>
                <p className="text-sm text-text-muted mb-6 leading-relaxed">브랜드 아이덴티티 강화를 위한 새로운 포인트 컬러 선정 관련 찬반 토론.</p>
                <div className="border-t border-border pt-4 flex justify-between items-center">
                    <p className="text-sm font-semibold text-secondary-600">결론: 올리브그린 70%, 테라코타 30% 혼합 사용</p>
                </div>
            </div>
        </section>
    </main>
    </>
  );
}

export default AppAgora;
