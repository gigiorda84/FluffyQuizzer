import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Target, Clock, ThumbsUp, ThumbsDown, Brain, Flag } from "lucide-react";

interface AnalyticsProps {
  onBack: () => void;
}

// Mock data - todo: remove mock functionality
const mockStats = {
  totalCards: 224,
  totalFeedback: 1247,
  avgCorrectRate: 67,
  avgResponseTime: 8.4
};

const mockCategoryData = [
  { name: 'CIBI FURBI', correct: 72, total: 145, avgTime: 7.2 },
  { name: 'PIANETA PIATTO', correct: 58, total: 89, avgTime: 9.8 },
  { name: 'CULTURA CIBO', correct: 81, total: 92, avgTime: 6.1 },
  { name: 'ANATOMIA TAVOLA', correct: 63, total: 78, avgTime: 8.9 }
];

const mockFeedbackData = [
  { name: 'Mi piace', value: 342, color: '#22c55e' },
  { name: 'Divertente', value: 289, color: '#3b82f6' },
  { name: 'Facile', value: 198, color: '#f59e0b' },
  { name: 'Difficile', value: 156, color: '#ef4444' },
  { name: 'Noiosa', value: 87, color: '#6b7280' },
  { name: 'Da rivedere', value: 43, color: '#dc2626' }
];

const mockTopCards = [
  { id: 'V041', question: 'Quale alga la NASA voleva...', correct: 89, feedback: 45, flag: 2 },
  { id: 'B029', question: 'Una mucca scoreggia gas...', correct: 76, feedback: 38, flag: 1 },
  { id: 'A101', question: 'Il pomodoro è nato in...', correct: 92, feedback: 52, flag: 0 }
];

export default function Analytics({ onBack }: AnalyticsProps) {
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
              <Select defaultValue="30days">
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
              <div className="text-2xl font-bold">{mockStats.totalCards}</div>
              <p className="text-xs text-muted-foreground">Nel database</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Feedback Totali</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalFeedback}</div>
              <p className="text-xs text-muted-foreground">Raccolti</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">% Risposte Corrette</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.avgCorrectRate}%</div>
              <p className="text-xs text-muted-foreground">Media generale</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Medio</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.avgResponseTime}s</div>
              <p className="text-xs text-muted-foreground">Per risposta</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Performance per Categoria</CardTitle>
              <CardDescription>Percentuale di risposte corrette</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockCategoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="correct" fill="hsl(var(--primary))" />
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
                    data={mockFeedbackData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {mockFeedbackData.map((entry, index) => (
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
              {mockTopCards.map((card, index) => (
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
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span>{card.correct}% corrette</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4 text-blue-500" />
                      <span>{card.feedback} feedback</span>
                    </div>
                    {card.flag > 0 && (
                      <div className="flex items-center gap-1">
                        <Flag className="w-4 h-4 text-red-500" />
                        <span>{card.flag} segnalazioni</span>
                      </div>
                    )}
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