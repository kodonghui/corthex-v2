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

function AdminOrgTemplates() {
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
            <p className="px-4 text-[10px] font-bold text-text-light uppercase tracking-widest mb-2">조직 및 권한</p>
            <a href="/admin/org-chart" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10">
                    </path>
                </svg>
                전체 조직도
            </a>
            <a href="/admin/org-templates" className="nav-item active">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z">
                    </path>
                </svg>
                조직 템플릿
            </a>
            <a href="/admin/report-lines" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
                    </path>
                </svg>
                결재선/보고체계
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
    {/* API: GET /api/admin/org/templates */}
    <main className="flex-1 overflow-y-auto px-8 py-10 relative">
        <header className="mb-10 lg:flex lg:justify-between lg:items-end">
            <div>
                <h1 className="text-3xl font-serif text-text-main font-bold mb-2">프리셋 조직 템플릿 관리</h1>
                <p className="text-text-muted">특정 산업군이나 목적에 맞게 사전 정의된 부서 구조와 에이전트 구성을 관리합니다.</p>
            </div>

            <div className="mt-4 lg:mt-0 flex gap-2">
                <button
                    className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl transition-colors font-medium shadow-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    새 템플릿 생성
                </button>
            </div>
        </header>

        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">

            {/* Template 1 */}
            <div
                className="card p-0 flex flex-col group overflow-hidden border border-border hover:border-primary transition-colors cursor-pointer">
                <div className="p-6 pb-0 mb-4">
                    <div className="flex justify-between items-start mb-4">
                        <div
                            className="w-12 h-12 rounded-xl bg-background-alt flex items-center justify-center text-xl shadow-sm border border-border">
                            🚀</div>
                        <span
                            className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded text-[10px] font-bold">인기
                            (Most Used)</span>
                    </div>
                    <h3 className="font-bold text-lg text-text-main font-serif">IT 스타트업 패키지</h3>
                    <p className="text-xs text-text-muted mt-2 line-clamp-2">개발, 기획, 마케팅, 인사 등 초기 스타트업 운영에 필요한 핵심 부서와 실무
                        에이전트가 포함된 풀 스택 조직 구조입니다.</p>
                </div>

                <div className="px-6 py-4 bg-background-alt border-y border-border">
                    <div className="flex justify-between items-center text-xs mb-2">
                        <span className="font-bold text-text-main">포함된 부서 (4)</span>
                        <span className="text-text-muted">에이전트 총 12명</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <span
                            className="bg-surface border border-border px-2 py-1 rounded text-[10px] text-text-main shadow-sm">제품
                            개발 본부</span>
                        <span
                            className="bg-surface border border-border px-2 py-1 rounded text-[10px] text-text-main shadow-sm">그로스
                            마케팅팀</span>
                        <span
                            className="bg-surface border border-border px-2 py-1 rounded text-[10px] text-text-main shadow-sm">피플팀
                            (HR)</span>
                        <span
                            className="bg-surface border border-border px-2 py-1 rounded text-[10px] text-text-main shadow-sm">재무기획팀</span>
                    </div>
                </div>

                <div className="p-4 flex justify-between items-center bg-surface mt-auto">
                    <span className="text-[10px] text-text-muted">업데이트: 2일 전</span>
                    <button className="text-xs font-bold text-primary hover:underline">상세 구조 보기</button>
                </div>
            </div>

            {/* Template 2 */}
            <div
                className="card p-0 flex flex-col group overflow-hidden border border-border hover:border-primary transition-colors cursor-pointer">
                <div className="p-6 pb-0 mb-4">
                    <div className="flex justify-between items-start mb-4">
                        <div
                            className="w-12 h-12 rounded-xl bg-background-alt flex items-center justify-center text-xl shadow-sm border border-border">
                            ⚖️</div>
                        <span
                            className="bg-surface border border-border px-2 py-0.5 rounded text-[10px] font-bold text-text-muted">전문직군</span>
                    </div>
                    <h3 className="font-bold text-lg text-text-main font-serif">법무/컴플라이언스 특화</h3>
                    <p className="text-xs text-text-muted mt-2 line-clamp-2">계약서 검토, 법률 리서치, 그리고 사내 규정 준수를 모니터링하는 전문 지식 기반의
                        에이전트들로 구성됩니다.</p>
                </div>

                <div className="px-6 py-4 bg-background-alt border-y border-border">
                    <div className="flex justify-between items-center text-xs mb-2">
                        <span className="font-bold text-text-main">포함된 부서 (2)</span>
                        <span className="text-text-muted">에이전트 총 5명</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <span
                            className="bg-surface border border-border px-2 py-1 rounded text-[10px] text-text-main shadow-sm">사내
                            법무팀</span>
                        <span
                            className="bg-surface border border-border px-2 py-1 rounded text-[10px] text-text-main shadow-sm">Audit
                            & Compliance</span>
                    </div>
                </div>

                <div className="p-4 flex justify-between items-center bg-surface mt-auto">
                    <span className="text-[10px] text-text-muted">업데이트: 2주 전</span>
                    <button className="text-xs font-bold text-primary hover:underline">상세 구조 보기</button>
                </div>
            </div>

            {/* Template 3 */}
            <div
                className="card p-0 flex flex-col group overflow-hidden border border-border hover:border-primary transition-colors cursor-pointer border-dashed bg-background-alt justify-center items-center h-[350px]">
                <div
                    className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center shadow-sm mb-4">
                    <svg className="w-6 h-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                </div>
                <h3 className="font-bold text-base text-text-main mb-1">커스텀 템플릿 만들기</h3>
                <p className="text-xs text-text-muted text-center px-6">JSON 설계서를 업로드하거나 시각적 빌더를 사용하여<br />새로운 조직 구조를 설계합니다.
                </p>
            </div>

        </div>

    </main>
    </>
  );
}

export default AdminOrgTemplates;
