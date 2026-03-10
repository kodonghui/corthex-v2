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

        .file-card {
            background-color: white;
            border-radius: 1.25rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
            border: 1px solid #f5f3ec;
            transition: all 0.2s ease;
            cursor: pointer;
        }

        .file-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
            border-color: #e8e4d9;
        }

        .folder-card {
            background-color: rgba(245, 243, 236, 0.5);
            border-radius: 1rem;
            border: 1px solid transparent;
            transition: all 0.2s ease;
            cursor: pointer;
        }

        .folder-card:hover {
            background-color: white;
            border-color: #e8e4d9;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
        }
`;

function AppFiles() {
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

                <div className="pt-4 pb-2 px-4 text-xs font-bold text-base-300 uppercase tracking-wider">지식 및 에셋</div>
                <a href="#"
                    className="sidebar-item flex items-center gap-3 px-4 py-3 text-text-muted hover:bg-base-100 rounded-2xl transition-colors">
                    <i className="ph ph-books text-xl"></i> 정보국 (Wiki)
                </a>
                {/* Active menu */}
                <a href="#"
                    className="sidebar-item active flex items-center gap-3 px-4 py-3 font-medium text-accent-terracotta bg-base-100 rounded-2xl transition-colors">
                    <i className="ph ph-files text-xl"></i> 파일 보관소
                </a>
            </nav>

            <div className="mt-8 px-4">
                <h3 className="text-[10px] font-bold text-base-300 uppercase tracking-wider mb-3">저장소 계층</h3>
                <nav className="space-y-1 text-sm font-medium">
                    <a href="#" className="flex items-center gap-2 py-2 px-2 text-text-main bg-base-50 rounded-lg"><i
                            className="ph ph-hard-drive text-accent-terracotta"></i> 내 에이전트 드라이브</a>
                    <a href="#"
                        className="flex items-center gap-2 py-2 px-2 text-text-muted hover:bg-base-50 rounded-lg transition-colors"><i
                            className="ph ph-users"></i> 공유된 에셋 (Shared)</a>
                    <a href="#"
                        className="flex items-center gap-2 py-2 px-2 text-text-muted hover:bg-base-50 rounded-lg transition-colors"><i
                            className="ph ph-clock-counter-clockwise"></i> 최근 항목</a>
                    <a href="#"
                        className="flex items-center gap-2 py-2 px-2 text-text-muted hover:bg-base-50 rounded-lg transition-colors"><i
                            className="ph ph-star"></i> 즐겨찾기</a>
                </nav>
            </div>
        </div>

        <div>
            {/* Storage Usage (API: GET /api/workspace/files/storage-info) */}
            <div className="px-4 mb-6">
                <div className="flex justify-between text-xs font-bold text-text-muted mb-2">
                    <span>저장 공간</span>
                    <span>12.4 GB / 50 GB</span>
                </div>
                <div className="w-full bg-base-100 rounded-full h-2 mb-1 overflow-hidden">
                    <div className="bg-accent-terracotta h-full rounded-full" style={{width: "25%"}}></div>
                </div>
            </div>

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

        {/* Header (API: GET /api/workspace/files) */}
        <header
            className="flex justify-between items-end mb-8 sticky top-0 bg-[#fcfbf9]/80 backdrop-blur-md z-10 pt-2 pb-4 border-b border-base-200/50">
            <div>
                <div className="flex items-center gap-2 text-sm font-medium text-text-muted mb-2">
                    <span>파일 보관소</span> <i className="ph ph-caret-right text-xs"></i> <span
                        className="text-text-main font-bold">내 에이전트 드라이브</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-text-main">디자인 및 마케팅 에셋</h1>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative w-64 mr-2">
                    <i className="ph ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"></i>
                    <input type="text" placeholder="파일 검색..."
                        className="w-full bg-white border border-base-200 outline-none text-sm pl-9 pr-4 py-2 rounded-xl text-text-main placeholder:text-base-300 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-colors focus:border-accent-terracotta/50" />
                </div>
                <button
                    className="w-10 h-10 rounded-xl bg-white border border-base-200 flex items-center justify-center text-text-main shadow-sm hover:bg-base-50 transition-colors">
                    <i className="ph ph-faders"></i>
                </button>
            </div>
        </header>

        {/* Folders Section */}
        <div className="mb-10">
            <h3 className="text-sm font-bold text-text-muted mb-4 uppercase tracking-wider">폴더</h3>
            <div className="grid grid-cols-4 lg:grid-cols-5 gap-4">

                <div className="folder-card p-4 flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-lg bg-accent-amber/10 text-accent-amber flex items-center justify-center text-xl shrink-0">
                        <i className="ph ph-folder-notch"></i></div>
                    <div className="overflow-hidden">
                        <h4 className="font-bold text-text-main text-sm truncate">로고 소스</h4>
                        <p className="text-[10px] text-text-muted mt-0.5">12 파일</p>
                    </div>
                </div>

                <div className="folder-card p-4 flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-lg bg-accent-coral/10 text-accent-coral flex items-center justify-center text-xl shrink-0">
                        <i className="ph ph-folder-open"></i></div>
                    <div className="overflow-hidden">
                        <h4 className="font-bold text-text-main text-sm truncate">Q3 캠페인 소재</h4>
                        <p className="text-[10px] text-text-muted mt-0.5">45 파일 · 공유됨</p>
                    </div>
                </div>

                <div className="folder-card p-4 flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-lg bg-accent-blue/10 text-accent-blue flex items-center justify-center text-xl shrink-0">
                        <i className="ph ph-folder"></i></div>
                    <div className="overflow-hidden">
                        <h4 className="font-bold text-text-main text-sm truncate">비디오 소스</h4>
                        <p className="text-[10px] text-text-muted mt-0.5">2 파일</p>
                    </div>
                </div>

            </div>
        </div>

        {/* Files Section */}
        <div>
            <h3 className="text-sm font-bold text-text-muted mb-4 uppercase tracking-wider">최근 파일</h3>
            <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-20">

                {/* Image File */}
                <div className="file-card group flex flex-col h-56">
                    {/* Thumbnail Area */}
                    <div
                        className="h-32 bg-base-50 rounded-t-[1.25rem] border-b border-base-100 overflow-hidden relative flex items-center justify-center">
                        <img src="https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=400&auto=format&fit=crop"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div
                            className="absolute top-2 right-2 bg-black/40 backdrop-blur-md rounded-lg px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                            JPG</div>
                    </div>
                    {/* Info Area */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                        <h4 className="font-bold text-text-main text-sm truncate">hero_banner_final.jpg</h4>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-[11px] text-text-muted font-medium">1.2 MB</span>
                            <div className="flex -space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    className="w-6 h-6 rounded-full bg-base-100 hover:bg-white border border-transparent hover:border-base-200 text-text-muted flex items-center justify-center shadow-sm"><i
                                        className="ph ph-download-simple text-xs"></i></button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PDF File */}
                <div className="file-card group flex flex-col h-56">
                    {/* Thumbnail Area */}
                    <div
                        className="h-32 bg-base-50 rounded-t-[1.25rem] border-b border-base-100 overflow-hidden relative flex items-center justify-center">
                        <div className="w-12 h-16 bg-white border border-base-200 shadow-sm rounded-sm flex flex-col">
                            <div
                                className="h-3 bg-accent-coral/20 border-b border-base-100 w-full flex items-center justify-center">
                                <i className="ph ph-file-pdf text-[8px] text-accent-coral"></i></div>
                            <div className="p-1 space-y-1 mt-1">
                                <div className="h-0.5 bg-base-200 w-3/4"></div>
                                <div className="h-0.5 bg-base-200 w-full"></div>
                                <div className="h-0.5 bg-base-200 w-5/6"></div>
                            </div>
                        </div>
                        <div
                            className="absolute top-2 right-2 bg-text-main/10 backdrop-blur-md text-text-main rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase">
                            PDF</div>
                    </div>
                    {/* Info Area */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                        <h4 className="font-bold text-text-main text-sm line-clamp-2 leading-snug">
                            V2_Brand_Guidelines_2026.pdf</h4>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-[11px] text-text-muted font-medium">8.4 MB</span>
                            <div className="flex -space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    className="w-6 h-6 rounded-full bg-base-100 hover:bg-white border border-transparent hover:border-base-200 text-text-muted flex items-center justify-center shadow-sm"><i
                                        className="ph ph-download-simple text-xs"></i></button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CSV File (Data Asset) */}
                <div className="file-card group flex flex-col h-56">
                    {/* Thumbnail Area */}
                    <div
                        className="h-32 bg-accent-green/5 rounded-t-[1.25rem] border-b border-base-100 overflow-hidden relative flex items-center justify-center">
                        <i className="ph ph-file-csv text-5xl text-accent-green opacity-50"></i>
                        <div
                            className="absolute top-2 right-2 bg-accent-green/20 backdrop-blur-md text-accent-green rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase">
                            CSV</div>
                    </div>
                    {/* Info Area */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                        <h4 className="font-bold text-text-main text-sm line-clamp-2 leading-snug">customer_leads_q3_raw.csv
                        </h4>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-[11px] text-text-muted font-medium">245 KB</span>
                            <div className="flex -space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    className="w-6 h-6 rounded-full bg-base-100 hover:bg-white border border-transparent hover:border-base-200 text-text-muted flex items-center justify-center shadow-sm"><i
                                        className="ph ph-download-simple text-xs"></i></button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Generated Asset from AI */}
                <div className="file-card group flex flex-col h-56 border-accent-terracotta/30">
                    {/* Thumbnail Area */}
                    <div
                        className="h-32 bg-base-50 rounded-t-[1.25rem] border-b border-base-100 overflow-hidden relative flex items-center justify-center">
                        <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop"
                            className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <div
                            className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 bg-white/20 backdrop-blur-md rounded uppercase text-[9px] font-bold text-white border border-white/30">
                            <i className="ph ph-sparkle text-accent-amber"></i> AI Generated
                        </div>
                    </div>
                    {/* Info Area */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                        <h4 className="font-bold text-text-main text-sm truncate">ai_abstract_bg_warm.png</h4>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-[11px] text-text-muted font-medium">3.1 MB</span>
                            <div className="flex -space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    className="w-6 h-6 rounded-full bg-base-100 hover:bg-white border border-transparent hover:border-base-200 text-text-muted flex items-center justify-center shadow-sm"><i
                                        className="ph ph-download-simple text-xs"></i></button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        {/* Floating Action Button (API: POST /api/workspace/files/upload) */}
        <button
            className="fixed bottom-10 right-10 w-16 h-16 bg-text-main text-white rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(44,44,44,0.3)] hover:scale-105 hover:bg-opacity-90 transition-all z-50 group">
            <i className="ph ph-plus text-3xl group-hover:rotate-90 transition-transform duration-300"></i>

            {/* Tooltip / Expand Menu on hover */}
            <div
                className="absolute bottom-full right-0 mb-4 bg-white border border-base-200 rounded-2xl shadow-soft-lg w-48 overflow-hidden opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all transform translate-y-2 group-hover:translate-y-0 origin-bottom-right">
                <a href="#"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-text-main hover:bg-base-50 border-b border-base-100">
                    <i className="ph ph-upload-simple"></i> 파일 업로드
                </a>
                <a href="#"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-text-main hover:bg-base-50 border-b border-base-100">
                    <i className="ph ph-folder-plus"></i> 새 폴더 만들기
                </a>
                <a href="#"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-accent-terracotta hover:bg-[#fdece6]/30">
                    <i className="ph ph-sparkle"></i> AI 에셋 생성 요청
                </a>
            </div>
        </button>

    </main>
    </>
  );
}

export default AppFiles;
