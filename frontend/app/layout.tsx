import './globals.css'
import { Inter, Playfair_Display } from 'next/font/google'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })
const playfair = Playfair_Display({ subsets: ['latin'] })

export const metadata = {
  title: 'Fake News Detection',
  description: 'Analyze news articles and URLs to determine their credibility',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>The Truth Detector - AI-Powered News Analysis</title>
        <meta name="description" content="Verify the credibility of news articles using AI-powered analysis" />
      </head>
      <body className={playfair.className}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
} 