"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, Calendar, Users, TrendingUp } from 'lucide-react'
import { database } from "@/lib/firebase"
import { ref, get } from "firebase/database"
import { useAuth } from "@/hooks/use-auth"
import styles from "./dashboard.module.css"

interface DashboardStats {
  totalComunicados: number
  totalEventos: number
  totalFieis: number
  recentViews: number
}

export default function ParishDashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalComunicados: 0,
    totalEventos: 0,
    totalFieis: 0,
    recentViews: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return

      try {
        setLoading(true)
        const parishId = user.uid

        // Get total comunicados
        const comunicadosRef = ref(database, `notifications/${parishId}`)
        const comunicadosSnapshot = await get(comunicadosRef)
        const totalComunicados = comunicadosSnapshot.exists() 
          ? Object.keys(comunicadosSnapshot.val()).length 
          : 0

        // Get total eventos (assuming events are stored separately)
        const eventosRef = ref(database, `events/${parishId}`)
        const eventosSnapshot = await get(eventosRef)
        const totalEventos = eventosSnapshot.exists() 
          ? Object.keys(eventosSnapshot.val()).length 
          : 0

        // Get total fiéis (subscribers)
        const fieisRef = ref(database, `parishSubscribers/${parishId}`)
        const fieisSnapshot = await get(fieisRef)
        const totalFieis = fieisSnapshot.exists() 
          ? Object.keys(fieisSnapshot.val()).length 
          : 0

        // Get recent views (this would be a more complex metric in a real app)
        // For now, we'll use a placeholder value
        const recentViews = 42

        setStats({
          totalComunicados,
          totalEventos,
          totalFieis,
          recentViews,
        })
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>Visão geral da sua paróquia</p>
      </div>

      <div className={styles.statsGrid}>
        <Card>
          <CardHeader className={styles.cardHeader}>
            <CardTitle className={styles.cardTitle}>Comunicados</CardTitle>
            <CardDescription>Total de comunicados publicados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={styles.statValue}>
              <Bell className={styles.statIcon} />
              <span className={styles.statNumber}>
                {loading ? "..." : stats.totalComunicados}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={styles.cardHeader}>
            <CardTitle className={styles.cardTitle}>Eventos</CardTitle>
            <CardDescription>Total de eventos cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={styles.statValue}>
              <Calendar className={styles.statIcon} />
              <span className={styles.statNumber}>
                {loading ? "..." : stats.totalEventos}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={styles.cardHeader}>
            <CardTitle className={styles.cardTitle}>Fiéis</CardTitle>
            <CardDescription>Fiéis que seguem sua paróquia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={styles.statValue}>
              <Users className={styles.statIcon} />
              <span className={styles.statNumber}>
                {loading ? "..." : stats.totalFieis}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={styles.cardHeader}>
            <CardTitle className={styles.cardTitle}>Visualizações</CardTitle>
            <CardDescription>Visualizações nos últimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={styles.statValue}>
              <TrendingUp className={styles.statIcon} />
              <span className={styles.statNumber}>
                {loading ? "..." : stats.recentViews}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className={styles.recentActivity}>
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Últimas ações na sua paróquia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={styles.activityList}>
              {loading ? (
                <p className={styles.loadingText}>Carregando atividades recentes...</p>
              ) : (
                <p className={styles.emptyText}>Nenhuma atividade recente para exibir.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
