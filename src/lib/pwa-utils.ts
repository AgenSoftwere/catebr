// Verificar se o aplicativo está sendo executado como PWA instalado
export function isInstalledPWA(): boolean {
    if (typeof window === "undefined") return false
  
    interface NavigatorWithStandalone extends Navigator {
      standalone?: boolean;
    }
    return window.matchMedia("(display-mode: standalone)").matches || (window.navigator as NavigatorWithStandalone).standalone === true
  }
  
  // Verificar se o dispositivo está online
  export function isOnline(): boolean {
    if (typeof navigator === "undefined") return true
    return navigator.onLine
  }
  
  // Verificar se o aplicativo pode ser instalado
  export async function canInstallPWA(): Promise<boolean> {
    if (typeof window === "undefined") return false
  
    // Se já estiver instalado, retorna falso
    if (isInstalledPWA()) return false
  
    // Verificar se o navegador suporta PWA
    const supportsServiceWorker = "serviceWorker" in navigator
    const supportsBeforeInstallPrompt = "BeforeInstallPromptEvent" in window
  
    return supportsServiceWorker && supportsBeforeInstallPrompt
  }
  
  // Armazenar dados no cache local para uso offline
  export function storeDataForOffline<T>(key: string, data: T): void {
    if (typeof window === "undefined") return
  
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error("Erro ao armazenar dados offline:", error)
    }
  }
  
  // Recuperar dados do cache local
  export function getOfflineData<T>(key: string): T | null {
    if (typeof window === "undefined") return null
  
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error("Erro ao recuperar dados offline:", error)
      return null
    }
  }
  
  // Registrar para sincronização em segundo plano
  export async function registerBackgroundSync(tag: string): Promise<boolean> {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("SyncManager" in window)) {
      return false
    }
  
    try {
      const registration = await navigator.serviceWorker.ready
      await registration.sync.register(tag)
      return true
    } catch (error) {
      console.error("Erro ao registrar sincronização em segundo plano:", error)
      return false
    }
  }
  
  // Solicitar permissão para notificações push
  export async function requestNotificationPermission(): Promise<boolean> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return false
    }
  
    try {
      const permission = await Notification.requestPermission()
      return permission === "granted"
    } catch (error) {
      console.error("Erro ao solicitar permissão para notificações:", error)
      return false
    }
  }
  