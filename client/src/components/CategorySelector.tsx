import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useState } from "react";

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
  onCmsLogin?: () => void;
}

export default function CategorySelector({ categories, onSelectCategory, onSelectMix, onCmsLogin }: CategorySelectorProps) {
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

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

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#7cdacf' }}>
      {/* Background Image - anchored to bottom center and 50% smaller */}
      <div
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-1/2 bg-contain bg-center bg-no-repeat bg-bottom"
        style={{ backgroundImage: 'url(/background-main.jpg)' }}
      ></div>

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
              <div className="bg-black text-white px-12 py-6 rounded-3xl cursor-pointer hover:bg-gray-800 transition-all shadow-lg border-4 border-white w-72">
                <h3 className="text-2xl font-bold text-center uppercase tracking-wider">ISTRUZIONI</h3>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-lg mx-auto bg-background border-2 border-foreground" aria-describedby="instructions-description">
              <DialogHeader>
                <DialogTitle className="text-center text-xl font-bold uppercase tracking-wide text-foreground">Istruzioni del Gioco</DialogTitle>
              </DialogHeader>
              <div className="relative px-12" id="instructions-description">
                <Carousel className="w-full">
                  <CarouselContent>
                    {instructionSlides.map((slide, index) => (
                      <CarouselItem key={index}>
                        <Card className="p-6 bg-card border-2 border-foreground">
                          <h3 className="text-lg font-bold mb-4 text-center uppercase tracking-wide text-foreground">{slide.title}</h3>
                          <p className="text-sm leading-relaxed text-muted-foreground">{slide.content}</p>
                          <div className="text-center mt-4 text-xs text-muted-foreground uppercase tracking-wide">
                            {index + 1} di {instructionSlides.length}
                          </div>
                        </Card>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 border-2 border-foreground bg-card hover:bg-muted" />
                  <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 border-2 border-foreground bg-card hover:bg-muted" />
                </Carousel>
                <div className="text-center mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsInstructionsOpen(false)}
                    className="border-2 border-foreground bg-card hover:bg-muted text-foreground uppercase tracking-wide"
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

          {/* EDITOR Button */}
          {onCmsLogin && (
            <div
              className="bg-black text-white px-12 py-6 rounded-3xl cursor-pointer hover:bg-gray-800 transition-all shadow-lg border-4 border-white w-72"
              onClick={onCmsLogin}
              data-testid="button-cms-login"
            >
              <h3 className="text-2xl font-bold text-center uppercase tracking-wider">EDITOR</h3>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}