"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Church, Bell, User } from 'lucide-react'
import { VersionBadge } from "@/components/version-badge"
import styles from "./page.module.css"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const { user, userType, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      // Redirect based on user type
      if (userType === "parish") {
        router.push("/paroquia/dashboard")
      } else {
        router.push("/comunicados")
      }
    }
  }, [user, userType, loading, router])

  // If still loading or user is authenticated, show a minimal loading state
  if (loading || user) {
    return null
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.logoContainer}>
          <h1 className={styles.logo}>Cate</h1>
          <p className={styles.subtitle}>Módulo Paroquial</p>
        </div>

        <p className={styles.description}>
          Bem-vindo ao Cate, sua plataforma para acompanhar comunicados e eventos da sua paróquia de forma simples e
          intuitiva.
        </p>

        <div className={styles.buttonContainer}>
          <Link href="/comunicados" className={styles.buttonLink}>
            <Button className={styles.button}>
              <Bell className={styles.buttonIcon} />
              Ver Comunicados
            </Button>
          </Link>

          <div className={styles.divider}>
            <span>ou</span>
          </div>

          <div className={styles.authButtons}>
            <Link href="/auth/o/login" className={styles.buttonLink}>
              <Button variant="outline" className={styles.button}>
                <User className={styles.buttonIcon} />
                Entrar como Fiel
              </Button>
            </Link>

            <Link href="/auth/p/login" className={styles.buttonLink}>
              <Button variant="outline" className={styles.button}>
                <Church className={styles.buttonIcon} />
                Entrar como Paróquia
              </Button>
            </Link>
          </div>
        </div>

        <VersionBadge />
      </div>
    </div>
  )
}
