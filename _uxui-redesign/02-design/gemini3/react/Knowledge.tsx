"use client";
import React from "react";

const styles = `
body {
            background-color: #0a0a0f;
            color: #f3f4f6;
            background-image: radial-gradient(circle at 15% 50%, rgba(168, 85, 247, 0.05), transparent 25%),
                radial-gradient(circle at 85% 30%, rgba(34, 211, 238, 0.05), transparent 25%);
            background-attachment: fixed;
            font-weight: 300;
            line-height: 1.5;
        }

        .num-bold {
            font-family: 'JetBrains Mono', monospace;
            font-weight: 700;
            letter-spacing: -0.05em;
        }

        .glass-panel {
            background-color: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 1rem;
        }

        .btn-primary {
            background: linear-gradient(135deg, #a855f7 0%, #22d3ee 100%);
            color: white;
            border: none;
            border-radius: 0.5rem;
            padding: 0.5rem 1rem;
            font-weight: 500;
            transition: all 0.3s ease;
            cursor: pointer;
            text-sm;
            box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .btn-glass {
            background-color: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: white;
            border-radius: 0.5rem;
            padding: 0.4rem 0.8rem;
            transition: all 0.3s ease;
            backdrop-filter: blur(8px);
            cursor: pointer;
            font-weight: 400;
            text-sm;
        }

        .btn-glass:hover {
            background-color: rgba(255, 255, 255, 0.1);
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
        }

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

        /* Document Table */
        .doc-table th {
            background: rgba(0, 0, 0, 0.3);
            font-weight: 500;
            font-size: 0.75rem;
            color: rgba(255, 255, 255, 0.5);
            text-transform: uppercase;
            padding: 0.75rem 1rem;
            text-align: left;
        }

        .doc-table td {
            padding: 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            font-size: 0.875rem;
        }

        .doc-table tr:hover td {
            background: rgba(255, 255, 255, 0.02);
        }

        /* Embedding Animation */
        @keyframes pulse-ring {
            0% {
                transform: scale(0.8);
                box-shadow: 0 0 0 0 rgba(34, 211, 238, 0.7);
            }

            70% {
                transform: scale(1);
                box-shadow: 0 0 0 10px rgba(34, 211, 238, 0);
            }

            100% {
                transform: scale(0.8);
                box-shadow: 0 0 0 0 rgba(34, 211, 238, 0);
            }
        }

        .embedding-indicator {
            animation: pulse-ring 2s infinite;
        }
`;

