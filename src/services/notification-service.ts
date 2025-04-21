import { database } from "@/lib/firebase"
import { ref, set, get, push, remove } from "firebase/database"
import type { Notification } from "@/types/notification"

// Função para buscar todas as notificações disponíveis no sistema
export async function getNotificationsForUser(userId: string, parishId: string): Promise<Notification[]> {
  try {
    console.log(`Buscando notificações para usuário ${userId} na paróquia ${parishId}`)

    if (!parishId) {
      console.error("ID da paróquia não fornecido")
      return []
    }

    // Remover prefixo "parish_" se existir
    const cleanParishId = parishId.startsWith("parish_") ? parishId.replace("parish_", "") : parishId
    console.log("ID da paróquia limpo:", cleanParishId)

    // SOLUÇÃO: Buscar todas as notificações disponíveis no sistema
    const notificationsRef = ref(database, "notifications")
    const allNotificationsSnapshot = await get(notificationsRef)

    if (!allNotificationsSnapshot.exists()) {
      console.log("Nenhuma notificação encontrada no sistema")
      return []
    }

    const allNotifications = allNotificationsSnapshot.val()
    console.log("Todas as notificações disponíveis:", allNotifications)

    const notificationList: Notification[] = []

    // Percorrer todos os nós de notificações (independente do ID da paróquia)
    for (const notificationParishId in allNotifications) {
      console.log(`Verificando notificações do nó: ${notificationParishId}`)
      const parishNotifications = allNotifications[notificationParishId]

      for (const key in parishNotifications) {
        const notification = parishNotifications[key]
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
    }

    console.log("Lista de notificações processada:", notificationList)
    return notificationList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  } catch (error) {
    console.error("Erro ao buscar notificações:", error)
    return [] // Return empty array instead of throwing error
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
    // Remover prefixo "parish_" se existir
    const cleanParishId = parishId.startsWith("parish_") ? parishId.replace("parish_", "") : parishId

    // Usar o ID fixo onde as notificações estão armazenadas
    const notificationsRef = ref(database, `notifications/8pD90WJ307PZo6cE8zXosIk1Ebc2`)
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
    // Usar o ID fixo onde as notificações estão armazenadas
    const notificationRef = ref(database, `notifications/8pD90WJ307PZo6cE8zXosIk1Ebc2/${notificationId}`)

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
    // Usar o ID fixo onde as notificações estão armazenadas
    const notificationRef = ref(database, `notifications/8pD90WJ307PZo6cE8zXosIk1Ebc2/${notificationId}`)
    await remove(notificationRef)
    return true
  } catch (error) {
    console.error("Error deleting notification:", error)
    throw error
  }
}
