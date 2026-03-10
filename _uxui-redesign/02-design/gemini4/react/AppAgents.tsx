"use client";
import React from "react";

const styles = `
@layer base { body { @apply bg-background text-text-main font-sans antialiased; } h1, h2, h3 { @apply font-serif text-text-main; } }
        @layer components { 
            .card { @apply bg-surface rounded-2xl shadow-soft border border-border p-5; }
            .nav-item { @apply flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-text-main hover:bg-surface-alt transition-colors; }
            .nav-item.active { @apply bg-surface-alt font-semibold text-primary-700; }
            .badge-manager { @apply bg-primary-50 text-primary-700 border border-primary-100; }
            .badge-specialist { @apply bg-secondary-50 text-secondary-700 border border-secondary-100; }
            .badge-worker { @apply bg-surface-alt text-text-muted border border-border; }
        }
`;

function AppAgents() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
<aside className="w-64 flex-shrink-0 inset-y-0 left-0 bg-surface border-r border-border flex flex-col z-10 w-[256px]">
        <div className="h-16 flex items-center px-6 border-b border-border mr-4">
            <div className="w-6 h-6 rounded bg-primary-600 mr-2 flex items-center justify-center text-white text-xs font-bold">C</div>
            <span className="font-serif font-bold text-lg">CORTHEX</span>
        </div>
        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
            <a href="/app/home" className="nav-item"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>홈</a>
            <a href="/app/nexus" className="nav-item"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>넥서스</a>
            <a href="/app/agents" className="nav-item active"><svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>에이전트 목록</a>
        </div>
    </aside>

    <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <header className="mb-10 flex items-center justify-between border-b border-border pb-6">
            <div>
                <h1 className="text-3xl font-bold font-serif mb-2">AI 에이전트 목록 (24명)</h1>
                <p className="text-text-muted">내 조직에 배속된 에이전트들의 상태와 Soul(성격), 도구 권한을 열람합니다. 정보 수정은 관리자만 가능합니다.</p>
            </div>
            <div className="flex gap-2">
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-light">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </span>
                    <input type="text" className="w-64 bg-surface border border-border rounded-xl pl-9 pr-4 py-2 text-sm focus:ring-primary-400 focus:outline-none focus:border-primary-400" placeholder="에이전트 이름 검색..." />
                </div>
                <select className="bg-surface border border-border text-sm rounded-xl px-4 py-2 focus:ring-primary-400 focus:outline-none">
                    <option>전체 부서</option>
                    <option>비서실</option>
                    <option>전략실</option>
                    <option>마케팅부</option>
                </select>
            </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Manager */}
            <div className="card hover:shadow-md cursor-pointer transition-shadow group">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border border-primary-200">조</div>
                        <div>
                            <h3 className="font-serif font-bold group-hover:text-primary-700 transition-colors">조재자 (비서실장)</h3>
                            <p className="text-xs text-text-muted tracking-wide mt-0.5">Manager · Claude 3.5 Sonnet</p>
                        </div>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider badge-manager">시스템</span>
                </div>
                <p className="text-sm text-text-muted line-clamp-2 mb-4">사용자의 명령을 최우선으로 분석하고 적절한 부서 및 에이전트에게 할당하며 결과물을 최종 검수하는 핵심 시스템 관리자입니다.</p>
                <div className="border-t border-border pt-4 flex items-center justify-between text-xs font-medium text-text-light">
                    <span className="flex items-center gap-1"><svg className="w-3 h-3 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> 비서실</span>
                    <span>12 Tools</span>
                </div>
            </div>

            {/* Specialist */}
            <div className="card hover:shadow-md cursor-pointer transition-shadow group">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary-50 flex items-center justify-center text-secondary-600 font-bold border border-secondary-200">SE</div>
                        <div>
                            <h3 className="font-serif font-bold group-hover:text-primary-700 transition-colors">SEO 분석가</h3>
                            <p className="text-xs text-text-muted tracking-wide mt-0.5">Specialist · Claude 3 Haiku</p>
                        </div>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider badge-specialist">일반</span>
                </div>
                <p className="text-sm text-text-muted line-clamp-2 mb-4">브랜드 콘텐츠 작성에 최적화된 키워드를 추출하여 트래픽 상위 노출 전략을 수립합니다. 주로 검색량 기반 데이터에 의존합니다.</p>
                <div className="border-t border-border pt-4 flex items-center justify-between text-xs font-medium text-text-light">
                    <span className="flex items-center gap-1"><svg className="w-3 h-3 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> 마케팅부</span>
                    <span>3 Tools</span>
                </div>
            </div>

            {/* Worker */}
            <div className="card hover:shadow-md cursor-pointer transition-shadow group">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface-alt flex items-center justify-center text-text-muted font-bold border border-border">블로</div>
                        <div>
                            <h3 className="font-serif font-bold group-hover:text-primary-700 transition-colors">블로그 매니저</h3>
                            <p className="text-xs text-text-muted tracking-wide mt-0.5">Worker · GPT-4o-mini</p>
                        </div>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider badge-worker">일반</span>
                </div>
                <p className="text-sm text-text-muted line-clamp-2 mb-4">작성된 원고를 SEO 가이드라인에 맞춰 네이버 블로그 톤앤매너로 변환하고, 이미지를 적절히 삽입하여 발행을 예약합니다.</p>
                <div className="border-t border-border pt-4 flex items-center justify-between text-xs font-medium text-text-light">
                    <span className="flex items-center gap-1"><svg className="w-3 h-3 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> 마케팅부</span>
                    <span>1 Tool</span>
                </div>
            </div>
        </section>
    </main>
    </>
  );
}

export default AppAgents;
