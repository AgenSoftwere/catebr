"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react'
import Link from "next/link"
import { auth } from "@/lib/firebase"
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth"
import styles from "./senha.module.css"

export default function AlterarSenhaPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!user) {
      toast.error("Você precisa estar logado para alterar sua senha")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem")
      return
    }

    if (newPassword.length < 6) {
      setError("A nova senha deve ter pelo menos 6 caracteres")
      return
    }

    try {
      setIsLoading(true)

      // Reautenticar o usuário antes de alterar a senha
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(auth.currentUser!, credential)

      // Alterar a senha
      await updatePassword(auth.currentUser!, newPassword)

      toast.success("Senha alterada com sucesso")
      
      // Limpar os campos
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      
      // Redirecionar para a página de perfil
      router.push("/perfil")
    } catch (error: unknown) {
      console.error("Erro ao alterar senha:", error)
      
      if (error instanceof Error && "code" in error) {
        const errorCode = (error as { code: string }).code;
        if (errorCode === "auth/wrong-password") {
          setError("Senha atual incorreta")
        } else if (errorCode === "auth/too-many-requests") {
          setError("Muitas tentativas. Tente novamente mais tarde")
        } else {
          setError("Erro ao alterar senha. Tente novamente")
        }
      } else {
        setError("Erro desconhecido ao alterar senha")
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.header}>
            <Link href="/perfil" className={styles.backLink}>
              <ArrowLeft className={styles.backIcon} />
              <span>Voltar</span>
            </Link>
            <h1 className={styles.title}>Alterar Senha</h1>
          </div>
          
          <div className={styles.notLoggedIn}>
            <p>Você precisa estar logado para alterar sua senha.</p>
            <Button onClick={() => router.push("/auth/o/login")}>Fazer Login</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <Link href="/perfil" className={styles.backLink}>
            <ArrowLeft className={styles.backIcon} />
            <span>Voltar</span>
          </Link>
          <h1 className={styles.title}>Alterar Senha</h1>
        </div>

        <div className={styles.formContainer}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <Label htmlFor="currentPassword" className={styles.label}>
                Senha atual
              </Label>
              <div className={styles.passwordInputWrapper}>
                <Lock className={styles.inputIcon} />
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className={styles.input}
                  placeholder="Digite sua senha atual"
                />
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  tabIndex={-1}
                >
                  {showCurrentPassword ? (
                    <EyeOff className={styles.eyeIcon} />
                  ) : (
                    <Eye className={styles.eyeIcon} />
                  )}
                </button>
              </div>
            </div>

            <div className={styles.formGroup}>
              <Label htmlFor="newPassword" className={styles.label}>
                Nova senha
              </Label>
              <div className={styles.passwordInputWrapper}>
                <Lock className={styles.inputIcon} />
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className={styles.input}
                  placeholder="Digite sua nova senha"
                />
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  tabIndex={-1}
                >
                  {showNewPassword ? (
                    <EyeOff className={styles.eyeIcon} />
                  ) : (
                    <Eye className={styles.eyeIcon} />
                  )}
                </button>
              </div>
            </div>

            <div className={styles.formGroup}>
              <Label htmlFor="confirmPassword" className={styles.label}>
                Confirmar nova senha
              </Label>
              <div className={styles.passwordInputWrapper}>
                <Lock className={styles.inputIcon} />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className={styles.input}
                  placeholder="Confirme sua nova senha"
                />
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className={styles.eyeIcon} />
                  ) : (
                    <Eye className={styles.eyeIcon} />
                  )}
                </button>
              </div>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.passwordRequirements}>
              <h3 className={styles.requirementsTitle}>Requisitos de senha:</h3>
              <ul className={styles.requirementsList}>
                <li className={newPassword.length >= 6 ? styles.requirementMet : ""}>
                  Pelo menos 6 caracteres
                </li>
                <li className={/[A-Z]/.test(newPassword) ? styles.requirementMet : ""}>
                  Pelo menos uma letra maiúscula (recomendado)
                </li>
                <li className={/[0-9]/.test(newPassword) ? styles.requirementMet : ""}>
                  Pelo menos um número (recomendado)
                </li>
              </ul>
            </div>

            <Button type="submit" className={styles.submitButton} disabled={isLoading}>
              {isLoading ? "Alterando..." : "Alterar Senha"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
