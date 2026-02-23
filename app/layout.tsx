import React from "react"
import type { Metadata } from 'next'
import { Inter, JetBrains_Mono, Outfit } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { ThemeProvider } from '@/components/theme-provider'

import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-brand',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
const baseUrl = siteUrl ? new URL(siteUrl) : undefined

const title = 'Markos - Free Online Markdown Editor'
const description =
  'A minimal, elegant side-by-side markdown editor with live preview. No sign-up required. Write and preview Markdown in the browser.'

export const metadata: Metadata = {
  metadataBase: baseUrl,
  title,
  description,
  icons: {
    icon: { url: '/icon.svg', type: 'image/svg+xml' },
  },
  openGraph: {
    title,
    description,
    url: '/',
    siteName: 'Markos',
    type: 'website',
    images: [
      { url: '/og.svg', type: 'image/svg+xml', width: 1200, height: 630, alt: 'Markos - Markdown Editor' },
      { url: '/og.png', width: 1200, height: 630, alt: 'Markos - Markdown Editor' },
      { url: '/icon.svg', type: 'image/svg+xml', width: 32, height: 32, alt: 'Markos' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
  ...(baseUrl && { alternates: { canonical: '/' } }),
}

function JsonLdScript() {
  const applicationUrl = siteUrl ? siteUrl.replace(/\/$/, '') : undefined
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Markos',
    description,
    url: applicationUrl,
    applicationCategory: 'DeveloperApplication',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable} ${outfit.variable}`}>
      <body className="font-sans antialiased">
        <JsonLdScript />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
