import GameScreen from '../GameScreen';

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
    battuta: 'BUCHETTO ASTRO: Gli astronauti volevano la spirulina!',
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
    id: 'S05',
    categoria: 'SPECIALE',
    colore: 'speciale',
    domanda: 'DUELLO DI BUCHETTI - Sfidi un avversario rispondendo alle domande fino all\'ultimo duello. Chi vince prende l\'ingrediente, chi perde deve scartarne uno',
    tipo: 'speciale' as const
  }
];

export default function GameScreenExample() {
  return (
    <GameScreen 
      cards={mockCards}
      onBack={() => console.log('Back to menu')}
      onFeedback={(cardId, reaction, correct, timeMs) => 
        console.log('Game feedback:', { cardId, reaction, correct, timeMs })
      }
    />
  );
}