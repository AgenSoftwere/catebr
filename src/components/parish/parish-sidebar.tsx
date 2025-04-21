"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, LayoutDashboard, Bell, Calendar, Users, Settings, LogOut, Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import styles from "./parish-sidebar.module.css"

interface SidebarLink {
  href: string
  label: string
  icon: React.ReactNode
}

export function ParishSidebar() {
  const pathname = usePathname()
  const { signOut, user } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if mobile on mount and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth < 1024) {
        setCollapsed(true)
      }
    }

    // Initial check
    checkIfMobile()

    // Add event listener
    window.addEventListener("resize", checkIfMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  const links: SidebarLink[] = [
    {
      href: "/paroquia/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className={styles.icon} />,
    },
    {
      href: "/paroquia/comunicados",
      label: "Comunicados",
      icon: <Bell className={styles.icon} />,
    },
    {
      href: "/paroquia/eventos",
      label: "Eventos",
      icon: <Calendar className={styles.icon} />,
    },
    {
      href: "/paroquia/fieis",
      label: "Fiéis",
      icon: <Users className={styles.icon} />,
    },
    {
      href: "/paroquia/configuracoes",
      label: "Configurações",
      icon: <Settings className={styles.icon} />,
    },
  ]

  const sidebarContent = (
    <div className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      <div className={styles.header}>
        <div className={`${styles.logoContainer} ${collapsed ? styles.collapsed : ""}`}>
          {!collapsed && <h1 className={styles.logo}>Cate</h1>}
          {!collapsed && <p className={styles.parishName}>{user?.displayName || "Paróquia"}</p>}
        </div>
        {!isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            className={styles.collapseButton}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </Button>
        )}
      </div>

      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {links.map((link) => (
            <li key={link.href}>
              <Link 
                href={link.href} 
                className={`${styles.navLink} ${pathname === link.href ? styles.active : ""}`}
              >
                {link.icon}
                {!collapsed && <span>{link.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.footer}>
        <Button 
          variant="ghost" 
          className={`${styles.logoutButton} ${collapsed ? styles.collapsed : ""}`}
          onClick={signOut}
        >
          <LogOut className={styles.icon} />
          {!collapsed && <span>Sair</span>}
        </Button>
      </div>
    </div>
  )

  // For mobile, use a Sheet component
  if (isMobile) {
    return (
      <>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className={styles.mobileMenuButton}>
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className={styles.mobileMenu}>
            {sidebarContent}
          </SheetContent>
        </Sheet>
      </>
    )
  }

  return sidebarContent
}
