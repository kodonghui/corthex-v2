"use client";
import React from "react";

const styles = `
body {
            background-color: #fcfbf9;
            color: #2c2c2c;
            -ms-overflow-style: none;
            scrollbar-width: none;
        }

        body::-webkit-scrollbar {
            display: none;
        }

        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }

        .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }

        .article-card {
            background-color: white;
            border-radius: 1.25rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
            border: 1px solid #f5f3ec;
            transition: all 0.2s ease;
            cursor: pointer;
        }

        .article-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
            border-color: #e8e4d9;
        }

        /* Tree view simple styling */
        .tree-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 0.75rem;
            border-radius: 0.5rem;
            cursor: pointer;
            color: #6b6b6b;
            font-size: 0.875rem;
            transition: background-color 0.2s;
        }

        .tree-item:hover {
            background-color: rgba(245, 243, 236, 0.8);
            color: #2c2c2c;
        }

        .tree-item.active {
            background-color: white;
            color: #e07a5f;
            font-weight: 600;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
        }

        .tree-children {
            padding-left: 1.5rem;
            margin-top: 0.25rem;
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
            border-left: 1px solid #f5f3ec;
            margin-left: 1rem;
        }
`;

function AppKnowledge() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Primary Sidebar */}
    <aside
        className="w-20 flex flex-col items-center justify-between py-8 border-r border-base-200 bg-base-50/50 backdrop-blur-md z-20 shrink-0">
        <div className="flex flex-col items-center gap-6">
            <div
                className="w-10 h-10 rounded-full bg-accent-terracotta flex items-center justify-center text-white font-bold text-xl mb-4">
                C</div>

            <a href="#"
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-text-muted hover:bg-base-100 transition-colors"
                title="홈">
                <i className="ph ph-squares-four text-2xl"></i>
            </a>
            <a href="#"
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-text-muted hover:bg-base-100 transition-colors"
                title="사령관실">
                <i className="ph ph-terminal-window text-2xl"></i>
            </a>
            {/* Active menu */}
            <a href="#"
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-accent-terracotta bg-base-100 transition-colors"
                title="정보국 (Knowledge Base)">
                <i className="ph ph-books text-2xl"></i>
            </a>
            <a href="#"
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-text-muted hover:bg-base-100 transition-colors"
                title="파일 보관소">
                <i className="ph ph-files text-2xl"></i>
            </a>
        </div>
        <div>
            <img src="https://i.pravatar.cc/100?img=11" alt="Profile"
                className="w-10 h-10 rounded-full border border-base-300" />
        </div>
    </aside>

    {/* Folder Tree (API: GET /api/workspace/knowledge/folders) */}
    <aside className="w-72 border-r border-base-200 bg-base-100/30 flex flex-col h-full z-10 shrink-0">
        <div className="p-6 pb-2 shrink-0">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-text-main">정보국 (Wiki)</h2>
                {/* API: POST /api/workspace/knowledge/articles */}
                <button
                    className="w-8 h-8 rounded-full bg-text-main flex items-center justify-center text-white shadow-sm hover:bg-opacity-90 transition-colors">
                    <i className="ph ph-plus"></i>
                </button>
            </div>

            {/* Context Match AI Label */}
            <div
                className="bg-gradient-to-r from-accent-amber/10 to-transparent p-3 rounded-xl border border-accent-amber/20 flex items-start gap-2 mb-4">
                <i className="ph ph-sparkle text-accent-amber mt-0.5"></i>
                <div>
                    <h4 className="text-[11px] font-bold text-text-main">AI 자동 색인 중</h4>
                    <p className="text-[10px] text-text-muted leading-tight mt-0.5">모든 문서가 153개 부서 에이전트들의 맥락 메모리로 공유됩니다.</p>
                </div>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-4">

            <div className="mb-4">
                <div className="tree-item"><i className="ph ph-caret-right text-base-300"></i><i
                        className="ph ph-push-pin text-text-main"></i> 핀 고정된 문서 (최상단)</div>
                <div className="tree-children">
                    <div className="tree-item"><i className="ph ph-article"></i> 회사 내규 및 지침 (V2)</div>
                    <div className="tree-item"><i className="ph ph-article"></i> 2026 연간 사업계획서</div>
                </div>
            </div>

            <div className="mb-4">
                <div className="tree-item"><i className="ph ph-caret-down text-text-muted"></i><i
                        className="ph ph-folder text-accent-terracotta"></i> <strong>개발 및 엔지니어링</strong></div>
                <div className="tree-children">
                    <div className="tree-item active"><i className="ph ph-folder-open text-accent-terracotta"></i> 아키텍처 가이드라인
                    </div>
                    <div className="tree-item"><i className="ph ph-folder"></i> API 명세서</div>
                    <div className="tree-item"><i className="ph ph-folder"></i> 인프라 및 보안 설정</div>
                </div>
            </div>

            <div className="mb-4">
                <div className="tree-item"><i className="ph ph-caret-right text-base-300"></i><i className="ph ph-folder"></i> 프로덕트
                    디자인</div>
            </div>

            <div className="mb-4">
                <div className="tree-item"><i className="ph ph-caret-right text-base-300"></i><i className="ph ph-folder"></i> 영업 및
                    마케팅 전략</div>
            </div>

            <div className="mb-4">
                <div className="tree-item"><i className="ph ph-caret-right text-base-300"></i><i className="ph ph-folder"></i> 고객 성과
                    리뷰 (CS)</div>
            </div>

        </div>
    </aside>

    {/* Main Content Panel (API: GET /api/workspace/knowledge/articles?folder=...) */}
    <main className="flex-1 flex flex-col h-full bg-[#fcfbf9]/50 relative overflow-hidden">

        {/* Header & Search */}
        <header
            className="px-10 pt-8 pb-4 shrink-0 flex flex-col gap-6 border-b border-base-200/50 bg-[#fcfbf9]/80 backdrop-blur-md z-10">

            <div className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-text-muted mb-1">
                        <span>개발 및 엔지니어링</span> <i className="ph ph-caret-right text-xs"></i> <span
                            className="text-text-main">아키텍처 가이드라인</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-main">아키텍처 가이드라인</h1>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-2 mr-2">
                        <img src="https://i.pravatar.cc/100?img=12" className="w-8 h-8 rounded-full border-2 border-white" />
                        <img src="https://i.pravatar.cc/100?img=33" className="w-8 h-8 rounded-full border-2 border-white" />
                        <div
                            className="w-8 h-8 rounded-full border-2 border-white bg-base-100 flex items-center justify-center text-xs font-bold text-text-muted">
                            +4</div>
                    </div>
                    <button
                        className="bg-white text-text-main border border-base-200 px-4 py-2 rounded-xl font-bold shadow-sm hover:bg-base-50 transition-colors text-sm flex items-center gap-2">
                        <i className="ph ph-list-bullets"></i> 목록
                    </button>
                    <button
                        className="bg-white text-text-main border border-base-200 px-4 py-2 rounded-xl font-bold shadow-sm hover:bg-base-50 transition-colors text-sm flex items-center gap-2">
                        <i className="ph ph-grid-four text-accent-terracotta"></i> 그리드
                    </button>
                </div>
            </div>

            {/* Global AI Search Bar */}
            <div className="relative w-full max-w-3xl">
                <i className="ph ph-magic-wand absolute left-4 top-1/2 -translate-y-1/2 text-accent-terracotta text-lg"></i>
                <input type="text" placeholder="어떤 정보가 필요하신가요? 자연어로 검색해보세요. (예: 저번 달 V2 보안패치 내역 찾아줘)"
                    className="w-full bg-white border border-base-200 focus:border-accent-terracotta/50 outline-none text-sm pl-12 pr-4 py-3.5 rounded-2xl text-text-main placeholder:text-base-300 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-colors" />
            </div>

        </header>

        {/* Articles Grid */}
        <div className="flex-1 overflow-y-auto px-10 py-8 hide-scrollbar relative">

            {/* AI Suggestion Overlay (Floating top right) */}
            <div
                className="absolute right-10 top-0 w-80 bg-white rounded-2xl border border-accent-amber/20 shadow-soft-lg p-4 z-20 transform translate-y-4">
                <div className="flex items-start gap-3">
                    <div
                        className="w-8 h-8 rounded-full bg-accent-amber/10 flex items-center justify-center text-accent-amber shrink-0 mt-0.5">
                        <i className="ph ph-sparkle text-lg"></i>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-text-main mb-1">AI 지식 제안</h4>
                        <p className="text-[11px] text-text-muted leading-relaxed mb-3">최근 Slack의 #dev-infrastructure 채널 대화를
                            분석하여 "Redis 캐싱 도입 가이드" 문서를 자동 초안 작성했습니다.</p>
                        <div className="flex gap-2">
                            <button
                                className="px-3 py-1 bg-[#fef5ec] text-accent-amber rounded-lg text-[10px] font-bold hover:bg-[#fdece6] transition-colors">초안
                                검토하기</button>
                            <button
                                className="px-3 py-1 bg-base-50 text-text-muted rounded-lg text-[10px] font-bold hover:bg-base-100 transition-colors">무시</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-3 xl:grid-cols-4 gap-6 pt-16">

                {/* Card */}
                <div className="article-card p-5 group flex flex-col h-64">
                    <div className="flex justify-between items-start mb-3">
                        <span
                            className="p-2 rounded-xl bg-base-50 text-text-muted group-hover:bg-[#fdece6] group-hover:text-accent-terracotta transition-colors">
                            <i className="ph ph-file-text text-xl"></i>
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="text-text-muted hover:text-text-main"><i
                                    className="ph ph-dots-three text-lg"></i></button>
                        </div>
                    </div>
                    <h3 className="font-bold text-text-main text-base mb-2 leading-snug line-clamp-2">CORTHEX V2 마이크로서비스
                        아키텍처 표준안</h3>
                    <p className="text-xs text-text-muted line-clamp-3 mb-4 flex-1">모놀리식에서 MSA로 전환하기 위한 서비스 분리 기준 및 서비스 간
                        통신(gRPC, 백엔드 라우팅) 규칙을 정의합니다.</p>

                    <div className="mt-auto border-t border-base-100 pt-3">
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            <span
                                className="px-2 py-0.5 bg-base-50 text-text-muted text-[10px] font-bold rounded">MSA</span>
                            <span className="px-2 py-0.5 bg-base-50 text-text-muted text-[10px] font-bold rounded">규칙</span>
                            <span
                                className="px-2 py-0.5 bg-accent-green/10 text-accent-green text-[10px] font-bold rounded">Official</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-text-muted font-medium">업데이트: 어제</span>
                            <div className="w-5 h-5 rounded-full overflow-hidden border border-base-200"><img
                                    src="https://i.pravatar.cc/100?img=33" className="w-full h-full" /></div>
                        </div>
                    </div>
                </div>

                {/* Card */}
                <div className="article-card p-5 group flex flex-col h-64">
                    <div className="flex justify-between items-start mb-3">
                        <span
                            className="p-2 rounded-xl bg-base-50 text-text-muted group-hover:bg-[#fdece6] group-hover:text-accent-terracotta transition-colors">
                            <i className="ph ph-database text-xl"></i>
                        </span>
                    </div>
                    <h3 className="font-bold text-text-main text-base mb-2 leading-snug line-clamp-2">Database Indexing 및 쿼리
                        최적화 가이드</h3>
                    <p className="text-xs text-text-muted line-clamp-3 mb-4 flex-1">대용량 에이전트 로그 데이터를 다루기 위한 PostgreSQL 파티셔닝
                        전략 및 인덱스 생성 기준 가이드 문서입니다.</p>

                    <div className="mt-auto border-t border-base-100 pt-3">
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            <span className="px-2 py-0.5 bg-base-50 text-text-muted text-[10px] font-bold rounded">DB</span>
                            <span
                                className="px-2 py-0.5 bg-base-50 text-text-muted text-[10px] font-bold rounded">최적화</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-text-muted font-medium">업데이트: 3일 전</span>
                            <div className="w-5 h-5 rounded-full overflow-hidden border border-base-200"><img
                                    src="https://i.pravatar.cc/100?img=12" className="w-full h-full" /></div>
                        </div>
                    </div>
                </div>

                {/* Card: AI Generated */}
                <div className="article-card p-5 group flex flex-col h-64 border-accent-amber/30 relative">
                    <div
                        className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-accent-amber/10 to-transparent rounded-bl-3xl z-0">
                    </div>
                    <div className="flex justify-between items-start mb-3 relative z-10">
                        <span className="p-2 rounded-xl bg-accent-amber/10 text-accent-amber">
                            <i className="ph ph-sparkle text-xl"></i>
                        </span>
                    </div>
                    <h3 className="font-bold text-text-main text-base mb-2 leading-snug line-clamp-2 relative z-10">AI 메모리
                        주입 및 RAG 시스템 구성 개요</h3>
                    <p className="text-xs text-text-muted line-clamp-3 mb-4 flex-1 relative z-10">각 에이전트들이 회사 코어 문서를 바탕으로
                        대답할 수 있도록, 임베딩 벡터 DB 스키마 및 프롬프트 주입 예제를 설명합니다.</p>

                    <div className="mt-auto border-t border-base-100 pt-3 relative z-10">
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            <span className="px-2 py-0.5 bg-base-50 text-text-muted text-[10px] font-bold rounded">AI
                                Agent</span>
                            <span
                                className="px-2 py-0.5 bg-base-50 text-text-muted text-[10px] font-bold rounded">RAG</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-text-muted font-medium">업데이트: 방금 전</span>
                            <div
                                className="w-5 h-5 rounded-full bg-[#fdece6] border border-white text-accent-terracotta text-[8px] flex items-center justify-center font-bold">
                                M</div>
                        </div>
                    </div>
                </div>

                {/* Card Empty slot to Add */}
                <div
                    className="article-card p-5 flex flex-col h-64 border-dashed border-2 border-base-200 bg-transparent hover:bg-white justify-center items-center group">
                    <div
                        className="w-12 h-12 rounded-full bg-base-100 text-text-muted group-hover:bg-accent-terracotta group-hover:text-white flex items-center justify-center text-xl transition-colors mb-3">
                        <i className="ph ph-plus"></i>
                    </div>
                    <h3 className="font-bold text-text-main text-sm text-center">새 문서 작성</h3>
                </div>

            </div>
        </div>

    </main>
    </>
  );
}

export default AppKnowledge;
