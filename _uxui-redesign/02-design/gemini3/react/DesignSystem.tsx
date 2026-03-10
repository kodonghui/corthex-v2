"use client";
import React from "react";

const styles = `
body {
            background-color: #0a0a0f;
            color: #f3f4f6;
            background-image:
                radial-gradient(circle at 15% 50%, rgba(168, 85, 247, 0.08), transparent 25%),
                radial-gradient(circle at 85% 30%, rgba(34, 211, 238, 0.08), transparent 25%);
            background-attachment: fixed;
            font-weight: 300;
            /* Thin font weight by default */
            line-height: 1.5;
        }

        /* Typography */
        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
            font-weight: 500;
            letter-spacing: -0.02em;
        }

        .num-bold {
            font-family: 'JetBrains Mono', monospace;
            font-weight: 700;
            letter-spacing: -0.05em;
        }

        /* Glassmorphism Panels */
        .glass-panel {
            background-color: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            border-radius: 1rem;
        }

        .glass-panel-hover {
            transition: all 0.3s ease;
        }

        .glass-panel-hover:hover {
            background-color: rgba(255, 255, 255, 0.08);
            border-color: rgba(255, 255, 255, 0.15);
            transform: translateY(-2px);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
        }

        /* Buttons */
        .btn-primary {
            background: linear-gradient(135deg, #a855f7 0%, #22d3ee 100%);
            color: white;
            border: none;
            border-radius: 0.5rem;
            padding: 0.5rem 1rem;
            font-weight: 500;
            transition: all 0.3s ease;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .btn-primary:hover {
            opacity: 0.95;
            box-shadow: 0 0 20px rgba(34, 211, 238, 0.5);
            transform: translateY(-1px);
        }

        .btn-primary:active {
            transform: translateY(0);
        }

        .btn-glass {
            background-color: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: white;
            border-radius: 0.5rem;
            padding: 0.5rem 1rem;
            transition: all 0.3s ease;
            backdrop-filter: blur(8px);
            cursor: pointer;
            font-weight: 400;
        }

        .btn-glass:hover {
            background-color: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.2);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .btn-icon {
            background: transparent;
            border: 1px solid transparent;
            color: #9ca3af;
            border-radius: 0.5rem;
            padding: 0.5rem;
            transition: all 0.2s ease;
            cursor: pointer;
        }

        .btn-icon:hover {
            color: white;
            background-color: rgba(255, 255, 255, 0.05);
            border-color: rgba(255, 255, 255, 0.1);
        }

        /* Inputs */
        .glass-input {
            background-color: rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #fff;
            border-radius: 0.5rem;
            padding: 0.5rem 1rem;
            transition: all 0.3s ease;
            font-weight: 300;
            width: 100%;
        }

        .glass-input::placeholder {
            color: rgba(255, 255, 255, 0.3);
        }

        .glass-input:focus {
            outline: none;
            border-color: rgba(34, 211, 238, 0.5);
            /* cyan pulse */
            box-shadow: 0 0 0 2px rgba(34, 211, 238, 0.2), inset 0 0 10px rgba(34, 211, 238, 0.1);
            background-color: rgba(0, 0, 0, 0.4);
        }

        /* Badges */
        .badge-accent {
            background: rgba(168, 85, 247, 0.15);
            border: 1px solid rgba(168, 85, 247, 0.3);
            color: #d8b4fe;
            padding: 0.125rem 0.5rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 500;
        }

        .badge-cyan {
            background: rgba(34, 211, 238, 0.15);
            border: 1px solid rgba(34, 211, 238, 0.3);
            color: #67e8f9;
            padding: 0.125rem 0.5rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 500;
        }

        /* Gradient Text */
        .text-gradient {
            background: linear-gradient(135deg, #a855f7 0%, #22d3ee 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        /* Scrollbar */
        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }

        ::-webkit-scrollbar-track {
            background: transparent;
        }

        ::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.2);
        }
`;

