"use client"

import { Button } from "@/components/ui/button"
import { Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import styles from "./page.module.css"
import { VersionBadge } from "@/components/version-badge"

export default function VerificarEmailPage() {
  const router = useRouter()

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft className={styles.backIcon} />
          <span>Voltar para a página inicial</span>
        </Link>

        <div className={styles.emailIcon}>
          <Mail className={styles.icon} />
        </div>

        <h1 className={styles.title}>Verifique seu e-mail</h1>

        <p className={styles.description}>
          Enviamos um link de verificação para o seu e-mail. Por favor, verifique sua caixa de entrada e clique no link
          para ativar sua conta.
        </p>

        <div className={styles.infoBox}>
          <h3 className={styles.infoTitle}>Não recebeu o e-mail?</h3>
          <p className={styles.infoText}>
            Verifique sua pasta de spam ou lixo eletrônico. Se ainda não encontrar, você pode solicitar um novo e-mail
            de verificação.
          </p>
          <Button variant="outline" className={styles.resendButton}>
            Reenviar e-mail de verificação
          </Button>
        </div>

        <Button onClick={() => router.push("/auth/o/login")} className={styles.loginButton}>
          Ir para o login
        </Button>

        <VersionBadge />
      </div>
    </div>
  )
}
