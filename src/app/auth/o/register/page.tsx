"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, Lock, User, ArrowLeft } from "lucide-react"
import styles from "./register.module.css"
import { VersionBadge } from "@/components/version-badge"

export default function UserRegisterPage() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [formError, setFormError] = useState<string | null>(null)

    const { signUp, signInWithGoogle, error, loading } = useAuth()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormError(null)

        if (password !== confirmPassword) {
            setFormError("As senhas não coincidem.")
            return
        }

        const success = await signUp(email, password, name)

        if (success) {
            toast.success("Cadastro realizado com sucesso. Enviamos um e-mail de verificação para o seu endereço.")
            router.push("/auth/verificar-email")
        }
    }

    const handleGoogleSignUp = async () => {
        const success = await signInWithGoogle()

        if (success) {
            toast.success("Cadastro realizado com sucesso. Bem-vindo ao Cate!")
            router.push("/comunicados")
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <Link href="/" className={styles.backLink}>
                    <ArrowLeft className={styles.backIcon} />
                    <span>Voltar</span>
                </Link>

                <div className={styles.header}>
                    <h1 className={styles.title}>Cadastrar como Fiel</h1>
                    <p className={styles.subtitle}>Crie sua conta para acompanhar os comunicados da sua paróquia</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <Label htmlFor="name" className={styles.label}>
                            Nome completo
                        </Label>
                        <div className={styles.inputWrapper}>
                            <User className={styles.inputIcon} />
                            <Input
                                id="name"
                                placeholder="Seu nome completo"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className={styles.input}
                            />
                        </div>
                    </div>

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

                    <div className={styles.formGroup}>
                        <Label htmlFor="password" className={styles.label}>
                            Senha
                        </Label>
                        <div className={styles.inputWrapper}>
                            <Lock className={styles.inputIcon} />
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className={styles.input}
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <Label htmlFor="confirmPassword" className={styles.label}>
                            Confirmar senha
                        </Label>
                        <div className={styles.inputWrapper}>
                            <Lock className={styles.inputIcon} />
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                                className={styles.input}
                            />
                        </div>
                    </div>

                    {(formError || error) && <p className={styles.error}>{formError || error}</p>}

                    <Button type="submit" className={styles.submitButton} disabled={loading}>
                        {loading ? "Cadastrando..." : "Cadastrar"}
                    </Button>
                </form>

                <div className={styles.divider}>
                    <Separator className={styles.separator} />
                    <span className={styles.dividerText}>ou</span>
                    <Separator className={styles.separator} />
                </div>

                <Button
                    type="button"
                    variant="outline"
                    className={styles.googleButton}
                    onClick={handleGoogleSignUp}
                    disabled={loading}
                >
                    <svg viewBox="0 0 24 24" className={styles.googleIcon}>
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Cadastrar com Google
                </Button>

                <div className={styles.loginLink}>
                    Já tem uma conta? <Link href="/auth/o/login">Entrar</Link>
                </div>

                <VersionBadge />
            </div>
        </div>
    )
}
