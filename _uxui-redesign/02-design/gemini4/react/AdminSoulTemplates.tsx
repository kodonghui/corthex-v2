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

function AdminSoulTemplates() {
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
            <a href="/admin/soul-templates" className="nav-item active">
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
    {/* API: GET /api/admin/soul/templates */}
    <main className="flex-1 overflow-y-auto px-8 py-10 relative">
        <header className="mb-10 lg:flex lg:justify-between lg:items-end">
            <div>
                <h1 className="text-3xl font-serif text-text-main font-bold mb-2">에이전트 인격체 (Soul) 템플릿</h1>
                <p className="text-text-muted">에이전트의 성격, 어조(Tone & Manner), 응답 지침을 구성하는 시스템 프롬프트(System Prompt) 세트입니다.</p>
            </div>

            <div className="mt-4 lg:mt-0 flex gap-2">
                <button
                    className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl transition-colors font-medium shadow-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    새 Soul 작성
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
                <input type="text" placeholder="인격체 이름, 설명, 프롬프트 내용 검색..."
                    className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary-light transition-colors shadow-sm text-text-main" />
            </div>

            <div className="flex gap-2">
                <select
                    className="bg-surface border border-border text-text-main px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-primary-light shadow-sm min-w-[150px]">
                    <option value="">성격/유형 (Trait)</option>
                    <option value="analytical">논리적/분석적</option>
                    <option value="creative">창의적/직관적</option>
                    <option value="empathetic">공감형/지원적</option>
                </select>
                <select
                    className="bg-surface border border-border text-text-main px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-primary-light shadow-sm min-w-[130px]">
                    <option value="">적용 대상 모델</option>
                    <option value="gpt4">GPT-4 Turbo</option>
                    <option value="claude">Claude 3 Opus</option>
                </select>
            </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">

            {/* Soul Item 1 */}
            <div className="card p-0 flex flex-col group overflow-hidden hover:border-text-light transition-colors">
                <div className="p-5 border-b border-border bg-surface-alt flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl bg-surface border border-border text-text-main flex items-center justify-center font-bold font-serif text-lg shadow-sm">
                            분석</div>
                        <div>
                            <h3 className="font-bold text-text-main text-base group-hover:text-primary transition-colors">
                                냉철한 데이터 애널리스트 (v2.1)</h3>
                            <p className="text-[10px] font-mono text-text-light mt-0.5">soul_tmpl_analytical_strict</p>
                        </div>
                    </div>
                </div>

                <div className="p-5 flex-1 bg-surface space-y-4">
                    <p className="text-xs text-text-muted leading-relaxed">데이터 기반의 의사결정을 돕기 위해 감정을 배제하고 사실과 수치에만 입각하여 엄격하고
                        논리적인 답변을 생성합니다. 모호한 정보에 대해서는 확답을 피하고 근거 데이터를 요구합니다.</p>

                    <div className="bg-background border border-border rounded-lg p-3 relative">
                        <span className="absolute top-2 right-2 text-[10px] text-text-light font-bold">주요 System
                            Prompt</span>
                        <p className="text-[11px] font-mono text-text-main leading-relaxed mt-4">
                            "You are a strict data analyst. Always prioritize quantitative data over qualitative
                            opinions. Do not use filler words or empathetic language like 'I understand' or 'That must
                            be hard'. Use bullet points for structural clarity. If data is insufficient, state exactly
                            what is missing."
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span
                            className="bg-surface-alt px-2 py-0.5 rounded border border-border text-[10px] text-text-muted font-bold">권장
                            모델: Claude 3.5 Sonnet</span>
                        <span
                            className="bg-surface-alt px-2 py-0.5 rounded border border-border text-[10px] text-text-muted font-bold">Temperature:
                            0.1</span>
                    </div>
                </div>
                <div className="p-3 border-t border-border bg-background-alt flex justify-end">
                    <button
                        className="text-text-muted hover:text-primary text-xs font-medium px-3 py-1.5 transition-colors bg-surface border border-border rounded shadow-sm hover:shadow">프롬프트
                        수정</button>
                </div>
            </div>

            {/* Soul Item 2 */}
            <div className="card p-0 flex flex-col group overflow-hidden hover:border-text-light transition-colors">
                <div className="p-5 border-b border-border bg-surface-alt flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold font-serif text-lg shadow-sm">
                            공감</div>
                        <div>
                            <h3 className="font-bold text-text-main text-base group-hover:text-primary transition-colors">
                                따뜻한 HR 서포터 (v1.5)</h3>
                            <p className="text-[10px] font-mono text-text-light mt-0.5">soul_tmpl_empathetic_hr</p>
                        </div>
                    </div>
                </div>

                <div className="p-5 flex-1 bg-surface space-y-4">
                    <p className="text-xs text-text-muted leading-relaxed">직원들의 고충에 깊이 공감하고 심리적 안정감을 주는 어조를 사용합니다. 규정을 안내할
                        때도 명령조를 피하고 부드럽고 긍정적인 언어를 선택합니다.</p>

                    <div className="bg-background border border-border rounded-lg p-3 relative">
                        <span className="absolute top-2 right-2 text-[10px] text-text-light font-bold">주요 System
                            Prompt</span>
                        <p className="text-[11px] font-mono text-text-main leading-relaxed mt-4">
                            "You are an empathetic HR partner. Always start by acknowledging the user's feelings and
                            situation. Use warm, reassuring, and inclusive language. When explaining company policies,
                            phrase them as 'guidelines meant to support our team' rather than 'strict rules'."
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span
                            className="bg-surface-alt px-2 py-0.5 rounded border border-border text-[10px] text-text-muted font-bold">권장
                            모델: GPT-4o</span>
                        <span
                            className="bg-surface-alt px-2 py-0.5 rounded border border-border text-[10px] text-text-muted font-bold">Temperature:
                            0.6</span>
                    </div>
                </div>
                <div className="p-3 border-t border-border bg-background-alt flex justify-end">
                    <button
                        className="text-text-muted hover:text-primary text-xs font-medium px-3 py-1.5 transition-colors bg-surface border border-border rounded shadow-sm hover:shadow">프롬프트
                        수정</button>
                </div>
            </div>

        </div>

    </main>
    </>
  );
}

export default AdminSoulTemplates;
