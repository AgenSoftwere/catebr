import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import { AuthProvider } from "@/context/auth-context"
import { NotificationProvider } from "@/context/notification-context"
import { Toaster } from "sonner" // Importando o Toaster

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Cate - Módulo Paroquial",
  description: "Plataforma para fiéis e paróquias",
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
              <Toaster /> {/* Substituindo Toaster por Toaster */}
            </NotificationProvider>
          </AuthProvider>
      </body>
    </html>
  )
}
