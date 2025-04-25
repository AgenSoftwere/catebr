"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Bell, AlertTriangle, Info } from 'lucide-react'
import { toast } from "sonner"
import styles from "./notificacoes.module.css"
import { 
  saveNotificationPreferences, 
  getNotificationPreferences,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  isPushNotificationSupported,
  isPushNotificationSubscribed
} from "@/services/notification-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function NotificacoesPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [pushSupported, setPushSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subscribing, setSubscribing] = useState(false)
  
  // Preferências de notificações
  interface NotificationPreferences {
    pushEnabled: boolean;
    emailEnabled: boolean;
    notificationTypes: {
      announcements: boolean;
      events: boolean;
      alerts: boolean;
      updates: boolean;
    };
    notificationFrequency: "immediate" | "daily" | "weekly";
  }

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    pushEnabled: false,
    emailEnabled: true,
    notificationTypes: {
      announcements: true,
      events: true,
      alerts: true,
      updates: false,
    },
    notificationFrequency: "immediate", // immediate, daily, weekly
  })

  useEffect(() => {
    const checkPushSupport = async () => {
      const supported = await isPushNotificationSupported()
      setPushSupported(supported)
    }
    
    checkPushSupport()
  }, [])

  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) return
      
      setIsLoading(true)
      try {
        // Carregar preferências do usuário
        const userPrefs = await getNotificationPreferences(user.uid)
        if (userPrefs) {
          setPreferences(userPrefs)
        }
        
        // Verificar se já está inscrito em notificações push
        const subscribed = await isPushNotificationSubscribed()
        setIsSubscribed(subscribed)
      } catch (error) {
        console.error("Erro ao carregar preferências:", error)
        toast.error("Não foi possível carregar suas preferências")
      } finally {
        setIsLoading(false)
      }
    }
    
    if (user) {
      loadPreferences()
    }
  }, [user])

  const handleSavePreferences = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      await saveNotificationPreferences(user.uid, preferences)
      toast.success("Preferências salvas com sucesso")
    } catch (error) {
      console.error("Erro ao salvar preferências:", error)
      toast.error("Erro ao salvar preferências")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePushToggle = async (enabled: boolean) => {
    if (!user) return
    
    setSubscribing(true)
    try {
      if (enabled) {
        // Solicitar permissão e inscrever
        const success = await subscribeToPushNotifications(user.uid)
        if (success) {
          setIsSubscribed(true)
          setPreferences(prev => ({ ...prev, pushEnabled: true }))
          toast.success("Notificações push ativadas com sucesso")
        } else {
          toast.error("Não foi possível ativar as notificações push")
          return
        }
      } else {
        // Cancelar inscrição
        await unsubscribeFromPushNotifications(user.uid)
        setIsSubscribed(false)
        setPreferences(prev => ({ ...prev, pushEnabled: false }))
        toast.success("Notificações push desativadas")
      }
      
      // Salvar preferência no banco de dados
      await saveNotificationPreferences(user.uid, {
        ...preferences,
        pushEnabled: enabled
      })
    } catch (error) {
      console.error("Erro ao configurar notificações push:", error)
      toast.error("Erro ao configurar notificações push")
    } finally {
      setSubscribing(false)
    }
  }

  const handleTypeToggle = (type: keyof typeof preferences.notificationTypes) => {
    setPreferences(prev => ({
      ...prev,
      notificationTypes: {
        ...prev.notificationTypes,
        [type]: !prev.notificationTypes[type]
      }
    }))
  }

  const handleFrequencyChange = (frequency: "immediate" | "daily" | "weekly") => {
    setPreferences(prev => ({
      ...prev,
      notificationFrequency: frequency
    }))
  }

  if (loading || isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Carregando preferências...</p>
      </div>
    )
  }

  if (!user) {
    router.push("/auth/o/login")
    return null
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button 
          variant="ghost" 
          className={styles.backButton} 
          onClick={() => router.push("/perfil")}
        >
          <ArrowLeft className={styles.backIcon} />
        </Button>
        <h1 className={styles.title}>Preferências de Notificações</h1>
      </div>

      <div className={styles.content}>
        {!pushSupported && (
          <Alert variant="destructive" className={styles.alert}>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Notificações não suportadas</AlertTitle>
            <AlertDescription>
              Seu navegador não suporta notificações push. Para receber notificações, use um navegador moderno como Chrome, Firefox, Edge ou Safari.
            </AlertDescription>
          </Alert>
        )}

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Canais de Notificação</h2>
          
          <div className={styles.preferenceItem}>
            <div className={styles.preferenceInfo}>
              <Bell className={styles.preferenceIcon} />
              <div>
                <Label htmlFor="push-toggle" className={styles.preferenceLabel}>
                  Notificações Push
                </Label>
                <p className={styles.preferenceDescription}>
                  Receba notificações mesmo quando não estiver usando o aplicativo
                </p>
              </div>
            </div>
            <Switch
              id="push-toggle"
              checked={preferences.pushEnabled && isSubscribed}
              onCheckedChange={handlePushToggle}
              disabled={!pushSupported || subscribing}
              className={styles.switch}
            />
          </div>

          <div className={styles.preferenceItem}>
            <div className={styles.preferenceInfo}>
              <Info className={styles.preferenceIcon} />
              <div>
                <Label htmlFor="email-toggle" className={styles.preferenceLabel}>
                  Notificações por Email
                </Label>
                <p className={styles.preferenceDescription}>
                  Receba atualizações importantes por email
                </p>
              </div>
            </div>
            <Switch
              id="email-toggle"
              checked={preferences.emailEnabled}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({ ...prev, emailEnabled: checked }))
              }
              className={styles.switch}
            />
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Tipos de Notificação</h2>
          
          <div className={styles.preferenceItem}>
            <div className={styles.preferenceInfo}>
              <Label htmlFor="announcements-toggle" className={styles.preferenceLabel}>
                Comunicados
              </Label>
            </div>
            <Switch
              id="announcements-toggle"
              checked={preferences.notificationTypes.announcements}
              onCheckedChange={() => handleTypeToggle("announcements")}
              className={styles.switch}
            />
          </div>

          <div className={styles.preferenceItem}>
            <div className={styles.preferenceInfo}>
              <Label htmlFor="events-toggle" className={styles.preferenceLabel}>
                Eventos
              </Label>
            </div>
            <Switch
              id="events-toggle"
              checked={preferences.notificationTypes.events}
              onCheckedChange={() => handleTypeToggle("events")}
              className={styles.switch}
            />
          </div>

          <div className={styles.preferenceItem}>
            <div className={styles.preferenceInfo}>
              <Label htmlFor="alerts-toggle" className={styles.preferenceLabel}>
                Alertas
              </Label>
            </div>
            <Switch
              id="alerts-toggle"
              checked={preferences.notificationTypes.alerts}
              onCheckedChange={() => handleTypeToggle("alerts")}
              className={styles.switch}
            />
          </div>

          <div className={styles.preferenceItem}>
            <div className={styles.preferenceInfo}>
              <Label htmlFor="updates-toggle" className={styles.preferenceLabel}>
                Atualizações do Sistema
              </Label>
            </div>
            <Switch
              id="updates-toggle"
              checked={preferences.notificationTypes.updates}
              onCheckedChange={() => handleTypeToggle("updates")}
              className={styles.switch}
            />
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Frequência</h2>
          
          <div className={styles.radioGroup}>
            <div className={styles.radioOption}>
              <input
                type="radio"
                id="immediate"
                name="frequency"
                value="immediate"
                checked={preferences.notificationFrequency === "immediate"}
                onChange={() => handleFrequencyChange("immediate")}
                className={styles.radioInput}
              />
              <Label htmlFor="immediate" className={styles.radioLabel}>
                Imediata
              </Label>
            </div>
            
            <div className={styles.radioOption}>
              <input
                type="radio"
                id="daily"
                name="frequency"
                value="daily"
                checked={preferences.notificationFrequency === "daily"}
                onChange={() => handleFrequencyChange("daily")}
                className={styles.radioInput}
              />
              <Label htmlFor="daily" className={styles.radioLabel}>
                Resumo Diário
              </Label>
            </div>
            
            <div className={styles.radioOption}>
              <input
                type="radio"
                id="weekly"
                name="frequency"
                value="weekly"
                checked={preferences.notificationFrequency === "weekly"}
                onChange={() => handleFrequencyChange("weekly")}
                className={styles.radioInput}
              />
              <Label htmlFor="weekly" className={styles.radioLabel}>
                Resumo Semanal
              </Label>
            </div>
          </div>
        </section>

        <div className={styles.actions}>
          <Button 
            variant="outline" 
            onClick={() => router.push("/perfil")}
            className={styles.cancelButton}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSavePreferences}
            disabled={isLoading}
            className={styles.saveButton}
          >
            Salvar Preferências
          </Button>
        </div>
      </div>
    </div>
  )
}
