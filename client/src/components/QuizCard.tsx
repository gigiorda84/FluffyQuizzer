import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";

interface QuizCardProps {
  id: string;
  categoria: string;
  colore: string;
  domanda: string;
  opzioneA: string;
  opzioneB: string;
  opzioneC: string;
  corretta: 'A' | 'B' | 'C';
  battuta?: string;
  onAnswer: (selectedOption: 'A' | 'B' | 'C', correct: boolean, timeMs: number) => void;
}

export default function QuizCard({ 
  id, categoria, colore, domanda, opzioneA, opzioneB, opzioneC, corretta, battuta, onAnswer 
}: QuizCardProps) {
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [startTime] = useState(Date.now());

  const getCategoryColorClass = (color: string) => {
    switch (color.toLowerCase()) {
      case 'verde': return 'bg-fluffy-verde text-white';
      case 'blu': return 'bg-fluffy-blu text-white';
      case 'arancione': return 'bg-fluffy-arancione text-white';
      case 'viola': return 'bg-fluffy-viola text-white';
      default: return 'bg-fluffy-speciale text-white';
    }
  };

  const handleAnswer = (option: 'A' | 'B' | 'C') => {
    if (selectedOption) return; // Already answered
    
    const timeMs = Date.now() - startTime;
    const isCorrect = option === corretta;
    
    setSelectedOption(option);
    setShowResult(true);
    onAnswer(option, isCorrect, timeMs);
  };

  const getButtonVariant = (option: 'A' | 'B' | 'C') => {
    if (!showResult) return "outline";
    if (option === corretta) return "default";
    if (option === selectedOption && option !== corretta) return "destructive";
    return "outline";
  };

  const getButtonIcon = (option: 'A' | 'B' | 'C') => {
    if (!showResult) return null;
    if (option === corretta) return <CheckCircle className="w-5 h-5" />;
    if (option === selectedOption && option !== corretta) return <XCircle className="w-5 h-5" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col">
      {/* Header */}
      <div className={`rounded-t-lg p-4 text-center ${getCategoryColorClass(colore)}`}>
        <h2 className="font-bold text-sm opacity-90">{categoria}</h2>
        <span className="text-xs opacity-75">#{id}</span>
      </div>

      {/* Question Card */}
      <Card className="flex-1 rounded-t-none p-6 space-y-6">
        <h1 className="text-xl font-bold text-center leading-tight text-foreground">
          {domanda}
        </h1>

        {/* Answer Options */}
        <div className="space-y-4">
          <Button
            variant={getButtonVariant('A')}
            size="lg"
            className="w-full h-auto p-4 text-left whitespace-normal"
            onClick={() => handleAnswer('A')}
            disabled={!!selectedOption}
            data-testid="button-answer-a"
          >
            <div className="flex items-center gap-3">
              {getButtonIcon('A')}
              <span className="flex-1">{opzioneA}</span>
            </div>
          </Button>

          <Button
            variant={getButtonVariant('B')}
            size="lg"
            className="w-full h-auto p-4 text-left whitespace-normal"
            onClick={() => handleAnswer('B')}
            disabled={!!selectedOption}
            data-testid="button-answer-b"
          >
            <div className="flex items-center gap-3">
              {getButtonIcon('B')}
              <span className="flex-1">{opzioneB}</span>
            </div>
          </Button>

          <Button
            variant={getButtonVariant('C')}
            size="lg"
            className="w-full h-auto p-4 text-left whitespace-normal"
            onClick={() => handleAnswer('C')}
            disabled={!!selectedOption}
            data-testid="button-answer-c"
          >
            <div className="flex items-center gap-3">
              {getButtonIcon('C')}
              <span className="flex-1">{opzioneC}</span>
            </div>
          </Button>
        </div>

        {/* Result Feedback */}
        {showResult && (
          <div className={`p-4 rounded-lg text-center ${
            selectedOption === corretta ? 'bg-fluffy-success/10 text-fluffy-success' : 'bg-fluffy-error/10 text-fluffy-error'
          }`}>
            <div className="font-bold text-lg mb-2">
              {selectedOption === corretta ? '🎉 Corretto!' : '❌ Sbagliato!'}
            </div>
            {battuta && (
              <p className="text-sm italic">{battuta}</p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}