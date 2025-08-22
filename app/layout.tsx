import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/ui/header"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Nexo Automático - TRS Logística",
  description: "Plataforma interna de automatización de mensajería WhatsApp Business para TRS Logística",
  keywords: ["WhatsApp Business", "TRS Logística", "Automatización", "Mensajería"],
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-trs-light">
          <Header />
          <main className="container mx-auto">{children}</main>
        </div>
        <Toaster />
      </body>
    </html>
  )
}
