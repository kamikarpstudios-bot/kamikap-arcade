"use client";

export default function ProfilePage() {
  return (
    <div className="px-8 py-6 space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>

      <div className="flex items-center space-x-4">
        <div className="w-20 h-20 bg-white/20 rounded-full"></div>
        <div>
          <p className="font-semibold">Username</p>
          <p className="text-white/70">Player since 2026</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-black/50 backdrop-blur-sm p-4 rounded-2xl shadow-md">
          <p>Hours Played: 120</p>
          <p>High Score: 9999</p>
          <p>Achievements: 5</p>
        </div>

        <div className="bg-black/50 backdrop-blur-sm p-4 rounded-2xl shadow-md">
          <p>Payment info / subscription</p>
        </div>
      </div>
    </div>
  );
}
