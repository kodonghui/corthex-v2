"use client";
import React from "react";

const styles = `
body {
            background-color: #F4F4F0;
            color: #1E1E1E;
        }

        .neo-border {
            border: 3px solid #1E1E1E;
        }

        .neo-shadow {
            box-shadow: 4px 4px 0px 0px rgba(30, 30, 30, 1);
        }

        .neo-shadow-sm {
            box-shadow: 2px 2px 0px 0px rgba(30, 30, 30, 1);
        }

        .neo-card {
            border: 3px solid #1E1E1E;
            box-shadow: 8px 8px 0px 0px rgba(30, 30, 30, 1);
            background-color: white;
        }

        .neo-btn {
            border: 3px solid #1E1E1E;
            box-shadow: 4px 4px 0px 0px rgba(30, 30, 30, 1);
            transition: all 0.1s ease-in-out;
            font-weight: 700;
            cursor: pointer;
        }

        .neo-btn:hover {
            transform: translate(-2px, -2px);
            box-shadow: 6px 6px 0px 0px rgba(30, 30, 30, 1);
        }

        .neo-btn:active {
            transform: translate(4px, 4px);
            box-shadow: 0px 0px 0px 0px rgba(30, 30, 30, 1);
        }

        .nav-item.active {
            background-color: #BFFF00;
            border: 3px solid #1E1E1E;
            box-shadow: 2px 2px 0px 0px rgba(30, 30, 30, 1);
        }

        .nav-item:hover:not(.active) {
            background-color: #E5E5E5;
        }

        /* Chat Specific styles */
        .msg-bubble-ai {
            border: 3px solid #1E1E1E;
            box-shadow: 4px 4px 0px 0px #FF3366;
            background-color: white;
            border-bottom-left-radius: 0;
        }

        .msg-bubble-user {
            border: 3px solid #1E1E1E;
            box-shadow: -4px 4px 0px 0px #00E5FF;
            background-color: #BFFF00;
            border-bottom-right-radius: 0;
        }

        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
            border-left: 3px solid #1E1E1E;
        }

        ::-webkit-scrollbar-track {
            background: #F4F4F0;
        }

        ::-webkit-scrollbar-thumb {
            background: #1E1E1E;
        }
`;

