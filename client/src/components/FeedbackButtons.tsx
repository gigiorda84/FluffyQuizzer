import { Button } from "@/components/ui/button";
import { useState } from "react";

interface FeedbackButtonsProps {
  cardId: string;
  onFeedback: (reaction: string) => void;
  disabled?: boolean;
}

const feedbackOptions = [
  { id: 'review', label: 'REVIEW' },
  { id: 'top', label: 'TOP' },
  { id: 'easy', label: 'EASY' },
  { id: 'hard', label: 'HARD' },
  { id: 'fun', label: 'FUN' },
  { id: 'boring', label: 'BORING' }
];

export default function FeedbackButtons({ cardId, onFeedback, disabled = false }: FeedbackButtonsProps) {
  const [selectedReactions, setSelectedReactions] = useState<Set<string>>(new Set());

  const handleFeedback = (reactionId: string) => {
    if (disabled || selectedReactions.has(reactionId)) return;
    
    setSelectedReactions(prev => new Set([...Array.from(prev), reactionId]));
    onFeedback(reactionId);
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <div className="max-w-md mx-auto">
        {/* Feedback buttons in horizontal row like PDF */}
        <div className="flex justify-center gap-4">
          {feedbackOptions.map((option) => {
            const isSelected = selectedReactions.has(option.id);
            return (
              <Button
                key={option.id}
                variant="ghost"
                size="sm"
                className={`text-xs font-bold tracking-wide px-3 py-2 ${
                  isSelected 
                    ? 'bg-gray-800 text-white' 
                    : 'text-black border border-gray-300 hover:bg-gray-100'
                }`}
                onClick={() => handleFeedback(option.id)}
                disabled={disabled}
                data-testid={`button-feedback-${option.id}`}
              >
                {option.label}
              </Button>
            );
          })}
        </div>
        
        {selectedReactions.size > 0 && (
          <div className="text-center mt-3">
            <span className="text-xs text-gray-600">
              Grazie per il feedback!
            </span>
          </div>
        )}
      </div>
    </div>
  );
}