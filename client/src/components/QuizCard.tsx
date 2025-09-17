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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className={`p-3 text-center ${getCategoryColorClass(colore)} relative`}>
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-sm">{categoria}</h2>
          <span className="text-sm">#{id}</span>
        </div>
      </div>

      {/* Question Card */}
      <div className="flex-1 p-6 space-y-8 bg-white">
        <h1 className="text-xl font-bold text-center leading-tight text-black uppercase tracking-wide">
          {domanda}
        </h1>

        {/* Answer Options - Horizontal Layout like PDF */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <Button
            variant={getButtonVariant('A')}
            className={`h-auto p-4 text-xs leading-tight whitespace-normal border border-gray-300 ${
              showResult && corretta === 'A' ? 'bg-green-100 border-green-500' : 
              showResult && selectedOption === 'A' && corretta !== 'A' ? 'bg-red-100 border-red-500' :
              'bg-white hover:bg-gray-50'
            }`}
            onClick={() => handleAnswer('A')}
            disabled={!!selectedOption}
            data-testid="button-answer-a"
          >
            <div className="space-y-1">
              {getButtonIcon('A')}
              <div className="text-black font-medium">{opzioneA}</div>
            </div>
          </Button>

          <Button
            variant={getButtonVariant('B')}
            className={`h-auto p-4 text-xs leading-tight whitespace-normal border border-gray-300 ${
              showResult && corretta === 'B' ? 'bg-green-100 border-green-500' : 
              showResult && selectedOption === 'B' && corretta !== 'B' ? 'bg-red-100 border-red-500' :
              'bg-white hover:bg-gray-50'
            }`}
            onClick={() => handleAnswer('B')}
            disabled={!!selectedOption}
            data-testid="button-answer-b"
          >
            <div className="space-y-1">
              {getButtonIcon('B')}
              <div className="text-black font-medium">{opzioneB}</div>
            </div>
          </Button>

          <Button
            variant={getButtonVariant('C')}
            className={`h-auto p-4 text-xs leading-tight whitespace-normal border border-gray-300 ${
              showResult && corretta === 'C' ? 'bg-green-100 border-green-500' : 
              showResult && selectedOption === 'C' && corretta !== 'C' ? 'bg-red-100 border-red-500' :
              'bg-white hover:bg-gray-50'
            }`}
            onClick={() => handleAnswer('C')}
            disabled={!!selectedOption}
            data-testid="button-answer-c"
          >
            <div className="space-y-1">
              {getButtonIcon('C')}
              <div className="text-black font-medium">{opzioneC}</div>
            </div>
          </Button>
        </div>

        {/* Result Feedback - Buchetto Style */}
        {showResult && battuta && (
          <div className="bg-gray-50 p-4 border border-gray-200 text-center">
            <p className="text-sm text-black font-medium italic leading-relaxed">{battuta}</p>
          </div>
        )}
      </div>
    </div>
  );
}