import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Workout Plan',
  description: 'Your weekly training plan — Nippard PPL + Football',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#0d0d0d',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${inter.className}`}>
      <body className="bg-[#0d0d0d] text-white antialiased">
        {children}
      </body>
    </html>
  )
}
