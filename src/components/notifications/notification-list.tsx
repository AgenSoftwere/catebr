"use client"

import { useNotifications } from "@/context/notification-context"
import type { Notification } from "@/types/notification"
import styles from "./notification-list.module.css"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Bell, Calendar, Info } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { getNotificationsForUser } from "@/services/notification-service"
import { useAuth } from "@/hooks/use-auth"
import { firestore } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

interface NotificationListProps {
  parishId?: string
}

export function NotificationList({ parishId }: NotificationListProps) {
  const { notifications, markAllAsRead, setNotifications } = useNotifications()
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    let isMounted = true

    async function fetchNotifications() {
      if (!parishId) {
        console.log("Nenhum ID de paróquia fornecido")
        setIsLoading(false)
        return
      }

      try {
        console.log("Buscando notificações para a paróquia:", parishId)
        const userId = user?.uid || "anonymous"
        const fetchedNotifications = await getNotificationsForUser(userId, parishId)
        console.log("Notificações encontradas:", fetchedNotifications.length, fetchedNotifications)

        // Processar imagens do Firestore
        const processedNotifications = await Promise.all(
          fetchedNotifications.map(async (notification) => {
            if (
              notification.imageUrl &&
              typeof notification.imageUrl === "string" &&
              notification.imageUrl.startsWith("firestore:")
            ) {
              try {
                const imageId = notification.imageUrl.replace("firestore:", "")
                const imageDoc = await getDoc(doc(firestore, "images", imageId))

                if (imageDoc.exists()) {
                  return {
                    ...notification,
                    imageUrl: imageDoc.data().data,
                  }
                }
              } catch (error) {
                console.error("Erro ao buscar imagem do Firestore:", error)
              }
            }
            return notification
          }),
        )

        if (isMounted) {
          setNotifications(processedNotifications)
        }
      } catch (error) {
        console.error("Erro ao buscar notificações:", error)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchNotifications()

    // Use a reasonable interval for updates (30 seconds)
    const intervalId = setInterval(fetchNotifications, 30000)

    // Clean up function to prevent memory leaks and excessive requests
    return () => {
      isMounted = false
      clearInterval(intervalId)
    }
  }, [parishId, user, setNotifications])

  if (isLoading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.loadingSpinner}></div>
        <p>Carregando comunicados...</p>
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Bell className={styles.emptyIcon} />
        <h3 className={styles.emptyTitle}>Nenhum comunicado</h3>
        <p className={styles.emptyText}>Não há comunicados disponíveis no momento.</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Comunicados</h2>
        {notifications.some((n) => !n.read) && (
          <button onClick={markAllAsRead} className={styles.readAllButton}>
            Marcar todos como lidos
          </button>
        )}
      </div>

      <div className={styles.list}>
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </div>
    </div>
  )
}

function NotificationItem({ notification }: { notification: Notification }) {
  const { markAsRead } = useNotifications()

  const handleClick = () => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
  }

  const getIcon = () => {
    switch (notification.type) {
      case "event":
        return <Calendar className={styles.itemIcon} />
      case "alert":
        return <Info className={styles.itemIcon} />
      default:
        return <Bell className={styles.itemIcon} />
    }
  }

  return (
    <div className={`${styles.item} ${!notification.read ? styles.unread : ""}`} onClick={handleClick}>
      <div className={styles.itemIconWrapper}>{getIcon()}</div>
      <div className={styles.itemContent}>
        <h3 className={styles.itemTitle}>{notification.title}</h3>
        <p className={styles.itemMessage}>{notification.message}</p>
        {notification.imageUrl && (
          <div className={styles.itemImageContainer}>
            <div className={styles.itemImageWrapper}>
              <Image
                src={notification.imageUrl || "/placeholder.svg"}
                alt={`Imagem para ${notification.title}`}
                className={styles.itemImage}
                width={500}
                height={300}
                layout="responsive"
              />
            </div>
          </div>
        )}
      </div>
      <span className={styles.itemTime}>
        {formatDistanceToNow(new Date(notification.timestamp), {
          addSuffix: true,
          locale: ptBR,
        })}
      </span>
      {!notification.read && <div className={styles.unreadDot}></div>}
    </div>
  )
}
