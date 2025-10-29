import { useState, useRef } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface SpecialCardProps {
  id: string;
  categoria: string;
  titolo: string;
  descrizione: string;
  sessionId: string | null;
  deviceId: string;
  onFeedback: (reaction: string) => void;
  onNext?: () => void;
  onBack?: () => void;
}

export default function SpecialCard({ id, categoria, titolo, descrizione, sessionId, deviceId, onFeedback, onNext, onBack }: SpecialCardProps) {
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<{ x: number, y: number } | null>(null);
  const [touchCurrent, setTouchCurrent] = useState<{ x: number, y: number } | null>(null);

  const handleFeedbackSubmit = (liked: boolean) => {
    if (feedbackGiven) return;

    setFeedbackGiven(true);
    setSwipeDirection(liked ? 'right' : 'left');
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

    // Auto-advance after animation
    setTimeout(() => {
      if (onNext) onNext();
    }, 800);
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
    if (touchStart && touchCurrent) {
      const deltaX = touchCurrent.x - touchStart.x;
      const rotation = deltaX / 20;
      return `translateX(${deltaX}px) rotate(${rotation}deg)`;
    }
    return 'translateX(0) rotate(0)';
  };

  const getSwipeOpacity = () => {
    if (swipeDirection) return 0;
    if (touchStart && touchCurrent) {
      const deltaX = Math.abs(touchCurrent.x - touchStart.x);
      return Math.max(0.3, 1 - deltaX / 300);
    }
    return 1;
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div
        ref={cardRef}
        className="w-full bg-gray-100 min-h-screen flex flex-col transition-all duration-700 ease-out"
        style={{
          transform: getSwipeTransform(),
          opacity: getSwipeOpacity()
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-400 to-yellow-400 px-6 py-4 flex justify-between items-center">
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
            <div className="text-white text-sm mt-1">
              #{id}
            </div>
          </div>
          <button
            onClick={onNext}
            className="text-white font-bold text-lg uppercase tracking-wider"
            data-testid="button-next-card"
          >
            Avanti
          </button>
        </div>

        {/* Main Card Content */}
        <div className="flex-1 p-8 bg-gray-100 min-h-[400px] flex flex-col justify-center">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-black leading-tight uppercase tracking-wide mb-6">
              {titolo}
            </h1>
          </div>

          {/* Description */}
          <div className="text-center mb-12">
            <p className="text-lg text-black leading-relaxed max-w-3xl mx-auto">
              {descrizione}
            </p>
          </div>
        </div>

        {/* Feedback Section */}
        {!feedbackGiven && (
          <div className="bg-gradient-to-r from-orange-400 to-yellow-400 px-8 py-8">
            <p className="text-white text-center text-lg mb-4">
              Swipe ← left per 👎 o right → per 👍
            </p>
            <div className="flex justify-center gap-8">
              <button
                onClick={() => handleFeedbackSubmit(false)}
                className="flex flex-col items-center gap-2 p-6 rounded-2xl border-2 border-white bg-white/20 hover:bg-white/40 transition-all transform hover:scale-110"
                data-testid="button-feedback-dislike"
              >
                <ThumbsDown className="w-12 h-12 text-white" />
                <span className="text-white font-bold">Non mi piace</span>
              </button>
              <button
                onClick={() => handleFeedbackSubmit(true)}
                className="flex flex-col items-center gap-2 p-6 rounded-2xl border-2 border-white bg-white/20 hover:bg-white/40 transition-all transform hover:scale-110"
                data-testid="button-feedback-like"
              >
                <ThumbsUp className="w-12 h-12 text-white" />
                <span className="text-white font-bold">Mi piace</span>
              </button>
            </div>
          </div>
        )}

        {feedbackGiven && (
          <div className="bg-gradient-to-r from-orange-400 to-yellow-400 px-8 py-8 text-center">
            <p className="text-white text-lg">
              {swipeDirection === 'right' ? '👍 Grazie per il feedback!' : '👎 Grazie per il feedback!'}
            </p>
          </div>
        )}
      </div>

      {/* Swipe indicators */}
      {touchStart && touchCurrent && !feedbackGiven && (
        <>
          {touchCurrent.x - touchStart.x > 50 && (
            <div className="fixed top-1/2 right-8 transform -translate-y-1/2 pointer-events-none z-50">
              <ThumbsUp className="w-24 h-24 text-white animate-pulse drop-shadow-lg" />
            </div>
          )}
          {touchStart.x - touchCurrent.x > 50 && (
            <div className="fixed top-1/2 left-8 transform -translate-y-1/2 pointer-events-none z-50">
              <ThumbsDown className="w-24 h-24 text-white animate-pulse drop-shadow-lg" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
