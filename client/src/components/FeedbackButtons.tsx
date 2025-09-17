import { Button } from "@/components/ui/button";
import { useState } from "react";

interface FeedbackButtonsProps {
  cardId: string;
  onFeedback: (reaction: string) => void;
  disabled?: boolean;
}

const feedbackOptions = [
  { id: 'review', emoji: '🚩', label: 'Da rivedere' },
  { id: 'top', emoji: '👍', label: 'Mi piace' },
  { id: 'easy', emoji: '😂', label: 'Facile' },
  { id: 'hard', emoji: '🤯', label: 'Difficile' },
  { id: 'fun', emoji: '🎉', label: 'Divertente' },
  { id: 'boring', emoji: '😴', label: 'Noiosa' }
];

export default function FeedbackButtons({ cardId, onFeedback, disabled = false }: FeedbackButtonsProps) {
  const [selectedReactions, setSelectedReactions] = useState<Set<string>>(new Set());

  const handleFeedback = (reactionId: string) => {
    if (disabled || selectedReactions.has(reactionId)) return;
    
    setSelectedReactions(prev => new Set([...Array.from(prev), reactionId]));
    onFeedback(reactionId);
  };

  return (
    <div className="p-4 bg-card border-t">
      <div className="max-w-md mx-auto">
        <p className="text-center text-sm text-muted-foreground mb-4">
          Come ti è sembrata questa carta?
        </p>
        
        <div className="grid grid-cols-3 gap-3">
          {feedbackOptions.map((option) => {
            const isSelected = selectedReactions.has(option.id);
            return (
              <Button
                key={option.id}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                className="h-16 flex flex-col gap-1 text-xs"
                onClick={() => handleFeedback(option.id)}
                disabled={disabled}
                data-testid={`button-feedback-${option.id}`}
              >
                <span className="text-lg">{option.emoji}</span>
                <span>{option.label}</span>
              </Button>
            );
          })}
        </div>
        
        {selectedReactions.size > 0 && (
          <div className="text-center mt-3">
            <span className="text-sm text-muted-foreground">
              Grazie per il feedback! 
            </span>
          </div>
        )}
      </div>
    </div>
  );
}