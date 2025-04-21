"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Edit, ChevronRight, Check, AlertTriangle } from 'lucide-react'
import { useRouter } from "next/navigation"
import { database, firestore } from "@/lib/firebase"
import { ref, get, set } from "firebase/database"
import { doc, setDoc } from "firebase/firestore"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import styles from "./page.module.css"
import Image from "next/image"

export default function ContribuicoesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isWriter, setIsWriter] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [phone, setPhone] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      // Verificar se o usuário já é escritor
      const isUserWriter = Array.isArray(user.contributions) && user.contributions.includes("escritor")
      setIsWriter(isUserWriter || false)

      // Carregar foto de perfil se existir
      if (user.profileImage) {
        setProfileImage(user.profileImage)
      }
    }
  }, [user])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Verificar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB")
      return
    }

    setIsUploading(true)

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      setProfileImage(base64String)
      setIsUploading(false)
    }
    reader.onerror = () => {
      toast.error("Erro ao processar a imagem")
      setIsUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!user) return

    if (!profileImage) {
      toast.error("É necessário adicionar uma foto de perfil")
      return
    }

    if (!phone) {
      toast.error("É necessário informar um número de telefone")
      return
    }

    if (!termsAccepted) {
      toast.error("É necessário aceitar os termos")
      return
    }

    try {
      setIsSubmitting(true)

      // Salvar a imagem no Firestore
      const imageId = `profile_${user.uid}`
      await setDoc(doc(firestore, "profileImages", imageId), {
        data: profileImage,
        createdAt: new Date().toISOString(),
        userId: user.uid,
      })

      // Atualizar o perfil do usuário
      const userRef = ref(database, `users/${user.uid}`)
      const userSnapshot = await get(userRef)

      if (userSnapshot.exists()) {
        const userData = userSnapshot.val()

        await set(userRef, {
          ...userData,
          phone: phone,
          contributions: ["escritor"],
          profileImage: `firestore:${imageId}`,
          updatedAt: new Date().toISOString(),
        })
      }

      toast.success("Parabéns! Você agora é um escritor do Cate")
      setIsWriter(true)
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Erro ao se inscrever como escritor:", error)
      toast.error("Ocorreu um erro. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Carregando...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.authRequired}>
            <AlertTriangle className={styles.authIcon} />
            <h2 className={styles.authTitle}>Acesso Restrito</h2>
            <p className={styles.authText}>Você precisa estar conectado para acessar as contribuições.</p>
            <Button onClick={() => router.push("/auth/o/login")} className={styles.authButton}>
              Fazer Login
            </Button>
          </div>
        </div>
        <BottomNav />
      </div>
    )
  }

  // Verificar se o usuário é uma paróquia
  if (user.role === "parish") {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.authRequired}>
            <AlertTriangle className={styles.authIcon} />
            <h2 className={styles.authTitle}>Acesso Restrito</h2>
            <p className={styles.authText}>Esta funcionalidade está disponível apenas para fiéis.</p>
            <Button onClick={() => router.push("/paroquia/dashboard")} className={styles.authButton}>
              Voltar para o Dashboard
            </Button>
          </div>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Contribuições</h1>
        <p className={styles.subtitle}>Participe ativamente da comunidade Cate</p>

        <div className={styles.cardsContainer}>
          <div className={`${styles.card} ${styles.writerCard}`}>
            <div className={styles.cardContent}>
              <div className={styles.cardIcon}>
                <Edit />
              </div>
              <h2 className={styles.cardTitle}>Seja um Escritor</h2>
              <p className={styles.cardDescription}>
                Compartilhe seus conhecimentos, escreva artigos, notícias e conteúdos para a comunidade católica.
              </p>
              {isWriter ? (
                <div className={styles.alreadyWriter}>
                  <Check className={styles.checkIcon} />
                  <span>Você já é um escritor</span>
                </div>
              ) : (
                <Button onClick={() => setIsDialogOpen(true)} className={styles.cardButton}>
                  <span>Quero me inscrever</span>
                  <ChevronRight className={styles.buttonIcon} />
                </Button>
              )}
            </div>
          </div>

          {/* Outros cards de contribuição podem ser adicionados aqui no futuro */}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className={styles.dialogContent}>
            <DialogHeader>
              <DialogTitle>Torne-se um Escritor</DialogTitle>
              <DialogDescription>Preencha as informações abaixo para se tornar um escritor do Cate.</DialogDescription>
            </DialogHeader>

            <div className={styles.formGroup}>
              <Label htmlFor="profileImage">Foto de Perfil</Label>
              <div className={styles.profileImageContainer}>
                {profileImage ? (
                  <div className={styles.profileImagePreview}>
                    <Image
                      src={profileImage || "/placeholder.svg"}
                      alt="Foto de perfil"
                      className={styles.previewImage}
                      width={120}
                      height={120}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setProfileImage(null)}
                      className={styles.changeImageButton}
                    >
                      Alterar foto
                    </Button>
                  </div>
                ) : (
                  <div className={styles.profileImageUpload}>
                    <Label htmlFor="image-upload" className={styles.uploadLabel}>
                      {isUploading ? "Processando..." : "Adicionar foto de perfil"}
                    </Label>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/jpeg, image/png"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className={styles.imageInput}
                    />
                  </div>
                )}
              </div>
              <p className={styles.imageHelp}>Tamanho máximo: 5MB. Formatos: JPG, PNG</p>
            </div>

            <div className={styles.formGroup}>
              <Label htmlFor="phone">Número de Telefone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(00) 00000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.termsContainer}>
              <div className={styles.checkboxContainer}>
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => {
                    if (typeof checked === 'boolean') {
                      setTermsAccepted(checked);
                    }
                  }}
                />
                <Label htmlFor="terms" className={styles.termsLabel}>
                  Concordo em produzir conteúdo verdadeiro, respeitoso e de acordo com os valores cristãos.
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting || !termsAccepted || !profileImage || !phone}>
                {isSubmitting ? "Enviando..." : "Confirmar Inscrição"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <BottomNav />
    </div>
  )
}
