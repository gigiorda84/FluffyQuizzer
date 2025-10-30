import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Category {
  id: string;
  name: string;
  color: string;
  description?: string;
}

interface CategorySelectorProps {
  categories: Category[];
  onSelectCategory: (categoryId: string) => void;
  onSelectMix: () => void;
}

export default function CategorySelector({ categories, onSelectCategory, onSelectMix }: CategorySelectorProps) {
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const getCategoryColorClass = (color: string) => {
    switch (color.toLowerCase()) {
      case 'verde': return 'bg-fluffy-verde text-white';
      case 'blu': return 'bg-fluffy-blu text-white';
      case 'arancione': return 'bg-fluffy-arancione text-white';
      case 'viola': return 'bg-fluffy-viola text-white';
      default: return 'bg-fluffy-speciale text-white';
    }
  };

  const instructionSlides = [
    {
      title: "🌈 Benvenut* nel mondo Fluffy!",
      content: "Hai davanti una missione importante: aiutarci a scegliere le domande ufficiali del gioco più assurdo e istruttivo del pianeta.\n\n🎲 Metti alla prova il tuo cervello (e il tuo intestino) con il nostro quiz su cibo, ambiente e cultura alimentare. Ti promettiamo risate, scoperte e qualche colpo di scena digeribile."
    },
    {
      title: "💡 Come si gioca",
      content: "Premi \"Gioca\" e tuffati nel delirio: troverai domande miste da tutte le categorie.\n\nLeggi, rispondi e fidati del tuo istinto… o del tuo colon.\n\nPer passare alla prossima domanda lascia un feedback in fondo o fai uno swipe felice."
    },
    {
      title: "🍆 Le categorie Fluffy",
      content: "🧠 Cibi Furbi & Cibi Trappola – il bene, il male e la maionese.\n\n🌍 Il Pianeta nel Piatto – perché ogni boccone ha un'impronta.\n\n🍽️ Cultura del Cibo – curiosità, leggende e cagate colte.\n\n🫀 Anatomia a Tavola – quello che il tuo corpo pensa mentre tu mastichi."
    },
    {
      title: "💚 Divertiti, impara e sbaglia con orgoglio!",
      content: "In Fluffy non esistono errori: solo nuove fibre per la mente.\n\nOgni domanda è un morso di consapevolezza… condito con un pizzico di ironia.\n\nGrazie per far parte della rivoluzione più morbida (e più intelligente) del mondo. ✨"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % instructionSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + instructionSlides.length) % instructionSlides.length);
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#7cdacf' }}>
      {/* Background Image - full width at bottom */}
      <img
        src="/background-main.jpg"
        alt="background"
        className="absolute bottom-0 left-0 w-full object-cover object-bottom"
        style={{ maxHeight: '60vh' }}
      />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
        {/* Logo Section */}
        <div className="text-center mb-16">
          <img
            src="/fluffy-logo.png"
            alt="Fluffy Revolution Logo"
            className="h-32 w-auto mx-auto mb-6"
          />
        </div>

        {/* Three Main Buttons */}
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center mb-16">

          {/* ISTRUZIONI Button */}
          <Dialog open={isInstructionsOpen} onOpenChange={setIsInstructionsOpen}>
            <DialogTrigger asChild>
              <button className="bg-black text-white px-12 py-6 rounded-3xl cursor-pointer hover:bg-gray-800 transition-all shadow-lg border-4 border-white w-72">
                <h3 className="text-2xl font-bold text-center uppercase tracking-wider">ISTRUZIONI</h3>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl bg-background border-2 border-foreground p-8" aria-describedby="instructions-description">
              <div className="space-y-6" id="instructions-description">
                {/* Slide Content */}
                <div className="min-h-[250px] flex flex-col justify-center px-8">
                  <h3 className="text-3xl font-bold text-center uppercase tracking-wide text-foreground mb-6">
                    {instructionSlides[currentSlide].title}
                  </h3>
                  <p className="text-lg leading-relaxed text-muted-foreground text-center whitespace-pre-line">
                    {instructionSlides[currentSlide].content}
                  </p>
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center justify-between px-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={prevSlide}
                    className="border-2 border-foreground bg-card hover:bg-muted h-12 w-12"
                    disabled={currentSlide === 0}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>

                  <div className="text-sm text-muted-foreground uppercase tracking-wide font-semibold">
                    {currentSlide + 1} di {instructionSlides.length}
                  </div>

                  {currentSlide === instructionSlides.length - 1 ? (
                    <Button
                      variant="outline"
                      onClick={() => setIsInstructionsOpen(false)}
                      className="border-2 border-foreground bg-card hover:bg-muted h-12 px-6"
                    >
                      <span className="text-sm font-semibold uppercase">Chiudi</span>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={nextSlide}
                      className="border-2 border-foreground bg-card hover:bg-muted h-12 w-12"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* GIOCA Button */}
          <div
            className="bg-black text-white px-12 py-6 rounded-3xl cursor-pointer hover:bg-gray-800 transition-all shadow-lg border-4 border-white w-72"
            onClick={onSelectMix}
            data-testid="button-mix-all"
          >
            <h3 className="text-2xl font-bold text-center uppercase tracking-wider">GIOCA</h3>
          </div>
        </div>

      </div>
    </div>
  );
}