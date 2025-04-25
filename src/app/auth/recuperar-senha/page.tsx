"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import Link from "next/link"
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react'
import { auth } from "@/lib/firebase"
import { sendPasswordResetEmail } from "firebase/auth"
import styles from "./recuperar-senha.module.css"
import { VersionBadge } from "@/components/version-badge"

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError("Por favor, insira seu e-mail")
      return
    }

    try {
      setIsLoading(true)

      // Configurar o template de e-mail personalizado
      const actionCodeSettings = {
        url: `${window.location.origin}/auth/redefinir-senha`,
        handleCodeInApp: true,
      }

      // Enviar e-mail de recuperação de senha
      await sendPasswordResetEmail(auth, email, actionCodeSettings)
      
      // Marcar que o e-mail foi enviado
      setEmailSent(true)
      
    } catch (error: any) {
      console.error("Erro ao enviar e-mail de recuperação:", error)
      
      if (error.code === "auth/user-not-found") {
        // Não informamos ao usuário que o e-mail não existe por questões de segurança
        // Em vez disso, fingimos que o e-mail foi enviado
        setEmailSent(true)
      } else if (error.code === "auth/invalid-email") {
        setError("E-mail inválido")
      } else if (error.code === "auth/too-many-requests") {
        setError("Muitas tentativas. Tente novamente mais tarde")
      } else {
        setError("Erro ao enviar e-mail de recuperação. Tente novamente")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Link href="/auth/o/login" className={styles.backLink}>
          <ArrowLeft className={styles.backIcon} />
          <span>Voltar para o login</span>
        </Link>

        {emailSent ? (
          <div className={styles.successContainer}>
            <CheckCircle className={styles.successIcon} />
            <h1 className={styles.title}>E-mail enviado</h1>
            <p className={styles.successMessage}>
              Enviamos um link de recuperação de senha para <strong>{email}</strong>. 
              Por favor, verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
            </p>
            <div className={styles.infoBox}>
              <h3 className={styles.infoTitle}>Não recebeu o e-mail?</h3>
              <p className={styles.infoText}>
                Verifique sua pasta de spam ou lixo eletrônico. Se ainda não encontrar, você pode solicitar um novo e-mail
                de recuperação.
              </p>
              <Button 
                variant="outline" 
                className={styles.resendButton}
                onClick={handleSubmit}
                disabled={isLoading}
              >
                Reenviar e-mail de recuperação
              </Button>
            </div>
            <Button onClick={() => window.location.href = "/auth/o/login"} className={styles.returnButton}>
              Voltar para o login
            </Button>
          </div>
        ) : (
          <>
            <div className={styles.header}>
              <div className={styles.iconContainer}>
                <Mail className={styles.icon} />
              </div>
              <h1 className={styles.title}>Recuperar Senha</h1>
              <p className={styles.subtitle}>
                Insira seu e-mail e enviaremos um link para você redefinir sua senha
              </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <Label htmlFor="email" className={styles.label}>
                  E-mail
                </Label>
                <div className={styles.inputWrapper}>
                  <Mail className={styles.inputIcon} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={styles.input}
                  />
                </div>
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <Button type="submit" className={styles.submitButton} disabled={isLoading}>
                {isLoading ? "Enviando..." : "Enviar link de recuperação"}
              </Button>

              <div className={styles.loginLink}>
                Lembrou sua senha? <Link href="/auth/o/login">Entrar</Link>
              </div>
            </form>
          </>
        )}

        <VersionBadge />
      </div>
    </div>
  )
}
