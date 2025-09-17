import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, SkipForward } from "lucide-react";
import QuizCard from "./QuizCard";
import SpecialCard from "./SpecialCard";
import FeedbackButtons from "./FeedbackButtons";

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

interface GameScreenProps {
  cards: Card[];
  onBack: () => void;
  onFeedback: (cardId: string, reaction: string, correct?: boolean, timeMs?: number) => void;
}

export default function GameScreen({ cards, onBack, onFeedback }: GameScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answered, setAnswered] = useState(false);

  const currentCard = cards[currentIndex];
  const isLastCard = currentIndex === cards.length - 1;

  useEffect(() => {
    // Reset state when card changes
    setShowFeedback(false);
    setAnswered(false);
  }, [currentIndex]);

  const handleAnswer = (selectedOption: 'A' | 'B' | 'C', correct: boolean, timeMs: number) => {
    setAnswered(true);
    setShowFeedback(true);
    onFeedback(currentCard.id, 'answered', correct, timeMs);
  };

  const handleNext = () => {
    if (!isLastCard) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleSpecialNext = () => {
    setShowFeedback(true);
    onFeedback(currentCard.id, 'viewed');
  };

  const handleFeedbackReaction = (reaction: string) => {
    onFeedback(currentCard.id, reaction);
  };

  if (!currentCard) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">🎉 Complimenti!</h2>
          <p className="text-muted-foreground">Hai completato tutte le carte!</p>
          <Button onClick={onBack}>Torna al menu</Button>
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
          {currentIndex + 1} di {cards.length}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => window.location.href = '/cms'}
            className="text-xs font-bold border border-black px-3 py-1 rounded bg-white hover:bg-gray-100"
            data-testid="button-cms"
          >
            CMS
          </button>
          {showFeedback && !isLastCard && (
            <Button variant="ghost" size="sm" onClick={handleNext} data-testid="button-next">
              <SkipForward className="w-4 h-4 mr-2" />
              Nuova Domanda
            </Button>
          )}
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
            onNext={!isLastCard ? handleNext : undefined}
          />
        ) : (
          <SpecialCard
            id={currentCard.id}
            categoria={currentCard.categoria}
            domanda={currentCard.domanda}
            onNext={handleSpecialNext}
            onFeedback={handleFeedbackReaction}
            onNextCard={!isLastCard ? handleNext : undefined}
          />
        )}
      </div>

      {/* Bottom Action Bar - Always visible "Nuova Domanda" button */}
      {!isLastCard && (
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
      )}

    </div>
  );
}