import { useState, useRef, useEffect } from "react";
import { CheckCircle, XCircle, ThumbsUp, ThumbsDown } from "lucide-react";

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
  sessionId: string | null;
  deviceId: string;
  onAnswer: (selectedOption: 'A' | 'B' | 'C', correct: boolean, timeMs: number) => void;
  onFeedback: (reaction: string) => void;
  onNext?: () => void;
  onBack?: () => void;
}

export default function QuizCard({
  id, categoria, colore, domanda, opzioneA, opzioneB, opzioneC, corretta, battuta, sessionId, deviceId, onAnswer, onFeedback, onNext, onBack
}: QuizCardProps) {
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [startTime] = useState(Date.now());
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<{ x: number, y: number } | null>(null);
  const [touchCurrent, setTouchCurrent] = useState<{ x: number, y: number } | null>(null);

  // Reset state when card changes
  useEffect(() => {
    setSelectedOption(null);
    setShowResult(false);
    setFeedbackGiven(false);
  }, [id]);

  const handleAnswer = (option: 'A' | 'B' | 'C') => {
    if (selectedOption) return;

    const timeMs = Date.now() - startTime;
    const isCorrect = option === corretta;

    setSelectedOption(option);
    setShowResult(true);
    onAnswer(option, isCorrect, timeMs);

    if (sessionId) {
      fetch('/api/quiz-answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          cardId: id,
          deviceId,
          selectedOption: option,
          correct: isCorrect,
          timeMs
        })
      }).catch(err => console.error('Failed to save quiz answer:', err));
    }
  };

  const handleFeedbackSubmit = (liked: boolean) => {
    if (feedbackGiven) return;

    setFeedbackGiven(true);
    onFeedback(liked ? 'like' : 'dislike');

    const feedbackData: any = {
      cardId: id,
      deviceId,
      liked
    };

    if (sessionId) {
      feedbackData.sessionId = sessionId;
    }

    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbackData)
    }).catch(err => console.error('Failed to save feedback:', err));

    // Auto-advance immediately without animation
    if (onNext) onNext();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setTouchCurrent({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touch = e.touches[0];
    setTouchCurrent({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchCurrent) {
      setTouchStart(null);
      setTouchCurrent(null);
      return;
    }

    const deltaX = touchCurrent.x - touchStart.x;
    const deltaY = Math.abs(touchCurrent.y - touchStart.y);

    // Require horizontal swipe (not vertical scroll)
    if (Math.abs(deltaX) > 100 && deltaY < 50) {
      if (deltaX > 0) {
        // Swipe right = like
        handleFeedbackSubmit(true);
      } else {
        // Swipe left = dislike
        handleFeedbackSubmit(false);
      }
    }

    setTouchStart(null);
    setTouchCurrent(null);
  };

  const getSwipeTransform = () => {
    if (swipeDirection) {
      return swipeDirection === 'right'
        ? 'translateX(100vw) rotate(20deg)'
        : 'translateX(-100vw) rotate(-20deg)';
    }
    if (touchStart && touchCurrent && showResult) {
      const deltaX = touchCurrent.x - touchStart.x;
      const rotation = deltaX / 20;
      return `translateX(${deltaX}px) rotate(${rotation}deg)`;
    }
    return 'translateX(0) rotate(0)';
  };

  const getSwipeOpacity = () => {
    if (swipeDirection) return 0;
    if (touchStart && touchCurrent && showResult) {
      const deltaX = Math.abs(touchCurrent.x - touchStart.x);
      return Math.max(0.3, 1 - deltaX / 300);
    }
    return 1;
  };

  const getCategoryStyles = (color: string) => {
    switch (color.toLowerCase()) {
      case 'verde':
        return {
          headerBg: 'bg-green-500',
          correctRing: 'ring-green-500'
        };
      case 'blu':
        return {
          headerBg: 'bg-blue-400',
          correctRing: 'ring-blue-400'
        };
      case 'arancione':
        return {
          headerBg: 'bg-orange-400',
          correctRing: 'ring-orange-400'
        };
      case 'viola':
        return {
          headerBg: 'bg-pink-400',
          correctRing: 'ring-pink-400'
        };
      case 'speciale':
        return {
          headerBg: 'bg-gradient-to-r from-orange-400 to-yellow-400',
          correctRing: 'ring-orange-400'
        };
      default:
        return {
          headerBg: 'bg-green-500',
          correctRing: 'ring-green-500'
        };
    }
  };

  const styles = getCategoryStyles(colore);

  return (
    <div className="min-h-screen bg-gray-900">
      <div
        ref={cardRef}
        className="w-full bg-gray-100 min-h-screen flex flex-col"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header */}
        <div className={`${styles.headerBg} px-6 py-4 flex justify-between items-center`}>
          <button
            onClick={onBack}
            className="text-white font-bold text-lg uppercase tracking-wider"
          >
            Menu
          </button>
          <div className="text-center">
            <div className="text-white font-bold text-lg uppercase tracking-wider">
              {categoria}
            </div>
          </div>
          <button
            onClick={onNext}
            className="text-white font-bold text-lg uppercase tracking-wider"
            data-testid="button-next-card"
          >
            {showResult ? 'Avanti' : ''}
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-gray-100 flex flex-col px-8 py-6">
          {/* Question */}
          <div className="flex-shrink-0 mb-6">
            <h1 className="text-xl md:text-2xl font-black text-black leading-tight uppercase tracking-wide text-center">
              {domanda}
            </h1>
          </div>

          {/* Answer Options */}
          <div className="flex-1 flex items-center justify-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl">
              {['A', 'B', 'C'].map((opt) => {
                const optionText = opt === 'A' ? opzioneA : opt === 'B' ? opzioneB : opzioneC;
                const isCorrect = opt === corretta;
                const isSelected = selectedOption === opt;

                return (
                  <div
                    key={opt}
                    className={`bg-black text-white py-4 px-6 rounded-3xl cursor-pointer transition-all hover:bg-gray-800 flex items-center justify-center ${
                      showResult && isCorrect
                        ? `ring-4 ${styles.correctRing}`
                        : showResult && isSelected && !isCorrect
                        ? 'ring-4 ring-red-500'
                        : isSelected
                        ? 'ring-4 ring-blue-500'
                        : ''
                    }`}
                    onClick={() => handleAnswer(opt as 'A' | 'B' | 'C')}
                    data-testid={`button-answer-${opt.toLowerCase()}`}
                  >
                    <div className="text-center">
                      <div className="text-base font-bold leading-tight uppercase">
                        {optionText}
                      </div>
                      {showResult && isCorrect && (
                        <CheckCircle className="w-6 h-6 mx-auto mt-2 text-green-400" />
                      )}
                      {showResult && isSelected && !isCorrect && (
                        <XCircle className="w-6 h-6 mx-auto mt-2 text-red-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Comment */}
          {showResult && battuta && (
            <div className="flex-shrink-0 mt-6">
              <p className="text-base md:text-lg text-black font-bold leading-relaxed text-center">
                {battuta}
              </p>
            </div>
          )}
        </div>

        {/* Feedback Section - Swipe or Tap */}
        {!feedbackGiven && (
          <div className="px-8 py-8">
            <div className="flex justify-center gap-8">
              <button
                onClick={() => handleFeedbackSubmit(false)}
                className="flex items-center justify-center p-6 rounded-full bg-red-500 hover:bg-red-600 transition-all transform hover:scale-110"
                data-testid="button-feedback-dislike"
              >
                <ThumbsDown className="w-12 h-12 text-white" />
              </button>
              <button
                onClick={() => handleFeedbackSubmit(true)}
                className="flex items-center justify-center p-6 rounded-full bg-green-500 hover:bg-green-600 transition-all transform hover:scale-110"
                data-testid="button-feedback-like"
              >
                <ThumbsUp className="w-12 h-12 text-white" />
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
