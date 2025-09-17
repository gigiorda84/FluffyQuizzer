import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import CategorySelector from "./components/CategorySelector";
import GameScreen from "./components/GameScreen";
import CmsLogin from "./components/CmsLogin";
import CmsTable from "./components/CmsTable";
import Analytics from "./components/Analytics";
import NotFound from "@/pages/not-found";

// Mock data - todo: remove mock functionality
const mockCategories = [
  {
    id: 'cibi-furbi',
    name: 'CIBI FURBI & CIBI TRAPPOLA',
    color: 'verde',
    description: 'Scopri i segreti del cibo sano!'
  },
  {
    id: 'pianeta-piatto',
    name: 'IL PIANETA NEL PIATTO',
    color: 'blu',
    description: 'Sostenibilità e ambiente'
  },
  {
    id: 'cultura-cibo',
    name: 'CULTURA DEL CIBO',
    color: 'arancione',
    description: 'Storia e tradizioni'
  },
  {
    id: 'anatomia-tavola',
    name: 'ANATOMIA A TAVOLA',
    color: 'viola',
    description: 'Il corpo e la nutrizione'
  }
];

const mockCards = [
  {
    id: 'V041',
    categoria: 'CIBI FURBI & CIBI TRAPPOLA',
    colore: 'verde',
    domanda: 'Quale alga la NASA voleva portarsi nello spazio?',
    opzioneA: 'Klamath, ma si scoglie più di un gelato al sole',
    opzioneB: 'Spirulina! Proteine e ferro spaziali!',
    opzioneC: 'Nori, quella dei sushi roll da discount',
    corretta: 'B' as const,
    battuta: 'BUCHETTO ASTRO: Gli astronauti volevano la spirulina, non il sushi! Il tuo culetto nello spazio ringrazia, senza microonde ma con tanta fibra verde!',
    tipo: 'quiz' as const
  },
  {
    id: 'B029',
    categoria: 'IL PIANETA NEL PIATTO',
    colore: 'blu',
    domanda: 'Una mucca scoreggia gas serra come quante auto?',
    opzioneA: 'Mezza Smart',
    opzioneB: 'Come un SUV che fa 10.000 km/anno!',
    opzioneC: 'Come 10 Ferrari a palla',
    corretta: 'B' as const,
    tipo: 'quiz' as const
  },
  {
    id: 'A101',
    categoria: 'CULTURA DEL CIBO',
    colore: 'arancione',
    domanda: 'Il pomodoro è nato in Italia o in America?',
    opzioneA: 'In Medio Oriente',
    opzioneB: 'In Sud America',
    opzioneC: 'In Sicilia con gli spaghetti',
    corretta: 'B' as const,
    tipo: 'quiz' as const
  },
  {
    id: 'A102',
    categoria: 'ANATOMIA A TAVOLA',
    colore: 'viola',
    domanda: 'Quanto è lungo il tuo intestino?',
    opzioneA: '1 metro, cortino',
    opzioneB: '7-8 metri! Come un autobus!',
    opzioneC: '100 metri, una pista d\'atletica',
    corretta: 'B' as const,
    tipo: 'quiz' as const
  },
  {
    id: 'S05',
    categoria: 'SPECIALE',
    colore: 'speciale',
    domanda: 'DUELLO DI BUCHETTI - Sfidi un avversario rispondendo alle domande fino all\'ultimo duello. Chi vince prende l\'ingrediente, chi perde deve scartarne uno',
    tipo: 'speciale' as const
  }
];

type AppScreen = 'home' | 'game' | 'cms-login' | 'cms-table' | 'analytics';

function Router() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Game logic
  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentScreen('game');
  };

  const handleSelectMix = () => {
    setSelectedCategory('mix');
    setCurrentScreen('game');
  };

  const getFilteredCards = () => {
    if (selectedCategory === 'mix') {
      return mockCards.slice().sort(() => Math.random() - 0.5);
    }
    if (selectedCategory) {
      const category = mockCategories.find(c => c.id === selectedCategory);
      return mockCards.filter(card => card.categoria === category?.name);
    }
    return mockCards;
  };

  // CMS logic
  const handleCmsLogin = () => {
    setCurrentScreen('cms-login');
  };

  const handleLogin = (username: string, password: string) => {
    // Simple demo login - todo: remove mock functionality
    if (username === 'admin' && password === 'admin') {
      setIsLoggedIn(true);
      setCurrentScreen('cms-table');
    } else {
      console.error('Login failed');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentScreen('home');
  };

  // Feedback handling
  const handleFeedback = (cardId: string, reaction: string, correct?: boolean, timeMs?: number) => {
    console.log('Feedback received:', { cardId, reaction, correct, timeMs });
    // todo: remove mock functionality - send to backend
  };

  return (
    <Switch>
      <Route path="/">
        {currentScreen === 'home' && (
          <CategorySelector
            categories={mockCategories}
            onSelectCategory={handleSelectCategory}
            onSelectMix={handleSelectMix}
            onCmsLogin={handleCmsLogin}
          />
        )}
        
        {currentScreen === 'game' && (
          <GameScreen
            cards={getFilteredCards()}
            onBack={() => setCurrentScreen('home')}
            onFeedback={handleFeedback}
          />
        )}
        
        {currentScreen === 'cms-login' && (
          <CmsLogin
            onLogin={handleLogin}
            onBack={() => setCurrentScreen('home')}
          />
        )}
        
        {currentScreen === 'cms-table' && isLoggedIn && (
          <CmsTable
            cards={mockCards}
            onEdit={(card) => console.log('Edit card:', card)}
            onDelete={(cardId) => console.log('Delete card:', cardId)}
            onAdd={() => console.log('Add new card')}
            onUpload={() => console.log('Upload CSV')}
            onExport={() => console.log('Export CSV')}
            onLogout={handleLogout}
            onAnalytics={() => setCurrentScreen('analytics')}
          />
        )}
        
        {currentScreen === 'analytics' && isLoggedIn && (
          <Analytics
            onBack={() => setCurrentScreen('cms-table')}
          />
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;