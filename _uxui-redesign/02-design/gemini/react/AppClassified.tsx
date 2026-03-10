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

        .secret-item {
            background-color: white;
            border-radius: 1rem;
            border: 1px solid #f5f3ec;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
            transition: all 0.2s ease;
        }

        .secret-item:hover {
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
            border-color: #e8e4d9;
        }

        .blur-reveal {
            filter: blur(8px);
            opacity: 0.6;
            user-select: none;
            transition: all 0.3s ease;
        }

        .blur-reveal:hover {
            filter: blur(0px);
            opacity: 1;
        }

        /* Modal Overlay Background */
        .modal-bg {
            backdrop-filter: blur(12px);
            background-color: rgba(252, 251, 249, 0.85);
        }
`;

function AppClassified() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Primary Sidebar */}
    <aside
        className="w-64 flex flex-col justify-between py-8 px-4 border-r border-base-200 bg-white/80 backdrop-blur-md z-20 shrink-0">
        <div>
            <div className="flex items-center gap-3 px-4 mb-10">
                <div
                    className="w-8 h-8 rounded-full bg-accent-terracotta flex items-center justify-center text-white font-bold text-lg">
                    C</div>
                <span className="text-xl font-bold tracking-tight text-text-main">CORTHEX</span>
            </div>
            <nav className="space-y-2">
                <a href="#"
                    className="sidebar-item flex items-center gap-3 px-4 py-3 text-text-muted hover:bg-base-100 rounded-2xl transition-colors">
                    <i className="ph ph-squares-four text-xl"></i> 홈
                </a>
                <a href="#"
                    className="sidebar-item flex items-center gap-3 px-4 py-3 text-text-muted hover:bg-base-100 rounded-2xl transition-colors">
                    <i className="ph ph-terminal-window text-xl"></i> 사령관실
                </a>

                <div className="pt-4 pb-2 px-4 text-xs font-bold text-base-300 uppercase tracking-wider">안전 및 자산</div>
                <a href="#"
                    className="sidebar-item flex items-center gap-3 px-4 py-3 text-text-muted hover:bg-base-100 rounded-2xl transition-colors">
                    <i className="ph ph-coins text-xl"></i> 예산/비용 관리
                </a>
                {/* Active menu */}
                <a href="#"
                    className="sidebar-item active flex items-center justify-between px-4 py-3 font-medium text-accent-terracotta bg-base-100 rounded-2xl transition-colors">
                    <div className="flex items-center gap-3">
                        <i className="ph ph-shield-check text-xl"></i> 보안 기밀 (Classified)
                    </div>
                </a>
            </nav>
        </div>
        <div>
            <nav className="space-y-2">
                <div className="mt-4 px-4 py-3 flex items-center gap-3 border-t border-base-200">
                    <img src="https://i.pravatar.cc/100?img=11" alt="Profile"
                        className="w-10 h-10 rounded-full border border-base-300" />
                    <div>
                        <p className="text-sm font-semibold text-text-main">김대표</p>
                        <p className="text-xs text-text-muted">CEO</p>
                    </div>
                </div>
            </nav>
        </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 overflow-y-auto px-10 py-8 relative bg-[#fcfbf9]/50 hide-scrollbar">

        <header
            className="flex justify-between items-end mb-8 sticky top-0 bg-[#fcfbf9]/80 backdrop-blur-md z-10 pt-2 pb-4 border-b border-base-200/50">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <span
                        className="px-2 py-0.5 bg-text-main text-white text-[10px] font-bold rounded uppercase tracking-wider h-fit"><i
                            className="ph ph-lock-key"></i> Clearance Level: Top Secret</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-text-main">보안 기밀 금고</h1>
                <p
                    className="text-text-muted mt-1 text-sm bg-accent-amber/10 text-accent-amber px-3 py-1.5 rounded-lg inline-flex items-center gap-2 font-medium mt-3 border border-accent-amber/20">
                    <i className="ph ph-warning-circle"></i> 주의: 이 영역의 데이터는 에이전트의 RAG 검색 및 학습에서 강제로 제외됩니다.
                </p>
            </div>

            <div className="flex items-center gap-3">
                <button
                    className="bg-text-main text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-soft hover:bg-opacity-90 transition-all flex items-center gap-2">
                    <i className="ph ph-plus text-lg"></i> 새 기밀 등록
                </button>
            </div>
        </header>

        {/* Search & Filter */}
        <div className="mb-8 flex gap-4">
            <div className="relative w-full max-w-md">
                <i className="ph ph-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"></i>
                <input type="text" placeholder="기밀 제목 검색..."
                    className="w-full bg-white border border-base-200 outline-none text-sm pl-10 pr-4 py-3 rounded-xl text-text-main placeholder:text-base-300 shadow-sm focus:border-accent-terracotta/50 transition-colors" />
            </div>
            <select
                className="bg-white border border-base-200 px-4 py-3 rounded-xl text-text-main text-sm font-bold shadow-sm outline-none cursor-pointer">
                <option>모든 유형</option>
                <option>Environment Variables</option>
                <option>기밀 문서 (PDF)</option>
                <option>접근 권한 키</option>
            </select>
        </div>

        {/* Secrets List (API: GET /api/workspace/classified) */}
        <div className="space-y-4 pb-20 max-w-5xl">

            {/* Secret Item: Env Var */}
            <div className="secret-item p-4 flex items-center justify-between group">
                <div className="flex items-center gap-4 flex-1">
                    <div
                        className="w-10 h-10 rounded-lg bg-base-100 flex items-center justify-center text-text-muted text-xl shrink-0">
                        <i className="ph ph-brackets-curly"></i></div>
                    <div>
                        <h3 className="font-bold text-text-main text-sm mb-0.5 flex items-center gap-2">DB_PRODUCTION_URL
                            <span
                                className="px-1.5 py-0.5 bg-accent-blue/10 text-accent-blue text-[9px] font-bold rounded uppercase">Env
                                Var</span></h3>
                        <p className="text-xs text-text-muted">메인 프로덕션 데이터베이스 연결 문자열</p>
                    </div>
                </div>

                <div className="flex-1 px-4 flex justify-center">
                    {/* Blurred Content */}
                    <div
                        className="font-mono text-sm font-medium text-text-main blur-reveal cursor-pointer bg-base-50 px-3 py-1.5 rounded-lg border border-base-200 relative">
                        <span
                            className="opacity-0 group-hover:opacity-100 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold text-text-muted uppercase tracking-wider bg-white/90 px-2 py-0.5 rounded shadow-sm z-10 w-max pointer-events-none">마우스
                            오버하여 표시</span>
                        postgresql://admin:hunter2@prod-db.internal:5432/corthex_main
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <button
                        className="w-8 h-8 rounded bg-white border border-base-200 flex items-center justify-center text-text-muted hover:text-text-main shadow-sm"
                        title="복사"><i className="ph ph-copy"></i></button>
                    <button
                        className="w-8 h-8 rounded bg-white border border-base-200 flex items-center justify-center text-text-muted hover:text-text-main shadow-sm"
                        title="수정"><i className="ph ph-pencil-simple"></i></button>
                    <button
                        className="w-8 h-8 rounded bg-white border border-base-200 flex items-center justify-center text-text-muted hover:text-accent-coral shadow-sm"
                        title="삭제"><i className="ph ph-trash"></i></button>
                </div>
            </div>

            {/* Secret Item: Document */}
            <div className="secret-item p-4 flex items-center justify-between group">
                <div className="flex items-center gap-4 flex-1">
                    <div
                        className="w-10 h-10 rounded-lg bg-accent-coral/10 flex items-center justify-center text-accent-coral text-xl shrink-0">
                        <i className="ph ph-file-pdf"></i></div>
                    <div>
                        <h3 className="font-bold text-text-main text-sm mb-0.5 flex items-center gap-2">
                            2026_인수합병_대상기업_목록.pdf <span
                                className="px-1.5 py-0.5 bg-accent-coral/10 text-accent-coral text-[9px] font-bold rounded uppercase"><i
                                    className="ph ph-eye-slash mr-0.5"></i> 절대 기밀문서</span></h3>
                        <p className="text-xs text-text-muted">전략기획실 외 열람 불가</p>
                    </div>
                </div>

                <div className="flex-1 px-4 flex justify-center">
                    <div className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                        <i className="ph ph-lock-key"></i> 잠금 해제 필요
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <button
                        className="px-4 py-1.5 rounded-lg bg-text-main text-white text-xs font-bold shadow-sm hover:bg-opacity-90 transition-colors flex items-center gap-1.5"
                        onClick="document.getElementById('auth-modal').classList.remove('hidden')"><i
                            className="ph ph-fingerprint"></i> 열람</button>
                    <button
                        className="w-8 h-8 rounded bg-white border border-base-200 flex items-center justify-center text-text-muted hover:text-text-main shadow-sm"
                        title="수정"><i className="ph ph-pencil-simple"></i></button>
                </div>
            </div>

            {/* Secret Item: API Key */}
            <div className="secret-item p-4 flex items-center justify-between group">
                <div className="flex items-center gap-4 flex-1">
                    <div
                        className="w-10 h-10 rounded-lg bg-base-100 flex items-center justify-center text-text-muted text-xl shrink-0">
                        <i className="ph ph-key"></i></div>
                    <div>
                        <h3 className="font-bold text-text-main text-sm mb-0.5 flex items-center gap-2">STRIPE_SECRET_KEY
                            <span
                                className="px-1.5 py-0.5 bg-accent-amber/10 text-accent-amber text-[9px] font-bold rounded uppercase">API
                                Key</span></h3>
                        <p className="text-xs text-text-muted">결제 시스템 프로덕션 연동 키</p>
                    </div>
                </div>

                <div className="flex-1 px-4 flex justify-center">
                    {/* Blurred Content */}
                    <div
                        className="font-mono text-sm font-medium text-text-main blur-reveal cursor-pointer bg-base-50 px-3 py-1.5 rounded-lg border border-base-200 relative">
                        sk_live_51Nxyz...98aBCd
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <button
                        className="w-8 h-8 rounded bg-white border border-base-200 flex items-center justify-center text-text-muted hover:text-text-main shadow-sm"
                        title="복사"><i className="ph ph-copy"></i></button>
                    <button
                        className="w-8 h-8 rounded bg-white border border-base-200 flex items-center justify-center text-text-muted hover:text-text-main shadow-sm"
                        title="수정"><i className="ph ph-pencil-simple"></i></button>
                    <button
                        className="w-8 h-8 rounded bg-white border border-base-200 flex items-center justify-center text-text-muted hover:text-accent-coral shadow-sm"
                        title="삭제"><i className="ph ph-trash"></i></button>
                </div>
            </div>

        </div>

    </main>

    {/* Biometric / 2FA Auth Modal Mockup */}
    <div id="auth-modal" className="fixed inset-0 z-50 modal-bg flex items-center justify-center hidden">
        <div
            className="bg-white rounded-[2rem] p-10 max-w-md w-full shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-base-200 flex flex-col items-center relative transform transition-all">

            <button
                className="absolute top-6 right-6 w-8 h-8 bg-base-50 rounded-full flex items-center justify-center text-text-muted hover:bg-base-100"
                onClick="document.getElementById('auth-modal').classList.add('hidden')">
                <i className="ph ph-x"></i>
            </button>

            <div
                className="w-20 h-20 bg-accent-coral/10 rounded-full text-accent-coral flex items-center justify-center text-4xl mb-6">
                <i className="ph ph-fingerprint"></i>
            </div>

            <h2 className="text-2xl font-bold text-text-main tracking-tight mb-2">본인 인증 필요</h2>
            <p className="text-sm text-text-muted text-center mb-8">'2026_인수합병_대상기업_목록.pdf'는 최고 등급 기밀 문서입니다. 기기에 등록된 생체 정보
                또는 2FA 키를 입력하세요.</p>

            <button
                className="w-full bg-text-main text-white py-4 rounded-xl font-bold shadow-soft hover:bg-opacity-90 transition-all text-base mb-4 flex items-center justify-center gap-2">
                생체 인식 센서 활성화 <span className="animate-pulse">..</span>
            </button>
            <button className="text-xs font-bold text-text-muted hover:text-text-main underline underline-offset-4">
                이메일 보안 코드 사용하기
            </button>
        </div>
    </div>
    </>
  );
}

export default AppClassified;
