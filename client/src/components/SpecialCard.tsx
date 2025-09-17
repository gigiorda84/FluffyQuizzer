import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface SpecialCardProps {
  id: string;
  categoria: string;
  domanda: string;
  onNext: () => void;
  onFeedback: (reaction: string) => void;
  onNextCard?: () => void;
}

export default function SpecialCard({ id, categoria, domanda, onNext, onFeedback, onNextCard }: SpecialCardProps) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="fluffy-card bg-white flex flex-col overflow-hidden">
        {/* Header with ID, category, and next button */}
        <div className="bg-fluffy-speciale text-white p-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold">#{id}</span>
            <h2 className="font-bold text-xs uppercase tracking-wide">{categoria}</h2>
            <button
              onClick={onNextCard || (() => {})}
              className={`text-xs font-bold px-2 py-1 rounded transition-opacity ${
                onNextCard ? 'bg-white text-black hover:bg-gray-100' : 'bg-white bg-opacity-30 text-white cursor-not-allowed'
              }`}
              disabled={!onNextCard}
              data-testid="button-next-card"
            >
              AVANTI
            </button>
          </div>
        </div>

        {/* Instruction Card */}
        <div className="flex-1 p-4 bg-white">
          <div className="text-center space-y-4">
            <h1 className="text-lg font-bold text-black">
              Duello di Buchetti
            </h1>

            <div className="space-y-4">
              <p className="text-xs text-black font-bold leading-relaxed">
                {domanda}
              </p>
            </div>

            {/* Special card feedback buttons - Only 4 buttons as shown in Canva */}
            <div className="grid grid-cols-2 gap-1 mb-4">
              <button
                className="text-xs font-bold border border-black px-2 py-1 rounded bg-white hover:bg-gray-100"
                onClick={() => onFeedback('review')}
                data-testid="button-feedback-review"
              >
                REVIEW
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
                onClick={() => onFeedback('boring')}
                data-testid="button-feedback-boring"
              >
                BORING
              </button>
            </div>

            <div className="pt-4">
              <button 
                className="bg-white border border-black text-black hover:bg-gray-50 px-4 py-2 rounded font-bold text-sm"
                onClick={onNext}
                data-testid="button-next-special"
              >
                CONTINUA
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}