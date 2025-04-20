export interface User {
    uid: string
    email: string
    displayName: string
    role?: "user" | "parish"
    [key: string]: string | number | boolean | undefined
  }
  