"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2, Facebook, Twitter, Linkedin, Copy, Check, PhoneIcon as WhatsApp } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import styles from "./article-share.module.css"

interface ArticleShareProps {
  title: string
  url: string
}

export function ArticleShare({ title, url }: ArticleShareProps) {
  const [copied, setCopied] = useState(false)
  
  const shareUrl = typeof window !== "undefined" ? url : ""
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    toast.success("Link copiado para a área de transferência")
    
    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }
  
  const handleShare = (platform: string) => {
    let shareLink = ""
    
    switch (platform) {
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        break
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`
        break
      case "linkedin":
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
        break
      case "whatsapp":
        shareLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(title + " " + shareUrl)}`
        break
    }
    
    if (shareLink) {
      window.open(shareLink, "_blank")
    }
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className={styles.shareButton}>
          <Share2 className={styles.shareIcon} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleShare("facebook")} className={styles.shareMenuItem}>
          <Facebook className={styles.platformIcon} />
          <span>Compartilhar no Facebook</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare("twitter")} className={styles.shareMenuItem}>
          <Twitter className={styles.platformIcon} />
          <span>Compartilhar no Twitter</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare("linkedin")} className={styles.shareMenuItem}>
          <Linkedin className={styles.platformIcon} />
          <span>Compartilhar no LinkedIn</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare("whatsapp")} className={styles.shareMenuItem}>
          <WhatsApp className={styles.platformIcon} />
          <span>Compartilhar no WhatsApp</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink} className={styles.shareMenuItem}>
          {copied ? (
            <Check className={styles.platformIcon} />
          ) : (
            <Copy className={styles.platformIcon} />
          )}
          <span>{copied ? "Link copiado!" : "Copiar link"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
