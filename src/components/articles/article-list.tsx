"use client"

import { useArticles } from "@/hooks/use-articles"
import { ArticleCard } from "./article-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from 'lucide-react'
import type { ArticleType } from "@/types/article"
import styles from "./article-list.module.css"
import { useState } from "react"

interface ArticleListProps {
  initialType?: ArticleType
  tag?: string
  searchTerm?: string
  authorId?: string
}

export function ArticleList({ initialType, tag, searchTerm, authorId }: ArticleListProps) {
  const [activeType, setActiveType] = useState<ArticleType | undefined>(initialType)
  const [limit, setLimit] = useState(12)

  const { articles, loading, error } = useArticles({
    type: activeType,
    tag,
    searchTerm,
    authorId,
    limit,
  })

  const handleLoadMore = () => {
    setLimit((prev) => prev + 12)
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {!tag && !searchTerm && !authorId && (
        <Tabs
          defaultValue={activeType || "artigo"}
          className={styles.tabs}
          onValueChange={(value) => setActiveType(value as ArticleType)}
        >
          <TabsList className={styles.tabsList}>
            <TabsTrigger value="artigo">Artigos</TabsTrigger>
            <TabsTrigger value="noticia">Notícias</TabsTrigger>
            <TabsTrigger value="reflexao">Reflexões</TabsTrigger>
            <TabsTrigger value="depoimento">Depoimentos</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {loading && articles.length === 0 ? (
        <div className={styles.loading}>
          <Loader2 className={styles.spinner} />
          <p>Carregando artigos...</p>
        </div>
      ) : articles.length === 0 ? (
        <div className={styles.empty}>
          <h3>Nenhum conteúdo encontrado</h3>
          <p>
            {searchTerm
              ? `Não encontramos resultados para "${searchTerm}"`
              : tag
                ? `Não há conteúdo com a tag "${tag}"`
                : "Não há conteúdo disponível no momento"}
          </p>
        </div>
      ) : (
        <>
          <div className={styles.grid}>
            {articles.map((article) => (
              <div key={article.id} className={styles.item}>
                <ArticleCard article={article} />
              </div>
            ))}
          </div>

          {articles.length >= limit && (
            <div className={styles.loadMore}>
              <Button onClick={handleLoadMore} variant="outline" disabled={loading} className={styles.loadMoreButton}>
                {loading ? (
                  <>
                    <Loader2 className={styles.loadingIcon} />
                    Carregando...
                  </>
                ) : (
                  "Carregar mais"
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
