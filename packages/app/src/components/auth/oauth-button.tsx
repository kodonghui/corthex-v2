import { Bot } from 'lucide-react'

export interface OAuthButtonProps {
    provider: string;
    onClick?: () => void;
}

export function OAuthButton({ provider, onClick }: OAuthButtonProps) {
    return (
        <button
            className="w-full h-11 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-lg transition-colors flex items-center justify-center gap-3"
            type="button"
            onClick={onClick}
        >
            <Bot className="w-5 h-5 text-[#D97757]" />
            <span>{provider}로 로그인</span>
        </button>
    )
}
