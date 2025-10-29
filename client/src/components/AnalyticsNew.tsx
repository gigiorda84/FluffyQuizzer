import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowUpDown, ArrowUp, ArrowDown, Star, ThumbsUp, Brain, Smile, Flag, Clock } from 'lucide-react';

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
  reviewCount: number;
  topCount: number;
  easyCount: number;
  hardCount: number;
  funCount: number;
  boringCount: number;
  totalFeedback: number;
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
  topVotedCards: CardStats[];
  bestPerformingCards: CardStats[];
  mostDifficultCards: CardStats[];
  feedbackSummary: {
    totalReview: number;
    totalTop: number;
    totalEasy: number;
    totalHard: number;
    totalFun: number;
    totalBoring: number;
  };
}

type SortField = 'topCount' | 'correctPercentage' | 'wrongPercentage' | 'reviewCount' | 'funCount' | 'easyCount' | 'hardCount';
type SortDirection = 'asc' | 'desc';

export default function AnalyticsNew({ onBack }: AnalyticsProps) {
  const [sortField, setSortField] = useState<SortField>('topCount');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

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

  const sortedCards = analytics?.cardStats ? [...analytics.cardStats].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
  }) : [];

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
      variant={sortField === field ? "default" : "outline"}
      size="sm"
      onClick={() => handleSort(field)}
      className="flex items-center gap-1"
    >
      {label}
      {sortField === field && (
        sortDirection === 'desc' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />
      )}
      {sortField !== field && <ArrowUpDown className="w-3 h-3" />}
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
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center">
                <Flag className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">{analytics.feedbackSummary.totalReview}</div>
                <div className="text-xs text-muted-foreground">Da Rivedere</div>
              </div>
              <div className="text-center">
                <Star className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                <div className="text-2xl font-bold">{analytics.feedbackSummary.totalTop}</div>
                <div className="text-xs text-muted-foreground">Top</div>
              </div>
              <div className="text-center">
                <ThumbsUp className="w-6 h-6 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">{analytics.feedbackSummary.totalEasy}</div>
                <div className="text-xs text-muted-foreground">Facile</div>
              </div>
              <div className="text-center">
                <Brain className="w-6 h-6 mx-auto mb-2 text-red-500" />
                <div className="text-2xl font-bold">{analytics.feedbackSummary.totalHard}</div>
                <div className="text-xs text-muted-foreground">Difficile</div>
              </div>
              <div className="text-center">
                <Smile className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold">{analytics.feedbackSummary.totalFun}</div>
                <div className="text-xs text-muted-foreground">Divertente</div>
              </div>
              <div className="text-center">
                <Clock className="w-6 h-6 mx-auto mb-2 text-gray-500" />
                <div className="text-2xl font-bold">{analytics.feedbackSummary.totalBoring}</div>
                <div className="text-xs text-muted-foreground">Noiosa</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Lists */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🌟 Carte Più Votate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analytics.topVotedCards.slice(0, 5).map((card, index) => (
                  <div key={card.cardId} className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">{index + 1}</Badge>
                    <span className="flex-1 truncate">{card.question.substring(0, 40)}...</span>
                    <Badge>{card.topCount}</Badge>
                  </div>
                ))}
                {analytics.topVotedCards.length === 0 && (
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
            <CardTitle>Tutte le Carte - Statistiche Dettagliate</CardTitle>
            <div className="flex flex-wrap gap-2 mt-4">
              <SortButton field="topCount" label="Top" />
              <SortButton field="correctPercentage" label="% Corrette" />
              <SortButton field="wrongPercentage" label="% Sbagliate" />
              <SortButton field="reviewCount" label="Da Rivedere" />
              <SortButton field="funCount" label="Divertenti" />
              <SortButton field="easyCount" label="Facili" />
              <SortButton field="hardCount" label="Difficili" />
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
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="p-2">ID</th>
                      <th className="p-2">Domanda</th>
                      <th className="p-2">Categoria</th>
                      <th className="p-2 text-center">Risposte</th>
                      <th className="p-2 text-center">% OK</th>
                      <th className="p-2 text-center">% KO</th>
                      <th className="p-2 text-center">⭐ Top</th>
                      <th className="p-2 text-center">😊 Fun</th>
                      <th className="p-2 text-center">👍 Easy</th>
                      <th className="p-2 text-center">🧠 Hard</th>
                      <th className="p-2 text-center">📌 Review</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCards.map((card) => (
                      <tr key={card.cardId} className="border-b hover:bg-muted/50">
                        <td className="p-2">
                          <Badge variant="secondary" className="text-xs font-mono">{card.cardId}</Badge>
                        </td>
                        <td className="p-2 max-w-xs truncate">{card.question}</td>
                        <td className="p-2">
                          <Badge variant="outline" className="text-xs">{card.category}</Badge>
                        </td>
                        <td className="p-2 text-center">{card.totalAnswers}</td>
                        <td className="p-2 text-center">
                          <span className="text-green-600 font-semibold">{card.correctPercentage}%</span>
                        </td>
                        <td className="p-2 text-center">
                          <span className="text-red-600 font-semibold">{card.wrongPercentage}%</span>
                        </td>
                        <td className="p-2 text-center">{card.topCount}</td>
                        <td className="p-2 text-center">{card.funCount}</td>
                        <td className="p-2 text-center">{card.easyCount}</td>
                        <td className="p-2 text-center">{card.hardCount}</td>
                        <td className="p-2 text-center">{card.reviewCount}</td>
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
