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

        /* Toggle Switch Styles */
        .toggle-checkbox:checked {
            right: 0;
            border-color: inherit /* FIXME: theme value not in map */;
        }

        .toggle-checkbox:checked+.toggle-label {
            background-color: inherit /* FIXME: theme value not in map */;
        }
`;

function AdminSettings() {
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

            <p className="px-4 text-[10px] font-bold text-text-light uppercase tracking-widest mt-6 mb-2">운영 및 시스템</p>
            <a href="/admin/settings" className="nav-item active">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z">
                    </path>
                </svg>
                플랫폼 기본 설정
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
    {/* API: GET /api/admin/settings */}
    {/* API: PUT /api/admin/settings */}
    <main className="flex-1 overflow-y-auto px-8 py-10 relative">
        <header className="mb-10 lg:flex lg:justify-between lg:items-end border-b border-border pb-6">
            <div>
                <h1 className="text-3xl font-serif text-text-main font-bold mb-2">플랫폼 기본 설정</h1>
                <p className="text-text-muted">CORTHEX 서비스 전체에 적용되는 글로벌 파라미터 및 주요 정책을 설정합니다.</p>
            </div>

            <div className="mt-4 lg:mt-0 flex gap-2">
                <button
                    className="bg-surface border border-border text-text-main px-6 py-2 rounded-xl transition-colors font-medium shadow-sm hover:bg-background-alt">취소</button>
                <button
                    className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-xl transition-colors font-medium shadow-sm">변경사항
                    저장</button>
            </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl">
            {/* Left Summary/Nav for Settings */}
            <div className="col-span-1 space-y-2">
                <a href="/app/#general"
                    className="block p-3 rounded-lg bg-background-alt border border-border font-bold text-text-main shadow-sm">일반
                    및 로고 설정</a>
                <a href="/app/#llm"
                    className="block p-3 rounded-lg text-text-muted hover:bg-surface hover:text-text-main transition-colors">LLM
                    엔진 라우팅</a>
                <a href="/app/#security"
                    className="block p-3 rounded-lg text-text-muted hover:bg-surface hover:text-text-main transition-colors">보안
                    정책 (MFA, SSO)</a>
                <a href="/app/#mail"
                    className="block p-3 rounded-lg text-text-muted hover:bg-surface hover:text-text-main transition-colors">메일/알림서버
                    연동</a>
            </div>

            {/* Settings Forms */}
            <div className="col-span-2 space-y-10">

                {/* General Settings */}
                <section id="general" className="card p-8">
                    <h2 className="text-lg font-serif font-bold text-text-main mb-6 border-b border-border pb-3">일반 설정</h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-text-main mb-2">플랫폼 이름</label>
                            <input type="text" value="CORTHEX v2"
                                className="w-full bg-background-alt border border-border px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-primary-light transition-colors text-text-main" />
                            <p className="text-[10px] text-text-muted mt-1.5">시스템 이메일 및 글로벌 알림에 사용되는 식별 이름입니다.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-text-main mb-2">지원 이메일 (Contact Email)</label>
                            <input type="email" value="support@corthex.ai"
                                className="w-full bg-background-alt border border-border px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-primary-light transition-colors text-text-main" />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-text-main mb-2">시스템 로그 보존 기간 (일)</label>
                            <select
                                className="w-full bg-background-alt border border-border px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-primary-light transition-colors text-text-main">
                                <option>30일 (기본)</option>
                                <option selected>90일</option>
                                <option>365일 (Enterprise 전용)</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* LLM Routing */}
                <section id="llm" className="card p-8">
                    <h2 className="text-lg font-serif font-bold text-text-main mb-6 border-b border-border pb-3">LLM 엔진 라우팅
                        (Default)</h2>

                    <div className="space-y-8">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-xs font-bold text-text-main">메인 텍스트 추론 엔진</label>
                            </div>
                            <select
                                className="w-full bg-background-alt border border-border px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-primary-light transition-colors text-text-main">
                                <option value="gpt-4o">OpenAI GPT-4o (권장)</option>
                                <option value="claude-3-5" selected>Anthropic Claude 3.5 Sonnet</option>
                                <option value="gemini-1.5">Google Gemini 1.5 Pro</option>
                            </select>
                            <p className="text-[10px] text-text-muted mt-1.5">에이전트가 특정 모델을 요구하지 않을 때 사용되는 전역 기본값입니다.</p>
                        </div>

                        <div>
                            <label className="flex justify-between items-center cursor-pointer group">
                                <div>
                                    <span className="block text-xs font-bold text-text-main">동적 비용 라우팅 (Dynamic Cost
                                        Routing)</span>
                                    <span className="block text-[10px] text-text-muted mt-1">간단한 프롬프트는 저비용 모델(GPT-4o-mini
                                        등)로 자동 포워딩하여 인프라 원가를 절감합니다.</span>
                                </div>
                                <div
                                    className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                    <input type="checkbox" name="toggle" id="toggle1" checked
                                        className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-surface border border-border appearance-none cursor-pointer z-10 transition-transform duration-200"
                                        style={{right: "0", transform: "translateX(0%)"}} />
                                    <label htmlFor="toggle1"
                                        className="toggle-label block overflow-hidden h-5 rounded-full bg-primary cursor-pointer transition-colors duration-200"></label>
                                </div>
                            </label>
                        </div>
                    </div>
                </section>

                {/* Security */}
                <section id="security" className="card p-8 border-red-500/10">
                    <h2 className="text-lg font-serif font-bold text-red-600 mb-6 border-b border-border pb-3">보안 정책
                        (Security)</h2>

                    <div className="space-y-6">
                        <div>
                            <label className="flex justify-between items-center cursor-pointer group">
                                <div>
                                    <span className="block text-xs font-bold text-text-main">신규 가입 개방 (Registration)</span>
                                    <span className="block text-[10px] text-text-muted mt-1">인바운드 초대 없이 일반 사용자의 자율적인
                                        회원가입/워크스페이스 생성을 허용합니다.</span>
                                </div>
                                <div
                                    className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                    <input type="checkbox" name="toggle" id="toggle2"
                                        className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-surface border border-border appearance-none cursor-pointer z-10 transition-transform duration-200"
                                        style={{left: "0", transform: "translateX(0%)"}} />
                                    <label htmlFor="toggle2"
                                        className="toggle-label block overflow-hidden h-5 rounded-full bg-background-alt border border-border cursor-pointer transition-colors duration-200"></label>
                                </div>
                            </label>
                        </div>
                        <div className="pt-4 border-t border-border">
                            <label className="flex justify-between items-center cursor-pointer group">
                                <div>
                                    <span className="block text-xs font-bold text-text-main">MFA (다중 인증) 전체 강제</span>
                                    <span className="block text-[10px] text-text-muted mt-1">모든 고객사의 관리자급 사용자 로긴에 MFA 인증을
                                        강제합니다.</span>
                                </div>
                                <div
                                    className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                    <input type="checkbox" name="toggle" id="toggle3"
                                        className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-surface border border-border appearance-none cursor-pointer z-10 transition-transform duration-200"
                                        style={{left: "0", transform: "translateX(0%)"}} />
                                    <label htmlFor="toggle3"
                                        className="toggle-label block overflow-hidden h-5 rounded-full bg-background-alt border border-border cursor-pointer transition-colors duration-200"></label>
                                </div>
                            </label>
                        </div>
                    </div>
                </section>

            </div>
        </div>

    </main>
    </>
  );
}

export default AdminSettings;
