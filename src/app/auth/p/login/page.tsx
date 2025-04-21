"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, Lock, ArrowLeft, Church } from 'lucide-react'
import styles from "./login.module.css"
import { VersionBadge } from "@/components/version-badge"

export default function ParishLoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const { signIn, error, loading, userType } = useAuth()
    const router = useRouter()

    // Add effect to check user type and redirect
    useEffect(() => {
        if (userType === "parish") {
            router.push("/paroquia/dashboard")
        }
    }, [userType, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const success = await signIn(email, password)

        if (success) {
            toast.success("Login realizado com sucesso", {
                description: "Bem-vindo de volta!",
            })
            // The redirection will be handled by the useEffect above
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
                    <Church className={styles.parishIcon} />
                    <h1 className={styles.title}>Acesso para Paróquias</h1>
                    <p className={styles.subtitle}>Entre com suas credenciais para gerenciar sua paróquia</p>
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
                                placeholder="paroquia@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className={styles.input}
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <div className={styles.labelWrapper}>
                            <Label htmlFor="password" className={styles.label}>
                                Senha
                            </Label>
                            <Link href="/auth/recuperar-senha" className={styles.forgotPassword}>
                                Esqueceu a senha?
                            </Link>
                        </div>
                        <div className={styles.inputWrapper}>
                            <Lock className={styles.inputIcon} />
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className={styles.input}
                            />
                        </div>
                    </div>

                    {error && <p className={styles.error}>{error}</p>}

                    <Button type="submit" className={styles.submitButton} disabled={loading}>
                        {loading ? "Entrando..." : "Entrar"}
                    </Button>
                </form>

                <div className={styles.registerLink}>
                    Não tem uma conta? <Link href="/auth/p/register">Cadastrar paróquia</Link>
                </div>

                <VersionBadge />
            </div>
        </div>
    )
}
