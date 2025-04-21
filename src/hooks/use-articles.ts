"use client"

import { useState, useEffect, useCallback } from "react";
import { getArticles, getArticleById, getArticlesByAuthor, getPopularTags } from "@/services/article-service";
import type { Article, ArticleFilter } from "@/types/article";

export function useArticles(initialFilters?: ArticleFilter) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ArticleFilter>(initialFilters || {});
  const [lastDoc, setLastDoc] = useState<Record<string, unknown> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchArticles = useCallback(async (reset: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentLastDoc = reset ? null : lastDoc;
      const result = await getArticles(filters, currentLastDoc);
      
      if (reset) {
        setArticles(result.articles);
      } else {
        setArticles(prev => [...prev, ...result.articles]);
      }
      
      setLastDoc(result.lastDoc);
      setHasMore(result.articles.length === 10); // Assumindo que buscamos 10 por página
    } catch (err) {
      setError("Erro ao carregar artigos. Tente novamente.");
      console.error("Erro ao buscar artigos:", err);
    } finally {
      setLoading(false);
    }
  }, [filters, lastDoc]);

  // Carregar artigos iniciais
  useEffect(() => {
    fetchArticles(true);
  }, [fetchArticles]);

  // Função para carregar mais artigos
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchArticles();
    }
  }, [loading, hasMore, fetchArticles]);

  // Função para atualizar filtros
  const updateFilters = useCallback((newFilters: ArticleFilter) => {
    setFilters(newFilters);
    setLastDoc(null); // Resetar paginação
  }, []);

  return {
    articles,
    loading,
    error,
    hasMore,
    loadMore,
    filters,
    updateFilters,
    refreshArticles: () => fetchArticles(true)
  };
}

export function useArticleDetail(id?: string, slug?: string) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticle() {
      try {
        setLoading(true);
        setError(null);
        
        let fetchedArticle: Article | null = null;
        
        if (id) {
          fetchedArticle = await getArticleById(id);
        } else if (slug) {
          // Implementar getArticleBySlug se necessário
        }
        
        if (!fetchedArticle) {
          setError("Artigo não encontrado");
        } else {
          setArticle(fetchedArticle);
        }
      } catch (err) {
        setError("Erro ao carregar o artigo. Tente novamente.");
        console.error("Erro ao buscar artigo:", err);
      } finally {
        setLoading(false);
      }
    }

    if (id || slug) {
      fetchArticle();
    }
  }, [id, slug]);

  return { article, loading, error };
}

export function useAuthorArticles(authorId?: string) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAuthorArticles() {
      if (!authorId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const fetchedArticles = await getArticlesByAuthor(authorId);
        setArticles(fetchedArticles);
      } catch (err) {
        setError("Erro ao carregar artigos do autor. Tente novamente.");
        console.error("Erro ao buscar artigos do autor:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAuthorArticles();
  }, [authorId]);

  return { articles, loading, error };
}

export function usePopularTags() {
  const [tags, setTags] = useState<{tag: string, count: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTags() {
      try {
        setLoading(true);
        setError(null);
        
        const popularTags = await getPopularTags(15);
        setTags(popularTags);
      } catch (err) {
        setError("Erro ao carregar tags populares.");
        console.error("Erro ao buscar tags populares:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTags();
  }, []);

  return { tags, loading, error };
}
