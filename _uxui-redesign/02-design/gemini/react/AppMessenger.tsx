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

        .list-item {
            transition: all 0.2s ease;
            border: 1px solid transparent;
        }

        .list-item:hover {
            background-color: white;
            border-color: #e8e4d9;
        }

        .list-item.active {
            background-color: white;
            border-color: #e07a5f;
            box-shadow: 0 4px 12px rgba(224, 122, 95, 0.05);
        }
`;

function AppMessenger() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Primary Sidebar */}
    <aside
        className="w-20 flex flex-col items-center justify-between py-8 border-r border-base-200 bg-base-50/50 backdrop-blur-md z-20 shrink-0">
        <div className="flex flex-col items-center gap-6">
            <div
                className="w-10 h-10 rounded-full bg-accent-terracotta flex items-center justify-center text-white font-bold text-xl mb-4">
                C</div>

            <a href="#"
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-text-muted hover:bg-base-100 transition-colors"
                title="홈">
                <i className="ph ph-squares-four text-2xl"></i>
            </a>
            <a href="#"
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-text-muted hover:bg-base-100 transition-colors"
                title="SNS 기획">
                <i className="ph ph-share-network text-2xl"></i>
            </a>
            {/* Active menu */}
            <a href="#"
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-accent-terracotta bg-base-100 transition-colors relative"
                title="메신저 (Unified Inbox)">
                <i className="ph ph-envelope-simple text-2xl"></i>
                <span
                    className="absolute top-2 right-2 w-2.5 h-2.5 bg-accent-coral rounded-full border border-white"></span>
            </a>
        </div>
        <div>
            <img src="https://i.pravatar.cc/100?img=11" alt="Profile"
                className="w-10 h-10 rounded-full border border-base-300" />
        </div>
    </aside>

    {/* Unified Inbox List (API: GET /api/workspace/messenger/inbox) */}
    <aside className="w-[340px] border-r border-base-200 bg-base-100/30 flex flex-col h-full z-10 shrink-0">
        <div className="p-6 pb-4 shrink-0">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-text-main">통합 수신함</h2>
                <div className="flex gap-2">
                    <button
                        className="w-8 h-8 rounded-full bg-white border border-base-200 flex items-center justify-center text-text-main shadow-sm hover:bg-base-50 transition-colors">
                        <i className="ph ph-funnel"></i>
                    </button>
                    {/* API: POST /api/workspace/messenger/compose */}
                    <button
                        className="w-8 h-8 rounded-full bg-text-main flex items-center justify-center text-white shadow-sm hover:bg-opacity-90 transition-colors">
                        <i className="ph ph-pencil-simple"></i>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                <button
                    className="px-3 py-1.5 rounded-full text-xs font-bold bg-white text-text-main shadow-sm border border-base-200 whitespace-nowrap">전체
                    보기</button>
                <button
                    className="px-3 py-1.5 rounded-full text-xs font-medium text-text-muted hover:text-text-main hover:bg-base-50 transition-colors whitespace-nowrap">Slack
                    연동</button>
                <button
                    className="px-3 py-1.5 rounded-full text-xs font-medium text-text-muted hover:text-text-main hover:bg-base-50 transition-colors whitespace-nowrap">이메일</button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar px-3 pb-4 space-y-1">

            {/* Item 1 (Email - Active) */}
            <div className="list-item active p-4 rounded-3xl cursor-pointer relative overflow-hidden group">
                <div
                    className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-accent-terracotta/5 to-transparent rounded-bl-full z-0 pointer-events-none">
                </div>
                <div className="flex justify-between items-start mb-2 relative z-10">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-base-100 flex items-center justify-center text-text-main"><i
                                className="ph ph-envelope"></i></div>
                        <span className="font-bold text-sm text-text-main">Alex (Google)</span>
                    </div>
                    <span className="text-[10px] text-text-muted font-medium">9:41 AM</span>
                </div>
                <h4 className="font-bold text-text-main text-sm mb-1 line-clamp-1 relative z-10">Re: 파트너십 제휴 제안서 검토 요청</h4>
                <p className="text-xs text-text-muted line-clamp-2 leading-relaxed mb-3 relative z-10">보내주신 자료 잘 확인했습니다. 내부
                    팀과 검토한 결과 긍정적인 방향으로 진행해보고자 합니다. 다음 주 줌 미팅 어떠신가요?</p>
                <div className="flex items-center gap-2 relative z-10">
                    <span className="px-2 py-0.5 bg-accent-green/10 text-accent-green text-[10px] font-bold rounded">AI 초안
                        작성됨</span>
                </div>
            </div>

            {/* Item 2 (Slack) */}
            <div className="list-item p-4 rounded-3xl cursor-pointer relative overflow-hidden">
                <div className="flex justify-between items-start mb-2 relative z-10">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-6 h-6 rounded-full bg-[#E01E5A]/10 flex items-center justify-center text-[#E01E5A]">
                            <i className="ph ph-slack-logo"></i></div>
                        <span className="font-bold text-sm text-text-main">#dev-alerts</span>
                    </div>
                    <span className="text-[10px] text-text-muted font-medium">어제</span>
                </div>
                <h4 className="font-bold text-text-main text-sm mb-1 line-clamp-1 relative z-10">결제 API 시간초과 경고상황 발생</h4>
                <p className="text-xs text-text-muted line-clamp-2 leading-relaxed mb-3 relative z-10">[CRITICAL] 서버 가동률 이상
                    조짐이 보입니다. 응답 지연이 1500ms를 초과하였습니다.</p>
                <div className="flex items-center gap-2 relative z-10">
                    <span className="flex items-center -space-x-1">
                        <div
                            className="w-4 h-4 rounded-full bg-accent-amber border border-white text-[8px] flex items-center justify-center text-white font-bold">
                            M</div>
                        <span className="text-[10px] text-text-muted pl-2 font-medium">IT부장 처리 완료</span>
                    </span>
                </div>
            </div>

            {/* Item 3 (Email) */}
            <div className="list-item p-4 rounded-3xl cursor-pointer relative overflow-hidden">
                <div className="flex items-center gap-2 absolute top-4 left-2">
                    <div className="w-1.5 h-1.5 bg-accent-coral rounded-full"></div>
                </div>
                <div className="flex justify-between items-start mb-2 relative z-10 pl-3">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-base-100 flex items-center justify-center text-text-main"><i
                                className="ph ph-envelope"></i></div>
                        <span className="font-bold text-sm text-text-main">영업팀장 (내부)</span>
                    </div>
                    <span className="text-[10px] text-text-muted font-medium">어제</span>
                </div>
                <h4 className="font-bold text-text-main text-sm mb-1 line-clamp-1 relative z-10 pl-3">Q3 영업 실적 보고자료 전달</h4>
                <p className="text-xs text-text-muted line-clamp-2 leading-relaxed relative z-10 pl-3">팀장님, 요청하신 Q3 실적 집계 자료
                    첨부해드립니다. 확인 부탁드립니다.</p>
            </div>

        </div>
    </aside>

    {/* Main Thread / Reading Pane (API: GET /api/workspace/messenger/threads/:id) */}
    <main className="flex-1 flex flex-col h-full bg-[#fcfbf9]/50 relative">

        {/* Header */}
        <header
            className="px-10 py-6 bg-white/60 backdrop-blur-md border-b border-base-200 z-10 shrink-0 flex justify-between items-start">
            <div>
                <div className="flex items-center gap-3 mb-3">
                    <div
                        className="px-2.5 py-1 bg-base-100 rounded-lg flex items-center gap-1.5 text-[11px] font-bold text-text-main">
                        <i className="ph ph-envelope"></i> 이메일
                    </div>
                    <span className="text-xs text-text-muted font-medium">알렉스 (alex@partner-company.com)</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-text-main">Re: 파트너십 제휴 제안서 검토 요청</h1>
            </div>

            <div className="flex gap-2">
                <button
                    className="w-10 h-10 rounded-full bg-white border border-base-200 flex items-center justify-center text-text-muted shadow-sm hover:bg-base-50 transition-colors"
                    title="보관">
                    <i className="ph ph-archive text-lg"></i>
                </button>
                <button
                    className="w-10 h-10 rounded-full bg-white border border-base-200 flex items-center justify-center text-text-muted shadow-sm hover:bg-base-50 transition-colors"
                    title="AI 요약">
                    <i className="ph ph-sparkle text-lg"></i>
                </button>
            </div>
        </header>

        {/* Message History */}
        <div className="flex-1 overflow-y-auto px-10 py-8 hide-scrollbar">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Incoming Message */}
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div
                            className="w-8 h-8 rounded-full bg-base-200 flex items-center justify-center text-text-muted font-bold text-xs uppercase">
                            AL</div>
                        <div>
                            <span className="font-bold text-sm text-text-main mr-2">Alex</span>
                            <span className="text-xs text-text-muted">오늘 오전 9:41</span>
                        </div>
                    </div>
                    <div
                        className="ml-11 bg-white border border-base-200 p-5 rounded-2xl rounded-tl-sm shadow-soft text-[14px] text-text-main leading-relaxed">
                        <p>CEO님, 안녕하세요.</p>
                        <p className="mt-2">보내주신 V2 파트너십 제안 자료 잘 확인했습니다. 내부 경영진과 검토한 결과 저희 기존 인프라와 시너지가 날 부분이 많아 긍정적인 방향으로
                            진행해보고자 합니다.</p>
                        <p className="mt-2">다음 주 중에 줌 미팅을 통해 구체적인 연동 로드맵에 대해 논의하고 싶은데, 가능하신 시간 2-3개 정도 제안해주시면 감사하겠습니다.</p>
                        <p className="mt-4 text-text-muted">Best regards,<br />Alex. VP of Product.</p>
                    </div>
                </div>

            </div>
        </div>

        {/* AI Draft Compose Area (API: POST /api/workspace/messenger/threads/:id/reply) */}
        <div
            className="absolute bottom-0 left-0 right-0 p-8 pt-0 bg-gradient-to-t from-[#fcfbf9] via-[#fcfbf9] to-transparent shrink-0">
            <div className="max-w-4xl mx-auto">
                <div
                    className="bg-white rounded-3xl border border-[#d5cfc1] shadow-[0_10px_40px_rgba(224,122,95,0.08)] overflow-hidden transition-all focus-within:ring-2 focus-within:ring-accent-terracotta/20 relative">

                    {/* AI Status Header */}
                    <div className="px-5 py-3 border-b border-base-100 bg-[#fdece6]/30 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <i className="ph ph-sparkle text-accent-terracotta"></i>
                            <span className="text-[11px] font-bold text-text-main">비서실장(매니저)이 초안을 작성했습니다</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* User Actions on Draft */}
                            <button
                                className="px-3 py-1 bg-white border border-base-200 rounded text-[11px] font-bold text-text-main hover:bg-base-50 transition-colors">다시
                                쓰기</button>
                            <button
                                className="px-3 py-1 bg-accent-terracotta text-white rounded text-[11px] font-bold hover:bg-opacity-90 transition-colors">이대로
                                발송 완료</button>
                        </div>
                    </div>

                    <div className="p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xs text-text-muted w-12 shrink-0">받는사람</span>
                            <div className="flex gap-1.5 flex-wrap flex-1">
                                <span
                                    className="bg-base-50 px-2 py-0.5 rounded text-xs text-text-main border border-base-200 flex items-center gap-1">
                                    alex@partner-company.com <button><i
                                            className="ph ph-x text-[10px] text-text-muted hover:text-text-main"></i></button>
                                </span>
                            </div>
                        </div>

                        {/* Draft Content (Editable by user) */}
                        <textarea
                            className="w-full min-h-[160px] resize-none outline-none text-[14px] text-text-main leading-relaxed bg-transparent"
                            placeholder="여기에 이메일 내용을 작성하세요...">Alex, 안녕하세요.

긍정적인 피드백 감사합니다. 저희 또한 이번 파트너십을 통해 양사의 시너지가 기대됩니다.
다음 주 화요일(오전 10시) 또는 수요일(오후 3시) 중 편하신 시간대에 줌 미팅을 진행하면 좋을 것 같습니다.

확인해주시면 미팅 링크 전달 드리겠습니다.

감사합니다.</textarea>
                    </div>

                    {/* Bot Toolbar */}
                    <div className="px-5 py-3 border-t border-base-100 bg-base-50 flex justify-between items-center">
                        <div className="flex gap-1">
                            <button
                                className="w-8 h-8 rounded shrink-0 flex items-center justify-center text-text-muted hover:bg-white transition-colors"
                                title="서식"><i className="ph ph-text-t"></i></button>
                            <button
                                className="w-8 h-8 rounded shrink-0 flex items-center justify-center text-text-muted hover:bg-white transition-colors"
                                title="첨부파일"><i className="ph ph-paperclip"></i></button>
                            <button
                                className="w-8 h-8 rounded shrink-0 flex items-center justify-center text-text-muted hover:bg-white transition-colors"
                                title="캘린더 시간 추가"><i className="ph ph-calendar"></i></button>
                        </div>
                        <div>
                            <span className="text-[10px] text-text-muted">문법 검사 완료. 발송 준비 됨.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </main>
    </>
  );
}

export default AppMessenger;
