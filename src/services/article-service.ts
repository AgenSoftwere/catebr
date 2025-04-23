import { firestore } from "@/lib/firebase"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  deleteDoc,
  setDoc,
  increment,
} from "firebase/firestore"
import type { Article, ArticleFormData, ArticleType } from "@/types/article"
import { getUserData } from "@/services/user-service"
import { slugify } from "@/lib/utils"

// Gerar um slug único baseado no título
export async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = slugify(title)

  // Verificar se o slug já existe
  const articlesRef = collection(firestore, "articles")
  const q = query(articlesRef, where("slug", "==", baseSlug))
  const querySnapshot = await getDocs(q)

  // Se não existir, retorna o slug base
  if (querySnapshot.empty) {
    return baseSlug
  }

  // Se existir, adiciona um timestamp ao final
  return `${baseSlug}-${Date.now().toString().slice(-6)}`
}

// Gerar um ID amigável para URL
export function generateFriendlyId(): string {
  // Caracteres permitidos (sem caracteres ambíguos como 0, O, 1, l, I)
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789"
  let id = ""

  // Gerar um ID de 10 caracteres
  for (let i = 0; i < 10; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return id
}

// Buscar todos os artigos
export async function getAllArticles(maxLimit = 20): Promise<Article[]> {
  try {
    const articlesRef = collection(firestore, "articles")
    const q = query(articlesRef, where("published", "==", true), orderBy("createdAt", "desc"), limit(maxLimit))

    const querySnapshot = await getDocs(q)
    const articles: Article[] = []

    querySnapshot.forEach((doc) => {
      articles.push({ id: doc.id, ...doc.data() } as Article)
    })

    return articles
  } catch (error) {
    console.error("Erro ao buscar artigos:", error)
    throw error
  }
}

// Buscar artigos por tipo
export async function getArticlesByType(type: ArticleType, maxLimit = 20): Promise<Article[]> {
  try {
    const articlesRef = collection(firestore, "articles")
    const q = query(
      articlesRef,
      where("type", "==", type),
      where("published", "==", true),
      orderBy("createdAt", "desc"),
      limit(maxLimit),
    )

    const querySnapshot = await getDocs(q)
    const articles: Article[] = []

    querySnapshot.forEach((doc) => {
      articles.push({ id: doc.id, ...doc.data() } as Article)
    })

    return articles
  } catch (error) {
    console.error(`Erro ao buscar artigos do tipo ${type}:`, error)
    throw error
  }
}

// Buscar artigos por tag
export async function getArticlesByTag(tag: string, maxLimit = 20): Promise<Article[]> {
  try {
    const articlesRef = collection(firestore, "articles")
    const q = query(
      articlesRef,
      where("tags", "array-contains", tag),
      where("published", "==", true),
      orderBy("createdAt", "desc"),
      limit(maxLimit),
    )

    const querySnapshot = await getDocs(q)
    const articles: Article[] = []

    querySnapshot.forEach((doc) => {
      articles.push({ id: doc.id, ...doc.data() } as Article)
    })

    return articles
  } catch (error) {
    console.error(`Erro ao buscar artigos com a tag ${tag}:`, error)
    throw error
  }
}

// Buscar artigos por autor
export async function getArticlesByAuthor(authorId: string): Promise<Article[]> {
  try {
    const articlesRef = collection(firestore, "articles")
    const q = query(articlesRef, where("authorId", "==", authorId), orderBy("createdAt", "desc"))

    const querySnapshot = await getDocs(q)
    const articles: Article[] = []

    querySnapshot.forEach((doc) => {
      articles.push({ id: doc.id, ...doc.data() } as Article)
    })

    return articles
  } catch (error) {
    console.error(`Erro ao buscar artigos do autor ${authorId}:`, error)
    throw error
  }
}

// Buscar artigo por ID
export async function getArticleById(id: string): Promise<Article | null> {
  try {
    const articleRef = doc(firestore, "articles", id)
    const articleDoc = await getDoc(articleRef)

    if (articleDoc.exists()) {
      const article = { id: articleDoc.id, ...articleDoc.data() } as Article
      
      // Carregar a imagem de capa se for uma referência do Firestore
      if (article.coverImage && typeof article.coverImage === 'string' && article.coverImage.startsWith('firestore:')) {
        const coverImage = await loadCoverImage(article.coverImage)
        if (coverImage) {
          article.coverImage = coverImage
        }
      }
      
      return article
    }

    return null
  } catch (error) {
    console.error(`Erro ao buscar artigo com ID ${id}:`, error)
    throw error
  }
}

// Incrementar visualizações do artigo
export async function incrementArticleViews(id: string): Promise<void> {
  try {
    const articleRef = doc(firestore, "articles", id)
    await updateDoc(articleRef, {
      views: increment(1),
    })
  } catch (error) {
    console.error(`Erro ao incrementar visualizações do artigo ${id}:`, error)
    throw error
  }
}

// Modificar a função createArticle para lidar com imagens grandes
export async function createArticle(userId: string, articleData: ArticleFormData): Promise<Article> {
  try {
    // Buscar dados do autor
    const userData = await getUserData(userId)
    if (!userData) {
      throw new Error("Usuário não encontrado")
    }

    // Gerar ID amigável e slug
    const friendlyId = generateFriendlyId()
    const slug = await generateUniqueSlug(articleData.title)

    const now = new Date().toISOString()

    // Criar objeto base do artigo
    const newArticle: any = {
      title: articleData.title,
      subtitle: articleData.subtitle,
      content: articleData.content,
      authorId: userId,
      authorName: userData.name || "Autor desconhecido",
      type: articleData.type,
      tags: articleData.tags,
      createdAt: now,
      updatedAt: now,
      slug,
      published: true,
      views: 0,
      readTime: calculateReadTime(articleData.content),
    }

    // Adicionar campos opcionais apenas se não forem undefined
    if (userData.profileImage) {
      newArticle.authorImage = userData.profileImage
    }

    if (articleData.imageUrl) {
      newArticle.imageUrl = articleData.imageUrl
    }

    // Tratar a imagem de capa separadamente se existir
    if (articleData.coverImage) {
      // Gerar um ID único para a imagem
      const imageId = `cover_${friendlyId}_${Date.now()}`
      
      // Salvar a imagem em um documento separado na coleção "images"
      await setDoc(doc(firestore, "images", imageId), {
        data: articleData.coverImage,
        createdAt: now,
        articleId: friendlyId,
        authorId: userId
      })
      
      // Armazenar apenas a referência no documento do artigo
      newArticle.coverImage = `firestore:${imageId}`
    }

    // Salvar no Firestore com o ID amigável
    await setDoc(doc(firestore, "articles", friendlyId), newArticle)

    return { id: friendlyId, ...newArticle }
  } catch (error) {
    console.error("Erro ao criar artigo:", error)
    throw error
  }
}

// Adicionar função para calcular tempo de leitura
function calculateReadTime(content: string): number {
  // Remover tags HTML
  const text = content.replace(/<[^>]*>/g, "")

  // Contar palavras (média de 200 palavras por minuto)
  const words = text.split(/\s+/).length
  const minutes = Math.ceil(words / 200)

  // Retornar pelo menos 1 minuto
  return Math.max(1, minutes)
}

// Modificar a função updateArticle para lidar com imagens grandes
export async function updateArticle(id: string, articleData: Partial<ArticleFormData>): Promise<void> {
  try {
    const articleRef = doc(firestore, "articles", id)
    
    // Obter o artigo atual para verificar se já existe uma imagem
    const currentArticle = await getDoc(articleRef)
    if (!currentArticle.exists()) {
      throw new Error("Artigo não encontrado")
    }
    
    // Criar objeto de atualização
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    }

    // Adicionar apenas campos que não são undefined
    if (articleData.title !== undefined) {
      updateData.title = articleData.title
      updateData.slug = await generateUniqueSlug(articleData.title)
    }

    if (articleData.subtitle !== undefined) {
      updateData.subtitle = articleData.subtitle
    }

    if (articleData.content !== undefined) {
      updateData.content = articleData.content
      updateData.readTime = calculateReadTime(articleData.content)
    }

    if (articleData.type !== undefined) {
      updateData.type = articleData.type
    }

    if (articleData.tags !== undefined) {
      updateData.tags = articleData.tags
    }

    if (articleData.imageUrl !== undefined) {
      updateData.imageUrl = articleData.imageUrl
    }

    // Tratar a imagem de capa separadamente
    if (articleData.coverImage !== undefined) {
      // Se a imagem foi removida (null)
      if (articleData.coverImage === null) {
        updateData.coverImage = null
        
        // Se havia uma imagem anterior, podemos excluí-la
        const currentCoverImage = currentArticle.data()?.coverImage
        if (currentCoverImage && currentCoverImage.startsWith('firestore:')) {
          const imageId = currentCoverImage.replace('firestore:', '')
          try {
            await deleteDoc(doc(firestore, "images", imageId))
          } catch (e) {
            console.error("Erro ao excluir imagem antiga:", e)
          }
        }
      } 
      // Se uma nova imagem foi fornecida
      else if (articleData.coverImage) {
        // Gerar um ID único para a nova imagem
        const imageId = `cover_${id}_${Date.now()}`
        
        // Salvar a nova imagem
        await setDoc(doc(firestore, "images", imageId), {
          data: articleData.coverImage,
          createdAt: new Date().toISOString(),
          articleId: id,
          authorId: currentArticle.data()?.authorId
        })
        
        // Atualizar a referência
        updateData.coverImage = `firestore:${imageId}`
        
        // Excluir a imagem antiga se existir
        const currentCoverImage = currentArticle.data()?.coverImage
        if (currentCoverImage && currentCoverImage.startsWith('firestore:') && 
            currentCoverImage !== updateData.coverImage) {
          const oldImageId = currentCoverImage.replace('firestore:', '')
          try {
            await deleteDoc(doc(firestore, "images", oldImageId))
          } catch (e) {
            console.error("Erro ao excluir imagem antiga:", e)
          }
        }
      }
    }

    await updateDoc(articleRef, updateData)
  } catch (error) {
    console.error(`Erro ao atualizar artigo ${id}:`, error)
    throw error
  }
}

