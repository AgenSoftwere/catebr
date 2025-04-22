"use client"

import { useState, useEffect } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getArticlesByAuthor } from "@/services/article-service"
import { Article } from "@/types/article"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ArrowLeft, Edit, Trash, Eye, Loader2 } from 'lucide-react'
import Link from "next/link"
import { useRouter } from "next/navigation"
import styles from "./meus-artigos.module.css"

export default function MeusArtigosPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("todos")

  // Verificar se o usuário é escritor
  const isWriter = user?.contributions && Array.isArray(user.contributions) && user.contributions.includes("escritor")

  useEffect(() => {
    // Redirecionar se não for escritor
    if (!authLoading && user && !isWriter) {
      router.push("/perfil")
    }
    
    if (!authLoading && !user) {
      router.push("/auth/o/login")
    }
  }, [user, isWriter, authLoading, router])

  useEffect(() => {
    const fetchArticles = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        const fetchedArticles = await getArticlesByAuthor(user.uid)
        setArticles(fetchedArticles)
      } catch (error) {
        console.error("Erro ao buscar artigos:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchArticles()
    }
  }, [user])

  // Filtrar artigos com base na tab ativa
  const filteredArticles = articles.filter(article => {
    if (activeTab === "todos") return true
    return article.type === activeTab
  })

  // Função para obter o nome do tipo
  const getTypeName = (type: string) => {
    switch (type) {
      case "artigo":
        return "Artigo"
      case "noticia":
        return "Notícia"
      case "reflexao":
        return "Reflexão"
      case "depoimento":
        return "Depoimento"
      default:
        return ""
    }
  }

  // Função para obter a cor do tipo
  const getTypeColor = (type: string) => {
    switch (type) {
      case "artigo":
        return styles.articleType
      case "noticia":
        return styles.newsType
      case "reflexao":
        return styles.reflectionType
      case "depoimento":
        return styles.testimonialType
      default:
        return ""
    }
  }

  if (authLoading || loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.loadingSpinner} />
        <p>Carregando seus artigos...</p>
      </div>
    )
  }

  if (!user || !isWriter) {
    return null // Redirecionamento já está sendo tratado no useEffect
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <Button variant="ghost" className={styles.backButton} onClick={() => router.push("/perfil")}>
            <ArrowLeft className={styles.backIcon} />
            <span>Voltar</span>
          </Button>
          
          <h1 className={styles.title}>Meus Artigos</h1>
        </div>
        
        <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab} className={styles.tabs}>
          <TabsList className={styles.tabsList}>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="artigo">Artigos</TabsTrigger>
            <TabsTrigger value="noticia">Notícias</TabsTrigger>
            <TabsTrigger value="reflexao">Reflexões</TabsTrigger>
            <TabsTrigger value="depoimento">Depoimentos</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className={styles.tabContent}>
            {filteredArticles.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyText}>
                  {activeTab === "todos"
                    ? "Você ainda não escreveu nenhum conteúdo."
                    : `Você ainda não escreveu nenhum ${getTypeName(activeTab).toLowerCase()}.`}
                </p>
                <Link href="/leia/escreva">
                  <Button>Escrever agora</Button>
                </Link>
              </div>
            ) : (
              <div className={styles.articlesList}>
                {filteredArticles.map(article => (
                  <Card key={article.id} className={styles.articleCard}>
                    <CardHeader className={styles.articleHeader}>
                      <div className={styles.articleTitleContainer}>
                        <Badge className={`${styles.typeTag} ${getTypeColor(article.type)}`}>
                          {getTypeName(article.type)}
                        </Badge>
                        <h3 className={styles.articleTitle}>{article.title}</h3>
                      </div>
                      <p className={styles.articleSubtitle}>{article.subtitle}</p>
                    </CardHeader>
                    
                    <CardContent className={styles.articleContent}>
                      <div className={styles.articleMeta}>
                        <span className={styles.articleDate}>
                          Publicado {formatDistanceToNow(new Date(article.createdAt), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </span>
                        <span className={styles.articleReadTime}>{article.readTime} min de leitura</span>
                      </div>
                      
                      <div className={styles.articleTags}>
                        {article.tags && article.tags.map(tag => (
                          <Badge key={tag} variant="outline" className={styles.articleTag}>
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    
                    <CardFooter className={styles.articleFooter}>
                      <div className={styles.articleActions}>
                        <Link href={`/leia/${article.id}`}>
                          <Button variant="outline" size="sm" className={styles.actionButton}>
                            <Eye className={styles.actionIcon} />
                            <span>Visualizar</span>
                          </Button>
                        </Link>
                        
                        <Link href={`/leia/escreva?edit=${article.id}`}>
                          <Button variant="outline" size="sm" className={styles.actionButton}>
                            <Edit className={styles.actionIcon} />
                            <span>Editar</span>
                          </Button>
                        </Link>
                        
                        <Button variant="outline" size="sm" className={`${styles.actionButton} ${styles.deleteButton}`}>
                          <Trash className={styles.actionIcon} />
                          <span>Excluir</span>
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <Link href="/leia/escreva">
          <Button className={styles.writeButton}>
            <Edit className={styles.writeIcon} />
            <span>Escrever novo</span>
          </Button>
        </Link>
      </div>
      <BottomNav />
    </div>
  )
}
