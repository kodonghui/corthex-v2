import { ActivityItemProps, ActivityItem } from './activity-item'

export interface ActivityFeedProps {
    activities?: ActivityItemProps[];
}

export function ActivityFeed({ activities = [] }: ActivityFeedProps) {
    return (
        <section>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-slate-50 text-[22px] font-bold tracking-tight">최근 활동</h2>
                <button className="text-cyan-400 text-sm font-medium hover:underline">View All</button>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <ul className="divide-y divide-slate-800">
                    {activities.map((activity, idx) => (
                        <ActivityItem key={idx} {...activity} />
                    ))}
                </ul>
            </div>
        </section>
    )
}
