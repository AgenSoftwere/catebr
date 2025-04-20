"use client"

import { useEffect } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { User, LogOut, Settings, Bell, Church } from "lucide-react"
import styles from "./page.module.css"
import { VersionBadge } from "@/components/version-badge"

export default function PerfilPage() {
    const { user, loading, signOut } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.push("/auth/o/login")
        }
    }, [user, loading, router])

    const handleSignOut = async () => {
        await signOut()
        toast.success("Logout realizado com sucesso", {
            description: "Você foi desconectado da sua conta.",
        })
    }

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Carregando perfil...</p>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.header}>
                    <div className={styles.avatarContainer}>
                        <div className={styles.avatar}>
                            <User className={styles.avatarIcon} />
                        </div>
                        <h1 className={styles.userName}>{user.displayName}</h1>
                        <p className={styles.userEmail}>{user.email}</p>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Minha Paróquia</h2>
                    <div className={styles.parishCard}>
                        <Church className={styles.parishIcon} />
                        <div className={styles.parishInfo}>
                            <h3 className={styles.parishName}>
                                {localStorage.getItem("selectedParishName") || "Nenhuma paróquia selecionada"}
                            </h3>
                            <Button
                                variant="link"
                                className={styles.changeParishButton}
                                onClick={() => router.push("/selecionar-paroquia")}
                            >
                                Alterar paróquia
                            </Button>
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Configurações</h2>
                    <div className={styles.menuList}>
                        <Button variant="ghost" className={styles.menuItem} onClick={() => router.push("/perfil/notificacoes")}>
                            <Bell className={styles.menuIcon} />
                            <span>Notificações</span>
                        </Button>

                        <Button variant="ghost" className={styles.menuItem} onClick={() => router.push("/perfil/configuracoes")}>
                            <Settings className={styles.menuIcon} />
                            <span>Configurações da conta</span>
                        </Button>
                    </div>
                </div>

                <Button variant="destructive" className={styles.signOutButton} onClick={handleSignOut}>
                    <LogOut className={styles.signOutIcon} />
                    Sair da conta
                </Button>

                <div className={styles.versionContainer}>
                    <VersionBadge />
                </div>
            </div>
            <BottomNav />
        </div>
    )
}
