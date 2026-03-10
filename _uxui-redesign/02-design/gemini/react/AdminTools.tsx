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

        .tool-category-nav::-webkit-scrollbar {
            display: none;
        }
`;

function AdminTools() {
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
                {/* Active menu */}
                <a href="#"
                    className="flex items-center gap-3 px-4 py-3 font-medium text-accent-terracotta bg-white rounded-xl border border-[#e8e4d9] shadow-sm transition-colors">
                    <i className="ph ph-wrench text-lg"></i> Global Tools Registry
                </a>
                <a href="#"
                    className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-white/50 rounded-xl transition-colors">
                    <i className="ph ph-user-focus text-lg"></i> Soul Templates
                </a>
            </nav>
        </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 overflow-hidden flex flex-col relative hide-scrollbar">

        <header
            className="px-12 py-8 bg-[#f5f3ec]/90 backdrop-blur-md z-10 shrink-0 sticky top-0 border-b border-[#e8e4d9]">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-main">Global Tools Registry</h1>
                    <p className="text-text-muted mt-2 text-sm">에이전트들이 사용할 수 있는 125+ 외부 API 및 내부 기능 도구를 등록하고 관리합니다.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        className="bg-white border border-[#e8e4d9] text-text-main px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-base-50 transition-colors flex items-center gap-2">
                        <i className="ph ph-code"></i> Developer API
                    </button>
                    <button
                        className="bg-text-main text-white px-5 py-2.5 flex items-center gap-2 rounded-xl text-sm font-bold shadow-soft hover:bg-opacity-90 transition-colors">
                        <i className="ph ph-plus-circle text-lg"></i> Register Tool
                    </button>
                </div>
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto tool-category-nav pb-2">
                <button
                    className="px-4 py-2 rounded-full bg-text-main text-white text-sm font-bold whitespace-nowrap shadow-sm">All
                    Tools (125)</button>
                <button
                    className="px-4 py-2 rounded-full border border-[#e8e4d9] bg-white text-text-muted hover:text-text-main hover:bg-base-50 text-sm font-bold whitespace-nowrap transition-colors">Finance
                    / Investing (24)</button>
                <button
                    className="px-4 py-2 rounded-full border border-[#e8e4d9] bg-white text-text-muted hover:text-text-main hover:bg-base-50 text-sm font-bold whitespace-nowrap transition-colors">Marketing
                    / SEO (18)</button>
                <button
                    className="px-4 py-2 rounded-full border border-[#e8e4d9] bg-white text-text-muted hover:text-text-main hover:bg-base-50 text-sm font-bold whitespace-nowrap transition-colors">System
                    / Files (32)</button>
                <button
                    className="px-4 py-2 rounded-full border border-[#e8e4d9] bg-white text-text-muted hover:text-text-main hover:bg-base-50 text-sm font-bold whitespace-nowrap transition-colors">Web
                    Automation (12)</button>
            </div>

            <div className="mt-4 relative w-1/2 min-w-[300px]">
                <i className="ph ph-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-lg"></i>
                <input type="text" placeholder="도구 이름, 기능 설명 검색..."
                    className="w-full bg-white border border-[#e8e4d9] outline-none text-sm pl-12 pr-4 py-3 rounded-2xl text-text-main placeholder:text-base-300 shadow-sm focus:border-accent-terracotta/50" />
            </div>
        </header>

        {/* Tools List Grid */}
        <div className="flex-1 overflow-y-auto px-12 py-8 hide-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

                {/* KIS Trade Tool */}
                <div className="panel p-5 flex flex-col h-full hover:border-[#d5cfc1] transition-colors relative">
                    <div
                        className="absolute top-4 right-4 bg-[#f0f9f4] text-accent-green px-2 py-0.5 rounded text-[10px] font-bold border border-accent-green/20">
                        Active</div>

                    <div
                        className="w-10 h-10 rounded-lg bg-[#f0f9f4] text-accent-green flex items-center justify-center text-xl mb-4">
                        <i className="ph ph-currency-krw"></i></div>

                    <h3 className="font-bold text-text-main mb-1">kis_transmit_order</h3>
                    <p className="text-[10px] text-text-muted font-mono mb-3">Finance / Investing</p>

                    <p className="text-xs text-text-muted mb-4 flex-1">한국투자증권(KIS) API를 사용하여 주식의 실거래 또는 모의거래 매수/매도 주문을
                        전송합니다.</p>

                    <div className="border-t border-[#e8e4d9] pt-3 mt-auto">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-text-muted font-mono"><i
                                    className="ph ph-check-circle text-accent-green mr-1"></i>Required: OAuth</span>
                            <button className="text-text-main hover:bg-base-50 p-1 rounded transition-colors"><i
                                    className="ph ph-gear text-lg"></i></button>
                        </div>
                    </div>
                </div>

                {/* Web Scraper Tool */}
                <div className="panel p-5 flex flex-col h-full hover:border-[#d5cfc1] transition-colors relative">
                    <div
                        className="absolute top-4 right-4 bg-[#f0f9f4] text-accent-green px-2 py-0.5 rounded text-[10px] font-bold border border-accent-green/20">
                        Active</div>

                    <div
                        className="w-10 h-10 rounded-lg bg-[#eef4f9] text-accent-blue flex items-center justify-center text-xl mb-4">
                        <i className="ph ph-globe"></i></div>

                    <h3 className="font-bold text-text-main mb-1">web_scrape_content</h3>
                    <p className="text-[10px] text-text-muted font-mono mb-3">Web Automation</p>

                    <p className="text-xs text-text-muted mb-4 flex-1">제공된 URL의 웹페이지 내용을 파싱하고 주요 텍스트 컨텐츠를 추출하여 Markdown 형태로
                        반환합니다.</p>

                    <div className="border-t border-[#e8e4d9] pt-3 mt-auto">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-text-muted font-mono"><i
                                    className="ph ph-info text-base-300 mr-1"></i>No Auth Required</span>
                            <button className="text-text-main hover:bg-base-50 p-1 rounded transition-colors"><i
                                    className="ph ph-gear text-lg"></i></button>
                        </div>
                    </div>
                </div>

                {/* Database Connect */}
                <div className="panel p-5 flex flex-col h-full hover:border-[#d5cfc1] transition-colors relative">
                    <div
                        className="absolute top-4 right-4 bg-[#fdf5f5] text-accent-coral px-2 py-0.5 rounded text-[10px] font-bold border border-accent-coral/20">
                        Restricted</div>

                    <div
                        className="w-10 h-10 rounded-lg bg-base-200 text-text-main flex items-center justify-center text-xl mb-4">
                        <i className="ph ph-database"></i></div>

                    <h3 className="font-bold text-text-main mb-1">execute_sql_query</h3>
                    <p className="text-[10px] text-text-muted font-mono mb-3">System / Files</p>

                    <p className="text-xs text-text-muted mb-4 flex-1">에이전트가 격리된 샌드박스 내부의 테넌트 DB에 Read-Only SQL 쿼리를 실행할 수 있게
                        합니다.</p>

                    <div className="border-t border-[#e8e4d9] pt-3 mt-auto">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-accent-coral font-bold flex items-center gap-1"><i
                                    className="ph ph-shield-warning"></i> Needs DB URI</span>
                            <button className="text-text-main hover:bg-base-50 p-1 rounded transition-colors"><i
                                    className="ph ph-gear text-lg"></i></button>
                        </div>
                    </div>
                </div>

                {/* SNS Publisher */}
                <div
                    className="panel p-5 flex flex-col h-full hover:border-[#d5cfc1] transition-colors relative opacity-60">
                    <div
                        className="absolute top-4 right-4 bg-base-50 border border-[#e8e4d9] text-text-muted px-2 py-0.5 rounded text-[10px] font-bold">
                        Draft</div>

                    <div
                        className="w-10 h-10 rounded-lg bg-[#fff5f2] text-accent-terracotta flex items-center justify-center text-xl mb-4">
                        <i className="ph ph-share-network"></i></div>

                    <h3 className="font-bold text-text-main mb-1">publish_sns_post</h3>
                    <p className="text-[10px] text-text-muted font-mono mb-3">Marketing / SEO</p>

                    <p className="text-xs text-text-muted mb-4 flex-1">네이버, 브런치 등 헤드리스 브라우저가 필요한 플랫폼에 작성된 콘텐츠를 자동 업로드합니다.
                    </p>

                    <div className="border-t border-[#e8e4d9] pt-3 mt-auto">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-text-muted font-mono"><i
                                    className="ph ph-warning-circle text-accent-amber mr-1"></i>Missing Config</span>
                            <button className="text-text-main hover:bg-base-50 p-1 rounded transition-colors"><i
                                    className="ph ph-gear text-lg"></i></button>
                        </div>
                    </div>
                </div> {/* /card */}

            </div>
        </div>

    </main>
    </>
  );
}

export default AdminTools;
