"use client"

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Tag, X } from 'lucide-react';
import { usePopularTags } from "@/hooks/use-articles";
import type { ArticleType, ArticleFilter } from "@/types/article";
import styles from "./article-search.module.css";

interface ArticleSearchProps {
  onFilterChange: (filters: ArticleFilter) => void;
  initialFilters?: ArticleFilter;
}

export function ArticleSearch({ onFilterChange, initialFilters = {} }: ArticleSearchProps) {
  const [searchTerm, setSearchTerm] = useState(initialFilters.searchTerm || "");
  const [selectedType, setSelectedType] = useState<ArticleType | undefined>(initialFilters.type as ArticleType | undefined);
  const [selectedTag, setSelectedTag] = useState<string | undefined>(initialFilters.tag);
  const { tags, loading: tagsLoading } = usePopularTags();
  
  useEffect(() => {
    const filters: ArticleFilter = {};
    
    if (searchTerm) {
      filters.searchTerm = searchTerm;
    }
    
    if (selectedType) {
      filters.type = selectedType;
    }
    
    if (selectedTag) {
      filters.tag = selectedTag;
    }
    
    onFilterChange(filters);
  }, [searchTerm, selectedType, selectedTag, onFilterChange]);
  
  const handleTypeChange = (value: string) => {
    if (value === "todos") {
      setSelectedType(undefined);
    } else {
      setSelectedType(value as ArticleType);
    }
  };
  
  const handleTagClick = (tag: string) => {
    setSelectedTag(tag === selectedTag ? undefined : tag);
  };
  
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedType(undefined);
    setSelectedTag(undefined);
  };
  
  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchInputWrapper}>
        <Search className={styles.searchIcon} />
        <Input
          type="text"
          placeholder="Buscar artigos, notícias, reflexões..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchTerm("")}
            className={styles.clearButton}
          >
            <X className={styles.clearIcon} />
          </Button>
        )}
      </div>
      
      <div className={styles.filtersContainer}>
        <Tabs
          defaultValue={selectedType || "todos"}
          value={selectedType || "todos"}
          onValueChange={handleTypeChange}
          className={styles.typeTabs}
        >
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="artigo">Artigos</TabsTrigger>
            <TabsTrigger value="noticia">Notícias</TabsTrigger>
            <TabsTrigger value="reflexao">Reflexões</TabsTrigger>
            <TabsTrigger value="depoimento">Depoimentos</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {(searchTerm || selectedType || selectedTag) && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className={styles.clearFiltersButton}
          >
            <X className={styles.clearFiltersIcon} />
            Limpar filtros
          </Button>
        )}
      </div>
      
      {!tagsLoading && tags.length > 0 && (
        <div className={styles.tagsContainer}>
          <div className={styles.tagsHeader}>
            <Tag className={styles.tagsHeaderIcon} />
            <span>Tags populares:</span>
          </div>
          <div className={styles.tagsList}>
            {tags.map((tagItem) => (
              <Badge
                key={tagItem.tag}
                variant={selectedTag === tagItem.tag ? "default" : "outline"}
                className={`${styles.tagBadge} ${selectedTag === tagItem.tag ? styles.selectedTag : ''}`}
                onClick={() => handleTagClick(tagItem.tag)}
              >
                {tagItem.tag}
                <span className={styles.tagCount}>{tagItem.count}</span>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
