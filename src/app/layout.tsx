import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://neugravity.com"),
  title: {
    default: "NeuGravity — Understand Technology. Navigate What's Next.",
    template: "%s | NeuGravity",
  },
  description:
    "Learn technology, discover the right tools, understand how companies work, and stay ahead of what is changing. NeuGravity is the technology intelligence and learning platform.",
  keywords: ["technology", "AI", "machine learning", "software", "tools", "courses", "news", "cloud computing"],
  authors: [{ name: "NeuGravity" }],
  creator: "NeuGravity",
  publisher: "NeuGravity",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://neugravity.com",
    siteName: "NeuGravity",
    title: "NeuGravity — Understand Technology. Navigate What's Next.",
    description:
      "Learn technology, discover the right tools, understand how companies work, and stay ahead of what is changing.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "NeuGravity — Technology Intelligence Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NeuGravity — Understand Technology. Navigate What's Next.",
    description:
      "Learn technology, discover the right tools, understand how companies work, and stay ahead of what is changing.",
    images: ["/og-image.png"],
    creator: "@neugravity",
    site: "@neugravity",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://neugravity.com",
    types: {
      "application/rss+xml": "/rss.xml",
    },
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
