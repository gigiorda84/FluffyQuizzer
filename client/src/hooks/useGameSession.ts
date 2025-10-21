import { useState, useEffect, useRef } from 'react';

interface GameSession {
  id: string;
  deviceId: string;
  startedAt: string;
  cardsPlayed: number;
}

export function useGameSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string>('');
  const sessionStarted = useRef(false);

  useEffect(() => {
    // Get or create device ID
    let storedDeviceId = localStorage.getItem('deviceId');
    if (!storedDeviceId) {
      storedDeviceId = crypto.randomUUID();
      localStorage.setItem('deviceId', storedDeviceId);
    }
    setDeviceId(storedDeviceId);

    // Start a new game session
    if (!sessionStarted.current) {
      sessionStarted.current = true;
      startSession(storedDeviceId);
    }

    // Cleanup: end session when component unmounts
    return () => {
      if (sessionId) {
        endSession();
      }
    };
  }, []);

  const startSession = async (deviceId: string) => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          cardsPlayed: 0
        })
      });

      if (response.ok) {
        const session: GameSession = await response.json();
        setSessionId(session.id);
        localStorage.setItem('currentSessionId', session.id);
      }
    } catch (error) {
      console.error('Failed to start game session:', error);
    }
  };

  const endSession = async () => {
    if (!sessionId) return;

    try {
      await fetch(`/api/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endedAt: new Date().toISOString()
        })
      });
      localStorage.removeItem('currentSessionId');
    } catch (error) {
      console.error('Failed to end game session:', error);
    }
  };

  const incrementCardsPlayed = async () => {
    if (!sessionId) return;

    try {
      const response = await fetch(`/api/sessions/${sessionId}`);
      if (response.ok) {
        const session: GameSession = await response.json();

        await fetch(`/api/sessions/${sessionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cardsPlayed: (session.cardsPlayed || 0) + 1
          })
        });
      }
    } catch (error) {
      console.error('Failed to increment cards played:', error);
    }
  };

  return {
    sessionId,
    deviceId,
    incrementCardsPlayed,
    endSession
  };
}
