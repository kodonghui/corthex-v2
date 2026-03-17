/**
 * Messenger Page - Natural Organic Theme
 *
 * API Endpoints:
 *   GET    /workspace/messenger/channels                              - List channels
 *   POST   /workspace/messenger/channels                              - Create channel
 *   GET    /workspace/messenger/channels/:id                          - Channel detail
 *   PUT    /workspace/messenger/channels/:id                          - Update channel
 *   DELETE /workspace/messenger/channels/:id                          - Delete channel
 *   GET    /workspace/messenger/channels/:id/messages                 - List messages
 *   POST   /workspace/messenger/channels/:id/messages                 - Send message
 *   GET    /workspace/messenger/channels/:id/messages/:mid/thread     - Thread replies
 *   POST   /workspace/messenger/channels/:id/messages/:mid/reactions  - Add reaction
 *   DELETE /workspace/messenger/channels/:id/messages/:mid/reactions/:emoji - Remove reaction
 *   GET    /workspace/messenger/channels/:id/members                  - List members
 *   POST   /workspace/messenger/channels/:id/members                  - Add member
 *   DELETE /workspace/messenger/channels/:id/members/me               - Leave channel
 *   DELETE /workspace/messenger/channels/:id/members/:uid             - Remove member
 *   POST   /workspace/messenger/channels/:id/read                     - Mark read
 *   GET    /workspace/messenger/channels/unread                       - Unread counts
 *   GET    /workspace/messenger/search?q=                             - Search messages
 *   GET    /workspace/messenger/users                                 - List users
 *   GET    /workspace/messenger/online                                - Online user IDs
 *   GET    /workspace/agents                                          - AI agents
 *   POST   /workspace/files                                           - Upload file
 *   GET    /workspace/files/:id/download                              - Download file
 *   WS     messenger::{channelId}                                     - Real-time messages
 */
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { Search, MoreVertical, ArrowUp, Paperclip, ArrowLeft } from 'lucide-react'
import { api } from '../lib/api'
import { useAuthStore } from '../stores/auth-store'
import { useWsStore } from '../stores/ws-store'
import { toast } from '@corthex/ui'
import { ConversationsView } from '../components/messenger/conversations-view'

type Channel = {
  id: string
  name: string
  description: string | null
  createdBy: string
  createdAt: string
  lastMessage: { content: string; userName: string; createdAt: string } | null
}

type ReactionGroup = {
  emoji: string
  count: number
  userIds: string[]
}

type FileAttachment = {
  id: string
  filename: string
  mimeType: string
  sizeBytes: number
}

type Message = {
  id: string
  userId: string
  userName: string
  content: string
  parentMessageId?: string | null
  createdAt: string
  replyCount?: number
  reactions?: ReactionGroup[]
  attachments?: FileAttachment[]
}

type CompanyUser = {
  id: string
  name: string
  role: string
}

type ChannelMember = {
  id: string
  name: string
  role: string
  joinedAt: string
}

type ChannelDetail = {
  id: string
  name: string
  description: string | null
  createdBy: string
  createdAt: string
  memberCount: number
}

type AgentInfo = {
  id: string
  name: string
  role: string | null
}

type SearchResult = {
  id: string
  channelId: string
  channelName: string
  userId: string
  userName: string
  content: string
  createdAt: string
}

