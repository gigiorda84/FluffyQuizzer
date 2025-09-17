import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Edit, Trash2, Download, Upload, Plus, Search, ArrowLeft } from "lucide-react";

interface Card {
  id: string;
  categoria: string;
  colore: string;
  domanda: string;
  opzioneA?: string;
  opzioneB?: string;
  opzioneC?: string;
  corretta?: 'A' | 'B' | 'C';
  battuta?: string;
  tipo: 'quiz' | 'speciale';
}

interface CmsTableProps {
  cards: Card[];
  onEdit: (card: Card) => void;
  onDelete: (cardId: string) => void;
  onAdd: () => void;
  onUpload: () => void;
  onExport: () => void;
  onLogout: () => void;
  onAnalytics?: () => void;
}

export default function CmsTable({ 
  cards, onEdit, onDelete, onAdd, onUpload, onExport, onLogout, onAnalytics 
}: CmsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const categories = Array.from(new Set(cards.map(card => card.categoria)));
  
  const filteredCards = cards.filter(card => {
    const matchesSearch = card.domanda.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || card.categoria === categoryFilter;
    const matchesType = typeFilter === "all" || card.tipo === typeFilter;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const getCategoryBadgeColor = (color: string) => {
    switch (color.toLowerCase()) {
      case 'verde': return 'bg-fluffy-verde text-white';
      case 'blu': return 'bg-fluffy-blu text-white';
      case 'arancione': return 'bg-fluffy-arancione text-white';
      case 'viola': return 'bg-fluffy-viola text-white';
      default: return 'bg-fluffy-speciale text-white';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">Admin CMS</h1>
            <p className="text-muted-foreground">Gestisci le carte del trivia</p>
          </div>
          <Button variant="outline" onClick={onLogout} data-testid="button-logout">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Esci
          </Button>
        </div>

        {/* Actions Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-2">
                <Button onClick={onAdd} data-testid="button-add-card">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuova Carta
                </Button>
                <Button variant="outline" onClick={onUpload} data-testid="button-upload-csv">
                  <Upload className="w-4 h-4 mr-2" />
                  Carica CSV
                </Button>
                <Button variant="outline" onClick={onExport} data-testid="button-export-csv">
                  <Download className="w-4 h-4 mr-2" />
                  Esporta CSV
                </Button>
                {onAnalytics && (
                  <Button variant="outline" onClick={onAnalytics} data-testid="button-analytics">
                    📊 Analytics
                  </Button>
                )}
              </div>
              
              <div className="text-sm text-muted-foreground">
                {filteredCards.length} di {cards.length} carte
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cerca per domanda o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte le categorie</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger data-testid="select-type">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i tipi</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="speciale">Speciale</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("all");
                  setTypeFilter("all");
                }}
                data-testid="button-clear-filters"
              >
                Pulisci filtri
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Carte ({filteredCards.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Domanda</TableHead>
                    <TableHead>Risposte</TableHead>
                    <TableHead>Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCards.map((card) => (
                    <TableRow key={card.id}>
                      <TableCell className="font-mono">{card.id}</TableCell>
                      <TableCell>
                        <Badge className={getCategoryBadgeColor(card.colore)}>
                          {card.categoria}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={card.tipo === 'quiz' ? 'default' : 'secondary'}>
                          {card.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate" title={card.domanda}>
                        {card.domanda}
                      </TableCell>
                      <TableCell>
                        {card.tipo === 'quiz' && card.corretta && (
                          <span className="text-sm text-muted-foreground">
                            Corretta: {card.corretta}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(card)}
                            data-testid={`button-edit-${card.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDelete(card.id)}
                            data-testid={`button-delete-${card.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}