function Chat() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Sidebar Navigation (Main) */}
    <nav
        className="w-[80px] border-r-3 border-neo-black bg-neo-black flex flex-col items-center py-6 z-20 shrink-0 shadow-[4px_0px_0px_0px_rgba(30,30,30,1)]">
        <div
            className="w-12 h-12 bg-neo-yellow neo-border flex items-center justify-center font-black text-xl mb-8 -rotate-6">
            CX</div>

        <div className="flex flex-col gap-6">
            <a href="/app/home"
                className="w-12 h-12 bg-white flex items-center justify-center border-2 border-transparent hover:border-white hover:bg-transparent hover:text-white transition-colors group">
                <svg className="group-hover:stroke-white" width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                </svg>
            </a>
            <a href="/app/command-center"
                className="w-12 h-12 bg-white flex items-center justify-center border-2 border-transparent hover:border-white hover:bg-transparent hover:text-white transition-colors group">
                <svg className="group-hover:stroke-white" width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5">
                    <polyline points="4 7 4 4 20 4 20 7"></polyline>
                    <line x1="9" y1="20" x2="15" y2="20"></line>
                    <line x1="12" y1="4" x2="12" y2="20"></line>
                </svg>
            </a>
            <a href="/app/chat"
                className="w-12 h-12 bg-neo-pink text-white neo-border shadow-[2px_2px_0px_#FFF] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
            </a>
        </div>
    </nav>

    {/* Sub-navigation (Channels/Sessions List) */}
    {/* API: GET /api/workspace/conversations */}
    <aside className="w-72 border-r-3 border-neo-black bg-white flex flex-col h-full z-10 shrink-0">
        <div className="p-4 border-b-3 border-neo-black bg-neo-bg">
            <h2 className="text-xl font-black uppercase mb-4 flex justify-between items-center">
                Chats
                <button
                    className="w-8 h-8 bg-neo-lime border-2 border-black flex items-center justify-center font-black hover:bg-neo-yellow">+</button>
            </h2>

            <div className="flex bg-white neo-border p-1 w-full">
                <button
                    className="flex-1 bg-neo-black text-white px-2 py-1 text-xs font-bold uppercase cursor-default">Agents</button>
                <button className="flex-1 hover:bg-gray-200 px-2 py-1 text-xs font-bold uppercase transition-colors">Team
                    (3)</button>
            </div>
        </div>

        <div className="flex-grow overflow-y-auto w-full group/list">

            {/* Category Header */}
            <div className="px-4 py-2 bg-gray-100 border-b-3 border-neo-black text-xs font-black tracking-widest uppercase">
                Direct Messages</div>

            {/* Chat Session Item - Active */}
            <div className="p-4 border-b-3 border-neo-black bg-neo-lime cursor-pointer relative overflow-hidden">
                <div className="absolute right-0 top-0 h-full w-2 bg-neo-black"></div>
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <span
                            className="w-6 h-6 rounded-full bg-neo-pink text-white flex items-center justify-center text-[10px] font-bold border border-black">CS</span>
                        <h4 className="font-bold text-sm tracking-tight">Chief of Staff</h4>
                    </div>
                    <span className="text-xs font-bold">Now</span>
                </div>
                <p className="text-xs font-medium truncate text-gray-800 pr-4">Here is the 3-page summary of...</p>
            </div>

            {/* Chat Session Item 2 */}
            <div
                className="p-4 border-b-3 border-neo-black bg-white hover:bg-neo-bg cursor-pointer transition-colors group">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <span
                            className="w-6 h-6 rounded-full bg-neo-blue border border-black text-[10px] font-bold flex items-center justify-center">MK</span>
                        <h4 className="font-bold text-sm tracking-tight">Marketing Bot</h4>
                    </div>
                    <span className="text-xs font-bold text-gray-500">14:22</span>
                </div>
                <p className="text-xs font-medium truncate text-gray-600">I've scheduled those 5 tweets.</p>
            </div>

            {/* Category Header */}
            <div className="px-4 py-2 bg-gray-100 border-y-3 border-neo-black text-xs font-black tracking-widest uppercase">
                Group Channels</div>

            {/* Chat Session Item 3 */}
            <div
                className="p-4 border-b-3 border-neo-black bg-white hover:bg-neo-bg cursor-pointer transition-colors group relative">
                <div className="w-3 h-3 bg-neo-pink border border-black rounded-full absolute top-4 right-4 animate-pulse">
                </div>
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">#</span>
                        <h4 className="font-bold text-sm tracking-tight">Strategy_Room</h4>
                    </div>
                </div>
                <p className="text-xs font-medium text-black"><b>Vector:</b> Need approval on TSLA.</p>
            </div>

        </div>
    </aside>

    {/* Main Chat Window */}
    {/* API: GET /api/workspace/chat/sessions/:id/messages */}
    <main className="flex-grow flex flex-col h-full bg-neo-bg relative w-full">
        {/* Background Pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{backgroundImage: "repeating-linear-gradient(45deg, #1E1E1E 0, #1E1E1E 2px, transparent 2px, transparent 12px)"}}>
        </div>

        {/* Chat Header */}
        <header
            className="h-16 border-b-3 border-neo-black bg-white flex items-center justify-between px-6 sticky top-0 z-10 shrink-0 shadow-[0px_4px_0px_#000]">
            <div className="flex items-center gap-3">
                <div
                    className="w-10 h-10 rounded-full bg-neo-pink text-white neo-border flex items-center justify-center shadow-sm">
                    <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"
                        fill="none">
                        <path d="M12 2a5 5 0 0 0-5 5v5a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5z"></path>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                        <line x1="12" y1="19" x2="12" y2="22"></line>
                    </svg>
                </div>
                <div>
                    <h2 className="text-lg font-black uppercase">Chief of Staff</h2>
                    <div className="flex gap-2 text-xs font-bold items-center">
                        <span className="w-2 h-2 rounded-full bg-neo-lime border border-black inline-block"></span> System
                        Agent
                    </div>
                </div>
            </div>
            <div className="flex gap-3">
                <button className="neo-btn bg-white p-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2.5">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </button>
                <button className="neo-btn bg-white p-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2.5">
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="12" cy="5" r="1"></circle>
                        <circle cx="12" cy="19" r="1"></circle>
                    </svg>
                </button>
            </div>
        </header>

        {/* Message Area */}
        <div className="flex-grow overflow-y-auto p-6 md:p-10 space-y-8 flex flex-col w-full">

            {/* Date Divider */}
            <div className="flex justify-center w-full">
                <span
                    className="bg-neo-black text-white text-xs font-bold px-3 py-1 neo-border uppercase tracking-widest">Today</span>
            </div>

            {/* User Message */}
            <div className="flex justify-end w-full">
                <div className="max-w-[75%] flex flex-col items-end gap-1">
                    <span className="text-xs font-bold mr-2 text-gray-500">You • 14:05</span>
                    <div className="msg-bubble-user p-4 text-[15px] font-medium leading-relaxed">
                        Prepare a summary of our active marketing campaigns and check if there are any pending budget
                        approvals needed for next week.
                    </div>
                </div>
            </div>

            {/* AI Message (Step 1) */}
            <div className="flex justify-start w-full">
                <div className="max-w-[85%] flex gap-4">
                    <div
                        className="w-10 h-10 rounded-full bg-neo-pink text-white neo-border flex items-center justify-center shrink-0 mt-4 shadow-sm font-bold text-xs">
                        CS</div>
                    <div className="flex flex-col gap-1 w-full">
                        <span className="text-xs font-bold ml-2 text-neo-black">Chief of Staff <span
                                className="text-gray-500 font-normal ml-1">14:06</span></span>
                        <div className="msg-bubble-ai p-5 text-[15px] font-medium leading-relaxed space-y-4">
                            <p>I have analyzed the current marketing data by delegating tasks to the Marketing Bot and
                                the Finance Agent.</p>

                            {/* Embedded Card / Context */}
                            <div className="bg-neo-bg border-3 border-neo-black p-4 mt-2">
                                <h4 className="font-black border-b-2 border-black pb-1 mb-2">Campaign Status</h4>
                                <ul className="list-disc pl-5 font-bold space-y-1">
                                    <li><span className="bg-neo-lime px-1 border border-black">Active</span> "Summer SaaS
                                        Sale" (Running well on X/Twitter)</li>
                                    <li><span className="bg-neo-yellow px-1 border border-black">Pending</span> "LinkedIn
                                        B2B Series" (Needs content approval)</li>
                                </ul>
                            </div>

                            <p><strong>Budget Alert:</strong> The LinkedIn campaign needs a budget approval of <span
                                    className="bg-neo-yellow font-bold px-1 border border-black line-through">$400</span>
                                $500 to proceed for next week. Would you like me to approve this?</p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-2">
                            <button
                                className="bg-white border-2 border-black shadow-[2px_2px_0px_#000] px-3 py-1 text-xs font-bold hover:bg-neo-lime hover:-translate-y-px transition-all">Yes,
                                Approve $500</button>
                            <button
                                className="bg-white border-2 border-black shadow-[2px_2px_0px_#000] px-3 py-1 text-xs font-bold hover:bg-neo-pink hover:-translate-y-px transition-all hover:text-white">Reject
                                Budget</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Type Indicator */}
            <div className="flex justify-start w-full mt-4">
                <div className="flex gap-3 items-center ml-14">
                    <span className="text-xs font-bold text-neo-pink animate-pulse">Chief of Staff is thinking...</span>
                    <div className="flex gap-1">
                        <div className="w-2 h-2 bg-neo-black rounded-full animate-bounce" style={{animationDelay: "0s"}}>
                        </div>
                        <div className="w-2 h-2 bg-neo-black rounded-full animate-bounce" style={{animationDelay: "0.1s"}}>
                        </div>
                        <div className="w-2 h-2 bg-neo-black rounded-full animate-bounce" style={{animationDelay: "0.2s"}}>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        {/* Input Box */}
        {/* API: POST /api/workspace/chat/sessions/:id/messages */}
        <div
            className="h-auto border-t-4 border-neo-black bg-white p-4 shrink-0 shadow-[0px_-4px_0px_rgba(30,30,30,0.1)] relative z-20">
            <form className="flex max-w-5xl mx-auto items-end gap-3" onSubmit="event.preventDefault();">
                <button type="button"
                    className="neo-btn bg-neo-blue w-12 h-12 flex items-center justify-center shrink-0 mb-[6px]">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2.5">
                        <path
                            d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48">
                        </path>
                    </svg>
                </button>
                <textarea
                    className="flex-grow p-3 text-lg neo-border focus:outline-none focus:bg-neo-yellow/10 bg-white resize-none h-14 w-full placeholder:font-medium shadow-[4px_4px_0px_#000]"
                    placeholder="Message Chief of Staff..." rows="1"></textarea>
                <button type="submit"
                    className="neo-btn bg-neo-black text-neo-lime w-16 h-14 flex items-center justify-center shrink-0 shadow-[4px_4px_0px_#BFFF00]">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
                        strokeLinecap="square">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </form>
            <div className="text-center mt-2 pb-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Claude 3.5 Sonnet Engine
                    Active</span>
            </div>
        </div>
    </main>
    </>
  );
}

export default Chat;
