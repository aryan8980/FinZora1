import { useEffect, useState } from 'react';

export const GUEST_SESSION_KEY = 'finzora-guest';
const GUEST_SESSION_EVENT = 'finzora-guest-changed';

const readGuestFlag = () =>
  typeof window !== 'undefined' && sessionStorage.getItem(GUEST_SESSION_KEY) === 'true';

const dispatchGuestEvent = () => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(GUEST_SESSION_EVENT));
};

export const setGuestSession = (enabled: boolean) => {
  if (typeof window === 'undefined') return;
  if (enabled) {
    sessionStorage.setItem(GUEST_SESSION_KEY, 'true');
  } else {
    sessionStorage.removeItem(GUEST_SESSION_KEY);
  }
  dispatchGuestEvent();
};

export const enableGuestSession = () => setGuestSession(true);
export const disableGuestSession = () => setGuestSession(false);
export const isGuestSessionActive = () => readGuestFlag();

export const useGuestMode = () => {
  const [isGuest, setIsGuest] = useState<boolean>(() => readGuestFlag());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncGuestMode = () => setIsGuest(readGuestFlag());
    const handleCustomEvent = () => syncGuestMode();
    const handleStorage = (event: StorageEvent) => {
      if (event.key === GUEST_SESSION_KEY) {
        syncGuestMode();
      }
    };

    syncGuestMode();
    window.addEventListener(GUEST_SESSION_EVENT, handleCustomEvent as EventListener);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(GUEST_SESSION_EVENT, handleCustomEvent as EventListener);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return isGuest;
};
