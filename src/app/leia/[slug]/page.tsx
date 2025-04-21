"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getArticleBySlug } from "@/services/article-service"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { formatDate } from "@/lib/utils"
import { Loader2, Calendar, Eye, Tag, ArrowLeft, Share2, Facebook, Twitter, Linkedin, LinkIcon } from 'lucide-react'
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import type { Article } from "@/types/article"
import styles from "./page.module.css"

export default function ArticlePage() {
  const params = useParams()
  const router = useRouter()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showShareMenu, setShowShareMenu] = useState(false)
  
  useEffect(() => {
    async function fetchArticle() {
      if (!params.slug) return
      
      try {
        setLoading(true)
        setError(null)
        
        const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug
        const fetchedArticle = await getArticleBySlug(slug)
        
        if (!fetchedArticle) {
          setError("Artigo não encontrado")
        } else {
          setArticle(fetchedArticle)
        }
      } catch (err) {
        setError("Erro ao carregar o artigo. Tente novamente.")
        console.error("Erro ao buscar artigo:", err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchArticle()
  }, [params.slug])
  
  const getArticleTypeLabel = (type: string) => {
    switch (type) {
      case "artigo": return "Artigo"
      case "noticia": return "Notícia"
      case "reflexao": return "Reflexão"
      case "depoimento": return "Depoimento"
      default: return type
    }
  }
  
  const handleShare = (platform?: string) => {
    const url = window.location.href
    const title = article?.title || "Artigo no Cate"
    
    if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank")
    } else if (platform === "twitter") {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, "_blank")
    } else if (platform === "linkedin") {
      window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`, "_blank")
    } else {
      // Copiar link
      navigator.clipboard.writeText(url).then(() => {
        toast.success("Link copiado para a área de transferência")
      }).catch(() => {
        toast.error("Erro ao copiar link")
      })
    }
    
    setShowShareMenu(false)
  }
  
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <Loader2 className={`${styles.loadingIcon} animate-spin`} />
          <p>Carregando artigo...</p>
        </div>
        <BottomNav />
      </div>
    )
  }
  
  if (error || !article) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <h2 className={styles.errorTitle}>Oops!</h2>
          <p className={styles.errorMessage}>{error || "Artigo não encontrado"}</p>
          <Button onClick={() => router.push("/leia")}>Voltar para Leia</Button>
        </div>
        <BottomNav />
      </div>
    )
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Button
          variant="ghost"
          className={styles.backButton}
          onClick={() => router.push("/leia")}
        >
          <ArrowLeft className={styles.backIcon} />
          Voltar
        </Button>
        
        <div className={styles.articleHeader}>
          <Badge className={styles.articleType}>
            {getArticleTypeLabel(article.type)}
          </Badge>
          
          <h1 className={styles.articleTitle}>{article.title}</h1>
          <p className={styles.articleSubtitle}>{article.subtitle}</p>
          
          <div className={styles.articleMeta}>
            <div className={styles.authorInfo}>
              <Avatar className={styles.authorAvatar}>
                <AvatarImage src={article.authorImage || undefined} alt={article.authorName} />
                <AvatarFallback>{article.authorName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className={styles.authorDetails}>
                <span className={styles.authorName}>{article.authorName}</span>
                <span className={styles.publishDate}>
                  <Calendar className={styles.metaIcon} />
                  {formatDate(article.publishedAt)}
                </span>
              </div>
            </div>
            
            <div className={styles.articleStats}>
              <span className={styles.viewCount}>
                <Eye className={styles.metaIcon} />
                {article.views} visualizações
              </span>
              
              <div className={styles.shareContainer}>
                <Button
                  variant="ghost"
                  size="icon"
                  className={styles.shareButton}
                  onClick={() => setShowShareMenu(!showShareMenu)}
                >
                  <Share2 className={styles.shareIcon} />
                </Button>
                
                {showShareMenu && (
                  <div className={styles.shareMenu}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={styles.shareOption}
                      onClick={() => handleShare("facebook")}
                    >
                      <Facebook className={styles.shareOptionIcon} />
                      Facebook
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={styles.shareOption}
                      onClick={() => handleShare("twitter")}
                    >
                      <Twitter className={styles.shareOptionIcon} />
                      Twitter
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={styles.shareOption}
                      onClick={() => handleShare("linkedin")}
                    >
                      <Linkedin className={styles.shareOptionIcon} />
                      LinkedIn
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={styles.shareOption}
                      onClick={() => handleShare()}
                    >
                      <LinkIcon className={styles.shareOptionIcon} />
                      Copiar link
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {article.coverImage && (
          <div className={styles.coverImageContainer}>
            <Image
              src={article.coverImage || "/placeholder.svg"}
              alt={article.title}
              className={styles.coverImage}
              width={1200}
              height={600}
              priority
            />
          </div>
        )}
        
        <div className={styles.articleContent}>
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>
        
        <Separator className={styles.separator} />
        
        <div className={styles.articleFooter}>
          <div className={styles.tagsContainer}>
            <Tag className={styles.tagsIcon} />
            <div className={styles.tags}>
              {article.tags.map((tag, index) => (
                <Link href={`/leia?tag=${tag}`} key={index}>
                  <Badge variant="outline" className={styles.tagBadge}>
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
          
          <div className={styles.shareFooter}>
            <span className={styles.shareText}>Compartilhar:</span>
            <div className={styles.shareButtons}>
              <Button
                variant="outline"
                size="icon"
                className={styles.shareIconButton}
                onClick={() => handleShare("facebook")}
              >
                <Facebook className={styles.shareFooterIcon} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={styles.shareIconButton}
                onClick={() => handleShare("twitter")}
              >
                <Twitter className={styles.shareFooterIcon} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={styles.shareIconButton}
                onClick={() => handleShare("linkedin")}
              >
                <Linkedin className={styles.shareFooterIcon} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={styles.shareIconButton}
                onClick={() => handleShare()}
              >
                <LinkIcon className={styles.shareFooterIcon} />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
