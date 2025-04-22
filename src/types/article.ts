export type ArticleType = "artigo" | "noticia" | "reflexao" | "depoimento";

export interface Article {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  authorId: string;
  authorName: string;
  authorImage?: string;
  type: ArticleType;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
  slug: string;
  published: boolean;
  views: number;
  coverImage?: string
  readTime?: number
}

export interface ArticleFormData {
  title: string;
  subtitle: string;
  content: string;
  type: ArticleType;
  tags: string[];
  imageUrl?: string;
  coverImage: string | null
  authorName?: string
  authorImage?: string
}
