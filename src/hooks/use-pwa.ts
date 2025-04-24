"use client"

import { useState, useEffect } from "react"
import { isInstalledPWA, isOnline, canInstallPWA } from "@/lib/pwa-utils"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function usePWA() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [isNetworkOnline, setIsNetworkOnline] = useState(true)
  const [canInstall, setCanInstall] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    // Verificar se está instalado como PWA
    setIsInstalled(isInstalledPWA())

    // Verificar status da rede
    setIsNetworkOnline(isOnline())

    // Verificar se pode ser instalado
    canInstallPWA().then(setCanInstall)

    // Monitorar status da rede
    const handleOnline = () => setIsNetworkOnline(true)
    const handleOffline = () => setIsNetworkOnline(false)

    // Capturar evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setCanInstall(true)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  // Função para mostrar o prompt de instalação
  const promptInstall = async () => {
    if (!deferredPrompt) return false

    try {
      // Mostrar o prompt de instalação
      await deferredPrompt.prompt()

      // Aguardar a escolha do usuário
      const choiceResult = await deferredPrompt.userChoice

      // Limpar o prompt após o uso
      setDeferredPrompt(null)

      return choiceResult.outcome === "accepted"
    } catch (error) {
      console.error("Erro ao mostrar prompt de instalação:", error)
      return false
    }
  }

  return {
    isInstalled,
    isOnline: isNetworkOnline,
    canInstall,
    promptInstall,
  }
}
