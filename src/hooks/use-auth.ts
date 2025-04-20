"use client"

import { useAuthContext } from "@/context/auth-context"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  AuthError,
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { createUserProfile } from "@/services/user-service"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function useAuth() {
  const { user, loading, userType } = useAuthContext()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const signIn = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      return true
    } catch (error: unknown) {
      if (isAuthError(error)) {
        setError(getAuthErrorMessage(error.code))
      } else {
        setError("Ocorreu um erro. Tente novamente.")
      }
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (
    email: string, 
    password: string, 
    name: string, 
    role: "user" | "parish" = "user"
  ): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      // Send email verification
      await sendEmailVerification(userCredential.user)

      // Create user profile in database
      await createUserProfile(userCredential.user.uid, {
        name,
        email,
        role,
      })

      return true
    } catch (error: unknown) {
      if (isAuthError(error)) {
        setError(getAuthErrorMessage(error.code))
      } else {
        setError("Ocorreu um erro. Tente novamente.")
      }
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const signInWithGoogle = async (role: "user" | "parish" = "user"): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)

      // Check if user exists in database, if not create profile
      await createUserProfile(
        userCredential.user.uid,
        {
          name: userCredential.user.displayName || "",
          email: userCredential.user.email || "",
          role,
        },
        true,
      )

      return true
    } catch (error: unknown) {
      if (isAuthError(error)) {
        setError(getAuthErrorMessage(error.code))
      } else {
        setError("Ocorreu um erro. Tente novamente.")
      }
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async (): Promise<boolean> => {
    setIsLoading(true)

    try {
      await firebaseSignOut(auth)
      router.push("/")
      return true
    } catch (error: unknown) {
      if (isAuthError(error)) {
        setError(getAuthErrorMessage(error.code))
      } else {
        setError("Ocorreu um erro. Tente novamente.")
      }
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    user,
    loading: loading || isLoading,
    error,
    userType,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  }
}

function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case "auth/invalid-email":
      return "E-mail inválido."
    case "auth/user-disabled":
      return "Esta conta foi desativada."
    case "auth/user-not-found":
      return "Usuário não encontrado."
    case "auth/wrong-password":
      return "Senha incorreta."
    case "auth/email-already-in-use":
      return "Este e-mail já está em uso."
    case "auth/weak-password":
      return "A senha é muito fraca."
    case "auth/popup-closed-by-user":
      return "Login cancelado."
    default:
      return "Ocorreu um erro. Tente novamente."
  }
}

// Helper function to check if the error is an instance of AuthError
function isAuthError(error: unknown): error is AuthError {
  return (error as AuthError).code !== undefined
}
