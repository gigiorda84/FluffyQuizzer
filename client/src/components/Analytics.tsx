import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, FileText, ThumbsUp, ThumbsDown, TrendingUp, RefreshCw } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

interface AnalyticsProps {
  onBack?: () => void;
}

interface FeedbackData {
  id: string;
  cardId: string;
  deviceId: string;
  rating: number;
  difficulty: number;
  createdAt: string;
}

interface CardData {
  id: string;
  categoria: string;
  colore: string;
  domanda: string;
  tipo: 'quiz' | 'speciale';
  createdAt: string;
}

interface AnalyticsData {
  totalFeedback: number;
  totalCards: number;
  averageRating: number;
  averageDifficulty: number;
  categoryStats: Array<{
    category: string;
    count: number;
    avgRating: number;
    color: string;
  }>;
  ratingDistribution: Array<{
    rating: number;
    count: number;
  }>;
  difficultyDistribution: Array<{
    difficulty: number;
    count: number;
  }>;
  recentActivity: Array<{
    date: string;
    feedbackCount: number;
  }>;
  topPerformingCards: Array<{
    cardId: string;
    question: string;
    avgRating: number;
    feedbackCount: number;
  }>;
}

const COLORS = {
  'CIBI FURBI & CIBI TRAPPOLA': '#00bf63',
  'IL PIANETA NEL PIATTO': '#63c1ea',
  'CULTURA DEL CIBO': '#ff914d',
  'ANATOMIA A TAVOLA': '#8b5cf6',
  'default': '#6b7280'
};

