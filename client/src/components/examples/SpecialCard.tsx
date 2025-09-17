import SpecialCard from '../SpecialCard';

export default function SpecialCardExample() {
  return (
    <SpecialCard 
      id="S05"
      categoria="SPECIALE"
      domanda="DUELLO DI BUCHETTI - Sfidi un avversario rispondendo alle domande fino all'ultimo duello. Chi vince prende l'ingrediente, chi perde deve scartarne uno"
      onNext={() => console.log('Next special card')}
      onFeedback={(reaction) => console.log('Special Feedback:', reaction)}
      onNextCard={() => console.log('Next card from special')}
    />
  );
}