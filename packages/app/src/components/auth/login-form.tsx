import { Mail, Lock, ArrowRight } from 'lucide-react'
import { FormEvent } from 'react'

export interface LoginFormProps {
    onSubmit?: (e: FormEvent) => void;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
    return (
        <form className="flex flex-col gap-5" onSubmit={onSubmit}>
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="email">이메일</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                    <input
                        className="w-full h-11 pl-10 pr-4 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition-colors text-sm"
                        id="email"
                        placeholder="이메일을 입력하세요"
                        required
                        type="email"
                    />
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="password">비밀번호</label>
                    <a className="text-xs font-medium text-cyan-400 hover:text-cyan-400/80 transition-colors" href="#">비밀번호를 잊으셨나요?</a>
                </div>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                    <input
                        className="w-full h-11 pl-10 pr-4 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition-colors text-sm"
                        id="password"
                        placeholder="비밀번호를 입력하세요"
                        required
                        type="password"
                    />
                </div>
            </div>
            <button
                className="w-full h-11 mt-2 bg-cyan-400 hover:bg-cyan-400/90 text-slate-900 font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                type="submit"
            >
                <span>로그인</span>
                <ArrowRight className="w-5 h-5" />
            </button>
        </form>
    )
}
