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

function AdminCredentials() {
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
            <p className="px-4 text-[10px] font-bold text-text-light uppercase tracking-widest mb-2">플랫폼 관리</p>
            <a href="/admin/dashboard" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6">
                    </path>
                </svg>
                전체 대시보드
            </a>
            <a href="/admin/agents" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10">
                    </path>
                </svg>
                글로벌 에이전트 목록
            </a>
            <a href="/admin/companies" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4">
                    </path>
                </svg>
                고객사(Workspace) 관리
            </a>

            <p className="px-4 text-[10px] font-bold text-text-light uppercase tracking-widest mt-6 mb-2">보안 & 권한</p>
            <a href="/admin/credentials" className="nav-item active">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z">
                    </path>
                </svg>
                글로벌 인가/자격 증명
            </a>
            <a href="/admin/api-keys" className="nav-item">
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

            <p className="px-4 text-[10px] font-bold text-text-light uppercase tracking-widest mt-6 mb-2">운영 및 시스템</p>
            <a href="/admin/monitoring" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
                    </path>
                </svg>
                이용량 모니터링
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
    {/* API: GET /api/admin/credentials/oauth */}
    <main className="flex-1 overflow-y-auto px-8 py-10 relative">
        <header className="mb-10 lg:flex lg:justify-between lg:items-end border-b border-border pb-6">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-serif text-text-main font-bold">글로벌 인가 및 자격 증명 (OAuth / Keys)</h1>
                    <span
                        className="bg-red-500/10 text-red-600 border border-red-500/30 px-2 py-0.5 rounded text-[10px] font-bold">RESTRICTED
                    </span>
                </div>
                <p className="text-text-muted">플랫폼 차원에서 관리되는 시스템 자격 증명 및 전역 OAuth 앱 연결 상태를 모니터링합니다.</p>
            </div>

            <div className="mt-4 lg:mt-0 flex gap-2">
                <button
                    className="bg-surface border border-border text-text-main px-4 py-2 rounded-xl hover:bg-background-alt transition-colors font-medium shadow-sm text-xs flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z">
                        </path>
                    </svg>
                    키 순환(Rotation) 정책
                </button>
            </div>
        </header>

        <div className="space-y-8">
            {/* OAuth Apps Section */}
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-text-main">전역 OAuth 애플리케이션</h2>
                    <button className="text-xs text-primary font-bold hover:underline">새 앱 등록</button>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Google Workspace */}
                    <div className="card p-5 group hover:border-primary transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center p-2 shadow-sm">
                                    <svg viewBox="0 0 24 24" className="w-full h-full">
                                        <path fill="#4285F4"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-text-main text-base">Google Workspace (전역)</h3>
                                    <p className="text-[10px] text-text-muted mt-0.5">고객사 Gmail, Calendar, Drive 연동 지원용 Base
                                        App</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 bg-primary/10 px-2 py-1 rounded">
                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                                <span className="text-[10px] text-text-main font-bold">운영 중</span>
                            </div>
                        </div>
                        <div className="bg-background-alt p-3 rounded-xl border border-border opacity-70 mb-4">
                            <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-1">CLIENT ID</p>
                            <p className="font-mono text-xs text-text-main truncate">
                                8123912903-k2smd8a2kj...(redacted).apps.googleusercontent.com</p>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-text-muted">연결된 워크스페이스: <strong
                                    className="text-text-main">845개</strong></span>
                            <button className="text-text-muted hover:text-primary font-medium">상세 설정</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Base LLM API Keys */}
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-text-main">Base 모델 프로바이더 API 키</h2>
                    <p className="text-xs text-secondary font-bold bg-secondary/10 px-2 py-1 rounded">요금 청구 기준 키</p>
                </div>

                <div className="card overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr
                                className="bg-background-alt border-b border-border text-[10px] font-bold text-text-muted uppercase tracking-wider">
                                <th className="p-4 font-bold">Provider / 모델 권한</th>
                                <th className="p-4 font-bold">API Key (Masked)</th>
                                <th className="p-4 font-bold">이번 달 사용량</th>
                                <th className="p-4 font-bold text-right">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-sm">
                            <tr className="hover:bg-background-alt/50 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-6 h-6 rounded bg-surface border border-border flex items-center justify-center shadow-sm">
                                            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                                                <path
                                                    d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.073zM13.2599 22.5002c-1.2215 0-2.35-.4945-3.1895-1.334l.0238-.0143 4.8808-2.8229a.833.833 0 0 0 .4088-.7078V10.825l3.242 1.871v5.7175A5.6315 5.6315 0 0 1 13.2599 22.5002zm-6.6853-2.0718A5.6363 5.6363 0 0 1 4.542 16.92V9.914l.0191.0143 4.8856 2.8277a.8236.8236 0 0 0 .8235 0l5.8821-3.3957v3.742l-3.2372 1.8662a5.6268 5.6268 0 0 1-6.3405-3.5358l-5.6429 3.2588 3.5358 6.3405a5.6315 5.6315 0 0 1-3.8967 1.3444zm14.621-3.5358a5.6315 5.6315 0 0 1-5.8821 2.3995l-.0143-.0238-2.8229-4.8808a.8236.8236 0 0 0-.7078-.4088H1.4998v-3.742l1.871 3.242a5.6268 5.6268 0 0 0 7.8763 2.0593l5.6429 3.2588-3.5358 6.3405A5.6315 5.6315 0 0 1 21.1956 16.8926h-.0191zm-7.9365-1.0776l-2.0315-1.1732v-2.3463l2.0315-1.1732 2.0315 1.1732v2.3463zm3.1752-1.8349l.0143.0238 2.8229 4.8808a.8236.8236 0 0 0 .7078.4088h6.299v3.742l-1.871-3.242a5.6268 5.6268 0 0 0-7.8763-2.0593l-5.6429-3.2588 3.5358-6.3405A5.6315 5.6315 0 0 1 16.4343 13.98zM8.5146 1.4998a5.6363 5.6363 0 0 1 7.1524 3.5358l-.0191-.0143-4.8856-2.8277a.8236.8236 0 0 0-.8235 0l-5.8821 3.3957v-3.742l3.2372-1.8662A5.6268 5.6268 0 0 1 8.5146 1.4998zm.667 11.6752L4.3008 10.352a.833.833 0 0 0-.4088.7078V17.85l-3.242-1.871v-5.7175A5.6315 5.6315 0 0 1 8.5146 1.4998C9.7361 1.4998 10.8646 1.9943 11.7042 2.8338l-.0238.0143-4.8808 2.8229a.833.833 0 0 0-.4088.7078v4.9142z" />
                                            </svg>
                                        </div>
                                        <span className="font-bold">OpenAI Base (Tier 5)</span>
                                    </div>
                                    <p className="text-[10px] text-text-muted mt-1">GPT-4 Turbo, GPT-3.5</p>
                                </td>
                                <td className="p-4">
                                    <span
                                        className="font-mono text-xs bg-background-alt px-2 py-1 rounded border border-border">sk-proj-r928...</span>
                                </td>
                                <td className="p-4">
                                    <p className="font-mono text-sm font-bold text-text-main">$14,240.50</p>
                                    <p className="text-[10px] text-text-muted mt-0.5">한도 $50,000</p>
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        className="text-text-muted hover:text-primary transition-colors text-xs font-medium border border-border px-2 py-1 rounded hover:bg-background-alt">교체</button>
                                </td>
                            </tr>
                            <tr className="hover:bg-background-alt/50 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-6 h-6 rounded bg-surface border border-border flex items-center justify-center shadow-sm font-serif font-bold text-[10px]">
                                            C</div>
                                        <span className="font-bold">Anthropic (Build Scale)</span>
                                    </div>
                                    <p className="text-[10px] text-text-muted mt-1">Claude 3 Opus, Sonnet</p>
                                </td>
                                <td className="p-4">
                                    <span
                                        className="font-mono text-xs bg-background-alt px-2 py-1 rounded border border-border">sk-ant-api03...</span>
                                </td>
                                <td className="p-4">
                                    <p className="font-mono text-sm font-bold text-text-main">$8,905.20</p>
                                    <p className="text-[10px] text-text-muted mt-0.5">한도 $20,000</p>
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        className="text-text-muted hover:text-primary transition-colors text-xs font-medium border border-border px-2 py-1 rounded hover:bg-background-alt">교체</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>

    </main>
    </>
  );
}

export default AdminCredentials;
