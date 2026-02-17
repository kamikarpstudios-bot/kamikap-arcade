import React from "react";

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen text-white">
      {/* Page container */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-8 space-y-8">
        {children}
      </div>
    </main>
  );
}
