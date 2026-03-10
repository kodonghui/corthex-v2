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

function AdminDashboard() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Admin Sidebar */}
    <aside className="w-64 bg-surface border-r border-border flex flex-col h-full z-10 shadow-soft shrink-0">
        <div className="p-6 border-b border-border">
            <h2 className="font-serif text-2xl tracking-tight text-primary font-bold">CORTHEX</h2>
            <div className="flex items-center gap-1 mt-1">
                <span
                    className="bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded text-[10px] font-bold">ADMIN
                    PANEL</span>
            </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            <p className="px-4 text-[10px] font-bold text-text-light uppercase tracking-widest mb-2">플랫폼 관리</p>
            <a href="/admin/dashboard" className="nav-item active">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6">
                    </path>
                </svg>
                전체 대시보드
            </a>
            <a href="/admin/agents" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10">
                    </path>
                </svg>
                글로벌 에이전트 목록
            </a>
            <a href="/admin/companies" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4">
                    </path>
                </svg>
                고객사(Workspace) 관리
            </a>
            <a href="/admin/users" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z">
                    </path>
                </svg>
                전체 회원 명부
            </a>

            <p className="px-4 text-[10px] font-bold text-text-light uppercase tracking-widest mt-6 mb-2">조직도/권한 템플릿</p>
            <a href="/admin/departments" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z">
                    </path>
                </svg>
                기본 부서 템플릿
            </a>
            <a href="/admin/org-chart" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
                    </path>
                </svg>
                표준 조직도 관리
            </a>

            <p className="px-4 text-[10px] font-bold text-text-light uppercase tracking-widest mt-6 mb-2">프롬프트 & 영혼(Soul)
            </p>
            <a href="/admin/soul-templates" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z">
                    </path>
                </svg>
                에이전트 인격체(Soul)
            </a>
            <a href="/admin/tools" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z">
                    </path>
                </svg>
                연동 도구(Tools) 관리
            </a>

            <p className="px-4 text-[10px] font-bold text-text-light uppercase tracking-widest mt-6 mb-2">운영 및 시스템</p>
            <a href="/admin/monitoring" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
                    </path>
                </svg>
                이용량 모니터링
            </a>
        </nav>

        <div className="p-4 border-t border-border">
            <a href="/app/home"
                className="flex items-center justify-center gap-2 p-2 rounded-lg bg-surface border border-border text-text-muted hover:bg-background-alt transition-colors w-full text-xs font-bold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1">
                    </path>
                </svg>
                워크스페이스로 돌아가기
            </a>
        </div>
    </aside>

    {/* Main Content */}
    {/* API: GET /api/admin/dashboard/summary */}
    <main className="flex-1 overflow-y-auto px-8 py-10 relative">
        <header className="mb-10 lg:flex lg:justify-between lg:items-end">
            <div>
                <h1 className="text-3xl font-serif text-text-main font-bold mb-2">플랫폼 전체 대시보드</h1>
                <p className="text-text-muted">CORTHEX SaaS 인프라의 전반적인 운영 지표 및 시스템 상태를 요약합니다.</p>
            </div>

            <div className="mt-4 lg:mt-0">
                <button
                    className="bg-surface border border-border text-text-main px-4 py-2 rounded-xl hover:bg-background-alt transition-colors font-medium shadow-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                        </path>
                    </svg>
                    데이터 새로고침 (방금 전)
                </button>
            </div>
        </header>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card p-5 border-l-4 border-l-primary flex flex-col justify-between">
                <div>
                    <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-1">활성 고객사 (Workspaces)
                    </p>
                    <div className="flex items-end gap-2">
                        <p className="text-3xl font-serif font-bold text-text-main">1,204</p>
                        <span className="text-xs text-primary font-bold mb-1 flex items-center"><svg className="w-3 h-3 mr-0.5"
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                            </svg> 12%</span>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-xs text-text-muted">
                    <span>이번 주 신규: +45</span>
                    <a href="/admin/companies" className="text-primary hover:underline">상세보기</a>
                </div>
            </div>

            <div className="card p-5 border-l-4 border-l-secondary flex flex-col justify-between">
                <div>
                    <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-1">총 인스턴스화된 에이전트</p>
                    <div className="flex items-end gap-2">
                        <p className="text-3xl font-serif font-bold text-text-main">48,912</p>
                        <span className="text-xs text-primary font-bold mb-1 flex items-center"><svg className="w-3 h-3 mr-0.5"
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                            </svg> 24%</span>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-xs text-text-muted">
                    <span>워크스페이스당 평균: 40.6명</span>
                </div>
            </div>

            <div className="card p-5 border-l-4 border-l-accent flex flex-col justify-between">
                <div>
                    <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-1">일일 API 호출량 (Token)
                    </p>
                    <div className="flex items-end gap-2">
                        <p className="text-3xl font-serif font-bold text-text-main">342M</p>
                        <span className="text-xs text-secondary font-bold mb-1 flex items-center"><svg
                                className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                            </svg> 3%</span>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-xs text-text-muted">
                    <span>초당 처리량: ~1.2K req/s</span>
                    <a href="/admin/monitoring" className="text-primary hover:underline">모니터링</a>
                </div>
            </div>

            <div className="card p-5 border-l-4 border-l-[#73706c] flex flex-col justify-between">
                <div>
                    <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-1">시스템 상태 (Health)</p>
                    <div className="flex items-center gap-3 mt-1">
                        <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
                        <p className="text-xl font-bold text-text-main">All Systems Operational</p>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-xs text-text-muted">
                    <span>최종 점검: 2분 전</span>
                </div>
            </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent System Alerts */}
            <div className="card p-0 flex flex-col">
                <div className="p-5 border-b border-border flex justify-between items-center">
                    <h3 className="font-serif text-lg text-text-main">시스템 알림 & 로그</h3>
                    <button className="text-xs text-text-muted hover:text-primary font-medium">전체 보기</button>
                </div>
                <div className="p-2 flex-1 overflow-y-auto max-h-80">
                    <div
                        className="p-3 hover:bg-background rounded-lg transition-colors border-l-2 border-transparent hover:border-text-light cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                            <span
                                className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded font-bold">INFO</span>
                            <span className="text-[10px] text-text-light">10분 전</span>
                        </div>
                        <p className="text-sm text-text-main font-medium">GPT-4 Turbo 모델 엔드포인트 응답 지연 (해결됨)</p>
                        <p className="text-xs text-text-muted mt-1 truncate">유럽 리전의 API 라우팅 최적화 작업으로 인한 일시적 지연 발생 후
                            정상화되었습니다.</p>
                    </div>
                    <div
                        className="p-3 hover:bg-background rounded-lg transition-colors border-l-2 border-transparent hover:border-text-light cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                            <span
                                className="bg-secondary/10 text-secondary text-[10px] px-1.5 py-0.5 rounded font-bold">WARN</span>
                            <span className="text-[10px] text-text-light">1시간 전</span>
                        </div>
                        <p className="text-sm text-text-main font-medium">'스타트업_A' 워크스페이스 요금 한도 초과 임박 (95%)</p>
                        <p className="text-xs text-text-muted mt-1 truncate">자동 결제 실패 및 서비스 제한 가능성이 있으므로 알림 이메일이 발송되었습니다.
                        </p>
                    </div>
                    <div
                        className="p-3 hover:bg-background rounded-lg transition-colors border-l-2 border-transparent hover:border-text-light cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                            <span
                                className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded font-bold">INFO</span>
                            <span className="text-[10px] text-text-light">어제 22:00</span>
                        </div>
                        <p className="text-sm text-text-main font-medium">정기 데이터베이스 백업 완료</p>
                        <p className="text-xs text-text-muted mt-1 truncate">S3 스토리지에 모든 고객사 메타데이터 백업이 성공적으로 저장되었습니다.</p>
                    </div>
                </div>
            </div>

            {/* Popular Agent Templates */}
            <div className="card p-0 flex flex-col">
                <div className="p-5 border-b border-border flex justify-between items-center">
                    <h3 className="font-serif text-lg text-text-main">인기 시스템 에이전트 (채택률)</h3>
                    <a href="/admin/agents" className="text-xs text-text-muted hover:text-primary font-medium">에이전트
                        관리</a>
                </div>
                <div className="p-5 flex-1">
                    <ul className="space-y-4">
                        {/* Top 1 */}
                        <li className="flex items-center gap-4">
                            <div
                                className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center font-bold text-text-main shadow-sm text-lg">
                                1</div>
                            <div className="flex-1">
                                <div className="flex justify-between items-end mb-1">
                                    <p className="font-bold text-text-main text-sm">마케팅 카피라이터</p>
                                    <span className="text-xs text-text-muted">890 개사</span>
                                </div>
                                <div className="w-full bg-background rounded-full h-1.5">
                                    <div className="bg-primary h-1.5 rounded-full" style={{width: "85%"}}></div>
                                </div>
                            </div>
                        </li>
                        {/* Top 2 */}
                        <li className="flex items-center gap-4">
                            <div
                                className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center font-bold text-text-main shadow-sm text-lg">
                                2</div>
                            <div className="flex-1">
                                <div className="flex justify-between items-end mb-1">
                                    <p className="font-bold text-text-main text-sm">경영 지원 비서</p>
                                    <span className="text-xs text-text-muted">745 개사</span>
                                </div>
                                <div className="w-full bg-background rounded-full h-1.5">
                                    <div className="bg-primary h-1.5 rounded-full" style={{width: "72%"}}></div>
                                </div>
                            </div>
                        </li>
                        {/* Top 3 */}
                        <li className="flex items-center gap-4">
                            <div
                                className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center font-bold text-text-main shadow-sm text-lg">
                                3</div>
                            <div className="flex-1">
                                <div className="flex justify-between items-end mb-1">
                                    <p className="font-bold text-text-main text-sm">데이터 애널리스트</p>
                                    <span className="text-xs text-text-muted">620 개사</span>
                                </div>
                                <div className="w-full bg-background rounded-full h-1.5">
                                    <div className="bg-accent h-1.5 rounded-full" style={{width: "60%"}}></div>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

    </main>
    </>
  );
}

export default AdminDashboard;
