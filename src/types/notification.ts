export interface Notification {
    id: string
    title: string
    message: string
    type: "event" | "announcement" | "alert"
    timestamp: string
    read: boolean
  }
  