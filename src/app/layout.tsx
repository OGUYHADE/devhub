import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "DevHub - 個人開発者の進捗共有コミュニティ",
    template: "%s | DevHub",
  },
  description:
    "個人開発者向けの進捗シェアプラットフォーム。毎日の開発記録をコミュニティで共有しよう。",
  openGraph: {
    title: "DevHub - 個人開発者の進捗共有コミュニティ",
    description:
      "個人開発者向けの進捗シェアプラットフォーム。毎日の開発記録をコミュニティで共有しよう。",
    type: "website",
    locale: "ja_JP",
    siteName: "DevHub",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevHub - 個人開発者の進捗共有コミュニティ",
    description:
      "個人開発者向けの進捗シェアプラットフォーム。毎日の開発記録をコミュニティで共有しよう。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
