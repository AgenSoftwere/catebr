// app/layout.tsx

import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/context/auth-context"
import { NotificationProvider } from "@/context/notification-context"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Cate - Módulo Paroquial",
  description: "Plataforma para fiéis e paróquias",

  // SEO
  keywords: ["catequese", "paroquial", "igreja", "fé", "paróquia", "comunidade"],
  applicationName: "Cate - Módulo Paroquial",
  authors: [{ name: "GEN" }],
  creator: "GEN",
  themeColor: "#ffffff",

  // Open Graph (WhatsApp, Facebook, LinkedIn etc.)
  openGraph: {
    title: "Cate - Módulo Paroquial",
    description: "Plataforma para fiéis e paróquias",
    url: "https://catebr.vercel.app",
    siteName: "Cate",
    images: [
      {
        url: "https://i.ibb.co/mCMNbSMJ/Chat-GPT-Image-20-de-abr-de-2025-20-26-47.png",
        width: 1200,
        height: 630,
        alt: "Imagem da plataforma Cate",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Cate - Módulo Paroquial",
    description: "Plataforma para fiéis e paróquias",
    creator: "@GEN", // você pode alterar ou remover se não tiver
    images: ["https://i.ibb.co/mCMNbSMJ/Chat-GPT-Image-20-de-abr-de-2025-20-26-47.png"],
  },

  // Base URL (importante para construir URLs relativas)
  metadataBase: new URL("https://catebr.vercel.app"),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          <NotificationProvider>
            <main className="min-h-screen flex flex-col">
              {children}
            </main>
            <Toaster />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
