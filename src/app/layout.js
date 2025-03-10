"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"] });

// In a client component, we need to handle metadata differently
// Move the metadata to a separate file or use next/head approach

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Shul SMS Portal</title>
        <meta name="description" content="Securely Send out Messages to Shul List" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}