// src/app/navigation/layout.tsx
"use client"; // because we use hooks

import { useState, useEffect } from "react";
import { AuthProvider } from "@/app/lib/AuthContext";
import Background from "@/app/components/backround";
import Header from "@/app/components/header"; // <-- import your header

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // trigger client-only rendering
  }, []);

  return (
    <html lang="en">
      <body className="relative min-h-screen w-full text-white antialiased">
        <AuthProvider>
          {/* Render Background and Header only on client */}
          {mounted && (
            <>
              <Background />
              <Header />
            </>
          )}

          {/* Main page content */}
          <main className="pt-16">{children}</main>
          {/* pt-16 to offset header height so content isn't hidden behind fixed header */}
        </AuthProvider>
      </body>
    </html>
  );
}