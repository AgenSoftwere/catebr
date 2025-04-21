"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { createArticle, updateArticle } from "@/services/article-service"
import { X, ImageIcon, Bold, Italic, List, ListOrdered, LinkIcon, Quote } from 'lucide-react'
import Image from "next/image"
import styles from "./article-editor.module.css"
import type { Article } from "@/types/article"

interface ArticleEditorProps {
  article?: Article
}

export function ArticleEditor({ article }: ArticleEditorProps) {
  const { user } = useAuth()
  const router = useRouter()
  const editorRef = useRef<HTMLDivElement>(null)

  const [title, setTitle] = useState(article?.title || "")
  const [subtitle, setSubtitle] = useState(article?.subtitle || "")
  const [type, setType] = useState<string>(article?.type || "article")
  const [coverImage, setCoverImage] = useState<string | null>(article?.coverImage || null)
  const [content, setContent] = useState(article?.content || "")
  const [tags, setTags] = useState<string[]>(article?.tags || [])
  const [newTag, setNewTag] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishingStep, setPublishingStep] = useState("")
  const [publishingProgress, setPublishingProgress] = useState(0)

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = content
    }
  }, [content])

  const handleEditorChange = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML)
    }
  }

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setCoverImage(base64String)
      setIsUploading(false)
    }
    reader.onerror = () => {
      toast.error("Erro ao processar a imagem")
      setIsUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const removeCoverImage = () => {
    setCoverImage(null)
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  const applyFormatting = (command: string, value = "") => {
    document.execCommand(command, false, value)
    handleEditorChange()
    if (editorRef.current) {
      editorRef.current.focus()
    }
  }

  const insertImage = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/jpeg, image/png, image/gif"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      // Verificar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("A imagem deve ter no máximo 5MB")
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        document.execCommand(
          "insertHTML",
          false,
          `<img src="${base64String}" alt="Imagem inserida" style="max-width: 100%; height: auto; margin: 1rem 0;" />`,
        )
        handleEditorChange()
      }
      reader.onerror = () => {
        toast.error("Erro ao processar a imagem")
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  const insertLink = () => {
    const url = prompt("Digite a URL do link:")
    if (url) {
      const text = document.getSelection()?.toString() || url
      document.execCommand(
        "insertHTML",
        false,
        `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`,
      )
      handleEditorChange()
    }
  }

  const handlePublish = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para publicar")
      return
    }

    if (!title.trim()) {
      toast.error("O título é obrigatório")
      return
    }

    if (!content.trim()) {
      toast.error("O conteúdo é obrigatório")
      return
    }

    if (!coverImage) {
      toast.error("A imagem de capa é obrigatória")
      return
    }

    try {
      setIsPublishing(true)
      setPublishingStep("Preparando publicação...")
      setPublishingProgress(10)

      const articleData = {
        title,
        subtitle,
        type,
        content,
        tags,
        coverImage,
      }

      setPublishingStep("Salvando conteúdo...")
      setPublishingProgress(30)

      // Pequeno delay para mostrar o progresso
      await new Promise((resolve) => setTimeout(resolve, 500))

      setPublishingStep("Processando imagens...")
      setPublishingProgress(60)

      // Pequeno delay para mostrar o progresso
      await new Promise((resolve) => setTimeout(resolve, 500))

      setPublishingStep("Finalizando publicação...")
      setPublishingProgress(90)

      if (article) {
        await updateArticle(article.id, articleData)
      } else {
        await createArticle(
          articleData, 
          user.uid, 
          user.displayName || "Autor", 
          typeof user.profileImage === "string" ? user.profileImage : undefined
        )
      }

      setPublishingProgress(100)
      toast.success(article ? "Artigo atualizado com sucesso!" : "Artigo publicado com sucesso!")

      // Redirecionar para a página de leitura
      router.push("/leia")
    } catch (error) {
      console.error("Erro ao publicar artigo:", error)
      toast.error("Ocorreu um erro ao publicar o artigo")
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <div className={styles.formGroup}>
          <Label htmlFor="title" className={styles.label}>
            Título
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Digite o título do seu artigo"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <Label htmlFor="subtitle" className={styles.label}>
            Subtítulo (opcional)
          </Label>
          <Input
            id="subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Digite um subtítulo para seu artigo"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <Label htmlFor="type" className={styles.label}>
            Tipo de Conteúdo
          </Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de conteúdo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="article">Artigo</SelectItem>
              <SelectItem value="news">Notícia</SelectItem>
              <SelectItem value="reflection">Reflexão</SelectItem>
              <SelectItem value="testimony">Depoimento</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className={styles.formGroup}>
          <Label htmlFor="coverImage" className={styles.label}>
            Imagem de Capa
          </Label>
          <div className={styles.imageUploadContainer}>
            {coverImage ? (
              <div className={styles.imagePreviewContainer}>
                <div className={styles.imagePreviewWrapper}>
                  <Image
                    src={coverImage || "/placeholder.svg"}
                    alt="Imagem de capa"
                    className={styles.imagePreview}
                    width={800}
                    height={450}
                    layout="responsive"
                  />
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className={styles.removeImageButton}
                  onClick={removeCoverImage}
                  type="button"
                >
                  <X className={styles.removeImageIcon} />
                </Button>
              </div>
            ) : (
              <div className={styles.imageUploadButton}>
                <Label htmlFor="image-upload" className={styles.imageUploadLabel}>
                  <ImageIcon className={styles.imageUploadIcon} />
                  <span>{isUploading ? "Processando..." : "Adicionar imagem de capa"}</span>
                </Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/jpeg, image/png, image/gif"
                  onChange={handleCoverImageUpload}
                  disabled={isUploading}
                  className={styles.imageInput}
                />
              </div>
            )}
          </div>
          <p className={styles.imageHelp}>Tamanho máximo: 5MB. Formatos: JPG, PNG, GIF</p>
        </div>

        <div className={styles.formGroup}>
          <Label htmlFor="content" className={styles.label}>
            Conteúdo
          </Label>
          <div className={styles.editorContainer}>
            <div className={styles.toolbar}>
              <button
                type="button"
                className={styles.toolbarButton}
                onClick={() => applyFormatting("bold")}
                title="Negrito"
              >
                <Bold size={16} />
              </button>
              <button
                type="button"
                className={styles.toolbarButton}
                onClick={() => applyFormatting("italic")}
                title="Itálico"
              >
                <Italic size={16} />
              </button>
              <button
                type="button"
                className={styles.toolbarButton}
                onClick={() => applyFormatting("insertUnorderedList")}
                title="Lista com marcadores"
              >
                <List size={16} />
              </button>
              <button
                type="button"
                className={styles.toolbarButton}
                onClick={() => applyFormatting("insertOrderedList")}
                title="Lista numerada"
              >
                <ListOrdered size={16} />
              </button>
              <button type="button" className={styles.toolbarButton} onClick={insertLink} title="Inserir link">
                <LinkIcon size={16} />
              </button>
              <button
                type="button"
                className={styles.toolbarButton}
                onClick={() => applyFormatting("formatBlock", "<blockquote>")}
                title="Citação"
              >
                <Quote size={16} />
              </button>
              <button type="button" className={styles.toolbarButton} onClick={insertImage} title="Inserir imagem">
                <ImageIcon size={16} />
              </button>
            </div>
            <div
              ref={editorRef}
              className={styles.editor}
              contentEditable
              onInput={handleEditorChange}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <Label htmlFor="tags" className={styles.label}>
            Tags (opcional)
          </Label>
          <div className={styles.tagInput}>
            <Input
              id="tags"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Adicione tags separadas por Enter"
              className={styles.input}
            />
            <Button type="button" onClick={addTag} className={styles.addTagButton} disabled={!newTag.trim()}>
              Adicionar
            </Button>
          </div>
          <div className={styles.tagsContainer}>
            {tags.map((tag) => (
              <div key={tag} className={styles.tag}>
                <span>{tag}</span>
                <button type="button" onClick={() => removeTag(tag)} className={styles.removeTagButton}>
                  <X className={styles.removeTagIcon} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.buttonContainer}>
          <Button variant="outline" onClick={() => router.back()} disabled={isPublishing}>
            Cancelar
          </Button>
          <Button onClick={handlePublish} className={styles.publishButton} disabled={isPublishing}>
            {article ? "Atualizar" : "Publicar"}
          </Button>
        </div>
      </div>

      {isPublishing && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner} />
          <div className={styles.loadingText}>{publishingStep}</div>
          <div className={styles.loadingProgress}>
            <div className={styles.loadingProgressBar} style={{ width: `${publishingProgress}%` }} />
          </div>
        </div>
      )}
    </div>
  )
}
