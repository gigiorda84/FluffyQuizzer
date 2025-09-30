import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, Download, Upload, Plus, Search, ArrowLeft, RefreshCw } from "lucide-react";
import CardForm from "./CardForm";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
  createdAt: string;
}

interface CmsTableProps {
  onLogout: () => void;
  onAnalytics?: () => void;
}

export default function CmsTable({
  onLogout, onAnalytics
}: CmsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [showCardForm, setShowCardForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [deleteCardId, setDeleteCardId] = useState<string | null>(null);
  const [selectedCardIds, setSelectedCardIds] = useState<Set<string>>(new Set());
  const [showMassDeleteDialog, setShowMassDeleteDialog] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all cards from API
  const { data: cards = [], isLoading, error, refetch } = useQuery({
    queryKey: ['cards'],
    queryFn: async (): Promise<Card[]> => {
      const response = await fetch('/api/cards');
      if (!response.ok) {
        throw new Error('Failed to fetch cards');
      }
      return response.json();
    },
    refetchOnWindowFocus: false,
  });

  // Delete mutation - MUST be before any conditional returns
  const deleteMutation = useMutation({
    mutationFn: async (cardId: string) => {
      return apiRequest('DELETE', `/api/cards/${cardId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      toast({
        title: "Carta eliminata",
        description: "La carta è stata eliminata con successo",
      });
      setDeleteCardId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: "Errore nell'eliminazione della carta: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Mass delete mutation
  const massDeleteMutation = useMutation({
    mutationFn: async (cardIds: string[]) => {
      return apiRequest('DELETE', '/api/cards/batch', { cardIds });
    },
    onSuccess: (_, deletedIds) => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      toast({
        title: "Carte eliminate",
        description: `${deletedIds.length} carte sono state eliminate con successo`,
      });
      setSelectedCardIds(new Set());
      setShowMassDeleteDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: "Errore nell'eliminazione delle carte: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Data processing
  const categories = Array.from(new Set(cards.map(card => card.categoria)));
  
  const filteredCards = cards.filter(card => {
    const matchesSearch = card.domanda.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || card.categoria === categoryFilter;
    const matchesType = typeFilter === "all" || card.tipo === typeFilter;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  // Handler functions
  const handleAddCard = () => {
    setSelectedCard(null);
    setFormMode('create');
    setShowCardForm(true);
  };

  const handleEditCard = (card: Card) => {
    setSelectedCard(card);
    setFormMode('edit');
    setShowCardForm(true);
  };

  const handleDeleteCard = (cardId: string) => {
    setDeleteCardId(cardId);
  };

  const confirmDelete = () => {
    if (deleteCardId) {
      deleteMutation.mutate(deleteCardId);
    }
  };

  // Selection handlers
  const handleSelectCard = (cardId: string, checked: boolean) => {
    const newSelected = new Set(selectedCardIds);
    if (checked) {
      newSelected.add(cardId);
    } else {
      newSelected.delete(cardId);
    }
    setSelectedCardIds(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCardIds(new Set(filteredCards.map(card => card.id)));
    } else {
      setSelectedCardIds(new Set());
    }
  };

  const handleMassDelete = () => {
    if (selectedCardIds.size > 0) {
      setShowMassDeleteDialog(true);
    }
  };

  const confirmMassDelete = () => {
    const cardIds = Array.from(selectedCardIds);
    massDeleteMutation.mutate(cardIds);
  };

  // Check if all visible cards are selected
  const allVisibleSelected = filteredCards.length > 0 &&
    filteredCards.every(card => selectedCardIds.has(card.id));

  // Check if some (but not all) visible cards are selected
  const someVisibleSelected = filteredCards.some(card => selectedCardIds.has(card.id));

  const handleExportCsv = () => {
    // Create download link for CSV export
    const link = document.createElement('a');
    link.href = '/api/admin/export-csv';
    link.download = 'fluffy-trivia-cards.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export avviato",
      description: "Il download del file CSV dovrebbe iniziare a breve",
    });
  };

  const handleUploadCsv = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('csvFile', file);

      try {
        const response = await fetch('/api/admin/import-csv', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Errore durante l\'upload');
        }

        queryClient.invalidateQueries({ queryKey: ['cards'] });
        toast({
          title: "Import completato",
          description: `${result.imported} carte importate con successo`,
        });

        if (result.errors && result.errors.length > 0) {
          console.warn('Errori durante l\'import:', result.errors);
          toast({
            title: "Avviso",
            description: `${result.errors.length} carte hanno generato errori (controlla console)`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Errore upload CSV:', error);
        toast({
          title: "Errore upload",
          description: error instanceof Error ? error.message : "Errore sconosciuto",
          variant: "destructive",
        });
      }
    };
    input.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Caricando carte...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-destructive">😅 Errore</h2>
          <p className="text-muted-foreground">Errore nel caricamento delle carte</p>
          <Button onClick={() => refetch()}>Riprova</Button>
          <Button variant="outline" onClick={onLogout}>Torna al menu</Button>
        </div>
      </div>
    );
  }

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
                {selectedCardIds.size > 0 ? (
                  <>
                    <Button
                      variant="destructive"
                      onClick={handleMassDelete}
                      data-testid="button-mass-delete"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Elimina {selectedCardIds.size} carte
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedCardIds(new Set())}
                      data-testid="button-clear-selection"
                    >
                      Deseleziona tutto
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={handleAddCard} data-testid="button-add-card">
                      <Plus className="w-4 h-4 mr-2" />
                      Nuova Carta
                    </Button>
                    <Button variant="outline" onClick={handleUploadCsv} data-testid="button-upload-csv">
                      <Upload className="w-4 h-4 mr-2" />
                      Carica CSV
                    </Button>
                    <Button variant="outline" onClick={handleExportCsv} data-testid="button-export-csv">
                      <Download className="w-4 h-4 mr-2" />
                      Esporta CSV
                    </Button>
                    {onAnalytics && (
                      <Button variant="outline" onClick={onAnalytics} data-testid="button-analytics">
                        📊 Analytics
                      </Button>
                    )}
                  </>
                )}
              </div>

              <div className="text-sm text-muted-foreground">
                {selectedCardIds.size > 0 ? (
                  <>
                    {selectedCardIds.size} selezionate di {filteredCards.length} visibili
                  </>
                ) : (
                  <>
                    {filteredCards.length} di {cards.length} carte
                  </>
                )}
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
                    <TableHead className="w-12">
                      <Checkbox
                        checked={allVisibleSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Seleziona tutte le carte visibili"
                        data-testid="checkbox-select-all"
                        ref={(el) => {
                          if (el && someVisibleSelected && !allVisibleSelected) {
                            el.indeterminate = true;
                          }
                        }}
                      />
                    </TableHead>
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
                      <TableCell>
                        <Checkbox
                          checked={selectedCardIds.has(card.id)}
                          onCheckedChange={(checked) => handleSelectCard(card.id, checked as boolean)}
                          aria-label={`Seleziona carta ${card.id}`}
                          data-testid={`checkbox-card-${card.id}`}
                        />
                      </TableCell>
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
                            onClick={() => handleEditCard(card)}
                            data-testid={`button-edit-${card.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCard(card.id)}
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

      {/* Card Form Dialog */}
      <CardForm
        card={selectedCard}
        isOpen={showCardForm}
        onClose={() => setShowCardForm(false)}
        mode={formMode}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteCardId !== null} onOpenChange={() => setDeleteCardId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata. La carta verrà eliminata permanentemente dal database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? 'Eliminando...' : 'Elimina'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mass Delete Confirmation Dialog */}
      <AlertDialog open={showMassDeleteDialog} onOpenChange={setShowMassDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminazione massiva</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare {selectedCardIds.size} carte?
              Questa azione non può essere annullata e le carte verranno eliminate permanentemente dal database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmMassDelete}
              disabled={massDeleteMutation.isPending}
              data-testid="button-confirm-mass-delete"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {massDeleteMutation.isPending ? `Eliminando ${selectedCardIds.size} carte...` : `Elimina ${selectedCardIds.size} carte`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}