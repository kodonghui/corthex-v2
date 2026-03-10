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

        .file-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 1.5rem;
        }

        .file-item {
            display: flex;
            flex-col;
            items-center;
            justify-center;
            text-center;
            padding: 1rem;
            border-radius: 1rem;
            border: 1px solid transparent;
            transition: all 0.2s ease;
            cursor: pointer;
        }

        .file-item:hover {
            background-color: rgba(255, 255, 255, 0.05);
            border-color: rgba(255, 255, 255, 0.1);
        }

        .file-item.selected {
            background-color: rgba(34, 211, 238, 0.1);
            border-color: rgba(34, 211, 238, 0.3);
        }

        .file-icon {
            font-size: 3rem;
            margin-bottom: 0.75rem;
            transition: transform 0.2s;
        }

        .file-item:hover .file-icon {
            transform: scale(1.05);
        }
`;

function Files() {
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

        <div className="p-4 flex-1 w-full flex flex-col h-full">
            <div className="mb-6">
                <div className="text-xs text-white/30 font-semibold mb-2 px-2 uppercase tracking-wider">Workspace</div>
                <nav className="space-y-1">
                    <a href="/app/home"
                        className="flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <i className="fas fa-home w-4"></i> <span>홈</span>
                    </a>
                </nav>
            </div>

            <div className="mb-6">
                <div className="text-xs text-white/30 font-semibold mb-2 px-2 uppercase tracking-wider">Resources</div>
                <nav className="space-y-1">
                    <a href="/app/knowledge"
                        className="flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <i className="fas fa-brain w-4"></i> <span>지식 베이스 (RAG)</span>
                    </a>
                    <a href="/app/files"
                        className="flex items-center gap-3 px-3 py-2 text-white bg-white/10 rounded-lg border border-white/10 transition-colors">
                        <i className="fas fa-folder w-4 text-accent-cyan"></i> <span>파일 관리자</span>
                    </a>
                </nav>
            </div>

            <div className="mb-4">
                <div className="text-xs text-white/30 font-semibold mb-2 px-2 uppercase tracking-wider">Storage</div>
                <div className="px-2">
                    <div className="bg-black/30 rounded-full h-1.5 w-full overflow-hidden mt-3 mb-2">
                        <div className="bg-gradient-to-r from-accent-purple to-accent-cyan h-full rounded-full w-[45%]">
                        </div>
                    </div>
                    <div className="flex justify-between text-xs text-white/50">
                        <span>4.5 GB 사용됨</span>
                        <span>10 GB 지원</span>
                    </div>
                </div>
            </div>
        </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 flex flex-col overflow-hidden relative bg-[#0a0a0f]">

        {/* Header */}
        <header
            className="h-16 border-b border-white/5 px-6 flex justify-between items-center bg-[#0a0a0f]/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
                <a href="#" className="hover:text-white"><i className="fas fa-hdd mr-2"></i>내 드라이브</a>
                <i className="fas fa-chevron-right text-[10px] text-white/30"></i>
                <a href="#" className="hover:text-white text-white font-medium">프로젝트 오리온</a>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative w-48 xl:w-64">
                    <i
                        className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-white/30 text-xs"></i>
                    <input type="text"
                        className="w-full bg-white/5 border border-white/10 rounded-full pl-8 pr-3 py-1.5 text-sm font-light text-white focus:outline-none focus:border-accent-cyan/50 focus:bg-white/10 transition-colors placeholder-white/40"
                        placeholder="드라이브 검색..." />
                </div>

                <div className="flex gap-1 border border-white/10 rounded-lg overflow-hidden bg-black/40">
                    <button className="px-3 py-1.5 bg-white/10 text-white" title="그리드 뷰"><i
                            className="fas fa-th-large text-sm"></i></button>
                    <button className="px-3 py-1.5 text-white/40 hover:text-white hover:bg-white/5" title="목록 뷰"><i
                            className="fas fa-list text-sm"></i></button>
                </div>

                <button className="btn-primary !py-1.5"><i className="fas fa-plus mr-1.5"></i>새로 만들기</button>
            </div>
        </header>

        {/* Actions Bar */}
        <div className="px-6 py-3 border-b border-white/5 flex items-center justify-between bg-black/20 shrink-0">
            <div className="flex gap-2 text-sm text-white/40">
                <span>파일 14개, 폴더 3개</span>
                <span className="mx-2">|</span>
                <span>총 142MB</span>
            </div>
            {/* Selection actions (hidden when none selected) */}
            <div className="flex gap-2">
                <button className="btn-icon !py-1" title="다운로드"><i className="fas fa-download"></i></button>
                <button className="btn-icon !py-1" title="공유"><i className="fas fa-user-plus"></i></button>
                <button className="btn-icon !py-1 text-red-400 hover:text-red-300 hover:bg-red-400/10" title="삭제"><i
                        className="fas fa-trash-alt"></i></button>
            </div>
        </div>

        {/* File Browser Grid */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">

            {/* Folder Section */}
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">폴더</h3>
            <div className="file-grid mb-10">
                {/* Folder Item */}
                <div className="file-item flex flex-col items-center group">
                    <div className="file-icon text-accent-cyan/70 drop-shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                        <i className="fas fa-folder"></i>
                    </div>
                    <div className="text-sm text-white font-medium group-hover:text-accent-cyan w-full truncate px-2">데이터베이스
                        덤프</div>
                    <div className="text-[10px] text-white/40 mt-1">마지막 수정: 오늘</div>
                </div>

                {/* Folder Item */}
                <div className="file-item flex flex-col items-center group">
                    <div className="file-icon text-accent-cyan/70 drop-shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                        <i className="fas fa-folder"></i>
                    </div>
                    <div className="text-sm text-white font-medium group-hover:text-accent-cyan w-full truncate px-2">마케팅 에셋
                    </div>
                    <div className="text-[10px] text-white/40 mt-1">마지막 수정: 어제</div>
                </div>

                {/* Folder Item (Shared) */}
                <div className="file-item flex flex-col items-center group relative">
                    <div className="absolute top-2 right-2 text-[10px] text-white/30"><i className="fas fa-user-friends"></i>
                    </div>
                    <div className="file-icon text-blue-400/70 drop-shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                        <i className="fas fa-folder-open"></i>
                    </div>
                    <div className="text-sm text-white font-medium group-hover:text-blue-400 w-full truncate px-2">에이전트 공유
                        폴더</div>
                    <div className="text-[10px] text-white/40 mt-1">마지막 수정: 1주 전</div>
                </div>
            </div>

            {/* File Section */}
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">파일</h3>
            <div className="file-grid">

                {/* PDF File */}
                <div className="file-item flex flex-col items-center group">
                    <div className="file-icon text-red-500/80 drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]">
                        <i className="fas fa-file-pdf"></i>
                    </div>
                    <div className="text-sm text-white/80 w-full truncate px-1">Q3_캠페인_리포트.pdf</div>
                    <div className="text-[10px] font-mono text-white/40 mt-1">2.4 MB</div>
                </div>

                {/* Excel File (Selected) */}
                <div className="file-item selected flex flex-col items-center group">
                    <div className="file-icon text-green-500/80 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)] relative">
                        <i className="fas fa-file-excel"></i>
                        <div
                            className="absolute -top-1 -right-2 w-4 h-4 bg-accent-cyan rounded-full flex items-center justify-center text-[10px] text-[#0a0a0f] z-10">
                            <i className="fas fa-check"></i></div>
                    </div>
                    <div className="text-sm text-white w-full truncate px-1">2026_영업_데이터.xlsx</div>
                    <div className="text-[10px] font-mono text-white/60 mt-1">15.2 MB</div>
                </div>

                {/* Image File */}
                <div className="file-item flex flex-col items-center group">
                    <div className="file-icon text-yellow-400/80 drop-shadow-[0_0_8px_rgba(250,204,21,0.3)] relative">
                        {/* Simulated Image Thumbnail */}
                        <div
                            className="w-12 h-12 bg-[#151525] rounded overflow-hidden relative border border-white/10 mx-auto">
                            <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/30 to-accent-cyan/30 z-0">
                            </div>
                            <i
                                className="fas fa-image absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/50 text-xl z-10"></i>
                        </div>
                    </div>
                    <div className="text-sm text-white/80 w-full truncate px-1 mt-3">logo_final_v2.png</div>
                    <div className="text-[10px] font-mono text-white/40 mt-1">450 KB</div>
                </div>

                {/* Code File */}
                <div className="file-item flex flex-col items-center group">
                    <div className="file-icon text-blue-300/80 drop-shadow-[0_0_8px_rgba(147,197,253,0.3)]">
                        <i className="fas fa-file-code"></i>
                    </div>
                    <div className="text-sm text-white/80 w-full truncate px-1">data_parser.py</div>
                    <div className="text-[10px] font-mono text-white/40 mt-1">12 KB</div>
                </div>

                {/* CSV File */}
                <div className="file-item flex flex-col items-center group">
                    <div className="file-icon text-emerald-400/80 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">
                        <i className="fas fa-file-csv"></i>
                    </div>
                    <div className="text-sm text-white/80 w-full truncate px-1">users_export_1027.csv</div>
                    <div className="text-[10px] font-mono text-white/40 mt-1">1.1 MB</div>
                </div>

            </div>

        </div>

    </main>
    </>
  );
}

export default Files;
