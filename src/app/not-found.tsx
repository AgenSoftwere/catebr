"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft, Search } from "lucide-react"
import styles from "./not-found.module.css"

export default function NotFoundPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.errorCode}>404</div>
        <h1 className={styles.title}>Página não encontrada</h1>
        <p className={styles.description}>Desculpe, não conseguimos encontrar a página que você está procurando.</p>

        <div className={styles.illustration}>
          <div className={styles.church}>
            <div className={styles.churchBody}></div>
            <div className={styles.churchRoof}></div>
            <div className={styles.churchTower}>
              <div className={styles.churchCross}></div>
            </div>
            <div className={styles.churchDoor}></div>
            <div className={styles.churchWindow}></div>
            <div className={styles.churchWindow}></div>
          </div>
          <div className={styles.shadow}></div>
        </div>

        <div className={styles.suggestions}>
          <p>Você pode tentar:</p>
          <ul>
            <li>Verificar se o endereço foi digitado corretamente</li>
            <li>Retornar à página anterior</li>
            <li>Ir para a página inicial</li>
          </ul>
        </div>

        <div className={styles.actions}>
          <Button variant="outline" onClick={() => window.history.back()} className={styles.button}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Link href="/" passHref>
            <Button className={styles.button}>
              <Home className="mr-2 h-4 w-4" />
              Página Inicial
            </Button>
          </Link>
          <Link href="/leia" passHref>
            <Button variant="outline" className={styles.button}>
              <Search className="mr-2 h-4 w-4" />
              Explorar Conteúdo
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
