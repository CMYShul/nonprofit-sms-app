"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"] });

import Favicon from '/public/favicon.ico';

export const metadata: Metadata = {
  title: 'Shul SMS Portal',
  description: 'Securely Send out Messages to Shul List',
  icons: [{ rel: 'icon', url: Favicon.src }],
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}