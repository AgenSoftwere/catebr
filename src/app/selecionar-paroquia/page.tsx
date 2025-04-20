"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ParishSelector } from "@/components/parish/parish-selector"
import { useRouter } from "next/navigation"
import { ArrowLeft, Church } from "lucide-react"
import Link from "next/link"
import styles from "./page.module.css"
import { VersionBadge } from "@/components/version-badge"

export default function SelecionarParoquiaPage() {
  const [selectedParish, setSelectedParish] = useState<string | null>(null)
  const [selectedParishName, setSelectedParishName] = useState<string | null>(null)
  const router = useRouter()

  const handleParishSelect = (parishId: string, parishName: string) => {
    setSelectedParish(parishId)
    setSelectedParishName(parishName)
  }

  const handleContinue = () => {
    if (selectedParish && selectedParishName) {
      localStorage.setItem("selectedParish", selectedParish)
      localStorage.setItem("selectedParishName", selectedParishName)
      router.push("/comunicados")
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft className={styles.backIcon} />
          <span>Voltar</span>
        </Link>

        <div className={styles.header}>
          <Church className={styles.parishIcon} />
          <h1 className={styles.title}>Selecione sua Paróquia</h1>
          <p className={styles.subtitle}>Escolha uma paróquia para acompanhar seus comunicados e eventos</p>
        </div>

        <ParishSelector onSelect={handleParishSelect} />

        <Button onClick={handleContinue} className={styles.continueButton} disabled={!selectedParish}>
          Continuar
        </Button>

        <VersionBadge />
      </div>
    </div>
  )
}
