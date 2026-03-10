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

function AdminApiKeys() {
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
            <p className="px-4 text-[10px] font-bold text-text-light uppercase tracking-widest mb-2">보안 & 권한</p>
            <a href="/admin/credentials" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z">
                    </path>
                </svg>
                글로벌 인가/자격 증명
            </a>
            <a href="/admin/api-keys" className="nav-item active">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                마스터 API 키 관리
            </a>

            <p className="px-4 text-[10px] font-bold text-text-light uppercase tracking-widest mt-6 mb-2">프롬프트 & 영혼(Soul)
            </p>
            <a href="/admin/soul-templates" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z">
                    </path>
                </svg>
                에이전트 인격체(Soul)
            </a>
            <a href="/admin/tools" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z">
                    </path>
                </svg>
                연동 도구(Tools) 관리
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
    {/* API: GET /api/admin/keys/master */}
    <main className="flex-1 overflow-y-auto px-8 py-10 relative">
        <header className="mb-10 lg:flex lg:justify-between lg:items-end border-b border-border pb-6">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-serif text-text-main font-bold">마스터 플랫폼 API 키 관리</h1>
                    <span
                        className="bg-red-500/10 text-red-600 border border-red-500/30 px-2 py-0.5 rounded text-[10px] font-bold">TOP
                        SECRET </span>
                </div>
                <p className="text-text-muted">CORTHEX v2 플랫폼 자체의 외부 시스템 연동 및 백엔드 서비스 투 서비스 통신에 사용되는 최고 권한 API 키입니다.</p>
            </div>

            <div className="mt-4 lg:mt-0">
                <button
                    className="bg-surface border border-border text-text-main px-4 py-2 rounded-xl transition-colors font-medium shadow-sm flex items-center gap-2 text-xs hover:bg-background-alt">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    새 마스터 키 발급
                </button>
            </div>
        </header>

        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 mb-8 flex gap-3 items-start">
            <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z">
                </path>
            </svg>
            <div>
                <h4 className="font-bold text-red-600 text-sm mb-1">경고: 마스터 키 노출 주의</h4>
                <p className="text-xs text-red-500/80">여기에 나열된 API 키는 고객사 격리(Tenant Isolation)를 우회하여 전체 시스템에 접근할 수 있는 권한을 가질
                    수 있습니다. 절대 클라이언트 사이트 코드에 하드코딩하지 마십시오.</p>
            </div>
        </div>

        <div className="card overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr
                        className="bg-background-alt border-b border-border text-[10px] font-bold text-text-muted uppercase tracking-wider">
                        <th className="p-4">키 이름 / 용도</th>
                        <th className="p-4">Secret (Masked)</th>
                        <th className="p-4">권한 범위 (Scopes)</th>
                        <th className="p-4">최근 사용</th>
                        <th className="p-4 text-right">관리</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                    <tr className="hover:bg-background-alt/50 transition-colors">
                        <td className="p-4">
                            <div className="font-bold text-text-main">Billing Analytics Sync</div>
                            <p className="text-[10px] text-text-muted mt-1">Stripe 결제 데이터 주기적 동기화 배치</p>
                        </td>
                        <td className="p-4">
                            <div className="flex items-center gap-2">
                                <span
                                    className="font-mono text-xs bg-background-alt px-2 py-1 rounded border border-border">cpx_mas_82jdas...(redacted)</span>
                                <button className="text-text-light hover:text-primary transition-colors" title="Copy">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z">
                                        </path>
                                    </svg>
                                </button>
                            </div>
                        </td>
                        <td className="p-4">
                            <span
                                className="bg-surface-alt px-2 py-0.5 rounded border border-border text-[10px] font-mono text-text-main">billing:read</span>
                        </td>
                        <td className="p-4 text-xs text-text-muted">10분 전</td>
                        <td className="p-4 text-right">
                            <button
                                className="text-red-500 hover:text-red-700 transition-colors text-xs font-medium border border-red-500/20 px-2 py-1 rounded hover:bg-red-50">Revoke</button>
                        </td>
                    </tr>
                    <tr className="hover:bg-background-alt/50 transition-colors">
                        <td className="p-4">
                            <div className="font-bold text-text-main">Global Search Indexer</div>
                            <p className="text-[10px] text-text-muted mt-1">Vector DB 주기적 청크 업데이트 프로세스</p>
                        </td>
                        <td className="p-4">
                            <div className="flex items-center gap-2">
                                <span
                                    className="font-mono text-xs bg-background-alt px-2 py-1 rounded border border-border">cpx_mas_93knv1...(redacted)</span>
                                <button className="text-text-light hover:text-primary transition-colors" title="Copy">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z">
                                        </path>
                                    </svg>
                                </button>
                            </div>
                        </td>
                        <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                                <span
                                    className="bg-surface-alt px-2 py-0.5 rounded border border-border text-[10px] font-mono text-text-main">kb:read</span>
                                <span
                                    className="bg-surface-alt px-2 py-0.5 rounded border border-border text-[10px] font-mono text-text-main">kb:write</span>
                            </div>
                        </td>
                        <td className="p-4 text-xs text-text-muted">1시간 전</td>
                        <td className="p-4 text-right">
                            <button
                                className="text-red-500 hover:text-red-700 transition-colors text-xs font-medium border border-red-500/20 px-2 py-1 rounded hover:bg-red-50">Revoke</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

    </main>
    </>
  );
}

export default AdminApiKeys;
