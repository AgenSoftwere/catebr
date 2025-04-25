"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { usePWA } from "@/hooks/use-pwa"
import { detectDevice } from "@/lib/device-detection"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Smartphone, Laptop, Download, Check, X, ChevronDown, Info, HelpCircle, ArrowLeft, Share2, Chrome, ChromeIcon as Firefox, Globe, Apple, WifiOff, Bell, Zap, HardDrive, SmartphoneIcon as AndroidIcon } from 'lucide-react'
import Image from "next/image"
import Link from "next/link"
import styles from "./instalador.module.css"

// Definir o componente Android
const Android = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 16V8c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" />
      <path d="M12 6v12" />
    </svg>
  )
}

export default function InstaladorPage() {
  const { isInstalled, isOnline, canInstall, promptInstall } = usePWA()
  const [device, setDevice] = useState<ReturnType<typeof detectDevice> | null>(null)
  const [showInstructions, setShowInstructions] = useState<string | null>(null)

  useEffect(() => {
    setDevice(detectDevice())
  }, [])

  const handleInstall = async () => {
    const success = await promptInstall()
    if (success) {
      // Atualizar a UI após instalação bem-sucedida
      window.location.reload()
    }
  }

  const toggleInstructions = (platform: string) => {
    setShowInstructions(showInstructions === platform ? null : platform)
  }

  // Determinar compatibilidade
  const isCompatible = device?.supportsPWA || false
  const compatibilityMessage = isCompatible
    ? "Seu dispositivo é compatível com o aplicativo"
    : "Seu dispositivo tem compatibilidade limitada"

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft className={styles.backIcon} />
          <span>Voltar</span>
        </Link>
        <h1 className={styles.title}>Instalar Aplicativo</h1>
      </div>

      <div className={styles.content}>
        <div className={styles.appPreview}>
          <div className={styles.appIconContainer}>
            <Image
              src="/icons/icon-512x512.png"
              alt="Cate - Módulo Paroquial"
              width={120}
              height={120}
              className={styles.appIcon}
            />
          </div>
          <div className={styles.appInfo}>
            <h2 className={styles.appName}>Cate - Módulo Paroquial</h2>
            <p className={styles.appDescription}>Plataforma para fiéis e paróquias</p>
            <div className={styles.appMeta}>
              <Badge variant="outline" className={styles.versionBadge}>
                Versão 1.0.0
              </Badge>
              <Badge
                variant={isCompatible ? "outline" : "destructive"}
                className={isCompatible ? styles.compatibleBadge : styles.incompatibleBadge}
              >
                {isCompatible ? (
                  <>
                    <Check className={styles.badgeIcon} /> Compatível
                  </>
                ) : (
                  <>
                    <X className={styles.badgeIcon} /> Compatibilidade limitada
                  </>
                )}
              </Badge>
            </div>
          </div>
        </div>

        <div className={styles.deviceInfo}>
          <div className={styles.deviceCard}>
            <div className={styles.deviceIconContainer}>
              {device?.type === "mobile" ? (
                <Smartphone className={styles.deviceIcon} />
              ) : (
                <Laptop className={styles.deviceIcon} />
              )}
            </div>
            <div className={styles.deviceDetails}>
              <h3 className={styles.deviceType}>
                {device?.type === "mobile" ? "Dispositivo Móvel" : "Computador"}
              </h3>
              <p className={styles.deviceName}>
                {device?.os} • {device?.browser}
              </p>
              <p className={styles.compatibilityMessage}>
                <Info className={styles.infoIcon} />
                {compatibilityMessage}
              </p>
            </div>
          </div>
        </div>

        <div className={styles.installSection}>
          {isInstalled ? (
            <div className={styles.installedMessage}>
              <Check className={styles.installedIcon} />
              <p>O aplicativo já está instalado no seu dispositivo</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Abrir aplicativo
              </Button>
            </div>
          ) : (
            <>
              {canInstall ? (
                <Button onClick={handleInstall} className={styles.installButton}>
                  <Download className={styles.buttonIcon} />
                  Instalar aplicativo
                </Button>
              ) : (
                <div className={styles.manualInstallContainer}>
                  <p className={styles.manualInstallText}>
                    Instalação automática não disponível neste navegador. Siga as instruções abaixo para instalar
                    manualmente:
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <Tabs defaultValue="mobile" className={styles.tabs}>
          <TabsList className={styles.tabsList}>
            <TabsTrigger value="mobile" className={styles.tabsTrigger}>
              <Smartphone className={styles.tabIcon} />
              Dispositivos Móveis
            </TabsTrigger>
            <TabsTrigger value="desktop" className={styles.tabsTrigger}>
              <Laptop className={styles.tabIcon} />
              Computadores
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mobile" className={styles.tabsContent}>
            <div className={styles.platformList}>
              <div className={styles.platformItem}>
                <div
                  className={styles.platformHeader}
                  onClick={() => toggleInstructions("android")}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.platformInfo}>
                    <div className={styles.platformIconContainer}>
                      <Android className={styles.platformIcon} />
                    </div>
                    <div className={styles.platformDetails}>
                      <h3 className={styles.platformName}>Android</h3>
                      <p className={styles.platformSupport}>Suporte completo</p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`${styles.chevronIcon} ${showInstructions === "android" ? styles.chevronOpen : ""}`}
                  />
                </div>
                {showInstructions === "android" && (
                  <div className={styles.instructionsContainer}>
                    <div className={styles.instructionStep}>
                      <div className={styles.stepNumber}>1</div>
                      <div className={styles.stepContent}>
                        <p className={styles.stepText}>Abra o site no Chrome ou Samsung Internet</p>
                      </div>
                    </div>
                    <div className={styles.instructionStep}>
                      <div className={styles.stepNumber}>2</div>
                      <div className={styles.stepContent}>
                        <p className={styles.stepText}>Toque no menu (três pontos) no canto superior direito</p>
                      </div>
                    </div>
                    <div className={styles.instructionStep}>
                      <div className={styles.stepNumber}>3</div>
                      <div className={styles.stepContent}>
                        <p className={styles.stepText}>Selecione &quot;Adicionar à tela inicial&quot; ou &quot;Instalar aplicativo&quot;</p>
                      </div>
                    </div>
                    <div className={styles.instructionStep}>
                      <div className={styles.stepNumber}>4</div>
                      <div className={styles.stepContent}>
                        <p className={styles.stepText}>Confirme a instalação</p>
                      </div>
                    </div>
                    <div className={styles.instructionImages}>
                      <Image
                        src="/instalador/android-install-1.png"
                        alt="Passo 1"
                        width={120}
                        height={240}
                        className={styles.instructionImage}
                      />
                      <Image
                        src="/instalador/android-install-2.png"
                        alt="Passo 2"
                        width={120}
                        height={240}
                        className={styles.instructionImage}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.platformItem}>
                <div
                  className={styles.platformHeader}
                  onClick={() => toggleInstructions("ios")}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.platformInfo}>
                    <div className={styles.platformIconContainer}>
                      <Apple className={styles.platformIcon} />
                    </div>
                    <div className={styles.platformDetails}>
                      <h3 className={styles.platformName}>iOS (iPhone e iPad)</h3>
                      <p className={styles.platformSupport}>Suporte completo no Safari</p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`${styles.chevronIcon} ${showInstructions === "ios" ? styles.chevronOpen : ""}`}
                  />
                </div>
                {showInstructions === "ios" && (
                  <div className={styles.instructionsContainer}>
                    <div className={styles.instructionStep}>
                      <div className={styles.stepNumber}>1</div>
                      <div className={styles.stepContent}>
                        <p className={styles.stepText}>Abra o site no Safari (outros navegadores não são suportados)</p>
                      </div>
                    </div>
                    <div className={styles.instructionStep}>
                      <div className={styles.stepNumber}>2</div>
                      <div className={styles.stepContent}>
                        <p className={styles.stepText}>Toque no botão de compartilhamento</p>
                        <Share2 className={styles.stepIcon} />
                      </div>
                    </div>
                    <div className={styles.instructionStep}>
                      <div className={styles.stepNumber}>3</div>
                      <div className={styles.stepContent}>
                        <p className={styles.stepText}>Role para baixo e toque em &quot;Adicionar à Tela de Início&quot;</p>
                      </div>
                    </div>
                    <div className={styles.instructionStep}>
                      <div className={styles.stepNumber}>4</div>
                      <div className={styles.stepContent}>
                        <p className={styles.stepText}>Toque em &quot;Adicionar&quot; no canto superior direito</p>
                      </div>
                    </div>
                    <div className={styles.instructionImages}>
                      <Image
                        src="/instalador/ios-install-1.png"
                        alt="Passo 1"
                        width={120}
                        height={240}
                        className={styles.instructionImage}
                      />
                      <Image
                        src="/instalador/ios-install-2.png"
                        alt="Passo 2"
                        width={120}
                        height={240}
                        className={styles.instructionImage}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="desktop" className={styles.tabsContent}>
            <div className={styles.platformList}>
              <div className={styles.platformItem}>
                <div
                  className={styles.platformHeader}
                  onClick={() => toggleInstructions("chrome")}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.platformInfo}>
                    <div className={styles.platformIconContainer}>
                      <Chrome className={styles.platformIcon} />
                    </div>
                    <div className={styles.platformDetails}>
                      <h3 className={styles.platformName}>Google Chrome</h3>
                      <p className={styles.platformSupport}>Suporte completo</p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`${styles.chevronIcon} ${showInstructions === "chrome" ? styles.chevronOpen : ""}`}
                  />
                </div>
                {showInstructions === "chrome" && (
                  <div className={styles.instructionsContainer}>
                    <div className={styles.instructionStep}>
                      <div className={styles.stepNumber}>1</div>
                      <div className={styles.stepContent}>
                        <p className={styles.stepText}>Clique no ícone de instalação na barra de endereço</p>
                      </div>
                    </div>
                    <div className={styles.instructionStep}>
                      <div className={styles.stepNumber}>2</div>
                      <div className={styles.stepContent}>
                        <p className={styles.stepText}>
                          Ou clique no menu (três pontos) no canto superior direito e selecione &quot;Instalar Cate - Módulo
                          Paroquial&quot;
                        </p>
                      </div>
                    </div>
                    <div className={styles.instructionImages}>
                      <Image
                        src="/instalador/chrome-install.png"
                        alt="Instalação no Chrome"
                        width={300}
                        height={200}
                        className={styles.instructionImage}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.platformItem}>
                <div
                  className={styles.platformHeader}
                  onClick={() => toggleInstructions("edge")}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.platformInfo}>
                    <div className={styles.platformIconContainer}>
                      <Globe className={styles.platformIcon} />
                    </div>
                    <div className={styles.platformDetails}>
                      <h3 className={styles.platformName}>Microsoft Edge</h3>
                      <p className={styles.platformSupport}>Suporte completo</p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`${styles.chevronIcon} ${showInstructions === "edge" ? styles.chevronOpen : ""}`}
                  />
                </div>
                {showInstructions === "edge" && (
                  <div className={styles.instructionsContainer}>
                    <div className={styles.instructionStep}>
                      <div className={styles.stepNumber}>1</div>
                      <div className={styles.stepContent}>
                        <p className={styles.stepText}>Clique no ícone de instalação na barra de endereço</p>
                      </div>
                    </div>
                    <div className={styles.instructionStep}>
                      <div className={styles.stepNumber}>2</div>
                      <div className={styles.stepContent}>
                        <p className={styles.stepText}>
                          Ou clique no menu (três pontos) no canto superior direito e selecione &quot;Aplicativos&quot; e depois
                          &quot;Instalar este site como um aplicativo&quot;
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.platformItem}>
                <div
                  className={styles.platformHeader}
                  onClick={() => toggleInstructions("firefox")}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.platformInfo}>
                    <div className={styles.platformIconContainer}>
                      <Firefox className={styles.platformIcon} />
                    </div>
                    <div className={styles.platformDetails}>
                      <h3 className={styles.platformName}>Mozilla Firefox</h3>
                      <p className={styles.platformSupport}>Suporte parcial</p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`${styles.chevronIcon} ${showInstructions === "firefox" ? styles.chevronOpen : ""}`}
                  />
                </div>
                {showInstructions === "firefox" && (
                  <div className={styles.instructionsContainer}>
                    <div className={styles.instructionStep}>
                      <div className={styles.stepNumber}>1</div>
                      <div className={styles.stepContent}>
                        <p className={styles.stepText}>
                          O Firefox tem suporte limitado para PWAs. Você pode usar o aplicativo no navegador, mas a
                          instalação como aplicativo não é suportada nativamente.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className={styles.requirementsSection}>
          <h3 className={styles.requirementsTitle}>
            <HelpCircle className={styles.requirementsIcon} />
            Requisitos do Sistema
          </h3>
          <div className={styles.requirementsList}>
            <div className={styles.requirementItem}>
              <h4 className={styles.requirementName}>Android</h4>
              <p className={styles.requirementDetails}>Android 5.0+ com Chrome 76+ ou Samsung Internet</p>
            </div>
            <div className={styles.requirementItem}>
              <h4 className={styles.requirementName}>iOS</h4>
              <p className={styles.requirementDetails}>iOS 12.2+ com Safari</p>
            </div>
            <div className={styles.requirementItem}>
              <h4 className={styles.requirementName}>Windows</h4>
              <p className={styles.requirementDetails}>Windows 10+ com Chrome 76+, Edge 79+ ou Opera</p>
            </div>
            <div className={styles.requirementItem}>
              <h4 className={styles.requirementName}>macOS</h4>
              <p className={styles.requirementDetails}>macOS 10.13+ com Chrome 76+, Edge 79+ ou Safari 13+</p>
            </div>
            <div className={styles.requirementItem}>
              <h4 className={styles.requirementName}>Linux</h4>
              <p className={styles.requirementDetails}>Qualquer distribuição recente com Chrome 76+ ou Edge 79+</p>
            </div>
          </div>
        </div>

        <div className={styles.benefitsSection}>
          <h3 className={styles.benefitsTitle}>Benefícios do Aplicativo</h3>
          <div className={styles.benefitsList}>
            <div className={styles.benefitItem}>
              <div className={styles.benefitIconContainer}>
                <WifiOff className={styles.benefitIcon} />
              </div>
              <div className={styles.benefitContent}>
                <h4 className={styles.benefitName}>Acesso Offline</h4>
                <p className={styles.benefitDescription}>
                  Acesse comunicados e conteúdos mesmo sem conexão com a internet
                </p>
              </div>
            </div>
            <div className={styles.benefitItem}>
              <div className={styles.benefitIconContainer}>
                <Bell className={styles.benefitIcon} />
              </div>
              <div className={styles.benefitContent}>
                <h4 className={styles.benefitName}>Notificações</h4>
                <p className={styles.benefitDescription}>
                  Receba notificações de novos comunicados e eventos da sua paróquia
                </p>
              </div>
            </div>
            <div className={styles.benefitItem}>
              <div className={styles.benefitIconContainer}>
                <Zap className={styles.benefitIcon} />
              </div>
              <div className={styles.benefitContent}>
                <h4 className={styles.benefitName}>Melhor Desempenho</h4>
                <p className={styles.benefitDescription}>
                  Experiência mais rápida e fluida comparada ao acesso pelo navegador
                </p>
              </div>
            </div>
            <div className={styles.benefitItem}>
              <div className={styles.benefitIconContainer}>
                <HardDrive className={styles.benefitIcon} />
              </div>
              <div className={styles.benefitContent}>
                <h4 className={styles.benefitName}>Economia de Espaço</h4>
                <p className={styles.benefitDescription}>
                  Ocupa menos espaço que aplicativos tradicionais instalados via loja
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