export default function Analytics({ onBack }: AnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');

  // Fetch feedback data
  const { data: feedback = [], isLoading: feedbackLoading } = useQuery({
    queryKey: ['feedback'],
    queryFn: async (): Promise<FeedbackData[]> => {
      const response = await fetch('/api/feedback');
      if (!response.ok) throw new Error('Failed to fetch feedback');
      return response.json();
    }
  });

  // Fetch cards data
  const { data: cards = [], isLoading: cardsLoading } = useQuery({
    queryKey: ['cards'],
    queryFn: async (): Promise<CardData[]> => {
      const response = await fetch('/api/cards');
      if (!response.ok) throw new Error('Failed to fetch cards');
      return response.json();
    }
  });

  const isLoading = feedbackLoading || cardsLoading;

  // Process analytics data
  const analyticsData: AnalyticsData = React.useMemo(() => {
    if (!feedback.length || !cards.length) {
      return {
        totalFeedback: 0,
        totalCards: 0,
        averageRating: 0,
        averageDifficulty: 0,
        categoryStats: [],
        ratingDistribution: [],
        difficultyDistribution: [],
        recentActivity: [],
        topPerformingCards: []
      };
    }

    // Filter feedback by time range
    const now = new Date();
    const cutoffDate = new Date();
    if (timeRange === '7d') {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (timeRange === '30d') {
      cutoffDate.setDate(now.getDate() - 30);
    } else {
      cutoffDate.setFullYear(2020); // Show all data
    }

    const filteredFeedback = feedback.filter(f =>
      new Date(f.createdAt) >= cutoffDate
    );

    // Basic stats
    const totalFeedback = filteredFeedback.length;
    const totalCards = cards.length;
    const averageRating = filteredFeedback.length > 0
      ? filteredFeedback.reduce((sum, f) => sum + f.rating, 0) / filteredFeedback.length
      : 0;
    const averageDifficulty = filteredFeedback.length > 0
      ? filteredFeedback.reduce((sum, f) => sum + f.difficulty, 0) / filteredFeedback.length
      : 0;

    // Category stats
    const categoryMap = new Map<string, { ratings: number[], count: number, color: string }>();

    filteredFeedback.forEach(f => {
      const card = cards.find(c => c.id === f.cardId);
      if (card) {
        const category = card.categoria;
        if (!categoryMap.has(category)) {
          categoryMap.set(category, {
            ratings: [],
            count: 0,
            color: COLORS[category as keyof typeof COLORS] || COLORS.default
          });
        }
        const categoryData = categoryMap.get(category)!;
        categoryData.ratings.push(f.rating);
        categoryData.count++;
      }
    });

    const categoryStats = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      count: data.count,
      avgRating: data.ratings.reduce((sum, r) => sum + r, 0) / data.ratings.length,
      color: data.color
    }));

    // Rating distribution
    const ratingCounts = new Map<number, number>();
    for (let i = 1; i <= 5; i++) {
      ratingCounts.set(i, 0);
    }
    filteredFeedback.forEach(f => {
      ratingCounts.set(f.rating, (ratingCounts.get(f.rating) || 0) + 1);
    });
    const ratingDistribution = Array.from(ratingCounts.entries()).map(([rating, count]) => ({
      rating,
      count
    }));

    // Difficulty distribution
    const difficultyCounts = new Map<number, number>();
    for (let i = 1; i <= 5; i++) {
      difficultyCounts.set(i, 0);
    }
    filteredFeedback.forEach(f => {
      difficultyCounts.set(f.difficulty, (difficultyCounts.get(f.difficulty) || 0) + 1);
    });
    const difficultyDistribution = Array.from(difficultyCounts.entries()).map(([difficulty, count]) => ({
      difficulty,
      count
    }));

    // Recent activity (last 7 days)
    const activityMap = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      activityMap.set(dateStr, 0);
    }

    filteredFeedback.forEach(f => {
      const date = f.createdAt.split('T')[0];
      if (activityMap.has(date)) {
        activityMap.set(date, (activityMap.get(date) || 0) + 1);
      }
    });

    const recentActivity = Array.from(activityMap.entries()).map(([date, feedbackCount]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      feedbackCount
    }));

    // Top performing cards
    const cardRatings = new Map<string, { ratings: number[], question: string }>();
    filteredFeedback.forEach(f => {
      const card = cards.find(c => c.id === f.cardId);
      if (card) {
        if (!cardRatings.has(f.cardId)) {
          cardRatings.set(f.cardId, { ratings: [], question: card.domanda });
        }
        cardRatings.get(f.cardId)!.ratings.push(f.rating);
      }
    });

    const topPerformingCards = Array.from(cardRatings.entries())
      .map(([cardId, data]) => ({
        cardId,
        question: data.question.length > 50 ? data.question.substring(0, 50) + '...' : data.question,
        avgRating: data.ratings.reduce((sum, r) => sum + r, 0) / data.ratings.length,
        feedbackCount: data.ratings.length
      }))
      .filter(card => card.feedbackCount >= 2) // Only show cards with at least 2 ratings
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 5);

    return {
      totalFeedback,
      totalCards,
      averageRating,
      averageDifficulty,
      categoryStats,
      ratingDistribution,
      difficultyDistribution,
      recentActivity,
      topPerformingCards
    };
  }, [feedback, cards, timeRange]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading analytics data...</p>
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
            <h1 className="text-3xl font-bold">📊 Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Insights into your trivia game performance
            </p>
          </div>
          <div className="flex gap-2">
            {/* Time range selector */}
            <div className="flex gap-1">
              {(['7d', '30d', 'all'] as const).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : 'All Time'}
                </Button>
              ))}
            </div>
            {onBack && (
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to CMS
              </Button>
            )}
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalFeedback}</div>
              <p className="text-xs text-muted-foreground">
                Player responses collected
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalCards}</div>
              <p className="text-xs text-muted-foreground">
                Trivia questions available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
              <ThumbsUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsData.averageRating.toFixed(1)}/5
              </div>
              <p className="text-xs text-muted-foreground">
                Player satisfaction
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Difficulty</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsData.averageDifficulty.toFixed(1)}/5
              </div>
              <p className="text-xs text-muted-foreground">
                Perceived difficulty
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.categoryStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="category"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      name === 'avgRating' ? `${Number(value).toFixed(1)} ⭐` : value,
                      name === 'avgRating' ? 'Avg Rating' : 'Feedback Count'
                    ]}
                  />
                  <Bar dataKey="count" fill="#8884d8" name="Feedback Count" />
                  <Bar dataKey="avgRating" fill="#82ca9d" name="Avg Rating" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Rating Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Rating Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.ratingDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ rating, count }) => `${rating}⭐ (${count})`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analyticsData.ratingDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${entry.rating * 60}, 70%, 50%)`} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.recentActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="feedbackCount"
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="Feedback Count"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Performing Cards */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Cards</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analyticsData.topPerformingCards.length > 0 ? (
                analyticsData.topPerformingCards.map((card, index) => (
                  <div key={card.cardId} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{card.question}</p>
                      <p className="text-xs text-muted-foreground">
                        {card.feedbackCount} responses
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {card.avgRating.toFixed(1)}⭐
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No cards with sufficient feedback yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}