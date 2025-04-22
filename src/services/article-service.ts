import { firestore } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, query, where, orderBy, limit, updateDoc, deleteDoc, setDoc, increment } from "firebase/firestore";
import type { Article, ArticleFormData, ArticleType } from "@/types/article";
import { getUserData } from "@/services/user-service";
import { slugify } from "@/lib/utils";

// Gerar um slug único baseado no título
export async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = slugify(title);
  
  // Verificar se o slug já existe
  const articlesRef = collection(firestore, "articles");
  const q = query(articlesRef, where("slug", "==", baseSlug));
  const querySnapshot = await getDocs(q);
  
  // Se não existir, retorna o slug base
  if (querySnapshot.empty) {
    return baseSlug;
  }
  
  // Se existir, adiciona um timestamp ao final
  return `${baseSlug}-${Date.now().toString().slice(-6)}`;
}

// Gerar um ID amigável para URL
export function generateFriendlyId(): string {
  // Caracteres permitidos (sem caracteres ambíguos como 0, O, 1, l, I)
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let id = "";
  
  // Gerar um ID de 10 caracteres
  for (let i = 0; i < 10; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return id;
}

// Buscar todos os artigos
export async function getAllArticles(maxLimit = 20): Promise<Article[]> {
  try {
    const articlesRef = collection(firestore, "articles");
    const q = query(
      articlesRef, 
      where("published", "==", true),
      orderBy("createdAt", "desc"),
      limit(maxLimit)
    );
    
    const querySnapshot = await getDocs(q);
    const articles: Article[] = [];
    
    querySnapshot.forEach((doc) => {
      articles.push({ id: doc.id, ...doc.data() } as Article);
    });
    
    return articles;
  } catch (error) {
    console.error("Erro ao buscar artigos:", error);
    throw error;
  }
}

// Buscar artigos por tipo
export async function getArticlesByType(type: ArticleType, maxLimit = 20): Promise<Article[]> {
  try {
    const articlesRef = collection(firestore, "articles");
    const q = query(
      articlesRef, 
      where("type", "==", type),
      where("published", "==", true),
      orderBy("createdAt", "desc"),
      limit(maxLimit)
    );
    
    const querySnapshot = await getDocs(q);
    const articles: Article[] = [];
    
    querySnapshot.forEach((doc) => {
      articles.push({ id: doc.id, ...doc.data() } as Article);
    });
    
    return articles;
  } catch (error) {
    console.error(`Erro ao buscar artigos do tipo ${type}:`, error);
    throw error;
  }
}

// Buscar artigos por tag
export async function getArticlesByTag(tag: string, maxLimit = 20): Promise<Article[]> {
  try {
    const articlesRef = collection(firestore, "articles");
    const q = query(
      articlesRef, 
      where("tags", "array-contains", tag),
      where("published", "==", true),
      orderBy("createdAt", "desc"),
      limit(maxLimit)
    );
    
    const querySnapshot = await getDocs(q);
    const articles: Article[] = [];
    
    querySnapshot.forEach((doc) => {
      articles.push({ id: doc.id, ...doc.data() } as Article);
    });
    
    return articles;
  } catch (error) {
    console.error(`Erro ao buscar artigos com a tag ${tag}:`, error);
    throw error;
  }
}

// Buscar artigos por autor
export async function getArticlesByAuthor(authorId: string): Promise<Article[]> {
  try {
    const articlesRef = collection(firestore, "articles");
    const q = query(
      articlesRef, 
      where("authorId", "==", authorId),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const articles: Article[] = [];
    
    querySnapshot.forEach((doc) => {
      articles.push({ id: doc.id, ...doc.data() } as Article);
    });
    
    return articles;
  } catch (error) {
    console.error(`Erro ao buscar artigos do autor ${authorId}:`, error);
    throw error;
  }
}

// Buscar artigo por ID
export async function getArticleById(id: string): Promise<Article | null> {
  try {
    const articleRef = doc(firestore, "articles", id);
    const articleDoc = await getDoc(articleRef);
    
    if (articleDoc.exists()) {
      return { id: articleDoc.id, ...articleDoc.data() } as Article;
    }
    
    return null;
  } catch (error) {
    console.error(`Erro ao buscar artigo com ID ${id}:`, error);
    throw error;
  }
}

// Incrementar visualizações do artigo
export async function incrementArticleViews(id: string): Promise<void> {
  try {
    const articleRef = doc(firestore, "articles", id);
    await updateDoc(articleRef, {
      views: increment(1)
    });
  } catch (error) {
    console.error(`Erro ao incrementar visualizações do artigo ${id}:`, error);
    throw error;
  }
}

// Criar um novo artigo
export async function createArticle(userId: string, articleData: ArticleFormData): Promise<Article> {
  try {
    // Buscar dados do autor
    const userData = await getUserData(userId);
    if (!userData) {
      throw new Error("Usuário não encontrado");
    }
    
    // Gerar ID amigável e slug
    const friendlyId = generateFriendlyId();
    const slug = await generateUniqueSlug(articleData.title);
    
    const now = new Date().toISOString();
    
    const newArticle: Omit<Article, "id"> = {
      title: articleData.title,
      subtitle: articleData.subtitle,
      content: articleData.content,
      authorId: userId,
      authorName: userData.name || "Autor desconhecido",
      authorImage: userData.profileImage || undefined,
      type: articleData.type,
      tags: articleData.tags,
      createdAt: now,
      updatedAt: now,
      imageUrl: articleData.imageUrl,
      slug,
      published: true,
      views: 0
    };
    
    // Salvar no Firestore com o ID amigável
    await setDoc(doc(firestore, "articles", friendlyId), newArticle);
    
    return { id: friendlyId, ...newArticle };
  } catch (error) {
    console.error("Erro ao criar artigo:", error);
    throw error;
  }
}

// Atualizar um artigo existente
export async function updateArticle(id: string, articleData: Partial<ArticleFormData>): Promise<void> {
  try {
    const articleRef = doc(firestore, "articles", id);
    
    // Se o título foi alterado, gerar um novo slug
    const updateData: Partial<Article> = {
      ...articleData,
      updatedAt: new Date().toISOString()
    };
    
    if (articleData.title) {
      updateData.slug = await generateUniqueSlug(articleData.title);
    }
    
    await updateDoc(articleRef, updateData);
  } catch (error) {
    console.error(`Erro ao atualizar artigo ${id}:`, error);
    throw error;
  }
}

// Excluir um artigo
export async function deleteArticle(id: string): Promise<void> {
  try {
    const articleRef = doc(firestore, "articles", id);
    await deleteDoc(articleRef);
  } catch (error) {
    console.error(`Erro ao excluir artigo ${id}:`, error);
    throw error;
  }
}

// Buscar artigos por termo de pesquisa (título ou conteúdo)
export async function searchArticles(searchTerm: string, limit = 20): Promise<Article[]> {
  try {
    // Firestore não suporta pesquisa de texto completo nativamente
    // Esta é uma implementação básica que busca todos os artigos e filtra no cliente
    const articlesRef = collection(firestore, "articles");
    const q = query(
      articlesRef,
      where("published", "==", true),
      orderBy("createdAt", "desc"),
      limit(100) // Buscar mais artigos para filtrar
    );
    
    const querySnapshot = await getDocs(q);
    const articles: Article[] = [];
    
    querySnapshot.forEach((doc) => {
      const article = { id: doc.id, ...doc.data() } as Article;
      
      // Filtrar por título, subtítulo ou tags
      const searchTermLower = searchTerm.toLowerCase();
      if (
        article.title.toLowerCase().includes(searchTermLower) ||
        article.subtitle.toLowerCase().includes(searchTermLower) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTermLower))
      ) {
        articles.push(article);
      }
    });
    
    return articles.slice(0, limit);
  } catch (error) {
    console.error(`Erro ao pesquisar artigos com termo "${searchTerm}":`, error);
    throw error;
  }
}
