"use client"

import { useNotifications } from "@/context/notification-context"
import type { Notification } from "@/types/notification"
import styles from "./notification-list.module.css"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Bell, Calendar, Info } from "lucide-react"
import Image from "next/image"

export function NotificationList() {
  const { notifications, markAllAsRead } = useNotifications()

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
      default:
        return <Info className={styles.itemIcon} />
    }
  }

  return (
    <div className={`${styles.item} ${!notification.read ? styles.unread : ""}`} onClick={handleClick}>
      <div className={styles.itemIconWrapper}>{getIcon()}</div>
      <div className={styles.itemContent}>
        <h3 className={styles.itemTitle}>{notification.title}</h3>
        <p className={styles.itemMessage}>{notification.message}</p>
          {notification.imageUrl && (
              <Image
                src={notification.imageUrl || "/placeholder.svg"}
                alt={`Imagem para ${notification.title}`}
                className={styles.itemImage}
                width={100}
                height={100}
              />
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
