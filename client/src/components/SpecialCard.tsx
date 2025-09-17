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
    <div className="min-h-screen bg-background p-4 flex flex-col">
      {/* Header */}
      <div className="bg-fluffy-speciale text-white rounded-t-lg p-4 text-center">
        <h2 className="font-bold text-sm opacity-90">{categoria}</h2>
        <span className="text-xs opacity-75">#{id}</span>
      </div>

      {/* Instruction Card */}
      <Card className="flex-1 rounded-t-none p-6 space-y-8">
        <div className="text-center">
          <div className="text-4xl mb-4">🎮</div>
          <h1 className="text-2xl font-bold mb-6 text-foreground">SPECIALE</h1>
        </div>

        <div className="bg-muted/50 p-6 rounded-lg">
          <p className="text-lg leading-relaxed text-center text-foreground">
            {domanda}
          </p>
        </div>

        <div className="pt-4">
          <Button 
            size="lg" 
            className="w-full"
            onClick={onNext}
            data-testid="button-next-special"
          >
            Continua
          </Button>
        </div>
      </Card>
    </div>
  );
}