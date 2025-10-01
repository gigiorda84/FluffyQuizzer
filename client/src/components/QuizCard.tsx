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
  onNext?: () => void;
  onBack?: () => void;
}

export default function QuizCard({
  id, categoria, colore, domanda, opzioneA, opzioneB, opzioneC, corretta, battuta, onAnswer, onFeedback, onNext, onBack
}: QuizCardProps) {
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [startTime] = useState(Date.now());
  const [selectedFeedback, setSelectedFeedback] = useState<string[]>([]);


  const handleAnswer = (option: 'A' | 'B' | 'C') => {
    if (selectedOption) return; // Already answered

    const timeMs = Date.now() - startTime;
    const isCorrect = option === corretta;

    setSelectedOption(option);
    setShowResult(true);
    onAnswer(option, isCorrect, timeMs);

    // Send answer data to analytics
    const deviceId = localStorage.getItem('deviceId') ||
      (() => {
        const newId = crypto.randomUUID();
        localStorage.setItem('deviceId', newId);
        return newId;
      })();

    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cardId: id,
        deviceId,
        reaction: 'answered',
        correct: isCorrect,
        timeMs
      })
    }).catch(err => console.error('Failed to save answer data:', err));
  };

  const handleFeedbackClick = (reaction: string) => {
    setSelectedFeedback(prev => {
      let newFeedback = [...prev];

      if (newFeedback.includes(reaction)) {
        // Remove if already selected
        newFeedback = newFeedback.filter(item => item !== reaction);
      } else {
        // Add the new reaction
        newFeedback = [...newFeedback, reaction];

        // Handle mutual exclusivity
        if (reaction === 'easy' && newFeedback.includes('hard')) {
          newFeedback = newFeedback.filter(item => item !== 'hard');
        } else if (reaction === 'hard' && newFeedback.includes('easy')) {
          newFeedback = newFeedback.filter(item => item !== 'easy');
        } else if (reaction === 'fun' && newFeedback.includes('boring')) {
          newFeedback = newFeedback.filter(item => item !== 'boring');
        } else if (reaction === 'boring' && newFeedback.includes('fun')) {
          newFeedback = newFeedback.filter(item => item !== 'fun');
        }
      }

      return newFeedback;
    });
    onFeedback(reaction);

    // Send feedback data to analytics
    const deviceId = localStorage.getItem('deviceId') ||
      (() => {
        const newId = crypto.randomUUID();
        localStorage.setItem('deviceId', newId);
        return newId;
      })();

    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cardId: id,
        deviceId,
        reaction
      })
    }).catch(err => console.error('Failed to save feedback:', err));
  };

  const getCategoryStyles = (color: string) => {
    switch (color.toLowerCase()) {
      case 'verde':
        return {
          headerBg: 'bg-green-500',
          footerBg: 'bg-green-500',
          correctBg: 'bg-green-500',
          correctRing: 'ring-green-500'
        };
      case 'blu':
        return {
          headerBg: 'bg-blue-400',
          footerBg: 'bg-blue-400',
          correctBg: 'bg-blue-400',
          correctRing: 'ring-blue-400'
        };
      case 'arancione':
        return {
          headerBg: 'bg-orange-400',
          footerBg: 'bg-orange-400',
          correctBg: 'bg-orange-400',
          correctRing: 'ring-orange-400'
        };
      case 'viola':
        return {
          headerBg: 'bg-pink-400',
          footerBg: 'bg-pink-400',
          correctBg: 'bg-pink-400',
          correctRing: 'ring-pink-400'
        };
      case 'speciale':
        return {
          headerBg: 'bg-gradient-to-r from-orange-400 to-yellow-400',
          footerBg: 'bg-gradient-to-r from-orange-400 to-yellow-400',
          correctBg: 'bg-orange-400',
          correctRing: 'ring-orange-400'
        };
      default:
        return {
          headerBg: 'bg-green-500',
          footerBg: 'bg-green-500',
          correctBg: 'bg-green-500',
          correctRing: 'ring-green-500'
        };
    }
  };

  const styles = getCategoryStyles(colore);

  const getFeedbackButtonClass = (reaction: string) => {
    const baseClass = "font-bold py-3 px-2 md:px-6 rounded-lg transition-all uppercase tracking-wider text-xs md:text-base text-center";

    if (selectedFeedback.includes(reaction)) {
      // Selected state - solid background with category color
      return `${baseClass} bg-white text-black border-2 border-white`;
    } else {
      // Default state - transparent with white border
      return `${baseClass} bg-transparent border-2 border-white text-white hover:bg-white hover:text-black`;
    }
  };




  return (
    <div className="min-h-screen bg-gray-900">
      <div className="w-full bg-gray-100 min-h-screen flex flex-col">
        {/* Header - Category colored section with Menu, Category, and Next button */}
        <div className={`${styles.headerBg} px-6 py-4 flex justify-between items-center`}>
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="text-white font-bold text-lg uppercase tracking-wider"
            >
              Menu
            </button>
          </div>
          <div className="text-center">
            <div className="text-white font-bold text-lg uppercase tracking-wider">
              {categoria}
            </div>
            <div className="text-white text-sm mt-1">
              #{id}
            </div>
          </div>
          <div className="flex items-center">
            {onNext && (
              <button
                onClick={onNext}
                className="text-white font-bold text-lg uppercase tracking-wider"
                data-testid="button-next-card"
              >
                Avanti
              </button>
            )}
          </div>
        </div>

        {/* Main Card Content */}
        <div className="flex-1 bg-gray-100 flex flex-col px-8 py-6">
          {/* Question Section - Fixed at top */}
          <div className="flex-shrink-0 mb-6">
            <h1 className="text-xl md:text-2xl font-black text-black leading-tight uppercase tracking-wide text-center">
              {domanda}
            </h1>
          </div>

          {/* Answer Options - Centered in remaining space */}
          <div className="flex-1 flex items-center justify-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl">
              <div
                className={`bg-black text-white py-4 px-6 rounded-3xl cursor-pointer transition-all hover:bg-gray-800 flex items-center justify-center ${
                  showResult && corretta === 'A'
                    ? `ring-4 ${styles.correctRing}`
                    : showResult && selectedOption === 'A' && corretta !== 'A'
                    ? 'ring-4 ring-red-500'
                    : selectedOption === 'A'
                    ? 'ring-4 ring-blue-500'
                    : ''
                }`}
                onClick={() => handleAnswer('A')}
                data-testid="button-answer-a"
              >
                <div className="text-center">
                  <div className="text-base font-bold leading-tight uppercase">
                    {opzioneA}
                  </div>
                  {showResult && corretta === 'A' && (
                    <CheckCircle className="w-6 h-6 mx-auto mt-2 text-green-400" />
                  )}
                  {showResult && selectedOption === 'A' && corretta !== 'A' && (
                    <XCircle className="w-6 h-6 mx-auto mt-2 text-red-400" />
                  )}
                </div>
              </div>

              <div
                className={`bg-black text-white py-4 px-6 rounded-3xl cursor-pointer transition-all hover:bg-gray-800 flex items-center justify-center ${
                  showResult && corretta === 'B'
                    ? `ring-4 ${styles.correctRing}`
                    : showResult && selectedOption === 'B' && corretta !== 'B'
                    ? 'ring-4 ring-red-500'
                    : selectedOption === 'B'
                    ? 'ring-4 ring-blue-500'
                    : ''
                }`}
                onClick={() => handleAnswer('B')}
                data-testid="button-answer-b"
              >
                <div className="text-center">
                  <div className="text-base font-bold leading-tight uppercase">
                    {opzioneB}
                  </div>
                  {showResult && corretta === 'B' && (
                    <CheckCircle className="w-6 h-6 mx-auto mt-2 text-green-400" />
                  )}
                  {showResult && selectedOption === 'B' && corretta !== 'B' && (
                    <XCircle className="w-6 h-6 mx-auto mt-2 text-red-400" />
                  )}
                </div>
              </div>

              <div
                className={`bg-black text-white py-4 px-6 rounded-3xl cursor-pointer transition-all hover:bg-gray-800 flex items-center justify-center ${
                  showResult && corretta === 'C'
                    ? `ring-4 ${styles.correctRing}`
                    : showResult && selectedOption === 'C' && corretta !== 'C'
                    ? 'ring-4 ring-red-500'
                    : selectedOption === 'C'
                    ? 'ring-4 ring-blue-500'
                    : ''
                }`}
                onClick={() => handleAnswer('C')}
                data-testid="button-answer-c"
              >
                <div className="text-center">
                  <div className="text-base font-bold leading-tight uppercase">
                    {opzioneC}
                  </div>
                  {showResult && corretta === 'C' && (
                    <CheckCircle className="w-6 h-6 mx-auto mt-2 text-green-400" />
                  )}
                  {showResult && selectedOption === 'C' && corretta !== 'C' && (
                    <XCircle className="w-6 h-6 mx-auto mt-2 text-red-400" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Comment Section - Below answers */}
          {showResult && battuta && (
            <div className="flex-shrink-0 mt-6">
              <p className="text-base md:text-lg text-black font-bold leading-relaxed text-center">
                {battuta}
              </p>
            </div>
          )}
        </div>

        {/* Bottom Category-colored Section with Category Buttons */}
        <div className={`${styles.footerBg} px-8 py-6`}>
          <div className="grid grid-cols-3 gap-8">
            {/* Column 1: REVIEW/TOP */}
            <div className="flex flex-col gap-3">
              <button
                className={getFeedbackButtonClass('review')}
                onClick={() => handleFeedbackClick('review')}
                data-testid="button-feedback-review"
              >
                REVIEW
              </button>
              <button
                className={getFeedbackButtonClass('top')}
                onClick={() => handleFeedbackClick('top')}
                data-testid="button-feedback-top"
              >
                TOP
              </button>
            </div>

            {/* Column 2: EASY/HARD */}
            <div className="flex flex-col gap-3">
              <button
                className={getFeedbackButtonClass('easy')}
                onClick={() => handleFeedbackClick('easy')}
                data-testid="button-feedback-easy"
              >
                EASY
              </button>
              <button
                className={getFeedbackButtonClass('hard')}
                onClick={() => handleFeedbackClick('hard')}
                data-testid="button-feedback-hard"
              >
                HARD
              </button>
            </div>

            {/* Column 3: FUN/BORING */}
            <div className="flex flex-col gap-3">
              <button
                className={getFeedbackButtonClass('fun')}
                onClick={() => handleFeedbackClick('fun')}
                data-testid="button-feedback-fun"
              >
                FUN
              </button>
              <button
                className={getFeedbackButtonClass('boring')}
                onClick={() => handleFeedbackClick('boring')}
                data-testid="button-feedback-boring"
              >
                BORING
              </button>
            </div>
          </div>

        </div>


      </div>
    </div>
  );
}