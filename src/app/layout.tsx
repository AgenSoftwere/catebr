// app/layout.tsx

import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/context/auth-context"
import { NotificationProvider } from "@/context/notification-context"
import { Toaster } from "sonner"
import { PWAInstallPrompt } from "@/components/pwa/pwa-install-prompt"
import { PWAUpdatePrompt } from "@/components/pwa/pwa-update-prompt"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Cate - Módulo Paroquial",
  description: "Plataforma para fiéis e paróquias",
  manifest: "/manifest.json",
  themeColor: "#3b82f6",

  // SEO
  keywords: ["catequese", "paroquial", "igreja", "fé", "paróquia", "comunidade"],
  applicationName: "Cate - Módulo Paroquial",
  authors: [{ name: "GEN" }],
  creator: "GEN",

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
    creator: "@GEN",
    images: ["https://i.ibb.co/mCMNbSMJ/Chat-GPT-Image-20-de-abr-de-2025-20-26-47.png"],
  },

  // Viewport
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },

  // iOS Web App
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Cate",
  },

  // Ícones
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
  },

  // Base URL
  metadataBase: new URL("https://catebr.vercel.app"),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <NotificationProvider>
            <main className="min-h-screen flex flex-col">
              {children}
            </main>
            <Toaster />
            <PWAInstallPrompt />
            <PWAUpdatePrompt />
          </NotificationProvider>
        </AuthProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  )
}

// Componente para registrar o Service Worker
function ServiceWorkerRegistration() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/service-worker.js')
                .then(function(registration) {
                  console.log('Service Worker registrado com sucesso:', registration.scope);
                })
                .catch(function(error) {
                  console.log('Falha ao registrar o Service Worker:', error);
                });
            });
          }
        `,
      }}
    />
  )
}
