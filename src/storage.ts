import { Preferences } from '@capacitor/preferences';
import { BankState } from './types';

const STATE_KEY = 'titanbank.v1';
const PIN_KEY = 'titanbank.pin';
const DEFAULT_PIN = '1506';

export const loadInitialState = async (): Promise<{ state: BankState; pin: string }> => {
  let state: BankState = { tx: [], ud: [] };
  let pin = DEFAULT_PIN;

  try {
    // Try native preferences first (safe across reboots)
    const prefState = await Preferences.get({ key: STATE_KEY });
    if (prefState && prefState.value) {
      state = JSON.parse(prefState.value);
    } else {
      // Fallback to localStorage
      const local = localStorage.getItem(STATE_KEY);
      if (local) {
        state = JSON.parse(local);
      }
    }
  } catch (e) {
    console.error('Error loading state from storage:', e);
    try {
      const local = localStorage.getItem(STATE_KEY);
      if (local) state = JSON.parse(local);
    } catch (err) {
      console.error('LocalStorage parse error:', err);
    }
  }

  try {
    const prefPin = await Preferences.get({ key: PIN_KEY });
    if (prefPin && prefPin.value) {
      pin = prefPin.value;
    } else {
      const localPin = localStorage.getItem(PIN_KEY);
      if (localPin) pin = localPin;
    }
  } catch (e) {
    console.error('Error loading PIN:', e);
  }

  // Ensure state shape is valid
  if (!state || !Array.isArray(state.tx) || !Array.isArray(state.ud)) {
    state = { tx: [], ud: [] };
  }

  return { state, pin };
};

export const saveState = async (state: BankState): Promise<void> => {
  try {
    const str = JSON.stringify(state);
    localStorage.setItem(STATE_KEY, str);
    await Preferences.set({ key: STATE_KEY, value: str });
  } catch (e) {
    console.error('Error saving state:', e);
  }
};

export const savePin = async (pin: string): Promise<void> => {
  try {
    localStorage.setItem(PIN_KEY, pin);
    await Preferences.set({ key: PIN_KEY, value: pin });
  } catch (e) {
    console.error('Error saving PIN:', e);
  }
};

export const clearAllData = async (): Promise<void> => {
  try {
    const emptyState: BankState = { tx: [], ud: [] };
    localStorage.setItem(STATE_KEY, JSON.stringify(emptyState));
    await Preferences.set({ key: STATE_KEY, value: JSON.stringify(emptyState) });
  } catch (e) {
    console.error('Error clearing data:', e);
  }
};
