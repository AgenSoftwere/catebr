"use client"

import { useState, useEffect } from "react";
import { 
  getAllArticles, 
  getArticlesByType, 
  getArticlesByTag, 
  getArticlesByAuthor,
  searchArticles
} from "@/services/article-service";
import type { Article, ArticleType } from "@/types/article";

interface UseArticlesOptions {
  type?: ArticleType;
  tag?: string;
  authorId?: string;
  searchTerm?: string;
  limit?: number;
}

export function useArticles(options: UseArticlesOptions = {}) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticles() {
      try {
        setLoading(true);
        setError(null);
        
        let fetchedArticles: Article[];
        
        if (options.searchTerm) {
          fetchedArticles = await searchArticles(options.searchTerm, options.limit);
        } else if (options.type) {
          fetchedArticles = await getArticlesByType(options.type, options.limit);
        } else if (options.tag) {
          fetchedArticles = await getArticlesByTag(options.tag, options.limit);
        } else if (options.authorId) {
          fetchedArticles = await getArticlesByAuthor(options.authorId);
        } else {
          fetchedArticles = await getAllArticles(options.limit);
        }
        
        setArticles(fetchedArticles);
      } catch (err) {
        console.error("Erro ao buscar artigos:", err);
        setError("Não foi possível carregar os artigos. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    }
    
    fetchArticles();
  }, [options.type, options.tag, options.authorId, options.searchTerm, options.limit]);
  
  return { articles, loading, error };
}
