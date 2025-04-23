"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import {
  ArrowLeft,
  ImageIcon,
  X,
  Loader2,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react"
import { createArticle, getArticleById, updateArticle } from "@/services/article-service"
import type { ArticleFormData, ArticleType } from "@/types/article"
import { firestore } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import Image from "next/image"
import styles from "./escreva.module.css"

// Editor personalizado
const CustomEditor = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const [localContent, setLocalContent] = useState(value)

  // Sincronizar o conteúdo do editor com o valor externo
  useEffect(() => {
    if (editorRef.current && value !== localContent) {
      editorRef.current.innerHTML = value
      setLocalContent(value)
    }
  }, [value, localContent])

  // Atualizar o valor quando o conteúdo do editor mudar
  const handleInput = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML
      setLocalContent(newContent)
      onChange(newContent)
    }
  }

  // Funções de formatação
  const formatDoc = (command: string, value = "") => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      handleInput()
    }
  }

  // Inserir link
  const insertLink = () => {
    const url = prompt("Insira a URL do link:")
    if (url) {
      formatDoc("createLink", url)
    }
  }

  return (
    <div className={styles.customEditor}>
      <div className={styles.toolbar}>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => formatDoc("bold")}
          className={styles.toolbarButton}
        >
          <Bold size={18} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => formatDoc("italic")}
          className={styles.toolbarButton}
        >
          <Italic size={18} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => formatDoc("underline")}
          className={styles.toolbarButton}
        >
          <Underline size={18} />
        </Button>

        <div className={styles.divider}></div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => formatDoc("formatBlock", "<h1>")}
          className={styles.toolbarButton}
        >
          <Heading1 size={18} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => formatDoc("formatBlock", "<h2>")}
          className={styles.toolbarButton}
        >
          <Heading2 size={18} />
        </Button>

        <div className={styles.divider}></div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => formatDoc("insertUnorderedList")}
          className={styles.toolbarButton}
        >
          <List size={18} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => formatDoc("insertOrderedList")}
          className={styles.toolbarButton}
        >
          <ListOrdered size={18} />
        </Button>

        <div className={styles.divider}></div>

        <Button type="button" variant="ghost" size="icon" onClick={insertLink} className={styles.toolbarButton}>
          <LinkIcon size={18} />
        </Button>

        <div className={styles.divider}></div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => formatDoc("justifyLeft")}
          className={styles.toolbarButton}
        >
          <AlignLeft size={18} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => formatDoc("justifyCenter")}
          className={styles.toolbarButton}
        >
          <AlignCenter size={18} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => formatDoc("justifyRight")}
          className={styles.toolbarButton}
        >
          <AlignRight size={18} />
        </Button>
      </div>

      <div
        ref={editorRef}
        className={styles.editorContent}
        contentEditable
        onInput={handleInput}
        suppressContentEditableWarning
      />
    </div>
  )
}

