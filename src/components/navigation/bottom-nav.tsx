"use client"

import { User, Bell } from 'lucide-react'
import Link from "next/link"
import { usePathname } from "next/navigation"
import styles from "./bottom-nav.module.css"
import { NotificationIndicator } from "../notifications/notification-indicator"
import { useNotifications } from "@/context/notification-context"

export function BottomNav() {
  const pathname = usePathname()
  const { hasUnreadNotifications } = useNotifications()
  
  return (
    <nav className={styles.nav}>
      <Link 
        href="/comunicados" 
        className={`${styles.navItem} ${pathname.includes('/comunicados') ? styles.active : ''}`}
      >
        <div className={styles.iconWrapper}>
          <Bell className={styles.icon} />
          {hasUnreadNotifications && <NotificationIndicator />}
        </div>
        <span className={styles.label}>Comunicados</span>
      </Link>
      
      <Link 
        href="/perfil" 
        className={`${styles.navItem} ${pathname.includes('/perfil') ? styles.active : ''}`}
      >
        <User className={styles.icon} />
        <span className={styles.label}>Perfil</span>
      </Link>
    </nav>
  )
}
