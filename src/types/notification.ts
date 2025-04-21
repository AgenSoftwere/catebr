export interface Notification {
    id: string
    title: string
    message: string
    type: "event" | "announcement" | "alert"
    timestamp: string
    read: boolean
  }
  
  export interface ParishNotification {
    id: string
    title: string
    message: string
    type: "event" | "announcement" | "alert"
    timestamp: string
  }
  