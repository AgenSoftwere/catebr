"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "@/types/user"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { getUserData } from "@/services/user-service"

interface AuthContextType {
  user: User | null
  loading: boolean
  userType: "user" | "parish" | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [userType, setUserType] = useState<"user" | "parish" | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get additional user data from Firestore/Realtime DB
          const userData = await getUserData(firebaseUser.uid)

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            displayName: firebaseUser.displayName || userData?.name || "",
            ...userData,
          })

          setUserType((userData?.role as "user" | "parish") || "user")
        } catch (error) {
          console.error("Error fetching user data:", error)
          setUser(null)
          setUserType(null)
        }
      } else {
        setUser(null)
        setUserType(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return <AuthContext.Provider value={{ user, loading, userType }}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider")
  }
  return context
}
