import React from "react";
import Background from "../../components/backround";

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen text-white flex flex-col">
      {/* Background fixed behind everything */}
      <Background />

      {/* Main content */}
      <div className="relative z-20 mx-auto max-w-7xl px-6 py-8 flex-1 flex flex-col">
        {children}
      </div>
    </main>
  );
}
