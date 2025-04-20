import styles from "./version-badge.module.css"

export function VersionBadge() {
  return (
    <div className={styles.badge}>
      <span className={styles.version}>Versão 1.0.0 Alpha</span>
      <span className={styles.testMode}>Modo de Teste</span>
    </div>
  )
}
