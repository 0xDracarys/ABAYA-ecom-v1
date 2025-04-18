import type React from "react"
import type { Metadata } from "next/dist/lib/metadata/types/metadata-interface"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Toaster } from "@/components/ui/toaster"
import ConnectionStatus from "@/components/common/ConnectionStatus"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Abaya Elegance - Premium Abaya Collection",
  description: "Discover our premium collection of elegant abayas for every occasion.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ConnectionStatus>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </ConnectionStatus>
        </Providers>
      </body>
    </html>
  )
}
