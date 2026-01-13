"use client";

export function ChatMessagesSkeleton() {
  return (
    <div className="space-y-6">
      {/* User message skeleton - short question */}
      <div className="flex gap-2 sm:gap-4 justify-end">
        <div className="w-[70%] sm:w-[50%]">
          <div className="px-6 py-4 rounded-2xl shadow-lg bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/20">
            <div className="space-y-2.5 animate-pulse">
              <div className="h-4 bg-blue-400/30 rounded w-full" />
              <div className="h-4 bg-blue-400/30 rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>

      {/* Bot message skeleton - longer response */}
      <div className="flex gap-2 sm:gap-4 justify-start">
        <div className="w-[85%] sm:w-[75%]">
          <div className="px-6 py-5 rounded-2xl shadow-lg bg-black/40 border border-gray-800/50">
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-gray-700/50 rounded w-full" />
              <div className="h-4 bg-gray-700/50 rounded w-[95%]" />
              <div className="h-4 bg-gray-700/50 rounded w-[90%]" />
              <div className="h-4 bg-gray-700/50 rounded w-[85%]" />
              <div className="h-4 bg-gray-700/50 rounded w-[70%]" />
              <div className="h-4 bg-gray-700/50 rounded w-[60%]" />
            </div>
          </div>
        </div>
      </div>

      {/* User message skeleton - follow-up */}
      <div className="flex gap-2 sm:gap-4 justify-end">
        <div className="w-[60%] sm:w-[40%]">
          <div className="px-6 py-4 rounded-2xl shadow-lg bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/20">
            <div className="space-y-2.5 animate-pulse">
              <div className="h-4 bg-blue-400/30 rounded w-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Bot message skeleton - another longer response */}
      <div className="flex gap-2 sm:gap-4 justify-start">
        <div className="w-[85%] sm:w-[75%]">
          <div className="px-6 py-5 rounded-2xl shadow-lg bg-black/40 border border-gray-800/50">
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-gray-700/50 rounded w-full" />
              <div className="h-4 bg-gray-700/50 rounded w-[92%]" />
              <div className="h-4 bg-gray-700/50 rounded w-[88%]" />
              <div className="h-4 bg-gray-700/50 rounded w-[75%]" />
              <div className="h-4 bg-gray-700/50 rounded w-[55%]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
