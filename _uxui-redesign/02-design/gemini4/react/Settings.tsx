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

function Settings() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Sidebar */}
    <aside className="w-64 bg-surface border-r border-border flex flex-col h-full z-10 shadow-soft shrink-0">
        <div className="p-6">
            <h2 className="font-serif text-2xl tracking-tight text-primary font-bold">CORTHEX</h2>
            <p className="text-xs text-text-light mt-1">회사명: 알파 랩스</p>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            <a href="/app/home" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6">
                    </path>
                </svg>
                홈 대시보드
            </a>
            <a href="/app/command-center" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z">
                    </path>
                </svg>
                사령관실
            </a>
            <p className="px-4 text-[10px] font-bold text-text-light uppercase tracking-widest mt-6 mb-2">관리</p>
            <a href="/app/departments" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4">
                    </path>
                </svg>
                조직 및 예산
            </a>
            <a href="/app/credentials" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z">
                    </path>
                </svg>
                API 연동 자격증명
            </a>
            <a href="/app/settings" className="nav-item active border-t border-border mt-4 pt-4 rounded-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z">
                    </path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                환경설정 (Settings)
            </a>
        </nav>
    </aside>

    {/* Content Split Layout */}
    <div className="flex-1 flex overflow-hidden">

        {/* Settings Menu Tree */}
        <aside className="w-64 bg-background-alt border-r border-border flex flex-col h-full z-0 shrink-0">
            <div className="p-5 border-b border-border">
                <h2 className="font-serif text-lg text-text-main">설정</h2>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-1">
                <div className="px-3">
                    <p className="text-[10px] font-bold text-text-light uppercase tracking-widest mb-2 mt-2">내 계정</p>
                    <a href="#"
                        className="block px-3 py-2 rounded-lg text-sm text-primary font-bold bg-surface shadow-sm border border-border">프로필
                        및 보안</a>
                    <a href="#"
                        className="block px-3 py-2 rounded-lg text-sm text-text-muted hover:text-text-main hover:bg-surface/50 transition-colors">알림
                        설정 (웹/이메일)</a>
                </div>

                <div className="px-3 mt-6">
                    <p className="text-[10px] font-bold text-text-light uppercase tracking-widest mb-2 mt-4">워크스페이스 (관리자)
                    </p>
                    <a href="#"
                        className="block px-3 py-2 rounded-lg text-sm text-text-muted hover:text-text-main hover:bg-surface/50 transition-colors">기본
                        정보</a>
                    <a href="#"
                        className="block px-3 py-2 rounded-lg text-sm text-text-muted hover:text-text-main hover:bg-surface/50 transition-colors">멤버
                        및 권한 (Users)</a>
                    <a href="#"
                        className="block px-3 py-2 rounded-lg text-sm text-text-muted hover:text-text-main hover:bg-surface/50 transition-colors">결제
                        수단 및 플랜</a>
                    <a href="#"
                        className="block px-3 py-2 rounded-lg text-sm text-text-muted hover:text-text-main hover:bg-surface/50 transition-colors">데이터
                        내보내기/백업</a>
                </div>

                <div className="px-3 mt-6">
                    <p className="text-[10px] font-bold text-text-light uppercase tracking-widest mb-2 mt-4">에이전트 엔진 (전역)
                    </p>
                    <a href="#"
                        className="block px-3 py-2 rounded-lg text-sm text-text-muted hover:text-text-main hover:bg-surface/50 transition-colors">기본
                        LLM 모델 설정</a>
                    <a href="#"
                        className="block px-3 py-2 rounded-lg text-sm text-text-muted hover:text-text-main hover:bg-surface/50 transition-colors">기억
                        저장소 (Memory) 비우기</a>
                    <a href="#"
                        className="block px-3 py-2 rounded-lg text-sm text-text-muted hover:text-text-main hover:bg-surface/50 transition-colors text-red-600">안전
                        및 차단 키워드</a>
                </div>
            </div>
        </aside>

        {/* Settings Content View */}
        {/* API: GET /api/workspace/settings/profile */}
        {/* API: PUT /api/workspace/settings/profile */}
        <main className="flex-1 overflow-y-auto px-10 py-10 relative bg-surface">

            <div className="max-w-3xl">
                <header className="mb-10">
                    <h1 className="text-3xl font-serif text-text-main mb-2">프로필 및 보안</h1>
                    <p className="text-text-muted">내 계정 정보와 보안 설정을 관리합니다.</p>
                </header>

                <div className="space-y-10">

                    {/* Section: Profile Picture */}
                    <section>
                        <h3 className="text-sm font-bold text-text-main mb-4 border-b border-border pb-2">프로필 사진</h3>
                        <div className="flex items-center gap-6">
                            <div
                                className="w-20 h-20 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-2xl shadow-inner border border-border">
                                김</div>
                            <div className="flex gap-2">
                                <button
                                    className="bg-surface border border-border text-text-main px-4 py-2 rounded-lg hover:bg-background-alt transition-colors font-medium shadow-sm text-sm">이미지
                                    업로드</button>
                                <button
                                    className="bg-transparent text-text-muted px-4 py-2 rounded-lg hover:text-red-500 transition-colors text-sm">기본값으로
                                    변경</button>
                            </div>
                        </div>
                    </section>

                    {/* Section: Personal Info */}
                    <section>
                        <h3 className="text-sm font-bold text-text-main mb-4 border-b border-border pb-2">기본 정보</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">이름
                                    (표시명)</label>
                                <input type="text" value="김대표 (CEO)"
                                    className="w-full bg-background border border-border text-text-main rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-light focus:bg-surface transition-colors" />
                            </div>
                            <div>
                                <label
                                    className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">이메일
                                    주소</label>
                                <input type="email" value="ceo@alphalabs.com" disabled
                                    className="w-full bg-background-alt border border-border text-text-muted rounded-lg px-3 py-2 text-sm cursor-not-allowed" />
                                <p className="text-[10px] text-text-light mt-1">이메일 변경은 워크스페이스 관리자에게 문의하세요.</p>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">직책
                                    / 역할</label>
                                <input type="text" value="최고 경영자"
                                    className="w-full bg-background border border-border text-text-main rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-light focus:bg-surface transition-colors" />
                            </div>
                        </div>
                    </section>

                    {/* Section: Security */}
                    <section>
                        <h3 className="text-sm font-bold text-text-main mb-4 border-b border-border pb-2">보안 설정</h3>

                        <div
                            className="flex justify-between items-center bg-background border border-border rounded-xl p-4 mb-4">
                            <div>
                                <p className="text-sm font-bold text-text-main">비밀번호 변경</p>
                                <p className="text-xs text-text-muted mt-1">마지막 변경일: 3개월 전</p>
                            </div>
                            <button
                                className="bg-surface border border-border text-text-main px-3 py-1.5 rounded-lg hover:bg-background-alt transition-colors font-medium shadow-sm text-xs">변경하기</button>
                        </div>

                        <div
                            className="flex justify-between items-center bg-background border border-border rounded-xl p-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-text-main">2단계 인증 (2FA)</p>
                                    <span
                                        className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">사용
                                        중</span>
                                </div>
                                <p className="text-xs text-text-muted mt-1">보안을 위해 2단계 인증이 활성화되어 있습니다. (Google
                                    Authenticator)</p>
                            </div>
                            <button
                                className="bg-surface border border-border text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors font-medium shadow-sm text-xs">비활성화</button>
                        </div>
                    </section>

                    {/* Section: Appearance */}
                    <section>
                        <h3 className="text-sm font-bold text-text-main mb-4 border-b border-border pb-2">화면 테마</h3>
                        <div className="flex gap-4">
                            {/* Theme Option (Selected) */}
                            <div
                                className="border-2 border-primary rounded-xl overflow-hidden cursor-pointer w-32 shadow-sm">
                                <div className="h-20 bg-[#faf8f5] p-2 flex flex-col gap-1">
                                    <div className="h-2 bg-[#fdfcfb] border border-[#e5e0d8] rounded w-full"></div>
                                    <div className="h-2 bg-[#fdfcfb] border border-[#e5e0d8] rounded w-3/4"></div>
                                    <div className="h-4 bg-[#5a7247] rounded w-1/2 mt-auto"></div>
                                </div>
                                <div
                                    className="bg-surface p-2 text-center text-xs font-bold text-text-main border-t border-border">
                                    내추럴 매뉴얼</div>
                            </div>

                            {/* Theme Option */}
                            <div
                                className="border border-border rounded-xl overflow-hidden cursor-pointer w-32 hover:border-text-light transition-colors opacity-70">
                                <div className="h-20 bg-[#1e1e1e] p-2 flex flex-col gap-1">
                                    <div className="h-2 bg-[#2d2d2d] border border-[#333] rounded w-full"></div>
                                    <div className="h-2 bg-[#2d2d2d] border border-[#333] rounded w-3/4"></div>
                                    <div className="h-4 bg-[#d4a843] rounded w-1/2 mt-auto"></div>
                                </div>
                                <div
                                    className="bg-surface p-2 text-center text-xs font-medium text-text-muted border-t border-border">
                                    다크 (Dark)</div>
                            </div>
                        </div>
                    </section>

                    {/* Action Buttons */}
                    <div className="pt-6 border-t border-border flex justify-end gap-3">
                        <button
                            className="text-text-muted bg-transparent px-4 py-2 rounded-lg hover:bg-background transition-colors text-sm font-medium">취소</button>
                        <button
                            className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg transition-colors text-sm font-bold shadow-sm">변경사항
                            저장</button>
                    </div>

                </div>
            </div>

        </main>
    </div>
    </>
  );
}

export default Settings;