const EMOJI_LIST = ['\u{1F44D}', '\u{2764}\u{FE0F}', '\u{1F602}', '\u{1F62E}', '\u{1F44F}', '\u{1F525}']
const MAX_UPLOAD_SIZE = 52_428_800
const FILE_ACCEPT = 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip'

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / 1048576).toFixed(1)}MB`
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) return d.toLocaleTimeString('ko', { hour: '2-digit', minute: '2-digit' })
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export function MessengerPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') === 'conversations' ? 'conversations' : 'channels'

  const handleTabChange = (tab: 'channels' | 'conversations') => {
    setSearchParams(tab === 'channels' ? {} : { tab: 'conversations' })
  }

  return (
    <div className="h-screen overflow-hidden flex text-slate-800" data-testid="messenger-page">
      {/* BEGIN: Left Navigation Sidebar */}
      <aside className="flex flex-col h-full border-r border-stone-200" style={{ width: '280px', minWidth: '280px', backgroundColor: '#f5f0eb' }} data-purpose="main-navigation">
        <div className="p-6">
          <h1 className="text-2xl" style={{ color: '#606c38', fontFamily: '"DM Serif Display", serif' }}>CORTHEX v2</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          <span className="flex items-center space-x-3 p-3 rounded-2xl bg-white shadow-sm font-medium" style={{ color: '#606c38' }}>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
            <span>Messages</span>
          </span>
          <span className="flex items-center space-x-3 p-3 rounded-2xl">
            <svg className="h-5 w-5 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
            <span>Contacts</span>
          </span>
          <span className="flex items-center space-x-3 p-3 rounded-2xl">
            <svg className="h-5 w-5 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
            <span>Files</span>
          </span>
        </nav>
        <div className="p-4 border-t border-stone-200">
          <div className="flex items-center space-x-3 p-2">
            <img alt="Profile" className="w-10 h-10 rounded-full border-2" style={{ borderColor: '#606c38' }} src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMp-FxfvF0m7GV0KfI5jA6erih0Txm_8bC9TEL63l6NoQz4QwRE-Mb0eSIAVvvuR2DuREeTMzhXQKfBnSKvnu7Eyy-aIZjXVYm1aCfpewy2paefNM0bQ2PDkz2PFPV06kFovdjrbqQ8wIjql0gbrdaZloauzGtP-2OuuMbyZNVQGj3BomG3SiYdpl27X0VlOf5b5ytoXBxASUl0YFlUuCXpyjTryVIIfcAsvfzJ4UTcxRCCp6I6DvkMPUil8sQ9Ff6Z9aYI5BCr7Zy" />
            <div>
              <p className="text-sm font-semibold">Julian Moss</p>
              <p className="text-xs text-stone-500">Online</p>
            </div>
          </div>
        </div>
      </aside>
      {/* END: Left Navigation Sidebar */}

      {/* BEGIN: Conversation List */}
      <section className="w-80 border-r border-stone-200 flex flex-col" style={{ backgroundColor: '#faf8f5' }} data-purpose="conversation-selector">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl" style={{ fontFamily: '"DM Serif Display", serif' }}>Inbox</h2>
            <button className="p-2 text-white rounded-full transition-colors" style={{ backgroundColor: '#606c38' }}>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path clipRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" fillRule="evenodd"></path></svg>
            </button>
          </div>
          <div className="relative">
            <input className="w-full bg-stone-100 border-none rounded-2xl px-4 py-2 text-sm focus:ring-2" style={{ '--tw-ring-color': 'rgba(96,108,56,0.2)' } as React.CSSProperties} placeholder="Search conversations..." type="text" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          {/* Conversation Item: Active */}
          <div className="flex items-center p-3 rounded-2xl bg-white shadow-sm border border-stone-100 cursor-pointer">
            <div className="relative">
              <img alt="User" className="w-12 h-12 rounded-2xl object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8r5IfRpgEPpLckUvjUAW2v_WCN7WS-rrL6xJO9hINAheS3-IWw7HJM3iBt9gEY-SvwbShfWTymw3IbVKz-c2z4O1bIOeXPX7TPXkvvueEIX1FrmhI0JWkTZQvCXsWcM-1lFj-aNTHXpncQL90Wdk9w8j5J0NGhYCHcUtsZq4t__HxOjSUCFCvmb1qzKCqi_yCegy9BfL54RJPuG_8XhgVrayNbtZCT2bjKTBHZkZH4Edo4kC8DQPSMFxRApHqrj0xbhXy2AjLpOJe" />
              <span className="absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full" style={{ backgroundColor: '#83934f' }}></span>
            </div>
            <div className="ml-3 flex-1 overflow-hidden">
              <div className="flex justify-between items-baseline">
                <h3 className="text-sm font-semibold truncate">Elena Gilbert</h3>
                <span className="text-[10px] text-stone-400">12:45 PM</span>
              </div>
              <p className="text-xs text-stone-500 truncate">The organic textures look great!</p>
            </div>
          </div>
          {/* Conversation Item: Group */}
          <div className="flex items-center p-3 rounded-2xl hover:bg-stone-100 transition-colors cursor-pointer">
            <div className="relative flex -space-x-4">
              <img alt="Group" className="w-8 h-8 rounded-2xl border-2 border-white" style={{ backgroundColor: '#dda15e' }} src="https://lh3.googleusercontent.com/aida-public/AB6AXuACT4O4itqWSahF5NmeCuAa7vKcFyTBARmEyQKfyKnxBJLRPl1uFMpBMyzU8o0er1E2qsU_zbPAYNqOLZobHZQB8PxKaiJ-MojNV8_H6ao7WUIF7YpO0UeDaOd3lX9KpT3ZH0fZ4H0U8SNEHhgFXGQmwwi9hqGSPhUlnYvj8ypibEkLdKPpkAv2TK-yj2_7Y64xfztK6f69qtmkwEpAqNEdbSrjjNGuA4tQtc-eN8h5WMeg-zARXanFnCZJaW8IuGNnTnw1I2MWkxXG" />
              <img alt="Group" className="w-8 h-8 rounded-2xl border-2 border-white" style={{ backgroundColor: '#606c38' }} src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4KlDNWsXO0cllGlLx9cw473Y4E0YGHEBnPoqgr2b62NjTo3tY32QcXtZx_v4mPLmOBophmU0tXBewpq9JxA2WxuZbYSRXafAM5g1Pvp-jQ1XzRK-14W1DoIqeONygny2543Vbr6EAGmGmlvcx1A1sVdq6sqyykCzz4RPdoRbSAtmWrFQG9U-g_kA1jOgqvMTJAleD_-5mI5VWkis6t5BdK791D40uYuTEyeayBhno1uvsPqktjWy0z7HpWQQb95mMMBeYfavqcAls" />
            </div>
            <div className="ml-3 flex-1 overflow-hidden">
              <div className="flex justify-between items-baseline">
                <h3 className="text-sm font-semibold truncate">Design System Team</h3>
                <span className="text-[10px] text-stone-400">Yesterday</span>
              </div>
              <p className="text-xs text-stone-500 truncate">Marcus: Updated the tokens.</p>
            </div>
          </div>
          {/* More Items */}
          <div className="flex items-center p-3 rounded-2xl hover:bg-stone-100 transition-colors cursor-pointer">
            <img alt="User" className="w-12 h-12 rounded-2xl object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNCVDk7Aie0HPWPm9s8gnc3ElnSPfE3TAE5PQrkjcEZH-4UrTePAjEXuvorxzu8WXzn8Gk5nSIzRf0m0Bxid3tR9ohwf2dgfyV4Ugik2F-hPpbxILIBDvkvSuNKj5UY-B8c5FzmZWfFUAX5yeMJuUaQ0lZAOPIpgi6awraH_2T5QiTo4CWoeWcJs-D9Eg4XYiPLoJLpSTtJtC5OCcsV9l19G2y8_Kos-t26znYIfcehTW40m2xFsWRk3guJpNp5xSm2RqzOUczXnJ6" />
            <div className="ml-3 flex-1 overflow-hidden">
              <div className="flex justify-between items-baseline">
                <h3 className="text-sm font-semibold truncate">Thomas Wright</h3>
                <span className="text-[10px] text-stone-400">Oct 24</span>
              </div>
              <p className="text-xs text-stone-500 truncate">Can we review the file sharing module?</p>
            </div>
          </div>
        </div>
      </section>
      {/* END: Conversation List */}

      {/* BEGIN: Chat Area */}
      <main className="flex-1 flex flex-col bg-white" data-purpose="chat-main-interface">
        {/* Header */}
        <header className="h-20 border-b border-stone-100 flex items-center justify-between px-8">
          <div className="flex items-center space-x-4">
            <img alt="Elena" className="w-10 h-10 rounded-2xl" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4pD4LRf0zJRLI5MP52gTGXaqIszu70IhUyxepdsogAzH3focaA7aPLtxhvD0qNi2vnTYL1WCTrfWVcN68ZzeSbrrilCCQSkF8yeUAY9GFzFnBx3wxfbdQjOzhaITnWlgmD4BRZL_7ZzNVu_ti6QArR5DQLBtBuij-Jon06pg_JH2Fc6PmHJULLRPcwPHimvXJ-qQaC-PIZje6zlgZz4D2XX_MZdowT19bh5u4DjvoSbNpGJAmhnSWRfqGUY3Yz7Ohgy0LY0I1fea1" />
            <div>
              <h2 className="text-lg" style={{ fontFamily: '"DM Serif Display", serif' }}>Elena Gilbert</h2>
              <p className="text-xs font-medium" style={{ color: '#83934f' }}>Active now</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-stone-400">
            <button className="transition-colors" style={{ ['--hover-color' as string]: '#606c38' }}>
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
            </button>
            <button className="transition-colors">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
            </button>
          </div>
        </header>
        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6" style={{ backgroundColor: 'rgba(250,248,245,0.3)' }}>
          {/* Received Message */}
          <div className="flex items-start space-x-3">
            <img alt="Elena" className="w-8 h-8 rounded-full mt-1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3kCr5MZN9qC1Ovii7Lv7ubOLtIIrzaJEMgiN4BHnW_Lf-rpUDfhvThXXeMkBq2glAPM6oxKWrjN8M58l1WhgRCvLvws-lSJW_AxICdwvG1UrENdnRhmIzz4-vufL92DHKGMbeZDU57wx49YTM8XM3wS7vzZSCaoMP4pqgwCT7QTcda-vgs3CktnDGKsLUlsB32yRcXL-forgA6nTnv97Y0ZVvBwing4ejg2_xiyoJuqO7r3FomhyTeFeyZNTHvPFNC9wIoN4D5OPP" />
            <div className="max-w-md">
              <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-stone-100">
                <p className="text-sm leading-relaxed text-stone-700">Hey Julian! I've been looking over the CORTHEX v2 design specs. The organic theme really resonates with the brand values.</p>
              </div>
              <span className="text-[10px] text-stone-400 mt-1 ml-1">12:40 PM</span>
            </div>
          </div>
          {/* Sent Message */}
          <div className="flex items-start justify-end space-x-3">
            <div className="max-w-md">
              <div className="p-4 rounded-2xl rounded-tr-none shadow-sm text-white" style={{ backgroundColor: '#606c38' }}>
                <p className="text-sm leading-relaxed">Glad to hear! I tried to balance the warm tones with functional space. Did you check the file I sent?</p>
              </div>
              <div className="flex items-center justify-end mt-1 space-x-2">
                <span className="text-[10px] text-stone-400">12:42 PM</span>
                <span style={{ color: '#83934f' }}><svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fillRule="evenodd"></path></svg></span>
              </div>
            </div>
          </div>
          {/* File Attachment Message */}
          <div className="flex items-start space-x-3">
            <img alt="Elena" className="w-8 h-8 rounded-full mt-1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIZh6yH7uIGRCZhDVk87PxIyOD4bKcTS1SAS1W-vm7ya44DQOYnRZxbLy_6wtzyk_o9_3XAvoXLxjHUFlm4nWNZq0azMlyUODc3KKPgtON7F2ojXNg5q_1Sxn8-aFAIFHGVZ3xE20zAw0NOdfuskUZ-Gw6xis7yEJEJO6izo36o6TGBcyEReztVqjRfFHfLopULazeuyQYUJCQ7Cu1W5ndA0-NXN2zXc4vStpfgYGoALSEwrP_wmcqe6fOTk_T1Wi0lBu0J5qqM6Vn" />
            <div className="max-w-md">
              <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-stone-100 space-y-3">
                <p className="text-sm text-stone-700">Just reviewing it now. The textures are perfect. &hearts;</p>
                {/* Reaction */}
                <div className="flex -mt-2">
                  <span className="bg-stone-50 border border-stone-100 rounded-full px-2 py-0.5 text-xs">&#x1f33f; 1</span>
                </div>
                {/* File Card */}
                <div className="flex items-center p-3 rounded-xl border border-stone-200" style={{ backgroundColor: '#faf8f5' }}>
                  <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(221,161,94,0.2)', color: '#bc6c25' }}>
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-semibold">moodboard_v2.png</p>
                    <p className="text-[10px] text-stone-500">2.4 MB</p>
                  </div>
                  <button className="ml-auto" style={{ color: '#606c38' }}>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path clipRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" fillRule="evenodd"></path></svg>
                  </button>
                </div>
              </div>
              <span className="text-[10px] text-stone-400 mt-1 ml-1">12:45 PM</span>
            </div>
          </div>
        </div>
        {/* Message Input */}
        <footer className="p-6 bg-white border-t border-stone-100">
          <div className="flex items-center space-x-4 p-2 rounded-2xl" style={{ backgroundColor: '#faf8f5' }}>
            <button className="p-2 text-stone-400 transition-colors">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
            </button>
            <input className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2" placeholder="Type your message..." type="text" />
            <div className="flex items-center space-x-2 px-2">
              <button className="text-stone-400 transition-colors" style={{ ['--hover-color' as string]: '#dda15e' }}>
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
              </button>
              <button className="text-white p-2 rounded-xl shadow-md transition-transform active:scale-95" style={{ backgroundColor: '#606c38' }}>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
              </button>
            </div>
          </div>
        </footer>
      </main>
      {/* END: Chat Area */}

      {/* BEGIN: Info Panel */}
      <aside className="hidden xl:flex flex-col overflow-y-auto border-l border-stone-200" style={{ width: '280px', minWidth: '280px', backgroundColor: '#faf8f5' }} data-purpose="details-panel">
        <div className="p-8 flex flex-col items-center text-center">
          <img alt="Elena Large" className="w-24 h-24 shadow-lg border-4 border-white mb-4" style={{ borderRadius: '32px' }} src="https://lh3.googleusercontent.com/aida-public/AB6AXuAC2GeRcRTXorB-TX1UXkf3NWrYSO00dQ98vpL_JSaY5tTuU63i-Di5jvYvHPakt1TSOkOa839IPkLd6WHGgkDv0ixBmuRid9u6CLDnLFrbkTtR-8ezMUE3TNaGNpJl9qGB3IxuQoAK50RDteNoo58bKlw12sL8Zfu9oDMVk8diDyjb1r7DW7Mt-z5dBOSus2JGzxkYcuLS3eTJQXOznpMDYe9GOwxl8T06zR5TTs8At8nF1Xkq4Vz2Og23cCuvdTabEfRdSP0NiWFr" />
          <h2 className="text-xl" style={{ fontFamily: '"DM Serif Display", serif' }}>Elena Gilbert</h2>
          <p className="text-sm text-stone-500">Senior UX Designer</p>
          <div className="flex space-x-2 mt-6">
            <button className="flex flex-col items-center space-y-1 p-3 bg-white rounded-2xl shadow-sm border border-stone-100 w-20 transition-all" style={{ ['--hover-border' as string]: '#dda15e' }}>
              <svg className="h-5 w-5" style={{ color: '#606c38' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
              <span className="text-[10px] font-semibold">Profile</span>
            </button>
            <button className="flex flex-col items-center space-y-1 p-3 bg-white rounded-2xl shadow-sm border border-stone-100 w-20 transition-all">
              <svg className="h-5 w-5" style={{ color: '#606c38' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
              <span className="text-[10px] font-semibold">Mute</span>
            </button>
            <button className="flex flex-col items-center space-y-1 p-3 bg-white rounded-2xl shadow-sm border border-stone-100 w-20 transition-all">
              <svg className="h-5 w-5" style={{ color: '#606c38' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
              <span className="text-[10px] font-semibold">Search</span>
            </button>
          </div>
        </div>
        <div className="px-6 py-4">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">Shared Media</h3>
          <div className="grid grid-cols-3 gap-2">
            <img alt="Media" className="rounded-lg aspect-square object-cover cursor-pointer hover:opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNggEiTw2YLw8Sc5GYhdev2lnR5h8ZK4zJSqYOjL7iAyv1RVhYOmiP17nhtgEvh8orJ1mgmEvs0KbnszRS9e53LhAVB2CrGtX3WYxyekxUxW3KHExMwD9jTac8Ki7VF-dSKc-52VVyKeRJGlN0KXkI73AeV5T4BVi3jgNl8w7XdWgYw2BHkSyKf3cdRfgAoO1Da4qFIDiDiU2_sBcG_IiclPp4Z5qcPnBeQD6NkMcV9_iWCiioyLSKp307K8wOffpRCG3k3-MzLC3t" />
            <img alt="Media" className="rounded-lg aspect-square object-cover cursor-pointer hover:opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBAuNymnDmOsdC8P9oSNzE4oMfVAtLguy6Y0WDn89PLCqU9z2oxskrSUlLVrVFMIymm1bZ-14PNJTICllIfMs-W7PDMqlw5RxNaVbJoaPOsYZiOSJ_x-S5L1CHnlyhaXsQbznmTPCcAbCscSypdnKlhgPTkSSQ5IEIsLo5S2hey3odB_4GJuLhk2hfZTLT05VWT0FwUnyRU-uDCMarntp6E8AP-2nOZcU0ICoG_rxo-GBCelEuuXWrB3lXTLQ3z3sv029eil1Rv3VD3" />
            <div className="bg-stone-200 rounded-lg aspect-square flex items-center justify-center text-stone-500 text-xs font-bold cursor-pointer hover:bg-stone-300">
              +14
            </div>
          </div>
        </div>
        <div className="px-6 py-4 flex-1">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">Privacy &amp; Support</h3>
          <div className="space-y-1">
            <button className="w-full text-left text-sm py-2 px-3 rounded-xl hover:bg-white transition-colors flex items-center justify-between group">
              <span>Block Elena</span>
              <svg className="h-4 w-4 text-stone-300 group-hover:text-red-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" fillRule="evenodd"></path></svg>
            </button>
            <button className="w-full text-left text-sm py-2 px-3 rounded-xl hover:bg-white transition-colors flex items-center justify-between">
              <span>Report Conversation</span>
              <svg className="h-4 w-4 text-stone-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path clipRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" fillRule="evenodd"></path></svg>
            </button>
          </div>
        </div>
      </aside>
      {/* END: Info Panel */}
    </div>
  )
}
