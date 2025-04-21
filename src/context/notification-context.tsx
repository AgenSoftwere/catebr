"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Notification } from "@/types/notification"
import { useAuth } from "@/hooks/use-auth"
import { getNotificationsForUser, markNotificationAsRead } from "@/services/notification-service"

interface NotificationContextType {
  notifications: Notification[]
  hasUnreadNotifications: boolean
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { user, loading } = useAuth()

  useEffect(() => {
    if (user && !loading) {
      // Fetch notifications from Firebase
      const fetchNotifications = async () => {
        try {
          const userNotifications = await getNotificationsForUser(user.uid)
          setNotifications(userNotifications)
        } catch (error) {
          console.error("Error fetching notifications:", error)
        }
      }

      fetchNotifications()

      // Set up interval to refresh notifications every 30 seconds
      const intervalId = setInterval(fetchNotifications, 30000)

      // Clean up interval on unmount
      return () => clearInterval(intervalId)
    }
  }, [user, loading])

  const hasUnreadNotifications = notifications.some((notification) => !notification.read)

  const markAsRead = async (id: string) => {
    if (!user) return

    try {
      await markNotificationAsRead(user.uid, id)

      setNotifications((prev) =>
        prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
      )
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    if (!user) return

    try {
      // Mark all notifications as read in Firebase
      const promises = notifications
        .filter((notification) => !notification.read)
        .map((notification) => markNotificationAsRead(user.uid, notification.id))

      await Promise.all(promises)

      setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const addNotification = (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
    }

    setNotifications((prev) => [newNotification, ...prev])
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        hasUnreadNotifications,
        markAsRead,
        markAllAsRead,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
