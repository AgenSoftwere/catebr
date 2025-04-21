"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { ParishSidebar } from "@/components/parish/parish-sidebar"
import styles from "./layout.module.css"

export default function ParishLayout({ children }: { children: React.ReactNode }) {
  const { user, userType, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect if not logged in or not a parish
    if (!loading && (!user || userType !== "parish")) {
      router.push("/auth/p/login")
    }
  }, [user, userType, loading, router])

  // Show nothing while loading or redirecting
  if (loading || !user || userType !== "parish") {
    return null
  }

  return (
    <div className={styles.layout}>
      <ParishSidebar />
      <main className={styles.main}>{children}</main>
    </div>
  )
}
