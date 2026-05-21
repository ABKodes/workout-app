import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Workout Plan',
  description: 'Your weekly training plan — Nippard PPL + Football',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#0d0d0d',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Prevent pull-to-refresh on iOS where overscroll-behavior is unsupported */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var lastY = 0;
            document.addEventListener('touchstart', function(e) {
              lastY = e.touches[0].clientY;
            }, { passive: true });
            document.addEventListener('touchmove', function(e) {
              var y = e.touches[0].clientY;
              if (y > lastY && window.scrollY <= 0) e.preventDefault();
              lastY = y;
            }, { passive: false });
          })();
        ` }} />
      </head>
      <body className="min-h-full bg-[#0d0d0d] text-white antialiased" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', overscrollBehavior: 'none' }}>
        {children}
      </body>
    </html>
  )
}
