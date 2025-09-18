import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Target, Clock, ThumbsUp, ThumbsDown, Brain, Flag, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface AnalyticsProps {
  onBack: () => void;
}

interface Feedback {
  id: string;
  cardId: string;
  reaction: string;
  deviceId: string;
  createdAt: string;
}

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
export default function Analytics({ onBack }: AnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('30days');

  // Fetch real data from API
  const { data: allFeedback = [], isLoading: feedbackLoading, error: feedbackError } = useQuery({
    queryKey: ['feedback'],
    queryFn: async (): Promise<Feedback[]> => {
      const response = await fetch('/api/feedback');
      if (!response.ok) {
        throw new Error('Failed to fetch feedback');
      }
      return response.json();
    },
    refetchOnWindowFocus: false,
  });

  const { data: allCards = [], isLoading: cardsLoading, error: cardsError } = useQuery({
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

  // Filter data by selected period
  const getFilteredFeedback = () => {
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (selectedPeriod) {
      case 'today':
        cutoffDate.setHours(0, 0, 0, 0);
        break;
      case '7days':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case 'all':
      default:
        return allFeedback;
    }
    
    return allFeedback.filter(feedback => new Date(feedback.createdAt) >= cutoffDate);
  };

  const filteredFeedback = getFilteredFeedback();

  // Process data for analytics
  const stats = {
    totalCards: allCards.length,
    totalFeedback: filteredFeedback.length,
    avgCorrectRate: 0, // We don't have correct/incorrect data yet
    avgResponseTime: 0  // We don't have response time data yet
  };

  // Feedback distribution
  const feedbackByType = filteredFeedback.reduce((acc, feedback) => {
    acc[feedback.reaction] = (acc[feedback.reaction] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const feedbackData = [
    { name: 'Review', value: feedbackByType.review || 0, color: '#dc2626' },
    { name: 'Easy', value: feedbackByType.easy || 0, color: '#f59e0b' },
    { name: 'Fun', value: feedbackByType.fun || 0, color: '#3b82f6' },
    { name: 'Top', value: feedbackByType.top || 0, color: '#22c55e' },
    { name: 'Hard', value: feedbackByType.hard || 0, color: '#ef4444' },
    { name: 'Boring', value: feedbackByType.boring || 0, color: '#6b7280' }
  ].filter(item => item.value > 0);

  // Category performance
  const categoryData = allCards.reduce((acc, card) => {
    const categoria = card.categoria;
    if (!acc[categoria]) {
      acc[categoria] = { name: categoria.slice(0, 15), total: 0, feedback: 0 };
    }
    acc[categoria].total += 1;
    acc[categoria].feedback += filteredFeedback.filter(f => f.cardId === card.id).length;
    return acc;
  }, {} as Record<string, any>);

  const categoryChartData = Object.values(categoryData);

  // Top performing cards (by feedback count)
  const cardFeedbackCounts = filteredFeedback.reduce((acc, feedback) => {
    acc[feedback.cardId] = (acc[feedback.cardId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCards = allCards
    .map(card => ({
      id: card.id,
      question: card.domanda.slice(0, 30) + '...',
      feedback: cardFeedbackCounts[card.id] || 0,
      correct: 0, // Placeholder
      flag: 0     // Placeholder
    }))
    .sort((a, b) => b.feedback - a.feedback)
    .slice(0, 5);

  const isLoading = feedbackLoading || cardsLoading;
  const hasError = feedbackError || cardsError;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Caricando analytics...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-destructive">😅 Errore</h2>
          <p className="text-muted-foreground">Errore nel caricamento dei dati analytics</p>
          <Button onClick={onBack}>Torna al CMS</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Analisi delle performance e feedback</p>
          </div>
          <Button variant="outline" onClick={onBack} data-testid="button-back-analytics">
            Torna al CMS
          </Button>
        </div>

        {/* Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4 items-center">
              <span className="text-sm font-medium">Periodo:</span>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48" data-testid="select-period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Oggi</SelectItem>
                  <SelectItem value="7days">Ultimi 7 giorni</SelectItem>
                  <SelectItem value="30days">Ultimi 30 giorni</SelectItem>
                  <SelectItem value="all">Tutti i dati</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Carte Totali</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-cards">{stats.totalCards}</div>
              <p className="text-xs text-muted-foreground">nel database</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Feedback Totali</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-feedback">{stats.totalFeedback}</div>
              <p className="text-xs text-muted-foreground">nel periodo selezionato</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dispositivi Unici</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-unique-devices">{new Set(filteredFeedback.map(f => f.deviceId)).size}</div>
              <p className="text-xs text-muted-foreground">utenti coinvolti</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Carte con Feedback</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-cards-with-feedback">{Object.keys(cardFeedbackCounts).length}</div>
              <p className="text-xs text-muted-foreground">su {stats.totalCards} totali</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Performance per Categoria</CardTitle>
              <CardDescription>Feedback ricevuti per categoria</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="feedback" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Feedback Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuzione Feedback</CardTitle>
              <CardDescription>Tipi di reazioni raccolte</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={feedbackData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {feedbackData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Cards */}
        <Card>
          <CardHeader>
            <CardTitle>Carte Top Performance</CardTitle>
            <CardDescription>Carte con le migliori statistiche</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCards.map((card, index) => (
                <div key={card.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <div>
                      <p className="font-medium">{card.id}</p>
                      <p className="text-sm text-muted-foreground">{card.question}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4 text-blue-500" />
                      <span>{card.feedback} feedback</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}