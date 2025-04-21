"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { ArticleEditor } from "@/components/articles/article-editor"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from 'lucide-react'
import styles from "./page.module.css"

export default function EscrevaPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    // Verificar se o usuário está autenticado e é escritor
    if (!loading && user) {
      const isWriter = Array.isArray(user.contributions) && user.contributions.includes("escritor")
      
      if (!isWriter) {
        router.push("/contribuicoes")
      }
    } else if (!loading && !user) {
      router.push("/auth/o/login")
    }
  }, [user, loading, router])
  
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Carregando...</p>
      </div>
    )
  }
  
  // Verificar se o usuário é escritor
  const isWriter = user && Array.isArray(user.contributions) && user.contributions.includes("escritor")
  
  if (!isWriter) {
    return null // Será redirecionado pelo useEffect
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button
          variant="ghost"
          className={styles.backButton}
          onClick={() => router.push("/leia")}
        >
          <ArrowLeft className={styles.backIcon} />
          Voltar
        </Button>
        <h1 className={styles.title}>Escreva seu conteúdo</h1>
      </div>
      
      <div className={styles.content}>
        <ArticleEditor />
      </div>
    </div>
  )
}
