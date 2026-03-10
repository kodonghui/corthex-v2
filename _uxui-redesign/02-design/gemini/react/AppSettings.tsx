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

        .toggle-checkbox:checked {
            right: 0;
            border-color: #68D391;
        }

        .toggle-checkbox:checked+.toggle-label {
            background-color: #68D391;
        }

        .toggle-checkbox:checked+.toggle-label:before {
            transform: translateX(100%);
        }

        .setting-card {
            background-color: white;
            border-radius: 1.5rem;
            border: 1px solid #f5f3ec;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
        }
`;

function AppSettings() {
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

                <div className="pt-4 pb-2 px-4 text-xs font-bold text-base-300 uppercase tracking-wider">시스템</div>
                <a href="#"
                    className="sidebar-item flex items-center gap-3 px-4 py-3 text-text-muted hover:bg-base-100 rounded-2xl transition-colors">
                    <i className="ph ph-bell text-xl"></i> 알림 센터
                </a>
                {/* Active menu */}
                <a href="#"
                    className="sidebar-item active flex items-center gap-3 px-4 py-3 font-medium text-accent-terracotta bg-base-100 rounded-2xl transition-colors">
                    <i className="ph ph-gear text-xl"></i> 설정
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

    {/* Settings Navigation (Local) */}
    <aside className="w-64 border-r border-base-200 bg-base-100/30 flex flex-col h-full z-10 shrink-0">
        <div className="p-8 pb-4 shrink-0">
            <h2 className="text-xl font-bold text-text-main mb-6">설정</h2>

            <nav className="space-y-1">
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-accent-terracotta bg-white rounded-xl shadow-sm border border-base-200"><i
                        className="ph ph-key text-lg"></i> API Key & 모델 연동</a>
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-text-muted hover:bg-base-50 rounded-xl transition-colors"><i
                        className="ph ph-buildings text-lg"></i> 워크스페이스 정보</a>
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-text-muted hover:bg-base-50 rounded-xl transition-colors"><i
                        className="ph ph-users text-lg"></i> 사용자 권한 관리</a>
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-text-muted hover:bg-base-50 rounded-xl transition-colors"><i
                        className="ph ph-plugs-connected text-lg"></i> 외부 서비스 연동</a>
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-text-muted hover:bg-base-50 rounded-xl transition-colors"><i
                        className="ph ph-credit-card text-lg"></i> 플랜 및 결제</a>
            </nav>

            <div className="mt-8 pt-6 border-t border-base-200">
                <h3 className="text-[11px] font-bold text-base-300 uppercase tracking-wider mb-2 px-4">개인 설정</h3>
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-text-muted hover:bg-base-50 rounded-xl transition-colors"><i
                        className="ph ph-user"></i> 내 프로필</a>
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-text-muted hover:bg-base-50 rounded-xl transition-colors"><i
                        className="ph ph-paint-brush"></i> 테마 및 화면</a>
            </div>
        </div>
    </aside>

    {/* Settings Detail Panel (API: GET /api/workspace/settings/providers) */}
    <main className="flex-1 overflow-y-auto px-12 py-10 bg-[#fcfbf9]/50 relative hide-scrollbar">

        <header className="mb-10 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight text-text-main">API Key & 모델 연동</h1>
            <p className="text-text-muted mt-2 text-sm">LLM 공급자의 API 키를 등록하고 에이전트들이 사용할 기본 모델을 구성합니다.</p>
        </header>

        <div className="max-w-4xl mx-auto space-y-8 pb-20">

            {/* Provider Card: OpenAI */}
            <div className="setting-card p-8">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-12 h-12 rounded-xl bg-[#10a37f]/10 text-[#10a37f] flex items-center justify-center text-2xl shrink-0">
                            <i className="ph ph-open-ai-logo"></i>
                        </div>
                        <div>
                            <h3 className="font-bold text-text-main text-lg">OpenAI</h3>
                            <p className="text-xs text-text-muted mt-0.5">GPT-4, GPT-4o, GPT-3.5-turbo 모델</p>
                        </div>
                    </div>

                    {/* Toggle */}
                    <div
                        className="relative inline-block w-12 h-6 align-middle select-none transition duration-200 ease-in">
                        <input type="checkbox" name="toggle" id="toggle-openai"
                            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-base-200 appearance-none cursor-pointer z-10 transition-transform duration-200 ease-in-out"
                            checked />
                        <label htmlFor="toggle-openai"
                            className="toggle-label block overflow-hidden h-6 rounded-full bg-base-200 cursor-pointer absolute inset-0 transition-colors duration-200 ease-in-out"></label>
                    </div>
                </div>

                {/* API: PUT /api/workspace/settings/providers/openai */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">API
                            Key</label>
                        <div className="relative">
                            <i className="ph ph-key absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"></i>
                            <input type="password" value="sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                className="w-full bg-base-50 border border-base-200 outline-none text-sm pl-10 pr-24 py-3 rounded-xl text-text-main focus:border-accent-terracotta/50 focus:bg-white transition-colors font-mono" />
                            <button
                                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-white border border-base-200 text-text-main text-xs font-bold rounded-lg hover:bg-base-50 transition-colors">변경</button>
                        </div>
                        <p className="text-[10px] text-text-muted mt-2 px-1"><i
                                className="ph ph-check-circle text-accent-green"></i> 2026.10.01 에 연결됨 (상태: 정상)</p>
                    </div>

                    <div className="pt-4 border-t border-base-100 grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">기본 모델
                                (Default)</label>
                            <select
                                className="w-full bg-white border border-base-200 outline-none text-sm px-4 py-3 rounded-xl text-text-main shadow-sm focus:border-accent-terracotta/50 transition-colors cursor-pointer">
                                <option>gpt-4o</option>
                                <option>gpt-4-turbo</option>
                                <option>gpt-3.5-turbo</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">임베딩 모델
                                (RAG용)</label>
                            <select
                                className="w-full bg-white border border-base-200 outline-none text-sm px-4 py-3 rounded-xl text-text-main shadow-sm focus:border-accent-terracotta/50 transition-colors cursor-pointer">
                                <option>text-embedding-3-large</option>
                                <option>text-embedding-3-small</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Provider Card: Anthropic */}
            <div className="setting-card p-8">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-12 h-12 rounded-xl bg-[#d97757]/10 text-[#d97757] flex items-center justify-center text-2xl shrink-0 font-serif font-bold italic">
                            a
                        </div>
                        <div>
                            <h3 className="font-bold text-text-main text-lg">Anthropic</h3>
                            <p className="text-xs text-text-muted mt-0.5">Claude 3.5 Sonnet, Opus 모델</p>
                        </div>
                    </div>

                    {/* Toggle */}
                    <div
                        className="relative inline-block w-12 h-6 align-middle select-none transition duration-200 ease-in">
                        <input type="checkbox" name="toggle" id="toggle-anthropic"
                            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-base-200 appearance-none cursor-pointer z-10 transition-transform duration-200 ease-in-out"
                            checked />
                        <label htmlFor="toggle-anthropic"
                            className="toggle-label block overflow-hidden h-6 rounded-full bg-base-200 cursor-pointer absolute inset-0 transition-colors duration-200 ease-in-out"></label>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">API
                            Key</label>
                        <div className="relative">
                            <i className="ph ph-key absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"></i>
                            <input type="password" value="sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                className="w-full bg-base-50 border border-base-200 outline-none text-sm pl-10 pr-24 py-3 rounded-xl text-text-main focus:border-accent-terracotta/50 focus:bg-white transition-colors font-mono" />
                            <button
                                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-white border border-base-200 text-text-main text-xs font-bold rounded-lg hover:bg-base-50 transition-colors">변경</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Provider Card: Local / Custom */}
            <div className="setting-card p-8 bg-[#fcfbf9]/50 border-dashed border-2">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-12 h-12 rounded-xl bg-base-100 text-text-muted flex items-center justify-center text-2xl shrink-0">
                            <i className="ph ph-plus"></i>
                        </div>
                        <div>
                            <h3 className="font-bold text-text-main text-base">커스텀 제공자 추가 (Ollama, vLLM)</h3>
                            <p className="text-xs text-text-muted mt-0.5">로컬 호스팅 LLM 엔드포인트 연결 (OpenAI 호환)</p>
                        </div>
                    </div>
                    <button
                        className="px-5 py-2.5 bg-text-main text-white font-bold text-sm rounded-xl hover:bg-opacity-90 transition-colors shadow-soft">추가</button>
                </div>
            </div>

            {/* Save Actions */}
            <div className="flex justify-end gap-3 pt-6">
                <button
                    className="px-6 py-3 bg-white border border-base-200 text-text-main font-bold rounded-xl hover:bg-base-50 transition-colors">취소</button>
                <button
                    className="px-6 py-3 bg-accent-terracotta text-white font-bold rounded-xl hover:bg-opacity-90 transition-colors shadow-soft-lg flex items-center gap-2"><i
                        className="ph ph-floppy-disk"></i> 변경사항 저장</button>
            </div>

        </div>

    </main>
    </>
  );
}

export default AppSettings;
