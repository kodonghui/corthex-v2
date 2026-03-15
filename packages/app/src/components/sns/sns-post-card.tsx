import { Camera, Briefcase, Share2, MessageCircle, Heart, MoreHorizontal } from 'lucide-react'

export interface SnsPostCardProps {
    platform: 'Instagram' | 'LinkedIn' | 'Twitter';
    status: '발행됨' | '예약됨' | '작성중';
    time: string;
    content: string;
    imageUrl?: string;
    likes?: string | number;
    comments?: string | number;
    shares?: string | number;
}

export function SnsPostCard({ platform, status, time, content, imageUrl, likes = '-', comments = '-', shares = '-' }: SnsPostCardProps) {
    const getPlatformConfig = () => {
        switch (platform) {
            case 'Instagram':
                return {
                    icon: <Camera className="w-[14px] h-[14px]" />,
                    bgClass: 'bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400'
                }
            case 'LinkedIn':
                return {
                    icon: <Briefcase className="w-[14px] h-[14px]" />,
                    bgClass: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                }
            default:
                return {
                    icon: null,
                    bgClass: 'bg-slate-100 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400'
                }
        }
    }

    const getStatusConfig = () => {
        switch (status) {
            case '발행됨':
                return 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
            case '예약됨':
                return 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
            default:
                return 'bg-slate-100 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400'
        }
    }

    const pConfig = getPlatformConfig()
    const sClass = getStatusConfig()

    return (
        <article className="flex flex-col rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full">
            <div className="p-5 flex flex-col gap-4 h-full">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        <div className={`rounded-md px-2 py-1 text-xs font-bold flex items-center gap-1 ${pConfig.bgClass}`}>
                            {pConfig.icon}
                            {platform}
                        </div>
                        <span className="text-slate-500 dark:text-slate-400 text-xs font-medium font-mono">{time}</span>
                    </div>
                    <div className={`rounded-md px-2 py-1 text-xs font-bold ${sClass}`}>
                        {status}
                    </div>
                </div>
                <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed line-clamp-3">
                    {content}
                </p>
                {imageUrl ? (
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-lg h-40 w-full bg-cover bg-center mt-auto" style={{ backgroundImage: `url('${imageUrl}')` }}></div>
                ) : (
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-lg h-40 w-full mt-auto flex items-center justify-center text-slate-400">
                        No Image
                    </div>
                )}
                <div className={`flex items-center gap-6 mt-2 pt-4 border-t border-slate-100 dark:border-slate-800 ${status === '예약됨' ? 'opacity-50' : ''}`}>
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Heart className="w-[18px] h-[18px]" />
                        <span className="text-xs font-mono font-medium">{likes}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <MessageCircle className="w-[18px] h-[18px]" />
                        <span className="text-xs font-mono font-medium">{comments}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Share2 className="w-[18px] h-[18px]" />
                        <span className="text-xs font-mono font-medium">{shares}</span>
                    </div>
                    <button className="ml-auto text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                        <MoreHorizontal className="w-[20px] h-[20px]" />
                    </button>
                </div>
            </div>
        </article>
    )
}
