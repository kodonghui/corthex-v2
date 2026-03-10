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

function AdminTools() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Admin Sidebar */}
    <aside className="w-64 bg-surface border-r border-border flex flex-col h-full z-10 shadow-soft shrink-0">
        <div className="p-6 border-b border-border">
            <h2 className="font-serif text-2xl tracking-tight text-primary font-bold">CORTHEX</h2>
            <div className="flex items-center gap-1 mt-1">
                <span
                    className="bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded text-[10px] font-bold">ADMIN
                    PANEL</span>
            </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            <p className="px-4 text-[10px] font-bold text-text-light uppercase tracking-widest mb-2">프롬프트 & 영혼(Soul)</p>
            <a href="/admin/soul-templates" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z">
                    </path>
                </svg>
                에이전트 인격체(Soul)
            </a>
            <a href="/admin/tools" className="nav-item active">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z">
                    </path>
                </svg>
                연동 도구(Tools) 관리
            </a>
            <a href="/admin/api-keys" className="nav-item pl-10 text-xs text-text-muted">
                API 커넥터 명세
            </a>

            <p className="px-4 text-[10px] font-bold text-text-light uppercase tracking-widest mt-6 mb-2">플랫폼 관리로 돌아가기</p>
            <a href="/admin/dashboard" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6">
                    </path>
                </svg>
                전체 대시보드
            </a>
        </nav>

        <div className="p-4 border-t border-border">
            <a href="/app/home"
                className="flex items-center justify-center gap-2 p-2 rounded-lg bg-surface border border-border text-text-muted hover:bg-background-alt transition-colors w-full text-xs font-bold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1">
                    </path>
                </svg>
                워크스페이스 복귀
            </a>
        </div>
    </aside>

    {/* Main Content */}
    {/* API: GET /api/admin/tools/registry */}
    <main className="flex-1 overflow-y-auto px-8 py-10 relative">
        <header className="mb-10 lg:flex lg:justify-between lg:items-end">
            <div>
                <h1 className="text-3xl font-serif text-text-main font-bold mb-2">시스템 도구(Tools) 레지스트리</h1>
                <p className="text-text-muted">에이전트들이 사용할 수 있는 전역 함수 집합(Function Calling)과 외부 API 연동 명세를 관리합니다.</p>
            </div>

            <div className="mt-4 lg:mt-0">
                <button
                    className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl transition-colors font-medium shadow-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    새 도구 명세 추가
                </button>
            </div>
        </header>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
                <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-light" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <input type="text" placeholder="도구명, 엔드포인트, 설명으로 검색..."
                    className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary-light transition-colors shadow-sm text-text-main" />
            </div>

            <div className="flex gap-2">
                <select
                    className="bg-surface border border-border text-text-main px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-primary-light shadow-sm min-w-[150px]">
                    <option value="">카테고리 전체</option>
                    <option value="data">데이터/분석</option>
                    <option value="comm">통신/메신저</option>
                    <option value="file">파일/문서</option>
                </select>
                <select
                    className="bg-surface border border-border text-text-main px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-primary-light shadow-sm min-w-[130px]">
                    <option value="">타입 전체</option>
                    <option value="internal">내부 시스템 API</option>
                    <option value="external">외부 3rd Party</option>
                </select>
            </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">

            {/* Tool Item 1 */}
            <div className="card p-5 group flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-lg bg-background-alt border border-border text-text-main flex items-center justify-center">
                                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                            </div>
                            <div>
                                <h3
                                    className="font-bold text-text-main text-base group-hover:text-primary transition-colors">
                                    인터넷 브라우저 / 검색</h3>
                                <p className="text-[10px] font-mono text-text-light mt-0.5">tool_web_search_v2</p>
                            </div>
                        </div>
                        <span
                            className="bg-surface border border-border px-2 py-0.5 rounded text-[10px] font-bold text-text-muted">내부
                            코어</span>
                    </div>

                    <p className="text-sm text-text-muted mb-4 line-clamp-2">에이전트가 실시간 웹 검색 및 페이지 스크래핑을 수행할 수 있는 권한을 제공합니다.
                        (Tavily Search API 기반)</p>

                    <div className="bg-surface-alt p-3 rounded-xl border border-border relative">
                        <span className="absolute top-2 right-2 text-[10px] text-text-light font-bold">오픈 API 명세 (일부)</span>
                        <pre className="font-mono text-xs text-text-main overflow-hidden"><code>{
  "name": "search_web",
  "description": "Searches the web for recent info.",
  "parameters": {
    "type": "object",
    "properties": {
      "query": { "type": "string" }
    }
  }
}</code></pre>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-xs">
                    <span className="text-text-muted">허가된 직무 템플릿: <strong className="text-text-main">전체(All)</strong></span>
                    <button
                        className="text-text-muted hover:text-primary font-medium border border-border px-3 py-1.5 rounded-lg bg-surface hover:bg-background-alt transition-colors">인터페이스
                        수정</button>
                </div>
            </div>

            {/* Tool Item 2 */}
            <div className="card p-5 group flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-lg bg-background-alt border border-border text-text-main flex items-center justify-center">
                                <svg className="w-5 h-5 text-[#E34F26]" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4M12 11v10">
                                    </path>
                                </svg>
                            </div>
                            <div>
                                <h3
                                    className="font-bold text-text-main text-base group-hover:text-primary transition-colors">
                                    PostgreSQL 질의기</h3>
                                <p className="text-[10px] font-mono text-text-light mt-0.5">tool_sql_executor</p>
                            </div>
                        </div>
                        <span
                            className="bg-surface border border-border px-2 py-0.5 rounded text-[10px] font-bold text-text-muted">고객사
                            인프라 연동</span>
                    </div>

                    <p className="text-sm text-text-muted mb-4 line-clamp-2">고객사가 연동한 데이터베이스에 안전한 Read-Only SQL 쿼리를 실행하고 결과를
                        데이터프레임으로 변환합니다.</p>

                    <div className="bg-surface-alt p-3 rounded-xl border border-border relative">
                        <span className="absolute top-2 right-2 text-[10px] text-text-light font-bold">오픈 API 명세 (일부)</span>
                        <pre className="font-mono text-xs text-text-main overflow-hidden"><code>{
  "name": "execute_query",
  "description": "Runs a SQL SELECT query.",
  "parameters": {
    "type": "object",
    "properties": {
      "sql": { "type": "string" }
    }
  }
}</code></pre>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-xs">
                    <span className="text-text-muted">허가된 직무 템플릿: <strong className="text-primary font-bold">데이터 분석가,
                            CFO</strong></span>
                    <button
                        className="text-text-muted hover:text-primary font-medium border border-border px-3 py-1.5 rounded-lg bg-surface hover:bg-background-alt transition-colors">인터페이스
                        수정</button>
                </div>
            </div>

        </div>

    </main>
    </>
  );
}

export default AdminTools;
