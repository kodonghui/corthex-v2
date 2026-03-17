export interface AvatarGroupProps {
    avatars: string[];
    maxCount?: number;
}

export function AvatarGroup({ avatars, maxCount = 3 }: AvatarGroupProps) {
    const visibleAvatars = avatars.slice(0, maxCount);
    const remainingCount = avatars.length - maxCount;

    return (
        <div className="flex -space-x-2 overflow-hidden">
            {visibleAvatars.map((url, i) => (
                <img
                    key={i}
                    alt={`Avatar ${i}`}
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-[#0f171a] object-cover"
                    src={url}
                />
            ))}
            {remainingCount > 0 && (
                <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-[#0f171a] bg-stone-100 text-xs font-medium text-stone-600">
                    +{remainingCount}
                </div>
            )}
        </div>
    )
}
