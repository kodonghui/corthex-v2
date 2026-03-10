"use client";
import React from "react";

const styles = `
@layer base {
            body { @apply bg-background text-text-main font-sans antialiased; }
            h1, h2, h3 { @apply font-serif text-text-main; }
        }
        @layer components {
            .nav-item { @apply flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-text-main hover:bg-surface-alt transition-colors; }
            .nav-item.active { @apply bg-surface-alt font-semibold text-primary-700; }
        }
`;

function AppChat() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
<aside className="w-64 flex-shrink-0 inset-y-0 left-0 bg-surface border-r border-border flex flex-col z-10">
        <div className="h-16 flex items-center px-6 border-b border-border mr-4">
            <div
                className="w-6 h-6 rounded bg-primary-600 mr-2 flex items-center justify-center text-white text-xs font-bold">
                C</div>
            <span className="font-serif font-bold text-lg">CORTHEX</span>
        </div>
        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
            <a href="/app/home" className="nav-item"><svg className="w-4 h-4" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>홈</a>
            <a href="/app/command-center" className="nav-item"><svg className="w-4 h-4" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>사령관실</a>
            <a href="/app/chat" className="nav-item active"><svg className="w-4 h-4 text-primary-600" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>에이전트 챗</a>
        </div>
    </aside>

    <div className="w-72 bg-surface border-r border-border flex flex-col z-0 shadow-soft">
        <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-serif font-bold text-lg">대화 목록</h2>
            <button
                className="w-8 h-8 rounded-full bg-surface-alt flex items-center justify-center text-primary-600 hover:bg-primary-50 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
            </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            <div className="p-3 rounded-xl bg-primary-50 border border-primary-100 cursor-pointer text-sm">
                <p className="font-medium text-primary-800 mb-1">마케팅부 SEO 분석가</p>
                <p className="text-xs text-text-muted truncate">블로그 제목 초안 5종 생성 완료.</p>
            </div>
            <div
                className="p-3 rounded-xl hover:bg-surface-alt border border-transparent hover:border-border cursor-pointer text-sm transition-colors">
                <p className="font-medium text-text-main mb-1">법무부 계약서 검토</p>
                <p className="text-xs text-text-muted truncate">7조 2항의 책임 소지가 불분명합니다.</p>
            </div>
        </div>
    </div>

    <main className="flex-1 flex flex-col bg-background h-screen">
        <header className="h-16 flex items-center justify-between px-6 bg-surface/50 backdrop-blur border-b border-border">
            <div className="flex items-center gap-3">
                <div
                    className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border border-primary-200">
                    SE</div>
                <div>
                    <h2 className="font-serif font-bold">SEO 분석가 (마케팅부)</h2>
                    <p className="text-xs text-text-muted">Specialist · 1:1 직접 대화</p>
                </div>
            </div>
            <button className="text-text-muted hover:text-text-main"><svg className="w-5 h-5" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z">
                    </path>
                </svg></button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
            <div className="text-center w-full"><span
                    className="text-xs text-text-light px-3 py-1 bg-surface-alt rounded-full">오늘</span></div>

            <div className="flex justify-end">
                <div className="bg-primary-600 text-white p-4 rounded-2xl rounded-tr-sm max-w-lg shadow-sm">
                    <p className="text-sm">어제 논의했던 '자연주의 화장품' 캠페인 랜딩페이지 쓸 핵심 키워드 정리해줄래?</p>
                </div>
            </div>

            <div className="flex justify-start">
                <div className="flex items-end gap-2">
                    <div
                        className="w-8 h-8 rounded-full bg-primary-100 flex-shrink-0 hidden md:flex items-center justify-center text-primary-700 font-bold text-xs mb-1">
                        SE</div>
                    <div
                        className="bg-surface border border-border text-text-main p-4 rounded-2xl rounded-tl-sm max-w-lg shadow-soft leading-relaxed text-sm">
                        <p className="mb-2">네, 해당 캠페인을 위한 SEO 핵심 키워드 5종을 도출했습니다.</p>
                        <ul className="list-disc pl-4 space-y-1 mb-2 text-text-muted">
                            <li>오가닉 비건 화장품 (검색량 5,400)</li>
                            <li>임산부 튼살크림 추천 (검색량 12,000)</li>
                            <li>에코 프렌들리 스킨케어 (검색량 2,300)</li>
                        </ul>
                        <p>위 키워드를 바탕으로 메인 카피를 작성할까요?</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="p-4 bg-surface border-t border-border">
            <div
                className="max-w-4xl mx-auto flex items-end gap-2 bg-surface-alt rounded-2xl p-1 border border-border focus-within:ring-2 ring-primary-200 focus-within:bg-white transition-all">
                <button className="p-3 text-text-light hover:text-text-main"><svg className="w-5 h-5" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                            strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                    </svg></button>
                <textarea className="flex-1 bg-transparent border-none text-sm p-3 focus:outline-none resize-none h-12"
                    placeholder="메시지를 입력하세요..."></textarea>
                <button className="p-3 m-0.5 mb-0.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700">
                    <svg className="w-4 h-4 translate-x-0.5 -translate-y-0.5" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" strokeWidth="2" strokeLinejoin="round"
                            strokeLinecap="round" />
                    </svg>
                </button>
            </div>
        </div>
    </main>
    </>
  );
}

export default AppChat;
