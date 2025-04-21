"use client"

import { User, Bell, Edit } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import styles from "./bottom-nav.module.css"
import { NotificationIndicator } from "@/components/notifications/notification-indicator"
import { useNotifications } from "@/context/notification-context"
import { useAuth } from "@/hooks/use-auth"

export function BottomNav() {
  const pathname = usePathname()
  const { hasUnreadNotifications } = useNotifications()
  const { user } = useAuth()

  // Verificar se o usuário é escritor
  const isWriter = user?.contributions && Array.isArray(user.contributions) && user.contributions.includes("escritor")

  return (
    <nav className={styles.nav}>
      <Link
        href="/comunicados"
        className={`${styles.navItem} ${pathname.includes("/comunicados") ? styles.active : ""}`}
      >
        <div className={styles.iconWrapper}>
          <Bell className={styles.icon} />
          {hasUnreadNotifications && <NotificationIndicator />}
        </div>
        <span className={styles.label}>Comunicados</span>
      </Link>

      <Link
        href="/contribuicoes"
        className={`${styles.navItem} ${pathname.includes("/contribuicoes") ? styles.active : ""}`}
      >
        <div className={styles.iconWrapper}>
          <Edit className={styles.icon} />
          {isWriter && <div className={styles.writerBadge} />}
        </div>
        <span className={styles.label}>Contribuições</span>
      </Link>

      <Link href="/perfil" className={`${styles.navItem} ${pathname.includes("/perfil") ? styles.active : ""}`}>
        <User className={styles.icon} />
        <span className={styles.label}>Perfil</span>
      </Link>
    </nav>
  )
}
