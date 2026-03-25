export interface TradeHistoryRowProps {
    time: string;
    type: 'Buy' | 'Sell';
    price: string;
    amount: string;
}

export function TradeHistoryRow({ time, type, price, amount }: TradeHistoryRowProps) {
    return (
        <tr className="border-b border-stone-200/50 hover:bg-stone-100 transition-colors">
            <td className="py-2.5 px-4 text-stone-500">{time}</td>
            <td className="py-2.5 px-4">
                <span className={type === 'Buy' ? 'text-emerald-500' : 'text-red-500'}>{type}</span>
            </td>
            <td className="py-2.5 px-4 text-right text-corthex-text-primary">{price}</td>
            <td className="py-2.5 px-4 text-right text-corthex-text-primary">{amount}</td>
        </tr>
    )
}
