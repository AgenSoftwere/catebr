import { database } from "@/lib/firebase"
import { ref, set, get, push, remove } from "firebase/database"
import type { Notification } from "@/types/notification"

// Função para obter o ID do usuário da paróquia a partir do ID da paróquia
async function getParishUserId(parishId: string): Promise<string | null> {
  try {
    console.log(`Buscando ID do usuário da paróquia para: ${parishId}`)

    // Remover prefixo "parish_" se existir
    const cleanParishId = parishId.startsWith("parish_") ? parishId.replace("parish_", "") : parishId

    // Buscar dados da paróquia
    const parishRef = ref(database, `parishes/${cleanParishId}`)
    const parishSnapshot = await get(parishRef)

    if (parishSnapshot.exists()) {
      const parishData = parishSnapshot.val()

      // Se a paróquia tem um campo userId, usar esse
      if (parishData.userId) {
        console.log(`ID do usuário da paróquia encontrado: ${parishData.userId}`)
        return parishData.userId
      }

      // Se não tem userId, buscar em users para encontrar o usuário com role=parish e id correspondente
      const usersRef = ref(database, "users")
      const usersSnapshot = await get(usersRef)

      if (usersSnapshot.exists()) {
        const users = usersSnapshot.val()

        for (const userId in users) {
          const userData = users[userId]
          if (userData.role === "parish" && userData.parishId === cleanParishId) {
            console.log(`ID do usuário da paróquia encontrado em users: ${userId}`)
            return userId
          }
        }
      }
    }

    // Se não encontrou, verificar diretamente no nó de notificações
    const notificationsRef = ref(database, "notifications")
    const notificationsSnapshot = await get(notificationsRef)

    if (notificationsSnapshot.exists()) {
      const notifications = notificationsSnapshot.val()

      // Verificar se existe algum nó com notificações para esta paróquia
      for (const notificationUserId in notifications) {
        // Verificar se este usuário est associado à paróquia
        const userRef = ref(database, `users/${notificationUserId}`)
        const userSnapshot = await get(userRef)

        if (userSnapshot.exists()) {
          const userData = userSnapshot.val()
          if (userData.role === "parish" && (userData.parishId === cleanParishId || userData.id === cleanParishId)) {
            console.log(`ID do usuário da paróquia encontrado em notifications: ${notificationUserId}`)
            return notificationUserId
          }
        }
      }
    }

    // Se ainda não encontrou, retornar o ID da paróquia como fallback
    console.log(
      `Não foi possível encontrar o ID do usuário da paróquia, usando o próprio ID como fallback: ${cleanParishId}`,
    )
    return cleanParishId
  } catch (error) {
    console.error("Erro ao buscar ID do usuário da paróquia:", error)
    return null
  }
}

// Optimize the getNotificationsForUser function to reduce redundant Firestore calls
export async function getNotificationsForUser(userId: string, parishId: string): Promise<Notification[]> {
  try {
    console.log(`Buscando notificações para usuário ${userId} na paróquia ${parishId}`)

    if (!parishId) {
      console.error("ID da paróquia não fornecido")
      return []
    }

    // Cache the parish user ID to avoid redundant lookups
    const parishUserIdCache = new Map<string, string | null>()

    // Check if we have the parish user ID in cache
    let parishUserId: string | null
    if (parishUserIdCache.has(parishId)) {
      parishUserId = parishUserIdCache.get(parishId)!
    } else {
      // Obter o ID do usuário da paróquia
      parishUserId = await getParishUserId(parishId)
      // Cache the result
      parishUserIdCache.set(parishId, parishUserId)
    }

    if (!parishUserId) {
      console.error("Não foi possível determinar o ID do usuário da paróquia")
      return []
    }

    console.log(`Usando ID do usuário da paróquia: ${parishUserId}`)

    // Buscar notificações usando o ID do usuário da paróquia
    const notificationsRef = ref(database, `notifications/${parishUserId}`)
    const notificationsSnapshot = await get(notificationsRef)

    if (!notificationsSnapshot.exists()) {
      console.log(`Nenhuma notificação encontrada para a paróquia com ID de usuário: ${parishUserId}`)

      // Tentar buscar em todas as notificações como fallback
      return await getAllNotifications(userId)
    }

    const notifications = notificationsSnapshot.val()
    const notificationList: Notification[] = []

    // Batch read operations for user read status
    const readStatusPromises: Promise<import("firebase/database").DataSnapshot>[] = []
    const notificationKeys: string[] = []

    for (const key in tifications) {
      notificationKeys.push(key)
      const userReadRef = ref(database, `userReadNotifications/${userId}/${key}`)
      readStatusPromises.push(get(userReadRef))
    }

    // Execute all read status checks in parallel
    const readStatusResults = await Promise.all(readStatusPromises)

    // Now process notifications with the read status results
    for (let i = 0; i < notificationKeys.length; i++) {
      const key = notificationKeys[i]
      const notification = notifications[key]
      const isRead = readStatusResults[i].exists()

      console.log(`Processando notificação ${key}:`, notification)

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
  } catch (error) {
    console.error("Erro ao buscar notificações:", error)
    return [] // Return empty array instead of throwing error
  }
}

// Função para buscar todas as notificações disponíveis no sistema (fallback)
async function getAllNotifications(userId: string): Promise<Notification[]> {
  try {
    console.log("Buscando todas as notificações disponíveis no sistema como fallback")

    const notificationsRef = ref(database, "notifications")
    const allNotificationsSnapshot = await get(notificationsRef)

    if (!allNotificationsSnapshot.exists()) {
      console.log("Nenhuma notificação encontrada no sistema")
      return []
    }

    const allNotifications = allNotificationsSnapshot.val()
    const notificationList: Notification[] = []

    // Percorrer todos os nós de notificações
    for (const notificationParishId in allNotifications) {
      console.log(`Verificando notificações do nó: ${notificationParishId}`)
      const parishNotifications = allNotifications[notificationParishId]

      for (const key in parishNotifications) {
        const notification = parishNotifications[key]

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

    return notificationList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  } catch (error) {
    console.error("Erro ao buscar todas as notificações:", error)
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
    // Obter o ID do usuário da paróquia
    const parishUserId = await getParishUserId(parishId)

    if (!parishUserId) {
      throw new Error("Não foi possível determinar o ID do usuário da paróquia")
    }

    console.log(`Criando notificação para a paróquia com ID de usuário: ${parishUserId}`)

    // Criar notificação usando o ID do usuário da paróquia
    const notificationsRef = ref(database, `notifications/${parishUserId}`)
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
    // Obter o ID do usuário da paróquia
    const parishUserId = await getParishUserId(parishId)

    if (!parishUserId) {
      throw new Error("Não foi possível determinar o ID do usuário da paróquia")
    }

    console.log(`Atualizando notificação para a paróquia com ID de usuário: ${parishUserId}`)

    // Atualizar notificação usando o ID do usuário da paróquia
    const notificationRef = ref(database, `notifications/${parishUserId}/${notificationId}`)

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
    // Obter o ID do usuário da paróquia
    const parishUserId = await getParishUserId(parishId)

    if (!parishUserId) {
      throw new Error("Não foi possível determinar o ID do usuário da paróquia")
    }

    console.log(`Excluindo notificação para a paróquia com ID de usuário: ${parishUserId}`)

    // Excluir notificação usando o ID do usuário da paróquia
    const notificationRef = ref(database, `notifications/${parishUserId}/${notificationId}`)
    await remove(notificationRef)
    return true
  } catch (error) {
    console.error("Error deleting notification:", error)
    throw error
  }
}
