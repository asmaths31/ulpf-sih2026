import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LogForge',
  description: 'Universal Log Pre-processing Framework',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
