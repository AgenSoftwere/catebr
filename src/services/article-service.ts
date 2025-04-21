import { firestore } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, query, where, orderBy, limit, addDoc, updateDoc, deleteDoc, increment, startAfter, Timestamp } from "firebase/firestore";
import type { Article, ArticleType, ArticleFilter, ArticleFormData } from "@/types/article";
import { generateSlug } from "@/lib/utils";

// Função para buscar todos os artigos com filtros opcionais
export async function getArticles(filters?: ArticleFilter, lastDoc?: any, itemsPerPage: number = 10): Promise<{ articles: Article[], lastDoc: any }> {
  try {
    const articlesRef = collection(firestore, "articles");
    let q = query(articlesRef, orderBy("publishedAt", "desc"));
    
    // Aplicar filtros se existirem
    if (filters) {
      if (filters.type) {
        q = query(q, where("type", "==", filters.type));
      }
      
      if (filters.tag) {
        q = query(q, where("tags", "array-contains", filters.tag));
      }
      
      // Não podemos filtrar por texto diretamente no Firestore, isso será feito no cliente
    }
    
    // Paginação
    if (lastDoc) {
      q = query(q, startAfter(lastDoc), limit(itemsPerPage));
    } else {
      q = query(q, limit(itemsPerPage));
    }
    
    const snapshot = await getDocs(q);
    const articles: Article[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      articles.push({
        id: doc.id,
        uid: data.uid,
        title: data.title,
        subtitle: data.subtitle,
        content: data.content,
        type: data.type,
        tags: data.tags,
        coverImage: data.coverImage || null,
        publishedAt: data.publishedAt.toDate().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString(),
        slug: data.slug,
        authorName: data.authorName,
        authorImage: data.authorImage || null,
        views: data.views || 0,
        featured: data.featured || false
      });
    });
    
    // Filtrar por termo de busca se existir (isso é feito no cliente)
    let filteredArticles = articles;
    if (filters?.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filteredArticles = articles.filter(article => 
        article.title.toLowerCase().includes(searchTerm) || 
        article.subtitle.toLowerCase().includes(searchTerm) ||
        article.content.toLowerCase().includes(searchTerm)
      );
    }
    
    const lastVisible = snapshot.docs[snapshot.docs.length - 1];
    
    return { 
      articles: filteredArticles,
      lastDoc: lastVisible
    };
  } catch (error) {
    console.error("Erro ao buscar artigos:", error);
    throw error;
  }
}

// Função para buscar um artigo específico por ID
export async function getArticleById(id: string): Promise<Article | null> {
  try {
    const articleRef = doc(firestore, "articles", id);
    const articleDoc = await getDoc(articleRef);
    
    if (!articleDoc.exists()) {
      return null;
    }
    
    const data = articleDoc.data();
    
    // Incrementar visualizações
    await updateDoc(articleRef, {
      views: increment(1)
    });
    
    return {
      id: articleDoc.id,
      uid: data.uid,
      title: data.title,
      subtitle: data.subtitle,
      content: data.content,
      type: data.type,
      tags: data.tags,
      coverImage: data.coverImage || null,
      publishedAt: data.publishedAt.toDate().toISOString(),
      updatedAt: data.updatedAt?.toDate().toISOString(),
      slug: data.slug,
      authorName: data.authorName,
      authorImage: data.authorImage || null,
      views: (data.views || 0) + 1, // Incrementar localmente também
      featured: data.featured || false
    };
  } catch (error) {
    console.error("Erro ao buscar artigo:", error);
    throw error;
  }
}

