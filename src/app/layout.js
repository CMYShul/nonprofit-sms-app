"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({ subsets: ["latin"] }); 

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Next.js</title>
      </head>
      <body>
        {children}
        <Analytics />
        className={inter.className}
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}