import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface SpecialCardProps {
  id: string;
  categoria: string;
  domanda: string;
  onNext: () => void;
  onFeedback: (reaction: string) => void;
}

export default function SpecialCard({ id, categoria, domanda, onNext, onFeedback }: SpecialCardProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="bg-fluffy-speciale text-white p-4">
        <div className="flex justify-between items-center">
          <h2 className="font-extrabold text-sm uppercase">{categoria}</h2>
          <span className="text-sm font-extrabold">#{id}</span>
        </div>
      </div>

      {/* Instruction Card */}
      <div className="flex-1 p-6 bg-white space-y-8">
        <div className="text-center space-y-8">
          <h1 className="text-2xl font-extrabold text-black uppercase">
            Duello di Buchetti
          </h1>

          <div className="space-y-6">
            <p className="text-sm text-black font-bold leading-relaxed">
              {domanda}
            </p>
          </div>

          {/* Special card feedback buttons - Only 4 buttons as shown in Canva */}
          <div className="mt-12 grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-extrabold tracking-wider border-black text-black hover:bg-gray-100"
              onClick={() => onFeedback('review')}
              data-testid="button-feedback-review"
            >
              REVIEW
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-extrabold tracking-wider border-black text-black hover:bg-gray-100"
              onClick={() => onFeedback('fun')}
              data-testid="button-feedback-fun"
            >
              FUN
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-extrabold tracking-wider border-black text-black hover:bg-gray-100"
              onClick={() => onFeedback('top')}
              data-testid="button-feedback-top"
            >
              TOP
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-extrabold tracking-wider border-black text-black hover:bg-gray-100"
              onClick={() => onFeedback('boring')}
              data-testid="button-feedback-boring"
            >
              BORING
            </Button>
          </div>

          <div className="pt-8">
            <Button 
              variant="outline"
              size="lg" 
              className="bg-white border-gray-300 text-black hover:bg-gray-50"
              onClick={onNext}
              data-testid="button-next-special"
            >
              CONTINUA
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}