"use client"
import { useState, useEffect } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { User, Church, UserPlus, LogIn, Camera, BookOpen, LogOut } from "lucide-react"
import Link from "next/link"
import styles from "./page.module.css"
import { VersionBadge } from "@/components/version-badge"
import { firestore } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import Image from "next/image"
import { getArticlesByAuthor } from "@/services/article-service"
import type { Article, ArticleType } from "@/types/article"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { formatDate } from "@/lib/utils"

export default function PerfilPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userArticles, setUserArticles] = useState<Article[]>([])
  const [loadingArticles, setLoadingArticles] = useState(false)

  useEffect(() => {
    const fetchProfileImage = async () => {
      if (!user) return

      try {
        setIsLoading(true)

        // Verificar se o usuário tem uma imagem de perfil
        if (user.profileImage && typeof user.profileImage === "string" && user.profileImage.startsWith("firestore:")) {
          const imageId = typeof user.profileImage === "string" ? user.profileImage.replace("firestore:", "") : ""
          const imageDoc = await getDoc(doc(firestore, "profileImages", imageId))

          if (imageDoc.exists()) {
            setProfileImage(imageDoc.data().data)
          }
        }
      } catch (error) {
        console.error("Erro ao carregar imagem de perfil:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfileImage()
  }, [user])

  // Buscar artigos do usuário se ele for escritor
  useEffect(() => {
    const fetchUserArticles = async () => {
      if (!user) return

      // Verificar se o usuário é escritor
      const isWriter =
        user.contributions && Array.isArray(user.contributions) && user.contributions.includes("escritor")

      if (isWriter) {
        try {
          setLoadingArticles(true)
          const articles = await getArticlesByAuthor(user.uid)
          setUserArticles(articles)
        } catch (error) {
          console.error("Erro ao buscar artigos do usuário:", error)
        } finally {
          setLoadingArticles(false)
        }
      }
    }

    fetchUserArticles()
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    toast.success("Logout realizado com sucesso", {
      description: "Você foi desconectado da sua conta.",
    })
  }

  if (loading || isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Carregando perfil...</p>
      </div>
    )
  }

  // Se o usuário não estiver autenticado, mostrar opções para criar conta ou fazer login
  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.header}>
            <div className={styles.avatarContainer}>
              <div className={styles.avatar}>
                <User className={styles.avatarIcon} />
              </div>
              <h1 className={styles.userName}>Visitante</h1>
              <p className={styles.userEmail}>Você não está conectado</p>
            </div>
          </div>

          <div className={styles.authSection}>
            <h2 className={styles.sectionTitle}>Acesse sua conta</h2>
            <p className={styles.authDescription}>
              Crie uma conta ou faça login para acessar todos os recursos do Cate
            </p>

            <div className={styles.authButtons}>
              <Link href="/auth/o/register">
                <Button className={styles.authButton}>
                  <UserPlus className={styles.buttonIcon} />
                  Criar conta
                </Button>
              </Link>

              <Link href="/auth/o/login">
                <Button variant="outline" className={styles.authButton}>
                  <LogIn className={styles.buttonIcon} />
                  Entrar
                </Button>
              </Link>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Minha Paróquia</h2>
            <div className={styles.parishCard}>
              <Church className={styles.parishIcon} />
              <div className={styles.parishInfo}>
                <h3 className={styles.parishName}>
                  {localStorage.getItem("selectedParishName") || "Nenhuma paróquia selecionada"}
                </h3>
                <Button
                  variant="link"
                  className={styles.changeParishButton}
                  onClick={() => router.push("/selecionar-paroquia")}
                >
                  Alterar paróquia
                </Button>
              </div>
            </div>
          </div>

          <div className={styles.versionContainer}>
            <VersionBadge />
          </div>
        </div>
        <BottomNav />
      </div>
    )
  }

  // Verificar se o usuário é escritor
  const isWriter = Array.isArray(user.contributions) && user.contributions.includes("escritor")

  // Se o usuário estiver autenticado, mostrar o perfil normal
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.avatarContainer}>
            <button className={styles.avatarButton} onClick={() => profileImage && setIsImageModalOpen(true)}>
              {profileImage ? (
                <Image
                  src={profileImage || "/placeholder.svg"}
                  alt="Foto de perfil"
                  className={styles.profileImage}
                  width={100}
                  height={100}
                />
              ) : (
                <div className={styles.avatar}>
                  <User className={styles.avatarIcon} />
                </div>
              )}
              {profileImage && (
                <div className={styles.avatarOverlay}>
                  <Camera className={styles.cameraIcon} />
                </div>
              )}
            </button>
            <div className={styles.userNameContainer}>
              <h1 className={styles.userName}>{user.displayName}</h1>
              {isWriter && (
                <div className={styles.writerBadge} title="Escritor">
                  ✍️
                </div>
              )}
            </div>
            <p className={styles.userEmail}>{user.email}</p>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Minha Paróquia</h2>
          <div className={styles.parishCard}>
            <Church className={styles.parishIcon} />
            <div className={styles.parishInfo}>
              <h3 className={styles.parishName}>
                {localStorage.getItem("selectedParishName") || "Nenhuma paróquia selecionada"}
              </h3>
              <Button
                variant="link"
                className={styles.changeParishButton}
                onClick={() => router.push("/selecionar-paroquia")}
              >
                Alterar paróquia
              </Button>
            </div>
          </div>
        </div>

        {isWriter && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Meus Conteúdos</h2>
            {loadingArticles ? (
              <p>Carregando seus conteúdos...</p>
            ) : userArticles.length > 0 ? (
              <div className={styles.articlesContainer}>
                {userArticles.slice(0, 3).map((article) => (
                  <Link href={`/leia/${article.id}`} key={article.id} className={styles.articleItem}>
                    <h3 className={styles.articleTitle}>{article.title}</h3>
                    <div className={styles.articleMeta}>
                      <span className={styles.articleType}>
                        {article.type === ("article" as ArticleType) && "Artigo"}
                        {article.type === ("news" as ArticleType) && "Notícia"}
                        {article.type === ("reflection" as ArticleType) && "Reflexão"}
                        {article.type === ("testimony" as ArticleType) && "Depoimento"}
                      </span>
                      <span className={styles.articleDate}>{formatDate(article.createdAt)}</span>
                    </div>
                  </Link>
                ))}
                {userArticles.length > 3 && (
                  <Link href="/leia/escreva" className={styles.viewMoreLink}>
                    Ver todos ({userArticles.length})
                  </Link>
                )}
                <Link href="/leia/escreva" className={styles.newArticleLink}>
                  <Button variant="outline" className={styles.newArticleButton}>
                    <BookOpen className={styles.buttonIcon} />
                    Escrever novo conteúdo
                  </Button>
                </Link>
              </div>
            ) : (
              <div className={styles.emptyArticles}>
                <p>Você ainda não publicou nenhum conteúdo.</p>
                <Link href="/leia/escreva">
                  <Button variant="outline" className={styles.newArticleButton}>
                    <BookOpen className={styles.buttonIcon} />
                    Escrever novo conteúdo
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Configurações</h2>
          <div className={styles.menuList}>
            <Button variant="ghost" className={styles.menuItem} onClick={() => router.push("/perfil/editar")}>
              Editar perfil
            </Button>
            <Button variant="ghost" className={styles.menuItem} onClick={() => router.push("/perfil/notificacoes")}>
              Preferências de notificação
            </Button>
            <Button variant="ghost" className={styles.menuItem} onClick={() => router.push("/perfil/senha")}>
              Alterar senha
            </Button>
          </div>

          <Button variant="destructive" className={styles.signOutButton} onClick={handleSignOut}>
            <LogOut className={styles.signOutIcon} />
            Sair da conta
          </Button>
        </div>

        <div className={styles.versionContainer}>
          <VersionBadge />
        </div>
      </div>

      {/* Modal para visualizar a imagem de perfil em tamanho maior */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className={styles.imageModalContent}>
          <div className={styles.imageModalContainer}>
            {profileImage && (
              <Image
                src={profileImage || "/placeholder.svg"}
                alt="Foto de perfil"
                className={styles.fullProfileImage}
                width={500}
                height={500}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  )
}
