"use client";
import React from "react";

const styles = `
body {
            background-color: #f5f3ec;
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

        .panel {
            background-color: white;
            border-radius: 1.5rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
            border: 1px solid #e8e4d9;
        }

        .toggle-checkbox:checked {
            right: 0;
            border-color: #e07a5f;
        }

        .toggle-checkbox:checked+.toggle-label {
            background-color: #e07a5f;
        }
`;

function AdminSettings() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Admin Sidebar */}
    <aside className="w-72 flex flex-col justify-between py-8 px-6 border-r border-[#e8e4d9] bg-[#fcfbf9] z-20 shrink-0">
        <div>
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                    <div
                        className="w-8 h-8 rounded-full bg-text-main flex items-center justify-center text-white font-bold text-lg">
                        A</div>
                    <span className="text-xl font-bold tracking-tight text-text-main">Admin Console</span>
                </div>
            </div>

            <nav className="space-y-1.5">
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-gauge text-lg"></i> Global Dashboard
                </a>

                <div className="pt-6 pb-2 px-4 text-[11px] font-bold text-base-300 uppercase tracking-wider">환경설정 및 연동</div>
                {/* Active menu */}
                <a href="#"
                    className="flex items-center gap-3 px-4 py-3 font-medium text-accent-terracotta bg-white rounded-xl border border-[#e8e4d9] shadow-sm transition-colors">
                    <i className="ph ph-gear text-lg"></i> Platform Settings
                </a>
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-shield-check text-lg"></i> Global Policies
                </a>
            </nav>
        </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 overflow-y-auto px-12 py-10 relative hide-scrollbar">

        <header
            className="flex justify-between items-end mb-8 sticky top-0 bg-[#f5f3ec]/90 backdrop-blur-md z-10 pt-2 pb-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-text-main">Platform Settings</h1>
                <p className="text-text-muted mt-2 text-sm">CORTHEX 서비스 전체의 동작 방식, 글로벌 메타데이터 및 제한 사항을 구성합니다.</p>
            </div>

            <div className="flex items-center gap-3">
                <button
                    className="bg-text-main text-white px-5 py-2.5 flex items-center gap-2 rounded-xl text-sm font-bold shadow-soft hover:bg-opacity-90 transition-colors">
                    <i className="ph ph-floppy-disk text-lg"></i> Save Settings
                </button>
            </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Settings Navigation */}
            <div className="lg:col-span-1">
                <div className="panel p-4 flex flex-col gap-1">
                    <button
                        className="w-full text-left px-4 py-3 rounded-xl bg-[#fff5f2] text-accent-terracotta font-bold text-sm shadow-sm transition-colors flex items-center gap-3">
                        <i className="ph ph-globe text-lg"></i> General & System
                    </button>
                    <button
                        className="w-full text-left px-4 py-3 rounded-xl text-text-muted hover:text-text-main hover:bg-base-50 font-medium text-sm transition-colors flex items-center gap-3">
                        <i className="ph ph-robot text-lg"></i> Agent Defaults
                    </button>
                    <button
                        className="w-full text-left px-4 py-3 rounded-xl text-text-muted hover:text-text-main hover:bg-base-50 font-medium text-sm transition-colors flex items-center gap-3">
                        <i className="ph ph-shield-warning text-lg"></i> Global Throttling
                    </button>
                    <button
                        className="w-full text-left px-4 py-3 rounded-xl text-text-muted hover:text-text-main hover:bg-base-50 font-medium text-sm transition-colors flex items-center gap-3">
                        <i className="ph ph-users text-lg"></i> Tenant Onboarding
                    </button>
                </div>
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-2 space-y-6">

                {/* General Identity */}
                <div className="panel p-6">
                    <h3 className="font-bold text-text-main text-lg mb-6 flex items-center gap-2"><i
                            className="ph ph-identification-card text-text-muted"></i> System Identity</h3>

                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label
                                    className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-wide">Platform
                                    Name</label>
                                <input type="text" value="CORTHEX AI"
                                    className="w-full border border-[#e8e4d9] rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-accent-terracotta/50" />
                            </div>
                            <div>
                                <label
                                    className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-wide">Version
                                    Release</label>
                                <input type="text" value="v2.1.0-beta"
                                    className="w-full border border-[#e8e4d9] rounded-lg px-4 py-2.5 text-sm bg-base-50 text-text-muted cursor-not-allowed"
                                    disabled />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-wide">System
                                Admin Contact Email</label>
                            <input type="email" value="sysadmin@corthex.ai"
                                className="w-full border border-[#e8e4d9] rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-accent-terracotta/50 font-mono" />
                            <p className="text-[10px] text-text-muted mt-1">테넌트들이 시스템 장애나 심각한 오류 발생 시 연락할 주소입니다. (발신 전용 제외)
                            </p>
                        </div>
                    </div>
                </div>

                {/* Feature Toggles */}
                <div className="panel p-6">
                    <h3 className="font-bold text-text-main text-lg mb-6 flex items-center gap-2"><i
                            className="ph ph-toggle-left text-text-muted"></i> Global Feature Toggles</h3>

                    <div className="space-y-4">

                        <div
                            className="flex items-center justify-between p-4 rounded-xl border border-[#e8e4d9] bg-[#fcfbf9]">
                            <div>
                                <h4 className="font-bold text-text-main text-sm mb-0.5">Enable Multi-Tenancy Engine</h4>
                                <p className="text-[10px] text-text-muted lg:w-[400px]">이 설정을 끄면 모든 고객사가 단일 데이터 공간(Legacy
                                    모드)을 사용하게 됩니다. 극히 주의해서 변경하세요.</p>
                            </div>
                            <div
                                className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                <input type="checkbox" name="toggle" id="toggle1"
                                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-[#d5cfc1]"
                                    checked disabled />
                                <label htmlFor="toggle1"
                                    className="toggle-label block overflow-hidden h-6 rounded-full bg-base-300 cursor-pointer"></label>
                            </div>
                        </div>

                        <div
                            className="flex items-center justify-between p-4 rounded-xl border border-[#e8e4d9] bg-[#fcfbf9]">
                            <div>
                                <h4 className="font-bold text-text-main text-sm mb-0.5">Allow Public Agent Market</h4>
                                <p className="text-[10px] text-text-muted lg:w-[400px]">고객사들이 자신이 커스텀한 에이전트 템플릿을 다른 고객사와 공유할
                                    수 있는 마켓 스페이스를 활성화합니다.</p>
                            </div>
                            <div
                                className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                <input type="checkbox" name="toggle" id="toggle2"
                                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-[#d5cfc1]"
                                    checked />
                                <label htmlFor="toggle2"
                                    className="toggle-label block overflow-hidden h-6 rounded-full bg-base-300 cursor-pointer"></label>
                            </div>
                        </div>

                        <div
                            className="flex items-center justify-between p-4 rounded-xl border border-accent-terracotta/20 bg-[#fff5f2]">
                            <div>
                                <h4 className="font-bold text-accent-terracotta text-sm mb-0.5 flex items-center gap-1.5"><i
                                        className="ph ph-warning"></i> Beta: Automated Trading Vector</h4>
                                <p className="text-[10px] text-text-muted lg:w-[400px]">투자 전략 부서의 KIS 실시간 매매 연동 기능을 전역적으로
                                    활성화합니다. 법적 책임 고지가 필요합니다.</p>
                            </div>
                            <div
                                className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                <input type="checkbox" name="toggle" id="toggle3"
                                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-[#d5cfc1]" />
                                <label htmlFor="toggle3"
                                    className="toggle-label block overflow-hidden h-6 rounded-full bg-base-300 cursor-pointer"></label>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Danger Zone */}
                <div className="panel p-6 border border-accent-coral/30">
                    <h3 className="font-bold text-accent-coral text-lg mb-2 flex items-center gap-2"><i
                            className="ph ph-skull"></i> Danger Zone</h3>
                    <p className="text-xs text-text-muted mb-6">시스템의 주요 데이터를 삭제하거나 서비스를 중단시키는 등 파괴적인 결과를 낳을 수 있는 작업입니다.</p>

                    <div
                        className="flex items-center justify-between p-4 rounded-xl bg-[#fdf5f5] border border-accent-coral/20">
                        <div>
                            <h4 className="font-bold text-text-main text-sm mb-1">Enter Maintenance Mode</h4>
                            <p className="text-[10px] text-text-muted">모든 테넌트의 접근이 차단되고 "점검 중" 페이지로 리다이렉션 됩니다.</p>
                        </div>
                        <button
                            className="bg-white border border-[#e8e4d9] text-text-main hover:bg-base-50 hover:text-accent-coral px-4 py-2 rounded-lg text-xs font-bold transition-colors">Activate</button>
                    </div>
                </div>

            </div>

        </div>

    </main>
    </>
  );
}

export default AdminSettings;
