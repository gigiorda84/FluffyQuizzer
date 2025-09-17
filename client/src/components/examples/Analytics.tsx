import Analytics from '../Analytics';

export default function AnalyticsExample() {
  return (
    <Analytics 
      onBack={() => console.log('Back to CMS')}
    />
  );
}