import "@/shared/styles/globals.css";
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
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
