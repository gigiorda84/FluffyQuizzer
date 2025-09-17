import CategorySelector from '../CategorySelector';

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

export default function CategorySelectorExample() {
  return (
    <CategorySelector 
      categories={mockCategories}
      onSelectCategory={(id) => console.log('Selected category:', id)}
      onSelectMix={() => console.log('Selected mix mode')}
    />
  );
}