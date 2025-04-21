import { database } from "@/lib/firebase"
import { ref, set, get, push, remove } from "firebase/database"
import type { Notification, ParishNotification } from "@/types/notification"

// Modificada para receber o parishId diretamente
export async function getNotificationsForUser(userId: string, parishId: string): Promise<Notification[]> {
  try {
    console.log(`Buscando notificações para usuário ${userId} na paróquia ${parishId}`)

    if (!parishId) {
      console.error("ID da paróquia não fornecido")
      return []
    }

    // Get notifications for the selected parish
    const notificationsRef = ref(database, `notifications/${parishId}`)
    console.log("Caminho no Firebase:", `notifications/${parishId}`)

    const notificationsSnapshot = await get(notificationsRef)
    console.log("Snapshot existe:", notificationsSnapshot.exists())

    if (notificationsSnapshot.exists()) {
      const notifications = notificationsSnapshot.val()
      console.log("Dados brutos:", notifications)

      const notificationList: Notification[] = []

      for (const key in notifications) {
        const notification = notifications[key]
        console.log(`Processando notificação ${key}:`, notification)

        // Check if user has read this notification
        let isRead = false
        try {
          const userReadRef = ref(database, `userReadNotifications/${userId}/${key}`)
          const userReadSnapshot = await get(userReadRef)
          isRead = userReadSnapshot.exists()
        } catch (error) {
          console.error("Erro ao verificar status de leitura:", error)
        }

        notificationList.push({
          id: key,
          title: notification.title || "",
          message: notification.message || "",
          type: notification.type || "announcement",
          timestamp: notification.timestamp || new Date().toISOString(),
          read: isRead,
          imageUrl: notification.imageUrl || null,
        })
      }

      console.log("Lista de notificações processada:", notificationList)
      return notificationList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    } else {
      console.log("Nenhuma notificação encontrada para esta paróquia")
    }

    return []
  } catch (error) {
    console.error("Erro ao buscar notificações:", error)
    return [] // Return empty array instead of throwing error
  }
}

export async function getParishNotifications(parishId: string): Promise<ParishNotification[]> {
  try {
    const notificationsRef = ref(database, `notifications/${parishId}`)
    const notificationsSnapshot = await get(notificationsRef)

    if (notificationsSnapshot.exists()) {
      const notifications = notificationsSnapshot.val()
      const notificationList: ParishNotification[] = []

      for (const key in notifications) {
        const notification = notifications[key]

        notificationList.push({
          id: key,
          title: notification.title || "",
          message: notification.message || "",
          type: notification.type || "announcement",
          timestamp: notification.timestamp || new Date().toISOString(),
          imageUrl: notification.imageUrl || null,
        })
      }

      return notificationList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    }

    return []
  } catch (error) {
    console.error("Error getting parish notifications:", error)
    throw error
  }
}

export async function markNotificationAsRead(userId: string, notificationId: string) {
  try {
    await set(ref(database, `userReadNotifications/${userId}/${notificationId}`), true)
    return true
  } catch (error) {
    console.error("Error marking notification as read:", error)
    throw error
  }
}

export async function createNotification(
  parishId: string,
  notification: {
    title: string
    message: string
    type: "event" | "announcement" | "alert"
    imageUrl?: string | null
  },
) {
  try {
    const notificationsRef = ref(database, `notifications/${parishId}`)
    const newNotificationRef = push(notificationsRef)

    const newNotification = {
      ...notification,
      timestamp: new Date().toISOString(),
    }

    await set(newNotificationRef, newNotification)
    return { id: newNotificationRef.key, ...newNotification }
  } catch (error) {
    console.error("Error creating notification:", error)
    throw error
  }
}

export async function updateNotification(
  parishId: string,
  notificationId: string,
  notification: {
    title: string
    message: string
    type: "event" | "announcement" | "alert"
    imageUrl?: string | null
  },
) {
  try {
    const notificationRef = ref(database, `notifications/${parishId}/${notificationId}`)

    // Get the existing notification to preserve the timestamp
    const existingSnapshot = await get(notificationRef)
    if (!existingSnapshot.exists()) {
      throw new Error("Notification not found")
    }

    const existingNotification = existingSnapshot.val()

    await set(notificationRef, {
      ...notification,
      timestamp: existingNotification.timestamp, // Preserve original timestamp
    })

    return {
      id: notificationId,
      ...notification,
      timestamp: existingNotification.timestamp,
    }
  } catch (error) {
    console.error("Error updating notification:", error)
    throw error
  }
}

export async function deleteNotification(parishId: string, notificationId: string) {
  try {
    const notificationRef = ref(database, `notifications/${parishId}/${notificationId}`)
    await remove(notificationRef)
    return true
  } catch (error) {
    console.error("Error deleting notification:", error)
    throw error
  }
}
