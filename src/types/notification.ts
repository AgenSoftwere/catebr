export interface Notification {
    id: string
    title: string
    message: string
    type: "event" | "announcement" | "alert"
    timestamp: string
    read: boolean
    imageUrl?: string | null
  }
  
  export interface ParishNotification {
    id: string
    title: string
    message: string
    type: "event" | "announcement" | "alert"
    timestamp: string
    imageUrl?: string | null
  }
  