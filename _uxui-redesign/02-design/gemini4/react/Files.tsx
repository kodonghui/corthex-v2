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

        /* Drag and drop zone */
        .drop-zone {
            border: 2px dashed inherit /* FIXME: theme value not in map */;
            transition: all 0.3s;
        }

        .drop-zone:hover {
            background-color: inherit /* FIXME: theme value not in map */;
            border-color: inherit /* FIXME: theme value not in map */;
        }
`;

function Files() {
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
            <p className="px-4 text-[10px] font-bold text-text-light uppercase tracking-widest mt-6 mb-2">아카이브</p>
            <a href="/app/knowledge" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253">
                    </path>
                </svg>
                전사 지식 베이스
            </a>
            <a href="/app/files" className="nav-item active">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                </svg>
                공용 파일함 (RAG)
            </a>
            <a href="/app/reports" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                    </path>
                </svg>
                보고서 및 산출물
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
    {/* API: GET /api/workspace/files */}
    <main className="flex-1 overflow-y-auto px-8 py-10 relative">
        <header className="mb-10 lg:flex lg:justify-between lg:items-end">
            <div className="mb-4 lg:mb-0">
                <h1 className="text-3xl font-serif text-text-main mb-2">공용 파일함 (Vector RAG)</h1>
                <p className="text-text-muted">업로드된 파일은 벡터 DB로 처리되어 에이전트들이 분석하고 참조할 수 있는 "기억"이 됩니다.</p>
            </div>

            <div className="flex gap-2">
                <div className="relative w-64 hidden sm:block">
                    <svg className="w-4 h-4 text-text-light absolute left-3 top-2.5" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <input type="text"
                        className="w-full bg-surface border border-border text-text-main rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary-light shadow-sm"
                        placeholder="파일 이름, 확장자 검색..." />
                </div>
            </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">

            {/* Left: File List */}
            <div className="lg:col-span-2">
                {/* File Browser */}
                <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">

                    {/* Table Header */}
                    <div
                        className="grid grid-cols-[1fr_100px_150px_100px] gap-4 p-4 bg-background-alt border-b border-border text-[10px] font-bold text-text-muted uppercase tracking-wider items-center">
                        <div className="flex items-center gap-2">
                            <input type="checkbox"
                                className="w-3.5 h-3.5 rounded border-border text-primary accent-primary" />
                            이름
                        </div>
                        <div className="text-right">크기</div>
                        <div>벡터 변환 상태</div>
                        <div className="text-right">업로드 일자</div>
                    </div>

                    {/* File List Items */}
                    <div className="divide-y divide-border">

                        {/* Folder */}
                        <div
                            className="grid grid-cols-[1fr_100px_150px_100px] gap-4 p-4 items-center hover:bg-background-alt transition-colors cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <input type="checkbox"
                                    className="w-3.5 h-3.5 rounded border-border text-primary accent-primary" />
                                <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd"
                                        d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v1H2V6zm0 3v8a2 2 0 002 2h12a2 2 0 002-2V9H2z"
                                        clipRule="evenodd"></path>
                                </svg>
                                <span
                                    className="font-medium text-text-main group-hover:text-primary transition-colors">2024년
                                    1분기 결산 보고서</span>
                            </div>
                            <div className="text-right text-xs text-text-muted">-</div>
                            <div>-</div>
                            <div className="text-right text-xs text-text-light">03/01</div>
                        </div>

                        {/* File (PDF, Indexed) */}
                        <div
                            className="grid grid-cols-[1fr_100px_150px_100px] gap-4 p-4 items-center hover:bg-background-alt transition-colors group">
                            <div className="flex items-center gap-3">
                                <input type="checkbox"
                                    className="w-3.5 h-3.5 rounded border-border text-primary accent-primary" />
                                <span
                                    className="w-5 h-5 bg-red-100 text-red-600 rounded flex items-center justify-center text-[8px] font-bold">PDF</span>
                                <span
                                    className="font-medium text-text-main group-hover:text-primary transition-colors truncate">경쟁사_A_제품_매뉴얼_v3.pdf</span>
                            </div>
                            <div className="text-right text-xs text-text-muted">4.2 MB</div>
                            <div><span
                                    className="bg-primary/10 border border-primary/20 text-primary text-[10px] px-2 py-0.5 rounded font-medium">분석
                                    완료 (Indexed)</span></div>
                            <div className="text-right text-xs text-text-light">어제</div>
                        </div>

                        {/* File (CSV, Processing) */}
                        <div
                            className="grid grid-cols-[1fr_100px_150px_100px] gap-4 p-4 items-center hover:bg-background-alt transition-colors group">
                            <div className="flex items-center gap-3">
                                <input type="checkbox"
                                    className="w-3.5 h-3.5 rounded border-border text-primary accent-primary" />
                                <span
                                    className="w-5 h-5 bg-green-100 text-green-700 rounded flex items-center justify-center text-[8px] font-bold">CSV</span>
                                <span
                                    className="font-medium text-text-main group-hover:text-primary transition-colors truncate">23Q4_customers_raw_data.csv</span>
                            </div>
                            <div className="text-right text-xs text-text-muted">12.8 MB</div>
                            <div>
                                <span className="text-accent-hover text-[10px] font-medium flex items-center gap-1">
                                    <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                                        </path>
                                    </svg>
                                    처리 중 (45%)
                                </span>
                            </div>
                            <div className="text-right text-xs text-text-light">09:15</div>
                        </div>

                        {/* File (TXT, Error) */}
                        <div
                            className="grid grid-cols-[1fr_100px_150px_100px] gap-4 p-4 items-center hover:bg-background-alt transition-colors group">
                            <div className="flex items-center gap-3">
                                <input type="checkbox"
                                    className="w-3.5 h-3.5 rounded border-border text-primary accent-primary" />
                                <span
                                    className="w-5 h-5 bg-gray-200 text-gray-600 rounded flex items-center justify-center text-[8px] font-bold">TXT</span>
                                <span
                                    className="font-medium text-text-main group-hover:text-primary transition-colors truncate opacity-70">encrypted_logs.txt</span>
                            </div>
                            <div className="text-right text-xs text-text-muted">1.1 MB</div>
                            <div><span
                                    className="bg-red-50 text-red-600 text-[10px] px-2 py-0.5 rounded font-medium border border-red-200">인식
                                    오류</span></div>
                            <div className="text-right text-xs text-text-light">08:20</div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Right: Upload Panel */}
            <div className="space-y-6">
                {/* Drag and Drop Area */}
                {/* API: POST /api/workspace/files/upload */}
                <div
                    className="bg-surface rounded-xl p-8 drop-zone flex flex-col items-center justify-center text-center cursor-pointer">
                    <div
                        className="w-16 h-16 rounded-full bg-primary-light text-primary flex items-center justify-center mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12">
                            </path>
                        </svg>
                    </div>
                    <h3 className="font-serif text-lg text-text-main mb-1">파일 업로드 (RAG 추가)</h3>
                    <p className="text-xs text-text-muted mb-6">여기로 파일을 드래그하거나 클릭하세요.<br />(PDF, CSV, TXT, DOCX 지원)</p>
                    <button
                        className="bg-primary text-white px-5 py-2.5 rounded-xl border border-transparent shadow-sm hover:shadow-card transition-all font-medium text-sm w-full">
                        파일 찾아보기
                    </button>
                </div>

                {/* Info Card */}
                <div className="card p-5 bg-surface-alt">
                    <h4 className="font-bold text-sm text-text-main mb-2">벡터 변환(RAG)이란?</h4>
                    <p className="text-xs text-text-muted leading-relaxed">
                        업로드된 파일은 AI가 문맥을 이해할 수 있는 형태(Vector)로 변환됩니다. 이후 에이전트에게
                        "경쟁사 A의 제품 가격이 얼마야?"라고 물으면, 에이전트가 이 파일함에서 문서를 스스로 검색하여 답변합니다.
                    </p>

                    <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex justify-between items-center text-xs text-text-main font-medium mb-1">
                            <span>용량 한도 (Tokens)</span>
                            <span>45% 사용</span </div>
                            <div className="w-full bg-background rounded-full h-1.5 mb-1">
                                <div className="bg-secondary h-1.5 rounded-full" style={{width: "45%"}}></div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
    </main>
    </>
  );
}

export default Files;
