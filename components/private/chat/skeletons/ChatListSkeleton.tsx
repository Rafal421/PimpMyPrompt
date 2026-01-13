"use client";

export function ChatListSkeleton() {
  return (
    <div className="space-y-3">
      {/* Skeleton items */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="relative group w-full rounded-xl border bg-black/20 border-gray-800/30 animate-pulse"
        >
          <div className="w-full p-4 rounded-xl">
            <div className="flex items-center gap-3">
              {/* Icon skeleton */}
              <div className="w-8 h-8 bg-gray-700/50 rounded-lg flex-shrink-0" />

              <div className="flex-1 min-w-0">
                {/* Title skeleton */}
                <div className="h-4 bg-gray-700/50 rounded mb-2 w-3/4" />

                <div className="flex items-center justify-between">
                  {/* Date skeleton */}
                  <div className="h-3 bg-gray-700/50 rounded w-16" />
                  {/* Mode badge skeleton */}
                  <div className="h-5 bg-gray-700/50 rounded-md w-12" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
