"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Filter, Bell, Calendar, AlertTriangle, Trash2, Edit, ImageIcon, X } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/use-auth"
import { database } from "@/lib/firebase"
import { ref, get, push, set, remove } from "firebase/database"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"
import Image from "next/image"
import styles from "./comunicados.module.css"
import type { Notification as ParishNotification } from "@/types/notification"

export default function ParishComunicadosPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<ParishNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("todos")
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<ParishNotification | null>(null)
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    type: "announcement" as "announcement" | "event" | "alert",
    imageUrl: null as string | null,
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const fetchNotifications = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const parishId = user.uid
      const notificationsRef = ref(database, `notifications/${parishId}`)
      const snapshot = await get(notificationsRef)

      if (snapshot.exists()) {
        const notificationsData = snapshot.val()
        const notificationsList: ParishNotification[] = Object.entries(notificationsData).map(([id, data]) => ({
          id,
          ...(data as Omit<ParishNotification, "id">),
        }))

        // Sort by timestamp (newest first)
        notificationsList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

        setNotifications(notificationsList)
      } else {
        setNotifications([])
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
      toast.error("Erro ao carregar comunicados")
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (limit to 1MB)
    if (file.size > 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 1MB")
      return
    }

    setIsUploading(true)

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      setImagePreview(base64String)
      setNewNotification({ ...newNotification, imageUrl: base64String })
      setIsUploading(false)
    }
    reader.onerror = () => {
      toast.error("Erro ao processar a imagem")
      setIsUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImagePreview(null)
    setNewNotification({ ...newNotification, imageUrl: null })
  }

  const handlePublish = async () => {
    if (!user) return

    try {
      if (!newNotification.title.trim() || !newNotification.message.trim()) {
        toast.error("Preencha todos os campos obrigatórios")
        return
      }

      const parishId = user.uid
      const notificationsRef = ref(database, `notifications/${parishId}`)

      // If editing an existing notification
      if (selectedNotification) {
        const notificationRef = ref(database, `notifications/${parishId}/${selectedNotification.id}`)
        await set(notificationRef, {
          title: newNotification.title,
          message: newNotification.message,
          type: newNotification.type,
          timestamp: selectedNotification.timestamp, // Keep original timestamp
          imageUrl: newNotification.imageUrl,
        })

        toast.success("Comunicado atualizado com sucesso")
      } else {
        // Create new notification
        const newNotificationRef = push(notificationsRef)
        await set(newNotificationRef, {
          title: newNotification.title,
          message: newNotification.message,
          type: newNotification.type,
          timestamp: new Date().toISOString(),
          imageUrl: newNotification.imageUrl,
        })

        toast.success("Comunicado publicado com sucesso")
      }

      // Reset form and close dialog
      resetForm()
      setIsPublishDialogOpen(false)

      // Refresh notifications list
      fetchNotifications()
    } catch (error) {
      console.error("Error publishing notification:", error)
      toast.error("Erro ao publicar comunicado")
    }
  }

  const handleDelete = async () => {
    if (!user || !selectedNotification) return

    try {
      const parishId = user.uid
      const notificationRef = ref(database, `notifications/${parishId}/${selectedNotification.id}`)
      await remove(notificationRef)

      toast.success("Comunicado excluído com sucesso")

      // Close dialog and refresh list
      setIsDeleteDialogOpen(false)
      setSelectedNotification(null)
      fetchNotifications()
    } catch (error) {
      console.error("Error deleting notification:", error)
      toast.error("Erro ao excluir comunicado")
    }
  }

  const handleEdit = (notification: ParishNotification) => {
    setSelectedNotification(notification)
    setNewNotification({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      imageUrl: notification.imageUrl || null,
    })
    setImagePreview(notification.imageUrl || null)
    setIsPublishDialogOpen(true)
  }

  const confirmDelete = (notification: ParishNotification) => {
    setSelectedNotification(notification)
    setIsDeleteDialogOpen(true)
  }

  const resetForm = () => {
    setNewNotification({
      title: "",
      message: "",
      type: "announcement",
      imageUrl: null,
    })
    setImagePreview(null)
    setSelectedNotification(null)
  }

  const filteredNotifications = notifications.filter((notification) => {
    // Filter by search term
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase())

    // Filter by type (tab)
    const matchesType =
      activeTab === "todos" ||
      (activeTab === "anuncios" && notification.type === "announcement") ||
      (activeTab === "eventos" && notification.type === "event") ||
      (activeTab === "alertas" && notification.type === "alert")

    return matchesSearch && matchesType
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "event":
        return <Calendar className={styles.typeIcon} />
      case "alert":
        return <AlertTriangle className={styles.typeIcon} />
      default:
        return <Bell className={styles.typeIcon} />
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "event":
        return (
          <Badge variant="outline" className={styles.eventBadge}>
            Evento
          </Badge>
        )
      case "alert":
        return (
          <Badge variant="outline" className={styles.alertBadge}>
            Alerta
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className={styles.announcementBadge}>
            Anúncio
          </Badge>
        )
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Comunicados</h1>
          <p className={styles.subtitle}>Gerencie os comunicados da sua paróquia</p>
        </div>

        <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm()
                setIsPublishDialogOpen(true)
              }}
            >
              <Plus className={styles.buttonIcon} />
              Novo Comunicado
            </Button>
          </DialogTrigger>
          <DialogContent className={styles.dialogContent}>
            <DialogHeader>
              <DialogTitle>{selectedNotification ? "Editar Comunicado" : "Novo Comunicado"}</DialogTitle>
              <DialogDescription>
                {selectedNotification
                  ? "Edite as informações do comunicado existente."
                  : "Preencha as informações para publicar um novo comunicado."}
              </DialogDescription>
            </DialogHeader>

            <div className={styles.formGroup}>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={newNotification.title}
                onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                placeholder="Título do comunicado"
              />
            </div>

            <div className={styles.formGroup}>
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={newNotification.type}
                onValueChange={(value) =>
                  setNewNotification({
                    ...newNotification,
                    type: value as "announcement" | "event" | "alert",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="announcement">Anúncio</SelectItem>
                  <SelectItem value="event">Evento</SelectItem>
                  <SelectItem value="alert">Alerta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className={styles.formGroup}>
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                value={newNotification.message}
                onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                placeholder="Conteúdo do comunicado"
                rows={5}
              />
            </div>

            <div className={styles.formGroup}>
              <Label htmlFor="image">Imagem (opcional)</Label>
              <div className={styles.imageUploadContainer}>
                {imagePreview ? (
                  <div className={styles.imagePreviewContainer}>
                    <div className={styles.imagePreviewWrapper}>
                      <Image 
                        src={imagePreview || "/placeholder.svg"} 
                        alt="Preview" 
                        className={styles.imagePreview} 
                        width={500}
                        height={300}
                        layout="responsive"
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className={styles.removeImageButton}
                      onClick={removeImage}
                      type="button"
                    >
                      <X className={styles.removeImageIcon} />
                    </Button>
                  </div>
                ) : (
                  <div className={styles.imageUploadButton}>
                    <Label htmlFor="image-upload" className={styles.imageUploadLabel}>
                      <ImageIcon className={styles.imageUploadIcon} />
                      <span>{isUploading ? "Processando..." : "Adicionar imagem"}</span>
                    </Label>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/jpeg, image/png, image/gif"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className={styles.imageInput}
                    />
                  </div>
                )}
              </div>
              <p className={styles.imageHelp}>Tamanho máximo: 1MB. Formatos: JPG, PNG, GIF</p>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  resetForm()
                  setIsPublishDialogOpen(false)
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handlePublish}>{selectedNotification ? "Salvar Alterações" : "Publicar"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} />
          <Input
            placeholder="Buscar comunicados..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <Button variant="outline" size="icon" className={styles.filterButton}>
          <Filter className={styles.filterIcon} />
        </Button>
      </div>

      <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab} className={styles.tabs}>
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="anuncios">Anúncios</TabsTrigger>
          <TabsTrigger value="eventos">Eventos</TabsTrigger>
          <TabsTrigger value="alertas">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className={styles.tabContent}>
          <Card>
            <CardHeader className={styles.cardHeader}>
              <CardTitle>Todos os Comunicados</CardTitle>
              <CardDescription>{filteredNotifications.length} comunicado(s) encontrado(s)</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className={styles.loadingState}>
                  <div className={styles.loadingSpinner}></div>
                  <p>Carregando comunicados...</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className={styles.emptyState}>
                  <Bell className={styles.emptyIcon} />
                  <h3 className={styles.emptyTitle}>Nenhum comunicado encontrado</h3>
                  <p className={styles.emptyText}>
                    {searchTerm
                      ? "Nenhum comunicado corresponde à sua busca."
                      : "Você ainda não publicou nenhum comunicado."}
                  </p>
                </div>
              ) : (
                <div className={styles.notificationList}>
                  {filteredNotifications.map((notification) => (
                    <div key={notification.id} className={styles.notificationItem}>
                      <div className={styles.notificationIcon}>{getTypeIcon(notification.type)}</div>
                      <div className={styles.notificationContent}>
                        <div className={styles.notificationHeader}>
                          <h3 className={styles.notificationTitle}>{notification.title}</h3>
                          {getTypeBadge(notification.type)}
                        </div>
                        <p className={styles.notificationMessage}>{notification.message}</p>
                        {notification.imageUrl && (
                          <div className={styles.notificationImageContainer}>
                            <div className={styles.notificationImageWrapper}>
                              <Image 
                                src={notification.imageUrl || "/placeholder.svg"} 
                                alt={`Imagem para ${notification.title}`} 
                                className={styles.notificationImage} 
                                width={500}
                                height={300}
                                layout="responsive"
                              />
                            </div>
                          </div>
                        )}
                        <span className={styles.notificationTime}>
                          {formatDistanceToNow(new Date(notification.timestamp), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                      <div className={styles.notificationActions}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(notification)}
                          className={styles.actionButton}
                        >
                          <Edit className={styles.actionIcon} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => confirmDelete(notification)}
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                        >
                          <Trash2 className={styles.actionIcon} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anuncios" className={styles.tabContent}>
          <Card>
            <CardHeader className={styles.cardHeader}>
              <CardTitle>Anúncios</CardTitle>
              <CardDescription>{filteredNotifications.length} anúncio(s) encontrado(s)</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Same content structure as "todos" tab */}
              {loading ? (
                <div className={styles.loadingState}>
                  <div className={styles.loadingSpinner}></div>
                  <p>Carregando anúncios...</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className={styles.emptyState}>
                  <Bell className={styles.emptyIcon} />
                  <h3 className={styles.emptyTitle}>Nenhum anúncio encontrado</h3>
                  <p className={styles.emptyText}>
                    {searchTerm ? "Nenhum anúncio corresponde à sua busca." : "Você ainda não publicou nenhum anúncio."}
                  </p>
                </div>
              ) : (
                <div className={styles.notificationList}>
                  {filteredNotifications.map((notification) => (
                    <div key={notification.id} className={styles.notificationItem}>
                      <div className={styles.notificationIcon}>{getTypeIcon(notification.type)}</div>
                      <div className={styles.notificationContent}>
                        <div className={styles.notificationHeader}>
                          <h3 className={styles.notificationTitle}>{notification.title}</h3>
                          {getTypeBadge(notification.type)}
                        </div>
                        <p className={styles.notificationMessage}>{notification.message}</p>
                        {notification.imageUrl && (
                          <div className={styles.notificationImageContainer}>
                            <div className={styles.notificationImageWrapper}>
                              <Image 
                                src={notification.imageUrl || "/placeholder.svg"} 
                                alt={`Imagem para ${notification.title}`} 
                                className={styles.notificationImage} 
                                width={500}
                                height={300}
                                layout="responsive"
                              />
                            </div>
                          </div>
                        )}
                        <span className={styles.notificationTime}>
                          {formatDistanceToNow(new Date(notification.timestamp), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                      <div className={styles.notificationActions}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(notification)}
                          className={styles.actionButton}
                        >
                          <Edit className={styles.actionIcon} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => confirmDelete(notification)}
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                        >
                          <Trash2 className={styles.actionIcon} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Similar structure for "eventos" and "alertas" tabs */}
        <TabsContent value="eventos" className={styles.tabContent}>
          <Card>
            <CardHeader className={styles.cardHeader}>
              <CardTitle>Eventos</CardTitle>
              <CardDescription>{filteredNotifications.length} evento(s) encontrado(s)</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Same content structure */}
              {loading ? (
                <div className={styles.loadingState}>
                  <div className={styles.loadingSpinner}></div>
                  <p>Carregando eventos...</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className={styles.emptyState}>
                  <Calendar className={styles.emptyIcon} />
                  <h3 className={styles.emptyTitle}>Nenhum evento encontrado</h3>
                  <p className={styles.emptyText}>
                    {searchTerm ? "Nenhum evento corresponde à sua busca." : "Você ainda não publicou nenhum evento."}
                  </p>
                </div>
              ) : (
                <div className={styles.notificationList}>
                  {filteredNotifications.map((notification) => (
                    <div key={notification.id} className={styles.notificationItem}>
                      <div className={styles.notificationIcon}>{getTypeIcon(notification.type)}</div>
                      <div className={styles.notificationContent}>
                        <div className={styles.notificationHeader}>
                          <h3 className={styles.notificationTitle}>{notification.title}</h3>
                          {getTypeBadge(notification.type)}
                        </div>
                        <p className={styles.notificationMessage}>{notification.message}</p>
                        {notification.imageUrl && (
                          <div className={styles.notificationImageContainer}>
                            <div className={styles.notificationImageWrapper}>
                              <Image 
                                src={notification.imageUrl || "/placeholder.svg"} 
                                alt={`Imagem para ${notification.title}`} 
                                className={styles.notificationImage} 
                                width={500}
                                height={300}
                                layout="responsive"
                              />
                            </div>
                          </div>
                        )}
                        <span className={styles.notificationTime}>
                          {formatDistanceToNow(new Date(notification.timestamp), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                      <div className={styles.notificationActions}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(notification)}
                          className={styles.actionButton}
                        >
                          <Edit className={styles.actionIcon} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => confirmDelete(notification)}
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                        >
                          <Trash2 className={styles.actionIcon} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alertas" className={styles.tabContent}>
          <Card>
            <CardHeader className={styles.cardHeader}>
              <CardTitle>Alertas</CardTitle>
              <CardDescription>{filteredNotifications.length} alerta(s) encontrado(s)</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Same content structure */}
              {loading ? (
                <div className={styles.loadingState}>
                  <div className={styles.loadingSpinner}></div>
                  <p>Carregando alertas...</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className={styles.emptyState}>
                  <AlertTriangle className={styles.emptyIcon} />
                  <h3 className={styles.emptyTitle}>Nenhum alerta encontrado</h3>
                  <p className={styles.emptyText}>
                    {searchTerm ? "Nenhum alerta corresponde à sua busca." : "Você ainda não publicou nenhum alerta."}
                  </p>
                </div>
              ) : (
                <div className={styles.notificationList}>
                  {filteredNotifications.map((notification) => (
                    <div key={notification.id} className={styles.notificationItem}>
                      <div className={styles.notificationIcon}>{getTypeIcon(notification.type)}</div>
                      <div className={styles.notificationContent}>
                        <div className={styles.notificationHeader}>
                          <h3 className={styles.notificationTitle}>{notification.title}</h3>
                          {getTypeBadge(notification.type)}
                        </div>
                        <p className={styles.notificationMessage}>{notification.message}</p>
                        {notification.imageUrl && (
                          <div className={styles.notificationImageContainer}>
                            <div className={styles.notificationImageWrapper}>
                              <Image 
                                src={notification.imageUrl || "/placeholder.svg"} 
                                alt={`Imagem para ${notification.title}`} 
                                className={styles.notificationImage} 
                                width={500}
                                height={300}
                                layout="responsive"
                              />
                            </div>
                          </div>
                        )}
                        <span className={styles.notificationTime}>
                          {formatDistanceToNow(new Date(notification.timestamp), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                      <div className={styles.notificationActions}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(notification)}
                          className={styles.actionButton}
                        >
                          <Edit className={styles.actionIcon} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => confirmDelete(notification)}
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                        >
                          <Trash2 className={styles.actionIcon} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className={styles.dialogContent}>
          <DialogHeader>
            <DialogTitle>Excluir Comunicado</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este comunicado? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          {selectedNotification && (
            <div className={styles.deleteConfirmationContent}>
              <h3 className={styles.deleteConfirmationTitle}>{selectedNotification.title}</h3>
              <p className={styles.deleteConfirmationMessage}>{selectedNotification.message}</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
