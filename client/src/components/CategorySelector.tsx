import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
  const getCategoryColorClass = (color: string) => {
    switch (color.toLowerCase()) {
      case 'verde': return 'bg-fluffy-verde text-white';
      case 'blu': return 'bg-fluffy-blu text-white';
      case 'arancione': return 'bg-fluffy-arancione text-white';
      case 'viola': return 'bg-fluffy-viola text-white';
      default: return 'bg-fluffy-speciale text-white';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Fluffy Trivia</h1>
          <p className="text-muted-foreground">Scegli una categoria o gioca con tutte!</p>
        </div>
        
        <div className="space-y-4">
          {categories.map((category) => (
            <Card 
              key={category.id}
              className={`p-0 overflow-hidden hover-elevate cursor-pointer ${getCategoryColorClass(category.color)}`}
              onClick={() => onSelectCategory(category.id)}
              data-testid={`button-category-${category.id}`}
            >
              <div className="p-6 text-center">
                <h3 className="font-bold text-lg mb-2">{category.name}</h3>
                {category.description && (
                  <p className="text-sm opacity-90">{category.description}</p>
                )}
              </div>
            </Card>
          ))}
          
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full h-16 text-lg font-semibold"
            onClick={onSelectMix}
            data-testid="button-mix-all"
          >
            🎲 Mix di tutte le categorie
          </Button>
        </div>
        
        {onCmsLogin && (
          <div className="text-center">
            <Button 
              variant="ghost" 
              size="sm"
              data-testid="button-cms-login"
              onClick={onCmsLogin}
            >
              Admin CMS
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}