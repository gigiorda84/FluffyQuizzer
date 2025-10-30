import { useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import CategorySelector from "./components/CategorySelector";
import GameScreen from "./components/GameScreen";
import CmsLogin from "./components/CmsLogin";
import CmsTable from "./components/CmsTable";
import Analytics from "./components/AnalyticsNew";
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

type AppScreen = 'home' | 'game';
type CmsScreen = 'login' | 'table' | 'analytics';

function HomeRouter() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Game logic
  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentScreen('game');
  };

  const handleSelectMix = () => {
    setSelectedCategory('mix');
    setCurrentScreen('game');
  };

  return (
    <>
      {currentScreen === 'home' && (
        <CategorySelector
          categories={categories}
          onSelectCategory={handleSelectCategory}
          onSelectMix={handleSelectMix}
        />
      )}

      {currentScreen === 'game' && (
        <GameScreen
          selectedCategory={selectedCategory}
          onBack={() => setCurrentScreen('home')}
        />
      )}
    </>
  );
}

function CmsRouter() {
  const [, setLocation] = useLocation();
  const [currentScreen, setCurrentScreen] = useState<CmsScreen>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState<string>('');

  const handleLogin = (username: string, password: string) => {
    // Simple demo login - todo: remove mock functionality
    if (username === 'admin' && password === 'VJG7Il93z4QAdV7EH') {
      setIsLoggedIn(true);
      setAdminPassword(password);
      setCurrentScreen('table');
    } else {
      console.error('Login failed');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAdminPassword('');
    setCurrentScreen('login');
    setLocation('/');
  };

  return (
    <>
      {currentScreen === 'login' && (
        <CmsLogin
          onLogin={handleLogin}
          onBack={() => setLocation('/')}
        />
      )}

      {currentScreen === 'table' && isLoggedIn && (
        <CmsTable
          onLogout={handleLogout}
          onAnalytics={() => setCurrentScreen('analytics')}
          adminPassword={adminPassword}
        />
      )}

      {currentScreen === 'analytics' && isLoggedIn && (
        <Analytics
          onBack={() => setCurrentScreen('table')}
        />
      )}
    </>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeRouter} />
      <Route path="/cms" component={CmsRouter} />
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