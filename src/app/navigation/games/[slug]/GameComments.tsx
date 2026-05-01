"use client";

type Props = { gameSlug: string };

export default function GameComments({ gameSlug }: Props) {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Comments</h2>

      {/* Placeholder input */}
      <div className="mb-4 flex space-x-2">
        <input
          disabled
          placeholder="Comment section coming soon..."
          className="flex-1 px-3 py-2 rounded-lg bg-black/70 border border-white/30 text-white cursor-not-allowed"
        />
        <button
          disabled
          className="px-4 py-2 bg-blue-600 rounded-lg text-white cursor-not-allowed"
        >
          Post
        </button>
      </div>

      {/* Placeholder comment cards */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        <div className="bg-[#0f172a] p-2 rounded-lg border border-[#1e293b] flex justify-between items-center">
          <p className="text-white/80 text-sm">Comment section coming soon...</p>
          <div className="flex space-x-2">
            <button className="px-2 py-1 bg-gray-700/50 rounded text-white text-xs cursor-not-allowed">
              👍 Like (coming soon)
            </button>
            <button className="px-2 py-1 bg-gray-700/50 rounded text-white text-xs cursor-not-allowed">
              👎 Dislike (coming soon)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
