import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Users, FileText, BarChart3, Settings, Command } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: "client" | "campaign" | "report" | "setting";
  url: string;
  icon: React.ElementType;
}

const mockResults: SearchResult[] = [
  {
    id: "1",
    title: "Maria Silva",
    description: "Cliente VIP • Último pedido: ontem",
    type: "client",
    url: "/clients",
    icon: Users
  },
  {
    id: "2", 
    title: "Happy Hour Especial",
    description: "Campanha ativa • 198 aberturas",
    type: "campaign",
    url: "/campaigns",
    icon: FileText
  },
  {
    id: "3",
    title: "Relatório de Vendas",
    description: "Último mês • R$ 28.500 em vendas",
    type: "report", 
    url: "/reports",
    icon: BarChart3
  },
  {
    id: "4",
    title: "Configurações WhatsApp",
    description: "Integração e automações",
    type: "setting",
    url: "/settings",
    icon: Settings
  }
];

interface GlobalSearchProps {
  className?: string;
}

export function GlobalSearch({ className }: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      
      if (e.key === "Escape") {
        setIsOpen(false);
        setQuery("");
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle search results
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIndex(-1);
      return;
    }

    const filtered = mockResults.filter(result =>
      result.title.toLowerCase().includes(query.toLowerCase()) ||
      result.description.toLowerCase().includes(query.toLowerCase())
    );

    setResults(filtered);
    setSelectedIndex(-1);
  }, [query]);

  // Handle keyboard navigation in results
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || results.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < results.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : results.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    setIsOpen(false);
    setQuery("");
    setSelectedIndex(-1);
  };

  const getTypeColor = (type: SearchResult["type"]) => {
    switch (type) {
      case "client": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "campaign": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "report": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "setting": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getTypeName = (type: SearchResult["type"]) => {
    switch (type) {
      case "client": return "Cliente";
      case "campaign": return "Campanha";
      case "report": return "Relatório";
      case "setting": return "Configuração";
      default: return "Item";
    }
  };

  return (
    <>
      {/* Search Trigger */}
      <div className={cn("relative", className)}>
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar clientes, campanhas..."
          className="pl-10 bg-muted/50 border-0 cursor-pointer"
          onClick={() => setIsOpen(true)}
          readOnly
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <Badge variant="outline" className="text-xs">
            <Command className="h-3 w-3 mr-1" />
            K
          </Badge>
        </div>
      </div>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed left-[50%] top-[20%] translate-x-[-50%] w-full max-w-2xl">
            <Card className="border-2">
              <CardContent className="p-0">
                <div className="relative">
                  <Search className="absolute left-4 top-4 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar em tudo..."
                    className="border-0 pl-12 pr-4 py-4 text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                    autoFocus
                  />
                </div>

                {/* Results */}
                {results.length > 0 && (
                  <div 
                    ref={resultsRef}
                    className="border-t max-h-80 overflow-y-auto"
                  >
                    {results.map((result, index) => {
                      const Icon = result.icon;
                      return (
                        <div
                          key={result.id}
                          className={cn(
                            "flex items-center gap-3 p-4 hover:bg-muted cursor-pointer transition-colors",
                            selectedIndex === index && "bg-muted"
                          )}
                          onClick={() => handleResultClick(result)}
                        >
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-foreground truncate">
                                {result.title}
                              </h4>
                              <Badge 
                                variant="secondary" 
                                className={cn("text-xs", getTypeColor(result.type))}
                              >
                                {getTypeName(result.type)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {result.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Empty State */}
                {query && results.length === 0 && (
                  <div className="border-t p-8 text-center">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Nenhum resultado encontrado
                    </h3>
                    <p className="text-muted-foreground">
                      Tente buscar com outros termos
                    </p>
                  </div>
                )}

                {/* Footer */}
                <div className="border-t px-4 py-3 bg-muted/30">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">↑↓</Badge>
                        <span>navegar</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">Enter</Badge>
                        <span>selecionar</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs">Esc</Badge>
                      <span>fechar</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}