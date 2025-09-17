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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="fluffy-card bg-white flex flex-col overflow-hidden">
        {/* Header with category and ID */}
        <div className={`p-3 text-white relative ${getCategoryColorClass(colore)}`}>
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-xs uppercase tracking-wide">{categoria}</h2>
            <span className="text-xs font-bold">#{id}</span>
          </div>
        </div>

        {/* Main Card Content */}
        <div className="flex-1 p-4 bg-white">
          {/* Question */}
          <div className="text-center mb-6">
            <h1 className="text-base font-bold text-black leading-tight">
              {domanda}
            </h1>
          </div>

          {/* Answer Options - 3 columns exactly as in Canva */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <div
              className={`text-center p-3 border-2 border-black rounded-lg cursor-pointer transition-colors min-h-[80px] flex flex-col justify-center ${
                showResult && corretta === 'A' 
                  ? 'bg-green-200' 
                  : showResult && selectedOption === 'A' && corretta !== 'A'
                  ? 'bg-red-200'
                  : selectedOption === 'A'
                  ? 'bg-blue-100'
                  : 'bg-white hover:bg-gray-50'
              }`}
              onClick={() => handleAnswer('A')}
              data-testid="button-answer-a"
            >
              <div className="text-xs font-bold text-black leading-tight">
                {opzioneA}
              </div>
              {showResult && corretta === 'A' && (
                <CheckCircle className="w-4 h-4 mx-auto mt-1 text-green-600" />
              )}
              {showResult && selectedOption === 'A' && corretta !== 'A' && (
                <XCircle className="w-4 h-4 mx-auto mt-1 text-red-600" />
              )}
            </div>

            <div
              className={`text-center p-3 border-2 border-black rounded-lg cursor-pointer transition-colors min-h-[80px] flex flex-col justify-center ${
                showResult && corretta === 'B' 
                  ? 'bg-green-200' 
                  : showResult && selectedOption === 'B' && corretta !== 'B'
                  ? 'bg-red-200'
                  : selectedOption === 'B'
                  ? 'bg-blue-100'
                  : 'bg-white hover:bg-gray-50'
              }`}
              onClick={() => handleAnswer('B')}
              data-testid="button-answer-b"
            >
              <div className="text-xs font-bold text-black leading-tight">
                {opzioneB}
              </div>
              {showResult && corretta === 'B' && (
                <CheckCircle className="w-4 h-4 mx-auto mt-1 text-green-600" />
              )}
              {showResult && selectedOption === 'B' && corretta !== 'B' && (
                <XCircle className="w-4 h-4 mx-auto mt-1 text-red-600" />
              )}
            </div>

            <div
              className={`text-center p-3 border-2 border-black rounded-lg cursor-pointer transition-colors min-h-[80px] flex flex-col justify-center ${
                showResult && corretta === 'C' 
                  ? 'bg-green-200' 
                  : showResult && selectedOption === 'C' && corretta !== 'C'
                  ? 'bg-red-200'
                  : selectedOption === 'C'
                  ? 'bg-blue-100'
                  : 'bg-white hover:bg-gray-50'
              }`}
              onClick={() => handleAnswer('C')}
              data-testid="button-answer-c"
            >
              <div className="text-xs font-bold text-black leading-tight">
                {opzioneC}
              </div>
              {showResult && corretta === 'C' && (
                <CheckCircle className="w-4 h-4 mx-auto mt-1 text-green-600" />
              )}
              {showResult && selectedOption === 'C' && corretta !== 'C' && (
                <XCircle className="w-4 h-4 mx-auto mt-1 text-red-600" />
              )}
            </div>
          </div>

          {/* Feedback Buttons Grid - Exactly as in Canva: 2 rows x 3 cols */}
          <div className="grid grid-cols-3 gap-1 mb-4">
            <button
              className="text-xs font-bold border border-black px-2 py-1 rounded bg-white hover:bg-gray-100"
              onClick={() => onFeedback('review')}
              data-testid="button-feedback-review"
            >
              REVIEW
            </button>
            <button
              className="text-xs font-bold border border-black px-2 py-1 rounded bg-white hover:bg-gray-100"
              onClick={() => onFeedback('easy')}
              data-testid="button-feedback-easy"
            >
              EASY
            </button>
            <button
              className="text-xs font-bold border border-black px-2 py-1 rounded bg-white hover:bg-gray-100"
              onClick={() => onFeedback('fun')}
              data-testid="button-feedback-fun"
            >
              FUN
            </button>
            <button
              className="text-xs font-bold border border-black px-2 py-1 rounded bg-white hover:bg-gray-100"
              onClick={() => onFeedback('top')}
              data-testid="button-feedback-top"
            >
              TOP
            </button>
            <button
              className="text-xs font-bold border border-black px-2 py-1 rounded bg-white hover:bg-gray-100"
              onClick={() => onFeedback('hard')}
              data-testid="button-feedback-hard"
            >
              HARD
            </button>
            <button
              className="text-xs font-bold border border-black px-2 py-1 rounded bg-white hover:bg-gray-100"
              onClick={() => onFeedback('boring')}
              data-testid="button-feedback-boring"
            >
              BORING
            </button>
          </div>

          {/* Result Feedback - Buchetto Style */}
          {showResult && battuta && (
            <div className="mt-2 p-2 bg-gray-50 border border-gray-300 rounded">
              <p className="text-xs text-black font-bold italic leading-relaxed text-center">
                {battuta}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}