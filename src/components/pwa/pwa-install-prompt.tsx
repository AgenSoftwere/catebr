"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, X } from 'lucide-react'
import styles from "./pwa-install-prompt.module.css"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Verificar se o app já está instalado ou se o prompt já foi dispensado
    const isAppInstalled = window.matchMedia("(display-mode: standalone)").matches
    const isDismissed = localStorage.getItem("pwaPromptDismissed") === "true"

    if (isAppInstalled || isDismissed) {
      return
    }

    // Capturar o evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Verificar se o usuário já viu o prompt antes
    const hasSeenPrompt = localStorage.getItem("pwaPromptSeen")
    if (!hasSeenPrompt) {
      // Mostrar o prompt após 30 segundos na primeira visita
      const timer = setTimeout(() => {
        setShowPrompt(true)
        localStorage.setItem("pwaPromptSeen", "true")
      }, 30000)
      return () => clearTimeout(timer)
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return

    // Mostrar o prompt de instalação nativo
    await installPrompt.prompt()

    // Esperar pela escolha do usuário
    const choiceResult = await installPrompt.userChoice

    // Resetar o estado
    setInstallPrompt(null)
    setShowPrompt(false)

    // Registrar a escolha do usuário
    if (choiceResult.outcome === "accepted") {
      console.log("Usuário aceitou a instalação do PWA")
    } else {
      console.log("Usuário recusou a instalação do PWA")
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDismissed(true)
    localStorage.setItem("pwaPromptDismissed", "true")
  }

  if (!showPrompt || dismissed) {
    return null
  }

  return (
    <div className={styles.promptContainer}>
      <div className={styles.promptContent}>
        <button onClick={handleDismiss} className={styles.closeButton}>
          <X className={styles.closeIcon} />
        </button>
        <div className={styles.promptHeader}>
          <div className={styles.appIcon}></div>
          <div className={styles.appInfo}>
            <h3 className={styles.appName}>Cate - Módulo Paroquial</h3>
            <p className={styles.appPublisher}>Instale o app para acesso rápido</p>
          </div>
        </div>
        <p className={styles.promptMessage}>
          Instale o Cate em seu dispositivo para acesso rápido e funcionalidades offline.
        </p>
        <Button onClick={handleInstall} className={styles.installButton}>
          <Download className={styles.installIcon} />
          Instalar aplicativo
        </Button>
      </div>
    </div>
  )
}
