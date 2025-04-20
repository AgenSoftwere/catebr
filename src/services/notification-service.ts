import { database } from "@/lib/firebase"
import { ref, set, get, push } from "firebase/database"
import type { Notification } from "@/types/notification"

export async function getNotificationsForUser(userId: string): Promise<Notification[]> {
  try {
    // Get user's selected parish
    const selectedParishId = localStorage.getItem("selectedParish")

    if (!selectedParishId) {
      return []
    }

    // Get notifications for the selected parish
    const notificationsRef = ref(database, `notifications/${selectedParishId}`)
    const notificationsSnapshot = await get(notificationsRef)

    if (notificationsSnapshot.exists()) {
      const notifications = notificationsSnapshot.val()
      const notificationList: Notification[] = []

      for (const key in notifications) {
        const notification = notifications[key]

        // Check if user has read this notification
        const userReadRef = ref(database, `userReadNotifications/${userId}/${key}`)
        const userReadSnapshot = await get(userReadRef)

        notificationList.push({
          id: key,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          timestamp: notification.timestamp,
          read: userReadSnapshot.exists(),
        })
      }

      return notificationList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    }

    return []
  } catch (error) {
    console.error("Error getting notifications:", error)
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
