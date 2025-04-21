"use client"

import { useState, useEffect } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { ArticleCard } from "@/components/articles/article-card"
import { ArticleSearch } from "@/components/articles/article-search"
import { Button } from "@/components/ui/button"
import { useArticles } from "@/hooks/use-articles"
import { useAuth } from "@/hooks/use-auth"
import { Loader2, PenSquare } from 'lucide-react'
import Link from "next/link"
import type { ArticleFilter } from "@/types/article"
import styles from "./page.module.css"

export default function LeiaPage() {
  const { articles, loading, error, hasMore, loadMore, updateFilters } = useArticles()
  const { user } = useAuth()
  const [isWriter, setIsWriter] = useState(false)

  useEffect(() => {
    if (user) {
      // Verificar se o usuário é escritor
      const userIsWriter = Array.isArray(user.contributions) && user.contributions.includes("escritor")
      setIsWriter(userIsWriter)
    }
  }, [user])

  const handleFilterChange = (filters: ArticleFilter) => {
    updateFilters(filters)
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Leia</h1>
          <p className={styles.subtitle}>Artigos, notícias, reflexões e depoimentos da comunidade</p>
        </div>

        <ArticleSearch onFilterChange={handleFilterChange} />

        {loading && articles.length === 0 ? (
          <div className={styles.loadingContainer}>
            <Loader2 className={`${styles.loadingIcon} animate-spin`} />
            <p>Carregando conteúdos...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <p className={styles.errorMessage}>{error}</p>
            <Button onClick={() => updateFilters({})}>Tentar novamente</Button>
          </div>
        ) : articles.length === 0 ? (
          <div className={styles.emptyContainer}>
            <h2 className={styles.emptyTitle}>Nenhum conteúdo encontrado</h2>
            <p className={styles.emptyText}>
              Não encontramos nenhum conteúdo com os filtros selecionados. Tente outros filtros ou volte mais tarde.
            </p>
          </div>
        ) : (
          <>
            <div className={styles.featuredSection}>
              {articles.slice(0, 1).map((article) => (
                <ArticleCard key={article.id} article={article} featured={true} />
              ))}
            </div>

            <div className={styles.articlesGrid}>
              {articles.slice(1).map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {hasMore && (
              <div className={styles.loadMoreContainer}>
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={loading}
                  className={styles.loadMoreButton}
                >
                  {loading ? (
                    <>
                      <Loader2 className={`${styles.loadingIcon} animate-spin`} />
                      Carregando...
                    </>
                  ) : (
                    'Carregar mais'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {isWriter && (
        <Link href="/leia/escreva" className={styles.writeButton}>
          <PenSquare className={styles.writeIcon} />
        </Link>
      )}

      <BottomNav />
    </div>
  )
}
