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

        textarea {
            resize: none;
        }
`;

function AdminSoulTemplates() {
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
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-shield-key text-lg"></i> Platform Credentials
                </a>
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-wrench text-lg"></i> Global Tools Reg
                </a>
                {/* Active menu */}
                <a href="#"
                    className="flex items-center gap-3 px-4 py-3 font-medium text-accent-terracotta bg-white rounded-xl border border-[#e8e4d9] shadow-sm transition-colors">
                    <i className="ph ph-user-focus text-lg"></i> Soul Templates
                </a>
            </nav>
        </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 overflow-hidden flex flex-col relative hide-scrollbar p-10">

        <header className="mb-8 flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-text-main">Soul Dictionary & Templates</h1>
                <p className="text-text-muted mt-2 text-sm">에이전트들이 생성될 때 기본적으로 부여되는 페르소나, 규칙, 메타-프롬프트(Soul)의 원본을 관리합니다.</p>
            </div>

            <div className="flex items-center gap-3">
                <button
                    className="bg-white border border-[#e8e4d9] text-text-main px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-base-50 transition-colors flex items-center gap-2">
                    <i className="ph ph-download-simple"></i> Export Yaml
                </button>
                <button
                    className="bg-text-main text-white px-5 py-2.5 flex items-center gap-2 rounded-xl text-sm font-bold shadow-soft hover:bg-opacity-90 transition-colors">
                    <i className="ph ph-floppy-disk text-lg"></i> Save Changes
                </button>
            </div>
        </header>

        <div className="flex gap-8 flex-1 overflow-hidden">

            {/* Left: Template List */}
            <div className="w-1/3 flex flex-col gap-4">
                <div className="relative w-full">
                    <i
                        className="ph ph-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm"></i>
                    <input type="text" placeholder="Search templates..."
                        className="w-full bg-white border border-[#e8e4d9] outline-none text-sm pl-10 pr-4 py-2.5 rounded-xl text-text-main placeholder:text-base-300 shadow-sm" />
                </div>

                <div className="flex-1 overflow-y-auto hide-scrollbar space-y-2 pr-2">

                    <div className="panel p-4 cursor-pointer border-accent-terracotta/50 shadow-sm bg-[#fff5f2]/30">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-text-main flex items-center gap-2"><i
                                    className="ph ph-robot text-accent-terracotta"></i> System Chief</h4>
                            <span
                                className="text-[10px] bg-accent-terracotta/10 text-accent-terracotta px-1.5 rounded font-mono font-bold">CORE</span>
                        </div>
                        <p className="text-xs text-text-muted">Orchestrator, Router, Quality Gate. 시스템 필수 에이전트.</p>
                    </div>

                    <div
                        className="panel p-4 cursor-pointer hover:border-text-main/30 border-transparent transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-text-main flex items-center gap-2"><i
                                    className="ph ph-chart-line-up text-accent-green"></i> CIO Strategy Mgr</h4>
                            <span
                                className="text-[10px] bg-base-200 text-text-muted px-1.5 rounded font-mono font-bold">MGR</span>
                        </div>
                        <p className="text-xs text-text-muted">최고 투자 책임자. 하위 분석가들의 데이터를 종합합니다.</p>
                    </div>

                    <div
                        className="panel p-4 cursor-pointer hover:border-text-main/30 border-transparent transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-text-main flex items-center gap-2"><i
                                    className="ph ph-text-t text-accent-blue"></i> Copywriter Agent</h4>
                            <span
                                className="text-[10px] bg-base-200 text-text-muted px-1.5 rounded font-mono font-bold">SPEC</span>
                        </div>
                        <p className="text-xs text-text-muted">웹/소셜 미디어 콘텐츠 및 카피라이팅 전문가 프롬프트.</p>
                    </div>

                    <div
                        className="panel p-4 cursor-pointer hover:border-text-main/30 border-transparent transition-colors border-dashed border-[#d5cfc1] bg-transparent flex items-center justify-center min-h-[100px]">
                        <span className="text-xs font-bold text-text-muted flex items-center gap-1 hover:text-text-main"><i
                                className="ph ph-plus"></i> Create New Template</span>
                    </div>

                </div>
            </div>

            {/* Right: Editor */}
            <div className="flex-1 panel flex flex-col overflow-hidden bg-white shadow-soft-lg">
                <div className="p-6 border-b border-[#e8e4d9] flex justify-between items-center bg-[#fcfbf9]">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-12 h-12 rounded-xl bg-text-main flex items-center justify-center text-white text-xl">
                            <i className="ph ph-robot"></i></div>
                        <div>
                            <h2 className="text-xl font-bold text-text-main">System Chief (Orchestrator)</h2>
                            <p className="text-xs text-text-muted mt-0.5">ID: soul_core_chief_v1</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 hide-scrollbar">

                    {/* Meta */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-wide">Display
                                Name</label>
                            <input type="text" value="비서실장"
                                className="w-full border border-[#e8e4d9] rounded-lg px-4 py-2.5 text-sm bg-[#fcfbf9] focus:bg-white focus:outline-none focus:border-text-main/50 font-medium" />
                        </div>
                        <div>
                            <label
                                className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-wide">Hierarchy
                                Level</label>
                            <select
                                className="w-full border border-[#e8e4d9] rounded-lg px-4 py-2.5 text-sm bg-[#fcfbf9] focus:bg-white focus:outline-none focus:border-text-main/50 font-medium cursor-pointer"
                                disabled>
                                <option>System Core (Cannot edit)</option>
                            </select>
                        </div>
                    </div>

                    {/* System Prompt (Soul) */}
                    <div className="flex-1 flex flex-col">
                        <label
                            className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-wide flex justify-between items-end">
                            System Prompt (Identity & Instructions)
                            <span className="text-[10px] font-mono font-normal">Markdown Supported</span>
                        </label>
                        <div
                            className="flex-1 border border-[#e8e4d9] rounded-xl overflow-hidden shadow-inner bg-[#fcfbf9] flex flex-col">
                            <textarea
                                className="w-full h-full p-4 text-sm font-mono text-text-main bg-transparent outline-none flex-1 leading-relaxed"
                                spellcheck="false">
# IDENTITY
당신은 조직의 최상위 오케스트레이터인 '비서실장'입니다. 사용자의 명령을 최초로 해석하고, 작업의 난이도를 평가하며, 적절한 부서나 에이전트에게 업무를 라우팅하는 핵심 역할을 수행합니다.

# CORE RULES
1. **Never perform the final task directly**: 당신은 관리자입니다. 실무는 산하 부서의 에이전트에게 위임해야 합니다.
2. **Quality Gate**: 반환된 결과물이 사용자에게 전달되기 전, 5가지 품질 검수 기준(결론/근거/형식/논리/리스크)을 반드시 통과해야 합니다.
3. **Transparent Delegation**: 당신이 업무를 나누고 종합하는 모든 과정을 시스템 로그 규칙에 맞게 투명하게 기록하십시오.

# TOOL USAGE
사용할 수 있는 위임 도구를 활용하여 작업을 병렬, 또는 직렬 체인으로 분배합니다. 
필요시 `call_department` 도구를 우선합니다.
                            </textarea>
                        </div>
                    </div>

                    {/* Tools */}
                    <div>
                        <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-wide">Default
                            Allowed Tools</label>
                        <div className="flex flex-wrap gap-2 p-4 border border-[#e8e4d9] rounded-xl bg-[#fcfbf9]">
                            <span
                                className="px-3 py-1.5 rounded-lg bg-white border border-[#e8e4d9] text-xs font-medium text-text-main flex items-center gap-2"><i
                                    className="ph ph-briefcase"></i> call_department <button
                                    className="text-text-muted hover:text-accent-coral"><i
                                        className="ph ph-x"></i></button></span>
                            <span
                                className="px-3 py-1.5 rounded-lg bg-white border border-[#e8e4d9] text-xs font-medium text-text-main flex items-center gap-2"><i
                                    className="ph ph-robot"></i> delegate_task <button
                                    className="text-text-muted hover:text-accent-coral"><i
                                        className="ph ph-x"></i></button></span>
                            <button
                                className="px-3 py-1.5 rounded-lg bg-base-100 text-xs font-bold text-text-muted border border-dashed border-[#d5cfc1] hover:text-text-main transition-colors">+
                                Add Tool</button>
                        </div>
                    </div>

                </div>
            </div>

        </div>

    </main>
    </>
  );
}

export default AdminSoulTemplates;
