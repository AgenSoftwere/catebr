"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Notification } from "@/types/notification"
import { useAuth } from "@/hooks/use-auth"
import { getNotificationsForUser } from "@/services/notification-service"

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

      // Set up real-time listener for new notifications
      // This would be implemented with Firebase Realtime Database
    }
  }, [user, loading])

  const hasUnreadNotifications = notifications.some((notification) => !notification.read)

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )

    // Update in Firebase
    // This would be implemented with Firebase Realtime Database
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))

    // Update in Firebase
    // This would be implemented with Firebase Realtime Database
  }

  const addNotification = (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
    }

    setNotifications((prev) => [newNotification, ...prev])

    // Add to Firebase
    // This would be implemented with Firebase Realtime Database
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
