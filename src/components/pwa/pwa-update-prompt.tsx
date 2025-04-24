"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import styles from "./pwa-update-prompt.module.css"

export function PWAUpdatePrompt() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Verificar atualizações do service worker
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing

          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                // Nova versão disponível
                setWaitingWorker(newWorker)
                setShowUpdatePrompt(true)
              }
            })
          }
        })
      })
    }
  }, [])

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" })
      setShowUpdatePrompt(false)
      window.location.reload()
    }
  }

  if (!showUpdatePrompt) {
    return null
  }

  return (
    <div className={styles.updatePrompt}>
      <div className={styles.updateContent}>
        <p className={styles.updateMessage}>Nova versão disponível</p>
        <Button onClick={handleUpdate} size="sm" className={styles.updateButton}>
          <RefreshCw className={styles.updateIcon} />
          Atualizar
        </Button>
      </div>
    </div>
  )
}
