"use client"

import { useEffect, useState } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { NotificationList } from "@/components/notifications/notification-list"
import { useAuth } from "@/hooks/use-auth"
import { ParishSelector } from "@/components/parish/parish-selector"
import { useRouter } from "next/navigation"
import styles from "./page.module.css"

export default function ComunicadosPage() {
  const { user, loading } = useAuth()
  const [selectedParish, setSelectedParish] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user has selected a parish before
    const storedParish = localStorage.getItem("selectedParish")
    if (storedParish) {
      setSelectedParish(storedParish)
    }

    // If user is not logged in and no parish is selected, redirect to parish selection
    if (!loading && !user && !storedParish) {
      router.push("/selecionar-paroquia")
    }
  }, [user, loading, router])

  const handleParishSelect = (parishId: string) => {
    setSelectedParish(parishId)
    localStorage.setItem("selectedParish", parishId)
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Carregando comunicados...</p>
      </div>
    )
  }

  if (!selectedParish) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>Selecione uma Paróquia</h1>
          <p className={styles.subtitle}>Para ver os comunicados, selecione uma paróquia de sua preferência</p>
          <ParishSelector onSelect={handleParishSelect} />
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <NotificationList />
      </div>
      <BottomNav />
    </div>
  )
}