function DesignSystem() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
<header className="mb-12 text-center">
        <h1 className="text-4xl font-semibold mb-2 tracking-tight">CORTHEX v2 <span className="text-gradient">Design
                System</span></h1>
        <p className="text-white/50 font-light">Glassmorphism Dark / Apple Vision Pro & Linear Aesthetics</p>
    </header>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Typography & Colors */}
        <div className="lg:col-span-4 space-y-8">
            <section className="glass-panel p-6">
                <h2 className="text-xl text-white/90 mb-6 border-b border-white/10 pb-2">Typography & Colors</h2>

                <div className="space-y-4 mb-8">
                    <div>
                        <div className="text-sm text-white/40 mb-1">Heading 1</div>
                        <div className="text-3xl font-semibold text-white">비서실장 오케스트레이션</div>
                    </div>
                    <div>
                        <div className="text-sm text-white/40 mb-1">Heading 2</div>
                        <div className="text-xl font-medium text-white/90">포트폴리오 현황 분석</div>
                    </div>
                    <div>
                        <div className="text-sm text-white/40 mb-1">Body Text</div>
                        <div className="text-base text-white/70 font-light leading-relaxed">자연어 명령 한 줄을 입력하면, 적합한 부서에 위임하며
                            결과를 종합하여 보고서를 반환합니다.</div>
                    </div>
                    <div>
                        <div className="text-sm text-white/40 mb-1">Numbers (JetBrains Mono)</div>
                        <div className="text-2xl text-accent-cyan num-bold">$ 15,240.50 <span
                                className="text-sm text-green-400 ml-2">+2.4%</span></div>
                    </div>
                </div>

                <div className="grid grid-cols-5 gap-2">
                    <div className="h-10 rounded bg-base-400 border border-white/10 relative group" title="Base 400"></div>
                    <div className="h-10 rounded bg-base-300 border border-white/10 relative group" title="Base 300"></div>
                    <div className="h-10 rounded bg-base-200 border border-white/10 relative group" title="Base 200"></div>
                    <div className="h-10 rounded bg-base-100 border border-white/10 relative group" title="Base 100"></div>
                    <div className="h-10 rounded bg-[rgba(255,255,255,0.05)] border border-white/10 relative group"
                        title="Glass 5%"></div>
                    <div className="h-10 rounded bg-accent-purple border border-white/10 col-span-2 relative group"
                        title="Accent Purple"></div>
                    <div className="h-10 rounded bg-gradient-accent border border-white/10 relative group" title="Gradient">
                    </div>
                    <div className="h-10 rounded bg-accent-cyan border border-white/10 col-span-2 relative group"
                        title="Accent Cyan"></div>
                </div>
            </section>

            {/* Buttons & Inputs */}
            <section className="glass-panel p-6">
                <h2 className="text-xl text-white/90 mb-6 border-b border-white/10 pb-2">Controls</h2>

                <div className="space-y-5">
                    <div className="flex flex-wrap gap-3">
                        <button className="btn-primary"><i className="fas fa-play mr-2 text-xs"></i>작전 실행</button>
                        <button className="btn-glass"><i className="fas fa-plus mr-2 text-white/50 text-xs"></i>부서 추가</button>
                        <button className="btn-icon"><i className="fas fa-ellipsis-v"></i></button>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <span className="badge-accent">Manager 계급</span>
                        <span className="badge-cyan">실시간 연동</span>
                        <span
                            className="bg-white/10 text-white/70 border border-white/10 px-2 py-0.5 rounded-full text-xs font-light">대기
                            중</span>
                    </div>

                    <div className="space-y-3 pt-2">
                        <div className="relative">
                            <i
                                className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-white/30 text-sm"></i>
                            <input type="text" className="glass-input pl-9" placeholder="에이전트 검색..." />
                        </div>
                        <div className="relative">
                            <i className="fas fa-terminal absolute left-3 top-3 text-accent-cyan text-sm"></i>
                            <textarea className="glass-input pl-9 h-24 resize-none"
                                placeholder="비서실장에게 내릴 명령을 입력하세요. (예: 삼성전자 분석해줘)"></textarea>
                            <button className="absolute bottom-2 right-2 btn-icon text-accent-cyan hover:bg-transparent"><i
                                    className="fas fa-paper-plane"></i></button>
                        </div>
                    </div>
                </div>
            </section>
        </div>

        {/* Glass Cards & Layouts */}
        <div className="lg:col-span-8 space-y-8">
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Data Card */}
                <div className="glass-panel glass-panel-hover p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center shadow-glow-sm">
                                <i className="fas fa-robot text-white text-sm"></i>
                            </div>
                            <div>
                                <h3 className="text-white/90 font-medium">비서실장 (Chief of Staff)</h3>
                                <p className="text-white/40 text-xs">System Agent • Claude 3.5 Sonnet</p>
                            </div>
                        </div>
                        <button className="btn-icon text-xs"><i className="fas fa-cog"></i></button>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-white/50">예산 소진율</span>
                            <span className="num-bold text-accent-cyan">42%</span>
                        </div>
                        <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-gradient-accent h-1.5 rounded-full" style={{width: "42%"}}></div>
                        </div>
                    </div>
                </div>

                {/* Chat/Log Message */}
                <div className="glass-panel p-6 flex flex-col justify-end">
                    <div className="mb-4">
                        <div className="text-xs text-white/40 mb-2 font-mono flex items-center gap-2">
                            <i className="fas fa-bolt text-accent-cyan"></i>
                            [WORKFLOW] 09:41:22
                        </div>
                        <div className="bg-black/20 border border-white/5 p-4 rounded-lg">
                            <p className="text-white/80 text-sm leading-relaxed mb-3">CEO 지시사항에 따라 <span
                                    className="text-accent-purple font-medium">마케팅부 콘텐츠 전문가</span>와 <span
                                    className="text-accent-purple font-medium">전략실 종목분석가</span>에게 시장 전망 분석 업무를 병렬 배분했습니다.
                            </p>
                            <div className="flex gap-2">
                                <span className="badge-cyan"><i className="fas fa-check-circle mr-1"></i>승인 완료</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Table/List View */}
            <section className="glass-panel overflow-hidden">
                <div className="p-5 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-white/90 font-medium">조직 운영 현황 <span
                            className="ml-2 text-xs text-white/40 bg-white/5 px-2 py-1 rounded-full border border-white/5">Active
                            12</span></h3>
                    <div className="flex gap-2">
                        <button className="btn-glass text-xs py-1"><i
                                className="fas fa-filter mr-1 text-white/40"></i>필터</button>
                        <button className="btn-glass text-xs py-1"><i
                                className="fas fa-download mr-1 text-white/40"></i>내보내기</button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-white/70">
                        <thead className="text-xs text-white/40 bg-black/20">
                            <tr>
                                <th className="px-5 py-3 font-medium">에이전트/계급</th>
                                <th className="px-5 py-3 font-medium">소속 부서</th>
                                <th className="px-5 py-3 font-medium text-right">금일 사용량</th>
                                <th className="px-5 py-3 font-medium">상태</th>
                                <th className="px-5 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <tr className="hover:bg-white/5 transition-colors group">
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-2 h-2 rounded-full bg-accent-cyan shadow-[0_0_8px_rgba(34,211,238,0.8)]">
                                        </div>
                                        <span className="text-white font-medium">김전략 (CIO)</span>
                                    </div>
                                    <div className="text-xs text-white/40 pl-4 mt-0.5">Manager</div>
                                </td>
                                <td className="px-5 py-4">전략기획실</td>
                                <td className="px-5 py-4 text-right num-bold">$ 4.20</td>
                                <td className="px-5 py-4"><span className="badge-accent">작업 중</span></td>
                                <td className="px-5 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="btn-icon py-0"><i className="fas fa-arrow-right"></i></button>
                                </td>
                            </tr>
                            <tr className="hover:bg-white/5 transition-colors group">
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-white/30"></div>
                                        <span className="text-white/80 font-medium">이마켓</span>
                                    </div>
                                    <div className="text-xs text-white/40 pl-4 mt-0.5">Specialist</div>
                                </td>
                                <td className="px-5 py-4">마케팅부</td>
                                <td className="px-5 py-4 text-right num-bold">$ 1.05</td>
                                <td className="px-5 py-4"><span
                                        className="bg-white/5 text-white/60 border border-white/5 px-2 py-0.5 rounded-full text-xs font-light">대기
                                        중</span></td>
                                <td className="px-5 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="btn-icon py-0"><i className="fas fa-arrow-right"></i></button>
                                </td>
                            </tr>
                            <tr className="hover:bg-white/5 transition-colors group">
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-white/30"></div>
                                        <span className="text-white/80 font-medium">박데이터</span>
                                    </div>
                                    <div className="text-xs text-white/40 pl-4 mt-0.5">Worker</div>
                                </td>
                                <td className="px-5 py-4">데이터분석팀</td>
                                <td className="px-5 py-4 text-right num-bold">$ 0.12</td>
                                <td className="px-5 py-4"><span
                                        className="bg-white/5 text-white/60 border border-white/5 px-2 py-0.5 rounded-full text-xs font-light">대기
                                        중</span></td>
                                <td className="px-5 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="btn-icon py-0"><i className="fas fa-arrow-right"></i></button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    </div>
    </>
  );
}

export default DesignSystem;
