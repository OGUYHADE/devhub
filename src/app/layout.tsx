import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] })
const jetbrainsMono = JetBrains_Mono({ variable: '--font-jetbrains', subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'DevHub - 個人開発者の進捗共有コミュニティ',
    template: '%s | DevHub',
  },
  description: '個人開発者向けの進捗シェアプラットフォーム。毎日の開発記録をコミュニティで共有しよう。',
  openGraph: {
    title: 'DevHub - 個人開発者の進捗共有コミュニティ',
    description: '個人開発者向けの進捗シェアプラットフォーム。毎日の開発記録をコミュニティで共有しよう。',
    type: 'website',
    locale: 'ja_JP',
    siteName: 'DevHub',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DevHub - 個人開発者の進捗共有コミュニティ',
    description: '個人開発者向けの進捗シェアプラットフォーム。毎日の開発記録をコミュニティで共有しよう。',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ja"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-dark-bg text-slate-100 font-sans">
        <ThemeProvider attribute="class" forcedTheme="dark" enableSystem={false}>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1a1a24',
                color: '#e2e8f0',
                border: '1px solid rgba(42,42,58,0.6)',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
              },
              success: {
                iconTheme: { primary: '#10b981', secondary: '#1a1a24' },
                style: { borderLeft: '4px solid #10b981' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#1a1a24' },
                style: { borderLeft: '4px solid #ef4444' },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