// Função para buscar um artigo por slug
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const articlesRef = collection(firestore, "articles");
    const q = query(articlesRef, where("slug", "==", slug), limit(1));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const articleDoc = snapshot.docs[0];
    const data = articleDoc.data();
    
    // Incrementar visualizações
    await updateDoc(doc(firestore, "articles", articleDoc.id), {
      views: increment(1)
    });
    
    return {
      id: articleDoc.id,
      uid: data.uid,
      title: data.title,
      subtitle: data.subtitle,
      content: data.content,
      type: data.type,
      tags: data.tags,
      coverImage: data.coverImage || null,
      publishedAt: data.publishedAt.toDate().toISOString(),
      updatedAt: data.updatedAt?.toDate().toISOString(),
      slug: data.slug,
      authorName: data.authorName,
      authorImage: data.authorImage || null,
      views: (data.views || 0) + 1, // Incrementar localmente também
      featured: data.featured || false
    };
  } catch (error) {
    console.error("Erro ao buscar artigo por slug:", error);
    throw error;
  }
}

// Função para buscar artigos de um escritor específico
export async function getArticlesByAuthor(uid: string): Promise<Article[]> {
  try {
    const articlesRef = collection(firestore, "articles");
    const q = query(articlesRef, where("uid", "==", uid), orderBy("publishedAt", "desc"));
    const snapshot = await getDocs(q);
    
    const articles: Article[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      articles.push({
        id: doc.id,
        uid: data.uid,
        title: data.title,
        subtitle: data.subtitle,
        content: data.content,
        type: data.type,
        tags: data.tags,
        coverImage: data.coverImage || null,
        publishedAt: data.publishedAt.toDate().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString(),
        slug: data.slug,
        authorName: data.authorName,
        authorImage: data.authorImage || null,
        views: data.views || 0,
        featured: data.featured || false
      });
    });
    
    return articles;
  } catch (error) {
    console.error("Erro ao buscar artigos do autor:", error);
    throw error;
  }
}

// Função para criar um novo artigo
export async function createArticle(articleData: ArticleFormData, authorId: string, authorName: string, authorImage?: string): Promise<string> {
  try {
    // Gerar slug a partir do título
    const baseSlug = generateSlug(articleData.title);
    const timestamp = Date.now().toString(36);
    const slug = `${baseSlug}-${timestamp}`;
    
    const now = new Date();
    
    const newArticle = {
      uid: authorId,
      title: articleData.title,
      subtitle: articleData.subtitle,
      content: articleData.content,
      type: articleData.type,
      tags: articleData.tags,
      coverImage: articleData.coverImage || null,
      publishedAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
      slug: slug,
      authorName: authorName,
      authorImage: authorImage || null,
      views: 0,
      featured: false
    };
    
    const docRef = await addDoc(collection(firestore, "articles"), newArticle);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar artigo:", error);
    throw error;
  }
}

// Função para atualizar um artigo existente
export async function updateArticle(id: string, articleData: Partial<ArticleFormData>): Promise<void> {
  try {
    const articleRef = doc(firestore, "articles", id);
    
    const updateData: any = {
      ...articleData,
      updatedAt: Timestamp.fromDate(new Date())
    };
    
    // Se o título foi alterado, atualizar o slug
    if (articleData.title) {
      const baseSlug = generateSlug(articleData.title);
      const timestamp = Date.now().toString(36);
      updateData.slug = `${baseSlug}-${timestamp}`;
    }
    
    await updateDoc(articleRef, updateData);
  } catch (error) {
    console.error("Erro ao atualizar artigo:", error);
    throw error;
  }
}

// Função para excluir um artigo
export async function deleteArticle(id: string): Promise<void> {
  try {
    await deleteDoc(doc(firestore, "articles", id));
  } catch (error) {
    console.error("Erro ao excluir artigo:", error);
    throw error;
  }
}

// Função para obter tags populares
export async function getPopularTags(limit: number = 10): Promise<{tag: string, count: number}[]> {
  try {
    // Esta é uma implementação simplificada
    // Em um sistema real, você pode querer manter um contador de tags separado
    const articlesRef = collection(firestore, "articles");
    const snapshot = await getDocs(articlesRef);
    
    const tagCounts: Record<string, number> = {};
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.tags && Array.isArray(data.tags)) {
        data.tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
    
    const sortedTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
    
    return sortedTags;
  } catch (error) {
    console.error("Erro ao buscar tags populares:", error);
    throw error;
  }
}
