import Link from "next/link"
import Image from "next/image"
import { formatDate, truncateText } from "@/lib/utils"
import type { Article } from "@/types/article"
import { Badge } from "@/components/ui/badge"
import { Calendar, Eye } from "lucide-react"
import styles from "./article-card.module.css"

interface ArticleCardProps {
  article: Article
}

export function ArticleCard({ article }: ArticleCardProps) {
  const articleTypeLabel = {
    article: "Artigo",
    news: "Notícia",
    reflection: "Reflexão",
    testimony: "Depoimento",
  }

  return (
    <Link href={`/leia/${article.id}`} className={styles.card}>
      <div className={styles.imageContainer}>
        {article.imageUrl ? (
          <Image
            src={article.imageUrl || "/placeholder.svg"}
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
          {articleTypeLabel[article.type]}
        </Badge>
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{article.title}</h3>
        <p className={styles.subtitle}>{truncateText(article.subtitle, 120)}</p>

        <div className={styles.meta}>
          <div className={styles.author}>
            {article.authorImage ? (
              <Image
                src={article.authorImage || "/placeholder.svg"}
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
