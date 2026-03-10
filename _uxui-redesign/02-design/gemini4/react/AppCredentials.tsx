"use client";
import React from "react";

const styles = `
@layer base { body { @apply bg-background text-text-main font-sans antialiased; } h1, h2, h3 { @apply font-serif text-text-main; } }
        @layer components { 
            .card { @apply bg-surface rounded-2xl shadow-soft border border-border p-6; }
            .nav-item { @apply flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-text-main hover:bg-surface-alt transition-colors; }
            .nav-item.active { @apply bg-surface-alt font-semibold text-primary-700; }
        }
`;

function AppCredentials() {
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
            <a href="/app/knowledge" className="nav-item"><svg className="w-4 h-4" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253">
                    </path>
                </svg>정보국 (RAG)</a>
            <a href="/app/credentials" className="nav-item active"><svg className="w-4 h-4 text-primary-600" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z">
                    </path>
                </svg>내 크리덴셜</a>
            <a href="/app/sns" className="nav-item"><svg className="w-4 h-4" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1">
                    </path>
                </svg>SNS 통신국</a>
        </div>
    </aside>

    <main className="flex-1 p-8 md:p-12 overflow-y-auto max-w-4xl">
        <header className="mb-10 flex items-center justify-between border-b border-border pb-6">
            <div>
                <h1 className="text-3xl font-bold font-serif mb-2">크리덴셜 볼트 (개인 단위)</h1>
                <p className="text-text-muted">에이전트가 호출하는 125+개 도구 중, 사용자 개인 계정에 연결된 API 키 또는 토큰을 안전하게 보관합니다. AES-256 GCM 엣지
                    암호화.</p>
            </div>
            <button
                className="bg-primary-600 border border-primary-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-700 shadow-sm transition-colors">새
                인증 추가</button>
        </header>

        <section className="flex flex-col gap-4">
            <div className="card flex justify-between items-center bg-surface-alt border border-border">
                <div className="flex items-center gap-4">
                    <div
                        className="w-12 h-12 bg-white rounded-xl border border-border flex items-center justify-center flex-shrink-0 font-serif font-bold text-lg text-primary-700">
                        KIS</div>
                    <div>
                        <h3 className="font-serif font-semibold text-lg flex items-center gap-2">한국투자증권 (실거래) <span
                                className="bg-primary-100 text-primary-700 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">연결됨</span>
                        </h3>
                        <p className="text-sm text-text-muted mt-0.5">전략투자실 에이전트들이 매매 시 사용할 토큰입니다.</p>
                    </div>
                </div>
                <div>
                    <button
                        className="text-sm border border-border bg-white px-3 py-1.5 rounded-lg text-text-main font-medium hover:bg-surface-alt transition-colors">회수
                        / 해지</button>
                </div>
            </div>

            <div className="card flex justify-between items-center bg-white">
                <div className="flex items-center gap-4 opacity-70 hover:opacity-100 transition-opacity w-full">
                    <div
                        className="w-12 h-12 bg-surface-alt rounded-xl border border-border flex items-center justify-center flex-shrink-0 text-text-muted">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1">
                            </path>
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-serif font-semibold text-lg text-text-main">Slack API Token</h3>
                        <p className="text-sm text-text-muted mt-0.5">사내 슬랙 채널에 리포트를 전송할 때 필요합니다.</p>
                    </div>
                </div>
                <div>
                    <button
                        className="text-sm border border-border bg-white px-3 py-1.5 rounded-lg text-text-main font-medium hover:bg-surface-alt transition-colors flex items-center gap-1"><svg
                            className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg> 입력</button>
                </div>
            </div>

            <div className="card flex justify-between items-center bg-white">
                <div className="flex items-center gap-4 opacity-70 hover:opacity-100 transition-opacity w-full">
                    <div
                        className="w-12 h-12 bg-surface-alt rounded-xl border border-border flex items-center justify-center flex-shrink-0 text-text-muted font-bold font-serif">
                        N</div>
                    <div className="flex-1">
                        <h3 className="font-serif font-semibold text-lg text-text-main">Notion Integration</h3>
                        <p className="text-sm text-text-muted mt-0.5">문서 백업 및 조회를 위한 노션 접근 권한</p>
                    </div>
                </div>
                <div>
                    <button
                        className="text-sm border border-border bg-white px-3 py-1.5 rounded-lg text-text-main font-medium hover:bg-surface-alt transition-colors flex items-center gap-1"><svg
                            className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg> 입력</button>
                </div>
            </div>
        </section>
    </main>
    </>
  );
}

export default AppCredentials;
