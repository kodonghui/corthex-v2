import { Bot } from 'lucide-react'

export interface OAuthButtonProps {
    provider: string;
    onClick?: () => void;
}

export function OAuthButton({ provider, onClick }: OAuthButtonProps) {
    return (
        <button
            className="w-full h-11 bg-corthex-surface border border-corthex-border hover:bg-corthex-bg text-corthex-text-primary font-medium rounded-lg transition-colors flex items-center justify-center gap-3"
            type="button"
            onClick={onClick}
        >
            <Bot className="w-5 h-5 text-corthex-warning" />
            <span>{provider}로 로그인</span>
        </button>
    )
}
