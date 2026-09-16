import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { RevealObserver } from '@/components/ui/reveal-observer'
import { SITE_URL } from '@/lib/site'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

const description =
  'Split trip expenses with friends in a shared, spreadsheet-style ledger: live balances for everyone, and a settle-up plan that clears the group in as few payments as it can.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Splitsheet: split trip expenses in one shared sheet',
  description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Splitsheet',
    title: 'Splitsheet: split trip expenses in one shared sheet',
    description,
  },
  twitter: { card: 'summary_large_image' },
}

export const viewport: Viewport = {
  // Lets the sheet tabs pad for the iOS home indicator via safe-area-inset-bottom.
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
}

// Marks that scripts run before first paint, so reveal-on-scroll can hide
// content it is certain to show again. See the note in globals.css.
const jsFlag = `document.documentElement.classList.add('js')`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      // The pre-paint flag adds a class the server markup cannot know about.
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: jsFlag }} />
      </head>
      <body className="bg-background font-sans text-foreground">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2 focus:text-sm focus:ring-2 focus:ring-ring"
        >
          Skip to content
        </a>
        {children}
        <RevealObserver />
      </body>
    </html>
  )
}
