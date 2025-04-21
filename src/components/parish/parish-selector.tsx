"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin } from "lucide-react"
import { getParishes } from "@/services/parish-service"
import type { Parish } from "@/types/parish"
import styles from "./parish-selector.module.css"

interface ParishSelectorProps {
  onSelect: (parishId: string, parishName: string) => void
}

export function ParishSelector({ onSelect }: ParishSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [parishes, setParishes] = useState<Parish[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedParishId, setSelectedParishId] = useState<string | null>(null)

  useEffect(() => {
    const fetchParishes = async () => {
      try {
        setLoading(true)
        const parishList = await getParishes()
        console.log("Paróquias carregadas:", parishList)
        setParishes(parishList)
        setError(null)
      } catch (err) {
        setError("Erro ao carregar paróquias. Tente novamente.")
        console.error("Error fetching parishes:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchParishes()
  }, [])

  const filteredParishes = parishes.filter(
    (parish) =>
      parish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parish.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parish.address.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleParishSelect = (parish: Parish) => {
    console.log("Paróquia selecionada:", parish)
    setSelectedParishId(parish.id)
    onSelect(parish.id, parish.name)
  }

  return (
    <div className={styles.container}>
      <div className={styles.searchContainer}>
        <Search className={styles.searchIcon} />
        <Input
          type="text"
          placeholder="Buscar por nome ou localização..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Carregando paróquias...</p>
        </div>
      ) : error ? (
        <div className={styles.errorContainer}>
          <p>{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()} className={styles.retryButton}>
            Tentar novamente
          </Button>
        </div>
      ) : (
        <div className={styles.parishList}>
          {filteredParishes.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Nenhuma paróquia encontrada com esse termo.</p>
            </div>
          ) : (
            filteredParishes.map((parish) => (
              <div
                key={parish.id}
                className={`${styles.parishItem} ${selectedParishId === parish.id ? styles.selected : ""}`}
                onClick={() => handleParishSelect(parish)}
              >
                <div className={styles.parishInfo}>
                  <h3 className={styles.parishName}>{parish.name}</h3>
                  <div className={styles.parishLocation}>
                    <MapPin className={styles.locationIcon} />
                    <span>
                      {parish.address.neighborhood}, {parish.address.city}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
