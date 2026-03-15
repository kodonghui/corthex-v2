export interface WatchlistItemProps {
    symbol: string;
    price: string;
    name: string;
    change: string;
    isPositive: boolean;
    active?: boolean;
}

export function WatchlistItem({ symbol, price, name, change, isPositive, active }: WatchlistItemProps) {
    const containerClass = active
        ? 'bg-slate-800 border-l-cyan-400'
        : 'hover:bg-slate-800 border-l-transparent';

    return (
        <div className={`flex flex-col gap-1 px-4 py-3 border-l-2 cursor-pointer transition-colors ${containerClass}`}>
            <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-slate-100">{symbol}</span>
                <span className="font-mono text-sm text-slate-100">{price}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">{name}</span>
                <span className={`font-mono ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                    {isPositive ? '+' : ''}{change}
                </span>
            </div>
        </div>
    )
}
