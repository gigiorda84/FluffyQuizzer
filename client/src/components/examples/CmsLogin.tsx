import CmsLogin from '../CmsLogin';

export default function CmsLoginExample() {
  return (
    <CmsLogin 
      onLogin={(username, password) => console.log('Login attempt:', { username, password })}
      onBack={() => console.log('Back to game')}
      error={undefined}
      loading={false}
    />
  );
}