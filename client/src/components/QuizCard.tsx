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
  onFeedback: (reaction: string) => void;
}

export default function QuizCard({ 
  id, categoria, colore, domanda, opzioneA, opzioneB, opzioneC, corretta, battuta, onAnswer, onFeedback 
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
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto">
      {/* Header with category and ID */}
      <div className={`p-4 text-white relative ${getCategoryColorClass(colore)}`}>
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-sm uppercase">{categoria}</h2>
          <span className="text-sm font-bold">#{id}</span>
        </div>
      </div>

      {/* Main Card Content */}
      <div className="flex-1 p-6 bg-white space-y-8">
        {/* Question */}
        <div className="text-center">
          <h1 className="text-lg font-bold text-black leading-tight">
            {domanda}
          </h1>
        </div>

        {/* Answer Options - 3 columns as in Canva */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div
            className={`text-center p-4 border-2 rounded cursor-pointer transition-colors ${
              showResult && corretta === 'A' 
                ? 'bg-green-100 border-green-500 text-green-800' 
                : showResult && selectedOption === 'A' && corretta !== 'A'
                ? 'bg-red-100 border-red-500 text-red-800'
                : selectedOption === 'A'
                ? 'bg-blue-100 border-blue-500'
                : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => handleAnswer('A')}
            data-testid="button-answer-a"
          >
            <div className="text-sm font-medium text-black leading-tight">
              {opzioneA}
            </div>
            {showResult && corretta === 'A' && (
              <CheckCircle className="w-5 h-5 mx-auto mt-2 text-green-600" />
            )}
            {showResult && selectedOption === 'A' && corretta !== 'A' && (
              <XCircle className="w-5 h-5 mx-auto mt-2 text-red-600" />
            )}
          </div>

          <div
            className={`text-center p-4 border-2 rounded cursor-pointer transition-colors ${
              showResult && corretta === 'B' 
                ? 'bg-green-100 border-green-500 text-green-800' 
                : showResult && selectedOption === 'B' && corretta !== 'B'
                ? 'bg-red-100 border-red-500 text-red-800'
                : selectedOption === 'B'
                ? 'bg-blue-100 border-blue-500'
                : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => handleAnswer('B')}
            data-testid="button-answer-b"
          >
            <div className="text-sm font-medium text-black leading-tight">
              {opzioneB}
            </div>
            {showResult && corretta === 'B' && (
              <CheckCircle className="w-5 h-5 mx-auto mt-2 text-green-600" />
            )}
            {showResult && selectedOption === 'B' && corretta !== 'B' && (
              <XCircle className="w-5 h-5 mx-auto mt-2 text-red-600" />
            )}
          </div>

          <div
            className={`text-center p-4 border-2 rounded cursor-pointer transition-colors ${
              showResult && corretta === 'C' 
                ? 'bg-green-100 border-green-500 text-green-800' 
                : showResult && selectedOption === 'C' && corretta !== 'C'
                ? 'bg-red-100 border-red-500 text-red-800'
                : selectedOption === 'C'
                ? 'bg-blue-100 border-blue-500'
                : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => handleAnswer('C')}
            data-testid="button-answer-c"
          >
            <div className="text-sm font-medium text-black leading-tight">
              {opzioneC}
            </div>
            {showResult && corretta === 'C' && (
              <CheckCircle className="w-5 h-5 mx-auto mt-2 text-green-600" />
            )}
            {showResult && selectedOption === 'C' && corretta !== 'C' && (
              <XCircle className="w-5 h-5 mx-auto mt-2 text-red-600" />
            )}
          </div>
        </div>

        {/* Feedback Buttons Grid - Exactly as in Canva: 2 rows x 3 cols */}
        <div className="mt-12 grid grid-cols-3 gap-3">
          <Button
            variant="outline"
            size="sm"
            className="text-xs font-bold tracking-wider border-black text-black hover:bg-gray-100"
            onClick={() => onFeedback('review')}
            data-testid="button-feedback-review"
          >
            REVIEW
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs font-bold tracking-wider border-black text-black hover:bg-gray-100"
            onClick={() => onFeedback('easy')}
            data-testid="button-feedback-easy"
          >
            EASY
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs font-bold tracking-wider border-black text-black hover:bg-gray-100"
            onClick={() => onFeedback('fun')}
            data-testid="button-feedback-fun"
          >
            FUN
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs font-bold tracking-wider border-black text-black hover:bg-gray-100"
            onClick={() => onFeedback('top')}
            data-testid="button-feedback-top"
          >
            TOP
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs font-bold tracking-wider border-black text-black hover:bg-gray-100"
            onClick={() => onFeedback('hard')}
            data-testid="button-feedback-hard"
          >
            HARD
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs font-bold tracking-wider border-black text-black hover:bg-gray-100"
            onClick={() => onFeedback('boring')}
            data-testid="button-feedback-boring"
          >
            BORING
          </Button>
        </div>

        {/* Result Feedback - Buchetto Style */}
        {showResult && battuta && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200">
            <p className="text-sm text-black font-medium italic leading-relaxed text-center">
              {battuta}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}