import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LogIn, UserPlus, Church } from 'lucide-react'
import styles from "./page.module.css"
import { VersionBadge } from "@/components/version-badge"

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.logoContainer}>
          <h1 className={styles.logo}>Cate</h1>
          <p className={styles.subtitle}>Módulo Paroquial</p>
        </div>
        
        <div className={styles.description}>
          <p>Bem-vindo à plataforma que conecta fiéis e paróquias de forma simples e segura.</p>
        </div>
        
        <div className={styles.buttonContainer}>
          <Link href="/auth/o/login" className={styles.buttonLink}>
            <Button className={styles.button} size="lg">
              <LogIn className="mr-2 h-5 w-5" />
              Entrar como Fiel
            </Button>
          </Link>
          
          <Link href="/auth/o/register" className={styles.buttonLink}>
            <Button variant="outline" className={styles.button} size="lg">
              <UserPlus className="mr-2 h-5 w-5" />
              Cadastrar como Fiel
            </Button>
          </Link>
          
          <div className={styles.divider}>
            <span>ou</span>
          </div>
          
          <Link href="/auth/p/login" className={styles.buttonLink}>
            <Button variant="secondary" className={styles.button} size="lg">
              <Church className="mr-2 h-5 w-5" />
              Acesso para Paróquias
            </Button>
          </Link>
        </div>
        
        <VersionBadge />
      </div>
    </div>
  )
}
