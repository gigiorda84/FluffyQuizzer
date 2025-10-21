
import { useState } from "react";

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
  const [selectedFeedback, setSelectedFeedback] = useState<string[]>([]);

  const handleFeedbackClick = (reaction: string) => {
    // Calculate new feedback state
    let updatedFeedback = [...selectedFeedback];

    if (updatedFeedback.includes(reaction)) {
      // Remove if already selected
      updatedFeedback = updatedFeedback.filter(item => item !== reaction);
    } else {
      // Add the new reaction
      updatedFeedback.push(reaction);

      // Handle mutual exclusivity for FUN/BORING
      if (reaction === 'fun' && updatedFeedback.includes('boring')) {
        updatedFeedback = updatedFeedback.filter(item => item !== 'boring');
      } else if (reaction === 'boring' && updatedFeedback.includes('fun')) {
        updatedFeedback = updatedFeedback.filter(item => item !== 'fun');
      }
    }

    // Update state
    setSelectedFeedback(updatedFeedback);
    onFeedback(reaction);

    // Send feedback with new format (6 boolean fields)
    const feedbackData: any = {
      cardId: id,
      deviceId,
      review: updatedFeedback.includes('review'),
      top: updatedFeedback.includes('top'),
      easy: updatedFeedback.includes('easy'),
      hard: updatedFeedback.includes('hard'),
      fun: updatedFeedback.includes('fun'),
      boring: updatedFeedback.includes('boring')
    };

    // Only add sessionId if it exists
    if (sessionId) {
      feedbackData.sessionId = sessionId;
    }

    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbackData)
    }).catch(err => console.error('Failed to save feedback:', err));
  };
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="w-full bg-gray-100 min-h-screen flex flex-col">
        {/* Header - Category colored section with Menu, Category, and Next button */}
        <div className="bg-gradient-to-r from-orange-400 to-yellow-400 px-6 py-4 flex justify-between items-center">
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

        {/* Bottom Orange Section with Category Buttons */}
        <div className="bg-gradient-to-r from-orange-400 to-yellow-400 px-8 py-6">
          <div className="grid grid-cols-2 gap-8 max-w-md mx-auto">
            {/* Column 1: REVIEW/TOP */}
            <div className="flex flex-col gap-3">
              <button
                className={`border-2 border-white font-bold py-3 px-6 rounded-lg transition-all uppercase tracking-wider ${
                  selectedFeedback.includes('review')
                    ? 'bg-white text-black'
                    : 'bg-transparent text-white hover:bg-white hover:text-black'
                }`}
                onClick={() => handleFeedbackClick('review')}
                data-testid="button-feedback-review"
              >
                REVIEW
              </button>
              <button
                className={`border-2 border-white font-bold py-3 px-6 rounded-lg transition-all uppercase tracking-wider ${
                  selectedFeedback.includes('top')
                    ? 'bg-white text-black'
                    : 'bg-transparent text-white hover:bg-white hover:text-black'
                }`}
                onClick={() => handleFeedbackClick('top')}
                data-testid="button-feedback-top"
              >
                TOP
              </button>
            </div>

            {/* Column 2: FUN/BORING */}
            <div className="flex flex-col gap-3">
              <button
                className={`border-2 border-white font-bold py-3 px-6 rounded-lg transition-all uppercase tracking-wider ${
                  selectedFeedback.includes('fun')
                    ? 'bg-white text-black'
                    : 'bg-transparent text-white hover:bg-white hover:text-black'
                }`}
                onClick={() => handleFeedbackClick('fun')}
                data-testid="button-feedback-fun"
              >
                FUN
              </button>
              <button
                className={`border-2 border-white font-bold py-3 px-6 rounded-lg transition-all uppercase tracking-wider ${
                  selectedFeedback.includes('boring')
                    ? 'bg-white text-black'
                    : 'bg-transparent text-white hover:bg-white hover:text-black'
                }`}
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