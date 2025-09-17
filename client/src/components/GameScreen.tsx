import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, SkipForward, RefreshCw } from "lucide-react";
import QuizCard from "./QuizCard";
import SpecialCard from "./SpecialCard";
import FeedbackButtons from "./FeedbackButtons";
import { apiRequest } from "@/lib/queryClient";

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

interface GameScreenProps {
  selectedCategory?: string | null;
  onBack: () => void;
}

export default function GameScreen({ selectedCategory, onBack }: GameScreenProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [cardKey, setCardKey] = useState(0); // For forcing re-fetch

  // Fetch random card (optionally filtered by category)
  const { data: currentCard, isLoading, error, refetch } = useQuery({
    queryKey: ['cards', 'random', selectedCategory || 'all', cardKey],
    queryFn: async () => {
      const url = selectedCategory && selectedCategory !== 'mix' 
        ? `/api/cards/random?categoria=${encodeURIComponent(selectedCategory)}`
        : '/api/cards/random';
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch card');
      }
      return response.json() as Card;
    },
    enabled: selectedCategory !== null, // Prevent initial fetch when category is null
    keepPreviousData: true, // Smoother UX during card transitions
    refetchOnWindowFocus: false,
  });

  // Feedback mutation
  const feedbackMutation = useMutation({
    mutationFn: async (feedbackData: {
      cardId: string;
      deviceId: string;
      reaction: string;
      correct?: boolean;
      timeMs?: number;
    }) => {
      return apiRequest('POST', '/api/feedback', feedbackData);
    },
    onError: (error) => {
      console.error('Failed to send feedback:', error);
    },
  });

  useEffect(() => {
    // Reset state when card changes
    setShowFeedback(false);
    setAnswered(false);
  }, [cardKey]);

  const getDeviceId = () => {
    let deviceId = localStorage.getItem('fluffy-device-id');
    if (!deviceId) {
      deviceId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('fluffy-device-id', deviceId);
    }
    return deviceId;
  };

  const handleAnswer = (selectedOption: 'A' | 'B' | 'C', correct: boolean, timeMs: number) => {
    setAnswered(true);
    setShowFeedback(true);
    
    if (currentCard) {
      feedbackMutation.mutate({
        cardId: currentCard.id,
        deviceId: getDeviceId(),
        reaction: 'answered',
        correct,
        timeMs,
      });
    }
  };

  const handleNext = () => {
    // Increment key to trigger new random card fetch
    setCardKey(prev => prev + 1);
  };

  const handleSpecialNext = () => {
    setShowFeedback(true);
    
    if (currentCard) {
      feedbackMutation.mutate({
        cardId: currentCard.id,
        deviceId: getDeviceId(),
        reaction: 'viewed',
      });
    }
  };

  const handleFeedbackReaction = (reaction: string) => {
    if (currentCard) {
      feedbackMutation.mutate({
        cardId: currentCard.id,
        deviceId: getDeviceId(),
        reaction,
      });
    }
  };

  if (isLoading || selectedCategory === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Caricando carta...</p>
        </div>
      </div>
    );
  }

  if (error || !currentCard) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-destructive">😅 Oops!</h2>
          <p className="text-muted-foreground">Errore nel caricamento della carta</p>
          <Button onClick={() => refetch()}>Riprova</Button>
          <Button variant="outline" onClick={onBack}>Torna al menu</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" size="sm" onClick={onBack} data-testid="button-back">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Menu
        </Button>
        
        <div className="text-sm text-muted-foreground">
          Carta #{currentCard.id}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => window.location.href = '/cms'}
            className="text-xs font-bold border border-black px-3 py-1 rounded bg-white hover:bg-gray-100"
            data-testid="button-cms"
          >
            CMS
          </button>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex-1 flex flex-col">
        {currentCard.tipo === 'quiz' ? (
          <QuizCard
            id={currentCard.id}
            categoria={currentCard.categoria}
            colore={currentCard.colore}
            domanda={currentCard.domanda}
            opzioneA={currentCard.opzioneA!}
            opzioneB={currentCard.opzioneB!}
            opzioneC={currentCard.opzioneC!}
            corretta={currentCard.corretta!}
            battuta={currentCard.battuta}
            onAnswer={handleAnswer}
            onFeedback={handleFeedbackReaction}
            onNext={handleNext}
          />
        ) : (
          <SpecialCard
            id={currentCard.id}
            categoria={currentCard.categoria}
            domanda={currentCard.domanda}
            onNext={handleSpecialNext}
            onFeedback={handleFeedbackReaction}
            onNextCard={handleNext}
          />
        )}
      </div>

      {/* Bottom Action Bar - Always visible "Nuova Domanda" button */}
      <div className="bg-white border-t p-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleNext}
            className="w-full bg-fluffy-blu text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity"
            data-testid="button-new-question"
          >
            NUOVA DOMANDA
          </button>
        </div>
      </div>

    </div>
  );
}