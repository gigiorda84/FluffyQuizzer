import CmsTable from '../CmsTable';

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
    domanda: 'DUELLO DI BUCHETTI - Sfidi un avversario rispondendo alle domande',
    tipo: 'speciale' as const
  }
];

export default function CmsTableExample() {
  return (
    <CmsTable 
      cards={mockCards}
      onEdit={(card) => console.log('Edit card:', card)}
      onDelete={(cardId) => console.log('Delete card:', cardId)}
      onAdd={() => console.log('Add new card')}
      onUpload={() => console.log('Upload CSV')}
      onExport={() => console.log('Export CSV')}
      onLogout={() => console.log('Logout')}
    />
  );
}