function Knowledge() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Sidebar Navigation */}
    <aside
        className="w-64 flex flex-col border-r border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl h-full shrink-0 relative z-20">
        <div className="p-6">
            <h1 className="text-xl font-bold tracking-tight text-white mb-2">CORTHEX <span
                    className="text-xs font-normal text-white/40 ml-1">v2</span></h1>
        </div>

        <div className="p-4 flex-1 overflow-y-auto w-full">
            <div className="mb-4">
                <div className="text-xs text-white/30 font-semibold mb-2 px-2 uppercase tracking-wider">Workspace</div>
                <nav className="space-y-1">
                    <a href="/app/home"
                        className="flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <i className="fas fa-home w-4"></i> <span>홈</span>
                    </a>
                </nav>
            </div>

            <div className="mb-4">
                <div className="text-xs text-white/30 font-semibold mb-2 px-2 uppercase tracking-wider">Resources</div>
                <nav className="space-y-1">
                    <a href="/app/knowledge"
                        className="flex items-center gap-3 px-3 py-2 text-white bg-white/10 rounded-lg border border-white/10 transition-colors">
                        <i className="fas fa-brain w-4 text-accent-cyan"></i> <span>지식 베이스 (RAG)</span>
                    </a>
                    <a href="/app/files"
                        className="flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <i className="fas fa-folder w-4"></i> <span>파일 관리자</span>
                    </a>
                </nav>
            </div>
        </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 overflow-auto bg-[#0a0a0f] relative">
        <header className="p-8 pb-6 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-md sticky top-0 z-30">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-semibold mb-2 flex items-center gap-3">
                        지식 베이스 <span
                            className="text-xs font-mono bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded">Vector
                            DB</span>
                    </h2>
                    {/* API: GET /api/workspace/knowledge */}
                    <p className="text-white/40 text-sm">에이전트들이 RAG(검색 증강 생성)를 위해 참고할 자체 문서와 지식을 임베딩하여 관리합니다.</p>
                </div>
                <div className="flex gap-2">
                    <button className="btn-glass"><i className="fas fa-link text-xs mr-2 text-white/50"></i>웹 URL 연동</button>
                    <button className="btn-primary"><i className="fas fa-upload mr-2 text-xs"></i>문서 업로드 (임베딩)</button>
                </div>
            </div>

            {/* Stats & Sync Status */}
            <div className="mt-6 flex flex-wrap gap-4 items-center text-sm">
                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg flex items-center gap-3">
                    <i className="fas fa-file-alt text-white/40"></i>
                    <div><span className="text-white/40text-xs">총 문서 수:</span> <span
                            className="num-bold text-white ml-1">1,482</span></div>
                </div>
                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg flex items-center gap-3">
                    <i className="fas fa-layer-group text-accent-purple"></i>
                    <div><span className="text-white/40text-xs">전체 청크(Chunks):</span> <span
                            className="num-bold text-white ml-1">45,920</span></div>
                </div>
                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg flex items-center gap-3">
                    <i className="fas fa-database text-accent-cyan"></i>
                    <div><span className="text-white/40text-xs">임베딩 모델:</span> <span
                            className="text-white font-mono text-xs ml-1">text-embedding-3-small</span></div>
                </div>
                <div
                    className="ml-auto flex items-center gap-2 text-xs text-status-success bg-status-success/10 border border-status-success/20 px-3 py-1.5 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-status-success shadow-[0_0_5px_#10b981]"></div> Vector DB
                    동기화 완료
                </div>
            </div>
        </header>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left: Document Management */}
            <div className="lg:col-span-2 space-y-6">

                {/* Semantic Search Test Box */}
                <div className="glass-panel p-1 bg-gradient-to-r from-[#151525] to-[#1a1a2e] border-accent-cyan/20">
                    <div className="relative flex items-center">
                        <i className="fas fa-search absolute left-4 text-accent-cyan/50"></i>
                        <input type="text"
                            className="w-full bg-transparent border-none text-white pl-12 pr-4 py-3 focus:outline-none placeholder-white/30 text-sm"
                            placeholder="시맨틱 검색 테스트 (예: 2026년 휴가 규정이 어떻게 바뀌었나요?)" />
                        <button
                            className="bg-white/10 hover:bg-white/20 text-white text-xs px-4 py-1.5 rounded mr-2 transition-colors">검색</button>
                    </div>
                </div>

                {/* Collection/Tags Filter */}
                <div className="flex gap-2 mb-2">
                    <button
                        className="bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30 px-3 py-1.5 rounded-full text-xs font-medium">전체보기</button>
                    <button
                        className="bg-white/5 hover:bg-white/10 text-white/60 border border-white/10 px-3 py-1.5 rounded-full text-xs transition-colors">취업규칙
                        (HR)</button>
                    <button
                        className="bg-white/5 hover:bg-white/10 text-white/60 border border-white/10 px-3 py-1.5 rounded-full text-xs transition-colors">제품
                        매뉴얼 (Product)</button>
                    <button
                        className="bg-white/5 hover:bg-white/10 text-white/60 border border-white/10 px-3 py-1.5 rounded-full text-xs transition-colors">영업
                        가이드 (Sales)</button>
                </div>

                {/* Document List Table */}
                <div className="glass-panel overflow-hidden border-white/10 bg-white/5">
                    <table className="w-full doc-table whitespace-nowrap">
                        <thead>
                            <tr>
                                <th>문서명 (Document)</th>
                                <th>컬렉션 / 태그</th>
                                <th>청크 현황</th>
                                <th>상태</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* In Progress Row */}
                            <tr className="bg-accent-cyan/5 relative">
                                <td className="relative">
                                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-accent-cyan"></div>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 rounded bg-red-400/20 text-red-400 flex items-center justify-center shrink-0">
                                            <i className="fas fa-file-pdf"></i>
                                        </div>
                                        <div>
                                            <div className="font-medium text-white text-sm">2026_전사_취업규칙_개정안_v2.pdf</div>
                                            <div className="text-[10px] text-white/40 font-mono mt-0.5">3.2 MB • 방금 업로드
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td><span className="text-xs text-white/50 border border-white/10 px-2 py-0.5 rounded">취업규칙
                                        (HR)</span></td>
                                <td>
                                    <div className="w-24">
                                        <div className="flex justify-between text-[10px] text-accent-cyan mb-1">
                                            <span>Processing...</span>
                                            <span className="font-mono">45%</span>
                                        </div>
                                        <div className="h-1 bg-black rounded-full overflow-hidden">
                                            <div className="h-full bg-accent-cyan w-[45%]"></div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2 text-[10px] text-accent-cyan">
                                        <div className="w-2 h-2 rounded-full bg-accent-cyan embedding-indicator"></div> 임베딩
                                        중
                                    </div>
                                </td>
                                <td className="text-right">
                                    <button className="btn-icon !p-1 text-white/30 hover:text-white"><i
                                            className="fas fa-ellipsis-h"></i></button>
                                </td>
                            </tr>

                            {/* Completed Row */}
                            <tr>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 rounded bg-blue-400/20 text-blue-400 flex items-center justify-center shrink-0">
                                            <i className="fas fa-globe"></i>
                                        </div>
                                        <div>
                                            <div className="font-medium text-white/80 text-sm">CORTHEX API 공식 문서 (Docs)
                                            </div>
                                            <div className="text-[10px] text-white/40 font-mono mt-0.5">
                                                https://docs.corthex.com/api</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span
                                        className="text-xs text-white/50 border border-white/10 px-2 py-0.5 rounded mr-1">Product</span>
                                    <span
                                        className="text-xs text-white/50 border border-white/10 px-2 py-0.5 rounded">API</span>
                                </td>
                                <td>
                                    <div className="text-xs text-white/60">
                                        <span className="font-mono text-white">412</span> Chunks
                                    </div>
                                </td>
                                <td>
                                    <div className="text-[10px] text-status-success flex items-center gap-1.5">
                                        <i className="fas fa-check-circle"></i> 준비됨 / 매일 동기화
                                    </div>
                                </td>
                                <td className="text-right">
                                    <button className="btn-icon !p-1 text-white/30 hover:text-white"><i
                                            className="fas fa-ellipsis-h"></i></button>
                                </td>
                            </tr>

                            {/* Completed Row */}
                            <tr>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 rounded bg-green-400/20 text-green-400 flex items-center justify-center shrink-0">
                                            <i className="fas fa-file-excel"></i>
                                        </div>
                                        <div>
                                            <div className="font-medium text-white/80 text-sm">영업팀_Q1_제품별_단가표.xlsx</div>
                                            <div className="text-[10px] text-white/40 font-mono mt-0.5">14KB • 10월 12일</div>
                                        </div>
                                    </div>
                                </td>
                                <td><span className="text-xs text-white/50 border border-white/10 px-2 py-0.5 rounded">영업
                                        가이드 (Sales)</span></td>
                                <td>
                                    <div className="text-xs text-white/60">
                                        <span className="font-mono text-white">85</span> Chunks
                                    </div>
                                </td>
                                <td>
                                    <div className="text-[10px] text-status-success flex items-center gap-1.5">
                                        <i className="fas fa-check-circle"></i> 준비됨
                                    </div>
                                </td>
                                <td className="text-right">
                                    <button className="btn-icon !p-1 text-white/30 hover:text-white"><i
                                            className="fas fa-ellipsis-h"></i></button>
                                </td>
                            </tr>

                            {/* Failed Row */}
                            <tr className="opacity-70">
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 rounded bg-white/5 text-white/30 flex items-center justify-center shrink-0">
                                            <i className="fas fa-file-alt"></i>
                                        </div>
                                        <div>
                                            <div
                                                className="font-medium text-white/50 text-sm line-through decoration-white/30">
                                                corrupted_data_dump.txt</div>
                                            <div className="text-[10px] text-red-400 mt-0.5">지원되지 않는 인코딩 형식</div>
                                        </div>
                                    </div>
                                </td>
                                <td>-</td>
                                <td>-</td>
                                <td>
                                    <div className="text-[10px] text-status-failed flex items-center gap-1.5">
                                        <i className="fas fa-times-circle"></i> 처리 실패
                                    </div>
                                </td>
                                <td className="text-right">
                                    <button className="btn-icon !p-1 text-white/30 hover:text-white"><i
                                            className="fas fa-trash-alt"></i></button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Pagination Placeholder */}
                <div className="flex justify-between items-center text-xs text-white/40 px-2">
                    <span>Showing 1 to 4 of 1,482 entries</span>
                    <div className="flex gap-1">
                        <button className="btn-glass !p-1.5 !text-[10px]"><i className="fas fa-chevron-left"></i></button>
                        <button className="btn-primary !p-1.5 !text-[10px] w-7 rounded">1</button>
                        <button
                            className="btn-glass !p-1.5 !text-[10px] w-7 rounded border-none bg-transparent hover:bg-white/5">2</button>
                        <button
                            className="btn-glass !p-1.5 !text-[10px] w-7 rounded border-none bg-transparent hover:bg-white/5">3</button>
                        <span className="px-1">...</span>
                        <button className="btn-glass !p-1.5 !text-[10px]"><i className="fas fa-chevron-right"></i></button>
                    </div>
                </div>

            </div>

            {/* Right: Embedding Setup & Rules */}
            <div className="space-y-6">

                <div className="glass-panel p-6 border-white/10 bg-gradient-to-br from-[#151525]/80 to-[#0a0a0f]/80">
                    <h3 className="text-lg font-bold text-white mb-4 border-b border-white/5 pb-2">임베딩 설정 (Chunking)</h3>

                    <div className="space-y-5">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-sm text-white/80 shrink-0">Chunk Size</label>
                                <span className="text-xs font-mono text-accent-cyan">1024 tokens</span>
                            </div>
                            <input type="range" min="100" max="2000" value="1024"
                                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-cyan" />
                            <div className="text-[10px] text-white/40 mt-1">큰 문서는 이 크기 단위로 나뉘어 에이전트에게 제공됩니다.</div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-sm text-white/80 shrink-0">Chunk Overlap</label>
                                <span className="text-xs font-mono text-accent-cyan">200 tokens</span>
                            </div>
                            <input type="range" min="0" max="500" value="200"
                                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-cyan" />
                            <div className="text-[10px] text-white/40 mt-1">문맥 단절을 방지하기 위해 겹치는 영역을 설정합니다.</div>
                        </div>

                        <div className="flex items-center justify-between border-t border-white/5 pt-4">
                            <div>
                                <div className="text-sm text-white/80">시맨틱 라우팅 (Semantic Routing)</div>
                                <div className="text-[10px] text-white/40">에이전트별로 접근 가능한 문서를 제한합니다.</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" value="" className="sr-only peer" checked />
                                <div
                                    className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent-cyan">
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* API Usage Notice */}
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <i className="fas fa-info-circle text-blue-400 mt-0.5"></i>
                        <div>
                            <div className="text-sm font-medium text-blue-400 mb-1">Vector DB 용량 안내</div>
                            <div className="text-xs text-white/60 leading-relaxed">
                                현재 요금제(Pro)에서 지원하는 최대 10GB 중 <span className="font-mono text-white">1.2GB (12%)</span>를 사용
                                중입니다.
                                자동 동기화 주기는 24시간으로 설정되어 있습니다.
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </div>

    </main>
    </>
  );
}

export default Knowledge;
