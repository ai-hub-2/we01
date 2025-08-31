import "./globals.css";
import React from "react";

export const metadata = {
  title: "we-dev",
  description: "we-dev app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

