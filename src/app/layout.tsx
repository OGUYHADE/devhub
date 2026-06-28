import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] })
const jetbrainsMono = JetBrains_Mono({ variable: '--font-jetbrains', subsets: ['latin'] })

const SITE_URL = 'https://devhub-three-rho.vercel.app'
const SITE_TITLE = 'DevHub - 個人開発者の進捗共有コミュニティ'
const SITE_DESCRIPTION = '毎日の開発進捗をシェアして、同じ熱量の開発者とつながろう。'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: '%s | DevHub',
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    type: 'website',
    locale: 'ja_JP',
    siteName: 'DevHub',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'DevHub' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ['/og-image.png'],
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
