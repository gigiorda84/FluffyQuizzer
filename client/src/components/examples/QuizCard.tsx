import QuizCard from '../QuizCard';

export default function QuizCardExample() {
  return (
    <QuizCard 
      id="V041"
      categoria="CIBI FURBI & CIBI TRAPPOLA"
      colore="verde"
      domanda="Quale alga la NASA voleva portarsi nello spazio?"
      opzioneA="Klamath, ma si scoglie più di un gelato al sole"
      opzioneB="Spirulina! Proteine e ferro spaziali!"
      opzioneC="Nori, quella dei sushi roll da discount"
      corretta="B"
      battuta="BUCHETTO ASTRO: Gli astronauti volevano la spirulina, non il sushi! Il tuo culetto nello spazio ringrazia, senza microonde ma con tanta fibra verde!"
      onAnswer={(option, correct, timeMs) => console.log('Answer:', { option, correct, timeMs })}
    />
  );
}