"use client"

import { useState, useEffect } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Edit, Loader2 } from 'lucide-react'
import { ArticleCard } from "@/components/articles/article-card"
import { getAllArticles } from "@/services/article-service"
import { ArticleType, Article } from "@/types/article"
import Link from "next/link"
import styles from "./leia.module.css"

export default function LeiaPage() {
  const { user, loading: authLoading } = useAuth()
  const [articles, setArticles] = useState<Article[]>([])
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<ArticleType | "todos">("todos")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])

  // Verificar se o usuário é escritor
  const isWriter = user?.contributions && Array.isArray(user.contributions) && user.contributions.includes("escritor")

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true)
        const fetchedArticles = await getAllArticles()
        setArticles(fetchedArticles)
        setFilteredArticles(fetchedArticles)

        // Extrair todas as tags únicas dos artigos
        const tags = fetchedArticles.flatMap(article => article.tags || [])
        setAvailableTags([...new Set(tags)])
      } catch (error) {
        console.error("Erro ao buscar artigos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [])

  // Filtrar artigos com base na pesquisa, tipo e tags selecionadas
  useEffect(() => {
    let filtered = articles

    // Filtrar por tipo (tab)
    if (activeTab !== "todos") {
      filtered = filtered.filter(article => article.type === activeTab)
    }

    // Filtrar por termo de pesquisa
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        article => 
          article.title.toLowerCase().includes(term) || 
          article.subtitle.toLowerCase().includes(term) ||
          article.content.toLowerCase().includes(term)
      )
    }

    // Filtrar por tags selecionadas
    if (selectedTags.length > 0) {
      filtered = filtered.filter(article => 
        article.tags && selectedTags.some(tag => article.tags?.includes(tag))
      )
    }

    setFilteredArticles(filtered)
  }, [articles, searchTerm, activeTab, selectedTags])

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    )
  }

  if (loading || authLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.loadingSpinner} />
        <p>Carregando artigos...</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Leia</h1>
            <p className={styles.subtitle}>Artigos, notícias, reflexões e depoimentos da comunidade</p>
          </div>
        </div>

        <div className={styles.filters}>
          <div className={styles.searchContainer}>
            <Search className={styles.searchIcon} />
            <Input
              placeholder="Buscar por título, conteúdo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <Button variant="outline" size="icon" className={styles.filterButton}>
            <Filter className={styles.filterIcon} />
          </Button>
        </div>

        <div className={styles.tagsContainer}>
          {availableTags.map(tag => (
            <Badge 
              key={tag} 
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className={styles.tagBadge}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>

        <Tabs defaultValue="todos" value={activeTab} onValueChange={(value) => setActiveTab(value as ArticleType | "todos")} className={styles.tabs}>
          <TabsList className={styles.tabsList}>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="artigo">Artigos</TabsTrigger>
            <TabsTrigger value="noticia">Notícias</TabsTrigger>
            <TabsTrigger value="reflexao">Reflexões</TabsTrigger>
            <TabsTrigger value="depoimento">Depoimentos</TabsTrigger>
          </TabsList>

          <TabsContent value="todos" className={styles.tabContent}>
            <div className={styles.articlesGrid}>
              {filteredArticles.length > 0 ? (
                filteredArticles.map(article => (
                  <ArticleCard key={article.id} article={article} />
                ))
              ) : (
                <div className={styles.emptyState}>
                  <p>Nenhum conteúdo encontrado para os filtros selecionados.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="artigo" className={styles.tabContent}>
            <div className={styles.articlesGrid}>
              {filteredArticles.length > 0 ? (
                filteredArticles.map(article => (
                  <ArticleCard key={article.id} article={article} />
                ))
              ) : (
                <div className={styles.emptyState}>
                  <p>Nenhum artigo encontrado para os filtros selecionados.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="noticia" className={styles.tabContent}>
            <div className={styles.articlesGrid}>
              {filteredArticles.length > 0 ? (
                filteredArticles.map(article => (
                  <ArticleCard key={article.id} article={article} />
                ))
              ) : (
                <div className={styles.emptyState}>
                  <p>Nenhuma notícia encontrada para os filtros selecionados.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="reflexao" className={styles.tabContent}>
            <div className={styles.articlesGrid}>
              {filteredArticles.length > 0 ? (
                filteredArticles.map(article => (
                  <ArticleCard key={article.id} article={article} />
                ))
              ) : (
                <div className={styles.emptyState}>
                  <p>Nenhuma reflexão encontrada para os filtros selecionados.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="depoimento" className={styles.tabContent}>
            <div className={styles.articlesGrid}>
              {filteredArticles.length > 0 ? (
                filteredArticles.map(article => (
                  <ArticleCard key={article.id} article={article} />
                ))
              ) : (
                <div className={styles.emptyState}>
                  <p>Nenhum depoimento encontrado para os filtros selecionados.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {isWriter && (
          <Link href="/leia/escreva">
            <Button className={styles.writeButton} size="icon">
              <Edit className={styles.writeIcon} />
            </Button>
          </Link>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
