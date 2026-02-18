"use client";

import { ReactNode } from "react";
import Header from "../components/header";
import Background from "../components/backround"; // FIXED typo
import { AuthProvider } from "../lib/AuthContext"; // or AuthContext if you renamed

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="relative min-h-screen w-full text-white antialiased">
        <AuthProvider>
          {/* Persistent background */}
          <Background />

          {/* Persistent header */}
          <Header />

          {/* Push content below header */}
          <main className="pt-16 px-4 relative z-10">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
