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

// Categories from database - display name maps to database category name
const categories = [
  {
    id: 'CIBI FURBI & CIBI TRAPPOLA',
    name: 'CIBI FURBI & CIBI TRAPPOLA',
    color: 'verde',
    description: 'Scopri i segreti del cibo sano!'
  },
  {
    id: 'IL PIANETA NEL PIATTO',
    name: 'IL PIANETA NEL PIATTO',
    color: 'blu',
    description: 'Sostenibilità e ambiente'
  },
  {
    id: 'CULTURA DEL CIBO',
    name: 'CULTURA DEL CIBO',
    color: 'arancione',
    description: 'Storia e tradizioni'
  },
  {
    id: 'ANATOMIA A TAVOLA',
    name: 'ANATOMIA A TAVOLA',
    color: 'viola',
    description: 'Il corpo e la nutrizione'
  }
];

// Mock cards removed - now using real API data

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

  // Category filtering now handled by API - removed filtering logic

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

  // Feedback now handled directly in GameScreen component via API

  return (
    <Switch>
      <Route path="/">
        {currentScreen === 'home' && (
          <CategorySelector
            categories={categories}
            onSelectCategory={handleSelectCategory}
            onSelectMix={handleSelectMix}
            onCmsLogin={handleCmsLogin}
          />
        )}
        
        {currentScreen === 'game' && (
          <GameScreen
            selectedCategory={selectedCategory}
            onBack={() => setCurrentScreen('home')}
            onCmsLogin={handleCmsLogin}
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