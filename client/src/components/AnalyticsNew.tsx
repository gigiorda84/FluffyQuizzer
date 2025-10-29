import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, ArrowUpDown, ArrowUp, ArrowDown, ThumbsUp, ThumbsDown, Filter } from 'lucide-react';

interface AnalyticsProps {
  onBack?: () => void;
}

interface CardStats {
  cardId: string;
  question: string;
  category: string;
  color: string;
  totalAnswers: number;
  correctAnswers: number;
  wrongAnswers: number;
  correctPercentage: number;
  wrongPercentage: number;
  likeCount: number;
  dislikeCount: number;
  totalFeedback: number;
  likePercentage: number;
}

interface AnalyticsData {
  overview: {
    totalCards: number;
    totalQuizAnswers: number;
    totalCorrect: number;
    totalWrong: number;
    overallCorrectPercentage: number;
    totalFeedbackEntries: number;
  };
  cardStats: CardStats[];
  mostLikedCards: CardStats[];
  bestPerformingCards: CardStats[];
  mostDifficultCards: CardStats[];
  feedbackSummary: {
    totalLikes: number;
    totalDislikes: number;
  };
}

type SortField = 'cardId' | 'question' | 'category' | 'totalAnswers' | 'correctAnswers' | 'wrongAnswers' | 'likeCount' | 'dislikeCount';
type SortDirection = 'asc' | 'desc';

