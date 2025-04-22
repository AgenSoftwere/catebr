"use client"

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from 'lucide-react';
import styles from "./article-search.module.css";

export function ArticleSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams?.get("q") || "");
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/leia?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };
  
  const clearSearch = () => {
    setSearchTerm("");
    router.push("/leia");
  };
  
  return (
    <form onSubmit={handleSearch} className={styles.container}>
      <div className={styles.inputContainer}>
        <Search className={styles.searchIcon} />
        <Input
          type="text"
          placeholder="Buscar artigos, notícias, reflexões..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.input}
        />
        {searchTerm && (
          <button 
            type="button" 
            onClick={clearSearch}
            className={styles.clearButton}
            aria-label="Limpar busca"
          >
            <X className={styles.clearIcon} />
          </button>
        )}
      </div>
      <Button type="submit" className={styles.searchButton}>
        Buscar
      </Button>
    </form>
  );
}
