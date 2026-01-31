import "@/shared/styles/index.css";
import React from "react";
import { AuthProvider } from "@/features/auth/contexts/AuthContext";

export const metadata = {
  title: "Velura",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark h-full">
      <body className="h-full w-full">
        <div id="__next" className="h-full">
          <AuthProvider>
            {children}
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
