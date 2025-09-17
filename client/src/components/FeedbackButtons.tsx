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
    <div className="bg-white p-4">
      <div className="max-w-md mx-auto">
        {selectedReactions.size > 0 && (
          <div className="text-center mb-4">
            <span className="text-sm text-gray-600">
              Grazie per il feedback!
            </span>
          </div>
        )}
      </div>
    </div>
  );
}