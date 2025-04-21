// Add or update the Article type definition
export interface Article {
    id: string
    uid: string
    title: string
    subtitle?: string
    content: string
    type: string
    tags: string[]
    coverImage: string | null
    publishedAt: string
    updatedAt?: string
    slug: string
    authorName: string
    authorImage: string | null
    views: number
    featured: boolean
  }
  
  export type ArticleType = "article" | "news" | "reflection" | "testimony"
  
  export interface ArticleFilter {
    type?: string
    tag?: string
    searchTerm?: string
  }
  
  export interface ArticleFormData {
    title: string
    subtitle?: string
    content: string
    type: string
    tags: string[]
    coverImage: string | null
    authorId?: string
    authorName?: string
    authorImage?: string | null
  }
  