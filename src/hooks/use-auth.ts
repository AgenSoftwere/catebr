"use client"

import { useAuthContext } from "@/context/auth-context"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  type AuthError,
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

  // Na função signIn, vamos adicionar validação básica e melhorar o tratamento de erros
  const signIn = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    // Validação básica
    if (!email || !email.includes("@")) {
      setError("Por favor, insira um email válido.")
      setIsLoading(false)
      return false
    }

    if (!password || password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.")
      setIsLoading(false)
      return false
    }

    try {
      // Adicionar log para depuração (remover em produção)
      console.log(`Tentando login com email: ${email.substring(0, 3)}...`)

      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      console.log("Login bem-sucedido:", userCredential.user.uid)
      return true
    } catch (error: unknown) {
      console.error("Erro de autenticação:", error)

      if (isAuthError(error)) {
        // Tratamento mais específico para erros comuns
        if (
          error.code === "auth/invalid-credential" ||
          error.code === "auth/invalid-email" ||
          error.code === "auth/user-not-found" ||
          error.code === "auth/wrong-password"
        ) {
          setError("Email ou senha incorretos. Por favor, verifique suas credenciais.")
        } else {
          setError(getAuthErrorMessage(error.code))
        }
      } else {
        setError("Ocorreu um erro ao fazer login. Tente novamente.")
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
    role: "user" | "parish" = "user",
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

// Atualizar a função getAuthErrorMessage para incluir mais códigos de erro
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
    case "auth/invalid-credential":
      return "Credenciais inválidas. Verifique seu email e senha."
    case "auth/too-many-requests":
      return "Muitas tentativas de login. Tente novamente mais tarde."
    case "auth/network-request-failed":
      return "Erro de conexão. Verifique sua internet."
    case "auth/internal-error":
      return "Erro interno do servidor. Tente novamente mais tarde."
    default:
      return `Ocorreu um erro (${errorCode}). Tente novamente.`
  }
}

// Helper function to check if the error is an instance of AuthError
function isAuthError(error: unknown): error is AuthError {
  return (error as AuthError).code !== undefined
}