// Excluir um artigo
export async function deleteArticle(id: string): Promise<void> {
  try {
    const articleRef = doc(firestore, "articles", id)
    await deleteDoc(articleRef)
  } catch (error) {
    console.error(`Erro ao excluir artigo ${id}:`, error)
    throw error
  }
}

// Buscar artigos por termo de pesquisa (título ou conteúdo)
export async function searchArticles(searchTerm: string, limit = 20): Promise<Article[]> {
  try {
    // Firestore não suporta pesquisa de texto completo nativamente
    // Esta é uma implementação básica que busca todos os artigos e filtra no cliente
    const articlesRef = collection(firestore, "articles")
    const q = query(
      articlesRef,
      where("published", "==", true),
      orderBy("createdAt", "desc"),
      limit(100), // Buscar mais artigos para filtrar
    )

    const querySnapshot = await getDocs(q)
    const articles: Article[] = []

    querySnapshot.forEach((doc) => {
      const article = { id: doc.id, ...doc.data() } as Article

      // Filtrar por título, subtítulo ou tags
      const searchTermLower = searchTerm.toLowerCase()
      if (
        article.title.toLowerCase().includes(searchTermLower) ||
        article.subtitle.toLowerCase().includes(searchTermLower) ||
        article.tags.some((tag) => tag.toLowerCase().includes(searchTermLower))
      ) {
        articles.push(article)
      }
    })

    return articles.slice(0, limit)
  } catch (error) {
    console.error(`Erro ao pesquisar artigos com termo "${searchTerm}":`, error)
    throw error
  }
}

// Adicionar função para carregar imagem de capa
export async function loadCoverImage(coverImageRef: string): Promise<string | null> {
  if (!coverImageRef || !coverImageRef.startsWith('firestore:')) {
    return coverImageRef; // Retorna a própria referência se não for do Firestore
  }
  
  try {
    const imageId = coverImageRef.replace('firestore:', '')
    const imageDoc = await getDoc(doc(firestore, "images", imageId))
    
    if (imageDoc.exists()) {
      return imageDoc.data().data
    }
    return null
  } catch (error) {
    console.error("Erro ao carregar imagem de capa:", error)
    return null
  }
}
