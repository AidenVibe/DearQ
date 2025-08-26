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
  title: "마음배달 - 매일 하나의 질문으로 가족의 마음을 배달합니다",
  description: "마음배달은 매일 하나의 질문으로 가족과의 진정한 대화를 만들어가는 서비스입니다.",
  generator: "DearQ v0.1.0",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={`${inter.variable} ${notoSansKR.variable} antialiased`}>
      <body className="min-h-screen bg-background font-sans">
        {children}
      </body>
    </html>
  )
}