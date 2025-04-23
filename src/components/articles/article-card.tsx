"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { formatDate, truncateText } from "@/lib/utils"
import type { Article } from "@/types/article"
import { Badge } from "@/components/ui/badge"
import { Calendar, Eye } from 'lucide-react'
import { firestore } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import styles from "./article-card.module.css"

interface ArticleCardProps {
  article: Article
}

export function ArticleCard({ article }: ArticleCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [authorImageUrl, setAuthorImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Carregar imagens do Firestore se necessário
  useEffect(() => {
    const loadImages = async () => {
      try {
        setLoading(true)
        
        // Carregar imagem de capa
        if (article.imageUrl && typeof article.imageUrl === "string" && article.imageUrl.startsWith("firestore:")) {
          const imageId = article.imageUrl.replace("firestore:", "")
          const imageDoc = await getDoc(doc(firestore, "images", imageId))
          
          if (imageDoc.exists()) {
            setImageUrl(imageDoc.data().data)
          }
        } else if (article.imageUrl) {
          setImageUrl(article.imageUrl)
        }
        
        // Carregar imagem de capa alternativa
        if (!imageUrl && article.coverImage && typeof article.coverImage === "string" && article.coverImage.startsWith("firestore:")) {
          const imageId = article.coverImage.replace("firestore:", "")
          const imageDoc = await getDoc(doc(firestore, "images", imageId))
          
          if (imageDoc.exists()) {
            setImageUrl(imageDoc.data().data)
          }
        } else if (!imageUrl && article.coverImage) {
          setImageUrl(article.coverImage)
        }
        
        // Carregar imagem do autor
        if (article.authorImage && typeof article.authorImage === "string" && article.authorImage.startsWith("firestore:")) {
          const imageId = article.authorImage.replace("firestore:", "")
          const imageDoc = await getDoc(doc(firestore, "profileImages", imageId))
          
          if (imageDoc.exists()) {
            setAuthorImageUrl(imageDoc.data().data)
          }
        } else if (article.authorImage) {
          setAuthorImageUrl(article.authorImage)
        }
      } catch (error) {
        console.error("Erro ao carregar imagens:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadImages()
  }, [article.imageUrl, article.coverImage, article.authorImage, imageUrl])

  const articleTypeLabel: Record<string, string> = {
    artigo: "Artigo",
    noticia: "Notícia",
    reflexao: "Reflexão",
    depoimento: "Depoimento",
  }

  return (
    <Link href={`/leia/${article.id}`} className={styles.card}>
      <div className={styles.imageContainer}>
        {imageUrl ? (
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={article.title}
            className={styles.image}
            width={400}
            height={225}
            layout="responsive"
          />
        ) : (
          <div className={styles.placeholderImage}>
            <span>{article.title.charAt(0)}</span>
          </div>
        )}
        <Badge variant="secondary" className={styles.typeBadge}>
          {articleTypeLabel[article.type] || "Artigo"}
        </Badge>
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{article.title}</h3>
        <p className={styles.subtitle}>{truncateText(article.subtitle, 120)}</p>

        <div className={styles.meta}>
          <div className={styles.author}>
            {authorImageUrl ? (
              <Image
                src={authorImageUrl || "/placeholder.svg"}
                alt={article.authorName}
                width={24}
                height={24}
                className={styles.authorImage}
              />
            ) : (
              <div className={styles.authorInitial}>{article.authorName.charAt(0)}</div>
            )}
            <span className={styles.authorName}>{article.authorName}</span>
          </div>

          <div className={styles.stats}>
            <span className={styles.date}>
              <Calendar className={styles.icon} />
              {formatDate(article.createdAt)}
            </span>
            <span className={styles.views}>
              <Eye className={styles.icon} />
              {article.views}
            </span>
          </div>
        </div>

        <div className={styles.tags}>
          {article.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className={styles.tag}>
              {tag}
            </Badge>
          ))}
          {article.tags.length > 3 && (
            <Badge variant="outline" className={styles.tag}>
              +{article.tags.length - 3}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  )
}
