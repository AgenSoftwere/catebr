"use client"

import { useEffect, useState } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { NotificationList } from "@/components/notifications/notification-list"
import { useAuth } from "@/hooks/use-auth"
import { ParishSelector } from "@/components/parish/parish-selector"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Church } from "lucide-react"
import styles from "./page.module.css"

export default function ComunicadosPage() {
  const { loading, user } = useAuth()
  const [selectedParish, setSelectedParish] = useState<string | null>(null)
  const [selectedParishName, setSelectedParishName] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Get selected parish from localStorage
    const storedParish = localStorage.getItem("selectedParish")
    const storedParishName = localStorage.getItem("selectedParishName")

    if (storedParish) {
      setSelectedParish(storedParish)
      setSelectedParishName(storedParishName)
    }
  }, [])

  const handleParishSelect = (parishId: string, parishName: string) => {
    setSelectedParish(parishId)
    setSelectedParishName(parishName)
    localStorage.setItem("selectedParish", parishId)
    localStorage.setItem("selectedParishName", parishName)
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
          <div className={styles.parishSelectionHeader}>
            <Church className={styles.parishIcon} />
            <h1 className={styles.title}>Selecione uma Paróquia</h1>
            <p className={styles.subtitle}>Para ver os comunicados, selecione uma paróquia de sua preferência</p>
          </div>

          <ParishSelector onSelect={handleParishSelect} />

          <Button
            onClick={() => router.push("/comunicados")}
            className={styles.continueButton}
            disabled={!selectedParish}
          >
            Ver Comunicados
          </Button>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.parishHeader}>
          <h2 className={styles.parishName}>{selectedParishName}</h2>
          <Button
            variant="outline"
            size="sm"
            className={styles.changeParishButton}
            onClick={() => router.push("/selecionar-paroquia")}
          >
            Alterar paróquia
          </Button>
        </div>

        <NotificationList />
      </div>
      <BottomNav />
    </div>
  )
}
