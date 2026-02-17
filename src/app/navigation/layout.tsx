"use client";

import { ReactNode } from "react";
import Header from "../components/header";
import Background from "../components/backround"; // <-- import your background

export default function PagesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen w-full text-white">
      {/* Persistent background */}
      <Background />

      {/* Persistent header */}
      <Header />

      {/* Push content below header */}
      <main className="pt-16 px-4 relative z-10">{children}</main>
    </div>
  );
}
