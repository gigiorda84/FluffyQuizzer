import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, SkipForward, RefreshCw } from "lucide-react";
import QuizCard from "./QuizCard";
import SpecialCard from "./SpecialCard";
import FeedbackButtons from "./FeedbackButtons";
import { apiRequest } from "@/lib/queryClient";
import { useGameSession } from "@/hooks/useGameSession";

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
  numeroCarte: number;
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
  const { sessionId, deviceId, incrementCardsPlayed, incrementFeedbackCount } = useGameSession();
  const queryClient = useQueryClient();

  // Fetch current card
  const { data: currentCard, isLoading, error, refetch } = useQuery({
    queryKey: ['cards', 'random', selectedCategory || 'all', cardKey],
    queryFn: async (): Promise<Card> => {
      const url = selectedCategory && selectedCategory !== 'mix'
        ? `/api/cards/random?categoria=${encodeURIComponent(selectedCategory)}`
        : '/api/cards/random';

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch card');
      }
      return response.json();
    },
    enabled: selectedCategory !== null,
    refetchOnWindowFocus: false,
  });

  // Fetch next card (for stack effect)
  const { data: nextCard } = useQuery({
    queryKey: ['cards', 'random', selectedCategory || 'all', cardKey + 1],
    queryFn: async (): Promise<Card> => {
      const url = selectedCategory && selectedCategory !== 'mix'
        ? `/api/cards/random?categoria=${encodeURIComponent(selectedCategory)}`
        : '/api/cards/random';

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch card');
      }
      return response.json();
    },
    enabled: selectedCategory !== null && currentCard !== undefined,
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

  const handleAnswer = (selectedOption: 'A' | 'B' | 'C', correct: boolean, timeMs: number) => {
    setAnswered(true);
    setShowFeedback(true);
    incrementCardsPlayed();
  };

  const handleNext = () => {
    // Increment key to trigger new random card fetch
    setCardKey(prev => prev + 1);
  };

  const handleSpecialNext = () => {
    setShowFeedback(true);
    incrementCardsPlayed();
  };

  const handleFeedbackReaction = (reaction: string) => {
    // Feedback is now handled directly in QuizCard/SpecialCard components
    // This function can remain empty or be used for additional logic
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
      {/* Card Stack Container */}
      <div className="flex-1 flex flex-col relative">
        {/* Next Card - Behind */}
        {nextCard && (
          <div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              opacity: 1
            }}
          >
            {nextCard.tipo === 'quiz' ? (
              <QuizCard
                id={nextCard.id}
                categoria={nextCard.categoria}
                colore={nextCard.colore}
                domanda={nextCard.domanda}
                opzioneA={nextCard.opzioneA!}
                opzioneB={nextCard.opzioneB!}
                opzioneC={nextCard.opzioneC!}
                corretta={nextCard.corretta!}
                battuta={nextCard.battuta}
                sessionId={sessionId}
                deviceId={deviceId}
                onAnswer={() => {}}
                onFeedback={() => {}}
                onNext={() => {}}
                onBack={onBack}
              />
            ) : (
              <SpecialCard
                id={nextCard.id}
                categoria={nextCard.categoria}
                titolo={nextCard.domanda}
                descrizione={nextCard.battuta || "Carta speciale senza descrizione"}
                sessionId={sessionId}
                deviceId={deviceId}
                onNext={() => {}}
                onFeedback={() => {}}
                onBack={onBack}
              />
            )}
          </div>
        )}

        {/* Current Card - On Top */}
        <div className="absolute inset-0 z-10">
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
              sessionId={sessionId}
              deviceId={deviceId}
              onAnswer={handleAnswer}
              onFeedback={handleFeedbackReaction}
              onNext={handleNext}
              onBack={onBack}
            />
          ) : (
            <SpecialCard
              id={currentCard.id}
              categoria={currentCard.categoria}
              titolo={currentCard.domanda}
              descrizione={currentCard.battuta || "Carta speciale senza descrizione"}
              sessionId={sessionId}
              deviceId={deviceId}
              onNext={handleNext}
              onFeedback={handleFeedbackReaction}
              onBack={onBack}
            />
          )}
        </div>
      </div>

    </div>
  );
}