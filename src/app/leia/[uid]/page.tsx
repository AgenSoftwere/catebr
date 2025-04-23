"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArticleShare } from "@/components/articles/article-share"
import { getArticleById } from "@/services/article-service"
import type { Article } from "@/types/article"
import { formatDate } from "@/lib/utils"
import { ArrowLeft, Clock, Calendar, Edit } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import styles from "./article.module.css"

export default function ArticlePage() {
  const params = useParams()
  const id = params?.uid as string
  const router = useRouter()
  const { user } = useAuth()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        console.log("Buscando artigo com ID:", id)
        setLoading(true)
        const fetchedArticle = await getArticleById(id)
        console.log("Artigo encontrado:", fetchedArticle)

        // O getArticleById já carrega a imagem de capa automaticamente
        setArticle(fetchedArticle)
      } catch (error) {
        console.error("Erro ao buscar artigo:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchArticle()
    } else {
      console.error("ID do artigo não encontrado nos parâmetros")
    }
  }, [id])

  // Verificar se o usuário é o autor do artigo
  const isAuthor = user && article && user.uid === article.authorId

  // Função para obter as iniciais do nome do autor
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

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

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.header}>
            <Button variant="ghost" className={styles.backButton} onClick={() => router.back()}>
              <ArrowLeft className={styles.backIcon} />
              <span>Voltar</span>
            </Button>
          </div>

          <div className={styles.articleSkeleton}>
            <Skeleton className={styles.titleSkeleton} />
            <Skeleton className={styles.subtitleSkeleton} />

            <div className={styles.metaSkeleton}>
              <div className={styles.authorSkeleton}>
                <Skeleton className={styles.avatarSkeleton} />
                <Skeleton className={styles.nameSkeleton} />
              </div>
              <div className={styles.dateSkeleton}>
                <Skeleton className={styles.dateItemSkeleton} />
                <Skeleton className={styles.dateItemSkeleton} />
              </div>
            </div>

            <Skeleton className={styles.coverSkeleton} />

            <div className={styles.contentSkeleton}>
              <Skeleton className={styles.paragraphSkeleton} />
              <Skeleton className={styles.paragraphSkeleton} />
              <Skeleton className={styles.paragraphSkeleton} />
              <Skeleton className={styles.paragraphSkeleton} />
              <Skeleton className={styles.paragraphSkeleton} />
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    )
  }

  if (!article) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.header}>
            <Button variant="ghost" className={styles.backButton} onClick={() => router.back()}>
              <ArrowLeft className={styles.backIcon} />
              <span>Voltar</span>
            </Button>
          </div>

          <div className={styles.notFound}>
            <h1 className={styles.notFoundTitle}>Artigo não encontrado</h1>
            <p className={styles.notFoundText}>O artigo que você está procurando não existe ou foi removido.</p>
            <Button onClick={() => router.push("/leia")}>Ver todos os artigos</Button>
          </div>
        </div>
        <BottomNav />
      </div>
    )
  }

  const shareUrl = typeof window !== "undefined" ? window.location.href : ""

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <Button variant="ghost" className={styles.backButton} onClick={() => router.back()}>
            <ArrowLeft className={styles.backIcon} />
            <span>Voltar</span>
          </Button>

          <div className={styles.actions}>
            {isAuthor && (
              <Link href={`/leia/escreva?edit=${article.id}`}>
                <Button variant="outline" size="sm" className={styles.editButton}>
                  <Edit className={styles.editIcon} />
                  <span>Editar</span>
                </Button>
              </Link>
            )}

            <ArticleShare title={article.title} url={shareUrl} />
          </div>
        </div>

        <article className={styles.article}>
          <Badge className={styles.typeTag}>{getTypeName(article.type)}</Badge>

          <h1 className={styles.title}>{article.title}</h1>
          <h2 className={styles.subtitle}>{article.subtitle}</h2>

          <div className={styles.meta}>
            <div className={styles.author}>
              <Avatar className={styles.avatar}>
                <AvatarImage src={article.authorImage || "/placeholder.svg"} alt={article.authorName} />
                <AvatarFallback>{getInitials(article.authorName)}</AvatarFallback>
              </Avatar>
              <div className={styles.authorInfo}>
                <span className={styles.authorName}>{article.authorName}</span>
                <div className={styles.articleMeta}>
                  <div className={styles.metaItem}>
                    <Calendar className={styles.metaIcon} />
                    <span className={styles.metaText}>{formatDate(article.createdAt)}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <Clock className={styles.metaIcon} />
                    <span className={styles.metaText}>{article.readTime} min de leitura</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {article.coverImage && (
            <div className={styles.coverContainer}>
              <Image
                src={article.coverImage || "/placeholder.svg"}
                alt={article.title}
                width={800}
                height={400}
                className={styles.coverImage}
              />
            </div>
          )}

          <div className={styles.content} dangerouslySetInnerHTML={{ __html: article.content }} />

          <div className={styles.tags}>
            {article.tags &&
              article.tags.map((tag) => (
                <Badge key={tag} variant="outline" className={styles.tag}>
                  {tag}
                </Badge>
              ))}
          </div>

          <div className={styles.shareFooter}>
            <span className={styles.shareText}>Compartilhar:</span>
            <ArticleShare title={article.title} url={shareUrl} />
          </div>
        </article>
      </div>
      <BottomNav />
    </div>
  )
}
