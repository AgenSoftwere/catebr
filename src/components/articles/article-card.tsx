"use client"

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Calendar, Tag } from 'lucide-react';
import { formatDate, } from "@/lib/utils";
import type { Article } from "@/types/article";
import styles from "./article-card.module.css";

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

export function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const [imageError, setImageError] = useState(false);
  
  const getArticleTypeLabel = (type: string) => {
    switch (type) {
      case "artigo": return "Artigo";
      case "noticia": return "Notícia";
      case "reflexao": return "Reflexão";
      case "depoimento": return "Depoimento";
      default: return type;
    }
  };
  
  const getArticleTypeColor = (type: string) => {
    switch (type) {
      case "artigo": return "bg-blue-100 text-blue-800";
      case "noticia": return "bg-green-100 text-green-800";
      case "reflexao": return "bg-purple-100 text-purple-800";
      case "depoimento": return "bg-amber-100 text-amber-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Link href={`/leia/${article.slug}`} className={styles.cardLink}>
      <Card className={`${styles.card} ${featured ? styles.featured : ''}`}>
        <div className={styles.cardImageContainer}>
          {!imageError && article.coverImage ? (
            <Image
              src={article.coverImage || "/placeholder.svg"}
              alt={article.title}
              className={styles.cardImage}
              width={featured ? 800 : 400}
              height={featured ? 400 : 200}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className={styles.placeholderImage}>
              <span className={styles.placeholderText}>{article.title.charAt(0)}</span>
            </div>
          )}
          <div className={`${styles.articleType} ${getArticleTypeColor(article.type)}`}>
            {getArticleTypeLabel(article.type)}
          </div>
        </div>
        
        <CardHeader className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>{article.title}</h3>
          <p className={styles.cardSubtitle}>{article.subtitle}</p>
        </CardHeader>
        
        <CardContent className={styles.cardContent}>
          <div className={styles.tagsContainer}>
            {article.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className={styles.tag}>
                <Tag className={styles.tagIcon} />
                {tag}
              </Badge>
            ))}
            {article.tags.length > 3 && (
              <Badge variant="outline" className={styles.tag}>
                +{article.tags.length - 3}
              </Badge>
            )}
          </div>
        </CardContent>
        
        <CardFooter className={styles.cardFooter}>
          <div className={styles.authorInfo}>
            <Avatar className={styles.authorAvatar}>
              <AvatarImage src={article.authorImage || undefined} alt={article.authorName} />
              <AvatarFallback>{article.authorName.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className={styles.authorName}>{article.authorName}</span>
          </div>
          
          <div className={styles.articleMeta}>
            <span className={styles.metaItem}>
              <Calendar className={styles.metaIcon} />
              {formatDate(article.publishedAt)}
            </span>
            <span className={styles.metaItem}>
              <Eye className={styles.metaIcon} />
              {article.views}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
