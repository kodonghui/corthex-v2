import { CheckCircle, AlertCircle } from 'lucide-react'

export interface CronHistoryRowProps {
  timestamp: string;
  status: 'Success' | 'Failed';
  duration: string;
  cost: string;
  isErrorBg?: boolean;
}

export function CronHistoryRow({ timestamp, status, duration, cost, isErrorBg }: CronHistoryRowProps) {
  return (
    <tr className={`transition-colors border-b border-stone-200 ${
      isErrorBg ? 'bg-red-900/10 hover:bg-red-900/20' : 'hover:bg-stone-100/50'
    }`}>
      <td className="px-4 py-3">{timestamp}</td>
      <td className="px-4 py-3">
        {status === 'Success' ? (
          <span className="inline-flex items-center gap-1 text-green-400">
            <CheckCircle className="w-3.5 h-3.5" /> Success
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-red-400">
            <AlertCircle className="w-3.5 h-3.5" /> Failed
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-stone-500">{duration}</td>
      <td className="px-4 py-3 text-stone-500">{cost}</td>
      <td className="px-4 py-3 text-right">
        <button className="text-[#5a7247] hover:underline">View</button>
      </td>
    </tr>
  )
}
