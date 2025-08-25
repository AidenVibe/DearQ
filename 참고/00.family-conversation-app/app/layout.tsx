import type React from "react"
import type { Metadata } from "next"
import { Inter, Noto_Sans_KR } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-sans-kr",
})

export const metadata: Metadata = {
  title: "문답다리 - 가족과의 진짜 대화",
  description: "하루 한 번, 가족 한 사람과 진짜 대화를 완결하는 서비스",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={`${inter.variable} ${notoSansKR.variable} antialiased`}>
      <body className="min-h-screen bg-background font-sans">{children}</body>
    </html>
  )
}