export default function EscrevaPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [articleId, setArticleId] = useState<string | null>(null)
  const [formData, setFormData] = useState<ArticleFormData>({
    title: "",
    subtitle: "",
    content: "",
    type: "artigo",
    coverImage: null,
    tags: [],
  })
  const [tagInput, setTagInput] = useState("")
  const tagInputRef = useRef<HTMLInputElement>(null)

  // Verificar se o usuário é escritor
  const isWriter = user?.contributions && Array.isArray(user.contributions) && user.contributions.includes("escritor")

  // Buscar artigo para edição
  const fetchArticleForEdit = useCallback(
    async (id: string) => {
      try {
        setIsLoading(true)
        const article = await getArticleById(id)

        if (article) {
          // Verificar se o usuário atual é o autor
          if (user && article.authorId !== user.uid) {
            toast.error("Você não tem permissão para editar este artigo")
            router.push("/leia")
            return
          }

          // Carregar imagem de capa do Firestore se necessário
          let coverImage = article.coverImage
          if (coverImage && coverImage.startsWith("firestore:")) {
            const imageId = coverImage.replace("firestore:", "")
            const imageDoc = await getDoc(doc(firestore, "images", imageId))

            if (imageDoc.exists()) {
              coverImage = imageDoc.data().data
            }
          }

          setFormData({
            title: article.title,
            subtitle: article.subtitle,
            content: article.content,
            type: article.type,
            coverImage: coverImage || null,
            tags: article.tags || [],
          })
        } else {
          toast.error("Artigo não encontrado")
          router.push("/leia")
        }
      } catch (error) {
        console.error("Erro ao buscar artigo para edição:", error)
        toast.error("Erro ao carregar artigo para edição")
      } finally {
        setIsLoading(false)
      }
    },
    [user, router],
  )

  // Verificar se estamos em modo de edição
  useEffect(() => {
    const editId = searchParams?.get("edit")
    if (editId) {
      setEditMode(true)
      setArticleId(editId)
      fetchArticleForEdit(editId)
    }
  }, [searchParams, fetchArticleForEdit])

  // Redirecionar se não for escritor
  useEffect(() => {
    if (!authLoading && user && !isWriter) {
      toast.error("Você precisa ser um escritor para acessar esta página")
      router.push("/contribuicoes")
    }

    if (!authLoading && !user) {
      toast.error("Você precisa estar logado para acessar esta página")
      router.push("/auth/o/login")
    }
  }, [user, isWriter, authLoading, router])

  // Manipuladores de formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditorChange = (content: string) => {
    setFormData((prev) => ({ ...prev, content }))
  }

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, type: value as ArticleType }))
  }

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Verificar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      setFormData((prev) => ({ ...prev, coverImage: base64String }))
    }
    reader.onerror = () => {
      toast.error("Erro ao processar a imagem")
    }
    reader.readAsDataURL(file)
  }

  const removeCoverImage = () => {
    setFormData((prev) => ({ ...prev, coverImage: null }))
  }

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault()

      if (formData.tags.includes(tagInput.trim())) {
        toast.error("Esta tag já foi adicionada")
        return
      }

      if (formData.tags.length >= 5) {
        toast.error("Máximo de 5 tags permitidas")
        return
      }

      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  // Validação do formulário
  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error("O título é obrigatório")
      return false
    }

    if (!formData.subtitle.trim()) {
      toast.error("O subtítulo é obrigatório")
      return false
    }

    if (!formData.content.trim() || formData.content === "<p><br></p>" || formData.content === "<br>") {
      toast.error("O conteúdo é obrigatório")
      return false
    }

    if (formData.tags.length === 0) {
      toast.error("Adicione pelo menos uma tag")
      return false
    }

    return true
  }

  // Publicar artigo
  const handlePublish = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para publicar")
      return
    }

    if (!validateForm()) {
      return
    }

    try {
      setIsPublishing(true)

      if (editMode && articleId) {
        // Atualizar artigo existente
        await updateArticle(articleId, formData)
        toast.success("Artigo atualizado com sucesso!")
      } else {
        // Criar novo artigo
        await createArticle(user.uid, {
          ...formData,
          authorName: user.displayName || "Autor",
          authorImage: typeof user.profileImage === "string" ? user.profileImage : undefined,
        })
        toast.success("Artigo publicado com sucesso!")
      }

      router.push("/leia")
    } catch (error) {
      console.error("Erro ao publicar artigo:", error)
      toast.error("Erro ao publicar artigo. Tente novamente.")
    } finally {
      setIsPublishing(false)
    }
  }

  // Manipular saída
  const handleExit = () => {
    if (
      formData.title.trim() ||
      formData.subtitle.trim() ||
      (formData.content && formData.content !== "<p><br></p>" && formData.content !== "<br>") ||
      formData.coverImage ||
      formData.tags.length > 0
    ) {
      setShowExitDialog(true)
    } else {
      router.push("/leia")
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.loadingSpinner} />
        <p>Carregando...</p>
      </div>
    )
  }

  if (!user || !isWriter) {
    return null // Redirecionamento já está sendo tratado no useEffect
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button variant="ghost" className={styles.backButton} onClick={handleExit}>
          <ArrowLeft className={styles.backIcon} />
          <span>Voltar</span>
        </Button>

        <div className={styles.actions}>
          <Button
            variant="outline"
            className={styles.saveButton}
            disabled={isSaving || isPublishing}
            onClick={() => toast.info("Recurso de rascunho em desenvolvimento")}
          >
            {isSaving ? (
              <>
                <Loader2 className={`${styles.actionIcon} ${styles.spinner}`} />
                <span>Salvando...</span>
              </>
            ) : (
              <span>Salvar rascunho</span>
            )}
          </Button>

          <Button className={styles.publishButton} disabled={isSaving || isPublishing} onClick={handlePublish}>
            {isPublishing ? (
              <>
                <Loader2 className={`${styles.actionIcon} ${styles.spinner}`} />
                <span>Publicando...</span>
              </>
            ) : (
              <span>{editMode ? "Atualizar" : "Publicar"}</span>
            )}
          </Button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.formGroup}>
          <Label htmlFor="type" className={styles.label}>
            Tipo de conteúdo
          </Label>
          <Select value={formData.type} onValueChange={handleTypeChange}>
            <SelectTrigger className={styles.select}>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="artigo">Artigo</SelectItem>
              <SelectItem value="noticia">Notícia</SelectItem>
              <SelectItem value="reflexao">Reflexão</SelectItem>
              <SelectItem value="depoimento">Depoimento</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className={styles.formGroup}>
          <Label htmlFor="title" className={styles.label}>
            Título
          </Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Digite um título atrativo"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <Label htmlFor="subtitle" className={styles.label}>
            Subtítulo
          </Label>
          <Textarea
            id="subtitle"
            name="subtitle"
            value={formData.subtitle}
            onChange={handleChange}
            placeholder="Escreva um breve resumo"
            className={styles.textarea}
            rows={2}
          />
        </div>

        <div className={styles.formGroup}>
          <Label htmlFor="coverImage" className={styles.label}>
            Imagem de capa (opcional)
          </Label>
          {formData.coverImage ? (
            <div className={styles.coverPreviewContainer}>
              <Image
                src={formData.coverImage || "/placeholder.svg"}
                alt="Imagem de capa"
                width={800}
                height={400}
                className={styles.coverPreview}
              />
              <Button variant="destructive" size="icon" className={styles.removeCoverButton} onClick={removeCoverImage}>
                <X className={styles.removeCoverIcon} />
              </Button>
            </div>
          ) : (
            <div className={styles.coverUploadContainer}>
              <Label htmlFor="cover-upload" className={styles.coverUploadLabel}>
                <ImageIcon className={styles.coverUploadIcon} />
                <span>Clique para adicionar uma imagem de capa</span>
                <p className={styles.coverUploadHelp}>Recomendado: 1200 x 600px (máx. 5MB)</p>
              </Label>
              <Input
                id="cover-upload"
                type="file"
                accept="image/jpeg, image/png, image/webp"
                onChange={handleCoverImageUpload}
                className={styles.coverUploadInput}
              />
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <Label htmlFor="content" className={styles.label}>
            Conteúdo
          </Label>
          <CustomEditor value={formData.content} onChange={handleEditorChange} />
        </div>

        <div className={styles.formGroup}>
          <Label htmlFor="tags" className={styles.label}>
            Tags (máx. 5) - Pressione Enter para adicionar
          </Label>
          <Input
            id="tags"
            ref={tagInputRef}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Adicione tags relevantes"
            className={styles.input}
            disabled={formData.tags.length >= 5}
          />

          <div className={styles.tagsContainer}>
            {formData.tags.map((tag) => (
              <Badge key={tag} className={styles.tag}>
                {tag}
                <X className={styles.removeTagIcon} onClick={() => removeTag(tag)} />
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deseja sair sem salvar?</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem alterações não salvas. Se sair agora, essas alterações serão perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push("/leia")}>Sair sem salvar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
