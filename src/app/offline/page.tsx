"use client"

import { Button } from "@/components/ui/button"
import { Wifi, RefreshCw } from 'lucide-react'
import Link from "next/link"
import styles from "./offline.module.css"

export default function OfflinePage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.iconContainer}>
          <Wifi className={styles.icon} />
        </div>
        <h1 className={styles.title}>Você está offline</h1>
        <p className={styles.description}>
          Não foi possível conectar à internet. Verifique sua conexão e tente novamente.
        </p>
        <div className={styles.actions}>
          <Button 
            onClick={() => window.location.reload()} 
            className={styles.refreshButton}
          >
            <RefreshCw className={styles.buttonIcon} />
            Tentar novamente
          </Button>
          <Link href="/">
            <Button variant="outline" className={styles.homeButton}>
              Voltar para a página inicial
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
