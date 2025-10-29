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
      title: "Benvenuto in Fluffy Trivia!",
      content: "Metti alla prova le tue conoscenze con il nostro divertente quiz sul cibo e la cultura alimentare. Qui troverai domande interessanti e curiosità che ti faranno scoprire tante cose nuove!"
    },
    {
      title: "Come si gioca",
      content: "Clicca su 'Gioca' per iniziare una partita con domande miste da tutte le categorie. Leggi attentamente ogni domanda e scegli la risposta che ritieni corretta tra le opzioni disponibili."
    },
    {
      title: "Categorie del quiz",
      content: "Le domande spaziano tra diverse categorie: Cibi Furbi & Cibi Trappola, Il Pianeta nel Piatto, Cultura del Cibo e Anatomia a Tavola. Ogni categoria ha il suo colore distintivo!"
    },
    {
      title: "Divertiti e impara!",
      content: "Non preoccuparti se sbagli qualche risposta - l'importante è imparare divertendosi! Ogni domanda è un'opportunità per scoprire qualcosa di nuovo sul mondo del cibo."
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % instructionSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + instructionSlides.length) % instructionSlides.length);
  };

  const handleDialogClose = () => {
    setIsInstructionsOpen(false);
    setCurrentSlide(0);
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#7cdacf' }}>
      {/* Background Image - anchored to bottom center */}
      <img
        src="/background-main.jpg"
        alt="background"
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 max-w-4xl object-contain"
        style={{ maxHeight: '60vh' }}
      />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
        {/* Logo and Title Section */}
        <div className="text-center mb-16">
          <img
            src="/fluffy-logo.svg"
            alt="Fluffy Revolution Logo"
            className="h-32 w-auto mx-auto mb-6"
          />
          <h1 className="text-5xl font-black text-black uppercase tracking-wider">THE GAME</h1>
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
                  <p className="text-lg leading-relaxed text-muted-foreground text-center">
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

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={nextSlide}
                    className="border-2 border-foreground bg-card hover:bg-muted h-12 w-12"
                    disabled={currentSlide === instructionSlides.length - 1}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>

                {/* Close Button */}
                <div className="text-center pt-2">
                  <Button
                    variant="outline"
                    onClick={handleDialogClose}
                    className="border-2 border-foreground bg-card hover:bg-muted text-foreground uppercase tracking-wide px-10 py-5 text-base"
                  >
                    CHIUDI
                  </Button>
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