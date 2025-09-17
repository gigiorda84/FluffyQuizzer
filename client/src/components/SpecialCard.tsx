import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface SpecialCardProps {
  id: string;
  categoria: string;
  domanda: string;
  onNext: () => void;
}

export default function SpecialCard({ id, categoria, domanda, onNext }: SpecialCardProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-fluffy-speciale text-white p-3 text-center">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-sm">{categoria}</h2>
          <span className="text-sm">#{id}</span>
        </div>
      </div>

      {/* Instruction Card */}
      <div className="flex-1 p-6 bg-white">
        <div className="space-y-8 text-center">
          <h1 className="text-3xl font-bold text-black uppercase tracking-wide">
            {categoria}
          </h1>

          <div className="space-y-6">
            <p className="text-lg font-bold text-black leading-relaxed uppercase tracking-wide">
              {domanda}
            </p>
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