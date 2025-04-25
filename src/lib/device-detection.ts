interface DeviceInfo {
    type: "mobile" | "desktop" | "tablet"
    os: string
    browser: string
    supportsPWA: boolean
  }
  
  export function detectDevice(): DeviceInfo {
    if (typeof window === "undefined") {
      return {
        type: "desktop",
        os: "Unknown",
        browser: "Unknown",
        supportsPWA: false,
      }
    }
  
    const userAgent: string = navigator.userAgent || navigator.vendor || ((window as unknown) as { opera: string }).opera || ""

    // Detectar tipo de dispositivo
    let type: "mobile" | "desktop" | "tablet" = "desktop"
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
      type = "tablet"
    } else if (
      /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
        userAgent,
      )
    ) {
      type = "mobile"
    }

    // Detectar sistema operacional
    let os: string = "Unknown"
    if (/windows phone/i.test(userAgent)) {
      os = "Windows Phone"
    } else if (/android/i.test(userAgent)) {
      os = "Android"
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !(window as unknown as { MSStream: boolean }).MSStream) {
      os = "iOS"
    } else if (/Mac/i.test(userAgent)) {
      os = "macOS"
    } else if (/Win/i.test(userAgent)) {
      os = "Windows"
    } else if (/Linux/i.test(userAgent)) {
      os = "Linux"
    }

    // Detectar navegador
    let browser: string = "Unknown"
    if (/CriOS/i.test(userAgent)) {
      browser = "Chrome iOS"
    } else if (/FxiOS/i.test(userAgent)) {
      browser = "Firefox iOS"
    } else if (/EdgiOS/i.test(userAgent)) {
      browser = "Edge iOS"
    } else if (/Opera|OPR/.test(userAgent)) {
      browser = "Opera"
    } else if (/Edge/i.test(userAgent)) {
      browser = "Edge"
    } else if (/Firefox/i.test(userAgent)) {
      browser = "Firefox"
    } else if (/Chrome/i.test(userAgent)) {
      browser = "Chrome"
    } else if (/Safari/i.test(userAgent)) {
      browser = "Safari"
    } else if (/MSIE|Trident/.test(userAgent)) {
      browser = "Internet Explorer"
    }

    // Verificar suporte a PWA
    let supportsPWA: boolean = false

    // Chrome, Edge, Opera em Android ou desktop
    if (
      (/Chrome|Edge|Opera/i.test(userAgent) &&
        !/Edge?iOS|CriOS|OPiOS/i.test(userAgent) &&
        !/SamsungBrowser/i.test(userAgent)) ||
      /SamsungBrowser/i.test(userAgent) // Samsung Internet
    ) {
      supportsPWA = true
    }

    // Safari no iOS 11.3+
    if (/Safari/i.test(userAgent) && /Apple/i.test(navigator.vendor) && !(window as unknown as { MSStream: boolean }).MSStream) {
      const iOSVersion: RegExpMatchArray | null = navigator.userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/)
      if (iOSVersion && Number.parseInt(iOSVersion[1], 10) >= 11 && Number.parseInt(iOSVersion[2], 10) >= 3) {
        supportsPWA = true
      }
    }

      return {
        type,
        os,
        browser,
        supportsPWA,
      }
    }
