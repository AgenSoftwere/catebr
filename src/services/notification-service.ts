import { database } from "@/lib/firebase"
import { ref, set, get, push, remove } from "firebase/database"
import type { Notification } from "@/types/notification"

// Função para buscar todas as notificações disponíveis para o usuário em qualquer paróquia
export async function getNotificationsForUser(userId: string, parishId: string): Promise<Notification[]> {
  try {
    console.log(`Buscando notificações para usuário ${userId} na paróquia ${parishId}`)

    if (!parishId) {
      console.error("ID da paróquia não fornecido")
      return []
    }

    const cleanParishId = parishId.startsWith("parish_") ? parishId.replace("parish_", "") : parishId
    console.log("ID da paróquia limpo:", cleanParishId)

    const notificationsRef = ref(database, `notifications/${cleanParishId}`)
    const snapshot = await get(notificationsRef)

    if (!snapshot.exists()) {
      console.log("Nenhuma notificação encontrada para essa paróquia")
      return []
    }

    const parishNotifications = snapshot.val()
    const notificationList: Notification[] = []

    for (const key in parishNotifications) {
      const notification = parishNotifications[key]

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

    return notificationList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  } catch (error) {
    console.error("Erro ao buscar notificações:", error)
    return []
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
    const cleanParishId = parishId.startsWith("parish_") ? parishId.replace("parish_", "") : parishId
    const notificationsRef = ref(database, `notifications/${cleanParishId}`)
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
    const cleanParishId = parishId.startsWith("parish_") ? parishId.replace("parish_", "") : parishId
    const notificationRef = ref(database, `notifications/${cleanParishId}/${notificationId}`)

    const existingSnapshot = await get(notificationRef)
    if (!existingSnapshot.exists()) {
      throw new Error("Notification not found")
    }

    const existingNotification = existingSnapshot.val()

    await set(notificationRef, {
      ...notification,
      timestamp: existingNotification.timestamp,
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
    const cleanParishId = parishId.startsWith("parish_") ? parishId.replace("parish_", "") : parishId
    const notificationRef = ref(database, `notifications/${cleanParishId}/${notificationId}`)
    await remove(notificationRef)
    return true
  } catch (error) {
    console.error("Error deleting notification:", error)
    throw error
  }
}