export default function AnalyticsNew({ onBack }: AnalyticsProps) {
  const [sortField, setSortField] = useState<SortField>('likeCount');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Fetch analytics data
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['analytics'],
    queryFn: async (): Promise<AnalyticsData> => {
      const response = await fetch('/api/analytics');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    }
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Filter and sort cards
  const filteredCards = analytics?.cardStats
    ? analytics.cardStats.filter(card =>
        selectedCategories.length === 0 || selectedCategories.includes(card.category)
      )
    : [];

  const sortedCards = filteredCards.length > 0 ? [...filteredCards].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    // Handle string sorting
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    // Handle number sorting
    return sortDirection === 'asc' ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue);
  }) : [];

  // Get unique categories
  const categories = analytics?.cardStats
    ? Array.from(new Set(analytics.cardStats.map(c => c.category))).sort()
    : [];

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const selectAllCategories = () => {
    setSelectedCategories([...categories]);
  };

  const deselectAllCategories = () => {
    setSelectedCategories([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <p>Caricamento analytics...</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Errore nel caricamento delle analytics</p>
          <Button onClick={onBack}>Torna indietro</Button>
        </div>
      </div>
    );
  }

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-6 w-6 p-0"
    >
      {label && <span className="sr-only">{label}</span>}
      {sortField === field && sortDirection === 'desc' && <ArrowDown className="w-4 h-4" />}
      {sortField === field && sortDirection === 'asc' && <ArrowUp className="w-4 h-4" />}
      {sortField !== field && <ArrowUpDown className="w-4 h-4 opacity-50" />}
    </Button>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={onBack} variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Indietro
            </Button>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Totale Carte</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.overview.totalCards}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Totale Risposte</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.overview.totalQuizAnswers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.overview.totalCorrect} corrette · {analytics.overview.totalWrong} sbagliate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">% Risposte Corrette</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{analytics.overview.overallCorrectPercentage}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Feedback Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Riepilogo Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-8 max-w-md mx-auto">
              <div className="text-center">
                <ThumbsUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <div className="text-3xl font-bold">{analytics.feedbackSummary.totalLikes}</div>
                <div className="text-sm text-muted-foreground">Mi Piace 👍</div>
              </div>
              <div className="text-center">
                <ThumbsDown className="w-8 h-8 mx-auto mb-2 text-red-500" />
                <div className="text-3xl font-bold">{analytics.feedbackSummary.totalDislikes}</div>
                <div className="text-sm text-muted-foreground">Non Mi Piace 👎</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Lists */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">👍 Carte Più Piaciute</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analytics.mostLikedCards?.slice(0, 5).map((card, index) => (
                  <div key={card.cardId} className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">{index + 1}</Badge>
                    <span className="flex-1 truncate">{card.question.substring(0, 40)}...</span>
                    <Badge className="bg-green-500">{card.likeCount} 👍</Badge>
                  </div>
                ))}
                {(!analytics.mostLikedCards || analytics.mostLikedCards.length === 0) && (
                  <p className="text-sm text-muted-foreground">Nessun dato disponibile</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">✅ Carte Più Facili</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analytics.bestPerformingCards.slice(0, 5).map((card, index) => (
                  <div key={card.cardId} className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">{index + 1}</Badge>
                    <span className="flex-1 truncate">{card.question.substring(0, 40)}...</span>
                    <Badge className="bg-green-500">{card.correctPercentage}%</Badge>
                  </div>
                ))}
                {analytics.bestPerformingCards.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nessun dato disponibile</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">❌ Carte Più Difficili</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analytics.mostDifficultCards.slice(0, 5).map((card, index) => (
                  <div key={card.cardId} className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">{index + 1}</Badge>
                    <span className="flex-1 truncate">{card.question.substring(0, 40)}...</span>
                    <Badge className="bg-red-500">{card.wrongPercentage}%</Badge>
                  </div>
                ))}
                {analytics.mostDifficultCards.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nessun dato disponibile</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sortable Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tutte le Carte - Statistiche Dettagliate</CardTitle>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtra Categorie
                    {selectedCategories.length > 0 && (
                      <Badge variant="secondary" className="ml-2">{selectedCategories.length}</Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">Seleziona Categorie</h4>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={selectAllCategories}>
                          Tutte
                        </Button>
                        <Button variant="ghost" size="sm" onClick={deselectAllCategories}>
                          Nessuna
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {categories.map(category => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category}`}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={() => toggleCategory(category)}
                          />
                          <label
                            htmlFor={`category-${category}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </CardHeader>
          <CardContent>
            {sortedCards.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nessun dato disponibile. Inizia a giocare e fornire feedback per vedere le statistiche!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr className="text-left">
                      <th className="p-3 font-bold text-sm">
                        <div className="flex items-center gap-2">
                          <span>Codice</span>
                          {SortButton('cardId', '')}
                        </div>
                      </th>
                      <th className="p-3 font-bold text-sm">
                        <div className="flex items-center gap-2">
                          <span>Domanda</span>
                          {SortButton('question', '')}
                        </div>
                      </th>
                      <th className="p-3 font-bold text-sm">
                        <div className="flex items-center gap-2">
                          <span>Categoria</span>
                          {SortButton('category', '')}
                        </div>
                      </th>
                      <th className="p-3 font-bold text-sm text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span>Risposte</span>
                          {SortButton('totalAnswers', '')}
                        </div>
                      </th>
                      <th className="p-3 font-bold text-sm text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span>OK</span>
                          {SortButton('correctAnswers', '')}
                        </div>
                      </th>
                      <th className="p-3 font-bold text-sm text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span>KO</span>
                          {SortButton('wrongAnswers', '')}
                        </div>
                      </th>
                      <th className="p-3 font-bold text-sm text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span>Like</span>
                          {SortButton('likeCount', '')}
                        </div>
                      </th>
                      <th className="p-3 font-bold text-sm text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span>Dislike</span>
                          {SortButton('dislikeCount', '')}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCards.map((card) => (
                      <tr key={card.cardId} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-mono text-xs">{card.cardId}</td>
                        <td className="p-2 max-w-md truncate">{card.question}</td>
                        <td className="p-2">
                          <Badge variant="outline" className="text-xs">{card.category}</Badge>
                        </td>
                        <td className="p-2 text-center font-semibold">{card.totalAnswers}</td>
                        <td className="p-2 text-center">
                          <span className="text-green-600 font-semibold">{card.correctAnswers}</span>
                        </td>
                        <td className="p-2 text-center">
                          <span className="text-red-600 font-semibold">{card.wrongAnswers}</span>
                        </td>
                        <td className="p-2 text-center">
                          <span className="text-green-600 font-semibold">{card.likeCount}</span>
                        </td>
                        <td className="p-2 text-center">
                          <span className="text-red-600 font-semibold">{card.dislikeCount}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
